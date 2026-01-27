import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
  Package,
  Shield,
  Truck,
  AlertTriangle,
  Tag,
  X,
  Loader2,
  Thermometer,
  Clock,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import productImage from "@assets/reta bottle_1764310671562.jpg";

interface AppliedDiscount {
  code: string;
  percentage: number;
  type: "basic" | "personal";
  freeShipping?: boolean;
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getSubtotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(() => {
    const saved = localStorage.getItem("appliedDiscount");
    return saved ? JSON.parse(saved) : null;
  });

  const applyDiscountMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/discount/validate", { code });
      return response.json();
    },
    onSuccess: (data) => {
      const discount: AppliedDiscount = {
        code: data.code,
        percentage: data.percentage,
        type: data.type,
        freeShipping: data.freeShipping || false,
      };
      setAppliedDiscount(discount);
      localStorage.setItem("appliedDiscount", JSON.stringify(discount));
      setDiscountCode("");
      const description = data.freeShipping 
        ? `${data.percentage}% discount + Free Shipping applied!`
        : `${data.percentage}% discount has been applied to your order.`;
      toast({
        title: "Discount Applied!",
        description,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Invalid Code",
        description: error.message || "This discount code is not valid.",
        variant: "destructive",
      });
    },
  });

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) return;
    applyDiscountMutation.mutate(discountCode.trim().toUpperCase());
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    localStorage.removeItem("appliedDiscount");
    toast({
      title: "Discount Removed",
      description: "The discount code has been removed from your order.",
    });
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some products before checking out.",
        variant: "destructive",
      });
      return;
    }
    setLocation("/checkout?fromCart=true");
  };

  const subtotal = getSubtotal();
  const FREE_SHIPPING_THRESHOLD = 175;
  const FLAT_RATE_SHIPPING = 20;
  const hasFreeShippingFromDiscount = appliedDiscount?.freeShipping || false;
  const shipping = (subtotal >= FREE_SHIPPING_THRESHOLD || hasFreeShippingFromDiscount) ? 0 : FLAT_RATE_SHIPPING;
  const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.percentage) / 100 : 0;
  const total = subtotal - discountAmount + shipping;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't added any research compounds yet. Browse our catalog to find premium peptides.
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-[#E7FB10] text-black gap-2">
                <Package className="h-5 w-5" />
                Browse Products
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-12">
      <SEOHead title="Shopping Cart" description="Review your research compound order. Free shipping on orders over $175. Secure checkout with fast processing." canonicalPath="/cart" />
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/products">
            <Button variant="ghost" className="gap-2 -ml-4" data-testid="button-continue-shopping">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold mb-8"
        >
          Shopping Cart ({items.length} {items.length === 1 ? "item" : "items"})
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={`${item.productId}-${item.dosage}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-3 md:p-4" data-testid={`cart-item-${item.productId}`}>
                  <div className="flex gap-3 md:gap-4">
                    {/* Product Image - smaller on mobile */}
                    <Link 
                      href={item.bundleId ? `/bundles/${item.bundleId}` : `/products/${item.productId}`}
                      className="w-16 h-16 md:w-24 md:h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden cursor-pointer md:hover:ring-2 md:hover:ring-[#E7FB10]/50 transition-all"
                      data-testid={`link-cart-item-image-${item.productId}`}
                    >
                      <img
                        src={productImage}
                        alt={`${item.name} ${item.dosage} research peptide`}
                        className="w-full h-full object-contain p-1 md:p-2"
                      />
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      {/* Header row: Name + Delete button */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link 
                            href={item.bundleId ? `/bundles/${item.bundleId}` : `/products/${item.productId}`}
                            data-testid={`link-cart-item-name-${item.productId}`}
                          >
                            <h3 className="font-display font-semibold text-base md:text-lg md:hover:text-[#E7FB10] transition-colors cursor-pointer truncate" data-testid={`cart-item-name-${item.productId}`}>
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {item.dosage}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 md:h-9 md:w-9 text-red-400 md:hover:text-red-500 md:hover:bg-red-500/10 flex-shrink-0"
                          onClick={() => removeFromCart(item.productId, item.dosage)}
                          data-testid={`button-remove-${item.productId}`}
                        >
                          <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </Button>
                      </div>
                      
                      {/* Bottom row: Quantity + Price inline */}
                      <div className="flex items-center justify-between mt-2 md:mt-4">
                        <div className="flex items-center border border-border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 md:h-8 md:w-8"
                            onClick={() => updateQuantity(item.productId, item.dosage, item.quantity - 1)}
                            data-testid={`button-decrease-${item.productId}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 md:w-10 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 md:h-8 md:w-8"
                            onClick={() => updateQuantity(item.productId, item.dosage, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            data-testid={`button-increase-${item.productId}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {/* Price - condensed on mobile */}
                        <div className="text-right">
                          <p className="font-display font-bold text-base md:text-lg text-[#E7FB10]" data-testid={`cart-item-total-${item.productId}`}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          {/* Show "each" price only on desktop OR when quantity > 1 */}
                          {item.quantity > 1 ? (
                            <p className="text-[10px] md:text-xs text-muted-foreground">
                              ${item.price.toFixed(2)} ea
                            </p>
                          ) : (
                            <p className="hidden md:block text-xs text-muted-foreground">
                              ${item.price.toFixed(2)} each
                            </p>
                          )}
                          <span className="hidden md:inline text-xs font-semibold text-[#E7FB10]">Early access pricing preview</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                onClick={clearCart}
                data-testid="button-clear-cart"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4 md:p-6 md:sticky md:top-24">
                <h2 className="font-display font-semibold text-lg mb-4">Order Summary</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span data-testid="text-subtotal">${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">Discount ({appliedDiscount.percentage}%)</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={removeDiscount}
                          data-testid="button-remove-discount"
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-red-400" />
                        </Button>
                      </div>
                      <span className="text-green-500" data-testid="text-discount">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? "text-green-500" : ""}>
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping > 0 && amountToFreeShipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Add <span className="text-[#21d8ff] font-semibold">${amountToFreeShipping.toFixed(2)}</span> more for free shipping!
                    </p>
                  )}
                </div>

                <Separator className="my-4" />

                {!appliedDiscount ? (
                  <div className="mb-4">
                    <label className="text-xs text-muted-foreground mb-2 block">Discount Code</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyDiscount()}
                        className="flex-1 uppercase"
                        data-testid="input-discount-code"
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyDiscount}
                        disabled={!discountCode.trim() || applyDiscountMutation.isPending}
                        data-testid="button-apply-discount"
                      >
                        {applyDiscountMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-green-950/30 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-500" data-testid="text-applied-code">
                        {appliedDiscount.code}
                      </span>
                      <span className="text-xs text-muted-foreground">applied</span>
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="flex justify-between font-display font-bold text-xl mb-2">
                  <span>Total</span>
                  <span className="text-[#E7FB10]" data-testid="text-total">${total.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-[#E7FB10]/60 text-right mb-4">Preview pricing — subject to change at launch</p>

                <Button
                  size="lg"
                  className="w-full bg-[#E7FB10] text-black md:hover:bg-[#E7FB10]/90 gap-2 shadow-glow-sm md:hover:shadow-glow-lg transition-shadow"
                  onClick={handleCheckout}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5" />
                </Button>

                {/* Mobile: Compact icon row */}
                <div className="flex items-center justify-center gap-4 mt-4 md:hidden" data-testid="cart-mobile-trust-icons">
                  <Shield className="h-4 w-4 text-[#21d8ff]" />
                  <Truck className="h-4 w-4 text-[#E7FB10]" />
                  <FileCheck className="h-4 w-4 text-[#9d4edd]" />
                </div>
                
                {/* Desktop: Full trust indicators */}
                <div className="hidden md:block mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4 text-[#21d8ff]" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Truck className="h-4 w-4 text-[#21d8ff]" />
                    <span>Same-day shipping (orders before 12pm CT)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileCheck className="h-4 w-4 text-[#21d8ff]" />
                    <span>COA included with every order</span>
                  </div>
                </div>

                <Separator className="my-4 hidden md:block" />

                {/* Helpful Shipping Info - Desktop only */}
                <Card className="hidden md:block p-4 border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent mb-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-[#21d8ff]" />
                    What to Expect
                  </h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <Link href="/education/ordering-expectations">
                      <div className="flex items-center gap-1.5 text-[#21d8ff] hover:underline cursor-pointer" data-testid="link-ordering-expectations">
                        <span>Full ordering & delivery guide</span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </Link>
                    <Link href="/package-warm">
                      <div className="flex items-center gap-1.5 text-[#21d8ff] hover:underline cursor-pointer" data-testid="link-package-warm">
                        <span>Package arrived warm? Don't worry</span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </Link>
                    <p className="text-muted-foreground/70 pt-1">Cold packs available at checkout.</p>
                  </div>
                </Card>

                <Separator className="my-4 hidden md:block" />

                {/* RUO Warning - Compact on mobile */}
                <div className="p-3 md:p-4 bg-red-950/30 border border-red-500/40 rounded-lg animate-pulse-subtle" data-testid="cart-ruo-warning">
                  <div className="flex items-center md:items-start gap-2 md:gap-3">
                    <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-red-400 flex-shrink-0" />
                    <div className="flex md:flex-col items-center md:items-start gap-1 md:gap-0">
                      <p className="text-xs md:text-sm font-semibold text-red-400" data-testid="cart-ruo-title">Research Use Only</p>
                      <p className="hidden md:block text-xs text-muted-foreground" data-testid="cart-ruo-description">
                        Not for human consumption. All products are intended for laboratory research purposes only.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
