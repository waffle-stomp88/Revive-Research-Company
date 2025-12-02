import { 
  users, products, coas, orders, contacts, affiliateApplications, affiliates, affiliateSales, affiliatePayouts, reviews,
  batches, productStorageProfiles, legalDocuments, faqEntries, educationArticles, coaGlossaryTerms, stockNotifications, discountCodes, newsletterSubscribers,
  productDosageStock,
  type User, type UpsertUser,
  type Product, type InsertProduct,
  type ProductDosageStock, type InsertProductDosageStock, type ProductWithDosageStock,
  type Coa, type InsertCoa,
  type Order, type InsertOrder,
  type Contact, type InsertContact,
  type AffiliateApplication, type InsertAffiliateApplication,
  type Affiliate, type InsertAffiliate,
  type AffiliateSale, type InsertAffiliateSale,
  type AffiliatePayout, type InsertAffiliatePayout,
  type Review, type InsertReview,
  type ReviewableOrder,
  type Batch, type InsertBatch,
  type ProductStorageProfile, type InsertProductStorageProfile,
  type LegalDocument, type InsertLegalDocument,
  type FaqEntry, type InsertFaqEntry,
  type EducationArticle, type InsertEducationArticle,
  type CoaGlossaryTerm, type InsertCoaGlossaryTerm,
  type StockNotification, type InsertStockNotification,
  type DiscountCode, type InsertDiscountCode,
  type NewsletterSubscriber, type InsertNewsletterSubscriber
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, desc, sql, gte, and, lt, count, sum } from "drizzle-orm";

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProductsSold: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  lowStockProducts: Array<{ id: string; name: string; stockAmount: number }>;
  outOfStockProducts: Array<{ id: string; name: string }>;
  recentContacts: number;
  pendingAffiliateApplications: number;
  activeAffiliates: number;
  pendingPayouts: number;
  totalAffiliateCommissions: number;
  topProducts: Array<{ productId: string; productName: string; totalSold: number; revenue: number }>;
  recentOrders: Order[];
  revenueTrend: Array<{ date: string; revenue: number; orders: number }>;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  
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
  markContactAsRead(id: string): Promise<Contact | undefined>;
  getUnreadContactsCount(): Promise<number>;
  
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
  getAffiliateByBasicReferralCode(basicReferralCode: string): Promise<Affiliate | undefined>;
  getAffiliateByUserId(userId: string): Promise<Affiliate | undefined>;
  getAllAffiliates(): Promise<Affiliate[]>;
  getAffiliateTeam(affiliateId: string): Promise<Affiliate[]>;
  updateAffiliate(id: string, data: Partial<InsertAffiliate>): Promise<Affiliate | undefined>;
  deleteAffiliate(id: string): Promise<boolean>;
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
  
  // Dashboard
  getDashboardMetrics(daysBack: number): Promise<DashboardMetrics>;
  
  // Product Sales Velocity
  getSellingFastProducts(daysBack: number, minOrders: number): Promise<string[]>;
  
  // Reviews
  getProductReviews(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getProductAverageRating(productId: string): Promise<{ average: number; count: number }>;
  getAllReviews(): Promise<Review[]>;
  deleteReview(id: string): Promise<boolean>;
  updateReviewApproval(id: string, isApproved: boolean): Promise<Review | undefined>;
  
  // Reviewable orders (for verified purchase reviews)
  getReviewableOrdersForUser(userId: string): Promise<ReviewableOrder[]>;
  hasUserReviewedOrder(userId: string, orderId: string): Promise<boolean>;
  canUserReviewOrder(userId: string, orderId: string): Promise<{ canReview: boolean; reason?: string }>;
  getReviewByOrderId(orderId: string): Promise<Review | undefined>;
  
  // Affiliate earnings and leaderboard
  getAffiliateEarningsOverTime(affiliateId: string, weeks: number): Promise<Array<{ weekStart: string; weekEnd: string; tier1: number; tier2: number; total: number }>>;
  getAffiliateLeaderboard(period: 'weekly' | 'monthly'): Promise<Array<{ rank: number; affiliateId: string; displayName: string; salesCount: number; totalRevenue: number; tier1Earnings: number; tier2Earnings: number }>>;
  
  // Batches
  getAllBatches(): Promise<Batch[]>;
  getBatch(id: string): Promise<Batch | undefined>;
  getBatchByBatchNumber(batchNumber: string): Promise<Batch | undefined>;
  getBatchesByProductId(productId: string): Promise<Batch[]>;
  getProductBatches(productId: string): Promise<Batch[]>;
  getBatchCoas(batchId: string): Promise<Coa[]>;
  createBatch(batch: InsertBatch): Promise<Batch>;
  updateBatch(id: string, batch: Partial<InsertBatch>): Promise<Batch | undefined>;
  
  // Product Storage Profiles
  getProductStorageProfile(productId: string): Promise<ProductStorageProfile | undefined>;
  createProductStorageProfile(profile: InsertProductStorageProfile): Promise<ProductStorageProfile>;
  updateProductStorageProfile(productId: string, profile: Partial<InsertProductStorageProfile>): Promise<ProductStorageProfile | undefined>;
  
  // Legal Documents
  getAllLegalDocuments(): Promise<LegalDocument[]>;
  getLegalDocumentBySlug(slug: string): Promise<LegalDocument | undefined>;
  getLegalDocumentsByCategory(category: string): Promise<LegalDocument[]>;
  createLegalDocument(doc: InsertLegalDocument): Promise<LegalDocument>;
  updateLegalDocument(id: string, doc: Partial<InsertLegalDocument>): Promise<LegalDocument | undefined>;
  
  // FAQ Entries
  getAllFaqEntries(): Promise<FaqEntry[]>;
  getFaqEntriesByCategory(category: string): Promise<FaqEntry[]>;
  createFaqEntry(entry: InsertFaqEntry): Promise<FaqEntry>;
  updateFaqEntry(id: string, entry: Partial<InsertFaqEntry>): Promise<FaqEntry | undefined>;
  deleteFaqEntry(id: string): Promise<boolean>;
  
  // Education Articles
  getAllEducationArticles(): Promise<EducationArticle[]>;
  getEducationArticleBySlug(slug: string): Promise<EducationArticle | undefined>;
  getEducationArticlesByCategory(category: string): Promise<EducationArticle[]>;
  getEducationArticlesByProductId(productId: string): Promise<EducationArticle[]>;
  createEducationArticle(article: InsertEducationArticle): Promise<EducationArticle>;
  updateEducationArticle(id: string, article: Partial<InsertEducationArticle>): Promise<EducationArticle | undefined>;
  
  // COA Glossary Terms
  getAllCoaGlossaryTerms(): Promise<CoaGlossaryTerm[]>;
  createCoaGlossaryTerm(term: InsertCoaGlossaryTerm): Promise<CoaGlossaryTerm>;
  
  // COA Library search
  searchCoas(filters: { productId?: string; batchNumber?: string; testType?: string }): Promise<Coa[]>;
  
  // Stock Notifications
  createStockNotification(notification: InsertStockNotification): Promise<StockNotification>;
  getStockNotificationsByProductId(productId: string): Promise<StockNotification[]>;
  getPendingStockNotifications(): Promise<StockNotification[]>;
  getAllStockNotifications(): Promise<StockNotification[]>;
  markNotificationAsSent(id: string): Promise<StockNotification | undefined>;
  deleteStockNotification(id: string): Promise<boolean>;
  deleteStockNotificationsBulk(ids: string[]): Promise<number>;
  checkExistingNotification(productId: string, email: string): Promise<StockNotification | undefined>;
  
  // Discount Codes
  getAllDiscountCodes(): Promise<DiscountCode[]>;
  getDiscountCode(id: string): Promise<DiscountCode | undefined>;
  getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined>;
  createDiscountCode(code: InsertDiscountCode): Promise<DiscountCode>;
  updateDiscountCode(id: string, data: Partial<InsertDiscountCode>): Promise<DiscountCode | undefined>;
  toggleDiscountCodeActive(id: string, isActive: boolean): Promise<DiscountCode | undefined>;
  deleteDiscountCode(id: string): Promise<boolean>;
  getAffiliateDiscountCodes(affiliateId: string): Promise<DiscountCode[]>;
  
  // Newsletter Subscribers
  subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]>;
  unsubscribeFromNewsletter(email: string): Promise<NewsletterSubscriber | undefined>;
  checkNewsletterSubscription(email: string): Promise<NewsletterSubscriber | undefined>;
  
  // Product Dosage Stock Management
  getProductDosageStocks(productId: string): Promise<ProductDosageStock[]>;
  getAllProductDosageStocks(): Promise<ProductDosageStock[]>;
  getProductWithDosageStock(productId: string): Promise<ProductWithDosageStock | undefined>;
  getAllProductsWithDosageStock(): Promise<ProductWithDosageStock[]>;
  upsertDosageStock(productId: string, dosage: string, stockAmount: number, inStock: boolean): Promise<ProductDosageStock>;
  deleteDosageStock(id: string): Promise<boolean>;
  syncProductDosageStocks(productId: string, dosageStocks: Array<{ dosage: string; stockAmount: number; inStock: boolean }>): Promise<ProductDosageStock[]>;
  initializeDosageStocksFromProduct(productId: string): Promise<ProductDosageStock[]>;
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

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
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
    // Auto-sync stock status and quantity
    const normalizedData = { ...productData };
    const stockAmount = normalizedData.stockAmount;
    
    // If stockAmount is being set to 0 or less, auto-mark as out of stock
    if (stockAmount !== undefined && stockAmount !== null && stockAmount <= 0) {
      normalizedData.inStock = false;
      normalizedData.stockAmount = 0;
    }
    
    // If marking as out of stock, set quantity to 0
    if (normalizedData.inStock === false) {
      normalizedData.stockAmount = 0;
    }
    
    // If stockAmount is being set to > 0, auto-mark as in stock
    if (stockAmount !== undefined && stockAmount !== null && stockAmount > 0) {
      normalizedData.inStock = true;
    }
    
    const [product] = await db.update(products).set(normalizedData).where(eq(products.id, id)).returning();
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
    return db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async markContactAsRead(id: string): Promise<Contact | undefined> {
    const [contact] = await db.update(contacts).set({ isRead: true }).where(eq(contacts.id, id)).returning();
    return contact || undefined;
  }

  async getUnreadContactsCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(contacts).where(eq(contacts.isRead, false));
    return Number(result?.count || 0);
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
    const [affiliate] = await db.select().from(affiliates).where(ilike(affiliates.email, email));
    return affiliate || undefined;
  }

  async getAffiliateByReferralCode(referralCode: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.referralCode, referralCode));
    return affiliate || undefined;
  }

  async getAffiliateByBasicReferralCode(basicReferralCode: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.basicReferralCode, basicReferralCode));
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

  async deleteAffiliate(id: string): Promise<boolean> {
    const result = await db.delete(affiliates).where(eq(affiliates.id, id)).returning();
    return result.length > 0;
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

  async getDashboardMetrics(daysBack: number = 30): Promise<DashboardMetrics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    startDate.setHours(0, 0, 0, 0);

    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const filteredOrders = allOrders.filter(order => 
      order.createdAt && new Date(order.createdAt) >= startDate
    );

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || '0'), 0);
    const totalOrders = filteredOrders.length;
    const totalProductsSold = filteredOrders.reduce((sum, order) => sum + (order.quantity || 1), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
    const processingOrders = allOrders.filter(o => o.status === 'processing').length;
    const completedOrders = allOrders.filter(o => o.status === 'completed' || o.status === 'shipped').length;

    const allProducts = await db.select().from(products);
    const lowStockProducts = allProducts
      .filter(p => p.inStock && p.stockAmount !== null && p.stockAmount > 0 && p.stockAmount <= 20)
      .map(p => ({ id: p.id, name: p.name, stockAmount: p.stockAmount || 0 }));
    const outOfStockProducts = allProducts
      .filter(p => !p.inStock || p.stockAmount === 0)
      .map(p => ({ id: p.id, name: p.name }));

    const allContacts = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
    // Count unread contacts instead of just recent ones
    const recentContacts = allContacts.filter(c => c.isRead === false).length;

    const pendingApplications = await db.select().from(affiliateApplications)
      .where(eq(affiliateApplications.status, 'pending'));
    const pendingAffiliateApplications = pendingApplications.length;

    const allAffiliates = await db.select().from(affiliates);
    const activeAffiliates = allAffiliates.filter(a => a.isActive).length;

    const allPayouts = await db.select().from(affiliatePayouts);
    const pendingPayouts = allPayouts.filter(p => p.status === 'pending').length;

    const allAffiliateSales = await db.select().from(affiliateSales);
    const totalAffiliateCommissions = allAffiliateSales.reduce((sum, sale) => 
      sum + parseFloat(sale.commissionTier1 || '0') + parseFloat(sale.commissionTier2 || '0'), 0
    );

    const productSales: Record<string, { productId: string; productName: string; totalSold: number; revenue: number }> = {};
    for (const order of filteredOrders) {
      const product = allProducts.find(p => p.id === order.productId);
      if (product) {
        if (!productSales[order.productId]) {
          productSales[order.productId] = {
            productId: order.productId,
            productName: product.name,
            totalSold: 0,
            revenue: 0
          };
        }
        productSales[order.productId].totalSold += order.quantity || 1;
        productSales[order.productId].revenue += parseFloat(order.totalAmount || '0');
      }
    }
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const recentOrders = allOrders.slice(0, 10);

    const revenueTrendMap: Record<string, { revenue: number; orders: number }> = {};
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      revenueTrendMap[dateStr] = { revenue: 0, orders: 0 };
    }
    for (const order of filteredOrders) {
      if (order.createdAt) {
        const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
        if (revenueTrendMap[dateStr]) {
          revenueTrendMap[dateStr].revenue += parseFloat(order.totalAmount || '0');
          revenueTrendMap[dateStr].orders += 1;
        }
      }
    }
    const revenueTrend = Object.entries(revenueTrendMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalProductsSold,
      pendingOrders,
      processingOrders,
      completedOrders,
      lowStockProducts,
      outOfStockProducts,
      recentContacts,
      pendingAffiliateApplications,
      activeAffiliates,
      pendingPayouts,
      totalAffiliateCommissions,
      topProducts,
      recentOrders,
      revenueTrend
    };
  }

  async getSellingFastProducts(daysBack: number = 7, minOrders: number = 3): Promise<string[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    startDate.setHours(0, 0, 0, 0);

    const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const filteredOrders = recentOrders.filter(order => 
      order.createdAt && new Date(order.createdAt) >= startDate && 
      (order.status === 'completed' || order.status === 'shipped' || order.status === 'processing' || order.status === 'pending')
    );

    // Count orders per product
    const productOrderCounts: Record<string, number> = {};
    for (const order of filteredOrders) {
      productOrderCounts[order.productId] = (productOrderCounts[order.productId] || 0) + (order.quantity || 1);
    }

    // Return product IDs that have >= minOrders in the time period
    const sellingFastIds = Object.entries(productOrderCounts)
      .filter(([_, count]) => count >= minOrders)
      .map(([productId]) => productId);

    return sellingFastIds;
  }

  // Reviews
  async getProductReviews(productId: string): Promise<Review[]> {
    return db.select().from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async getProductAverageRating(productId: string): Promise<{ average: number; count: number }> {
    const productReviews = await db.select().from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)));
    
    if (productReviews.length === 0) {
      return { average: 0, count: 0 };
    }
    
    const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
    return { 
      average: totalRating / productReviews.length, 
      count: productReviews.length 
    };
  }

  async getAllReviews(): Promise<Review[]> {
    return db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    return result.length > 0;
  }

  async updateReviewApproval(id: string, isApproved: boolean): Promise<Review | undefined> {
    const [review] = await db.update(reviews).set({ isApproved }).where(eq(reviews.id, id)).returning();
    return review || undefined;
  }

  // Get orders that are eligible for review (30+ days old, not yet reviewed)
  async getReviewableOrdersForUser(userId: string): Promise<ReviewableOrder[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all completed orders for this user that are at least 30 days old
    const userOrders = await db.select().from(orders)
      .where(and(
        eq(orders.userId, userId),
        or(eq(orders.status, 'completed'), eq(orders.status, 'shipped'))
      ));

    // Get all reviews by this user
    const userReviews = await db.select().from(reviews)
      .where(eq(reviews.userId, userId));
    
    const reviewedOrderIds = new Set(userReviews.map(r => r.orderId));

    // Build reviewable orders list
    const reviewableOrders: ReviewableOrder[] = [];
    
    for (const order of userOrders) {
      if (!order.createdAt) continue;
      
      const orderDate = new Date(order.createdAt);
      const eligibleDate = new Date(orderDate);
      eligibleDate.setDate(eligibleDate.getDate() + 30);
      
      const hasReviewed = reviewedOrderIds.has(order.id);
      
      // Get product info
      const [product] = await db.select().from(products).where(eq(products.id, order.productId));
      
      if (product) {
        reviewableOrders.push({
          orderId: order.id,
          productId: order.productId,
          productName: product.name,
          productImageUrl: product.imageUrl,
          orderDate,
          eligibleDate,
          hasReviewed
        });
      }
    }

    return reviewableOrders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
  }

  async hasUserReviewedOrder(userId: string, orderId: string): Promise<boolean> {
    const [review] = await db.select().from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.orderId, orderId)));
    return !!review;
  }

  async canUserReviewOrder(userId: string, orderId: string): Promise<{ canReview: boolean; reason?: string }> {
    // Check if order exists and belongs to user
    const [order] = await db.select().from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)));
    
    if (!order) {
      return { canReview: false, reason: "Order not found or doesn't belong to you" };
    }

    // Check if order is completed/shipped
    if (order.status !== 'completed' && order.status !== 'shipped') {
      return { canReview: false, reason: "Order must be completed before leaving a review" };
    }

    // Check 30-day waiting period
    if (!order.createdAt) {
      return { canReview: false, reason: "Order date not available" };
    }

    const orderDate = new Date(order.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (orderDate > thirtyDaysAgo) {
      const daysRemaining = Math.ceil((orderDate.getTime() + 30 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000));
      return { canReview: false, reason: `You can leave a review in ${daysRemaining} days` };
    }

    // Check if already reviewed
    const hasReviewed = await this.hasUserReviewedOrder(userId, orderId);
    if (hasReviewed) {
      return { canReview: false, reason: "You have already reviewed this order" };
    }

    return { canReview: true };
  }

  async getReviewByOrderId(orderId: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews)
      .where(eq(reviews.orderId, orderId));
    return review || undefined;
  }

  async getAffiliateEarningsOverTime(affiliateId: string, weeks: number = 12): Promise<Array<{ weekStart: string; weekEnd: string; tier1: number; tier2: number; total: number }>> {
    const result: Array<{ weekStart: string; weekEnd: string; tier1: number; tier2: number; total: number }> = [];
    
    // Get all sales for this affiliate
    const allSales = await db.select().from(affiliateSales)
      .where(eq(affiliateSales.affiliateId, affiliateId))
      .orderBy(affiliateSales.createdAt);
    
    // Get tier 2 earnings (where this affiliate is the upline)
    const tier2Sales = await db.select().from(affiliateSales)
      .where(eq(affiliateSales.uplineId, affiliateId))
      .orderBy(affiliateSales.createdAt);
    
    // Generate weeks going back from today
    const now = new Date();
    for (let i = weeks - 1; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      
      // Calculate tier 1 earnings for this week
      const tier1 = allSales
        .filter(sale => {
          if (!sale.createdAt) return false;
          const saleDate = new Date(sale.createdAt);
          return saleDate >= weekStart && saleDate <= weekEnd;
        })
        .reduce((sum, sale) => sum + parseFloat(sale.commissionTier1 || '0'), 0);
      
      // Calculate tier 2 earnings for this week
      const tier2 = tier2Sales
        .filter(sale => {
          if (!sale.createdAt) return false;
          const saleDate = new Date(sale.createdAt);
          return saleDate >= weekStart && saleDate <= weekEnd;
        })
        .reduce((sum, sale) => sum + parseFloat(sale.commissionTier2 || '0'), 0);
      
      result.push({
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        tier1,
        tier2,
        total: tier1 + tier2
      });
    }
    
    return result;
  }

  async getAffiliateLeaderboard(period: 'weekly' | 'monthly'): Promise<Array<{ rank: number; affiliateId: string; displayName: string; salesCount: number; totalRevenue: number; tier1Earnings: number; tier2Earnings: number }>> {
    // Calculate date range
    const now = new Date();
    const startDate = new Date(now);
    if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }
    startDate.setHours(0, 0, 0, 0);
    
    // Get all affiliates
    const allAffiliates = await db.select().from(affiliates).where(eq(affiliates.isActive, true));
    
    // Get all sales within the period
    const allSales = await db.select().from(affiliateSales)
      .orderBy(affiliateSales.createdAt);
    
    const filteredSales = allSales.filter(sale => {
      if (!sale.createdAt) return false;
      return new Date(sale.createdAt) >= startDate;
    });
    
    // Aggregate by affiliate
    const affiliateStats: Map<string, { salesCount: number; totalRevenue: number; tier1Earnings: number; tier2Earnings: number }> = new Map();
    
    for (const affiliate of allAffiliates) {
      affiliateStats.set(affiliate.id, { salesCount: 0, totalRevenue: 0, tier1Earnings: 0, tier2Earnings: 0 });
    }
    
    for (const sale of filteredSales) {
      const stats = affiliateStats.get(sale.affiliateId);
      if (stats) {
        stats.salesCount++;
        stats.totalRevenue += parseFloat(sale.orderTotal || '0');
        stats.tier1Earnings += parseFloat(sale.commissionTier1 || '0');
      }
      
      // Also add tier 2 earnings to upline
      if (sale.uplineId) {
        const uplineStats = affiliateStats.get(sale.uplineId);
        if (uplineStats) {
          uplineStats.tier2Earnings += parseFloat(sale.commissionTier2 || '0');
        }
      }
    }
    
    // Convert to array and sort by total earnings
    const leaderboard = allAffiliates
      .map(affiliate => {
        const stats = affiliateStats.get(affiliate.id) || { salesCount: 0, totalRevenue: 0, tier1Earnings: 0, tier2Earnings: 0 };
        const nameParts = affiliate.fullName.split(' ');
        const displayName = nameParts.length > 1 
          ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
          : nameParts[0];
        
        return {
          affiliateId: affiliate.id,
          displayName,
          ...stats,
          totalEarnings: stats.tier1Earnings + stats.tier2Earnings
        };
      })
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, 50) // Top 50
      .map((item, index) => ({
        rank: index + 1,
        affiliateId: item.affiliateId,
        displayName: item.displayName,
        salesCount: item.salesCount,
        totalRevenue: item.totalRevenue,
        tier1Earnings: item.tier1Earnings,
        tier2Earnings: item.tier2Earnings
      }));
    
    return leaderboard;
  }
  
  // Batches implementation
  async getAllBatches(): Promise<Batch[]> {
    return db.select().from(batches).orderBy(desc(batches.createdAt));
  }
  
  async getBatch(id: string): Promise<Batch | undefined> {
    const [batch] = await db.select().from(batches).where(eq(batches.id, id));
    return batch || undefined;
  }
  
  async getBatchByBatchNumber(batchNumber: string): Promise<Batch | undefined> {
    const [batch] = await db.select().from(batches).where(eq(batches.batchNumber, batchNumber));
    return batch || undefined;
  }
  
  async getBatchesByProductId(productId: string): Promise<Batch[]> {
    return db.select().from(batches).where(eq(batches.productId, productId)).orderBy(desc(batches.manufactureDate));
  }
  
  async createBatch(batch: InsertBatch): Promise<Batch> {
    const [newBatch] = await db.insert(batches).values(batch).returning();
    return newBatch;
  }
  
  async updateBatch(id: string, batchData: Partial<InsertBatch>): Promise<Batch | undefined> {
    const [updated] = await db.update(batches).set(batchData).where(eq(batches.id, id)).returning();
    return updated || undefined;
  }
  
  async getProductBatches(productId: string): Promise<Batch[]> {
    return this.getBatchesByProductId(productId);
  }
  
  async getBatchCoas(batchId: string): Promise<Coa[]> {
    const batch = await this.getBatch(batchId);
    if (!batch) return [];
    return db.select().from(coas).where(eq(coas.batchNumber, batch.batchNumber)).orderBy(desc(coas.testDate));
  }
  
  // Product Storage Profiles implementation
  async getProductStorageProfile(productId: string): Promise<ProductStorageProfile | undefined> {
    const [profile] = await db.select().from(productStorageProfiles).where(eq(productStorageProfiles.productId, productId));
    return profile || undefined;
  }
  
  async createProductStorageProfile(profile: InsertProductStorageProfile): Promise<ProductStorageProfile> {
    const [newProfile] = await db.insert(productStorageProfiles).values(profile).returning();
    return newProfile;
  }
  
  async updateProductStorageProfile(productId: string, profileData: Partial<InsertProductStorageProfile>): Promise<ProductStorageProfile | undefined> {
    const [updated] = await db.update(productStorageProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(productStorageProfiles.productId, productId))
      .returning();
    return updated || undefined;
  }
  
  // Legal Documents implementation
  async getAllLegalDocuments(): Promise<LegalDocument[]> {
    return db.select().from(legalDocuments).where(eq(legalDocuments.isPublished, true)).orderBy(legalDocuments.sortOrder);
  }
  
  async getLegalDocumentBySlug(slug: string): Promise<LegalDocument | undefined> {
    const [doc] = await db.select().from(legalDocuments).where(eq(legalDocuments.slug, slug));
    return doc || undefined;
  }
  
  async getLegalDocumentsByCategory(category: string): Promise<LegalDocument[]> {
    return db.select().from(legalDocuments)
      .where(and(eq(legalDocuments.category, category), eq(legalDocuments.isPublished, true)))
      .orderBy(legalDocuments.sortOrder);
  }
  
  async createLegalDocument(doc: InsertLegalDocument): Promise<LegalDocument> {
    const [newDoc] = await db.insert(legalDocuments).values(doc).returning();
    return newDoc;
  }
  
  async updateLegalDocument(id: string, docData: Partial<InsertLegalDocument>): Promise<LegalDocument | undefined> {
    const [updated] = await db.update(legalDocuments)
      .set({ ...docData, lastUpdated: new Date() })
      .where(eq(legalDocuments.id, id))
      .returning();
    return updated || undefined;
  }
  
  // FAQ Entries implementation
  async getAllFaqEntries(): Promise<FaqEntry[]> {
    return db.select().from(faqEntries).where(eq(faqEntries.isPublished, true)).orderBy(faqEntries.category, faqEntries.sortOrder);
  }
  
  async getFaqEntriesByCategory(category: string): Promise<FaqEntry[]> {
    return db.select().from(faqEntries)
      .where(and(eq(faqEntries.category, category), eq(faqEntries.isPublished, true)))
      .orderBy(faqEntries.sortOrder);
  }
  
  async createFaqEntry(entry: InsertFaqEntry): Promise<FaqEntry> {
    const [newEntry] = await db.insert(faqEntries).values(entry).returning();
    return newEntry;
  }
  
  async updateFaqEntry(id: string, entryData: Partial<InsertFaqEntry>): Promise<FaqEntry | undefined> {
    const [updated] = await db.update(faqEntries)
      .set({ ...entryData, updatedAt: new Date() })
      .where(eq(faqEntries.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deleteFaqEntry(id: string): Promise<boolean> {
    const result = await db.delete(faqEntries).where(eq(faqEntries.id, id));
    return true;
  }
  
  // Education Articles implementation
  async getAllEducationArticles(): Promise<EducationArticle[]> {
    return db.select().from(educationArticles).where(eq(educationArticles.isPublished, true)).orderBy(educationArticles.sortOrder);
  }
  
  async getEducationArticleBySlug(slug: string): Promise<EducationArticle | undefined> {
    const [article] = await db.select().from(educationArticles).where(eq(educationArticles.slug, slug));
    return article || undefined;
  }
  
  async getEducationArticlesByCategory(category: string): Promise<EducationArticle[]> {
    return db.select().from(educationArticles)
      .where(and(eq(educationArticles.category, category), eq(educationArticles.isPublished, true)))
      .orderBy(educationArticles.sortOrder);
  }
  
  async getEducationArticlesByProductId(productId: string): Promise<EducationArticle[]> {
    const allArticles = await db.select().from(educationArticles)
      .where(eq(educationArticles.isPublished, true));
    return allArticles.filter(article => 
      article.relatedProductIds && article.relatedProductIds.includes(productId)
    );
  }
  
  async createEducationArticle(article: InsertEducationArticle): Promise<EducationArticle> {
    const [newArticle] = await db.insert(educationArticles).values(article).returning();
    return newArticle;
  }
  
  async updateEducationArticle(id: string, articleData: Partial<InsertEducationArticle>): Promise<EducationArticle | undefined> {
    const [updated] = await db.update(educationArticles)
      .set({ ...articleData, updatedAt: new Date() })
      .where(eq(educationArticles.id, id))
      .returning();
    return updated || undefined;
  }
  
  // COA Glossary Terms implementation
  async getAllCoaGlossaryTerms(): Promise<CoaGlossaryTerm[]> {
    return db.select().from(coaGlossaryTerms).orderBy(coaGlossaryTerms.sortOrder);
  }
  
  async createCoaGlossaryTerm(term: InsertCoaGlossaryTerm): Promise<CoaGlossaryTerm> {
    const [newTerm] = await db.insert(coaGlossaryTerms).values(term).returning();
    return newTerm;
  }
  
  // COA Library search implementation
  async searchCoas(filters: { productId?: string; batchNumber?: string; testType?: string }): Promise<Coa[]> {
    const conditions = [];
    
    if (filters.productId) {
      conditions.push(eq(coas.productId, filters.productId));
    }
    if (filters.batchNumber) {
      conditions.push(ilike(coas.batchNumber, `%${filters.batchNumber}%`));
    }
    
    if (conditions.length === 0) {
      return db.select().from(coas).orderBy(desc(coas.testDate));
    }
    
    return db.select().from(coas).where(and(...conditions)).orderBy(desc(coas.testDate));
  }
  
  // Stock Notifications implementation
  async createStockNotification(notification: InsertStockNotification): Promise<StockNotification> {
    const [newNotification] = await db.insert(stockNotifications).values(notification).returning();
    return newNotification;
  }
  
  async getStockNotificationsByProductId(productId: string): Promise<StockNotification[]> {
    return db.select().from(stockNotifications)
      .where(eq(stockNotifications.productId, productId))
      .orderBy(desc(stockNotifications.createdAt));
  }
  
  async getPendingStockNotifications(): Promise<StockNotification[]> {
    return db.select().from(stockNotifications)
      .where(eq(stockNotifications.status, "pending"))
      .orderBy(stockNotifications.createdAt);
  }
  
  async getAllStockNotifications(): Promise<StockNotification[]> {
    return db.select().from(stockNotifications)
      .orderBy(desc(stockNotifications.createdAt));
  }
  
  async markNotificationAsSent(id: string): Promise<StockNotification | undefined> {
    const [updated] = await db.update(stockNotifications)
      .set({ status: "notified", notifiedAt: new Date() })
      .where(eq(stockNotifications.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deleteStockNotification(id: string): Promise<boolean> {
    const result = await db.delete(stockNotifications)
      .where(eq(stockNotifications.id, id));
    return !!result;
  }
  
  async deleteStockNotificationsBulk(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.delete(stockNotifications)
      .where(sql`${stockNotifications.id} = ANY(${ids}::text[])`);
    return ids.length;
  }
  
  async checkExistingNotification(productId: string, email: string): Promise<StockNotification | undefined> {
    const [existing] = await db.select().from(stockNotifications)
      .where(and(
        eq(stockNotifications.productId, productId),
        eq(stockNotifications.email, email),
        eq(stockNotifications.status, "pending")
      ));
    return existing || undefined;
  }
  
  // Discount Codes implementation
  async getAllDiscountCodes(): Promise<DiscountCode[]> {
    return db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));
  }
  
  async getDiscountCode(id: string): Promise<DiscountCode | undefined> {
    const [code] = await db.select().from(discountCodes).where(eq(discountCodes.id, id));
    return code || undefined;
  }
  
  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    const [discountCode] = await db.select().from(discountCodes)
      .where(eq(discountCodes.code, code.toUpperCase()));
    return discountCode || undefined;
  }
  
  async createDiscountCode(codeData: InsertDiscountCode): Promise<DiscountCode> {
    const [newCode] = await db.insert(discountCodes).values({
      ...codeData,
      code: codeData.code.toUpperCase()
    }).returning();
    return newCode;
  }
  
  async updateDiscountCode(id: string, data: Partial<InsertDiscountCode>): Promise<DiscountCode | undefined> {
    const updateData = { ...data };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    const [updated] = await db.update(discountCodes)
      .set(updateData)
      .where(eq(discountCodes.id, id))
      .returning();
    return updated || undefined;
  }
  
  async toggleDiscountCodeActive(id: string, isActive: boolean): Promise<DiscountCode | undefined> {
    const [updated] = await db.update(discountCodes)
      .set({ isActive })
      .where(eq(discountCodes.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deleteDiscountCode(id: string): Promise<boolean> {
    const result = await db.delete(discountCodes).where(eq(discountCodes.id, id));
    return !!result;
  }
  
  async getAffiliateDiscountCodes(affiliateId: string): Promise<DiscountCode[]> {
    return db.select().from(discountCodes)
      .where(eq(discountCodes.affiliateId, affiliateId))
      .orderBy(desc(discountCodes.createdAt));
  }

  async subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [result] = await db.insert(newsletterSubscribers).values(subscriber).onConflictDoUpdate({
      target: newsletterSubscribers.email,
      set: { status: "subscribed" }
    }).returning();
    return result;
  }

  async getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt));
  }

  async unsubscribeFromNewsletter(email: string): Promise<NewsletterSubscriber | undefined> {
    const [result] = await db.update(newsletterSubscribers).set({ status: "unsubscribed" }).where(eq(newsletterSubscribers.email, email)).returning();
    return result || undefined;
  }

  async checkNewsletterSubscription(email: string): Promise<NewsletterSubscriber | undefined> {
    const [result] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
    return result || undefined;
  }

  // Product Dosage Stock Management Implementation
  async getProductDosageStocks(productId: string): Promise<ProductDosageStock[]> {
    return db.select().from(productDosageStock).where(eq(productDosageStock.productId, productId));
  }

  async getAllProductDosageStocks(): Promise<ProductDosageStock[]> {
    return db.select().from(productDosageStock);
  }

  async getProductWithDosageStock(productId: string): Promise<ProductWithDosageStock | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!product) return undefined;
    
    const dosageStocks = await this.getProductDosageStocks(productId);
    return { ...product, dosageStocks };
  }

  async getAllProductsWithDosageStock(): Promise<ProductWithDosageStock[]> {
    const allProducts = await db.select().from(products);
    const allDosageStocks = await db.select().from(productDosageStock);
    
    return allProducts.map(product => ({
      ...product,
      dosageStocks: allDosageStocks.filter(ds => ds.productId === product.id)
    }));
  }

  async upsertDosageStock(productId: string, dosage: string, stockAmount: number, inStock: boolean): Promise<ProductDosageStock> {
    // Check if this dosage stock already exists
    const [existing] = await db.select().from(productDosageStock)
      .where(and(
        eq(productDosageStock.productId, productId),
        eq(productDosageStock.dosage, dosage)
      ));
    
    if (existing) {
      // Update existing
      const [updated] = await db.update(productDosageStock)
        .set({ stockAmount, inStock })
        .where(eq(productDosageStock.id, existing.id))
        .returning();
      return updated;
    } else {
      // Insert new
      const [created] = await db.insert(productDosageStock)
        .values({ productId, dosage, stockAmount, inStock })
        .returning();
      return created;
    }
  }

  async deleteDosageStock(id: string): Promise<boolean> {
    const result = await db.delete(productDosageStock).where(eq(productDosageStock.id, id)).returning();
    return result.length > 0;
  }

  async syncProductDosageStocks(
    productId: string, 
    dosageStocks: Array<{ dosage: string; stockAmount: number; inStock: boolean }>
  ): Promise<ProductDosageStock[]> {
    // Get current dosage stocks for this product
    const currentStocks = await this.getProductDosageStocks(productId);
    const currentDosages = new Set(currentStocks.map(s => s.dosage));
    const newDosages = new Set(dosageStocks.map(s => s.dosage));
    
    // Delete dosages that are no longer in the list
    for (const stock of currentStocks) {
      if (!newDosages.has(stock.dosage)) {
        await this.deleteDosageStock(stock.id);
      }
    }
    
    // Upsert all dosage stocks
    const results: ProductDosageStock[] = [];
    for (const ds of dosageStocks) {
      const result = await this.upsertDosageStock(productId, ds.dosage, ds.stockAmount, ds.inStock);
      results.push(result);
    }
    
    // Update product-level inStock based on whether ANY dosage is in stock
    const anyInStock = results.some(r => r.inStock);
    const totalStock = results.reduce((sum, r) => sum + r.stockAmount, 0);
    await db.update(products).set({ 
      inStock: anyInStock,
      stockAmount: totalStock
    }).where(eq(products.id, productId));
    
    return results;
  }

  async initializeDosageStocksFromProduct(productId: string): Promise<ProductDosageStock[]> {
    const product = await this.getProduct(productId);
    if (!product) return [];
    
    const dosageOptions = product.dosageOptions || ["10mg"];
    const stockPerDosage = Math.floor((product.stockAmount || 0) / dosageOptions.length);
    const isInStock = product.inStock ?? true;
    
    const results: ProductDosageStock[] = [];
    for (const dosage of dosageOptions) {
      const result = await this.upsertDosageStock(productId, dosage, stockPerDosage, isInStock);
      results.push(result);
    }
    
    return results;
  }
}

export const storage = new DatabaseStorage();
