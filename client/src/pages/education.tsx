import { useState, useEffect, useMemo, useRef } from "react";
import { renderMarkdown } from "@/lib/render-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useParams, useLocation } from "wouter";
import {
  GraduationCap,
  BookOpen,
  FlaskConical,
  Thermometer,
  FileCheck,
  Clock,
  ChevronRight,
  Beaker,
  Info,
  Shield,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  Zap,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Filter,
  X,
  Compass,
  ExternalLink,
  Search,
  ArrowRight,
  Layers,
  Activity,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleModeToggle, BeginnerBadge } from "@/components/education/article-mode-toggle";
import { BrowseBySystem } from "@/components/education/browse-by-system";
import { BeginnerArticleContent, WhatIsPeptideSection, hasQuickBreakdown } from "@/components/education/beginner-content";
import { getPairingReasons } from "@/lib/pairing-intelligence";
import type { EducationArticle, Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { BODY_SYSTEM_HUBS_BY_SLUG } from "@/data/body-system-hubs";
import type { BodySystemHub } from "@/data/body-system-hubs";
import { flagRetiredContent, consumeRetiredFlag, RETIRED_GUIDE_SLUGS } from "@/lib/retired-redirects";
import { OrderingJourney } from "@/components/infographics/ordering-journey";
import productImage from "@assets/reta bottle_1764310671562.jpg";
import { 
  COAAnatomyDiagram, 
  StorageTemperatureGuide,
  TelomereVisual,
  GLP1ReceptorComparison,
  GHAxisDiagram,
  HealingPathwayVisual,
  IGF1PathwayVisual,
  CellularEnergyVisual,
  NeuropeptideVisual,
  HormonalPathwayVisual,
  IpamorelinComparison,
  CJC1295DACMechanism,
  TesomorellinComparison,
  // New MOTS-C quality level infographics
  BPC157AngiogenesisVisual,
  TB500ActinVisual,
  GHKCuCopperVisual,
  EpithalonTelomeraseVisual,
  GLP1ReceptorVisual,
  IpamorelinSelectivityVisual,
  CJC1295AlbuminVisual,
  TesomorelinPulseVisual,
  IGF1LR3StructureVisual,
  IGFDESBindingVisual,
  SemaxNeuralVisual,
  HCGHormonalVisual,
  NADSirtuinVisual,
  GLOWSynergyVisual,
  KLOWSynergyVisual,
  SLUPP332Visual,
  // Educational peptide visuals (compounds not carried by company)
  KisspeptinVisual,
  Kisspeptin54Visual,
  PT141Visual,
  ThymosinAlpha1Visual,
  DSIPVisual,
  SelankVisual,
  AOD9604Visual,
  ThymulinVisual,
  // New compound research visuals
  Amino1MQNADVisual,
  DihexaSynapseVisual,
  GlutathioneRedoxVisual,
  B12MethylationVisual,
  MelanotanReceptorVisual,
  // Hormonal research compound visuals
  GonadorelinVisual,
  TriptorelinVisual,
  EnclomipheneVisual,
  OxytocinVisual
} from "@/components/education";
import { PharmacokineticsChart } from "@/components/pharmacokinetics-chart";
import { getHalfLifeByName, COMBO_STACK_CONSTITUENTS } from "@/data/pharmacokinetics";
import { RelatedStacks } from "@/components/research-stacks/RelatedStacks";
import { STACKS_SLUG_TO_PEPTIDE_NAMES } from "@/data/research-stacks";

// Maps individual peptide article slugs to the peptide name(s) used in research-stacks data.
// This drives the RelatedStacks component shown at the bottom of each article.
//
// The bulk of this map is auto-derived from educationLinks in RESEARCH_STACKS_DATA — new
// stacks whose educationLinks point to a "what-is-*" article slug will surface here
// automatically without any manual update.
//
// Static entries below handle multi-compound complex articles (glow/klow) that should show
// stacks for all three constituent peptides — a case the auto-derivation cannot cover because
// no single educationLink slug maps to all three peptides simultaneously.
const SLUG_TO_PEPTIDE_NAMES: Record<string, string[]> = {
  ...STACKS_SLUG_TO_PEPTIDE_NAMES,
  // Multi-peptide complex articles (auto-derivation cannot handle these because no single
  // educationLink slug maps to all three constituent peptides)
  "what-is-glow-peptide-complex": ["BPC-157", "TB-500", "GHK-Cu"],
  "what-is-klow-peptide-complex": ["BPC-157", "TB-500", "GHK-Cu"],
};

// Articles that are part of the Academy curriculum (for cross-linking)
const ACADEMY_ARTICLE_SLUGS = [
  "ordering-expectations",
  "storage-101",
  "reconstitution-101",
  "how-to-read-coas",
];

const isAcademyArticle = (slug: string | null) => {
  return slug ? ACADEMY_ARTICLE_SLUGS.includes(slug) : false;
};

const articleVisuals: Record<string, () => JSX.Element> = {
  "ordering-expectations": () => <OrderingJourney />,
  "how-to-read-coas": () => <COAAnatomyDiagram />,
  "storage-101": () => <StorageTemperatureGuide />,
  "what-is-epithalon-peptide": () => <EpithalonTelomeraseVisual />,
  "what-is-rr-a1-peptide": () => <GLP1ReceptorVisual />,
  "what-is-rr-a2-peptide": () => <GLP1ReceptorVisual />,
  "what-is-rr-a3-peptide": () => <GLP1ReceptorVisual />,
  "what-is-cjc-1295-peptide": () => <CJC1295AlbuminVisual />,
  "what-is-ipamorelin-peptide": () => <IpamorelinSelectivityVisual />,
  "what-is-tesamorelin-peptide": () => <TesomorelinPulseVisual />,
  "what-is-bpc-157-peptide": () => <BPC157AngiogenesisVisual />,
  "what-is-tb-500-peptide": () => <TB500ActinVisual />,
  "what-is-ghk-cu-peptide": () => <GHKCuCopperVisual />,
  "what-is-glow-peptide-complex": () => <GLOWSynergyVisual />,
  "what-is-klow-peptide-complex": () => <KLOWSynergyVisual />,
  "what-is-igf-1-lr3-peptide": () => <IGF1LR3StructureVisual />,
  "what-is-igf-des-peptide": () => <IGFDESBindingVisual />,
  "what-is-mots-c-peptide": () => <CellularEnergyVisual peptide="mots-c" />,
  "what-is-nad-precursor": () => <NADSirtuinVisual />,
  "what-is-semax-peptide": () => <SemaxNeuralVisual />,
  "what-is-hcg-peptide": () => <HCGHormonalVisual />,
  "what-is-kisspeptin-peptide": () => <KisspeptinVisual />,
  "what-is-kisspeptin-54-peptide": () => <Kisspeptin54Visual />,
  "what-is-pt-141-bremelanotide-peptide": () => <PT141Visual />,
  "what-is-thymosin-alpha-1-peptide": () => <ThymosinAlpha1Visual />,
  "what-is-dsip-peptide": () => <DSIPVisual />,
  "what-is-selank-peptide": () => <SelankVisual />,
  "what-is-aod-9604-peptide": () => <AOD9604Visual />,
  "what-is-thymulin-peptide": () => <ThymulinVisual />,
  "what-is-5-amino-1mq-peptide": () => <Amino1MQNADVisual />,
  "what-is-dihexa-peptide": () => <DihexaSynapseVisual />,
  "what-is-glutathione": () => <GlutathioneRedoxVisual />,
  "what-is-vitamin-b12": () => <B12MethylationVisual />,
  "what-is-melanotan-peptide": () => <MelanotanReceptorVisual />,
  "what-is-slu-pp-332-peptide": () => <SLUPP332Visual />,
  "what-is-gonadorelin-peptide": () => <GonadorelinVisual />,
  "what-is-triptorelin-peptide": () => <TriptorelinVisual />,
  "what-is-enclomiphene-peptide": () => <EnclomipheneVisual />,
  "what-is-oxytocin-peptide": () => <OxytocinVisual />,
};

const categories = [
  { id: "all", label: "All Articles", icon: BookOpen, color: "#ffffff" },
  { id: "peptides", label: "Peptide Profiles", icon: FlaskConical, color: "#ec4899" },
  { id: "basics", label: "Research Basics", icon: Beaker, color: "#21d8ff" },
  { id: "coa-guide", label: "Understanding COAs", icon: FileCheck, color: "#9d4edd" },
  { id: "storage", label: "Storage & Handling", icon: Thermometer, color: "#f97316" },
  { id: "safety", label: "Lab Safety", icon: AlertTriangle, color: "#ef4444" },
  { id: "glossary", label: "Terminology", icon: Info, color: "#22c55e" },
];

// Tab definitions for the 4-tab structure
const EDUCATION_TABS = [
  { 
    id: "peptides", 
    label: "Peptide Research Guides", 
    icon: FlaskConical, 
    color: "#ec4899",
    categories: ["peptides"]
  },
  { 
    id: "general", 
    label: "General Education", 
    icon: BookOpen, 
    color: "#21d8ff",
    categories: ["basics", "storage", "glossary"]
  },
  { 
    id: "lab-guides", 
    label: "Lab Guides", 
    icon: Beaker, 
    color: "#22c55e",
    categories: ["safety"]
  },
  { 
    id: "trust", 
    label: "Trust & Verification", 
    icon: Shield, 
    color: "#f97316",
    categories: [] // Static pages, not database articles
  },
];

// System / Deep-Dive guides — static long-form pages (not in the DB)
const SYSTEM_GUIDES = [
  {
    slug: "healing-peptides",
    title: "Healing Peptides: Tissue Repair & Angiogenesis",
    description:
      "A deep-dive into the tissue-repair cluster — BPC-157, TB-500, GHK-Cu, and how they coordinate angiogenesis, collagen remodelling, and immune resolution.",
    href: "/systems/healing",
    color: "#22c55e",
    badgeLabel: "Healing",
    readTime: 18,
  },
  {
    slug: "hormonal-peptides",
    title: "Hormonal Axis Peptides: HPG Cascade, GnRH Signaling, and Endocrine Research",
    description:
      "A comprehensive guide to the HPG axis — Kisspeptin, Gonadorelin, Triptorelin, and how pulsatile GnRH signaling regulates reproductive endocrinology.",
    href: "/systems/hormonal",
    color: "#21d8ff",
    badgeLabel: "Hormonal",
    readTime: 20,
  },
  {
    slug: "cognitive-peptides",
    title: "Cognitive Peptides: Neuropeptide Signaling, BDNF Pathways, and Neuro Cluster Research",
    description:
      "A deep-dive into the cognitive/neuro cluster — Semax, Selank, Dihexa, DSIP, and PT-141 — covering BDNF, HGF/MET synaptogenesis, GABAergic modulation, and shared melanocortin receptor architecture.",
    href: "/systems/cognitive",
    color: "#f97316",
    badgeLabel: "Cognitive",
    readTime: 22,
  },
  {
    slug: "growth-hormone-peptides",
    title: "Growth Hormone Peptides: GHRH/GHRP Axis, GH Secretagogue Mechanisms, and the GH → IGF-1 Cascade",
    description:
      "A comprehensive guide to the Growth Hormone cluster — CJC-1295, Ipamorelin, Tesamorelin, IGF-1 LR3, and IGF-DES — covering the GHRH/GHRP two-receptor synergy, the GH → IGF-1 cascade, and IGF-binding protein pharmacology.",
    href: "/systems/growth",
    color: "#f59e0b",
    badgeLabel: "Growth Hormone",
    readTime: 24,
  },
];

// Trust & Verification guides - static pages for SEO entry
const TRUST_GUIDES = [
  {
    slug: "are-peptide-coas-trustworthy",
    title: "Are Peptide COAs Trustworthy?",
    description: "What COAs prove, their limitations, and how to evaluate quality claims.",
    href: "/guides/are-peptide-coas-trustworthy",
    icon: FileCheck,
    color: "#9d4edd",
    readTime: 8
  },
  {
    slug: "how-batch-testing-works",
    title: "How Batch Testing Works",
    description: "Why no one tests every vial and what this means for quality.",
    href: "/guides/how-batch-testing-works",
    icon: Beaker,
    color: "#21d8ff",
    readTime: 7
  },
  {
    slug: "what-research-use-only-means",
    title: "What 'Research Use Only' Means",
    description: "Clear explanation of RUO labeling and compliance.",
    href: "/guides/what-research-use-only-means",
    icon: AlertTriangle,
    color: "#22c55e",
    readTime: 6
  },
  {
    slug: "how-to-verify-peptide-quality",
    title: "How to Verify Peptide Quality",
    description: "Independent verification without trusting the seller.",
    href: "/guides/how-to-verify-peptide-quality",
    icon: Search,
    color: "#ec4899",
    readTime: 9
  },
  {
    slug: "peptide-purity-explained",
    title: "What Purity Percentages Mean",
    description: "Understanding HPLC results and why higher isn't always better.",
    href: "/guides/peptide-purity-explained",
    icon: FlaskConical,
    color: "#f97316",
    readTime: 7
  },
  {
    slug: "why-cheap-peptides-are-cheap",
    title: "Why Cheap Peptides Are Cheap",
    description: "Where low-price vendors cut corners and when price matters.",
    href: "/guides/why-cheap-peptides-are-cheap",
    icon: Shield,
    color: "#E7FB10",
    readTime: 8
  },
];

const peptideGroups = [
  { id: "all", label: "All Peptides", color: "#ec4899" },
  { id: "metabolic", label: "Metabolic", color: "#E7FB10", slugs: ["rr-a1", "rr-a2", "rr-a3", "aod-9604", "5-amino-1mq", "slu-pp-332"] },
  { id: "growth-hormone", label: "Growth Hormone", color: "#21d8ff", slugs: ["cjc-1295", "ipamorelin", "tesamorelin", "igf-1-lr3", "igf-des"] },
  { id: "tissue-repair", label: "Tissue Repair", color: "#22c55e", slugs: ["bpc-157", "tb-500"] },
  { id: "skin-regeneration", label: "Skin & Regeneration", color: "#ec4899", slugs: ["ghk-cu", "glow-peptide-complex", "klow-peptide-complex", "melanotan"] },
  { id: "longevity", label: "Longevity & Cellular", color: "#9d4edd", slugs: ["epithalon", "mots-c", "nad-precursor", "thymosin-alpha-1", "thymulin", "glutathione", "vitamin-b12"] },
  { id: "cognitive", label: "Cognitive / Neuro", color: "#f97316", slugs: ["semax", "pt-141", "dsip", "selank", "dihexa"] },
  { id: "hormonal", label: "Hormonal", color: "#21d8ff", slugs: ["hcg", "kisspeptin", "kisspeptin-54", "gonadorelin", "triptorelin", "enclomiphene", "oxytocin"] },
];

// Body-system overview guides — static pages linked from the Education Center
const BODY_SYSTEM_GUIDES = [
  {
    slug: "hormonal-peptides",
    title: "Hormonal Peptides: HPG Axis & Endocrine Support",
    description: "How kisspeptin, HCG, gonadorelin, and related compounds interact with the hypothalamic-pituitary-gonadal axis.",
    href: "/systems/hormonal",
    icon: Activity,
    color: "#21d8ff",
    readTime: 12,
    group: "hormonal",
  },
];

const generalEdCategories = [
  { id: "all", label: "All Articles", color: "#21d8ff" },
  { id: "basics", label: "Research Basics", color: "#21d8ff" },
  { id: "storage", label: "Storage & Handling", color: "#f97316" },
  { id: "glossary", label: "Terminology", color: "#22c55e" },
];

// Multi-category articles: complex peptides that appear under multiple research groups
// Note: GLOW and KLOW are blends/complexes - they only appear in their primary category (Skin & Regeneration)
const multiCategoryArticles: Record<string, string[]> = {
};

type SortOption = "a-z" | "z-a";

const getPeptideGroup = (slug: string): string => {
  for (const group of peptideGroups) {
    if (group.slugs?.some(s => slug.includes(s))) {
      return group.id;
    }
  }
  return "all";
};


const getCategoryColor = (categoryId: string) => {
  const cat = categories.find(c => c.id === categoryId);
  return cat?.color || "#9d4edd";
};

const getCategoryLabel = (categoryId: string) => {
  const cat = categories.find(c => c.id === categoryId);
  return cat?.label || categoryId;
};


const PUBMED_SEARCH_TERMS: Record<string, string> = {
  "what-is-glow-peptide-complex": "GHK-Cu collagen peptide skin rejuvenation",
  "what-is-klow-peptide-complex": "BPC-157 anti-inflammatory tissue repair peptide",
  "what-is-ghk-cu-peptide": "GHK-Cu copper peptide",
  "what-is-bpc-157-peptide": "BPC-157 body protection compound",
  "what-is-tb-500-peptide": "TB-500 thymosin beta-4",
  "what-is-5-amino-1mq-peptide": "5-amino-1MQ NNMT inhibitor",
  "what-is-cjc-1295-peptide": "CJC-1295 GHRH analog",
  "what-is-igf-1-lr3-peptide": "IGF-1 LR3 growth factor",
  "what-is-igf-des-peptide": "IGF-DES des(1-3) IGF-1 truncated analog",
  "what-is-pt-141-bremelanotide-peptide": "PT-141 bremelanotide melanocortin",
  "what-is-nad-precursor": "NAD+ nicotinamide riboside",
  "what-is-slu-pp-332-peptide": "SLU-PP-332 ERR agonist",
  "what-is-aod-9604-peptide": "AOD-9604 lipolytic peptide",
  "what-is-mots-c-peptide": "MOTS-c mitochondrial peptide",
  "what-is-dsip-peptide": "DSIP delta sleep-inducing peptide",
  "what-is-hcg-peptide": "HCG human chorionic gonadotropin",
  "what-is-rr-a1-peptide": "GLP-1 receptor agonist peptide",
  "what-is-rr-a2-peptide": "GLP-1 GIP dual receptor agonist",
  "what-is-rr-a3-peptide": "GLP-1 GIP glucagon triple agonist",
  "what-is-epithalon-peptide": "Epithalon telomerase activation",
  "what-is-ipamorelin-peptide": "Ipamorelin growth hormone secretagogue",
  "what-is-tesamorelin-peptide": "Tesamorelin GHRH analog",
  "what-is-semax-peptide": "Semax ACTH neuropeptide",
  "what-is-selank-peptide": "Selank tuftsin anxiolytic peptide",
  "what-is-melanotan-peptide": "Melanotan melanocortin peptide",
  "what-is-kisspeptin-peptide": "Kisspeptin neuroendocrine",
  "what-is-kisspeptin-54-peptide": "Kisspeptin-54 KISS1R HPG axis",
  "what-is-dihexa-peptide": "Dihexa cognitive peptide HGF",
  "what-is-thymosin-alpha-1-peptide": "Thymosin alpha-1 immune modulation",
  "what-is-thymulin-peptide": "Thymulin thymic hormone zinc",
  "what-is-glutathione": "Glutathione antioxidant",
  "what-is-vitamin-b12": "Vitamin B12 cobalamin",
};

const getPubMedSearchTerm = (slug: string, _title: string): string => {
  return PUBMED_SEARCH_TERMS[slug] ||
    (slug.replace('what-is-', '').replace(/-peptide$/, ''))
      .split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
};

type ArticleMode = "deep-dive" | "quick-breakdown" | "pharmacokinetics";

const PEPTIDE_GROUP_TO_SYSTEM_SLUG: Record<string, string> = {
  "metabolic": "metabolic",
  "growth-hormone": "growth",
  "tissue-repair": "healing",
  "skin-regeneration": "skin",
  "longevity": "longevity",
  "cognitive": "cognitive",
  "hormonal": "hormonal",
};

function getSystemHubForArticle(slug: string | null | undefined): BodySystemHub | null {
  if (!slug) return null;
  const group = getPeptideGroup(slug);
  if (group === "all") return null;
  const systemSlug = PEPTIDE_GROUP_TO_SYSTEM_SLUG[group];
  if (!systemSlug) return null;
  return BODY_SYSTEM_HUBS_BY_SLUG[systemSlug] ?? null;
}

function articleSlugToCompoundKey(articleSlug: string): string {
  return articleSlug
    .replace(/^what-is-/, "")
    .replace(/-(peptide|compound|molecule|supplement)$/, "");
}

export default function Education() {
  const params = useParams<{ slug?: string }>();
  const [location] = useLocation();
  const { toast } = useToast();

  // Show toast when redirected from a retired guide URL
  useEffect(() => {
    if (consumeRetiredFlag("guide")) {
      toast({
        title: "Guide Unavailable",
        description: "That guide is no longer available. Browse our current educational resources below.",
      });
    }
  }, []);
  
  // Parse tab from URL query parameter (with SSR guard)
  const getTabFromUrl = () => {
    if (typeof window === "undefined") return "peptides";
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get("tab");
    if (tab && ["peptides", "general", "lab-guides", "trust"].includes(tab)) {
      return tab;
    }
    return "peptides";
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromUrl);
  
  // Sync tab with URL query param when location changes (for SPA navigation)
  useEffect(() => {
    const tab = getTabFromUrl();
    setActiveTab(tab);
  }, [location]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [articleMode, setArticleMode] = useState<ArticleMode>("quick-breakdown");
  const prevReadingModeRef = useRef<"quick-breakdown" | "deep-dive">("quick-breakdown");
  const [peptideSort, setPeptideSort] = useState<SortOption>("a-z");
  const [peptideGroupFilter, setPeptideGroupFilter] = useState<string>("all");
  const [generalEdCategoryFilter, setGeneralEdCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: articles = [], isLoading } = useQuery<EducationArticle[]>({
    queryKey: ["/api/education"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const [, setLocation] = useLocation();
  
  const handleOpenArticle = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (article?.slug) {
      setLocation(`/guides/${article.slug}`);
    } else {
      sessionStorage.setItem('education_scroll_pos', window.pageYOffset.toString());
      setExpandedArticle(articleId);
      const defaultMode = hasQuickBreakdown(article?.slug ?? "") ? "quick-breakdown" : "deep-dive";
      setArticleMode(defaultMode);
      prevReadingModeRef.current = defaultMode;
    }
  };

  const handleBackToArticles = () => {
    setExpandedArticle(null);
    if (params.slug) {
      setLocation("/guides/peptide-education-center");
    }
    requestAnimationFrame(() => {
      const savedPos = sessionStorage.getItem('education_scroll_pos');
      if (savedPos) {
        window.scrollTo({
          top: parseInt(savedPos),
          behavior: 'instant'
        });
        sessionStorage.removeItem('education_scroll_pos');
      }
    });
  };

  const getMatchingProducts = (slug: string): Product[] => {
    if (!slug?.startsWith('what-is-')) return [];
    
    if (slug === "what-is-melanotan-peptide") {
      return products.filter(p => 
        p.name.toLowerCase().includes("melanotan i") || 
        p.name.toLowerCase().includes("melanotan 1") ||
        p.name.toLowerCase().includes("melanotan ii") ||
        p.name.toLowerCase().includes("melanotan 2")
      );
    }

    const peptideName = slug.replace('what-is-', '').replace(/-peptide$/, '').replace(/-/g, ' ').toLowerCase();
    const directMatch = products.find(p => {
      const pName = p.name.toLowerCase();
      const pNameClean = pName.replace(/[^a-z0-9]/g, ' ').trim();
      return pName.includes(peptideName) || 
             peptideName.includes(pName) ||
             pNameClean.includes(peptideName) ||
             peptideName.includes(pNameClean);
    });
    
    return directMatch ? [directMatch] : [];
  };

  // Handle URL-based article opening.
  // Immediately redirect known retired slugs; otherwise wait for articles to load
  // before deciding whether to open an article or redirect as unavailable.
  useEffect(() => {
    if (!params.slug) return;
    if (RETIRED_GUIDE_SLUGS.includes(params.slug)) {
      flagRetiredContent("guide", params.slug);
      setLocation("/guides/peptide-education-center");
      return;
    }
    if (articles.length > 0) {
      const article = articles.find(a => a.slug === params.slug);
      if (article) {
        setExpandedArticle(article.id);
        setActiveCategory(article.category);
        const defaultMode = hasQuickBreakdown(article.slug ?? "") ? "quick-breakdown" : "deep-dive";
        setArticleMode(defaultMode);
        prevReadingModeRef.current = defaultMode;
      } else {
        flagRetiredContent("guide", params.slug);
        setLocation("/guides/peptide-education-center");
      }
    }
  }, [params.slug, articles]);

  // Scroll to top of article when it expands
  useEffect(() => {
    if (expandedArticle) {
      // Use requestAnimationFrame to wait for DOM render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const element = document.getElementById('expanded-article');
          if (element) {
            const headerOffset = 100; // Account for fixed header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        });
      });
    }
  }, [expandedArticle]);

  // Track previous reading mode so PK Profile toggle can return to it
  useEffect(() => {
    if (articleMode === "quick-breakdown" || articleMode === "deep-dive") {
      prevReadingModeRef.current = articleMode;
    }
  }, [articleMode]);

  // Derive PK data for the currently expanded article
  const expandedArticleObj = useMemo(
    () => articles.find(a => a.id === expandedArticle) ?? null,
    [articles, expandedArticle],
  );

  const articleCompoundKey = expandedArticleObj?.slug
    ? articleSlugToCompoundKey(expandedArticleObj.slug)
    : null;

  const articlePkPeptides: { name: string; description: string }[] | null = useMemo(() => {
    if (!articleCompoundKey) return null;
    const constituentNames = COMBO_STACK_CONSTITUENTS[articleCompoundKey];
    if (constituentNames) {
      return constituentNames.every(n => !!getHalfLifeByName(n))
        ? constituentNames.map(n => ({ name: n, description: "" }))
        : null;
    }
    const entry = getHalfLifeByName(articleCompoundKey);
    if (entry) return [{ name: entry.name, description: expandedArticleObj?.title ?? "" }];
    return null;
  }, [articleCompoundKey, expandedArticleObj]);

  const articleHasPk = !!articlePkPeptides;

  // Calculate peptide article counts per group for dropdown badges
  const peptideGroupCounts = useMemo(() => {
    const peptideArticles = articles.filter(a => a.category === "peptides");
    const counts: Record<string, number> = { all: peptideArticles.length };
    peptideArticles.forEach(a => {
      const group = getPeptideGroup(a.slug || "");
      if (group && group !== "all") {
        counts[group] = (counts[group] || 0) + 1;
      }
      // Also count in any additional categories from multi-category mapping
      const additionalGroups = multiCategoryArticles[a.slug || ""] || [];
      additionalGroups.forEach(addGroup => {
        counts[addGroup] = (counts[addGroup] || 0) + 1;
      });
    });
    return counts;
  }, [articles]);

  // Calculate general education article counts per category
  const generalEdCategoryCounts = useMemo(() => {
    const genEdArticles = articles.filter(a => EDUCATION_TABS.find(t => t.id === "general")?.categories.includes(a.category));
    const counts: Record<string, number> = { all: genEdArticles.length };
    generalEdCategories.slice(1).forEach(cat => {
      counts[cat.id] = genEdArticles.filter(a => a.category === cat.id).length;
    });
    return counts;
  }, [articles]);

  // Inject BreadcrumbList JSON-LD for expanded articles that belong to a body system
  useEffect(() => {
    const systemHub = getSystemHubForArticle(expandedArticleObj?.slug);
    if (!systemHub || !expandedArticleObj) {
      document.getElementById("breadcrumb-json-ld-education")?.remove();
      return;
    }
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "breadcrumb-json-ld-education";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Education Center",
          "item": "https://reviveresearch.co/guides/peptide-education-center"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": systemHub.name,
          "item": `https://reviveresearch.co/systems/${systemHub.slug}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": expandedArticleObj.title,
          "item": `https://reviveresearch.co/education/${expandedArticleObj.slug}`
        }
      ]
    });
    document.getElementById("breadcrumb-json-ld-education")?.remove();
    document.head.appendChild(script);
    return () => {
      document.getElementById("breadcrumb-json-ld-education")?.remove();
    };
  }, [expandedArticleObj]);

  // Get articles for a specific tab
  const getTabArticles = (tabId: string) => {
    const tab = EDUCATION_TABS.find(t => t.id === tabId);
    if (!tab) return [];
    return articles.filter(a => tab.categories.includes(a.category));
  };

  const filteredArticles = (() => {
    // Get articles based on active tab
    const currentTab = EDUCATION_TABS.find(t => t.id === activeTab);
    let result = currentTab 
      ? articles.filter(a => currentTab.categories.includes(a.category))
      : articles;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((a) => 
        a.title.toLowerCase().includes(query) || 
        (a.summary || "").toLowerCase().includes(query)
      );
    }
    
    // Apply peptide group filter if in peptides tab
    if (activeTab === "peptides" && peptideGroupFilter !== "all") {
      result = result.filter((a) => {
        const group = getPeptideGroup(a.slug || "");
        // Check primary group or any additional categories from multi-category mapping
        const additionalGroups = multiCategoryArticles[a.slug || ""] || [];
        return group === peptideGroupFilter || additionalGroups.includes(peptideGroupFilter);
      });
    }
    
    // Apply general education category filter if in general tab
    if (activeTab === "general" && generalEdCategoryFilter !== "all") {
      result = result.filter((a) => {
        // Check primary category or any additional categories from multi-category mapping
        const additionalCategories = multiCategoryArticles[a.slug || ""] || [];
        return a.category === generalEdCategoryFilter || additionalCategories.includes(generalEdCategoryFilter);
      });
    }
    
    // Apply sorting for peptides tab (alphabetical by default)
    if (activeTab === "peptides") {
      result = [...result].sort((a, b) => {
        const nameA = a.title.toLowerCase();
        const nameB = b.title.toLowerCase();
        if (peptideSort === "a-z") {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    } else {
      // Sort alphabetically for other tabs too
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return result;
  })();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "peptides":
        return FlaskConical;
      case "basics":
        return Beaker;
      case "coa-guide":
        return FileCheck;
      case "storage":
        return Thermometer;
      case "safety":
        return AlertTriangle;
      case "glossary":
        return Info;
      default:
        return BookOpen;
    }
  };

  const groupedArticles = categories.slice(1).map(cat => ({
    ...cat,
    articles: articles
      .filter(a => a.category === cat.id)
      .sort((a, b) => a.title.localeCompare(b.title))
  })).filter(cat => cat.articles.length > 0);

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <SEOHead title="Education Center" description="Learn about peptide research, proper handling, and storage. Free educational resources for researchers." canonicalPath="/guides/peptide-education-center" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Education Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our open reference library for quick lookups on peptide research topics, compounds, and best practices.
          </p>
          <Link href="/academy">
            <div className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full holographic-pill hover-elevate cursor-pointer transition-all" data-testid="link-academy-cta">
              <GraduationCap className="h-4 w-4 text-[#21d8ff]" />
              <span className="text-sm text-muted-foreground">New to peptides?</span>
              <span className="text-sm holo-text">Try the Research Academy</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#21d8ff]" />
            </div>
          </Link>

        </motion.div>

        {/* Browse by Body System — above tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-10"
        >
          <BrowseBySystem />
        </motion.div>

        {/* Main Tabbed Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8"
        >
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setExpandedArticle(null); setPeptideGroupFilter("all"); }} className="w-full">
            <TabsList className="w-full justify-start bg-card/50 border border-border p-1 rounded-lg mb-6 flex-wrap h-auto gap-1">
              {EDUCATION_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
                    style={{
                      color: activeTab === tab.id ? tab.color : undefined,
                      borderColor: activeTab === tab.id ? `${tab.color}40` : undefined,
                    }}
                    data-testid={`tab-${tab.id}`}
                  >
                    <Icon className="h-4 w-4" style={{ color: tab.color }} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Main Content Area */}
            <div className="mt-2">
            {expandedArticle ? (
              <div className="relative">
                {/* Floating Back Button - visible while scrolling */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  onClick={() => setExpandedArticle(null)}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-[#1a1a1f]/95 border border-[#21d8ff]/40 shadow-lg shadow-black/30 backdrop-blur-sm md:hover:border-[#21d8ff] md:hover:shadow-[#21d8ff]/20 transition-all cursor-pointer lg:left-auto lg:right-8 lg:translate-x-0"
                  data-testid="button-floating-back"
                >
                  <ArrowLeft className="h-4 w-4 text-[#21d8ff]" />
                  <span className="text-sm font-medium text-foreground">Back to Articles</span>
                </motion.button>

                {(() => {
                  const article = articles.find(a => a.id === expandedArticle);
                  if (!article) return null;
                  const catColor = getCategoryColor(article.category);
                  const CategoryIcon = getCategoryIcon(article.category);

                  const articleSystemHub = getSystemHubForArticle(article.slug);

                  return (
                    <Card id="expanded-article" className="overflow-hidden" style={{ borderColor: `${catColor}30` }}>
                      <div className="p-6 border-b" style={{ borderColor: `${catColor}20` }}>
                        <button
                          onClick={handleBackToArticles}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3 cursor-pointer"
                          data-testid="button-back-to-articles"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to {getCategoryLabel(activeCategory)}
                        </button>

                        {articleSystemHub && (
                          <nav aria-label="Breadcrumb" className="mb-4" data-testid="nav-breadcrumb">
                            <ol className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                              <li>
                                <Link href="/guides/peptide-education-center" className="hover:text-foreground transition-colors" data-testid="link-breadcrumb-education">
                                  Education Center
                                </Link>
                              </li>
                              <li><ChevronRight className="h-3 w-3 flex-shrink-0" /></li>
                              <li>
                                <Link
                                  href={`/systems/${articleSystemHub.slug}`}
                                  className="hover:opacity-80 transition-opacity font-medium"
                                  style={{ color: articleSystemHub.color }}
                                  data-testid="link-breadcrumb-system"
                                >
                                  {articleSystemHub.name}
                                </Link>
                              </li>
                              <li><ChevronRight className="h-3 w-3 flex-shrink-0" /></li>
                              <li className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none" data-testid="text-breadcrumb-current">{article.title}</li>
                            </ol>
                          </nav>
                        )}

                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: `${catColor}50`, color: catColor }}
                          >
                            <CategoryIcon className="h-3 w-3 mr-1" />
                            {getCategoryLabel(article.category)}
                          </Badge>
                          <span className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {article.readTimeMinutes} min read
                          </span>
                          {isAcademyArticle(article.slug) && (
                            <Link href="/academy">
                              <Badge
                                variant="outline"
                                className="text-xs cursor-pointer hover:bg-[#21d8ff]/10 transition-colors"
                                style={{ borderColor: "#21d8ff50", color: "#21d8ff" }}
                                data-testid="badge-academy-link"
                              >
                                <Compass className="h-3 w-3 mr-1" />
                                Part of Academy Orientation
                              </Badge>
                            </Link>
                          )}
                        </div>

                        <h1 className="font-display text-2xl md:text-3xl font-bold mb-3" style={{ color: catColor }}>
                          {article.title}
                        </h1>
                        <p className="text-muted-foreground mb-4">
                          {article.summary}
                        </p>
                        
                        {(hasQuickBreakdown(article.slug) || articleHasPk) && (
                          <div className="flex flex-wrap items-center gap-3">
                            {hasQuickBreakdown(article.slug) && (
                              <>
                                <ArticleModeToggle 
                                  mode={articleMode} 
                                  onModeChange={setArticleMode} 
                                />
                                {articleMode === "quick-breakdown" && <BeginnerBadge />}
                              </>
                            )}
                            {(articleHasPk || (article.category === "peptides" && article.slug?.startsWith('what-is-'))) && (
                              <div className="ml-auto flex items-center gap-2">
                                {articleHasPk && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={`gap-2 transition-colors ${
                                      articleMode === "pharmacokinetics"
                                        ? "border-[#21d8ff] text-[#21d8ff] bg-[#21d8ff]/10"
                                        : "border-[#21d8ff]/40 text-[#21d8ff]/70"
                                    }`}
                                    onClick={() =>
                                      setArticleMode(
                                        articleMode === "pharmacokinetics"
                                          ? prevReadingModeRef.current
                                          : "pharmacokinetics"
                                      )
                                    }
                                    data-testid="button-pk-profile"
                                  >
                                    <Activity className="h-3.5 w-3.5" />
                                    PK Profile
                                  </Button>
                                )}
                                {article.category === "peptides" && article.slug?.startsWith('what-is-') && (
                                  <a 
                                    href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(
                                      getPubMedSearchTerm(article.slug || "", article.title)
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    data-testid={`link-pubmed-research`}
                                  >
                                    <Button 
                                      size="sm"
                                      className="bg-[#21d8ff] hover:bg-black text-black hover:text-[#21d8ff] font-medium gap-2"
                                    >
                                      View on PubMed
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </Button>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-4 md:p-6">
                        <AnimatePresence mode="wait">
                          {articleHasPk && articleMode === "pharmacokinetics" ? (
                            <motion.div
                              key="pk-profile"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex gap-2 items-start rounded-md bg-[#21d8ff]/5 border border-[#21d8ff]/15 px-3 py-2.5">
                                <Info className="h-4 w-4 text-[#21d8ff]/60 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  <span className="text-[#21d8ff]/80 font-medium">Pharmacokinetic (PK) data</span>{" "}
                                  shows how compound concentration in the bloodstream changes over time after
                                  a single dose, based on published research. The peak marks maximum plasma
                                  levels; the slope shows how quickly the compound clears. This helps
                                  researchers understand dosing intervals, duration of activity, and how
                                  compounds may interact when studied in combination.
                                </p>
                              </div>
                              <div className="flex gap-2 items-start mt-2 mb-4 rounded-md bg-amber-500/5 border border-amber-500/20 px-3 py-2.5">
                                <AlertTriangle className="h-4 w-4 text-amber-500/60 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  <span className="text-amber-500/80 font-medium">Research use only.</span>{" "}
                                  We do not recommend, suggest, or endorse any specific dosage, administration
                                  protocol, or use of these compounds in humans or animals.
                                </p>
                              </div>
                              <PharmacokineticsChart
                                peptides={articlePkPeptides!}
                                stackId={`article-${expandedArticleObj?.slug}`}
                              />
                            </motion.div>
                          ) : hasQuickBreakdown(article.slug) && articleMode === "quick-breakdown" ? (
                            <motion.div
                              key="beginner"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                            >
                              <BeginnerArticleContent 
                                slug={article.slug || ""} 
                                title={article.title} 
                              />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="deepdive"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                            >
                              {article.slug && articleVisuals[article.slug] && (
                                <div className="mb-6 max-w-2xl lg:max-w-3xl mx-auto">
                                  {articleVisuals[article.slug]()}
                                </div>
                              )}

                              {article.content && (
                                <div 
                                  className="prose prose-invert prose-sm max-w-none text-muted-foreground"
                                  dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
                                />
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* RUO Disclaimer for peptide articles */}
                        {article.category === "peptides" && (
                          <div className="mt-8 p-4 rounded-lg border border-red-500/30 bg-red-950/20">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-red-400 mb-1">Research Use Only</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  This compound is intended for laboratory research purposes only. Not for human consumption, 
                                  veterinary use, or any therapeutic applications. All information provided is for 
                                  educational purposes and does not constitute medical advice.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Subtle product CTA for peptide articles */}
                        {article.category === "peptides" && (() => {
                          const matchingProducts = getMatchingProducts(article.slug || "");
                          if (matchingProducts.length === 0) return null;
                          return (
                            <div className="mt-8 pt-8 border-t border-border/50">
                              <h3 className="font-display text-xl font-bold mb-4">Related Research Compound</h3>
                              <div className="space-y-4">
                                {matchingProducts.map(product => (
                                  <Link key={product.id} href={`/peptides/${product.slug || product.id}`}>
                                    <Card className="p-4 border border-[#21d8ff]/20 hover:border-[#21d8ff]/50 transition-all hover-elevate cursor-pointer">
                                      <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded bg-muted flex-shrink-0">
                                          <img 
                                            src={product.imageUrl || productImage} 
                                            alt={product.name}
                                            className="w-full h-full object-contain p-2"
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-display font-bold text-[#E7FB10] truncate">{product.name}</h4>
                                          <p className="text-xs text-muted-foreground truncate">{product.shortDescription}</p>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-[#21d8ff]" />
                                      </div>
                                    </Card>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Pairs Well With section for peptide articles */}
                        {article.category === "peptides" && (() => {
                          const matchingProducts = getMatchingProducts(article.slug || "");
                          if (matchingProducts.length === 0) return null;
                          const mainProduct = matchingProducts[0];
                          const pairings = getPairingReasons(mainProduct.name);
                          if (pairings.length === 0) return null;
                          const pairedProducts = pairings.slice(0, 3).map(p => {
                            const found = products.find(prod => 
                              prod.name.toLowerCase() === p.partner.toLowerCase() ||
                              prod.name.toLowerCase().includes(p.partner.toLowerCase()) ||
                              p.partner.toLowerCase().includes(prod.name.toLowerCase())
                            );
                            return { pairing: p, product: found };
                          }).filter(pp => pp.product);

                          if (pairedProducts.length === 0) return null;
                          return (
                            <div className="mt-8 pt-8 border-t border-border/50" data-testid="article-pairs-well-with">
                              <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-2">
                                <Layers className="h-5 w-5 text-[#22c55e]" />
                                Pairs Well With
                              </h3>
                              <p className="text-xs text-muted-foreground mb-4">
                                Research-backed pairings based on complementary mechanisms of action.
                              </p>
                              <div className="space-y-3">
                                {pairedProducts.map(({ pairing, product: partnerProd }) => (
                                  <Link key={partnerProd!.id} href={`/peptides/${partnerProd!.slug || partnerProd!.id}`}>
                                    <Card className="p-4 border border-[#22c55e]/20 hover:border-[#22c55e]/50 transition-all hover-elevate cursor-pointer" data-testid={`card-article-pairing-${partnerProd!.id}`}>
                                      <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded bg-muted flex-shrink-0">
                                          <img 
                                            src={partnerProd!.imageUrl || productImage}
                                            alt={partnerProd!.name}
                                            className="w-full h-full object-contain p-1"
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-semibold text-sm">{partnerProd!.name}</h4>
                                            {pairing.sequential && (
                                              <Badge className="text-[10px] bg-amber-500/20 text-amber-400 border-amber-500/30">
                                                Sequential
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {pairing.mechanism}
                                          </p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-[#22c55e] flex-shrink-0 mt-1" />
                                      </div>
                                    </Card>
                                  </Link>
                                ))}
                              </div>
                              <Link href="/research-stacks">
                                <Button variant="ghost" size="sm" className="mt-3 text-xs text-muted-foreground w-full" data-testid="link-article-stacks">
                                  Explore Research Stacks
                                  <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                              </Link>
                            </div>
                          );
                        })()}

                        {/* Healing System Guide cross-link */}
                        {article.slug && [
                          "what-is-bpc-157-peptide",
                          "what-is-tb-500-peptide",
                          "what-is-ghk-cu-peptide",
                        ].includes(article.slug) && (
                          <div className="mt-8 pt-8 border-t border-border/50" data-testid="article-healing-system-guide-link">
                            <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-2">
                              <Activity className="h-5 w-5 text-[#22c55e]" />
                              See Also
                            </h3>
                            <p className="text-xs text-muted-foreground mb-4">
                              Understand how this compound fits into the broader Healing &amp; Tissue Repair system.
                            </p>
                            <Link href="/systems/healing">
                              <Card
                                className="p-4 cursor-pointer hover-elevate transition-all"
                                style={{ borderColor: "rgba(34,197,94,0.25)" }}
                                data-testid="card-healing-system-guide"
                              >
                                <div className="flex items-center gap-4">
                                  <div
                                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: "rgba(34,197,94,0.12)" }}
                                  >
                                    <BookOpen className="h-5 w-5" style={{ color: "#22c55e" }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                      <Badge
                                        className="text-[10px] border"
                                        style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "#22c55e", borderColor: "rgba(34,197,94,0.35)" }}
                                      >
                                        Healing
                                      </Badge>
                                      <span className="text-[10px] text-muted-foreground">System Guide</span>
                                    </div>
                                    <h4 className="font-semibold text-sm text-foreground leading-snug">
                                      Healing &amp; Tissue Repair Peptides: Proliferative Phase, Remodelling, and the BPC-157 / TB-500 / GHK-Cu Axis
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      How BPC-157, TB-500, and GHK-Cu work together across the full tissue repair cascade.
                                    </p>
                                  </div>
                                  <ArrowRight className="h-4 w-4 flex-shrink-0" style={{ color: "#22c55e" }} />
                                </div>
                              </Card>
                            </Link>
                          </div>
                        )}

                        {/* Cognitive / Neuro System Guide cross-link */}
                        {article.slug && [
                          "what-is-semax-peptide",
                          "what-is-selank-peptide",
                          "what-is-dihexa-peptide",
                          "what-is-dsip-peptide",
                          "what-is-pt-141-bremelanotide-peptide",
                        ].includes(article.slug) && (
                          <div className="mt-8 pt-8 border-t border-border/50" data-testid="article-cognitive-system-guide-link">
                            <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-2">
                              <Activity className="h-5 w-5 text-[#f97316]" />
                              See Also
                            </h3>
                            <p className="text-xs text-muted-foreground mb-4">
                              Understand how this compound fits into the broader Cognitive &amp; Neuro peptide system.
                            </p>
                            <Link href="/systems/cognitive">
                              <Card
                                className="p-4 cursor-pointer hover-elevate transition-all"
                                style={{ borderColor: "rgba(249,115,22,0.25)" }}
                                data-testid="card-cognitive-system-guide"
                              >
                                <div className="flex items-center gap-4">
                                  <div
                                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: "rgba(249,115,22,0.12)" }}
                                  >
                                    <BookOpen className="h-5 w-5" style={{ color: "#f97316" }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                      <Badge
                                        className="text-[10px] border"
                                        style={{ backgroundColor: "rgba(249,115,22,0.15)", color: "#f97316", borderColor: "rgba(249,115,22,0.35)" }}
                                      >
                                        Cognitive &amp; Neuro
                                      </Badge>
                                      <span className="text-[10px] text-muted-foreground">System Guide</span>
                                    </div>
                                    <h4 className="font-semibold text-sm text-foreground leading-snug">
                                      Cognitive Peptides: Nootropic Mechanisms, BDNF Pathways, and Neuromodulatory Research Compounds
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      How Semax, Selank, Dihexa, DSIP, and PT-141 work across the cognitive and neuro-modulatory axis.
                                    </p>
                                  </div>
                                  <ArrowRight className="h-4 w-4 flex-shrink-0" style={{ color: "#f97316" }} />
                                </div>
                              </Card>
                            </Link>
                          </div>
                        )}

                        {/* Related Research Stacks */}
                        {article.slug && SLUG_TO_PEPTIDE_NAMES[article.slug] && (
                          <div className="mt-8 pt-8 border-t border-border/50">
                            <RelatedStacks peptideNames={SLUG_TO_PEPTIDE_NAMES[article.slug]} />
                          </div>
                        )}

                        {/* Growth Hormone System Guide cross-link */}
                        {article.slug && [
                          "what-is-cjc-1295-peptide",
                          "what-is-ipamorelin-peptide",
                          "what-is-tesamorelin-peptide",
                          "what-is-igf-1-lr3-peptide",
                          "what-is-igf-des-peptide",
                        ].includes(article.slug) && (
                          <div className="mt-8 pt-8 border-t border-border/50" data-testid="article-gh-system-guide-link">
                            <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-2">
                              <Activity className="h-5 w-5 text-[#f59e0b]" />
                              See Also
                            </h3>
                            <p className="text-xs text-muted-foreground mb-4">
                              Understand how this compound fits into the broader Growth Hormone system.
                            </p>
                            <Link href="/systems/growth">
                              <Card
                                className="p-4 cursor-pointer hover-elevate transition-all"
                                style={{ borderColor: "rgba(245,158,11,0.25)" }}
                                data-testid="card-gh-system-guide"
                              >
                                <div className="flex items-center gap-4">
                                  <div
                                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: "rgba(245,158,11,0.12)" }}
                                  >
                                    <BookOpen className="h-5 w-5" style={{ color: "#f59e0b" }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                      <Badge
                                        className="text-[10px] border"
                                        style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#f59e0b", borderColor: "rgba(245,158,11,0.35)" }}
                                      >
                                        Growth Hormone
                                      </Badge>
                                      <span className="text-[10px] text-muted-foreground">24 min read</span>
                                    </div>
                                    <h4 className="font-semibold text-sm text-foreground leading-snug">
                                      Growth Hormone Peptides: GHRH/GHRP Axis, GH Secretagogue Mechanisms, and the GH → IGF-1 Cascade
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      How CJC-1295, Ipamorelin, Tesamorelin, IGF-1 LR3, and IGF-DES work together across the full GH axis.
                                    </p>
                                  </div>
                                  <ArrowRight className="h-4 w-4 flex-shrink-0" style={{ color: "#f59e0b" }} />
                                </div>
                              </Card>
                            </Link>
                          </div>
                        )}

                        {/* Explore this system footer */}
                        {articleSystemHub && (
                          <div className="mt-8 pt-6 border-t border-border/50" data-testid="section-explore-system">
                            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-5" />
                            <Link href={`/systems/${articleSystemHub.slug}`} data-testid="link-explore-system">
                              <div
                                className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                style={{ borderColor: `${articleSystemHub.color}33`, background: `${articleSystemHub.color}08` }}
                              >
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mb-0.5">Part of the</p>
                                  <p className="font-display font-semibold text-base" style={{ color: articleSystemHub.color }} data-testid="text-system-name">
                                    {articleSystemHub.name} system
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-0.5">
                                    Explore more compounds, stacks, and research in this category
                                  </p>
                                </div>
                                <ArrowRight className="h-5 w-5 flex-shrink-0 ml-4" style={{ color: articleSystemHub.color }} />
                              </div>
                            </Link>
                          </div>
                        )}

                      </div>
                    </Card>
                  );
                })()}
              </div>
            ) : (
              <div>
                {/* Peptide Research Guides Tab */}
                {activeTab === "peptides" ? (
                  <div>
                    {/* Search + Sort Row */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search peptide guides..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          data-testid="input-search-articles"
                          className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#ec4899] focus:ring-1 focus:ring-[#ec4899]/30 transition-all text-sm"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            data-testid="button-clear-search"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <Select value={peptideSort} onValueChange={(v) => setPeptideSort(v as SortOption)}>
                        <SelectTrigger className="w-[120px] h-[42px] text-xs" data-testid="select-peptide-sort">
                          <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a-z"><SortAsc className="h-3 w-3 inline mr-1" /> A-Z</SelectItem>
                          <SelectItem value="z-a"><SortDesc className="h-3 w-3 inline mr-1" /> Z-A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                      {peptideGroups.map((group) => {
                        const isActive = peptideGroupFilter === group.id;
                        return (
                          <button
                            key={group.id}
                            onClick={() => setPeptideGroupFilter(group.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                              isActive 
                                ? 'shadow-sm' 
                                : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
                            }`}
                            style={{
                              borderColor: isActive ? `${group.color}60` : undefined,
                              backgroundColor: isActive ? `${group.color}15` : undefined,
                              color: isActive ? group.color : undefined,
                            }}
                            data-testid={`button-category-${group.id}`}
                          >
                            <div 
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: group.color }}
                            />
                            {group.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* System / Deep-Dive Guides section */}
                    <div className="mb-6">
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5" />
                        System Guides
                      </h2>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {SYSTEM_GUIDES.map((guide) => (
                          <Link key={guide.slug} href={guide.href}>
                            <Card
                              className="p-4 cursor-pointer hover:bg-muted/30 transition-all group h-full"
                              style={{ borderColor: `${guide.color}25` }}
                              data-testid={`card-system-guide-${guide.slug}`}
                            >
                              <div className="flex flex-col gap-2 h-full">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-medium text-sm group-hover:text-foreground transition-colors line-clamp-2">
                                    {guide.title}
                                  </h4>
                                  <ChevronRight
                                    className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 mt-0.5"
                                    style={{ color: guide.color }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                                  {guide.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="outline"
                                    className="text-xs"
                                    style={{ borderColor: `${guide.color}50`, color: guide.color }}
                                  >
                                    {guide.badgeLabel}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    {guide.readTime} min
                                  </span>
                                </div>
                              </div>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <Separator className="mb-5 opacity-30" />

                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                      <p className="text-sm text-muted-foreground">
                        {filteredArticles.length} research guide{filteredArticles.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Body System Overview Guides — shown inline above articles for the matching group */}
                    {(() => {
                      const visibleSystemGuides = BODY_SYSTEM_GUIDES.filter(
                        (g) =>
                          peptideGroupFilter === "all" ||
                          g.group === peptideGroupFilter
                      );
                      if (visibleSystemGuides.length === 0) return null;
                      const groupLabel = peptideGroups.find(g => g.id === peptideGroupFilter)?.label;
                      return (
                        <div className="mb-5">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            <Compass className="h-3.5 w-3.5" />
                            {groupLabel ? `${groupLabel} Overview` : "Body System Overviews"}
                          </h3>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {visibleSystemGuides.map((guide) => {
                              const Icon = guide.icon;
                              const guideGroupLabel = peptideGroups.find(g => g.id === guide.group)?.label || guide.group;
                              return (
                                <Link key={guide.slug} href={guide.href}>
                                  <Card
                                    className="p-4 cursor-pointer hover:bg-muted/30 transition-all group h-full"
                                    style={{ borderColor: `${guide.color}25` }}
                                    data-testid={`card-body-system-guide-${guide.slug}`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div
                                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: `${guide.color}20` }}
                                      >
                                        <Icon className="h-4 w-4" style={{ color: guide.color }} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                          <h4 className="font-medium text-sm group-hover:text-foreground transition-colors line-clamp-2">
                                            {guide.title}
                                          </h4>
                                          <ChevronRight
                                            className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5"
                                            style={{ color: guide.color }}
                                          />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                          {guide.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                            style={{ borderColor: `${guide.color}50`, color: guide.color }}
                                          >
                                            {guideGroupLabel}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground ml-auto">
                                            {guide.readTime} min
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                      <div className="grid gap-3 sm:grid-cols-2">
                        {filteredArticles.length > 0 ? (
                          filteredArticles.map((article) => {
                            const groupColor = peptideGroups.find(g => g.id === getPeptideGroup(article.slug || ""))?.color || "#ec4899";
                            return (
                              <Card
                                key={article.id}
                                className="p-4 cursor-pointer hover:bg-muted/30 transition-all group"
                                style={{ borderColor: `${groupColor}20` }}
                                onClick={() => handleOpenArticle(article.id)}
                                data-testid={`card-article-${article.slug || article.id}`}
                              >
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-medium text-sm group-hover:text-foreground transition-colors line-clamp-2">
                                      {article.title}
                                    </h4>
                                    <ChevronRight 
                                      className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 mt-0.5" 
                                      style={{ color: groupColor }}
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {article.summary}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs"
                                      style={{ borderColor: `${groupColor}50`, color: groupColor }}
                                    >
                                      {peptideGroups.find(g => g.id === getPeptideGroup(article.slug || ""))?.label || "Other"}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground ml-auto">
                                      {article.readTimeMinutes} min
                                    </span>
                                  </div>
                                </div>
                              </Card>
                            );
                          })
                        ) : (
                          <Card className="p-8 text-center border-dashed border-2 col-span-2">
                            <FlaskConical className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                            <h3 className="font-display text-lg font-bold mb-1">No Guides Yet</h3>
                            <p className="text-sm text-muted-foreground">
                              Research guides for this category are coming soon.
                            </p>
                          </Card>
                        )}
                      </div>
                  </div>
                ) : activeTab === "general" ? (
                  /* General Education Tab */
                  <div>
                    {/* Search Row */}
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search education articles..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          data-testid="input-search-articles"
                          className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#21d8ff] focus:ring-1 focus:ring-[#21d8ff]/30 transition-all text-sm"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            data-testid="button-clear-search"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                      {generalEdCategories.map((cat) => {
                        const isActive = generalEdCategoryFilter === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setGeneralEdCategoryFilter(cat.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                              isActive 
                                ? 'shadow-sm' 
                                : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
                            }`}
                            style={{
                              borderColor: isActive ? `${cat.color}60` : undefined,
                              backgroundColor: isActive ? `${cat.color}15` : undefined,
                              color: isActive ? cat.color : undefined,
                            }}
                            data-testid={`button-category-${cat.id}`}
                          >
                            <div 
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                      <p className="text-sm text-muted-foreground">
                        {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {filteredArticles.length > 0 ? (
                          filteredArticles.map((article) => {
                            const catColor = getCategoryColor(article.category);
                            return (
                              <Card
                                key={article.id}
                                className="p-4 cursor-pointer hover:bg-muted/30 transition-all group"
                                style={{ borderColor: `${catColor}20` }}
                                onClick={() => handleOpenArticle(article.id)}
                                data-testid={`card-article-${article.slug || article.id}`}
                              >
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-medium text-sm group-hover:text-foreground transition-colors line-clamp-2">
                                      {article.title}
                                    </h4>
                                    <ChevronRight 
                                      className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 mt-0.5" 
                                      style={{ color: catColor }}
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {article.summary}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs"
                                      style={{ borderColor: `${catColor}50`, color: catColor }}
                                    >
                                      {getCategoryLabel(article.category)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground ml-auto">
                                      {article.readTimeMinutes} min
                                    </span>
                                  </div>
                                </div>
                              </Card>
                            );
                          })
                        ) : (
                          <div className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 rounded-xl border-muted/30">
                            <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                            <h3 className="font-display text-xl font-bold mb-2">No Articles Yet</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                              Articles for this category are coming soon.
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-6"
                              onClick={handleBackToArticles}
                            >
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              Back to Library
                            </Button>
                          </div>
                        )}
                      </div>
                  </div>
                ) : activeTab === "trust" ? (
                  /* Trust & Verification Tab */
                  <div>
                    <div className="mb-5">
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5" />
                        Trust &amp; Verification Guides
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {TRUST_GUIDES.length} guides — understand COAs, testing, purity, and compliance
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {TRUST_GUIDES.map((guide) => {
                        const Icon = guide.icon;
                        return (
                          <Link key={guide.slug} href={guide.href}>
                            <Card 
                              className="p-5 cursor-pointer hover:bg-muted/30 transition-all group h-full"
                              style={{ borderColor: `${guide.color}20` }}
                              data-testid={`card-guide-${guide.slug}`}
                            >
                              <div className="flex items-start gap-4">
                                <div 
                                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: `${guide.color}20` }}
                                >
                                  <Icon className="h-5 w-5" style={{ color: guide.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold group-hover:text-foreground transition-colors flex items-center gap-2">
                                    {guide.title}
                                    <ChevronRight 
                                      className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" 
                                      style={{ color: guide.color }}
                                    />
                                  </h3>
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {guide.description}
                                  </p>
                                  <span className="text-xs text-muted-foreground mt-2 block">
                                    {guide.readTime} min read
                                  </span>
                                </div>
                              </div>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Lab Guides Tab */
                  <div>
                    {/* Search Bar */}
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search lab guides..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          data-testid="input-search-articles"
                          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                      <p className="text-sm text-muted-foreground">
                        {filteredArticles.length} guide{filteredArticles.length !== 1 ? 's' : ''} available
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {filteredArticles.length > 0 ? (
                        filteredArticles.map((article) => {
                          const catColor = getCategoryColor(article.category);
                          return (
                            <Card
                              key={article.id}
                              className="p-4 cursor-pointer hover:bg-muted/30 transition-all group"
                              style={{ borderColor: `${catColor}20` }}
                              onClick={() => handleOpenArticle(article.id)}
                              data-testid={`card-article-${article.slug || article.id}`}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium group-hover:text-foreground transition-colors">
                                    {article.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                    {article.summary}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <span className="text-xs text-muted-foreground">
                                    {article.readTimeMinutes} min
                                  </span>
                                  <ChevronRight 
                                    className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" 
                                    style={{ color: catColor }}
                                  />
                                </div>
                              </div>
                            </Card>
                          );
                        })
                      ) : (
                          <div className="p-12 text-center border-dashed border-2 rounded-xl border-muted/30">
                          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                          <h3 className="font-display text-xl font-bold mb-2">No Guides Yet</h3>
                          <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                            Lab guides are coming soon.
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleBackToArticles}
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Library
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </Tabs>
        </motion.div>
      </div>
    </main>
  );
}
