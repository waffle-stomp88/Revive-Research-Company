import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ImageLoader } from "@/components/image-loader";
import { QuickViewModal } from "@/components/quick-view-modal";
import { CompareBar } from "@/components/comparison-tool";
import { RecentlyViewed } from "@/components/recently-viewed";
import { EarlyAccessModal } from "@/components/early-access-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowRight, 
  FlaskConical, 
  Search, 
  X, 
  SlidersHorizontal,
  Flame,
  Package,
  Sparkles,
  Boxes,
  TrendingDown,
  Mail,
  CheckCircle2,
  Grid3X3,
  Grid2X2,
  LayoutGrid,
  Tag,
  ChevronDown,
  ChevronRight,
  Filter,
  PanelLeftClose,
  PanelLeft,
  TrendingUp,
  AlertTriangle,
  Eye,
  Scale
} from "lucide-react";
import { isInCompare, addToCompare, removeFromCompare } from "@/components/comparison-tool";
import type { Product } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";
import { BUNDLES } from "@/lib/bundles";
import { SEOHead } from "@/components/seo-head";

// Badge priority system - max 2 badges per product
// Priority: Out of Stock > Low Stock > Sale > Selling Fast > Featured
type BadgeType = "out-of-stock" | "low-stock" | "sale" | "selling-fast" | "featured";

interface ProductBadge {
  type: BadgeType;
  label: string;
  className: string;
  icon?: typeof Flame;
}

const LOW_STOCK_THRESHOLD = 20;

