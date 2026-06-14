import { useState, useEffect, useCallback } from "react";
import { FREE_SHIPPING_THRESHOLD, FLAT_RATE_SHIPPING } from "@shared/constants";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  X,
  Thermometer,
  FileCheck,
  ExternalLink,
  RefreshCw,
  Layers,
  Zap,
  Gift,
  Beaker,
  Tag,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCrossSellSuggestions } from "@/lib/pairing-intelligence";
import type { Product, ProductDosageStock } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";

function getSubscriptionLabel(interval: "weekly" | "biweekly" | "monthly" | undefined): string {
  switch (interval) {
    case "weekly": return "Every week";
    case "biweekly": return "Every 2 weeks";
    case "monthly": return "Every 4 weeks";
    default: return "Subscription";
  }
}

function getSubscriptionDiscount(interval: "weekly" | "biweekly" | "monthly" | undefined): number {
  switch (interval) {
    case "weekly": return 20;
    case "biweekly": return 18;
    case "monthly": return 15;
    default: return 15;
  }
}

function CrossSellCard({
  suggestedProduct,
  reason,
  forProduct,
  addToCart,
}: {
  suggestedProduct: Product;
  reason: string;
  forProduct: string;
  addToCart: (item: any) => void;
}) {
  const [selectedDosage, setSelectedDosage] = useState("");
  const productId = String(suggestedProduct.id);
  const dosageOpts = suggestedProduct.dosageOptions || [];

  const dosageStockQuery = useQuery<ProductDosageStock[]>({
    queryKey: [`/api/products/${productId}/dosage-stocks`],
    enabled: dosageOpts.length > 0,
  });
  const dosageStocks = dosageStockQuery.data ?? [];
  const hasDosageStockData = dosageStocks.length > 0;

  const inStockDosages = hasDosageStockData
    ? dosageOpts.filter((d: string) => {
        const stock = dosageStocks.find(ds => ds.dosage === d);
        return stock && stock.inStock && (stock.stockAmount ?? 0) > 0;
      })
    : [];

  const currentDosage = selectedDosage && inStockDosages.includes(selectedDosage)
    ? selectedDosage
    : inStockDosages[0] || "";

  if (dosageOpts.length === 0 || !dosageStockQuery.isSuccess || inStockDosages.length === 0) return null;

  const getDosagePrice = (dosage: string): number => {
    if (hasDosageStockData) {
      const stock = dosageStocks.find(ds => ds.dosage === dosage);
      if (stock?.price) return Number(stock.price);
    }
    return Number(suggestedProduct.price);
  };

  const displayPrice = getDosagePrice(currentDosage);
  const hasMultipleOptions = inStockDosages.length > 1;

  return (
    <div
      className="flex gap-3 p-3 rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/5 items-center"
      data-testid={`card-cross-sell-${suggestedProduct.id}`}
    >
      <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden border border-border/30">
        <img
          src={suggestedProduct.imageUrl || productImage}
          alt={suggestedProduct.name}
          className="w-full h-full object-contain p-1"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-semibold text-sm">{suggestedProduct.name}</span>
          <span className="text-sm font-bold text-[#D4FF1F]" data-testid={`text-cross-sell-price-${suggestedProduct.id}`}>
            ${Math.round(displayPrice)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{reason}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        {hasMultipleOptions ? (
          <Select value={currentDosage} onValueChange={setSelectedDosage}>
            <SelectTrigger className="h-7 w-[72px] text-xs" data-testid={`select-cross-sell-dosage-${suggestedProduct.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {inStockDosages.map((d: string) => (
                <SelectItem key={d} value={d} data-testid={`option-dosage-${suggestedProduct.id}-${d}`}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : currentDosage ? (
          <Badge variant="outline" className="text-xs px-2">{currentDosage}</Badge>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs px-3 border-[#22c55e]/40 text-[#22c55e]"
          disabled={!currentDosage}
          onClick={() => addToCart({
            productId,
            name: suggestedProduct.name,
            price: displayPrice,
            quantity: 1,
            dosage: currentDosage,
            image: suggestedProduct.imageUrl || undefined,
          })}
          data-testid={`button-cross-sell-add-${suggestedProduct.id}`}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}

interface FirstOrderStatus {
  isFirstOrder: boolean;
  bacWaterProductId: string | null;
  bacWaterName: string | null;
  bacWaterImageUrl: string | null;
  bacWaterDosage: string | null;
}

interface AppliedDiscount {
  code: string;
  percentage: number;
  type: "basic" | "personal";
  freeShipping?: boolean;
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getSubtotal, clearCart, addToCart, declineFreeItem } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [bannerDismissed, setBannerDismissed] = useState(() =>
    typeof window !== "undefined" && !!localStorage.getItem("revive-bac-banner-dismissed")
  );
  const [discountCode, setDiscountCode] = useState("");
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [inlineCTAVisible, setInlineCTAVisible] = useState(false);
  const [inlineCTAEl, setInlineCTAEl] = useState<HTMLButtonElement | null>(null);
  const inlineCTARef = useCallback((node: HTMLButtonElement | null) => setInlineCTAEl(node), []);

  useEffect(() => {
    if (!inlineCTAEl) return;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Short delay so bar lingers briefly before fading
          hideTimer = setTimeout(() => setInlineCTAVisible(true), 400);
        } else {
          if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
          setInlineCTAVisible(false);
        }
      },
      {
        threshold: 0.5,
        // Exclude the bottom 130px of viewport (64px nav + 60px sticky bar + buffer)
        // so the CTA only registers as "in view" when it's genuinely clear of both bars
        rootMargin: "0px 0px -130px 0px",
      }
    );
    observer.observe(inlineCTAEl);
    return () => {
      observer.disconnect();
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [inlineCTAEl]);
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
      toast({
        title: "Discount Applied!",
        description: data.freeShipping
          ? `${data.percentage}% discount + Free Shipping applied!`
          : `${data.percentage}% discount has been applied to your order.`,
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
    toast({ title: "Discount Removed", description: "The discount code has been removed from your order." });
  };

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: currentUser } = useQuery<{ id: string } | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: firstOrderStatus } = useQuery<FirstOrderStatus>({
    queryKey: ["/api/my-first-order-status"],
    queryFn: async () => {
      const res = await fetch("/api/my-first-order-status", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 60_000,
  });

  // Free BAC water injection is handled by CartContext — no duplicate effect here.

  // BAC water paid upsell — shown when BAC water isn't already in cart
  const bacWaterUpsell = allProducts.find(p =>
    p.inStock !== false && (
      p.name.toLowerCase().includes("bacteriostatic") ||
      p.name.toLowerCase().includes("bac water")
    )
  );
  const bacWaterInCart = bacWaterUpsell
    ? items.some(i => String(i.productId) === String(bacWaterUpsell.id))
    : true;
  const showBacWaterUpsell = !!bacWaterUpsell && !bacWaterInCart && !firstOrderStatus?.isFirstOrder;

  const handleAddBacWater = () => {
    if (!bacWaterUpsell) return;
    const dosage = (bacWaterUpsell.dosageOptions || [])[0] || "";
    addToCart({
      productId: String(bacWaterUpsell.id),
      name: bacWaterUpsell.name,
      price: Number(bacWaterUpsell.price),
      quantity: 1,
      dosage,
      image: bacWaterUpsell.imageUrl || undefined,
    });
    toast({ title: "Added to cart", description: `${bacWaterUpsell.name} added.` });
  };

  const crossSellSuggestions = getCrossSellSuggestions(items.map(i => i.name));
  const crossSellProducts = crossSellSuggestions.map(s => {
    const product = allProducts.find(p =>
      p.name.toLowerCase() === s.product.toLowerCase() ||
      p.name.toLowerCase().includes(s.product.toLowerCase()) ||
      s.product.toLowerCase().includes(p.name.toLowerCase())
    );
    return { ...s, product };
  }).filter(s => s.product && s.product.inStock);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({ title: "Cart is empty", description: "Add some products before checking out.", variant: "destructive" });
      return;
    }
    const hasPaidItems = items.some((i) => !i.isFree);
    if (!hasPaidItems) {
      toast({ title: "Add a product first", description: "Free BAC water is included with a product purchase — add a compound to your cart.", variant: "destructive" });
      return;
    }
    setLocation("/checkout?fromCart=true");
  };

  const subtotal = getSubtotal();
  const hasFreeShippingFromDiscount = appliedDiscount?.freeShipping || false;
  const shipping = (subtotal >= FREE_SHIPPING_THRESHOLD || hasFreeShippingFromDiscount) ? 0 : FLAT_RATE_SHIPPING;
  const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.percentage) / 100 : 0;
  const total = subtotal - discountAmount + shipping;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-12 px-3 sm:px-4 md:px-8">
        <div className="max-w-4xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't added any research compounds yet. Browse our catalog to find premium peptides.
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-[#D4FF1F] text-black gap-2">
                <Package className="h-5 w-5" />
                Browse Products
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  const researchPairingsSection = crossSellProducts.length > 0 ? (
    <div data-testid="cart-cross-sell-section">
      <h3 className="font-display font-semibold mb-1 flex items-center gap-2 text-base">
        <Zap className="h-4 w-4 text-[#22c55e]" />
        Research Pairings
      </h3>
      <p className="text-[10px] text-muted-foreground mb-3">
        Based on your cart, these compounds share complementary mechanisms.
      </p>
      <div className="space-y-2">
        {crossSellProducts.map(({ product: suggestedProduct, reason, forProduct }) => (
          <CrossSellCard
            key={suggestedProduct!.id}
            suggestedProduct={suggestedProduct!}
            reason={reason}
            forProduct={forProduct}
            addToCart={addToCart}
          />
        ))}
      </div>
    </div>
  ) : null;

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-36 md:pb-12 px-3 sm:px-4 md:px-8">
      <SEOHead
        title="Cart"
        description={`Review your research compound order. Free shipping on orders over $${FREE_SHIPPING_THRESHOLD}. Secure checkout with fast processing.`}
        canonicalPath="/cart"
      />
      <div className="max-w-6xl mx-auto w-full">
        {/* Back + Title */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4">
          <Link href="/products">
            <Button variant="ghost" className="gap-2 -ml-2 md:-ml-4" data-testid="button-continue-shopping">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-2xl md:text-3xl font-bold mb-6">
          Shopping Cart
          <span className="text-muted-foreground font-normal text-base ml-2">({items.length} {items.length === 1 ? "item" : "items"})</span>
        </motion.h1>

        {/*
          Mobile layout (flex-col): cart items → summary+CTA → research pairings
          Desktop layout (lg:grid 3-col): left 2/3 = cart + pairings, right 1/3 = sticky summary
        */}
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">

          {/* ====== CART ITEMS — order 1 on mobile, left col on desktop ====== */}
          <div className="order-1 lg:col-span-2 space-y-3">
            {/* First-order free BAC water banner */}
            {!!currentUser && firstOrderStatus?.isFirstOrder && !!firstOrderStatus.bacWaterProductId && !bannerDismissed && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-[#22c55e]/40 bg-[#22c55e]/10"
                data-testid="banner-first-order-bac"
              >
                <Gift className="h-5 w-5 text-[#22c55e] flex-shrink-0" />
                <p className="text-sm text-[#22c55e] flex-1 font-medium">
                  First order? BAC Water's on us — 3ml Bacteriostatic Water added free.
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-[#22c55e]/60 hover:text-[#22c55e]"
                  onClick={() => { setBannerDismissed(true); localStorage.setItem("revive-bac-banner-dismissed", "1"); }}
                  data-testid="button-dismiss-first-order-banner"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            )}

            {items.map((item, index) => {
              const isCustomStack = item.bundleId?.startsWith("custom-");
              const cardContent = (
                <Card
                  className={`p-2.5 md:p-3 transition-all duration-300 border-2 ${
                    isCustomStack
                      ? "border-[#9d4edd]/40"
                      : "border-[#21d8ff]/40 cursor-pointer md:hover:border-[#21d8ff] md:hover:shadow-[0_0_30px_rgba(33,216,255,0.5),0_0_60px_rgba(33,216,255,0.2)] md:hover:scale-[1.01]"
                  }`}
                  data-testid={`cart-item-${item.productId}`}
                >
                  {/* ── MOBILE layout (hidden md+) ─────────────────────────────── */}
                  <div className="flex gap-2.5 items-center md:hidden">
                    {/* Image */}
                    <div
                      className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden"
                      data-testid={`cart-item-image-${item.productId}`}
                    >
                      <img
                        src={item.image || productImage}
                        alt={`${item.name} ${item.dosage} research peptide`}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>

                    {/* Text + controls column */}
                    <div className="flex-1 min-w-0">
                      {/* Row 1: name (left) · price ONLY (right) — no icon so row = text height ~18px */}
                      <div className="flex items-baseline gap-2 justify-between">
                        <div className="flex items-center gap-1 flex-wrap min-w-0 leading-tight">
                          <h3
                            className="font-display font-bold text-lg leading-tight"
                            data-testid={`cart-item-name-${item.productId}`}
                          >
                            {item.name}
                          </h3>
                          {item.packSize && (
                            <Badge className="bg-[#D4FF1F]/20 text-[#D4FF1F] border-[#D4FF1F]/30 gap-1 text-[10px] px-1.5 py-0" data-testid={`badge-pack-${item.productId}-${item.packSize}`}>
                              <Package className="h-2.5 w-2.5" />{item.packSize}-Pack
                            </Badge>
                          )}
                          {item.isSubscription && (
                            <Badge className="bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30 gap-1 text-[10px] px-1.5 py-0" data-testid={`badge-subscription-${item.productId}`}>
                              <RefreshCw className="h-2.5 w-2.5" />Subscribe
                            </Badge>
                          )}
                          {(item.isBundle || item.bundleId) && (
                            <Badge className="bg-[#9d4edd]/20 text-[#9d4edd] border-[#9d4edd]/30 gap-1 text-[10px] px-1.5 py-0" data-testid={`badge-stack-${item.productId || item.bundleId}`}>
                              <Layers className="h-2.5 w-2.5" />{isCustomStack ? "Custom Stack" : "Stack"}
                            </Badge>
                          )}
                        </div>
                        {/* Price only — no icon here so this row stays text-height */}
                        {item.isFree ? (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="font-display font-bold text-lg text-[#22c55e]">$0.00</span>
                            {item.originalPrice && (
                              <span className="text-xs text-muted-foreground line-through">${item.originalPrice}</span>
                            )}
                          </div>
                        ) : (
                          <span
                            className="font-display font-bold text-lg text-[#D4FF1F] flex-shrink-0"
                            data-testid={`cart-item-total-${item.productId}`}
                          >
                            ${Math.round(item.price * item.quantity)}
                          </span>
                        )}
                      </div>

                      {/* Row 2: dosage (left) · stepper + trash (right) — both icons on same row = single icon-height row */}
                      <div
                        className="flex items-center justify-between mt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div>
                          <p className="text-xs text-muted-foreground">{item.dosage}</p>
                          {item.isSubscription && (
                            <p className="text-xs text-[#21d8ff]" data-testid={`subscription-details-${item.productId}`}>
                              {getSubscriptionLabel(item.subscriptionInterval)} · {getSubscriptionDiscount(item.subscriptionInterval)}% off
                            </p>
                          )}
                        </div>
                        {item.isFree ? (
                          <div className="flex items-center gap-1.5">
                            <Badge className="bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/40 gap-1 text-[10px] px-1.5 py-0" data-testid={`badge-free-${item.productId}`}>
                              <Gift className="h-2.5 w-2.5" />First Order Perk
                            </Badge>
                            <Button
                              variant="ghost" size="icon"
                              className="text-muted-foreground hover:text-red-400 h-7 w-7"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); declineFreeItem(item.productId); }}
                              data-testid={`button-decline-free-${item.productId}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center border border-border rounded-md">
                              <Button
                                variant="ghost" size="sm" className="h-7 w-7 p-0"
                                onClick={(e) => { e.preventDefault(); updateQuantity(item.productId, item.dosage, item.quantity - 1, item.packSize); }}
                                data-testid={`button-decrease-${item.productId}`}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                              <Button
                                variant="ghost" size="sm" className="h-7 w-7 p-0"
                                onClick={(e) => { e.preventDefault(); updateQuantity(item.productId, item.dosage, item.quantity + 1, item.packSize); }}
                                disabled={item.quantity >= 10}
                                data-testid={`button-increase-${item.productId}`}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost" size="icon"
                              className="text-muted-foreground hover:text-red-400 h-7 w-7"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromCart(item.productId, item.dosage, item.packSize); }}
                              data-testid={`button-remove-${item.productId}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── DESKTOP layout (hidden below md) ──────────────────────── */}
                  <div className="hidden md:flex gap-3 items-center">
                    <div
                      className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden"
                      data-testid={`cart-item-image-${item.productId}`}
                    >
                      <img
                        src={item.image || productImage}
                        alt={`${item.name} ${item.dosage} research peptide`}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-display font-bold text-xl" data-testid={`cart-item-name-${item.productId}`}>{item.name}</h3>
                        {item.packSize && (
                          <Badge className="bg-[#D4FF1F]/20 text-[#D4FF1F] border-[#D4FF1F]/30 gap-1 text-[10px] px-1.5 py-0" data-testid={`badge-pack-${item.productId}-${item.packSize}`}>
                            <Package className="h-2.5 w-2.5" />{item.packSize}-Pack
                          </Badge>
                        )}
                        {item.isSubscription && (
                          <Badge className="bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30 gap-1 text-[10px] px-1.5 py-0" data-testid={`badge-subscription-${item.productId}`}>
                            <RefreshCw className="h-2.5 w-2.5" />Subscribe
                          </Badge>
                        )}
                        {(item.isBundle || item.bundleId) && (
                          <Badge className="bg-[#9d4edd]/20 text-[#9d4edd] border-[#9d4edd]/30 gap-1 text-[10px] px-1.5 py-0" data-testid={`badge-stack-${item.productId || item.bundleId}`}>
                            <Layers className="h-2.5 w-2.5" />{isCustomStack ? "Custom Stack" : "Stack"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.dosage}</p>
                      {item.isSubscription && (
                        <p className="text-xs text-[#21d8ff]" data-testid={`subscription-details-${item.productId}`}>
                          {getSubscriptionLabel(item.subscriptionInterval)} · {getSubscriptionDiscount(item.subscriptionInterval)}% off
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-center gap-2 flex-shrink-0">
                      {item.isFree ? (
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-bold text-2xl text-[#22c55e]" data-testid={`cart-item-total-${item.productId}`}>$0.00</span>
                            {item.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">${item.originalPrice}</span>
                            )}
                            <Button
                              variant="ghost" size="icon"
                              className="text-muted-foreground hover:text-red-400 h-7 w-7"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); declineFreeItem(item.productId); }}
                              data-testid={`button-decline-free-${item.productId}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <Badge className="bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/40 gap-1 text-xs px-2 py-0.5" data-testid={`badge-free-${item.productId}`}>
                            <Gift className="h-3 w-3" />First Order Perk
                          </Badge>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-bold text-2xl text-[#D4FF1F]" data-testid={`cart-item-total-${item.productId}`}>
                              ${Math.round(item.price * item.quantity)}
                            </span>
                            <Button
                              variant="ghost" size="icon"
                              className="text-muted-foreground hover:text-red-400 h-7 w-7"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromCart(item.productId, item.dosage, item.packSize); }}
                              data-testid={`button-remove-${item.productId}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="flex items-center border border-border rounded-md" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost" size="sm" className="h-7 w-7 p-0"
                              onClick={(e) => { e.preventDefault(); updateQuantity(item.productId, item.dosage, item.quantity - 1, item.packSize); }}
                              data-testid={`button-decrease-${item.productId}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-7 text-center font-medium text-sm">{item.quantity}</span>
                            <Button
                              variant="ghost" size="sm" className="h-7 w-7 p-0"
                              onClick={(e) => { e.preventDefault(); updateQuantity(item.productId, item.dosage, item.quantity + 1, item.packSize); }}
                              disabled={item.quantity >= 10}
                              data-testid={`button-increase-${item.productId}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );

              const getCartItemHref = () => {
                if (!item.bundleId) return `/peptides/${item.productId}`;
                if (item.dosage === "Research Stack") return `/research-stacks/${item.bundleId}`;
                return `/bundles/${item.bundleId}`;
              };

              return (
                <motion.div
                  key={`${item.productId}-${item.dosage}-${item.isFree ? 'free' : 'paid'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {isCustomStack ? cardContent : (
                    <Link href={getCartItemHref()} className="block" data-testid={`link-cart-item-card-${item.productId}`}>
                      {cardContent}
                    </Link>
                  )}
                </motion.div>
              );
            })}

            {/* Research Pairings — desktop only (mobile version lives in sidebar) */}
            {crossSellProducts.length > 0 && (
              <div className="hidden lg:block mt-4 pt-4 border-t border-border/30">
                {researchPairingsSection}
              </div>
            )}

            {/* What to Expect — desktop only */}
            <Card className="hidden lg:block p-4 border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-[#21d8ff]" />
                What to Expect
              </h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <Link href="/guides/ordering-expectations">
                  <div className="flex items-center gap-1.5 text-[#21d8ff] hover:underline cursor-pointer" data-testid="link-ordering-expectations">
                    <span>Full ordering & delivery guide</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </Link>
                <Link href="/guides/peptide-package-arrived-warm">
                  <div className="flex items-center gap-1.5 text-[#21d8ff] hover:underline cursor-pointer" data-testid="link-package-warm">
                    <span>Package arrived warm? Don't worry</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </Card>
          </div>

          {/* ====== SUMMARY + CTA + UPSELLS — order 2 on mobile, right sticky col on desktop ====== */}
          <div className="order-2 lg:col-start-3 lg:row-start-1 lg:row-span-2">
            <div className="lg:sticky lg:top-24 space-y-3">

              {/* Order Summary */}
              <Card className="p-3 md:p-4" data-testid="card-order-summary">
                <h2 className="font-display font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-2.5">Order Summary</h2>

                {/* Line items — compact */}
                <div className="space-y-1.5 text-sm mb-2.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span data-testid="text-subtotal">${Math.round(subtotal)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Tag className="h-3 w-3 text-green-500" />
                        <span className="text-green-500 text-xs">Discount ({appliedDiscount.percentage}%)</span>
                      </div>
                      <span className="text-green-500" data-testid="text-discount">-${Math.round(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? "text-green-500 font-medium" : ""}>
                      {shipping === 0 ? "FREE" : `$${Math.round(shipping)}`}
                    </span>
                  </div>
                  {shipping > 0 && amountToFreeShipping > 0 && (
                    <p className="text-[10px] text-[#21d8ff]">Add ${Math.round(amountToFreeShipping)} more for free shipping</p>
                  )}
                </div>

                {/* Discount code — collapsed by default, expands on tap */}
                {!appliedDiscount ? (
                  <div className="mb-2.5">
                    {!showDiscountInput ? (
                      <button
                        onClick={() => setShowDiscountInput(true)}
                        className="text-xs text-muted-foreground/60 hover:text-[#21d8ff] transition-colors flex items-center gap-1"
                        data-testid="button-show-discount-input"
                      >
                        <Tag className="h-3 w-3" />
                        Have a discount code?
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter code"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyDiscount()}
                          className="flex-1 uppercase text-sm h-8"
                          autoFocus
                          data-testid="input-discount-code"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs"
                          onClick={handleApplyDiscount}
                          disabled={!discountCode.trim() || applyDiscountMutation.isPending}
                          data-testid="button-apply-discount"
                        >
                          {applyDiscountMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-2.5 px-2.5 py-1.5 bg-green-950/30 border border-green-500/30 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3 w-3 text-green-500" />
                      <span className="text-xs font-medium text-green-500" data-testid="text-applied-code">{appliedDiscount.code}</span>
                      <span className="text-[10px] text-muted-foreground">applied</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground hover:text-red-400"
                      onClick={removeDiscount}
                      data-testid="button-remove-discount"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Total row */}
                <div className="flex justify-between items-center pt-2 border-t border-border/40">
                  <span className="font-display font-bold text-base">Total</span>
                  <div className="text-right">
                    <div className="font-display font-bold text-2xl text-[#D4FF1F]" data-testid="text-total">${Math.round(total)}</div>
                    <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Tax calculated at checkout</p>
                  </div>
                </div>
              </Card>

              {/* Checkout CTA */}
              <Button
                ref={inlineCTARef}
                size="lg"
                className="w-full bg-[#D4FF1F] text-black font-display font-bold text-base gap-2 shadow-glow-sm"
                onClick={handleCheckout}
                data-testid="button-checkout"
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5" />
              </Button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground py-1" data-testid="cart-trust-badges">
                <div className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-[#21d8ff]" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-[#D4FF1F]" />
                  <span>Same-day shipping</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileCheck className="h-3.5 w-3.5 text-[#9d4edd]" />
                  <span>COA included</span>
                </div>
              </div>

              <Separator className="opacity-30" />

              {/* BAC Water Upsell */}
              {showBacWaterUpsell && (
                <div className="p-3 rounded-lg border border-[#0ea5e9]/30 bg-[#0ea5e9]/5" data-testid="bac-water-upsell-cart">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center flex-shrink-0">
                      <Beaker className="h-4 w-4 text-[#0ea5e9]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold mb-0.5">Missing something?</p>
                      <p className="text-[10px] text-muted-foreground mb-2 leading-relaxed">
                        Add bacteriostatic water to reconstitute your peptides
                      </p>
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white px-3"
                        onClick={handleAddBacWater}
                        data-testid="button-add-bac-water-upsell"
                      >
                        + Add {bacWaterUpsell?.name} — ${Math.round(Number(bacWaterUpsell?.price))}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Research Pairings — mobile only (desktop version in left col) */}
              {crossSellProducts.length > 0 && (
                <div className="lg:hidden space-y-2">
                  <Separator className="opacity-30" />
                  {researchPairingsSection}
                </div>
              )}

              {/* What to Expect — mobile only (desktop in left col) */}
              <div className="lg:hidden rounded-lg border border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent p-3">
                <h4 className="text-xs font-semibold mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#21d8ff]/10 border border-[#21d8ff]/20 flex items-center justify-center flex-shrink-0">
                    <Thermometer className="h-3.5 w-3.5 text-[#21d8ff]" />
                  </span>
                  <span className="text-[#21d8ff] uppercase tracking-wider text-[10px] font-bold">What to Expect</span>
                </h4>
                <div className="space-y-2">
                  <Link href="/guides/ordering-expectations">
                    <div
                      className="flex items-center justify-between py-2 px-2.5 rounded-md bg-[#21d8ff]/5 border border-[#21d8ff]/10 hover:border-[#21d8ff]/30 transition-colors cursor-pointer"
                      data-testid="link-ordering-expectations-mobile"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-[#21d8ff] flex-shrink-0" />
                        <span className="text-xs font-medium">Full ordering & delivery guide</span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-[#21d8ff]/50 flex-shrink-0" />
                    </div>
                  </Link>
                  <Link href="/guides/peptide-package-arrived-warm">
                    <div
                      className="flex items-center justify-between py-2 px-2.5 rounded-md bg-[#21d8ff]/5 border border-[#21d8ff]/10 hover:border-[#21d8ff]/30 transition-colors cursor-pointer"
                      data-testid="link-package-warm-mobile"
                    >
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-3.5 w-3.5 text-[#21d8ff] flex-shrink-0" />
                        <span className="text-xs font-medium">Package arrived warm? Don't worry</span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-[#21d8ff]/50 flex-shrink-0" />
                    </div>
                  </Link>
                </div>
              </div>

              {/* RUO Disclaimer */}
              <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-lg" data-testid="cart-ruo-warning">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-red-400" data-testid="cart-ruo-title">Research Use Only</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5" data-testid="cart-ruo-description">
                      Not for human consumption. For laboratory research purposes only.
                    </p>
                  </div>
                </div>
              </div>

              {/* Clear cart — subtle text link, not a button */}
              <div className="text-center pt-1">
                <button
                  onClick={clearCart}
                  className="text-[10px] text-muted-foreground/50 hover:text-red-400/70 transition-colors underline-offset-2 hover:underline"
                  data-testid="button-clear-cart"
                >
                  Clear cart
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky bottom CTA — mobile only, fades out when inline CTA is visible */}
      <motion.div
        className="md:hidden fixed bottom-16 left-0 right-0 z-50"
        animate={{ y: inlineCTAVisible ? 80 : 0, opacity: inlineCTAVisible ? 0 : 1 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        style={{ pointerEvents: inlineCTAVisible ? "none" : "auto" }}
        data-testid="sticky-cart-bar-mobile-cart"
      >
        <div className="bg-background/95 backdrop-blur-sm border-t border-border p-3 safe-area-pb">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex-shrink-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-none mb-0.5">Total</p>
              <p className="font-display font-bold text-xl text-[#D4FF1F]" data-testid="text-total-sticky">${Math.round(total)}</p>
            </div>
            <Button
              size="lg"
              className="flex-1 bg-[#D4FF1F] text-black font-display font-bold gap-2 shadow-glow-sm"
              onClick={handleCheckout}
              data-testid="button-checkout-sticky"
            >
              Proceed to Checkout
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
