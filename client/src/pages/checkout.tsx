import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  FlaskConical,
  ShieldCheck,
  Lock,
  CreditCard,
  Truck,
  Loader2,
  Repeat,
  Percent,
} from "lucide-react";
import type { Product } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";

const subscriptionDiscounts: { [key: string]: number } = {
  weekly: 15,
  biweekly: 12,
  monthly: 10,
};

const intervalLabels: { [key: string]: string } = {
  weekly: "Weekly",
  biweekly: "Every 2 Weeks",
  monthly: "Monthly",
};

export default function Checkout() {
  const { toast } = useToast();

  const searchParams = new URLSearchParams(window.location.search);
  const productId = searchParams.get("productId");
  const quantity = parseInt(searchParams.get("quantity") || "1", 10);
  const isSubscription = searchParams.get("subscription") === "true";
  const interval = searchParams.get("interval") || "monthly";

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error("No product selected");
      
      const affiliateCode = localStorage.getItem('affiliateCode');
      
      const response = await apiRequest("POST", "/api/stripe/create-checkout-session", {
        productId: product.id,
        quantity,
        subscription: isSubscription,
        interval: interval,
        affiliateCode: affiliateCode || undefined,
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data: { url: string; sessionId: string }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout Failed",
        description: error.message || "There was an error initiating checkout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const discountPercent = isSubscription ? (subscriptionDiscounts[interval] || 10) : 0;
  const getDiscountedPrice = (price: number) => {
    return price * (1 - discountPercent / 100);
  };

  const handleCheckout = () => {
    checkoutMutation.mutate();
  };

  if (!productId) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">No Product Selected</h2>
          <p className="text-muted-foreground mb-6">
            Please select a product to purchase.
          </p>
          <Link href="/products">
            <Button data-testid="button-browse-products">Browse Products</Button>
          </Link>
        </Card>
      </main>
    );
  }

  if (productLoading) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
            <div>
              <div className="h-64 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The product you're trying to purchase doesn't exist.
          </p>
          <Link href="/products">
            <Button data-testid="button-browse-products">Browse Products</Button>
          </Link>
        </Card>
      </main>
    );
  }

  const basePrice = Number(product.price);
  const unitPrice = isSubscription ? getDiscountedPrice(basePrice) : basePrice;
  const subtotal = unitPrice * quantity;
  const savings = isSubscription ? (basePrice - unitPrice) * quantity : 0;
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href={`/products/${product.id}`}>
            <Button variant="ghost" className="gap-2 -ml-4" data-testid="button-back-product">
              <ArrowLeft className="h-4 w-4" />
              Back to Product
            </Button>
          </Link>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl md:text-4xl font-bold mb-8"
          data-testid="text-checkout-title"
        >
          Checkout
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 mb-6">
              <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Secure Payment
              </h2>
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  You'll be redirected to Stripe's secure checkout
                </p>
                <p className="text-sm text-muted-foreground">
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold mb-4">What to expect:</h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                  <span>Secure payment processing by Stripe</span>
                </li>
                <li className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                  <span>Enter your shipping address at checkout</span>
                </li>
                <li className="flex items-start gap-3">
                  <FlaskConical className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                  <span>Certificate of Authenticity included with shipment</span>
                </li>
              </ul>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 sticky top-32">
              <h2 className="font-display text-xl font-semibold mb-6">
                Order Summary
              </h2>

              {isSubscription && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20">
                  <Repeat className="h-4 w-4 text-[#21d8ff]" />
                  <span className="text-sm font-medium">
                    {intervalLabels[interval]} Subscription
                  </span>
                  <Badge className="bg-[#21d8ff] text-xs ml-auto">
                    <Percent className="h-3 w-3 mr-1" />
                    {discountPercent}% off
                  </Badge>
                </div>
              )}
              
              <div className="flex gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img 
                    src={productImage} 
                    alt={product.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold truncate" data-testid="text-order-product-name">
                    {product.name}
                    {isSubscription && <span className="text-[#21d8ff] text-sm ml-2">Subscription</span>}
                  </h3>
                  <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {isSubscription ? (
                      <>
                        <span className="font-semibold text-[#21d8ff]">${unitPrice.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground line-through">${basePrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="font-semibold">${basePrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {isSubscription && savings > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Subscription Savings</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">Free</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-between items-center mb-6">
                <span className="font-display text-lg font-semibold">
                  {isSubscription ? `Total per ${interval === 'weekly' ? 'week' : interval === 'biweekly' ? '2 weeks' : 'month'}` : 'Total'}
                </span>
                <span className="font-display text-2xl font-bold" data-testid="text-order-total">
                  ${total.toFixed(2)}
                </span>
              </div>

              <Button
                size="lg"
                className={`w-full font-display text-lg gap-2 ${
                  isSubscription 
                    ? "bg-[#21d8ff] hover:bg-[#21d8ff]/90" 
                    : "bg-[#E7FB10] hover:bg-[#E7FB10]/90"
                }`}
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending}
                data-testid="button-checkout"
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Redirecting...
                  </>
                ) : isSubscription ? (
                  <>
                    <Repeat className="h-5 w-5" />
                    Start Subscription
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    Proceed to Payment
                  </>
                )}
              </Button>

              {isSubscription && (
                <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Cancel anytime. No commitment required.
                </p>
              )}

              <p className="text-xs text-muted-foreground text-center mt-4">
                By proceeding, you agree to our terms of service and privacy policy.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
