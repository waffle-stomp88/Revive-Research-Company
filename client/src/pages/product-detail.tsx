import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  FlaskConical,
  Shield,
  Beaker,
  CheckCircle,
  Minus,
  Plus,
  ShoppingCart,
  FileCheck,
  Truck,
  RefreshCw,
  Repeat,
  Percent
} from "lucide-react";
import type { Product } from "@shared/schema";

type PurchaseType = "one-time" | "subscription";
type SubscriptionInterval = "weekly" | "biweekly" | "monthly";

const subscriptionOptions: { value: SubscriptionInterval; label: string; discount: number }[] = [
  { value: "weekly", label: "Weekly", discount: 15 },
  { value: "biweekly", label: "Every 2 Weeks", discount: 12 },
  { value: "monthly", label: "Monthly", discount: 10 },
];

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("one-time");
  const [subscriptionInterval, setSubscriptionInterval] = useState<SubscriptionInterval>("monthly");

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", params.id],
  });

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const getSelectedDiscount = () => {
    if (purchaseType === "one-time") return 0;
    const option = subscriptionOptions.find(o => o.value === subscriptionInterval);
    return option?.discount || 0;
  };

  const getDiscountedPrice = () => {
    if (!product) return 0;
    const basePrice = Number(product.price);
    const discount = getSelectedDiscount();
    return basePrice * (1 - discount / 100);
  };

  const getTotalPrice = () => {
    return getDiscountedPrice() * quantity;
  };

  const handleBuyNow = () => {
    if (product) {
      let url = `/checkout?productId=${product.id}&quantity=${quantity}`;
      if (purchaseType === "subscription") {
        url += `&subscription=true&interval=${subscriptionInterval}`;
      }
      setLocation(url);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen pt-24 md:pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            <div className="aspect-square bg-muted rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-12 bg-muted rounded w-1/3 mt-4" />
              <div className="h-4 bg-muted rounded w-full mt-6" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen pt-24 md:pt-32 pb-24 flex items-center justify-center">
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
    <main className="min-h-screen pt-24 md:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/products">
            <Button variant="ghost" className="gap-2 -ml-4" data-testid="button-back-products">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center sticky top-32">
              <FlaskConical className="h-32 w-32 text-muted-foreground/30" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                {product.category}
              </Badge>
              {product.featured && (
                <Badge className="bg-[#21d8ff]">Featured</Badge>
              )}
              {!product.inStock && (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4" data-testid="text-product-name">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-4xl font-bold" data-testid="text-product-price">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ${Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8" data-testid="text-product-description">
              {product.description}
            </p>

            <div className="space-y-6 mb-8">
              <div>
                <Label className="text-sm font-medium mb-3 block">Purchase Option:</Label>
                <RadioGroup 
                  value={purchaseType} 
                  onValueChange={(v) => setPurchaseType(v as PurchaseType)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <div 
                    className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      purchaseType === "one-time" 
                        ? "border-[#E7FB10] bg-[#E7FB10]/5" 
                        : "border-border hover:border-border/80"
                    }`}
                    onClick={() => setPurchaseType("one-time")}
                    data-testid="option-one-time"
                  >
                    <RadioGroupItem value="one-time" id="one-time" className="sr-only" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        <span className="font-medium">One-time Purchase</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        ${Number(product.price).toFixed(2)} per unit
                      </p>
                    </div>
                  </div>
                  
                  <div 
                    className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      purchaseType === "subscription" 
                        ? "border-[#21d8ff] bg-[#21d8ff]/5" 
                        : "border-border hover:border-border/80"
                    }`}
                    onClick={() => setPurchaseType("subscription")}
                    data-testid="option-subscription"
                  >
                    <RadioGroupItem value="subscription" id="subscription" className="sr-only" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Repeat className="h-4 w-4" />
                        <span className="font-medium">Subscribe & Save</span>
                        <Badge className="bg-[#21d8ff] text-xs">Up to 15% off</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Auto-delivery at your schedule
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {purchaseType === "subscription" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <Label className="text-sm font-medium">Delivery Frequency:</Label>
                  <RadioGroup 
                    value={subscriptionInterval} 
                    onValueChange={(v) => setSubscriptionInterval(v as SubscriptionInterval)}
                    className="space-y-2"
                  >
                    {subscriptionOptions.map((option) => {
                      const discountedPrice = Number(product.price) * (1 - option.discount / 100);
                      return (
                        <div 
                          key={option.value}
                          className={`relative flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                            subscriptionInterval === option.value 
                              ? "border-[#21d8ff] bg-[#21d8ff]/5" 
                              : "border-border hover:border-border/80"
                          }`}
                          onClick={() => setSubscriptionInterval(option.value)}
                          data-testid={`option-interval-${option.value}`}
                        >
                          <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              subscriptionInterval === option.value 
                                ? "border-[#21d8ff]" 
                                : "border-muted-foreground"
                            }`}>
                              {subscriptionInterval === option.value && (
                                <div className="w-2 h-2 rounded-full bg-[#21d8ff]" />
                              )}
                            </div>
                            <span className="font-medium">{option.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                              <Percent className="h-3 w-3 mr-1" />
                              {option.discount}% off
                            </Badge>
                            <span className="font-medium text-[#21d8ff]">
                              ${discountedPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Cancel or modify anytime. No commitment required.
                  </p>
                </motion.div>
              )}

              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">Quantity:</Label>
                <div className="flex items-center border border-border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    data-testid="button-quantity-minus"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                    data-testid="button-quantity-plus"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                size="lg"
                className={`flex-1 font-display gap-2 shadow-glow-sm hover:shadow-glow-lg transition-shadow duration-300 ${
                  purchaseType === "subscription" 
                    ? "bg-[#21d8ff] border-[#21d8ff]" 
                    : "bg-[#E7FB10] border-[#E7FB10]"
                }`}
                onClick={handleBuyNow}
                disabled={!product.inStock}
                data-testid="button-buy-now"
              >
                {purchaseType === "subscription" ? (
                  <>
                    <Repeat className="h-5 w-5" />
                    Subscribe - ${getTotalPrice().toFixed(2)}/{subscriptionInterval === "weekly" ? "wk" : subscriptionInterval === "biweekly" ? "2wks" : "mo"}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Buy Now - ${getTotalPrice().toFixed(2)}
                  </>
                )}
              </Button>
            </div>

            {purchaseType === "subscription" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 p-3 rounded-lg bg-[#21d8ff]/5 border border-[#21d8ff]/20">
                <Repeat className="h-4 w-4 text-[#21d8ff]" />
                <span>
                  You save <span className="font-semibold text-[#21d8ff]">${((Number(product.price) - getDiscountedPrice()) * quantity).toFixed(2)}</span> per order with this subscription
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="h-5 w-5 text-foreground" />
                <span>Third-Party Tested</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <FileCheck className="h-5 w-5 text-foreground" />
                <span>COA Included</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="h-5 w-5 text-foreground" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <RefreshCw className="h-5 w-5 text-foreground" />
                <span>Satisfaction Guaranteed</span>
              </div>
            </div>

            <Separator className="my-8" />

            {benefits.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display font-semibold text-lg mb-4">Key Benefits</h3>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-foreground mt-0.5 flex-shrink-0" />
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

            <Card className="p-6 bg-muted/50">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Beaker className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <h4 className="font-display font-semibold mb-2">Research Use Only</h4>
                  <p className="text-sm text-muted-foreground">
                    This product is sold for research purposes only and is not intended 
                    for human consumption. By purchasing, you confirm you are a qualified 
                    researcher and will use this product in accordance with all applicable 
                    laws and regulations.
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
