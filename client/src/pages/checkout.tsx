import { useState, useEffect, useMemo, useRef } from "react";
import { FREE_SHIPPING_THRESHOLD, FLAT_RATE_SHIPPING } from "@shared/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import PayPalCheckout, { type PayPalCheckoutHandle } from "@/components/PayPalCheckout";
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
import type { Product, User as UserType, SavedAddress } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";
import { getBundleById } from "@/lib/bundles";

type PaymentMethod = "paypal" | "cashapp" | "zelle" | "venmo" | "card" | "bank";

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("card");
  const cardPaypalRef = useRef<PayPalCheckoutHandle | null>(null);
  const orderCompleteRef = useRef(false);
  const [isCardReady, setIsCardReady] = useState(false);
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);
  const [checkoutCardDeclineError, setCheckoutCardDeclineError] = useState<string | null>(null);
  const [manualPaymentStep, setManualPaymentStep] = useState<"select" | "instructions" | "confirm">("select");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [copied, setCopied] = useState(false);

  // 2-step checkout state
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [payAnotherWayExpanded, setPayAnotherWayExpanded] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(false);

  // SessionStorage keys for checkout form persistence
  const CHECKOUT_KEYS = {
    name: "rr_checkout_name",
    email: "rr_checkout_email",
    phone: "rr_checkout_phone",
    street: "rr_checkout_street",
    city: "rr_checkout_city",
    state: "rr_checkout_state",
    zip: "rr_checkout_zip",
  } as const;

  const clearCheckoutStorage = () => {
    Object.values(CHECKOUT_KEYS).forEach(key => sessionStorage.removeItem(key));
  };

  // Restore checkout fields from sessionStorage on mount
  useEffect(() => {
    const name = sessionStorage.getItem(CHECKOUT_KEYS.name);
    const email = sessionStorage.getItem(CHECKOUT_KEYS.email);
    const phone = sessionStorage.getItem(CHECKOUT_KEYS.phone);
    const street = sessionStorage.getItem(CHECKOUT_KEYS.street);
    const city = sessionStorage.getItem(CHECKOUT_KEYS.city);
    const state = sessionStorage.getItem(CHECKOUT_KEYS.state);
    const zip = sessionStorage.getItem(CHECKOUT_KEYS.zip);
    if (name) setCustomerName(name);
    if (email) setCustomerEmail(email);
    if (phone) setCustomerPhone(phone);
    if (street || city || state || zip) {
      setShippingAddress(prev => ({
        street: street || prev.street,
        city: city || prev.city,
        state: state || prev.state,
        zip: zip || prev.zip,
      }));
    }
  }, []);

  // Debounced save of checkout fields to sessionStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      sessionStorage.setItem(CHECKOUT_KEYS.name, customerName);
      sessionStorage.setItem(CHECKOUT_KEYS.email, customerEmail);
      sessionStorage.setItem(CHECKOUT_KEYS.phone, customerPhone);
      sessionStorage.setItem(CHECKOUT_KEYS.street, shippingAddress.street);
      sessionStorage.setItem(CHECKOUT_KEYS.city, shippingAddress.city);
      sessionStorage.setItem(CHECKOUT_KEYS.state, shippingAddress.state);
      sessionStorage.setItem(CHECKOUT_KEYS.zip, shippingAddress.zip);
    }, 300);
    return () => clearTimeout(timer);
  }, [customerName, customerEmail, customerPhone, shippingAddress]);

  // Derived: true when all required shipping fields are valid
  const shippingValid = useMemo(() => {
    return (
      customerName.trim().length > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) &&
      shippingAddress.street.trim().length > 0 &&
      shippingAddress.city.trim().length > 0 &&
      shippingAddress.state.length === 2 &&
      /^\d{5}(-\d{4})?$/.test(shippingAddress.zip)
    );
  }, [customerName, customerEmail, shippingAddress]);

  // RUO/Age reminder state
  const [showRuoReminder, setShowRuoReminder] = useState(false);
  const [ruoAcknowledged, setRuoAcknowledged] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  // Early access email signup state
  const [notifyEmail, setNotifyEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  // Stock validation state
  const [stockErrors, setStockErrors] = useState<string[]>([]);
  const [stockValidating, setStockValidating] = useState(false);

  // Submit attempted flag for inline errors
  const [submitAttempted, setSubmitAttempted] = useState(false);

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

  // Clear saved checkout data when cart becomes empty
  useEffect(() => {
    if (cartItems.length === 0) {
      clearCheckoutStorage();
    }
  }, [cartItems.length]);

  // Query for BAC water product (still needed for first-order free BAC water injection)
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

  // Detect subscription items in cart
  const subscriptionItems = cartItems.filter(item => item.isSubscription);
  const oneTimeItems = cartItems.filter(item => !item.isSubscription);
  const hasSubscriptionItems = subscriptionItems.length > 0;
  const hasOneTimeItems = oneTimeItems.length > 0;
  const hasMixedCart = hasSubscriptionItems && hasOneTimeItems;

  // For single subscription item from cart
  const cartSubscriptionItem = subscriptionItems.length === 1 ? subscriptionItems[0] : null;

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

  // Save shipping address back to user's profile
  const saveAddressMutation = useMutation({
    mutationFn: async () => {
      const parts = customerName.trim().split(" ");
      const firstName = parts[0] || customerName.trim();
      const lastName = parts.slice(1).join(" ");
      const addressPayload = {
        label: "Default",
        firstName,
        lastName,
        address: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zip,
        country: "United States",
        isDefault: true,
      };
      const existingDefault = savedAddresses?.find(a => a.isDefault) ?? savedAddresses?.[0];
      if (existingDefault) {
        const response = await apiRequest("PATCH", `/api/addresses/${existingDefault.id}`, addressPayload);
        return response.json();
      }
      const response = await apiRequest("POST", "/api/addresses", addressPayload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: "Address saved",
        description: "Your shipping address has been saved to your profile.",
      });
    },
    onError: () => {
      toast({
        title: "Couldn't save address",
        description: "Your order will still go through — we just couldn't save the address.",
        variant: "destructive",
      });
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

  // First-order status — injects free 3ml BAC water for first-time buyers
  const { data: checkoutFirstOrderStatus } = useQuery<{
    isFirstOrder: boolean;
    bacWaterProductId: string | null;
    bacWaterName: string | null;
    bacWaterImageUrl: string | null;
    bacWaterDosage: string | null;
  }>({
    queryKey: ["/api/my-first-order-status"],
    queryFn: async () => {
      const res = await fetch("/api/my-first-order-status", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!checkoutFirstOrderStatus?.isFirstOrder || !checkoutFirstOrderStatus.bacWaterProductId) return;
    const alreadyFree = cartItems.some(
      (i) => i.isFree && i.productId === checkoutFirstOrderStatus.bacWaterProductId
    );
    if (alreadyFree) return;
    addToCart({
      productId: checkoutFirstOrderStatus.bacWaterProductId,
      name: checkoutFirstOrderStatus.bacWaterName || "Bacteriostatic Water",
      price: 0,
      quantity: 1,
      dosage: checkoutFirstOrderStatus.bacWaterDosage || "3ml",
      image: checkoutFirstOrderStatus.bacWaterImageUrl || undefined,
      isFree: true,
    });
  }, [checkoutFirstOrderStatus, cartItems, addToCart]);

  // Fetch saved addresses for logged-in users
  const { data: savedAddresses, isFetched: savedAddressesFetched } = useQuery<SavedAddress[]>({
    queryKey: ["/api/addresses"],
    queryFn: async () => {
      const res = await fetch("/api/addresses", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  // Fetch all distinct past shipping addresses for returning users
  const { data: pastShippingAddresses } = useQuery<{ street: string; city: string; state: string; zip: string }[]>({
    queryKey: ["/api/orders/past-shipping-addresses"],
    queryFn: async () => {
      const res = await fetch("/api/orders/past-shipping-addresses", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  // Fetch the most recent order's shipping address as a fallback
  const { data: latestOrderAddress } = useQuery<{ street: string; city: string; state: string; zip: string } | null>({
    queryKey: ["/api/orders/latest-shipping-address"],
    queryFn: async () => {
      const res = await fetch("/api/orders/latest-shipping-address", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user && savedAddressesFetched && (savedAddresses?.length ?? 0) === 0,
  });

  // Pre-fill customer info from user data
  useEffect(() => {
    if (user) {
      setCustomerEmail(user.email || "");
      setCustomerName(`${user.firstName || ""} ${user.lastName || ""}`.trim());
    }
  }, [user]);

  // Pre-fill shipping address from the user's default saved address
  useEffect(() => {
    if (!savedAddresses || !user) return;
    const defaultAddr = savedAddresses.find(a => a.isDefault) ?? savedAddresses[0];
    if (!defaultAddr) return;
    setShippingAddress(prev => ({
      street: prev.street || defaultAddr.address,
      city: prev.city || defaultAddr.city,
      state: prev.state || defaultAddr.state,
      zip: prev.zip || defaultAddr.zipCode,
    }));
    setCustomerName(prev => prev || `${defaultAddr.firstName} ${defaultAddr.lastName}`.trim());
  }, [savedAddresses, user]);

  // Fallback: pre-fill from the most recent order when the user has no saved addresses
  useEffect(() => {
    if (!latestOrderAddress || !user) return;
    setShippingAddress(prev => ({
      street: prev.street || latestOrderAddress.street,
      city: prev.city || latestOrderAddress.city,
      state: prev.state || latestOrderAddress.state,
      zip: prev.zip || latestOrderAddress.zip,
    }));
  }, [latestOrderAddress, user]);

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
        customerName: customerName,
        address: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zip,
      };
      sessionStorage.setItem('orderSummary', JSON.stringify(orderSummary));
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey[0];
        return typeof key === 'string' && key.startsWith('/api/products');
      }});
      clearCart();
      clearCheckoutStorage();
      localStorage.removeItem("appliedDiscount");
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

  // Early Access Mode
  const EARLY_ACCESS_MODE = false;

  const handlePayPalSuccess = async (orderData: any, paypalOrderId: string) => {
    try {
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
        toast({
          title: "Payment Successful",
          description: "Payment received, but there was an issue creating your order record. Please contact support.",
          variant: "destructive",
        });
      } else {
        const result = await response.json();
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

    const orderSummary = {
      paypalOrderId,
      items: cartItems.map(item => ({
        name: item.name,
        dosage: item.dosage,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: cartSubtotal,
      shipping: cartShipping,
      tax: cartTax,
      discount: 0,
      total: cartTotal,
      customerEmail: user?.email || customerEmail,
      customerName: customerName,
      address: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zip: shippingAddress.zip,
    };
    sessionStorage.setItem('orderSummary', JSON.stringify(orderSummary));
    queryClient.invalidateQueries({ predicate: (query) => {
      const key = query.queryKey[0];
      return typeof key === 'string' && key.startsWith('/api/products');
    }});
    orderCompleteRef.current = true;
    clearCart();
    clearCheckoutStorage();
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

  const cartSubtotal = getSubtotal();
  const hasSubscriptionItemsForShipping = hasSubscriptionItems;
  const baseShipping = hasSubscriptionItemsForShipping ? 0 : (cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_RATE_SHIPPING);
  const cartShipping = baseShipping;
  const taxInfo = calculateTaxFromZip(shippingAddress.zip || '', cartSubtotal);
  const cartTax = taxInfo.tax;
  const taxState = taxInfo.state;
  const taxRatePercent = taxInfo.rate * 100;
  const hasValidZip = isValidZipCode(shippingAddress.zip || '');
  const cartTotal = cartSubtotal + cartShipping + cartTax;

  // Payment method info
  const CASHAPP_TAG = "$reviveresearchco";
  const VENMO_HANDLE = "@reviveresearchco";
  const ZELLE_INFO = "Coming Soon";

  // ─── Empty / error states ─────────────────────────────────────────────────

  if (fromCart && cartItems.length === 0 && !orderCompleteRef.current) {
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

  // ─── RUO Reminder Dialog ──────────────────────────────────────────────────

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
                  <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${ruoAcknowledged ? 'bg-red-500 border-red-500' : 'border-red-500/50'}`}>
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
                  <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${ageConfirmed ? 'bg-[#E7FB10] border-[#E7FB10]' : 'border-[#E7FB10]/50'}`}>
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

  // ─── Main 2-step fromCart flow ────────────────────────────────────────────

  if (fromCart) {
    // Compact order summary line
    const summaryLine = cartItems
      .slice(0, 2)
      .map(i => `${i.name} ${i.dosage}`)
      .join(' · ') + (cartItems.length > 2 ? ` +${cartItems.length - 2} more` : '');

    return (
      <>
        <RuoReminderDialog />
        <main className="min-h-screen pt-20 md:pt-28 pb-36 md:pb-16 px-3 sm:px-4 md:px-8 overflow-x-hidden bg-[#1a1a1f]">
          <SEOHead title="Checkout" description="Complete your order securely. All research compounds ship same-day before 12 PM CT with discreet packaging." canonicalPath="/checkout" />
          <div className="max-w-lg mx-auto w-full">

            {/* ── Top nav row ── */}
            <div className="flex items-center justify-between mb-5">
              {checkoutStep === 1 ? (
                <Link href="/cart" onClick={() => sessionStorage.removeItem('checkoutRuoAcknowledged')}>
                  <Button variant="ghost" size="sm" className="gap-1 -ml-2" data-testid="button-back-cart">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back to Cart</span>
                    <span className="sm:hidden">Cart</span>
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 -ml-2"
                  onClick={() => setCheckoutStep(1)}
                  data-testid="button-back-shipping"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
              )}
              {/* Lock badge */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Secure Checkout</span>
              </div>
            </div>

            {/* ── Progress stepper ── */}
            <div className="flex items-center gap-0 mb-5">
              {/* Step 1 */}
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-colors ${
                  checkoutStep === 1
                    ? 'bg-[#E7FB10] text-[#0a0a0a]'
                    : 'bg-green-500 text-white'
                }`}>
                  {checkoutStep > 1 ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : '1'}
                </div>
                <span className={`text-sm font-medium ${checkoutStep === 1 ? 'text-foreground' : 'text-green-400'}`}>
                  Shipping
                </span>
              </div>
              {/* Divider */}
              <div className={`flex-1 h-px mx-3 transition-colors ${checkoutStep > 1 ? 'bg-green-500/40' : 'bg-border'}`} />
              {/* Step 2 */}
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-colors ${
                  checkoutStep === 2
                    ? 'bg-[#E7FB10] text-[#0a0a0a]'
                    : 'bg-[#2a2a2f] text-muted-foreground'
                }`}>
                  2
                </div>
                <span className={`text-sm font-medium ${checkoutStep === 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Payment
                </span>
              </div>
            </div>

            {/* ── Compact order summary bar ── */}
            <div className="bg-[#141414] rounded-xl p-3 mb-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground/60 mb-0.5">
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                  {checkoutStep === 2 && shippingAddress.city && (
                    <> · Shipping to {shippingAddress.city}, {shippingAddress.state}</>
                  )}
                </p>
                <p className="text-xs text-muted-foreground truncate">{summaryLine}</p>
              </div>
              <p className="font-display font-bold text-lg text-[#E7FB10] flex-shrink-0">
                ${Math.round(cartTotal)}
              </p>
            </div>

            {/* ── Mixed cart warning ── */}
            {hasMixedCart && (
              <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-200">
                    <p className="font-medium mb-1">Subscription items need separate checkout</p>
                    <p className="text-muted-foreground">Subscriptions and one-time purchases must be checked out separately.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════
                STEP 1: SHIPPING
            ════════════════════════════════════════════════════ */}
            {checkoutStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22 }}
              >
                {/* Account panel */}
                <div className="bg-[#141414] rounded-xl p-4 mb-3">
                  <div className="flex items-center justify-between">
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
                </div>

                {/* Shipping form */}
                <div className="bg-[#141414] rounded-xl p-4 mb-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-[26px] h-[26px] rounded-full bg-[#d4ed1f] flex items-center justify-center text-[#0a0a0a] font-bold text-xs flex-shrink-0">1</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-none">Shipping</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Where we'll send your order</p>
                    </div>
                  </div>

                  {/* Saved address card — shown when user has a default address already filled */}
                  {isAuthenticated && shippingValid && (savedAddresses?.length ?? 0) > 0 ? (
                    <div className="space-y-3">
                      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-green-300 leading-none mb-1">Saved Address</p>
                            <p className="text-sm text-foreground">{customerName}</p>
                            <p className="text-xs text-muted-foreground">{customerEmail}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {shippingAddress.street}, {shippingAddress.city} {shippingAddress.state} {shippingAddress.zip}
                            </p>
                          </div>
                          <button
                            className="text-xs text-[#d4ed1f] underline-offset-2 hover:underline transition-colors flex-shrink-0"
                            onClick={() => {
                              // Clear so form expands
                              setShippingAddress({ street: "", city: "", state: "", zip: "" });
                            }}
                            data-testid="button-edit-saved-address"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#0a0a0a] border-[0.5px] border-white/[0.08] rounded-xl p-4">
                      {/* Contact group */}
                      <div className="mb-4">
                        <p className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-widest mb-2.5">Contact</p>
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
                            <Label htmlFor="ship-phone" className="text-xs">
                              Phone <span className="text-muted-foreground/60 font-normal italic">(optional)</span>
                            </Label>
                            <Input
                              id="ship-phone"
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="(555) 000-0000"
                              autoComplete="tel"
                              className="mt-1"
                              data-testid="input-customer-phone"
                            />
                            <p className="text-[10px] text-muted-foreground/60 mt-1">Recommended for shipping updates</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/[0.05] my-4" />

                      {/* Address group */}
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <p className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-widest">Address</p>
                          {isAuthenticated && (pastShippingAddresses?.length ?? 0) > 1 && (
                            <Select
                              value=""
                              onValueChange={(idx) => {
                                const addr = pastShippingAddresses?.[parseInt(idx)];
                                if (addr) {
                                  setShippingAddress({
                                    street: addr.street,
                                    city: addr.city,
                                    state: addr.state,
                                    zip: addr.zip,
                                  });
                                }
                              }}
                            >
                              <SelectTrigger
                                className="h-7 text-[10px] w-auto gap-1 border-white/20 bg-transparent text-muted-foreground hover:text-foreground"
                                data-testid="select-past-address-trigger"
                              >
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <SelectValue placeholder="Use a previous address" />
                              </SelectTrigger>
                              <SelectContent align="end" className="max-w-[280px]">
                                {pastShippingAddresses?.map((addr, i) => (
                                  <SelectItem key={i} value={String(i)} data-testid={`option-past-address-${i}`}>
                                    <span className="text-xs truncate">
                                      {addr.street}, {addr.city}, {addr.state} {addr.zip}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <div className="space-y-3">
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
                          <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
                            <div>
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
                              <Select
                                value={shippingAddress.state}
                                onValueChange={(v) => setShippingAddress({...shippingAddress, state: v})}
                              >
                                <SelectTrigger
                                  className={`mt-1 ${submitAttempted && !shippingAddress.state ? "border-red-500" : ""}`}
                                  data-testid="select-state"
                                >
                                  <SelectValue placeholder="—" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                  <SelectItem value="AL">AL</SelectItem>
                                  <SelectItem value="AK">AK</SelectItem>
                                  <SelectItem value="AZ">AZ</SelectItem>
                                  <SelectItem value="AR">AR</SelectItem>
                                  <SelectItem value="CA">CA</SelectItem>
                                  <SelectItem value="CO">CO</SelectItem>
                                  <SelectItem value="CT">CT</SelectItem>
                                  <SelectItem value="DC">DC</SelectItem>
                                  <SelectItem value="DE">DE</SelectItem>
                                  <SelectItem value="FL">FL</SelectItem>
                                  <SelectItem value="GA">GA</SelectItem>
                                  <SelectItem value="HI">HI</SelectItem>
                                  <SelectItem value="ID">ID</SelectItem>
                                  <SelectItem value="IL">IL</SelectItem>
                                  <SelectItem value="IN">IN</SelectItem>
                                  <SelectItem value="IA">IA</SelectItem>
                                  <SelectItem value="KS">KS</SelectItem>
                                  <SelectItem value="KY">KY</SelectItem>
                                  <SelectItem value="LA">LA</SelectItem>
                                  <SelectItem value="ME">ME</SelectItem>
                                  <SelectItem value="MD">MD</SelectItem>
                                  <SelectItem value="MA">MA</SelectItem>
                                  <SelectItem value="MI">MI</SelectItem>
                                  <SelectItem value="MN">MN</SelectItem>
                                  <SelectItem value="MS">MS</SelectItem>
                                  <SelectItem value="MO">MO</SelectItem>
                                  <SelectItem value="MT">MT</SelectItem>
                                  <SelectItem value="NE">NE</SelectItem>
                                  <SelectItem value="NV">NV</SelectItem>
                                  <SelectItem value="NH">NH</SelectItem>
                                  <SelectItem value="NJ">NJ</SelectItem>
                                  <SelectItem value="NM">NM</SelectItem>
                                  <SelectItem value="NY">NY</SelectItem>
                                  <SelectItem value="NC">NC</SelectItem>
                                  <SelectItem value="ND">ND</SelectItem>
                                  <SelectItem value="OH">OH</SelectItem>
                                  <SelectItem value="OK">OK</SelectItem>
                                  <SelectItem value="OR">OR</SelectItem>
                                  <SelectItem value="PA">PA</SelectItem>
                                  <SelectItem value="RI">RI</SelectItem>
                                  <SelectItem value="SC">SC</SelectItem>
                                  <SelectItem value="SD">SD</SelectItem>
                                  <SelectItem value="TN">TN</SelectItem>
                                  <SelectItem value="TX">TX</SelectItem>
                                  <SelectItem value="UT">UT</SelectItem>
                                  <SelectItem value="VT">VT</SelectItem>
                                  <SelectItem value="VA">VA</SelectItem>
                                  <SelectItem value="WA">WA</SelectItem>
                                  <SelectItem value="WV">WV</SelectItem>
                                  <SelectItem value="WI">WI</SelectItem>
                                  <SelectItem value="WY">WY</SelectItem>
                                </SelectContent>
                              </Select>
                              {submitAttempted && !shippingAddress.state && <p className="text-xs text-red-500 mt-1">Required</p>}
                            </div>
                            <div>
                              <Label htmlFor="ship-zip" className="text-xs">ZIP *</Label>
                              <Input
                                id="ship-zip"
                                value={shippingAddress.zip}
                                onChange={(e) => {
                                  const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                                  const zip = digits.length > 5
                                    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
                                    : digits;
                                  setShippingAddress({...shippingAddress, zip});
                                }}
                                placeholder="78701"
                                inputMode="numeric"
                                autoComplete="postal-code"
                                className={`mt-1 ${submitAttempted && !shippingAddress.zip ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                data-testid="input-zip"
                              />
                              {submitAttempted && !shippingAddress.zip && <p className="text-xs text-red-500 mt-1">Required</p>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Save to profile */}
                      {isAuthenticated && (
                        <div className="mt-4 pt-3 border-t border-white/[0.06]">
                          <div
                            className="flex items-center gap-2 cursor-pointer select-none"
                            onClick={() => setSaveToProfile(v => !v)}
                            data-testid="checkbox-save-to-profile-wrapper"
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${saveToProfile ? "bg-[#E7FB10] border-[#E7FB10]" : "border-white/30"}`}>
                              {saveToProfile && (
                                <svg className="w-2.5 h-2.5 text-[#1a1a1f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground" data-testid="checkbox-save-to-profile">
                              Save to my profile for next time
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Shipping method */}
                <div className="bg-[#141414] rounded-xl p-4 mb-3">
                  <p className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-widest mb-3">Shipping Method</p>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-3 px-3 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                      baseShipping === 0 ? 'border-green-500/60 bg-green-500/10' : 'border-border'
                    }`}>
                      <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Standard Shipping</p>
                        <p className="text-[10px] text-muted-foreground">3–5 business days · Discreet packaging</p>
                      </div>
                      <span className={`text-sm font-semibold ${baseShipping === 0 ? 'text-green-400' : 'text-foreground'}`}>
                        {baseShipping === 0 ? 'FREE' : `$${Math.round(baseShipping)}`}
                      </span>
                    </div>
                  </div>
                  {baseShipping === 0 && cartSubtotal < FREE_SHIPPING_THRESHOLD && !hasSubscriptionItems && (
                    <p className="text-[10px] text-green-400/70 mt-2">Free shipping on orders over ${FREE_SHIPPING_THRESHOLD}</p>
                  )}
                  {cartSubtotal >= FREE_SHIPPING_THRESHOLD && (
                    <p className="text-[10px] text-green-400/70 mt-2">Free shipping unlocked on your order</p>
                  )}
                </div>

                {/* Trust strip */}
                <div className="flex items-center justify-center gap-5 py-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <span className="text-[10px] text-muted-foreground/60">SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <span className="text-[10px] text-muted-foreground/60">Verified Lab Testing</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <span className="text-[10px] text-muted-foreground/60">Discreet Shipping</span>
                  </div>
                </div>

                {/* Continue to Payment CTA */}
                <Button
                  size="lg"
                  onClick={() => {
                    if (!shippingValid) {
                      setSubmitAttempted(true);
                      return;
                    }
                    if (saveToProfile && isAuthenticated) {
                      saveAddressMutation.mutate();
                    }
                    setCheckoutStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={!shippingValid}
                  className={`w-full font-display text-base gap-2 transition-all ${
                    shippingValid
                      ? 'bg-[#E7FB10] text-[#0a0a0a] hover:bg-[#E7FB10]/90'
                      : 'bg-[#E7FB10]/20 text-[#E7FB10]/50 cursor-not-allowed'
                  }`}
                  data-testid="button-continue-to-payment"
                >
                  Continue to Payment →
                </Button>
                {!shippingValid && (
                  <p className="text-[10px] text-muted-foreground/40 text-center mt-2">Fill all required fields to continue</p>
                )}
              </motion.div>
            )}

            {/* ════════════════════════════════════════════════════
                STEP 2: PAYMENT & REVIEW
            ════════════════════════════════════════════════════ */}
            {checkoutStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22 }}
              >

                {/* ── Payment method selector ── */}
                <div className="bg-[#141414] rounded-xl p-4 mb-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-[26px] h-[26px] rounded-full bg-[#d4ed1f] flex items-center justify-center text-[#0a0a0a] font-bold text-xs flex-shrink-0">2</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-none">Payment</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">How you want to pay</p>
                    </div>
                  </div>

                  {/* Top tier: Card + PayPal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    {/* Credit / Debit Card */}
                    <button
                      className={`relative flex items-center gap-3 px-4 py-5 rounded-lg border-2 transition-all text-left ${
                        selectedPaymentMethod === "card"
                          ? "border-[#d4ed1f] bg-[#d4ed1f] text-[#0a0a0a]"
                          : "border-[#d4ed1f] bg-transparent text-white"
                      }`}
                      onClick={() => { setSelectedPaymentMethod("card"); setManualPaymentStep("select"); }}
                      data-testid="payment-method-card"
                    >
                      <span className={`absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded ${
                        selectedPaymentMethod === "card"
                          ? "bg-[#0a0a0a]/20 text-[#0a0a0a]"
                          : "bg-[#d4ed1f]/20 text-[#d4ed1f]"
                      }`}>RECOMMENDED</span>
                      <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${
                        selectedPaymentMethod === "card" ? "bg-[#0a0a0a]/20" : "bg-[#d4ed1f]/10"
                      }`}>
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <p className="text-sm font-semibold leading-tight">Credit / Debit Card</p>
                        <p className={`text-[10px] ${selectedPaymentMethod === "card" ? "text-[#0a0a0a]/70" : "text-muted-foreground"}`}>
                          Pay directly on this page
                        </p>
                      </div>
                      {selectedPaymentMethod === "card" && (
                        <CheckCircle className="h-3.5 w-3.5 text-[#0a0a0a] flex-shrink-0" />
                      )}
                    </button>

                    {/* PayPal */}
                    <button
                      className={`flex items-center gap-3 px-4 py-5 rounded-lg border-2 transition-all text-left ${
                        selectedPaymentMethod === "paypal"
                          ? "border-[#0070ba] bg-[#0070ba] text-white"
                          : "border-[#0070ba] bg-transparent text-white"
                      }`}
                      onClick={() => { setSelectedPaymentMethod("paypal"); setManualPaymentStep("select"); }}
                      data-testid="payment-method-paypal"
                    >
                      <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${
                        selectedPaymentMethod === "paypal" ? "bg-white/30" : "bg-[#0070ba]/30"
                      }`}>
                        <span className="text-sm font-black leading-none text-white">PP</span>
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <p className="text-sm font-semibold leading-tight">PayPal</p>
                        <p className={`text-[10px] ${selectedPaymentMethod === "paypal" ? "text-white/70" : "text-muted-foreground"}`}>
                          Sign in to your PayPal
                        </p>
                      </div>
                      {selectedPaymentMethod === "paypal" && (
                        <CheckCircle className="h-3.5 w-3.5 text-white flex-shrink-0" />
                      )}
                    </button>
                  </div>

                  {selectedPaymentMethod === "paypal" && (
                    <p className="text-[9px] italic text-muted-foreground/50 mt-1.5 px-1">
                      PayPal will use the shipping address on your PayPal account
                    </p>
                  )}

                  {/* Pay another way toggle */}
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-white/[0.08] bg-[#141414] transition-all text-left cursor-pointer mt-2"
                    onClick={() => setPayAnotherWayExpanded(prev => !prev)}
                    data-testid="pay-another-way-toggle"
                  >
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="w-[22px] h-[22px] bg-[#00D632] rounded flex items-center justify-center">
                        <DollarSign className="h-3 w-3 text-white" />
                      </div>
                      <div className="w-[22px] h-[22px] bg-[#00AFF1] rounded flex items-center justify-center">
                        <span className="text-[10px] font-black text-white leading-none">V</span>
                      </div>
                      <div className="w-[22px] h-[22px] bg-[#6D1ED4] rounded flex items-center justify-center">
                        <span className="text-[10px] font-black text-white leading-none">Z</span>
                      </div>
                    </div>
                    <span className="flex-1 text-sm text-muted-foreground">Pay another way</span>
                    {payAnotherWayExpanded
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    }
                  </button>

                  <AnimatePresence>
                    {payAnotherWayExpanded && (
                      <motion.div
                        key="pay-another-way-grid"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          {/* CashApp */}
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

                          {/* Venmo */}
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
                              <span className="text-sm font-black text-white leading-none">V</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold leading-tight">Venmo</p>
                              <p className="text-[10px] text-muted-foreground">{VENMO_HANDLE}</p>
                            </div>
                            {selectedPaymentMethod === "venmo" && (
                              <CheckCircle className="h-3.5 w-3.5 text-[#00AFF1] flex-shrink-0" />
                            )}
                          </button>

                          {/* Zelle — disabled */}
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

                          {/* Bank Transfer — disabled */}
                          <button
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 border-border transition-all text-left opacity-40 cursor-not-allowed"
                            disabled
                            data-testid="payment-method-bank"
                          >
                            <div className="w-8 h-8 bg-[#d4ed1f] rounded-md flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-3.5 w-3.5 text-[#0a0a0a]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold leading-tight">Bank Transfer</p>
                              <p className="text-[10px] text-muted-foreground">Coming soon · Link Money</p>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* PayPal info note */}
                  <AnimatePresence mode="wait">
                    {selectedPaymentMethod === "paypal" && (
                      <motion.div
                        key="paypal-info"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="rounded-lg bg-[#0070ba]/10 border border-[#0070ba]/30 p-3 flex items-center gap-3 mt-3"
                      >
                        <div className="w-9 h-9 bg-[#0070ba] rounded-md flex items-center justify-center flex-shrink-0">
                          <Lock className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Secure PayPal checkout</p>
                          <p className="text-xs text-muted-foreground">Review your order below, then click "Pay with PayPal" — you'll complete payment on PayPal's site and be brought right back.</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Manual payment instructions */}
                    {['cashapp', 'venmo', 'zelle'].includes(selectedPaymentMethod) && (
                      <motion.div
                        key="manual-instructions"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="mt-3"
                      >
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
                                  Send <span className="font-semibold text-foreground">${Math.round(cartTotal)}</span> to{" "}
                                  <button
                                    className="font-mono font-semibold underline underline-offset-2 cursor-pointer"
                                    style={{ color: methodColor }}
                                    onClick={() => copyToClipboard(methodHandle)}
                                  >
                                    {methodHandle}
                                  </button>{" "}
                                  with <span className="font-semibold text-foreground underline underline-offset-2">your order number in the note</span>
                                </p>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: methodColor }}>3</div>
                                <p className="text-sm text-muted-foreground leading-snug">We verify payment and ship — you'll receive a shipping notification</p>
                              </li>
                            </ol>
                          );
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Card details panel — only shown when card is selected ── */}
                {hasValidZip && !EARLY_ACCESS_MODE && !isSubscription && !cartSubscriptionItem && stockErrors.length === 0 && (
                  <div className={`relative bg-[#141414] rounded-xl p-4 mb-3 border border-[#d4ed1f]/20 overflow-hidden${selectedPaymentMethod !== "card" ? " hidden" : ""}`}>
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#d4ed1f]/6 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-3 mb-4 relative">
                      <div className="w-[26px] h-[26px] rounded-full bg-[#d4ed1f] flex items-center justify-center text-[#0a0a0a] font-bold text-xs flex-shrink-0">3</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-none">Card details</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Encrypted by PayPal</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className="h-[22px] w-[34px] bg-white rounded-[3px] flex items-center justify-center overflow-hidden shadow-sm px-1">
                          <img src="/card-logos/visa.svg" alt="Visa" className="h-[11px] w-auto object-contain" />
                        </div>
                        <div className="h-[22px] w-[34px] bg-white rounded-[3px] flex items-center justify-center overflow-hidden shadow-sm">
                          <img src="/card-logos/mastercard.svg" alt="Mastercard" className="h-[16px] w-auto object-contain" />
                        </div>
                        <div className="h-[22px] w-[34px] bg-white rounded-[3px] flex items-center justify-center overflow-hidden shadow-sm">
                          <img src="/card-logos/amex.svg" alt="American Express" className="h-[16px] w-auto object-contain" />
                        </div>
                      </div>
                    </div>
                    <PayPalCheckout
                      ref={cardPaypalRef}
                      amount={cartTotal.toFixed(2)}
                      currency="USD"
                      intent="CAPTURE"
                      cartItems={cartItems}
                      customerEmail={user?.email || customerEmail}
                      customerName={customerName}
                      shippingAddress={shippingAddress}
                      subtotal={cartSubtotal}
                      shippingCost={cartShipping}
                      taxAmount={cartTax}
                      showCardFields={true}
                      defaultMethod="card"
                      hideSubmitButton={true}
                      onReadyChange={setIsCardReady}
                      onProcessingChange={setIsSubmittingCard}
                      onCardIneligible={() => setSelectedPaymentMethod("paypal")}
                      onCardDeclineError={setCheckoutCardDeclineError}
                      onSuccess={handlePayPalSuccess}
                      onError={handlePayPalError}
                      onCancel={() => toast({ title: "Payment Cancelled", description: "You cancelled the payment." })}
                      className="w-full"
                    />
                  </div>
                )}

                {/* ── Order review card ── */}
                <div className="bg-[#141414] rounded-xl p-4 mb-3">
                  <p className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-widest mb-3">Order Review</p>

                  {/* Item list — compact, no full images */}
                  <div className="space-y-2 mb-4">
                    {cartItems.map((item) => (
                      <div
                        key={`${item.productId}-${item.dosage}-${item.isSubscription ? 'sub' : 'one'}${item.packSize ? `-pack${item.packSize}` : ''}`}
                        className="flex items-center gap-3"
                      >
                        {/* Small 36px thumbnail */}
                        <div className="w-9 h-9 rounded-md bg-muted/40 flex items-center justify-center flex-shrink-0 overflow-hidden ring-1 ring-[#E7FB10]/15">
                          <img
                            src={item.image || productImage}
                            alt={item.name}
                            className="w-full h-full object-contain p-0.5"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight truncate">
                            {item.name}
                            {item.packSize && <span className="text-[#E7FB10] ml-1 text-xs">({item.packSize}-Pack)</span>}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {item.dosage} × {item.quantity}
                            {item.isSubscription && item.subscriptionInterval && (
                              <span className="ml-1 text-primary"> · {intervalLabels[item.subscriptionInterval]} Sub</span>
                            )}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-[#E7FB10] tabular-nums flex-shrink-0">
                          {item.isFree ? 'FREE' : `$${Math.round(item.price * item.quantity)}`}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-3 bg-white/[0.06]" />

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${Math.round(cartSubtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={baseShipping === 0 ? "text-green-400" : ""}>
                        {baseShipping === 0 ? "FREE" : `$${Math.round(baseShipping)}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Tax {hasValidZip && taxState && (
                          <span className="text-xs text-muted-foreground/60">({taxState} — {taxRatePercent.toFixed(2)}%)</span>
                        )}
                      </span>
                      {!hasValidZip ? (
                        <span className="text-xs text-muted-foreground/50 italic">—</span>
                      ) : (
                        <span className={cartTax === 0 ? "text-green-400" : ""}>
                          {cartTax === 0 ? "No tax" : `$${cartTax.toFixed(2)}`}
                        </span>
                      )}
                    </div>
                  </div>

                  <Separator className="my-3 bg-white/[0.06]" />

                  <div className="flex justify-between items-center">
                    <span className="font-display text-base font-semibold">Total</span>
                    <span className="font-display text-2xl font-bold text-[#E7FB10]" data-testid="text-order-total">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Shipping to summary */}
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                    <p className="text-[11px] text-muted-foreground/60 truncate">
                      {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
                    </p>
                    <button
                      className="text-[10px] text-[#d4ed1f] hover:underline flex-shrink-0 ml-auto"
                      onClick={() => setCheckoutStep(1)}
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* ── Early Access Notice ── */}
                {EARLY_ACCESS_MODE && (
                  <div className="mb-3 p-3 rounded-lg bg-[#E7FB10]/10 border border-[#E7FB10]/30" data-testid="early-access-checkout-notice">
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

                {/* ── Stock Validation Warning ── */}
                {stockErrors.length > 0 && (
                  <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30" data-testid="stock-error-warning">
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

                {/* ── PAY BUTTON — always the last element ── */}
                <div className="space-y-3 mb-3">
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
                  ) : selectedPaymentMethod === "card" ? (
                    <>
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
                      ) : isSubscription || cartSubscriptionItem ? (
                        <Button
                          size="lg"
                          className="w-full font-display text-lg gap-2 bg-muted text-muted-foreground cursor-not-allowed"
                          disabled
                          data-testid="button-subscription-coming-soon"
                        >
                          <Clock className="h-5 w-5" />
                          Subscriptions Coming Soon
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="lg"
                            onClick={() => {
                              setCheckoutCardDeclineError(null);
                              cardPaypalRef.current?.submit();
                            }}
                            disabled={isSubmittingCard || !isCardReady}
                            className="w-full bg-[#d4ed1f] text-[#0a0a0a] font-display text-lg gap-2"
                            data-testid="button-pay-card"
                          >
                            {isSubmittingCard ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Lock className="h-5 w-5" />
                                Pay ${cartTotal.toFixed(2)}
                              </>
                            )}
                          </Button>
                          {checkoutCardDeclineError && (
                            <div
                              className="flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-400"
                              data-testid="checkout-card-decline-error"
                              role="alert"
                            >
                              <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0zm-7-4a1 1 0 1 0-2 0v4a1 1 0 0 0 2 0V6zm-1 8a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 10 14z" clipRule="evenodd" />
                              </svg>
                              <span>{checkoutCardDeclineError}</span>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : selectedPaymentMethod === "paypal" ? (
                    <>
                      {!hasValidZip ? (
                        <Button
                          size="lg"
                          className="w-full font-display text-lg gap-2 bg-[#E7FB10]/20 text-[#E7FB10] border border-[#E7FB10]/30 cursor-not-allowed"
                          disabled
                          data-testid="button-enter-zip-required-paypal"
                        >
                          <AlertTriangle className="h-5 w-5" />
                          Enter ZIP Code to Continue
                        </Button>
                      ) : EARLY_ACCESS_MODE ? (
                        <Button
                          size="lg"
                          className="w-full font-display text-lg gap-2 bg-muted text-muted-foreground cursor-not-allowed"
                          disabled
                          data-testid="button-checkout-disabled-paypal"
                        >
                          <Clock className="h-5 w-5" />
                          Coming Soon
                        </Button>
                      ) : isSubscription || cartSubscriptionItem ? (
                        <Button
                          size="lg"
                          className="w-full font-display text-lg gap-2 bg-muted text-muted-foreground cursor-not-allowed"
                          disabled
                          data-testid="button-subscription-coming-soon-paypal"
                        >
                          <Clock className="h-5 w-5" />
                          Subscriptions Coming Soon
                        </Button>
                      ) : (
                        <PayPalCheckout
                          amount={cartTotal.toFixed(2)}
                          currency="USD"
                          intent="CAPTURE"
                          cartItems={cartItems}
                          customerEmail={user?.email || customerEmail}
                          customerName={customerName}
                          shippingAddress={shippingAddress}
                          subtotal={cartSubtotal}
                          shippingCost={cartShipping}
                          taxAmount={cartTax}
                          defaultMethod="paypal"
                          onSuccess={handlePayPalSuccess}
                          onError={handlePayPalError}
                          onCancel={() => toast({ title: "Payment Cancelled", description: "You cancelled the payment." })}
                          className="w-full"
                        />
                      )}
                    </>
                  ) : ['cashapp', 'venmo', 'zelle'].includes(selectedPaymentMethod || '') ? (
                    <>
                      {!hasValidZip ? (
                        <Button
                          size="lg"
                          className="w-full font-display text-lg gap-2 bg-[#E7FB10]/20 text-[#E7FB10] border border-[#E7FB10]/30 cursor-not-allowed"
                          disabled
                          data-testid="button-enter-zip-required-manual"
                        >
                          <AlertTriangle className="h-5 w-5" />
                          Enter ZIP Code to Continue
                        </Button>
                      ) : EARLY_ACCESS_MODE ? (
                        <Button
                          size="lg"
                          className="w-full font-display text-lg gap-2 bg-muted text-muted-foreground cursor-not-allowed"
                          disabled
                          data-testid="button-checkout-disabled-manual"
                        >
                          <Clock className="h-5 w-5" />
                          Coming Soon
                        </Button>
                      ) : isSubscription || cartSubscriptionItem ? (
                        <Button
                          size="lg"
                          className="w-full font-display text-lg gap-2 bg-muted text-muted-foreground cursor-not-allowed"
                          disabled
                          data-testid="button-subscription-coming-soon-manual"
                        >
                          <Clock className="h-5 w-5" />
                          Subscriptions Coming Soon
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="lg"
                            className={`w-full font-display text-base gap-2 ${
                              selectedPaymentMethod === "cashapp"
                                ? "bg-[#00D632] text-white"
                                : selectedPaymentMethod === "venmo"
                                  ? "bg-[#00AFF1] text-white"
                                  : "bg-[#6D1ED4] text-white"
                            }`}
                            onClick={handleManualPaymentSubmit}
                            disabled={createManualOrderMutation.isPending}
                            data-testid="button-checkout"
                          >
                            {createManualOrderMutation.isPending ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-5 w-5" />
                                Confirm Order — Pay via {selectedPaymentMethod === "cashapp" ? "CashApp" : selectedPaymentMethod === "venmo" ? "Venmo" : "Zelle"} After
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-muted-foreground text-center">
                            You'll receive your order number, then send payment separately.
                          </p>
                        </>
                      )}
                    </>
                  ) : null}
                </div>

                {/* ── Trust badges + RUO disclaimer ── */}
                <div className="flex items-center justify-center gap-4 py-3 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span className="text-[10px] text-muted-foreground/50">SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span className="text-[10px] text-muted-foreground/50">Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span className="text-[10px] text-muted-foreground/50">Same-Day Shipping</span>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground/40 text-center leading-relaxed">
                  By purchasing, you confirm these products are for <span className="text-red-400/70">research use only</span> and that you are 21+. No refunds policy applies.
                </p>

                {/* Spacer for mobile sticky bar */}
                {['cashapp', 'venmo', 'zelle'].includes(selectedPaymentMethod || '') && (
                  <div className="md:hidden h-24" />
                )}
              </motion.div>
            )}

          </div>
        </main>

        {/* ── Mobile sticky bottom bar — manual payments on step 2 ── */}
        {checkoutStep === 2 && ['cashapp', 'zelle', 'venmo'].includes(selectedPaymentMethod || '') && (
          <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Order Total</p>
                <p className="font-display font-bold text-xl">${Math.round(cartTotal)}</p>
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
