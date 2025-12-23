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
  { id: "metabolic", label: "Metabolic / GLP-1", color: "#E7FB10", names: ["retatrutide", "cagrilintide", "mazdutide", "survodutide", "aod-9604", "5-amino-1mq", "aicar", "slu-pp-322", "l-carnitine", "lipo-c"] },
  { id: "growth-hormone", label: "Growth Hormone", color: "#21d8ff", names: ["cjc-1295", "ipamorelin", "tesamorelin", "igf-1 lr3", "igf-des", "ghrp-2", "ghrp-6", "hexarelin", "sermorelin", "mgf", "peg-mgf"] },
  { id: "tissue-repair", label: "Tissue Repair", color: "#22c55e", names: ["bpc-157", "tb-500", "ll-37", "ara-290", "klow"] },
  { id: "skin-regeneration", label: "Skin & Regeneration", color: "#ec4899", names: ["ghk-cu", "glow", "snap-8", "hyaluronic"] },
  { id: "longevity", label: "Longevity & Cellular", color: "#9d4edd", names: ["epithalon", "mots-c", "nad+", "foxo4-dri", "ss-31", "glutathione"] },
  { id: "cognitive", label: "Cognitive / Neuro", color: "#f97316", names: ["semax", "selank", "dsip", "cerebrolysin", "pinealon", "melatonin"] },
  { id: "hormonal", label: "Hormonal", color: "#a855f7", names: ["hcg", "hmg", "gonadorelin", "oxytocin", "kisspeptin", "pt-141", "triptorelin", "alprostadil"] },
  { id: "immune", label: "Immune / Thymic", color: "#14b8a6", names: ["thymosin alpha-1", "thymalin", "vip", "kpv"] },
  { id: "specialty", label: "Specialty", color: "#64748b", names: ["melanotan", "pnc-27", "adipotide", "ace-031", "botulinum"] },
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

