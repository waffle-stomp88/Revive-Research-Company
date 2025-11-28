import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
  AlertTriangle,
  Zap,
  Timer,
  Heart,
  Package,
} from "lucide-react";
import type { Product } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";

const BUNDLES = [
  {
    id: "wolverine-stack",
    name: "The Wolverine Stack",
    tagline: "Legendary Recovery",
    icon: Zap,
    description: "BPC-157 + TB-500 combination for accelerated tissue repair and healing research. The most popular peptide stack worldwide.",
    fullDescription: "Experience comprehensive tissue repair with the world's most trusted peptide combination. BPC-157 is renowned for its gastric and intestinal healing properties, while TB-500 (Thymosin Beta-4) supports cell migration and differentiation. This synergistic pairing is ideal for researchers studying wound healing, tissue regeneration, and recovery mechanisms.",
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
    description: "Epithalon + GHK-Cu + NAD+ for comprehensive cellular rejuvenation and longevity research applications.",
    fullDescription: "Optimize cellular aging research with three powerful compounds working synergistically. Epithalon activates telomerase for cellular senescence studies, GHK-Cu promotes collagen synthesis and tissue remodeling, while NAD+ supports cellular energy production. Perfect for comprehensive longevity and anti-aging research protocols.",
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
    description: "CJC-1295 + Ipamorelin for natural growth hormone optimization research. Ideal for athletic performance studies.",
    fullDescription: "Maximize growth hormone research with this potent combination of long-acting GHRH analog and selective GH secretagogue. CJC-1295 with DAC technology provides sustained GH release, while Ipamorelin offers selective GH stimulation with minimal cortisol and prolactin effects. Excellent for athletic performance and body composition research.",
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
    fullDescription: "The ultimate tissue regeneration research kit. Combine the proven healing power of BPC-157 and TB-500 with GHK-Cu's collagen synthesis support for comprehensive tissue repair. This three-peptide protocol addresses healing from multiple biological pathways, making it ideal for comprehensive wound healing and tissue regeneration studies.",
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

  const bundle = BUNDLES.find(b => b.id === params.id);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleBuyNow = () => {
    if (bundle) {
      const url = `/checkout?bundleId=${bundle.id}&quantity=${quantity}`;
      setLocation(url);
    }
  };

  const handleAddToCart = () => {
    if (bundle) {
      addToCart({
        bundleId: bundle.id,
        name: bundle.name,
        price: bundle.bundlePrice,
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

  const BundleIcon = bundle.icon;

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-12">
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
                <Package className="h-16 w-16 text-muted-foreground/30" />
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
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Save {bundle.savings}%
              </Badge>
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold mb-1" data-testid="text-bundle-name">
              {bundle.name}
            </h1>
            
            <p className="text-sm text-muted-foreground mb-4 font-medium">
              {bundle.tagline}
            </p>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-display text-3xl font-bold text-[#E7FB10]" data-testid="text-bundle-price">
                ${bundle.bundlePrice.toFixed(2)}
              </span>
              <span className="text-lg text-muted-foreground line-through">
                ${bundle.originalPrice.toFixed(2)}
              </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6" data-testid="text-bundle-description">
              {bundle.fullDescription}
            </p>

            <div className="mb-6">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Included Products
              </h3>
              <div className="flex flex-col gap-2">
                {bundle.products.map((product) => (
                  <div key={product} className="flex items-center gap-2 p-2 rounded border border-border/50 bg-muted/30">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{product}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-sm mb-3">Research Benefits</h3>
              <ul className="space-y-2">
                {bundle.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-[#E7FB10] flex-shrink-0 mt-1" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
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
                <span className="w-12 text-center font-medium" data-testid="text-quantity">
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

            <div className="flex gap-3 mb-6">
              <Button 
                onClick={handleBuyNow}
                className="flex-1 gap-2"
                size="lg"
                data-testid="button-buy-now"
              >
                <ShoppingCart className="h-4 w-4" />
                Buy Now
              </Button>
              <Button 
                onClick={handleAddToCart}
                variant="outline"
                className="flex-1 gap-2"
                size="lg"
                data-testid="button-add-to-cart"
              >
                Add to Cart
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
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
