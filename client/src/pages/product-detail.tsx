import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ShoppingBag,
  FileCheck,
  Truck,
  RefreshCw,
  Repeat,
  Percent,
  AlertTriangle
} from "lucide-react";
import type { Product } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";

type PurchaseType = "one-time" | "subscription";
type SubscriptionInterval = "weekly" | "biweekly" | "monthly";

const subscriptionOptions: { value: SubscriptionInterval; label: string; discount: number }[] = [
  { value: "weekly", label: "Weekly", discount: 15 },
  { value: "biweekly", label: "Every 2 Weeks", discount: 12 },
  { value: "monthly", label: "Monthly", discount: 10 },
];

const dosageMultipliers: Record<string, number> = {
  "10mg": 1.0,
  "15mg": 1.25,
  "20mg": 1.50,
};

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedDosage, setSelectedDosage] = useState<string>("10mg");
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("one-time");
  const [subscriptionInterval, setSubscriptionInterval] = useState<SubscriptionInterval>("monthly");

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", params.id],
  });

  useEffect(() => {
    if (product?.dosageOptions && product.dosageOptions.length > 0) {
      setSelectedDosage(product.dosageOptions[0]);
    }
  }, [product]);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const getDosageMultiplier = () => {
    return dosageMultipliers[selectedDosage] || 1.0;
  };

  const getBasePrice = () => {
    if (!product) return 0;
    return Number(product.price) * getDosageMultiplier();
  };

  const getSelectedDiscount = () => {
    if (purchaseType === "one-time") return 0;
    const option = subscriptionOptions.find(o => o.value === subscriptionInterval);
    return option?.discount || 0;
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
    if (product) {
      let url = `/checkout?productId=${product.id}&quantity=${quantity}&dosage=${selectedDosage}`;
      if (purchaseType === "subscription") {
        url += `&subscription=true&interval=${subscriptionInterval}`;
      }
      setLocation(url);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: getBasePrice(),
        originalPrice: product.originalPrice ? Number(product.originalPrice) * getDosageMultiplier() : undefined,
        quantity,
        dosage: selectedDosage,
      });
      toast({
        title: "Added to cart",
        description: `${quantity}x ${product.name} (${selectedDosage}) added to your cart.`,
      });
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-12 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-full" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-12 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/products">
            <Button>Browse All Products</Button>
          </Link>
        </Card>
      </main>
    );
  }

  const benefits = product.benefits || [];

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
              <img 
                src={productImage} 
                alt={product.name}
                className="w-full h-full object-contain p-6"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                {product.category}
              </Badge>
              {product.originalPrice && (
                <Badge className="bg-red-600 text-white font-bold shadow-glow-red-sm">SALE!</Badge>
              )}
              {product.featured && (
                <Badge className="bg-[#21d8ff] text-black">Featured</Badge>
              )}
              {!product.inStock && (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2" data-testid="text-product-name">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-display text-3xl font-bold text-[#E7FB10]" data-testid="text-product-price">
                ${getBasePrice().toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ${(Number(product.originalPrice) * getDosageMultiplier()).toFixed(2)}
                </span>
              )}
              {selectedDosage !== "10mg" && (
                <Badge variant="outline" className="text-xs">
                  +{((getDosageMultiplier() - 1) * 100).toFixed(0)}% for {selectedDosage}
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4" data-testid="text-product-description">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {product.dosageOptions && product.dosageOptions.length > 0 && (
                <div>
                  <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Dosage</Label>
                  <Select value={selectedDosage} onValueChange={setSelectedDosage}>
                    <SelectTrigger data-testid="select-dosage" className="h-9">
                      <SelectValue placeholder="Select dosage" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.dosageOptions.map((dosage) => (
                        <SelectItem key={dosage} value={dosage}>
                          {dosage} {dosage !== "10mg" && `(+${((dosageMultipliers[dosage] || 1) - 1) * 100}%)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
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
              {product.inStock ? (
                <span className="flex items-center gap-1">
                  {product.stockAmount && product.stockAmount <= 20 ? (
                    <>
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      <span className="text-orange-500 font-medium">Only {product.stockAmount} left</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {product.stockAmount || 0} in stock
                    </>
                  )}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-400">
                  <AlertTriangle className="h-3 w-3" />
                  Out of stock
                </span>
              )}
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
                disabled={!product.inStock}
                data-testid="button-add-to-cart"
              >
                <ShoppingBag className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                className={`flex-1 font-display gap-2 transition-shadow duration-300 text-black ${
                  purchaseType === "subscription" 
                    ? "bg-[#21d8ff] border-[#21d8ff] hover:bg-[#21d8ff]/90 shadow-[0_0_20px_rgba(33,216,255,0.4)] hover:shadow-[0_0_40px_rgba(33,216,255,0.6)]" 
                    : "bg-[#E7FB10] border-[#E7FB10] hover:bg-[#E7FB10]/90 shadow-[0_0_20px_rgba(231,251,16,0.4)] hover:shadow-[0_0_40px_rgba(231,251,16,0.6)]"
                }`}
                onClick={handleBuyNow}
                disabled={!product.inStock}
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

            {product.usage && (
              <div className="mb-8">
                <h3 className="font-display font-semibold text-lg mb-4">Usage Information</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.usage}
                </p>
              </div>
            )}

            <Card className="p-6 bg-red-950/30 border-2 border-red-500/50 shadow-glow-red-sm">
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
