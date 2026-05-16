import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, decimal, timestamp, index, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  ruoAttestationAt: timestamp("ruo_attestation_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description").notNull(),
  shortDescription: text("short_description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  category: text("category").notNull(),
  inStock: boolean("in_stock").default(true),
  stockAmount: integer("stock_amount").default(0),
  dosageOptions: text("dosage_options").array(),
  featured: boolean("featured").default(false),
  showOnLandingPage: boolean("show_on_landing_page").default(false),
  isWeeklyDeal: boolean("is_weekly_deal").default(false),
  weeklyDealEndDate: text("weekly_deal_end_date"),
  benefits: text("benefits").array(),
  usage: text("usage"),
  imageUrl: text("image_url"),
  model3dUrl: text("model_3d_url"),
  // Baseline pricing fields (immutable once set)
  baselinePrice: decimal("baseline_price", { precision: 10, scale: 2 }),
  baselineDate: timestamp("baseline_date"),
  baselineCost: decimal("baseline_cost", { precision: 10, scale: 2 }),
  baselineMarginPct: decimal("baseline_margin_pct", { precision: 5, scale: 2 }),
  // Pricing advisory system
  pricingSuggestionsEnabled: boolean("pricing_suggestions_enabled").default(false),
  publishedAt: timestamp("published_at"),
  // Category stripe override (admin-supplied, takes priority over hardcoded map)
  stripeLabel: text("stripe_label"),
  stripeAccentColor: text("stripe_accent_color"),
});

const HEX_COLOR_RE = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;

export const insertProductSchema = createInsertSchema(products)
  .omit({ id: true })
  .extend({
    stripeAccentColor: z
      .string()
      .nullable()
      .optional()
      .refine(
        (v) => v == null || v === "" || HEX_COLOR_RE.test(v),
        { message: "stripeAccentColor must be a valid hex colour (e.g. #f97316)" },
      ),
  });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Product Dosage Stock - tracks inventory and pricing per dosage option
export const productDosageStock = pgTable("product_dosage_stock", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  dosage: text("dosage").notNull(),
  stockAmount: integer("stock_amount").notNull().default(0),
  inStock: boolean("in_stock").notNull().default(true),
  price: decimal("price", { precision: 10, scale: 2 }),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  // Dosage-level baseline pricing (immutable once set, set when dosage first published)
  baselinePrice: decimal("baseline_price", { precision: 10, scale: 2 }),
  baselineDate: timestamp("baseline_date"),
  baselineCost: decimal("baseline_cost", { precision: 10, scale: 2 }),
  baselineMarginPct: decimal("baseline_margin_pct", { precision: 5, scale: 2 }),
  // Per-dosage pricing suggestions toggle (default false, must be enabled explicitly)
  pricingSuggestionsEnabled: boolean("pricing_suggestions_enabled").notNull().default(false),
});

export const insertProductDosageStockSchema = createInsertSchema(productDosageStock).omit({ id: true });
export type InsertProductDosageStock = z.infer<typeof insertProductDosageStockSchema>;
export type ProductDosageStock = typeof productDosageStock.$inferSelect;

// Extended product type with dosage stocks
export type ProductWithDosageStock = Product & {
  dosageStocks: ProductDosageStock[];
};

// Product Behavioral Metrics - tracks views, cart adds, purchases for pricing insights
export const productBehavioralMetrics = pgTable("product_behavioral_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  dosage: text("dosage"), // null means product-level aggregate
  // Behavioral counters
  productViews: integer("product_views").notNull().default(0),
  addToCartCount: integer("add_to_cart_count").notNull().default(0),
  checkoutStartedCount: integer("checkout_started_count").notNull().default(0),
  purchasedCount: integer("purchased_count").notNull().default(0),
  // Time-based metrics
  lastSaleAt: timestamp("last_sale_at"),
  firstSaleAt: timestamp("first_sale_at"),
  // Tracking
  lastUpdatedAt: timestamp("last_updated_at").defaultNow(),
});

export const insertProductBehavioralMetricsSchema = createInsertSchema(productBehavioralMetrics).omit({ id: true });
export type InsertProductBehavioralMetrics = z.infer<typeof insertProductBehavioralMetricsSchema>;
export type ProductBehavioralMetrics = typeof productBehavioralMetrics.$inferSelect;

