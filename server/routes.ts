import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { insertOrderSchema, insertContactSchema, insertProductSchema, insertCoaSchema, insertAffiliateApplicationSchema, insertAffiliateSchema, insertAffiliateSaleSchema, insertAffiliatePayoutSchema, insertNewsletterSubscriberSchema, subscriptions, savedStacks, insertSavedStackSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./auth0Auth";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { processProductImage } from "./imageProcessor";
import { sendEmail, sendOrderConfirmationEmail, sendAdminOrderNotificationEmail, sendShippedNotificationEmail, sendNewsletterWelcomeEmail, isEmailConfigured } from "./email";
import { sendOrderNotifications, getNotificationStatus } from "./notifications";
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
} from "./paypal";
import OpenAI from "openai";
import { z } from "zod";

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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Serve static assets from public folder (e.g., /assets/logo.png)
  // In development: serve from public/assets and client/public/assets
  // In production: serve from dist/public/assets (Vite copies client/public to dist/public)
  app.use('/assets', express.static(path.resolve(process.cwd(), 'public/assets')));
  app.use('/assets', express.static(path.resolve(process.cwd(), 'client/public/assets')));
  app.use('/assets', express.static(path.resolve(process.cwd(), 'dist/public/assets')));

  const SITE_URL = "https://reviveresearch.co";

  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /cart\nDisallow: /checkout\n\nSitemap: ${SITE_URL}/sitemap.xml`
    );
  });

  app.get('/sitemap.xml', async (_req, res) => {
    try {
      const staticUrls = [
        { loc: '/', priority: '1.0', changefreq: 'daily' },
        { loc: '/peptides', priority: '0.9', changefreq: 'daily' },
        { loc: '/shop', priority: '0.9', changefreq: 'daily' },
        { loc: '/research-stacks', priority: '0.8', changefreq: 'weekly' },
        { loc: '/bulk-packs', priority: '0.7', changefreq: 'weekly' },
        { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
        { loc: '/affiliate', priority: '0.6', changefreq: 'monthly' },
        { loc: '/academy', priority: '0.7', changefreq: 'weekly' },
        { loc: '/peptide-research-faq', priority: '0.7', changefreq: 'monthly' },
        { loc: '/peptide-shipping-and-handling', priority: '0.5', changefreq: 'monthly' },
        { loc: '/peptide-research-resources', priority: '0.6', changefreq: 'monthly' },
        { loc: '/coa/verify-certificate-of-analysis', priority: '0.7', changefreq: 'weekly' },
        { loc: '/coa/batch-testing-archive', priority: '0.6', changefreq: 'weekly' },
        { loc: '/tools/peptide-reconstitution-calculator', priority: '0.7', changefreq: 'monthly' },
        { loc: '/about/our-transparency-commitment', priority: '0.5', changefreq: 'monthly' },
        { loc: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
        { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
        { loc: '/disclaimer', priority: '0.3', changefreq: 'yearly' },
        { loc: '/legal', priority: '0.3', changefreq: 'yearly' },
        { loc: '/guides/peptide-education-center', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/peptide-quality-assurance-process', priority: '0.6', changefreq: 'monthly' },
        { loc: '/guides/peptide-vendor-ethics-standards', priority: '0.5', changefreq: 'monthly' },
        { loc: '/guides/peptide-pricing-breakdown', priority: '0.6', changefreq: 'monthly' },
        { loc: '/guides/peptide-vendor-checklist', priority: '0.6', changefreq: 'monthly' },
        { loc: '/guides/peptide-handling-troubleshooting', priority: '0.6', changefreq: 'monthly' },
        { loc: '/guides/peptide-lab-research-archive', priority: '0.5', changefreq: 'weekly' },
        { loc: '/guides/peptide-package-arrived-warm', priority: '0.5', changefreq: 'monthly' },
        { loc: '/guides/are-peptide-coas-trustworthy', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/how-batch-testing-works', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/what-research-use-only-means', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/how-to-verify-peptide-quality', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/peptide-purity-explained', priority: '0.7', changefreq: 'monthly' },
        { loc: '/guides/why-cheap-peptides-are-cheap', priority: '0.7', changefreq: 'monthly' },
      ];

      const products = await storage.getAllProducts();
      const articles = await storage.getAllEducationArticles();
      const today = new Date().toISOString().split('T')[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      for (const url of staticUrls) {
        xml += `  <url>\n    <loc>${SITE_URL}${url.loc}</loc>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
      }

      for (const product of products) {
        if (product.slug) {
          xml += `  <url>\n    <loc>${SITE_URL}/peptides/${product.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
        }
      }

      for (const article of articles) {
        if (article.slug) {
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
  };

  Object.entries(guideRedirects).forEach(([oldPath, newPath]) => {
    app.get(oldPath, (req, res) => {
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

  app.post("/api/subscriptions/cancel", async (req, res) => {
    await cancelPayPalSubscription(req, res);
  });

  // PayPal Webhook handler
  app.post("/api/paypal/webhook", async (req, res) => {
    await handlePayPalWebhook(req, res);
  });

  // Sync Auth0 user to database
  app.post('/api/auth/sync', async (req, res) => {
    try {
      const { id, email, firstName, lastName, profileImageUrl } = req.body;
      
      if (!id || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      await storage.upsertUser({
        id,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        profileImageUrl: profileImageUrl || null,
      });
      
      const user = await storage.getUser(id);
      
      (req.session as any).userId = id;
      
      res.json(user);
    } catch (error) {
      console.error("Error syncing user:", error);
      res.status(500).json({ message: "Failed to sync user" });
    }
  });

  // Dev bypass login - for admin access during development when Auth0 is unavailable
  // Works in Replit development environment (when REPL_ID is set) or when NODE_ENV !== 'production'
  app.post('/api/auth/dev-bypass', async (req, res) => {
    // Allow bypass in Replit development environment (identified by REPL_ID)
    // or when not in production mode
    const isReplitDev = !!process.env.REPL_ID;
    const isDevMode = process.env.NODE_ENV !== 'production';
    
    if (!isReplitDev && !isDevMode) {
      console.warn('[Security] Dev bypass attempted in production - blocked');
      return res.status(403).json({ message: "Dev bypass disabled in production" });
    }
    
    const bypassKey = req.body.key;
    const expectedKey = process.env.DEV_BYPASS_KEY || 'revive-dev-2024';
    
    if (bypassKey !== expectedKey) {
      console.warn('[Security] Invalid dev bypass key attempt');
      return res.status(401).json({ message: "Invalid bypass key" });
    }
    
    console.log('[Dev] Dev bypass login used');
    
    try {
      // Create or get the dev admin user
      const devUserId = 'dev-admin-bypass';
      const devEmail = 'admin@reviveresearch.co';
      
      await storage.upsertUser({
        id: devUserId,
        email: devEmail,
        firstName: 'Dev',
        lastName: 'Admin',
        profileImageUrl: null,
      });
      
      // Automatically grant admin access to dev bypass user
      await storage.setUserAdmin(devUserId, true);
      
      (req.session as any).userId = devUserId;
      
      const user = await storage.getUser(devUserId);
      res.json({ success: true, user, message: "Dev bypass login successful with admin access." });
    } catch (error) {
      console.error("Error in dev bypass login:", error);
      res.status(500).json({ message: "Failed to create dev session" });
    }
  });

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
  app.post("/api/test-email", async (req: any, res) => {
    // TEMPORARILY PUBLIC for testing - will restore admin check after verification
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
        const dosagePrices = dosageStocks
          .filter(ds => ds.price != null && Number(ds.price) > 0)
          .map(ds => Number(ds.price));
        
        if (dosagePrices.length >= 2) {
          const minPrice = Math.min(...dosagePrices);
          const maxPrice = Math.max(...dosagePrices);
          if (minPrice !== maxPrice) {
            return { ...product, price: minPrice.toFixed(2), minPrice: minPrice.toFixed(2), maxPrice: maxPrice.toFixed(2) };
          }
          return { ...product, price: minPrice.toFixed(2) };
        }
        if (dosagePrices.length === 1) {
          return { ...product, price: dosagePrices[0].toFixed(2) };
        }
        return product;
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

  // Create manual payment order (CashApp/Zelle) with pending_payment status
  app.post("/api/orders/manual", async (req: any, res) => {
    try {
      const { 
        paymentMethod, 
        customerEmail, 
        customerName, 
        shippingAddress, 
        items, 
        total 
      } = req.body;

      // Validate required fields
      if (!paymentMethod || !customerEmail || !customerName || !shippingAddress || !items || !total) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!['cashapp', 'zelle'].includes(paymentMethod)) {
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
        isTest: false, // Manual orders are assumed to be real unless admin marks otherwise
        notes: `Manual ${paymentMethod.toUpperCase()} payment. Items: ${items.map((i: any) => `${i.name} (${i.dosage}) x${i.quantity}`).join(', ')}`,
      };

      // If user is authenticated, link order to their account
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        orderData.userId = req.user.claims.sub;
      }

      // Validate stock before creating the order
      const stockItems = items.map((item: any) => ({
        productId: item.productId,
        dosage: item.dosage || undefined,
        quantity: item.quantity || 1,
      }));
      const stockCheck = await storage.validateStock(stockItems);
      if (!stockCheck.valid) {
        return res.status(409).json({ 
          error: "Some items are no longer available", 
          stockErrors: stockCheck.errors 
        });
      }

      const validatedData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedData);
      
      console.log(`[Manual Order ${order.id}] Created with ${paymentMethod} - awaiting payment`);
      
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
        message: `Order created. Please send $${total.toFixed(2)} via ${paymentMethod.toUpperCase()} and include your email in the note.`
      });
    } catch (error) {
      console.error("Error creating manual order:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid order data" });
      }
      res.status(500).json({ error: "Failed to create order" });
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

      // Build order data from cart items
      const [firstName, ...lastNameParts] = customerName.split(' ');
      const lastName = lastNameParts.join(' ') || '';

      // For multi-item orders, use the first product as primary
      const primaryItem = items[0];
      
      const orderData: any = {
        productId: primaryItem?.productId || 'multi-item',
        quantity: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        totalAmount: total.toString(),
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
        isTest: isPayPalSandbox(), // Mark as test order if using PayPal sandbox
        notes: `PayPal Order: ${paypalOrderId}. Payer: ${paypalPayerId || 'N/A'}. Items: ${items.map((i: any) => `${i.name} (${i.dosage}) x${i.quantity}`).join(', ')}`,
      };

      // If user is authenticated, link order to their account
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        orderData.userId = req.user.claims.sub;
      }

      // Validate stock before creating the order
      const stockItems = items.map((item: any) => ({
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
      
      // Decrement stock for all items in this order
      try {
        const stockResult = await storage.decrementStock(stockItems);
        if (!stockResult.success) {
          console.warn(`[PayPal Order ${order.id}] Stock decrement warnings:`, stockResult.errors);
        }
      } catch (stockError: any) {
        console.error(`[PayPal Order ${order.id}] Stock decrement failed:`, stockError.message);
      }
      
      // Build order items array for email (includes all cart items)
      const orderItems = items.map((item: any) => ({
        name: item.name || 'Product',
        dosage: item.dosage || '',
        quantity: item.quantity || 1,
        price: parseFloat(item.price) || 0,
      }));
      
      // Calculate shipping and tax info for email (use passed values or calculate from items)
      const orderSubtotal = subtotal || orderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const orderShipping = typeof shipping === 'number' ? shipping : parseFloat(shipping) || 0;
      const orderTax = typeof tax === 'number' ? tax : parseFloat(tax) || 0;
      const orderTaxState = taxState || shippingAddress?.state || '';
      
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

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
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
      res.json(vote);
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
      res.json({ removed });
    } catch (error) {
      console.error("Error removing vote:", error);
      res.status(500).json({ error: "Failed to remove vote" });
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
        return res.json({ order: existingOrder, alreadyProcessed: true });
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

      res.json({ order, alreadyProcessed: false, notifications: notificationResults });
    } catch (error) {
      console.error("Error verifying checkout session:", error);
      res.status(500).json({ error: "Failed to verify checkout session" });
    }
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
      const { fulfillmentStatus, fulfillmentNotes, paymentConfirmed, addressCollected, packed } = req.body;
      const userId = (req.user as any)?.id || (req.user as any)?.claims?.sub;
      
      const order = await storage.updateOrderFulfillment(req.params.id, {
        fulfillmentStatus,
        fulfillmentNotes,
        fulfilledBy: userId,
        paymentConfirmed,
        addressCollected,
        packed,
      });
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
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
      res.status(201).json(product);
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
  app.post("/api/admin/products/:id/dosage-stocks", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { dosageStocks } = req.body;
      if (!Array.isArray(dosageStocks)) {
        return res.status(400).json({ error: "dosageStocks must be an array" });
      }
      const results = await storage.syncProductDosageStocks(req.params.id, dosageStocks);
      res.json(results);
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

  // Admin: Get all COAs
  app.get("/api/admin/coas", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allCoas = await storage.getAllCoas();
      res.json(allCoas);
    } catch (error) {
      console.error("Error fetching COAs:", error);
      res.status(500).json({ error: "Failed to fetch COAs" });
    }
  });

  // Admin: Create COA
  app.post("/api/admin/coas", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertCoaSchema.parse(req.body);
      const coa = await storage.createCoa(validatedData);
      res.status(201).json(coa);
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
    } catch (error) {
      console.error("Error updating COA:", error);
      res.status(500).json({ error: "Failed to update COA" });
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

      res.status(201).json({ success: true, affiliate });
    } catch (error) {
      console.error("Error approving affiliate application:", error);
      res.status(500).json({ error: "Failed to approve application" });
    }
  });

  // Admin: Reject affiliate application
  app.post("/api/admin/affiliate-applications/:id/reject", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateAffiliateApplicationStatus(req.params.id, "rejected");
      if (!updated) {
        return res.status(404).json({ error: "Application not found" });
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
      
      // Create the notification
      const notification = await storage.createStockNotification({
        productId,
        email,
        status: "pending"
      });
      
      res.status(201).json({ 
        message: "You'll be notified when this product is back in stock!",
        notification
      });
    } catch (error) {
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
          const product = await storage.getProduct(n.productId);
          return {
            ...n,
            productName: product?.name || "Unknown Product"
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

  // Chatbot endpoint
  app.post("/api/chat", async (req, res) => {
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
Revive Research specializes in premium peptide research compounds for laboratory and institutional use. The company differentiates itself through third-party lab verification, Certificates of Analysis (COA) for every batch, educational resources, and an Apple-inspired premium brand experience. The website features a dark charcoal design with neon yellow (#E7FB10) and cyan (#21d8ff) accents.

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
- Standard shipping: $20 flat rate
- Free shipping on orders over $200
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
  app.post("/api/ai/synergy-analysis", async (req, res) => {
    try {
      const { peptides } = req.body;
      
      if (!peptides || typeof peptides !== 'string') {
        return res.status(400).json({ error: "Peptides list is required" });
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
      
      // Send welcome email (don't block on failure)
      sendNewsletterWelcomeEmail(email).catch(err => {
        console.error("Failed to send newsletter welcome email:", err);
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
      const { id } = req.params;
      const note = await storage.updateResearchNote(id, req.body);
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
      const { id } = req.params;
      await storage.deleteResearchNote(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting research note:", error);
      res.status(500).json({ error: "Failed to delete research note" });
    }
  });

  app.post("/api/research-notes/:id/toggle-pin", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const note = await storage.toggleResearchNotePin(id);
      res.json(note);
    } catch (error) {
      console.error("Error toggling pin:", error);
      res.status(500).json({ error: "Failed to toggle pin" });
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
      const { name, peptideIds, peptideNames, isPublic } = req.body;
      
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

  // Get a stack by share code (public endpoint)
  app.get("/api/saved-stacks/share/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const [stack] = await db.select().from(savedStacks)
        .where(eq(savedStacks.shareCode, code));
      
      if (!stack) {
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

  // XML Sitemap - All public pages organized by priority
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = "https://reviveresearch.co";
      
      const staticPages = [
        // Homepage
        { url: "/", priority: "1.0", changefreq: "weekly" },
        
        // Core Commerce Pages
        { url: "/shop", priority: "0.9", changefreq: "weekly" },
        { url: "/peptides", priority: "0.9", changefreq: "weekly" },
        { url: "/products", priority: "0.9", changefreq: "weekly" },
        { url: "/research-stacks", priority: "0.9", changefreq: "weekly" },
        { url: "/bulk-packs", priority: "0.9", changefreq: "weekly" },
        
        // Education & Learning Hub
        { url: "/guides/peptide-education-center", priority: "0.8", changefreq: "weekly" },
        { url: "/peptide-research-resources", priority: "0.8", changefreq: "monthly" },
        
        // Trust & Transparency Pages (SEO-Optimized URLs)
        { url: "/guides/peptide-quality-assurance-process", priority: "0.7", changefreq: "monthly" },
        { url: "/about/our-transparency-commitment", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/peptide-vendor-ethics-standards", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/peptide-pricing-breakdown", priority: "0.7", changefreq: "monthly" },
        { url: "/coa/batch-testing-archive", priority: "0.7", changefreq: "weekly" },
        { url: "/guides/peptide-lab-research-archive", priority: "0.7", changefreq: "weekly" },
        { url: "/coa/verify-certificate-of-analysis", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/peptide-vendor-checklist", priority: "0.7", changefreq: "monthly" },
        
        // SEO Entry Articles (Trust Funnel)
        { url: "/guides/are-peptide-coas-trustworthy", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/how-batch-testing-works", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-research-use-only-means", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/how-to-verify-peptide-quality", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/peptide-purity-explained", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/why-cheap-peptides-are-cheap", priority: "0.7", changefreq: "monthly" },
        
        // Individual Peptide Education Articles (30 Indexable Pages)
        { url: "/guides/what-is-bpc-157-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-tb-500-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-ghk-cu-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-rr-a1-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-rr-a2-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-rr-a3-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-cjc-1295-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-ipamorelin-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-tesamorelin-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-epithalon-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-mots-c-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-igf-1-lr3-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-semax-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-hcg-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-nad-precursor", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-glow-peptide-complex", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-klow-peptide-complex", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-5-amino-1mq-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-dihexa-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-glutathione", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-vitamin-b12", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-melanotan-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-slu-pp-332-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-aod-9604-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-kisspeptin-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-pt-141-bremelanotide-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-thymosin-alpha-1-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-dsip-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-selank-peptide", priority: "0.7", changefreq: "monthly" },
        { url: "/guides/what-is-thymulin-peptide", priority: "0.7", changefreq: "monthly" },
        
        // General Education Articles
        { url: "/guides/ordering-expectations", priority: "0.6", changefreq: "monthly" },
        { url: "/guides/how-to-read-coas", priority: "0.6", changefreq: "monthly" },
        { url: "/guides/understanding-peptide-purity", priority: "0.6", changefreq: "monthly" },
        { url: "/guides/storage-101", priority: "0.6", changefreq: "monthly" },
        { url: "/guides/lab-safety-guidelines", priority: "0.6", changefreq: "monthly" },
        { url: "/guides/understanding-batches", priority: "0.6", changefreq: "monthly" },
        
        // Support & Information Pages
        { url: "/peptide-research-faq", priority: "0.6", changefreq: "monthly" },
        { url: "/contact", priority: "0.6", changefreq: "monthly" },
        { url: "/guides/peptide-handling-troubleshooting", priority: "0.6", changefreq: "monthly" },
        { url: "/guides/peptide-package-arrived-warm", priority: "0.6", changefreq: "monthly" },
        { url: "/peptide-shipping-and-handling", priority: "0.6", changefreq: "monthly" },
        { url: "/affiliate", priority: "0.6", changefreq: "monthly" },
        
        // Legal Pages
        { url: "/legal", priority: "0.5", changefreq: "yearly" },
        { url: "/terms", priority: "0.5", changefreq: "yearly" },
        { url: "/privacy", priority: "0.5", changefreq: "yearly" },
        { url: "/disclaimer", priority: "0.5", changefreq: "yearly" },
        
        // Tools
        { url: "/tools/peptide-reconstitution-calculator", priority: "0.6", changefreq: "monthly" },
      ];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

      for (const page of staticPages) {
        xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
      }

      xml += `</urlset>`;

      res.set('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  return httpServer;
}
