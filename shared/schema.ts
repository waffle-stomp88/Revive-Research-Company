import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, decimal, timestamp, index, jsonb } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  category: text("category").notNull(),
  inStock: boolean("in_stock").default(true),
  stockAmount: integer("stock_amount").default(0),
  dosageOptions: text("dosage_options").array(),
  featured: boolean("featured").default(false),
  benefits: text("benefits").array(),
  usage: text("usage"),
  imageUrl: text("image_url"),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// COA (Certificate of Authenticity) table
export const coas = pgTable("coas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchNumber: text("batch_number").notNull().unique(),
  productId: varchar("product_id").notNull(),
  productName: text("product_name").notNull(),
  testDate: text("test_date").notNull(),
  expirationDate: text("expiration_date").notNull(),
  purity: text("purity").notNull(),
  labName: text("lab_name").notNull(),
  verified: boolean("verified").default(true),
  results: text("results").array(),
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
  status: text("status").default("pending"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Contact form submissions
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
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
  referralCode: text("referral_code").notNull().unique(),
  uplineId: varchar("upline_id"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("20.00"),
  payoutMethod: text("payout_method").default("paypal"),
  payoutEmail: text("payout_email"),
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