function getProductBadges(
  product: Product, 
  sellingFastIds: string[]
): ProductBadge[] {
  const badges: ProductBadge[] = [];
  
  // Priority 1: Out of Stock (highest priority) - ONLY show this badge when out of stock
  if (!product.inStock || (product.stockAmount !== null && product.stockAmount <= 0)) {
    badges.push({
      type: "out-of-stock",
      label: "OUT OF STOCK",
      className: "bg-destructive text-destructive-foreground font-bold"
    });
    // Return early - don't show any other badges when out of stock
    return badges;
  }
  
  // Priority 2: Low Stock
  if (product.inStock && product.stockAmount !== null && product.stockAmount > 0 && product.stockAmount <= LOW_STOCK_THRESHOLD) {
    badges.push({
      type: "low-stock",
      label: `Only ${product.stockAmount} left`,
      className: "bg-orange-500 text-white",
      icon: AlertTriangle
    });
  }
  
  // Priority 3: Sale
  if (product.originalPrice) {
    badges.push({
      type: "sale",
      label: "SALE",
      className: "bg-red-600 text-white font-bold animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]"
    });
  }
  
  // Priority 4: Selling Fast
  if (sellingFastIds.includes(product.id) && product.inStock) {
    badges.push({
      type: "selling-fast",
      label: "Selling Fast",
      className: "bg-[#E7FB10] text-black font-semibold",
      icon: TrendingUp
    });
  }
  
  // Priority 5: Featured (lowest priority)
  if (product.featured) {
    badges.push({
      type: "featured",
      label: "Featured",
      className: "bg-[#21d8ff] text-black font-semibold"
    });
  }
  
  // Return max 2 badges based on priority order
  return badges.slice(0, 2);
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "featured";

const SALE_OF_THE_WEEK = {
  title: "Sale of the Week",
  subtitle: "Limited time offer - Don't miss out!",
  productName: "Retatrutide",
  discount: "17% OFF",
  badge: "HOT DEAL",
  description: "Triple receptor agonist for advanced metabolic research. Our most sought-after compound at an unbeatable price.",
  endDate: "Ends Sunday",
};

const CATEGORIES = [
  { id: "all", name: "All Peptides", icon: Grid3X3 },
  { id: "peptides", name: "Research Peptides", icon: FlaskConical },
  { id: "research-compounds", name: "Research Compounds", icon: FlaskConical },
];

const peptideGroups = [
  { id: "all", label: "All Peptides", color: "#ec4899" },
  { id: "metabolic", label: "Metabolic / GLP-1", color: "#E7FB10", names: ["retatrutide", "cagrilintide", "mazdutide", "survodutide", "aod-9604", "5-amino-1mq", "aicar", "slu-pp-322", "l-carnitine", "lipo-c", "adipotide"] },
  { id: "growth-hormone", label: "Growth Hormone", color: "#21d8ff", names: ["cjc-1295", "ipamorelin", "tesamorelin", "igf-1 lr3", "igf-des", "ghrp-2", "ghrp-6", "hexarelin", "sermorelin", "mgf", "peg-mgf", "ace-031"] },
  { id: "tissue-repair", label: "Tissue Repair", color: "#22c55e", names: ["bpc-157", "tb-500", "ll-37", "ara-290", "klow"] },
  { id: "skin-regeneration", label: "Skin & Regeneration", color: "#ec4899", names: ["ghk-cu", "glow", "snap-8", "hyaluronic", "melanotan"] },
  { id: "longevity", label: "Longevity & Cellular", color: "#9d4edd", names: ["epithalon", "mots-c", "nad+", "foxo4-dri", "ss-31", "glutathione", "pnc-27"] },
  { id: "cognitive", label: "Cognitive / Neuro", color: "#f97316", names: ["semax", "selank", "dsip", "cerebrolysin", "pinealon", "melatonin", "botulinum"] },
  { id: "hormonal", label: "Hormonal", color: "#a855f7", names: ["hcg", "hmg", "gonadorelin", "oxytocin", "kisspeptin", "pt-141", "triptorelin", "alprostadil"] },
  { id: "immune", label: "Immune / Thymic", color: "#14b8a6", names: ["thymosin alpha-1", "thymalin", "vip", "kpv"] },
];

const getPeptideGroup = (productName: string): { id: string; label: string; color: string } | null => {
  const lowerName = productName.toLowerCase();
  for (const group of peptideGroups) {
    if (group.names?.some(n => lowerName.includes(n))) {
      return { id: group.id, label: group.label, color: group.color };
    }
  }
  return null;
};

type ShopSection = "deals" | "bundles" | "products" | "bulk";

const PRODUCTS_STATE_KEY = 'products_page_state';

interface ProductsPageState {
  searchQuery: string;
  sortBy: SortOption;
  stockFilter: "all" | "in-stock" | "out-of-stock";
  selectedCategory: string;
  peptideGroupFilter: string;
  priceRange: [number, number];
  scrollY: number;
}

export default function Products() {
  // Restore state from sessionStorage if available (using useState so we can clear it)
  const [savedState, setSavedState] = useState<ProductsPageState | null>(() => {
    try {
      const stored = sessionStorage.getItem(PRODUCTS_STATE_KEY);
      if (stored) {
        return JSON.parse(stored) as ProductsPageState;
      }
    } catch {}
    return null;
  });

  const [searchQuery, setSearchQuery] = useState(savedState?.searchQuery ?? "");
  const [sortBy, setSortBy] = useState<SortOption>(savedState?.sortBy ?? "featured");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "out-of-stock">(savedState?.stockFilter ?? "in-stock");
  const [activeSection, setActiveSection] = useState<ShopSection>("deals");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(savedState?.selectedCategory ?? "all");
  const [peptideGroupFilter, setPeptideGroupFilter] = useState<string>(savedState?.peptideGroupFilter ?? "all");
  const [priceRange, setPriceRange] = useState<[number, number]>(savedState?.priceRange ?? [0, 300]);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [peptideGroupsExpanded, setPeptideGroupsExpanded] = useState(true);
  const [stateRestored, setStateRestored] = useState(false);
  
  // Collapsible section states
  const [dealsOpen, setDealsOpen] = useState(true);
  const [productsOpen, setProductsOpen] = useState(true);
  const [bundlesOpen, setBundlesOpen] = useState(true);
  const [bulkOpen, setBulkOpen] = useState(true);
  
  // Quick view modal state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Mobile filter sheet state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // Display controls state - items per page and grid columns
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4>(3);

  // Weekly Deal dismiss state with localStorage
  const [weeklyDealDismissed, setWeeklyDealDismissed] = useState(() => {
    try {
      const stored = localStorage.getItem("weekly-deal-dismissed");
      return stored === "true";
    } catch {
      return false;
    }
  });

  const dismissWeeklyDeal = () => {
    setWeeklyDealDismissed(true);
    localStorage.setItem("weekly-deal-dismissed", "true");
  };

  const undismissWeeklyDeal = () => {
    setWeeklyDealDismissed(false);
    localStorage.removeItem("weekly-deal-dismissed");
  };

  const dealsRef = useRef<HTMLDivElement>(null);
  const bundlesRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const bulkRef = useRef<HTMLDivElement>(null);

  // Restore scroll position after component mounts and clear saved state
  useEffect(() => {
    if (savedState && !stateRestored) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (savedState.scrollY > 0) {
          window.scrollTo(0, savedState.scrollY);
        }
        setStateRestored(true);
        // Clear both sessionStorage and the in-memory state
        sessionStorage.removeItem(PRODUCTS_STATE_KEY);
        setSavedState(null);
      });
    }
  }, [savedState, stateRestored]);

  // Function to save current state before navigating to a product
  const savePageState = () => {
    const state: ProductsPageState = {
      searchQuery,
      sortBy,
      stockFilter,
      selectedCategory,
      peptideGroupFilter,
      priceRange,
      scrollY: window.scrollY,
    };
    sessionStorage.setItem(PRODUCTS_STATE_KEY, JSON.stringify(state));
  };

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Query for selling fast products (5+ orders in last 7 days)
  const { data: sellingFastIds = [] } = useQuery<string[]>({
    queryKey: ["/api/products/selling-fast"],
  });

  const scrollToSection = (section: ShopSection) => {
    setActiveSection(section);
    const refs: Record<ShopSection, React.RefObject<HTMLDivElement>> = {
      deals: dealsRef,
      bundles: bundlesRef,
      products: productsRef,
      bulk: bulkRef,
    };
    refs[section].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const sectionRefs: { section: ShopSection; ref: React.RefObject<HTMLDivElement> }[] = [
      { section: "deals", ref: dealsRef },
      { section: "bundles", ref: bundlesRef },
      { section: "products", ref: productsRef },
      { section: "bulk", ref: bulkRef },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionData = sectionRefs.find(s => s.ref.current === entry.target);
            if (sectionData) {
              setActiveSection(sectionData.section);
            }
          }
        });
      },
      {
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0,
      }
    );

    sectionRefs.forEach(({ ref }) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const saleProduct = useMemo(() => {
    if (!products) return null;
    return products.find(p => p.isWeeklyDeal && p.inStock);
  }, [products]);

  // Calculate price stats only from displayed products (excluding Research Stacks)
  const priceStats = useMemo(() => {
    if (!products || products.length === 0) return { min: 0, max: 300 };
    const excludedCategories = ["Research Stacks"];
    const displayedProducts = products.filter(p => !excludedCategories.includes(p.category));
    if (displayedProducts.length === 0) return { min: 0, max: 300 };
    const prices = displayedProducts.map(p => Number(p.price));
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  useEffect(() => {
    // Only reset price range if we don't have a saved state (avoids overwriting restored filter)
    if (products && products.length > 0 && !savedState?.priceRange) {
      const excludedCategories = ["Research Stacks"];
      const displayedProducts = products.filter(p => !excludedCategories.includes(p.category));
      if (displayedProducts.length === 0) return;
      const prices = displayedProducts.map(p => Number(p.price));
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setPriceRange([min, max]);
    }
  }, [products, savedState]);

  const categoryStats = useMemo(() => {
    if (!products) return {};
    const excludedCategories = ["Research Stacks"];
    const displayedProducts = products.filter(p => !excludedCategories.includes(p.category));
    const counts: Record<string, number> = { all: displayedProducts.length };
    displayedProducts.forEach(p => {
      const cat = p.category.toLowerCase().replace(/\s+/g, "-");
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter((product) => {
      // Exclude Research Stacks from this page (they have their own page)
      const excludedCategories = ["Research Stacks"];
      if (excludedCategories.includes(product.category)) {
        return false;
      }

      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && product.inStock) ||
        (stockFilter === "out-of-stock" && !product.inStock);

      const matchesCategory =
        selectedCategory === "all" ||
        product.category.toLowerCase().replace(/\s+/g, "-") === selectedCategory;

      const peptideGroup = getPeptideGroup(product.name);
      const matchesPeptideGroup =
        peptideGroupFilter === "all" ||
        (peptideGroup?.id === peptideGroupFilter);

      const productPrice = Number(product.price);
      const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1];

      return matchesSearch && matchesStock && matchesCategory && matchesPeptideGroup && matchesPrice;
    });

    switch (sortBy) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "featured":
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return filtered;
  }, [products, searchQuery, sortBy, stockFilter, selectedCategory, peptideGroupFilter, priceRange]);

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("featured");
    setStockFilter("in-stock");
    setSelectedCategory("all");
    setPeptideGroupFilter("all");
    setPriceRange([priceStats.min, priceStats.max]);
  };

  const hasActiveFilters = searchQuery !== "" || sortBy !== "featured" || stockFilter !== "in-stock" || selectedCategory !== "all" || peptideGroupFilter !== "all" || priceRange[0] !== priceStats.min || priceRange[1] !== priceStats.max;

  const uniqueCategories = useMemo(() => {
    if (!products) return [];
    const excludedCategories = ["Research Stacks"];
    const displayedProducts = products.filter(p => !excludedCategories.includes(p.category));
    const cats = new Set(displayedProducts.map(p => p.category));
    return Array.from(cats).map(cat => ({
      id: cat.toLowerCase().replace(/\s+/g, "-"),
      name: cat,
      count: displayedProducts.filter(p => p.category === cat).length
    }));
  }, [products]);

  // Peptide group counts for badges (excluding Research Stacks)
  const peptideGroupCounts = useMemo(() => {
    if (!products) return {};
    const excludedCategories = ["Research Stacks"];
    const displayedProducts = products.filter(p => !excludedCategories.includes(p.category));
    const counts: Record<string, number> = { all: displayedProducts.length };
    displayedProducts.forEach(p => {
      const group = getPeptideGroup(p.name);
      if (group) {
        counts[group.id] = (counts[group.id] || 0) + 1;
      }
    });
    return counts;
  }, [products]);


  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead title="Research Peptides Collection" description="Browse our complete catalog of premium research peptides. Third-party lab tested, COA verified. BPC-157, TB-500, Semaglutide & more." canonicalPath="/products" />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-4">Peptides</h1>
          <div className="h-1 w-12 bg-primary rounded-full" />
        </motion.div>

        {/* Full-width Weekly Deal Section */}
        {!weeklyDealDismissed && saleProduct && (
          <motion.div
            ref={dealsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 -mx-4 md:-mx-8 px-4 md:px-8"
          >
            <Link href={`/peptides/${saleProduct.id}`} onClick={savePageState}>
              <div className="sale-glow-pulse rounded-xl overflow-hidden">
                <Card className="p-3 md:p-6 border-2 border-[#E7FB10]/50 bg-gradient-to-br from-[#E7FB10]/10 via-background to-background transition-all duration-300 cursor-pointer group hover:scale-[1.01] md:hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(231,251,16,0.3)] hover:border-[#E7FB10] relative overflow-hidden rounded-xl no-default-hover-elevate">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#E7FB10]/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                  {/* Dismiss button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dismissWeeklyDeal();
                    }}
                    className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded transition-colors z-20"
                    data-testid="button-dismiss-weekly-deal"
                    aria-label="Hide deal"
                  >
                    <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  </button>

                  {/* Mobile: Compact horizontal layout */}
                  <div className="md:hidden flex items-center gap-3 pr-8">
                    <div className="w-16 h-16 bg-muted/50 rounded-lg overflow-hidden flex-shrink-0 border border-red-500/20">
                      <img 
                        src={saleProduct.imageUrl || productImage} 
                        alt={`${saleProduct.name}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Flame className="h-4 w-4 text-red-500" />
                        <span className="font-display text-xs font-bold text-red-400">WEEKLY DEAL</span>
                        {saleProduct.originalPrice && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0">
                            {Math.round(((Number(saleProduct.originalPrice) - Number(saleProduct.price)) / Number(saleProduct.originalPrice)) * 100)}% OFF
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-display text-base font-bold text-[#E7FB10] truncate">
                        {saleProduct.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-display text-lg font-bold">${Number(saleProduct.price).toFixed(2)}</span>
                        <Button size="sm" className="h-7 text-xs gap-1 ml-auto">
                          Shop <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop: Full layout */}
                  <div className="hidden md:flex flex-row gap-12 items-center">
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="p-4 rounded-full bg-[#E7FB10]/10 border border-[#E7FB10]/20">
                        <Flame className="h-8 w-8 text-[#E7FB10]" />
                      </div>
                      <div>
                        <span className="font-display text-xs font-bold text-primary tracking-widest uppercase">Special Offer</span>
                        <Badge className="mt-1 bg-primary text-black hover:bg-primary/90">
                          {SALE_OF_THE_WEEK.badge}
                        </Badge>
                      </div>
                    </div>

                    <div className="w-56 h-56 bg-muted/20 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 shadow-inner">
                      <img 
                        src={saleProduct.imageUrl || productImage} 
                        alt={`${saleProduct.name} research peptide - premium quality lab tested compound`}
                        className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-1000 ease-out"
                      />
                    </div>
                    <div className="flex-1 text-left space-y-6">
                      <div className="flex flex-wrap items-center gap-4">
                        {saleProduct.originalPrice && (
                          <Badge variant="destructive" className="text-xl px-4 py-1.5 font-bold tracking-tight rounded-lg">
                            {Math.round(((Number(saleProduct.originalPrice) - Number(saleProduct.price)) / Number(saleProduct.originalPrice)) * 100)}% OFF
                          </Badge>
                        )}
                        <h3 className="font-display text-5xl font-bold text-foreground tracking-tight">
                          {saleProduct.name}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl line-clamp-2">
                        {saleProduct.description || SALE_OF_THE_WEEK.description}
                      </p>
                      <div className="flex items-center gap-10 pt-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Research Price</span>
                          <div className="flex items-baseline gap-3">
                            <span className="font-display text-4xl font-bold text-primary">${Number(saleProduct.price).toFixed(2)}</span>
                            {saleProduct.originalPrice && (
                              <span className="text-muted-foreground line-through text-xl">${Number(saleProduct.originalPrice).toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                        <Button size="lg" className="h-16 px-10 text-xl font-bold gap-3 hover-elevate active-elevate-2 bg-primary text-black hover:bg-primary/90 transition-all rounded-xl border-none">
                          Acquire Compound <ArrowRight className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Filters and Search Bar */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-start lg:items-center justify-between sticky top-20 z-40 bg-background/80 backdrop-blur-xl py-4 -mx-4 px-4 border-y border-white/5">
          <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <Button
              variant={sidebarOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex gap-2 rounded-full px-6"
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
              {sidebarOpen ? "Hide Filters" : "Show Filters"}
            </Button>
            
            <div className="relative flex-1 lg:min-w-[400px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search compounds by name or sequence..."
                className="pl-12 h-12 bg-muted/30 border-white/5 rounded-full focus-visible:ring-primary/20 focus-visible:border-primary/50 text-lg transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-products"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[180px] h-12 bg-muted/30 border-white/5 rounded-full px-6">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Most Relevant</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Alphabetical (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Alphabetical (Z-A)</SelectItem>
                </SelectContent>
              </Select>

              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden h-12 w-12 rounded-full border-white/5 bg-muted/30">
                    <SlidersHorizontal className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background border-white/10">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="font-display text-2xl font-bold">Refine Research</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-8 pr-2">
                    {/* Replicate Sidebar Content for Mobile */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-muted-foreground tracking-widest uppercase">Stock Status</h3>
                      <div className="flex flex-wrap gap-2">
                        {["all", "in-stock", "out-of-stock"].map((status) => (
                          <Button
                            key={status}
                            variant={stockFilter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStockFilter(status as any)}
                            className="capitalize rounded-full px-4"
                          >
                            {status.replace("-", " ")}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="aspect-[4/5] bg-muted/30 animate-pulse rounded-2xl border-white/5" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-white/10">
                <p className="text-muted-foreground text-lg mb-4">Error loading research compounds.</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full px-8">Try Again</Button>
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-white/10 space-y-4">
                <FlaskConical className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                <h3 className="font-display text-2xl font-bold">No results found</h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  We couldn't find any compounds matching your current research criteria. Try adjusting your filters.
                </p>
                <Button onClick={clearFilters} variant="secondary" className="rounded-full px-8 mt-4">Reset All Filters</Button>
              </div>
            ) : (
              <motion.div
                layout
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {filteredAndSortedProducts.map((product) => (
                    <motion.div
                      layout
                      key={product.id}
                      variants={fadeInUp}
                      className="group"
                    >
                      <Link href={`/peptides/${product.id}`} onClick={savePageState}>
                        <Card className="h-full bg-muted/5 border-white/5 hover:border-primary/20 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col rounded-3xl group/card hover:bg-muted/10 hover-elevate">
                          <div className="relative aspect-[4/5] overflow-hidden bg-muted/20">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 group-hover/card:to-black/40 transition-colors" />
                            <ImageLoader
                              src={product.imageUrl || productImage}
                              alt={product.name}
                              className="w-full h-full object-contain p-8 group-hover/card:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                              {getProductBadges(product, sellingFastIds).map((badge) => (
                                <Badge key={badge.type} className={`rounded-full px-3 py-1 font-bold tracking-tight shadow-lg border-none ${badge.className}`}>
                                  {badge.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="p-8 flex flex-col flex-1 space-y-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-[10px] uppercase tracking-widest bg-white/5 text-muted-foreground border-none">
                                  {product.category}
                                </Badge>
                                {getPeptideGroup(product.name) && (
                                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: getPeptideGroup(product.name)?.color }} />
                                )}
                              </div>
                              <h3 className="font-display text-2xl font-bold group-hover/card:text-primary transition-colors tracking-tight">
                                {product.name}
                              </h3>
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                              {product.description}
                            </p>
                            <div className="pt-4 mt-auto flex items-end justify-between border-t border-white/5">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Starting from</span>
                                <span className="font-display text-3xl font-bold text-foreground">
                                  ${Number(product.price).toFixed(2)}
                                </span>
                              </div>
                              <div className="h-12 w-12 rounded-full bg-foreground text-background flex items-center justify-center group-hover/card:bg-primary group-hover/card:text-black transition-all duration-300">
                                <ArrowRight className="h-6 w-6" />
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <QuickViewModal 
        product={quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
    </main>
  );
}
