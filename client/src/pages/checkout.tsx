import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import PayPalCheckout from "@/components/PayPalCheckout";
import SubscriptionCheckout from "@/components/SubscriptionCheckout";
import { calculateTaxFromZip, getTaxRateDisplay, getStateFromZip, isValidZipCode } from "@shared/taxRates";
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
  Mail,
  DollarSign,
  Copy,
  Smartphone,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Product, User as UserType } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";
import { getBundleById } from "@/lib/bundles";

type PaymentMethod = "paypal" | "cashapp" | "zelle";

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
  const { login, logout } = useAuth();
  const [hasColdPackShipping, setHasColdPackShipping] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("paypal");
  const [manualPaymentStep, setManualPaymentStep] = useState<"select" | "instructions" | "confirm">("select");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [copied, setCopied] = useState(false);
  
  // RUO/Age reminder state - shown once per session on checkout
  const [showRuoReminder, setShowRuoReminder] = useState(false);
  const [ruoAcknowledged, setRuoAcknowledged] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  
  // Early access email signup state
  const [notifyEmail, setNotifyEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

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
  
  // Check if cart has peptides and BAC water
  const hasPeptides = cartItems.some(item => !item.name.toLowerCase().includes("bacteriostatic") && !item.name.toLowerCase().includes("supplies"));
  const hasBacWater = cartItems.some(item => item.name.toLowerCase().includes("bacteriostatic"));
  const shouldShowBacUpsell = hasPeptides && bacWater;
  
  // Detect subscription items in cart
  const subscriptionItems = cartItems.filter(item => item.isSubscription);
  const oneTimeItems = cartItems.filter(item => !item.isSubscription);
  const hasSubscriptionItems = subscriptionItems.length > 0;
  const hasOneTimeItems = oneTimeItems.length > 0;
  const hasMixedCart = hasSubscriptionItems && hasOneTimeItems;
  
  // For single subscription item from cart (used in payment section)
  const cartSubscriptionItem = subscriptionItems.length === 1 ? subscriptionItems[0] : null;

  const handleAddBacWater = () => {
    if (bacWater && !hasBacWater) {
      addToCart({
        productId: bacWater.id,
        name: bacWater.name,
        price: Number(bacWater.price),
        quantity: 1,
        dosage: bacWater.dosageOptions?.[0] || "30ML",
        image: productImage,
      });
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

  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", {
        email,
        source: "checkout_launch_notify",
      });
      return response.json();
    },
    onSuccess: () => {
      setEmailSubmitted(true);
      toast({
        title: "You're signed up!",
        description: "We'll notify you when we launch.",
      });
    },
    onError: (error) => {
      if (error.message.includes("already subscribed")) {
        setEmailSubmitted(true);
        toast({
          title: "Already signed up",
          description: "This email is already on our launch list.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to sign up. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

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

  // Pre-fill customer info from user data
  useEffect(() => {
    if (user) {
      setCustomerEmail(user.email || "");
      setCustomerName(`${user.firstName || ""} ${user.lastName || ""}`.trim());
    }
  }, [user]);

  // Manual payment order creation
  const createManualOrderMutation = useMutation({
    mutationFn: async (data: {
      paymentMethod: string;
      customerEmail: string;
      customerName: string;
      shippingAddress: typeof shippingAddress;
      items: typeof cartItems;
      total: number;
    }) => {
      const response = await apiRequest("POST", "/api/orders/manual", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order Created!",
        description: "Your order has been placed. Please complete the payment as instructed.",
      });
      clearCart();
      // Redirect to order confirmation or orders page
      window.location.href = `/order-confirmation?orderId=${data.id}&manual=true&method=${data.paymentMethod || selectedPaymentMethod}`;
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const discountPercent = isSubscription ? (subscriptionDiscounts[interval] || 10) : 0;
  const getDiscountedPrice = (price: number) => {
    return price * (1 - discountPercent / 100);
  };

  // Early Access Mode - block actual purchases
  const EARLY_ACCESS_MODE = false; // Disabled for sandbox testing

  const handlePayPalSuccess = async (orderData: any, paypalOrderId: string) => {
    try {
      // Create order in our system with PayPal payment details
      const response = await fetch("/api/orders/paypal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypalOrderId,
          paypalPayerId: orderData?.payer?.payer_id || orderData?.payment_source?.paypal?.account_id,
          customerEmail: user?.email || customerEmail,
          customerName: customerName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          shippingAddress,
          items: cartItems.map(item => ({
            productId: item.productId,
            name: item.name,
            dosage: item.dosage,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: cartSubtotal,
          shipping: cartShipping,
          tax: cartTax,
          taxState: shippingAddress.state,
          total: cartTotal,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to create order:", errorData);
        // Still redirect but show warning
        toast({
          title: "Payment Successful",
          description: "Payment received, but there was an issue creating your order record. Please contact support.",
          variant: "destructive",
        });
      } else {
        const result = await response.json();
        console.log("Order created:", result);
        toast({
          title: "Payment Successful!",
          description: result.emailSent 
            ? "Your order has been placed and confirmation email sent!"
            : "Your order has been placed. Thank you for your purchase!",
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Payment Successful",
        description: "Payment received. Confirmation email will be sent shortly.",
      });
    }
    
    // Store order details for confirmation page before clearing cart
    const subTotal = getSubtotal();
    const shippingCost = subTotal >= 175 ? 0 : 20;
    const orderSummary = {
      paypalOrderId,
      items: cartItems.map(item => ({
        name: item.name,
        dosage: item.dosage,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: subTotal,
      shipping: shippingCost,
      discount: 0, // Discount already applied to item prices
      total: subTotal + shippingCost,
      customerEmail: user?.email || customerEmail,
    };
    sessionStorage.setItem('orderSummary', JSON.stringify(orderSummary));
    
    clearCart();
    window.location.href = `/order-confirmation?paypalOrderId=${paypalOrderId}`;
  };

  const handlePayPalError = (error: any) => {
    toast({
      title: "Payment Failed",
      description: "There was an error processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  const handleManualPaymentSubmit = () => {
    if (!customerEmail || !customerName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (EARLY_ACCESS_MODE) {
      toast({
        title: "Coming Soon!",
        description: "Purchasing will be enabled at launch. Sign up for our newsletter to be notified!",
        duration: 6000,
      });
      return;
    }

    createManualOrderMutation.mutate({
      paymentMethod: selectedPaymentMethod,
      customerEmail,
      customerName,
      shippingAddress,
      items: cartItems,
      total: cartTotal,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Payment info copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const FREE_SHIPPING_THRESHOLD = 175;
  const FLAT_RATE_SHIPPING = 20;
  const COLD_PACK_FEE = 14.99;
  const cartSubtotal = getSubtotal();
  // Subscriptions always ship free
  const baseShipping = hasSubscriptionItems ? 0 : (cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_RATE_SHIPPING);
  const coldPackFee = hasColdPackShipping && !hasSubscriptionItems ? COLD_PACK_FEE : 0;
  const cartShipping = baseShipping + coldPackFee;
  // Calculate tax based on ZIP code (applied to subtotal only, not shipping)
  const taxInfo = calculateTaxFromZip(shippingAddress.zip || '', cartSubtotal);
  const cartTax = taxInfo.tax;
  const taxState = taxInfo.state;
  const taxRatePercent = taxInfo.rate * 100;
  const hasValidZip = isValidZipCode(shippingAddress.zip || '');
  const cartTotal = cartSubtotal + cartShipping + cartTax;

  // Payment method info
  const CASHAPP_TAG = "$reviveresearchco";
  const ZELLE_INFO = "Coming Soon"; // Placeholder until user provides

  if (fromCart && cartItems.length === 0) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24 px-4 md:px-8 flex items-center justify-center">
        <Card className="p-8 md:p-12 text-center max-w-md w-full">
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
      <main className="min-h-screen pt-32 md:pt-40 pb-24 px-4 md:px-8 flex items-center justify-center">
        <Card className="p-8 md:p-12 text-center max-w-md w-full">
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
      <main className="min-h-screen pt-32 md:pt-40 pb-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
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
      <main className="min-h-screen pt-32 md:pt-40 pb-24 px-4 md:px-8 flex items-center justify-center">
        <Card className="p-8 md:p-12 text-center max-w-md w-full">
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

  // RUO/Age Reminder Dialog Component
  const RuoReminderDialog = () => {
    if (!showRuoReminder) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
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

  // Payment Method Selection Component
  const PaymentMethodSelector = () => (
    <div className="space-y-3">
      <h3 className="font-display font-semibold text-sm mb-3">Payment Method</h3>
      
      {/* PayPal - Primary */}
      <div
        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
          selectedPaymentMethod === "paypal"
            ? "border-[#0070ba] bg-[#0070ba]/10"
            : "border-border md:hover:border-[#0070ba]/50"
        }`}
        onClick={() => {
          setSelectedPaymentMethod("paypal");
          setManualPaymentStep("select");
        }}
        data-testid="payment-method-paypal"
      >
        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            selectedPaymentMethod === "paypal" ? "border-[#0070ba]" : "border-muted-foreground/30"
          }`}>
            {selectedPaymentMethod === "paypal" && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#0070ba]" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">PayPal</span>
              <Badge className="bg-[#0070ba] text-white text-xs">Recommended</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Pay securely with PayPal or card</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-5 bg-[#0070ba] rounded flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">PayPal</span>
            </div>
          </div>
        </div>
      </div>

      {/* CashApp */}
      <div
        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
          selectedPaymentMethod === "cashapp"
            ? "border-[#00D632] bg-[#00D632]/10"
            : "border-border md:hover:border-[#00D632]/50"
        }`}
        onClick={() => {
          setSelectedPaymentMethod("cashapp");
          setManualPaymentStep("instructions");
        }}
        data-testid="payment-method-cashapp"
      >
        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            selectedPaymentMethod === "cashapp" ? "border-[#00D632]" : "border-muted-foreground/30"
          }`}>
            {selectedPaymentMethod === "cashapp" && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#00D632]" />
            )}
          </div>
          <div className="flex-1">
            <span className="font-semibold text-sm">CashApp</span>
            <p className="text-xs text-muted-foreground">Send payment manually</p>
          </div>
          <div className="w-8 h-8 bg-[#00D632] rounded-lg flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      {/* Zelle */}
      <div
        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
          selectedPaymentMethod === "zelle"
            ? "border-[#6D1ED4] bg-[#6D1ED4]/10"
            : "border-border md:hover:border-[#6D1ED4]/50"
        } ${ZELLE_INFO === "Coming Soon" ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => {
          if (ZELLE_INFO !== "Coming Soon") {
            setSelectedPaymentMethod("zelle");
            setManualPaymentStep("instructions");
          }
        }}
        data-testid="payment-method-zelle"
      >
        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            selectedPaymentMethod === "zelle" ? "border-[#6D1ED4]" : "border-muted-foreground/30"
          }`}>
            {selectedPaymentMethod === "zelle" && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#6D1ED4]" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Zelle</span>
              {ZELLE_INFO === "Coming Soon" && (
                <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Bank transfer payment</p>
          </div>
          <div className="w-8 h-8 bg-[#6D1ED4] rounded-lg flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  // Main Cart Checkout Flow
  if (fromCart) {
    return (
      <>
        <RuoReminderDialog />
        <main className="min-h-screen pt-32 md:pt-40 pb-24 px-4 md:px-8">
          <SEOHead title="Secure Checkout" description="Complete your order securely. All research compounds ship same-day before 12 PM CT with discreet packaging." canonicalPath="/checkout" />
          <div className="max-w-4xl mx-auto">
            {/* Mobile Header - Compact */}
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <Link href="/cart" onClick={() => sessionStorage.removeItem('checkoutRuoAcknowledged')}>
                <Button variant="ghost" size="sm" className="gap-1 -ml-2 md:-ml-4" data-testid="button-back-cart">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Cart</span>
                  <span className="sm:hidden">Cart</span>
                </Button>
              </Link>
              {/* Mobile: Show total in header */}
              <div className="md:hidden text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-display font-bold text-lg" data-testid="text-mobile-total">${cartTotal.toFixed(2)}</p>
              </div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-2xl md:text-4xl font-bold mb-4 md:mb-8"
              data-testid="text-checkout-title"
            >
              Checkout
            </motion.h1>

            {/* Mobile Trust Indicators */}
            <div className="flex items-center justify-between gap-2 p-2 mb-4 bg-muted/30 rounded-lg md:hidden" data-testid="mobile-trust-indicators">
              <div className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Secure Checkout</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-[#21d8ff]" />
                <Truck className="h-4 w-4 text-[#E7FB10]" />
                <FlaskConical className="h-4 w-4 text-[#9d4edd]" />
              </div>
            </div>

            {/* Desktop: Two columns. Mobile: Stack with order summary first */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-12">
              {/* Left Column: Payment Methods */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="order-2 md:order-1"
              >
                {/* Account Section - Compact on mobile */}
                <Card className="p-3 md:p-6 mb-4 md:mb-6">
                  <h2 className="font-display text-base md:text-xl font-semibold mb-2 md:mb-4 flex items-center gap-2">
                    <User className="h-4 w-4 md:h-5 md:w-5" />
                    Your Account
                  </h2>
                  
                  {userLoading ? (
                    <div className="flex justify-center py-2 md:py-4">
                      <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : isAuthenticated ? (
                    <div className="bg-[#E7FB10]/10 border border-[#E7FB10]/30 rounded-lg p-2 md:p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#E7FB10]/20 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-[#E7FB10]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm md:text-base truncate">{user?.firstName || 'Researcher'}</p>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">{user?.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground flex-shrink-0"
                          onClick={() => logout()}
                          data-testid="button-checkout-logout"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-muted-foreground text-sm">
                        Sign in to save your order history and speed up future checkouts.
                      </p>
                      <Button
                        className="w-full gap-2 bg-[#E7FB10] hover:bg-[#E7FB10]/90"
                        onClick={() => window.location.href = "/api/login"}
                        data-testid="button-checkout-login"
                      >
                        <LogIn className="h-4 w-4" />
                        Sign In with Replit
                      </Button>
                    </div>
                  )}
                </Card>

                {/* Payment Methods */}
                <Card className="p-4 md:p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-semibold">Payment</h2>
                      <p className="text-xs text-muted-foreground">Choose your payment method</p>
                    </div>
                  </div>

                  <PaymentMethodSelector />
                  
                  {/* Manual Payment Instructions - CashApp */}
                  {selectedPaymentMethod === "cashapp" && manualPaymentStep === "instructions" && (
                    <div className="mt-4">
                      <Card className="p-4" style={{ borderColor: "#00D63250" }}>
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <Smartphone className="h-4 w-4" style={{ color: "#00D632" }} />
                          CashApp Payment Instructions
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "#00D632" }}>
                              1
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium mb-2">Send ${cartTotal.toFixed(2)} to:</p>
                              <div 
                                className="flex items-center gap-2 p-2 rounded-md bg-muted cursor-pointer md:hover:bg-muted/80 transition-colors"
                                onClick={() => copyToClipboard(CASHAPP_TAG)}
                              >
                                <span className="font-mono font-bold text-sm flex-1" style={{ color: "#00D632" }}>
                                  {CASHAPP_TAG}
                                </span>
                                <Button size="icon" variant="ghost" className="h-6 w-6">
                                  {copied ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "#00D632" }}>
                              2
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Include in the note:</p>
                              <p className="text-xs text-muted-foreground">Your email address for order confirmation</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "#00D632" }}>
                              3
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Fill in your shipping details below</p>
                              <p className="text-xs text-muted-foreground">We'll verify payment and ship your order</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="mp-customerName" className="text-xs">Full Name *</Label>
                              <Input
                                id="mp-customerName"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="John Doe"
                                className="mt-1"
                                data-testid="input-mp-customer-name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="mp-customerEmail" className="text-xs">Email *</Label>
                              <Input
                                id="mp-customerEmail"
                                type="email"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                placeholder="john@example.com"
                                className="mt-1"
                                data-testid="input-mp-customer-email"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="mp-street" className="text-xs">Street Address *</Label>
                            <Input
                              id="mp-street"
                              value={shippingAddress.street}
                              onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                              placeholder="123 Research Lane"
                              className="mt-1"
                              data-testid="input-mp-street"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label htmlFor="mp-city" className="text-xs">City *</Label>
                              <Input
                                id="mp-city"
                                value={shippingAddress.city}
                                onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                                placeholder="Austin"
                                className="mt-1"
                                data-testid="input-mp-city"
                              />
                            </div>
                            <div>
                              <Label htmlFor="mp-state" className="text-xs">State *</Label>
                              <Input
                                id="mp-state"
                                value={shippingAddress.state}
                                onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                                placeholder="TX"
                                className="mt-1"
                                data-testid="input-mp-state"
                              />
                            </div>
                            <div>
                              <Label htmlFor="mp-zip" className="text-xs">ZIP * {hasValidZip && taxState && <span className="text-green-500 ml-1">({taxState})</span>}</Label>
                              <Input
                                id="mp-zip"
                                value={shippingAddress.zip}
                                onChange={(e) => {
                                  const newZip = e.target.value;
                                  const detectedState = getStateFromZip(newZip);
                                  setShippingAddress({
                                    ...shippingAddress, 
                                    zip: newZip,
                                    state: detectedState || shippingAddress.state
                                  });
                                }}
                                placeholder="78701"
                                className="mt-1"
                                data-testid="input-mp-zip"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-3 rounded-lg bg-[#E7FB10]/10 border border-[#E7FB10]/30">
                          <p className="text-xs text-muted-foreground">
                            <AlertTriangle className="h-3 w-3 inline mr-1 text-[#E7FB10]" />
                            Your order will be marked as "Pending Payment" until we verify your CashApp transfer.
                            Processing typically takes 1-2 business hours.
                          </p>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Manual Payment Instructions - Zelle */}
                  {selectedPaymentMethod === "zelle" && manualPaymentStep === "instructions" && (
                    <div className="mt-4">
                      <Card className="p-4" style={{ borderColor: "#6D1ED450" }}>
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <Smartphone className="h-4 w-4" style={{ color: "#6D1ED4" }} />
                          Zelle Payment Instructions
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "#6D1ED4" }}>
                              1
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium mb-2">Send ${cartTotal.toFixed(2)} to:</p>
                              <div 
                                className="flex items-center gap-2 p-2 rounded-md bg-muted cursor-pointer md:hover:bg-muted/80 transition-colors"
                                onClick={() => copyToClipboard(ZELLE_INFO)}
                              >
                                <span className="font-mono font-bold text-sm flex-1" style={{ color: "#6D1ED4" }}>
                                  {ZELLE_INFO}
                                </span>
                                <Button size="icon" variant="ghost" className="h-6 w-6">
                                  {copied ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "#6D1ED4" }}>
                              2
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Include in the note:</p>
                              <p className="text-xs text-muted-foreground">Your email address for order confirmation</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "#6D1ED4" }}>
                              3
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Fill in your shipping details below</p>
                              <p className="text-xs text-muted-foreground">We'll verify payment and ship your order</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="zelle-customerName" className="text-xs">Full Name *</Label>
                              <Input
                                id="zelle-customerName"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="John Doe"
                                className="mt-1"
                                data-testid="input-zelle-customer-name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="zelle-customerEmail" className="text-xs">Email *</Label>
                              <Input
                                id="zelle-customerEmail"
                                type="email"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                placeholder="john@example.com"
                                className="mt-1"
                                data-testid="input-zelle-customer-email"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="zelle-street" className="text-xs">Street Address *</Label>
                            <Input
                              id="zelle-street"
                              value={shippingAddress.street}
                              onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                              placeholder="123 Research Lane"
                              className="mt-1"
                              data-testid="input-zelle-street"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label htmlFor="zelle-city" className="text-xs">City *</Label>
                              <Input
                                id="zelle-city"
                                value={shippingAddress.city}
                                onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                                placeholder="Austin"
                                className="mt-1"
                                data-testid="input-zelle-city"
                              />
                            </div>
                            <div>
                              <Label htmlFor="zelle-state" className="text-xs">State *</Label>
                              <Input
                                id="zelle-state"
                                value={shippingAddress.state}
                                onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                                placeholder="TX"
                                className="mt-1"
                                data-testid="input-zelle-state"
                              />
                            </div>
                            <div>
                              <Label htmlFor="zelle-zip" className="text-xs">ZIP * {hasValidZip && taxState && <span className="text-green-500 ml-1">({taxState})</span>}</Label>
                              <Input
                                id="zelle-zip"
                                value={shippingAddress.zip}
                                onChange={(e) => {
                                  const newZip = e.target.value;
                                  const detectedState = getStateFromZip(newZip);
                                  setShippingAddress({
                                    ...shippingAddress, 
                                    zip: newZip,
                                    state: detectedState || shippingAddress.state
                                  });
                                }}
                                placeholder="78701"
                                className="mt-1"
                                data-testid="input-zelle-zip"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-3 rounded-lg bg-[#E7FB10]/10 border border-[#E7FB10]/30">
                          <p className="text-xs text-muted-foreground">
                            <AlertTriangle className="h-3 w-3 inline mr-1 text-[#E7FB10]" />
                            Your order will be marked as "Pending Payment" until we verify your Zelle transfer.
                            Processing typically takes 1-2 business hours.
                          </p>
                        </div>
                      </Card>
                    </div>
                  )}
                </Card>

                {/* Trust & Verification Links - Desktop only */}
                <Card className="hidden md:block p-4 border-[#9d4edd]/50 bg-gradient-to-br from-[#9d4edd]/20 to-transparent">
                  <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-[#9d4edd]" />
                    Buying With Confidence
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">Review our standards and quality assurance</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/buyer-checklist">
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-border md:hover:border-[#E7FB10] transition-all duration-300 cursor-pointer" data-testid="link-buyer-checklist">
                        <CheckCircle className="h-3.5 w-3.5 text-[#E7FB10]" />
                        <span className="text-xs font-medium text-[#E7FB10]">Vendor Checklist</span>
                      </div>
                    </Link>
                    <Link href="/quality-process">
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-border md:hover:border-[#21d8ff] transition-all duration-300 cursor-pointer" data-testid="link-quality-process">
                        <Target className="h-3.5 w-3.5 text-[#21d8ff]" />
                        <span className="text-xs font-medium">Quality Process</span>
                      </div>
                    </Link>
                  </div>
                </Card>
              </motion.div>

              {/* Right Column: Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="order-1 md:order-2"
              >
                <Card className="p-4 md:p-6 md:sticky md:top-32">
                  <h2 className="font-display text-lg md:text-xl font-semibold mb-4 md:mb-6">
                    Order Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                  </h2>

                  {/* Mixed cart warning */}
                  {hasMixedCart && (
                    <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-amber-200">
                          <p className="font-medium mb-1">Subscription items need separate checkout</p>
                          <p className="text-muted-foreground">Subscriptions and one-time purchases must be checked out separately. We'll process your subscription item below.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Item list */}
                  <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                    {cartItems.map((item) => (
                      <div key={`${item.productId}-${item.dosage}-${item.isSubscription ? 'sub' : 'one'}`} className="flex gap-3 md:gap-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-muted to-muted/50 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                          <img 
                            src={productImage} 
                            alt={`${item.name} ${item.dosage} research peptide`}
                            className="w-full h-full object-contain p-1"
                          />
                          {item.isSubscription && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Repeat className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex items-center justify-between">
                          <div>
                            <h3 className="font-display font-semibold text-sm truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {item.dosage} × {item.quantity}
                              {item.isSubscription && item.subscriptionInterval && (
                                <span className="ml-1 text-primary">
                                  • {intervalLabels[item.subscriptionInterval]} Sub
                                </span>
                              )}
                            </p>
                          </div>
                          <p className="font-semibold text-sm">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* BAC Water Upsell */}
                  {shouldShowBacUpsell && bacWater && !hasBacWater && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3 md:mb-4 p-2 md:p-4 rounded-lg bg-gradient-to-r from-[#21d8ff]/10 to-[#9d4edd]/10 border border-[#21d8ff]/30"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Beaker className="h-4 w-4 md:h-5 md:w-5 text-[#21d8ff] flex-shrink-0" />
                          <div className="min-w-0">
                            <h4 className="font-display font-semibold text-xs md:text-sm truncate">Bacteriostatic Water</h4>
                            <p className="text-xs text-muted-foreground hidden md:block">Reconstitute peptides properly</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs md:text-sm font-semibold text-[#21d8ff]">
                            ${Number(bacWater.price).toFixed(2)}
                          </span>
                          <Button
                            size="sm"
                            className="bg-[#21d8ff] text-black font-semibold text-xs px-2 md:px-3"
                            onClick={handleAddBacWater}
                            data-testid="button-add-bac-water"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Cold Pack Shipping Upsell */}
                  {hasPeptides && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 md:mb-6 p-2 md:p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Package className="h-4 w-4 md:h-5 md:w-5 text-blue-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <h4 className="font-display font-semibold text-xs md:text-sm truncate">Cold Pack Shipping</h4>
                            <p className="text-xs text-muted-foreground hidden md:block">Insulated for peptide stability</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs md:text-sm font-semibold text-blue-400">
                            +${COLD_PACK_FEE.toFixed(2)}
                          </span>
                          <Button
                            size="sm"
                            className={`text-xs px-2 md:px-3 ${hasColdPackShipping ? "bg-blue-600 text-white" : "bg-[#21d8ff] text-black font-semibold"}`}
                            onClick={() => setHasColdPackShipping(!hasColdPackShipping)}
                            data-testid="button-cold-pack-shipping"
                          >
                            {hasColdPackShipping ? "✓" : "Add"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <Separator className="my-4 md:my-6" />

                  {/* Pricing */}
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
                        <span className="text-muted-foreground">Cold Pack</span>
                        <span className="text-blue-400">+${COLD_PACK_FEE.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Tax {hasValidZip && taxState && (
                          <span className="text-xs text-muted-foreground/70">({taxState} - {taxRatePercent.toFixed(2)}%)</span>
                        )}
                      </span>
                      {!hasValidZip ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="ZIP code"
                            value={shippingAddress.zip}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                              setShippingAddress(prev => ({ ...prev, zip: value }));
                            }}
                            className="w-24 h-8 text-sm text-center bg-background border-[#E7FB10]/50 focus:border-[#E7FB10] placeholder:text-muted-foreground/50"
                            data-testid="input-tax-zip"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={cartTax === 0 ? "text-green-500" : ""}>
                            {cartTax === 0 
                              ? "No tax" 
                              : `$${cartTax.toFixed(2)}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShippingAddress(prev => ({ ...prev, zip: '' }))}
                            className="text-xs text-muted-foreground hover:text-[#E7FB10] transition-colors"
                            data-testid="button-edit-zip"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4 md:my-6" />

                  {/* Total */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-display text-lg font-semibold">Total</span>
                    <span className="font-display text-2xl font-bold" data-testid="text-order-total">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#E7FB10] text-right mb-4">Early access pricing preview</p>

                  {/* Early Access Notice */}
                  {EARLY_ACCESS_MODE && (
                    <div className="mb-4 p-3 rounded-lg bg-[#E7FB10]/10 border border-[#E7FB10]/30" data-testid="early-access-checkout-notice">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-[#E7FB10] mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#E7FB10]">Purchasing disabled during Early Access</p>
                          {emailSubmitted ? (
                            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              You'll be notified at launch!
                            </p>
                          ) : (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground mb-2">Get notified at launch:</p>
                              <div className="flex gap-2">
                                <Input
                                  type="email"
                                  placeholder="your@email.com"
                                  value={notifyEmail}
                                  onChange={(e) => setNotifyEmail(e.target.value)}
                                  className="flex-1 h-8 text-sm"
                                  disabled={newsletterMutation.isPending}
                                  data-testid="input-launch-email"
                                />
                                <Button
                                  size="sm"
                                  className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90 h-8"
                                  onClick={() => notifyEmail && newsletterMutation.mutate(notifyEmail)}
                                  disabled={!notifyEmail || newsletterMutation.isPending}
                                  data-testid="button-notify-me"
                                >
                                  {newsletterMutation.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Mail className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ZIP Code for Tax Calculation - PayPal only */}
                  {selectedPaymentMethod === "paypal" && (
                    <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4 text-[#E7FB10]" />
                        <Label className="text-sm font-medium">Shipping ZIP Code</Label>
                        {hasValidZip && taxState && (
                          <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                            {taxState}
                          </Badge>
                        )}
                      </div>
                      <Input
                        placeholder="Enter ZIP code for tax calculation"
                        value={shippingAddress.zip}
                        onChange={(e) => {
                          const newZip = e.target.value;
                          const detectedState = getStateFromZip(newZip);
                          setShippingAddress({
                            ...shippingAddress, 
                            zip: newZip,
                            state: detectedState || shippingAddress.state
                          });
                        }}
                        className="mt-1"
                        data-testid="input-paypal-zip"
                      />
                      {!hasValidZip && (
                        <p className="text-xs text-[#E7FB10] mt-1">Enter your 5-digit ZIP code to calculate tax</p>
                      )}
                    </div>
                  )}

                  {/* Payment Button */}
                  {selectedPaymentMethod === "paypal" ? (
                    <div className="space-y-3">
                      {!hasValidZip ? (
                        <Button
                          size="lg"
                          className="w-full font-display text-lg gap-2 bg-[#E7FB10]/20 text-[#E7FB10] border border-[#E7FB10]/30 cursor-not-allowed"
                          disabled
                          data-testid="button-enter-zip-required"
                        >
                          <AlertTriangle className="h-5 w-5" />
                          Enter ZIP Code to Continue
                        </Button>
                      ) : EARLY_ACCESS_MODE ? (
                        <Button
                          size="lg"
                          className="w-full font-display text-lg gap-2 bg-muted text-muted-foreground cursor-not-allowed"
                          disabled
                          data-testid="button-checkout-disabled"
                        >
                          <Clock className="h-5 w-5" />
                          Coming Soon
                        </Button>
                      ) : isSubscription && product ? (
                        <SubscriptionCheckout
                          basePrice={Number(product.price) * quantity}
                          frequency={interval as "weekly" | "biweekly" | "monthly"}
                          productName={product.name}
                          productId={product.id}
                          dosage={searchParams.get("dosage") || undefined}
                          quantity={quantity}
                          onSuccess={(data) => {
                            toast({
                              title: "Subscription Created!",
                              description: "Your subscription is now active.",
                            });
                            clearCart();
                          }}
                          onError={handlePayPalError}
                          className="w-full"
                        />
                      ) : cartSubscriptionItem ? (
                        <SubscriptionCheckout
                          basePrice={cartSubscriptionItem.price}
                          frequency={cartSubscriptionItem.subscriptionInterval || "monthly"}
                          productName={cartSubscriptionItem.name}
                          productId={cartSubscriptionItem.productId}
                          dosage={cartSubscriptionItem.dosage}
                          quantity={cartSubscriptionItem.quantity}
                          onSuccess={(data) => {
                            toast({
                              title: "Subscription Created!",
                              description: "Your subscription is now active.",
                            });
                            clearCart();
                          }}
                          onError={handlePayPalError}
                          className="w-full"
                        />
                      ) : (
                        <PayPalCheckout
                          amount={cartTotal.toFixed(2)}
                          currency="USD"
                          intent="CAPTURE"
                          cartItems={cartItems}
                          customerEmail={user?.email || customerEmail}
                          onSuccess={handlePayPalSuccess}
                          onError={handlePayPalError}
                          onCancel={() => toast({ title: "Payment Cancelled", description: "You cancelled the payment." })}
                          className="w-full"
                        />
                      )}
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      className={`w-full font-display text-lg gap-2 transition-all duration-300 ${
                        EARLY_ACCESS_MODE 
                          ? "bg-muted text-muted-foreground cursor-not-allowed" 
                          : selectedPaymentMethod === "cashapp"
                            ? "bg-[#00D632] hover:bg-[#00D632]/90 text-white"
                            : "bg-[#6D1ED4] hover:bg-[#6D1ED4]/90 text-white"
                      }`}
                      onClick={handleManualPaymentSubmit}
                      disabled={createManualOrderMutation.isPending || EARLY_ACCESS_MODE}
                      data-testid="button-checkout"
                    >
                      {createManualOrderMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : EARLY_ACCESS_MODE ? (
                        <>
                          <Clock className="h-5 w-5" />
                          Coming Soon
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          Place Order (Pay via {selectedPaymentMethod === "cashapp" ? "CashApp" : "Zelle"})
                        </>
                      )}
                    </Button>
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

  // For single product or bundle checkout, redirect to cart checkout
  // This simplifies the checkout flow to use cart-based checkout only
  if (bundle || product) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24 px-4 md:px-8 flex items-center justify-center">
        <Card className="p-8 md:p-12 text-center max-w-md w-full">
          <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">Add to Cart First</h2>
          <p className="text-muted-foreground mb-6">
            Please add items to your cart and checkout from there for the best experience.
          </p>
          <div className="space-y-3">
            <Link href={bundle ? `/bundles/${bundle.id}` : `/products/${product?.id}`}>
              <Button className="w-full" data-testid="button-back-to-product">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {bundle ? "Bundle" : "Product"}
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="outline" className="w-full" data-testid="button-view-cart">
                View Cart
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  return null;
}
