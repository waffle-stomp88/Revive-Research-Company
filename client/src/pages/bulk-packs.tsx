import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/seo-head";
import { CategoryTabs } from "@/components/category-tabs";
import { Boxes, Package, ShoppingCart, ArrowRight, Percent, CheckCircle2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EarlyAccessModal } from "@/components/early-access-modal";
import type { Product } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const bulkPackOptions = [
  { quantity: 5, discount: 10, label: "5-Pack", popular: false },
  { quantity: 10, discount: 15, label: "10-Pack", popular: true },
];

export default function BulkPacks() {
  const [selectedPack, setSelectedPack] = useState<number>(10);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const inStockProducts = products?.filter(p => p.inStock) || [];

  const getDiscountedPrice = (price: string | number, quantity: number) => {
    const pack = bulkPackOptions.find(p => p.quantity === quantity);
    const discount = pack?.discount || 0;
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice * quantity * (1 - discount / 100);
  };

  const getOriginalPrice = (price: string | number, quantity: number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice * quantity;
  };

  return (
    <>
      <EarlyAccessModal showOnProductPages={true} />
      <main className="min-h-screen pt-32 md:pt-40 pb-12">
      <SEOHead title="Bulk Research Packs" description="Save on larger quantities of research peptides. Bulk pricing for serious researchers." canonicalPath="/bulk-packs" />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Category Navigation Tabs */}
          <div className="mb-6">
            <CategoryTabs />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E7FB10]/10 border border-[#E7FB10]/30 mb-4">
            <Boxes className="h-4 w-4 text-[#E7FB10]" />
            <span className="text-sm font-medium text-[#E7FB10]">Volume Savings</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Bulk Packs
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Save more when you buy in volume. Perfect for researchers who need multiple vials 
            for extended studies. Not a business buyer? This is for you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12"
        >
          {bulkPackOptions.map((pack) => (
            <Card
              key={pack.quantity}
              onClick={() => setSelectedPack(pack.quantity)}
              className={`p-6 cursor-pointer transition-all duration-300 relative ${
                selectedPack === pack.quantity
                  ? "border-2 border-[#E7FB10] shadow-[0_0_30px_rgba(231,251,16,0.3)]"
                  : "border-2 border-border hover:border-[#E7FB10]/50"
              }`}
              data-testid={`card-pack-${pack.quantity}`}
            >
              {pack.popular && (
                <Badge className="absolute -top-2 -right-2 bg-[#E7FB10] text-black">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                  selectedPack === pack.quantity ? "bg-[#E7FB10]/20" : "bg-muted"
                }`}>
                  <Package className={`h-7 w-7 ${selectedPack === pack.quantity ? "text-[#E7FB10]" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold">{pack.label}</h3>
                  <p className="text-muted-foreground text-sm">{pack.quantity} vials per product</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="border-green-500/50 text-green-500">
                    <Percent className="h-3 w-3 mr-1" />
                    {pack.discount}% OFF
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">
              Available for {selectedPack}-Pack
            </h2>
            <Badge variant="outline" className="border-[#E7FB10]/50 text-[#E7FB10]">
              {inStockProducts.length} products available
            </Badge>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="aspect-square rounded-lg mb-3" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {inStockProducts.map((product) => {
                const originalPrice = getOriginalPrice(product.price, selectedPack);
                const discountedPrice = getDiscountedPrice(product.price, selectedPack);
                const savings = originalPrice - discountedPrice;

                return (
                  <motion.div key={product.id} {...fadeInUp}>
                    <Card 
                      className="group p-4 cursor-pointer transition-all duration-300 border-2 border-[#21d8ff]/40 hover:border-[#21d8ff] hover:shadow-[0_0_30px_rgba(33,216,255,0.3)] hover:scale-[1.02] active:scale-[1.02]"
                      data-testid={`card-bulk-product-${product.id}`}
                    >
                      <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={product.imageUrl || productImage}
                          alt={`${product.name} bulk pack research peptide`}
                          className="w-full h-full object-contain p-3 group-hover:scale-105 group-active:scale-105 transition-transform"
                        />
                        <Badge className="absolute top-2 left-2 bg-green-500/90 text-white text-[10px]">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          In Stock
                        </Badge>
                      </div>
                      <h3 className="font-display font-semibold text-sm mb-1 truncate">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.shortDescription}</p>
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-lg font-bold text-[#E7FB10]">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            ${originalPrice.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-green-500">Save ${savings.toFixed(2)}</p>
                      </div>
                      <Link href={`/peptides/${product.id}?bulk=${selectedPack}`}>
                        <Button className="w-full mt-3 bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90" size="sm">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
                <Button variant="outline" className="border-[#21d8ff] text-[#21d8ff] hover:bg-[#21d8ff]/10">
                  Explore Wholesale
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        <div className="mt-12 p-4 border border-red-500/30 rounded-lg bg-red-500/5">
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
