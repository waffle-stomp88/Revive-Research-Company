import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useCart } from "@/contexts/CartContext";
import {
  ArrowLeft,
  FlaskConical,
  Shield,
  CheckCircle,
  Minus,
  Plus,
  ShoppingCart,
  ShoppingBag,
  Truck,
  Repeat,
  FileCheck,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import productImage from "@assets/reta bottle_1764310671562.jpg";
import { BUNDLES } from "@/lib/bundles";
import { BUNDLE_COMPONENTS, STACK_DISCOUNT, buildPriceLookup, calculateStackPricing } from "@/lib/stack-pricing";
import { flagRetiredContent, RETIRED_BUNDLE_SLUGS } from "@/lib/retired-redirects";

type PurchaseType = "one-time" | "subscription";
type SubscriptionInterval = "weekly" | "biweekly" | "monthly";

const subscriptionOptions: { value: SubscriptionInterval; label: string; discount: number }[] = [
  { value: "weekly", label: "Weekly", discount: 15 },
  { value: "biweekly", label: "Every 2 Weeks", discount: 12 },
  { value: "monthly", label: "Monthly", discount: 10 },
];

export default function BundleDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("one-time");
  const [subscriptionInterval, setSubscriptionInterval] = useState<SubscriptionInterval>("monthly");

  const bundle = BUNDLES.find(b => b.id === params.id);

  useEffect(() => {
    if (params.id && RETIRED_BUNDLE_SLUGS.includes(params.id)) {
      flagRetiredContent("bundle", params.id);
      setLocation("/peptides");
    }
  }, [params.id]);

  const { data: productsWithStock } = useQuery<any[]>({
    queryKey: ["/api/products-with-stock"],
  });

  const priceLookup = useMemo(() => {
    if (!productsWithStock) return new Map<string, number>();
    return buildPriceLookup(productsWithStock);
  }, [productsWithStock]);

  const bundlePricing = useMemo(() => {
    if (!bundle) return null;
    return calculateStackPricing(bundle.id, priceLookup, BUNDLE_COMPONENTS);
  }, [bundle, priceLookup]);

  const pricingReady = bundlePricing !== null;

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const getSelectedDiscount = () => {
    if (purchaseType === "one-time") return 0;
    const option = subscriptionOptions.find(o => o.value === subscriptionInterval);
    return option?.discount || 0;
  };

  const getBasePrice = () => {
    return bundlePricing?.stackPrice ?? 0;
  };

  const getDiscountedPrice = () => {
    const basePrice = getBasePrice();
    const discount = getSelectedDiscount();
    return basePrice * (1 - discount / 100);
  };

  const getTotalPrice = () => {
    return getDiscountedPrice() * quantity;
  };

  const handleBuyNow = async () => {
    if (bundle) {
      await addToCart({
        productId: `bundle-${bundle.id}`,
        bundleId: bundle.id,
        name: bundle.name,
        price: getDiscountedPrice(),
        originalPrice: bundlePricing?.retailValue ?? 0,
        quantity,
        dosage: "Bundle",
        isBundle: true,
        image: productImage,
      });
      setLocation('/checkout?fromCart=true');
    }
  };

  const handleAddToCart = async () => {
    if (bundle) {
      await addToCart({
        productId: `bundle-${bundle.id}`,
        bundleId: bundle.id,
        name: bundle.name,
        price: getDiscountedPrice(),
        originalPrice: bundlePricing?.retailValue ?? 0,
        quantity,
        dosage: "Bundle",
        isBundle: true,
        image: productImage,
      });
      toast({
        title: "Added to cart",
        description: `${quantity}x ${bundle.name} added to your cart.`,
        action: (
          <ToastAction altText="View Cart" onClick={() => setLocation('/cart')} className="bg-[#E7FB10] text-black border-[#E7FB10] hover:bg-[#E7FB10]/90 font-semibold">
            View Cart
          </ToastAction>
        ),
      });
    }
  };

  useEffect(() => {
    if (!bundle && params.id && !RETIRED_BUNDLE_SLUGS.includes(params.id)) {
      flagRetiredContent("bundle", params.id);
      setLocation("/peptides");
    }
  }, [bundle, params.id]);

  if (!bundle) {
    return null;
  }

  const BundleIcon = bundle.icon;
  const benefits = bundle.benefits || [];

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-12">
      <SEOHead 
        title={`${bundle.name} | Research Bundle`}
        description={bundle.tagline || `${bundle.name} - Premium research peptide bundle with ${Math.round(STACK_DISCOUNT * 100)}% savings. Contains ${bundle.products.join(", ")}.`}
        canonicalPath={`/bundles/${bundle.id}`}
      />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <Link href="/products">
            <Button variant="ghost" className="gap-2 -ml-4" data-testid="button-back-products">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center sticky top-24 overflow-hidden">
              <div className="flex flex-col items-center justify-center gap-4 p-8">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  bundle.color === "cyan" ? "bg-cyan-500/10" : "bg-[#E7FB10]/10"
                }`}>
                  <BundleIcon className={`h-12 w-12 ${
                    bundle.color === "cyan" ? "text-cyan-400" : "text-[#E7FB10]"
                  }`} />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                Bundle
              </Badge>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 glow-pulse">
                Save {Math.round(STACK_DISCOUNT * 100)}%
              </Badge>
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2" data-testid="text-bundle-name">
              {bundle.name}
            </h1>
            
            <p className="text-sm text-muted-foreground mb-3 font-medium">
              {bundle.tagline}
            </p>

            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-display text-3xl font-bold text-[#E7FB10]" data-testid="text-bundle-price">
                ${getDiscountedPrice().toFixed(2)}
              </span>
              <span className="text-lg text-muted-foreground line-through">
                ${bundlePricing?.retailValue.toFixed(2) ?? "—"}
              </span>
              {getSelectedDiscount() > 0 && (
                <Badge variant="outline" className="text-xs">
                  {getSelectedDiscount()}% off
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {bundle.description}
            </p>

            <div className="mb-4">
              <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Quantity</Label>
              <div className="flex items-center border border-border rounded-md h-9">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  data-testid="button-quantity-minus"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="flex-1 text-center font-medium text-sm" data-testid="text-quantity">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 10}
                  data-testid="button-quantity-plus"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Purchase Option</Label>
              <div className="grid grid-cols-2 gap-2">
                <div 
                  className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    purchaseType === "one-time" 
                      ? "border-[#E7FB10] bg-[#E7FB10]/5" 
                      : "border-border hover:border-border/80"
                  }`}
                  onClick={() => setPurchaseType("one-time")}
                  data-testid="option-one-time"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span className="font-medium text-sm">One-time</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ${getBasePrice().toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div 
                  className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    purchaseType === "subscription" 
                      ? "border-[#21d8ff] bg-[#21d8ff]/5" 
                      : "border-border hover:border-border/80"
                  }`}
                  onClick={() => setPurchaseType("subscription")}
                  data-testid="option-subscription"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <Repeat className="h-3.5 w-3.5" />
                      <span className="font-medium text-sm">Subscribe</span>
                      <Badge className="bg-[#21d8ff] text-[10px] px-1 py-0">15% off</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Auto-delivery
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {purchaseType === "subscription" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Delivery Frequency</Label>
                <div className="grid grid-cols-3 gap-2">
                  {subscriptionOptions.map((option) => {
                    const discountedPrice = getBasePrice() * (1 - option.discount / 100);
                    return (
                      <div 
                        key={option.value}
                        className={`relative flex flex-col items-center p-2 rounded-lg border cursor-pointer transition-all ${
                          subscriptionInterval === option.value 
                            ? "border-[#21d8ff] bg-[#21d8ff]/5" 
                            : "border-border hover:border-border/80"
                        }`}
                        onClick={() => setSubscriptionInterval(option.value)}
                        data-testid={`option-interval-${option.value}`}
                      >
                        <span className="font-medium text-xs">{option.label}</span>
                        <span className="text-[10px] text-[#21d8ff]">{option.discount}% off</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                In Stock
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Lab Tested</span>
                <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Fast Ship</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                variant="outline"
                className="flex-1 font-display gap-2 border-2"
                onClick={handleAddToCart}
                disabled={!pricingReady}
                data-testid="button-add-to-cart"
              >
                <ShoppingBag className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                className={`flex-1 font-display gap-2 transition-shadow duration-300 text-black ${
                  purchaseType === "subscription" 
                    ? "bg-[#21d8ff] border-[#21d8ff] md:hover:bg-[#21d8ff]/90 shadow-[0_0_20px_rgba(33,216,255,0.4)] md:hover:shadow-[0_0_40px_rgba(33,216,255,0.6)]" 
                    : "bg-[#E7FB10] border-[#E7FB10] md:hover:bg-[#E7FB10]/90 shadow-[0_0_20px_rgba(231,251,16,0.4)] md:hover:shadow-[0_0_40px_rgba(231,251,16,0.6)]"
                }`}
                onClick={handleBuyNow}
                disabled={!pricingReady}
                data-testid="button-buy-now"
              >
                {purchaseType === "subscription" ? (
                  <>
                    <Repeat className="h-5 w-5" />
                    Subscribe
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>

            {purchaseType === "subscription" && (
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                Save ${((getBasePrice() - getDiscountedPrice()) * quantity).toFixed(2)} per order • Cancel anytime
              </p>
            )}

            <Separator className="my-6" />

            <div className="grid grid-cols-4 gap-2 text-center mb-6">
              <div className="flex flex-col items-center gap-1">
                <Shield className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">3rd Party Tested</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FileCheck className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">COA Included</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">Guaranteed</span>
              </div>
            </div>

            {benefits.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display font-semibold text-lg mb-4">Key Benefits</h3>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-[#E7FB10] mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Card className="p-6 bg-red-950/30 border-2 border-red-500/50 animate-pulse-subtle" data-testid="card-ruo-disclaimer">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-red-500/20 border border-red-500/30">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-red-400 uppercase tracking-wider text-lg mb-2">
                    Research Use Only
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This product is sold for research purposes only and is not intended 
                    for human consumption. By purchasing, you confirm you are a qualified 
                    researcher and will use this product in accordance with all applicable 
                    federal and state laws and regulations.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
