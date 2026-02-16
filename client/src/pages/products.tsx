import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
  Scale,
  MessageCircle,
  ArrowUp,
  Check
} from "lucide-react";
import { isInCompare, addToCompare, removeFromCompare } from "@/components/comparison-tool";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getVisitorId } from "@/lib/utils";
import type { Product } from "@shared/schema";

type ProductWithPriceRange = Product & { minPrice?: string; maxPrice?: string };
import productImage from "@assets/reta bottle_1764310671562.jpg";
import { BUNDLES } from "@/lib/bundles";
import { SEOHead } from "@/components/seo-head";
import { CategoryTabs } from "@/components/category-tabs";

// Badge priority system - max 2 badges per product
// Priority: Out of Stock > Low Stock > Selling Fast > Featured
type BadgeType = "out-of-stock" | "low-stock" | "selling-fast" | "featured";

interface ProductBadge {
  type: BadgeType;
  label: string;
  className: string;
  icon?: typeof Flame;
}

const LOW_STOCK_THRESHOLD = 10;

function getProductBadges(
  product: Product, 
  sellingFastIds: string[]
): ProductBadge[] {
  const badges: ProductBadge[] = [];
  
  // Priority 1: Coming Soon (for out of stock items) - Soft gray styling instead of harsh red
  if (product.inStock === false || (product.stockAmount !== null && product.stockAmount <= 0)) {
    badges.push({
      type: "out-of-stock",
      label: "Coming Soon",
      className: "bg-muted-foreground/80 text-background font-medium"
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
  
  // Priority 3: Selling Fast
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


const CATEGORIES = [
  { id: "all", name: "All Peptides", icon: Grid3X3 },
  { id: "peptides", name: "Research Peptides", icon: FlaskConical },
  { id: "research-compounds", name: "Research Compounds", icon: FlaskConical },
];

const peptideGroups = [
  { id: "all", label: "All Peptides", color: "#ec4899" },
  { id: "metabolic", label: "Metabolic", color: "#E7FB10", names: ["rr-a1", "rr-a2", "rr-a3", "cagrilintide", "mazdutide", "survodutide", "aod-9604", "5-amino-1mq", "aicar", "slu-pp-322", "l-carnitine", "lipo-c", "adipotide"] },
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

function ProductsComponent() {
  const { toast } = useToast();
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
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "out-of-stock">(savedState?.stockFilter ?? "all");
  const [activeSection, setActiveSection] = useState<ShopSection>("deals");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(savedState?.selectedCategory ?? "all");
  const [peptideGroupFilter, setPeptideGroupFilter] = useState<string>(savedState?.peptideGroupFilter ?? "all");
  const [priceRange, setPriceRange] = useState<[number, number]>(savedState?.priceRange ?? [0, 300]);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [peptideGroupsExpanded, setPeptideGroupsExpanded] = useState(true);
  const [stateRestored, setStateRestored] = useState(false);
  
  // Collapsible section states
  const [productsOpen, setProductsOpen] = useState(true);
  const [bundlesOpen, setBundlesOpen] = useState(true);
  const [bulkOpen, setBulkOpen] = useState(true);
  
  // Quick view modal state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Mobile filter sheet state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // Display controls state - items per page and grid columns
  const itemsPerPage = 12; // Fixed at 12 items per page
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4>(4);

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

  const { data: products, isLoading, error } = useQuery<ProductWithPriceRange[]>({
    queryKey: ["/api/products"],
    refetchInterval: 30000,
  });

  // Query for selling fast products (5+ orders in last 7 days)
  const { data: sellingFastIds = [] } = useQuery<string[]>({
    queryKey: ["/api/products/selling-fast"],
  });

  const { data: voteCounts = [] } = useQuery<Array<{ productId: string; count: number }>>({
    queryKey: ["/api/products/votes"],
  });

  const [votedProducts, setVotedProducts] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("revive_voted_products");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const voteMutation = useMutation({
    mutationFn: async ({ productId, action }: { productId: string; action: "vote" | "unvote" }) => {
      const visitorId = getVisitorId();
      if (action === "vote") {
        await apiRequest("POST", `/api/products/${productId}/vote`, { visitorId });
      } else {
        await apiRequest("DELETE", `/api/products/${productId}/vote`, { visitorId });
      }
      return { productId, action };
    },
    onSuccess: ({ productId, action }) => {
      setVotedProducts(prev => {
        const next = new Set(prev);
        if (action === "vote") next.add(productId);
        else next.delete(productId);
        localStorage.setItem("revive_voted_products", JSON.stringify([...next]));
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products/votes"] });
      if (action === "vote") {
        toast({
          title: "Thanks — we've noted your interest!",
          description: "We prioritize restocking based on community demand.",
        });
      }
    },
  });

  const handleVote = useCallback((e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const action = votedProducts.has(productId) ? "unvote" : "vote";
    voteMutation.mutate({ productId, action });
  }, [votedProducts, voteMutation]);


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
        searchQuery !== "" || // If there's a search query, ignore the stock filter
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

    // First, always sort in-stock items before out-of-stock items
    // Then apply the secondary sort within each group
    // Out-of-stock items are always sorted alphabetically
    filtered.sort((a, b) => {
      const aInStock = a.inStock && (a.stockAmount === null || a.stockAmount > 0);
      const bInStock = b.inStock && (b.stockAmount === null || b.stockAmount > 0);
      
      // In-stock items come first
      if (aInStock && !bInStock) return -1;
      if (!aInStock && bInStock) return 1;
      
      // Out-of-stock items are always sorted alphabetically
      if (!aInStock && !bInStock) {
        return a.name.localeCompare(b.name);
      }
      
      // Within in-stock items, apply the selected sort
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return Number(a.price) - Number(b.price);
        case "price-desc":
          return Number(b.price) - Number(a.price);
        case "featured":
        default: {
          const featuredDiff = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
          if (featuredDiff !== 0) return featuredDiff;
          return a.name.localeCompare(b.name);
        }
      }
    });

    return filtered;
  }, [products, searchQuery, sortBy, stockFilter, selectedCategory, peptideGroupFilter, priceRange]);

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("featured");
    setStockFilter("all");
    setSelectedCategory("all");
    setPeptideGroupFilter("all");
    setPriceRange([priceStats.min, priceStats.max]);
  };

  const hasActiveFilters = searchQuery !== "" || sortBy !== "featured" || stockFilter !== "all" || selectedCategory !== "all" || peptideGroupFilter !== "all" || priceRange[0] !== priceStats.min || priceRange[1] !== priceStats.max;

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, stockFilter, selectedCategory, peptideGroupFilter, priceRange]);

  // Scroll to top of products section when page changes
  const handlePageChange = (page: number) => {
    const clampedPage = Math.max(1, Math.min(totalPages, page));
    if (clampedPage !== currentPage) {
      setCurrentPage(clampedPage);
      productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
      <SEOHead title="Shop Peptides" description="Browse our complete catalog of premium research peptides. Third-party lab tested, COA verified. BPC-157, TB-500, RR-A1 & more." canonicalPath="/products" />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Category Navigation Tabs */}
        <div className="mb-6">
          <CategoryTabs />
        </div>

        {/* Page Header - Centered like other product pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#21d8ff]/10 border border-[#21d8ff]/30 mb-4">
            <FlaskConical className="h-4 w-4 text-[#21d8ff]" />
            <span className="text-sm font-medium text-[#21d8ff]">Research Peptides</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Peptides
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Premium research compounds, rigorously tested and verified. Each product includes a Certificate of Analysis.
          </p>
        </motion.div>

        {/* Main Layout with Sidebar */}
        <div className="flex gap-6 relative">
          {/* Sidebar Toggle (Visible only when sidebar is closed) */}
          {!sidebarOpen && (
            <div className="hidden lg:block absolute left-0 top-0 z-20">
              <Button
                variant="outline"
                size="default"
                onClick={() => setSidebarOpen(true)}
                className="h-10 px-3 bg-background/80 backdrop-blur-sm border-[#E7FB10]/30 hover:border-[#E7FB10] hover:bg-[#E7FB10]/10 gap-2 group"
                data-testid="button-show-sidebar"
              >
                <PanelLeft className="h-5 w-5 text-[#E7FB10]" />
                <span className="text-xs font-medium text-muted-foreground group-hover:text-[#E7FB10] transition-colors">Filters</span>
              </Button>
            </div>
          )}

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
                <div className="sticky top-28 space-y-6 pr-2">
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-[#E7FB10]" />
                      <span className="font-semibold text-white">Filters</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSidebarOpen(false)}
                      className="h-8 w-8 hover:bg-white/10"
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
                        const count = peptideGroupCounts[group.id] || 0;
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
            {/* All Products Section */}
            <div ref={productsRef} className="scroll-mt-36">
              <div>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mb-4">
                  Showing {filteredAndSortedProducts.length} result{filteredAndSortedProducts.length !== 1 ? "s" : ""} for "{searchQuery}"
                </p>
              )}
              {/* Display Controls Bar - Mobile optimized */}
              <div className={`flex items-center justify-between gap-4 mb-4 pl-14 ${!sidebarOpen ? 'lg:pl-40' : 'lg:pl-0'}`} data-testid="display-controls-bar">
                {/* Left: Pagination Controls + Grid toggles */}
                <div className="flex items-center gap-3">
                  {/* Pagination Controls - Fixed compact format */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8"
                        data-testid="button-prev-page-inline"
                      >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                      </Button>
                      <span className="px-3 text-sm font-medium min-w-[60px] text-center" data-testid="text-page-info-inline">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8"
                        data-testid="button-next-page-inline"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Grid layout toggles - Desktop only, right of pagination */}
                  <div className="hidden sm:flex items-center bg-muted/50 rounded-md p-0.5">
                    <button
                      onClick={() => setGridColumns(2)}
                      className={`p-1.5 rounded transition-colors ${
                        gridColumns === 2
                          ? "bg-background text-[#21d8ff] shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="2 columns"
                      data-testid="button-grid-2"
                    >
                      <Grid2X2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setGridColumns(3)}
                      className={`p-1.5 rounded transition-colors ${
                        gridColumns === 3
                          ? "bg-background text-[#21d8ff] shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="3 columns"
                      data-testid="button-grid-3"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setGridColumns(4)}
                      className={`p-1.5 rounded transition-colors ${
                        gridColumns === 4
                          ? "bg-background text-[#21d8ff] shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="4 columns"
                      data-testid="button-grid-4"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Right: Category filter dropdown */}
                <div className="ml-auto">
                  <Select value={peptideGroupFilter} onValueChange={(value) => setPeptideGroupFilter(value)}>
                    <SelectTrigger className="w-auto min-w-[160px] h-8 text-sm" data-testid="select-category-filter">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                          Default
                        </span>
                      </SelectItem>
                      {peptideGroups.filter(g => g.id !== "all").map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          <span className="flex items-center gap-2">
                            <span 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: group.color }}
                            ></span>
                            <span style={{ color: group.color }}>{group.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className={`grid gap-6 p-2 -m-2 ${
                  gridColumns === 2 ? "grid-cols-2" :
                  gridColumns === 3 ? "grid-cols-2 md:grid-cols-3" :
                  "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                }`}>
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
                <>
                <motion.div
                  initial="initial"
                  animate="animate"
                  variants={staggerContainer}
                  className={`grid gap-3 sm:gap-6 p-2 -m-2 ${
                    gridColumns === 2 ? "grid-cols-2" :
                    gridColumns === 3 ? "grid-cols-2 md:grid-cols-3" :
                    "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  }`}
                >
                  {paginatedProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={fadeInUp}
                      className="h-full"
                    >
                      <Link href={`/peptides/${product.slug || product.id}`} className="h-full block" onClick={savePageState}>
                        {/* Check if product is out of stock (either inStock=false OR stockAmount<=0) */}
                        {(() => {
                          const isOutOfStock = product.inStock === false || (product.stockAmount !== null && product.stockAmount <= 0);
                          return (
                            <Card 
                              className={`group p-2 sm:p-3 cursor-pointer transition-all duration-300 h-full flex flex-col border-2 md:hover:scale-[1.03] md:active:scale-[1.03] relative overflow-hidden ${
                                isOutOfStock
                                  ? "border-red-500/40 opacity-80 md:hover:border-red-500 md:hover:opacity-95 md:hover:shadow-[0_0_30px_rgba(239,68,68,0.5),0_0_60px_rgba(239,68,68,0.2)]"
                                  : "border-[#21d8ff]/40 md:hover:border-[#21d8ff] md:hover:shadow-[0_0_30px_rgba(33,216,255,0.5),0_0_60px_rgba(33,216,255,0.2)]"
                              }`}
                              data-testid={`card-product-${product.id}`}
                            >
                              <div className="relative aspect-[5/4] sm:aspect-[4/3] mb-2 sm:mb-3 rounded-md overflow-hidden">
                                <ImageLoader 
                                  src={product.imageUrl || productImage} 
                                  alt={`${product.name} research peptide - third party lab tested`}
                                  className="w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-105 md:group-active:scale-105"
                                  containerClassName="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 overflow-hidden rounded-md"
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
                                          data-testid={`badge-${badge.type}-${product.id}`}
                                        >
                                          {badge.icon && <badge.icon className="h-3 w-3" />}
                                          {badge.label}
                                        </span>
                                      ))}
                                    </div>
                                  );
                                })()}
                                {isOutOfStock && (
                                  <button
                                    onClick={(e) => handleVote(e, product.id)}
                                    className={`absolute bottom-2 right-2 z-20 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold tracking-wide transition-all duration-200 ${
                                      votedProducts.has(product.id)
                                        ? "bg-[#21d8ff]/25 text-[#21d8ff] border border-[#21d8ff]/50"
                                        : "bg-black/60 text-white/80 border border-white/20 hover:border-[#21d8ff]/50 hover:text-[#21d8ff]"
                                    }`}
                                    data-testid={`button-vote-${product.id}`}
                                  >
                                    {votedProducts.has(product.id) ? (
                                      <>
                                        <Check className="h-3 w-3" />
                                        <span>Wanted</span>
                                      </>
                                    ) : (
                                      <>
                                        <ArrowUp className="h-3 w-3" />
                                        <span>Want This</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                              <div className="flex-1 flex flex-col min-h-0">
                                <div className="mb-0.5 sm:mb-1 text-center">
                                  {(() => {
                                    const peptideGroup = getPeptideGroup(product.name);
                                    return peptideGroup ? (
                                      <Badge 
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0.5 opacity-80"
                                        style={{ 
                                          borderColor: `${peptideGroup.color}60`,
                                          color: peptideGroup.color 
                                        }}
                                        data-testid={`badge-peptide-group-${peptideGroup.id}`}
                                      >
                                        {peptideGroup.label}
                                      </Badge>
                                    ) : (
                                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                                        {product.category}
                                      </span>
                                    );
                                  })()}
                                </div>
                                <h3 className="font-display text-[20px] sm:text-[25px] font-black mb-0.5 md:group-hover:text-[#E7FB10] transition-colors line-clamp-2 text-center">
                                  {product.name}
                                </h3>
                                <p className="text-[10px] text-muted-foreground/70 mb-0.5 sm:mb-1 line-clamp-1 text-center">
                                  {product.shortDescription}
                                </p>
                                <div className="flex items-center justify-center mt-auto gap-1.5">
                                  <span className="font-display text-[17px] sm:text-[20px] font-bold text-[#E7FB10]">
                                    {product.minPrice && product.maxPrice
                                      ? `$${Number(product.minPrice).toFixed(2)}–$${Number(product.maxPrice).toFixed(2)}`
                                      : `$${Number(product.price).toFixed(2)}`
                                    }
                                  </span>
                                </div>
                                {isOutOfStock && (
                                  <div className="flex items-center justify-center gap-1 mt-1" data-testid={`stock-indicator-${product.id}`}>
                                    <span className="text-[10px] text-red-400 font-medium flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                                      Out of Stock
                                    </span>
                                  </div>
                                )}
                              </div>
                            </Card>
                          );
                        })()}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Pagination Controls - Bottom */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        data-testid="button-prev-page-bottom"
                      >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="icon"
                          onClick={() => handlePageChange(page)}
                          data-testid={`button-page-${page}-bottom`}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        data-testid="button-next-page-bottom"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground" data-testid="text-pagination-info-bottom">
                      Page {currentPage} of {totalPages} ({filteredAndSortedProducts.length} products)
                    </p>
                  </div>
                )}
                </>
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
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Need Help Choosing CTA */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-4">
        <button
          onClick={() => window.dispatchEvent(new Event('openChatbot'))}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg border-2 border-[#21d8ff]/30 bg-[#21d8ff]/5 hover:border-[#21d8ff] hover:bg-[#21d8ff]/10 transition-all group"
          data-testid="button-need-help-cta"
        >
          <MessageCircle className="h-5 w-5 text-[#21d8ff] md:group-hover:scale-110 transition-transform" />
          <span className="font-display font-bold text-[#21d8ff]">Need Help Choosing?</span>
        </button>

        <div
          className="w-full flex flex-wrap items-start gap-4 py-4 px-6 rounded-lg border border-white/10 bg-white/[0.02]"
          data-testid="section-want-this-explainer"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white/90 flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-[#21d8ff] shrink-0" />
              See a <span className="text-[#21d8ff]">"Want This"</span> button?
            </p>
            <p className="text-xs text-white/50 leading-relaxed">
              Some products are temporarily out of stock. Tap <span className="text-[#21d8ff]/70">Want This</span> to
              let us know you're interested — we prioritize restocking based on community demand. Your
              vote is anonymous and helps us serve you better.{" "}
              <Link href="/faq#want-this-voting" className="text-[#21d8ff]/70 hover:text-[#21d8ff] underline underline-offset-2" data-testid="link-voting-faq">
                Learn more
              </Link>
            </p>
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
