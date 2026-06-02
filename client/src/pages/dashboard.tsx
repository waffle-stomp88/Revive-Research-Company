import { useState, useEffect, useMemo, lazy, Suspense } from "react";
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
  ShieldCheck,
} from "lucide-react";
import type { Order, Product, Coa, ResearchPhase, ResearchTitle, SavedStack } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

import { CompoundFinder } from "@/components/compound-finder";

// Extended Order type returned by /api/orders/my-orders — includes server-side
// COA existence check so the client never shows a broken batch-level link.
type EnrichedOrder = Order & { batchHasCoa?: boolean };
const LogbookTab = lazy(() =>
  import("@/components/logbook-tab").then((m) => ({ default: m.LogbookTab }))
);
const LogbookWipeCard = lazy(() =>
  import("@/components/logbook-tab").then((m) => ({ default: m.LogbookWipeCard }))
);
const CyclesTab = lazy(() =>
  import("@/components/cycles/CyclesTab").then((m) => ({ default: m.CyclesTab }))
);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const validTabs = ["general", "orders", "stacks", "logbook", "cycles", "education", "settings"];
    if (tab && validTabs.includes(tab)) {
      const sectionId = `section-${tab}`;
      const scroll = () => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          history.replaceState(null, "", `/dashboard#${sectionId}`);
        }
      };
      const timer = setTimeout(scroll, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const { data: orders, isLoading: ordersLoading } = useQuery<EnrichedOrder[]>({
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

                {/* Orders Section */}
                <section id="section-orders" className="space-y-6">
                  {/* Order History */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-[#9d4edd]" />
                            Order History
                          </CardTitle>
                          <CardDescription>View and track your orders</CardDescription>
                        </div>
                        <Link href="/products">
                          <Button size="sm" className="bg-[#D4FF1F] text-black" data-testid="button-shop-more">
                            Shop More
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {ordersLoading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                        </div>
                      ) : orders && orders.length > 0 ? (
                        <div className="space-y-4">
                          {orders.map((order, idx) => {
                            const colors = ['#D4FF1F', '#21d8ff', '#9d4edd', '#ec4899', '#f97316'];
                            const color = colors[idx % colors.length];
                            const statusStep = getStatusStep(order);
                            return (
                              <div key={order.id} className="p-4 rounded-lg border" data-testid={`order-item-${order.id}`}>
                                {/* Order Header */}
                                <div className="flex items-start gap-4 mb-3">
                                  <div className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                                    <Package className="h-6 w-6" style={{ color }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {order.items && order.items.length > 0 ? (
                                        <p className="font-medium truncate">
                                          {order.items.length === 1
                                            ? order.items[0].name
                                            : `${order.items.length} items`}
                                        </p>
                                      ) : (
                                        <p className="font-medium truncate">{getProductName(order.productId)}</p>
                                      )}
                                      <span className="text-xs text-muted-foreground font-mono">{getOrderNumber(order.id)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(order.createdAt)}</span>
                                      {(!order.items || order.items.length === 0) && (
                                        <>
                                          <span>•</span>
                                          <span>Qty: {order.quantity}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="font-semibold text-lg">${Number(order.totalAmount).toFixed(2)}</p>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="text-[#21d8ff] min-h-[48px]"
                                      onClick={() => handleReorder(order)}
                                      data-testid={`button-reorder-${order.id}`}
                                    >
                                      <RefreshCw className="h-3 w-3 mr-1" />
                                      Reorder
                                    </Button>
                                  </div>
                                </div>

                                {/* Line items breakdown — shown when order.items is populated */}
                                {order.items && order.items.length > 0 && (
                                  <div className="mb-3 rounded-md border border-white/8 bg-white/[0.03] divide-y divide-white/8" data-testid={`order-line-items-${order.id}`}>
                                    {order.items.map((item, itemIdx) => (
                                      <div key={itemIdx} className="flex items-center justify-between gap-3 px-3 py-2.5" data-testid={`order-line-item-${order.id}-${itemIdx}`}>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">{item.name}</p>
                                          {item.dosage && (
                                            <p className="text-xs text-muted-foreground">{item.dosage}</p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0 text-sm text-muted-foreground">
                                          <span data-testid={`order-line-item-qty-${order.id}-${itemIdx}`}>×{item.quantity}</span>
                                          <span className="font-medium text-foreground" data-testid={`order-line-item-price-${order.id}-${itemIdx}`}>${Number(item.unitPrice).toFixed(2)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {order.trackingNumber && order.carrier && (
                                  <div className="p-3 rounded-lg bg-[#21d8ff]/5 border border-[#21d8ff]/20 mb-3" data-testid={`tracking-info-${order.id}`}>
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <div className="flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-[#21d8ff]" />
                                        <span className="text-sm font-medium">{order.carrier}</span>
                                        <span className="text-sm font-mono text-muted-foreground">{order.trackingNumber}</span>
                                      </div>
                                      <a 
                                        href={getCarrierTrackingUrl(order.carrier, order.trackingNumber)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        data-testid={`link-track-package-${order.id}`}
                                      >
                                        <Button size="sm" variant="outline" className="text-[#21d8ff] border-[#21d8ff]/30">
                                          Track Package
                                        </Button>
                                      </a>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Status Timeline */}
                                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/5">
                                  {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                                    const isComplete = i <= statusStep;
                                    const isCurrent = i === statusStep;
                                    return (
                                      <div key={step} className="flex-1 flex items-center gap-1">
                                        <div className={`h-2 w-2 rounded-full shrink-0 ${isComplete ? 'bg-green-500' : 'bg-muted'} ${isCurrent ? 'ring-2 ring-green-500/30' : ''}`} />
                                        <div className={`flex-1 h-0.5 ${i < 3 ? (i < statusStep ? 'bg-green-500' : 'bg-muted') : 'hidden'}`} />
                                        <span className={`text-[10px] hidden sm:block ${isComplete ? 'text-green-500' : 'text-muted-foreground'}`}>{step}</span>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* COA reference — per-order batch link (B1) or product-level fallback (B2) */}
                                {/* COMPLIANCE PENDING: all copy strings below */}
                                {(() => {
                                  const hasBatch = !!(order as EnrichedOrder).batchNumber;
                                  const batchHasCoa = !!(order as EnrichedOrder).batchHasCoa;
                                  // B1: order has a batch AND that batch has a COA on file
                                  if (hasBatch && batchHasCoa) {
                                    return (
                                      <div className="mt-2 pt-2 border-t border-white/5">
                                        <a
                                          href={`/coa/verify-certificate-of-analysis?batch=${encodeURIComponent((order as EnrichedOrder).batchNumber!)}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 text-xs text-[#21d8ff] hover:underline"
                                          data-testid={`link-coa-batch-${order.id}`}
                                        >
                                          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                                          {/* COMPLIANCE PENDING */}
                                          COA for your batch: {(order as EnrichedOrder).batchNumber}
                                        </a>
                                      </div>
                                    );
                                  }
                                  // B2 fallback: no batch, or batch exists but COA not yet uploaded
                                  return (
                                    <div className="mt-2 pt-2 border-t border-white/5">
                                      <a
                                        href="/coa/verify-certificate-of-analysis"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#21d8ff] hover:underline transition-colors"
                                        data-testid={`link-coa-product-${order.id}`}
                                      >
                                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                                        {/* COMPLIANCE PENDING */}
                                        View COAs for {getProductName(order.productId)}
                                      </a>
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                          <h3 className="font-medium mb-2">No orders yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">Start shopping to see your order history</p>
                          <Link href="/products">
                            <Button className="bg-[#D4FF1F] text-black" data-testid="button-browse-products-history">Browse Products</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                </section>

                {/* Stacks Section */}
                <section id="section-stacks" className="space-y-6">
                  {/* My Stacks */}
                  <Card className="border-[#2a2a32]">
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <FlaskConical className="h-5 w-5 text-[#21d8ff]" />
                            My Stacks
                          </CardTitle>
                          <CardDescription>Research stacks you built in the stack builder</CardDescription>
                        </div>
                        <Link href="/research-stacks">
                          <Button variant="outline" size="sm" className="border-[#21d8ff]/40 text-[#21d8ff]" data-testid="button-build-stack">
                            <Plus className="h-4 w-4 mr-2" />
                            Build a Stack
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {savedStacksLoading ? (
                        <div className="space-y-3">
                          {[1, 2].map(i => (
                            <Skeleton key={i} className="h-16 w-full" />
                          ))}
                        </div>
                      ) : !savedStacks || savedStacks.filter(s => !s.sourceShareCode).length === 0 ? (
                        <div className="text-center py-10 space-y-3" data-testid="empty-my-stacks">
                          <FlaskConical className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                          <p className="text-sm font-medium text-muted-foreground">No personal stacks yet</p>
                          <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
                            Build a custom research stack and save it to share with your research community.
                          </p>
                          <Link href="/research-stacks">
                            <Button variant="outline" size="sm" className="border-[#21d8ff]/40 text-[#21d8ff] mt-2" data-testid="button-go-build">
                              Build a Custom Stack
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3" data-testid="list-my-stacks">
                          {savedStacks.filter(s => !s.sourceShareCode).map((stack) => (
                            <div
                              key={stack.id}
                              className="flex items-center justify-between gap-3 p-4 rounded-lg border border-[#2a2a32] bg-[#0f0f12]"
                              data-testid={`row-stack-${stack.id}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20 flex items-center justify-center flex-shrink-0">
                                  <FlaskConical className="h-4 w-4 text-[#21d8ff]" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-white truncate" data-testid={`text-stack-name-${stack.id}`}>{stack.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-xs text-muted-foreground" data-testid={`text-stack-count-${stack.id}`}>{(stack.peptideNames || []).length} compound{(stack.peptideNames || []).length !== 1 ? "s" : ""}</span>
                                    {(stack.synergyScore ?? 0) > 0 && (
                                      <Badge variant="outline" className="text-[10px] border-[#21d8ff]/30 text-[#21d8ff]" data-testid={`badge-synergy-${stack.id}`}>
                                        {stack.synergyScore}% synergy
                                      </Badge>
                                    )}
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] ${stack.isPublic ? "border-green-500/40 text-green-400" : "border-[#2a2a32] text-muted-foreground"}`}
                                      data-testid={`badge-visibility-${stack.id}`}
                                    >
                                      {stack.isPublic ? "Public" : "Private"}
                                    </Badge>
                                    {stack.createdAt && (
                                      <span className="text-[10px] text-muted-foreground/60">
                                        {new Date(stack.createdAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleStackVisibilityMutation.mutate({ id: stack.id, isPublic: !stack.isPublic })}
                                  disabled={toggleStackVisibilityMutation.isPending}
                                  className={`text-xs ${stack.isPublic ? "border-green-500/30 text-green-400" : "border-[#2a2a32] text-muted-foreground"}`}
                                  data-testid={`button-toggle-visibility-${stack.id}`}
                                >
                                  {stack.isPublic ? "Public" : "Private"}
                                </Button>
                                {stack.shareCode && stack.isPublic && (
                                  <Link href={`/stacks/${stack.shareCode}`}>
                                    <Button variant="outline" size="sm" className="border-[#2a2a32] text-muted-foreground text-xs" data-testid={`button-open-stack-${stack.id}`}>
                                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                      Open
                                    </Button>
                                  </Link>
                                )}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="border-red-500/20 text-red-400 min-h-[48px] min-w-[48px]"
                                  aria-label={`Delete stack "${stack.name}"`}
                                  onClick={() => {
                                    if (confirm(`Delete "${stack.name}"? This action cannot be undone.`)) {
                                      deleteStackMutation.mutate(stack.id);
                                    }
                                  }}
                                  disabled={deleteStackMutation.isPending}
                                  data-testid={`button-delete-stack-${stack.id}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Saved from Community */}
                  <Card className="border-[#2a2a32]">
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-[#a78bfa]" />
                            Saved from Community
                          </CardTitle>
                          <CardDescription>Stacks you collected from other researchers' share pages</CardDescription>
                        </div>
                        <Link href="/research-stacks">
                          <Button variant="outline" size="sm" className="border-[#a78bfa]/40 text-[#a78bfa]" data-testid="button-browse-community">
                            <BookMarked className="h-4 w-4 mr-2" />
                            Explore Stacks
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {savedStacksLoading ? (
                        <div className="space-y-3">
                          {[1, 2].map(i => (
                            <Skeleton key={i} className="h-16 w-full" />
                          ))}
                        </div>
                      ) : !savedStacks || savedStacks.filter(s => !!s.sourceShareCode).length === 0 ? (
                        <div className="text-center py-10 space-y-3" data-testid="empty-community-stacks">
                          <Users className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                          <p className="text-sm font-medium text-muted-foreground">No community stacks saved yet</p>
                          <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
                            Browse shared stacks from other researchers and save them to your collection.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3" data-testid="list-community-stacks">
                          {savedStacks.filter(s => !!s.sourceShareCode).map((stack) => (
                            <div
                              key={stack.id}
                              className="flex items-center justify-between gap-3 p-4 rounded-lg border border-[#2a2a32] bg-[#0f0f12]"
                              data-testid={`row-community-stack-${stack.id}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-[#a78bfa]/10 border border-[#a78bfa]/20 flex items-center justify-center flex-shrink-0">
                                  <Users className="h-4 w-4 text-[#a78bfa]" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-white truncate" data-testid={`text-community-stack-name-${stack.id}`}>{stack.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-xs text-muted-foreground" data-testid={`text-community-stack-count-${stack.id}`}>{(stack.peptideNames || []).length} compound{(stack.peptideNames || []).length !== 1 ? "s" : ""}</span>
                                    {(stack.synergyScore ?? 0) > 0 && (
                                      <Badge variant="outline" className="text-[10px] border-[#a78bfa]/30 text-[#a78bfa]" data-testid={`badge-community-synergy-${stack.id}`}>
                                        {stack.synergyScore}% synergy
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="text-[10px] border-[#a78bfa]/30 text-[#a78bfa]" data-testid={`badge-community-source-${stack.id}`}>
                                      Community
                                    </Badge>
                                    {stack.createdAt && (
                                      <span className="text-[10px] text-muted-foreground/60">
                                        Saved {new Date(stack.createdAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {stack.sourceShareCode && (
                                  <Link href={`/stacks/${stack.sourceShareCode}`}>
                                    <Button variant="outline" size="sm" className="border-[#a78bfa]/30 text-[#a78bfa] text-xs" data-testid={`button-view-source-${stack.id}`}>
                                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                      Original
                                    </Button>
                                  </Link>
                                )}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="border-red-500/20 text-red-400 min-h-[48px] min-w-[48px]"
                                  aria-label={`Remove community stack "${stack.name}"`}
                                  onClick={() => {
                                    if (confirm(`Remove "${stack.name}" from your collection? This action cannot be undone.`)) {
                                      deleteStackMutation.mutate(stack.id);
                                    }
                                  }}
                                  disabled={deleteStackMutation.isPending}
                                  data-testid={`button-remove-community-stack-${stack.id}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </section>

                {/* Logbook Section */}
                <section id="section-logbook" className="space-y-6">
                  <Suspense fallback={null}><LogbookTab /></Suspense>
                </section>

                {/* Cycles Section */}
                <section id="section-cycles" className="space-y-6">
                  <Suspense fallback={null}><CyclesTab /></Suspense>
                </section>

                {/* Education Section */}
                <section id="section-education" className="space-y-6">
                  {/* Research Progress */}
                  {researchProfile && (
                    <Card className="border-[#D4FF1F]/20 bg-gradient-to-br from-[#D4FF1F]/5 to-transparent">
                      <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <GraduationCap className="h-5 w-5 text-[#D4FF1F]" />
                              Research Progress
                            </CardTitle>
                            <CardDescription>Your learning journey</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-[#D4FF1F]/10 border-[#D4FF1F]/40 text-[#D4FF1F]">
                              {researchProfile.phase}
                            </Badge>
                            <Badge variant="outline" className="bg-[#21d8ff]/10 border-[#21d8ff]/40 text-[#21d8ff]">
                              {researchProfile.title}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 rounded-lg bg-muted/30">
                            <div className="text-2xl font-bold text-[#D4FF1F]">{researchProfile.educationCount}</div>
                            <div className="text-xs text-muted-foreground">Articles Read</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/30">
                            <div className="text-2xl font-bold text-[#21d8ff]">{researchProfile.batchVerificationCount}</div>
                            <div className="text-xs text-muted-foreground">Batches Verified</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/30">
                            <div className="text-2xl font-bold text-[#22c55e]">{researchProfile.compoundsTrackedCount}</div>
                            <div className="text-xs text-muted-foreground">Compounds Tracked</div>
                          </div>
                        </div>

                        {/* Phase Progress */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Phase Progression</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {(["Observer", "Initiate", "Researcher", "Analyst", "Specialist"] as ResearchPhase[]).map((phase, idx) => {
                              const phaseOrder = ["Observer", "Initiate", "Researcher", "Analyst", "Specialist"];
                              const currentIdx = phaseOrder.indexOf(researchProfile.phase);
                              const isActive = idx <= currentIdx;
                              const isCurrent = phase === researchProfile.phase;
                              return (
                                <div key={phase} className="flex-1">
                                  <div className={`h-2 rounded-full transition-all ${isActive ? isCurrent ? "bg-[#D4FF1F]" : "bg-[#D4FF1F]/50" : "bg-muted"}`} />
                                  <div className={`text-xs mt-1 text-center ${isCurrent ? "text-[#D4FF1F] font-medium" : "text-muted-foreground"}`}>
                                    {phase}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {researchProfile.earlyAccessMember && (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#9d4edd]/10 border border-[#9d4edd]/30">
                            <Sparkles className="h-4 w-4 text-[#9d4edd]" />
                            <span className="text-sm text-[#9d4edd]">Early Access Member</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Two Column: Batch Verification + Achievements */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Batch Verification History - Left Column */}
                    <Card className="border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-base">
                              <History className="h-5 w-5 text-[#21d8ff]" />
                              Batch Verification
                            </CardTitle>
                            <CardDescription>Your verified COA batches</CardDescription>
                          </div>
                          <Link href="/coa/verify-certificate-of-analysis">
                            <Button size="sm" variant="outline" className="border-[#21d8ff]/40" data-testid="button-verify-new">
                              <FileCheck className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {batchHistory && batchHistory.length > 0 ? (
                          <div className="space-y-2">
                            {batchHistory.slice(0, 4).map((item) => (
                              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#21d8ff]/20 bg-[#21d8ff]/5" data-testid={`batch-${item.id}`}>
                                <div className="h-8 w-8 rounded-full bg-[#21d8ff]/20 flex items-center justify-center shrink-0">
                                  <FileCheck className="h-4 w-4 text-[#21d8ff]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-mono text-sm font-medium">{item.batchNumber}</p>
                                  {item.productName && <p className="text-xs text-muted-foreground truncate">{item.productName}</p>}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                </div>
                              </div>
                            ))}
                            {batchHistory.length > 4 && (
                              <p className="text-xs text-muted-foreground text-center pt-2">+{batchHistory.length - 4} more</p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <FileCheck className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground mb-3">No verifications yet</p>
                            <Link href="/coa/verify-certificate-of-analysis">
                              <Button size="sm" className="bg-[#21d8ff] text-black" data-testid="button-verify-first">
                                Verify First Batch
                              </Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Achievements - Right Column (Vertical Stack with Animations) */}
                    <Card className="border-[#f97316]/20 bg-gradient-to-br from-[#f97316]/5 via-transparent to-transparent">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <div className="p-1.5 rounded-lg bg-[#f97316]/20">
                              <Trophy className="h-4 w-4 text-[#f97316]" />
                            </div>
                            Research Badges
                          </CardTitle>
                          <Badge variant="outline" className="bg-[#f97316]/10 border-[#f97316]/30 text-[#f97316] text-xs">
                            {badges.filter(b => b.earned).length}/{badges.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {badges.slice(0, 5).map((badge, index) => {
                            const Icon = badge.icon;
                            const hexToRgb = (hex: string) => {
                              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                              return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
                            };
                            return (
                              <div 
                                key={badge.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${badge.earned ? '' : 'opacity-50'}`}
                                style={badge.earned ? { borderColor: `${badge.color}66`, backgroundColor: `${badge.color}15` } : undefined}
                                data-testid={`badge-education-${badge.id}`}
                              >
                                <div 
                                  className="p-2 rounded-full" 
                                  style={badge.earned ? { backgroundColor: `${badge.color}25` } : { backgroundColor: 'hsl(var(--muted)/0.3)' }}
                                >
                                  <Icon className="h-5 w-5" style={{ color: badge.earned ? badge.color : 'hsl(var(--muted-foreground))' }} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-medium text-sm">{badge.title}</p>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-[200px]">
                                        <p className="text-xs">{badge.description}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {badge.earned ? 'Unlocked!' : badge.progress !== undefined && badge.target ? `${badge.progress}/${badge.target}` : badge.description}
                                  </p>
                                </div>
                                {badge.earned && <CheckCircle className="h-4 w-4" style={{ color: badge.color }} />}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/academy" data-testid="link-academy-education">
                      <Card className="relative overflow-hidden p-5 cursor-pointer border-[#D4FF1F]/30 hover:border-[#D4FF1F]/60 bg-gradient-to-r from-[#D4FF1F]/10 via-[#D4FF1F]/5 to-transparent transition-all duration-300 group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4FF1F]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-[#D4FF1F]/20 shadow-lg shadow-[#D4FF1F]/10 group-hover:shadow-[#D4FF1F]/30 transition-shadow">
                              <GraduationCap className="h-6 w-6 text-[#D4FF1F]" />
                            </div>
                            <div>
                              <p className="font-semibold group-hover:text-[#D4FF1F] transition-colors">Research Academy</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Zap className="h-3 w-3 text-[#D4FF1F]" />
                                Learn and earn XP
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#D4FF1F] group-hover:translate-x-1 transition-all" />
                        </div>
                      </Card>
                    </Link>
                    <Link href="/coa/verify-certificate-of-analysis" data-testid="link-coa-education">
                      <Card className="relative overflow-hidden p-5 cursor-pointer border-[#21d8ff]/30 hover:border-[#21d8ff]/60 bg-gradient-to-r from-[#21d8ff]/10 via-[#21d8ff]/5 to-transparent transition-all duration-300 group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#21d8ff]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-[#21d8ff]/20 shadow-lg shadow-[#21d8ff]/10 group-hover:shadow-[#21d8ff]/30 transition-shadow">
                              <FileCheck className="h-6 w-6 text-[#21d8ff]" />
                            </div>
                            <div>
                              <p className="font-semibold group-hover:text-[#21d8ff] transition-colors">Verify COA</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Shield className="h-3 w-3 text-[#21d8ff]" />
                                Check batch authenticity
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#21d8ff] group-hover:translate-x-1 transition-all" />
                        </div>
                      </Card>
                    </Link>
                  </div>

                  {/* Wishlist Section */}
                  <Card className="border-[#ec4899]/20 bg-gradient-to-br from-[#ec4899]/5 to-transparent">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="p-1.5 rounded-lg bg-[#ec4899]/20">
                          <Heart className="h-4 w-4 text-[#ec4899]" />
                        </div>
                        Wishlist
                        {wishlistProducts.length > 0 && (
                          <Badge variant="secondary" className="ml-2 bg-[#ec4899]/10 text-[#ec4899] border-[#ec4899]/30">{wishlistProducts.length}</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {wishlistProducts.length > 0 ? (
                        <div className="space-y-2">
                          {wishlistProducts.slice(0, 5).map(product => (
                            <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#ec4899]/20 bg-[#ec4899]/5 hover-elevate transition-all" data-testid={`wishlist-item-${product.id}`}>
                              <div className="flex-1 min-w-0">
                                <Link href={`/product/${product.id}`}>
                                  <p className="font-medium text-sm truncate hover:text-[#ec4899] transition-colors cursor-pointer">{product.name}</p>
                                </Link>
                                <p className="text-xs text-muted-foreground">${Math.round(Number(product.price))}</p>
                              </div>
                              <Button size="icon" variant="ghost" onClick={() => handleAddToCart(product)} className="shrink-0 min-h-[48px] min-w-[48px]" aria-label={`Add ${product.name} to cart`} data-testid={`button-add-to-cart-${product.id}`}>
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="text-muted-foreground shrink-0 min-h-[48px] min-w-[48px]" onClick={() => removeMutation.mutate(product.id)} aria-label={`Remove ${product.name} from wishlist`} data-testid={`button-remove-wishlist-${product.id}`}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {wishlistProducts.length > 5 && (
                            <p className="text-xs text-muted-foreground text-center pt-2">
                              +{wishlistProducts.length - 5} more items
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">No items saved yet</p>
                          <Link href="/products">
                            <Button variant="outline" size="sm" className="border-[#ec4899]/40 text-[#ec4899]" data-testid="button-browse-products-wishlist">
                              Browse Products
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Research Quiz Recommendation Card */}
                  <Card className="relative overflow-hidden border-[#f97316]/30 bg-gradient-to-r from-[#f97316]/10 via-[#f97316]/5 to-transparent">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#f97316]/20 rounded-full blur-3xl" />
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-[#f97316]/30 to-[#D4FF1F]/20 shadow-lg">
                          <Brain className="h-7 w-7 text-[#f97316]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                            Research Knowledge Quiz
                            <Badge variant="outline" className="bg-[#D4FF1F]/10 text-[#D4FF1F] border-[#D4FF1F]/40 text-xs">Coming Soon</Badge>
                          </h3>
                          <p className="text-sm text-muted-foreground">Test your peptide research knowledge and earn bonus XP for your progress.</p>
                        </div>
                        <Button variant="outline" className="border-[#f97316]/40 text-[#f97316] shrink-0" disabled data-testid="button-research-quiz">
                          <Zap className="h-4 w-4 mr-2" />
                          Take Quiz
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Settings Section */}
                <section id="section-settings">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                  <Card className="border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 via-transparent to-transparent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-[#21d8ff]/20">
                          <User className="h-5 w-5 text-[#21d8ff]" />
                        </div>
                        <span>Profile Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                            <User className="h-3 w-3" />
                            Name
                          </div>
                          <div className="font-medium">
                            {user?.firstName || user?.lastName 
                              ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
                              : 'Not set'}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                            <MessageSquare className="h-3 w-3" />
                            Email
                          </div>
                          <div className="font-medium">{user?.email || 'Not set'}</div>
                        </div>
                        <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Member Since
                          </div>
                          <div className="font-medium">{formatDate(user?.createdAt || new Date())}</div>
                        </div>
                      </div>
                      <Link href="/account-settings">
                        <Button className="w-full bg-[#D4FF1F] text-black" data-testid="button-account-settings">
                          Edit Profile
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Security & Login Activity - in left column */}
                  <Card className="border-[#f97316]/20 bg-gradient-to-br from-[#f97316]/5 via-transparent to-transparent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-[#f97316]/20">
                          <Lock className="h-5 w-5 text-[#f97316]" />
                        </div>
                        <span>Security & Login Activity</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 rounded-lg border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Shield className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-sm font-medium">Account Security</p>
                              <p className="text-xs text-muted-foreground">Your account is protected</p>
                            </div>
                          </div>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Secure</Badge>
                        </div>
                        
                        <div className="p-3 rounded-lg border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Password & Account</p>
                              <p className="text-xs text-muted-foreground">Managed securely by Auth0</p>
                            </div>
                          </div>
                          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">Auth0</Badge>
                        </div>
                        
                        <div className="pt-2">
                          <p className="text-sm font-medium mb-3 flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Recent Login Activity
                          </p>
                          {loginHistoryLoading ? (
                            <div className="space-y-2">
                              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                            </div>
                          ) : loginHistory && loginHistory.length > 0 ? (
                            <div className="space-y-2">
                              {loginHistory.slice(0, 3).map((login, idx) => (
                                <div key={login.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 text-sm" data-testid={`login-${login.id}`}>
                                  <Monitor className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="truncate text-xs text-muted-foreground">
                                      {login.userAgent?.split(' ').slice(0, 3).join(' ') || 'Unknown device'}
                                    </p>
                                  </div>
                                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(login.loginAt)}</span>
                                  {idx === 0 && <Badge className="bg-green-500/10 text-green-500 border-green-500/30 text-xs">Current</Badge>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No login history available</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Affiliate Status - in left column */}
                  <Card className="border-[#9d4edd]/20 bg-gradient-to-br from-[#9d4edd]/5 via-transparent to-transparent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-[#9d4edd]/20">
                          <Award className="h-5 w-5 text-[#9d4edd]" />
                        </div>
                        <span>Affiliate Program</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {affiliate?.id ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/40">
                            <div className="p-2 rounded-full bg-green-500/20">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                              <span className="text-green-400 font-semibold">Active Affiliate</span>
                              <p className="text-xs text-muted-foreground">Earning commissions on referrals</p>
                            </div>
                          </div>
                          <Link href="/affiliate/dashboard">
                            <Button variant="outline" className="w-full border-[#9d4edd]/40" data-testid="button-affiliate-dashboard">
                              View Dashboard
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl border border-[#9d4edd]/20 bg-[#9d4edd]/5">
                            <p className="text-sm text-muted-foreground flex items-start gap-2">
                              <Sparkles className="h-4 w-4 text-[#9d4edd] shrink-0 mt-0.5" />
                              Join our affiliate program and earn commissions on referrals. Get 10% on every sale!
                            </p>
                          </div>
                          <Link href="/affiliate">
                            <Button className="w-full bg-gradient-to-r from-[#9d4edd] to-[#9d4edd]/80 text-white" data-testid="button-join-affiliate">
                              Join Now
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                  {/* Saved Addresses */}
                  <Card className="border-[#D4FF1F]/20 bg-gradient-to-br from-[#D4FF1F]/5 via-transparent to-transparent">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-[#D4FF1F]/20">
                            <MapPin className="h-5 w-5 text-[#D4FF1F]" />
                          </div>
                          <span>Saved Addresses</span>
                        </CardTitle>
                        <Button size="sm" variant="outline" className="border-[#D4FF1F]/40" onClick={() => setNewAddressDialogOpen(true)} data-testid="button-add-address">
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {addressesLoading ? (
                        <div className="space-y-2">
                          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                      ) : savedAddresses && savedAddresses.length > 0 ? (
                        <div className="space-y-3">
                          {savedAddresses.map((addr) => (
                            <div key={addr.id} className="p-4 rounded-lg border border-[#D4FF1F]/20 bg-[#D4FF1F]/5 flex items-start justify-between gap-3 group" data-testid={`address-${addr.id}`}>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{addr.label || "Address"}</p>
                                  {addr.isDefault && (
                                    <Badge className="bg-[#D4FF1F]/10 text-[#D4FF1F] border-[#D4FF1F]/30 text-xs">Default</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {addr.firstName} {addr.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!addr.isDefault && (
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    disabled={setDefaultAddressMutation.isPending}
                                    onClick={() => setDefaultAddressMutation.mutate(addr.id)}
                                    data-testid={`button-set-default-${addr.id}`}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => {
                                    setEditingAddress({
                                      id: addr.id,
                                      label: addr.label,
                                      firstName: addr.firstName,
                                      lastName: addr.lastName,
                                      street: addr.street,
                                      city: addr.city,
                                      state: addr.state,
                                      zipCode: addr.zipCode,
                                      country: addr.country,
                                    });
                                    setAddressEditDialogOpen(true);
                                  }}
                                  data-testid={`button-edit-address-${addr.id}`}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="text-red-500"
                                  disabled={deleteAddressMutation.isPending}
                                  onClick={() => deleteAddressMutation.mutate(addr.id)}
                                  data-testid={`button-delete-address-${addr.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <MapPin className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">No saved addresses</p>
                          <Button size="sm" variant="outline" onClick={() => setNewAddressDialogOpen(true)} data-testid="button-add-first-address">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Address
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Notification Preferences */}
                  <Card className="border-[#ec4899]/20 bg-gradient-to-br from-[#ec4899]/5 via-transparent to-transparent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-[#ec4899]/20">
                          <Bell className="h-5 w-5 text-[#ec4899]" />
                        </div>
                        <span>Notification Preferences</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {prefsLoading ? (
                        <div className="space-y-3">
                          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                      ) : notificationPrefs ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
                            <div className="flex items-center gap-3">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Order Updates</p>
                                <p className="text-xs text-muted-foreground">Shipping and delivery notifications</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant={notificationPrefs.emailShippingUpdates ? "default" : "outline"}
                              disabled={updateNotificationPrefsMutation.isPending}
                              onClick={() => updateNotificationPrefsMutation.mutate({ emailShippingUpdates: !notificationPrefs.emailShippingUpdates })}
                              data-testid="toggle-order-updates"
                            >
                              {updateNotificationPrefsMutation.isPending ? "..." : notificationPrefs.emailShippingUpdates ? "On" : "Off"}
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
                            <div className="flex items-center gap-3">
                              <Sparkles className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Promotions</p>
                                <p className="text-xs text-muted-foreground">Deals and special offers</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant={notificationPrefs.emailPromotions ? "default" : "outline"}
                              disabled={updateNotificationPrefsMutation.isPending}
                              onClick={() => updateNotificationPrefsMutation.mutate({ emailPromotions: !notificationPrefs.emailPromotions })}
                              data-testid="toggle-promotions"
                            >
                              {updateNotificationPrefsMutation.isPending ? "..." : notificationPrefs.emailPromotions ? "On" : "Off"}
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
                            <div className="flex items-center gap-3">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Newsletter</p>
                                <p className="text-xs text-muted-foreground">Research updates and news</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant={notificationPrefs.emailNewsletter ? "default" : "outline"}
                              disabled={updateNotificationPrefsMutation.isPending}
                              onClick={() => updateNotificationPrefsMutation.mutate({ emailNewsletter: !notificationPrefs.emailNewsletter })}
                              data-testid="toggle-newsletter"
                            >
                              {updateNotificationPrefsMutation.isPending ? "..." : notificationPrefs.emailNewsletter ? "On" : "Off"}
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
                            <div className="flex items-center gap-3">
                              <Smartphone className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">SMS Alerts</p>
                                <p className="text-xs text-muted-foreground">Text message notifications</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant={notificationPrefs.smsOrderUpdates ? "default" : "outline"}
                              disabled={updateNotificationPrefsMutation.isPending}
                              onClick={() => updateNotificationPrefsMutation.mutate({ smsOrderUpdates: !notificationPrefs.smsOrderUpdates })}
                              data-testid="toggle-sms"
                            >
                              {updateNotificationPrefsMutation.isPending ? "..." : notificationPrefs.smsOrderUpdates ? "On" : "Off"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Bell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground">Loading preferences...</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                    </div>
                  </div>

                  {/* Danger Zone - Full Width */}
                  <div className="mt-6">
                  <Card className="border-red-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-500">
                        <AlertTriangle className="h-5 w-5" />
                        Danger Zone
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={null}><LogbookWipeCard /></Suspense>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all associated data.
                      </p>
                      <Button 
                        variant="outline" 
                        className="border-red-500/50 text-red-500"
                        onClick={() => setDeleteDialogOpen(true)}
                        data-testid="button-delete-account"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </CardContent>
                  </Card>
                  </div>
                </section>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

    </>
  );
}