// COA (Certificate of Analysis) table
export const coas = pgTable("coas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchNumber: text("batch_number").notNull().unique(),
  productId: varchar("product_id").notNull(),
  productName: text("product_name").notNull(),
  dosage: text("dosage"),
  testDate: text("test_date").notNull(),
  expirationDate: text("expiration_date").notNull(),
  purity: text("purity").notNull(),
  labName: text("lab_name").notNull(),
  verified: boolean("verified").default(true),
  results: text("results").array(),
  imageUrl: text("image_url"),
  labVerificationUrl: text("lab_verification_url"),
  publiclyVisible: boolean("publicly_visible").default(true),
  archived: boolean("archived").default(false),
  notes: text("notes"),
});

export const insertCoaSchema = createInsertSchema(coas).omit({ id: true });
export type InsertCoa = z.infer<typeof insertCoaSchema>;
export type Coa = typeof coas.$inferSelect;

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull(),
  productId: varchar("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  // Order type: one_time, subscription
  orderType: text("order_type").default("one_time"),
  // Payment status: pending, paid, failed
  status: text("status").default("pending"),
  // Payment method: paypal, cashapp, zelle
  paymentMethod: text("payment_method"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  // Manual fulfillment workflow: pending, preparing, ready, delivered
  fulfillmentStatus: text("fulfillment_status").default("pending"),
  fulfillmentNotes: text("fulfillment_notes"),
  fulfilledAt: timestamp("fulfilled_at"),
  fulfilledBy: varchar("fulfilled_by"),
  // Shipping tracking
  trackingNumber: text("tracking_number"),
  carrier: text("carrier"),
  shippedAt: timestamp("shipped_at"),
  // Fulfillment checklist
  paymentConfirmed: boolean("payment_confirmed").default(false),
  addressCollected: boolean("address_collected").default(true),
  packed: boolean("packed").default(false),
  // Refund tracking (manual)
  isRefunded: boolean("is_refunded").default(false),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  refundReason: text("refund_reason"),
  // Email status: pending, sent, failed
  emailStatus: text("email_status").default("pending"),
  emailSentAt: timestamp("email_sent_at"),
  emailError: text("email_error"),
  // PayPal order ID (unique) for replay-attack prevention
  paypalOrderId: text("paypal_order_id").unique(),
  // Test/sandbox indicator - true for PayPal sandbox or test orders
  isTest: boolean("is_test").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Unified contact submissions (Contact Us + Wholesale inquiries)
export const contactTypeEnum = ["contact", "wholesale"] as const;
export const contactStatusEnum = ["new", "read", "responded", "archived"] as const;

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull().default("contact"), // "contact" | "wholesale"
  status: text("status").notNull().default("new"), // "new" | "read" | "responded" | "archived"
  topic: text("topic"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  // Wholesale-specific fields (nullable for contact type)
  companyName: text("company_name"),
  phone: text("phone"),
  orderVolume: text("order_volume"), // e.g., "10-50 units", "100+ units"
  intendedUseCategory: text("intended_use_category"),
  website: text("website"),
  targetTimeline: text("target_timeline"),
  // Admin fields
  notes: text("notes"),
  respondedAt: timestamp("responded_at"),
  respondedBy: text("responded_by"),
  createdAt: timestamp("created_at").defaultNow(),
  isTest: boolean("is_test").default(false), // Mark test/sample contacts
});

export const insertContactSchema = createInsertSchema(contacts).omit({ 
  id: true, 
  status: true, 
  notes: true, 
  respondedAt: true, 
  respondedBy: true, 
  createdAt: true 
});
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Affiliate applications table
export const affiliateApplications = pgTable("affiliate_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  socialUrl: text("social_url").notNull(),
  audienceSize: text("audience_size").notNull(),
  whyPartner: text("why_partner").notNull(),
  productExperience: text("product_experience").notNull(),
  referredByAffiliateId: varchar("referred_by_affiliate_id"),
  referredByName: text("referred_by_name"), // Name of the person who referred them
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAffiliateApplicationSchema = createInsertSchema(affiliateApplications).omit({ id: true, status: true, createdAt: true });
export type InsertAffiliateApplication = z.infer<typeof insertAffiliateApplicationSchema>;
export type AffiliateApplication = typeof affiliateApplications.$inferSelect;

// Affiliates table (approved affiliates with referral codes)
export const affiliates = pgTable("affiliates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  referralCode: text("referral_code").notNull().unique(), // Personal 20% discount code
  basicReferralCode: text("basic_referral_code").unique(), // Short code for 10% (e.g., "GRAYSON10")
  uplineId: varchar("upline_id"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("20.00"),
  payoutMethod: text("payout_method").default("paypal"),
  payoutEmail: text("payout_email"),
  bankAccountHolder: text("bank_account_holder"),
  bankRoutingNumber: text("bank_routing_number"),
  bankAccountNumber: text("bank_account_number"),
  venmoUsername: text("venmo_username"),
  totalEarnedTier1: decimal("total_earned_tier1", { precision: 10, scale: 2 }).default("0.00"),
  totalEarnedTier2: decimal("total_earned_tier2", { precision: 10, scale: 2 }).default("0.00"),
  pendingBalance: decimal("pending_balance", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  applicationId: varchar("application_id").references(() => affiliateApplications.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAffiliateSchema = createInsertSchema(affiliates).omit({ id: true, totalEarnedTier1: true, totalEarnedTier2: true, pendingBalance: true, createdAt: true });
export type InsertAffiliate = z.infer<typeof insertAffiliateSchema>;
export type Affiliate = typeof affiliates.$inferSelect;

// Affiliate sales tracking
export const affiliateSales = pgTable("affiliate_sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").references(() => affiliates.id).notNull(),
  uplineId: varchar("upline_id").references(() => affiliates.id),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  orderTotal: decimal("order_total", { precision: 10, scale: 2 }).notNull(),
  commissionTier1: decimal("commission_tier1", { precision: 10, scale: 2 }).notNull(),
  commissionTier2: decimal("commission_tier2", { precision: 10, scale: 2 }).default("0.00"),
  tier1Status: text("tier1_status").default("pending"),
  tier2Status: text("tier2_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAffiliateSaleSchema = createInsertSchema(affiliateSales).omit({ id: true, createdAt: true });
export type InsertAffiliateSale = z.infer<typeof insertAffiliateSaleSchema>;
export type AffiliateSale = typeof affiliateSales.$inferSelect;

// Affiliate payouts
export const affiliatePayouts = pgTable("affiliate_payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").references(() => affiliates.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  payoutMethod: text("payout_method").notNull(),
  payoutEmail: text("payout_email").notNull(),
  status: text("status").default("pending"),
  transactionId: text("transaction_id"),
  notes: text("notes"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAffiliatePayoutSchema = createInsertSchema(affiliatePayouts).omit({ id: true, processedAt: true, createdAt: true });
export type InsertAffiliatePayout = z.infer<typeof insertAffiliatePayoutSchema>;
export type AffiliatePayout = typeof affiliatePayouts.$inferSelect;


// Batches table - Links products to batch numbers with manufacturing info
export const batches = pgTable("batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  batchNumber: text("batch_number").notNull().unique(),
  manufactureDate: timestamp("manufacture_date").notNull(),
  expirationDate: timestamp("expiration_date"),
  status: text("status").default("active"), // active, archived, expired
  storageNotes: text("storage_notes"),
  qrCode: text("qr_code"), // URL or code for QR generation
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBatchSchema = createInsertSchema(batches).omit({ id: true, createdAt: true });
export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batches.$inferSelect;

// Product storage profiles - Storage/stability info for each product
export const productStorageProfiles = pgTable("product_storage_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().unique(),
  powderAppearance: text("powder_appearance"), // What the lyophilized powder should look like
  storageTempDry: text("storage_temp_dry"), // Temperature range before reconstitution
  storageTempReconstituted: text("storage_temp_reconstituted"), // Temperature range after reconstitution
  stabilityWindowDry: text("stability_window_dry"), // How long powder is stable
  stabilityWindowReconstituted: text("stability_window_reconstituted"), // How long after mixing
  lightSensitivity: text("light_sensitivity"),
  humidityNotes: text("humidity_notes"),
  redFlags: text("red_flags").array(), // Warning signs of degradation
  handlingInstructions: text("handling_instructions"),
  reconstitutionNotes: text("reconstitution_notes"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductStorageProfileSchema = createInsertSchema(productStorageProfiles).omit({ id: true, updatedAt: true });
export type InsertProductStorageProfile = z.infer<typeof insertProductStorageProfileSchema>;
export type ProductStorageProfile = typeof productStorageProfiles.$inferSelect;

// Legal documents table - Policies, compliance docs, etc.
export const legalDocuments = pgTable("legal_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(), // policies, compliance, legal, terms
  content: text("content").notNull(),
  summary: text("summary"),
  effectiveDate: timestamp("effective_date"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  isPublished: boolean("is_published").default(true),
  sortOrder: integer("sort_order").default(0),
});

export const insertLegalDocumentSchema = createInsertSchema(legalDocuments).omit({ id: true, lastUpdated: true });
export type InsertLegalDocument = z.infer<typeof insertLegalDocumentSchema>;
export type LegalDocument = typeof legalDocuments.$inferSelect;

// FAQ entries table - Categorized FAQ items
export const faqEntries = pgTable("faq_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(), // orders, shipping, products, coa, research, returns
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").default(0),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFaqEntrySchema = createInsertSchema(faqEntries).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFaqEntry = z.infer<typeof insertFaqEntrySchema>;
export type FaqEntry = typeof faqEntries.$inferSelect;

// Education articles table - Research education content
export const educationArticles = pgTable("education_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(), // basics, coa-guide, storage, handling, glossary
  summary: text("summary"),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  readTimeMinutes: integer("read_time_minutes").default(5),
  relatedProductIds: text("related_product_ids").array(),
  sortOrder: integer("sort_order").default(0),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEducationArticleSchema = createInsertSchema(educationArticles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEducationArticle = z.infer<typeof insertEducationArticleSchema>;
export type EducationArticle = typeof educationArticles.$inferSelect;

// COA Glossary terms - For explaining COA terminology
export const coaGlossaryTerms = pgTable("coa_glossary_terms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  term: text("term").notNull().unique(),
  definition: text("definition").notNull(),
  category: text("category"), // testing, purity, methods
  sortOrder: integer("sort_order").default(0),
});

export const insertCoaGlossaryTermSchema = createInsertSchema(coaGlossaryTerms).omit({ id: true });
export type InsertCoaGlossaryTerm = z.infer<typeof insertCoaGlossaryTermSchema>;
export type CoaGlossaryTerm = typeof coaGlossaryTerms.$inferSelect;

// Stock notifications - Notify customers when products are back in stock
export const stockNotifications = pgTable("stock_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  email: text("email").notNull(),
  status: text("status").default("pending"), // pending, notified, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  notifiedAt: timestamp("notified_at"),
});

export const insertStockNotificationSchema = createInsertSchema(stockNotifications).omit({ id: true, createdAt: true, notifiedAt: true });
export type InsertStockNotification = z.infer<typeof insertStockNotificationSchema>;
export type StockNotification = typeof stockNotifications.$inferSelect;

// Discount codes table - Admin-managed promo codes
export const discountCodes = pgTable("discount_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).notNull(),
  type: text("type").notNull().default("promo"), // promo, affiliate_basic, affiliate_personal
  affiliateId: varchar("affiliate_id"), // Links to affiliate if type is affiliate_*
  freeShipping: boolean("free_shipping").default(false),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  maxUsages: integer("max_usages"), // null = unlimited
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({ id: true, usageCount: true, createdAt: true });
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;

// Newsletter subscribers table - Email list for pre-launch
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  source: text("source").default("website"), // website, early_access_modal, footer, etc.
  status: text("status").default("subscribed"), // subscribed, unsubscribed
  createdAt: timestamp("created_at").defaultNow(),
  lastEmailSentAt: timestamp("last_email_sent_at"),
  unsubscribedAt: timestamp("unsubscribed_at"),
  unsubscribeReason: text("unsubscribe_reason"), // Optional reason for unsubscribing
});

// Predefined unsubscribe reasons
export const unsubscribeReasons = [
  "Too many emails",
  "Content not relevant",
  "No longer interested",
  "Never signed up",
  "Other",
] as const;
export type UnsubscribeReason = typeof unsubscribeReasons[number];

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({ id: true, status: true, createdAt: true, lastEmailSentAt: true, unsubscribedAt: true, unsubscribeReason: true });
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// Price history table - Track price changes for transparency (like a stock exchange)
export const priceHistory = pgTable("price_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  oldPrice: decimal("old_price", { precision: 10, scale: 2 }).notNull(),
  newPrice: decimal("new_price", { precision: 10, scale: 2 }).notNull(),
  changePercent: decimal("change_percent", { precision: 6, scale: 2 }).notNull(), // e.g., -5.50 or +12.30
  reason: text("reason").notNull(), // Predefined reason category
  notes: text("notes"), // Optional additional explanation
  effectiveDate: timestamp("effective_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({ id: true, createdAt: true });
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;

// Price change reason categories for transparency
export const priceChangeReasons = {
  RAW_MATERIAL_COST: "Raw material cost adjustment",
  BULK_PURCHASING: "Bulk purchasing discount passed to customers",
  MARKET_ADJUSTMENT: "Market price alignment",
  SUPPLY_CHAIN: "Supply chain optimization",
  QUALITY_UPGRADE: "Enhanced quality/purity standards",
  SEASONAL: "Seasonal adjustment",
  PROMOTIONAL: "Limited time promotional pricing",
  DEMAND: "Demand-based adjustment",
  INFLATION: "Inflation adjustment",
  NEW_SUPPLIER: "New supplier partnership",
} as const;

export type PriceChangeReason = keyof typeof priceChangeReasons;

// Type for price trend display (used in frontend)
export type PriceTrend = {
  direction: "up" | "down" | "stable";
  percentChange: number;
  lastChangeDate: Date;
  reason: string;
  reasonDescription: string;
  notes?: string;
};

// User Research Profile - Track research journey metrics for phase/title system
export const userResearchProfiles = pgTable("user_research_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  educationCount: integer("education_count").default(0), // Education pages viewed/completed
  safetyCompleted: boolean("safety_completed").default(false),
  coaEducationViewed: boolean("coa_education_viewed").default(false),
  batchVerificationCount: integer("batch_verification_count").default(0),
  compoundsTrackedCount: integer("compounds_tracked_count").default(0), // Watchlist/portfolio count
  earlyAccessMember: boolean("early_access_member").default(false), // Set true if account created before launch
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserResearchProfileSchema = createInsertSchema(userResearchProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserResearchProfile = z.infer<typeof insertUserResearchProfileSchema>;
export type UserResearchProfile = typeof userResearchProfiles.$inferSelect;

// Research phase types
export const researchPhases = ["Observer", "Initiate", "Researcher", "Analyst", "Specialist"] as const;
export type ResearchPhase = typeof researchPhases[number];

// Research title types
export const researchTitles = [
  "Getting Started",
  "Safety-First", 
  "Compound Tracker",
  "Stack Builder",
  "COA Confident",
  "Verification Regular",
  "Early Access Member"
] as const;
export type ResearchTitle = typeof researchTitles[number];

// Academy Progress table - Track user learning journey
export const academyProgress = pgTable("academy_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  persona: text("persona"), // beginner, intermediate, advanced
  completedLessons: text("completed_lessons").array().default([]),
  currentModule: integer("current_module").default(0),
  currentLesson: integer("current_lesson").default(0),
  achievements: text("achievements").array().default([]),
  quizScores: jsonb("quiz_scores").default({}),
  totalXp: integer("total_xp").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
});

export const insertAcademyProgressSchema = createInsertSchema(academyProgress).omit({ id: true, startedAt: true, lastActivityAt: true });
export type InsertAcademyProgress = z.infer<typeof insertAcademyProgressSchema>;
export type AcademyProgress = typeof academyProgress.$inferSelect;

// Email events table - Track all transactional email sends
export const emailEvents = pgTable("email_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id"),
  type: text("type").notNull(), // order_confirmation, stock_notification, etc.
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("sent"), // sent, failed, bounced, complained
  sesMessageId: text("ses_message_id"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmailEventSchema = createInsertSchema(emailEvents).omit({ id: true, createdAt: true });
export type InsertEmailEvent = z.infer<typeof insertEmailEventSchema>;
export type EmailEvent = typeof emailEvents.$inferSelect;

// Academy persona types
export const academyPersonas = {
  beginner: "Complete Beginner",
  intermediate: "Some Science Background",
  advanced: "Experienced Researcher",
} as const;

export type AcademyPersona = keyof typeof academyPersonas;

// Academy achievement definitions
export const academyAchievements = {
  FIRST_LESSON: { id: "first_lesson", name: "First Steps", description: "Complete your first lesson", xp: 10, icon: "Sparkles" },
  ORIENTATION_COMPLETE: { id: "orientation_complete", name: "Oriented", description: "Complete the Orientation module", xp: 50, icon: "Compass" },
  FOUNDATIONS_COMPLETE: { id: "foundations_complete", name: "Foundation Builder", description: "Complete Core Foundations", xp: 100, icon: "Building" },
  SKILLS_COMPLETE: { id: "skills_complete", name: "Skilled Researcher", description: "Complete Research Skills", xp: 100, icon: "FlaskConical" },
  LAB_READY: { id: "lab_ready", name: "Lab Ready", description: "Complete all modules", xp: 200, icon: "Award" },
  PERFECT_QUIZ: { id: "perfect_quiz", name: "Perfect Score", description: "Get 100% on any quiz", xp: 25, icon: "Star" },
  SCHOLAR: { id: "scholar", name: "Scholar", description: "Earn 500+ XP", xp: 0, icon: "GraduationCap" },
} as const;

export type AcademyAchievementId = keyof typeof academyAchievements;

// Wishlists table - Track user wishlists
export const wishlists = pgTable("wishlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  productId: varchar("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWishlistSchema = createInsertSchema(wishlists).omit({ id: true, createdAt: true });
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Wishlist = typeof wishlists.$inferSelect;

// Subscriptions table - Track PayPal subscriptions
export const subscriptionFrequencyEnum = ["weekly", "biweekly", "monthly"] as const;
export const subscriptionStatusEnum = ["pending", "active", "cancelled", "suspended", "expired"] as const;

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  // PayPal subscription details
  paypalSubscriptionId: varchar("paypal_subscription_id").unique(),
  paypalPlanId: varchar("paypal_plan_id"),
  paypalProductId: varchar("paypal_product_id"),
  // Subscription configuration
  frequency: text("frequency").notNull(), // weekly, biweekly, monthly
  status: text("status").default("pending"), // pending, active, cancelled, suspended, expired
  // Pricing
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).notNull(),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }).notNull(),
  // Product details (JSON for flexibility - can have multiple products)
  items: jsonb("items").$type<Array<{
    productId: string;
    productName: string;
    dosage?: string;
    quantity: number;
    price: number;
  }>>(),
  // Shipping info
  shippingAddress: jsonb("shipping_address").$type<{
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>(),
  // Timestamps
  nextBillingDate: timestamp("next_billing_date"),
  lastBilledAt: timestamp("last_billed_at"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Saved Addresses table - Multiple addresses per user
export const savedAddresses = pgTable("saved_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  label: text("label").notNull(), // "Home", "Work", "Lab", etc.
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull().default("United States"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSavedAddressSchema = createInsertSchema(savedAddresses).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSavedAddress = z.infer<typeof insertSavedAddressSchema>;
export type SavedAddress = typeof savedAddresses.$inferSelect;

// Notification Preferences table - User notification settings
export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  // Email notifications
  emailOrderConfirmation: boolean("email_order_confirmation").default(true),
  emailShippingUpdates: boolean("email_shipping_updates").default(true),
  emailPromotions: boolean("email_promotions").default(true),
  emailNewsletter: boolean("email_newsletter").default(true),
  emailAcademyUpdates: boolean("email_academy_updates").default(true),
  emailStockAlerts: boolean("email_stock_alerts").default(true),
  // SMS notifications (for future use)
  smsOrderUpdates: boolean("sms_order_updates").default(false),
  smsPromotions: boolean("sms_promotions").default(false),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;

// Research Notes table - Personal journal & logbook for tracking research
export const researchNotes = pgTable("research_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  productId: varchar("product_id"), // Optional link to product
  batchNumber: text("batch_number"), // Optional link to batch
  tags: text("tags").array(),
  isPinned: boolean("is_pinned").default(false),
  // ===== Logbook structured fields (all nullable for back-compat) =====
  dose: decimal("dose", { precision: 10, scale: 3 }),
  doseUnit: text("dose_unit"), // mcg | mg | iu
  route: text("route"), // subq | im | oral | intranasal | topical
  administeredAt: timestamp("administered_at"), // when the dose was actually taken
  bodyWeightKg: decimal("body_weight_kg", { precision: 6, scale: 2 }),
  sleepScore: integer("sleep_score"), // 1-10
  energyScore: integer("energy_score"), // 1-10
  moodScore: integer("mood_score"), // 1-10
  cycleMarker: text("cycle_marker"), // start | end | null=continue
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const DOSE_UNITS = ["mcg", "mg", "iu"] as const;
export const ROUTES = ["subq", "im", "oral", "intranasal", "topical"] as const;
export const CYCLE_MARKERS = ["start", "end", "continue"] as const;

// Reserved tag namespace prefixes used by the logbook to keep its own
// metadata distinct from user-typed tags. The reserved prefixes:
//   compound:NAME  — free-text custom compound for an entry
//   source:logbook — discriminator marking the row as a logbook entry
//                    (vs a pre-existing /api/research-notes journal note)
export const LOGBOOK_SOURCE_TAG = "source:logbook";
export const LOGBOOK_RESERVED_TAG_PREFIXES = ["compound:", "source:"] as const;

// Coerce a "decimal" field that may arrive as a string from JSON forms.
// Rejects non-numeric strings (returns a Zod issue) instead of silently
// passing garbage to the DB.
const decimalField = (max: number) =>
  z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((v, ctx) => {
      if (v === null || v === undefined || v === "") return null;
      const n = typeof v === "number" ? v : parseFloat(v);
      if (!Number.isFinite(n)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must be a finite number",
        });
        return z.NEVER;
      }
      if (n < 0 || n > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Must be between 0 and ${max}`,
        });
        return z.NEVER;
      }
      // drizzle `decimal` columns expect strings.
      return String(n);
    });

export const insertResearchNoteSchema = createInsertSchema(researchNotes, {
  dose: decimalField(10_000_000),
  bodyWeightKg: decimalField(1000),
  doseUnit: z.enum(DOSE_UNITS).optional().nullable(),
  route: z.enum(ROUTES).optional().nullable(),
  cycleMarker: z.enum(CYCLE_MARKERS).optional().nullable().transform((v) => v === "continue" ? null : v ?? null),
  sleepScore: z.number().int().min(1).max(10).optional().nullable(),
  energyScore: z.number().int().min(1).max(10).optional().nullable(),
  moodScore: z.number().int().min(1).max(10).optional().nullable(),
  administeredAt: z
    .union([z.string(), z.date()])
    .optional()
    .nullable()
    .transform((v, ctx) => {
      if (!v) return null;
      const d = typeof v === "string" ? new Date(v) : v;
      if (isNaN(d.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid date",
        });
        return z.NEVER;
      }
      return d;
    }),
}).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertResearchNote = z.infer<typeof insertResearchNoteSchema>;
export type ResearchNote = typeof researchNotes.$inferSelect;

// Login History table - Track login activity for security
export const loginHistory = pgTable("login_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  device: text("device"), // parsed device type: desktop, mobile, tablet
  browser: text("browser"), // parsed browser name
  location: text("location"), // approximate location from IP
  success: boolean("success").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLoginHistorySchema = createInsertSchema(loginHistory).omit({ id: true, createdAt: true });
export type InsertLoginHistory = z.infer<typeof insertLoginHistorySchema>;
export type LoginHistory = typeof loginHistory.$inferSelect;

// Batch Verification History - Track user batch lookups
export const batchVerificationHistory = pgTable("batch_verification_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  batchNumber: text("batch_number").notNull(),
  productName: text("product_name"),
  verified: boolean("verified").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBatchVerificationHistorySchema = createInsertSchema(batchVerificationHistory).omit({ id: true, createdAt: true });
export type InsertBatchVerificationHistory = z.infer<typeof insertBatchVerificationHistorySchema>;
export type BatchVerificationHistory = typeof batchVerificationHistory.$inferSelect;

// Cycle Tags - User-supplied names for cycles derived from logbook entries.
// Cycles themselves are derived (not stored), so this table is keyed by the
// stable triple (userId, compoundKey, cycleStartTimestamp) which survives
// edits to the underlying entries.
export const cycleTags = pgTable(
  "cycle_tags",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    compoundKey: text("compound_key").notNull(),
    cycleStartTimestamp: timestamp("cycle_start_timestamp").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    unique("uq_cycle_tags_user_compound_start").on(
      table.userId,
      table.compoundKey,
      table.cycleStartTimestamp,
    ),
  ],
);

export const insertCycleTagSchema = createInsertSchema(cycleTags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCycleTag = z.infer<typeof insertCycleTagSchema>;
export type CycleTag = typeof cycleTags.$inferSelect;

// Saved Stacks - User-created custom peptide stacks
export const savedStacks = pgTable("saved_stacks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  peptideIds: text("peptide_ids").array().notNull(),
  peptideNames: text("peptide_names").array().notNull(),
  shareCode: varchar("share_code").unique(),
  sourceShareCode: varchar("source_share_code"),
  isPublic: boolean("is_public").default(false),
  saveCount: integer("save_count").default(0),
  synergyScore: integer("synergy_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSavedStackSchema = createInsertSchema(savedStacks).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSavedStack = z.infer<typeof insertSavedStackSchema>;
export type SavedStack = typeof savedStacks.$inferSelect;

export const productVotes = pgTable("product_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  visitorId: varchar("visitor_id").notNull(),
  userId: varchar("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductVoteSchema = createInsertSchema(productVotes).omit({ id: true, createdAt: true });
export type InsertProductVote = z.infer<typeof insertProductVoteSchema>;
export type ProductVote = typeof productVotes.$inferSelect;

export const waitlistSignups = pgTable("waitlist_signups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  source: varchar("source").notNull(),
  productInterest: text("product_interest").array(),
  optsInMarketing: boolean("opts_in_marketing").default(false),
  foundingMember: boolean("founding_member").default(false),
  foundingMemberNumber: integer("founding_member_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWaitlistSignupSchema = createInsertSchema(waitlistSignups).omit({ id: true, createdAt: true, foundingMember: true, foundingMemberNumber: true });
export type InsertWaitlistSignup = z.infer<typeof insertWaitlistSignupSchema>;
export type WaitlistSignup = typeof waitlistSignups.$inferSelect;

// Dead-link hit tracking table
export const deadLinkHits = pgTable(
  "dead_link_hits",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    type: varchar("type", { length: 20 }).notNull(),
    slug: text("slug").notNull(),
    count: integer("count").notNull().default(1),
    lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  },
  (table) => [
    unique("uq_dead_link_hits_type_slug").on(table.type, table.slug),
  ],
);

export const insertDeadLinkHitSchema = createInsertSchema(deadLinkHits).omit({ id: true });
export type InsertDeadLinkHit = z.infer<typeof insertDeadLinkHitSchema>;
export type DeadLinkHit = typeof deadLinkHits.$inferSelect;

// Citation dismissal tracking table
export const citationDismissals = pgTable("citation_dismissals", {
  pmid: varchar("pmid", { length: 20 }).primaryKey(),
  dismissedAt: timestamp("dismissed_at").defaultNow().notNull(),
});

export type CitationDismissal = typeof citationDismissals.$inferSelect;

// Stripe presets table - Admin-managed colour/label presets for category stripes
export const stripePresets = pgTable(
  "stripe_presets",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    label: text("label").notNull(),
    accentColor: text("accent_color").notNull(),
    sortOrder: integer("sort_order").default(0),
  },
  (table) => [unique("uq_stripe_presets_label").on(table.label)],
);

export const insertStripePresetSchema = createInsertSchema(stripePresets)
  .omit({ id: true })
  .extend({
    accentColor: z
      .string()
      .refine(
        (v) => /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(v),
        { message: "accentColor must be a valid hex colour (e.g. #f97316)" },
      ),
  });
export type InsertStripePreset = z.infer<typeof insertStripePresetSchema>;
export type StripePreset = typeof stripePresets.$inferSelect;

// Lab Notes table - database-driven blog posts with Markdown support
export const labNotes = pgTable("lab_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  iconName: text("icon_name").notNull().default("Beaker"),
  accentColor: text("accent_color").notNull().default("#21d8ff"),
  publishedAt: timestamp("published_at").defaultNow(),
  sortOrder: integer("sort_order").default(0),
  isPublished: boolean("is_published").default(true),
});

export const insertLabNoteSchema = createInsertSchema(labNotes).omit({ id: true });
export type InsertLabNote = z.infer<typeof insertLabNoteSchema>;
export type LabNote = typeof labNotes.$inferSelect;

// Research Stacks table — DB as single source of truth for all curated stacks
export const researchStacks = pgTable("research_stacks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subtitle: text("subtitle").default(""),
  description: text("description").notNull(),
  longDescription: text("long_description").default(""),
  peptideIds: text("peptide_ids").array().notNull().default(sql`'{}'`),
  peptideDetails: jsonb("peptide_details").default(sql`'[]'::jsonb`),
  keyBenefits: text("key_benefits").array().default(sql`'{}'`),
  researchApplications: text("research_applications").array().default(sql`'{}'`),
  synergyCopy: jsonb("synergy_copy").default(sql`'{}'::jsonb`),
  storageGuide: text("storage_guide").default(""),
  educationLinks: jsonb("education_links").default(sql`'[]'::jsonb`),
  iconName: text("icon_name").default("FlaskConical"),
  color: text("color").default("#6366f1"),
  badge: text("badge"),
  badgeColor: text("badge_color"),
  category: text("category").default("Recovery"),
  synergyBonus: integer("synergy_bonus").default(0),
  detailPageId: text("detail_page_id"),
  showOnPage: boolean("show_on_page").default(false),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResearchStackSchema = createInsertSchema(researchStacks).omit({ id: true, createdAt: true });
export type InsertResearchStack = z.infer<typeof insertResearchStackSchema>;
export type ResearchStack = typeof researchStacks.$inferSelect;

// Article Views — tracks which education articles a logged-in user has viewed, for cross-device Continue Reading
export const articleViews = pgTable(
  "article_views",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    articleId: varchar("article_id").notNull(),
    viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  },
  (table) => [
    unique("uq_article_views_user_article").on(table.userId, table.articleId),
    index("idx_article_views_user_viewedat").on(table.userId, table.viewedAt),
  ],
);

export type ArticleView = typeof articleViews.$inferSelect;
