import { buildProductKeywords, filterArticlesByProduct } from "./articleMatching";
import { 
  users, products, coas, orders, contacts, affiliateApplications, affiliates, affiliateSales, affiliatePayouts,
  batches, productStorageProfiles, legalDocuments, faqEntries, educationArticles, coaGlossaryTerms, stockNotifications, discountCodes, newsletterSubscribers,
  productDosageStock, priceHistory, academyProgress, emailEvents, wishlists, userResearchProfiles, productBehavioralMetrics,
  savedAddresses, notificationPreferences, researchNotes, loginHistory, batchVerificationHistory, productVotes,
  cycleTags,
  deadLinkHits,
  citationDismissals,
  stripePresets,
  researchStacks,
  articleViews,
  userCarts,
  type ResearchStack, type InsertResearchStack,
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
  type CycleTag, type InsertCycleTag,
  type LoginHistory, type InsertLoginHistory,
  type BatchVerificationHistory, type InsertBatchVerificationHistory,
  type ProductVote, type InsertProductVote,
  type WaitlistSignup, type InsertWaitlistSignup,
  type DeadLinkHit,
  type CitationDismissal,
  type StripePreset, type InsertStripePreset,
  labNotes,
  type LabNote, type InsertLabNote,
  waitlistSignups,
  priceChangeReasons
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, desc, sql, gte, and, lt, count, sum, isNull } from "drizzle-orm";

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
  updateUserAttestation(id: string, attestedAt: Date): Promise<User | undefined>;
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
  getCoa(id: string): Promise<Coa | undefined>;
  getCoasNeedingPreview(): Promise<Coa[]>;
  getAllCoas(includeArchived?: boolean): Promise<Coa[]>;
  getCoasByProductId(productId: string, includeArchived?: boolean): Promise<Coa[]>;
  createCoa(coa: InsertCoa): Promise<Coa>;
  updateCoa(id: string, coa: Partial<InsertCoa>): Promise<Coa | undefined>;
  archiveCoa(id: string): Promise<Coa | undefined>;
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
    batchNumber?: string | null;
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
  updateResearchNoteForUser(id: string, userId: string, data: Partial<InsertResearchNote>): Promise<ResearchNote | undefined>;
  deleteResearchNote(id: string): Promise<boolean>;
  deleteResearchNoteForUser(id: string, userId: string): Promise<boolean>;
  toggleResearchNotePin(id: string): Promise<ResearchNote | undefined>;

  // Logbook (auth-gated personal research log; backed by researchNotes table)
  getLogbookEntries(userId: string, filters?: {
    from?: Date;
    to?: Date;
    productId?: string;
    hasObservation?: boolean;
    minSleep?: number;
    minEnergy?: number;
    minMood?: number;
  }): Promise<ResearchNote[]>;
  wipeLogbookEntries(userId: string): Promise<number>;

  // Cycle Tags (user-named cycles derived from logbook entries)
  listCycleTagsForUser(userId: string): Promise<CycleTag[]>;
  upsertCycleTag(data: InsertCycleTag): Promise<CycleTag>;
  deleteCycleTag(id: string, userId: string): Promise<boolean>;

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

  // Dead-link hits
  upsertDeadLinkHit(type: string, slug: string): Promise<void>;
  getAllDeadLinkHits(): Promise<DeadLinkHit[]>;
  deleteDeadLinkHit(type: string, slug: string): Promise<boolean>;
  clearAllDeadLinkHits(): Promise<number>;

  // Stripe Presets
  getAllStripePresets(): Promise<StripePreset[]>;
  getStripePreset(id: string): Promise<StripePreset | undefined>;
  createStripePreset(preset: InsertStripePreset): Promise<StripePreset>;
  updateStripePreset(id: string, preset: Partial<InsertStripePreset>): Promise<StripePreset | undefined>;
  deleteStripePreset(id: string): Promise<boolean>;
  getStripePresetsCount(): Promise<number>;
  seedStripePresets(presets: InsertStripePreset[]): Promise<void>;

  // Lab Notes
  getAllLabNotes(): Promise<LabNote[]>;
  createLabNote(note: InsertLabNote): Promise<LabNote>;
  seedLabNotes(notes: InsertLabNote[]): Promise<void>;

  // Research Stacks
  getResearchStacks(options?: { showOnPage?: boolean }): Promise<ResearchStack[]>;
  getAllResearchStacksAdmin(): Promise<ResearchStack[]>;
  getResearchStackById(id: string): Promise<ResearchStack | undefined>;
  upsertResearchStack(data: { id: string } & Partial<InsertResearchStack>): Promise<ResearchStack>;
  createResearchStack(data: { id: string } & InsertResearchStack): Promise<ResearchStack>;
  updateResearchStack(id: string, fields: Partial<InsertResearchStack>): Promise<ResearchStack | undefined>;
  getResearchStackByIdAdmin(id: string): Promise<ResearchStack | undefined>;
  updateResearchStackVisibility(id: string, fields: { showOnPage?: boolean; isActive?: boolean }): Promise<ResearchStack | undefined>;
  getResearchStacksCount(): Promise<number>;

  // Article Views (cross-device Continue Reading)
  saveArticleView(userId: string, articleId: string): Promise<void>;
  getRecentArticleViews(userId: string, limit: number): Promise<string[]>;

  // User Carts (server-side persistence)
  getUserCart(userId: string): Promise<unknown[] | null>;
  saveUserCart(userId: string, items: unknown[]): Promise<void>;
  deleteUserCart(userId: string): Promise<void>;
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
    // Upsert strictly by provider subject ID.
    // Email-based account migration has been removed: automatically merging
    // accounts by email and copying isAdmin would allow privilege escalation
    // via any Auth0 token whose email matches an existing admin account.
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();

    // One-time founding member persistence: if this user doesn't yet have
    // isFoundingMember set, check whether their email matches a waitlist
    // signup row with foundingMember: true. Write it once and never re-check.
    if (!user.isFoundingMember && user.email) {
      const [waitlistRow] = await db
        .select({ foundingMember: waitlistSignups.foundingMember })
        .from(waitlistSignups)
        .where(eq(waitlistSignups.email, user.email.toLowerCase()))
        .limit(1);
      if (waitlistRow?.foundingMember) {
        const [updated] = await db
          .update(users)
          .set({ isFoundingMember: true, updatedAt: new Date() })
          .where(eq(users.id, user.id))
          .returning();
        return updated;
      }
    }

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

  async updateUserAttestation(id: string, attestedAt: Date): Promise<User | undefined> {
    const [user] = await db.update(users).set({ ruoAttestationAt: attestedAt, updatedAt: new Date() }).where(eq(users.id, id)).returning();
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

  async getCoa(id: string): Promise<Coa | undefined> {
    const [coa] = await db.select().from(coas).where(eq(coas.id, id));
    return coa || undefined;
  }

  /** Returns only COAs that have an imageUrl but no previewImageUrl yet. DB-level filter — cheap no-op after backfill. */
  async getCoasNeedingPreview(): Promise<Coa[]> {
    return db
      .select()
      .from(coas)
      .where(and(
        sql`${coas.imageUrl} IS NOT NULL`,
        isNull(coas.previewImageUrl)
      ))
      .orderBy(desc(coas.testDate));
  }

  async getAllCoas(includeArchived: boolean = false): Promise<Coa[]> {
    if (includeArchived) {
      return db.select().from(coas).orderBy(desc(coas.testDate));
    }
    return db.select().from(coas).where(eq(coas.archived, false)).orderBy(desc(coas.testDate));
  }

  async getCoasByProductId(productId: string, includeArchived: boolean = false): Promise<Coa[]> {
    if (includeArchived) {
      return db.select().from(coas).where(eq(coas.productId, productId)).orderBy(desc(coas.testDate));
    }
    return db.select().from(coas).where(
      and(eq(coas.productId, productId), eq(coas.archived, false))
    ).orderBy(desc(coas.testDate));
  }

  async createCoa(insertCoa: InsertCoa): Promise<Coa> {
    const conditions = [
      eq(coas.productId, insertCoa.productId),
      eq(coas.archived, false)
    ];
    if (insertCoa.dosage) {
      conditions.push(eq(coas.dosage, insertCoa.dosage));
    } else {
      conditions.push(or(isNull(coas.dosage), eq(coas.dosage, ''))!);
    }
    await db.update(coas).set({ archived: true }).where(and(...conditions));
    
    const [coa] = await db.insert(coas).values(insertCoa).returning();
    return coa;
  }

  async updateCoa(id: string, coaData: Partial<InsertCoa>): Promise<Coa | undefined> {
    const [coa] = await db.update(coas).set(coaData).where(eq(coas.id, id)).returning();
    return coa || undefined;
  }

  async archiveCoa(id: string): Promise<Coa | undefined> {
    const [coa] = await db.update(coas).set({ archived: true }).where(eq(coas.id, id)).returning();
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
    batchNumber?: string | null;
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
    const [doc] = await db.select().from(legalDocuments).where(and(eq(legalDocuments.slug, slug), eq(legalDocuments.isPublished, true)));
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
    const [article] = await db.select().from(educationArticles).where(and(eq(educationArticles.slug, slug), eq(educationArticles.isPublished, true)));
    return article || undefined;
  }
  
  async getEducationArticlesByCategory(category: string): Promise<EducationArticle[]> {
    return db.select().from(educationArticles)
      .where(and(eq(educationArticles.category, category), eq(educationArticles.isPublished, true)))
      .orderBy(educationArticles.sortOrder);
  }
  
  async getEducationArticlesByProductId(productId: string): Promise<EducationArticle[]> {
    const [allArticles, product] = await Promise.all([
      db.select().from(educationArticles).where(eq(educationArticles.isPublished, true)),
      db.select().from(products).where(eq(products.id, productId)).limit(1).then(r => r[0] ?? null),
    ]);

    const productKeywords = buildProductKeywords(product);

    return filterArticlesByProduct(allArticles, productKeywords, productId);
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
    const conditions = [eq(coas.archived, false)];
    
    if (filters.productId) {
      conditions.push(eq(coas.productId, filters.productId));
    }
    if (filters.batchNumber) {
      conditions.push(ilike(coas.batchNumber, `%${filters.batchNumber}%`));
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
        eq(stockNotifications.email, email)
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

  async updateResearchNoteForUser(
    id: string,
    userId: string,
    data: Partial<InsertResearchNote>,
  ): Promise<ResearchNote | undefined> {
    const [updated] = await db.update(researchNotes)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(researchNotes.id, id), eq(researchNotes.userId, userId)))
      .returning();
    return updated;
  }

  async deleteResearchNote(id: string): Promise<boolean> {
    await db.delete(researchNotes).where(eq(researchNotes.id, id));
    return true;
  }

  async deleteResearchNoteForUser(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(researchNotes)
      .where(and(eq(researchNotes.id, id), eq(researchNotes.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getLogbookEntries(
    userId: string,
    filters?: {
      from?: Date;
      to?: Date;
      productId?: string;
      customCompound?: string;
      hasObservation?: boolean;
      minSleep?: number;
      minEnergy?: number;
      minMood?: number;
    },
  ): Promise<ResearchNote[]> {
    const conditions = [
      eq(researchNotes.userId, userId),
      // Logbook list is scoped to entries created via /api/logbook
      // (discriminator tag), so pre-existing /api/research-notes journal
      // notes never leak into the logbook UI or CSV export.
      sql`${researchNotes.tags} @> ARRAY['source:logbook']::text[]`,
    ];
    if (filters?.from) {
      conditions.push(
        sql`COALESCE(${researchNotes.administeredAt}, ${researchNotes.createdAt}) >= ${filters.from}`,
      );
    }
    if (filters?.to) {
      conditions.push(
        sql`COALESCE(${researchNotes.administeredAt}, ${researchNotes.createdAt}) <= ${filters.to}`,
      );
    }
    if (filters?.productId) {
      conditions.push(eq(researchNotes.productId, filters.productId));
    }
    if (filters?.customCompound) {
      // Custom-compound free-text search matches any entry whose `tags`
      // array contains a `compound:<value>` tag (case-insensitive substring).
      const pattern = `%compound:%${filters.customCompound.toLowerCase()}%`;
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM unnest(${researchNotes.tags}) AS t
          WHERE lower(t) LIKE ${pattern}
        )`,
      );
    }
    if (filters?.hasObservation) {
      conditions.push(
        sql`${researchNotes.content} IS NOT NULL AND length(trim(${researchNotes.content})) > 0`,
      );
    }
    if (typeof filters?.minSleep === "number") {
      conditions.push(sql`${researchNotes.sleepScore} >= ${filters.minSleep}`);
    }
    if (typeof filters?.minEnergy === "number") {
      conditions.push(sql`${researchNotes.energyScore} >= ${filters.minEnergy}`);
    }
    if (typeof filters?.minMood === "number") {
      conditions.push(sql`${researchNotes.moodScore} >= ${filters.minMood}`);
    }
    return await db.select().from(researchNotes)
      .where(and(...conditions))
      .orderBy(
        desc(sql`COALESCE(${researchNotes.administeredAt}, ${researchNotes.createdAt})`),
      );
  }

  // ============== CYCLE TAGS ==============
  async listCycleTagsForUser(userId: string): Promise<CycleTag[]> {
    return await db
      .select()
      .from(cycleTags)
      .where(eq(cycleTags.userId, userId));
  }

  async upsertCycleTag(data: InsertCycleTag): Promise<CycleTag> {
    const startTs =
      data.cycleStartTimestamp instanceof Date
        ? data.cycleStartTimestamp
        : new Date(data.cycleStartTimestamp as unknown as string);
    const [row] = await db
      .insert(cycleTags)
      .values({ ...data, cycleStartTimestamp: startTs })
      .onConflictDoUpdate({
        target: [
          cycleTags.userId,
          cycleTags.compoundKey,
          cycleTags.cycleStartTimestamp,
        ],
        set: { name: data.name, updatedAt: new Date() },
      })
      .returning();
    return row;
  }

  async deleteCycleTag(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(cycleTags)
      .where(and(eq(cycleTags.id, id), eq(cycleTags.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async wipeLogbookEntries(userId: string): Promise<number> {
    // Scope wipe strictly to entries that carry the source:logbook
    // discriminator tag. This guarantees pre-existing /api/research-notes
    // journal notes for the same user are never deleted by the logbook
    // "wipe everything" action.
    const result = await db.delete(researchNotes)
      .where(
        and(
          eq(researchNotes.userId, userId),
          sql`${researchNotes.tags} @> ARRAY['source:logbook']::text[]`,
        ),
      )
      .returning();
    return result.length;
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
    const [signup] = await db.insert(waitlistSignups).values({
      ...data,
      foundingMember: false,
      foundingMemberNumber: null,
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

  async upsertDeadLinkHit(type: string, slug: string): Promise<void> {
    const normalized = slug.toLowerCase();
    // Single atomic statement: always increment existing entries; only insert new
    // entries if the total unique slug count is under the cap to prevent unbounded growth.
    await db.execute(sql`
      INSERT INTO dead_link_hits (id, type, slug, count, last_seen_at)
      SELECT gen_random_uuid(), ${type}, ${normalized}, 1, now()
      WHERE (
        EXISTS (SELECT 1 FROM dead_link_hits WHERE type = ${type} AND slug = ${normalized})
        OR (SELECT COUNT(*) FROM dead_link_hits) < 500
      )
      ON CONFLICT (type, slug) DO UPDATE SET
        count = dead_link_hits.count + 1,
        last_seen_at = now()
    `);
  }

  async getAllDeadLinkHits(): Promise<DeadLinkHit[]> {
    return db.select().from(deadLinkHits).orderBy(desc(deadLinkHits.count));
  }

  async deleteDeadLinkHit(type: string, slug: string): Promise<boolean> {
    const normalized = slug.toLowerCase();
    const result = await db
      .delete(deadLinkHits)
      .where(and(eq(deadLinkHits.type, type), eq(deadLinkHits.slug, normalized)))
      .returning({ id: deadLinkHits.id });
    return result.length > 0;
  }

  async clearAllDeadLinkHits(): Promise<number> {
    const result = await db.delete(deadLinkHits).returning({ id: deadLinkHits.id });
    return result.length;
  }

  async getCitationDismissals(): Promise<CitationDismissal[]> {
    return db.select().from(citationDismissals).orderBy(desc(citationDismissals.dismissedAt));
  }

  async dismissCitation(pmid: string): Promise<void> {
    await db
      .insert(citationDismissals)
      .values({ pmid })
      .onConflictDoNothing();
  }

  async undismissCitation(pmid: string): Promise<boolean> {
    const result = await db
      .delete(citationDismissals)
      .where(eq(citationDismissals.pmid, pmid))
      .returning({ pmid: citationDismissals.pmid });
    return result.length > 0;
  }

  async clearCitationDismissals(): Promise<number> {
    const result = await db.delete(citationDismissals).returning({ pmid: citationDismissals.pmid });
    return result.length;
  }

  async getAllStripePresets(): Promise<StripePreset[]> {
    return db.select().from(stripePresets).orderBy(stripePresets.sortOrder, stripePresets.label);
  }

  async getStripePreset(id: string): Promise<StripePreset | undefined> {
    const [preset] = await db.select().from(stripePresets).where(eq(stripePresets.id, id));
    return preset || undefined;
  }

  async createStripePreset(preset: InsertStripePreset): Promise<StripePreset> {
    const [created] = await db.insert(stripePresets).values(preset).returning();
    return created;
  }

  async updateStripePreset(id: string, preset: Partial<InsertStripePreset>): Promise<StripePreset | undefined> {
    const [updated] = await db.update(stripePresets).set(preset).where(eq(stripePresets.id, id)).returning();
    return updated || undefined;
  }

  async deleteStripePreset(id: string): Promise<boolean> {
    const result = await db.delete(stripePresets).where(eq(stripePresets.id, id)).returning({ id: stripePresets.id });
    return result.length > 0;
  }

  async getStripePresetsCount(): Promise<number> {
    const [{ cnt }] = await db.select({ cnt: count() }).from(stripePresets);
    return Number(cnt);
  }

  async seedStripePresets(presets: InsertStripePreset[]): Promise<void> {
    if (presets.length === 0) return;
    await db.insert(stripePresets).values(presets).onConflictDoNothing();
  }

  async getAllLabNotes(): Promise<LabNote[]> {
    return db.select().from(labNotes)
      .where(eq(labNotes.isPublished, true))
      .orderBy(labNotes.sortOrder, desc(labNotes.publishedAt));
  }

  async createLabNote(note: InsertLabNote): Promise<LabNote> {
    const [newNote] = await db.insert(labNotes).values(note).returning();
    return newNote;
  }

  async seedLabNotes(notes: InsertLabNote[]): Promise<void> {
    for (const note of notes) {
      await db.insert(labNotes).values(note).onConflictDoNothing();
    }
  }

  async getResearchStacks(options?: { showOnPage?: boolean }): Promise<ResearchStack[]> {
    if (options?.showOnPage !== undefined) {
      return db.select().from(researchStacks)
        .where(and(eq(researchStacks.isActive, true), eq(researchStacks.showOnPage, options.showOnPage)))
        .orderBy(researchStacks.sortOrder);
    }
    return db.select().from(researchStacks)
      .where(eq(researchStacks.isActive, true))
      .orderBy(researchStacks.sortOrder);
  }

  async getAllResearchStacksAdmin(): Promise<ResearchStack[]> {
    return db.select().from(researchStacks).orderBy(researchStacks.sortOrder);
  }

  async getResearchStackById(id: string): Promise<ResearchStack | undefined> {
    const [stack] = await db.select().from(researchStacks)
      .where(and(eq(researchStacks.id, id), eq(researchStacks.isActive, true)));
    return stack || undefined;
  }

  async upsertResearchStack(data: { id: string } & Partial<InsertResearchStack>): Promise<ResearchStack> {
    const { id, ...rest } = data;
    const [stack] = await db.insert(researchStacks)
      .values({ id, name: rest.name ?? "", description: rest.description ?? "", ...rest })
      .onConflictDoUpdate({
        target: researchStacks.id,
        set: rest,
      })
      .returning();
    return stack;
  }

  async getResearchStackByIdAdmin(id: string): Promise<ResearchStack | undefined> {
    const [stack] = await db.select().from(researchStacks)
      .where(eq(researchStacks.id, id));
    return stack || undefined;
  }

  async createResearchStack(data: { id: string } & InsertResearchStack): Promise<ResearchStack> {
    const { id, ...rest } = data;
    const [stack] = await db.insert(researchStacks)
      .values({ id, ...rest })
      .returning();
    return stack;
  }

  async updateResearchStack(id: string, fields: Partial<InsertResearchStack>): Promise<ResearchStack | undefined> {
    const [stack] = await db.update(researchStacks)
      .set(fields)
      .where(eq(researchStacks.id, id))
      .returning();
    return stack || undefined;
  }

  async updateResearchStackVisibility(id: string, fields: { showOnPage?: boolean; isActive?: boolean }): Promise<ResearchStack | undefined> {
    const [stack] = await db.update(researchStacks)
      .set(fields)
      .where(eq(researchStacks.id, id))
      .returning();
    return stack || undefined;
  }

  async getResearchStacksCount(): Promise<number> {
    const [result] = await db.select({ total: count() }).from(researchStacks)
      .where(eq(researchStacks.isActive, true));
    return result?.total ?? 0;
  }

  async saveArticleView(userId: string, articleId: string): Promise<void> {
    await db
      .insert(articleViews)
      .values({ userId, articleId, viewedAt: new Date() })
      .onConflictDoUpdate({
        target: [articleViews.userId, articleViews.articleId],
        set: { viewedAt: new Date() },
      });
  }

  async getRecentArticleViews(userId: string, limit: number): Promise<string[]> {
    const rows = await db
      .select({ articleId: articleViews.articleId })
      .from(articleViews)
      .where(eq(articleViews.userId, userId))
      .orderBy(desc(articleViews.viewedAt))
      .limit(limit);
    return rows.map((r) => r.articleId);
  }

  async getUserCart(userId: string): Promise<unknown[] | null> {
    const rows = await db
      .select()
      .from(userCarts)
      .where(eq(userCarts.userId, userId))
      .limit(1);
    if (!rows.length) return null;
    const items = rows[0].items;
    return Array.isArray(items) ? items : [];
  }

  async saveUserCart(userId: string, items: unknown[]): Promise<void> {
    await db
      .insert(userCarts)
      .values({ userId, items: items as any, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: userCarts.userId,
        set: { items: items as any, updatedAt: new Date() },
      });
  }

  async deleteUserCart(userId: string): Promise<void> {
    await db.delete(userCarts).where(eq(userCarts.userId, userId));
  }
}

export const storage = new DatabaseStorage();

/**
 * Ensures canonical slugs are set for GLOW and KLOW blend products.
 *
 * These products are typically created through the admin UI. When a product is
 * created without a slug the storage layer auto-generates one from the name, but
 * older records (or any created before auto-generation was in place) may have a
 * null slug. Without the correct slug the PK chart falls back to the composite
 * half-life entry and shows a single blended curve instead of individual
 * constituent curves.
 *
 * Safe to call at startup: runs only if a product with the given name exists and
 * its slug is either null or does not match the expected value.
 */
export async function fixBlendProductSlugs(): Promise<void> {
  const BLEND_SLUG_MAP: Array<{ name: string; slug: string }> = [
    { name: "GLOW Peptide Complex", slug: "glow-peptide-complex" },
    { name: "KLOW Peptide Complex", slug: "klow-peptide-complex" },
  ];

  for (const { name, slug } of BLEND_SLUG_MAP) {
    await db
      .update(products)
      .set({ slug })
      .where(
        and(
          ilike(products.name, name),
          or(isNull(products.slug), sql`${products.slug} != ${slug}`)
        )
      );
  }
}

/**
 * Seeds the stripe_presets table with the default hardcoded presets if it is
 * currently empty. This runs once at startup and is a no-op on subsequent
 * restarts once the table has been populated.
 */
export async function seedStripePresetsIfEmpty(): Promise<void> {
  const existingCount = await storage.getStripePresetsCount();
  if (existingCount > 0) return;

  const DEFAULT_PRESETS: Array<{ label: string; accentColor: string; sortOrder: number }> = [
    { label: "Yellow-Green (Default / Regenerative)", accentColor: "#D4FF1F", sortOrder: 0 },
    { label: "Cyan (Cognitive / Neuro)", accentColor: "#21d8ff", sortOrder: 1 },
    { label: "Purple (GH / IGF-1 / Longevity)", accentColor: "#9d4edd", sortOrder: 2 },
    { label: "Violet (Longevity / Senolytic)", accentColor: "#a855f7", sortOrder: 3 },
    { label: "Indigo (Sleep / Hormonal)", accentColor: "#6366f1", sortOrder: 4 },
    { label: "Green (Immune / Antimicrobial)", accentColor: "#22c55e", sortOrder: 5 },
    { label: "Amber (Metabolic / Mitochondrial)", accentColor: "#f59e0b", sortOrder: 6 },
    { label: "Orange (Fat-Loss / Tanning / GLP-1)", accentColor: "#f97316", sortOrder: 7 },
    { label: "Pink (Skin / Cosmetic)", accentColor: "#ec4899", sortOrder: 8 },
    { label: "Red (Sexual Health)", accentColor: "#f43f5e", sortOrder: 9 },
    { label: "Slate (Reconstitution / Research)", accentColor: "#64748b", sortOrder: 10 },
  ];

  await storage.seedStripePresets(DEFAULT_PRESETS);
}

/**
 * Ensures the four hormonal compound education articles introduced with the
 * HPG Cascade and Triptorelin+Enclomiphene research stacks are present and
 * published in the database. Runs at startup and upserts content on conflict
 * (uses INSERT … ON CONFLICT DO UPDATE) so cross-links and content updates
 * in the seed propagate to existing DB records without manual intervention.
 */
export async function seedHormonalEducationArticlesIfMissing(): Promise<void> {
  const HORMONAL_ARTICLES: Array<{
    slug: string;
    title: string;
    summary: string;
    content: string;
    readTimeMinutes: number;
    sortOrder: number;
    relatedProductIds?: string[];
  }> = [
    {
      slug: "what-is-kisspeptin-peptide",
      title: "Kisspeptin: KISS1 Gene Peptide Family Research Guide",
      summary:
        "Kisspeptin is the collective name for a family of neuropeptides encoded by the KISS1 gene that activate the kisspeptin receptor (KISS1R/GPR54) on hypothalamic GnRH neurons to drive pulsatile GnRH secretion. Researchers use kisspeptin isoforms — ranging from the 10-amino-acid fragment (kisspeptin-10) to the full 54-residue precursor (kisspeptin-54) — to interrogate the upstream hypothalamic gate of the HPG reproductive axis.",
      content: `Kisspeptin refers to a family of neuropeptides produced by cleavage of the KISS1 gene product, a 145-amino-acid precursor protein (prepro-kisspeptin). Proteolytic processing of the precursor by tissue kallikrein and related endopeptidases generates a series of bioactive C-terminal fragments: kisspeptin-54 (the longest naturally occurring isoform, also called metastin), kisspeptin-14, kisspeptin-13, and kisspeptin-10. All isoforms share a conserved C-terminal RF-amide decapeptide sequence (the kisspeptin-10 region) that is essential for binding and activating the kisspeptin receptor — KISS1R, also known as GPR54 — a Gq/11-protein-coupled GPCR expressed predominantly on hypothalamic GnRH neurons in the arcuate nucleus (ARC) and anteroventral periventricular nucleus (AVPV).

KISS1R engagement by any kisspeptin isoform triggers the canonical Gq/11 signaling cascade: receptor-coupled Gαq activates phospholipase C-β (PLCβ), hydrolyzing PIP2 into IP3 and DAG. IP3-driven calcium release from the endoplasmic reticulum, together with DAG-mediated PKC activation, depolarizes GnRH neuron axon terminals and drives pulsatile GnRH release into the hypophyseal portal circulation. This kisspeptin → KISS1R → GnRH → LH/FSH axis represents the principal molecular gate of the hypothalamic-pituitary-gonadal (HPG) reproductive cascade, making kisspeptin compounds indispensable tools for studying upstream neuroendocrine control of gonadotropin secretion.

Kisspeptin neurons in the ARC are the primary pulse generators; they co-express neurokinin B (NKB) and dynorphin (forming the KNDy neuron population) and integrate sex steroid negative feedback to set GnRH pulse frequency. AVPV kisspeptin neurons, by contrast, mediate estrogen-positive feedback and are implicated in the preovulatory LH surge. This anatomical and functional heterogeneity makes the kisspeptin system a rich target for studying hypothalamic circuit regulation.

Research applications include: HPG axis neuroendocrine pharmacology; isoform-selective KISS1R activation studies; pulsatile GnRH and LH/FSH secretion modeling; estrogen feedback pathway dissection; and multi-compound HPG cascade experiments pairing kisspeptin (upstream hypothalamic relay) with downstream tools such as Gonadorelin (direct GnRHR agonist at the pituitary) or Triptorelin (high-affinity GnRHR analog).

**See also:** [Kisspeptin-54: Full-Length KISS1 Isoform Research Guide](/guides/what-is-kisspeptin-54-peptide) — a detailed comparison of the 54-amino-acid precursor isoform versus kisspeptin-10, covering pharmacokinetic differences, receptor occupancy kinetics, and extended GnRH pulse modeling applications.`,
      readTimeMinutes: 7,
      sortOrder: 46,
      relatedProductIds: [
        "4d2b09b2-481d-4901-b54c-8b93ba6fafa7",
        "f1e72c1f-efa9-4a84-8f0a-f25b6e4666a1",
        "0f2b763b-c5df-428d-8dc5-c19ff514ff0c",
      ],
    },
    {
      slug: "what-is-gonadorelin-peptide",
      title: "Gonadorelin: Synthetic GnRH Research Guide",
      summary:
        "Gonadorelin is a synthetic decapeptide identical in sequence to endogenous GnRH. Researchers use it to directly activate pituitary GnRH receptors (GnRHR) and study LH/FSH secretion dynamics in the HPG axis.",
      content: `Gonadorelin (gonadotropin-releasing hormone; GnRH) is a decapeptide synthesized in hypothalamic neurons of the arcuate and preoptic nuclei and released in coordinated pulses into the hypophyseal portal circulation. As a synthetic sequence-identical analog, Gonadorelin acts directly on GnRH receptors (GnRHR) — Gq-protein-coupled GPCRs — expressed on pituitary gonadotroph cells.

Upon GnRHR binding, Gonadorelin activates phospholipase C (PLC), generating IP3 and DAG second messengers that mobilize intracellular calcium from the endoplasmic reticulum and activate protein kinase C (PKC). The resulting calcium transient drives exocytosis of LH and FSH from gonadotroph secretory granules. GnRH pulse frequency and amplitude strongly determine the LH:FSH ratio released — a pulse-frequency encoding mechanism that Gonadorelin allows researchers to dissect under controlled experimental conditions.

Because Gonadorelin is sequence-identical to endogenous GnRH (unlike modified analogs such as Triptorelin or Leuprolide), it has a short half-life due to rapid proteolytic degradation by endopeptidases and aminopeptidases. This property makes it useful for studying acute GnRHR activation and pituitary responses without the receptor desensitization or downregulation associated with long-acting analogs.

Key research applications include: pulsatile GnRH secretion modeling, pituitary GnRHR pharmacology, LH and FSH secretion dynamics, and HPG cascade relay studies when combined with upstream compounds like Kisspeptin-10 (which activates hypothalamic GnRH neurons via KISS1R) to study consecutive signaling steps in the same experimental model.`,
      readTimeMinutes: 7,
      sortOrder: 47,
    },
    {
      slug: "what-is-triptorelin-peptide",
      title: "Triptorelin: High-Affinity GnRH Analog Research Guide",
      summary:
        "Triptorelin is a synthetic GnRH decapeptide analog with a D-Trp6 substitution that confers ~100-fold greater GnRHR binding affinity and proteolytic resistance versus native GnRH. Researchers use it to study receptor occupancy, gonadotropin pulse dynamics, and HPG axis pharmacology.",
      content: `Triptorelin (D-Trp6-GnRH; also D-Trp6-LHRH) is a synthetic decapeptide GnRH analog in which the natural L-glycine at position 6 is replaced with D-tryptophan. This single D-amino acid substitution produces two critical pharmacological differences from native GnRH or Gonadorelin: (1) resistance to proteolytic cleavage by endopeptidases that rapidly degrade the natural L-amino acid chain, resulting in a substantially extended half-life; and (2) enhanced GnRH receptor (GnRHR) binding affinity approximately 100-fold greater than endogenous GnRH, owing to a complementary fit with the GnRHR binding pocket.

Triptorelin acts as a GnRHR agonist on pituitary gonadotroph cells. Binding activates the Gq-coupled receptor, triggering PLC-mediated hydrolysis of PIP2 into IP3 and DAG, calcium mobilization from the endoplasmic reticulum, PKC activation, and downstream transcriptional upregulation of LHβ and FSHβ gonadotropin subunit genes. The result is robust LH and FSH secretion — an exaggerated response compared to native GnRH due to the higher receptor occupancy and sustained binding kinetics.

A defining research feature of Triptorelin is the agonist paradox: while acute administration produces a pronounced stimulatory gonadotropin surge, sustained or continuous exposure leads to GnRHR internalization, receptor number reduction (downregulation), and progressive desensitization of the gonadotroph response. This biphasic behavior — initial stimulation followed by functional suppression — makes Triptorelin uniquely valuable for studying GnRH receptor desensitization kinetics, receptor trafficking, and the dynamics of HPG axis suppression.

Research applications include: GnRHR pharmacology and desensitization studies, LH/FSH pulse shaping under varying dose frequencies, HPG axis modulation when combined with SERMs like Enclomiphene (which removes the estrogenic brake simultaneously), and receptor occupancy versus pulse-frequency sensitivity investigations.`,
      readTimeMinutes: 7,
      sortOrder: 48,
    },
    {
      slug: "what-is-enclomiphene-peptide",
      title: "Enclomiphene: SERM & Estrogen Feedback Research Guide",
      summary:
        "Enclomiphene is the trans-isomer of clomiphene and a selective estrogen receptor modulator (SERM) with ERα antagonist activity at the hypothalamus and anterior pituitary. By blocking estrogen negative feedback, it disinhibits GnRH pulse generation and augments LH/FSH secretion — a key research tool for HPG axis regulatory pharmacology.",
      content: `Enclomiphene is the trans-isomer (E-isomer) of clomiphene citrate, a triphenylethylene-class selective estrogen receptor modulator (SERM). Unlike the cis-isomer (zuclomiphene), which has partial ERα agonist activity, enclomiphene exhibits preferential ERα antagonist activity — particularly in hypothalamic and anterior pituitary tissue — that underpins its research utility for HPG axis studies.

The endocrine brake that enclomiphene targets is estrogen-mediated negative feedback: circulating estradiol (E2) binds ERα on GnRH neurons in the hypothalamic arcuate and preoptic nuclei, as well as on gonadotroph cells in the anterior pituitary, suppressing GnRH pulse frequency and amplitude and reducing pituitary sensitivity to GnRH input. By competitively antagonizing ERα at these central sites, enclomiphene eliminates this transcriptional repression, disinhibiting hypothalamic GnRH pulse generators and increasing pituitary responsiveness to GnRH signals — leading to elevated LH and FSH secretion.

The molecular geometry of the trans-isomer is critical to its receptor selectivity. The spatial arrangement of the triphenylethylene scaffold in the E-configuration creates a distinct binding interface with the ERα ligand-binding domain that favors antagonism, whereas the Z-configuration (zuclomiphene) adopts a geometry more conducive to partial agonism at certain ERα-expressing tissues.

Research applications include: estrogen negative-feedback pathway dissection, gonadotropin disinhibition studies under controlled feedback removal, dual-mechanism HPG axis models when paired with direct GnRHR agonists like Triptorelin (providing simultaneous receptor stimulation and feedback removal), SERM pharmacology and isomer selectivity research, and HPG axis regulatory variable analysis in reproductive endocrinology models.`,
      readTimeMinutes: 8,
      sortOrder: 49,
    },
    {
      slug: "what-is-kisspeptin-54-peptide",
      title: "Kisspeptin-54: Full-Length KISS1 Isoform Research Guide",
      summary:
        "Kisspeptin-54 is the full-length 54-amino-acid KISS1 gene product and the longest naturally occurring kisspeptin isoform. Researchers use it to directly activate KISS1R on hypothalamic GnRH neurons, stimulate pulsatile GnRH secretion, and study HPG axis regulation with a pharmacokinetic profile distinct from the shorter kisspeptin-10 fragment.",
      content: `Kisspeptin-54 (also designated metastin-54 or KP-54) is the 54-amino-acid C-terminal fragment of the KISS1 gene product — the longest naturally occurring isoform of the kisspeptin peptide family. Unlike the truncated kisspeptin-10 fragment (a 10-amino-acid C-terminal decapeptide cleaved from the same precursor by tissue kallikrein and related endopeptidases), kisspeptin-54 retains the complete sequence of the KISS1 protein's bioactive region. Both isoforms share the critical C-terminal RF-amide decapeptide sequence that engages the kisspeptin receptor (KISS1R, also termed GPR54) — a Gq/11-protein-coupled GPCR expressed predominantly on hypothalamic GnRH neurons in the arcuate and anteroventral periventricular nuclei.

KISS1R activation by kisspeptin-54 triggers the canonical Gq/11 signaling cascade: receptor-coupled Gαq activates phospholipase C-β (PLCβ), hydrolyzing membrane phosphatidylinositol-4,5-bisphosphate (PIP2) into inositol trisphosphate (IP3) and diacylglycerol (DAG). IP3-mediated calcium mobilization from the endoplasmic reticulum, amplified by DAG-driven protein kinase C (PKC) activation, depolarizes GnRH neuron terminals and drives pulsatile GnRH release into the hypophyseal portal circulation. This kisspeptin → KISS1R → GnRH pulse axis is the principal molecular gate of the HPG reproductive cascade, positioning kisspeptin-54 as a direct pharmacological tool for interrogating the upstream hypothalamic relay node that controls gonadotropin secretion.

The pharmacokinetic distinction between kisspeptin-54 and kisspeptin-10 is central to their comparative research utility. Kisspeptin-54 has a plasma half-life of approximately 28–35 minutes following subcutaneous administration — substantially longer than the ~15–30 minutes reported for kisspeptin-10 under matched conditions — owing to its larger molecular size and correspondingly slower neprilysin (neutral endopeptidase, NEP/CD10)-mediated cleavage of the intact 54-residue sequence. This extended circulatory residence time produces a more prolonged pulsatile GnRH stimulus with a correspondingly greater LH area-under-the-curve (AUC), a difference directly quantified in randomized crossover pharmacodynamic studies comparing isoform-specific gonadotropin profiles in human volunteers.

Research applications include: KISS1R agonism and Gq/11-pathway pharmacology; comparative isoform studies examining how peptide length alters receptor occupancy kinetics and GnRH pulse amplitude; pulsatile LH/FSH secretion modeling across dose frequencies; and multi-compound HPG cascade models combining kisspeptin-54 (upstream hypothalamic node) with downstream components — such as Gonadorelin (direct GnRHR agonist at the pituitary), Triptorelin (high-affinity GnRHR analog), or Enclomiphene (estrogen-feedback removal) — to dissect consecutive signaling steps at defined relay points within the same experimental model.

**See also:** [Kisspeptin: KISS1 Gene Peptide Family Research Guide](/guides/what-is-kisspeptin-peptide) — a broader overview of the full kisspeptin isoform family (kisspeptin-10, -13, -14, and -54), KISS1R signaling, KNDy neuron biology, and the dual ARC/AVPV circuit architecture that governs HPG pulse generation and the preovulatory LH surge.`,
      readTimeMinutes: 7,
      sortOrder: 51,
      relatedProductIds: [
        "4d2b09b2-481d-4901-b54c-8b93ba6fafa7",
        "f1e72c1f-efa9-4a84-8f0a-f25b6e4666a1",
        "0f2b763b-c5df-428d-8dc5-c19ff514ff0c",
      ],
    },
    {
      slug: "what-is-oxytocin-peptide",
      title: "Oxytocin: Bonding Neuropeptide Research Guide",
      summary:
        "Oxytocin is a hypothalamic nonapeptide released from the posterior pituitary and directly within brain circuits. Researchers study its OXTR-mediated effects on social bonding, limbic reward modulation, and prosocial behavior — including how it interacts with melanocortin and dopaminergic systems.",
      content: `Oxytocin is a cyclic nonapeptide (nine amino acids with an internal disulfide bridge) synthesized in magnocellular neurons of the hypothalamic paraventricular nucleus (PVN) and supraoptic nucleus (SON). It reaches the periphery via axonal transport to the posterior pituitary, from which it is released into systemic circulation. Critically, oxytocin is also released centrally by axon collaterals and dendrites of PVN/SON neurons that project directly to limbic, cortical, and brainstem structures — two anatomically and functionally distinct release pathways that serve different research functions.

Oxytocin exerts its biological effects through the oxytocin receptor (OXTR), a Gq/11-protein-coupled GPCR that activates PLC/IP3/DAG second messenger cascades upon ligand binding, mobilizing intracellular calcium and activating PKC. OXTR is broadly expressed in the limbic system — including the nucleus accumbens (NAc), amygdala, hippocampus, and ventral tegmental area (VTA) — as well as hypothalamic and brainstem circuits. In the NAc, OXTR activation potentiates dopamine release via modulation of GABAergic interneuron tone, linking oxytocinergic signaling to mesolimbic reward circuitry. In the amygdala, OXTR modulates fear responses and the salience of social stimuli. In the VTA, oxytocin inputs influence dopaminergic neuron excitability, contributing to the reinforcing properties of social interaction.

Research interest in oxytocin centers on its role as a neuromodulator of prosocial behavior, pair bonding, trust, and social reward. As a research compound it enables controlled interrogation of OXTR-mediated limbic circuit function. Combined with melanocortin receptor agonists like PT-141 (which activates MC3R/MC4R on overlapping hypothalamic circuits), oxytocin creates a dual-pathway model for studying the convergence of arousal signaling and social bonding on mesolimbic dopamine systems — two neurochemically distinct but functionally complementary axes whose interaction is a major focus in social neuroscience research.`,
      readTimeMinutes: 7,
      sortOrder: 50,
    },
  ];

  for (const article of HORMONAL_ARTICLES) {
    await db
      .insert(educationArticles)
      .values({
        slug: article.slug,
        title: article.title,
        category: "peptides",
        summary: article.summary,
        content: article.content,
        readTimeMinutes: article.readTimeMinutes,
        sortOrder: article.sortOrder,
        isPublished: true,
        relatedProductIds: article.relatedProductIds ?? [],
      })
      .onConflictDoUpdate({
        target: educationArticles.slug,
        set: {
          title: article.title,
          summary: article.summary,
          content: article.content,
          readTimeMinutes: article.readTimeMinutes,
          sortOrder: article.sortOrder,
          relatedProductIds: article.relatedProductIds ?? [],
        },
      });
  }
}

/**
 * Ensures the lab_notes table exists. Uses CREATE TABLE IF NOT EXISTS so it is
 * safe to call on every startup and in any environment (development or
 * production) where drizzle-kit push has not yet been run.
 */
export async function ensureLabNotesTable(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS lab_notes (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      category text NOT NULL,
      content text NOT NULL,
      icon_name text NOT NULL DEFAULT 'Beaker',
      accent_color text NOT NULL DEFAULT '#21d8ff',
      published_at timestamp DEFAULT now(),
      sort_order integer DEFAULT 0,
      is_published boolean DEFAULT true
    )
  `);
}

/**
 * Seeds the lab_notes table with the default research archive entries if it is
 * currently empty. Runs once at startup and is a no-op on subsequent restarts.
 */
export async function seedLabNotesIfEmpty(): Promise<void> {
  const [{ cnt }] = await db.select({ cnt: count() }).from(labNotes);
  if (Number(cnt) > 0) return;

  const DEFAULT_LAB_NOTES = [
    {
      title: "Why We Test for Endotoxins",
      iconName: "Microscope",
      accentColor: "#ef4444",
      publishedAt: new Date("2024-11-15"),
      category: "Testing",
      sortOrder: 1,
      content: `Endotoxins are bacterial cell wall components that can cause severe immune reactions in research subjects. Even small amounts (measured in EU/mg) can compromise research results.

We test every batch to ensure levels remain well below research-safe thresholds, typically targeting **<0.5 EU/mg**.

## Why This Matters

The [LAL (Limulus Amebocyte Lysate) test](https://en.wikipedia.org/wiki/Limulus_amebocyte_lysate) is the gold standard for endotoxin detection. Our third-party labs use this assay on every batch before release.

- Detection threshold: 0.005 EU/mL
- Our target: <0.5 EU/mg per vial
- Result: included on every COA`,
    },
    {
      title: "Understanding Lyophilization",
      iconName: "Thermometer",
      accentColor: "#21d8ff",
      publishedAt: new Date("2024-11-10"),
      category: "Process",
      sortOrder: 2,
      content: `Lyophilization (freeze-drying) removes water from peptide solutions while frozen. This process preserves molecular structure and creates a stable powder that can be stored for years.

The key is controlled freezing at **-80°C** followed by vacuum sublimation — a process that takes 24–48 hours per batch.

## The Three Phases

1. **Freezing** — the sample is cooled below its eutectic point
2. **Primary drying** — sublimation removes ~95% of water under vacuum
3. **Secondary drying** — desorption removes bound water to target <1% residual moisture

This technique is also used in pharmaceutical manufacturing and long-term biological sample preservation.`,
    },
    {
      title: "What Purity Percentage Really Means",
      iconName: "FlaskConical",
      accentColor: "#D4FF1F",
      publishedAt: new Date("2024-11-05"),
      category: "Quality",
      sortOrder: 3,
      content: `When we say **98%+ purity**, we're measuring via HPLC (High-Performance Liquid Chromatography). This tells us what percentage of the sample is the target peptide versus synthesis byproducts or impurities.

For research applications, 95%+ is acceptable; we target 98%+ for consistency.

## How HPLC Works

HPLC separates compounds based on their interaction with a stationary phase column. The detector measures absorbance at 214–220 nm (the peptide bond absorption range), and the area under each peak corresponds to the relative quantity of that component.

> **Note:** Purity percentage does not directly measure biological activity — it measures chemical composition only.`,
    },
    {
      title: "Why Peptide Color Can Vary",
      iconName: "Droplets",
      accentColor: "#9d4edd",
      publishedAt: new Date("2024-10-28"),
      category: "Quality",
      sortOrder: 4,
      content: `Lyophilized peptides range from pure white to off-white to slightly cream-colored. This variation is **normal** and depends on several factors:

- Amino acid sequence composition
- Synthesis conditions and resin used
- Lyophilization parameters (rate, final temperature)
- Residual counter-ions from salt forms (e.g. acetate vs TFA)

Color alone doesn't indicate purity — that's what COA testing confirms. A cream-colored peptide at 99% purity is superior to a white peptide at 90% purity.`,
    },
    {
      title: "How We Prevent Cross-Contamination",
      iconName: "Shield",
      accentColor: "#22c55e",
      publishedAt: new Date("2024-10-20"),
      category: "Process",
      sortOrder: 5,
      content: `Each compound is handled in **dedicated ISO-standard synthesis facilities** with strict protocols to ensure no batch carries traces of another compound.

As a distributor, we only partner with facilities that maintain these rigorous cross-contamination safeguards to protect research integrity.

## Facility Standards We Require

- Dedicated synthesis lines per compound class
- Documented cleaning validation between batches
- Environmental monitoring (particle counts, surface swabs)
- Personnel gowning and airlock entry procedures

These requirements align with [ICH Q7 Good Manufacturing Practice](https://www.ich.org/page/quality-guidelines) guidelines for active pharmaceutical ingredient facilities.`,
    },
    {
      title: "The Role of Mass Spectrometry",
      iconName: "Beaker",
      accentColor: "#f97316",
      publishedAt: new Date("2024-10-15"),
      category: "Testing",
      sortOrder: 6,
      content: `Mass spectrometry (MS) confirms molecular identity by measuring exact molecular weight. While HPLC tells us purity percentage, MS tells us we have the **right molecule**.

The observed mass should match the expected mass within **0.5 daltons** — any significant deviation indicates a synthesis error.

## Interpreting MS Results

| Parameter | Acceptable Range |
|-----------|-----------------|
| Mass error | +/- 0.5 Da |
| Charge states | 2+ to 4+ typical |
| Isotope pattern | Matches theoretical |

We use ESI-MS (electrospray ionization) which is particularly well-suited for large polar molecules like peptides.`,
    },
    {
      title: "Why Storage Temperature Matters",
      iconName: "Thermometer",
      accentColor: "#ec4899",
      publishedAt: new Date("2024-10-08"),
      category: "Storage",
      sortOrder: 7,
      content: `Peptides degrade through **hydrolysis** and **oxidation** — both accelerated by heat and moisture.

## Storage Guidelines

- **Lyophilized powder at -20°C** — extremely stable (2+ years)
- **Reconstituted solution at 2-8°C** — 2–4 weeks typical
- **Avoid freeze-thaw cycles** — aliquot before first use

After reconstitution, 2–8°C storage limits bacterial growth and slows degradation. Bacteriostatic water (containing 0.9% benzyl alcohol) extends reconstituted stability compared to plain sterile water by inhibiting microbial growth.

> Always store away from light. Several peptides (including those with aromatic residues) are photosensitive.`,
    },
    {
      title: "Batch-to-Batch Consistency",
      iconName: "Sparkles",
      accentColor: "#21d8ff",
      publishedAt: new Date("2024-10-01"),
      category: "Quality",
      sortOrder: 8,
      content: `Every batch undergoes identical synthesis protocols, quality checks, and testing procedures.

While minor variations in **appearance** are normal, the purity, identity, and potency should be consistent. This is why we test every batch individually rather than relying on historical data.

## What We Track Across Batches

- HPLC purity (target 98%+)
- MS identity confirmation
- Endotoxin levels (<0.5 EU/mg)
- Net peptide content (accounts for water and counter-ions)

Batch-specific COAs are available for every product we carry — accessible directly from the [COA Library](/coa-library).`,
    },
  ];

  await storage.seedLabNotes(DEFAULT_LAB_NOTES);
}

/**
 * Seeds the research_stacks table with the canonical stack definitions if the
 * table is currently empty. Runs once at startup and is a no-op on subsequent
 * restarts.
 */
export async function seedResearchStacksIfEmpty(): Promise<void> {
  const [{ cnt }] = await db.select({ cnt: count() }).from(researchStacks);
  if (Number(cnt) > 0) return;

  const STACKS = [
    // ── 10 showOnPage=true stacks (full detail pages) ─────────────────────
    {
      id: "recovery-tissue-stack",
      name: "Recovery + Tissue Mechanisms Stack",
      subtitle: "Dual Pathway Tissue Stack",
      description: "This stack combines two of the most extensively researched compounds for tissue mechanism pathways. Ideal for researchers studying synergistic repair signaling and cellular regeneration models.",
      longDescription: "The most well-known peptide pairing in research. BPC-157 drives local tissue repair via VEGF upregulation, growth hormone receptor activation, and cytoprotective mechanisms, while TB-500 provides systemic healing through thymosin beta-4 actin regulation and blood vessel formation. Together they cover both localized and whole-body regeneration pathways — which is why researchers call this the Wolverine Stack.",
      peptideIds: ["bpc-157", "tb-500"],
      peptideDetails: [
        { name: "BPC-157", description: "Extensively studied for tissue mechanism pathways and cellular signaling research" },
        { name: "TB-500", description: "Research focus on thymosin beta-4 derived sequences and tissue modeling" },
      ],
      keyBenefits: ["Dual pathway tissue regeneration support", "Synergistic peptide interaction research", "Comprehensive cellular repair mechanisms", "Blood vessel growth and tissue perfusion support"],
      researchApplications: ["Tissue mechanism pathway studies", "Synergistic peptide interaction research", "Cellular signaling model development", "Regenerative mechanism investigations"],
      synergyCopy: {
        beginner: "BPC-157 helps cells repair faster while TB-500 helps the body build new blood vessels to deliver nutrients. Together, they create a 'repair + rebuild' combination that researchers find works better than either compound alone.",
        expert: "BPC-157 upregulates growth hormone receptors and VEGF expression while TB-500 (Thymosin Beta-4) promotes actin polymerization and angiogenesis. The dual-pathway activation creates synergistic tissue regeneration signaling through complementary GH/IGF-1 axis and cytoskeletal remodeling mechanisms.",
      },
      storageGuide: "Store between 2-8°C (36-46°F) in original packaging. Protect from light and excessive heat.",
      educationLinks: [
        { peptideName: "BPC-157", articleUrl: "/guides/what-is-bpc-157-peptide", articleTitle: "BPC-157: Comprehensive Research Guide" },
        { peptideName: "TB-500", articleUrl: "/guides/what-is-tb-500-peptide", articleTitle: "TB-500: Mechanism of Action Overview" },
      ],
      iconName: "Heart",
      color: "#22c55e",
      badge: "Most Popular",
      badgeColor: "#D4FF1F",
      category: "Recovery",
      synergyBonus: 95,
      showOnPage: true,
      sortOrder: 1,
    },
    {
      id: "gh-amplifier",
      name: "GH Amplifier",
      subtitle: "GHRP + GHRH Synergy Stack",
      description: "The classic growth hormone research duo. Ipamorelin and CJC-1295 activate complementary receptors — GHSR and GHRHR — to produce synergistic GH pulse amplification that neither compound achieves alone.",
      longDescription: "Ipamorelin is a selective growth hormone secretagogue receptor (GHSR) agonist that triggers discrete GH pulses with minimal cortisol or prolactin co-secretion. CJC-1295 is a stabilized GHRH(1-29) analog that acts on the pituitary GHRH receptor (GHRHR), increasing both the frequency and amplitude of natural GH pulses. The dual-receptor model is a well-established pharmacological principle in GH research: GHRP agonists (Ipamorelin) and GHRH analogs (CJC-1295) converge on distinct intracellular cascades — Gq/PKC and Gs/cAMP respectively — within the same somatotroph cell. This convergence produces a multiplicative rather than additive increase in GH secretion.",
      peptideIds: ["ipamorelin", "cjc-1295"],
      peptideDetails: [
        { name: "Ipamorelin", description: "Selective GHSR agonist studied for discrete GH pulse induction with minimal off-target hormone co-secretion" },
        { name: "CJC-1295", description: "Stabilized GHRH(1-29) analog studied for pituitary GHRH receptor activation and GH pulse amplification" },
      ],
      keyBenefits: ["Dual-receptor GH axis activation research", "GHSR and GHRHR convergence studies", "GH pulse amplitude and frequency investigation", "Somatotroph intracellular signaling cascade models"],
      researchApplications: ["Growth hormone secretagogue receptor pharmacology", "GHRH analog pituitary signaling research", "GH pulse kinetics and somatotroph biology studies", "Dual-receptor convergence and GH output modeling"],
      synergyCopy: {
        beginner: "Ipamorelin and CJC-1295 work on two different receptors in the same pituitary cell — like pressing the gas pedal and releasing the brakes at the same time.",
        expert: "Ipamorelin (GHSR agonist) activates Gq/phospholipase C/PKC signaling within somatotroph cells, triggering calcium-dependent GH vesicle exocytosis. CJC-1295 (GHRH analog) activates Gs/adenylyl cyclase/cAMP/PKA signaling at the same somatotroph, increasing somatotroph sensitivity and GH gene transcription.",
      },
      storageGuide: "Store at 2-8°C (36-46°F). CJC-1295 (No DAC) is stable for shorter periods than DAC-conjugated forms. Protect both peptides from light.",
      educationLinks: [
        { peptideName: "Ipamorelin", articleUrl: "/guides/what-is-ipamorelin-peptide", articleTitle: "Ipamorelin: GHSR Agonist Research Guide" },
        { peptideName: "CJC-1295", articleUrl: "/guides/what-is-cjc-1295-peptide", articleTitle: "CJC-1295: GHRH Analog Pharmacokinetics" },
      ],
      iconName: "Zap",
      color: "#6366f1",
      badge: "Classic Combo",
      badgeColor: "#6366f1",
      category: "GH Axis",
      synergyBonus: 88,
      showOnPage: true,
      sortOrder: 2,
    },
    {
      id: "cognitive-edge-stack",
      name: "Cognitive Edge Stack",
      subtitle: "Nootropic Research Duo",
      description: "The gold-standard nootropic research pairing. Semax and Selank target complementary cognitive pathways — one enhancing focus and BDNF expression, the other promoting calm clarity through anxiolytic mechanisms.",
      longDescription: "Semax is an ACTH(4-10) analog that upregulates Brain-Derived Neurotrophic Factor (BDNF) and Nerve Growth Factor (NGF), enhancing neuroplasticity and cognitive processing. Selank is a tuftsin analog that modulates GABAergic neurotransmission and reduces inflammatory cytokines like IL-6, providing anxiolytic neuroprotection through immune-neuroendocrine cross-talk.",
      peptideIds: ["semax", "selank"],
      peptideDetails: [
        { name: "Semax", description: "ACTH fragment analog for BDNF upregulation, neuroplasticity, and cognitive enhancement research" },
        { name: "Selank", description: "Tuftsin analog for anxiolytic mechanisms, GABAergic modulation, and neuroprotection studies" },
      ],
      keyBenefits: ["BDNF and NGF expression research", "Anxiolytic neuroprotection investigation", "Complementary nootropic pathway activation", "Neuroplasticity and cognitive processing studies"],
      researchApplications: ["Neurotrophic factor expression studies", "Cognitive enhancement mechanism research", "Anxiety and stress-response pathway investigation", "Immune-neuroendocrine cross-talk models"],
      synergyCopy: {
        beginner: "Semax is a brain-boosting peptide that helps sharpen focus and supports the growth of new neural connections. Selank promotes a calm, clear-headed state by reducing stress signals without causing drowsiness.",
        expert: "Semax (ACTH 4-10 analog) upregulates BDNF and NGF expression, enhancing neuroplasticity and cognitive processing speed. Selank (tuftsin analog) modulates GABAergic neurotransmission and reduces IL-6 levels, providing anxiolytic effects through immune-neuroendocrine cross-talk.",
      },
      storageGuide: "Refrigerate at 2-8°C (36-46°F). Both peptides should be reconstituted with bacteriostatic water and used within recommended timeframes.",
      educationLinks: [
        { peptideName: "Semax", articleUrl: "/guides/what-is-semax-peptide", articleTitle: "Semax: Cognitive Enhancement Research" },
        { peptideName: "Selank", articleUrl: "/guides/what-is-selank-peptide", articleTitle: "Selank: Anxiolytic Neuroprotection Research" },
      ],
      iconName: "Brain",
      color: "#21d8ff",
      badge: "Top Nootropic",
      badgeColor: "#21d8ff",
      category: "Cognitive",
      synergyBonus: 86,
      showOnPage: true,
      sortOrder: 3,
    },
    {
      id: "glow-protocol",
      name: "Glow Protocol",
      subtitle: "Triple Skin Rejuvenation Stack",
      description: "Combines collagen synthesis, angiogenesis, and tissue repair pathways in one comprehensive skin research stack.",
      longDescription: "The Glow Protocol targets skin biology from three complementary angles. BPC-157 drives VEGF-mediated vascular remodeling. TB-500 (Thymosin Beta-4) promotes actin cytoskeletal organization and systemic tissue repair. GHK-Cu (copper tripeptide) directly stimulates collagen I, III, and elastin synthesis while activating matrix metalloproteinases for extracellular matrix remodeling.",
      peptideIds: ["bpc-157", "tb-500", "ghk-cu"],
      peptideDetails: [
        { name: "BPC-157", description: "Studied for VEGF upregulation and vascular remodeling relevant to dermal tissue perfusion research" },
        { name: "TB-500", description: "Thymosin beta-4 analog studied for actin polymerization, cellular migration, and systemic tissue repair mechanisms" },
        { name: "GHK-Cu", description: "Copper tripeptide studied for collagen and elastin synthesis stimulation and extracellular matrix remodeling" },
      ],
      keyBenefits: ["Tri-pathway dermal regeneration research", "Collagen and elastin synthesis investigation", "Vascular remodeling and tissue perfusion studies", "Extracellular matrix restructuring models"],
      researchApplications: ["Dermal collagen synthesis pathway studies", "VEGF-mediated angiogenesis research in skin models", "Thymosin beta-4 actin dynamics investigation", "Multi-mechanism skin regeneration cascade research"],
      synergyCopy: {
        beginner: "BPC-157 helps build new blood vessels to feed the skin, TB-500 speeds up the migration and repair of skin cells, and GHK-Cu directly tells skin cells to produce more collagen and elastin.",
        expert: "BPC-157 upregulates VEGF and activates growth hormone receptors, promoting angiogenesis and improved dermal perfusion. TB-500 (Thymosin Beta-4) modulates actin dynamics and chemokine gradients (SDF-1/CXCR4), facilitating progenitor cell recruitment. GHK-Cu activates SP1 transcription factor binding sites upstream of collagen I, III, and elastin gene promoters.",
      },
      storageGuide: "Store at 2-8°C (36-46°F). GHK-Cu is particularly light-sensitive; store in amber vials or foil-wrapped containers.",
      educationLinks: [
        { peptideName: "BPC-157", articleUrl: "/guides/what-is-bpc-157-peptide", articleTitle: "BPC-157: Comprehensive Research Guide" },
        { peptideName: "TB-500", articleUrl: "/guides/what-is-tb-500-peptide", articleTitle: "TB-500: Mechanism of Action Overview" },
        { peptideName: "GHK-Cu", articleUrl: "/guides/what-is-ghk-cu-peptide", articleTitle: "GHK-Cu: Copper Peptide Skin Research" },
      ],
      iconName: "Sparkles",
      color: "#ec4899",
      category: "Skin",
      synergyBonus: 90,
      showOnPage: true,
      sortOrder: 4,
    },
    {
      id: "longevity-protocol",
      name: "Longevity Protocol",
      subtitle: "Telomere Extension and Collagen Regeneration Stack",
      description: "Pairs Epithalon's telomerase activation with GHK-Cu's collagen matrix regeneration for a dual-pathway cellular aging research model.",
      longDescription: "Epithalon (Epitalon) is a synthetic tetrapeptide (Ala-Glu-Asp-Gly) derived from the pineal gland extract epithalamin. It has been studied for its ability to activate telomerase enzyme activity and to modulate expression of the catalytic subunit hTERT. GHK-Cu (glycyl-L-histidyl-L-lysine copper(II)) is a naturally occurring copper peptide that activates over 4,000 human genes in studies.",
      peptideIds: ["epithalon", "ghk-cu"],
      peptideDetails: [
        { name: "Epithalon", description: "Synthetic pineal tetrapeptide studied for hTERT-mediated telomerase activation and telomere elongation in aging cell models" },
        { name: "GHK-Cu", description: "Copper tripeptide studied for collagen synthesis activation, antioxidant gene induction, and DNA repair pathway modulation" },
      ],
      keyBenefits: ["Telomerase activation and telomere biology research", "Collagen matrix regeneration alongside cellular aging studies", "Dual-pathway aging mechanism investigation", "Antioxidant gene expression and DNA repair modeling"],
      researchApplications: ["Replicative senescence and telomere length studies", "hTERT expression and telomerase kinetics research", "Collagen synthesis and ECM maintenance in aging models", "Combined genomic and structural aging mechanism research"],
      synergyCopy: {
        beginner: "Epithalon works at the cellular level, helping cells maintain and extend their telomeres. GHK-Cu works at the tissue level, telling cells to produce more collagen and repair DNA damage.",
        expert: "Epithalon (Ala-Glu-Asp-Gly) activates telomerase reverse transcriptase (hTERT) expression, extends telomere length in cultured somatic cells. GHK-Cu activates SP1/AP-1 at collagen gene promoters, induces antioxidant enzymes, and upregulates DNA repair genes (ERCC1, XPA).",
      },
      storageGuide: "Store at 2-8°C (36-46°F). Epithalon is stable in lyophilized form. GHK-Cu should be stored in amber containers away from light.",
      educationLinks: [
        { peptideName: "Epithalon", articleUrl: "/guides/what-is-epithalon-peptide", articleTitle: "Epithalon: Telomerase Research Guide" },
        { peptideName: "GHK-Cu", articleUrl: "/guides/what-is-ghk-cu-peptide", articleTitle: "GHK-Cu: Copper Peptide Skin Research" },
      ],
      iconName: "Crown",
      color: "#a855f7",
      category: "Longevity",
      synergyBonus: 84,
      showOnPage: true,
      sortOrder: 5,
    },
    {
      id: "fat-burner",
      name: "Fat Burner",
      subtitle: "Complementary Fat Metabolism Pathway Stack",
      description: "A two-compound metabolic research model targeting fat metabolism through distinct mechanisms. AOD-9604 activates GH fragment lipolytic signaling, while 5-Amino-1MQ inhibits NNMT enzyme activity.",
      longDescription: "AOD-9604 (Advanced Obesity Drug 9604) is a stabilized 16-amino acid fragment of human growth hormone that has been studied for its ability to activate the GH receptor's fat-metabolizing domain without triggering the growth-promoting effects of full-length GH. 5-Amino-1MQ is a small-molecule NNMT (nicotinamide N-methyltransferase) inhibitor that raises intracellular SAM availability, creating a metabolic shift that promotes white adipose tissue browning.",
      peptideIds: ["aod-9604", "5-amino-1mq"],
      peptideDetails: [
        { name: "AOD-9604", description: "hGH 176-191 fragment studied for GH-related lipolytic receptor activation and lipogenesis inhibition without full-length GH effects" },
        { name: "5-Amino-1MQ", description: "NNMT enzyme inhibitor studied for SAM cycle modulation, white adipose browning, and lipid storage reduction" },
      ],
      keyBenefits: ["Dual-mechanism fat metabolism research model", "GH fragment lipolytic signaling investigation", "NNMT enzyme inhibition and methionine cycle modulation", "White adipose browning pathway studies"],
      researchApplications: ["GH fragment receptor pharmacology studies", "NNMT inhibitor and adipose tissue browning research", "SAM cycle modulation and metabolic reprogramming investigation", "Non-overlapping fat oxidation pathway interaction modeling"],
      synergyCopy: {
        beginner: "AOD-9604 activates the specific part of the growth hormone receptor responsible for fat breakdown. 5-Amino-1MQ blocks an enzyme that normally promotes fat storage, shifting cells toward fat burning. Two separate biological levers, not competing with each other.",
        expert: "AOD-9604 (hGH 176-191) selectively activates GHR domains associated with adipocyte lipolysis without engaging GHR domains responsible for IGF-1 induction. 5-Amino-1MQ inhibits NNMT, raising cellular SAM pools which activates NNMT-dependent metabolic gene programs and promotes WAT browning (UCP1 expression).",
      },
      storageGuide: "Store AOD-9604 at 2-8°C (36-46°F) in lyophilized form; reconstitute with bacteriostatic water. 5-Amino-1MQ is typically studied in oral formulations; store as directed.",
      educationLinks: [
        { peptideName: "AOD-9604", articleUrl: "/guides/what-is-aod-9604-peptide", articleTitle: "AOD-9604: GH Fragment Lipolytic Research" },
        { peptideName: "5-Amino-1MQ", articleUrl: "/guides/what-is-5-amino-1mq-peptide", articleTitle: "5-Amino-1MQ: NNMT Inhibitor Research" },
      ],
      iconName: "Zap",
      color: "#f59e0b",
      category: "Metabolic",
      synergyBonus: 84,
      showOnPage: true,
      sortOrder: 6,
    },
    {
      id: "melanocortin-arousal-stack",
      name: "Melanocortin Arousal & Bonding Stack",
      subtitle: "MC4R + Oxytocin Pathway Research Model",
      description: "A two-compound hormonal research model targeting sexual arousal and social bonding through independent but convergent neuroendocrine pathways.",
      longDescription: "PT-141 (Bremelanotide) is a cyclic heptapeptide melanocortin receptor agonist with selectivity for MC3R and MC4R subtypes expressed in the hypothalamus and spinal cord. Unlike PDE5 inhibitors, PT-141 acts centrally on CNS arousal circuits rather than peripheral vascular tissue. Oxytocin is a nonapeptide synthesized in hypothalamic paraventricular and supraoptic nuclei acting on oxytocin receptors (OXTR) in the limbic system to modulate pair-bonding, social reward, and prosocial behavior.",
      peptideIds: ["pt-141", "oxytocin"],
      peptideDetails: [
        { name: "PT-141", description: "Cyclic melanocortin receptor agonist (MC3R/MC4R) studied for CNS arousal pathway activation independent of peripheral vascular mechanisms" },
        { name: "Oxytocin", description: "Hypothalamic nonapeptide studied for OXTR-mediated social bonding, reward circuitry modulation, and prosocial behavior mechanisms" },
      ],
      keyBenefits: ["Dual-pathway melanocortin and oxytocinergic signaling research", "CNS arousal circuit activation investigation", "Social bonding and reward pathway interaction studies", "Neuroendocrine model independent of gonadal hormone status"],
      researchApplications: ["Melanocortin receptor pharmacology and CNS arousal studies", "Oxytocinergic bonding and limbic reward circuit research", "Neuroendocrine cross-talk in social and sexual behavior models", "MC4R agonist interaction with hypothalamic neuropeptide systems"],
      synergyCopy: {
        beginner: "PT-141 activates specific receptors in the brain that switch on arousal signals. Oxytocin is often called the 'bonding molecule' and works through a different set of brain receptors tied to trust and social closeness.",
        expert: "PT-141 (Bremelanotide) agonizes hypothalamic and spinal MC3R/MC4R, activating downstream cAMP/PKA pathways that modulate dopaminergic arousal circuits. Oxytocin binds OXTR (a Gq-coupled GPCR) in limbic structures, potentiating dopamine release and modulating GABAergic inhibition in reward circuitry.",
      },
      storageGuide: "Store PT-141 lyophilized powder at 2-8°C (36-46°F); reconstitute with bacteriostatic water. Store Oxytocin peptide refrigerated and protected from light.",
      educationLinks: [
        { peptideName: "PT-141", articleUrl: "/guides/what-is-pt-141-bremelanotide-peptide", articleTitle: "PT-141 (Bremelanotide): Melanocortin Receptor Research Guide" },
        { peptideName: "Oxytocin", articleUrl: "/guides/what-is-oxytocin-peptide", articleTitle: "Oxytocin: Bonding Neuropeptide Research Guide" },
      ],
      iconName: "Heart",
      color: "#f43f5e",
      badge: "Hormonal",
      badgeColor: "#f43f5e",
      category: "Hormonal",
      synergyBonus: 86,
      showOnPage: true,
      sortOrder: 7,
    },
    {
      id: "gonadorelin-kisspeptin-hpg-cascade",
      name: "HPG Cascade Priming Stack",
      subtitle: "Gonadorelin + Kisspeptin-10 Upstream Relay Model",
      description: "A two-tier research model of the hypothalamic-pituitary-gonadal cascade. Kisspeptin-10 acts as the upstream trigger, while Gonadorelin directly provides the GnRH signal.",
      longDescription: "Kisspeptin-10 is the C-terminal decapeptide of the KISS1 gene product and the endogenous obligate activator of GnRH neurons. Gonadorelin is a synthetic decapeptide identical in sequence to endogenous GnRH (gonadotropin-releasing hormone). This stack positions the two compounds at adjacent rungs of the same neuroendocrine ladder: Kisspeptin-10 at the hypothalamic trigger level and Gonadorelin at the pituitary receptor level.",
      peptideIds: ["kisspeptin-10", "gonadorelin"],
      peptideDetails: [
        { name: "Kisspeptin-10", description: "KISS1R agonist studied for endogenous GnRH neuron activation and pulsatile hypothalamic relay triggering" },
        { name: "Gonadorelin", description: "Synthetic GnRH decapeptide studied for direct pituitary GnRHR activation and gonadotropin (LH/FSH) secretion dynamics" },
      ],
      keyBenefits: ["Two-tier HPG cascade research", "KISS1R-to-GnRHR relay dissection", "Pulsatile LH and FSH secretion dynamics investigation", "Physiologically sequential neuroendocrine signaling study"],
      researchApplications: ["Kisspeptin–GnRH neuron–pituitary axis relay mapping", "Gonadotropin pulse amplitude and frequency modeling", "HPG axis pharmacology and receptor-level interrogation", "Reproductive neuroendocrinology signaling cascade studies"],
      synergyCopy: {
        beginner: "Kisspeptin-10 is the brain's 'on switch' for the reproductive hormone system — it tells GnRH neurons to fire. Gonadorelin is a lab-made copy of the GnRH signal itself, hitting the next receptor down the chain at the pituitary gland.",
        expert: "Kisspeptin-10 agonizes KISS1R (Gq-coupled GPR54) on hypothalamic GnRH neurons, activating PLC/IP3/DAG cascades that open TRPC channels and depolarize GnRH neurons. Gonadorelin, as a GnRH sequence-identical peptide, acts on pituitary GnRHR triggering PLC-mediated IP3/DAG signaling, calcium mobilization, and transcriptional upregulation of LHβ and FSHβ subunits.",
      },
      storageGuide: "Store Kisspeptin-10 and Gonadorelin lyophilized at 2–8°C (36–46°F). Reconstitute with bacteriostatic water. Both peptides are sensitive to proteolytic degradation.",
      educationLinks: [
        { peptideName: "Kisspeptin-10", articleUrl: "/guides/what-is-kisspeptin-peptide", articleTitle: "Kisspeptin-10: KISS1R Agonist & HPG Axis Research Guide" },
        { peptideName: "Gonadorelin", articleUrl: "/guides/what-is-gonadorelin-peptide", articleTitle: "Gonadorelin: Synthetic GnRH Research Guide" },
      ],
      iconName: "FlaskConical",
      color: "#f97316",
      badge: "HPG Axis",
      badgeColor: "#f97316",
      category: "Hormonal",
      synergyBonus: 85,
      showOnPage: true,
      sortOrder: 8,
    },
    {
      id: "triptorelin-enclomiphene-hpg-axis",
      name: "HPG Axis Modulation Stack",
      subtitle: "Triptorelin + Enclomiphene Gonadotropin Dynamics Model",
      description: "A research model pairing a potent GnRH receptor agonist with a selective estrogen receptor modulator to study opposing regulatory inputs on gonadotropin secretion.",
      longDescription: "Triptorelin is a synthetic GnRH decapeptide analog with approximately 100-fold greater GnRHR binding affinity than endogenous GnRH. Enclomiphene is the trans-isomer of clomiphene and a selective estrogen receptor modulator (SERM) with preferential ERα antagonist activity at the hypothalamus and anterior pituitary. This stack enables researchers to interrogate the HPG axis from two mechanistically independent regulatory angles.",
      peptideIds: ["triptorelin", "enclomiphene"],
      peptideDetails: [
        { name: "Triptorelin", description: "High-affinity D-Trp6 GnRH analog studied for potent GnRHR agonism, LH/FSH secretion dynamics, and receptor desensitization kinetics" },
        { name: "Enclomiphene", description: "Trans-isomer SERM studied for ERα-mediated hypothalamic negative-feedback blockade and gonadotropin disinhibition" },
      ],
      keyBenefits: ["Dual-mechanism HPG axis research", "LH and FSH secretion dynamics under combined regulatory inputs", "GnRH receptor occupancy and downstream signaling investigation", "Estrogen negative-feedback pathway pharmacology"],
      researchApplications: ["Gonadotropin secretion modeling under GnRHR agonist + SERM co-administration", "HPG axis regulatory feedback dissection", "GnRH receptor desensitization and pulse-frequency sensitivity studies", "Reproductive endocrinology and hypogonadism axis research"],
      synergyCopy: {
        beginner: "Triptorelin is a lab-made version of the body's GnRH signal, but stronger and longer-lasting. Enclomiphene blocks the 'estrogen tells the brain to slow down' signal, removing the braking system on the whole axis.",
        expert: "Triptorelin (D-Trp6-GnRH) agonizes pituitary GnRHR with ~100× greater affinity than native GnRH, activating PLC/IP3/DAG cascades and gonadotropin subunit gene transcription. Enclomiphene antagonizes ERα in hypothalamic arcuate nucleus and anterior pituitary neurons, blocking estradiol-mediated transcriptional repression of GnRH and gonadotropin gene expression.",
      },
      storageGuide: "Store Triptorelin lyophilized at 2–8°C (36–46°F) and protect from light; reconstitute with bacteriostatic water. Store Enclomiphene in a cool, dry location. Avoid freeze-thaw cycling for both compounds after reconstitution.",
      educationLinks: [
        { peptideName: "Triptorelin", articleUrl: "/guides/what-is-triptorelin-peptide", articleTitle: "Triptorelin: High-Affinity GnRH Analog Research Guide" },
        { peptideName: "Enclomiphene", articleUrl: "/guides/what-is-enclomiphene-peptide", articleTitle: "Enclomiphene: SERM & Estrogen Feedback Research Guide" },
      ],
      iconName: "Crown",
      color: "#e11d48",
      badge: "HPG Axis",
      badgeColor: "#e11d48",
      category: "Hormonal",
      synergyBonus: 85,
      showOnPage: true,
      sortOrder: 9,
    },
    {
      id: "hpg-axis-restore-stack",
      name: "HPG Axis Research Stack",
      subtitle: "Kisspeptin-10 + MT-2 Neuroendocrine Cross-Talk Model",
      description: "A research model examining hypothalamic reproductive axis regulation through two converging neuroendocrine pathways. Kisspeptin-10 drives GnRH neuron activation, while MT-2 engages melanocortin receptors in the arcuate nucleus.",
      longDescription: "Kisspeptin-10 is the biologically active C-terminal decapeptide of the KISS1 gene product. MT-2 (Melanotan II) is a cyclic heptapeptide analog of alpha-MSH with broad melanocortin receptor agonism (MC1R, MC3R, MC4R). Hypothalamic arcuate nucleus neurons expressing MC3R and MC4R include populations that synapse on and modulate the excitability of kisspeptin neurons, forming a melanocortin-kisspeptin-GnRH relay.",
      peptideIds: ["kisspeptin-10", "melanotan-ii"],
      peptideDetails: [
        { name: "Kisspeptin-10", description: "KISS1R agonist decapeptide studied for endogenous GnRH pulse triggering and hypothalamic HPG axis regulation" },
        { name: "MT-2", description: "Melanocortin analog studied for MC1R/MC3R/MC4R interactions and neuroendocrine cross-talk with reproductive axis circuits" },
      ],
      keyBenefits: ["Dual-entry HPG axis signaling research model", "Kisspeptin-GnRH axis regulation investigation", "Hypothalamic-to-pituitary cascade mechanism studies", "Neuroendocrine reproductive axis pharmacology"],
      researchApplications: ["KISS1R agonist pharmacology and GnRH pulse dynamics", "Melanocortin-HPG axis cross-talk investigation", "Hypothalamic neuropeptide signaling cascade research", "Reproductive neuroendocrinology and gonadotropin secretion models"],
      synergyCopy: {
        beginner: "Kisspeptin-10 is the brain's 'start signal' for the reproductive hormone system. MT-2 works on melanocortin receptors that overlap with reproductive circuits, providing researchers a window into how the arousal and reproductive systems interact.",
        expert: "Kisspeptin-10 agonizes KISS1R (Gq-coupled GPR54) on hypothalamic GnRH neurons, activating PLC/IP3/DAG second messenger cascades. MT-2 (Melanotan II) agonizes MC3R and MC4R expressed in hypothalamic arcuate nucleus neurons adjacent to GnRH neurons, modulating kisspeptin neuron excitability and neuroendocrine integration.",
      },
      storageGuide: "Store both Kisspeptin-10 and MT-2 lyophilized at 2-8°C (36-46°F). Reconstitute with bacteriostatic water; avoid repeated freeze-thaw cycles after reconstitution.",
      educationLinks: [
        { peptideName: "Kisspeptin-10", articleUrl: "/guides/what-is-kisspeptin-peptide", articleTitle: "Kisspeptin-10: KISS1R Agonist & HPG Axis Research Guide" },
        { peptideName: "MT-2", articleUrl: "/guides/what-is-melanotan-peptide", articleTitle: "Melanotan II (MT-2): Melanocortin Receptor Research Guide" },
      ],
      iconName: "FlaskConical",
      color: "#a855f7",
      badge: "Hormonal",
      badgeColor: "#a855f7",
      category: "Hormonal",
      synergyBonus: 84,
      showOnPage: true,
      sortOrder: 10,
    },

    // ── 15 showOnPage=false stacks (synergy engine only) ──────────────────
    {
      id: "total-regen",
      name: "Total Regen",
      subtitle: "Comprehensive Regeneration Protocol",
      description: "Local VEGF-driven healing + systemic thymosin repair + selective GH/IGF-1 amplification for comprehensive tissue regeneration.",
      longDescription: "",
      peptideIds: ["bpc-157", "tb-500", "ipamorelin"],
      peptideDetails: [],
      keyBenefits: [],
      researchApplications: [],
      synergyCopy: { beginner: "", expert: "" },
      storageGuide: "",
      educationLinks: [],
      iconName: "FlaskConical",
      color: "#22c55e",
      category: "Recovery",
      synergyBonus: 92,
      showOnPage: false,
      sortOrder: 11,
    },
    {
      id: "gut-restore",
      name: "Gut Restore",
      subtitle: "GI Mucosal Repair Stack",
      description: "BPC-157 repairs gut mucosal lining through cytoprotection while KPV inhibits NF-κB inflammatory cascades.",
      longDescription: "",
      peptideIds: ["bpc-157", "kpv"],
      peptideDetails: [],
      keyBenefits: [],
      researchApplications: [],
      synergyCopy: { beginner: "", expert: "" },
      storageGuide: "",
      educationLinks: [],
      iconName: "FlaskConical",
      color: "#22c55e",
      category: "Recovery",
      synergyBonus: 91,
      showOnPage: false,
      sortOrder: 12,
    },
    {
      id: "lean-mass",
      name: "Lean Mass",
      subtitle: "Body Composition Stack",
      description: "Dual-axis GH amplification + AMPK-driven mitochondrial energy production for body composition optimization.",
      longDescription: "",
      peptideIds: ["cjc-1295", "ipamorelin", "mots-c"],
      peptideDetails: [],
      keyBenefits: [],
      researchApplications: [],
      synergyCopy: { beginner: "", expert: "" },
      storageGuide: "",
      educationLinks: [],
      iconName: "FlaskConical",
      color: "#6366f1",
      category: "GH Axis",
      synergyBonus: 87,
      showOnPage: false,
      sortOrder: 13,
    },
    {
      id: "anti-aging-protocol",
      name: "Anti-Aging Protocol",
      subtitle: "Cellular Longevity Stack",
      description: "Telomerase activation + DNA repair gene expression + GH-driven tissue renewal — three complementary anti-aging mechanisms.",
      longDescription: "",
      peptideIds: ["epithalon", "ghk-cu", "ipamorelin"],
      peptideDetails: [],
      keyBenefits: [],
      researchApplications: [],
      synergyCopy: { beginner: "", expert: "" },
      storageGuide: "",
      educationLinks: [],
      iconName: "FlaskConical",
      color: "#a855f7",
      category: "Longevity",
      synergyBonus: 85,
      showOnPage: false,
      sortOrder: 14,
    },
    {
      id: "deep-sleep-formula",
      name: "Deep Sleep Formula",
      subtitle: "Sleep Optimization Stack",
      description: "Delta sleep induction + sleep-phase GH release + pineal melatonin regulation — optimizing the nighttime regeneration window.",
      longDescription: "",
      peptideIds: ["dsip", "ipamorelin", "epithalon"],
      peptideDetails: [],
      keyBenefits: [],
      researchApplications: [],
      synergyCopy: { beginner: "", expert: "" },
      storageGuide: "",
      educationLinks: [],
      iconName: "FlaskConical",
      color: "#6366f1",
      category: "GH Axis",
      synergyBonus: 84,
      showOnPage: false,
      sortOrder: 15,
    },
    {
      id: "recovery-plus",
      name: "Recovery+",
      subtitle: "Collagen and Vascular Repair Stack",
      description: "GHK-Cu drives copper-dependent collagen and elastin synthesis while BPC-157 provides vascular infrastructure for nutrient delivery to remodeling tissue.",
      longDescription: "",
      peptideIds: ["bpc-157", "ghk-cu"],
      peptideDetails: [],
      keyBenefits: [],
      researchApplications: [],
      synergyCopy: { beginner: "", expert: "" },
      storageGuide: "",
      educationLinks: [],
      iconName: "FlaskConical",
      color: "#22c55e",
      category: "Recovery",
      synergyBonus: 82,
      showOnPage: false,
      sortOrder: 16,
    },
    {
      id: "metabolic-reset",
      name: "Metabolic Reset",
      subtitle: "Triple Receptor Metabolic Stack",
      description: "Triple metabolic receptor agonism + gut cytoprotection — BPC-157 supports GI comfort during metabolic compound research.",
      longDescription: "",
      peptideIds: ["rr-a3", "bpc-157"],
      peptideDetails: [],
      keyBenefits: [],
      researchApplications: [],
      synergyCopy: { beginner: "", expert: "" },
      storageGuide: "",
      educationLinks: [],
      iconName: "FlaskConical",
      color: "#f59e0b",
      category: "Metabolic",
      synergyBonus: 88,
      showOnPage: false,
      sortOrder: 17,
    },
    {
      id: "cognitive-powerhouse",
      name: "Cognitive Powerhouse",
      subtitle: "Triple Nootropic Stack",
      description: "Multi-peptide neurotrophic mix + targeted BDNF/NGF stimulation + GABAergic mood stabilization — triple-layered brain support.",
      longDescription: "",
      peptideIds: ["cerebrolysin", "semax", "selank"],
      peptideDetails: [],
      keyBenefits: [],
      researchApplications: [],
      synergyCopy: { beginner: "", expert: "" },
      storageGuide: "",
      educationLinks: [],
      iconName: "FlaskConical",
      color: "#21d8ff",
      category: "Cognitive",
      synergyBonus: 90,
      showOnPage: false,
      sortOrder: 18,
    },
    {
      id: "immune-defense",
      name: "Immune Defense",
      subtitle: "Innate + Adaptive Immunity Stack",
      description: "LL-37 cathelicidin provides innate antimicrobial defense while Thymalin restores adaptive immunity through thymic T-cell regeneration.",
      longDescription: "",
      peptideIds: ["ll-37", "thymalin"],
      peptideDetails: [],
      keyBenefits: [],
      researchApplications: [],
      synergyCopy: { beginner: "", expert: "" },
      storageGuide: "",
      educationLinks: [],
      iconName: "FlaskConical",
      color: "#22c55e",
      category: "Recovery",
      synergyBonus: 85,
      showOnPage: false,
      sortOrder: 19,
    },
    {
      id: "mitochondrial-stack",
      name: "Mitochondrial Stack",
      subtitle: "Mitochondrial Optimization Stack",
      description: "SS-31 stabilizes cardiolipin in mitochondrial membranes, then MOTS-C activates AMPK for new mitochondrial biogenesis — sequential: prime existing, then build new.",
      longDescription: "",
      peptideIds: ["ss-31", "mots-c"],
      peptideDetails: [],
      keyBenefits: [],
      researchApplications: [],
      synergyCopy: { beginner: "", expert: "" },
      storageGuide: "",
      educationLinks: [],
      iconName: "FlaskConical",
      color: "#21d8ff",
      category: "Metabolic",
      synergyBonus: 88,
      showOnPage: false,
      sortOrder: 20,
    },
    {
      id: "gh-secretagogue-duo",
      name: "GH Secretagogue Duo",
      subtitle: "Potent GH Release Stack",
      description: "Potent GH release peptide + sustained GHRH for amplified growth hormone output.",
      longDescription: "",
      peptideIds: ["ghrp-2", "cjc-1295"],
      peptideDetails: [],
      keyBenefits: [],
      researchApplications: [],
      synergyCopy: { beginner: "", expert: "" },
      storageGuide: "",
      educationLinks: [],
      iconName: "FlaskConical",
      color: "#6366f1",
      category: "GH Axis",
      synergyBonus: 87,
      showOnPage: false,
      sortOrder: 21,
    },
    {
      id: "endurance-stack",
      name: "Endurance Stack",
      subtitle: "Triple Metabolic Performance Stack",
      description: "Triple metabolic boost - AMPK + mitochondrial biogenesis + cardiolipin stabilization for endurance research.",
      longDescription: "",
      peptideIds: ["aicar", "mots-c", "ss-31"],
      peptideDetails: [],
      keyBenefits: [],
      researchApplications: [],
      synergyCopy: { beginner: "", expert: "" },
      storageGuide: "",
      educationLinks: [],
      iconName: "FlaskConical",
      color: "#f59e0b",
      category: "Metabolic",
      synergyBonus: 87,
      showOnPage: false,
      sortOrder: 22,
    },
    {
      id: "immune-sentinel",
      name: "Immune Sentinel",
      subtitle: "Innate Immunity + Thymic Activation Stack",
      description: "Cathelicidin antimicrobial + thymic immune cell activation for broad immune defense.",
      longDescription: "",
      peptideIds: ["ll-37", "thymosin-alpha-1"],
      peptideDetails: [],
      keyBenefits: [],
      researchApplications: [],
      synergyCopy: { beginner: "", expert: "" },
      storageGuide: "",
      educationLinks: [],
      iconName: "FlaskConical",
      color: "#22c55e",
      category: "Recovery",
      synergyBonus: 87,
      showOnPage: false,
      sortOrder: 23,
    },
    {
      id: "muscle-growth-stack",
      name: "Muscle Growth Stack",
      subtitle: "IGF Hypertrophy Stack",
      description: "Systemic IGF-1 signaling + localized mechano growth factor for hypertrophy research.",
      longDescription: "",
      peptideIds: ["igf-1-lr3", "mgf"],
      peptideDetails: [],
      keyBenefits: [],
      researchApplications: [],
      synergyCopy: { beginner: "", expert: "" },
      storageGuide: "",
      educationLinks: [],
      iconName: "FlaskConical",
      color: "#6366f1",
      category: "GH Axis",
      synergyBonus: 87,
      showOnPage: false,
      sortOrder: 24,
    },
    {
      id: "neuroprotective-stack",
      name: "Neuroprotective Stack",
      subtitle: "Neurotrophic + Pineal Protection Stack",
      description: "Neurotrophic peptide mix + pineal-derived neuroprotection for cognitive resilience research.",
      longDescription: "",
      peptideIds: ["cerebrolysin", "pinealon"],
      peptideDetails: [],
      keyBenefits: [],
      researchApplications: [],
      synergyCopy: { beginner: "", expert: "" },
      storageGuide: "",
      educationLinks: [],
      iconName: "FlaskConical",
      color: "#21d8ff",
      category: "Cognitive",
      synergyBonus: 84,
      showOnPage: false,
      sortOrder: 25,
    },
  ];

  await db.insert(researchStacks).values(STACKS);
  console.log(`[startup] Inserted ${STACKS.length} research stacks`);
}
