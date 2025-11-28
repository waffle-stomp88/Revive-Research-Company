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
import { ArrowRight, FlaskConical, Search, X, SlidersHorizontal } from "lucide-react";
import type { Product } from "@shared/schema";

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

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "out-of-stock">("all");

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

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
    <main className="min-h-screen pt-24 md:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-products-title">
            All Products
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Premium research compounds, rigorously tested and verified. Each product 
            includes a Certificate of Authenticity for complete transparency.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="aspect-square bg-muted rounded-md mb-6" />
                <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3 mb-4" />
                <div className="h-8 bg-muted rounded w-1/3" />
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredAndSortedProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
              >
                <Link href={`/products/${product.id}`}>
                  <Card 
                    className="group p-6 hover-elevate cursor-pointer transition-all duration-300 h-full flex flex-col" 
                    data-testid={`card-product-${product.id}`}
                  >
                    <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-md mb-6 flex items-center justify-center overflow-hidden">
                      <FlaskConical className="h-16 w-16 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-300" />
                      {product.featured && (
                        <Badge className="absolute top-3 left-3" variant="secondary">
                          Featured
                        </Badge>
                      )}
                      {!product.inStock && (
                        <Badge className="absolute top-3 right-3" variant="destructive">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        {product.category}
                      </div>
                      <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
                        {product.shortDescription}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-2xl font-bold">
                            ${Number(product.price).toFixed(2)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${Number(product.originalPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground flex items-center gap-1 group-hover:text-foreground transition-colors">
                          View
                          <ArrowRight className="h-4 w-4" />
                        </span>
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
