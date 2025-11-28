import { 
  users, products, coas, orders, contacts, affiliateApplications, affiliates, affiliateSales, affiliatePayouts,
  type User, type UpsertUser,
  type Product, type InsertProduct,
  type Coa, type InsertCoa,
  type Order, type InsertOrder,
  type Contact, type InsertContact,
  type AffiliateApplication, type InsertAffiliateApplication,
  type Affiliate, type InsertAffiliate,
  type AffiliateSale, type InsertAffiliateSale,
  type AffiliatePayout, type InsertAffiliatePayout
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  searchProducts(query: string): Promise<Product[]>;
  
  getCoaByBatchNumber(batchNumber: string): Promise<Coa | undefined>;
  getAllCoas(): Promise<Coa[]>;
  createCoa(coa: InsertCoa): Promise<Coa>;
  updateCoa(id: string, coa: Partial<InsertCoa>): Promise<Coa | undefined>;
  deleteCoa(id: string): Promise<boolean>;
  
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  getOrdersByEmail(email: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  getOrderByStripeSessionId(sessionId: string): Promise<Order | undefined>;
  
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;
  
  // Affiliate Applications
  createAffiliateApplication(application: InsertAffiliateApplication): Promise<AffiliateApplication>;
  getAllAffiliateApplications(): Promise<AffiliateApplication[]>;
  getAffiliateApplication(id: string): Promise<AffiliateApplication | undefined>;
  updateAffiliateApplicationStatus(id: string, status: string): Promise<AffiliateApplication | undefined>;
  
  // Affiliates
  createAffiliate(affiliate: InsertAffiliate): Promise<Affiliate>;
  getAffiliate(id: string): Promise<Affiliate | undefined>;
  getAffiliateByEmail(email: string): Promise<Affiliate | undefined>;
  getAffiliateByReferralCode(referralCode: string): Promise<Affiliate | undefined>;
  getAffiliateByUserId(userId: string): Promise<Affiliate | undefined>;
  getAllAffiliates(): Promise<Affiliate[]>;
  getAffiliateTeam(affiliateId: string): Promise<Affiliate[]>;
  updateAffiliate(id: string, data: Partial<InsertAffiliate>): Promise<Affiliate | undefined>;
  updateAffiliateEarnings(id: string, tier1Amount: number, tier2Amount: number, pendingAmount: number): Promise<Affiliate | undefined>;
  
  // Affiliate Sales
  createAffiliateSale(sale: InsertAffiliateSale): Promise<AffiliateSale>;
  getAffiliateSalesByAffiliateId(affiliateId: string): Promise<AffiliateSale[]>;
  getAffiliateSalesByUplineId(uplineId: string): Promise<AffiliateSale[]>;
  getAllAffiliateSales(): Promise<AffiliateSale[]>;
  updateAffiliateSaleStatus(id: string, tier1Status?: string, tier2Status?: string): Promise<AffiliateSale | undefined>;
  
  // Affiliate Payouts
  createAffiliatePayout(payout: InsertAffiliatePayout): Promise<AffiliatePayout>;
  getAffiliatePayoutsByAffiliateId(affiliateId: string): Promise<AffiliatePayout[]>;
  getAllAffiliatePayouts(): Promise<AffiliatePayout[]>;
  updateAffiliatePayoutStatus(id: string, status: string, transactionId?: string): Promise<AffiliatePayout | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.featured, true));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(productData).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchPattern = `%${query}%`;
    return db.select().from(products).where(
      or(
        ilike(products.name, searchPattern),
        ilike(products.description, searchPattern),
        ilike(products.category, searchPattern)
      )
    );
  }

  async getCoaByBatchNumber(batchNumber: string): Promise<Coa | undefined> {
    const [coa] = await db.select().from(coas).where(eq(coas.batchNumber, batchNumber));
    return coa || undefined;
  }

  async getAllCoas(): Promise<Coa[]> {
    return db.select().from(coas);
  }

  async createCoa(insertCoa: InsertCoa): Promise<Coa> {
    const [coa] = await db.insert(coas).values(insertCoa).returning();
    return coa;
  }

  async updateCoa(id: string, coaData: Partial<InsertCoa>): Promise<Coa | undefined> {
    const [coa] = await db.update(coas).set(coaData).where(eq(coas.id, id)).returning();
    return coa || undefined;
  }

  async deleteCoa(id: string): Promise<boolean> {
    const result = await db.delete(coas).where(eq(coas.id, id)).returning();
    return result.length > 0;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getOrdersByEmail(email: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.email, email)).orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return order || undefined;
  }

  async getOrderByStripeSessionId(sessionId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.stripeSessionId, sessionId));
    return order || undefined;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return db.select().from(contacts);
  }

  // Affiliate Applications
  async createAffiliateApplication(insertApplication: InsertAffiliateApplication): Promise<AffiliateApplication> {
    const [application] = await db.insert(affiliateApplications).values(insertApplication).returning();
    return application;
  }

  async getAllAffiliateApplications(): Promise<AffiliateApplication[]> {
    return db.select().from(affiliateApplications).orderBy(desc(affiliateApplications.createdAt));
  }

  async getAffiliateApplication(id: string): Promise<AffiliateApplication | undefined> {
    const [application] = await db.select().from(affiliateApplications).where(eq(affiliateApplications.id, id));
    return application || undefined;
  }

  async updateAffiliateApplicationStatus(id: string, status: string): Promise<AffiliateApplication | undefined> {
    const [application] = await db.update(affiliateApplications).set({ status }).where(eq(affiliateApplications.id, id)).returning();
    return application || undefined;
  }

  // Affiliates
  async createAffiliate(insertAffiliate: InsertAffiliate): Promise<Affiliate> {
    const [affiliate] = await db.insert(affiliates).values(insertAffiliate).returning();
    return affiliate;
  }

  async getAffiliate(id: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, id));
    return affiliate || undefined;
  }

  async getAffiliateByEmail(email: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.email, email));
    return affiliate || undefined;
  }

  async getAffiliateByReferralCode(referralCode: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.referralCode, referralCode));
    return affiliate || undefined;
  }

  async getAffiliateByUserId(userId: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.userId, userId));
    return affiliate || undefined;
  }

  async getAllAffiliates(): Promise<Affiliate[]> {
    return db.select().from(affiliates).orderBy(desc(affiliates.createdAt));
  }

  async getAffiliateTeam(affiliateId: string): Promise<Affiliate[]> {
    return db.select().from(affiliates).where(eq(affiliates.uplineId, affiliateId));
  }

  async updateAffiliate(id: string, data: Partial<InsertAffiliate>): Promise<Affiliate | undefined> {
    const [affiliate] = await db.update(affiliates).set(data).where(eq(affiliates.id, id)).returning();
    return affiliate || undefined;
  }

  async updateAffiliateEarnings(id: string, tier1Amount: number, tier2Amount: number, pendingAmount: number): Promise<Affiliate | undefined> {
    const [affiliate] = await db.update(affiliates).set({
      totalEarnedTier1: sql`${affiliates.totalEarnedTier1} + ${tier1Amount}`,
      totalEarnedTier2: sql`${affiliates.totalEarnedTier2} + ${tier2Amount}`,
      pendingBalance: sql`${affiliates.pendingBalance} + ${pendingAmount}`,
    }).where(eq(affiliates.id, id)).returning();
    return affiliate || undefined;
  }

  // Affiliate Sales
  async createAffiliateSale(insertSale: InsertAffiliateSale): Promise<AffiliateSale> {
    const [sale] = await db.insert(affiliateSales).values(insertSale).returning();
    return sale;
  }

  async getAffiliateSalesByAffiliateId(affiliateId: string): Promise<AffiliateSale[]> {
    return db.select().from(affiliateSales).where(eq(affiliateSales.affiliateId, affiliateId)).orderBy(desc(affiliateSales.createdAt));
  }

  async getAffiliateSalesByUplineId(uplineId: string): Promise<AffiliateSale[]> {
    return db.select().from(affiliateSales).where(eq(affiliateSales.uplineId, uplineId)).orderBy(desc(affiliateSales.createdAt));
  }

  async getAllAffiliateSales(): Promise<AffiliateSale[]> {
    return db.select().from(affiliateSales).orderBy(desc(affiliateSales.createdAt));
  }

  async updateAffiliateSaleStatus(id: string, tier1Status?: string, tier2Status?: string): Promise<AffiliateSale | undefined> {
    const updateData: any = {};
    if (tier1Status) updateData.tier1Status = tier1Status;
    if (tier2Status) updateData.tier2Status = tier2Status;
    const [sale] = await db.update(affiliateSales).set(updateData).where(eq(affiliateSales.id, id)).returning();
    return sale || undefined;
  }

  // Affiliate Payouts
  async createAffiliatePayout(insertPayout: InsertAffiliatePayout): Promise<AffiliatePayout> {
    const [payout] = await db.insert(affiliatePayouts).values(insertPayout).returning();
    return payout;
  }

  async getAffiliatePayoutsByAffiliateId(affiliateId: string): Promise<AffiliatePayout[]> {
    return db.select().from(affiliatePayouts).where(eq(affiliatePayouts.affiliateId, affiliateId)).orderBy(desc(affiliatePayouts.createdAt));
  }

  async getAllAffiliatePayouts(): Promise<AffiliatePayout[]> {
    return db.select().from(affiliatePayouts).orderBy(desc(affiliatePayouts.createdAt));
  }

  async updateAffiliatePayoutStatus(id: string, status: string, transactionId?: string): Promise<AffiliatePayout | undefined> {
    const updateData: any = { status };
    if (transactionId) updateData.transactionId = transactionId;
    if (status === 'processed') updateData.processedAt = new Date();
    const [payout] = await db.update(affiliatePayouts).set(updateData).where(eq(affiliatePayouts.id, id)).returning();
    return payout || undefined;
  }
}

export const storage = new DatabaseStorage();
