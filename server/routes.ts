import crypto from "crypto";
import type { Express } from "express";
import { FREE_SHIPPING_THRESHOLD, FLAT_RATE_SHIPPING } from "@shared/constants";
import { calculateTax } from "@shared/taxRates";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { storage, resolveDisplayPrice } from "./storage";
import { db, pool } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { insertOrderSchema, insertContactSchema, insertProductSchema, insertCoaSchema, insertAffiliateApplicationSchema, insertAffiliateSchema, insertAffiliateSaleSchema, insertAffiliatePayoutSchema, insertNewsletterSubscriberSchema, subscriptions, orders as ordersTable, savedStacks, insertSavedStackSchema, insertStripePresetSchema, insertResearchNoteSchema, LOGBOOK_SOURCE_TAG, type ResearchNote, firstOrderPromos } from "@shared/schema";
import { detectCycles } from "@shared/cycle-detection";
import { setupAuth, isAuthenticated } from "./sessionAuth";
import { verifySupabaseToken } from "./supabaseAuth";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { processProductImage } from "./imageProcessor";
import { sendEmail, sendOrderConfirmationEmail, sendAdminOrderNotificationEmail, sendShippedNotificationEmail, sendNewsletterWelcomeEmail, sendPreLaunchConfirmationEmail, isEmailConfigured, getOrderConfirmationTemplate, getShippedNotificationTemplate, getAffiliateWelcomeTemplate, getAffiliateRejectionTemplate, getInviteEmailTemplate, sendInviteEmail, sendRestockSignupConfirmationEmail } from "./email";
import { sendOrderNotifications, getNotificationStatus } from "./notifications";
import { validateFreeBacWater } from "./lib/bac-water-guard";
import { addContactToResearchList, debugZohoNewsletter, addContactToRestockSignups } from "./zoho-campaigns";
import { triggerRestockNotifications } from "./restock-notifications";
import { generateCoaPreview, backfillCoaPreviews } from "./coaPreview";
import { 
  createPaypalOrder, 
  capturePaypalOrder, 
  loadPaypalDefault,
  createPayPalSubscription,
  cancelPayPalSubscription,
  getOrCreateSubscriptionPlan,
  getSubscriptionDiscounts,
  handlePayPalWebhook,
  SUBSCRIPTION_DISCOUNTS,
  isPayPalSandbox,
  getPaypalOrderDetails,
} from "./paypal";
import OpenAI from "openai";
import { z } from "zod";
import rateLimit from "express-rate-limit";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000)
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(50)
});

const openaiClient = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateBasicReferralCode(fullName: string): string {
  const firstName = fullName.split(' ')[0] || 'CODE';
  const cleanName = firstName.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 10);
  return `${cleanName}10`;
}

const TIER1_COMMISSION_RATE = 0.10;
const TIER2_COMMISSION_RATE = 0.10;

// Short-lived confirmation tokens issued after a successful Stripe checkout.
// Each token maps to minimal order display data and expires after 15 minutes.
// This avoids exposing order metadata on the unauthenticated session-lookup URL.
const CONFIRM_TOKEN_TTL_MS = 15 * 60 * 1000;
interface ConfirmTokenPayload {
  shortRef: string;
  totalAmount: string;
  status: string;
  expiresAt: number;
}
const confirmationTokens = new Map<string, ConfirmTokenPayload>();
function createConfirmToken(orderId: string, totalAmount: string, status: string): string {
  const token = crypto.randomUUID();
  confirmationTokens.set(token, {
    shortRef: orderId.slice(-8).toUpperCase(),
    totalAmount,
    status,
    expiresAt: Date.now() + CONFIRM_TOKEN_TTL_MS,
  });
  return token;
}

// Only URL-safe characters: letters, digits, hyphens, underscores, dots
const SLUG_PATTERN = /^[a-zA-Z0-9_\-\.]{1,200}$/;

function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

// Per-IP rate limiter for dead-link tracking: 1 count per (IP + type + slug) per hour.
// IP address is always the primary gate so rotating headers cannot bypass it.
// A validated UUID visitor-ID is an optional secondary dimension that prevents
// false positives for real users sharing a corporate NAT/proxy IP.
const DEAD_LINK_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const deadLinkRateMap = new Map<string, number>(); // key → timestamp of last accepted hit

// Only accept visitor IDs that are RFC-4122 UUIDs to prevent spoofing with
// arbitrary values that could bloat the map.
const VISITOR_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Prune stale rate-limit entries every 10 minutes to prevent unbounded memory growth.
setInterval(() => {
  const cutoff = Date.now() - DEAD_LINK_RATE_WINDOW_MS;
  for (const [key, ts] of deadLinkRateMap) {
    if (ts < cutoff) deadLinkRateMap.delete(key);
  }
}, 10 * 60 * 1000).unref();

/**
 * Returns true when the request should be skipped (already counted recently).
 *
 * Strategy:
 *  - If the request carries a validated UUID visitor ID, use it as the PRIMARY
 *    dedup key. This lets distinct users behind the same corporate NAT/proxy each
 *    count once without blocking each other.
 *  - If no valid visitor UUID is present (e.g. curl, bots without JS), fall back
 *    to the IP address as the dedup key — still enforces 1 hit/hour/slug/IP.
 *
 * Bots that do not send the X-Visitor-ID header are gated by IP.
 * Bots that rotate arbitrary header values are rejected upstream by UUID validation,
 * so they also fall through to IP gating.
 */
function isDeadLinkRateLimited(
  ip: string,
  visitorId: string | null,
  type: string,
  slug: string
): boolean {
  const now = Date.now();

  if (visitorId) {
    // Browser path: deduplicate by persistent browser UUID.
    const vidKey = `vid:${visitorId}:${type}:${slug}`;
    const vidLast = deadLinkRateMap.get(vidKey);
    if (vidLast !== undefined && now - vidLast < DEAD_LINK_RATE_WINDOW_MS) {
      return true;
    }
    deadLinkRateMap.set(vidKey, now);
    return false;
  }

  // Headless/bot path: deduplicate by IP address.
  const ipKey = `ip:${ip}:${type}:${slug}`;
  const ipLast = deadLinkRateMap.get(ipKey);
  if (ipLast !== undefined && now - ipLast < DEAD_LINK_RATE_WINDOW_MS) {
    return true;
  }
  deadLinkRateMap.set(ipKey, now);
  return false;
}

