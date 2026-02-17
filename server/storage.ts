import { 
  users, products, coas, orders, contacts, affiliateApplications, affiliates, affiliateSales, affiliatePayouts,
  batches, productStorageProfiles, legalDocuments, faqEntries, educationArticles, coaGlossaryTerms, stockNotifications, discountCodes, newsletterSubscribers,
  productDosageStock, priceHistory, academyProgress, emailEvents, wishlists, userResearchProfiles, productBehavioralMetrics,
  savedAddresses, notificationPreferences, researchNotes, loginHistory, batchVerificationHistory, productVotes,
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
  type Batch, type InsertBatch,
  type ProductStorageProfile, type InsertProductStorageProfile,
  type LegalDocument, type InsertLegalDocument,
  type FaqEntry, type InsertFaqEntry,
  type EducationArticle, type InsertEducationArticle,
  type CoaGlossaryTerm, type InsertCoaGlossaryTerm,
  type StockNotification, type InsertStockNotification,
  type DiscountCode, type InsertDiscountCode,
  type NewsletterSubscriber, type InsertNewsletterSubscriber,
  type PriceHistory, type InsertPriceHistory, type PriceTrend, type PriceChangeReason,
  type AcademyProgress, type InsertAcademyProgress,
  type EmailEvent, type InsertEmailEvent,
  type Wishlist, type InsertWishlist,
  type UserResearchProfile, type InsertUserResearchProfile,
  type ResearchPhase, type ResearchTitle,
  type ProductBehavioralMetrics, type InsertProductBehavioralMetrics,
  type SavedAddress, type InsertSavedAddress,
  type NotificationPreferences, type InsertNotificationPreferences,
  type ResearchNote, type InsertResearchNote,
  type LoginHistory, type InsertLoginHistory,
  type BatchVerificationHistory, type InsertBatchVerificationHistory,
  type ProductVote, type InsertProductVote,
  type WaitlistSignup, type InsertWaitlistSignup,
  waitlistSignups,
  priceChangeReasons
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
  outOfStockDosagesCount: number;
  lowStockDosagesCount: number;
  recentContacts: number;
  pendingAffiliateApplications: number;
  activeAffiliates: number;
  pendingPayouts: number;
  totalAffiliateCommissions: number;
  topProducts: Array<{ productId: string; productName: string; totalSold: number; revenue: number }>;
  recentOrders: Order[];
  revenueTrend: Array<{ date: string; revenue: number; orders: number }>;
}

export interface CustomerWithStats {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  isAdmin: boolean | null;
  createdAt: Date | null;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: Date | null;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  setUserAdmin(id: string, isAdmin: boolean): Promise<User | undefined>;
  getAllCustomersWithStats(): Promise<CustomerWithStats[]>;
  
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
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
  deleteOrder(id: string): Promise<boolean>;
  updateOrderFulfillment(id: string, data: {
    fulfillmentStatus?: string;
    fulfillmentNotes?: string;
    fulfilledBy?: string;
    paymentConfirmed?: boolean;
    addressCollected?: boolean;
    packed?: boolean;
    trackingNumber?: string;
    carrier?: string;
  }): Promise<Order | undefined>;
  updateOrderEmailStatus(id: string, status: string, error?: string): Promise<Order | undefined>;
  
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;
  getContactsByType(type: "contact" | "wholesale"): Promise<Contact[]>;
  getContactsByStatus(status: "new" | "read" | "responded" | "archived"): Promise<Contact[]>;
  updateContactStatus(id: string, status: "new" | "read" | "responded" | "archived", respondedBy?: string): Promise<Contact | undefined>;
  updateContactNotes(id: string, notes: string): Promise<Contact | undefined>;
  updateContactTestStatus(id: string, isTest: boolean): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<boolean>;
  getNewContactsCount(): Promise<number>;
  
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
  getGraduateDiscountForUser(userId: string): Promise<DiscountCode | undefined>;
  createDiscountCode(code: InsertDiscountCode): Promise<DiscountCode>;
  updateDiscountCode(id: string, data: Partial<InsertDiscountCode>): Promise<DiscountCode | undefined>;
  toggleDiscountCodeActive(id: string, isActive: boolean): Promise<DiscountCode | undefined>;
  deleteDiscountCode(id: string): Promise<boolean>;
  getAffiliateDiscountCodes(affiliateId: string): Promise<DiscountCode[]>;
  
