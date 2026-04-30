import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { SEOHead } from "@/components/seo-head";
import { CategoryTabs } from "@/components/category-tabs";
import { ImageLoader } from "@/components/image-loader";
import { ArrowRight, ShoppingCart, Sparkles, TrendingDown, Crown, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import type { ProductWithDosageStock } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";

const bulkTiers = [
  { quantity: 3, discount: 10, label: "3-Pack", color: "#21d8ff" },
  { quantity: 5, discount: 15, label: "5-Pack", color: "#E7FB10", popular: true },
  { quantity: 10, discount: 20, label: "10-Pack", color: "#a78bfa" },
] as const;

function fmt(n: number) {
  return n.toFixed(2);
}

function calcBulk(price: number, quantity: number, discount: number) {
  const total = price * quantity;
  const discounted = total * (1 - discount / 100);
  return { total, discounted, savings: total - discounted, perUnit: discounted / quantity };
}

interface PackItem {
  productId: string;
  productName: string;
  productSlug: string | null;
  productImage: string | null;
  dosage: string;
  unitPrice: number;
  category: string;
}

export default function BulkPacks() {
  const [activeTier, setActiveTier] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: productsWithStock, isLoading } = useQuery<ProductWithDosageStock[]>({
    queryKey: ["/api/products-with-stock"],
  });

  const packItems = useMemo((): PackItem[] => {
    if (!productsWithStock) return [];
    const items: PackItem[] = [];
    for (const product of productsWithStock) {
      if (!product.inStock || product.category === "Research Stacks" || product.category === "Supplies") continue;
      for (const ds of product.dosageStocks) {
        if (!ds.inStock || ds.stockAmount <= 0) continue;
        const unitPrice = ds.price ? parseFloat(ds.price) : (typeof product.price === "string" ? parseFloat(product.price) : product.price);
        items.push({
          productId: String(product.id),
          productName: product.name,
          productSlug: product.slug,
          productImage: product.imageUrl,
          dosage: ds.dosage,
          unitPrice,
          category: product.category,
        });
      }
    }
    return items.sort((a, b) => a.productName.localeCompare(b.productName));
  }, [productsWithStock]);

  const tier = bulkTiers[activeTier];

  const handleAddBulk = async (item: PackItem) => {
    const bulk = calcBulk(item.unitPrice, tier.quantity, tier.discount);
    const success = await addToCart({
      productId: item.productId,
      name: item.productName,
      price: bulk.discounted,
      originalPrice: bulk.total,
      quantity: 1,
      dosage: item.dosage,
      image: item.productImage || undefined,
      packSize: tier.quantity,
    });
    if (success) {
      toast({
        title: "Added to Cart",
        description: `${item.productName} ${item.dosage} ${tier.label} — $${fmt(bulk.discounted)}`,
      });
    } else {
      toast({
        title: "Out of Stock",
        description: `${item.productName} (${item.dosage}) is currently unavailable.`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <main className="min-h-screen pt-32 md:pt-40 pb-24">
        <SEOHead
          title="Bulk Packs - Volume Pricing"
          description="Save up to 20% on research peptides with volume pricing. Choose 3-pack, 5-pack, or 10-pack bulk bundles."
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
              Premium research compounds at volume pricing. Select your pack size and add to cart.
            </p>
          </motion.div>

          {/* Tier Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 md:gap-3 mb-8"
          >
            {bulkTiers.map((t, idx) => {
              const isActive = activeTier === idx;
              const isPopular = "popular" in t && t.popular;
              return (
                <button
                  key={t.quantity}
                  onClick={() => setActiveTier(idx)}
                  className="relative px-5 md:px-7 py-3 md:py-3.5 rounded-md transition-all duration-300 text-center"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${t.color}25, ${t.color}10)`
                      : "rgba(255, 255, 255, 0.03)",
                    border: isActive
                      ? `1.5px solid ${t.color}80`
                      : "1.5px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: isActive
                      ? `0 0 25px ${t.color}15, inset 0 0 20px ${t.color}08`
                      : "none",
                  }}
                  data-testid={`tab-tier-${t.quantity}`}
                >
                  <span
                    className="font-display font-bold text-sm md:text-base block"
                    style={{ color: isActive ? t.color : "rgba(255, 255, 255, 0.5)" }}
                  >
                    {t.label}
                  </span>
                  <span
                    className="text-xs font-semibold block mt-0.5"
                    style={{ color: isActive ? "#4ade80" : "rgba(255, 255, 255, 0.3)" }}
                  >
                    Save {t.discount}%
                  </span>
                  {isPopular && (
                    <div
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{
                        background: "linear-gradient(135deg, rgba(231, 251, 16, 0.9), rgba(231, 251, 16, 0.7))",
                        color: "#000",
                        boxShadow: "0 0 12px rgba(231, 251, 16, 0.3)",
                      }}
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      Best Value
                    </div>
                  )}
                </button>
              );
            })}
          </motion.div>

          {/* Pack Cards Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTier}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="h-14 w-14 rounded-md flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-full mb-3" />
                      <Skeleton className="h-9 w-full" />
                    </Card>
                  ))}
                </div>
              ) : packItems.length === 0 ? (
                <Card className="p-8 text-center">
                  <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No bulk packs available at this time.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packItems.map((item, idx) => {
                    const bulk = calcBulk(item.unitPrice, tier.quantity, tier.discount);
                    return (
                      <motion.div
                        key={`${item.productId}-${item.dosage}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card
                          className="overflow-visible group relative"
                          style={{
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            boxShadow: "0 2px 16px rgba(0, 0, 0, 0.25)",
                            transition: "border-color 0.3s, box-shadow 0.3s",
                          }}
                          data-testid={`card-pack-${item.productId}-${item.dosage}`}
                        >
                          <div className="p-5">
                            {/* Product header */}
                            <div className="flex items-center gap-3 mb-4">
                              <Link
                                href={`/peptides/${item.productSlug || item.productId}`}
                                className="flex-shrink-0"
                                data-testid={`link-product-${item.productId}`}
                              >
                                <div
                                  className="h-14 w-14 rounded-md overflow-hidden ring-1 ring-white/10"
                                  style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)" }}
                                >
                                  <ImageLoader
                                    src={item.productImage || productImage}
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                    containerClassName="relative w-full h-full bg-muted overflow-hidden rounded-md"
                                  />
                                </div>
                              </Link>
                              <div className="min-w-0 flex-1">
                                <Link
                                  href={`/peptides/${item.productSlug || item.productId}`}
                                  data-testid={`link-product-name-${item.productId}`}
                                >
                                  <h3
                                    className="font-display font-bold text-base leading-tight text-[#21d8ff] truncate"
                                    data-testid={`text-product-name-${item.productId}-${item.dosage}`}
                                  >
                                    {item.productName}
                                  </h3>
                                </Link>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    className="text-[10px] px-1.5 py-0 bg-white/5 border-white/10 text-white/70"
                                    data-testid={`badge-dosage-${item.productId}-${item.dosage}`}
                                  >
                                    {item.dosage}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    ${fmt(item.unitPrice)} / vial
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Pricing section */}
                            <div
                              className="rounded-md p-3 mb-4"
                              style={{
                                background: `linear-gradient(135deg, ${tier.color}08, ${tier.color}04)`,
                                border: `1px solid ${tier.color}15`,
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-baseline gap-2">
                                    <span
                                      className="font-display font-bold text-2xl"
                                      style={{ color: tier.color, textShadow: `0 0 20px ${tier.color}30` }}
                                      data-testid={`text-pack-price-${item.productId}-${item.dosage}`}
                                    >
                                      ${fmt(bulk.discounted)}
                                    </span>
                                    <span
                                      className="text-sm text-muted-foreground/60 line-through"
                                      data-testid={`text-original-price-${item.productId}-${item.dosage}`}
                                    >
                                      ${fmt(bulk.total)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    ${fmt(bulk.perUnit)} per vial
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span
                                    className="text-sm font-bold block"
                                    style={{ color: "#4ade80" }}
                                    data-testid={`text-savings-${item.productId}-${item.dosage}`}
                                  >
                                    Save ${fmt(bulk.savings)}
                                  </span>
                                  <span className="text-[10px] font-semibold" style={{ color: tier.color }}>
                                    {tier.discount}% off
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Add to Cart button */}
                            <Button
                              className="w-full gap-2 font-semibold"
                              style={{
                                background: `linear-gradient(135deg, ${tier.color}dd, ${tier.color}aa)`,
                                color: "#000",
                                border: `1px solid ${tier.color}`,
                              }}
                              onClick={() => handleAddBulk(item)}
                              data-testid={`button-add-pack-${item.productId}-${item.dosage}`}
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Add {tier.label} to Cart
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Wholesale CTA */}
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

          {/* RUO Disclaimer */}
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
