import { useState, useMemo } from "react";
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
  Sparkles
} from "lucide-react";
import type { Product } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";

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

const BUNDLES = [
  {
    id: "wolverine-stack",
    name: "The Wolverine Stack",
    tagline: "Legendary Recovery",
    icon: Zap,
    description: "BPC-157 + TB-500 combination for accelerated tissue repair and healing research. The most popular peptide stack worldwide.",
    products: ["BPC-157", "TB-500"],
    originalPrice: 104.98,
    bundlePrice: 89.99,
    savings: 15,
    color: "cyan",
  },
  {
    id: "longevity-stack",
    name: "Longevity Stack",
    tagline: "Age Optimization",
    icon: Timer,
    description: "Epithalon + GHK-Cu + NAD+ for comprehensive cellular rejuvenation and longevity research applications.",
    products: ["Epithalon", "GHK-Cu", "NAD+ Precursor"],
    originalPrice: 219.97,
    bundlePrice: 189.99,
    savings: 14,
    color: "yellow",
  },
  {
    id: "performance-stack",
    name: "Performance Stack",
    tagline: "Peak Output",
    icon: Flame,
    description: "CJC-1295 + Ipamorelin for natural growth hormone optimization research. Ideal for athletic performance studies.",
    products: ["CJC-1295", "Ipamorelin"],
    originalPrice: 234.98,
    bundlePrice: 199.99,
    savings: 15,
    color: "cyan",
  },
  {
    id: "healing-protocol",
    name: "Complete Healing Protocol",
    tagline: "Full Spectrum Repair",
    icon: Heart,
    description: "BPC-157 + TB-500 + GHK-Cu for comprehensive tissue regeneration and wound healing research.",
    products: ["BPC-157", "TB-500", "GHK-Cu"],
    originalPrice: 144.97,
    bundlePrice: 119.99,
    savings: 17,
    color: "yellow",
  },
];

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "out-of-stock">("all");

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

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
        {saleProduct && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
            data-testid="section-sale-of-week"
          >
            <div className="flex items-center gap-3 mb-6">
              <Flame className="h-6 w-6 text-red-500" />
              <h2 className="font-display font-bold text-[40px]">{SALE_OF_THE_WEEK.title}</h2>
              <Badge variant="destructive" className="animate-pulse">
                {SALE_OF_THE_WEEK.badge}
              </Badge>
            </div>
            <Link href={`/products/${saleProduct.id}`}>
              <Card className="p-6 md:p-8 border-2 border-red-500/50 bg-gradient-to-r from-red-950/30 to-background hover:border-red-500 transition-all cursor-pointer group">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={productImage} 
                      alt={saleProduct.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                      <Badge variant="destructive" className="text-lg px-3 py-1">
                        {SALE_OF_THE_WEEK.discount}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{SALE_OF_THE_WEEK.endDate}</span>
                    </div>
                    <h3 className="font-display text-3xl font-bold text-[#E7FB10] mb-2">
                      {saleProduct.name}
                    </h3>
                    <p className="text-muted-foreground mb-4 max-w-xl">
                      {SALE_OF_THE_WEEK.description}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      <span className="font-display text-3xl font-bold">${Number(saleProduct.price).toFixed(2)}</span>
                      {saleProduct.originalPrice && (
                        <span className="text-xl text-muted-foreground line-through">
                          ${Number(saleProduct.originalPrice).toFixed(2)}
                        </span>
                      )}
                      <Button className="ml-4 gap-2">
                        Shop Now <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
          data-testid="section-bundles"
        >
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 text-[#21d8ff]" />
            <h2 className="font-display font-bold text-[40px]">Research Stacks</h2>
            <Badge variant="outline" className="border-primary/50 text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              Save More
            </Badge>
          </div>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Expertly curated peptide combinations based on research protocols. 
            Bundle and save on the most popular stacks in the research community.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BUNDLES.map((bundle, index) => (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`p-6 h-full hover:scale-[1.02] transition-all cursor-pointer border-2 ${
                    bundle.color === "cyan" 
                      ? "border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-glow-blue-lg" 
                      : "border-[#E7FB10]/30 hover:border-[#E7FB10]/60 hover:shadow-glow-lg"
                  }`}
                  data-testid={`card-bundle-${bundle.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        bundle.color === "cyan" ? "bg-cyan-500/10" : "bg-[#E7FB10]/10"
                      }`}>
                        <bundle.icon className={`h-6 w-6 ${
                          bundle.color === "cyan" ? "text-cyan-400" : "text-[#E7FB10]"
                        }`} />
                      </div>
                      <div>
                        <h3 className={`font-display text-xl font-bold ${
                          bundle.color === "cyan" ? "text-cyan-400" : "text-[#E7FB10]"
                        }`}>
                          {bundle.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{bundle.tagline}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      Save {bundle.savings}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {bundle.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {bundle.products.map((product) => (
                      <Badge key={product} variant="outline" className="text-xs">
                        {product}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-2xl font-bold">${bundle.bundlePrice.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground line-through">
                        ${bundle.originalPrice.toFixed(2)}
                      </span>
                    </div>
                    <Button size="sm" className="gap-2">
                      View Bundle <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 md:mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-products-title">
            All Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Premium research compounds, rigorously tested and verified. Each product 
            includes a Certificate of Authenticity for complete transparency.
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
              >
                <Link href={`/products/${product.id}`}>
                  <Card 
                    className={`group p-3 cursor-pointer transition-all duration-300 h-full flex flex-col border-2 hover:scale-[1.03] ${
                      !product.inStock
                        ? "border-red-500/40 hover:border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.5),0_0_60px_rgba(239,68,68,0.2)]"
                        : "border-cyan-400/40 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(33,216,255,0.5),0_0_60px_rgba(33,216,255,0.2)]"
                    }`}
                    data-testid={`card-product-${product.id}`}
                  >
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 rounded-md mb-3 overflow-hidden">
                      <img 
                        src={productImage} 
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 p-3 group-hover:scale-105"
                      />
                      {product.originalPrice && (
                        <span className="absolute top-2 left-2 z-20 px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-600 text-white">
                          SALE
                        </span>
                      )}
                      {product.featured && (
                        <span className="absolute top-2 right-2 z-20 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-[#21d8ff] text-black">
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
                      <h3 className="font-display text-base md:text-lg font-bold mb-1 group-hover:text-[#E7FB10] transition-colors line-clamp-1 text-center">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2 flex-1 line-clamp-2">
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
    </main>
  );
}
