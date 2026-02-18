import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { SEOHead } from "@/components/seo-head";
import { CategoryTabs } from "@/components/category-tabs";
import { ImageLoader } from "@/components/image-loader";
import { ArrowRight, ChevronDown, ShoppingCart, Sparkles, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EarlyAccessModal } from "@/components/early-access-modal";
import type { Product } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";

const bulkTiers = [
  { quantity: 3, discount: 10, label: "3-Pack", color: "#21d8ff" },
  { quantity: 5, discount: 15, label: "5-Pack", color: "#E7FB10", popular: true },
  { quantity: 10, discount: 20, label: "10-Pack", color: "#a78bfa" },
];

function fmt(n: number) {
  return n.toFixed(2);
}

function calcBulk(price: string | number, quantity: number, discount: number) {
  const num = typeof price === "string" ? parseFloat(price) : price;
  const total = num * quantity;
  const discounted = total * (1 - discount / 100);
  return { total, discounted, savings: total - discounted, perUnit: discounted / quantity };
}

export default function BulkPacks() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const inStockProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => p.inStock && p.category !== "Research Stacks");
  }, [products]);

  const categories = useMemo(() => {
    const cats = new Set(inStockProducts.map(p => p.category));
    return Array.from(cats).sort();
  }, [inStockProducts]);

  const filteredProducts = useMemo(() => {
    if (categoryFilter === "all") return inStockProducts;
    return inStockProducts.filter(p => p.category === categoryFilter);
  }, [inStockProducts, categoryFilter]);

  return (
    <>
      <EarlyAccessModal showOnProductPages={true} />
      <main className="min-h-screen pt-32 md:pt-40 pb-24">
        <SEOHead
          title="Bulk Packs - Volume Pricing"
          description="Save up to 20% on research peptides with volume pricing. Compare 3-pack, 5-pack, and 10-pack discounts side by side."
          canonicalPath="/bulk-packs"
        />
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="mb-6">
              <CategoryTabs />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E7FB10]/10 border border-[#E7FB10]/30 mb-4">
              <TrendingDown className="h-4 w-4 text-[#E7FB10]" />
              <span className="text-sm font-medium text-[#E7FB10]">Volume Pricing</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
              Bulk Packs
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Compare volume discounts at a glance. The more you buy, the more you save.
            </p>
          </motion.div>

          {categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <Button
                variant={categoryFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("all")}
                className={categoryFilter === "all" ? "bg-[#E7FB10] text-black" : ""}
                data-testid="button-filter-all"
              >
                All ({inStockProducts.length})
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(cat)}
                  className={categoryFilter === cat ? "bg-[#E7FB10] text-black" : ""}
                  data-testid={`button-filter-${cat.toLowerCase()}`}
                >
                  {cat} ({inStockProducts.filter(p => p.category === cat).length})
                </Button>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {/* Desktop table */}
            <div className="hidden md:block">
              <Card className="overflow-hidden border border-border/60">
                <div className="grid grid-cols-[1.2fr_repeat(3,1fr)] border-b border-border/40 bg-muted/30">
                  <div className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Product
                  </div>
                  {bulkTiers.map((tier) => (
                    <div
                      key={tier.quantity}
                      className="px-3 py-3 text-center border-l border-border/30"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {"popular" in tier && tier.popular && (
                          <Sparkles className="h-3.5 w-3.5 text-[#E7FB10]" />
                        )}
                        <span className="text-xs uppercase tracking-wider font-bold" style={{ color: tier.color }}>
                          {tier.label}
                        </span>
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${tier.color}18`, color: tier.color }}
                        >
                          {tier.discount}% off
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {isLoading ? (
                  <div>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="grid grid-cols-[1.2fr_repeat(3,1fr)] border-b border-border/20 px-5 py-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-md flex-shrink-0" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3.5 w-20" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-28 mx-auto" />
                        <Skeleton className="h-8 w-28 mx-auto" />
                        <Skeleton className="h-8 w-28 mx-auto" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {filteredProducts.map((product, idx) => {
                      const basePrice = typeof product.price === "string" ? parseFloat(product.price) : product.price;
                      return (
                        <div
                          key={product.id}
                          className={`grid grid-cols-[1.2fr_repeat(3,1fr)] items-center transition-colors duration-150 hover:bg-muted/20 ${
                            idx < filteredProducts.length - 1 ? "border-b border-border/20" : ""
                          }`}
                          data-testid={`row-bulk-product-${product.id}`}
                        >
                          <Link
                            href={`/peptides/${product.slug || product.id}`}
                            className="flex items-center gap-4 px-5 py-3 group"
                          >
                            <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-muted/50">
                              <ImageLoader
                                src={product.imageUrl || productImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                containerClassName="relative w-full h-full bg-muted overflow-hidden rounded-md"
                              />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-display font-bold text-base leading-tight group-hover:text-[#21d8ff] transition-colors truncate">
                                {product.name}
                              </h3>
                              <span className="text-sm text-muted-foreground">
                                ${fmt(basePrice)} / vial
                              </span>
                            </div>
                          </Link>

                          {bulkTiers.map((tier) => {
                            const bulk = calcBulk(product.price, tier.quantity, tier.discount);
                            return (
                              <Link
                                key={tier.quantity}
                                href={`/peptides/${product.slug || product.id}?bulk=${tier.quantity}`}
                                className="border-l border-border/20 px-4 py-3 flex items-center justify-center gap-3 group/tier cursor-pointer hover:bg-muted/30 transition-colors"
                                aria-label={`View ${product.name} ${tier.label} for $${fmt(bulk.discounted)}`}
                                data-testid={`button-add-${product.id}-${tier.quantity}`}
                              >
                                <div className="text-center">
                                  <span className="font-display font-bold text-lg" style={{ color: tier.color }}>
                                    ${fmt(bulk.discounted)}
                                  </span>
                                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                                    <span className="text-xs text-muted-foreground line-through">${fmt(bulk.total)}</span>
                                    <span className="text-xs text-green-500 font-semibold">-${fmt(bulk.savings)}</span>
                                  </div>
                                </div>
                                <ShoppingCart
                                  className="h-4 w-4 flex-shrink-0 opacity-30 group-hover/tier:opacity-100 transition-opacity"
                                  style={{ color: tier.color }}
                                />
                              </Link>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            {/* Mobile list */}
            <div className="md:hidden space-y-2">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-md flex-shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3.5 w-1/2" />
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, idx) => (
                    <MobileProductCard key={product.id} product={product} index={idx} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>

          {!isLoading && filteredProducts.length === 0 && (
            <Card className="p-6 text-center mt-4">
              <p className="text-muted-foreground">No products available in this category.</p>
            </Card>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="p-6 bg-gradient-to-br from-muted/50 to-background border border-[#21d8ff]/20">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-display text-xl font-bold mb-1">Need Even Larger Quantities?</h3>
                  <p className="text-muted-foreground">
                    For clinics, research facilities, or resellers ordering 50+ vials, check out our Wholesale Program.
                  </p>
                </div>
                <Link href="/wholesale">
                  <Button variant="outline" className="border-[#21d8ff] text-[#21d8ff]">
                    Explore Wholesale
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          <div className="mt-8 p-4 border border-red-500/30 rounded-md bg-red-500/5">
            <p className="text-xs text-red-400/80 text-center animate-pulse-subtle">
              <strong>Research Use Only:</strong> All products are sold exclusively for legitimate research purposes.
              Not for human consumption. By purchasing, you confirm you are 21+ and understand this policy.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

function MobileProductCard({ product, index }: { product: Product; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const basePrice = typeof product.price === "string" ? parseFloat(product.price) : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: index * 0.03 }}
      layout
    >
      <Card
        className="overflow-visible border border-border/60"
        data-testid={`card-bulk-mobile-${product.id}`}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-3 flex items-center gap-3 text-left"
          aria-expanded={expanded}
          data-testid={`button-expand-${product.id}`}
        >
          <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-muted/50">
            <ImageLoader
              src={product.imageUrl || productImage}
              alt={product.name}
              className="w-full h-full object-cover"
              containerClassName="relative w-full h-full bg-muted overflow-hidden rounded-md"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base truncate">{product.name}</h3>
            <p className="text-sm text-muted-foreground">${fmt(basePrice)} / vial</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className="bg-green-500/15 text-green-500 border-green-500/30 text-xs">
              Up to 20% off
            </Badge>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                {bulkTiers.map((tier) => {
                  const bulk = calcBulk(product.price, tier.quantity, tier.discount);
                  return (
                    <Link
                      key={tier.quantity}
                      href={`/peptides/${product.slug || product.id}?bulk=${tier.quantity}`}
                    >
                      <div
                        className="rounded-md px-2 py-3 text-center border"
                        style={{
                          borderColor: `${tier.color}25`,
                          background: `${tier.color}06`,
                        }}
                        data-testid={`card-tier-${product.id}-${tier.quantity}`}
                      >
                        <div className="text-[11px] uppercase tracking-wider font-bold" style={{ color: tier.color }}>
                          {tier.label}
                          {"popular" in tier && tier.popular && (
                            <Sparkles className="h-2.5 w-2.5 inline ml-0.5 -mt-0.5" />
                          )}
                        </div>
                        <div className="font-display font-bold text-base leading-tight mt-1" style={{ color: tier.color }}>
                          ${fmt(bulk.discounted)}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-through leading-tight mt-0.5">
                          ${fmt(bulk.total)}
                        </div>
                        <div className="text-[11px] text-green-500 font-semibold leading-tight">
                          Save ${fmt(bulk.savings)}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
