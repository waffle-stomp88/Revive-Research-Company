import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Zap,
  Shield,
  Heart,
  Timer,
  Sparkles,
  Boxes,
  TrendingDown,
  Mail,
  CheckCircle2,
  Grid3X3,
  Tag
} from "lucide-react";
import type { Product } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";
import { BUNDLES } from "@/lib/bundles";

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

type ShopSection = "deals" | "bundles" | "bulk" | "products";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "out-of-stock">("all");
  const [activeSection, setActiveSection] = useState<ShopSection>("deals");

  const dealsRef = useRef<HTMLDivElement>(null);
  const bundlesRef = useRef<HTMLDivElement>(null);
  const bulkRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const scrollToSection = (section: ShopSection) => {
    setActiveSection(section);
    const refs: Record<ShopSection, React.RefObject<HTMLDivElement>> = {
      deals: dealsRef,
      bundles: bundlesRef,
      bulk: bulkRef,
      products: productsRef,
    };
    refs[section].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const sectionRefs: { section: ShopSection; ref: React.RefObject<HTMLDivElement> }[] = [
      { section: "deals", ref: dealsRef },
      { section: "bundles", ref: bundlesRef },
      { section: "bulk", ref: bulkRef },
      { section: "products", ref: productsRef },
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
    return products.find(p => p.name.toLowerCase().includes("retatrutide"));
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter((product) => {
      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && product.inStock) ||
        (stockFilter === "out-of-stock" && !product.inStock);

      return matchesSearch && matchesStock;
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
  }, [products, searchQuery, sortBy, stockFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("featured");
    setStockFilter("all");
  };

  const hasActiveFilters = searchQuery !== "" || sortBy !== "featured" || stockFilter !== "all";

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Shop</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Premium research compounds, curated bundles, and volume pricing for your laboratory needs.
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="sticky top-20 z-40 -mx-4 px-4 md:-mx-8 md:px-8 py-3 bg-background/95 backdrop-blur-sm border-b border-border mb-8"
        >
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeSection === "deals" ? "default" : "outline"}
              size="sm"
              onClick={() => scrollToSection("deals")}
              className="gap-2"
              data-testid="nav-deals"
            >
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Weekly</span> Deal
              <Badge variant="destructive" className="ml-1 text-xs px-1.5 py-0">HOT</Badge>
            </Button>
            <Button
              variant={activeSection === "bundles" ? "default" : "outline"}
              size="sm"
              onClick={() => scrollToSection("bundles")}
              className="gap-2"
              data-testid="nav-bundles"
            >
              <Package className="h-4 w-4" />
              Research Stacks
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 bg-green-500/20 text-green-400">{BUNDLES.length}</Badge>
            </Button>
            <Button
              variant={activeSection === "bulk" ? "default" : "outline"}
              size="sm"
              onClick={() => scrollToSection("bulk")}
              className="gap-2"
              data-testid="nav-bulk"
            >
              <Boxes className="h-4 w-4" />
              Bulk Orders
            </Button>
            <Button
              variant={activeSection === "products" ? "default" : "outline"}
              size="sm"
              onClick={() => scrollToSection("products")}
              className="gap-2"
              data-testid="nav-products"
            >
              <Grid3X3 className="h-4 w-4" />
              All Products
              {products && <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">{products.length}</Badge>}
            </Button>
          </div>
        </motion.div>

        {/* Deals Section */}
        <div ref={dealsRef} className="scroll-mt-36">
          {saleProduct && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
              data-testid="section-sale-of-week"
            >
              <div className="flex items-center gap-3 mb-5">
                <Flame className="h-6 w-6 text-red-500" />
                <h2 className="font-display font-bold text-2xl md:text-3xl">Weekly Deal</h2>
                <Badge variant="destructive" className="animate-pulse">
                  {SALE_OF_THE_WEEK.badge}
                </Badge>
              </div>
              <Link href={`/products/${saleProduct.id}`}>
                <Card className="p-5 md:p-6 border-2 border-red-500/40 bg-gradient-to-br from-red-950/40 via-background to-background hover:border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all cursor-pointer group">
                  <div className="flex flex-col md:flex-row gap-5 items-center">
                    <div className="w-28 h-28 md:w-36 md:h-36 bg-muted/50 rounded-lg overflow-hidden flex-shrink-0 border border-red-500/20">
                      <img 
                        src={productImage} 
                        alt={saleProduct.name}
                        className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                        <Badge variant="destructive" className="text-base px-2.5 py-0.5">
                          {SALE_OF_THE_WEEK.discount}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{SALE_OF_THE_WEEK.endDate}</span>
                      </div>
                      <h3 className="font-display text-2xl md:text-3xl font-bold text-[#E7FB10] mb-2">
                        {saleProduct.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-lg">
                        {SALE_OF_THE_WEEK.description}
                      </p>
                      <div className="flex items-center justify-center md:justify-start gap-4">
                        <span className="font-display text-2xl md:text-3xl font-bold">${Number(saleProduct.price).toFixed(2)}</span>
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
              </Link>
            </motion.section>
          )}
        </div>

        {/* Research Stacks Section */}
        <div ref={bundlesRef} className="scroll-mt-36">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
            data-testid="section-bundles"
          >
            <div className="flex items-center gap-3 mb-5">
              <Package className="h-6 w-6 text-[#21d8ff]" />
              <h2 className="font-display font-bold text-2xl md:text-3xl">Research Stacks</h2>
              <Badge variant="outline" className="border-primary/50 text-primary">
                <Sparkles className="h-3 w-3 mr-1" />
                Save More
              </Badge>
            </div>
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
        </div>

        {/* Bulk Orders Section */}
        <div ref={bulkRef} className="scroll-mt-36">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
            data-testid="section-bulk-orders"
          >
            <div className="flex items-center gap-3 mb-5">
              <Boxes className="h-6 w-6 text-[#9d4edd]" />
              <h2 className="font-display font-bold text-2xl md:text-3xl">Bulk Orders</h2>
              <Badge className="bg-[#9d4edd]/20 text-[#9d4edd] border-[#9d4edd]/30">
                <TrendingDown className="h-3 w-3 mr-1" />
                Volume Pricing
              </Badge>
            </div>
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
        </div>

        {/* All Products Section */}
        <div ref={productsRef} className="scroll-mt-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Grid3X3 className="h-6 w-6 text-[#E7FB10]" />
              <h2 className="font-display font-bold text-2xl md:text-3xl">All Products</h2>
              {products && <Badge variant="secondary">{products.length} items</Badge>}
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Premium research compounds, rigorously tested and verified. Each product includes a Certificate of Authenticity.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-products"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                  data-testid="button-clear-search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
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

              <Select value={stockFilter} onValueChange={(value) => setStockFilter(value as "all" | "in-stock" | "out-of-stock")}>
                <SelectTrigger className="w-[160px]" data-testid="select-stock-filter">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredAndSortedProducts.length} result{filteredAndSortedProducts.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          )}
        </motion.div>

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
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filteredAndSortedProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                className="h-full"
              >
                <Link href={`/products/${product.id}`} className="h-full block">
                  <Card 
                    className={`group p-3 cursor-pointer transition-all duration-300 h-full flex flex-col border-2 hover:scale-[1.03] relative overflow-hidden ${
                      !product.inStock
                        ? "border-red-500/40 hover:border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.5),0_0_60px_rgba(239,68,68,0.2)]"
                        : "border-cyan-400/40 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(33,216,255,0.5),0_0_60px_rgba(33,216,255,0.2)]"
                    }`}
                    data-testid={`card-product-${product.id}`}
                  >
                    {/* Diagonal red line for out of stock */}
                    {!product.inStock && (
                      <div 
                        className="absolute inset-0 pointer-events-none z-10"
                        style={{
                          background: "linear-gradient(to bottom right, transparent calc(50% - 2px), rgba(239, 68, 68, 0.7) calc(50% - 1px), rgba(239, 68, 68, 0.9) 50%, rgba(239, 68, 68, 0.7) calc(50% + 1px), transparent calc(50% + 2px))",
                        }}
                      />
                    )}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 rounded-md mb-3 overflow-hidden">
                      <img 
                        src={productImage} 
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 p-3 group-hover:scale-105"
                      />
                      {product.originalPrice && (
                        <span className="absolute top-2 left-2 z-20 px-1.5 py-0.5 font-bold rounded bg-red-600 text-white text-[13px]">
                          SALE
                        </span>
                      )}
                      {product.featured && (
                        <span className="absolute top-2 right-2 z-20 px-1.5 py-0.5 font-semibold rounded bg-[#21d8ff] text-black text-[13px]">
                          Featured
                        </span>
                      )}
                      {!product.inStock && (
                        <span className="absolute bottom-2 left-2 z-20 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-destructive text-destructive-foreground">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        {product.category}
                      </div>
                      <h3 className="font-display md:text-lg font-bold mb-1 group-hover:text-[#E7FB10] transition-colors line-clamp-1 text-center text-[20px]">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2 min-h-[2rem]">
                        {product.shortDescription}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
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
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[#E7FB10] transition-colors" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="p-12 text-center">
            <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No Products Found</h3>
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
    </main>
  );
}
