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
  
  // Dashboard
  getDashboardMetrics(daysBack: number): Promise<DashboardMetrics>;
  
  // Product Sales Velocity
  getSellingFastProducts(daysBack: number, minOrders: number): Promise<string[]>;
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
}

export const storage = new DatabaseStorage();