  // Newsletter Subscribers
  subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]>;
  deleteNewsletterSubscriber(id: string): Promise<boolean>;
  unsubscribeFromNewsletter(email: string, reason?: string): Promise<NewsletterSubscriber | undefined>;
  checkNewsletterSubscription(email: string): Promise<NewsletterSubscriber | undefined>;
  updateLastEmailSent(email: string): Promise<NewsletterSubscriber | undefined>;
  getNewsletterStats(): Promise<{ total: number; active: number; unsubscribed: number }>;
  
  // Product Dosage Stock Management
  getProductDosageStocks(productId: string): Promise<ProductDosageStock[]>;
  getAllProductDosageStocks(): Promise<ProductDosageStock[]>;
  getProductWithDosageStock(productId: string): Promise<ProductWithDosageStock | undefined>;
  getAllProductsWithDosageStock(): Promise<ProductWithDosageStock[]>;
  upsertDosageStock(productId: string, dosage: string, stockAmount: number, inStock: boolean, price?: string | null, originalPrice?: string | null): Promise<ProductDosageStock>;
  deleteDosageStock(id: string): Promise<boolean>;
  syncProductDosageStocks(productId: string, dosageStocks: Array<{ dosage: string; stockAmount: number; inStock: boolean; price?: string | null; originalPrice?: string | null }>): Promise<ProductDosageStock[]>;
  initializeDosageStocksFromProduct(productId: string): Promise<ProductDosageStock[]>;
  
  // Stock Management (Live Inventory)
  decrementStock(items: Array<{ productId: string; dosage?: string; quantity: number }>): Promise<{ success: boolean; errors?: string[] }>;
  validateStock(items: Array<{ productId: string; dosage?: string; quantity: number }>): Promise<{ valid: boolean; errors?: string[] }>;
  
  // Price History (Stock Exchange Style Transparency)
  recordPriceChange(productId: string, newPrice: number, reason: PriceChangeReason, notes?: string): Promise<{ success: boolean; priceHistory?: PriceHistory; error?: string }>;
  getProductPriceTrend(productId: string): Promise<PriceTrend | null>;
  getProductPriceHistory(productId: string, months?: number): Promise<PriceHistory[]>;
  canChangePrice(productId: string): Promise<{ canChange: boolean; daysUntilAllowed?: number; lastChangeDate?: Date }>;
  
  // Behavioral Metrics (Pricing Advisory System)
  getProductBehavioralMetrics(productId: string): Promise<ProductBehavioralMetrics | undefined>;
  getAllBehavioralMetrics(): Promise<ProductBehavioralMetrics[]>;
  getDosageBehavioralMetrics(productId: string, dosage: string): Promise<ProductBehavioralMetrics | undefined>;
  getAllDosageBehavioralMetrics(): Promise<ProductBehavioralMetrics[]>;
  incrementProductView(productId: string): Promise<ProductBehavioralMetrics>;
  incrementAddToCart(productId: string, dosage?: string): Promise<ProductBehavioralMetrics>;
  incrementCheckoutStarted(productId: string, dosage?: string): Promise<ProductBehavioralMetrics>;
  recordPurchase(productId: string, dosage?: string): Promise<ProductBehavioralMetrics>;
  setProductBaseline(productId: string, baselinePrice: number, baselineCost?: number): Promise<Product | undefined>;
  setDosageBaseline(dosageStockId: string, baselinePrice: number, baselineCost?: number): Promise<ProductDosageStock | undefined>;
  updateDosagePricingSuggestionsEnabled(dosageStockId: string, enabled: boolean): Promise<ProductDosageStock | undefined>;
  updateDosageStockPrice(dosageStockId: string, price: string): Promise<ProductDosageStock | undefined>;
  
  // Academy Progress
  getAcademyProgress(userId: string): Promise<AcademyProgress | undefined>;
  createAcademyProgress(progress: InsertAcademyProgress): Promise<AcademyProgress>;
  updateAcademyProgress(userId: string, data: Partial<InsertAcademyProgress>): Promise<AcademyProgress | undefined>;
  
  // Email Events
  createEmailEvent(event: InsertEmailEvent): Promise<EmailEvent>;
  getRecentEmailEvents(limit?: number): Promise<EmailEvent[]>;
  getEmailEventsByOrderId(orderId: string): Promise<EmailEvent[]>;
  
  // Wishlists
  getWishlistByUserId(userId: string): Promise<Wishlist[]>;
  addToWishlist(userId: string, productId: string): Promise<Wishlist>;
  removeFromWishlist(userId: string, productId: string): Promise<boolean>;
  isInWishlist(userId: string, productId: string): Promise<boolean>;
  
  // User Research Profiles
  getUserResearchProfile(userId: string): Promise<UserResearchProfile | undefined>;
  createOrUpdateUserResearchProfile(userId: string, data: Partial<InsertUserResearchProfile>): Promise<UserResearchProfile>;
  incrementEducationCount(userId: string): Promise<UserResearchProfile>;
  incrementBatchVerificationCount(userId: string): Promise<UserResearchProfile>;
  markSafetyCompleted(userId: string): Promise<UserResearchProfile>;
  markCoaEducationViewed(userId: string): Promise<UserResearchProfile>;
  computeResearchPhase(profile: UserResearchProfile): ResearchPhase;
  computeResearchTitle(profile: UserResearchProfile): ResearchTitle;
  
  // Saved Addresses
  getSavedAddresses(userId: string): Promise<SavedAddress[]>;
  getSavedAddress(id: string): Promise<SavedAddress | undefined>;
  createSavedAddress(address: InsertSavedAddress): Promise<SavedAddress>;
  updateSavedAddress(id: string, data: Partial<InsertSavedAddress>): Promise<SavedAddress | undefined>;
  deleteSavedAddress(id: string): Promise<boolean>;
  setDefaultAddress(userId: string, addressId: string): Promise<SavedAddress | undefined>;
  
  // Notification Preferences
  getNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined>;
  createOrUpdateNotificationPreferences(userId: string, prefs: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences>;
  
  // Research Notes
  getResearchNotes(userId: string): Promise<ResearchNote[]>;
  getResearchNote(id: string): Promise<ResearchNote | undefined>;
  createResearchNote(note: InsertResearchNote): Promise<ResearchNote>;
  updateResearchNote(id: string, data: Partial<InsertResearchNote>): Promise<ResearchNote | undefined>;
  deleteResearchNote(id: string): Promise<boolean>;
  toggleResearchNotePin(id: string): Promise<ResearchNote | undefined>;
  
  // Login History
  recordLogin(userId: string, data: Partial<InsertLoginHistory>): Promise<LoginHistory>;
  getLoginHistory(userId: string, limit?: number): Promise<LoginHistory[]>;
  
  // Batch Verification History
  recordBatchVerification(userId: string, batchNumber: string, productName?: string): Promise<BatchVerificationHistory>;
  getBatchVerificationHistory(userId: string): Promise<BatchVerificationHistory[]>;

  // Product Votes
  voteForProduct(productId: string, visitorId: string, userId?: string): Promise<ProductVote>;
  removeVote(productId: string, visitorId: string): Promise<boolean>;
  getVoteCounts(): Promise<Array<{ productId: string; count: number }>>;
  getVoteCountForProduct(productId: string): Promise<number>;
  hasVoted(productId: string, visitorId: string): Promise<boolean>;

  // Waitlist
  createWaitlistSignup(data: InsertWaitlistSignup): Promise<WaitlistSignup>;
  getWaitlistSignupByEmail(email: string): Promise<WaitlistSignup | undefined>;
  getWaitlistCount(): Promise<number>;
  getWaitlistCountByProduct(): Promise<Record<string, number>>;
  addProductInterest(email: string, productId: string): Promise<WaitlistSignup | undefined>;
}

