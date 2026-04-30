import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  User,
  LogIn,
  LogOut,
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
  MapPin,
} from "lucide-react";
import type { Product, User as UserType } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";
import { getBundleById } from "@/lib/bundles";

type PaymentMethod = "paypal" | "cashapp" | "zelle" | "venmo";

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
  const { items: cartItems, getSubtotal, clearCart, addToCart, removeFromCart } = useCart();
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
  
  // Stock validation state
  const [stockErrors, setStockErrors] = useState<string[]>([]);
  const [stockValidating, setStockValidating] = useState(false);
  
  // Validate stock when checkout loads and when cart changes
  useEffect(() => {
    const validateCartStock = async () => {
      if (cartItems.length === 0) {
        setStockErrors([]);
        return;
      }
      setStockValidating(true);
      try {
        const res = await fetch("/api/stock/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cartItems.map(item => ({
              productId: item.productId,
              dosage: item.dosage,
              quantity: item.quantity,
            })),
          }),
        });
        const data = await res.json();
        setStockErrors(data.valid ? [] : (data.errors || ["Some items are unavailable"]));
      } catch {
        setStockErrors([]);
      } finally {
        setStockValidating(false);
      }
    };
    validateCartStock();
  }, [cartItems]);

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
  
  // Query for bac water dosage stocks (sizes)
  const { data: bacWaterStocks } = useQuery<Array<{ dosage: string; price: string | null; inStock: boolean }>>({
    queryKey: ["/api/products", bacWater?.id, "dosage-stocks"],
    queryFn: async () => {
      if (!bacWater?.id) return [];
      const res = await fetch(`/api/products/${bacWater.id}/dosage-stocks`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!bacWater?.id,
  });
  
  // Get available bac water sizes
  const bacWaterSizes = bacWaterStocks?.filter(s => s.inStock) || [];
  const [selectedBacWaterSize, setSelectedBacWaterSize] = useState<string>("30ML");
  const [selectedBacWaterQty, setSelectedBacWaterQty] = useState<number>(1);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  // Check if cart has peptides and BAC water
  const hasPeptides = cartItems.some(item => !item.name.toLowerCase().includes("bacteriostatic") && !item.name.toLowerCase().includes("supplies"));
  const bacWaterInCart = cartItems.find(item => item.name.toLowerCase().includes("bacteriostatic"));
  const hasBacWater = !!bacWaterInCart;
  const shouldShowBacUpsell = hasPeptides && bacWater;
  
  // Detect subscription items in cart
  const subscriptionItems = cartItems.filter(item => item.isSubscription);
  const oneTimeItems = cartItems.filter(item => !item.isSubscription);
  const hasSubscriptionItems = subscriptionItems.length > 0;
  const hasOneTimeItems = oneTimeItems.length > 0;
  const hasMixedCart = hasSubscriptionItems && hasOneTimeItems;
  
  // For single subscription item from cart (used in payment section)
  const cartSubscriptionItem = subscriptionItems.length === 1 ? subscriptionItems[0] : null;

  const handleAddBacWater = async (size?: string) => {
    if (bacWater && !hasBacWater) {
      const selectedSize = size || selectedBacWaterSize;
      const sizeStock = bacWaterStocks?.find(s => s.dosage === selectedSize);
      const price = sizeStock?.price ? Number(sizeStock.price) : Number(bacWater.price);
      const added = await addToCart({
        productId: bacWater.id,
        name: bacWater.name,
        price: price,
        quantity: selectedBacWaterQty,
        dosage: selectedSize,
        image: bacWater.imageUrl || productImage,
      });
      if (!added) {
        toast({ title: "Out of Stock", description: `${bacWater.name} (${selectedSize}) is out of stock.`, variant: "destructive" });
        return;
      }
      toast({
        title: "Added to cart",
        description: `${selectedBacWaterQty}x ${bacWater.name} (${selectedSize}) added to your cart.`,
      });
    }
  };
  
  const handleRemoveBacWater = () => {
    if (bacWater && bacWaterInCart) {
      removeFromCart(bacWater.id, bacWaterInCart.dosage);
      toast({
        title: "Removed from cart",
        description: "Bacteriostatic Water removed.",
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
      
      // Store order summary for confirmation page
      const orderSummary = {
        items: cartItems.map(item => ({
          name: item.name,
          dosage: item.dosage,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: cartSubtotal,
        shipping: cartShipping,
        discount: 0,
        total: cartTotal,
        customerEmail: customerEmail,
      };
      sessionStorage.setItem('orderSummary', JSON.stringify(orderSummary));
      
      // Invalidate all product-related caches so stock levels refresh immediately
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey[0];
        return typeof key === 'string' && key.startsWith('/api/products');
      }});
      
      clearCart();
      localStorage.removeItem("appliedDiscount");
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
    
    // Invalidate all product-related caches so stock levels refresh immediately
    queryClient.invalidateQueries({ predicate: (query) => {
      const key = query.queryKey[0];
      return typeof key === 'string' && key.startsWith('/api/products');
    }});
    
    clearCart();
    localStorage.removeItem("appliedDiscount");
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
      setSubmitAttempted(true);
      toast({
        title: "Missing Information",
        description: "Please fill in all highlighted fields.",
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

  const FREE_SHIPPING_THRESHOLD = 250;
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
  const VENMO_HANDLE = "@reviveresearchco";
  const ZELLE_INFO = "Coming Soon"; // Placeholder until user provides

  if (fromCart && cartItems.length === 0) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24 px-3 sm:px-4 md:px-8 flex items-center justify-center">
        <Card className="p-6 md:p-12 text-center max-w-md w-full">
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
      <main className="min-h-screen pt-32 md:pt-40 pb-24 px-3 sm:px-4 md:px-8 flex items-center justify-center">
        <Card className="p-6 md:p-12 text-center max-w-md w-full">
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
      <main className="min-h-screen pt-32 md:pt-40 pb-24 px-3 sm:px-4 md:px-8">
        <div className="max-w-4xl mx-auto w-full">
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
      <main className="min-h-screen pt-32 md:pt-40 pb-24 px-3 sm:px-4 md:px-8 flex items-center justify-center">
        <Card className="p-6 md:p-12 text-center max-w-md w-full">
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

  // Main Cart Checkout Flow
  if (fromCart) {
    return (
      <>
        <RuoReminderDialog />
        <main className="min-h-screen pt-32 md:pt-40 pb-24 px-3 sm:px-4 md:px-8 overflow-x-hidden">
          <SEOHead title="Checkout" description="Complete your order securely. All research compounds ship same-day before 12 PM CT with discreet packaging." canonicalPath="/checkout" />
          <div className="max-w-4xl mx-auto w-full">
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
            <div className="grid md:grid-cols-[1fr_360px] gap-6 md:gap-8">
              {/* Left Column: Payment Methods */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="order-2 md:order-1"
              >
                {/* Unified Checkout Card */}
                <Card className="p-4 md:p-6 mb-4">
                  {/* Account Strip */}
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-border/50">
                    {userLoading ? (
                      <div className="h-5 w-40 bg-muted rounded animate-pulse" />
                    ) : isAuthenticated ? (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-full bg-[#E7FB10]/20 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-3.5 w-3.5 text-[#E7FB10]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-none">{user?.firstName || 'Researcher'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground flex-shrink-0"
                          onClick={() => logout()}
                          data-testid="button-checkout-logout"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Checking out as guest</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-[#21d8ff] text-xs"
                          onClick={() => login()}
                          data-testid="button-checkout-login"
                        >
                          <LogIn className="h-3 w-3" />
                          Sign In
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Payment Method Selector — 2×2 compact pill grid */}
                  <div className="mb-5">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">How do you want to pay?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 transition-all text-left ${
                          selectedPaymentMethod === "paypal"
                            ? "border-[#0070ba] bg-[#0070ba]/10"
                            : "border-border hover:border-[#0070ba]/40"
                        }`}
                        onClick={() => { setSelectedPaymentMethod("paypal"); setManualPaymentStep("select"); }}
                        data-testid="payment-method-paypal"
                      >
                        <div className="w-8 h-8 bg-[#0070ba] rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[9px] font-extrabold leading-none">PP</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-tight">PayPal</p>
                          <p className="text-[10px] text-[#0070ba] font-medium">Recommended</p>
                        </div>
                        {selectedPaymentMethod === "paypal" && (
                          <CheckCircle className="h-3.5 w-3.5 text-[#0070ba] flex-shrink-0" />
                        )}
                      </button>

                      <button
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 transition-all text-left ${
                          selectedPaymentMethod === "cashapp"
                            ? "border-[#00D632] bg-[#00D632]/10"
                            : "border-border hover:border-[#00D632]/40"
                        }`}
                        onClick={() => { setSelectedPaymentMethod("cashapp"); setManualPaymentStep("instructions"); }}
                        data-testid="payment-method-cashapp"
                      >
                        <div className="w-8 h-8 bg-[#00D632] rounded-md flex items-center justify-center flex-shrink-0">
                          <DollarSign className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-tight">CashApp</p>
                          <p className="text-[10px] text-muted-foreground">{CASHAPP_TAG}</p>
                        </div>
                        {selectedPaymentMethod === "cashapp" && (
                          <CheckCircle className="h-3.5 w-3.5 text-[#00D632] flex-shrink-0" />
                        )}
                      </button>

                      <button
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 transition-all text-left ${
                          selectedPaymentMethod === "venmo"
                            ? "border-[#00AFF1] bg-[#00AFF1]/10"
                            : "border-border hover:border-[#00AFF1]/40"
                        }`}
                        onClick={() => { setSelectedPaymentMethod("venmo"); setManualPaymentStep("instructions"); }}
                        data-testid="payment-method-venmo"
                      >
                        <div className="w-8 h-8 bg-[#00AFF1] rounded-md flex items-center justify-center flex-shrink-0">
                          <CreditCard className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-tight">Venmo</p>
                          <p className="text-[10px] text-muted-foreground">{VENMO_HANDLE}</p>
                        </div>
                        {selectedPaymentMethod === "venmo" && (
                          <CheckCircle className="h-3.5 w-3.5 text-[#00AFF1] flex-shrink-0" />
                        )}
                      </button>

                      <button
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 border-border transition-all text-left opacity-40 cursor-not-allowed"
                        disabled
                        data-testid="payment-method-zelle"
                      >
                        <div className="w-8 h-8 bg-[#6D1ED4] rounded-md flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-tight">Zelle</p>
                          <p className="text-[10px] text-muted-foreground">Coming soon</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Animated content per method */}
                  <AnimatePresence mode="wait">
                    {selectedPaymentMethod === "paypal" && (
                      <motion.div
                        key="paypal-info"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="rounded-lg bg-[#0070ba]/10 border border-[#0070ba]/30 p-3 flex items-center gap-3"
                      >
                        <div className="w-9 h-9 bg-[#0070ba] rounded-md flex items-center justify-center flex-shrink-0">
                          <Lock className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Secure PayPal checkout</p>
                          <p className="text-xs text-muted-foreground">Review your order summary, then click "Pay with PayPal" — you'll complete payment on PayPal's site and be brought right back.</p>
                        </div>
                      </motion.div>
                    )}

                    {['cashapp', 'venmo', 'zelle'].includes(selectedPaymentMethod) && (
                      <motion.div
                        key="manual-form"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="space-y-5"
                      >
                        {/* Shipping Details — inline */}
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" />
                            Shipping Details
                          </p>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="ship-name" className="text-xs">Full Name *</Label>
                                <Input
                                  id="ship-name"
                                  value={customerName}
                                  onChange={(e) => { setCustomerName(e.target.value); if (submitAttempted && e.target.value) setSubmitAttempted(false); }}
                                  placeholder="John Doe"
                                  autoComplete="name"
                                  className={`mt-1 ${submitAttempted && !customerName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                  data-testid="input-customer-name"
                                />
                                {submitAttempted && !customerName && <p className="text-xs text-red-500 mt-1">Required</p>}
                              </div>
                              <div>
                                <Label htmlFor="ship-email" className="text-xs">Email *</Label>
                                <Input
                                  id="ship-email"
                                  type="email"
                                  value={customerEmail}
                                  onChange={(e) => setCustomerEmail(e.target.value)}
                                  placeholder="john@example.com"
                                  autoComplete="email"
                                  className={`mt-1 ${submitAttempted && !customerEmail ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                  data-testid="input-customer-email"
                                />
                                {submitAttempted && !customerEmail && <p className="text-xs text-red-500 mt-1">Required</p>}
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="ship-street" className="text-xs">Street Address *</Label>
                              <Input
                                id="ship-street"
                                value={shippingAddress.street}
                                onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                                placeholder="123 Research Lane"
                                autoComplete="street-address"
                                className={`mt-1 ${submitAttempted && !shippingAddress.street ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                data-testid="input-street"
                              />
                              {submitAttempted && !shippingAddress.street && <p className="text-xs text-red-500 mt-1">Required</p>}
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="col-span-1">
                                <Label htmlFor="ship-city" className="text-xs">City *</Label>
                                <Input
                                  id="ship-city"
                                  value={shippingAddress.city}
                                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                                  placeholder="Austin"
                                  autoComplete="address-level2"
                                  className={`mt-1 ${submitAttempted && !shippingAddress.city ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                  data-testid="input-city"
                                />
                                {submitAttempted && !shippingAddress.city && <p className="text-xs text-red-500 mt-1">Required</p>}
                              </div>
                              <div>
                                <Label htmlFor="ship-state" className="text-xs">State *</Label>
                                <Input
                                  id="ship-state"
                                  value={shippingAddress.state}
                                  onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                                  placeholder="TX"
                                  maxLength={2}
                                  autoComplete="address-level1"
                                  className={`mt-1 ${submitAttempted && !shippingAddress.state ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                  data-testid="input-state"
                                />
                                {submitAttempted && !shippingAddress.state && <p className="text-xs text-red-500 mt-1">Required</p>}
                              </div>
                              <div>
                                <Label htmlFor="ship-zip" className="text-xs">ZIP Code *</Label>
                                <Input
                                  id="ship-zip"
                                  value={shippingAddress.zip}
                                  onChange={(e) => setShippingAddress({...shippingAddress, zip: e.target.value})}
                                  placeholder="78701"
                                  maxLength={5}
                                  autoComplete="postal-code"
                                  className={`mt-1 ${submitAttempted && !shippingAddress.zip ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                  data-testid="input-zip"
                                />
                                {submitAttempted && !shippingAddress.zip && <p className="text-xs text-red-500 mt-1">Required</p>}
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* What happens next */}
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">What happens next</p>
                          {(() => {
                            const methodColor = selectedPaymentMethod === "cashapp" ? "#00D632" : selectedPaymentMethod === "venmo" ? "#00AFF1" : "#6D1ED4";
                            const methodHandle = selectedPaymentMethod === "cashapp" ? CASHAPP_TAG : selectedPaymentMethod === "venmo" ? VENMO_HANDLE : ZELLE_INFO;
                            return (
                              <ol className="space-y-3">
                                <li className="flex items-start gap-3">
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: methodColor }}>1</div>
                                  <p className="text-sm text-muted-foreground leading-snug">Confirm your order — you'll get a unique order number</p>
                                </li>
                                <li className="flex items-start gap-3">
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: methodColor }}>2</div>
                                  <p className="text-sm text-muted-foreground leading-snug">
                                    Send <span className="font-semibold text-foreground">${cartTotal.toFixed(2)}</span> to{" "}
                                    <button
                                      className="font-mono font-semibold underline underline-offset-2 cursor-pointer"
                                      style={{ color: methodColor }}
                                      onClick={() => copyToClipboard(methodHandle)}
                                    >
                                      {methodHandle}
                                    </button>{" "}
                                    with{" "}
                                    <span className="font-semibold text-foreground underline underline-offset-2">your order number in the note</span>
                                    {" "}— this is required to match your payment
                                  </p>
                                </li>
                                <li className="flex items-start gap-3">
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: methodColor }}>3</div>
                                  <p className="text-sm text-muted-foreground leading-snug">We verify payment and ship — you'll receive a shipping notification once it's on the way</p>
                                </li>
                              </ol>
                            );
                          })()}
                        </div>

                        {/* Desktop Confirm Button */}
                        <Button
                          size="lg"
                          className={`w-full hidden md:flex font-display text-base gap-2 transition-all duration-300 ${
                            EARLY_ACCESS_MODE
                              ? "bg-muted text-muted-foreground cursor-not-allowed"
                              : selectedPaymentMethod === "cashapp"
                                ? "bg-[#00D632] text-white"
                                : selectedPaymentMethod === "venmo"
                                  ? "bg-[#00AFF1] text-white"
                                  : "bg-[#6D1ED4] text-white"
                          }`}
                          onClick={handleManualPaymentSubmit}
                          disabled={createManualOrderMutation.isPending || EARLY_ACCESS_MODE}
                          data-testid="button-checkout"
                        >
                          {createManualOrderMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : EARLY_ACCESS_MODE ? (
                            <>
                              <Clock className="h-4 w-4" />
                              Coming Soon
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Confirm Order — Pay via {selectedPaymentMethod === "cashapp" ? "CashApp" : selectedPaymentMethod === "venmo" ? "Venmo" : "Zelle"} After
                            </>
                          )}
                        </Button>
                        <p className="hidden md:block text-xs text-muted-foreground text-center -mt-3">
                          You'll receive your order number, then send payment separately.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </Card>

                {/* Mobile spacer for sticky bar */}
                {['cashapp', 'venmo', 'zelle'].includes(selectedPaymentMethod) && (
                  <div className="md:hidden h-24" />
                )}


                {/* Trust & Verification Links - Desktop only */}
                <Card className="hidden md:block p-4 border-[#9d4edd]/50 bg-gradient-to-br from-[#9d4edd]/20 to-transparent">
                  <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-[#9d4edd]" />
                    Buying With Confidence
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">Review our standards and quality assurance</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/guides/peptide-vendor-checklist">
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-border md:hover:border-[#E7FB10] transition-all duration-300 cursor-pointer" data-testid="link-buyer-checklist">
                        <CheckCircle className="h-3.5 w-3.5 text-[#E7FB10]" />
                        <span className="text-xs font-medium text-[#E7FB10]">Vendor Checklist</span>
                      </div>
                    </Link>
                    <Link href="/guides/peptide-quality-assurance-process">
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
                <Card className="p-3 sm:p-4 md:p-6 md:sticky md:top-32">
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
                  <div className="divide-y divide-border/40 mb-4 md:mb-6">
                    {cartItems.map((item) => (
                      <div key={`${item.productId}-${item.dosage}-${item.isSubscription ? 'sub' : 'one'}${item.packSize ? `-pack${item.packSize}` : ''}`} className="flex gap-3 md:gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-muted to-muted/50 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden relative ring-1 ring-[#E7FB10]/20">
                          <img 
                            src={item.image || productImage} 
                            alt={`${item.name} ${item.dosage} research peptide`}
                            className="w-full h-full object-contain p-1"
                          />
                          {item.isSubscription && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Repeat className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-base leading-tight truncate">
                              {item.name}
                              {item.packSize && <span className="text-[#E7FB10] ml-1.5 text-sm">({item.packSize}-Pack)</span>}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.dosage} × {item.quantity}
                              {item.isSubscription && item.subscriptionInterval && (
                                <span className="ml-1 text-primary">
                                  • {intervalLabels[item.subscriptionInterval]} Sub
                                </span>
                              )}
                            </p>
                          </div>
                          <p className="font-bold text-base text-[#E7FB10] tabular-nums flex-shrink-0">
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
                      className={`mb-3 md:mb-4 p-3 md:p-4 rounded-lg border ${hasBacWater ? 'bg-[#21d8ff]/5 border-[#21d8ff]/50' : 'bg-gradient-to-r from-[#21d8ff]/10 to-[#9d4edd]/10 border-[#21d8ff]/30'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Beaker className="h-5 w-5 text-[#21d8ff] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-semibold text-sm">Bacteriostatic Water</h4>
                          <p className="text-xs text-muted-foreground">Reconstitute peptides properly</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30 flex-wrap">
                        {hasBacWater ? (
                          <>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-sm text-[#21d8ff] font-medium">{bacWaterInCart?.dosage}</span>
                              {(bacWaterInCart?.quantity ?? 1) > 1 && (
                                <span className="text-xs text-muted-foreground">x{bacWaterInCart?.quantity}</span>
                              )}
                              <span className="text-sm font-bold text-[#21d8ff]">
                                ${((bacWaterInCart?.price ?? 0) * (bacWaterInCart?.quantity ?? 1)).toFixed(2)}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-3 border-red-500/50 text-red-400 hover:bg-red-500/10"
                              onClick={handleRemoveBacWater}
                              data-testid="button-remove-bac-water"
                            >
                              Remove
                            </Button>
                          </>
                        ) : (
                          <>
                            {bacWaterSizes.length > 1 ? (
                              <select
                                value={selectedBacWaterSize}
                                onChange={(e) => setSelectedBacWaterSize(e.target.value)}
                                className="bg-background border border-border rounded-md px-2 py-1.5 text-sm flex-1 min-w-0"
                                data-testid="select-bac-water-size"
                              >
                                {bacWaterSizes.map((size) => (
                                  <option key={size.dosage} value={size.dosage}>
                                    {size.dosage} - ${Number(size.price || bacWater.price).toFixed(2)}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-sm font-bold text-[#21d8ff] flex-1">
                                ${Number(bacWater.price).toFixed(2)}
                              </span>
                            )}
                            <div className="flex items-center border border-border rounded-md overflow-hidden flex-shrink-0" data-testid="bac-water-qty-control">
                              <button
                                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors text-sm font-bold"
                                onClick={() => setSelectedBacWaterQty(q => Math.max(1, q - 1))}
                                data-testid="button-bac-water-qty-minus"
                              >
                                −
                              </button>
                              <span className="w-7 text-center text-sm font-medium" data-testid="text-bac-water-qty">
                                {selectedBacWaterQty}
                              </span>
                              <button
                                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors text-sm font-bold"
                                onClick={() => setSelectedBacWaterQty(q => Math.min(10, q + 1))}
                                data-testid="button-bac-water-qty-plus"
                              >
                                +
                              </button>
                            </div>
                            <Button
                              size="sm"
                              className="bg-[#21d8ff] text-black font-semibold text-xs px-4 flex-shrink-0"
                              onClick={() => handleAddBacWater()}
                              data-testid="button-add-bac-water"
                            >
                              Add
                            </Button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Cold Pack Shipping Upsell */}
                  {hasPeptides && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-4 md:mb-6 p-3 md:p-4 rounded-lg border ${hasColdPackShipping ? 'bg-blue-500/5 border-blue-500/50' : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-blue-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-semibold text-sm">Cold Pack Shipping</h4>
                          <p className="text-xs text-muted-foreground">Insulated for peptide stability</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border/30">
                        <span className="text-sm font-bold text-blue-400">
                          +${COLD_PACK_FEE.toFixed(2)}
                        </span>
                        {hasColdPackShipping ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-3 border-red-500/50 text-red-400 hover:bg-red-500/10"
                            onClick={() => setHasColdPackShipping(false)}
                            data-testid="button-remove-cold-pack"
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-[#21d8ff] text-black font-semibold text-xs px-4"
                            onClick={() => setHasColdPackShipping(true)}
                            data-testid="button-add-cold-pack"
                          >
                            Add
                          </Button>
                        )}
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

                  {/* Stock Validation Warning */}
                  {stockErrors.length > 0 && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30" data-testid="stock-error-warning">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-400">Some items in your cart are unavailable</p>
                          <ul className="mt-1 space-y-0.5">
                            {stockErrors.map((err, i) => (
                              <li key={i} className="text-xs text-red-300">{err}</li>
                            ))}
                          </ul>
                          <p className="text-xs text-muted-foreground mt-2">Please remove unavailable items to continue.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Button */}
                  {stockErrors.length > 0 ? (
                    <Button
                      size="lg"
                      className="w-full font-display text-lg gap-2 bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed"
                      disabled
                      data-testid="button-checkout-blocked"
                    >
                      <AlertTriangle className="h-5 w-5" />
                      Items Out of Stock
                    </Button>
                  ) : selectedPaymentMethod === "paypal" ? (
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
                            localStorage.removeItem("appliedDiscount");
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
                            localStorage.removeItem("appliedDiscount");
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
                  ) : null}
                </Card>
              </motion.div>
            </div>
          </div>
        </main>

        {/* Sticky mobile bottom bar — always visible when filling out manual payment */}
        {['cashapp', 'zelle', 'venmo'].includes(selectedPaymentMethod || '') && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-md border-t border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Order Total</p>
                <p className="font-display font-bold text-xl">${cartTotal.toFixed(2)}</p>
              </div>
              <Button
                size="lg"
                className={`font-display gap-2 flex-shrink-0 ${
                  EARLY_ACCESS_MODE
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : selectedPaymentMethod === "cashapp"
                      ? "bg-[#00D632] text-white"
                      : selectedPaymentMethod === "venmo"
                        ? "bg-[#00AFF1] text-white"
                        : "bg-[#6D1ED4] text-white"
                }`}
                onClick={handleManualPaymentSubmit}
                disabled={createManualOrderMutation.isPending || EARLY_ACCESS_MODE}
                data-testid="button-checkout-sticky"
              >
                {createManualOrderMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : EARLY_ACCESS_MODE ? (
                  <>
                    <Clock className="h-4 w-4" />
                    Coming Soon
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Confirm Order
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1.5">
              You'll send{" "}
              {selectedPaymentMethod === "cashapp" ? "CashApp" : selectedPaymentMethod === "venmo" ? "Venmo" : "Zelle"}{" "}
              payment after receiving your order number
            </p>
          </div>
        )}
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
            <Link href={bundle ? `/bundles/${bundle.id}` : `/peptides/${product?.slug || product?.id}`}>
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
