import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/seo-head";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  FileCheck,
  ShoppingBag,
  ArrowRight,
  LogOut,
  CheckCircle,
  BookOpen,
  GraduationCap,
  Clock,
  Truck,
  Trophy,
  Crown,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Boxes,
  Settings,
  Home,
  Diamond,
  FlaskConical,
  Bell,
  Lock,
  FileText,
  Activity,
} from "lucide-react";
import type { Order, Product, ResearchPhase, ResearchTitle, SavedStack } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

// ── Configurable research tier ladder ──────────────────────────────────────
// Thresholds are placeholders; Grayson to tune post-launch. All tier names
// and progress copy are COMPLIANCE PENDING — route through legal before launch.
const RESEARCH_TIERS = [
  { name: "Researcher", minOrders: 0, label: "Tier 1" },           // COMPLIANCE PENDING
  { name: "Early Access Researcher", minOrders: 3, label: "Tier 2" }, // COMPLIANCE PENDING
  { name: "Founding Fellow", minOrders: 10, label: "Tier 3" },     // COMPLIANCE PENDING
] as const;

// Number of logbook entries required before the Cycles tool unlocks.
const CYCLES_UNLOCK_THRESHOLD = 3; // tunable post-launch

// Minimum lifetime logbook entries before the Research Summary recap card appears.
// Grayson to tune post-launch — this is the sole gate; order count is NOT used.
const RECAP_ENTRY_THRESHOLD = 3; // COMPLIANCE PENDING

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function getStatusIcon(status: string | null) {
  switch (status) {
    case "completed":
    case "delivered":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "shipped":
      return <Truck className="h-4 w-4 text-blue-500" />;
    case "processing":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusColor(status: string | null): "default" | "secondary" | "outline" {
  switch (status) {
    case "completed":
    case "delivered":
      return "default";
    case "shipped":
      return "secondary";
    default:
      return "outline";
  }
}

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const { addToCart } = useCart();
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Supabase processes the OAuth code asynchronously after the initial
      // session check resolves to null. Suppress the toast while the callback
      // is still in the URL so we don't flash an error that immediately clears.
      const isOAuthCallback =
        window.location.hash.includes("access_token") ||
        window.location.search.includes("code=");
      if (!isOAuthCallback) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your dashboard.",
          variant: "destructive",
        });
      }
    }
  }, [authLoading, isAuthenticated, toast]);

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/my-orders"],
    enabled: isAuthenticated,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  const { data: researchProfile, isLoading: researchProfileLoading } = useQuery<{
    phase: ResearchPhase;
    title: ResearchTitle;
    educationCount: number;
    batchVerificationCount: number;
    compoundsTrackedCount: number;
    safetyCompleted: boolean;
    coaEducationViewed: boolean;
    earlyAccessMember: boolean;
    isFoundingMember: boolean;
    orderCount: number;
    completedLessons: string[];
    currentModuleId: string | null;
  }>({
    queryKey: ["/api/user/research-profile"],
    enabled: isAuthenticated,
  });

  const { data: logbookEntries, isLoading: logbookEntriesLoading } = useQuery<{
    id: string;
    productId: string | null;
    tags: string[] | null;
    createdAt: string;
    administeredAt: string | null;
  }[]>({
    queryKey: ["/api/logbook"],
    enabled: isAuthenticated,
  });

  const { data: cyclesData } = useQuery<{ cycles: { status: string }[]; totalLogbookEntries: number }>({
    queryKey: ["/api/cycles"],
    enabled: isAuthenticated,
  });

  const { data: affiliate } = useQuery<{ id: string } | null>({
    queryKey: ["/api/affiliate/me"],
    enabled: isAuthenticated,
  });

  const { data: savedStacks, isLoading: savedStacksLoading } = useQuery<SavedStack[]>({
    queryKey: ["/api/saved-stacks"],
    enabled: isAuthenticated,
  });

  const { data: reorderNudge } = useQuery<{
    dueCompounds: Array<{
      productId: string;
      name: string;
      weeksSince: number;
      lastQty: number;
    }>;
  }>({
    queryKey: ["/api/user/reorder-nudge"],
    enabled: isAuthenticated,
  });

  const orderCount = orders?.length || 0;

  const getProductName = (productId: string) => {
    const product = products?.find((p) => p.id === productId);
    return product?.name || "Unknown Product";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };


  // ── Dashboard Home derived state ─────────────────────────────────────────
  const logbookCount = logbookEntries?.length ?? 0;
  const completedLessons = researchProfile?.completedLessons ?? [];
  const isFoundingMember = researchProfile?.isFoundingMember ?? false;
  const cyclesUnlocked = logbookCount >= CYCLES_UNLOCK_THRESHOLD;

  // ── Research Summary recap gate & rolling-30-day stats ──────────────────
  // Gate uses lifetime entry count (not windowed) — card stays visible even
  // if the user hasn't logged in the past 30 days.
  const showRecap = logbookCount >= RECAP_ENTRY_THRESHOLD;

  const recapStats = useMemo(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const windowedEntries = (logbookEntries ?? []).filter((e) => {
      const ts = e.administeredAt ?? e.createdAt;
      return new Date(ts) >= thirtyDaysAgo;
    });

    // Distinct compounds tracked — prefer productId, fall back to compound: tags
    const compoundSet = new Set<string>();
    for (const e of windowedEntries) {
      if (e.productId) {
        compoundSet.add(e.productId);
      } else {
        for (const tag of e.tags ?? []) {
          if (tag.startsWith("compound:")) compoundSet.add(tag);
        }
      }
    }

    const windowedOrders = (orders ?? []).filter(
      (o) => o.createdAt && new Date(o.createdAt) >= thirtyDaysAgo,
    );

    const activeCycles =
      cyclesData?.cycles?.filter((c) => c.status === "active").length ?? 0;

    return {
      distinctCompounds: compoundSet.size,
      entriesLogged: windowedEntries.length,
      activeCycles,
      ordersPlaced: windowedOrders.length,
    };
  }, [logbookEntries, orders, cyclesData]);

  // isEmpty: no orders AND no logbook activity at all
  const isEmpty = orderCount === 0 && logbookCount === 0;

  // Resolve current tier based on real order count
  const currentTierIndex = RESEARCH_TIERS.reduce<number>((best, tier, i) =>
    orderCount >= tier.minOrders ? i : best, 0);
  const currentTier = RESEARCH_TIERS[currentTierIndex];
  const nextTier = currentTierIndex + 1 < RESEARCH_TIERS.length
    ? RESEARCH_TIERS[currentTierIndex + 1] : null;
  const ordersToNextTier = nextTier ? Math.max(0, nextTier.minOrders - orderCount) : 0;
  const tierProgress = nextTier
    ? (orderCount - currentTier.minOrders) / (nextTier.minOrders - currentTier.minOrders)
    : 1;

  // Deduplicated "order again" cards — one card per distinct product, most recent
  // order wins, live catalog price used (NOT historical order amount). Products
  // absent from the catalog are silently omitted.
  const reorderCards = useMemo(() => {
    if (!orders?.length || !products?.length) return [];
    const byProduct = new Map<string, Order>();
    [...orders]
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
      .forEach(o => {
        if (o.productId && !byProduct.has(o.productId)) byProduct.set(o.productId, o);
      });
    return Array.from(byProduct.values())
      .map(o => {
        const product = products.find(p => p.id === o.productId);
        return product ? { order: o, product } : null;
      })
      .filter((x): x is { order: Order; product: Product } => x !== null);
    // No artificial cap — spec calls for all distinct past compounds in a horizontal scroll row
  }, [orders, products]);

  const handleReorder = (order: Order) => {
    const product = products?.find(p => p.id === order.productId);
    if (!product) {
      toast({ title: "Cannot Reorder", description: "Product no longer available.", variant: "destructive" });
      return;
    }
    const dosage = product.dosageOptions?.[0];
    if (!dosage) {
      toast({ title: "Cannot Reorder", description: "No dosage options available.", variant: "destructive" });
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: order.quantity,
      dosage,
      image: product.imageUrl || undefined,
    });
    toast({ title: "Added to Cart", description: `${product.name} added to your cart for reorder.` });
  };

  if (authLoading) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-12 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <>
      <SEOHead title="My Dashboard" description="Manage your orders and account settings." canonicalPath="/dashboard" />
      <main className="min-h-screen pt-32 md:pt-40 pb-24 relative overflow-hidden">
        {/* Ambient Background Gradients for Welcoming Feel */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top left cyan glow */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#21d8ff]/8 rounded-full blur-[120px]" />
          {/* Top right yellow glow */}
          <div className="absolute -top-20 -right-40 w-80 h-80 bg-[#D4FF1F]/6 rounded-full blur-[100px]" />
          {/* Middle left purple glow */}
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-[#9d4edd]/8 rounded-full blur-[100px]" />
          {/* Bottom right cyan/teal glow */}
          <div className="absolute bottom-20 -right-32 w-96 h-96 bg-[#21d8ff]/6 rounded-full blur-[120px]" />
          {/* Center subtle warm glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4FF1F]/3 rounded-full blur-[150px]" />
        </div>
        
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Compact Greeting Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1
                    className="font-['Bebas_Neue'] text-3xl md:text-4xl tracking-wide text-white leading-none"
                    data-testid="text-user-name"
                  >
                    {isEmpty
                      ? `Welcome, ${user?.firstName || 'Researcher'}`
                      : (() => {
                          const hour = new Date().getHours();
                          const g = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
                          return `${g}, ${user?.firstName || 'Researcher'}`;
                        })()}
                  </h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {/* Standing tier chip — chartreuse */}
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-[#D4FF1F]/40 bg-[#D4FF1F]/10 text-[#D4FF1F] text-xs font-medium"
                      data-testid="badge-standing-tier"
                    >
                      <FlaskConical className="h-3 w-3" />
                      {currentTier.name}{/* COMPLIANCE PENDING */}
                    </span>
                    {/* Founding Member chip — only in populated state (spec: empty state shows Tier 1 chip only) */}
                    {isFoundingMember && !isEmpty && (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-[#9d4edd]/40 bg-[#9d4edd]/10 text-[#9d4edd] text-xs font-medium"
                        data-testid="badge-founding-member"
                      >
                        <Crown className="h-3 w-3" />
                        Founding Member{/* COMPLIANCE PENDING */}
                      </span>
                    )}
                  </div>
                </div>
                <a href="/api/logout">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 shrink-0"
                    data-testid="button-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* 6-Tab Layout */}
            <motion.div variants={itemVariants}>
              <div className="w-full space-y-12">

                {/* General Section — rebuilt Phase 2 */}
                <section id="section-general" className="space-y-5">

                  {/* ── Reorder reminder banner ─────────────────────────────────
                      Only rendered when at least one compound is due per cadence.
                      Suppressed entirely for empty/new accounts (dueCompounds=[]).
                      All copy strings are COMPLIANCE PENDING.
                  ─────────────────────────────────────────────────────────────── */}
                  {reorderNudge && reorderNudge.dueCompounds.length > 0 && (() => {
                    const top = reorderNudge.dueCompounds[0];
                    const handleBannerClick = () => {
                      const card = document.querySelector(
                        `[data-testid="card-reorder-${top.productId}"]`
                      );
                      if (card) {
                        card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                        (card as HTMLElement).classList.add("ring-1", "ring-[#D4FF1F]/40");
                        setTimeout(() => {
                          (card as HTMLElement).classList.remove("ring-1", "ring-[#D4FF1F]/40");
                        }, 1800);
                      }
                    };
                    return (
                      <motion.div variants={itemVariants}>
                        <button
                          type="button"
                          onClick={handleBannerClick}
                          className="w-full text-left"
                          data-testid="banner-reorder-nudge"
                          aria-label={`Restock reminder for ${top.name}`}
                        >
                          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#D4FF1F]/[0.06] border border-[#D4FF1F]/20 hover:bg-[#D4FF1F]/[0.10] transition-colors min-h-[48px]">
                            <Bell className="h-4 w-4 text-[#D4FF1F] shrink-0" />
                            <p className="text-sm text-[#D4FF1F]/90 flex-1 min-w-0">
                              {/* COMPLIANCE PENDING */}
                              It's been <span className="font-semibold">{top.weeksSince} {top.weeksSince === 1 ? "week" : "weeks"}</span> since your last{" "}
                              <span className="font-semibold">{top.name}</span> order — restock your research supply.
                              {/* COMPLIANCE PENDING */}
                            </p>
                            <ChevronRight className="h-4 w-4 text-[#D4FF1F]/60 shrink-0" />
                          </div>
                        </button>
                      </motion.div>
                    );
                  })()}

                  {/* ── 1. Order Again / Get Started ──────────────────────────── */}
                  {ordersLoading ? (
                    /* ── Skeleton: resolves to Order Again row once orders load ── */
                    <motion.div variants={itemVariants}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-0.5">
                          <Skeleton className="h-3.5 w-24" />
                          <Skeleton className="h-3.5 w-16" />
                        </div>
                        <div className="flex gap-3 overflow-hidden">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-[152px] w-48 shrink-0 rounded-lg" />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : isEmpty ? (
                    /* ── Empty state: first-order prompt ── */
                    <motion.div variants={itemVariants}>
                      <Card className="border-white/10 bg-white/[0.03]">
                        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                          <div className="p-3 rounded-xl bg-[#D4FF1F]/10 border border-[#D4FF1F]/20 shrink-0">
                            <ShoppingBag className="h-6 w-6 text-[#D4FF1F]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="font-semibold text-base mb-1">
                              Place your first order{/* COMPLIANCE PENDING */}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              {/* COMPLIANCE PENDING: founding-member offer & "25% off for life" copy needs legal review */}
                              The first 50 customers receive Founding Member status — a permanent 25% discount on every future order.{/* COMPLIANCE PENDING */}
                            </p>
                          </div>
                          <Link href="/peptides">
                            <Button
                              className="bg-[#D4FF1F] text-black font-semibold shrink-0"
                              data-testid="button-get-started-shop"
                            >
                              Browse Compounds{/* COMPLIANCE PENDING */}
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    /* ── Populated state: horizontal scroll row of reorder cards ── */
                    <motion.div variants={itemVariants} className="space-y-2">
                      <div className="flex items-center justify-between px-0.5">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                          Order Again
                        </h2>
                        <Link
                          href="/dashboard/orders"
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-0.5 min-h-[48px] px-1"
                          data-testid="link-all-orders"
                        >
                          All orders
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                      {/* Horizontal scroll — prevents layout overflow per spec (f) */}
                      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scroll-smooth">
                        {reorderCards.map(({ order, product }) => {
                          const doseVariant = product.dosageOptions?.[0] ?? null;
                          return (
                            <Card
                              key={product.id}
                              className="border-white/10 bg-white/[0.03] shrink-0 w-48"
                              data-testid={`card-reorder-${product.id}`}
                            >
                              <CardContent className="p-4 flex flex-col gap-3 h-full">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-10 w-10 rounded-md object-cover border border-white/10"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0 space-y-0.5">
                                  <p
                                    className="font-medium text-sm leading-tight line-clamp-2"
                                    data-testid={`text-reorder-name-${product.id}`}
                                  >
                                    {product.name}
                                  </p>
                                  {doseVariant && (
                                    <p className="text-xs text-muted-foreground truncate" data-testid={`text-reorder-variant-${product.id}`}>
                                      {doseVariant}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground" data-testid={`text-reorder-qty-${product.id}`}>
                                    Qty: {order.quantity}
                                  </p>
                                  <p className="text-xs font-medium text-white" data-testid={`text-reorder-price-${product.id}`}>
                                    ${Number(product.price).toFixed(2)}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  className="w-full border-white/15 text-xs min-h-[48px]"
                                  onClick={() => handleReorder(order)}
                                  data-testid={`button-reorder-${product.id}`}
                                >
                                  <RefreshCw className="h-3 w-3 mr-1.5" />
                                  Reorder
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* ── 2. Your Research Standing ──────────────────────────────── */}
                  {/* Chartreuse border glow is ONLY on this card — nowhere else in the section */}
                  {ordersLoading ? (
                    <motion.div variants={itemVariants}>
                      <Card className="border-[#D4FF1F]/25 bg-white/[0.03] shadow-[0_0_24px_0_rgba(212,255,31,0.06)]">
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1.5">
                              <Skeleton className="h-3 w-36" />
                              <Skeleton className="h-7 w-44" />
                            </div>
                            <Skeleton className="h-3 w-16 mt-1 shrink-0" />
                          </div>
                          <Skeleton className="h-1.5 w-full rounded-full" />
                          <Skeleton className="h-3 w-56" />
                          <div className="flex gap-2 pt-1">
                            {[1, 2, 3].map((i) => (
                              <Skeleton key={i} className="h-5 w-14 rounded-md" />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                  <motion.div variants={itemVariants}>
                    <Card
                      className="border-[#D4FF1F]/25 bg-white/[0.03] shadow-[0_0_24px_0_rgba(212,255,31,0.06)]"
                      data-testid="card-research-standing"
                    >
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                              Your Research Standing{/* COMPLIANCE PENDING */}
                            </p>
                            <h3 className="text-xl font-semibold text-[#D4FF1F]" data-testid="text-tier-name">
                              {currentTier.name}{/* COMPLIANCE PENDING */}
                            </h3>
                          </div>
                          <span
                            className="text-xs text-muted-foreground shrink-0 mt-1"
                            data-testid="text-tier-label"
                          >
                            Tier {currentTierIndex + 1} of {RESEARCH_TIERS.length}{/* COMPLIANCE PENDING */}
                          </span>
                        </div>
                        {/* Progress bar — always paired with a text label */}
                        <div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#D4FF1F] rounded-full transition-all duration-700"
                              style={{ width: `${Math.round(tierProgress * 100)}%` }}
                              data-testid="bar-tier-progress"
                            />
                          </div>
                        </div>
                        {/* Next unlock text — below the bar */}
                        <p
                          className="text-xs text-muted-foreground"
                          data-testid="text-tier-next-unlock"
                        >
                          {nextTier
                            ? `Place ${ordersToNextTier} more order${ordersToNextTier !== 1 ? 's' : ''} to unlock ${nextTier.name}`
                            : `${currentTier.name} — highest tier reached`
                          }{/* COMPLIANCE PENDING */}
                        </p>
                        {/* Tier ladder pills */}
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          {RESEARCH_TIERS.map((tier, i) => (
                            <span
                              key={tier.name}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                                i <= currentTierIndex
                                  ? 'bg-[#D4FF1F]/15 border border-[#D4FF1F]/35 text-[#D4FF1F]'
                                  : 'bg-white/5 border border-white/10 text-muted-foreground'
                              }`}
                              data-testid={`badge-tier-${i}`}
                            >
                              {i <= currentTierIndex && <CheckCircle className="h-2.5 w-2.5" />}
                              {tier.label}{/* COMPLIANCE PENDING */}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  )}

                  {/* ── 3. Continue / Start Here ───────────────────────────────── */}
                  {/* Decision is driven by currentModuleId (in-progress module), NOT completedLessons.length */}
                  {researchProfileLoading ? (
                    <motion.div variants={itemVariants}>
                      <Card className="border-white/10 bg-white/[0.03]">
                        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3 w-52" />
                          </div>
                          <Skeleton className="h-9 w-28 shrink-0 rounded-md" />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                  <motion.div variants={itemVariants}>
                    <Card className="border-white/10 bg-white/[0.03]" data-testid="card-continue-here">
                      <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="p-2.5 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20 shrink-0">
                          <BookOpen className="h-5 w-5 text-[#21d8ff]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {researchProfile?.currentModuleId ? (
                            <>
                              <p className="font-semibold text-sm">Continue the Academy</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Pick up where you left off · {completedLessons.length} lesson{completedLessons.length !== 1 ? 's' : ''} completed
                                {/* COMPLIANCE PENDING */}
                              </p>
                            </>
                          ) : isEmpty ? (
                            <>
                              <p className="font-semibold text-sm">Start Here</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Build your research foundation · 0 / 6 modules{/* COMPLIANCE PENDING */}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-semibold text-sm">Start the Academy</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                0 / 6 modules complete · begin your research education{/* COMPLIANCE PENDING */}
                              </p>
                            </>
                          )}
                        </div>
                        <Link href="/dashboard/academy">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#21d8ff]/25 text-[#21d8ff] shrink-0"
                            data-testid="button-go-to-academy"
                          >
                            {researchProfile?.currentModuleId ? 'Continue' : isEmpty ? 'Start Here' : 'Start the Academy'}
                            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                  )}

                  {/* ── 3b. Research Summary Recap Card (data-gated) ───────────── */}
                  {/* Shows skeleton while logbook data loads; once resolved, renders only
                      when lifetime entries >= RECAP_ENTRY_THRESHOLD — otherwise absent. */}
                  {logbookEntriesLoading ? (
                    <motion.div variants={itemVariants}>
                      <Card className="border-[#21d8ff]/25 bg-white/[0.03]">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1.5">
                              <Skeleton className="h-3 w-36" />
                              <Skeleton className="h-5 w-44" />
                            </div>
                            <Skeleton className="h-5 w-14 rounded-md" />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3].map((i) => (
                              <Skeleton key={i} className="h-12 rounded-lg" />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : showRecap && (
                    <motion.div variants={itemVariants}>
                      <Card
                        className="border-[#21d8ff]/25 bg-white/[0.03] shadow-[0_0_20px_0_rgba(33,216,255,0.05)]"
                        data-testid="card-research-summary"
                      >
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                                Your Research Summary{/* COMPLIANCE PENDING */}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Last 30 days of activity{/* COMPLIANCE PENDING */}
                              </p>
                            </div>
                            <div className="p-2 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20 shrink-0">
                              <Activity className="h-4 w-4 text-[#21d8ff]" />
                            </div>
                          </div>

                          {/* 4-stat grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div
                              className="rounded-md bg-white/[0.03] border border-white/8 px-3 py-2.5"
                              data-testid="stat-recap-compounds"
                            >
                              <p className="text-xl font-semibold text-white">
                                {recapStats.distinctCompounds}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {recapStats.distinctCompounds === 1
                                  ? "compound tracked" // COMPLIANCE PENDING
                                  : "compounds tracked"}{/* COMPLIANCE PENDING */}
                              </p>
                            </div>
                            <div
                              className="rounded-md bg-white/[0.03] border border-white/8 px-3 py-2.5"
                              data-testid="stat-recap-entries"
                            >
                              <p className="text-xl font-semibold text-white">
                                {recapStats.entriesLogged}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {recapStats.entriesLogged === 1
                                  ? "observation logged" // COMPLIANCE PENDING
                                  : "observations logged"}{/* COMPLIANCE PENDING */}
                              </p>
                            </div>
                            <div
                              className="rounded-md bg-white/[0.03] border border-white/8 px-3 py-2.5"
                              data-testid="stat-recap-cycles"
                            >
                              <p className="text-xl font-semibold text-white">
                                {recapStats.activeCycles}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {recapStats.activeCycles === 1
                                  ? "active research cycle" // COMPLIANCE PENDING
                                  : "active research cycles"}{/* COMPLIANCE PENDING */}
                              </p>
                            </div>
                            <div
                              className="rounded-md bg-white/[0.03] border border-white/8 px-3 py-2.5"
                              data-testid="stat-recap-orders"
                            >
                              <p className="text-xl font-semibold text-white">
                                {recapStats.ordersPlaced}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {recapStats.ordersPlaced === 1
                                  ? "order placed" // COMPLIANCE PENDING
                                  : "orders placed"}{/* COMPLIANCE PENDING */}
                              </p>
                            </div>
                          </div>

                          {/* CTA — soft label; does not promise a full Wrapped experience */}
                          <Link href="/dashboard/summary">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full border border-[#21d8ff]/20 text-[#21d8ff] hover:text-[#21d8ff]"
                              data-testid="button-recap-see-activity"
                            >
                              See recent activity{/* COMPLIANCE PENDING */}
                              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* ── 4. Research Tools Hub ──────────────────────────────────── */}
                  {/* 2-col grid: Stacks | Logbook, Cycles | Verify COA + full-width Academy row */}
                  <motion.div variants={itemVariants} className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-0.5">
                      Research Tools
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Stacks */}
                      <Link href="/dashboard/stacks">
                        <Card
                          className="border-white/10 bg-white/[0.03] hover-elevate cursor-pointer"
                          data-testid="card-tool-stacks"
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#9d4edd]/10 border border-[#9d4edd]/20 shrink-0">
                              <Boxes className="h-4 w-4 text-[#9d4edd]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">My Stacks</p>
                              <p className="text-xs text-muted-foreground" data-testid="text-tool-stacks-count">
                                {(savedStacks?.length ?? 0) === 0
                                  ? 'Build your first stack'
                                  : `${savedStacks!.length} saved`}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Logbook — privacy note in both states */}
                      <Link href="/dashboard/logbook">
                        <Card
                          className="border-white/10 bg-white/[0.03] hover-elevate cursor-pointer"
                          data-testid="card-tool-logbook"
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20 shrink-0">
                              <FileText className="h-4 w-4 text-[#21d8ff]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">Logbook</p>
                              <p className="text-xs text-muted-foreground" data-testid="text-tool-logbook-count">
                                {logbookCount === 0 ? 'Log your first entry' : `${logbookCount} entr${logbookCount === 1 ? 'y' : 'ies'}`}
                              </p>
                              <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-tight" data-testid="text-tool-logbook-privacy">
                                Private to you · wiped from Settings · not a medical record
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Cycles — locked state shows real progress toward threshold */}
                      {cyclesUnlocked ? (
                        <Link href="/dashboard/cycles">
                          <Card
                            className="border-white/10 bg-white/[0.03] hover-elevate cursor-pointer"
                            data-testid="card-tool-cycles"
                          >
                            <CardContent className="p-4 flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-[#D4FF1F]/10 border border-[#D4FF1F]/20 shrink-0">
                                <RefreshCw className="h-4 w-4 text-[#D4FF1F]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">Cycles</p>
                                <p className="text-xs text-muted-foreground" data-testid="text-tool-cycles-count">
                                  {(() => {
                                    const activeCycles = cyclesData?.cycles?.filter(c => c.status === 'active').length ?? 0;
                                    return activeCycles === 0
                                      ? 'No active cycles'
                                      : `${activeCycles} active cycle${activeCycles !== 1 ? 's' : ''}`;
                                  })()}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            </CardContent>
                          </Card>
                        </Link>
                      ) : (
                        /* Locked — forward-looking progress, not a dead label */
                        <Card
                          className="border-white/8 bg-white/[0.015]"
                          data-testid="card-tool-cycles-locked"
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5 border border-white/8 shrink-0">
                              <Lock className="h-4 w-4 text-muted-foreground/60" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-muted-foreground">Cycles</p>
                              <p className="text-xs text-muted-foreground/70" data-testid="text-tool-cycles-locked-hint">
                                Add {CYCLES_UNLOCK_THRESHOLD - logbookCount} more log {CYCLES_UNLOCK_THRESHOLD - logbookCount === 1 ? 'entry' : 'entries'} to unlock
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Verify COA — links to the real COA verification route */}
                      <Link href="/coa/verify-certificate-of-analysis">
                        <Card
                          className="border-white/10 bg-white/[0.03] hover-elevate cursor-pointer"
                          data-testid="card-tool-verify-coa"
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 shrink-0">
                              <FileCheck className="h-4 w-4 text-green-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">Verify COA</p>
                              <p className="text-xs text-muted-foreground" data-testid="text-tool-verify-coa-hint">
                                {researchProfile?.batchVerificationCount
                                  ? `${researchProfile.batchVerificationCount} batch${researchProfile.batchVerificationCount !== 1 ? 'es' : ''} verified`
                                  : 'Check batch certificates'}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </CardContent>
                        </Card>
                      </Link>
                    </div>

                    {/* Academy — full-width row below the 2-col grid */}
                    <Link href="/dashboard/academy">
                      <Card
                        className="border-white/10 bg-white/[0.03] hover-elevate cursor-pointer"
                        data-testid="card-tool-academy"
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#ec4899]/10 border border-[#ec4899]/20 shrink-0">
                            <GraduationCap className="h-4 w-4 text-[#ec4899]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">Research Academy</p>
                            <p className="text-xs text-muted-foreground" data-testid="text-tool-academy-count">
                              {completedLessons.length === 0
                                ? 'Start learning · 0 / 6 modules'
                                : `${completedLessons.length} / 17 lessons complete`}{/* COMPLIANCE PENDING */}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>

                  {/* ── 5. Account Rows ────────────────────────────────────────── */}
                  <motion.div variants={itemVariants}>
                    <Card className="border-white/10 bg-white/[0.03] divide-y divide-white/8" data-testid="card-account-rows">
                      {/* My Orders */}
                      <Link
                        href="/dashboard/orders"
                        className="w-full flex items-center gap-3 px-5 py-4 text-left hover-elevate"
                        data-testid="button-nav-orders"
                      >
                        <div className="p-1.5 rounded-md bg-white/5 shrink-0">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">My Orders</p>
                          {ordersLoading ? (
                            <Skeleton className="h-3 w-24 mt-0.5" />
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {orderCount === 0 ? 'No orders yet' : `${orderCount} order${orderCount !== 1 ? 's' : ''}`}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Link>

                      {/* Your Benefits */}
                      <Link
                        href="/benefits"
                        className="w-full flex items-center gap-3 px-5 py-4 text-left hover-elevate"
                        data-testid="button-nav-benefits"
                      >
                        <div className="p-1.5 rounded-md bg-white/5 shrink-0">
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Your Benefits</p>
                          {ordersLoading ? (
                            <Skeleton className="h-3 w-32 mt-0.5" />
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {isFoundingMember ? 'Founding member perks active' : 'Loyalty rewards & perks'}
                              {/* COMPLIANCE PENDING */}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Link>

                      {/* Affiliate Earnings */}
                      {affiliate?.id ? (
                        <Link
                          href="/affiliate"
                          className="w-full flex items-center gap-3 px-5 py-4 text-left hover-elevate"
                          data-testid="button-nav-affiliate"
                        >
                          <div className="p-1.5 rounded-md bg-white/5 shrink-0">
                            <Diamond className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Affiliate Earnings</p>
                            <p className="text-xs text-muted-foreground">View commissions &amp; payouts</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </Link>
                      ) : (
                        <Link
                          href="/affiliate"
                          className="w-full flex items-center gap-3 px-5 py-4 text-left hover-elevate"
                          data-testid="button-nav-affiliate-apply"
                        >
                          <div className="p-1.5 rounded-md bg-white/5 shrink-0">
                            <Diamond className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Affiliate Earnings</p>
                            <p className="text-xs text-muted-foreground">Apply to earn commissions</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </Link>
                      )}

                      {/* Settings */}
                      <Link
                        href="/dashboard/settings"
                        className="w-full flex items-center gap-3 px-5 py-4 text-left hover-elevate"
                        data-testid="button-nav-settings"
                      >
                        <div className="p-1.5 rounded-md bg-white/5 shrink-0">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Settings</p>
                          <p className="text-xs text-muted-foreground">Profile &amp; notifications</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Link>
                    </Card>
                  </motion.div>

                </section>

              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

    </>
  );
}
