import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { insertOrderSchema, insertContactSchema, insertProductSchema, insertCoaSchema, insertAffiliateApplicationSchema, insertAffiliateSchema, insertAffiliateSaleSchema, insertAffiliatePayoutSchema, insertReviewSchema, insertNewsletterSubscriberSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./auth0Auth";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { sendEmail, sendOrderConfirmationEmail, sendAdminOrderNotificationEmail, sendNewsletterWelcomeEmail, isEmailConfigured } from "./email";
import { sendOrderNotifications, getNotificationStatus } from "./notifications";
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
  
  // Setup authentication
  await setupAuth(app);

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
      const devEmail = 'admin@reviveresearch.dev';
      
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
        return res.status(401).json({ message: "Not authenticated" });
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
      const products = await storage.getAllProducts();
      res.json(products);
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

  // Get single product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
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

  // Helper function to mark order as paid and send notifications (email + SMS)
  async function markOrderPaidAndNotify(orderId: string): Promise<{ 
    success: boolean; 
    order?: any; 
    error?: string; 
    notifications?: any;
    alreadyPaid?: boolean 
  }> {
    try {
      const order = await storage.getOrder(orderId);
      if (!order) {
        return { success: false, error: "Order not found" };
      }
      
      // Idempotent: if already paid, return success but skip notifications
      if (order.status === 'paid') {
        console.log(`[Order ${orderId}] Already paid - skipping notifications (idempotent)`);
        return { success: true, order, alreadyPaid: true, notifications: null };
      }
      
      // Update order status to paid
      const updatedOrder = await storage.updateOrderStatus(orderId, 'paid');
      if (!updatedOrder) {
        return { success: false, error: "Failed to update order status" };
      }
      
      console.log(`[Order ${orderId}] Marked as paid`);
      
      // Send all notifications (email + SMS for customer and admin)
      let notificationResults = null;
      try {
        const product = await storage.getProduct(updatedOrder.productId);
        const productName = product?.name || updatedOrder.productId;
        
        notificationResults = await sendOrderNotifications({
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
        
        console.log(`[Order ${orderId}] Notification results:`, JSON.stringify(notificationResults));
      } catch (notificationError) {
        console.error(`[Order ${orderId}] Notification error:`, notificationError);
      }
      
      return { success: true, order: updatedOrder, notifications: notificationResults, alreadyPaid: false };
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
        const message = result.alreadyPaid 
          ? "Order already paid - no email sent (idempotent)"
          : result.emailSent 
            ? "Order marked as paid and confirmation email sent"
            : "Order marked as paid but email failed to send";
        
        res.json({ 
          success: true, 
          message,
          emailSent: result.emailSent,
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

  // === REVIEWS ROUTES ===

  // Get reviews for a product (public - includes user info for display)
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.id);
      const ratingData = await storage.getProductAverageRating(req.params.id);
      
      // Enrich reviews with user info (name from users table)
      const enrichedReviews = await Promise.all(reviews.map(async (review) => {
        const user = await storage.getUser(review.userId);
        return {
          ...review,
          reviewerName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Verified Customer' : 'Verified Customer',
          isVerifiedPurchase: true // All reviews are now verified purchases
        };
      }));
      
      res.json({ reviews: enrichedReviews, ...ratingData });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
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

  // Get reviewable orders for authenticated user (orders eligible for reviews)
  app.get("/api/reviews/my-reviewable-orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const reviewableOrders = await storage.getReviewableOrdersForUser(userId);
      res.json(reviewableOrders);
    } catch (error) {
      console.error("Error fetching reviewable orders:", error);
      res.status(500).json({ error: "Failed to fetch reviewable orders" });
    }
  });

  // Check if user can review a specific order
  app.get("/api/reviews/can-review/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const result = await storage.canUserReviewOrder(userId, req.params.orderId);
      res.json(result);
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      res.status(500).json({ error: "Failed to check review eligibility" });
    }
  });

  // Submit a review (requires authentication and verified purchase)
  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { orderId, rating, title, comment } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
      }

      // Verify the user can review this order
      const eligibility = await storage.canUserReviewOrder(userId, orderId);
      if (!eligibility.canReview) {
        return res.status(403).json({ error: eligibility.reason });
      }

      // Get the order to find the product ID
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const validatedData = insertReviewSchema.parse({
        productId: order.productId,
        userId,
        orderId,
        rating,
        title,
        comment
      });
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid review data" });
      }
      res.status(500).json({ error: "Failed to submit review" });
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

  // Admin: Update order status
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

  // Admin: Mark order as paid and send confirmation email
  app.post("/api/admin/orders/:id/mark-paid", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      console.log(`[Admin] Marking order ${orderId} as paid`);
      
      const result = await markOrderPaidAndNotify(orderId);
      
      if (result.success) {
        const message = result.alreadyPaid 
          ? "Order already paid - no email sent (idempotent)"
          : result.emailSent 
            ? "Order marked as paid and confirmation email sent"
            : "Order marked as paid but email failed to send";
        
        res.json({ 
          success: true, 
          message,
          emailSent: result.emailSent,
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

  // Admin: Get all contacts
  app.get("/api/admin/contacts", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  // Admin: Mark contact as read
  app.patch("/api/admin/contacts/:id/read", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const contact = await storage.markContactAsRead(req.params.id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error marking contact as read:", error);
      res.status(500).json({ error: "Failed to mark contact as read" });
    }
  });

  // === ADMIN REVIEW ROUTES ===

  // Admin: Get all reviews
  app.get("/api/admin/reviews", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allReviews = await storage.getAllReviews();
      const products = await storage.getAllProducts();
      const productMap = new Map(products.map(p => [p.id, p]));
      
      const reviewsWithProducts = allReviews.map(review => ({
        ...review,
        productName: productMap.get(review.productId)?.name || "Unknown Product",
        productImageUrl: productMap.get(review.productId)?.imageUrl
      }));
      
      res.json(reviewsWithProducts);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Admin: Approve review
  app.patch("/api/admin/reviews/:id/approve", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const review = await storage.updateReviewApproval(req.params.id, true);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      console.error("Error approving review:", error);
      res.status(500).json({ error: "Failed to approve review" });
    }
  });

  // Admin: Reject review (set isApproved to false)
  app.patch("/api/admin/reviews/:id/reject", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const review = await storage.updateReviewApproval(req.params.id, false);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      console.error("Error rejecting review:", error);
      res.status(500).json({ error: "Failed to reject review" });
    }
  });

  // Admin: Delete review
  app.delete("/api/admin/reviews/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteReview(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ error: "Failed to delete review" });
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

      const systemPrompt = `You are a helpful customer support assistant for Revive Research, a premium peptide research compound company. You help customers with:

1. Product information and recommendations
2. Order questions and shipping (24hr standard shipping, same-day if ordered before 12:00 CT, flat rate $20 or free over $175)
3. COA (Certificate of Analysis) verification
4. General questions about peptide research compounds
5. Affiliate program inquiries

Important policies:
- All sales are FINAL - NO REFUNDS due to the nature of research compounds
- Products are for RESEARCH USE ONLY
- Age requirement: 21+
- Free shipping on orders over $175

Affiliate Program Information:
Revive Research has a two-tier affiliate program that offers multiple ways to earn:
- Direct commission: 10% of sales from your direct referrals
- Customer discount: 10% discount for your referred customers
- Team override: 10% commission on sales from affiliates you recruit (second tier only)
- Total earnings cap: 20% per order (to maintain program sustainability)
- Cookie window: 30 days for tracking referrals
- Minimum payout: $100
- Payout frequency: Monthly
- Personal use discount: Approved affiliates receive a private 20% discount code for personal use
- Application: Affiliates apply through the /affiliate page with a brief description
- Important: This is NOT an MLM. Commission structure stops at two tiers - no ranks, no forced purchases, no recruitment requirements. Affiliates can earn without recruiting anyone.

Current product catalog:
${productInfo}

Be friendly, professional, and helpful. If you don't know something specific about an order, direct customers to contact support. Keep responses concise but informative. For affiliate program details, you can answer general questions about how it works, commissions, payouts, and the application process. Direct specific account or payment questions to support.`;

      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request. Please try again.";
      
      res.json({ reply });
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(500).json({ error: "Failed to process chat message" });
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

  // Get all newsletter subscribers (admin only)
  app.get("/api/admin/newsletter/subscribers", isAdmin, async (req, res) => {
    try {
      const subscribers = await storage.getAllNewsletterSubscribers();
      res.json({
        total: subscribers.length,
        subscribers,
        // Group by source for easy analysis
        bySource: subscribers.reduce((acc, sub) => {
          const source = sub.source || "unknown";
          if (!acc[source]) acc[source] = [];
          acc[source].push(sub.email);
          return acc;
        }, {} as Record<string, string[]>),
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
      
      // Count verified reviews
      const allReviews = await storage.getAllReviews();
      const userReviews = allReviews.filter(r => r.userId === userId);
      if (userReviews.length !== profile.verifiedReviewsCount) {
        profile = await storage.createOrUpdateUserResearchProfile(userId, {
          verifiedReviewsCount: userReviews.length
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
        verifiedReviewsCount: profile.verifiedReviewsCount || 0,
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

  // XML Sitemap - Only public-facing, non-product pages for regulatory compliance
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = "https://reviveresearch.co";
      
      // Only include public, non-product, non-gated pages
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "weekly" },
        { url: "/education", priority: "0.8", changefreq: "weekly" },
        { url: "/quality-process", priority: "0.7", changefreq: "monthly" },
        { url: "/transparency", priority: "0.7", changefreq: "monthly" },
        { url: "/faq", priority: "0.6", changefreq: "monthly" },
        { url: "/contact", priority: "0.6", changefreq: "monthly" },
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
