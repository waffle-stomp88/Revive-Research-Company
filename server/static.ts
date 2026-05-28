import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { getMetaForUrl, getPreRenderedContent, injectMetaTags, shouldReturn404 } from "./seo";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath, { index: false }));

  app.use("*", async (req, res) => {
    try {
      const indexPath = path.resolve(distPath, "index.html");
      let html = await fs.promises.readFile(indexPath, "utf-8");

      const is404 = await shouldReturn404(req.originalUrl);
      const statusCode = is404 ? 404 : 200;

      const [meta, preRendered] = await Promise.all([
        getMetaForUrl(req.originalUrl),
        getPreRenderedContent(req.originalUrl),
      ]);
      html = injectMetaTags(html, meta, preRendered);

      res.status(statusCode).set({ "Content-Type": "text/html" }).end(html);
    } catch {
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });
}