async function recordDeadLink(type: "product" | "guide", slug: string): Promise<void> {
  await storage.upsertDeadLinkHit(type, slug);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ---------------------------------------------------------------------------
  // Search engine crawler age-gate bypass
  // Google's renderer visits as a fresh browser session — no localStorage —
  // so every page renders the full age-gate modal instead of actual content.
  // This causes all pages to be "Crawled - currently not indexed" because
  // Google indexes the age gate text, not the peptide/guide content.
  //
  // Google Search Central documentation explicitly recommends bypassing age
  // gates for Googlebot. This is NOT cloaking: the same page content is served
  // to all visitors; bots simply skip an interstitial they cannot interact with.
  //
  // Mechanism: for known crawler User-Agents, add data-bot-bypass="1" to the
  // <html> tag. This is a pure HTML attribute — no JavaScript execution needed.
  // It is readable by both the inline pre-React script (client/index.html) and
  // React's isAgeVerified() via document.documentElement.dataset.botBypass.
  // We also inject window.__AGE_BYPASS__=1 + localStorage.setItem as belt-and-
  // suspenders for renderers that do support those APIs.
  //
  // IMPORTANT: Google's URL Inspection Tool sends UA "Google-InspectionTool/1.0"
  // (not "Googlebot/2.1") for its WRS rendering requests. Both must be matched.
  // ---------------------------------------------------------------------------
  const SEARCH_BOT_RE = /Googlebot|Google-InspectionTool|Chrome-Lighthouse|bingbot|DuckDuckBot|Baiduspider|Applebot|YandexBot|Slurp/i;
  const AGE_BYPASS_SCRIPT = `<script>window.__AGE_BYPASS__=1;try{localStorage.setItem('revive-research-age-verified',String(Date.now()));}catch(e){}</script>`;

  app.use((req, res, next) => {
    const ua = req.headers['user-agent'] ?? '';
    if (!SEARCH_BOT_RE.test(ua)) return next();

    const originalEnd = res.end.bind(res);
    (res as any).end = function(chunk: any, ...args: any[]) {
      if (typeof chunk === 'string' && chunk.includes('<html')) {
        chunk = chunk.replace('<html', '<html data-bot-bypass="1"');
      }
      if (typeof chunk === 'string' && chunk.includes('<body>')) {
        chunk = chunk.replace('<body>', '<body>' + AGE_BYPASS_SCRIPT);
      }
      return originalEnd(chunk, ...args);
    };
    next();
  });

  // Serve static assets from public folder (e.g., /assets/logo.png)
  // In development: serve from public/assets and client/public/assets
  // In production: serve from dist/public/assets (Vite copies client/public to dist/public)
  app.use('/assets', express.static(path.resolve(process.cwd(), 'public/assets')));
  app.use('/assets', express.static(path.resolve(process.cwd(), 'client/public/assets')));
  app.use('/assets', express.static(path.resolve(process.cwd(), 'dist/public/assets')));

  const SITE_URL = "https://reviveresearch.co";

  // ---------------------------------------------------------------------------
  // 301 redirect for removed /bulk-packs page
  app.get('/bulk-packs', (_req, res) => {
    res.redirect(301, '/peptides');
  });

  // 301 redirects for /education → canonical Education Center URL
  // Client-side router also handles these but server-side redirect is required for crawlers
  app.get('/education', (_req, res) => {
    res.redirect(301, '/guides/peptide-education-center');
  });
  app.get('/education/:slug', (req, res) => {
    res.redirect(301, `/guides/${req.params.slug}`);
  });

  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\n\n# Allow public API routes needed for page rendering\nAllow: /api/education\nAllow: /api/peptides\nAllow: /api/products\nAllow: /api/coas\nAllow: /api/waitlist/count\n\n# Disallow all other API and system routes\nDisallow: /api/\n\n# Disallow private pages\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /account\nDisallow: /account-settings\nDisallow: /affiliate-dashboard\nDisallow: /login\nDisallow: /signup\nDisallow: /register\n\n# Disallow transactional pages\nDisallow: /cart\nDisallow: /checkout\nDisallow: /order-confirmation\n\nSitemap: ${SITE_URL}/sitemap.xml`
    );
  });

  app.get('/sitemap.xml', async (_req, res) => {
    try {
      const BODY_SYSTEM_SLUGS = ['healing', 'metabolic', 'growth', 'cognitive', 'skin', 'longevity', 'hormonal'];

      const staticUrls = [
        // Core pages
        { loc: '/', priority: '1.0', changefreq: 'daily' },
        { loc: '/peptides', priority: '0.9', changefreq: 'daily' },
        { loc: '/shop', priority: '0.9', changefreq: 'daily' },
        { loc: '/research-stacks', priority: '0.8', changefreq: 'weekly' },
        // Body system hub pages
        ...BODY_SYSTEM_SLUGS.map(s => ({ loc: `/systems/${s}`, priority: '0.7', changefreq: 'weekly' })),
        // Tools & resources
        { loc: '/tools/peptide-reconstitution-calculator', priority: '0.7', changefreq: 'monthly' },
        { loc: '/reconstitution-wizard', priority: '0.7', changefreq: 'monthly' },
        { loc: '/academy', priority: '0.7', changefreq: 'weekly' },
        { loc: '/peptide-research-faq', priority: '0.7', changefreq: 'monthly' },
        // COA & quality
        { loc: '/coa/verify-certificate-of-analysis', priority: '0.7', changefreq: 'weekly' },
        { loc: '/coa/batch-testing-archive', priority: '0.7', changefreq: 'weekly' },
        // Education hub
        { loc: '/guides/peptide-education-center', priority: '0.8', changefreq: 'weekly' },
        { loc: '/peptide-research-resources', priority: '0.7', changefreq: 'monthly' },
        // Trust & transparency guides
        { loc: '/guides/peptide-quality-assurance-process', priority: '0.7', changefreq: 'monthly' },
        { loc: '/about/our-transparency-commitment', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/peptide-vendor-ethics-standards', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/peptide-pricing-breakdown', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/peptide-lab-research-archive', priority: '0.7', changefreq: 'weekly' },
        // SEO entry articles
        { loc: '/guides/are-peptide-coas-trustworthy', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/how-batch-testing-works', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-research-use-only-means', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/how-to-verify-peptide-quality', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/peptide-purity-explained', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/why-cheap-peptides-are-cheap', priority: '0.7', changefreq: 'monthly' },
        // Individual peptide education articles
        { loc: '/guides/what-is-bpc-157-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-tb-500-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-ghk-cu-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-rr-a1-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-rr-a2-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-rr-a3-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-cjc-1295-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-ipamorelin-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-tesamorelin-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-epithalon-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-mots-c-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-igf-1-lr3-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-igf-des-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-semax-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-hcg-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-nad-precursor', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-glow-peptide-complex', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-klow-peptide-complex', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-5-amino-1mq-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-dihexa-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-glutathione', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-vitamin-b12', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-melanotan-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-slu-pp-332-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-aod-9604-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-kisspeptin-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-kisspeptin-54-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-pt-141-bremelanotide-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-gonadorelin-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-triptorelin-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-enclomiphene-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-oxytocin-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-thymosin-alpha-1-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-dsip-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-selank-peptide', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-is-thymulin-peptide', priority: '0.7', changefreq: 'monthly' },
        // General education articles
        { loc: '/guides/ordering-expectations', priority: '0.6', changefreq: 'monthly' },
        { loc: '/guides/how-to-read-coas', priority: '0.6', changefreq: 'monthly' },
        { loc: '/guides/storage-101', priority: '0.6', changefreq: 'monthly' },
        { loc: '/guides/lab-safety-guidelines', priority: '0.6', changefreq: 'monthly' },
        { loc: '/guides/understanding-batches', priority: '0.6', changefreq: 'monthly' },
        { loc: '/guides/peptide-handling-troubleshooting', priority: '0.6', changefreq: 'monthly' },
        { loc: '/guides/peptide-package-arrived-warm', priority: '0.6', changefreq: 'monthly' },
        // Support & info
        { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
        { loc: '/affiliate', priority: '0.6', changefreq: 'monthly' },
        { loc: '/peptide-shipping-and-handling', priority: '0.6', changefreq: 'monthly' },
        // Legal
        { loc: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
        { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
        { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
        { loc: '/disclaimer', priority: '0.3', changefreq: 'yearly' },
        { loc: '/legal', priority: '0.3', changefreq: 'yearly' },
      ];

      const [products, articles, stacks] = await Promise.all([
        storage.getAllProducts(),
        storage.getAllEducationArticles(),
        storage.getResearchStacks({ showOnPage: true }),
      ]);
      const today = new Date().toISOString().split('T')[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      const emittedPaths = new Set<string>();
      for (const url of staticUrls) {
        xml += `  <url>\n    <loc>${SITE_URL}${url.loc}</loc>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
        emittedPaths.add(url.loc);
      }

      // Thin/placeholder products are noindexed — exclude from sitemap so Google
      // doesn't waste crawl budget on pages we've already told it to ignore.
      const THIN_NOINDEX_SLUGS = new Set([
        'botulinum-toxin-type-a', 'pnc-27', 'hyaluronic-acid', 'ara-290',
        'cjc-1295-no-dac', 'cjc-1295-ipamorelin-stack', 'adipotide',
        'ghrp-6', 'hexarelin', 'vip', 'igf-des',
        'l-carnitine', 'b12-injection',
      ]);

      for (const product of products) {
        if (product.slug && !THIN_NOINDEX_SLUGS.has(product.slug)) {
          xml += `  <url>\n    <loc>${SITE_URL}/peptides/${product.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
        }
      }

      for (const stack of stacks) {
        const slug = stack.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        xml += `  <url>\n    <loc>${SITE_URL}/research-stacks/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
      }

      for (const article of articles) {
        if (article.slug && !emittedPaths.has(`/guides/${article.slug}`)) {
          const mod = article.updatedAt ? new Date(article.updatedAt).toISOString().split('T')[0] : today;
          xml += `  <url>\n    <loc>${SITE_URL}/guides/${article.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n    <lastmod>${mod}</lastmod>\n  </url>\n`;
        }
      }

      xml += `</urlset>`;
      res.type('application/xml').send(xml);
    } catch (err) {
      console.error('Sitemap generation error:', err);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Setup authentication
  await setupAuth(app);

  // 301 Redirects for SEO guide URL migration
  const guideRedirects: Record<string, string> = {
    '/guides/coa-trust': '/guides/are-peptide-coas-trustworthy',
    '/guides/batch-testing': '/guides/how-batch-testing-works',
    '/guides/research-use-only': '/guides/what-research-use-only-means',
    '/guides/verify-quality': '/guides/how-to-verify-peptide-quality',
    '/guides/purity-explained': '/guides/peptide-purity-explained',
    '/guides/cheap-peptides': '/guides/why-cheap-peptides-are-cheap',
    // Duplicate slug consolidation — confirmed duplicate content pairs
    '/guides/research-use-only-explained': '/guides/what-research-use-only-means',
    '/guides/understanding-peptide-purity': '/guides/peptide-purity-explained',
    '/guides/peptide-vendor-checklist': '/guides/peptide-vendor-ethics-standards',
    // Audited: /guides/why-coas-matter-peptide-research vs /guides/are-peptide-coas-trustworthy
    // These serve different search intents — "why COAs matter" answers importance/value questions
    // while "are COAs trustworthy" answers credibility/verification questions. No redirect added.
  };

  Object.entries(guideRedirects).forEach(([oldPath, newPath]) => {
    app.get(oldPath, (req, res) => {
      res.redirect(301, newPath);
    });
  });

  // 301 redirects for legacy/renamed pages
  // These URLs were renamed or restructured. They previously had only client-side window.location.replace()
  // redirects in App.tsx which Googlebot cannot follow — adding server-side 301s here fixes soft 404s.
  const legacyPageRedirects: Record<string, string> = {
    '/faq':              '/peptide-research-faq',
    '/dosage-calculator':'/tools/peptide-reconstitution-calculator',
    '/package-warm':     '/guides/peptide-package-arrived-warm',
    '/coa':              '/coa/verify-certificate-of-analysis',
    '/transparency':     '/about/our-transparency-commitment',
    '/quality-process':  '/guides/peptide-quality-assurance-process',
    '/resources':        '/peptide-research-resources',
    '/lab-notes':        '/guides/peptide-lab-research-archive',
    '/batch-archive':    '/coa/batch-testing-archive',
    '/buyer-checklist':  '/guides/peptide-vendor-ethics-standards',
    '/ethical-pricing':  '/guides/peptide-pricing-breakdown',
    '/products':         '/peptides',
    '/troubleshooting':  '/guides/peptide-handling-troubleshooting',
  };

  Object.entries(legacyPageRedirects).forEach(([oldPath, newPath]) => {
    app.get(oldPath, (_req, res) => {
      res.redirect(301, newPath);
    });
  });

  // PayPal payment routes
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    // Validate stock before creating PayPal order (before payment is captured)
    const { items } = req.body;
    if (items && Array.isArray(items)) {
      const stockItems = items.map((item: any) => ({
        productId: item.productId || item.id,
        dosage: item.dosage || undefined,
        quantity: item.quantity || 1,
      }));
      const stockCheck = await storage.validateStock(stockItems);
      if (!stockCheck.valid) {
        return res.status(409).json({
          error: "Some items are out of stock",
          stockErrors: stockCheck.errors,
        });
      }
    }
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // PayPal Subscription routes
  app.get("/api/subscriptions/discounts", (req, res) => {
    getSubscriptionDiscounts(req, res);
  });

  app.post("/api/subscriptions/plan", async (req, res) => {
    await getOrCreateSubscriptionPlan(req, res);
  });

  app.post("/api/subscriptions/create", async (req, res) => {
    await createPayPalSubscription(req, res);
  });

  app.post("/api/subscriptions/cancel", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { subscriptionId } = req.body;
      if (!subscriptionId) {
        return res.status(400).json({ error: "Subscription ID is required" });
      }

      // Verify the subscription exists and belongs to the authenticated user.
      // This prevents one user from cancelling another user's subscription
      // using only a guessed or leaked PayPal subscription ID.
      const [subscription] = await db.select().from(subscriptions)
        .where(eq(subscriptions.paypalSubscriptionId, subscriptionId));

      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      if (subscription.userId !== userId) {
        console.warn(
          `[Subscriptions] User ${userId} attempted to cancel subscription ` +
          `${subscriptionId} belonging to user ${subscription.userId}`
        );
        return res.status(403).json({ error: "Access denied: subscription does not belong to this account" });
      }

      await cancelPayPalSubscription(req, res);
    } catch (error: any) {
      console.error("Error in subscription cancel authorization:", error);
      res.status(500).json({ error: "Failed to process cancellation request" });
    }
  });

  // PayPal Webhook handler
  app.post("/api/paypal/webhook", async (req, res) => {
    await handlePayPalWebhook(req, res);
  });

  // Sync Supabase user to database and establish Express session.
  // Requires a valid Supabase access token in the Authorization header.
  // Identity is extracted exclusively from the server-verified token —
  // request body fields are never trusted for session binding.
  app.post('/api/auth/sync', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Authorization token required" });
      }

      const token = authHeader.slice(7);
      let claims;
      try {
        claims = await verifySupabaseToken(token);
      } catch (err) {
        console.warn("[Security] Supabase token verification failed:", (err as Error).message);
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      const supabaseId = claims.id;
      const email = claims.email || null;
      const meta = claims.user_metadata || {};
      const firstName = meta.given_name || (meta.full_name || meta.name || "").split(" ")[0] || null;
      const lastName = meta.family_name || (meta.full_name || meta.name || "").split(" ").slice(1).join(" ") || null;
      const profileImageUrl = meta.avatar_url || meta.picture || null;

      if (!supabaseId) {
        return res.status(400).json({ message: "Token missing user id" });
      }

      // Lazy ID migration: if a legacy user (auth0|, google-oauth2|, or any
      // non-UUID format) exists with the same email, atomically swap all
      // user_id references to the new Supabase UUID.
      // Uses insert-new-row → update-children → delete-old-row so FK integrity
      // is maintained throughout without needing superuser privileges
      // (session_replication_role is not available on Neon managed Postgres).
      // This runs exactly once per legacy user on their first post-migration login.
      if (email) {
        const legacyCheck = await db.execute(
          sql`SELECT id FROM users WHERE email = ${email} AND id != ${supabaseId} LIMIT 1`
        );
        if (legacyCheck.rows.length > 0) {
          const oldId = legacyCheck.rows[0].id as string;
          console.log(`[Auth] Migrating legacy user ${oldId} → ${supabaseId}`);
          const client = await pool.connect();
          try {
            await client.query('BEGIN');
            // Step 1: prefix the email on the old row with 'migrating_' to release
            // the unique constraint so the new row can claim the real email.
            // Using a deterministic prefix (not NULL) keeps the row identifiable
            // if the transaction is inspected mid-flight.
            await client.query(
              `UPDATE users SET email = 'migrating_' || id WHERE id = $1`,
              [oldId]
            );
            // Step 2: insert the new row with the Supabase UUID, copying all
            // columns from the old row and using the real email.
            // ON CONFLICT (id) DO NOTHING handles a concurrent request that
            // already created the new row.
            await client.query(
              `INSERT INTO users (id, email, first_name, last_name, profile_image_url, is_admin, ruo_attestation_at, created_at, updated_at)
               SELECT $1, $2, first_name, last_name, profile_image_url, is_admin, ruo_attestation_at, created_at, NOW()
               FROM users WHERE id = $3
               ON CONFLICT (id) DO NOTHING`,
              [supabaseId, email, oldId]
            );
            // Step 3: point all child rows to the new UUID. Child tables still
            // reference the original oldId (the id column was never changed,
            // only the email was prefixed in step 1).
            for (const table of [
              'academy_progress', 'affiliates', 'batch_verification_history',
              'cycle_tags', 'login_history', 'notification_preferences',
              'research_notes', 'saved_addresses', 'saved_stacks',
              'user_research_profiles', 'orders', 'product_votes', 'wishlists',
            ]) {
              await client.query(
                `UPDATE ${table} SET user_id = $1 WHERE user_id = $2`,
                [supabaseId, oldId]
              );
            }
            // Step 4: delete the old row. Its id is still oldId (unchanged) but
            // its email is now prefixed — match on id for safety.
            await client.query('DELETE FROM users WHERE id = $1', [oldId]);
            await client.query('COMMIT');
            console.log(`[Auth] Migration complete for ${email}`);
          } catch (migrationErr) {
            await client.query('ROLLBACK');
            console.error("[Auth] ID migration failed, rolling back:", migrationErr);
            return res.status(500).json({ message: "Account migration failed" });
          } finally {
            client.release();
          }
        }
      }

      await storage.upsertUser({
        id: supabaseId,
        email,
        firstName,
        lastName,
        profileImageUrl,
      });

      const user = await storage.getUser(supabaseId);
      (req.session as any).userId = supabaseId;
      res.json(user);
    } catch (error) {
      console.error("Error syncing user:", error);
      res.status(500).json({ message: "Failed to sync user" });
    }
  });

  // Dev/test-only: create a stable test session without Supabase auth.
  // Disabled in production. Used by Playwright global setup to pre-authenticate
  // browser contexts so tests that require login don't hit the AuthGate.
  if (process.env.NODE_ENV !== 'production') {
    const testLoginHandler = async (req: any, res: any) => {
      try {
        const TEST_USER_ID = 'e2e-test-user-00000000';
        await storage.upsertUser({
          id: TEST_USER_ID,
          email: 'e2e@reviveresearch.dev',
          firstName: 'E2E',
          lastName: 'Test',
          isAdmin: false,
        });
        // Also record RUO attestation so the modal never appears in tests
        await storage.updateUserAttestation(TEST_USER_ID, new Date());
        (req.session as any).userId = TEST_USER_ID;
        await new Promise<void>((resolve, reject) =>
          req.session.save((err: unknown) => (err ? reject(err) : resolve()))
        );
        const returnTo = req.query.returnTo || null;
        if (returnTo && typeof returnTo === 'string' && returnTo.startsWith('/')) {
          res.redirect(returnTo);
        } else {
          res.json({ ok: true, userId: TEST_USER_ID });
        }
      } catch (err) {
        console.error('[test/login]', err);
        res.status(500).json({ error: String(err) });
      }
    };
    app.post('/api/test/login', testLoginHandler);
    // GET variant: navigating to this URL sets the session + redirects to ?returnTo=
    // Allows Playwright to authenticate without needing JS execution or POST forms.
    app.get('/api/test/login', testLoginHandler);
  }

  // Get authenticated user
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(200).json(null);
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Record RUO attestation timestamp for the authenticated user
  app.post('/api/auth/attest-ruo', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.updateUserAttestation(userId, new Date());
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ruoAttestationAt: user.ruoAttestationAt });
    } catch (error) {
      console.error("Error recording RUO attestation:", error);
      res.status(500).json({ message: "Failed to record attestation" });
    }
  });

  // First-order status — used to inject free 3ml BAC water for first-time buyers
  // No auth required — guests are always first-time buyers
  app.get('/api/my-first-order-status', async (req: any, res) => {
    try {
      const userId = (req.session as any)?.userId;
      // Guests have no orders → treat as first-time buyer
      const isFirstOrder = userId
        ? (await storage.getOrdersByUserId(userId)).length === 0
        : true;

      const allProducts = await storage.getAllProducts();
      const bacWater = allProducts.find((p) =>
        p.slug === 'bacteriostatic-water' || p.name.toLowerCase().includes('bacteriostatic')
      );

      if (!bacWater) {
        return res.json({ isFirstOrder, bacWaterProductId: null, bacWaterDosage: null, bacWaterName: null, bacWaterImageUrl: null });
      }

      // Promo is only valid for the 3ml dosage — disable if 3ml is not in stock
      // Case-insensitive match so '3mL' and '3ml' both work
      const bacWaterStocks = await storage.getProductDosageStocks(bacWater.id);
      const threeMlStock = bacWaterStocks.find((s) => s.dosage.toLowerCase() === '3ml' && s.inStock);
      const threeMlDosage = threeMlStock?.dosage || '3ml';

      if (!threeMlStock) {
        // 3ml is out of stock — promo unavailable
        return res.json({ isFirstOrder, bacWaterProductId: null, bacWaterDosage: null, bacWaterName: null, bacWaterImageUrl: null });
      }

      res.json({
        isFirstOrder,
        bacWaterProductId: bacWater.id,
        bacWaterName: bacWater.name,
        bacWaterImageUrl: bacWater.imageUrl || null,
        bacWaterDosage: threeMlDosage,
        bacWaterPrice: Number(threeMlStock.price) || Number(bacWater.price) || null,
      });
    } catch (error) {
      console.error("Error checking first order status:", error);
      res.status(500).json({ message: "Failed to check order status" });
    }
  });

  // Record when a user declines the first-order BAC water promo.
  // Fire-and-forget from the client — no body required, just the session.
  app.post('/api/promo/bac-water-declined', async (req: any, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (userId) {
        await db.insert(firstOrderPromos).values({ userId, status: 'declined' }).catch(() => {});
        console.log(`[Promo] First-order BAC water declined by user=${userId}`);
      }
      res.status(204).end();
    } catch {
      res.status(204).end();
    }
  });

  // Logout - clear server session
  app.post('/api/auth/logout', (req: any, res) => {
    try {
      if (req.session) {
        req.session.destroy((err: any) => {
          if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).json({ message: "Failed to logout" });
          }
          res.clearCookie('connect.sid');
          res.json({ success: true });
        });
      } else {
        res.json({ success: true });
      }
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  // Test email endpoint - sends a plain text email to verify SES configuration
  app.post("/api/test-email", isAuthenticated, async (req: any, res) => {
    const sessionUserId = (req.session as any)?.userId;
    if (!sessionUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const callerUser = await storage.getUser(sessionUserId);
    if (!callerUser?.isAdmin) {
      return res.status(403).json({ error: "Forbidden - Admin access required" });
    }
    console.log('[Test Email] Endpoint called');
    try {
      const { to, type } = req.body;
      
      if (!to || typeof to !== 'string') {
        return res.status(400).json({ error: "Missing 'to' email address in request body" });
      }
      
      console.log(`[Test Email] Attempting to send test email to: ${to}, type: ${type || 'orders'}`);
      
      // Support testing different email types
      let result;
      if (type === 'newsletter') {
        result = await sendNewsletterWelcomeEmail(to);
      } else if (type === 'order') {
        result = await sendOrderConfirmationEmail({
          id: 'TEST-' + Date.now(),
          email: to,
          firstName: 'Test',
          lastName: 'Researcher',
          productId: 'test-product',
          quantity: 2,
          totalAmount: '149.99',
          address: '123 Research Lane',
          city: 'Frisco',
          state: 'TX',
          zipCode: '75033',
          country: 'United States',
        }, 'BPC-157 10mg');
      } else {
        result = await sendEmail({
          to,
          subject: "Revive Research - Test Email",
          text: `This is a test email from Revive Research.\n\nIf you received this, your Amazon SES email configuration is working correctly.\n\nSent at: ${new Date().toISOString()}`,
          from: type === 'noreply' ? 'noreply' : 'orders',
        });
      }
      
      if (result.success) {
        console.log(`[Test Email] Success! MessageId: ${result.messageId}`);
        res.json({ 
          success: true, 
          message: "Test email sent successfully",
          messageId: result.messageId 
        });
      } else {
        console.error(`[Test Email] Failed: ${result.error}`);
        res.status(500).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error: any) {
      console.error("[Test Email] Unexpected error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to send test email" 
      });
    }
  });

  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const productsWithDosage = await storage.getAllProductsWithDosageStock();
      const enriched = productsWithDosage.map(({ dosageStocks, ...product }) => {
        const { displayPrice, displayOriginalPrice } = resolveDisplayPrice(product, dosageStocks);

        const dosagePrices = dosageStocks
          .filter(ds => ds.price != null && Number(ds.price) > 0)
          .map(ds => Number(ds.price));
        
        let minPrice: string | undefined;
        let maxPrice: string | undefined;
        if (dosagePrices.length >= 2) {
          const min = Math.min(...dosagePrices);
          const max = Math.max(...dosagePrices);
          if (min !== max) {
            minPrice = min.toFixed(2);
            maxPrice = max.toFixed(2);
          }
        }

        return {
          ...product,
          price: displayPrice,
          originalPrice: displayOriginalPrice || product.originalPrice,
          ...(minPrice && maxPrice ? { minPrice, maxPrice } : {}),
        };
      });
      res.json(enriched);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Search products
  app.get("/api/products/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        const products = await storage.getAllProducts();
        return res.json(products);
      }
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ error: "Failed to search products" });
    }
  });

  // Get selling fast products (products with 5+ orders in last 7 days)
  app.get("/api/products/selling-fast", async (req, res) => {
    try {
      const daysBack = parseInt(req.query.days as string) || 7;
      const minOrders = parseInt(req.query.minOrders as string) || 5;
      const sellingFastIds = await storage.getSellingFastProducts(daysBack, minOrders);
      res.json(sellingFastIds);
    } catch (error) {
      console.error("Error fetching selling fast products:", error);
      res.status(500).json({ error: "Failed to fetch selling fast products" });
    }
  });

  // Product Votes - bulk vote counts (must be before :id route)
  app.get("/api/products/votes", async (req, res) => {
    try {
      const voteCounts = await storage.getVoteCounts();
      res.json(voteCounts);
    } catch (error) {
      console.error("Error fetching vote counts:", error);
      res.status(500).json({ error: "Failed to fetch vote counts" });
    }
  });

  // Get single product by ID
  app.get("/api/products/:idOrSlug", async (req, res) => {
    try {
      const param = req.params.idOrSlug;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param);
      const product = isUUID
        ? await storage.getProduct(param)
        : await storage.getProductBySlug(param);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Get price trend for a product (public - for transparency display)
  app.get("/api/products/:id/price-trend", async (req, res) => {
    try {
      const trend = await storage.getProductPriceTrend(req.params.id);
      res.json(trend);
    } catch (error) {
      console.error("Error fetching price trend:", error);
      res.status(500).json({ error: "Failed to fetch price trend" });
    }
  });

  // Get price history for a product (public - for transparency)
  app.get("/api/products/:id/price-history", async (req, res) => {
    try {
      const months = parseInt(req.query.months as string) || 6;
      const history = await storage.getProductPriceHistory(req.params.id, months);
      res.json(history);
    } catch (error) {
      console.error("Error fetching price history:", error);
      res.status(500).json({ error: "Failed to fetch price history" });
    }
  });

  // Check if price can be changed (admin)
  app.get("/api/products/:id/can-change-price", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const result = await storage.canChangePrice(req.params.id);
      res.json(result);
    } catch (error) {
      console.error("Error checking price change eligibility:", error);
      res.status(500).json({ error: "Failed to check price change eligibility" });
    }
  });

  // Get COA by batch number
  app.get("/api/coa/:batchNumber", async (req, res) => {
    try {
      const coa = await storage.getCoaByBatchNumber(req.params.batchNumber);
      if (!coa) {
        return res.status(404).json({ error: "COA not found" });
      }
      res.json(coa);
    } catch (error) {
      console.error("Error fetching COA:", error);
      res.status(500).json({ error: "Failed to fetch COA" });
    }
  });

  // Public: average purity across active COAs for hero trust strip
  app.get("/api/stats/purity", async (_req, res) => {
    try {
      const allCoas = await storage.getAllCoas(false);
      const visible = allCoas.filter((c) => c.publiclyVisible !== false);
      const values: number[] = [];
      for (const coa of visible) {
        const numeric = parseFloat(coa.purity.replace("%", "").trim());
        if (!isNaN(numeric)) values.push(numeric);
      }
      if (values.length === 0) {
        return res.json({ purity: null });
      }
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      res.json({ purity: parseFloat(avg.toFixed(1)) });
    } catch (error) {
      console.error("Error computing purity stat:", error);
      res.status(500).json({ error: "Failed to compute purity stat" });
    }
  });

  // Validate stock availability before checkout
  app.post("/api/stock/validate", async (req, res) => {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Items array is required" });
      }
      const result = await storage.validateStock(items);
      res.json(result);
    } catch (error) {
      console.error("Error validating stock:", error);
      res.status(500).json({ valid: false, errors: ["Failed to validate stock"] });
    }
  });

  // Create order with pending_payment status (processor-agnostic checkout)
  app.post("/api/orders", async (req: any, res) => {
    try {
      const orderData = { ...req.body };
      
      // If user is authenticated, link order to their account
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        orderData.userId = req.user.claims.sub;
      }
      
      // Security: Always force status to pending_payment for new orders
      // Clients cannot set their own status to bypass payment flow
      orderData.status = 'pending_payment';
      
      const validatedData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedData);
      
      console.log(`[Order ${order.id}] Created with status: ${order.status}`);
      
      // Return order_id for payment processor to use in metadata
      res.status(201).json({ 
        order, 
        orderId: order.id,
        message: "Order created with pending_payment status. Complete payment to finalize."
      });
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid order data" });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Create manual payment order (CashApp/Zelle/Venmo) with pending_payment status
  app.post("/api/orders/manual", async (req: any, res) => {
    try {
      const { 
        paymentMethod, 
        customerEmail, 
        customerName, 
        shippingAddress, 
        items, 
        total,
        isTest: isTestOrder = false,
      } = req.body;

      // Validate required fields
      if (!paymentMethod || !customerEmail || !customerName || !shippingAddress || !items || !total) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!['cashapp', 'zelle', 'venmo'].includes(paymentMethod)) {
        return res.status(400).json({ error: "Invalid payment method" });
      }

      // Build order data from cart items
      const [firstName, ...lastNameParts] = customerName.split(' ');
      const lastName = lastNameParts.join(' ') || '';

      // For multi-item orders, we'll create a consolidated order
      // Using the first product as the primary, with items stored in notes
      const primaryItem = items[0];
      
      const orderData: any = {
        // Use first product ID, or a special multi-item ID
        productId: primaryItem?.productId || 'multi-item',
        quantity: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        totalAmount: total.toString(),
        email: customerEmail,
        firstName,
        lastName,
        address: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zip,
        country: 'USA',
        status: 'pending_payment',
        fulfillmentStatus: 'pending',
        paymentMethod: paymentMethod,
        isTest: Boolean(isTestOrder),
        notes: `Manual ${paymentMethod.toUpperCase()} payment. Items: ${items.map((i: any) => `${i.name} (${i.dosage}) x${i.quantity}`).join(', ')}`,
      };

      // If user is authenticated, link order to their account
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        orderData.userId = req.user.claims.sub;
      }

      // Validate stock before creating the order (skip for test orders)
      const stockItems = items.map((item: any) => ({
        productId: item.productId,
        dosage: item.dosage || undefined,
        quantity: item.quantity || 1,
      }));

      if (!isTestOrder) {
        const stockCheck = await storage.validateStock(stockItems);
        if (!stockCheck.valid) {
          return res.status(409).json({ 
            error: "Some items are no longer available", 
            stockErrors: stockCheck.errors 
          });
        }
      }

      const validatedData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedData);
      
      console.log(`[Manual Order ${order.id}] Created with ${paymentMethod}${isTestOrder ? ' (TEST - no stock/email side-effects)' : ' - awaiting payment'}`);
      
      if (!isTestOrder) {
        // Decrement stock immediately to reserve inventory
        try {
          const stockResult = await storage.decrementStock(stockItems);
          if (!stockResult.success) {
            console.warn(`[Manual Order ${order.id}] Stock decrement warnings:`, stockResult.errors);
          }
        } catch (stockError: any) {
          console.error(`[Manual Order ${order.id}] Stock decrement failed:`, stockError.message);
        }
        
        // Calculate order details for email
        const orderSubtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        const orderShipping = 0; // Will be calculated at fulfillment
        const orderTax = total - orderSubtotal; // Tax is included in total
        const orderTaxState = shippingAddress.state || '';
        
        // Send customer email with pending payment notice
        let emailSent = false;
        try {
          const emailResult = await sendOrderConfirmationEmail(order, undefined, items, orderSubtotal, orderShipping, orderTax, orderTaxState);
          if (emailResult.success) {
            await storage.updateOrderEmailStatus(order.id, 'sent');
            emailSent = true;
            console.log(`[Manual Order ${order.id}] Confirmation email sent to ${customerEmail}`);
          } else {
            await storage.updateOrderEmailStatus(order.id, 'failed', emailResult.error);
            console.error(`[Manual Order ${order.id}] Email failed:`, emailResult.error);
          }
        } catch (emailError: any) {
          console.error(`[Manual Order ${order.id}] Email error:`, emailError.message);
          await storage.updateOrderEmailStatus(order.id, 'failed', emailError.message);
        }

        // Send admin notification
        try {
          await sendAdminOrderNotificationEmail(order, undefined, items, orderSubtotal, orderShipping, orderTax, orderTaxState);
          console.log(`[Manual Order ${order.id}] Admin notification sent`);
        } catch (adminEmailError: any) {
          console.error(`[Manual Order ${order.id}] Admin notification failed:`, adminEmailError.message);
        }

        res.status(201).json({ 
          id: order.id,
          order,
          paymentMethod,
          emailSent,
          message: `Order created. Please send $${total.toFixed(2)} via ${paymentMethod.toUpperCase()} and include ONLY your order number in the payment note.`
        });
      } else {
        res.status(201).json({
          id: order.id,
          order,
          paymentMethod,
          emailSent: false,
          message: `Test order created. No stock reserved, no emails sent.`,
        });
      }
    } catch (error) {
      console.error("Error creating manual order:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid order data" });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Test-only cleanup: delete an order that was created with isTest=true.
  // This endpoint requires no authentication because it only operates on
  // orders explicitly flagged as test orders — real orders are always protected.
  app.delete("/api/orders/test-cleanup/:id", async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      if (!order.isTest) {
        return res.status(403).json({ error: "Only test orders can be deleted via this endpoint" });
      }
      await storage.deleteOrder(orderId);
      console.log(`[Test Cleanup] Deleted test order ${orderId}`);
      res.json({ success: true });
    } catch (error: any) {
      console.error("[Test Cleanup] Error:", error);
      res.status(500).json({ error: error.message || "Failed to delete test order" });
    }
  });

  // Create order from successful PayPal payment (already paid)
  app.post("/api/orders/paypal", async (req: any, res) => {
    try {
      const { 
        paypalOrderId,
        paypalPayerId,
        customerEmail, 
        customerName, 
        shippingAddress, 
        items, 
        subtotal,
        shipping,
        tax,
        taxState,
        total 
      } = req.body;

      // Validate required fields
      if (!paypalOrderId || !customerEmail || !customerName || !shippingAddress || !items || !total) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // --- Input validation: items must be a non-empty array with positive integer quantities ---
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Items must be a non-empty array" });
      }
      for (const item of items) {
        if (!item.productId || typeof item.productId !== "string") {
          return res.status(400).json({ error: "Each item must have a valid productId" });
        }
        const qty = Number(item.quantity);
        if (!Number.isInteger(qty) || qty < 1) {
          return res.status(400).json({ error: "Each item quantity must be a positive integer" });
        }
      }

      // --- Replay attack prevention ---
      // Reject if this PayPal order ID has already been used to create an order.
      // The unique constraint on paypal_order_id also provides a database-level guard.
      const existingOrders = await db.select({ id: ordersTable.id })
        .from(ordersTable)
        .where(eq(ordersTable.paypalOrderId, paypalOrderId))
        .limit(1);

      if (existingOrders.length > 0) {
        console.warn(`[PayPal Order] Replay attempt: order ${paypalOrderId} already finalized as ${existingOrders[0].id}`);
        return res.status(409).json({ error: "This PayPal order has already been finalized" });
      }

      // --- Server-side PayPal payment verification ---
      // Retrieve order details directly from PayPal to confirm it exists,
      // belongs to this merchant, and was fully captured (COMPLETED).
      const paypalDetails = await getPaypalOrderDetails(paypalOrderId);

      if (!paypalDetails) {
        console.warn(`[PayPal Order] Could not retrieve PayPal order ${paypalOrderId} from PayPal API`);
        return res.status(402).json({ error: "Payment verification failed: could not retrieve order from PayPal" });
      }

      if (paypalDetails.status !== "COMPLETED") {
        console.warn(`[PayPal Order] Order ${paypalOrderId} has status ${paypalDetails.status}, not COMPLETED`);
        return res.status(402).json({ error: "Payment verification failed: order has not been fully captured" });
      }

      if (paypalDetails.currency !== "USD") {
        console.warn(`[PayPal Order] Unexpected currency ${paypalDetails.currency} for order ${paypalOrderId}`);
        return res.status(402).json({ error: "Payment verification failed: unsupported currency" });
      }

      // --- Recompute expected total from authoritative server-side pricing ---
      // This prevents underpayment attacks where a low-value PayPal order is
      // presented alongside a high-value cart.

      // Checkout is behind a ProtectedRoute on the client, so every legitimate
      // caller is authenticated. Reject unauthenticated POSTs (direct API abuse)
      // before running any further logic or spending PayPal API budget.
      const sessionUserId = (req.session as any)?.userId;
      if (!sessionUserId) {
        return res.status(401).json({ error: "Authentication required to create an order" });
      }

      // Identify the BAC water product for the eligibility abuse guard below.
      const allProds = await storage.getAllProducts();
      const bacWaterProduct = allProds.find((p) =>
        p.slug === 'bacteriostatic-water' || p.name.toLowerCase().includes('bacteriostatic')
      );
      const bacWaterProductId = bacWaterProduct?.id ?? null;

      // --- Free BAC water abuse guard ---
      // The cart layer is responsible for setting the promo price ($0) before
      // PayPal order creation. The server only verifies eligibility at confirmation
      // time — it does NOT reprice items. Cart prices are authoritative.
      const zeroPricedBacItems = items.filter((item: any) =>
        bacWaterProductId &&
        item.productId === bacWaterProductId &&
        parseFloat(String(item.price ?? '0')) === 0
      );
      // Pre-check: line count and item shape; first-order DB check runs inside
      {
        // Determine first-order status only if there is a free BAC item to evaluate
        const isUserFirstOrderForGuard = zeroPricedBacItems.length === 1
          ? (await storage.getOrdersByUserId(sessionUserId)).length === 0
          : false;
        const guardError = validateFreeBacWater(zeroPricedBacItems, isUserFirstOrderForGuard);
        if (guardError) {
          return res.status(400).json({ error: guardError });
        }
        if (zeroPricedBacItems.length === 1) {
          console.log(`[Promo] First-order BAC water confirmed for user=${sessionUserId}`);
        }
      }

      // Cart prices are authoritative — items passed through as-is.
      const hasFreeBacWater = zeroPricedBacItems.length === 1;
      const sanitizedItems = items;

      // Pack-tier discount table — MUST stay in sync with PACK_TIERS in
      // client/src/lib/pack-tiers.ts. If you change volume pricing percentages
      // or add/remove tier quantities there, update this table to match.
      const PACK_DISCOUNTS: Record<number, number> = { 1: 0, 3: 0.10, 5: 0.15, 10: 0.20 };

      let serverSubtotal = 0;
      for (const item of sanitizedItems) {
        const qty = Number(item.quantity);

        // Free BAC water (first order) — contributes $0 to server subtotal
        if (bacWaterProductId && item.productId === bacWaterProductId && item.dosage?.toLowerCase() === '3ml' && parseFloat(String(item.price ?? '0')) === 0) {
          continue;
        }

        const productData = await storage.getProductWithDosageStock(item.productId);
        if (!productData) {
          console.warn(`[PayPal Order] Unknown productId ${item.productId} in order ${paypalOrderId}`);
          return res.status(400).json({ error: `Unknown product: ${item.productId}` });
        }
        let baseUnitPrice: number | null = null;
        if (item.dosage && productData.dosageStocks.length > 0) {
          const dosageStock = productData.dosageStocks.find(
            (ds: any) => ds.dosage === item.dosage && ds.price && parseFloat(ds.price) > 0
          );
          if (dosageStock?.price) {
            baseUnitPrice = parseFloat(dosageStock.price);
          }
        }
        if (baseUnitPrice === null) {
          baseUnitPrice = parseFloat(productData.price);
        }
        if (isNaN(baseUnitPrice) || baseUnitPrice <= 0) {
          console.warn(`[PayPal Order] Could not resolve price for product ${item.productId} dosage ${item.dosage}`);
          return res.status(400).json({ error: `Could not resolve price for product ${item.productId}` });
        }
        // Apply pack discount using the same whole-dollar rounding as the client.
        // Math.round mirrors getPackPerVialPrice() in client/src/lib/pack-tiers.ts.
        const discount = PACK_DISCOUNTS[qty] ?? 0;
        const unitPrice = Math.round(baseUnitPrice * (1 - discount));
        serverSubtotal += unitPrice * qty;
      }

      const serverShipping = serverSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_RATE_SHIPPING;
      const shippingState = (shippingAddress?.state || "").toUpperCase().trim();
      const serverTax = calculateTax(shippingState, serverSubtotal);
      const serverTotal = serverSubtotal + serverShipping + serverTax;

      // Allow a small tolerance for floating-point rounding ($0.50 max).
      // The captured amount must be >= the full server-computed total.
      const PAYMENT_TOLERANCE = 0.50;

      if (paypalDetails.capturedAmount < serverTotal - PAYMENT_TOLERANCE) {
        console.warn(
          `[PayPal Order] Payment amount mismatch for ${paypalOrderId}: ` +
          `captured=${paypalDetails.capturedAmount}, server total=${serverTotal} ` +
          `(subtotal=${serverSubtotal}, shipping=${serverShipping}, tax=${serverTax})`
        );
        return res.status(402).json({ error: "Payment verification failed: captured amount does not match order total" });
      }

      console.log(
        `[PayPal Order] Verified ${paypalOrderId}: captured=${paypalDetails.capturedAmount}, ` +
        `server total=${serverTotal} (subtotal=${serverSubtotal}, shipping=${serverShipping}, tax=${serverTax})`
      );
      // --- End of payment verification ---

      // Build order data from cart items
      const [firstName, ...lastNameParts] = customerName.split(' ');
      const lastName = lastNameParts.join(' ') || '';

      // For multi-item orders, use the first product as primary (from sanitized list)
      const primaryItem = sanitizedItems[0];
      
      const orderData: any = {
        productId: primaryItem?.productId || 'multi-item',
        quantity: sanitizedItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
        totalAmount: serverTotal.toFixed(2),
        email: customerEmail,
        firstName,
        lastName,
        address: shippingAddress?.street || '',
        city: shippingAddress?.city || '',
        state: shippingAddress?.state || '',
        zipCode: shippingAddress?.zip || '',
        country: 'USA',
        status: 'paid', // PayPal already captured payment
        fulfillmentStatus: 'pending',
        paymentMethod: 'paypal',
        paymentConfirmed: true,
        paypalOrderId,
        paypalCapturedAmount: paypalDetails.capturedAmount.toFixed(2),
        isTest: isPayPalSandbox(), // Mark as test order if using PayPal sandbox
        fulfillmentNotes: `PayPal Order: ${paypalOrderId}. Payer: ${paypalPayerId || 'N/A'}. Items: ${sanitizedItems.map((i: any) => `${i.name} (${i.dosage}) x${i.quantity} @ $${i.price}`).join(', ')}`,
      };

      // If user is authenticated, link order to their account
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        orderData.userId = req.user.claims.sub;
      }

      // Validate stock before creating the order (use sanitizedItems — authoritative list)
      const stockItems = sanitizedItems.map((item: any) => ({
        productId: item.productId,
        dosage: item.dosage || undefined,
        quantity: item.quantity || 1,
      }));
      const stockCheck = await storage.validateStock(stockItems);
      if (!stockCheck.valid) {
        console.warn(`[PayPal Order] Stock validation failed:`, stockCheck.errors);
        // Still create the order since PayPal payment is already captured, but log the warning
      }

      const validatedData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedData);
      
      console.log(`[PayPal Order ${order.id}] Created as PAID - PayPal ID: ${paypalOrderId}`);

      // Track promo redemption if a free BAC water unit was included
      if (hasFreeBacWater) {
        db.insert(firstOrderPromos).values({
          userId: sessionUserId,
          orderId: order.id,
          status: 'redeemed',
        }).catch((e: any) => console.error('[Promo] Failed to track redemption:', e.message));
      }
      
      // Decrement stock for all items in this order
      try {
        const stockResult = await storage.decrementStock(stockItems);
        if (!stockResult.success) {
          console.warn(`[PayPal Order ${order.id}] Stock decrement warnings:`, stockResult.errors);
        }
      } catch (stockError: any) {
        console.error(`[PayPal Order ${order.id}] Stock decrement failed:`, stockError.message);
      }
      
      // Build order items array for email — use sanitizedItems so prices are authoritative
      const orderItems = sanitizedItems.map((item: any) => ({
        name: item.name || 'Product',
        dosage: item.dosage || '',
        quantity: item.quantity || 1,
        price: parseFloat(item.price) || 0,
      }));
      
      // Use server-computed totals for email — never trust client-submitted values
      const orderSubtotal = serverSubtotal;
      const orderShipping = serverShipping;
      const orderTax = serverTax;
      const orderTaxState = shippingState || taxState || shippingAddress?.state || '';
      
      // Send confirmation email with all items, shipping, and tax info
      let emailSent = false;
      try {
        const emailResult = await sendOrderConfirmationEmail(order, undefined, orderItems, orderSubtotal, orderShipping, orderTax, orderTaxState);
        if (emailResult.success) {
          await storage.updateOrderEmailStatus(order.id, 'sent');
          emailSent = true;
          console.log(`[PayPal Order ${order.id}] Confirmation email sent to ${customerEmail}`);
        } else {
          await storage.updateOrderEmailStatus(order.id, 'failed', emailResult.error);
          console.error(`[PayPal Order ${order.id}] Email failed:`, emailResult.error);
        }
      } catch (emailError: any) {
        console.error(`[PayPal Order ${order.id}] Email error:`, emailError.message);
        await storage.updateOrderEmailStatus(order.id, 'failed', emailError.message);
      }

      // Send admin notification with all items, shipping, and tax info
      try {
        await sendAdminOrderNotificationEmail(order, undefined, orderItems, orderSubtotal, orderShipping, orderTax, orderTaxState);
        console.log(`[PayPal Order ${order.id}] Admin notification sent`);
      } catch (adminEmailError: any) {
        console.error(`[PayPal Order ${order.id}] Admin notification failed:`, adminEmailError.message);
      }

      res.status(201).json({ 
        id: order.id,
        order,
        emailSent,
        message: "Order created and payment confirmed. Confirmation email sent."
      });
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid order data" });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Public fallback: return minimal order summary by PayPal order ID.
  // The PayPal order ID is unguessable, so it acts as a possession proof.
  // Only fields shown on the order confirmation page are returned — no extra PII.
  app.get("/api/orders/by-paypal/:paypalOrderId", async (req, res) => {
    try {
      const { paypalOrderId } = req.params;
      if (!paypalOrderId || typeof paypalOrderId !== "string" || paypalOrderId.length > 64) {
        return res.status(400).json({ error: "Invalid paypalOrderId" });
      }

      const rows = await db
        .select({
          email: ordersTable.email,
          firstName: ordersTable.firstName,
          lastName: ordersTable.lastName,
          address: ordersTable.address,
          city: ordersTable.city,
          state: ordersTable.state,
          zipCode: ordersTable.zipCode,
          totalAmount: ordersTable.totalAmount,
          fulfillmentNotes: ordersTable.fulfillmentNotes,
        })
        .from(ordersTable)
        .where(eq(ordersTable.paypalOrderId, paypalOrderId))
        .limit(1);

      if (rows.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      const row = rows[0];

      // Parse items from fulfillmentNotes.
      // Stored format: "PayPal Order: {id}. Payer: {id}. Items: {name} ({dosage}) x{qty}, ..."
      const items: Array<{ name: string; dosage: string; quantity: number; price: number }> = [];
      if (row.fulfillmentNotes) {
        const itemsMatch = row.fulfillmentNotes.match(/Items: (.+)$/);
        if (itemsMatch) {
          for (const itemStr of itemsMatch[1].split(", ")) {
            const m = itemStr.match(/^(.+?) \((.+?)\) x(\d+)$/);
            if (m) {
              items.push({ name: m[1], dosage: m[2], quantity: parseInt(m[3], 10), price: 0 });
            }
          }
        }
      }

      res.json({
        paypalOrderId,
        items,
        subtotal: 0,
        shipping: 0,
        discount: 0,
        total: parseFloat(row.totalAmount || "0"),
        customerEmail: row.email || "",
        customerName: `${row.firstName || ""} ${row.lastName || ""}`.trim(),
        address: row.address || "",
        city: row.city || "",
        state: row.state || "",
        zip: row.zipCode || "",
      });
    } catch (error) {
      console.error("Error fetching order by PayPal ID:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Helper function to mark order as paid and send notifications (email + SMS)
  async function markOrderPaidAndNotify(orderId: string): Promise<{ 
    success: boolean; 
    order?: any; 
    error?: string; 
    emailSent?: boolean;
    alreadyPaid?: boolean 
  }> {
    try {
      const order = await storage.getOrder(orderId);
      if (!order) {
        return { success: false, error: "Order not found" };
      }
      
      // Idempotent: if already paid, return success but skip notifications
      if (order.status === 'paid' || order.status === 'delivered') {
        console.log(`[Order ${orderId}] Already paid - skipping notifications (idempotent)`);
        return { success: true, order, alreadyPaid: true, emailSent: false };
      }
      
      // Update order status to paid
      await storage.updateOrderStatus(orderId, 'paid');
      const updatedOrder = await storage.updateOrderFulfillment(orderId, { 
        paymentConfirmed: true
      });
      
      if (!updatedOrder) {
        return { success: false, error: "Failed to update order status" };
      }
      
      console.log(`[Order ${orderId}] Marked as paid`);
      
      // Send all notifications (email + SMS for customer and admin)
      let emailSent = false;
      try {
        const product = await storage.getProduct(updatedOrder.productId);
        const productName = product?.name || updatedOrder.productId;
        
        const notificationResults = await sendOrderNotifications({
          orderId: updatedOrder.id,
          email: updatedOrder.email,
          phone: (updatedOrder as any).phone || undefined,
          firstName: updatedOrder.firstName,
          lastName: updatedOrder.lastName,
          productId: updatedOrder.productId,
          productName,
          quantity: updatedOrder.quantity,
          totalAmount: updatedOrder.totalAmount,
          address: updatedOrder.address || undefined,
          city: updatedOrder.city || undefined,
          state: updatedOrder.state || undefined,
          zipCode: updatedOrder.zipCode || undefined,
          country: updatedOrder.country || undefined,
        });
        
        emailSent = notificationResults?.customerEmail?.sent || false;
        console.log(`[Order ${orderId}] Notification results:`, JSON.stringify(notificationResults));
      } catch (notificationError) {
        console.error(`[Order ${orderId}] Notification error:`, notificationError);
      }
      
      return { success: true, order: updatedOrder, emailSent, alreadyPaid: false };
    } catch (error: any) {
      console.error(`[Order ${orderId}] Error marking as paid:`, error);
      return { success: false, error: error.message || "Unknown error" };
    }
  }

  // Payment webhook - processor-agnostic endpoint to mark order as paid
  // Protected by shared secret header (X-Webhook-Secret)
  app.post("/api/payments/webhook", async (req, res) => {
    try {
      // Validate webhook secret
      const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
      const providedSecret = req.headers['x-webhook-secret'];
      
      if (!webhookSecret) {
        console.error("[Payment Webhook] PAYMENT_WEBHOOK_SECRET not configured");
        return res.status(500).json({ error: "Webhook not configured" });
      }
      
      if (!providedSecret || providedSecret !== webhookSecret) {
        console.error("[Payment Webhook] Invalid or missing X-Webhook-Secret header");
        return res.status(401).json({ error: "Unauthorized - invalid webhook secret" });
      }
      
      const { order_id, orderId } = req.body;
      const id = order_id || orderId;
      
      if (!id) {
        console.error("[Payment Webhook] Missing order_id in request body");
        return res.status(400).json({ error: "Missing order_id in request body" });
      }
      
      console.log(`[Payment Webhook] Processing payment for order: ${id}`);
      
      const result = await markOrderPaidAndNotify(id);
      
      if (result.success) {
        const emailSent = (result as any).emailSent;
        const message = result.alreadyPaid 
          ? "Order already paid - no email sent (idempotent)"
          : emailSent 
            ? "Order marked as paid and confirmation email sent"
            : "Order marked as paid but email failed to send";
        
        res.json({ 
          success: true, 
          message,
          emailSent: emailSent,
          alreadyPaid: result.alreadyPaid,
          order: result.order 
        });
      } else {
        res.status(result.error === "Order not found" ? 404 : 500).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error: any) {
      console.error("[Payment Webhook] Unexpected error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to process payment webhook" 
      });
    }
  });


  // Return all distinct past shipping addresses for the logged-in user, most recent first.
  // Used by checkout to let returning shoppers pick a previous address from a dropdown.
  app.get("/api/orders/past-shipping-addresses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;

      let userOrders = await storage.getOrdersByUserId(userId);
      if (userOrders.length === 0 && userEmail) {
        userOrders = await storage.getOrdersByEmail(userEmail);
      }

      // Sort by most recent first (createdAt desc if available, otherwise rely on insertion order)
      const sorted = [...userOrders].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });

      // Collect distinct addresses (deduplicate by street+city+state+zip)
      const seen = new Set<string>();
      const addresses: { street: string; city: string; state: string; zip: string }[] = [];
      for (const order of sorted) {
        if (!order.address || !order.city || !order.state || !order.zipCode) continue;
        const key = `${order.address.toLowerCase()}|${order.city.toLowerCase()}|${order.state.toLowerCase()}|${order.zipCode}`;
        if (seen.has(key)) continue;
        seen.add(key);
        addresses.push({
          street: order.address,
          city: order.city,
          state: order.state,
          zip: order.zipCode,
        });
      }

      res.json(addresses);
    } catch (error) {
      console.error("Error fetching past shipping addresses:", error);
      res.status(500).json({ error: "Failed to fetch past shipping addresses" });
    }
  });

  // Return the most recent order's shipping address for the logged-in user.
  // Used by checkout to pre-fill the address form when no saved address exists.
  app.get("/api/orders/latest-shipping-address", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;

      let userOrders = await storage.getOrdersByUserId(userId);
      if (userOrders.length === 0 && userEmail) {
        userOrders = await storage.getOrdersByEmail(userEmail);
      }

      // Find the most recent order that has a non-empty shipping address
      const recent = userOrders.find(o => o.address && o.city && o.state && o.zipCode);
      if (!recent) {
        return res.json(null);
      }

      res.json({
        street: recent.address,
        city: recent.city,
        state: recent.state,
        zip: recent.zipCode,
      });
    } catch (error) {
      console.error("Error fetching latest shipping address:", error);
      res.status(500).json({ error: "Failed to fetch latest shipping address" });
    }
  });

  // Article Views — save a viewed article for the authenticated user
  app.post("/api/article-views", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { articleId } = req.body;
      if (!articleId || typeof articleId !== "string") {
        return res.status(400).json({ error: "articleId is required" });
      }
      await storage.saveArticleView(userId, articleId.slice(0, 100));
      res.json({ ok: true });
    } catch (error) {
      console.error("Error saving article view:", error);
      res.status(500).json({ error: "Failed to save article view" });
    }
  });

  // Article Views — get recent article IDs for the authenticated user
  app.get("/api/article-views/recent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = Math.min(parseInt(String(req.query.limit ?? "10"), 10) || 10, 20);
      const ids = await storage.getRecentArticleViews(userId, limit);
      res.json({ ids });
    } catch (error) {
      console.error("Error fetching recent article views:", error);
      res.status(500).json({ error: "Failed to fetch recent article views" });
    }
  });

  // Cart persistence — get saved cart for authenticated user
  app.get("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getUserCart(userId);
      res.json({ items: items ?? [] });
    } catch (error) {
      console.error("Error fetching user cart:", error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  // Cart persistence — save/update cart for authenticated user
  const CART_MAX_QTY = 20;
  app.put("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "items must be an array" });
      }
      if (items.length > 100) {
        return res.status(400).json({ error: "Cart cannot exceed 100 items" });
      }
      for (const item of items) {
        const qty = Number(item.quantity);
        if (!Number.isFinite(qty) || qty <= 0) {
          return res.status(400).json({ error: "Each item quantity must be a positive number" });
        }
      }
      const clamped = items.map((item: any) => ({
        ...item,
        quantity: Math.min(Number(item.quantity), CART_MAX_QTY),
      }));
      await storage.saveUserCart(userId, clamped);
      res.json({ ok: true });
    } catch (error) {
      console.error("Error saving user cart:", error);
      res.status(500).json({ error: "Failed to save cart" });
    }
  });

  // Cart persistence — clear saved cart for authenticated user
  app.delete("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteUserCart(userId);
      res.json({ ok: true });
    } catch (error) {
      console.error("Error clearing user cart:", error);
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Get user's orders (authenticated)
  app.get("/api/orders/my-orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      
      // Get orders by user ID or email
      let orders = await storage.getOrdersByUserId(userId);
      
      // If no orders by userId, try by email for legacy orders
      if (orders.length === 0 && userEmail) {
        orders = await storage.getOrdersByEmail(userEmail);
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get order by ID - requires authentication and ownership or admin
  app.get("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const requestingUserId = req.user?.claims?.sub;
      const requestingUser = requestingUserId ? await storage.getUser(requestingUserId) : null;
      const isAdmin = requestingUser?.isAdmin === true;
      const isOwner = order.userId && order.userId === requestingUserId;
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: "Forbidden" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Create contact submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid contact data" });
      }
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });

  // Get storage profile for a product
  app.get("/api/products/:id/storage", async (req, res) => {
    try {
      const storageProfile = await storage.getProductStorageProfile(req.params.id);
      if (!storageProfile) {
        return res.status(404).json({ error: "Storage profile not found" });
      }
      res.json(storageProfile);
    } catch (error) {
      console.error("Error fetching storage profile:", error);
      res.status(500).json({ error: "Failed to fetch storage profile" });
    }
  });

  // Get COAs for a specific product (public, non-archived only)
  app.get("/api/products/:id/coas", async (req, res) => {
    try {
      const productCoas = await storage.getCoasByProductId(req.params.id);
      res.json(productCoas.filter(c => c.publiclyVisible !== false));
    } catch (error) {
      console.error("Error fetching product COAs:", error);
      res.status(500).json({ error: "Failed to fetch product COAs" });
    }
  });

  // Get batches with COAs for a product
  app.get("/api/products/:id/batches", async (req, res) => {
    try {
      const batches = await storage.getProductBatches(req.params.id);
      
      // Enrich batches with COAs
      const batchesWithCoas = await Promise.all(batches.map(async (batch) => {
        const coas = await storage.getBatchCoas(batch.id);
        return { ...batch, coas };
      }));
      
      res.json(batchesWithCoas);
    } catch (error) {
      console.error("Error fetching product batches:", error);
      res.status(500).json({ error: "Failed to fetch product batches" });
    }
  });

  // Get all products with dosage stock information (public endpoint for bulk packs page)
  app.get("/api/products-with-stock", async (req, res) => {
    try {
      const productsWithStock = await storage.getAllProductsWithDosageStock();
      res.json(productsWithStock);
    } catch (error) {
      console.error("Error fetching products with stock:", error);
      res.status(500).json({ error: "Failed to fetch products with stock" });
    }
  });

  // Get dosage stock information for a product (public endpoint)
  app.get("/api/products/:id/dosage-stocks", async (req, res) => {
    try {
      const dosageStocks = await storage.getProductDosageStocks(req.params.id);
      res.json(dosageStocks);
    } catch (error) {
      console.error("Error fetching dosage stocks:", error);
      res.status(500).json({ error: "Failed to fetch dosage stocks" });
    }
  });

  app.post("/api/products/:id/vote", async (req, res) => {
    try {
      const { visitorId } = req.body;
      if (!visitorId) {
        return res.status(400).json({ error: "visitorId is required" });
      }
      const userId = (req as any).userId || null;
      const vote = await storage.voteForProduct(req.params.id, visitorId, userId);
      const voteCount = await storage.getVoteCountForProduct(req.params.id);
      res.json({ ...vote, count: voteCount });
    } catch (error) {
      console.error("Error voting for product:", error);
      res.status(500).json({ error: "Failed to vote" });
    }
  });

  app.delete("/api/products/:id/vote", async (req, res) => {
    try {
      const { visitorId } = req.body;
      if (!visitorId) {
        return res.status(400).json({ error: "visitorId is required" });
      }
      const userId = (req as any).userId || undefined;
      const removed = await storage.removeVote(req.params.id, visitorId, userId);
      const voteCount = await storage.getVoteCountForProduct(req.params.id);
      res.json({ removed, count: voteCount });
    } catch (error) {
      console.error("Error removing vote:", error);
      res.status(500).json({ error: "Failed to remove vote" });
    }
  });

  app.get("/api/products/:id/vote-count", async (req, res) => {
    try {
      const voteCount = await storage.getVoteCountForProduct(req.params.id);
      res.json({ count: voteCount });
    } catch (error) {
      console.error("Error fetching vote count:", error);
      res.status(500).json({ error: "Failed to fetch vote count" });
    }
  });

  app.get("/api/products/:id/vote-check", async (req, res) => {
    try {
      const visitorId = req.query.visitorId as string;
      if (!visitorId) {
        return res.status(400).json({ error: "visitorId is required" });
      }
      const userId = (req as any).userId || undefined;
      const voted = await storage.hasVoted(req.params.id, visitorId, userId);
      res.json({ voted });
    } catch (error) {
      console.error("Error checking vote:", error);
      res.status(500).json({ error: "Failed to check vote" });
    }
  });

  // Waitlist endpoints
  app.post("/api/waitlist/signup", async (req, res) => {
    try {
      const { email, source, productInterest, optsInMarketing } = req.body;
      if (!email || !source) {
        return res.status(400).json({ error: "Email and source are required" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      const existing = await storage.getWaitlistSignupByEmail(email.toLowerCase());
      if (existing) {
        if (productInterest?.length) {
          for (const pid of productInterest) {
            await storage.addProductInterest(email.toLowerCase(), pid);
          }
        }
        const totalCount = await storage.getWaitlistCount();
        return res.json({ success: true, duplicate: true, foundingMember: existing.foundingMember, foundingMemberNumber: existing.foundingMemberNumber, totalCount });
      }
      const signup = await storage.createWaitlistSignup({
        email: email.toLowerCase(),
        source,
        productInterest: productInterest || null,
        optsInMarketing: optsInMarketing ?? false,
      });
      const totalCount = await storage.getWaitlistCount();

      try {
        await storage.subscribeToNewsletter({
          email: email.toLowerCase(),
          source: source || "prelaunch_popup",
        });
      } catch (e) {
        console.error("[Waitlist] Failed to sync to newsletter subscribers:", e);
      }
      
      if (isEmailConfigured()) {
        sendPreLaunchConfirmationEmail(email.toLowerCase()).catch((err) => {
          console.error("[Waitlist] Failed to send pre-launch confirmation email:", err);
        });
      }

      res.json({ success: true, foundingMember: signup.foundingMember, foundingMemberNumber: signup.foundingMemberNumber, totalCount });
    } catch (error) {
      console.error("Error creating waitlist signup:", error);
      res.status(500).json({ error: "Failed to join waitlist" });
    }
  });

  app.get("/api/waitlist/count", async (req, res) => {
    try {
      const total = await storage.getWaitlistCount();
      const foundingMembers = await storage.getFoundingMemberCount();
      const spotsRemaining = Math.max(0, 50 - foundingMembers);
      res.json({ total, foundingMembers, spotsRemaining });
    } catch (error) {
      console.error("Error fetching waitlist count:", error);
      res.status(500).json({ error: "Failed to fetch waitlist count" });
    }
  });

  // Create affiliate application
  app.post("/api/affiliate-apply", async (req, res) => {
    try {
      const { referrerCode, referredByName, ...applicationData } = req.body;
      
      let referredByAffiliateId: string | undefined;
      if (referrerCode) {
        const referrer = await storage.getAffiliateByReferralCode(referrerCode);
        if (referrer && referrer.isActive) {
          referredByAffiliateId = referrer.id;
          console.log(`Application has upline referrer: ${referrer.fullName} (${referrerCode})`);
        }
      }
      
      const validatedData = insertAffiliateApplicationSchema.parse({
        ...applicationData,
        referredByAffiliateId,
        referredByName: referredByName || null,
      });
      console.log("New affiliate application received:", validatedData);
      
      const application = await storage.createAffiliateApplication(validatedData);
      
      res.status(201).json({ success: true, message: "Application received successfully", application });
    } catch (error) {
      console.error("Error creating affiliate application:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid application data" });
      }
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // === AFFILIATE ROUTES ===

  // Get affiliate by referral code (public - for tracking)
  app.get("/api/affiliates/by-code/:code", async (req, res) => {
    try {
      const affiliate = await storage.getAffiliateByReferralCode(req.params.code);
      if (!affiliate || !affiliate.isActive) {
        return res.status(404).json({ error: "Affiliate not found" });
      }
      res.json({ id: affiliate.id, referralCode: affiliate.referralCode });
    } catch (error) {
      console.error("Error fetching affiliate by code:", error);
      res.status(500).json({ error: "Failed to fetch affiliate" });
    }
  });

  // Get current user's affiliate profile
  app.get("/api/affiliate/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      
      let affiliate = await storage.getAffiliateByUserId(userId);
      if (!affiliate && userEmail) {
        affiliate = await storage.getAffiliateByEmail(userEmail);
        if (affiliate && !affiliate.userId) {
          await storage.updateAffiliate(affiliate.id, { userId });
        }
      }
      
      if (!affiliate) {
        return res.status(404).json({ error: "Not an affiliate" });
      }
      
      res.json(affiliate);
    } catch (error) {
      console.error("Error fetching affiliate profile:", error);
      res.status(500).json({ error: "Failed to fetch affiliate profile" });
    }
  });

  // Get affiliate dashboard stats
  app.get("/api/affiliate/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      
      let affiliate = await storage.getAffiliateByUserId(userId);
      if (!affiliate && userEmail) {
        affiliate = await storage.getAffiliateByEmail(userEmail);
      }
      
      if (!affiliate) {
        return res.status(404).json({ error: "Not an affiliate" });
      }

      const directSales = await storage.getAffiliateSalesByAffiliateId(affiliate.id);
      const teamSales = await storage.getAffiliateSalesByUplineId(affiliate.id);
      const team = await storage.getAffiliateTeam(affiliate.id);
      const payouts = await storage.getAffiliatePayoutsByAffiliateId(affiliate.id);

      const stats = {
        directSalesCount: directSales.length,
        directSalesTotal: directSales.reduce((sum, s) => sum + parseFloat(s.orderTotal), 0),
        tier1Earnings: parseFloat(affiliate.totalEarnedTier1 || "0"),
        tier2Earnings: parseFloat(affiliate.totalEarnedTier2 || "0"),
        pendingBalance: parseFloat(affiliate.pendingBalance || "0"),
        teamSize: team.length,
        teamSalesCount: teamSales.length,
        teamSalesTotal: teamSales.reduce((sum, s) => sum + parseFloat(s.orderTotal), 0),
        totalPaidOut: payouts.filter(p => p.status === 'processed').reduce((sum, p) => sum + parseFloat(p.amount), 0),
        referralCode: affiliate.referralCode,
        commissionRate: parseFloat(affiliate.commissionRate || "20"),
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching affiliate stats:", error);
      res.status(500).json({ error: "Failed to fetch affiliate stats" });
    }
  });

  // Get affiliate's direct sales
  app.get("/api/affiliate/sales", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      
      let affiliate = await storage.getAffiliateByUserId(userId);
      if (!affiliate && userEmail) {
        affiliate = await storage.getAffiliateByEmail(userEmail);
      }
      
      if (!affiliate) {
        return res.status(404).json({ error: "Not an affiliate" });
      }

      const sales = await storage.getAffiliateSalesByAffiliateId(affiliate.id);
      res.json(sales);
    } catch (error) {
      console.error("Error fetching affiliate sales:", error);
      res.status(500).json({ error: "Failed to fetch affiliate sales" });
    }
  });

  // Get affiliate's team and their sales
  app.get("/api/affiliate/team", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      
      let affiliate = await storage.getAffiliateByUserId(userId);
      if (!affiliate && userEmail) {
        affiliate = await storage.getAffiliateByEmail(userEmail);
      }
      
      if (!affiliate) {
        return res.status(404).json({ error: "Not an affiliate" });
      }

      const team = await storage.getAffiliateTeam(affiliate.id);
      const teamWithStats = await Promise.all(team.map(async (member) => {
        const memberSales = await storage.getAffiliateSalesByAffiliateId(member.id);
        return {
          id: member.id,
          fullName: member.fullName,
          email: member.email,
          referralCode: member.referralCode,
          isActive: member.isActive,
          createdAt: member.createdAt,
          salesCount: memberSales.length,
          salesTotal: memberSales.reduce((sum, s) => sum + parseFloat(s.orderTotal), 0),
          tier2EarningsFromMember: memberSales.reduce((sum, s) => sum + parseFloat(s.commissionTier2 || "0"), 0),
        };
      }));

      res.json(teamWithStats);
    } catch (error) {
      console.error("Error fetching affiliate team:", error);
      res.status(500).json({ error: "Failed to fetch affiliate team" });
    }
  });

  // Get affiliate's payout history
  app.get("/api/affiliate/payouts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      
      let affiliate = await storage.getAffiliateByUserId(userId);
      if (!affiliate && userEmail) {
        affiliate = await storage.getAffiliateByEmail(userEmail);
      }
      
      if (!affiliate) {
        return res.status(404).json({ error: "Not an affiliate" });
      }

      const payouts = await storage.getAffiliatePayoutsByAffiliateId(affiliate.id);
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching affiliate payouts:", error);
      res.status(500).json({ error: "Failed to fetch affiliate payouts" });
    }
  });

  // Get affiliate earnings over time (for chart)
  app.get("/api/affiliate/earnings-chart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      
      let affiliate = await storage.getAffiliateByUserId(userId);
      if (!affiliate && userEmail) {
        affiliate = await storage.getAffiliateByEmail(userEmail);
      }
      
      if (!affiliate) {
        return res.status(404).json({ error: "Not an affiliate" });
      }

      const weeks = parseInt(req.query.weeks as string) || 12;
      const earnings = await storage.getAffiliateEarningsOverTime(affiliate.id, weeks);
      res.json(earnings);
    } catch (error) {
      console.error("Error fetching affiliate earnings chart:", error);
      res.status(500).json({ error: "Failed to fetch earnings data" });
    }
  });

  // Get affiliate leaderboard (public for gamification)
  app.get("/api/affiliate/leaderboard", async (req, res) => {
    try {
      const period = (req.query.period as string) === 'weekly' ? 'weekly' : 'monthly';
      const leaderboard = await storage.getAffiliateLeaderboard(period);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching affiliate leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Update affiliate payout settings
  app.patch("/api/affiliate/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      
      let affiliate = await storage.getAffiliateByUserId(userId);
      if (!affiliate && userEmail) {
        affiliate = await storage.getAffiliateByEmail(userEmail);
      }
      
      if (!affiliate) {
        return res.status(404).json({ error: "Not an affiliate" });
      }

      const { 
        payoutMethod, 
        payoutEmail, 
        venmoUsername, 
        bankAccountHolder, 
        bankRoutingNumber, 
        bankAccountNumber 
      } = req.body;
      
      const updateData: Record<string, string | undefined> = { payoutMethod };
      
      if (payoutMethod === "paypal") {
        updateData.payoutEmail = payoutEmail;
      } else if (payoutMethod === "venmo") {
        updateData.venmoUsername = venmoUsername;
      } else if (payoutMethod === "bank") {
        updateData.bankAccountHolder = bankAccountHolder;
        updateData.bankRoutingNumber = bankRoutingNumber;
        updateData.bankAccountNumber = bankAccountNumber;
      }
      
      const updated = await storage.updateAffiliate(affiliate.id, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating affiliate settings:", error);
      res.status(500).json({ error: "Failed to update affiliate settings" });
    }
  });

  // Request payout (affiliate requests their pending balance)
  app.post("/api/affiliate/request-payout", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      
      let affiliate = await storage.getAffiliateByUserId(userId);
      if (!affiliate && userEmail) {
        affiliate = await storage.getAffiliateByEmail(userEmail);
      }
      
      if (!affiliate) {
        return res.status(404).json({ error: "Not an affiliate" });
      }

      const pendingBalance = parseFloat(affiliate.pendingBalance || "0");
      const minimumPayout = 100;

      if (pendingBalance < minimumPayout) {
        return res.status(400).json({ error: `Minimum payout is $${minimumPayout}. Your current balance is $${pendingBalance.toFixed(2)}` });
      }

      const payoutMethod = affiliate.payoutMethod || "paypal";
      let payoutInfo = "";
      
      if (payoutMethod === "paypal") {
        if (!affiliate.payoutEmail) {
          return res.status(400).json({ error: "Please set your PayPal email first" });
        }
        payoutInfo = affiliate.payoutEmail;
      } else if (payoutMethod === "venmo") {
        if (!affiliate.venmoUsername) {
          return res.status(400).json({ error: "Please set your Venmo username first" });
        }
        payoutInfo = affiliate.venmoUsername;
      } else if (payoutMethod === "bank") {
        if (!affiliate.bankAccountHolder || !affiliate.bankRoutingNumber || !affiliate.bankAccountNumber) {
          return res.status(400).json({ error: "Please complete your bank account details first" });
        }
        payoutInfo = `ACH - ${affiliate.bankAccountHolder}`;
      }

      const payout = await storage.createAffiliatePayout({
        affiliateId: affiliate.id,
        amount: pendingBalance.toString(),
        payoutMethod: payoutMethod,
        payoutEmail: payoutInfo,
        status: "pending",
      });

      res.status(201).json({ success: true, payout });
    } catch (error) {
      console.error("Error requesting payout:", error);
      res.status(500).json({ error: "Failed to request payout" });
    }
  });

  // === STRIPE ROUTES ===

  // Get Stripe config
  app.get("/api/stripe/config", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error getting Stripe config:", error);
      res.status(500).json({ error: "Failed to get Stripe configuration" });
    }
  });

  // Create Stripe checkout session
  app.post("/api/stripe/create-checkout-session", async (req, res) => {
    // Early Access Mode - block purchases during soft launch
    const EARLY_ACCESS_MODE = process.env.EARLY_ACCESS_MODE !== 'false'; // Default to true
    if (EARLY_ACCESS_MODE) {
      return res.status(503).json({ 
        error: "Coming Soon! Purchasing will be enabled at launch.",
        earlyAccess: true 
      });
    }
    
    try {
      const { productId, quantity, subscription, interval, affiliateCode } = req.body;

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const stripe = await getUncachableStripeClient();
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : `http://localhost:${process.env.PORT || 5000}`;

      let unitAmount = Math.round(parseFloat(product.price) * 100);
      
      if (subscription) {
        const discounts: { [key: string]: number } = {
          weekly: 15,
          biweekly: 12,
          monthly: 10,
        };
        const discountPercent = discounts[interval] || 10;
        unitAmount = Math.round(unitAmount * (1 - discountPercent / 100));
      }

      const metadata: any = {
        productId: product.id,
        productName: product.name,
        quantity: quantity.toString(),
      };

      if (affiliateCode) {
        const affiliate = await storage.getAffiliateByReferralCode(affiliateCode);
        if (affiliate && affiliate.isActive) {
          metadata.affiliateId = affiliate.id;
          metadata.affiliateCode = affiliateCode;
          if (affiliate.uplineId) {
            metadata.uplineId = affiliate.uplineId;
          }
        }
      }

      const sessionParams: any = {
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: product.name,
                description: product.shortDescription || product.description.slice(0, 100),
              },
              unit_amount: unitAmount,
            },
            quantity,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout?productId=${productId}&quantity=${quantity}`,
        metadata,
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU'],
        },
      };

      const session = await stripe.checkout.sessions.create(sessionParams);

      res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Verify checkout session and create order
  app.get("/api/stripe/checkout-session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const stripe = await getUncachableStripeClient();

      const existingOrder = await storage.getOrderByStripeSessionId(sessionId);
      if (existingOrder) {
        const token = createConfirmToken(existingOrder.id, existingOrder.totalAmount, existingOrder.status ?? 'paid');
        return res.json({ confirmToken: token, alreadyProcessed: true });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: "Payment not completed" });
      }

      const shippingDetails = (session as any).shipping_details || (session as any).shipping;
      const customerDetails = session.customer_details;
      const metadata = session.metadata || {};

      const order = await storage.createOrder({
        email: customerDetails?.email || '',
        firstName: shippingDetails?.name?.split(' ')[0] || customerDetails?.name?.split(' ')[0] || '',
        lastName: shippingDetails?.name?.split(' ').slice(1).join(' ') || customerDetails?.name?.split(' ').slice(1).join(' ') || '',
        address: shippingDetails?.address?.line1 || '',
        city: shippingDetails?.address?.city || '',
        state: shippingDetails?.address?.state || '',
        zipCode: shippingDetails?.address?.postal_code || '',
        country: shippingDetails?.address?.country || 'US',
        productId: metadata.productId || '',
        quantity: parseInt(metadata.quantity || '1'),
        totalAmount: ((session.amount_total || 0) / 100).toFixed(2),
        status: 'paid',
        stripeSessionId: sessionId,
        stripePaymentIntentId: session.payment_intent as string || null,
      });

      if (metadata.affiliateId) {
        const orderTotal = parseFloat(order.totalAmount);
        const tier1Commission = orderTotal * TIER1_COMMISSION_RATE;
        let tier2Commission = 0;

        if (metadata.uplineId) {
          tier2Commission = orderTotal * TIER2_COMMISSION_RATE;
        }

        await storage.createAffiliateSale({
          affiliateId: metadata.affiliateId,
          uplineId: metadata.uplineId || null,
          orderId: order.id,
          orderTotal: orderTotal.toFixed(2),
          commissionTier1: tier1Commission.toFixed(2),
          commissionTier2: tier2Commission.toFixed(2),
          tier1Status: 'pending',
          tier2Status: metadata.uplineId ? 'pending' : 'pending',
        });

        await storage.updateAffiliateEarnings(
          metadata.affiliateId,
          tier1Commission,
          0,
          tier1Commission
        );

        if (metadata.uplineId) {
          await storage.updateAffiliateEarnings(
            metadata.uplineId,
            0,
            tier2Commission,
            tier2Commission
          );
        }
      }

      // Send notifications for Stripe checkout orders (created directly as 'paid')
      let notificationResults = null;
      try {
        const product = await storage.getProduct(order.productId);
        const productName = product?.name || order.productId;
        
        notificationResults = await sendOrderNotifications({
          orderId: order.id,
          email: order.email,
          phone: customerDetails?.phone || undefined,
          firstName: order.firstName,
          lastName: order.lastName,
          productId: order.productId,
          productName,
          quantity: order.quantity,
          totalAmount: order.totalAmount,
          address: order.address || undefined,
          city: order.city || undefined,
          state: order.state || undefined,
          zipCode: order.zipCode || undefined,
          country: order.country || undefined,
        });
        
        console.log(`[Order ${order.id}] Stripe checkout notifications:`, JSON.stringify(notificationResults));
      } catch (notificationError) {
        console.error(`[Order ${order.id}] Notification error:`, notificationError);
      }

      const token = createConfirmToken(order.id, order.totalAmount, order.status ?? 'paid');
      res.json({ confirmToken: token, alreadyProcessed: false });
    } catch (error) {
      console.error("Error verifying checkout session:", error);
      res.status(500).json({ error: "Failed to verify checkout session" });
    }
  });

  // Confirmation token lookup — returns minimal display data for the checkout success page.
  // The token is a short-lived random UUID issued by the Stripe session endpoint.
  // It is not guessable and expires after 15 minutes, so no auth is required.
  app.get("/api/confirm/:token", async (req, res) => {
    const payload = confirmationTokens.get(req.params.token);
    if (!payload) {
      return res.status(404).json({ error: "Confirmation token not found or expired" });
    }
    if (Date.now() > payload.expiresAt) {
      confirmationTokens.delete(req.params.token);
      return res.status(410).json({ error: "Confirmation token expired" });
    }
    res.json({ shortRef: payload.shortRef, totalAmount: payload.totalAmount, status: payload.status });
  });

  // === ADMIN ROUTES ===
  
  // Check if user is admin middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    // Get userId from session (set by /api/auth/sync)
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await storage.getUser(userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ error: "Forbidden - Admin access required" });
    }
    // Attach user to request for use in route handlers
    req.user = { claims: { sub: userId } };
    next();
  };

  // Admin: Get notification system status
  app.get("/api/admin/notifications/status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const status = getNotificationStatus();
      res.json({
        email: {
          configured: status.email,
          provider: 'Amazon SES',
          fromAddress: process.env.SES_FROM_EMAIL || 'Not configured',
          adminEmail: process.env.ADMIN_EMAIL || 'Not configured',
        },
        sms: {
          configured: status.sms,
          provider: 'Amazon SNS',
          adminPhone: process.env.ADMIN_PHONE ? 'Configured' : 'Not configured',
        },
      });
    } catch (error) {
      console.error("Error fetching notification status:", error);
      res.status(500).json({ error: "Failed to fetch notification status" });
    }
  });

  // Admin: Send test emails to preview all templates
  app.post("/api/admin/test-emails", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      const testEmail = email || process.env.ADMIN_EMAIL;
      
      if (!testEmail) {
        return res.status(400).json({ error: "No email address provided and ADMIN_EMAIL not configured" });
      }

      const results: { template: string; success: boolean; error?: string }[] = [];

      // Test Order Confirmation
      const orderResult = await sendOrderConfirmationEmail({
        id: 'test-' + Date.now(),
        email: testEmail,
        firstName: 'Test',
        lastName: 'Researcher',
        productId: 'test-product',
        quantity: 2,
        totalAmount: '149.99',
        address: '123 Research Lane',
        city: 'Science City',
        state: 'CA',
        zipCode: '90210',
        country: 'United States',
      }, 'BPC-157 5mg');
      results.push({ template: 'Order Confirmation', success: orderResult.success, error: orderResult.error });

      // Test Admin Notification
      const adminResult = await sendAdminOrderNotificationEmail({
        id: 'test-' + Date.now(),
        email: testEmail,
        firstName: 'Test',
        lastName: 'Researcher',
        productId: 'test-product',
        quantity: 2,
        totalAmount: '149.99',
        address: '123 Research Lane',
        city: 'Science City',
        state: 'CA',
        zipCode: '90210',
        country: 'United States',
        phone: '+1 (555) 123-4567',
      }, 'BPC-157 5mg');
      results.push({ template: 'Admin Notification', success: adminResult.success, error: adminResult.error });

      // Test Newsletter Welcome
      const newsletterResult = await sendNewsletterWelcomeEmail(testEmail);
      results.push({ template: 'Newsletter Welcome', success: newsletterResult.success, error: newsletterResult.error });

      const allSuccess = results.every(r => r.success);
      res.json({
        success: allSuccess,
        message: allSuccess ? `All 3 test emails sent to ${testEmail}` : 'Some emails failed to send',
        results,
        sentTo: testEmail,
      });
    } catch (error: any) {
      console.error("Error sending test emails:", error);
      res.status(500).json({ error: "Failed to send test emails", details: error.message });
    }
  });

  // Admin: Send a test order-confirmation email with a configurable mock payload
  app.post("/api/admin/test-email/order-confirmation", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const {
        to,
        firstName = "Test",
        lastName = "Researcher",
        address = "123 Research Lane",
        city = "Science City",
        state = "CA",
        zipCode = "90210",
        country = "United States",
        includeBacWater = false,
      } = req.body;

      const testEmail = to || process.env.ADMIN_EMAIL;
      if (!testEmail) {
        return res.status(400).json({ error: "No recipient address provided and ADMIN_EMAIL is not configured" });
      }

      const baseItems: { name: string; quantity: number; price: number; dosage?: string }[] = [
        { name: "BPC-157", dosage: "5mg", quantity: 2, price: 59.99 },
        { name: "TB-500", dosage: "5mg", quantity: 1, price: 49.99 },
      ];

      if (includeBacWater) {
        baseItems.push({ name: "Bacteriostatic Water 30ml", quantity: 1, price: 0 });
      }

      const subtotal = baseItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping = subtotal >= 250 ? 0 : 15;
      const tax = 0;
      const total = (subtotal + shipping + tax).toFixed(2);

      const mockOrder = {
        id: "test-" + Date.now(),
        email: testEmail,
        firstName,
        lastName,
        productId: "test-product",
        quantity: baseItems[0].quantity,
        totalAmount: total,
        address,
        city,
        state,
        zipCode,
        country,
      };

      const result = await sendOrderConfirmationEmail(
        mockOrder,
        baseItems[0].name,
        baseItems,
        subtotal,
        shipping,
        tax,
        state,
      );

      if (result.success) {
        res.json({
          success: true,
          message: `Test order confirmation email sent to ${testEmail}`,
          sentTo: testEmail,
          includedBacWater: includeBacWater,
          mockTotal: total,
        });
      } else {
        res.status(500).json({ success: false, error: result.error || "Failed to send email" });
      }
    } catch (error: any) {
      console.error("Error sending test order confirmation email:", error);
      res.status(500).json({ error: "Failed to send test email", details: error.message });
    }
  });

  // Admin: Preview order confirmation email template in the browser (no email sent)
  app.get("/api/admin/test-email/order-confirmation", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const includeBacWater = req.query.includeBacWater === "true";

      const baseItems: { name: string; quantity: number; price: number; dosage?: string }[] = [
        { name: "BPC-157", dosage: "5mg", quantity: 2, price: 59.99 },
        { name: "TB-500", dosage: "5mg", quantity: 1, price: 49.99 },
      ];

      if (includeBacWater) {
        baseItems.push({ name: "Bacteriostatic Water 30ml", quantity: 1, price: 0 });
      }

      const subtotal = baseItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping = subtotal >= 250 ? 0 : 15;
      const tax = 0;
      const total = (subtotal + shipping + tax).toFixed(2);

      const mockOrder = {
        id: "preview-" + Date.now(),
        email: "preview@example.com",
        firstName: "Test",
        lastName: "Researcher",
        productId: "test-product",
        quantity: baseItems[0].quantity,
        totalAmount: total,
        address: "123 Research Lane",
        city: "Science City",
        state: "CA",
        zipCode: "90210",
        country: "United States",
      };

      const { html } = getOrderConfirmationTemplate(
        mockOrder,
        baseItems[0].name,
        baseItems,
        subtotal,
        shipping,
        tax,
        mockOrder.state,
      );

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (error: any) {
      console.error("Error rendering order confirmation email preview:", error);
      res.status(500).json({ error: "Failed to render email preview", details: error.message });
    }
  });

  // Admin: Preview shipping notification email template
  app.get("/api/admin/test-email/shipping-notification", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const mockOrder = {
        id: "preview-" + Date.now(),
        email: "preview@example.com",
        firstName: "Test",
        lastName: "Researcher",
        address: "123 Research Lane",
        city: "Science City",
        state: "CA",
        zipCode: "90210",
        country: "United States",
      };
      const { html } = getShippedNotificationTemplate(
        mockOrder,
        "9400111899223463030478",
        "USPS",
        "May 16, 2026",
      );
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (error: any) {
      console.error("Error rendering shipping notification email preview:", error);
      res.status(500).json({ error: "Failed to render email preview", details: error.message });
    }
  });

  // Admin: Preview affiliate welcome email template
  app.get("/api/admin/test-email/affiliate-welcome", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const mockAffiliate = {
        firstName: "Jordan",
        lastName: "Researcher",
        email: "preview@example.com",
        referralCode: "JORDAN2026",
      };
      const { html } = getAffiliateWelcomeTemplate(mockAffiliate);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (error: any) {
      console.error("Error rendering affiliate welcome email preview:", error);
      res.status(500).json({ error: "Failed to render email preview", details: error.message });
    }
  });

  // Admin: Preview user invite email (no email sent)
  app.get("/api/admin/test-email/user-invite", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { html } = getInviteEmailTemplate({
        firstName: "Alex",
        email: "preview@example.com",
        inviteUrl: "https://reviveresearch.co/auth",
      });
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (error: any) {
      console.error("Error rendering user invite email preview:", error);
      res.status(500).json({ error: "Failed to render email preview", details: error.message });
    }
  });

  // Admin: Send user invite email
  app.post("/api/admin/invite-user", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { to, firstName, inviteUrl } = req.body;
      if (!to || typeof to !== "string") {
        return res.status(400).json({ error: "Recipient email is required" });
      }
      const siteUrl = process.env.SITE_URL || "https://reviveresearch.co";
      const resolvedUrl = inviteUrl || `${siteUrl}/auth`;
      const result = await sendInviteEmail({
        email: to,
        firstName: firstName || undefined,
        inviteUrl: resolvedUrl,
      });
      if (!result.success) {
        return res.status(500).json({ error: result.error || "Failed to send invite email" });
      }
      // Log to email_events
      try {
        await storage.createEmailEvent({
          type: "user_invite",
          recipientEmail: to,
          subject: "You're Invited to Revive Research",
          status: "sent",
        });
      } catch (_) {}
      res.json({ success: true, message: `Invite sent to ${to}` });
    } catch (error: any) {
      console.error("Error sending user invite email:", error);
      res.status(500).json({ error: "Failed to send invite email", details: error.message });
    }
  });

  // Admin: Get dashboard metrics
  app.get("/api/admin/dashboard", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const daysBack = parseInt(req.query.days as string) || 30;
      const metrics = await storage.getDashboardMetrics(daysBack);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  // Admin: Get all customers with stats
  app.get("/api/admin/customers", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const customers = await storage.getAllCustomersWithStats();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  // Admin: Get all orders
  app.get("/api/admin/orders", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Admin: Get order stats for KPIs
  app.get("/api/admin/orders/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const allOrders = await storage.getAllOrders();
      const ordersInRange = allOrders.filter(o => 
        o.createdAt && new Date(o.createdAt) >= startDate
      );
      
      // Paid orders only
      const paidStatuses = ['paid'];
      const paidOrders = ordersInRange.filter(o => paidStatuses.includes(o.status || ''));
      const grossRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
      const aov = paidOrders.length > 0 ? grossRevenue / paidOrders.length : 0;
      
      // Refunds (using new isRefunded flag)
      const refundedOrders = ordersInRange.filter(o => o.isRefunded);
      const refundCount = refundedOrders.length;
      const refundAmount = refundedOrders.reduce((sum, o) => 
        sum + (o.refundAmount ? parseFloat(o.refundAmount) : parseFloat(o.totalAmount)), 0);
      
      // Email failures
      const emailFailures = ordersInRange.filter(o => o.emailStatus === 'failed').length;
      
      // Needs attention items
      const emailFailedPaid = ordersInRange.filter(o => 
        paidStatuses.includes(o.status || '') && o.emailStatus === 'failed'
      );
      
      const needsAttentionCount = ordersInRange.filter(o => {
        const isPaid = paidStatuses.includes(o.status || '');
        const notDelivered = o.fulfillmentStatus !== 'delivered';
        const emailFailed = o.emailStatus === 'failed';
        const isRefunded = o.isRefunded === true;
        return (isPaid && notDelivered) || emailFailed || isRefunded;
      }).length;
      
      res.json({
        grossRevenue,
        paidOrders: paidOrders.length,
        aov,
        refundCount,
        refundAmount,
        emailFailures,
        needsAttentionCount,
        needsAttention: {
          emailFailedPaid: emailFailedPaid.length,
          total: needsAttentionCount,
          refunds: refundCount
        }
      });
    } catch (error) {
      console.error("Error fetching order stats:", error);
      res.status(500).json({ error: "Failed to fetch order stats" });
    }
  });

  // Admin: Get single order
  app.get("/api/admin/orders/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Admin: Update order status (payment status)
  app.patch("/api/admin/orders/:id/status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Admin: Update order fulfillment
  app.patch("/api/admin/orders/:id/fulfillment", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { fulfillmentStatus, fulfillmentNotes, paymentConfirmed, addressCollected, packed, trackingNumber, carrier } = req.body;
      const userId = (req.user as any)?.id || (req.user as any)?.claims?.sub;
      
      if (trackingNumber && !carrier) {
        return res.status(400).json({ error: "Carrier is required when providing a tracking number" });
      }
      if (carrier && !trackingNumber) {
        return res.status(400).json({ error: "Tracking number is required when selecting a carrier" });
      }
      
      const existingOrder = await storage.getOrder(req.params.id);
      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const isNewTracking = trackingNumber && carrier && !existingOrder.trackingNumber;
      
      const updateData: any = {
        fulfillmentNotes,
        fulfilledBy: userId,
        paymentConfirmed,
        addressCollected,
        packed,
        trackingNumber,
        carrier,
      };
      
      if (fulfillmentStatus) {
        updateData.fulfillmentStatus = fulfillmentStatus;
      } else if (isNewTracking && existingOrder.fulfillmentStatus !== 'delivered') {
        updateData.fulfillmentStatus = 'ready';
      }
      
      const order = await storage.updateOrderFulfillment(req.params.id, updateData);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      if (isNewTracking) {
        try {
          const { sendShippedNotificationEmail } = await import('./email');
          await sendShippedNotificationEmail(order, trackingNumber, carrier);
          console.log(`[Shipping] Sent shipping notification for order ${order.id} - ${carrier} ${trackingNumber}`);
        } catch (emailError) {
          console.error(`[Shipping] Failed to send shipping email for order ${order.id}:`, emailError);
        }
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error updating order fulfillment:", error);
      res.status(500).json({ error: "Failed to update order fulfillment" });
    }
  });

  // Admin: Resend order confirmation email
  app.post("/api/admin/orders/:id/resend-email", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Get product for email
      const product = await storage.getProduct(order.productId);
      
      // Send email using the correct order format
      const emailResult = await sendOrderConfirmationEmail(order, product?.name);
      
      if (emailResult.success) {
        await storage.updateOrderEmailStatus(order.id, 'sent');
        res.json({ success: true, message: "Email sent successfully" });
      } else {
        await storage.updateOrderEmailStatus(order.id, 'failed', emailResult.error);
        res.status(500).json({ success: false, error: emailResult.error || "Failed to send email" });
      }
    } catch (error: any) {
      console.error("Error resending order email:", error);
      res.status(500).json({ error: error.message || "Failed to resend email" });
    }
  });

  // Admin: Mark order as paid and send confirmation email
  app.post("/api/admin/orders/:id/mark-paid", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      console.log(`[Admin] Marking order ${orderId} as paid`);
      
      const result = await markOrderPaidAndNotify(orderId);
      
      if (result.success) {
        const emailSent = (result as any).emailSent;
        const message = result.alreadyPaid 
          ? "Order already paid - no email sent (idempotent)"
          : emailSent 
            ? "Order marked as paid and confirmation email sent"
            : "Order marked as paid but email failed to send";
        
        res.json({ 
          success: true, 
          message,
          emailSent: emailSent,
          alreadyPaid: result.alreadyPaid,
          order: result.order 
        });
      } else {
        res.status(result.error === "Order not found" ? 404 : 500).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error: any) {
      console.error("[Admin Mark Paid] Error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to mark order as paid" 
      });
    }
  });

  // Admin: Delete order
  app.delete("/api/admin/orders/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      console.log(`[Admin] Deleting order ${orderId}`);
      
      const deleted = await storage.deleteOrder(orderId);
      if (!deleted) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      console.log(`[Admin] Order ${orderId} deleted successfully`);
      res.json({ success: true, message: "Order deleted successfully" });
    } catch (error: any) {
      console.error("[Admin Delete Order] Error:", error);
      res.status(500).json({ error: error.message || "Failed to delete order" });
    }
  });

  // Admin: Create product
  app.post("/api/admin/products", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);

      // Keep the static catalog manifest in sync so CI audits can detect
      // products added through the admin panel without a running server.
      let catalogSyncWarning: string | undefined;
      try {
        const manifestPath = path.resolve(process.cwd(), "scripts", "product-catalog.json");
        let catalog: Array<{ name: string; slug: string }> = [];
        if (fs.existsSync(manifestPath)) {
          catalog = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
        }
        const alreadyPresent = catalog.some((e) => e.slug === product.slug);
        if (!alreadyPresent && product.slug) {
          catalog.push({ name: product.name, slug: product.slug });
          catalog.sort((a, b) => a.slug.localeCompare(b.slug));
          fs.writeFileSync(manifestPath, JSON.stringify(catalog, null, 2) + "\n", "utf8");
        }
      } catch (manifestErr) {
        // Non-fatal — the product was saved to the database successfully.
        // Surface a warning in the response so operators know to regenerate
        // the manifest with: node scripts/export-product-catalog.cjs
        const reason = manifestErr instanceof Error ? manifestErr.message : String(manifestErr);
        catalogSyncWarning =
          `scripts/product-catalog.json could not be updated (${reason}). ` +
          "Run: node scripts/export-product-catalog.cjs to regenerate it.";
        console.warn("[Admin Create Product] Could not update scripts/product-catalog.json:", manifestErr);
      }

      res.status(201).json(
        catalogSyncWarning ? { ...product, _catalogSyncWarning: catalogSyncWarning } : product
      );
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid product data" });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Admin: Update product
  app.patch("/api/admin/products/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      let productId = req.params.id;
      
      // Validate stripeAccentColor format if supplied
      const hexColorRe = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;
      if (
        req.body.stripeAccentColor != null &&
        req.body.stripeAccentColor !== "" &&
        !hexColorRe.test(req.body.stripeAccentColor)
      ) {
        return res.status(400).json({ error: "stripeAccentColor must be a valid hex colour (e.g. #f97316)" });
      }

      // Check if ID is a slug format (not a UUID) and resolve to actual UUID
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(productId)) {
        // This looks like a slug, try to find product by name
        const products = await storage.getAllProducts();
        const matchedProduct = products.find(p => 
          p.name.toLowerCase().replace(/\s+/g, '-') === productId.toLowerCase() ||
          p.name.toLowerCase() === productId.toLowerCase().replace(/-/g, ' ')
        );
        if (matchedProduct) {
          productId = matchedProduct.id;
        }
      }
      
      const product = await storage.updateProduct(productId, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // Admin: Delete product
  app.delete("/api/admin/products/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Admin: Get products with dosage stock information
  app.get("/api/admin/products-with-stock", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const products = await storage.getAllProductsWithDosageStock();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products with stock:", error);
      res.status(500).json({ error: "Failed to fetch products with stock" });
    }
  });

  // Admin: Get dosage stocks for a specific product
  app.get("/api/admin/products/:id/dosage-stocks", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const dosageStocks = await storage.getProductDosageStocks(req.params.id);
      res.json(dosageStocks);
    } catch (error) {
      console.error("Error fetching dosage stocks:", error);
      res.status(500).json({ error: "Failed to fetch dosage stocks" });
    }
  });

  // Admin: Sync dosage stocks for a product
  // Also detects 0 → >0 inventory transitions and fires restock notifications.
  app.post("/api/admin/products/:id/dosage-stocks", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { dosageStocks } = req.body;
      if (!Array.isArray(dosageStocks)) {
        return res.status(400).json({ error: "dosageStocks must be an array" });
      }

      // Snapshot state BEFORE sync so we can detect the 0 → >0 transition.
      // Only treat as "completely OOS" when the product already has dosage rows
      // (i.e. not a brand-new product being set up for the first time).
      const currentStocks  = await storage.getProductDosageStocks(req.params.id);
      const wasCompletelyOOS =
        currentStocks.length > 0 &&
        currentStocks.every(s => s.stockAmount === 0);

      const results = await storage.syncProductDosageStocks(req.params.id, dosageStocks);

      // Respond immediately so the admin UI isn't blocked.
      res.json(results);

      // Non-blocking restock check — runs after the HTTP response has been sent.
      const isNowInStock = results.some(r => r.stockAmount > 0);
      if (wasCompletelyOOS && isNowInStock) {
        storage.getProduct(req.params.id).then(product => {
          if (!product?.slug) return;
          console.log(`[restock] ${product.slug} went from OOS → in-stock, queuing notifications…`);
          triggerRestockNotifications(product.slug, product.name).catch(err =>
            console.error("[restock] Notification send failed:", err)
          );
        }).catch(err => console.error("[restock] getProduct failed:", err));
      }
    } catch (error) {
      console.error("Error syncing dosage stocks:", error);
      res.status(500).json({ error: "Failed to sync dosage stocks" });
    }
  });

  // Admin: Initialize dosage stocks from product settings
  app.post("/api/admin/products/:id/initialize-dosage-stocks", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const results = await storage.initializeDosageStocksFromProduct(req.params.id);
      res.json(results);
    } catch (error) {
      console.error("Error initializing dosage stocks:", error);
      res.status(500).json({ error: "Failed to initialize dosage stocks" });
    }
  });

  // Admin: Record price change (with 30-day minimum interval)
  app.post("/api/admin/products/:id/price-change", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { newPrice, reason, notes } = req.body;
      
      if (!newPrice || typeof newPrice !== 'number' || newPrice <= 0) {
        return res.status(400).json({ error: "Valid price is required" });
      }
      
      if (!reason) {
        return res.status(400).json({ error: "Price change reason is required" });
      }
      
      const result = await storage.recordPriceChange(req.params.id, newPrice, reason, notes);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      
      res.json({ success: true, priceHistory: result.priceHistory });
    } catch (error) {
      console.error("Error recording price change:", error);
      res.status(500).json({ error: "Failed to record price change" });
    }
  });

  // Admin: Set product baseline price (immutable once set)
  app.post("/api/admin/products/:id/set-baseline", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { baselinePrice, baselineCost } = req.body;
      
      if (!baselinePrice || typeof baselinePrice !== 'number' || baselinePrice <= 0) {
        return res.status(400).json({ error: "Valid baseline price is required" });
      }
      
      const product = await storage.setProductBaseline(req.params.id, baselinePrice, baselineCost);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error setting product baseline:", error);
      res.status(500).json({ error: "Failed to set product baseline" });
    }
  });

  // Admin: Get all behavioral metrics
  app.get("/api/admin/behavioral-metrics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const metrics = await storage.getAllBehavioralMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching behavioral metrics:", error);
      res.status(500).json({ error: "Failed to fetch behavioral metrics" });
    }
  });

  // Admin: Get behavioral metrics for a specific product
  app.get("/api/admin/products/:id/behavioral-metrics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const metrics = await storage.getProductBehavioralMetrics(req.params.id);
      res.json(metrics || null);
    } catch (error) {
      console.error("Error fetching product behavioral metrics:", error);
      res.status(500).json({ error: "Failed to fetch product behavioral metrics" });
    }
  });

  // Admin: Get all dosage-level behavioral metrics
  app.get("/api/admin/dosage-behavioral-metrics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const metrics = await storage.getAllDosageBehavioralMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dosage behavioral metrics:", error);
      res.status(500).json({ error: "Failed to fetch dosage behavioral metrics" });
    }
  });

  // Admin: Get dosage behavioral metrics for specific product+dosage
  app.get("/api/admin/products/:productId/dosage/:dosage/behavioral-metrics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const metrics = await storage.getDosageBehavioralMetrics(req.params.productId, req.params.dosage);
      res.json(metrics || null);
    } catch (error) {
      console.error("Error fetching dosage behavioral metrics:", error);
      res.status(500).json({ error: "Failed to fetch dosage behavioral metrics" });
    }
  });

  // Admin: Set dosage baseline pricing (immutable once set)
  app.post("/api/admin/dosage-stock/:id/baseline", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { baselinePrice, baselineCost } = req.body;
      if (baselinePrice === undefined || baselinePrice <= 0) {
        return res.status(400).json({ error: "Valid baseline price is required" });
      }
      const updated = await storage.setDosageBaseline(req.params.id, baselinePrice, baselineCost);
      if (!updated) {
        return res.status(404).json({ error: "Dosage stock not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error setting dosage baseline:", error);
      res.status(500).json({ error: "Failed to set dosage baseline" });
    }
  });

  // Admin: Toggle dosage pricing suggestions enabled
  app.patch("/api/admin/dosage-stock/:id/pricing-suggestions", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { enabled } = req.body;
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: "Enabled must be a boolean" });
      }
      const updated = await storage.updateDosagePricingSuggestionsEnabled(req.params.id, enabled);
      if (!updated) {
        return res.status(404).json({ error: "Dosage stock not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating dosage pricing suggestions:", error);
      res.status(500).json({ error: "Failed to update dosage pricing suggestions" });
    }
  });

  // Admin: Update dosage stock price
  const updateDosagePriceSchema = z.object({
    price: z.coerce.number().nonnegative("Price must be non-negative")
  });
  
  app.patch("/api/admin/dosage-stock/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = updateDosagePriceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0]?.message || "Valid price is required" });
      }
      const priceString = result.data.price.toFixed(2);
      const updated = await storage.updateDosageStockPrice(req.params.id, priceString);
      if (!updated) {
        return res.status(404).json({ error: "Dosage stock not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating dosage stock price:", error);
      res.status(500).json({ error: "Failed to update dosage stock price" });
    }
  });

  // Track product view (public, no auth required)
  app.post("/api/products/:id/view", async (req, res) => {
    try {
      await storage.incrementProductView(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking product view:", error);
      res.status(500).json({ error: "Failed to track view" });
    }
  });

  // Track add to cart (public, no auth required)
  app.post("/api/cart/add-track", async (req, res) => {
    try {
      const { productId, dosage } = req.body;
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }
      await storage.incrementAddToCart(productId, dosage);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking add to cart:", error);
      res.status(500).json({ error: "Failed to track add to cart" });
    }
  });

  // Track checkout started (public, no auth required)
  app.post("/api/checkout/started-track", async (req, res) => {
    try {
      const { productId, dosage } = req.body;
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }
      await storage.incrementCheckoutStarted(productId, dosage);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking checkout started:", error);
      res.status(500).json({ error: "Failed to track checkout started" });
    }
  });

  // Admin: Get all COAs (supports ?includeArchived=true)
  app.get("/api/admin/coas", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const includeArchived = req.query.includeArchived === "true";
      const allCoas = await storage.getAllCoas(includeArchived);
      res.json(allCoas);
    } catch (error) {
      console.error("Error fetching COAs:", error);
      res.status(500).json({ error: "Failed to fetch COAs" });
    }
  });

  // Admin: AI scan a COA image and extract fields
  app.post("/api/admin/coas/scan-image", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { imageUrl } = req.body;
      if (!imageUrl || typeof imageUrl !== "string") {
        return res.status(400).json({ error: "imageUrl is required" });
      }

      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageUrl, detail: "high" },
              },
              {
                type: "text",
                text: `You are a document parser. Extract the following fields from this Certificate of Analysis (COA) lab document and return ONLY a JSON object with these exact keys (use null for any field not found):
- searchCode: the unique search/verification/report code or ID (often labeled "Search Code", "Report Number", "Certificate No", "Order #", or similar)
- batchNumber: the batch, lot, or sample number
- purity: the HPLC purity percentage (just the number and %, e.g. "99.4%")
- testDate: the test or analysis date in YYYY-MM-DD format
- expirationDate: expiration or best-before date in YYYY-MM-DD format (if present)
- labName: the testing laboratory name
- testHplcPurity: same as purity — the HPLC purity value (number and %, e.g. "99.4%")
- testMassSpec: mass spectrometry result (e.g. "Confirmed", "Pass", observed m/z value)
- testSterility: sterility test result (e.g. "Pass", "Sterile")
- testEndotoxins: endotoxin test result (e.g. "<0.5 EU/mg", "Pass")
- testAminoAcid: amino acid analysis result (e.g. "Consistent", "Pass")
- testPeptideContent: peptide content value in mg (just the number, e.g. "12.83")
- testAppearance: appearance description (e.g. "White lyophilized powder")
- testTfaContent: TFA/trifluoroacetic acid content (e.g. "<1%")
- testWaterContent: water content (e.g. "<5%")
- testSolubility: solubility result (e.g. "Freely soluble in water")

Return ONLY valid JSON, no markdown, no explanation.`,
              },
            ],
          },
        ],
        max_tokens: 800,
      });

      const raw = completion.choices[0]?.message?.content?.trim() || "{}";
      // Strip markdown fences if present
      const clean = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/, "").trim();
      let extracted: Record<string, string | null> = {};
      try {
        extracted = JSON.parse(clean);
      } catch {
        return res.status(200).json({ searchCode: null, batchNumber: null, purity: null, testDate: null, expirationDate: null, labName: null });
      }

      res.json(extracted);
    } catch (error) {
      console.error("Error scanning COA image:", error);
      res.status(500).json({ error: "Failed to scan COA image" });
    }
  });

  // Admin: Create COA (auto-creates batch record if needed)
  app.post("/api/admin/coas", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertCoaSchema.parse(req.body);
      
      if (validatedData.batchNumber) {
        const existingBatches = await storage.getProductBatches(validatedData.productId);
        const batchExists = existingBatches.some(b => b.batchNumber === validatedData.batchNumber);
        if (!batchExists) {
          await storage.createBatch({
            batchNumber: validatedData.batchNumber,
            productId: validatedData.productId,
            manufactureDate: new Date(validatedData.testDate),
            status: "released",
          });
        }
      }
      
      const coa = await storage.createCoa(validatedData);
      res.status(201).json(coa);

      // Fire-and-forget: generate PNG preview if this COA has a PDF image
      if (coa.imageUrl && !coa.previewImageUrl) {
        generateCoaPreview(coa.id, coa.imageUrl, storage).catch((err) => {
          console.warn("[coaPreview] async preview after create failed:", err?.message ?? err);
        });
      }

    } catch (error) {
      console.error("Error creating COA:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid COA data" });
      }
      res.status(500).json({ error: "Failed to create COA" });
    }
  });

  // Admin: Update COA
  app.patch("/api/admin/coas/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const coa = await storage.updateCoa(req.params.id, req.body);
      if (!coa) {
        return res.status(404).json({ error: "COA not found" });
      }
      res.json(coa);

      // Fire-and-forget: always regenerate preview when imageUrl is present,
      // including when admin replaces an existing PDF (stale preview case).
      if (coa.imageUrl) {
        generateCoaPreview(coa.id, coa.imageUrl, storage).catch((err) => {
          console.warn("[coaPreview] async preview after update failed:", err?.message ?? err);
        });
      }
    } catch (error) {
      console.error("Error updating COA:", error);
      res.status(500).json({ error: "Failed to update COA" });
    }
  });

  // Admin: Generate (or re-generate) PNG preview for a single COA
  app.post("/api/admin/coas/:id/generate-preview", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const coa = await storage.getCoa(req.params.id);
      if (!coa) {
        return res.status(404).json({ error: "COA not found" });
      }
      if (!coa.imageUrl) {
        return res.status(400).json({ error: "COA has no file — upload a PDF first" });
      }
      try {
        const previewImageUrl = await generateCoaPreview(coa.id, coa.imageUrl, storage);
        res.json({ previewImageUrl });
      } catch (previewErr) {
        const message = (previewErr as Error)?.message ?? "Preview could not be generated";
        console.error("Error generating COA preview:", message);
        return res.status(422).json({ error: message });
      }
    } catch (error) {
      console.error("Error generating COA preview:", error);
      res.status(500).json({ error: "Failed to generate COA preview" });
    }
  });

  // Admin: Bulk-generate PNG previews for all COAs that still need one
  // Uses DB-level filter (image_url IS NOT NULL AND preview_image_url IS NULL)
  // so this is a true no-op after the first successful backfill.
  app.post("/api/admin/coas/generate-previews", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = await backfillCoaPreviews(storage);
      res.json(result);
    } catch (error) {
      console.error("Error bulk-generating COA previews:", error);
      res.status(500).json({ error: "Failed to generate COA previews" });
    }
  });

  // Admin: Retry preview generation for specific COA IDs (e.g. those that failed a bulk run)
  app.post("/api/admin/coas/generate-previews/retry", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { coaIds } = req.body as { coaIds?: unknown };
      if (!Array.isArray(coaIds) || coaIds.length === 0) {
        return res.status(400).json({ error: "coaIds must be a non-empty array" });
      }
      const ids = coaIds.filter((id): id is string => typeof id === "string");
      if (ids.length === 0) {
        return res.status(400).json({ error: "coaIds must contain string values" });
      }

      const errors: Array<{ coaId: string; message: string }> = [];
      let succeeded = 0;
      let failed = 0;

      for (const id of ids) {
        const coa = await storage.getCoa(id);
        if (!coa || !coa.imageUrl) {
          failed++;
          errors.push({ coaId: id, message: coa ? "No imageUrl on this COA" : "COA not found" });
          continue;
        }
        try {
          await generateCoaPreview(coa.id, coa.imageUrl, storage);
          succeeded++;
        } catch (err) {
          failed++;
          errors.push({ coaId: id, message: (err as Error)?.message ?? String(err) });
        }
      }

      res.json({ processed: succeeded + failed, succeeded, failed, errors });
    } catch (error) {
      console.error("Error retrying COA preview generation:", error);
      res.status(500).json({ error: "Failed to retry COA preview generation" });
    }
  });

  // Admin: Archive COA
  app.patch("/api/admin/coas/:id/archive", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const coa = await storage.archiveCoa(req.params.id);
      if (!coa) {
        return res.status(404).json({ error: "COA not found" });
      }
      res.json(coa);
    } catch (error) {
      console.error("Error archiving COA:", error);
      res.status(500).json({ error: "Failed to archive COA" });
    }
  });

  // Admin: Delete COA
  app.delete("/api/admin/coas/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteCoa(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "COA not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting COA:", error);
      res.status(500).json({ error: "Failed to delete COA" });
    }
  });

  // Admin: Get recent email events
  app.get("/api/admin/email-events", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const events = await storage.getRecentEmailEvents(limit);
      res.json(events);
    } catch (error) {
      console.error("Error fetching email events:", error);
      res.status(500).json({ error: "Failed to fetch email events" });
    }
  });

  // Admin: Get email events by order ID
  app.get("/api/admin/email-events/order/:orderId", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const events = await storage.getEmailEventsByOrderId(req.params.orderId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching email events for order:", error);
      res.status(500).json({ error: "Failed to fetch email events" });
    }
  });

  // Object Storage: Get upload URL (admin only)
  app.post("/api/objects/upload", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Object Storage: Set image URL and ACL after upload (admin only)
  app.put("/api/objects/finalize", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { uploadURL } = req.body;
      if (!uploadURL) {
        return res.status(400).json({ error: "uploadURL is required" });
      }

      const userId = req.user?.claims?.sub || "admin";
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        uploadURL,
        {
          owner: userId,
          visibility: "public",
        }
      );

      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error finalizing upload:", error);
      res.status(500).json({ error: "Failed to finalize upload" });
    }
  });

  // Object Storage: Delete image (admin only)
  app.delete("/api/objects/delete", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { objectPath } = req.body;
      if (!objectPath) {
        return res.status(400).json({ error: "objectPath is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const deleted = await objectStorageService.deleteObject(objectPath);
      res.json({ success: deleted });
    } catch (error) {
      console.error("Error deleting object:", error);
      res.status(500).json({ error: "Failed to delete object" });
    }
  });

  // Object Storage: Process and upload product image (admin only)
  // Accepts base64 image data, resizes to 800x800, and uploads to object storage
  app.post("/api/objects/upload-product-image", isAuthenticated, isAdmin, express.json({ limit: "25mb" }), async (req: any, res) => {
    try {
      const { imageData, filename } = req.body;
      
      if (!imageData || typeof imageData !== "string") {
        return res.status(400).json({ error: "imageData is required (base64 encoded string)" });
      }

      // Validate data URL format (must be an image)
      if (!imageData.startsWith("data:image/")) {
        return res.status(400).json({ error: "Invalid image format. Must be a valid image data URL." });
      }

      // Extract base64 data (remove data URL prefix - handle all MIME types including svg+xml)
      const base64Data = imageData.replace(/^data:image\/[^;]+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");
      
      // Validate that we actually got some data
      if (imageBuffer.length === 0) {
        return res.status(400).json({ error: "Could not decode image data" });
      }
      
      // Validate buffer size (max 18MB after decoding)
      if (imageBuffer.length > 18 * 1024 * 1024) {
        return res.status(400).json({ error: "Image too large. Max size is 18MB." });
      }

      // Process the image (resize to 800x800)
      const processed = await processProductImage(imageBuffer);

      // Upload to object storage
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.uploadProcessedImage(
        processed.buffer,
        processed.mimeType,
        filename || "product-image.png"
      );

      // Set the ACL to public
      const userId = req.user?.claims?.sub || "admin";
      await objectStorageService.trySetObjectEntityAclPolicy(objectPath, {
        owner: userId,
        visibility: "public",
      });

      res.json({ objectPath });
    } catch (error: any) {
      console.error("Error processing and uploading image:", {
        message: error?.message,
        stack: error?.stack,
        filename: req.body?.filename,
        imageDataLength: req.body?.imageData?.length,
      });
      res.status(500).json({ 
        error: "Failed to process and upload image",
        details: error?.message || "Unknown error"
      });
    }
  });

  // Object Storage: Serve objects (public)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Object Storage: Serve public objects
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    try {
      const filePath = req.params.filePath;
      const objectStorageService = new ObjectStorageService();
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin: Get all contacts (unified Contact Us + Wholesale)
  app.get("/api/admin/contacts", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  // Admin: Update contact status (New → Read → Responded → Archived)
  app.patch("/api/admin/contacts/:id/status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const statusSchema = z.object({
        status: z.enum(["new", "read", "responded", "archived"]),
      });
      const { status } = statusSchema.parse(req.body);
      const respondedBy = (req as any).user?.email || "admin";
      
      const contact = await storage.updateContactStatus(req.params.id, status, respondedBy);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error updating contact status:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid status" });
      }
      res.status(500).json({ error: "Failed to update contact status" });
    }
  });

  // Admin: Update contact notes
  app.patch("/api/admin/contacts/:id/notes", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const notesSchema = z.object({
        notes: z.string(),
      });
      const { notes } = notesSchema.parse(req.body);
      
      const contact = await storage.updateContactNotes(req.params.id, notes);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error updating contact notes:", error);
      res.status(500).json({ error: "Failed to update contact notes" });
    }
  });

  // Admin: Delete contact
  app.delete("/api/admin/contacts/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteContact(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting contact:", error);
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  // Admin: Toggle contact test status
  app.patch("/api/admin/contacts/:id/test", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const testSchema = z.object({
        isTest: z.boolean(),
      });
      const { isTest } = testSchema.parse(req.body);
      
      const contact = await storage.updateContactTestStatus(req.params.id, isTest);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error updating contact test status:", error);
      res.status(500).json({ error: "Failed to update contact test status" });
    }
  });

  // Admin: Get new contacts count
  app.get("/api/admin/contacts/new-count", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const count = await storage.getNewContactsCount();
      res.json({ count });
    } catch (error) {
      console.error("Error getting new contacts count:", error);
      res.status(500).json({ error: "Failed to get new contacts count" });
    }
  });

  // === ADMIN AFFILIATE ROUTES ===

  // Admin: Get all affiliate applications
  app.get("/api/admin/affiliate-applications", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const applications = await storage.getAllAffiliateApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching affiliate applications:", error);
      res.status(500).json({ error: "Failed to fetch affiliate applications" });
    }
  });

  // Admin: Approve affiliate application
  app.post("/api/admin/affiliate-applications/:id/approve", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const application = await storage.getAffiliateApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const existingAffiliate = await storage.getAffiliateByEmail(application.email);
      if (existingAffiliate) {
        return res.status(400).json({ error: "Affiliate with this email already exists" });
      }

      let referralCode = generateReferralCode();
      let attempts = 0;
      while (await storage.getAffiliateByReferralCode(referralCode) && attempts < 10) {
        referralCode = generateReferralCode();
        attempts++;
      }

      const basicReferralCode = generateBasicReferralCode(application.fullName);

      const { uplineReferralCode, commissionRate } = req.body;
      let uplineId: string | undefined;

      if (uplineReferralCode) {
        const upline = await storage.getAffiliateByReferralCode(uplineReferralCode);
        if (upline) {
          uplineId = upline.id;
        }
      } else if (application.referredByAffiliateId) {
        uplineId = application.referredByAffiliateId;
        console.log(`Using application referrer as upline: ${uplineId}`);
      }

      const affiliate = await storage.createAffiliate({
        email: application.email,
        fullName: application.fullName,
        referralCode,
        basicReferralCode,
        uplineId,
        commissionRate: commissionRate || "20.00",
        payoutMethod: "paypal",
        payoutEmail: application.email,
        isActive: true,
        applicationId: application.id,
      });

      await storage.updateAffiliateApplicationStatus(req.params.id, "approved");

      // Send affiliate welcome email
      const nameParts = affiliate.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || affiliate.fullName;
      const lastName = nameParts.slice(1).join(" ") || "";
      const welcomeTemplate = getAffiliateWelcomeTemplate({
        firstName,
        lastName,
        email: affiliate.email,
        referralCode: affiliate.referralCode,
      });
      try {
        const emailResult = await sendEmail({
          to: affiliate.email,
          subject: welcomeTemplate.subject,
          html: welcomeTemplate.html,
          text: welcomeTemplate.text,
        });
        await storage.createEmailEvent({
          type: "affiliate_welcome",
          recipientEmail: affiliate.email,
          subject: welcomeTemplate.subject,
          status: emailResult.success ? "sent" : "failed",
          sesMessageId: emailResult.messageId || null,
          error: emailResult.success ? null : (emailResult.error || null),
        });
        if (!emailResult.success) {
          console.error("[Affiliate Approval] Welcome email failed:", emailResult.error);
        }
      } catch (emailError) {
        console.error("[Affiliate Approval] Error sending welcome email:", emailError);
      }

      res.status(201).json({ success: true, affiliate });
    } catch (error) {
      console.error("Error approving affiliate application:", error);
      res.status(500).json({ error: "Failed to approve application" });
    }
  });

  // Admin: Reject affiliate application
  app.post("/api/admin/affiliate-applications/:id/reject", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const application = await storage.getAffiliateApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const updated = await storage.updateAffiliateApplicationStatus(req.params.id, "rejected");
      if (!updated) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Send rejection email
      const nameParts = application.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || application.fullName;
      const rejectionTemplate = getAffiliateRejectionTemplate({
        firstName,
        email: application.email,
      });
      try {
        const emailResult = await sendEmail({
          to: application.email,
          subject: rejectionTemplate.subject,
          html: rejectionTemplate.html,
          text: rejectionTemplate.text,
        });
        await storage.createEmailEvent({
          type: "affiliate_rejected",
          recipientEmail: application.email,
          subject: rejectionTemplate.subject,
          status: emailResult.success ? "sent" : "failed",
          sesMessageId: emailResult.messageId || null,
          error: emailResult.success ? null : (emailResult.error || null),
        });
        if (!emailResult.success) {
          console.error("[Affiliate Rejection] Rejection email failed:", emailResult.error);
        }
      } catch (emailError) {
        console.error("[Affiliate Rejection] Error sending rejection email:", emailError);
      }

      res.json({ success: true, application: updated });
    } catch (error) {
      console.error("Error rejecting affiliate application:", error);
      res.status(500).json({ error: "Failed to reject application" });
    }
  });

  // Admin: Get all affiliates
  app.get("/api/admin/affiliates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allAffiliates = await storage.getAllAffiliates();
      res.json(allAffiliates);
    } catch (error) {
      console.error("Error fetching affiliates:", error);
      res.status(500).json({ error: "Failed to fetch affiliates" });
    }
  });

  // Admin: Get affiliate details with stats
  app.get("/api/admin/affiliates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const affiliate = await storage.getAffiliate(req.params.id);
      if (!affiliate) {
        return res.status(404).json({ error: "Affiliate not found" });
      }

      const directSales = await storage.getAffiliateSalesByAffiliateId(affiliate.id);
      const teamSales = await storage.getAffiliateSalesByUplineId(affiliate.id);
      const team = await storage.getAffiliateTeam(affiliate.id);
      const payouts = await storage.getAffiliatePayoutsByAffiliateId(affiliate.id);

      res.json({
        ...affiliate,
        directSalesCount: directSales.length,
        directSalesTotal: directSales.reduce((sum, s) => sum + parseFloat(s.orderTotal), 0),
        teamSize: team.length,
        teamSalesCount: teamSales.length,
        payoutsCount: payouts.length,
        totalPaidOut: payouts.filter(p => p.status === 'processed').reduce((sum, p) => sum + parseFloat(p.amount), 0),
      });
    } catch (error) {
      console.error("Error fetching affiliate details:", error);
      res.status(500).json({ error: "Failed to fetch affiliate details" });
    }
  });

  // Admin: Update affiliate
  app.patch("/api/admin/affiliates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const affiliate = await storage.updateAffiliate(req.params.id, req.body);
      if (!affiliate) {
        return res.status(404).json({ error: "Affiliate not found" });
      }
      res.json(affiliate);
    } catch (error) {
      console.error("Error updating affiliate:", error);
      res.status(500).json({ error: "Failed to update affiliate" });
    }
  });

  // Admin: Delete affiliate
  app.delete("/api/admin/affiliates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteAffiliate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Affiliate not found" });
      }
      res.json({ success: true, message: "Affiliate deleted successfully" });
    } catch (error) {
      console.error("Error deleting affiliate:", error);
      res.status(500).json({ error: "Failed to delete affiliate" });
    }
  });

  // Admin: Get all affiliate sales
  app.get("/api/admin/affiliate-sales", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const sales = await storage.getAllAffiliateSales();
      res.json(sales);
    } catch (error) {
      console.error("Error fetching affiliate sales:", error);
      res.status(500).json({ error: "Failed to fetch affiliate sales" });
    }
  });

  // Admin: Get all affiliate payouts
  app.get("/api/admin/affiliate-payouts", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const payouts = await storage.getAllAffiliatePayouts();
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching affiliate payouts:", error);
      res.status(500).json({ error: "Failed to fetch affiliate payouts" });
    }
  });

  // Admin: Process affiliate payout
  app.post("/api/admin/affiliate-payouts/:id/process", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { transactionId } = req.body;
      const payout = await storage.updateAffiliatePayoutStatus(req.params.id, "processed", transactionId);
      if (!payout) {
        return res.status(404).json({ error: "Payout not found" });
      }
      res.json({ success: true, payout });
    } catch (error) {
      console.error("Error processing payout:", error);
      res.status(500).json({ error: "Failed to process payout" });
    }
  });

  // Admin: Reject affiliate payout
  app.post("/api/admin/affiliate-payouts/:id/reject", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const payout = await storage.updateAffiliatePayoutStatus(req.params.id, "rejected");
      if (!payout) {
        return res.status(404).json({ error: "Payout not found" });
      }

      res.json({ success: true, payout });
    } catch (error) {
      console.error("Error rejecting payout:", error);
      res.status(500).json({ error: "Failed to reject payout" });
    }
  });

  // ============================================
  // BATCHES ROUTES
  // ============================================
  
  // Get all batches
  app.get("/api/batches", async (req, res) => {
    try {
      const batches = await storage.getAllBatches();
      res.json(batches);
    } catch (error) {
      console.error("Error fetching batches:", error);
      res.status(500).json({ error: "Failed to fetch batches" });
    }
  });
  
  // Get batch by batch number (for QR code lookups)
  app.get("/api/batches/lookup/:batchNumber", async (req, res) => {
    try {
      const batch = await storage.getBatchByBatchNumber(req.params.batchNumber);
      if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
      }
      
      // Get the associated COA
      const coa = await storage.getCoaByBatchNumber(req.params.batchNumber);
      
      // Get the product info
      const product = await storage.getProduct(batch.productId);
      
      res.json({ batch, coa, product });
    } catch (error) {
      console.error("Error looking up batch:", error);
      res.status(500).json({ error: "Failed to lookup batch" });
    }
  });
  
  // Get batches by product ID
  app.get("/api/batches/product/:productId", async (req, res) => {
    try {
      const batches = await storage.getBatchesByProductId(req.params.productId);
      res.json(batches);
    } catch (error) {
      console.error("Error fetching batches for product:", error);
      res.status(500).json({ error: "Failed to fetch batches" });
    }
  });
  
  // ============================================
  // PRODUCT STORAGE PROFILES ROUTES
  // ============================================
  
  // Get storage profile for a product
  app.get("/api/products/:productId/storage-profile", async (req, res) => {
    try {
      const profile = await storage.getProductStorageProfile(req.params.productId);
      if (!profile) {
        return res.status(404).json({ error: "Storage profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching storage profile:", error);
      res.status(500).json({ error: "Failed to fetch storage profile" });
    }
  });
  
  // ============================================
  // LEGAL DOCUMENTS ROUTES
  // ============================================
  
  // Get all legal documents
  app.get("/api/legal", async (req, res) => {
    try {
      const category = req.query.category as string;
      let documents;
      if (category) {
        documents = await storage.getLegalDocumentsByCategory(category);
      } else {
        documents = await storage.getAllLegalDocuments();
      }
      res.json(documents);
    } catch (error) {
      console.error("Error fetching legal documents:", error);
      res.status(500).json({ error: "Failed to fetch legal documents" });
    }
  });
  
  // Get legal document by slug
  app.get("/api/legal/:slug", async (req, res) => {
    try {
      const document = await storage.getLegalDocumentBySlug(req.params.slug);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching legal document:", error);
      res.status(500).json({ error: "Failed to fetch legal document" });
    }
  });
  
  // ============================================
  // FAQ ROUTES
  // ============================================
  
  // Get all FAQ entries
  app.get("/api/faq", async (req, res) => {
    try {
      const category = req.query.category as string;
      let entries;
      if (category) {
        entries = await storage.getFaqEntriesByCategory(category);
      } else {
        entries = await storage.getAllFaqEntries();
      }
      res.json(entries);
    } catch (error) {
      console.error("Error fetching FAQ entries:", error);
      res.status(500).json({ error: "Failed to fetch FAQ entries" });
    }
  });
  
  // ============================================
  // EDUCATION ARTICLES ROUTES
  // ============================================
  
  // Get all education articles
  app.get("/api/education", async (req, res) => {
    try {
      const category = req.query.category as string;
      let articles;
      if (category) {
        articles = await storage.getEducationArticlesByCategory(category);
      } else {
        articles = await storage.getAllEducationArticles();
      }
      res.json(articles);
    } catch (error) {
      console.error("Error fetching education articles:", error);
      res.status(500).json({ error: "Failed to fetch education articles" });
    }
  });
  
  // Get education article by slug
  app.get("/api/education/:slug", async (req, res) => {
    try {
      const article = await storage.getEducationArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching education article:", error);
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });
  
  // Get education articles by product ID
  app.get("/api/products/:id/education", async (req, res) => {
    try {
      const articles = await storage.getEducationArticlesByProductId(req.params.id);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching product education articles:", error);
      res.status(500).json({ error: "Failed to fetch education articles" });
    }
  });
  
  // ============================================
  // LAB NOTES ROUTES
  // ============================================

  app.get("/api/lab-notes", async (_req, res) => {
    try {
      const notes = await storage.getAllLabNotes();
      res.json(notes);
    } catch (error) {
      console.error("Error fetching lab notes:", error);
      res.status(500).json({ error: "Failed to fetch lab notes" });
    }
  });

  // ============================================
  // COA GLOSSARY ROUTES
  // ============================================
  
  // Get all COA glossary terms
  app.get("/api/coa-glossary", async (req, res) => {
    try {
      const terms = await storage.getAllCoaGlossaryTerms();
      res.json(terms);
    } catch (error) {
      console.error("Error fetching COA glossary terms:", error);
      res.status(500).json({ error: "Failed to fetch glossary terms" });
    }
  });
  
  // ============================================
  // COA LIBRARY SEARCH ROUTES
  // ============================================
  
  // Search COAs with filters
  app.get("/api/coa-library", async (req, res) => {
    try {
      const productId = req.query.productId as string;
      const batchNumber = req.query.batchNumber as string;
      const testType = req.query.testType as string;
      
      const coas = await storage.searchCoas({ productId, batchNumber, testType });
      res.json(coas);
    } catch (error) {
      console.error("Error searching COAs:", error);
      res.status(500).json({ error: "Failed to search COAs" });
    }
  });

  // ============================================
  // STOCK NOTIFICATION ROUTES
  // ============================================
  
  // Create a stock notification request
  app.post("/api/stock-notifications", async (req, res) => {
    try {
      const { productId, email } = req.body;
      
      if (!productId || !email) {
        return res.status(400).json({ error: "Product ID and email are required" });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      
      // Check if notification already exists
      const existing = await storage.checkExistingNotification(productId, email);
      if (existing) {
        return res.status(200).json({ 
          message: "You're already on the notification list for this product",
          alreadyExists: true
        });
      }
      
      const notification = await storage.createStockNotification({
        productId,
        email,
        status: "pending"
      });

      // Fire-and-forget: SES confirmation email (primary) + Zoho CRM add (secondary).
      // SES delivers the email directly — no merge tag dependency.
      // Zoho add is CRM-only; its autoresponder is disabled. Both are non-blocking.
      // Email is normalised to lowercase for consistent delivery.
      const normalizedEmail = email.toLowerCase();
      storage.getProductBySlug(productId).then(product => {
        const contact = {
          email:       normalizedEmail,
          productName: product?.name ?? productId,
          productUrl:  `https://reviveresearch.co/products/${productId}`,
        };
        sendRestockSignupConfirmationEmail(contact).catch(err =>
          console.error('[restock-signup] SES email failed:', err?.message ?? String(err))
        );
        addContactToRestockSignups(contact); // CRM only
      }).catch(err => {
        console.error('[restock-signup] getProductBySlug failed:', err?.message ?? String(err));
        const contact = {
          email:       normalizedEmail,
          productName: productId,
          productUrl:  `https://reviveresearch.co/products/${productId}`,
        };
        sendRestockSignupConfirmationEmail(contact).catch(e =>
          console.error('[restock-signup] SES email (fallback) failed:', e?.message ?? String(e))
        );
        addContactToRestockSignups(contact); // CRM only
      });

      res.status(201).json({ 
        message: "You're on the list — we'll email you the moment it's back in stock.",
        notification
      });
    } catch (error: any) {
      // Handle race condition: two concurrent requests can both pass the pre-check
      // and then one hits the DB unique constraint on (product_id, email).
      if (error.code === "23505") {
        return res.status(200).json({
          message: "You're already on the notification list for this product",
          alreadyExists: true
        });
      }
      console.error("Error creating stock notification:", error);
      res.status(500).json({ error: "Failed to create notification" });
    }
  });
  
  // Get all notifications (admin only)
  app.get("/api/admin/stock-notifications", isAdmin, async (req, res) => {
    try {
      const notifications = await storage.getAllStockNotifications();
      
      // Get product details for each notification
      const notificationsWithProducts = await Promise.all(
        notifications.map(async (n) => {
          const product = await storage.getProductBySlug(n.productId);
          return {
            ...n,
            productName: product?.name || n.productId
          };
        })
      );
      
      res.json(notificationsWithProducts);
    } catch (error) {
      console.error("Error fetching stock notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });
  
  // Mark notification as sent (admin only)
  app.patch("/api/admin/stock-notifications/:id/sent", isAdmin, async (req, res) => {
    try {
      const notification = await storage.markNotificationAsSent(req.params.id);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as sent:", error);
      res.status(500).json({ error: "Failed to update notification" });
    }
  });

  // Delete single notification (admin only)
  app.delete("/api/admin/stock-notifications/:id", isAdmin, async (req, res) => {
    try {
      const result = await storage.deleteStockNotification(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json({ message: "Notification deleted" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  // Delete bulk notifications (admin only)
  app.delete("/api/admin/stock-notifications", isAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No IDs provided" });
      }
      const deleted = await storage.deleteStockNotificationsBulk(ids);
      res.json({ message: `${deleted} notification(s) deleted` });
    } catch (error) {
      console.error("Error deleting notifications:", error);
      res.status(500).json({ error: "Failed to delete notifications" });
    }
  });

  // DISCOUNT CODE ROUTES
  
  // Get all discount codes (admin only)
  app.get("/api/admin/discount-codes", isAdmin, async (req, res) => {
    try {
      const codes = await storage.getAllDiscountCodes();
      res.json(codes);
    } catch (error) {
      console.error("Error fetching discount codes:", error);
      res.status(500).json({ error: "Failed to fetch discount codes" });
    }
  });

  // Create discount code (admin only)
  app.post("/api/admin/discount-codes", isAdmin, async (req, res) => {
    try {
      const { code, description, discountPercent, type, affiliateId, maxUsages, expiresAt, freeShipping } = req.body;
      
      if (!code || discountPercent === undefined || discountPercent === null || discountPercent === '') {
        return res.status(400).json({ error: "Code and discount percent are required" });
      }
      
      // Check if code already exists
      const existing = await storage.getDiscountCodeByCode(code);
      if (existing) {
        return res.status(400).json({ error: "Discount code already exists" });
      }
      
      const newCode = await storage.createDiscountCode({
        code: code.toUpperCase(),
        description: description || null,
        discountPercent: discountPercent.toString(),
        type: type || "promo",
        affiliateId: affiliateId || null,
        freeShipping: freeShipping || false,
        maxUsages: maxUsages || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      });
      
      res.status(201).json(newCode);
    } catch (error) {
      console.error("Error creating discount code:", error);
      res.status(500).json({ error: "Failed to create discount code" });
    }
  });

  // Toggle discount code active status (admin only)
  app.patch("/api/admin/discount-codes/:id/toggle", isAdmin, async (req, res) => {
    try {
      const { isActive } = req.body;
      const updated = await storage.toggleDiscountCodeActive(req.params.id, isActive);
      
      if (!updated) {
        return res.status(404).json({ error: "Discount code not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error toggling discount code:", error);
      res.status(500).json({ error: "Failed to update discount code" });
    }
  });

  // Update discount code (admin only)
  app.patch("/api/admin/discount-codes/:id", isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateDiscountCode(req.params.id, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "Discount code not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating discount code:", error);
      res.status(500).json({ error: "Failed to update discount code" });
    }
  });

  // Delete discount code (admin only)
  app.delete("/api/admin/discount-codes/:id", isAdmin, async (req, res) => {
    try {
      const result = await storage.deleteDiscountCode(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Discount code not found" });
      }
      res.json({ message: "Discount code deleted" });
    } catch (error) {
      console.error("Error deleting discount code:", error);
      res.status(500).json({ error: "Failed to delete discount code" });
    }
  });

  // Validate discount code (public - for checkout) - POST version
  app.post("/api/discount/validate", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Code is required" });
      }

      const upperCode = code.toUpperCase().trim();

      // First check if it's a basic referral code (ends with "10" and 10% discount)
      const affiliateByBasicCode = await storage.getAffiliateByBasicReferralCode(upperCode);
      if (affiliateByBasicCode && affiliateByBasicCode.isActive) {
        return res.json({
          code: upperCode,
          percentage: 10,
          type: "basic",
          affiliateId: affiliateByBasicCode.id,
        });
      }

      // Check if it's a personal code (affiliate's referralCode for 20% discount)
      const affiliateByPersonalCode = await storage.getAffiliateByReferralCode(upperCode);
      if (affiliateByPersonalCode && affiliateByPersonalCode.isActive) {
        return res.json({
          code: upperCode,
          percentage: 20,
          type: "personal",
          affiliateId: affiliateByPersonalCode.id,
        });
      }

      // Check discount codes table
      const discountCode = await storage.getDiscountCodeByCode(upperCode);
      if (discountCode) {
        if (!discountCode.isActive) {
          return res.status(400).json({ error: "This discount code is no longer active" });
        }
        if (discountCode.expiresAt && new Date(discountCode.expiresAt) < new Date()) {
          return res.status(400).json({ error: "This discount code has expired" });
        }
        if (discountCode.maxUsages && discountCode.usageCount && discountCode.usageCount >= discountCode.maxUsages) {
          return res.status(400).json({ error: "This discount code has reached its usage limit" });
        }
        return res.json({
          code: discountCode.code,
          percentage: parseFloat(discountCode.discountPercent),
          type: discountCode.type,
          freeShipping: discountCode.freeShipping || false,
        });
      }

      return res.status(404).json({ error: "Invalid discount code" });
    } catch (error) {
      console.error("Error validating discount code:", error);
      res.status(500).json({ error: "Failed to validate discount code" });
    }
  });

  // Validate discount code (public - for checkout) - GET version (legacy)
  app.get("/api/discount-codes/validate/:code", async (req, res) => {
    try {
      const code = await storage.getDiscountCodeByCode(req.params.code);
      
      if (!code) {
        return res.status(404).json({ valid: false, error: "Invalid discount code" });
      }
      
      if (!code.isActive) {
        return res.status(400).json({ valid: false, error: "This discount code is no longer active" });
      }
      
      if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
        return res.status(400).json({ valid: false, error: "This discount code has expired" });
      }
      
      if (code.maxUsages && code.usageCount && code.usageCount >= code.maxUsages) {
        return res.status(400).json({ valid: false, error: "This discount code has reached its usage limit" });
      }
      
      res.json({
        valid: true,
        code: code.code,
        discountPercent: code.discountPercent,
        type: code.type,
        freeShipping: code.freeShipping || false
      });
    } catch (error) {
      console.error("Error validating discount code:", error);
      res.status(500).json({ valid: false, error: "Failed to validate discount code" });
    }
  });

  const aiRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please wait a moment before trying again." },
  });

  // Chatbot endpoint
  app.post("/api/chat", aiRateLimit, async (req, res) => {
    try {
      const parseResult = chatRequestSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid chat request format" });
      }

      const { messages } = parseResult.data;

      // Get products for context
      const products = await storage.getAllProducts();
      const productInfo = products.map(p => 
        `- ${p.name}: $${p.price} - ${p.shortDescription} (${p.inStock ? 'In Stock' : 'Out of Stock'})`
      ).join('\n');

      const systemPrompt = `You are the Revive Assistant, the official customer support AI for Revive Research — a premium peptide research compound company built on Christian values, radical transparency, and scientific credibility. You are intimately familiar with every aspect of the website, products, and policies. You speak with authority and confidence about Revive Research because you know the business inside and out.

===== COMPANY IDENTITY =====
Revive Research specializes in premium peptide research compounds for laboratory and institutional use. The company differentiates itself through third-party lab verification, Certificates of Analysis (COA) for every batch, educational resources, and an Apple-inspired premium brand experience. The website features a dark charcoal design with neon yellow (#D4FF1F) and cyan (#21d8ff) accents.

===== CURRENT PRODUCT CATALOG =====
${productInfo}

Product Categories:
- Peptides: BPC-157 (10mg), TB-500 (5mg), GHK-Cu (50mg), MOTS-c (10mg), RR-A3 (10mg), and more
- Supplies: Bacteriostatic Water in 3mL and 10mL sizes
- Research Stacks: Pre-built bundles of complementary peptides with bundle pricing savings
- Custom Stacks: Build-your-own bundles of 2-4 peptides (no discount — the value is the AI-powered synergy analysis and research pathway insights)

===== BATCH NUMBERING SYSTEM =====
Revive Research uses a precise batch numbering format: [MfgID]-[YYMM][Cycle]

Components:
- MfgID: Manufacturer product shortcode (e.g., BC10 = BPC-157 10mg, BT5 = TB-500 5mg)
- YY: Two-digit year (e.g., 26 = 2026)
- MM: Two-digit month (e.g., 01 = January)
- Cycle: Letter indicating the production run within that month (A = first batch, B = second, etc.)

Current Manufacturer Product IDs:
| MfgID | Product | Dosage |
| BA3 | Bacteriostatic Water | 3mL |
| BA10 | Bacteriostatic Water | 10mL |
| BC10 | BPC-157 | 10mg |
| CU50 | GHK-Cu | 50mg |
| MS10 | MOTS-c | 10mg |
| RT10 | RR-A3 | 10mg |
| BT5 | TB-500 | 5mg |

Examples:
- RT10-2601A = First batch of RR-A3 10mg, January 2026
- RT10-2601B = Second batch of RR-A3 10mg, January 2026
- BC10-2602A = First batch of BPC-157 10mg, February 2026
- BA3-2601A = First batch of Bac Water 3mL, January 2026

This system allows full traceability from production to customer. Every batch number links to a corresponding COA.

===== COA VERIFICATION & QUALITY =====
- Every product batch has a Certificate of Analysis (COA) from independent third-party laboratories
- Customers can verify COAs using the COA Verifier tool on the website at /coa
- COAs show purity percentages, identity confirmation, and testing methodology
- The Quality Process page (/quality-process) explains the full testing pipeline
- Batch Archive (/batch-archive) allows browsing all historical batch records
- Revive Research does NOT self-test — all testing is done by independent labs for maximum credibility

===== SHIPPING & ORDERS =====
- Standard shipping: $${FLAT_RATE_SHIPPING} flat rate
- Free shipping on orders over $${FREE_SHIPPING_THRESHOLD}
- Processing: 24-hour standard, same-day shipping if ordered before 12:00 PM CT
- Package Warm Guide available at /package-warm for temperature-sensitive compounds
- Guest checkout available — no account required to purchase
- Payment via PayPal (one-time and subscriptions)

===== REFUND & RETURN POLICY =====
- All sales are FINAL — NO REFUNDS
- This is due to the sensitive nature of research compounds and safety/integrity requirements
- Customers agree to this policy at checkout

===== SUBSCRIPTION SYSTEM =====
- Recurring subscriptions available via PayPal for regular research supply needs
- Frequency options with specific discounts: Weekly (15% off), Bi-weekly (12% off), Monthly (10% off)
- Manage subscriptions through the user dashboard at /dashboard under the Orders tab

===== RESEARCH STACKS (BUNDLES) =====
Pre-built Research Stacks are curated bundles of complementary peptides with bundle pricing (each stack shows exact savings vs buying separately):
- Wolverine Stack: BPC-157 + TB-500 (95% synergy) — BPC-157 drives local repair via VEGF upregulation while TB-500 provides systemic healing through thymosin beta-4 actin regulation
- Glow Protocol: BPC-157 + TB-500 + GHK-Cu (90%) — 3-phase regeneration: vascular repair → tissue migration → collagen remodeling
- GH Amplifier: Ipamorelin + CJC-1295 (88%) — Ipamorelin's selective GHSR agonism paired with CJC-1295's sustained GHRH analog action for amplified pulsatile GH release
- Cognitive Edge: Semax + Selank (86%) — Gold-standard nootropic combo: Semax upregulates BDNF for cognitive enhancement while Selank modulates GABA for anxiolytic balance
- Lean Mass Protocol: CJC-1295 + Ipamorelin + MOTS-C (87%) — Dual GH secretion + mitochondrial AMPK activation for metabolic and body composition research
- Deep Sleep Formula: Epithalon + Ipamorelin (83%) — Epithalon's pineal melatonin synthesis + Ipamorelin's GH pulse during sleep amplification
- Longevity Protocol: Epithalon + GHK-Cu (84%) — Telomerase activation + DNA repair gene stimulation for cellular-level anti-aging
- Total Regen: BPC-157 + TB-500 + Ipamorelin (92%) — Local VEGF repair + systemic thymosin healing + GH/IGF-1 amplification
- Recovery+ Protocol: BPC-157 + GHK-Cu + TB-500 (82%) — Multi-vector recovery: cytoprotection + copper-peptide matrix remodeling + cell migration

===== KEY STACKING INTELLIGENCE =====
When discussing compound pairings, use these mechanistic explanations:
- BPC-157 is a "universal connector" — it pairs well with almost everything due to its VEGF-driven angiogenesis and cytoprotective mechanisms
- TB-500 + BPC-157 ("Wolverine Stack") is the most well-known peptide pairing in research — local + systemic repair coverage
- Semax + Selank is the gold-standard nootropic combination — BDNF upregulation (cognitive) + GABA modulation (anxiolytic)
- SS-31 → MOTS-c is a SEQUENTIAL pairing (order matters): SS-31 stabilizes cardiolipin in mitochondrial membranes first, then MOTS-c activates AMPK for new mitochondrial biogenesis
- Epithalon + GHK-Cu targets aging at two cellular levels: telomerase activation + DNA repair gene stimulation
- CJC-1295 + Ipamorelin: GHRH analog + GHSR agonist for synergistic pulsatile GH release
- GHK-Cu + Snap-8 for skin research: collagen remodeling from within + SNARE complex neuromuscular relaxation for expression lines
- Thymosin Alpha-1 + LL-37 for immune research: adaptive immune enhancement + antimicrobial innate defense
- AOD-9604 + 5-Amino-1MQ for metabolic research: GH fragment lipolysis + NNMT enzyme inhibition

Custom Stack Builder (at /research-stacks, "Build Custom" tab):
- Select 2-4 peptides to create a custom research bundle (no discount applied — the value is the AI synergy analysis, pathway insights, and stack detection)
- Features a Synergy Ring showing compatibility score (0-100%)
- Detects famous stack combinations with celebration badges
- Shows Body System Heatmap with biological mechanism icons (Healing, Metabolic, Cognitive, Skin, Growth, Longevity)
- Shared Pathway Detection reveals common mechanisms between selected peptides
- Save & Share: authenticated users can save custom stacks and generate shareable URLs
- Popular Stacks section shows trending community combinations

===== PEPTIDE ACADEMY =====
The Peptide Academy (/academy) is a gamified learning experience for researchers:
- 4 modules with 17 total lessons covering peptide science fundamentals
- Persona-based personalization: Beginner, Intermediate, or Advanced tracks
- XP (experience points) earned for completing lessons
- Achievement badges and milestone rewards
- Progress tracking with a personalized dashboard
- Completely free educational resource

===== RESEARCH PHASES & TITLES =====
Users progress through research phases based on activity:
Observer → Initiate → Researcher → Analyst → Specialist
Each phase unlocks based on engagement thresholds and awards corresponding titles.

===== USER DASHBOARD =====
Registered users have a tabbed dashboard at /dashboard:
- General tab: Navigation hub, quick stats, achievements, member perks
- Orders tab: Subscription management, order history, wishlist
- Settings tab: Account management, preferences

===== EDUCATIONAL RESOURCES =====
Revive Research is heavily invested in researcher education:

Educational Guides (under /guides/):
1. "Are Peptide COAs Trustworthy?" — /guides/are-peptide-coas-trustworthy
2. "How Batch Testing Works" — /guides/how-batch-testing-works
3. "What Research Use Only Actually Means" — /guides/what-research-use-only-means
4. "How to Verify Peptide Quality" — /guides/how-to-verify-peptide-quality
5. "What Peptide Purity Percentages Mean" — /guides/peptide-purity-explained
6. "Why Cheap Peptides Are Cheap" — /guides/why-cheap-peptides-are-cheap

Other Educational Pages:
- Education Center (/education) — comprehensive learning hub
- Lab Notes Blog (/lab-notes) — ongoing research articles
- Dosage Calculator (/dosage-calculator) — research calculation tool
- Buyer Checklist (/buyer-checklist) — what to look for in a supplier
- Troubleshooting Guides (/troubleshooting) — help with common research questions
- Resources Hub (/resources) — consolidated resource directory

===== TRUST & TRANSPARENCY =====
- Ethical Pricing page (/ethical-pricing) — explains pricing philosophy and cost breakdown
- Transparency page (/transparency) — full operational transparency
- Quality Process page (/quality-process) — detailed testing and sourcing pipeline
- Price History — historical price trends shown on product pages for full transparency
- "Want This" voting — anonymous product interest voting on out-of-stock items

===== AFFILIATE PROGRAM =====
Two-tier commission structure (NOT an MLM):
- Direct commission: 10% of sales from direct referrals
- Customer discount: 10% discount for referred customers
- Team override: 10% commission on sales from affiliates you recruit (second tier only)
- Total earnings cap: 20% per order (for program sustainability)
- Cookie window: 30 days for referral tracking
- Minimum payout: $100
- Payout frequency: Monthly
- Personal use discount: Approved affiliates get a private 20% discount code
- Application: Apply through /affiliate with a brief description
- No ranks, no forced purchases, no recruitment requirements — affiliates can earn without recruiting anyone

===== COMPLIANCE & LEGAL =====
- All products are for LABORATORY RESEARCH USE ONLY — not for human consumption
- Age requirement: 21+ (verified at site entry)
- Not evaluated by the FDA
- Not intended to diagnose, treat, cure, or prevent any disease
- Revive Research is NOT a compounding pharmacy (503A) or outsourcing facility (503B)
- Terms of Service: /terms-of-service
- Privacy Policy: /privacy
- Disclaimer: /disclaimer
- Legal Hub: /legal

===== CONTACT & SUPPORT =====
- Contact page: /contact with topic-specific form (Order Issue, Product Question, Shipping & Delivery, Wholesale Inquiry, Website Feedback, Other)
- FAQ page: /faq with comprehensive answers
- Support Status Widget on the site showing response times
- For order-specific questions (tracking, status), direct customers to the contact form or their dashboard

===== BLOCKED TERMINOLOGY — STRICT =====
You must NEVER use, reference, or acknowledge the following terms in any response, under any circumstances:
- GLP-1 (as a product name, category, or descriptor)
- Semaglutide, Tirzepatide, Retatrutide
- Ozempic, Wegovy, Rybelsus, Mounjaro, Zepbound
- Liraglutide, Saxenda, Victoza, Dulaglutide, Trulicity

If a user asks about any of these terms, DO NOT explain why they are blocked. DO NOT hint that products were renamed. Simply respond naturally as if you do not recognize the term — for example: "I'm not familiar with that term. Feel free to browse our full product catalog at /peptides, or I can help you find a specific compound!" Never connect these terms to any product we sell.

===== RESPONSE GUIDELINES =====
- Be friendly, confident, and knowledgeable — you know this business inside and out
- Always maintain "Research Use Only" compliance — never imply human consumption or therapeutic use
- When discussing peptides, use research-appropriate language (e.g., "research applications" not "health benefits")
- Keep responses concise but thorough — give real answers, not generic deflections
- If asked about something truly outside your knowledge (specific order details, payment issues), direct them to the contact form at /contact
- You can confidently recommend relevant pages and resources on the website
- When relevant, mention the educational guides and Academy as resources
- Enthusiastically share knowledge about the batch system, COA verification, and quality processes — these are key differentiators`;

      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request. Please try again.";
      
      res.json({ reply });
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // AI Synergy Analysis for Custom Stack Builder
  app.post("/api/ai/synergy-analysis", aiRateLimit, async (req, res) => {
    try {
      const { peptides } = req.body;
      
      if (!peptides || typeof peptides !== 'string') {
        return res.status(400).json({ error: "Peptides list is required" });
      }

      if (peptides.length > 500) {
        return res.status(400).json({ error: "Peptides list is too long" });
      }

      const peptideList = peptides.split(",").map((p: string) => p.trim());

      const systemPrompt = `You are a research scientist specializing in peptide biochemistry. Provide structured pathway analysis for research compound combinations.

CRITICAL RULES:
- ONLY describe molecular pathways, receptor interactions, and laboratory research applications
- NEVER mention human use, dosing, timing, or therapeutic applications

Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "peptidePathways": [
    {
      "name": "Peptide Name",
      "pathway": "Primary pathway/receptor it targets",
      "mechanism": "One sentence mechanism description"
    }
  ],
  "synergyBenefits": [
    "Benefit 1: Brief description of synergistic effect",
    "Benefit 2: Another synergistic benefit"
  ],
  "bestFor": ["Research Area 1", "Research Area 2", "Research Area 3"],
  "simpleExplanation": "Write 2-3 sentences in SIMPLE everyday language a non-scientist would understand. Use analogies like 'works like a repair crew' or 'acts as a messenger'. NO scientific terms, NO receptor names, NO pathway names. Think explaining to a friend.",
  "expertExplanation": "Write 2-3 sentences with DETAILED scientific terminology: specific receptor names (e.g., GHR, GHRH-R, BMP receptors), signaling cascades (e.g., JAK/STAT, MAPK/ERK, PI3K/Akt), molecular mechanisms, and pathway crosstalk. Include specific proteins and transcription factors involved.",
  "synergyScore": 85
}

The synergyScore should be 60-100 based on how complementary the compounds are (higher = more synergistic).`;

      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Provide structured pathway analysis for: ${peptides}` }
        ],
        max_tokens: 600,
        temperature: 0.5,
      });

      const rawContent = completion.choices[0]?.message?.content || "";
      
      try {
        // Try to parse as JSON
        const cleanedContent = rawContent.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleanedContent);
        
        // Validate required fields exist with correct types
        const isValid = 
          Array.isArray(parsed.peptidePathways) &&
          parsed.peptidePathways.every((p: any) => p.name && p.pathway) &&
          Array.isArray(parsed.synergyBenefits) &&
          Array.isArray(parsed.bestFor) &&
          typeof parsed.simpleExplanation === 'string' &&
          typeof parsed.expertExplanation === 'string' &&
          typeof parsed.synergyScore === 'number';

        if (isValid) {
          res.json({ analysis: parsed, structured: true });
        } else {
          // Invalid structure, return as plain text
          res.json({ 
            analysis: parsed.simpleExplanation || parsed.expertExplanation || rawContent,
            structured: false 
          });
        }
      } catch {
        // Fallback to plain text if JSON parsing fails
        res.json({ 
          analysis: rawContent,
          structured: false 
        });
      }
    } catch (error) {
      console.error("Error in synergy analysis endpoint:", error);
      res.status(500).json({ error: "Failed to generate synergy analysis" });
    }
  });

  // Dynamic pricing suggestions using AI
  app.post("/api/admin/pricing-suggestions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { 
        inventoryWeight = 1, 
        marketWeight = 1, 
        complexityWeight = 1 
      } = req.body;

      const products = await storage.getAllProducts();
      
      if (products.length === 0) {
        return res.json({ suggestions: [] });
      }

      const productData = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        currentPrice: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        inStock: p.inStock,
        stockAmount: p.stockAmount,
        featured: p.featured,
        isWeeklyDeal: p.isWeeklyDeal,
        shortDescription: p.shortDescription
      }));

      const systemPrompt = `You are a pricing optimization AI for a premium peptide research compound e-commerce store called Revive Research. Analyze the product catalog and suggest optimal pricing adjustments based on these weighted factors:

1. Market positioning (premium research compounds should be priced competitively but reflect quality) - Weight: ${marketWeight}
2. Inventory levels (low stock may warrant price increases, overstocked items may need discounts) - Weight: ${inventoryWeight}
3. Product category and complexity (more complex peptides command higher prices) - Weight: ${complexityWeight}
4. Current sale/deal status
5. Competitive positioning within the catalog

STABILITY RULES (IMPORTANT):
- ONLY suggest changes with at least 5-8% price difference from current price
- Avoid suggesting small 1-2% adjustments that are likely to change on next analysis
- Be conservative: maintain prices unless there's a strong business case for change
- Suggest "maintain" action for products that don't have clear optimization opportunities

For each product, provide:
- suggestedPrice: The optimal price (number, rounded to 2 decimals)
- percentChange: The percentage change from current price (positive = increase, negative = decrease)
- confidence: How confident you are in this suggestion (high/medium/low)
- reasoning: A brief explanation (1-2 sentences max)
- action: One of "increase", "decrease", "maintain", or "sale"

Return ONLY valid JSON in this exact format:
{
  "suggestions": [
    {
      "productId": "id",
      "productName": "name",
      "currentPrice": 49.99,
      "suggestedPrice": 54.99,
      "percentChange": 10,
      "confidence": "high",
      "reasoning": "Brief explanation",
      "action": "increase"
    }
  ],
  "marketInsights": "1-2 sentence overall market insight",
  "totalPotentialRevenue": "Estimated revenue impact if all suggestions are applied"
}`;

      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this product catalog and provide pricing suggestions using the weighted factors:\n${JSON.stringify(productData, null, 2)}` }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });

      const responseText = completion.choices[0]?.message?.content || "{}";
      
      // Parse the JSON response
      let parsedResponse;
      try {
        // Try to extract JSON from the response (in case there's extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        parsedResponse = { suggestions: [], marketInsights: "Unable to generate insights at this time.", totalPotentialRevenue: "$0" };
      }

      // Map productIds back to actual UUIDs using product names
      if (parsedResponse.suggestions && Array.isArray(parsedResponse.suggestions)) {
        const productNameToId = new Map(products.map(p => [p.name.toLowerCase(), p.id]));
        const productSlugToId = new Map(products.map(p => [
          p.name.toLowerCase().replace(/\s+/g, '-'),
          p.id
        ]));
        
        parsedResponse.suggestions = parsedResponse.suggestions.map((suggestion: any) => {
          const productName = suggestion.productName?.toLowerCase() || "";
          let actualId = productNameToId.get(productName);
          
          // Try slug format if exact name match fails
          if (!actualId) {
            const slug = productName.replace(/\s+/g, '-');
            actualId = productSlugToId.get(slug);
          }
          
          // If still no match and suggestion has a slug-like productId, try to find by that
          if (!actualId && suggestion.productId?.includes('-')) {
            actualId = productSlugToId.get(suggestion.productId.toLowerCase());
          }
          
          return {
            ...suggestion,
            productId: actualId || suggestion.productId
          };
        });
      }

      res.json(parsedResponse);
    } catch (error) {
      console.error("Error generating pricing suggestions:", error);
      res.status(500).json({ error: "Failed to generate pricing suggestions" });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email, source } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const parsed = insertNewsletterSubscriberSchema.safeParse({ 
        email, 
        source: source || "website" 
      });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      const subscriber = await storage.subscribeToNewsletter(parsed.data);

      // Push to Zoho Campaigns "Research List" via REST API (fire-and-forget).
      // Non-blocking: a Zoho error never fails the signup response.
      addContactToResearchList(parsed.data.email).catch((err) => {
        console.error("[Newsletter] Zoho push error:", err?.message ?? String(err));
      });

      res.status(201).json({ success: true, message: "Successfully subscribed to newsletter!", subscriber });
    } catch (error: any) {
      if (error.code === "23505") {
        return res.status(200).json({ success: true, message: "Email already subscribed!" });
      }
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ error: "Failed to subscribe to newsletter" });
    }
  });

  // Public unsubscribe endpoint - no auth required (accessed via email link)
  app.post("/api/newsletter/unsubscribe", async (req, res) => {
    try {
      const { email, reason } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: "Email is required" });
      }

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();
      
      // Validate and sanitize reason (optional)
      let sanitizedReason: string | undefined;
      if (reason && typeof reason === 'string') {
        sanitizedReason = reason.trim().slice(0, 100); // Limit to 100 chars
      }
      
      // Pass optional reason to storage
      const result = await storage.unsubscribeFromNewsletter(normalizedEmail, sanitizedReason);
      
      if (result) {
        console.log(`[Newsletter] Unsubscribed: ${normalizedEmail}${reason ? ` (Reason: ${reason})` : ''}`);
        res.json({ success: true, message: "Successfully unsubscribed from newsletter" });
      } else {
        // Even if email not found, return success for privacy (don't reveal if email exists)
        res.json({ success: true, message: "Successfully unsubscribed from newsletter" });
      }
    } catch (error) {
      console.error("Error unsubscribing from newsletter:", error);
      res.status(500).json({ error: "Failed to unsubscribe" });
    }
  });

  // Check subscription status (for unsubscribe page)
  app.get("/api/newsletter/status", async (req, res) => {
    try {
      const email = req.query.email as string;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const subscriber = await storage.checkNewsletterSubscription(email.toLowerCase().trim());
      
      res.json({ 
        exists: !!subscriber,
        status: subscriber?.status || null
      });
    } catch (error) {
      console.error("Error checking newsletter status:", error);
      res.status(500).json({ error: "Failed to check status" });
    }
  });

  // Get newsletter stats (admin only)
  app.get("/api/admin/newsletter/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getNewsletterStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching newsletter stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Get all newsletter subscribers (admin only)
  app.get("/api/admin/newsletter/subscribers", isAdmin, async (req, res) => {
    try {
      const subscribers = await storage.getAllNewsletterSubscribers();
      const stats = await storage.getNewsletterStats();
      
      // Group by source for simple breakdown
      const bySource = subscribers.reduce((acc, sub) => {
        const source = sub.source || "unknown";
        if (!acc[source]) acc[source] = 0;
        acc[source]++;
        return acc;
      }, {} as Record<string, number>);

      // Group unsubscribe reasons
      const unsubscribeReasons = subscribers
        .filter(s => s.status === "unsubscribed" && s.unsubscribeReason)
        .reduce((acc, sub) => {
          const reason = sub.unsubscribeReason || "No reason given";
          if (!acc[reason]) acc[reason] = 0;
          acc[reason]++;
          return acc;
        }, {} as Record<string, number>);

      res.json({
        stats,
        subscribers,
        bySource,
        unsubscribeReasons,
      });
    } catch (error) {
      console.error("Error fetching newsletter subscribers:", error);
      res.status(500).json({ error: "Failed to fetch newsletter subscribers" });
    }
  });

  // Delete a newsletter subscriber (admin only)
  app.delete("/api/admin/newsletter/subscribers/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNewsletterSubscriber(id);
      res.json({ success: true, message: "Subscriber deleted successfully" });
    } catch (error) {
      console.error("Error deleting newsletter subscriber:", error);
      res.status(500).json({ error: "Failed to delete newsletter subscriber" });
    }
  });

  // Zoho newsletter debug — admin only, synchronous, returns full diagnostic
  app.post("/api/admin/debug/zoho-newsletter", isAdmin, async (req, res) => {
    const email = (req.body?.email as string) || "debug-probe@reviveresearch.co";
    try {
      const result = await debugZohoNewsletter(email);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err?.message ?? String(err) });
    }
  });

  // Academy Progress - Get or create user's academy progress
  app.get("/api/academy/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let progress = await storage.getAcademyProgress(userId);
      
      if (!progress) {
        progress = await storage.createAcademyProgress({ userId });
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching academy progress:", error);
      res.status(500).json({ error: "Failed to fetch academy progress" });
    }
  });

  // Academy Progress - Update user's academy progress
  app.patch("/api/academy/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      let progress = await storage.getAcademyProgress(userId);
      
      if (!progress) {
        progress = await storage.createAcademyProgress({ userId, ...updateData });
      } else {
        progress = await storage.updateAcademyProgress(userId, updateData);
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error updating academy progress:", error);
      res.status(500).json({ error: "Failed to update academy progress" });
    }
  });

  // Academy Graduate Discount - Check status and claim reward
  app.get("/api/academy/graduate-reward", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getAcademyProgress(userId);
      const completedCount = progress?.completedLessons?.length || 0;
      const totalLessons = 17;
      const isGraduate = completedCount >= totalLessons;

      const existingCode = await storage.getGraduateDiscountForUser(userId);

      res.json({
        isGraduate,
        completedCount,
        totalLessons,
        discountCode: existingCode?.code || null,
        discountPercent: existingCode ? Number(existingCode.discountPercent) : 15,
        alreadyClaimed: !!existingCode,
      });
    } catch (error) {
      console.error("Error checking graduate reward:", error);
      res.status(500).json({ error: "Failed to check graduate reward" });
    }
  });

  app.post("/api/academy/claim-graduate-reward", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getAcademyProgress(userId);
      const completedCount = progress?.completedLessons?.length || 0;

      if (completedCount < 17) {
        return res.status(400).json({ error: "You must complete all 17 Academy lessons to claim this reward." });
      }

      const existing = await storage.getGraduateDiscountForUser(userId);
      if (existing) {
        return res.json({ discountCode: existing.code, discountPercent: Number(existing.discountPercent), alreadyClaimed: true });
      }

      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let randomPart = "";
      for (let i = 0; i < 6; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const codeStr = `GRAD-${randomPart}`;

      const newCode = await storage.createDiscountCode({
        code: codeStr,
        description: `Academy Graduate: ${userId}`,
        discountPercent: "15.00",
        type: "promo",
        freeShipping: false,
        isActive: true,
        maxUsages: 1,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      });

      res.json({ discountCode: newCode.code, discountPercent: Number(newCode.discountPercent), alreadyClaimed: false });
    } catch (error) {
      console.error("Error claiming graduate reward:", error);
      res.status(500).json({ error: "Failed to claim graduate reward" });
    }
  });

  // Delete user account
  app.post("/api/user/delete-account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteUser(userId);
      res.json({ success: true, message: "Your account has been deleted" });
    } catch (error) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  // Delete affiliate account
  app.post("/api/affiliate/delete-account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteAffiliate(userId);
      res.json({ success: true, message: "Your affiliate account has been deleted" });
    } catch (error) {
      console.error("Error deleting affiliate account:", error);
      res.status(500).json({ error: "Failed to delete affiliate account" });
    }
  });

  // Wishlists
  app.get("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getWishlistByUserId(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ error: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }
      const item = await storage.addToWishlist(userId, productId);
      res.json(item);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ error: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { productId } = req.params;
      await storage.removeFromWishlist(userId, productId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ error: "Failed to remove from wishlist" });
    }
  });

  app.get("/api/wishlist/check/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { productId } = req.params;
      const isInWishlist = await storage.isInWishlist(userId, productId);
      res.json({ isInWishlist });
    } catch (error) {
      console.error("Error checking wishlist:", error);
      res.status(500).json({ error: "Failed to check wishlist" });
    }
  });

  // User Research Profile - Get computed phase, title, and counts
  // Unified research profile endpoint for the account home — includes
  // isFoundingMember from the users row (not a live waitlistSignups join).
  app.get("/api/user/research-profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userRow = await storage.getUser(userId);
      let profile = await storage.getUserResearchProfile(userId);
      if (!profile) {
        profile = await storage.createOrUpdateUserResearchProfile(userId, { earlyAccessMember: true });
      }
      const orders = await storage.getOrdersByUserId(userId);
      const phase = storage.computeResearchPhase(profile);
      const title = storage.computeResearchTitle(profile);
      res.json({
        phase,
        title,
        educationCount: profile.educationCount || 0,
        safetyCompleted: profile.safetyCompleted || false,
        coaEducationViewed: profile.coaEducationViewed || false,
        batchVerificationCount: profile.batchVerificationCount || 0,
        compoundsTrackedCount: profile.compoundsTrackedCount || 0,
        earlyAccessMember: profile.earlyAccessMember || false,
        isFoundingMember: userRow?.isFoundingMember ?? false,
        orderCount: orders.length,
        completedLessons: (profile as any).completedLessons || [],
        currentModuleId: (profile as any).currentModuleId || null,
      });
    } catch (error) {
      console.error("Error fetching user research profile:", error);
      res.status(500).json({ error: "Failed to fetch research profile" });
    }
  });

  app.get("/api/research-profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get or create profile
      let profile = await storage.getUserResearchProfile(userId);
      if (!profile) {
        // Create initial profile, marking as early access if created before launch
        profile = await storage.createOrUpdateUserResearchProfile(userId, {
          earlyAccessMember: true, // All current users are early access
        });
      }
      
      // Get wishlist count for compounds tracked
      const wishlist = await storage.getWishlistByUserId(userId);
      const orders = await storage.getOrdersByUserId(userId);
      const uniqueProducts = new Set([
        ...wishlist.map(w => w.productId),
        ...orders.map(o => o.productId)
      ]);
      
      // Update compounds tracked count
      if (uniqueProducts.size !== profile.compoundsTrackedCount) {
        profile = await storage.createOrUpdateUserResearchProfile(userId, {
          compoundsTrackedCount: uniqueProducts.size
        });
      }
      
      const phase = storage.computeResearchPhase(profile);
      const title = storage.computeResearchTitle(profile);
      
      res.json({
        phase,
        title,
        educationCount: profile.educationCount || 0,
        safetyCompleted: profile.safetyCompleted || false,
        coaEducationViewed: profile.coaEducationViewed || false,
        batchVerificationCount: profile.batchVerificationCount || 0,
        compoundsTrackedCount: profile.compoundsTrackedCount || 0,
        earlyAccessMember: profile.earlyAccessMember || false,
      });
    } catch (error) {
      console.error("Error fetching research profile:", error);
      res.status(500).json({ error: "Failed to fetch research profile" });
    }
  });

  // Track education page view
  app.post("/api/research-profile/track-education", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.incrementEducationCount(userId);
      res.json({ success: true, educationCount: profile.educationCount });
    } catch (error) {
      console.error("Error tracking education:", error);
      res.status(500).json({ error: "Failed to track education" });
    }
  });

  // Mark safety education completed
  app.post("/api/research-profile/mark-safety-completed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.markSafetyCompleted(userId);
      res.json({ success: true, safetyCompleted: profile.safetyCompleted });
    } catch (error) {
      console.error("Error marking safety completed:", error);
      res.status(500).json({ error: "Failed to mark safety completed" });
    }
  });

  // Mark COA education viewed
  app.post("/api/research-profile/mark-coa-viewed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.markCoaEducationViewed(userId);
      res.json({ success: true, coaEducationViewed: profile.coaEducationViewed });
    } catch (error) {
      console.error("Error marking COA viewed:", error);
      res.status(500).json({ error: "Failed to mark COA viewed" });
    }
  });

  // Track batch verification (called when user successfully verifies a batch)
  app.post("/api/research-profile/track-verification", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.incrementBatchVerificationCount(userId);
      res.json({ success: true, batchVerificationCount: profile.batchVerificationCount });
    } catch (error) {
      console.error("Error tracking verification:", error);
      res.status(500).json({ error: "Failed to track verification" });
    }
  });

  // ============== SAVED ADDRESSES ==============
  app.get("/api/addresses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const addresses = await storage.getSavedAddresses(userId);
      res.json(addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      res.status(500).json({ error: "Failed to fetch addresses" });
    }
  });

  app.post("/api/addresses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const address = await storage.createSavedAddress({ ...req.body, userId });
      res.json(address);
    } catch (error) {
      console.error("Error creating address:", error);
      res.status(500).json({ error: "Failed to create address" });
    }
  });

  app.patch("/api/addresses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const address = await storage.updateSavedAddress(id, req.body);
      if (!address) {
        return res.status(404).json({ error: "Address not found" });
      }
      res.json(address);
    } catch (error) {
      console.error("Error updating address:", error);
      res.status(500).json({ error: "Failed to update address" });
    }
  });

  app.delete("/api/addresses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSavedAddress(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting address:", error);
      res.status(500).json({ error: "Failed to delete address" });
    }
  });

  app.post("/api/addresses/:id/default", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const address = await storage.setDefaultAddress(userId, id);
      res.json(address);
    } catch (error) {
      console.error("Error setting default address:", error);
      res.status(500).json({ error: "Failed to set default address" });
    }
  });

  // ============== NOTIFICATION PREFERENCES ==============
  app.get("/api/notification-preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let prefs = await storage.getNotificationPreferences(userId);
      if (!prefs) {
        prefs = await storage.createOrUpdateNotificationPreferences(userId, {});
      }
      res.json(prefs);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ error: "Failed to fetch notification preferences" });
    }
  });

  app.patch("/api/notification-preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("Updating notification preferences for user:", userId, "with data:", req.body);
      const prefs = await storage.createOrUpdateNotificationPreferences(userId, req.body);
      console.log("Updated notification preferences result:", prefs);
      res.json(prefs);
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ error: "Failed to update notification preferences" });
    }
  });

  // ============== PASSWORD CHANGE ==============
  app.post("/api/change-password", isAuthenticated, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }
      // Note: This app uses Replit Auth (OIDC), so password changes are handled by the identity provider
      // This endpoint validates the request format but returns a success message
      res.json({ success: true, message: "Password change request received" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // ============== RESEARCH NOTES ==============
  app.get("/api/research-notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notes = await storage.getResearchNotes(userId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching research notes:", error);
      res.status(500).json({ error: "Failed to fetch research notes" });
    }
  });

  app.post("/api/research-notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const note = await storage.createResearchNote({ ...req.body, userId });
      res.json(note);
    } catch (error) {
      console.error("Error creating research note:", error);
      res.status(500).json({ error: "Failed to create research note" });
    }
  });

  app.patch("/api/research-notes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      // Strip userId from any incoming payload — ownership is server-side.
      const { userId: _ignored, id: _ignoredId, ...payload } = req.body || {};
      const note = await storage.updateResearchNoteForUser(id, userId, payload);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      console.error("Error updating research note:", error);
      res.status(500).json({ error: "Failed to update research note" });
    }
  });

  app.delete("/api/research-notes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const ok = await storage.deleteResearchNoteForUser(id, userId);
      if (!ok) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting research note:", error);
      res.status(500).json({ error: "Failed to delete research note" });
    }
  });

  app.post("/api/research-notes/:id/toggle-pin", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const existing = await storage.getResearchNote(id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Note not found" });
      }
      const note = await storage.toggleResearchNotePin(id);
      res.json(note);
    } catch (error) {
      console.error("Error toggling pin:", error);
      res.status(500).json({ error: "Failed to toggle pin" });
    }
  });

  // ============== LOGBOOK (auth-gated personal research log) ==============
  // Backed by the same researchNotes table; all routes scope strictly to the
  // authenticated user. Ownership is verified server-side; clients cannot
  // override userId via request body.
  const parseDateOrUndefined = (
    raw: unknown,
    bound: "start" | "end" = "start",
  ): Date | undefined => {
    if (typeof raw !== "string" || !raw) return undefined;
    // Bare "YYYY-MM-DD" → expand to start or end of day so date-only ranges
    // remain inclusive on both ends regardless of how the client built it.
    let value = raw;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      value = bound === "end" ? `${raw}T23:59:59.999Z` : `${raw}T00:00:00.000Z`;
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  };

  const parseIntInRange = (
    raw: unknown,
    min: number,
    max: number,
  ): number | undefined => {
    if (typeof raw !== "string" || !raw) return undefined;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || n < min || n > max) return undefined;
    return n;
  };

  const parseLogbookFilters = (q: any) => ({
    from: parseDateOrUndefined(q.from, "start"),
    to: parseDateOrUndefined(q.to, "end"),
    productId:
      typeof q.productId === "string" && q.productId ? q.productId : undefined,
    customCompound:
      typeof q.customCompound === "string" && q.customCompound.trim()
        ? q.customCompound.trim().slice(0, 120)
        : undefined,
    hasObservation:
      q.hasObservation === "true" || q.hasObservation === "1"
        ? true
        : undefined,
    minSleep: parseIntInRange(q.minSleep, 1, 10),
    minEnergy: parseIntInRange(q.minEnergy, 1, 10),
    minMood: parseIntInRange(q.minMood, 1, 10),
  });

  app.get("/api/logbook", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entries = await storage.getLogbookEntries(
        userId,
        parseLogbookFilters(req.query),
      );
      res.json(entries);
    } catch (error) {
      console.error("Error fetching logbook entries:", error);
      res.status(500).json({ error: "Failed to fetch logbook entries" });
    }
  });

  // Helper: ensure the source:logbook discriminator tag is present so
  // wipe/list operations can target only entries created via the logbook
  // API and never touch pre-existing /api/research-notes journal notes.
  const withLogbookSourceTag = (
    tags: string[] | null | undefined,
  ): string[] => {
    const base = Array.isArray(tags) ? tags.filter((t) => typeof t === "string") : [];
    return base.includes(LOGBOOK_SOURCE_TAG) ? base : [LOGBOOK_SOURCE_TAG, ...base];
  };

  app.post("/api/logbook", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // userId is bound from session; never trust the body.
      const { userId: _ignored, id: _ignoredId, ...payload } = req.body || {};
      const parsed = insertResearchNoteSchema.safeParse({ ...payload, userId });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid logbook entry", details: parsed.error.flatten() });
      }
      const entry = await storage.createResearchNote({
        ...parsed.data,
        tags: withLogbookSourceTag(parsed.data.tags),
      });
      res.json(entry);
    } catch (error) {
      console.error("Error creating logbook entry:", error);
      res.status(500).json({ error: "Failed to create logbook entry" });
    }
  });

  // Guard for PATCH/DELETE-by-id: load the row, confirm it belongs to the
  // caller AND carries the source:logbook discriminator. Returns the row
  // on success or null when the caller has no business touching it. We
  // return null (the route maps to 404) for both "not found" and "wrong
  // owner / not a logbook entry" so this endpoint can never confirm or
  // mutate a non-logbook row by id.
  const loadOwnedLogbookEntry = async (
    id: string,
    userId: string,
  ): Promise<ResearchNote | null> => {
    const note = await storage.getResearchNote(id);
    if (!note) return null;
    if (note.userId !== userId) return null;
    if (!Array.isArray(note.tags) || !note.tags.includes(LOGBOOK_SOURCE_TAG)) return null;
    return note;
  };

  app.patch("/api/logbook/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const existing = await loadOwnedLogbookEntry(id, userId);
      if (!existing) {
        return res.status(404).json({ error: "Entry not found" });
      }
      const { userId: _ignored, id: _ignoredId, ...payload } = req.body || {};
      // partial() so PATCH only validates supplied fields.
      const parsed = insertResearchNoteSchema.partial().safeParse(payload);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid logbook entry", details: parsed.error.flatten() });
      }
      // If the client sends a `tags` array (even an empty one), preserve
      // the source:logbook discriminator so the row remains identifiable.
      const update =
        parsed.data.tags !== undefined
          ? { ...parsed.data, tags: withLogbookSourceTag(parsed.data.tags) }
          : parsed.data;
      const entry = await storage.updateResearchNoteForUser(id, userId, update);
      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error updating logbook entry:", error);
      res.status(500).json({ error: "Failed to update logbook entry" });
    }
  });

  app.delete("/api/logbook/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const existing = await loadOwnedLogbookEntry(id, userId);
      if (!existing) {
        return res.status(404).json({ error: "Entry not found" });
      }
      const ok = await storage.deleteResearchNoteForUser(id, userId);
      if (!ok) {
        return res.status(404).json({ error: "Entry not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting logbook entry:", error);
      res.status(500).json({ error: "Failed to delete logbook entry" });
    }
  });

  app.delete("/api/logbook", isAuthenticated, async (req: any, res) => {
    try {
      // Require an explicit confirmation header so a stray DELETE on the
      // collection cannot wipe the entire logbook by accident.
      const confirm = req.header("X-Confirm-Wipe");
      if (confirm !== "true") {
        return res.status(400).json({
          error: "Confirmation header required",
          message: "Send X-Confirm-Wipe: true to delete all logbook entries.",
        });
      }
      const userId = req.user.claims.sub;
      const deleted = await storage.wipeLogbookEntries(userId);
      res.json({ success: true, deleted });
    } catch (error) {
      console.error("Error wiping logbook:", error);
      res.status(500).json({ error: "Failed to wipe logbook" });
    }
  });

  app.get("/api/logbook/export.csv", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entries = await storage.getLogbookEntries(
        userId,
        parseLogbookFilters(req.query),
      );

      const escapeCsv = (val: unknown): string => {
        if (val === null || val === undefined) return "";
        const s = val instanceof Date ? val.toISOString() : String(val);
        if (/[",\n\r]/.test(s)) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };

      const headers = [
        "id", "administeredAt", "createdAt", "title", "productId", "batchNumber",
        "dose", "doseUnit", "route",
        "bodyWeightKg", "sleepScore", "energyScore", "moodScore",
        "cycleMarker", "tags", "observation",
      ];

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="logbook-${new Date().toISOString().slice(0, 10)}.csv"`,
      );
      res.write(headers.join(",") + "\n");
      for (const e of entries as ResearchNote[]) {
        const row = [
          e.id,
          e.administeredAt,
          e.createdAt,
          e.title,
          e.productId,
          e.batchNumber,
          e.dose,
          e.doseUnit,
          e.route,
          e.bodyWeightKg,
          e.sleepScore,
          e.energyScore,
          e.moodScore,
          e.cycleMarker,
          e.tags ? e.tags.join("|") : "",
          e.content,
        ].map(escapeCsv).join(",");
        res.write(row + "\n");
      }
      res.end();
    } catch (error) {
      console.error("Error exporting logbook CSV:", error);
      res.status(500).json({ error: "Failed to export logbook" });
    }
  });

  // ============== CYCLES (derived from logbook entries) ==============
  app.get("/api/cycles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [entries, tags] = await Promise.all([
        storage.getLogbookEntries(userId),
        storage.listCycleTagsForUser(userId),
      ]);
      const cycles = detectCycles(entries);
      const tagMap = new Map<string, { id: string; name: string }>();
      for (const t of tags) {
        const ts = (t.cycleStartTimestamp instanceof Date
          ? t.cycleStartTimestamp
          : new Date(t.cycleStartTimestamp as unknown as string)
        ).toISOString();
        tagMap.set(`${t.compoundKey}::${ts}`, { id: t.id, name: t.name });
      }
      const enriched = cycles.map((c) => {
        const k = `${c.compoundKey}::${c.startDate.toISOString()}`;
        const tag = tagMap.get(k) ?? null;
        return {
          compoundKey: c.compoundKey,
          compoundLabel: c.compoundLabel,
          startEntryId: c.startEntryId,
          endEntryId: c.endEntryId,
          startDate: c.startDate.toISOString(),
          endDate: c.endDate.toISOString(),
          status: c.status,
          entryIds: c.entries.map((e) => e.id),
          totalDoses: c.entries.length,
          tagId: tag?.id ?? null,
          name: tag?.name ?? null,
        };
      });
      res.json({ cycles: enriched, totalLogbookEntries: entries.length });
    } catch (error) {
      console.error("Error fetching cycles:", error);
      res.status(500).json({ error: "Failed to fetch cycles" });
    }
  });

  const cycleTagPatchSchema = z.object({
    compoundKey: z.string().min(1).max(200),
    cycleStartTimestamp: z.string().min(1),
    name: z.string().min(1).max(120),
  });

  app.patch("/api/cycles/tag", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = cycleTagPatchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid cycle tag", details: parsed.error.flatten() });
      }
      const startDate = new Date(parsed.data.cycleStartTimestamp);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ error: "Invalid cycleStartTimestamp" });
      }
      const trimmedName = parsed.data.name.trim();
      if (trimmedName.length === 0) {
        return res.status(400).json({ error: "Cycle name cannot be empty" });
      }
      const userEntries = await storage.getLogbookEntries(userId);
      const detected = detectCycles(userEntries);
      const matches = detected.some(
        (c) =>
          c.compoundKey === parsed.data.compoundKey &&
          c.startDate.getTime() === startDate.getTime(),
      );
      if (!matches) {
        return res
          .status(404)
          .json({ error: "Cycle not found for this user" });
      }
      const tag = await storage.upsertCycleTag({
        userId,
        compoundKey: parsed.data.compoundKey,
        cycleStartTimestamp: startDate,
        name: trimmedName,
      });
      res.json(tag);
    } catch (error) {
      console.error("Error upserting cycle tag:", error);
      res.status(500).json({ error: "Failed to save cycle name" });
    }
  });

  app.delete("/api/cycles/tag/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const ok = await storage.deleteCycleTag(id, userId);
      if (!ok) {
        return res.status(404).json({ error: "Tag not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting cycle tag:", error);
      res.status(500).json({ error: "Failed to delete cycle name" });
    }
  });

  // ============== LOGIN HISTORY ==============
  app.get("/api/login-history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await storage.getLoginHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching login history:", error);
      res.status(500).json({ error: "Failed to fetch login history" });
    }
  });

  // ============== BATCH VERIFICATION HISTORY ==============
  app.get("/api/batch-verification-history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = await storage.getBatchVerificationHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching batch verification history:", error);
      res.status(500).json({ error: "Failed to fetch batch verification history" });
    }
  });

  app.post("/api/batch-verification-history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { batchNumber, productName } = req.body;
      const record = await storage.recordBatchVerification(userId, batchNumber, productName);
      res.json(record);
    } catch (error) {
      console.error("Error recording batch verification:", error);
      res.status(500).json({ error: "Failed to record batch verification" });
    }
  });

  // ============== USER SUBSCRIPTIONS ==============
  app.get("/api/user/subscriptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userSubscriptions = await db.select().from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .orderBy(desc(subscriptions.createdAt));
      res.json(userSubscriptions);
    } catch (error) {
      console.error("Error fetching user subscriptions:", error);
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  // =====================================
  // SAVED STACKS API
  // =====================================

  // Generate a unique share code
  function generateShareCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Save a custom stack (authenticated users)
  app.post("/api/saved-stacks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, peptideIds, peptideNames, isPublic, synergyScore } = req.body;
      
      if (!name || !peptideIds?.length || !peptideNames?.length) {
        return res.status(400).json({ error: "Name and peptides are required" });
      }
      
      if (peptideIds.length < 2 || peptideIds.length > 4) {
        return res.status(400).json({ error: "Stack must contain 2-4 peptides" });
      }
      
      const shareCode = generateShareCode();
      
      const [saved] = await db.insert(savedStacks).values({
        userId,
        name: name.slice(0, 50),
        peptideIds,
        peptideNames,
        shareCode,
        isPublic: isPublic || false,
        synergyScore: typeof synergyScore === "number" ? Math.round(synergyScore) : 0,
      }).returning();
      
      res.json(saved);
    } catch (error) {
      console.error("Error saving stack:", error);
      res.status(500).json({ error: "Failed to save stack" });
    }
  });

  // Get user's saved stacks
  app.get("/api/saved-stacks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stacks = await db.select().from(savedStacks)
        .where(eq(savedStacks.userId, userId))
        .orderBy(desc(savedStacks.createdAt));
      res.json(stacks);
    } catch (error) {
      console.error("Error fetching saved stacks:", error);
      res.status(500).json({ error: "Failed to fetch saved stacks" });
    }
  });

  // Get a stack by share code (public endpoint — only returns public stacks)
  app.get("/api/saved-stacks/share/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const [stack] = await db.select().from(savedStacks)
        .where(eq(savedStacks.shareCode, code));
      
      if (!stack || !stack.isPublic) {
        return res.status(404).json({ error: "Stack not found" });
      }
      
      res.json({
        name: stack.name,
        peptideIds: stack.peptideIds,
        peptideNames: stack.peptideNames,
        saveCount: stack.saveCount,
      });
    } catch (error) {
      console.error("Error fetching shared stack:", error);
      res.status(500).json({ error: "Failed to fetch stack" });
    }
  });

  // Fork/save a shared stack to the authenticated user's own collection
  app.post("/api/saved-stacks/fork/:shareCode", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { shareCode } = req.params;
      const [original] = await db.select().from(savedStacks)
        .where(eq(savedStacks.shareCode, shareCode));
      if (!original || (!original.isPublic && original.userId !== userId)) {
        return res.status(404).json({ error: "Stack not found" });
      }
      // If this stack already belongs to the user, don't duplicate it
      if (original.userId === userId) {
        return res.json({ alreadyOwned: true, shareCode: original.shareCode });
      }
      const newShareCode = (() => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let c = '';
        for (let i = 0; i < 8; i++) c += chars.charAt(Math.floor(Math.random() * chars.length));
        return c;
      })();
      const [saved] = await db.insert(savedStacks).values({
        userId,
        name: original.name,
        peptideIds: original.peptideIds,
        peptideNames: original.peptideNames,
        shareCode: newShareCode,
        sourceShareCode: original.shareCode ?? shareCode,
        isPublic: false,
        synergyScore: original.synergyScore ?? 0,
      }).returning();
      // Increment save count on original
      await db.update(savedStacks)
        .set({ saveCount: sql`${savedStacks.saveCount} + 1` })
        .where(eq(savedStacks.id, original.id));
      res.json({ shareCode: saved.shareCode, name: saved.name });
    } catch (error) {
      console.error("Error forking stack:", error);
      res.status(500).json({ error: "Failed to save stack to collection" });
    }
  });

  // Toggle public/private visibility for a saved stack
  app.patch("/api/saved-stacks/:id/visibility", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { isPublic } = req.body;
      if (typeof isPublic !== "boolean") {
        return res.status(400).json({ error: "isPublic must be a boolean" });
      }
      const [stack] = await db.select().from(savedStacks)
        .where(eq(savedStacks.id, id));
      if (!stack || stack.userId !== userId) {
        return res.status(404).json({ error: "Stack not found" });
      }
      const [updated] = await db.update(savedStacks)
        .set({ isPublic })
        .where(eq(savedStacks.id, id))
        .returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating stack visibility:", error);
      res.status(500).json({ error: "Failed to update stack visibility" });
    }
  });

  // Delete a saved stack
  app.delete("/api/saved-stacks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const [stack] = await db.select().from(savedStacks)
        .where(eq(savedStacks.id, id));
      
      if (!stack || stack.userId !== userId) {
        return res.status(404).json({ error: "Stack not found" });
      }
      
      await db.delete(savedStacks).where(eq(savedStacks.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting stack:", error);
      res.status(500).json({ error: "Failed to delete stack" });
    }
  });

  // OG preview image for shared stacks — GET /api/stack-preview/:shareCode.png
  app.get("/api/stack-preview/:shareCode.png", async (req, res) => {
    try {
      const { shareCode } = req.params;
      const [stack] = await db.select().from(savedStacks)
        .where(eq(savedStacks.shareCode, shareCode));

      if (!stack || !stack.isPublic) return res.status(404).send("Not found");

      const sanitizeName = (n: string) => n.replace(/\s*\([^)]*\)/g, '').trim();
      const peptideList = (stack.peptideNames || []).slice(0, 4).map(sanitizeName);
      const peptideCount = peptideList.length;

      // Build a 1200×630 SVG preview card
      const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const stackNameSafe = escapeXml(stack.name.slice(0, 40));
      const score = stack.synergyScore ?? 0;
      const scoreColor = score >= 80 ? "#D4FF1F" : score >= 60 ? "#21d8ff" : "#6b7280";
      const peptideLines = peptideList.map((n, i) =>
        `<text x="60" y="${300 + i * 44}" fill="#e5e7eb" font-size="20" font-weight="500">${i + 1}. ${escapeXml(n)}</text>`
      ).join("\n");

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f0f12"/>
            <stop offset="100%" stop-color="#1a1a1f"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="630" fill="url(#bg)"/>
        <rect x="0" y="0" width="6" height="630" fill="#21d8ff"/>
        <!-- Header -->
        <text x="60" y="70" fill="#ffffff" font-size="22" font-weight="700" font-family="system-ui, sans-serif" letter-spacing="2">REVIVE RESEARCH</text>
        <text x="60" y="100" fill="#6b7280" font-size="14" font-family="monospace" letter-spacing="1">reviveresearch.co/stacks/${shareCode}</text>
        <!-- Divider -->
        <line x1="60" y1="130" x2="1140" y2="130" stroke="#2a2a32" stroke-width="1"/>
        <!-- Stack name -->
        <text x="60" y="200" fill="#ffffff" font-size="38" font-weight="800" font-family="system-ui, sans-serif">${stackNameSafe}</text>
        <text x="60" y="240" fill="#6b7280" font-size="18" font-family="system-ui, sans-serif">${peptideCount} research compound${peptideCount !== 1 ? "s" : ""}</text>
        <!-- Synergy score badge -->
        <rect x="60" y="258" width="160" height="30" rx="6" fill="${scoreColor}20"/>
        <text x="140" y="278" fill="${scoreColor}" font-size="14" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">Synergy: ${score}%</text>
        <!-- Peptide list -->
        ${peptideLines}
        <!-- Footer -->
        <line x1="60" y1="590" x2="1140" y2="590" stroke="#1e1e24" stroke-width="1"/>
        <text x="60" y="615" fill="#4b5563" font-size="13" font-family="monospace">reviveresearch.co · For research use only</text>
        <text x="1140" y="615" fill="#4b5563" font-size="13" font-family="monospace" text-anchor="end">${shareCode}</text>
      </svg>`;

      const sharp = (await import("sharp")).default;
      const png = await sharp(Buffer.from(svg)).png().toBuffer();

      res.set("Content-Type", "image/png");
      res.set("Cache-Control", "public, max-age=86400, s-maxage=86400");
      res.send(png);
    } catch (error) {
      console.error("Error generating stack preview:", error);
      res.status(500).send("Error generating preview");
    }
  });

  // Get popular/trending stacks (public endpoint - aggregated anonymous data)
  app.get("/api/popular-stacks", async (req, res) => {
    try {
      const stacks = await db.select({
        peptideNames: savedStacks.peptideNames,
        saveCount: savedStacks.saveCount,
      }).from(savedStacks)
        .where(eq(savedStacks.isPublic, true))
        .orderBy(desc(savedStacks.saveCount))
        .limit(10);
      
      // Group similar stacks and count occurrences
      const stackMap = new Map<string, { peptideNames: string[], count: number }>();
      
      for (const stack of stacks) {
        const key = [...(stack.peptideNames || [])].sort().join('|');
        const existing = stackMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          stackMap.set(key, { peptideNames: stack.peptideNames || [], count: 1 });
        }
      }
      
      const popularStacks = Array.from(stackMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      res.json(popularStacks);
    } catch (error) {
      console.error("Error fetching popular stacks:", error);
      res.status(500).json({ error: "Failed to fetch popular stacks" });
    }
  });


  // Citation report and dismissal endpoints
  const CITATION_REPORT_PATH = path.join(process.cwd(), "citation-report.json");
  const PMID_RE = /^\d{1,20}$/;

  app.get("/api/citation-report", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = userId ? await storage.getUser(userId) : null;
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin only" });
      }
      if (!fs.existsSync(CITATION_REPORT_PATH)) {
        return res.json({ available: false });
      }
      const raw = fs.readFileSync(CITATION_REPORT_PATH, "utf-8");
      const report = JSON.parse(raw);
      const dismissals = await storage.getCitationDismissals();
      const dismissedPmids = new Set(dismissals.map((d) => d.pmid));
      const failed = (report.results ?? []).filter(
        (r: any) => !r.ok && !dismissedPmids.has(String(r.pmid))
      );
      const dismissed = (report.results ?? []).filter(
        (r: any) => !r.ok && dismissedPmids.has(String(r.pmid))
      );
      return res.json({
        available: true,
        generatedAt: report.generatedAt,
        checked: report.checked,
        passed: report.passed,
        failed: report.failed,
        failedItems: failed,
        dismissedItems: dismissed,
      });
    } catch (error) {
      console.error("Error reading citation report:", error);
      return res.status(500).json({ error: "Failed to read citation report" });
    }
  });

  app.get("/api/citation-dismissals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = userId ? await storage.getUser(userId) : null;
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      const dismissals = await storage.getCitationDismissals();
      return res.json(dismissals);
    } catch (error) {
      console.error("Error fetching citation dismissals:", error);
      return res.status(500).json({ error: "Failed to fetch dismissals" });
    }
  });

  app.post("/api/citation-dismissals/:pmid", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = userId ? await storage.getUser(userId) : null;
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      const { pmid } = req.params;
      if (!PMID_RE.test(pmid)) return res.status(400).json({ error: "Invalid PMID" });
      await storage.dismissCitation(pmid);
      return res.json({ ok: true });
    } catch (error) {
      console.error("Error dismissing citation:", error);
      return res.status(500).json({ error: "Failed to dismiss citation" });
    }
  });

  app.delete("/api/citation-dismissals/:pmid", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = userId ? await storage.getUser(userId) : null;
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      const { pmid } = req.params;
      if (!PMID_RE.test(pmid)) return res.status(400).json({ error: "Invalid PMID" });
      const existed = await storage.undismissCitation(pmid);
      return res.json({ ok: true, existed });
    } catch (error) {
      console.error("Error undismissing citation:", error);
      return res.status(500).json({ error: "Failed to undismiss citation" });
    }
  });

  app.delete("/api/citation-dismissals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = userId ? await storage.getUser(userId) : null;
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      const cleared = await storage.clearCitationDismissals();
      return res.json({ ok: true, cleared });
    } catch (error) {
      console.error("Error clearing citation dismissals:", error);
      return res.status(500).json({ error: "Failed to clear dismissals" });
    }
  });

  // Dead-link tracking endpoints
  app.post("/api/dead-links", async (req: any, res) => {
    try {
      const { type, slug } = req.body ?? {};
      if (!type || !["product", "guide"].includes(type)) {
        return res.status(400).json({ error: "Invalid type" });
      }
      const rawSlug = typeof slug === "string" ? slug.trim() : "";
      if (!isValidSlug(rawSlug)) {
        return res.status(400).json({ error: "Invalid slug" });
      }
      const ip = req.ip || "unknown";
      // X-Visitor-ID is accepted only when it is a well-formed UUID so that
      // bots cannot bypass the IP gate by rotating arbitrary header values.
      const rawVisitorHeader =
        typeof req.headers["x-visitor-id"] === "string"
          ? req.headers["x-visitor-id"].trim()
          : "";
      const visitorId = VISITOR_UUID_RE.test(rawVisitorHeader) ? rawVisitorHeader : null;
      if (isDeadLinkRateLimited(ip, visitorId, type, rawSlug)) {
        return res.json({ ok: true, skipped: true });
      }
      await recordDeadLink(type as "product" | "guide", rawSlug);
      return res.json({ ok: true });
    } catch (error) {
      console.error("Error recording dead link:", error);
      return res.status(500).json({ error: "Failed to record dead link" });
    }
  });

  app.get("/api/dead-links", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = userId ? await storage.getUser(userId) : null;
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin only" });
      }
      const hits = await storage.getAllDeadLinkHits();
      return res.json(hits);
    } catch (error) {
      console.error("Error fetching dead links:", error);
      return res.status(500).json({ error: "Failed to fetch dead links" });
    }
  });

  app.delete("/api/dead-links", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = userId ? await storage.getUser(userId) : null;
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin only" });
      }
      const cleared = await storage.clearAllDeadLinkHits();
      return res.json({ ok: true, cleared });
    } catch (error) {
      console.error("Error clearing dead links:", error);
      return res.status(500).json({ error: "Failed to clear dead links" });
    }
  });

  app.delete("/api/dead-links/:type/:slug", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = userId ? await storage.getUser(userId) : null;
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin only" });
      }
      const { type, slug } = req.params;
      if (!type || !["product", "guide"].includes(type)) {
        return res.status(400).json({ error: "Invalid type" });
      }
      if (!isValidSlug(slug)) {
        return res.status(400).json({ error: "Invalid slug" });
      }
      const existed = await storage.deleteDeadLinkHit(type as "product" | "guide", slug);
      return res.json({ ok: true, existed });
    } catch (error) {
      console.error("Error dismissing dead link:", error);
      return res.status(500).json({ error: "Failed to dismiss dead link" });
    }
  });

  // ── Stripe Presets ─────────────────────────────────────────────────────────
  // Public read (needed to populate the admin dropdown without a separate auth check)
  app.get("/api/stripe-presets", async (_req, res) => {
    try {
      const presets = await storage.getAllStripePresets();
      return res.json(presets);
    } catch (error) {
      console.error("Error fetching stripe presets:", error);
      return res.status(500).json({ error: "Failed to fetch stripe presets" });
    }
  });

  app.post("/api/admin/stripe-presets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = userId ? await storage.getUser(userId) : null;
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });

      const parsed = insertStripePresetSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

      const preset = await storage.createStripePreset(parsed.data);
      return res.status(201).json(preset);
    } catch (error: any) {
      if (error?.constraint === "uq_stripe_presets_label" || error?.message?.includes("uq_stripe_presets_label")) {
        return res.status(409).json({ error: "A preset with that label already exists" });
      }
      console.error("Error creating stripe preset:", error);
      return res.status(500).json({ error: "Failed to create stripe preset" });
    }
  });

  app.patch("/api/admin/stripe-presets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = userId ? await storage.getUser(userId) : null;
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });

      const parsed = insertStripePresetSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

      const preset = await storage.updateStripePreset(req.params.id, parsed.data);
      if (!preset) return res.status(404).json({ error: "Preset not found" });
      return res.json(preset);
    } catch (error: any) {
      if (error?.constraint === "uq_stripe_presets_label" || error?.message?.includes("uq_stripe_presets_label")) {
        return res.status(409).json({ error: "A preset with that label already exists" });
      }
      console.error("Error updating stripe preset:", error);
      return res.status(500).json({ error: "Failed to update stripe preset" });
    }
  });

  app.delete("/api/admin/stripe-presets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = userId ? await storage.getUser(userId) : null;
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });

      const deleted = await storage.deleteStripePreset(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Preset not found" });
      return res.json({ ok: true });
    } catch (error) {
      console.error("Error deleting stripe preset:", error);
      return res.status(500).json({ error: "Failed to delete stripe preset" });
    }
  });

  // ── Research Stacks ────────────────────────────────────────────────────────
  // NOTE: /count must be defined BEFORE /:id to avoid Express matching "count" as an id
  app.get("/api/research-stacks/count", async (_req, res) => {
    try {
      const total = await storage.getResearchStacksCount();
      return res.json({ count: total });
    } catch (error) {
      console.error("Error fetching research stacks count:", error);
      return res.status(500).json({ error: "Failed to fetch count" });
    }
  });

  app.get("/api/research-stacks", async (req: any, res) => {
    try {
      const stacks = await storage.getResearchStacks();
      return res.json(
        stacks.map((s) => ({
          ...s,
          peptides: s.peptideDetails,
          synergy: s.synergyCopy,
        }))
      );
    } catch (error) {
      console.error("Error fetching research stacks:", error);
      return res.status(500).json({ error: "Failed to fetch research stacks" });
    }
  });

  app.get("/api/research-stacks/:id", async (req, res) => {
    try {
      if (!isValidSlug(req.params.id)) {
        return res.status(400).json({ error: "Invalid stack id" });
      }
      const stack = await storage.getResearchStackById(req.params.id);
      if (!stack) return res.status(404).json({ error: "Stack not found" });
      return res.json({
        ...stack,
        peptides: stack.peptideDetails,
        synergy: stack.synergyCopy,
      });
    } catch (error) {
      console.error("Error fetching research stack:", error);
      return res.status(500).json({ error: "Failed to fetch stack" });
    }
  });

  app.get("/api/admin/research-stacks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = userId ? await storage.getUser(userId) : null;
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      const stacks = await storage.getAllResearchStacksAdmin();
      return res.json(stacks.map((s) => ({ ...s, peptides: s.peptideDetails, synergy: s.synergyCopy })));
    } catch (error) {
      console.error("Error fetching admin research stacks:", error);
      return res.status(500).json({ error: "Failed to fetch research stacks" });
    }
  });

  const researchStackPatchSchema = z.object({
    showOnPage: z.boolean().optional(),
    isActive: z.boolean().optional(),
    name: z.string().min(1).optional(),
    subtitle: z.string().optional(),
    description: z.string().min(1).optional(),
    badge: z.string().optional(),
    badgeColor: z.string().optional(),
    color: z.string().optional(),
    category: z.string().optional(),
    synergyBonus: z.number().int().min(0).optional(),
    sortOrder: z.number().int().min(0).optional(),
    detailPageId: z.string().optional(),
  }).strict();

  const researchStackPostSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    description: z.string().min(1),
    subtitle: z.string().optional(),
    badge: z.string().optional(),
    badgeColor: z.string().optional(),
    color: z.string().optional(),
    category: z.string().optional(),
    synergyBonus: z.number().int().min(0).optional(),
    sortOrder: z.number().int().min(0).optional(),
    showOnPage: z.boolean().optional(),
    isActive: z.boolean().optional(),
    detailPageId: z.string().optional(),
  });

  app.patch("/api/admin/research-stacks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = userId ? await storage.getUser(userId) : null;
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });

      const parsed = researchStackPatchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid fields", details: parsed.error.flatten() });
      }
      if (Object.keys(parsed.data).length === 0) {
        return res.status(400).json({ error: "No valid fields provided" });
      }
      const stack = await storage.updateResearchStack(req.params.id, parsed.data);
      if (!stack) return res.status(404).json({ error: "Stack not found" });
      return res.json(stack);
    } catch (error) {
      console.error("Error updating research stack:", error);
      return res.status(500).json({ error: "Failed to update stack" });
    }
  });

  app.post("/api/admin/research-stacks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = userId ? await storage.getUser(userId) : null;
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });

      const parsed = researchStackPostSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
      }
      const { name, description } = parsed.data;
      const id = (parsed.data.id || name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const existing = await storage.getResearchStackByIdAdmin(id);
      if (existing) {
        return res.status(409).json({ error: `A stack with id '${id}' already exists` });
      }

      const stack = await storage.createResearchStack({ ...parsed.data, id, name, description });
      return res.status(201).json(stack);
    } catch (error) {
      console.error("Error creating research stack:", error);
      return res.status(500).json({ error: "Failed to create stack" });
    }
  });

  return httpServer;
}
