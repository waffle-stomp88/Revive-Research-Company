import { useState, useMemo, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { buildPriceLookup, buildStockLookup, calculateStackPricing, isStackAvailable } from "@/lib/stack-pricing";
import { SEOHead } from "@/components/seo-head";
import {
  ArrowLeft, ShoppingCart, AlertTriangle, Package, GraduationCap, Shield, FileCheck, RefreshCw, ShoppingBag, CheckCircle, BookOpen, ChevronRight, ChevronDown, Zap, Check, FlaskConical, Lock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { getSynergyPartners, normalizePeptideName, KNOWN_STACKS } from "@/lib/synergy-data";
import type { KnownStack } from "@/lib/synergy-data";
import { getTopPairingForProduct } from "@/lib/pairing-intelligence";
import { detectPathwayOverlaps, resolveDatasetSlug } from "@/lib/pathway-overlaps";
import { PathwayOverlapCard } from "@/components/pathway-overlap-card";
import { Layers } from "lucide-react";
import type { Product } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";
import { useAuth } from "@/hooks/useAuth";
import { SoftGateBanner } from "@/components/soft-gate-banner";

import { PharmacokineticsChart } from "@/components/pharmacokinetics-chart";
import {
  GonadorelinVisual,
  TriptorelinVisual,
  EnclomipheneVisual,
  OxytocinVisual,
  KisspeptinVisual,
  MelanotanReceptorVisual,
  BPC157AngiogenesisVisual,
  TB500ActinVisual,
  GLOWSynergyVisual,
  KLOWSynergyVisual,
  SemaxNeuralVisual,
  EpithalonTelomeraseVisual,
  GHKCuCopperVisual,
  Amino1MQNADVisual,
  IpamorelinComparison,
  CJC1295DACMechanism,
  SelankVisual,
  AOD9604Visual,
  PT141Visual,
  GHAmplifierDualReceptorVisual,
  GHPulseWaveformVisual,
  CognitiveEdgeSynergyVisual,
  HPGAxisRestoreSynergyVisual,
  MelanocortinArousalSynergyVisual,
} from "@/components/education";

interface StackPeptideDetail { name: string; description: string; }
interface StackEducationLink { articleUrl: string; peptideName: string; articleTitle: string; }
interface StackDetail {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  longDescription: string | null;
  peptideIds: string[];
  peptides: StackPeptideDetail[];
  keyBenefits: string[];
  researchApplications: string[];
  synergy: { beginner: string; expert: string };
  storageGuide: string;
  educationLinks: StackEducationLink[];
  iconName: string;
  color: string;
  badge: string | null;
  badgeColor: string | null;
  category: string;
  synergyBonus: number;
  detailPageId: string | null;
  showOnPage: boolean;
  isActive: boolean;
  sortOrder: number;
  intentionalOverlap?: boolean;
}

const SOFT_GATE_ENABLED = import.meta.env.VITE_SOFT_GATE_ENABLED !== "false";

export default function ResearchStackDetail() {
  const [match, params] = useRoute("/research-stacks/:id");
  const [, setLocation] = useLocation();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const softGated = SOFT_GATE_ENABLED && !isAuthenticated;
  const [synergyLevel, setSynergyLevel] = useState<"beginner" | "expert">("beginner");
  const [activeResearchTab, setActiveResearchTab] = useState<"overview" | "pk" | "synergy">("overview");

  useEffect(() => {
    setSynergyLevel("beginner");
    setActiveResearchTab("overview");
  }, [params?.id]);

  const { data: stackData, isLoading: stackLoading, isError: stackError } = useQuery<StackDetail>({
    queryKey: ["/api/research-stacks", params?.id],
    enabled: Boolean(match && params?.id),
    retry: false,
  });

  const { data: allStacksData } = useQuery<StackDetail[]>({
    queryKey: ["/api/research-stacks"],
  });

  const knownStacksFromApi = useMemo<KnownStack[]>(() => {
    if (!allStacksData || allStacksData.length === 0) return KNOWN_STACKS;
    return allStacksData.map((s) => ({
      name: s.name,
      peptides: s.peptideIds,
      icon: FlaskConical,
      color: s.color,
      description: s.description,
      synergyBonus: s.synergyBonus,
      detailPageId: s.id,
    }));
  }, [allStacksData]);

  useEffect(() => {
    if (!match || !params?.id || stackLoading) return;
    if (stackError) {
      sessionStorage.setItem("stack-retired-redirect", "1");
      setLocation("/research-stacks");
    }
  }, [match, params?.id, stackError, stackLoading]);

  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: productsWithStock } = useQuery<any[]>({
    queryKey: ["/api/products-with-stock"],
  });

  const priceLookup = useMemo(() => {
    if (!productsWithStock) return new Map<string, number>();
    return buildPriceLookup(productsWithStock);
  }, [productsWithStock]);

  const stockLookup = useMemo(() => {
    if (!productsWithStock) return new Map<string, boolean>();
    return buildStockLookup(productsWithStock);
  }, [productsWithStock]);

  if (!match || !params?.id) {
    return null;
  }

  if (stackLoading) {
    return (
      <main className="min-h-screen pt-32 pb-24 flex items-center justify-center">
        <div className="text-muted-foreground text-sm animate-pulse">Loading stack...</div>
      </main>
    );
  }

  const stack = stackData;

  if (!stack) {
    return null;
  }

  const pricing = calculateStackPricing(params.id, priceLookup);
  const pricingReady = pricing !== null;
  const availability = productsWithStock ? isStackAvailable(params.id, stockLookup) : null;
  const isOOS = availability !== null && !availability.available;
  const canAddToCart = pricingReady && !isOOS;

  const pathwayOverlaps = detectPathwayOverlaps(
    stack.peptides
      .map(p => resolveDatasetSlug(p.name))
      .filter((s): s is string => Boolean(s))
  );

  const HEALING_PEPTIDES = new Set(["bpc-157", "tb-500", "ghk-cu"]);
  const isHealingStack = stack.peptides.length > 0 && stack.peptides.every(
    p => HEALING_PEPTIDES.has(p.name.toLowerCase())
  );

  const STACK_VISUALS: Record<string, React.FC[]> = {
    "gonadorelin-kisspeptin-hpg-cascade": [GonadorelinVisual, KisspeptinVisual],
    "triptorelin-enclomiphene-hpg-axis": [TriptorelinVisual, EnclomipheneVisual],
    "melanocortin-arousal-stack": [MelanocortinArousalSynergyVisual],
    "hpg-axis-restore-stack": [HPGAxisRestoreSynergyVisual],
    "recovery-tissue-stack": [BPC157AngiogenesisVisual, TB500ActinVisual],
    "glow-protocol": [GLOWSynergyVisual, KLOWSynergyVisual],
    "cognitive-edge-stack": [CognitiveEdgeSynergyVisual],
    "longevity-protocol": [EpithalonTelomeraseVisual, GHKCuCopperVisual],
    "fat-burner": [AOD9604Visual, Amino1MQNADVisual],
    "gh-amplifier": [GHAmplifierDualReceptorVisual, CJC1295DACMechanism, GHPulseWaveformVisual],
  };

  const stackVisuals = STACK_VISUALS[stack.id] ?? [];

  const getBasePrice = () => pricing?.stackPrice ?? 0;

  const handleAddToCart = async () => {
    await addToCart({
      productId: stack.id,
      bundleId: stack.id,
      name: stack.name,
      price: getBasePrice(),
      quantity: 1,
      dosage: "Research Stack",
      image: productImage,
      isBundle: true,
    });
    toast({
      title: "Added to Cart",
      description: `${stack.name} has been added to your cart.`,
      action: (
        <ToastAction altText="View Cart" onClick={() => setLocation('/cart')} className="bg-[#D4FF1F] text-black border-[#D4FF1F] hover:bg-[#D4FF1F]/90 font-semibold">
          View Cart
        </ToastAction>
      ),
    });
  };

  const handleBuyNow = async () => {
    await addToCart({
      productId: stack.id,
      bundleId: stack.id,
      name: stack.name,
      price: getBasePrice(),
      quantity: 1,
      dosage: "Research Stack",
      image: productImage,
      isBundle: true,
    });
    window.location.href = '/checkout?fromCart=true';
  };

  return (
    <main className="min-h-screen pt-24 md:pt-40 pb-36 md:pb-12 overflow-x-hidden">
      <SEOHead 
        title={`${stack.name} | Research Stack`}
        description={stack.description}
        canonicalPath={`/research-stacks/${stack.id}`}
      />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-2 md:mb-4">
          <Link href="/research-stacks">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 md:-ml-4 md:gap-2" data-testid="button-back-stacks">
              <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden md:inline">Back to Research Stacks</span>
              <span className="md:hidden">Back</span>
            </Button>
          </Link>
        </motion.div>

        {softGated && <SoftGateBanner />}

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col">
            <div className="relative w-full md:sticky md:top-24 z-20">
              <div
                className="relative overflow-hidden rounded-lg aspect-[4/3] flex items-center justify-center"
                style={{ background: `radial-gradient(circle at 50% 50%, ${stack.color}20, transparent 70%), linear-gradient(135deg, #1a1a1f, #0d0d10)` }}
              >
                {stack.badge && (
                  <Badge
                    className="absolute top-4 right-4 z-30"
                    style={{
                      backgroundColor: stack.badgeColor ?? undefined,
                      color: stack.badgeColor === "#D4FF1F" || stack.badgeColor === "#f59e0b" ? "black" : "white",
                    }}
                    data-testid="badge-stack-type"
                  >
                    {stack.badge}
                  </Badge>
                )}
                <div className="text-center">
                  <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: `${stack.color}20` }}>
                    <Package className="h-20 w-20 md:h-24 md:w-24" style={{ color: stack.color }} />
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    {stack.peptides.map((_, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border-2 border-[#1a1a1f]" style={{ backgroundColor: stack.color }} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {stack.peptides.length} peptide{stack.peptides.length > 1 ? "s" : ""} included
                  </p>
                </div>
              </div>
            </div>


            {stack.educationLinks.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 }}
                className="mt-16 hidden md:block relative z-10 bg-background"
                data-testid="section-education-desktop"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-[#ec4899]" />
                    <h3 className="font-display text-lg font-bold">Learn About These Peptides</h3>
                  </div>
                  <Link href="/guides/peptide-education-center">
                    <Button variant="outline" size="sm" className="border-[#ec4899]/30 hover:border-[#ec4899]" data-testid="link-view-all-education">
                      All Articles
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  {stack.educationLinks.map((link) => (
                    <Link key={link.peptideName} href={link.articleUrl}>
                      <Card
                        className="p-4 border-[#ec4899]/20 md:hover:border-[#ec4899]/40 transition-all duration-300 cursor-pointer group md:hover:scale-[1.02] md:active:scale-[1.02] md:hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                        data-testid={`card-article-${link.peptideName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-[#ec4899]/10 flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-[#ec4899]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="border-[#ec4899]/50 text-[#ec4899] text-xs">
                                Research Guide
                              </Badge>
                            </div>
                            <h4 className="font-display text-base md:text-lg font-bold group-hover:text-[#ec4899] transition-colors uppercase tracking-tight leading-tight">{link.articleTitle}</h4>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}

          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-2" data-testid="stripe-category">
                <div className="w-0.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: stack.color }} />
                <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: stack.color }}>
                  Research Stack
                </span>
              </div>
              {stack.peptides.map((peptide) => (
                <Badge
                  key={peptide.name}
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: stack.color, color: stack.color }}
                  data-testid={`badge-peptide-${peptide.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  {peptide.name}
                </Badge>
              ))}
            </div>

            <h1 className="font-display text-3xl md:text-6xl font-bold mb-1 md:mb-2 uppercase tracking-tighter leading-none" data-testid="text-stack-name">
              {stack.name}
            </h1>

            <div
              className="h-[3px] mt-2 mb-3 rounded-full -mx-4 md:-mx-6"
              style={{ background: "linear-gradient(to right, #21d8ff, #D4FF1F)" }}
              data-testid="separator-gradient"
            />
            {stack.subtitle && (
              <p className="text-xs text-muted-foreground/70 font-mono mb-3" data-testid="text-stack-subtitle">
                {stack.subtitle}
              </p>
            )}

            <div className="mb-2 md:mb-3">
              {softGated ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "#D4FF1F0d", border: "1px solid #D4FF1F25" }} data-testid="text-stack-price">
                  <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#D4FF1F80" }} />
                  <span className="text-sm font-medium" style={{ color: "#9ca3af" }}>Sign in to see pricing</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                  <span className="font-display text-2xl md:text-3xl font-bold text-[#D4FF1F]" data-testid="text-stack-price">
                    ${Math.round(getBasePrice())}
                  </span>
                </div>
              )}
            </div>

            <p className="hidden md:block text-sm text-muted-foreground leading-relaxed mb-4" data-testid="text-stack-description">
              {stack.longDescription}
            </p>

            <div className="flex items-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 md:mb-3 border border-border/60 rounded-md overflow-hidden bg-muted/20" data-testid="bar-trust-badges">
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5">
                <Shield className="h-4 w-4 flex-shrink-0 text-[#21d8ff]" />
                <span>3rd Party Tested</span>
              </div>
              <div className="w-px self-stretch bg-border/60" />
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5">
                <FileCheck className="h-4 w-4 flex-shrink-0 text-[#21d8ff]" />
                <span>COA Included</span>
              </div>
              <div className="w-px self-stretch bg-border/60" />
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5">
                <RefreshCw className="h-4 w-4 flex-shrink-0 text-[#21d8ff]" />
                <span>Guaranteed</span>
              </div>
            </div>

            <div className="md:hidden flex items-center gap-2 p-2.5 rounded-lg bg-red-950/30 border border-red-500/40 mb-3" data-testid="card-ruo-mobile">
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400 font-medium">Research Use Only - Not for human consumption</span>
            </div>

            {isOOS && availability && availability.oosComponents.length > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/40 border border-red-500/40 mb-3" data-testid="card-oos-warning">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-red-400 font-semibold">Out of Stock</p>
                  <p className="text-xs text-red-400/80 mt-0.5">
                    {availability.oosComponents.join(", ")} {availability.oosComponents.length === 1 ? "is" : "are"} currently out of stock.
                  </p>
                </div>
              </div>
            )}

            {softGated ? (
              <div className="blur-sm pointer-events-none select-none opacity-40 flex flex-col gap-2" aria-hidden="true" data-testid="auth-gate-inline">
                <div className="w-full h-11 rounded-md bg-[#D4FF1F] flex items-center justify-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-black" />
                  <span className="font-display font-bold text-black">Buy Now</span>
                </div>
                <div className="w-full h-11 rounded-md border-2 border-border flex items-center justify-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-foreground" />
                  <span className="font-display text-foreground">Add to Cart</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2" data-testid="stack-cta">
                <Button
                  size="lg"
                  className="w-full font-display font-bold gap-2 text-black bg-[#D4FF1F] border-[#D4FF1F] shadow-[0_0_20px_rgba(212,255,31,0.4)] hover:shadow-[0_0_36px_rgba(212,255,31,0.75)] transition-shadow duration-300"
                  onClick={handleBuyNow}
                  disabled={!canAddToCart}
                  data-testid="button-buy-now"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Buy Now — ${Math.round(getBasePrice())}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full font-display gap-2 border-2 transition-shadow duration-300 hover:shadow-[0_0_18px_rgba(255,255,255,0.1)] hover:border-foreground/50"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
            )}

            <Collapsible className="md:hidden mt-4">
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full justify-between text-sm"
                  data-testid="button-toggle-description-mobile"
                >
                  <span className="text-muted-foreground">About this stack</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-stack-description-mobile">
                  {stack.longDescription}
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-4 md:my-6" />

            {/* Compact RUO inline notice — desktop only */}
            <div className="hidden md:flex items-center gap-2 mb-4 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/40 text-xs text-red-300" data-testid="notice-ruo-inline-stack">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-red-400" />
              <span>For lawful research use only. Not for human or animal consumption.</span>
            </div>

            {stack.educationLinks.length > 0 && (
              <Collapsible className="md:hidden mb-6">
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between border-[#ec4899]/30 hover:border-[#ec4899] text-sm"
                    data-testid="button-toggle-education-mobile"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#ec4899]" />
                      <span>Learn About These Peptides</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-2">
                  {stack.educationLinks.map((link) => (
                    <Link key={link.peptideName} href={link.articleUrl}>
                      <Card 
                        className="p-3 border-[#ec4899]/20 hover:border-[#ec4899]/40 transition-all cursor-pointer"
                        data-testid={`card-article-mobile-${link.peptideName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-[#ec4899] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{link.articleTitle}</h4>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

          </motion.div>
        </div>

        {/* === RESEARCH ZONE === */}
        <div
          className="rounded-xl mt-8 px-4 md:px-8 py-8 border border-border/30"
          style={{ background: "linear-gradient(135deg, rgba(157,78,221,0.07) 0%, rgba(10,10,18,0.6) 40%, rgba(33,216,255,0.05) 100%)" }}
          data-testid="section-research-zone"
        >
          {/* Tab Nav */}
          <nav
            data-testid="nav-research-tabs"
            className="backdrop-blur-sm -mx-4 md:-mx-8 px-4 md:px-8 mb-8 border-b border-border/30 overflow-x-auto scrollbar-hide"
            style={{ background: "rgba(157,78,221,0.04)" }}
          >
            <div className="flex min-w-max">
              {(
                [
                  { key: "overview", label: "Overview", mobileLabel: "Overview", testId: "tab-overview" },
                  { key: "pk", label: "Pharmacokinetics", mobileLabel: "PK", testId: "tab-pk" },
                  { key: "synergy", label: "Synergy", mobileLabel: "Synergy", testId: "tab-synergy" },
                ] as { key: "overview" | "pk" | "synergy"; label: string; mobileLabel: string; testId: string }[]
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  data-testid={tab.testId}
                  onClick={() => setActiveResearchTab(tab.key)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 text-center ${
                    activeResearchTab === tab.key
                      ? "border-[#D4FF1F] text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="sm:hidden">{tab.mobileLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Overview Tab */}
          {activeResearchTab === "overview" && (
            <section data-testid="section-overview-panel" className="relative overflow-hidden">
              <div className="absolute bottom-0 right-0 text-[100px] md:text-[130px] font-display font-black uppercase leading-none text-white/[0.07] select-none pointer-events-none tracking-tight">
                {stack.name}
              </div>

              {stack.longDescription && (
                <>
                  <p className="text-muted-foreground leading-relaxed mb-6" data-testid="text-overview-description">
                    {stack.longDescription}
                  </p>
                  <div className="mb-6 h-px bg-gradient-to-r from-[#9d4edd]/40 via-[#21d8ff]/30 to-transparent" />
                </>
              )}

              {stack.keyBenefits.length > 0 && (
                <div className="mb-8" data-testid="list-benefits-overview">
                  <h3 className="font-display font-semibold text-lg mb-4">Key Benefits</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stack.keyBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-border bg-card text-sm">
                        <CheckCircle className="h-4 w-4 text-[#D4FF1F] flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stackVisuals.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="mb-8 space-y-10"
                  data-testid="section-compound-infographics"
                >
                  <div className="h-px bg-gradient-to-r from-[#9d4edd]/40 via-[#21d8ff]/30 to-transparent" />
                  <div className="flex items-center gap-3 mb-6">
                    <FlaskConical className="h-5 w-5 text-[#9d4edd]" />
                    <h3 className="font-display font-semibold text-lg">Compound Mechanism Visuals</h3>
                  </div>
                  {stackVisuals.map((VisualComponent, idx) => (
                    <div key={idx} data-testid={`compound-visual-${idx}`}>
                      <VisualComponent />
                    </div>
                  ))}
                  <div className="h-px bg-gradient-to-r from-[#21d8ff]/40 via-[#9d4edd]/30 to-transparent" />
                </motion.div>
              )}

              <div data-testid="section-storage-overview">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="h-5 w-5 text-[#21d8ff]" />
                  <h3 className="font-display font-semibold text-lg">Storage Information</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {stack.storageGuide}
                </p>
                <Link href="/guides/storage-101">
                  <Button variant="outline" size="sm" className="border-[#21d8ff]/30 hover:border-[#21d8ff] gap-1.5" data-testid="link-learn-storage-overview">
                    <BookOpen className="h-3.5 w-3.5" />
                    Storage Best Practices
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {isHealingStack && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 }}
                  className="mt-8"
                  data-testid="section-healing-guide-cta"
                >
                  <div className="h-px bg-gradient-to-r from-[#22c55e]/40 via-[#21d8ff]/30 to-transparent mb-8" />
                  <Link href="/guides/healing-peptides" data-testid="link-healing-peptides-guide">
                    <Card className="p-5 border-[#22c55e]/30 cursor-pointer hover-elevate transition-all duration-300 hover:border-[#22c55e]/60 hover:shadow-[0_0_24px_rgba(34,197,94,0.18)]">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-lg bg-[#22c55e]/10 flex-shrink-0">
                          <FlaskConical className="h-5 w-5 text-[#22c55e]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge className="bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 text-xs no-default-hover-elevate no-default-active-elevate">
                              Deep Dive
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Healing Peptides Guide</span>
                          </div>
                          <h4 className="font-display text-base md:text-lg font-bold leading-snug mb-1">
                            Learn the Science Behind This Stack
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Explore the tissue repair cascade, angiogenesis signaling, and how the peptides in this stack interact at the molecular level.
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              )}
            </section>
          )}

          {/* PK Tab */}
          {activeResearchTab === "pk" && (
            <section data-testid="section-pk-panel">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="rounded-xl border border-[#21d8ff]/20 bg-gradient-to-br from-[#0d1a2a] to-[#0a0f1a] overflow-hidden"
                data-testid="section-pk-chart"
              >
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#21d8ff]/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#21d8ff]/10">
                      <Shield className="h-5 w-5 text-[#21d8ff]" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-bold text-white">Plasma Concentration Profile</h2>
                      <p className="text-xs text-[#21d8ff]/60 mt-0.5">Published pharmacokinetic data · primary literature</p>
                    </div>
                  </div>
                  <Badge className="text-xs no-default-hover-elevate no-default-active-elevate bg-[#21d8ff]/10 text-[#21d8ff] border border-[#21d8ff]/20">
                    PK Data
                  </Badge>
                </div>
                <div className="px-2 pb-4 pt-2">
                  <PharmacokineticsChart peptides={stack.peptides} stackId={stack.id} />
                </div>
              </motion.div>
            </section>
          )}

          {/* Synergy Tab */}
          {activeResearchTab === "synergy" && (
            <section data-testid="section-synergy-panel">
              <div className="mb-8" data-testid="section-synergy-explanation">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" style={{ color: stack.color }} />
                    <h3 className="font-display font-semibold text-lg">Why These Peptides Work Together</h3>
                  </div>
                  <div role="group" aria-label="Synergy explanation level" className="flex items-center gap-1 p-0.5 rounded-md border border-border bg-muted/30">
                    <Button
                      aria-pressed={synergyLevel === "beginner"}
                      variant="ghost"
                      size="sm"
                      className={`h-7 px-3 text-xs rounded-sm transition-colors ${synergyLevel === "beginner" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                      onClick={() => setSynergyLevel("beginner")}
                      data-testid="button-synergy-beginner"
                    >
                      Overview
                    </Button>
                    <Button
                      aria-pressed={synergyLevel === "expert"}
                      variant="ghost"
                      size="sm"
                      className={`h-7 px-3 text-xs rounded-sm transition-colors ${synergyLevel === "expert" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                      onClick={() => setSynergyLevel("expert")}
                      data-testid="button-synergy-expert"
                    >
                      Mechanistic
                    </Button>
                  </div>
                </div>
                <Card className="p-4 border-border/60" data-testid="card-synergy-content">
                  <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-synergy-copy">
                    {synergyLevel === "beginner" ? stack.synergy.beginner : stack.synergy.expert}
                  </p>
                </Card>
              </div>

              {pathwayOverlaps.length > 0 && (
                <div id="pathway-overlap" className="mb-6" data-testid="section-pathway-overlap-detail">
                  <PathwayOverlapCard overlaps={pathwayOverlaps} intentional={stack.intentionalOverlap} />
                </div>
              )}
            </section>
          )}
        </div>

        {/* RUO Disclaimer - hidden, replaced with compact inline notice */}
        <Card className="hidden" data-testid="card-ruo-disclaimer-desktop">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-red-500/20 border border-red-500/30 flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h4 className="font-display font-bold text-red-400 uppercase tracking-wider text-lg mb-2">
                Research Use Only
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This product is sold for research purposes only and is not intended 
                for human consumption. By purchasing, you confirm you are a qualified 
                researcher and will use this product in accordance with all applicable 
                federal and state laws and regulations.
              </p>
            </div>
          </div>
        </Card>

        {/* Works Well With - Synergy Recommendations */}
        {(() => {
          const stackPeptideNames = stack.peptides.map(p => p.name);
          const stackNorms = new Set(stackPeptideNames.map(n => normalizePeptideName(n)));

          const partnerMap = new Map<string, { partner: string; stack: { name: string }; synergyBonus: number }>();
          for (const peptideName of stackPeptideNames) {
            const partners = getSynergyPartners(peptideName, knownStacksFromApi);
            for (const p of partners) {
              const norm = normalizePeptideName(p.partner);
              if (stackNorms.has(norm)) continue;
              const existing = partnerMap.get(norm);
              if (!existing || p.synergyBonus > existing.synergyBonus) {
                partnerMap.set(norm, p);
              }
            }
          }

          const sortedPartners = Array.from(partnerMap.values()).sort((a, b) => b.synergyBonus - a.synergyBonus);

          const matchingProducts = sortedPartners
            .map(sp => {
              const product = allProducts?.find(p => {
                if (p.category === "Research Stacks" || p.category === "Supplies" || p.category === "Research Compounds") return false;
                const normalizedProductName = normalizePeptideName(p.name);
                return normalizePeptideName(sp.partner) === normalizedProductName ||
                  normalizedProductName.includes(normalizePeptideName(sp.partner)) ||
                  normalizePeptideName(sp.partner).includes(normalizedProductName);
              });
              return product ? { product, synergy: sp } : null;
            })
            .filter(Boolean) as { product: Product; synergy: { partner: string; stack: { name: string }; synergyBonus: number } }[];

          if (matchingProducts.length === 0) return null;

          return (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-12"
              data-testid="section-synergy-recommendations"
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Layers className="h-6 w-6 text-[#22c55e]" />
                <h2 className="font-display text-2xl font-bold">Works Well With</h2>
              </div>

              <p className="text-muted-foreground mb-6">
                Research-backed pairings based on complementary mechanisms of action.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                {matchingProducts.slice(0, 3).map(({ product: partnerProduct, synergy }) => {
                  const pairingReason = (() => {
                    for (const peptideName of stackPeptideNames) {
                      const reason = getTopPairingForProduct(peptideName, partnerProduct.name);
                      if (reason) return reason;
                    }
                    return null;
                  })();

                  return (
                    <Link key={partnerProduct.id} href={`/peptides/${partnerProduct.slug || partnerProduct.id}`} className="h-full" data-testid={`link-synergy-${partnerProduct.id}`}>
                      <Card
                        className="p-4 border-[#22c55e]/20 cursor-pointer hover-elevate h-full"
                        data-testid={`card-synergy-${partnerProduct.slug}`}
                      >
                        <div className="flex flex-wrap items-start gap-4 h-full">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-card flex-shrink-0">
                            <img
                              src={partnerProduct.imageUrl || productImage}
                              alt={partnerProduct.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col h-full">
                            <p className="font-medium text-sm truncate">
                              {partnerProduct.name}
                            </p>
                            <Badge
                              className="mt-2 text-xs bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              {synergy.stack.name} • {synergy.synergyBonus}%
                            </Badge>
                            {pairingReason && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 flex-1">
                                {pairingReason.mechanism}
                              </p>
                            )}
                            {!pairingReason && <div className="flex-1" />}
                            {softGated ? (
                              <div className="inline-flex items-center gap-1 mt-2" style={{ color: "#9ca3af" }}>
                                <Lock className="w-3 h-3" />
                                <span className="text-xs">Sign in for price</span>
                              </div>
                            ) : (
                              <p className="text-sm font-bold text-[#D4FF1F] mt-2 mt-auto">
                                ${Math.round(Number(partnerProduct.price))}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-center">
                <Link href="/research-stacks?tab=custom" data-testid="link-build-custom-stack">
                  <Button className="bg-gradient-to-r from-[#22c55e] to-[#21d8ff] text-black font-bold">
                    <Layers className="h-4 w-4 mr-2" />
                    Build a Custom Stack
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </motion.section>
          );
        })()}

      </div>

      {/* Sticky Mobile Add-to-Cart Bar */}
      {!softGated && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border p-3 safe-area-pb" data-testid="sticky-cart-bar-mobile-stack">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{stack.name}</p>
              <p className="text-lg font-bold text-[#D4FF1F]">{pricingReady ? `$${Math.round(getBasePrice())}` : "—"}</p>
            </div>
            <Button
              size="lg"
              className="bg-[#D4FF1F] text-black font-display gap-2 shadow-[0_0_15px_rgba(212, 255, 31,0.4)]"
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              data-testid="button-sticky-add-to-cart-stack"
            >
              <ShoppingBag className="h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