export function resolveDisplayPrice(
  product: Product,
  dosageStocks: ProductDosageStock[]
): { displayPrice: string; displayOriginalPrice: string | null } {
  const basePrice = product.price;
  const baseOriginalPrice = product.originalPrice;

  if (!dosageStocks || dosageStocks.length === 0) {
    return { displayPrice: basePrice, displayOriginalPrice: baseOriginalPrice };
  }

  const parseDosageNum = (dosage: string): number => {
    const match = dosage.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : Infinity;
  };

  const sortedStocks = [...dosageStocks].sort(
    (a, b) => parseDosageNum(a.dosage) - parseDosageNum(b.dosage)
  );

  const inStockWithPrice = sortedStocks.filter(ds => ds.inStock && ds.price && parseFloat(ds.price) > 0);
  if (inStockWithPrice.length > 0) {
    const lowest = inStockWithPrice.reduce((min, ds) =>
      parseFloat(ds.price!) < parseFloat(min.price!) ? ds : min
    );
    return {
      displayPrice: lowest.price!,
      displayOriginalPrice: lowest.originalPrice || baseOriginalPrice,
    };
  }

  const withPrice = sortedStocks.filter(ds => ds.price && parseFloat(ds.price) > 0);
  if (withPrice.length > 0) {
    const lowest = withPrice.reduce((min, ds) =>
      parseFloat(ds.price!) < parseFloat(min.price!) ? ds : min
    );
    return {
      displayPrice: lowest.price!,
      displayOriginalPrice: lowest.originalPrice || baseOriginalPrice,
    };
  }

  return { displayPrice: basePrice, displayOriginalPrice: baseOriginalPrice };
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // First check if a user with this email already exists
    if (userData.email) {
      const [existingByEmail] = await db.select().from(users).where(eq(users.email, userData.email));
      if (existingByEmail && existingByEmail.id !== userData.id) {
        // User exists with different ID (e.g., Auth0 ID vs old ID)
        const oldUserId = existingByEmail.id;
        
        // First, update the existing user's email to null temporarily to allow new user creation
        await db.update(users).set({ email: null }).where(eq(users.id, oldUserId));
        
        // Create the new user with the Auth0 ID
        const [newUser] = await db
          .insert(users)
          .values({
            ...userData,
            isAdmin: existingByEmail.isAdmin, // Preserve admin status
            createdAt: existingByEmail.createdAt, // Preserve creation date
            updatedAt: new Date(),
          })
          .returning();
        
        // Update any foreign key references to point to the new ID
        await db.update(affiliates).set({ userId: newUser.id }).where(eq(affiliates.userId, oldUserId));
        await db.update(orders).set({ userId: newUser.id }).where(eq(orders.userId, oldUserId));
        await db.update(academyProgress).set({ userId: newUser.id }).where(eq(academyProgress.userId, oldUserId));
        
        // Now delete the old user record
        await db.delete(users).where(eq(users.id, oldUserId));
        
        return newUser;
      }
    }
    
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

  async setUserAdmin(id: string, isAdmin: boolean): Promise<User | undefined> {
    const [user] = await db.update(users).set({ isAdmin, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getAllCustomersWithStats(): Promise<CustomerWithStats[]> {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const allOrders = await db.select().from(orders);
    
    return allUsers.map(user => {
      const userOrders = allOrders.filter(order => order.userId === user.id && order.status === 'paid');
      const orderCount = userOrders.length;
      const totalSpent = userOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
      const lastOrderDate = userOrders.length > 0 
        ? new Date(Math.max(...userOrders.map(o => new Date(o.createdAt!).getTime())))
        : null;
      
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        orderCount,
        totalSpent,
        lastOrderDate
      };
    });
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product || undefined;
  }

  async getProductBySlugWithDisplayPrice(slug: string): Promise<(Product & { displayPrice: string; displayOriginalPrice: string | null }) | undefined> {
    const product = await this.getProductBySlug(slug);
    if (!product) return undefined;
    const dosageStocks = await this.getProductDosageStocks(product.id);
    const { displayPrice, displayOriginalPrice } = resolveDisplayPrice(product, dosageStocks);
    return { ...product, displayPrice, displayOriginalPrice };
  }

  async getAllProductsWithDisplayPrices(): Promise<(Product & { displayPrice: string; displayOriginalPrice: string | null })[]> {
    const allProducts = await db.select().from(products);
    const allDosageStocks = await db.select().from(productDosageStock);
    return allProducts.map(product => {
      const stocks = allDosageStocks.filter(ds => ds.productId === product.id);
      const { displayPrice, displayOriginalPrice } = resolveDisplayPrice(product, stocks);
      return { ...product, displayPrice, displayOriginalPrice };
    });
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.featured, true));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    if (!insertProduct.slug && insertProduct.name) {
      insertProduct.slug = insertProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9\s\-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }
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

  async deleteOrder(id: string): Promise<boolean> {
    const result = await db.delete(orders).where(eq(orders.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updateOrderFulfillment(id: string, data: {
    fulfillmentStatus?: string;
    fulfillmentNotes?: string;
    fulfilledBy?: string;
    paymentConfirmed?: boolean;
    addressCollected?: boolean;
    packed?: boolean;
    isRefunded?: boolean;
    refundAmount?: string;
    refundReason?: string;
    trackingNumber?: string;
    carrier?: string;
  }): Promise<Order | undefined> {
    const updateData: any = { ...data };
    if (data.fulfillmentStatus === 'delivered') {
      updateData.fulfilledAt = new Date();
    }
    if (data.trackingNumber && !updateData.shippedAt) {
      updateData.shippedAt = new Date();
    }
    const [order] = await db.update(orders).set(updateData).where(eq(orders.id, id)).returning();
    return order || undefined;
  }

  async updateOrderEmailStatus(id: string, status: string, error?: string): Promise<Order | undefined> {
    const updateData: any = { emailStatus: status };
    if (status === 'sent') {
      updateData.emailSentAt = new Date();
      updateData.emailError = null;
    } else if (status === 'failed' && error) {
      updateData.emailError = error;
    }
    const [order] = await db.update(orders).set(updateData).where(eq(orders.id, id)).returning();
    return order || undefined;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getContactsByType(type: "contact" | "wholesale"): Promise<Contact[]> {
    return db.select().from(contacts).where(eq(contacts.type, type)).orderBy(desc(contacts.createdAt));
  }

  async getContactsByStatus(status: "new" | "read" | "responded" | "archived"): Promise<Contact[]> {
    return db.select().from(contacts).where(eq(contacts.status, status)).orderBy(desc(contacts.createdAt));
  }

  async updateContactStatus(id: string, status: "new" | "read" | "responded" | "archived", respondedBy?: string): Promise<Contact | undefined> {
    const updateData: Partial<Contact> = { status };
    if (status === "responded" && respondedBy) {
      updateData.respondedAt = new Date();
      updateData.respondedBy = respondedBy;
    }
    const [contact] = await db.update(contacts).set(updateData).where(eq(contacts.id, id)).returning();
    return contact || undefined;
  }

  async updateContactNotes(id: string, notes: string): Promise<Contact | undefined> {
    const [contact] = await db.update(contacts).set({ notes }).where(eq(contacts.id, id)).returning();
    return contact || undefined;
  }

  async updateContactTestStatus(id: string, isTest: boolean): Promise<Contact | undefined> {
    const [contact] = await db.update(contacts).set({ isTest }).where(eq(contacts.id, id)).returning();
    return contact || undefined;
  }

  async deleteContact(id: string): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id));
    return true;
  }

  async getNewContactsCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(contacts).where(eq(contacts.status, "new"));
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

    // Run all database queries in parallel for better performance
    const [
      allOrders,
      allProducts,
      allDosageStocks,
      allContacts,
      pendingApplications,
      allAffiliates,
      allPayouts,
      allAffiliateSales
    ] = await Promise.all([
      db.select().from(orders).orderBy(desc(orders.createdAt)),
      db.select().from(products),
      db.select().from(productDosageStock),
      db.select().from(contacts).orderBy(desc(contacts.createdAt)),
      db.select().from(affiliateApplications).where(eq(affiliateApplications.status, 'pending')),
      db.select().from(affiliates),
      db.select().from(affiliatePayouts),
      db.select().from(affiliateSales)
    ]);

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

    // Low-stock threshold for admin alerts (configurable, default 3)
    const LOW_STOCK_THRESHOLD = 3;
    const lowStockProducts = allProducts
      .filter(p => p.inStock && p.stockAmount !== null && p.stockAmount > 0 && p.stockAmount <= LOW_STOCK_THRESHOLD)
      .map(p => ({ id: p.id, name: p.name, stockAmount: p.stockAmount || 0 }));
    const outOfStockProducts = allProducts
      .filter(p => !p.inStock || p.stockAmount === 0)
      .map(p => ({ id: p.id, name: p.name }));

    // Calculate dosage-level stock counts
    const outOfStockDosagesCount = allDosageStocks.filter(ds => !ds.inStock || ds.stockAmount === 0).length;
    const lowStockDosagesCount = allDosageStocks.filter(ds => 
      ds.inStock && ds.stockAmount > 0 && ds.stockAmount <= LOW_STOCK_THRESHOLD
    ).length;

    // Count new contacts (status === "new")
    const recentContacts = allContacts.filter(c => c.status === "new").length;

    const pendingAffiliateApplications = pendingApplications.length;

    const activeAffiliates = allAffiliates.filter(a => a.isActive).length;

    const pendingPayouts = allPayouts.filter(p => p.status === 'pending').length;
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
      outOfStockDosagesCount,
      lowStockDosagesCount,
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

  async getGraduateDiscountForUser(userId: string): Promise<DiscountCode | undefined> {
    const [code] = await db.select().from(discountCodes)
      .where(ilike(discountCodes.description, `Academy Graduate:%${userId}`));
    return code || undefined;
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
    const [existing] = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, subscriber.email));

    if (existing) {
      const [updated] = await db
        .update(newsletterSubscribers)
        .set({ 
          source: subscriber.source || existing.source,
          status: "subscribed" 
        })
        .where(eq(newsletterSubscribers.email, subscriber.email))
        .returning();
      return updated;
    }

    const [newSubscriber] = await db
      .insert(newsletterSubscribers)
      .values(subscriber)
      .returning();
    return newSubscriber;
  }

  async getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt));
  }

  async unsubscribeFromNewsletter(email: string, reason?: string): Promise<NewsletterSubscriber | undefined> {
    const [result] = await db.update(newsletterSubscribers)
      .set({ 
        status: "unsubscribed",
        unsubscribedAt: new Date(),
        unsubscribeReason: reason || null
      })
      .where(eq(newsletterSubscribers.email, email))
      .returning();
    return result || undefined;
  }

  async checkNewsletterSubscription(email: string): Promise<NewsletterSubscriber | undefined> {
    const [result] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
    return result || undefined;
  }

  async updateLastEmailSent(email: string): Promise<NewsletterSubscriber | undefined> {
    const [result] = await db.update(newsletterSubscribers)
      .set({ lastEmailSentAt: new Date() })
      .where(eq(newsletterSubscribers.email, email))
      .returning();
    return result || undefined;
  }

  async getNewsletterStats(): Promise<{ total: number; active: number; unsubscribed: number }> {
    const all = await db.select().from(newsletterSubscribers);
    const active = all.filter(s => s.status === "subscribed").length;
    const unsubscribed = all.filter(s => s.status === "unsubscribed").length;
    return { total: all.length, active, unsubscribed };
  }

  async deleteNewsletterSubscriber(id: string): Promise<boolean> {
    const result = await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
    return !!result;
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

  async upsertDosageStock(productId: string, dosage: string, stockAmount: number, inStock: boolean, price?: string | null, originalPrice?: string | null): Promise<ProductDosageStock> {
    // Enforce rule: if stockAmount = 0, inStock must be false
    const effectiveInStock = stockAmount <= 0 ? false : inStock;
    
    // Check if this dosage stock already exists
    const [existing] = await db.select().from(productDosageStock)
      .where(and(
        eq(productDosageStock.productId, productId),
        eq(productDosageStock.dosage, dosage)
      ));
    
    if (existing) {
      // Update existing
      const [updated] = await db.update(productDosageStock)
        .set({ stockAmount, inStock: effectiveInStock, price, originalPrice })
        .where(eq(productDosageStock.id, existing.id))
        .returning();
      return updated;
    } else {
      // Insert new
      const [created] = await db.insert(productDosageStock)
        .values({ productId, dosage, stockAmount, inStock: effectiveInStock, price, originalPrice })
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
    dosageStocks: Array<{ dosage: string; stockAmount: number; inStock: boolean; price?: string | null; originalPrice?: string | null }>
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
      const result = await this.upsertDosageStock(productId, ds.dosage, ds.stockAmount, ds.inStock, ds.price, ds.originalPrice);
      results.push(result);
    }
    
    // Update product-level inStock and price based on dosage data
    const anyInStock = results.some(r => r.inStock);
    const totalStock = results.reduce((sum, r) => sum + r.stockAmount, 0);
    const product = await this.getProduct(productId);
    const { displayPrice } = resolveDisplayPrice(product!, results);
    await db.update(products).set({ 
      inStock: anyInStock,
      stockAmount: totalStock,
      price: displayPrice,
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

  // Stock Management (Live Inventory)
  async validateStock(items: Array<{ productId: string; dosage?: string; quantity: number }>): Promise<{ valid: boolean; errors?: string[] }> {
    const errors: string[] = [];
    
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (!product) {
        errors.push(`Product ${item.productId} not found`);
        continue;
      }
      
      if (item.dosage) {
        const [dosageStock] = await db.select().from(productDosageStock)
          .where(and(
            eq(productDosageStock.productId, item.productId),
            eq(productDosageStock.dosage, item.dosage)
          ));
        
        if (!dosageStock) {
          errors.push(`${product.name} (${item.dosage}) is not available`);
        } else if (!dosageStock.inStock || dosageStock.stockAmount <= 0) {
          errors.push(`${product.name} (${item.dosage}) is out of stock`);
        } else if (dosageStock.stockAmount < item.quantity) {
          errors.push(`${product.name} (${item.dosage}) only has ${dosageStock.stockAmount} in stock (requested ${item.quantity})`);
        }
      } else {
        if (!product.inStock) {
          errors.push(`${product.name} is out of stock`);
        } else if ((product.stockAmount || 0) < item.quantity) {
          errors.push(`${product.name} only has ${product.stockAmount || 0} in stock (requested ${item.quantity})`);
        }
      }
    }
    
    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  }

  async decrementStock(items: Array<{ productId: string; dosage?: string; quantity: number }>): Promise<{ success: boolean; errors?: string[] }> {
    const errors: string[] = [];
    const affectedProductIds = new Set<string>();
    
    for (const item of items) {
      try {
        if (item.dosage) {
          const [dosageStock] = await db.select().from(productDosageStock)
            .where(and(
              eq(productDosageStock.productId, item.productId),
              eq(productDosageStock.dosage, item.dosage)
            ));
          
          if (dosageStock) {
            const newAmount = Math.max(0, dosageStock.stockAmount - item.quantity);
            await db.update(productDosageStock)
              .set({ 
                stockAmount: newAmount, 
                inStock: newAmount > 0 
              })
              .where(eq(productDosageStock.id, dosageStock.id));
            
            affectedProductIds.add(item.productId);
            console.log(`[Stock] Decremented ${item.productId} (${item.dosage}): ${dosageStock.stockAmount} → ${newAmount}`);
          } else {
            errors.push(`Dosage stock not found for ${item.productId} (${item.dosage})`);
          }
        } else {
          const product = await this.getProduct(item.productId);
          if (product) {
            const newAmount = Math.max(0, (product.stockAmount || 0) - item.quantity);
            await db.update(products)
              .set({ 
                stockAmount: newAmount, 
                inStock: newAmount > 0 
              })
              .where(eq(products.id, item.productId));
            
            console.log(`[Stock] Decremented ${item.productId}: ${product.stockAmount} → ${newAmount}`);
          } else {
            errors.push(`Product ${item.productId} not found`);
          }
        }
      } catch (err: any) {
        errors.push(`Failed to decrement ${item.productId}: ${err.message}`);
      }
    }
    
    // Sync product-level stock from dosage stocks for affected products
    for (const productId of Array.from(affectedProductIds)) {
      try {
        const dosageStocks = await this.getProductDosageStocks(productId);
        const anyInStock = dosageStocks.some(ds => ds.inStock && ds.stockAmount > 0);
        const totalStock = dosageStocks.reduce((sum, ds) => sum + ds.stockAmount, 0);
        await db.update(products).set({ 
          inStock: anyInStock,
          stockAmount: totalStock
        }).where(eq(products.id, productId));
      } catch (err: any) {
        console.error(`[Stock] Failed to sync product-level stock for ${productId}:`, err.message);
      }
    }
    
    return { success: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  }

  // Price History Methods (Stock Exchange Style Transparency)
  async canChangePrice(productId: string): Promise<{ canChange: boolean; daysUntilAllowed?: number; lastChangeDate?: Date }> {
    const [lastChange] = await db.select()
      .from(priceHistory)
      .where(eq(priceHistory.productId, productId))
      .orderBy(desc(priceHistory.effectiveDate))
      .limit(1);
    
    if (!lastChange) {
      return { canChange: true };
    }
    
    const lastDate = new Date(lastChange.effectiveDate);
    const now = new Date();
    const daysSinceLastChange = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    const minDays = 30;
    
    if (daysSinceLastChange >= minDays) {
      return { canChange: true, lastChangeDate: lastDate };
    }
    
    return { 
      canChange: false, 
      daysUntilAllowed: minDays - daysSinceLastChange,
      lastChangeDate: lastDate
    };
  }

  async recordPriceChange(
    productId: string, 
    newPrice: number, 
    reason: PriceChangeReason, 
    notes?: string
  ): Promise<{ success: boolean; priceHistory?: PriceHistory; error?: string }> {
    // Check if we can change the price (30-day rule) - but allow AI pricing suggestions to bypass
    if (reason as string !== "AI Pricing Suggestion") {
      const canChange = await this.canChangePrice(productId);
      if (!canChange.canChange) {
        return { 
          success: false, 
          error: `Price can only be changed once per month. ${canChange.daysUntilAllowed} days remaining until next change allowed.`
        };
      }
    }
    
    // Get current product price
    const product = await this.getProduct(productId);
    if (!product) {
      return { success: false, error: "Product not found" };
    }
    
    const oldPrice = parseFloat(product.price);
    if (oldPrice === newPrice) {
      return { success: false, error: "New price is the same as current price" };
    }
    
    // Calculate percentage change
    const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
    
    // Get the reason description
    const reasonDescription = priceChangeReasons[reason];
    
    // Record the price change
    const [record] = await db.insert(priceHistory).values({
      productId,
      oldPrice: oldPrice.toString(),
      newPrice: newPrice.toString(),
      changePercent: changePercent.toFixed(2),
      reason: reasonDescription,
      notes,
      effectiveDate: new Date()
    }).returning();
    
    // Update the product price
    await db.update(products).set({ price: newPrice.toString() }).where(eq(products.id, productId));
    
    return { success: true, priceHistory: record };
  }

  async getProductPriceTrend(productId: string): Promise<PriceTrend | null> {
    const [lastChange] = await db.select()
      .from(priceHistory)
      .where(eq(priceHistory.productId, productId))
      .orderBy(desc(priceHistory.effectiveDate))
      .limit(1);
    
    if (!lastChange) {
      return null;
    }
    
    const percentChange = parseFloat(lastChange.changePercent);
    
    return {
      direction: percentChange > 0 ? "up" : percentChange < 0 ? "down" : "stable",
      percentChange: Math.abs(percentChange),
      lastChangeDate: new Date(lastChange.effectiveDate),
      reason: lastChange.reason,
      reasonDescription: lastChange.reason,
      notes: lastChange.notes || undefined
    };
  }

  async getProductPriceHistory(productId: string, months: number = 6): Promise<PriceHistory[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    return db.select()
      .from(priceHistory)
      .where(and(
        eq(priceHistory.productId, productId),
        gte(priceHistory.effectiveDate, startDate)
      ))
      .orderBy(desc(priceHistory.effectiveDate));
  }

  // Academy Progress
  async getAcademyProgress(userId: string): Promise<AcademyProgress | undefined> {
    const [progress] = await db.select().from(academyProgress).where(eq(academyProgress.userId, userId));
    return progress || undefined;
  }

  async createAcademyProgress(insertProgress: InsertAcademyProgress): Promise<AcademyProgress> {
    const [progress] = await db.insert(academyProgress).values(insertProgress).returning();
    return progress;
  }

  async updateAcademyProgress(userId: string, data: Partial<InsertAcademyProgress>): Promise<AcademyProgress | undefined> {
    const [progress] = await db.update(academyProgress)
      .set({ ...data, lastActivityAt: new Date() })
      .where(eq(academyProgress.userId, userId))
      .returning();
    return progress || undefined;
  }

  // Email Events
  async createEmailEvent(event: InsertEmailEvent): Promise<EmailEvent> {
    const [emailEvent] = await db.insert(emailEvents).values(event).returning();
    return emailEvent;
  }

  async getRecentEmailEvents(limit: number = 50): Promise<EmailEvent[]> {
    return db.select()
      .from(emailEvents)
      .orderBy(desc(emailEvents.createdAt))
      .limit(limit);
  }

  async getEmailEventsByOrderId(orderId: string): Promise<EmailEvent[]> {
    return db.select()
      .from(emailEvents)
      .where(eq(emailEvents.orderId, orderId))
      .orderBy(desc(emailEvents.createdAt));
  }

  // Wishlists
  async getWishlistByUserId(userId: string): Promise<Wishlist[]> {
    return db.select()
      .from(wishlists)
      .where(eq(wishlists.userId, userId))
      .orderBy(desc(wishlists.createdAt));
  }

  async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    // Check if already exists
    const [existing] = await db.select()
      .from(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
    
    if (existing) {
      return existing;
    }
    
    const [wishlistItem] = await db.insert(wishlists)
      .values({ userId, productId })
      .returning();
    return wishlistItem;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    const result = await db.delete(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
    return true;
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const [item] = await db.select()
      .from(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
    return !!item;
  }

  // User Research Profiles
  async getUserResearchProfile(userId: string): Promise<UserResearchProfile | undefined> {
    const [profile] = await db.select()
      .from(userResearchProfiles)
      .where(eq(userResearchProfiles.userId, userId));
    return profile || undefined;
  }

  async createOrUpdateUserResearchProfile(userId: string, data: Partial<InsertUserResearchProfile>): Promise<UserResearchProfile> {
    const existing = await this.getUserResearchProfile(userId);
    
    if (existing) {
      const [updated] = await db.update(userResearchProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userResearchProfiles.userId, userId))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(userResearchProfiles)
      .values({ userId, ...data })
      .returning();
    return created;
  }

  async incrementEducationCount(userId: string): Promise<UserResearchProfile> {
    const profile = await this.getUserResearchProfile(userId);
    const newCount = (profile?.educationCount || 0) + 1;
    return this.createOrUpdateUserResearchProfile(userId, { educationCount: newCount });
  }

  async incrementBatchVerificationCount(userId: string): Promise<UserResearchProfile> {
    const profile = await this.getUserResearchProfile(userId);
    const newCount = (profile?.batchVerificationCount || 0) + 1;
    return this.createOrUpdateUserResearchProfile(userId, { batchVerificationCount: newCount });
  }

  async markSafetyCompleted(userId: string): Promise<UserResearchProfile> {
    return this.createOrUpdateUserResearchProfile(userId, { safetyCompleted: true });
  }

  async markCoaEducationViewed(userId: string): Promise<UserResearchProfile> {
    return this.createOrUpdateUserResearchProfile(userId, { coaEducationViewed: true });
  }

  computeResearchPhase(profile: UserResearchProfile): ResearchPhase {
    const { safetyCompleted, coaEducationViewed, compoundsTrackedCount, batchVerificationCount, educationCount } = profile;
    
    // Specialist: meet any 2 of: batch_verification_count >= 10, education_count >= 15
    const specialistCriteria = [
      (batchVerificationCount || 0) >= 10,
      (educationCount || 0) >= 15
    ].filter(Boolean).length;
    if (specialistCriteria >= 2) return "Specialist";
    
    // Analyst: meet any 2 of: batch_verification_count >= 3, education_count >= 8, compounds_tracked_count >= 5
    const analystCriteria = [
      (batchVerificationCount || 0) >= 3,
      (educationCount || 0) >= 8,
      (compoundsTrackedCount || 0) >= 5
    ].filter(Boolean).length;
    if (analystCriteria >= 2) return "Analyst";
    
    // Researcher: meet any 2 of: batch_verification_count >= 1, education_count >= 5, compounds_tracked_count >= 3
    const researcherCriteria = [
      (batchVerificationCount || 0) >= 1,
      (educationCount || 0) >= 5,
      (compoundsTrackedCount || 0) >= 3
    ].filter(Boolean).length;
    if (researcherCriteria >= 2) return "Researcher";
    
    // Initiate: safety_completed = true, coa_education_viewed = true, compounds_tracked_count >= 1
    if (safetyCompleted && coaEducationViewed && (compoundsTrackedCount || 0) >= 1) {
      return "Initiate";
    }
    
    // Default: Observer
    return "Observer";
  }

  computeResearchTitle(profile: UserResearchProfile): ResearchTitle {
    const { earlyAccessMember, batchVerificationCount, coaEducationViewed, compoundsTrackedCount, safetyCompleted } = profile;
    
    // Priority order for title selection
    if (earlyAccessMember) return "Early Access Member";
    if ((batchVerificationCount || 0) >= 3) return "Verification Regular";
    if (coaEducationViewed && (batchVerificationCount || 0) >= 1) return "COA Confident";
    if ((compoundsTrackedCount || 0) >= 5) return "Stack Builder";
    if ((compoundsTrackedCount || 0) >= 3) return "Compound Tracker";
    if (safetyCompleted) return "Safety-First";
    
    return "Getting Started";
  }

  // Behavioral Metrics (Pricing Advisory System)
  async getProductBehavioralMetrics(productId: string): Promise<ProductBehavioralMetrics | undefined> {
    const [metrics] = await db.select().from(productBehavioralMetrics).where(eq(productBehavioralMetrics.productId, productId));
    return metrics;
  }

  async getAllBehavioralMetrics(): Promise<ProductBehavioralMetrics[]> {
    return await db.select().from(productBehavioralMetrics);
  }

  private async getOrCreateMetrics(productId: string, dosage?: string): Promise<ProductBehavioralMetrics> {
    const dosageValue = dosage || null;
    const existing = await db.select().from(productBehavioralMetrics)
      .where(and(
        eq(productBehavioralMetrics.productId, productId),
        dosageValue ? eq(productBehavioralMetrics.dosage, dosageValue) : sql`${productBehavioralMetrics.dosage} IS NULL`
      ));
    
    if (existing.length > 0) return existing[0];
    
    const [created] = await db.insert(productBehavioralMetrics).values({
      productId,
      dosage: dosageValue,
      productViews: 0,
      addToCartCount: 0,
      checkoutStartedCount: 0,
      purchasedCount: 0,
    }).returning();
    
    return created;
  }

  async incrementProductView(productId: string): Promise<ProductBehavioralMetrics> {
    const metrics = await this.getOrCreateMetrics(productId);
    const [updated] = await db.update(productBehavioralMetrics)
      .set({ 
        productViews: (metrics.productViews || 0) + 1,
        lastUpdatedAt: new Date()
      })
      .where(eq(productBehavioralMetrics.id, metrics.id))
      .returning();
    return updated;
  }

  async incrementAddToCart(productId: string, dosage?: string): Promise<ProductBehavioralMetrics> {
    const metrics = await this.getOrCreateMetrics(productId, dosage);
    const [updated] = await db.update(productBehavioralMetrics)
      .set({ 
        addToCartCount: (metrics.addToCartCount || 0) + 1,
        lastUpdatedAt: new Date()
      })
      .where(eq(productBehavioralMetrics.id, metrics.id))
      .returning();
    return updated;
  }

  async incrementCheckoutStarted(productId: string, dosage?: string): Promise<ProductBehavioralMetrics> {
    const metrics = await this.getOrCreateMetrics(productId, dosage);
    const [updated] = await db.update(productBehavioralMetrics)
      .set({ 
        checkoutStartedCount: (metrics.checkoutStartedCount || 0) + 1,
        lastUpdatedAt: new Date()
      })
      .where(eq(productBehavioralMetrics.id, metrics.id))
      .returning();
    return updated;
  }

  async recordPurchase(productId: string, dosage?: string): Promise<ProductBehavioralMetrics> {
    const metrics = await this.getOrCreateMetrics(productId, dosage);
    const now = new Date();
    const [updated] = await db.update(productBehavioralMetrics)
      .set({ 
        purchasedCount: (metrics.purchasedCount || 0) + 1,
        lastSaleAt: now,
        firstSaleAt: metrics.firstSaleAt || now,
        lastUpdatedAt: now
      })
      .where(eq(productBehavioralMetrics.id, metrics.id))
      .returning();
    return updated;
  }

  async setProductBaseline(productId: string, baselinePrice: number, baselineCost?: number): Promise<Product | undefined> {
    const product = await this.getProduct(productId);
    if (!product) return undefined;
    
    // Only set baseline if not already set (immutable once set)
    if (product.baselinePrice) {
      return product;
    }
    
    const marginPct = baselineCost && baselinePrice > 0 
      ? ((baselinePrice - baselineCost) / baselinePrice) * 100 
      : null;
    
    const [updated] = await db.update(products)
      .set({
        baselinePrice: baselinePrice.toFixed(2),
        baselineDate: new Date(),
        baselineCost: baselineCost?.toFixed(2) || null,
        baselineMarginPct: marginPct?.toFixed(2) || null,
        publishedAt: product.publishedAt || new Date()
      })
      .where(eq(products.id, productId))
      .returning();
    
    return updated;
  }

  async getDosageBehavioralMetrics(productId: string, dosage: string): Promise<ProductBehavioralMetrics | undefined> {
    const [metrics] = await db.select().from(productBehavioralMetrics)
      .where(and(
        eq(productBehavioralMetrics.productId, productId),
        eq(productBehavioralMetrics.dosage, dosage)
      ));
    return metrics;
  }

  async getAllDosageBehavioralMetrics(): Promise<ProductBehavioralMetrics[]> {
    // Return only dosage-specific metrics (where dosage is not null)
    return await db.select().from(productBehavioralMetrics)
      .where(sql`${productBehavioralMetrics.dosage} IS NOT NULL`);
  }

  async setDosageBaseline(dosageStockId: string, baselinePrice: number, baselineCost?: number): Promise<ProductDosageStock | undefined> {
    const [dosageStock] = await db.select().from(productDosageStock)
      .where(eq(productDosageStock.id, dosageStockId));
    
    if (!dosageStock) return undefined;
    
    // Only set baseline if not already set (immutable once set)
    if (dosageStock.baselinePrice) {
      return dosageStock;
    }
    
    const marginPct = baselineCost && baselinePrice > 0 
      ? ((baselinePrice - baselineCost) / baselinePrice) * 100 
      : null;
    
    const [updated] = await db.update(productDosageStock)
      .set({
        baselinePrice: baselinePrice.toFixed(2),
        baselineDate: new Date(),
        baselineCost: baselineCost?.toFixed(2) || null,
        baselineMarginPct: marginPct?.toFixed(2) || null,
      })
      .where(eq(productDosageStock.id, dosageStockId))
      .returning();
    
    return updated;
  }

  async updateDosagePricingSuggestionsEnabled(dosageStockId: string, enabled: boolean): Promise<ProductDosageStock | undefined> {
    const [updated] = await db.update(productDosageStock)
      .set({ pricingSuggestionsEnabled: enabled })
      .where(eq(productDosageStock.id, dosageStockId))
      .returning();
    
    return updated;
  }

  async updateDosageStockPrice(dosageStockId: string, price: string): Promise<ProductDosageStock | undefined> {
    const [updated] = await db.update(productDosageStock)
      .set({ price })
      .where(eq(productDosageStock.id, dosageStockId))
      .returning();
    
    if (updated) {
      const product = await this.getProduct(updated.productId);
      if (product) {
        const allStocks = await this.getProductDosageStocks(updated.productId);
        const { displayPrice } = resolveDisplayPrice(product, allStocks);
        await db.update(products).set({ price: displayPrice }).where(eq(products.id, updated.productId));
      }
    }
    
    return updated;
  }

  // Saved Addresses
  async getSavedAddresses(userId: string): Promise<SavedAddress[]> {
    return await db.select().from(savedAddresses)
      .where(eq(savedAddresses.userId, userId))
      .orderBy(desc(savedAddresses.isDefault), desc(savedAddresses.createdAt));
  }

  async getSavedAddress(id: string): Promise<SavedAddress | undefined> {
    const [address] = await db.select().from(savedAddresses).where(eq(savedAddresses.id, id));
    return address;
  }

  async createSavedAddress(address: InsertSavedAddress): Promise<SavedAddress> {
    // If this is the first address or marked as default, handle accordingly
    if (address.isDefault) {
      await db.update(savedAddresses)
        .set({ isDefault: false })
        .where(eq(savedAddresses.userId, address.userId));
    }
    const [created] = await db.insert(savedAddresses).values(address).returning();
    return created;
  }

  async updateSavedAddress(id: string, data: Partial<InsertSavedAddress>): Promise<SavedAddress | undefined> {
    const existing = await this.getSavedAddress(id);
    if (!existing) return undefined;
    
    if (data.isDefault) {
      await db.update(savedAddresses)
        .set({ isDefault: false })
        .where(eq(savedAddresses.userId, existing.userId));
    }
    
    const [updated] = await db.update(savedAddresses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(savedAddresses.id, id))
      .returning();
    return updated;
  }

  async deleteSavedAddress(id: string): Promise<boolean> {
    const result = await db.delete(savedAddresses).where(eq(savedAddresses.id, id));
    return true;
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<SavedAddress | undefined> {
    await db.update(savedAddresses)
      .set({ isDefault: false })
      .where(eq(savedAddresses.userId, userId));
    
    const [updated] = await db.update(savedAddresses)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(savedAddresses.id, addressId))
      .returning();
    return updated;
  }

  // Notification Preferences
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined> {
    const [prefs] = await db.select().from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
    return prefs;
  }

  async createOrUpdateNotificationPreferences(userId: string, prefs: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences> {
    const existing = await this.getNotificationPreferences(userId);
    if (existing) {
      const [updated] = await db.update(notificationPreferences)
        .set({ ...prefs, updatedAt: new Date() })
        .where(eq(notificationPreferences.userId, userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(notificationPreferences)
      .values({ ...prefs, userId })
      .returning();
    return created;
  }

  // Research Notes
  async getResearchNotes(userId: string): Promise<ResearchNote[]> {
    return await db.select().from(researchNotes)
      .where(eq(researchNotes.userId, userId))
      .orderBy(desc(researchNotes.isPinned), desc(researchNotes.updatedAt));
  }

  async getResearchNote(id: string): Promise<ResearchNote | undefined> {
    const [note] = await db.select().from(researchNotes).where(eq(researchNotes.id, id));
    return note;
  }

  async createResearchNote(note: InsertResearchNote): Promise<ResearchNote> {
    const [created] = await db.insert(researchNotes).values(note).returning();
    return created;
  }

  async updateResearchNote(id: string, data: Partial<InsertResearchNote>): Promise<ResearchNote | undefined> {
    const [updated] = await db.update(researchNotes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(researchNotes.id, id))
      .returning();
    return updated;
  }

  async deleteResearchNote(id: string): Promise<boolean> {
    await db.delete(researchNotes).where(eq(researchNotes.id, id));
    return true;
  }

  async toggleResearchNotePin(id: string): Promise<ResearchNote | undefined> {
    const note = await this.getResearchNote(id);
    if (!note) return undefined;
    
    const [updated] = await db.update(researchNotes)
      .set({ isPinned: !note.isPinned, updatedAt: new Date() })
      .where(eq(researchNotes.id, id))
      .returning();
    return updated;
  }

  // Login History
  async recordLogin(userId: string, data: Partial<InsertLoginHistory>): Promise<LoginHistory> {
    const [created] = await db.insert(loginHistory)
      .values({ ...data, userId })
      .returning();
    return created;
  }

  async getLoginHistory(userId: string, limit: number = 10): Promise<LoginHistory[]> {
    return await db.select().from(loginHistory)
      .where(eq(loginHistory.userId, userId))
      .orderBy(desc(loginHistory.createdAt))
      .limit(limit);
  }

  // Batch Verification History
  async recordBatchVerification(userId: string, batchNumber: string, productName?: string): Promise<BatchVerificationHistory> {
    const [created] = await db.insert(batchVerificationHistory)
      .values({ userId, batchNumber, productName })
      .returning();
    return created;
  }

  async getBatchVerificationHistory(userId: string): Promise<BatchVerificationHistory[]> {
    return await db.select().from(batchVerificationHistory)
      .where(eq(batchVerificationHistory.userId, userId))
      .orderBy(desc(batchVerificationHistory.createdAt));
  }

  async voteForProduct(productId: string, visitorId: string, userId?: string): Promise<ProductVote> {
    const existingByVisitor = await db.select().from(productVotes)
      .where(and(eq(productVotes.productId, productId), eq(productVotes.visitorId, visitorId)));
    if (existingByVisitor.length > 0) return existingByVisitor[0];
    if (userId) {
      const existingByUser = await db.select().from(productVotes)
        .where(and(eq(productVotes.productId, productId), eq(productVotes.userId, userId)));
      if (existingByUser.length > 0) return existingByUser[0];
    }
    const [vote] = await db.insert(productVotes)
      .values({ productId, visitorId, userId: userId || null })
      .returning();
    return vote;
  }

  async removeVote(productId: string, visitorId: string, userId?: string): Promise<boolean> {
    const conditions = [eq(productVotes.productId, productId)];
    if (userId) {
      conditions.push(or(eq(productVotes.visitorId, visitorId), eq(productVotes.userId, userId))!);
    } else {
      conditions.push(eq(productVotes.visitorId, visitorId));
    }
    const result = await db.delete(productVotes).where(and(...conditions));
    return (result?.rowCount ?? 0) > 0;
  }

  async getVoteCounts(): Promise<Array<{ productId: string; count: number }>> {
    const results = await db
      .select({ productId: productVotes.productId, count: count() })
      .from(productVotes)
      .groupBy(productVotes.productId);
    return results.map(r => ({ productId: r.productId, count: Number(r.count) }));
  }

  async hasVoted(productId: string, visitorId: string, userId?: string): Promise<boolean> {
    if (userId) {
      const result = await db.select().from(productVotes)
        .where(and(eq(productVotes.productId, productId), or(eq(productVotes.visitorId, visitorId), eq(productVotes.userId, userId))));
      return result.length > 0;
    }
    const result = await db.select().from(productVotes)
      .where(and(eq(productVotes.productId, productId), eq(productVotes.visitorId, visitorId)));
    return result.length > 0;
  }

  async getVoteCountForProduct(productId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(productVotes)
      .where(eq(productVotes.productId, productId));
    return Number(result[0]?.count ?? 0);
  }

  async createWaitlistSignup(data: InsertWaitlistSignup): Promise<WaitlistSignup> {
    const foundingCount = await this.getFoundingMemberCount();
    const isFoundingMember = foundingCount < 50;
    const foundingNumber = isFoundingMember ? foundingCount + 1 : null;
    const [signup] = await db.insert(waitlistSignups).values({
      ...data,
      foundingMember: isFoundingMember,
      foundingMemberNumber: foundingNumber,
    }).returning();
    return signup;
  }

  async getFoundingMemberCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(waitlistSignups).where(eq(waitlistSignups.foundingMember, true));
    return Number(result[0]?.count ?? 0);
  }

  async getWaitlistSignupByEmail(email: string): Promise<WaitlistSignup | undefined> {
    const [signup] = await db.select().from(waitlistSignups).where(eq(waitlistSignups.email, email.toLowerCase()));
    return signup;
  }

  async getWaitlistCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(waitlistSignups);
    return Number(result[0]?.count ?? 0);
  }

  async getWaitlistCountByProduct(): Promise<Record<string, number>> {
    const allSignups = await db.select({ productInterest: waitlistSignups.productInterest }).from(waitlistSignups);
    const counts: Record<string, number> = {};
    for (const signup of allSignups) {
      if (signup.productInterest) {
        for (const pid of signup.productInterest) {
          counts[pid] = (counts[pid] || 0) + 1;
        }
      }
    }
    return counts;
  }

  async addProductInterest(email: string, productId: string): Promise<WaitlistSignup | undefined> {
    const existing = await this.getWaitlistSignupByEmail(email);
    if (!existing) return undefined;
    const currentInterests = existing.productInterest || [];
    if (currentInterests.includes(productId)) return existing;
    const [updated] = await db.update(waitlistSignups)
      .set({ productInterest: [...currentInterests, productId] })
      .where(eq(waitlistSignups.email, email.toLowerCase()))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
