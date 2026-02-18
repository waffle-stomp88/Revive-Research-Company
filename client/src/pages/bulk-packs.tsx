import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { SEOHead } from "@/components/seo-head";
import { CategoryTabs } from "@/components/category-tabs";
import { ImageLoader } from "@/components/image-loader";
import { ArrowRight, ChevronDown, ShoppingCart, Sparkles, TrendingDown, Crown, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EarlyAccessModal } from "@/components/early-access-modal";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
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
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const handleAddBulk = async (product: Product, tierQuantity: number, tierDiscount: number, tierLabel: string, tierColor: string) => {
    const bulk = calcBulk(product.price, tierQuantity, tierDiscount);
    const success = await addToCart({
      productId: String(product.id),
      name: product.name,
      price: bulk.discounted,
      originalPrice: bulk.total,
      quantity: 1,
      dosage: (product.dosageOptions && product.dosageOptions.length > 0) ? product.dosageOptions[0] : "default",
      image: product.imageUrl || undefined,
      packSize: tierQuantity,
    });
    if (success) {
      toast({
        title: "Added to Cart",
        description: `${product.name} ${tierLabel} — $${fmt(bulk.discounted)}`,
      });
    } else {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently unavailable.`,
        variant: "destructive",
      });
    }
  };

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
            className="text-center mb-10"
          >
            <div className="mb-6">
              <CategoryTabs />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{
                background: "linear-gradient(135deg, rgba(231, 251, 16, 0.12), rgba(33, 216, 255, 0.08))",
                border: "1px solid rgba(231, 251, 16, 0.3)",
                boxShadow: "0 0 20px rgba(231, 251, 16, 0.1)",
              }}
            >
              <TrendingDown className="h-4 w-4 text-[#E7FB10]" />
              <span className="text-sm font-semibold text-[#E7FB10]">Volume Pricing</span>
            </motion.div>
            <h1
              className="font-display text-4xl md:text-5xl font-bold mb-3"
              style={{ textShadow: "0 0 40px rgba(231, 251, 16, 0.08)" }}
            >
              Bulk Packs
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
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
                className={categoryFilter === "all" ? "bg-[#E7FB10] text-black border-[#E7FB10]" : ""}
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
                  className={categoryFilter === cat ? "bg-[#E7FB10] text-black border-[#E7FB10]" : ""}
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
              <Card
                className="overflow-hidden"
                style={{
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 0 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
                }}
              >
                {/* Header row */}
                <div
                  className="grid grid-cols-[1.2fr_repeat(3,1fr)]"
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    background: "linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)",
                  }}
                >
                  <div className="px-5 py-4 text-xs text-muted-foreground uppercase tracking-widest font-semibold flex items-center">
                    Product
                  </div>
                  {bulkTiers.map((tier) => {
                    const isPopular = "popular" in tier && tier.popular;
                    return (
                    <div
                      key={tier.quantity}
                      className="px-3 py-4 text-center relative"
                      style={{
                        borderLeft: isPopular
                          ? `1px solid ${tier.color}25`
                          : "1px solid rgba(255, 255, 255, 0.04)",
                        borderRight: isPopular ? `1px solid ${tier.color}15` : undefined,
                        background: isPopular
                          ? `linear-gradient(180deg, ${tier.color}18 0%, ${tier.color}06 100%)`
                          : `linear-gradient(180deg, ${tier.color}08 0%, transparent 100%)`,
                        boxShadow: isPopular
                          ? `inset 0 0 40px ${tier.color}0a, 0 0 20px ${tier.color}08`
                          : undefined,
                      }}
                    >
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <span className="text-sm uppercase tracking-wider font-bold" style={{ color: tier.color }} data-testid={`text-tier-label-${tier.quantity}`}>
                          {tier.label}
                        </span>
                        <span
                          className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${tier.color}20`,
                            color: tier.color,
                            boxShadow: `0 0 8px ${tier.color}15`,
                          }}
                          data-testid={`text-tier-discount-${tier.quantity}`}
                        >
                          {tier.discount}% off
                        </span>
                      </div>
                      {"popular" in tier && tier.popular && (
                        <div className="flex items-center justify-center gap-1 mt-1.5">
                          <div
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              background: "linear-gradient(135deg, rgba(231, 251, 16, 0.2), rgba(231, 251, 16, 0.08))",
                              color: "#E7FB10",
                              border: "1px solid rgba(231, 251, 16, 0.3)",
                              boxShadow: "0 0 12px rgba(231, 251, 16, 0.15)",
                            }}
                          >
                            <Sparkles className="h-2.5 w-2.5" />
                            Most Popular
                          </div>
                        </div>
                      )}
                      <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-2/3 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${tier.color}60, transparent)`,
                        }}
                      />
                    </div>
                    );
                  })}
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
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className={`grid grid-cols-[1.2fr_repeat(3,1fr)] items-center group/row transition-all duration-200 ${
                            idx < filteredProducts.length - 1 ? "" : ""
                          }`}
                          style={{
                            borderBottom: idx < filteredProducts.length - 1 ? "1px solid rgba(255, 255, 255, 0.04)" : "none",
                          }}
                          data-testid={`row-bulk-product-${product.id}`}
                        >
                          <Link
                            href={`/peptides/${product.slug || product.id}`}
                            className="flex items-center gap-4 px-5 py-4 hover-elevate"
                            data-testid={`link-product-${product.id}`}
                          >
                            <div
                              className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 ring-1 ring-white/10"
                              style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)" }}
                            >
                              <ImageLoader
                                src={product.imageUrl || productImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                containerClassName="relative w-full h-full bg-muted overflow-hidden rounded-md"
                              />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-display font-bold text-base leading-tight text-[#21d8ff] truncate" data-testid={`text-product-name-${product.id}`}>
                                {product.name}
                              </h3>
                              <span className="text-sm text-muted-foreground" data-testid={`text-base-price-${product.id}`}>
                                ${fmt(basePrice)} / vial
                              </span>
                            </div>
                          </Link>

                          {bulkTiers.map((tier) => {
                            const bulk = calcBulk(product.price, tier.quantity, tier.discount);
                            const isPopular = "popular" in tier && tier.popular;
                            return (
                              <button
                                key={tier.quantity}
                                onClick={() => handleAddBulk(product, tier.quantity, tier.discount, tier.label, tier.color)}
                                className="px-4 py-4 flex items-center justify-center gap-3 group/tier cursor-pointer transition-colors duration-200 hover-elevate"
                                style={{
                                  borderLeft: "1px solid rgba(255, 255, 255, 0.04)",
                                  background: isPopular
                                    ? `linear-gradient(180deg, ${tier.color}12 0%, ${tier.color}04 100%)`
                                    : `linear-gradient(180deg, ${tier.color}06 0%, transparent 100%)`,
                                  ...(isPopular ? { boxShadow: `inset 0 0 30px ${tier.color}08, 0 0 15px ${tier.color}06` } : {}),
                                }}
                                aria-label={`Add ${product.name} ${tier.label} to cart for $${fmt(bulk.discounted)}`}
                                data-testid={`button-add-${product.id}-${tier.quantity}`}
                              >
                                <div className="text-center">
                                  <span
                                    className="font-display font-bold text-lg block"
                                    style={{
                                      color: tier.color,
                                      textShadow: `0 0 20px ${tier.color}30`,
                                    }}
                                    data-testid={`text-price-${product.id}-${tier.quantity}`}
                                  >
                                    ${fmt(bulk.discounted)}
                                  </span>
                                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                                    <span className="text-xs text-muted-foreground/70 line-through" data-testid={`text-original-${product.id}-${tier.quantity}`}>${fmt(bulk.total)}</span>
                                    <span
                                      className="text-xs font-bold"
                                      style={{ color: "#4ade80", textShadow: "0 0 8px rgba(74, 222, 128, 0.2)" }}
                                      data-testid={`text-savings-${product.id}-${tier.quantity}`}
                                    >
                                      -${fmt(bulk.savings)}
                                    </span>
                                  </div>
                                </div>
                                <ShoppingCart
                                  className="h-5 w-5 flex-shrink-0 opacity-25 group-hover/tier:opacity-100 transition-opacity duration-200"
                                  style={{ color: tier.color }}
                                />
                              </button>
                            );
                          })}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            {/* Mobile list */}
            <div className="md:hidden space-y-3">
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
                    <MobileProductCard key={product.id} product={product} index={idx} onAddBulk={handleAddBulk} />
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
            className="mt-10"
          >
            <Card
              className="p-6 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(33, 216, 255, 0.06), rgba(167, 139, 250, 0.04), rgba(33, 216, 255, 0.02))",
                border: "1px solid rgba(33, 216, 255, 0.2)",
                boxShadow: "0 0 25px rgba(33, 216, 255, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
              }}
            >
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(33, 216, 255, 0.08), transparent 70%)",
                  transform: "translate(30%, -30%)",
                }}
              />
              <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                    <Crown className="h-5 w-5 text-[#21d8ff]" />
                    <h3 className="font-display text-xl font-bold">Need Even Larger Quantities?</h3>
                  </div>
                  <p className="text-muted-foreground">
                    For clinics, research facilities, or resellers ordering 50+ vials, check out our Wholesale Program.
                  </p>
                </div>
                <Link href="/wholesale" data-testid="link-wholesale-cta">
                  <Button
                    variant="outline"
                    className="border-[#21d8ff]/60 text-[#21d8ff] bg-[#21d8ff]/5"
                    data-testid="button-wholesale-cta"
                  >
                    Explore Wholesale
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          <div
            className="mt-8 p-4 rounded-md"
            style={{
              border: "1px solid rgba(239, 68, 68, 0.2)",
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.04), rgba(239, 68, 68, 0.02))",
            }}
          >
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

function MobileProductCard({ product, index, onAddBulk }: { product: Product; index: number; onAddBulk: (product: Product, tierQuantity: number, tierDiscount: number, tierLabel: string, tierColor: string) => void }) {
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
        className="overflow-visible"
        style={{
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.2)",
        }}
        data-testid={`card-bulk-mobile-${product.id}`}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
          aria-expanded={expanded}
          data-testid={`button-expand-${product.id}`}
        >
          <div
            className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 ring-1 ring-white/10"
            style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)" }}
          >
            <ImageLoader
              src={product.imageUrl || productImage}
              alt={product.name}
              className="w-full h-full object-cover"
              containerClassName="relative w-full h-full bg-muted overflow-hidden rounded-md"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base truncate" data-testid={`text-mobile-name-${product.id}`}>{product.name}</h3>
            <p className="text-sm text-muted-foreground" data-testid={`text-mobile-price-${product.id}`}>${fmt(basePrice)} / vial</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              className="text-xs border"
              style={{
                backgroundColor: "rgba(74, 222, 128, 0.1)",
                color: "#4ade80",
                borderColor: "rgba(74, 222, 128, 0.25)",
              }}
              data-testid={`badge-discount-${product.id}`}
            >
              Up to 20% off
            </Badge>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
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
              <div className="px-4 pb-4 grid grid-cols-3 gap-2.5">
                {bulkTiers.map((tier) => {
                  const bulk = calcBulk(product.price, tier.quantity, tier.discount);
                  const isPopular = "popular" in tier && tier.popular;
                  return (
                    <button
                      key={tier.quantity}
                      onClick={() => onAddBulk(product, tier.quantity, tier.discount, tier.label, tier.color)}
                      data-testid={`button-mobile-add-${product.id}-${tier.quantity}`}
                      className="text-left"
                    >
                      <div
                        className="rounded-md px-2 py-3 text-center relative hover-elevate"
                        style={{
                          border: isPopular ? `1px solid ${tier.color}50` : `1px solid ${tier.color}30`,
                          background: isPopular
                            ? `linear-gradient(180deg, ${tier.color}15 0%, ${tier.color}08 100%)`
                            : `linear-gradient(180deg, ${tier.color}0a 0%, ${tier.color}04 100%)`,
                          ...(isPopular ? { boxShadow: `0 0 12px ${tier.color}15, inset 0 0 20px ${tier.color}08` } : {}),
                        }}
                        data-testid={`card-tier-${product.id}-${tier.quantity}`}
                      >
                        {isPopular && (
                          <div
                            className="absolute -top-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider whitespace-nowrap"
                            style={{
                              background: "linear-gradient(135deg, rgba(231, 251, 16, 0.25), rgba(231, 251, 16, 0.1))",
                              color: "#E7FB10",
                              border: "1px solid rgba(231, 251, 16, 0.3)",
                            }}
                          >
                            <Sparkles className="h-2 w-2" />
                            Popular
                          </div>
                        )}
                        <div
                          className="text-[11px] uppercase tracking-wider font-bold"
                          style={{ color: tier.color }}
                        >
                          {tier.label}
                        </div>
                        <div
                          className="font-display font-bold text-base leading-tight mt-1"
                          style={{ color: tier.color, textShadow: `0 0 12px ${tier.color}25` }}
                          data-testid={`text-mobile-tier-price-${product.id}-${tier.quantity}`}
                        >
                          ${fmt(bulk.discounted)}
                        </div>
                        <div className="text-[11px] text-muted-foreground/60 line-through leading-tight mt-0.5" data-testid={`text-mobile-tier-original-${product.id}-${tier.quantity}`}>
                          ${fmt(bulk.total)}
                        </div>
                        <div
                          className="text-[11px] font-bold leading-tight"
                          style={{ color: "#4ade80" }}
                          data-testid={`text-mobile-tier-savings-${product.id}-${tier.quantity}`}
                        >
                          Save ${fmt(bulk.savings)}
                        </div>
                      </div>
                    </button>
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