function ProductsComponent() {
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
  const [sortBy, setSortBy] = useState<SortOption>(savedState?.sortBy ?? "name-asc");
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Peptides</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Premium research compounds, curated bundles, and volume pricing for your laboratory needs.
          </p>
        </motion.div>

        {/* Main Layout with Sidebar */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden lg:block flex-shrink-0"
              >
                <div className="sticky top-28 max-h-[calc(100vh-120px)] overflow-y-auto space-y-6 pr-2 sidebar-scroll">
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">Filters</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSidebarOpen(false)}
                      className="h-8 w-8"
                      data-testid="button-hide-sidebar"
                    >
                      <PanelLeftClose className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Search in Sidebar */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-8"
                        data-testid="input-sidebar-search"
                      />
                      {searchQuery ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                          onClick={() => setSearchQuery("")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Filter by Price</label>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      min={priceStats.min}
                      max={priceStats.max}
                      step={5}
                      className="mt-2"
                      data-testid="slider-price-range"
                    />
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <div className="border rounded-md px-3 py-2 text-sm bg-muted/30">
                          <span className="text-muted-foreground text-xs block">Min</span>
                          <span className="font-medium">${priceRange[0]}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="border rounded-md px-3 py-2 text-sm bg-muted/30">
                          <span className="text-muted-foreground text-xs block">Max</span>
                          <span className="font-medium">${priceRange[1]}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Peptide Groups */}
                  <Collapsible open={peptideGroupsExpanded} onOpenChange={setPeptideGroupsExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between px-0 h-8 hover:bg-transparent">
                        <span className="text-sm font-medium">Peptide Groups</span>
                        {peptideGroupsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 pt-2">
                      {peptideGroups.map((group) => {
                        const count = products?.filter(p => {
                          const pg = getPeptideGroup(p.name);
                          return pg?.id === group.id;
                        }).length || 0;
                        return (
                          <Button
                            key={group.id}
                            variant={peptideGroupFilter === group.id ? "secondary" : "ghost"}
                            className="w-full justify-between h-8 text-sm"
                            onClick={() => setPeptideGroupFilter(group.id)}
                            data-testid={`filter-peptide-group-${group.id}`}
                          >
                            <span className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: group.color }}
                              />
                              {group.label}
                            </span>
                            <span className="text-muted-foreground">{count}</span>
                          </Button>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Stock Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Availability</label>
                    <div className="space-y-1">
                      {[
                        { value: "all", label: "All" },
                        { value: "in-stock", label: "In Stock" },
                        { value: "out-of-stock", label: "Out of Stock" },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant={stockFilter === option.value ? "secondary" : "ghost"}
                          className="w-full justify-start h-8 text-sm"
                          onClick={() => setStockFilter(option.value as typeof stockFilter)}
                          data-testid={`filter-stock-${option.value}`}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={clearFilters}
                      data-testid="button-clear-all-filters"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter Toggle + Show Sidebar Button */}
            <div className="flex items-center gap-3 mb-6">
              {!sidebarOpen && (
                <Button
                  variant="outline"
                  onClick={() => setSidebarOpen(true)}
                  className="hidden lg:flex gap-2"
                  data-testid="button-show-sidebar"
                >
                  <PanelLeft className="h-4 w-4" />
                  Show Filters
                </Button>
              )}
              
              {/* Mobile Filter Button - opens Sheet */}
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="lg:hidden gap-2"
                    data-testid="button-mobile-filters"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                        Active
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filters
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Search */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search</label>
                      <div className="relative">
                        <Input
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pr-8"
                          data-testid="input-mobile-sheet-search"
                        />
                        {searchQuery ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                            onClick={() => setSearchQuery("")}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Sort */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sort By</label>
                      <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                        <SelectTrigger className="w-full" data-testid="select-mobile-sort">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="featured">Featured</SelectItem>
                          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                          <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                          <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                          <SelectItem value="price-desc">Price (High-Low)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Filter */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium">Price Range</label>
                      <Slider
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        min={priceStats.min}
                        max={priceStats.max}
                        step={5}
                        className="mt-2"
                        data-testid="slider-mobile-price-range"
                      />
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <div className="border rounded-md px-3 py-2 text-sm bg-muted/30">
                            <span className="text-muted-foreground text-xs block">Min</span>
                            <span className="font-medium">${priceRange[0]}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="border rounded-md px-3 py-2 text-sm bg-muted/30">
                            <span className="text-muted-foreground text-xs block">Max</span>
                            <span className="font-medium">${priceRange[1]}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Peptide Groups */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Peptide Groups</label>
                      <div className="space-y-1">
                        {peptideGroups.map((group) => {
                          const count = products?.filter(p => {
                            const pg = getPeptideGroup(p.name);
                            return pg?.id === group.id;
                          }).length || 0;
                          return (
                            <Button
                              key={group.id}
                              variant={peptideGroupFilter === group.id ? "secondary" : "ghost"}
                              className="w-full justify-between h-9 text-sm"
                              onClick={() => setPeptideGroupFilter(group.id)}
                              data-testid={`filter-mobile-peptide-group-${group.id}`}
                            >
                              <span className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: group.color }}
                                />
                                {group.label}
                              </span>
                              <span className="text-muted-foreground">{count}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stock Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Availability</label>
                      <div className="space-y-1">
                        {[
                          { value: "all", label: "All" },
                          { value: "in-stock", label: "In Stock" },
                          { value: "out-of-stock", label: "Out of Stock" },
                        ].map((option) => (
                          <Button
                            key={option.value}
                            variant={stockFilter === option.value ? "secondary" : "ghost"}
                            className="w-full justify-start h-9 text-sm"
                            onClick={() => setStockFilter(option.value as typeof stockFilter)}
                            data-testid={`filter-mobile-stock-${option.value}`}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters & Apply */}
                    <div className="space-y-2 pt-4 border-t">
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={clearFilters}
                          data-testid="button-mobile-clear-filters"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear All Filters
                        </Button>
                      )}
                      <Button
                        className="w-full"
                        onClick={() => setMobileFilterOpen(false)}
                        data-testid="button-mobile-apply-filters"
                      >
                        Show {filteredAndSortedProducts.length} Results
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Desktop Peptide Group Filter with counts */}
              <div className="hidden md:flex flex-1 gap-3 lg:justify-end flex-wrap">
                <Select value={peptideGroupFilter} onValueChange={setPeptideGroupFilter}>
                  <SelectTrigger className="w-[220px]" data-testid="select-peptide-group">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Peptides" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="flex items-center justify-between w-full gap-3">
                        All Peptides
                        <Badge variant="secondary" className="ml-auto text-xs">{peptideGroupCounts.all || 0}</Badge>
                      </span>
                    </SelectItem>
                    {peptideGroups.filter(g => g.id !== "all").map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <span className="flex items-center justify-between w-full gap-3">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
                            {group.label}
                          </span>
                          <Badge variant="secondary" className="ml-auto text-xs">{peptideGroupCounts[group.id] || 0}</Badge>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-[180px]" data-testid="select-sort">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                    <SelectItem value="price-desc">Price (High-Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Weekly Deal Section */}
            <div ref={dealsRef} className="scroll-mt-36">
              {saleProduct && (
                <Collapsible open={dealsOpen} onOpenChange={setDealsOpen} className="mb-12">
                  <CollapsibleTrigger asChild>
                    <div className="cursor-pointer flex items-center gap-3 mb-5">
                      <Flame className="h-6 w-6 text-red-500" />
                      <h2 className="font-display font-bold text-2xl md:text-3xl">Weekly Deal</h2>
                      <Badge variant="destructive" className="animate-pulse">
                        {SALE_OF_THE_WEEK.badge}
                      </Badge>
                      <ChevronDown className={`h-5 w-5 ml-auto transition-transform ${dealsOpen ? "" : "-rotate-90"}`} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="mb-12"
                      data-testid="section-sale-of-week"
                    >
                  <Link href={`/peptides/${saleProduct.id}`} onClick={savePageState}>
                    <div className="sale-glow-pulse rounded-xl">
                    <Card className="p-3 md:p-6 border-2 border-red-500 bg-gradient-to-br from-red-950/40 via-background to-background transition-all duration-300 cursor-pointer group hover:scale-[1.02] md:hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:border-red-400">
                      {/* Mobile: Compact horizontal layout */}
                      <div className="md:hidden flex items-center gap-3">
                        <div className="w-16 h-16 bg-muted/50 rounded-lg overflow-hidden flex-shrink-0 border border-red-500/20">
                          <img 
                            src={saleProduct.imageUrl || productImage} 
                            alt={`${saleProduct.name}`}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
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
                      <div className="hidden md:flex flex-row gap-5 items-center">
                        <div className="w-48 h-48 bg-muted/50 rounded-lg overflow-hidden flex-shrink-0 border border-red-500/20">
                          <img 
                            src={saleProduct.imageUrl || productImage} 
                            alt={`${saleProduct.name} research peptide - premium quality lab tested compound`}
                            className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {saleProduct.originalPrice && (
                              <Badge variant="destructive" className="text-base px-2.5 py-0.5">
                                {Math.round(((Number(saleProduct.originalPrice) - Number(saleProduct.price)) / Number(saleProduct.originalPrice)) * 100)}% OFF
                              </Badge>
                            )}
                            {saleProduct.weeklyDealEndDate && (
                              <span className="text-sm text-muted-foreground">Ends {saleProduct.weeklyDealEndDate}</span>
                            )}
                          </div>
                          <h3 className="font-display text-3xl font-bold text-[#E7FB10] mb-2">
                            {saleProduct.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 max-w-lg">
                            {saleProduct.shortDescription}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="font-display text-3xl font-bold">${Number(saleProduct.price).toFixed(2)}</span>
                            {saleProduct.originalPrice && (
                              <span className="text-lg text-muted-foreground line-through">
                                ${Number(saleProduct.originalPrice).toFixed(2)}
                              </span>
                            )}
                            <Button className="ml-2 gap-2">
                              Shop Now <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                    </div>
                    </Link>
                    </motion.section>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>

            {/* All Products Section */}
            <div ref={productsRef} className="scroll-mt-36">
              <Collapsible open={productsOpen} onOpenChange={setProductsOpen} className="mb-12">
                <CollapsibleTrigger asChild>
                  <div className="cursor-pointer flex items-center gap-3 mb-3">
                    <Grid3X3 className="h-6 w-6 text-[#E7FB10]" />
                    <h2 className="font-display font-bold text-2xl md:text-3xl">All Peptides</h2>
                    {products && <Badge variant="secondary">{filteredAndSortedProducts.length} of {products.length} items</Badge>}
                    <ChevronDown className={`h-5 w-5 ml-auto transition-transform ${productsOpen ? "" : "-rotate-90"}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="text-muted-foreground max-w-2xl mb-6">
                    Premium research compounds, rigorously tested and verified. Each product includes a Certificate of Analysis.
                  </p>

                  {/* Mobile Filters */}
              <div className="lg:hidden mb-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-mobile-search"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    All
                  </Button>
                  {uniqueCategories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id)}
                      className="whitespace-nowrap"
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </div>

              {searchQuery && (
                <p className="text-sm text-muted-foreground mb-4">
                  Showing {filteredAndSortedProducts.length} result{filteredAndSortedProducts.length !== 1 ? "s" : ""} for "{searchQuery}"
                </p>
              )}

              {/* Stock filter info message */}
              {!searchQuery && products && (() => {
                const outOfStockCount = products.filter(p => !p.inStock || (p.stockAmount !== null && p.stockAmount <= 0)).length;
                if (outOfStockCount > 0) {
                  if (stockFilter === "in-stock") {
                    return (
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 px-3 py-2 bg-muted/30 rounded-lg border border-border/50" data-testid="text-stock-filter-info">
                        <span>
                          Showing <span className="font-medium text-foreground">{filteredAndSortedProducts.length}</span> of {products.length} products
                          <span className="text-muted-foreground/70"> · {outOfStockCount} out of stock hidden</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 text-[#21d8ff] hover:text-[#21d8ff]"
                          onClick={() => setStockFilter("all")}
                          data-testid="button-show-all-products"
                        >
                          Show all
                        </Button>
                      </div>
                    );
                  } else if (stockFilter === "all") {
                    return (
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 px-3 py-2 bg-muted/30 rounded-lg border border-border/50" data-testid="text-stock-filter-info">
                        <span>
                          Showing all <span className="font-medium text-foreground">{filteredAndSortedProducts.length}</span> products
                          <span className="text-muted-foreground/70"> · including {outOfStockCount} out of stock</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 text-[#21d8ff] hover:text-[#21d8ff]"
                          onClick={() => setStockFilter("in-stock")}
                          data-testid="button-hide-oos-products"
                        >
                          Hide out of stock
                        </Button>
                      </div>
                    );
                  }
                }
                return null;
              })()}

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Card key={i} className="p-3 animate-pulse">
                      <div className="aspect-[4/3] bg-muted rounded-md mb-3" />
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-full mb-2" />
                      <div className="h-6 bg-muted rounded w-1/3" />
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">Unable to load products. Please try again.</p>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </Card>
              ) : filteredAndSortedProducts.length > 0 ? (
                <motion.div
                  initial="initial"
                  animate="animate"
                  variants={staggerContainer}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4"
                >
                  {filteredAndSortedProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={fadeInUp}
                      className="h-full"
                    >
                      <Link href={`/peptides/${product.id}`} className="h-full block" onClick={savePageState}>
                        {/* Check if product is out of stock (either inStock=false OR stockAmount<=0) */}
                        {(() => {
                          const isOutOfStock = !product.inStock || (product.stockAmount !== null && product.stockAmount <= 0);
                          return (
                            <Card 
                              className={`group p-3 cursor-pointer transition-all duration-300 h-full flex flex-col border-2 hover:scale-[1.03] relative overflow-hidden ${
                                isOutOfStock
                                  ? "border-red-500/60 hover:border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.5),0_0_60px_rgba(239,68,68,0.2)]"
                                  : "border-[#21d8ff]/40 hover:border-[#21d8ff] hover:shadow-[0_0_30px_rgba(33,216,255,0.5),0_0_60px_rgba(33,216,255,0.2)]"
                              }`}
                              data-testid={`card-product-${product.id}`}
                            >
                              {isOutOfStock && (
                                <div 
                                  className="absolute inset-0 pointer-events-none z-10"
                                  style={{
                                    background: "linear-gradient(to bottom right, transparent calc(50% - 2px), rgba(239, 68, 68, 0.7) calc(50% - 1px), rgba(239, 68, 68, 0.9) 50%, rgba(239, 68, 68, 0.7) calc(50% + 1px), transparent calc(50% + 2px))",
                                  }}
                                />
                              )}
                              <div className="relative aspect-[4/3] mb-3 rounded-md overflow-hidden">
                                <ImageLoader 
                                  src={product.imageUrl || productImage} 
                                  alt={`${product.name} research peptide - third party lab tested`}
                                  className="w-full h-full object-contain transition-transform duration-300 p-3 group-hover:scale-105"
                                  containerClassName="relative w-full h-full bg-gradient-to-br from-muted to-muted/50 overflow-hidden rounded-md"
                                />
                                {/* Smart badge system - max 2 badges, positioned top-left */}
                                {(() => {
                                  const badges = getProductBadges(product, sellingFastIds);
                                  return (
                                    <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                                      {badges.map((badge) => (
                                        <span 
                                          key={badge.type}
                                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] rounded ${badge.className}`}
                                        >
                                          {badge.icon && <badge.icon className="h-3 w-3" />}
                                          {badge.label}
                                        </span>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                              
                              <div className="flex-1 flex flex-col min-h-0">
                                <div className="mb-2">
                                  {(() => {
                                    const peptideGroup = getPeptideGroup(product.name);
                                    return peptideGroup ? (
                                      <Badge 
                                        variant="outline"
                                        className="text-[11px] px-2 py-1 opacity-85"
                                        style={{ 
                                          borderColor: `${peptideGroup.color}60`,
                                          color: peptideGroup.color 
                                        }}
                                        data-testid={`badge-peptide-group-${peptideGroup.id}`}
                                      >
                                        {peptideGroup.label}
                                      </Badge>
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                        {product.category}
                                      </span>
                                    );
                                  })()}
                                </div>
                                <h3 className="font-display text-lg md:text-2xl font-black mb-2 group-hover:text-[#E7FB10] transition-colors line-clamp-2 text-center">
                                  {product.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2 min-h-[2rem]">
                                  {product.shortDescription}
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border flex-wrap gap-2">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-baseline gap-1.5">
                                        <span className="font-display text-lg font-bold text-[#E7FB10]">
                                          ${Number(product.price).toFixed(2)}
                                        </span>
                                        {product.originalPrice && (
                                          <span className="text-[10px] text-muted-foreground line-through">
                                            ${Number(product.originalPrice).toFixed(2)}
                                          </span>
                                        )}
                                      </div>
                                      {/* Price Trend Arrow - Show based on sale status */}
                                      {product.originalPrice && Number(product.price) < Number(product.originalPrice) && (
                                        <TrendingDown className="h-4 w-4 text-red-500" data-testid={`icon-price-down-${product.id}`} />
                                      )}
                                    </div>
                                    <span className="text-[9px] text-[#E7FB10]/60">Preview pricing</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 ml-auto">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setQuickViewProduct(product);
                                      }}
                                      data-testid={`button-quickview-${product.id}`}
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const inCompare = isInCompare(product.id);
                                        if (inCompare) {
                                          removeFromCompare(product.id);
                                        } else {
                                          addToCompare(product.id);
                                        }
                                      }}
                                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                      data-testid={`button-compare-icon-${product.id}`}
                                    >
                                      <Scale className="h-4 w-4 text-[#21d8ff]" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })()}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
                ) : (
                  <Card className="p-12 text-center">
                    <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold mb-2">No Peptides Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery
                        ? `No products match "${searchQuery}". Try a different search term.`
                        : "No products match your current filters."}
                    </p>
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    )}
                  </Card>
                )}
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Research Stacks Section */}
            <div ref={bundlesRef} className="scroll-mt-36">
              <Collapsible open={bundlesOpen} onOpenChange={setBundlesOpen} className="mb-12">
                <CollapsibleTrigger asChild>
                  <div className="cursor-pointer flex items-center gap-3 mb-5">
                    <Package className="h-6 w-6 text-[#21d8ff]" />
                    <h2 className="font-display font-bold text-2xl md:text-3xl">Research Stacks</h2>
                    <Badge variant="outline" className="border-primary/50 text-primary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Save More
                    </Badge>
                    <ChevronDown className={`h-5 w-5 ml-auto transition-transform ${bundlesOpen ? "" : "-rotate-90"}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-12"
                    data-testid="section-bundles"
                  >
                <p className="text-muted-foreground mb-6 max-w-2xl">
                  Expertly curated peptide combinations based on research protocols. Bundle and save on the most popular stacks.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {BUNDLES.map((bundle, index) => (
                    <motion.div
                      key={bundle.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                    >
                      <Link href={`/bundles/${bundle.id}`}>
                        <Card 
                          className={`h-full p-4 border-2 transition-all cursor-pointer group ${
                            bundle.color === "cyan" 
                              ? "border-cyan-500/30 hover:border-cyan-500 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)]" 
                              : "border-[#E7FB10]/30 hover:border-[#E7FB10] hover:shadow-[0_0_25px_rgba(231,251,16,0.15)]"
                          }`}
                          data-testid={`card-bundle-${bundle.id}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              bundle.color === "cyan" ? "bg-cyan-500/10" : "bg-[#E7FB10]/10"
                            }`}>
                              <bundle.icon className={`h-4.5 w-4.5 ${
                                bundle.color === "cyan" ? "text-cyan-400" : "text-[#E7FB10]"
                              }`} />
                            </div>
                            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                              Save {bundle.savings}%
                            </Badge>
                          </div>
                          
                          <h3 className={`font-display text-base font-bold mb-0.5 ${
                            bundle.color === "cyan" ? "text-cyan-400" : "text-[#E7FB10]"
                          }`}>
                            {bundle.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-2">{bundle.tagline}</p>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {bundle.products.map((product) => (
                              <Badge key={product} variant="outline" className="text-[10px] py-0 px-1.5">
                                {product}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className={`flex items-center justify-between pt-3 border-t ${
                            bundle.color === "cyan" ? "border-cyan-500/20" : "border-[#E7FB10]/20"
                          }`}>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-display text-lg font-bold">${bundle.bundlePrice.toFixed(2)}</span>
                              <span className="text-xs text-muted-foreground line-through">
                                ${bundle.originalPrice.toFixed(2)}
                              </span>
                            </div>
                            <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs">
                              View <ArrowRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                    ))}
                  </div>
                  </motion.section>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Bulk Orders Section - Now at the bottom */}
            <div ref={bulkRef} className="scroll-mt-36 mt-16">
              <Collapsible open={bulkOpen} onOpenChange={setBulkOpen} className="mb-12">
                <CollapsibleTrigger asChild>
                  <div className="cursor-pointer flex items-center gap-3 mb-5">
                    <Boxes className="h-6 w-6 text-[#9d4edd]" />
                    <h2 className="font-display font-bold text-2xl md:text-3xl">Bulk Orders</h2>
                    <Badge className="bg-[#9d4edd]/20 text-[#9d4edd] border-[#9d4edd]/30">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Volume Pricing
                    </Badge>
                    <ChevronDown className={`h-5 w-5 ml-auto transition-transform ${bulkOpen ? "" : "-rotate-90"}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    data-testid="section-bulk-orders"
                  >
                <Card className="p-6 md:p-8 border-2 border-[#9d4edd]/40 bg-gradient-to-r from-purple-950/30 via-background to-purple-950/20">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <p className="text-muted-foreground flex-1 max-w-xl text-center md:text-left">
                      Need larger quantities for your research facility? Contact us for custom bulk pricing 
                      with discounts up to 30% on qualifying orders.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-muted-foreground">10+ units: 10% off</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-muted-foreground">25+ units: 20% off</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-muted-foreground">50+ units: 30% off</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Link href="/contact">
                        <Button className="gap-2 bg-[#9d4edd] text-white border-[#9d4edd]">
                          <Mail className="h-4 w-4" />
                          Request Quote
                        </Button>
                      </Link>
                    </div>
                    </div>
                  </Card>
                  </motion.section>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick View Modal */}
      <QuickViewModal 
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
      
      {/* Compare Bar */}
      {products && <CompareBar products={products} />}
      
      {/* Recently Viewed Section */}
      <RecentlyViewed variant="section" />
    </main>
  );
}

export default function Products() {
  return (
    <>
      <EarlyAccessModal showOnProductPages={true} />
      <ProductsComponent />
    </>
  );
}
