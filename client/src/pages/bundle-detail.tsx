import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import {
  ArrowLeft,
  FlaskConical,
  Shield,
  CheckCircle,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Repeat,
  Zap,
  Timer,
  Heart,
} from "lucide-react";
import productImage from "@assets/reta bottle_1764310671562.jpg";

type PurchaseType = "one-time" | "subscription";
type SubscriptionInterval = "weekly" | "biweekly" | "monthly";

const subscriptionOptions: { value: SubscriptionInterval; label: string; discount: number }[] = [
  { value: "weekly", label: "Weekly", discount: 15 },
  { value: "biweekly", label: "Every 2 Weeks", discount: 12 },
  { value: "monthly", label: "Monthly", discount: 10 },
];

const BUNDLES = [
  {
    id: "wolverine-stack",
    name: "The Wolverine Stack",
    tagline: "Legendary Recovery",
    icon: Zap,
    description: "BPC-157 + TB-500 combination for accelerated tissue repair and healing research.",
    products: ["BPC-157", "TB-500"],
    originalPrice: 104.98,
    bundlePrice: 89.99,
    savings: 15,
    color: "cyan",
    benefits: [
      "Accelerated tissue repair mechanisms",
      "Synergistic peptide combination",
      "Ideal for healing research protocols",
      "Most popular stack worldwide",
      "Proven results in research settings"
    ]
  },
  {
    id: "longevity-stack",
    name: "Longevity Stack",
    tagline: "Age Optimization",
    icon: Timer,
    description: "Epithalon + GHK-Cu + NAD+ for comprehensive cellular rejuvenation and longevity research.",
    products: ["Epithalon", "GHK-Cu", "NAD+ Precursor"],
    originalPrice: 219.97,
    bundlePrice: 189.99,
    savings: 14,
    color: "yellow",
    benefits: [
      "Comprehensive cellular rejuvenation",
      "Multi-pathway longevity research",
      "Telomerase activation support",
      "Collagen and elastin synthesis",
      "Cellular energy optimization"
    ]
  },
  {
    id: "performance-stack",
    name: "Performance Stack",
    tagline: "Peak Output",
    icon: Zap,
    description: "CJC-1295 + Ipamorelin for natural growth hormone optimization research.",
    products: ["CJC-1295", "Ipamorelin"],
    originalPrice: 234.98,
    bundlePrice: 199.99,
    savings: 15,
    color: "cyan",
    benefits: [
      "Natural GH optimization",
      "Sustained hormone release",
      "Minimal side effect profile",
      "Performance enhancement research",
      "Proven athletic research model"
    ]
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
    color: "cyan",
    benefits: [
      "Full spectrum tissue repair",
      "Multiple biological pathways",
      "Comprehensive healing protocol",
      "Enhanced synergistic effects",
      "Maximum regeneration potential"
    ]
  },
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

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const getSelectedDiscount = () => {
    if (purchaseType === "one-time") return 0;
    const option = subscriptionOptions.find(o => o.value === subscriptionInterval);
    return option?.discount || 0;
  };

  const getBasePrice = () => {
    if (!bundle) return 0;
    return bundle.bundlePrice;
  };

  const getDiscountedPrice = () => {
    const basePrice = getBasePrice();
    const discount = getSelectedDiscount();
    return basePrice * (1 - discount / 100);
  };

  const getTotalPrice = () => {
    return getDiscountedPrice() * quantity;
  };

  const handleBuyNow = () => {
    if (bundle) {
      let url = `/checkout?bundleId=${bundle.id}&quantity=${quantity}`;
      if (purchaseType === "subscription") {
        url += `&subscription=true&interval=${subscriptionInterval}`;
      }
      setLocation(url);
    }
  };

  const handleAddToCart = () => {
    if (bundle) {
      addToCart({
        bundleId: bundle.id,
        name: bundle.name,
        price: getDiscountedPrice(),
        originalPrice: bundle.originalPrice,
        quantity,
      });
      toast({
        title: "Added to cart",
        description: `${quantity}x ${bundle.name} added to your cart.`,
      });
    }
  };

  if (!bundle) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-12 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">Bundle Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The bundle you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/products">
            <Button>Browse All Products</Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
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

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center sticky top-24">
              <div className="flex flex-col items-center justify-center gap-4 p-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  bundle.color === "cyan" ? "bg-cyan-500/10" : "bg-[#E7FB10]/10"
                }`}>
                  <bundle.icon className={`h-10 w-10 ${
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
                Save {bundle.savings}%
              </Badge>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold mb-1" data-testid="text-bundle-name">
              {bundle.name}
            </h1>
            
            <p className="text-sm text-muted-foreground mb-4 font-medium">
              {bundle.tagline}
            </p>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-3xl font-bold text-[#E7FB10]" data-testid="text-bundle-price">
                ${getDiscountedPrice().toFixed(2)}
              </span>
              <span className="text-lg text-muted-foreground line-through">
                ${bundle.originalPrice.toFixed(2)}
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
              <div className="text-xs font-medium mb-2 text-muted-foreground">Included: {bundle.products.join(", ")}</div>
            </div>

            <div className="mb-4">
              <Label className="text-xs font-medium mb-2 block text-muted-foreground">Quantity</Label>
              <div className="flex items-center border border-border rounded-md w-fit">
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
                <span className="w-12 text-center font-medium text-sm" data-testid="text-quantity">
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
              <Label className="text-xs font-medium mb-2 block text-muted-foreground">Purchase Option</Label>
              <div className="grid grid-cols-2 gap-2">
                <div 
                  className={`relative flex items-center p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
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
                  className={`relative flex items-center p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
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

            <div className="flex gap-3 mb-4">
              <Button 
                onClick={handleBuyNow}
                className="flex-1 gap-2"
                data-testid="button-buy-now"
              >
                <ShoppingCart className="h-4 w-4" />
                Buy Now
              </Button>
              <Button 
                onClick={handleAddToCart}
                variant="outline"
                className="flex-1 gap-2"
                data-testid="button-add-to-cart"
              >
                Add to Cart
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                In Stock
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Lab Tested</span>
                <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Fast Ship</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
