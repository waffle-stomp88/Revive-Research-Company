import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useCart } from "@/contexts/CartContext";
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
  User,
  LogIn,
  LogOut,
  UserPlus,
  CheckCircle,
  Clock,
  Package,
  ClipboardCheck,
  ExternalLink,
  Target,
  AlertTriangle,
  Beaker,
} from "lucide-react";
import type { Product, User as UserType } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";
import { getBundleById } from "@/lib/bundles";

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
  const { items: cartItems, getSubtotal, clearCart, addToCart } = useCart();
  const [showBacUpsell, setShowBacUpsell] = useState(true);
  const [hasColdPackShipping, setHasColdPackShipping] = useState(false);
  
  // RUO/Age reminder state - shown once per session on checkout
  const [showRuoReminder, setShowRuoReminder] = useState(false);
  const [ruoAcknowledged, setRuoAcknowledged] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  // Query for BAC water product
  const { data: bacWaterProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const bacWater = bacWaterProducts?.find(p => p.name.toLowerCase().includes("bacteriostatic"));
  
  // Check if cart has peptides but no BAC water
  const hasPeptides = cartItems.some(item => !item.name.toLowerCase().includes("bacteriostatic") && !item.name.toLowerCase().includes("supplies"));
  const hasBacWater = cartItems.some(item => item.name.toLowerCase().includes("bacteriostatic"));
  const shouldShowBacUpsell = showBacUpsell && hasPeptides && !hasBacWater && bacWater;

  const handleAddBacWater = () => {
    if (bacWater) {
      addToCart({
        productId: bacWater.id,
        name: bacWater.name,
        price: Number(bacWater.price),
        quantity: 1,
        dosage: bacWater.dosageOptions?.[0] || "30ML",
        image: productImage,
      });
      setShowBacUpsell(false);
      toast({
        title: "Added to cart",
        description: `${bacWater.name} added to your cart.`,
      });
    }
  };
  
  // Check if user has already acknowledged the RUO reminder this session
  useEffect(() => {
    const hasAcknowledged = sessionStorage.getItem('checkoutRuoAcknowledged');
    if (!hasAcknowledged) {
      setShowRuoReminder(true);
    }
  }, []);
  
  const handleRuoAcknowledge = () => {
    if (ruoAcknowledged && ageConfirmed) {
      sessionStorage.setItem('checkoutRuoAcknowledged', 'true');
      setShowRuoReminder(false);
    }
  };

  const searchParams = new URLSearchParams(window.location.search);
  const productId = searchParams.get("productId");
  const bundleId = searchParams.get("bundleId");
  const quantity = parseInt(searchParams.get("quantity") || "1", 10);
  const isSubscription = searchParams.get("subscription") === "true";
  const interval = searchParams.get("interval") || "monthly";
  const fromCart = searchParams.get("fromCart") === "true";

  const bundle = bundleId ? getBundleById(bundleId) : null;

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId && !fromCart && !bundleId,
  });

  const { data: user, isLoading: userLoading } = useQuery<UserType | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  const isAuthenticated = !!user;

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const affiliateCode = localStorage.getItem('affiliateCode');
      
      if (fromCart && cartItems.length > 0) {
        const response = await apiRequest("POST", "/api/stripe/create-checkout-session", {
          cartItems: cartItems.map(item => ({
            productId: item.productId,
            bundleId: item.bundleId,
            quantity: item.quantity,
            dosage: item.dosage,
            isBundle: item.isBundle,
          })),
          affiliateCode: affiliateCode || undefined,
        });
        const data = await response.json();
        return data;
      } else if (bundle) {
        const response = await apiRequest("POST", "/api/stripe/create-checkout-session", {
          bundleId: bundle.id,
          bundleName: bundle.name,
          bundlePrice: bundle.bundlePrice,
          quantity,
          subscription: isSubscription,
          interval: interval,
          affiliateCode: affiliateCode || undefined,
        });
        const data = await response.json();
        return data;
      } else if (product) {
        const response = await apiRequest("POST", "/api/stripe/create-checkout-session", {
          productId: product.id,
          quantity,
          subscription: isSubscription,
          interval: interval,
          affiliateCode: affiliateCode || undefined,
        });
        const data = await response.json();
        return data;
      } else {
        throw new Error("No product selected");
      }
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

  const FREE_SHIPPING_THRESHOLD = 175;
  const FLAT_RATE_SHIPPING = 20;
  const COLD_PACK_FEE = 10;
  const cartSubtotal = getSubtotal();
  const baseShipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_RATE_SHIPPING;
  const coldPackFee = hasColdPackShipping ? COLD_PACK_FEE : 0;
  const cartShipping = baseShipping + coldPackFee;
  const cartTotal = cartSubtotal + cartShipping;

  if (fromCart && cartItems.length === 0) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some products to your cart before checking out.
          </p>
          <Link href="/products">
            <Button data-testid="button-browse-products">Browse Products</Button>
          </Link>
        </Card>
      </main>
    );
  }

  if (!productId && !bundleId && !fromCart) {
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

  if (!fromCart && !product && !bundle) {
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

  // RUO/Age Reminder Dialog Component - Simple custom modal to avoid Radix state issues
  const RuoReminderDialog = () => {
    if (!showRuoReminder) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        
        {/* Modal */}
        <div className="relative bg-background border border-border rounded-lg shadow-lg max-w-md w-full">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h2 className="font-display text-xl font-semibold">Before You Continue</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Please confirm you understand the following
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Research Use Only Notice */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 animate-pulse-subtle">
                <div className="flex items-start gap-3">
                  <Beaker className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-red-400">Research Use Only</p>
                    <p className="text-xs text-muted-foreground">
                      These products are sold exclusively for scientific research purposes. 
                      They are not intended for human consumption, therapeutic use, or any other purpose.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Age Requirement Notice */}
              <div className="bg-[#E7FB10]/10 border border-[#E7FB10]/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#E7FB10] mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-[#E7FB10]">Age Requirement</p>
                    <p className="text-xs text-muted-foreground">
                      You must be 21 years or older to purchase research compounds from Revive Research.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Acknowledgment Checkboxes */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 cursor-pointer group" onClick={() => setRuoAcknowledged(!ruoAcknowledged)}>
                  <div 
                    className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                      ruoAcknowledged 
                        ? 'bg-red-500 border-red-500' 
                        : 'border-red-500/50'
                    }`}
                  >
                    {ruoAcknowledged && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors" data-testid="checkbox-ruo-acknowledge">
                    I understand these products are for <span className="text-red-400 font-medium">research purposes only</span> and not for human use
                  </span>
                </div>
                
                <div className="flex items-start gap-3 cursor-pointer group" onClick={() => setAgeConfirmed(!ageConfirmed)}>
                  <div 
                    className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                      ageConfirmed 
                        ? 'bg-[#E7FB10] border-[#E7FB10]' 
                        : 'border-[#E7FB10]/50'
                    }`}
                  >
                    {ageConfirmed && (
                      <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors" data-testid="checkbox-age-confirm">
                    I confirm I am <span className="text-[#E7FB10] font-medium">21 years of age or older</span>
                  </span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleRuoAcknowledge}
              disabled={!ruoAcknowledged || !ageConfirmed}
              className="w-full bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90 disabled:opacity-50 mt-6"
              data-testid="button-confirm-ruo"
            >
              Continue to Checkout
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (fromCart) {
    return (
      <>
        <RuoReminderDialog />
        <main className="min-h-screen pt-32 md:pt-40 pb-24">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <Link href="/cart" onClick={() => sessionStorage.removeItem('checkoutRuoAcknowledged')}>
                <Button variant="ghost" className="gap-2 -ml-4" data-testid="button-back-cart">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Cart
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
              {/* Account Section */}
              <Card className="p-6 mb-6">
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Account
                </h2>
                
                {userLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : isAuthenticated ? (
                  <div className="bg-[#E7FB10]/10 border border-[#E7FB10]/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E7FB10]/20 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-[#E7FB10]" />
                        </div>
                        <div>
                          <p className="font-medium">Welcome back, {user?.firstName || 'Researcher'}!</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => window.location.href = "/api/logout"}
                        data-testid="button-checkout-logout"
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Sign out
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Your order will be saved to your account for easy tracking and future reference.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      Sign in or create an account to save your order history and speed up future checkouts.
                    </p>
                    
                    <div className="grid gap-3">
                      <Button
                        className="w-full gap-2 bg-[#E7FB10] hover:bg-[#E7FB10]/90"
                        onClick={() => window.location.href = "/api/login"}
                        data-testid="button-checkout-login"
                      >
                        <LogIn className="h-4 w-4" />
                        Sign In with Replit
                      </Button>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium">Benefits of signing in:</p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-[#E7FB10]" />
                          Track all your orders in one place
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#21d8ff]" />
                          Faster checkout next time
                        </li>
                        <li className="flex items-center gap-2">
                          <FlaskConical className="h-4 w-4 text-[#9d4edd]" />
                          Leave verified reviews after 30 days
                        </li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <p className="text-center text-sm text-muted-foreground">
                      Or continue as guest below
                    </p>
                  </div>
                )}
              </Card>

              {/* Combined Payment & Expectations Card */}
              <Card className="p-5 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold">Secure Stripe Checkout</h2>
                    <p className="text-xs text-muted-foreground">Encrypted payment - we never store card details</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                    <ShieldCheck className="h-4 w-4 text-[#21d8ff] flex-shrink-0" />
                    <span className="text-muted-foreground">Secure</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                    <Truck className="h-4 w-4 text-[#E7FB10] flex-shrink-0" />
                    <span className="text-muted-foreground">Fast Ship</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                    <FlaskConical className="h-4 w-4 text-[#9d4edd] flex-shrink-0" />
                    <span className="text-muted-foreground">COA Incl.</span>
                  </div>
                </div>
              </Card>

              {/* Compact Trust & Verification Links */}
              <Card className="p-4 border-[#9d4edd]/50 bg-gradient-to-br from-[#9d4edd]/20 to-transparent">
                <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-[#9d4edd]" />
                  Buying With Confidence
                </h3>
                <p className="text-xs text-muted-foreground mb-3">Review our standards and quality assurance before you purchase</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/buyer-checklist">
                    <div className="flex items-center gap-2 p-2 rounded-lg border border-border hover:border-[#E7FB10] transition-all duration-300 cursor-pointer group" style={{ boxShadow: '0 0 0 2px rgba(231, 251, 16, 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(231, 251, 16, 0.6), 0 0 24px rgba(231, 251, 16, 0.3)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(231, 251, 16, 0.1)'} data-testid="link-buyer-checklist">
                      <CheckCircle className="h-3.5 w-3.5 text-[#E7FB10]" />
                      <span className="text-xs font-medium text-[#E7FB10]">Vendor Checklist</span>
                    </div>
                  </Link>
                  <Link href="/quality-process">
                    <div className="flex items-center gap-2 p-2 rounded-lg border border-border hover:border-[#21d8ff] transition-all duration-300 cursor-pointer group" style={{ boxShadow: '0 0 0 2px rgba(33, 216, 255, 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(33, 216, 255, 0.6), 0 0 24px rgba(33, 216, 255, 0.3)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(33, 216, 255, 0.1)'} data-testid="link-quality-process">
                      <Target className="h-3.5 w-3.5 text-[#21d8ff]" />
                      <span className="text-xs font-medium">Quality Process</span>
                    </div>
                  </Link>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 sticky top-32">
                <h2 className="font-display text-xl font-semibold mb-6">
                  Order Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                </h2>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={`${item.productId}-${item.dosage}`} className="flex gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img 
                          src={productImage} 
                          alt={item.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-sm truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {item.dosage} × {item.quantity}
                        </p>
                        <p className="font-semibold text-sm mt-1">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* BAC Water Upsell */}
                {shouldShowBacUpsell && bacWater && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-4 rounded-lg bg-gradient-to-r from-[#21d8ff]/10 to-[#9d4edd]/10 border border-[#21d8ff]/30"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Beaker className="h-5 w-5 text-[#21d8ff] flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-semibold text-sm">Don't Forget: Reconstitution Supplies</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Add bacteriostatic water to reconstitute your peptides properly and extend shelf life.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#21d8ff]">
                        ${Number(bacWater.price).toFixed(2)}
                      </span>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="sm"
                          className="bg-[#21d8ff] text-black font-semibold transition-all duration-300 hover:shadow-[0_0_15px_rgba(33,216,255,0.5)]"
                          onClick={handleAddBacWater}
                          data-testid="button-add-bac-water"
                        >
                          Add to Cart
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Cold Pack Shipping Upsell */}
                {hasPeptides && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Package className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-semibold text-sm">Protect Your Order: Next-Day Cold Pack Shipping</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ensure optimal stability with insulated cold packs. Recommended for peptide orders.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-blue-400">
                        +${COLD_PACK_FEE}.00
                      </span>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="sm"
                          className={`transition-all duration-300 ${hasColdPackShipping ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-[#21d8ff] text-black font-semibold hover:shadow-[0_0_15px_rgba(33,216,255,0.5)]"}`}
                          onClick={() => setHasColdPackShipping(!hasColdPackShipping)}
                          data-testid="button-cold-pack-shipping"
                        >
                          {hasColdPackShipping ? "✓ Added" : "Add Cold Pack"}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                <Separator className="my-6" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={baseShipping === 0 ? "text-green-500" : ""}>
                      {baseShipping === 0 ? "FREE" : `$${baseShipping.toFixed(2)}`}
                    </span>
                  </div>
                  {hasColdPackShipping && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cold Pack Shipping</span>
                      <span className="text-blue-400">+${COLD_PACK_FEE}.00</span>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="flex justify-between items-center mb-6">
                  <span className="font-display text-lg font-semibold">Total</span>
                  <span className="font-display text-2xl font-bold" data-testid="text-order-total">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    className="w-full font-display text-lg gap-2 bg-[#E7FB10] hover:bg-[#E7FB10]/90 transition-all duration-300 hover:shadow-[0_0_30px_rgba(231,251,16,0.6)]"
                    onClick={handleCheckout}
                    disabled={checkoutMutation.isPending}
                    data-testid="button-checkout"
                  >
                    {checkoutMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-5 w-5" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                </motion.div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By proceeding, you agree to our terms of service and privacy policy.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      </>
    );
  }

  if (bundle) {
    const bundleBasePrice = bundle.bundlePrice;
    const bundleUnitPrice = isSubscription ? getDiscountedPrice(bundleBasePrice) : bundleBasePrice;
    const bundleSubtotal = bundleUnitPrice * quantity;
    const bundleSavings = isSubscription ? (bundleBasePrice - bundleUnitPrice) * quantity : 0;
    const bundleShipping = bundleSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_RATE_SHIPPING;
    const bundleTotal = bundleSubtotal + bundleShipping;

    return (
      <>
      <RuoReminderDialog />
      <main className="min-h-screen pt-32 md:pt-40 pb-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link href={`/bundles/${bundle.id}`}>
              <Button variant="ghost" className="gap-2 -ml-4" data-testid="button-back-bundle">
                <ArrowLeft className="h-4 w-4" />
                Back to Bundle
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
              {/* Combined Payment & Expectations Card - Bundle */}
              <Card className="p-5 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold">Secure Stripe Checkout</h2>
                    <p className="text-xs text-muted-foreground">Encrypted payment - we never store card details</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                    <ShieldCheck className="h-4 w-4 text-[#21d8ff] flex-shrink-0" />
                    <span className="text-muted-foreground">Secure</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                    <Truck className="h-4 w-4 text-[#E7FB10] flex-shrink-0" />
                    <span className="text-muted-foreground">Fast Ship</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                    <FlaskConical className="h-4 w-4 text-[#9d4edd] flex-shrink-0" />
                    <span className="text-muted-foreground">COA Incl.</span>
                  </div>
                </div>
              </Card>

              {/* Compact Trust & Verification Links - Bundle */}
              <Card className="p-4 border-[#9d4edd]/50 bg-gradient-to-br from-[#9d4edd]/20 to-transparent">
                <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-[#9d4edd]" />
                  Buying With Confidence
                </h3>
                <p className="text-xs text-muted-foreground mb-3">Review our standards and quality assurance before you purchase</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/buyer-checklist">
                    <div className="flex items-center gap-2 p-2 rounded-lg border border-border hover:border-[#E7FB10] transition-all duration-300 cursor-pointer group" style={{ boxShadow: '0 0 0 2px rgba(231, 251, 16, 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(231, 251, 16, 0.6), 0 0 24px rgba(231, 251, 16, 0.3)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(231, 251, 16, 0.1)'} data-testid="link-buyer-checklist">
                      <CheckCircle className="h-3.5 w-3.5 text-[#E7FB10]" />
                      <span className="text-xs font-medium text-[#E7FB10]">Vendor Checklist</span>
                    </div>
                  </Link>
                  <Link href="/quality-process">
                    <div className="flex items-center gap-2 p-2 rounded-lg border border-border hover:border-[#21d8ff] transition-all duration-300 cursor-pointer group" style={{ boxShadow: '0 0 0 2px rgba(33, 216, 255, 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(33, 216, 255, 0.6), 0 0 24px rgba(33, 216, 255, 0.3)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(33, 216, 255, 0.1)'} data-testid="link-quality-process">
                      <Target className="h-3.5 w-3.5 text-[#21d8ff]" />
                      <span className="text-xs font-medium">Quality Process</span>
                    </div>
                  </Link>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 sticky top-32">
                <h2 className="font-display text-xl font-semibold mb-4">
                  Order Summary
                </h2>

                {isSubscription && (
                  <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20">
                    <Repeat className="h-4 w-4 text-[#21d8ff]" />
                    <span className="text-xs font-medium">
                      {intervalLabels[interval]} Subscription
                    </span>
                    <Badge className="bg-[#21d8ff] text-xs ml-auto">
                      {discountPercent}% off
                    </Badge>
                  </div>
                )}
                
                <div className="flex gap-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <FlaskConical className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge variant="secondary" className="text-xs mb-1">Bundle</Badge>
                    <h3 className="font-display font-semibold text-sm truncate" data-testid="text-order-product-name">
                      {bundle.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{bundle.products.join(" + ")}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-sm">${bundleBasePrice.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground line-through">${bundle.originalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${bundleSubtotal.toFixed(2)}</span>
                  </div>
                  {bundleSavings > 0 && (
                    <div className="flex justify-between text-[#21d8ff]">
                      <span>Subscription Savings</span>
                      <span>-${bundleSavings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={bundleShipping === 0 ? "text-green-500" : ""}>
                      {bundleShipping === 0 ? "FREE" : `$${bundleShipping.toFixed(2)}`}
                    </span>
                  </div>
                  {bundleShipping > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Free shipping on orders over $175
                    </p>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="flex justify-between items-center mb-6">
                  <span className="font-display text-lg font-semibold">Total</span>
                  <span className="font-display text-2xl font-bold" data-testid="text-order-total">
                    ${bundleTotal.toFixed(2)}
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
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5" />
                      {isSubscription ? "Subscribe Now" : "Proceed to Payment"}
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By proceeding, you agree to our terms of service and privacy policy.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      </>
    );
  }

  const basePrice = Number(product!.price);
  const unitPrice = isSubscription ? getDiscountedPrice(basePrice) : basePrice;
  const subtotal = unitPrice * quantity;
  const savings = isSubscription ? (basePrice - unitPrice) * quantity : 0;
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <>
    <RuoReminderDialog />
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href={`/products/${product!.id}`}>
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
            {/* Combined Payment & Expectations Card - Product */}
            <Card className="p-5 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">Secure Stripe Checkout</h2>
                  <p className="text-xs text-muted-foreground">Encrypted payment - we never store card details</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                  <ShieldCheck className="h-4 w-4 text-[#21d8ff] flex-shrink-0" />
                  <span className="text-muted-foreground">Secure</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                  <Truck className="h-4 w-4 text-[#E7FB10] flex-shrink-0" />
                  <span className="text-muted-foreground">Fast Ship</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                  <FlaskConical className="h-4 w-4 text-[#9d4edd] flex-shrink-0" />
                  <span className="text-muted-foreground">COA Incl.</span>
                </div>
              </div>
            </Card>

            {/* Compact Trust & Verification Links - Product */}
            <Card className="p-4 border-[#9d4edd]/50 bg-gradient-to-br from-[#9d4edd]/20 to-transparent">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-[#9d4edd]" />
                Buying With Confidence
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Review our standards and quality assurance before you purchase</p>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/buyer-checklist">
                  <div className="flex items-center gap-2 p-2 rounded-lg border border-border hover:border-[#E7FB10] transition-colors cursor-pointer group" data-testid="link-buyer-checklist">
                    <CheckCircle className="h-3.5 w-3.5 text-[#E7FB10]" />
                    <span className="text-xs font-medium text-[#E7FB10]">Vendor Checklist</span>
                  </div>
                </Link>
                <Link href="/quality-process">
                  <div className="flex items-center gap-2 p-2 rounded-lg border border-border hover:border-[#21d8ff]/40 transition-colors cursor-pointer group" data-testid="link-quality-process">
                    <Target className="h-3.5 w-3.5 text-[#21d8ff]" />
                    <span className="text-xs font-medium">Quality Process</span>
                  </div>
                </Link>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 sticky top-32">
              <h2 className="font-display text-xl font-semibold mb-4">
                Order Summary
              </h2>

              {isSubscription && (
                <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20">
                  <Repeat className="h-4 w-4 text-[#21d8ff]" />
                  <span className="text-xs font-medium">
                    {intervalLabels[interval]} Subscription
                  </span>
                  <Badge className="bg-[#21d8ff] text-xs ml-auto">
                    {discountPercent}% off
                  </Badge>
                </div>
              )}
              
              <div className="flex gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img 
                    src={productImage} 
                    alt={product!.name}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-sm truncate" data-testid="text-order-product-name">
                    {product!.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">Qty: {quantity}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {isSubscription ? (
                      <>
                        <span className="font-semibold text-sm text-[#21d8ff]">${unitPrice.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground line-through">${basePrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="font-semibold text-sm">${basePrice.toFixed(2)}</span>
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
    </>
  );
}
