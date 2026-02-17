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
  { quantity: 5, discount: 15, label: "5-Pack", color: "#E7FB10" },
  { quantity: 10, discount: 20, label: "10-Pack", color: "#a78bfa" },
];

function formatPrice(price: string | number) {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return num.toFixed(2);
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
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
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
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Compare volume discounts at a glance. The more you buy, the more you save.
            </p>
          </motion.div>

          {categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-2 mb-8"
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
            className="mb-6"
          >
            <div className="hidden md:block">
              <div className="grid grid-cols-[1fr_repeat(3,180px)] gap-0 mb-1 px-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium py-3">
                  Product
                </div>
                {bulkTiers.map((tier) => (
                  <div
                    key={tier.quantity}
                    className="text-center py-3 relative"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-xs uppercase tracking-wider font-bold" style={{ color: tier.color }}>
                        {tier.label}
                      </span>
                      <Badge
                        className="text-[10px] px-1.5 py-0 border-0"
                        style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                      >
                        {tier.discount}% off
                      </Badge>
                    </div>
                    {tier.quantity === 5 && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-[#E7FB10] flex items-center gap-1">
                          <Sparkles className="h-2.5 w-2.5" />
                          Popular
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-4">
                      <div className="grid grid-cols-[1fr_repeat(3,180px)] gap-4 items-center">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-14 w-14 rounded-md flex-shrink-0" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className="space-y-2">
                    {filteredProducts.map((product, idx) => (
                      <DesktopProductRow key={product.id} product={product} index={idx} />
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>

            <div className="md:hidden space-y-3">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="h-14 w-14 rounded-md flex-shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-24 w-full" />
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
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No products available in this category.</p>
            </Card>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10"
          >
            <Card className="p-6 bg-gradient-to-br from-muted/50 to-background border-2 border-[#21d8ff]/30">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-display text-xl font-bold mb-2">Need Even Larger Quantities?</h3>
                  <p className="text-muted-foreground">
                    For clinics, research facilities, or resellers ordering 50+ vials, check out our Wholesale Program
                    with tiered pricing and dedicated support.
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

          <div className="mt-12 p-4 border border-red-500/30 rounded-md bg-red-500/5">
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

function DesktopProductRow({ product, index }: { product: Product; index: number }) {
  const basePrice = typeof product.price === "string" ? parseFloat(product.price) : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.03 }}
      layout
    >
      <Card
        className="p-4 transition-all duration-200 border border-border/60 md:hover:border-[#21d8ff]/50 md:hover:shadow-[0_0_20px_rgba(33,216,255,0.12)]"
        data-testid={`row-bulk-product-${product.id}`}
      >
        <div className="grid grid-cols-[1fr_repeat(3,180px)] gap-0 items-center">
          <Link href={`/peptides/${product.slug || product.id}`} className="flex items-center gap-4 pr-4 group">
            <div className="h-14 w-14 rounded-md overflow-hidden flex-shrink-0 bg-gradient-to-br from-muted to-muted/50">
              <ImageLoader
                src={product.imageUrl || productImage}
                alt={`${product.name} research peptide`}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                containerClassName="relative w-full h-full bg-muted overflow-hidden rounded-md"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm group-hover:text-[#21d8ff] transition-colors truncate">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                ${formatPrice(basePrice)} / vial
              </p>
            </div>
          </Link>

          {bulkTiers.map((tier) => {
            const bulk = calcBulk(product.price, tier.quantity, tier.discount);
            return (
              <TierCell
                key={tier.quantity}
                tier={tier}
                bulk={bulk}
                product={product}
              />
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}

function TierCell({
  tier,
  bulk,
  product,
}: {
  tier: (typeof bulkTiers)[0];
  bulk: { total: number; discounted: number; savings: number; perUnit: number };
  product: Product;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 py-1">
      <div className="flex items-baseline gap-1.5">
        <span className="font-display font-bold text-base" style={{ color: tier.color }}>
          ${bulk.discounted.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground line-through">
          ${bulk.total.toFixed(2)}
        </span>
        <span className="text-[10px] font-medium text-green-500">
          Save ${bulk.savings.toFixed(2)}
        </span>
      </div>
      <Link href={`/peptides/${product.slug || product.id}?bulk=${tier.quantity}`}>
        <Button
          size="sm"
          variant="outline"
          className="mt-1 text-xs border-border/60"
          style={{ borderColor: `${tier.color}40`, color: tier.color }}
          data-testid={`button-add-${product.id}-${tier.quantity}`}
        >
          <ShoppingCart className="h-3 w-3 mr-1" />
          {tier.label}
        </Button>
      </Link>
    </div>
  );
}

function MobileProductCard({ product, index }: { product: Product; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const basePrice = typeof product.price === "string" ? parseFloat(product.price) : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.04 }}
      layout
    >
      <Card
        className="overflow-visible border border-border/60"
        data-testid={`card-bulk-mobile-${product.id}`}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 flex items-center gap-3 text-left"
          aria-expanded={expanded}
          data-testid={`button-expand-${product.id}`}
        >
          <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-gradient-to-br from-muted to-muted/50">
            <ImageLoader
              src={product.imageUrl || productImage}
              alt={`${product.name} research peptide`}
              className="w-full h-full object-cover"
              containerClassName="relative w-full h-full bg-muted overflow-hidden rounded-md"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-sm truncate">{product.name}</h3>
            <p className="text-xs text-muted-foreground">${formatPrice(basePrice)} / vial</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className="bg-green-500/15 text-green-500 border-green-500/30 text-[10px]">
              Up to {bulkTiers[bulkTiers.length - 1].discount}% off
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
                        className="rounded-md p-3 text-center transition-all border"
                        style={{
                          borderColor: `${tier.color}30`,
                          background: `${tier.color}08`,
                        }}
                        data-testid={`card-tier-${product.id}-${tier.quantity}`}
                      >
                        <div className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: tier.color }}>
                          {tier.label}
                        </div>
                        <div className="font-display font-bold text-sm" style={{ color: tier.color }}>
                          ${bulk.discounted.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-muted-foreground line-through">
                          ${bulk.total.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-green-500 font-medium mt-0.5">
                          Save ${bulk.savings.toFixed(2)}
                        </div>
                        {tier.quantity === 5 && (
                          <div className="mt-1">
                            <span className="text-[8px] uppercase tracking-wider text-[#E7FB10]/70 flex items-center justify-center gap-0.5">
                              <Sparkles className="h-2 w-2" /> Popular
                            </span>
                          </div>
                        )}
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
