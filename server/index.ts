import express, { type Request, Response, NextFunction } from "express";
import { execSync } from "child_process";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { getMetaForUrl, getPreRenderedContent, injectMetaTags, shouldReturn404 } from "./seo";
import { fixBlendProductSlugs, seedStripePresetsIfEmpty, seedHormonalEducationArticlesIfMissing, ensureLabNotesTable, seedLabNotesIfEmpty } from "./storage";

const app = express();
app.set("trust proxy", 1);
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

(async () => {

  app.get("/health", (_req, res) => {
    res.status(200).send("ok");
  });

  // Canonical domain redirect middleware for production
  // Redirects www and http traffic to https://reviveresearch.co
  app.use((req, res, next) => {
    const host = req.get('host') || '';
    const proto = req.get('x-forwarded-proto') || req.protocol;
    
    // Skip redirects for Replit domains, localhost, IP addresses, and internal healthchecks
    const hostWithoutPort = host.split(':')[0];
    const isInternal = host.includes('.replit.dev') || host.includes('.repl.co') || host.includes('.replit.app') || host.includes('localhost') || !host.includes('.') || /^\d+\.\d+\.\d+\.\d+$/.test(hostWithoutPort);
    if (isInternal) {
      return next();
    }
    
    // Check if we need to redirect
    const isWww = host.startsWith('www.');
    const isHttp = proto !== 'https';
    
    if (isWww || isHttp) {
      const canonicalHost = host.replace(/^www\./, '');
      const canonicalUrl = `https://${canonicalHost}${req.originalUrl}`;
      return res.redirect(301, canonicalUrl);
    }
    
    next();
  });

  app.use((req, res, next) => {
    if (req.path === '/products' || req.path === '/products/') {
      return res.redirect(301, '/peptides');
    }
    const productSlugMatch = req.path.match(/^\/products\/(.+)$/);
    if (productSlugMatch) {
      return res.redirect(301, `/peptides/${productSlugMatch[1]}`);
    }
    next();
  });

  app.use(
    express.json({
      limit: "25mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        // Logbook responses contain private personal-research observations,
        // doses, and metrics. Never write the response body to logs for
        // these routes — even on errors.
        const isSensitivePath = path.startsWith("/api/logbook");
        if (capturedJsonResponse && !isSensitivePath) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        log(logLine);
      }
    });

    next();
  });

  // Run DB seed/migration tasks in the background so they never block
  // the server from binding to port 5000. Each task is independently
  // caught — a slow or unavailable DB at startup won't prevent the
  // health check from passing or traffic from being served.
  Promise.resolve()
    .then(() => fixBlendProductSlugs().catch((err) => {
      console.warn("[startup] fixBlendProductSlugs failed (non-fatal):", err?.message ?? err);
    }))
    .then(() => seedStripePresetsIfEmpty().catch((err) => {
      console.warn("[startup] seedStripePresetsIfEmpty failed (non-fatal):", err?.message ?? err);
    }))
    .then(() => seedHormonalEducationArticlesIfMissing().catch((err) => {
      console.warn("[startup] seedHormonalEducationArticlesIfMissing failed (non-fatal):", err?.message ?? err);
    }))
    .then(() => ensureLabNotesTable().catch((err) => {
      console.warn("[startup] ensureLabNotesTable failed (non-fatal):", err?.message ?? err);
    }))
    .then(() => seedLabNotesIfEmpty().catch((err) => {
      console.warn("[startup] seedLabNotesIfEmpty failed (non-fatal):", err?.message ?? err);
    }));

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(`[error] ${status} — ${message}`, err?.stack ?? "");
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    app.use(async (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/vite-hmr') || req.path.includes('.')) {
        return next();
      }

      const is404 = await shouldReturn404(req.originalUrl);

      const originalEnd = res.end.bind(res);
      (res as any).end = function(chunk: any, ...args: any[]) {
        if (chunk && typeof chunk === 'string' && chunk.includes('</head>') && chunk.includes('<div id="root">')) {
          try {
            Promise.all([
              getMetaForUrl(req.originalUrl),
              getPreRenderedContent(req.originalUrl),
            ]).then(([meta, preRendered]) => {
              const modified = injectMetaTags(chunk, meta, preRendered);
              if (is404) res.statusCode = 404;
              originalEnd(modified, ...args);
            }).catch(() => {
              if (is404) res.statusCode = 404;
              originalEnd(chunk, ...args);
            });
            return res;
          } catch {
            if (is404) res.statusCode = 404;
            return originalEnd(chunk, ...args);
          }
        }
        if (is404) res.statusCode = 404;
        return originalEnd(chunk, ...args);
      };
      next();
    });

    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.DEPLOY_PORT || process.env.PORT || "5000", 10);

  function startListening(retries = 3) {
    httpServer.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true,
      },
      () => {
        log(`serving on port ${port}`);
      },
    );

    httpServer.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE" && retries > 0) {
        log(`port ${port} in use — attempting to free it (${retries} retr${retries === 1 ? "y" : "ies"} left)...`);
        // Try multiple kill strategies — Replit NixOS doesn't have `fuser`,
        // but `lsof` is usually available. `pkill` is a fallback that targets
        // the process pattern that would be holding the port in dev.
        let freed = false;
        for (const cmd of [
          `lsof -ti :${port} | xargs -r kill -9`,
          `pkill -9 -f "tsx server/index.ts" || true`,
        ]) {
          try { execSync(cmd, { stdio: "ignore", shell: "/bin/sh" }); freed = true; break; } catch {}
        }
        if (!freed) log(`could not free port ${port} — relying on retry timeout`);
        httpServer.close();
        setTimeout(() => {
          httpServer.removeAllListeners("error");
          startListening(retries - 1);
        }, 1500);
      } else {
        throw err;
      }
    });
  }

  startListening();
})();
