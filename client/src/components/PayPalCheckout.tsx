// PayPal Advanced Checkout Component
// Supports both PayPal button and embedded card fields for direct card entry
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Loader2, CreditCard, Lock, Calendar, Shield, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getSkuCode } from "@/lib/sku-codes";

// Generic rotating item names — client picks one per order since the PayPal v6
// SDK patches the order with the client-supplied name, overriding any server value.
const ITEM_NAMES = [
  "Lab Supplies",
  "Lab Consumables",
  "Research Materials",
  "Research Reagents",
  "Scientific Supplies",
  "Laboratory Supplies",
  "Biochemical Supplies",
  "Analytical Supplies",
  "Lab Grade Materials",
  "Research Grade Supplies",
  "Scientific Materials",
  "Laboratory Consumables",
  "Analytical Reagents",
  "Biochemical Materials",
  "Research Tools",
  "Scientific Reagents",
  "Laboratory Materials",
  "Specialty Lab Supplies",
];

function getRandomItemName(): string {
  return ITEM_NAMES[Math.floor(Math.random() * ITEM_NAMES.length)];
}


type PaymentMethod = "paypal" | "card";

export interface PayPalCheckoutHandle {
  submit: () => void;
  cardDeclineError: string | null;
}

interface PayPalCheckoutProps {
  amount: string;
  currency?: string;
  intent?: string;
  cartItems?: any[];
  customerEmail?: string;
  shippingAddress?: { street: string; city: string; state: string; zip: string };
  customerName?: string;
  subtotal?: number;
  shippingCost?: number;
  taxAmount?: number;
  onSuccess?: (orderData: any, paypalOrderId: string) => void | Promise<void>;
  onError?: (error: any) => void;
  onCancel?: () => void;
  onCardIneligible?: () => void;
  onCardDeclineError?: (message: string | null) => void;
  defaultMethod?: "card" | "paypal";
  disabled?: boolean;
  className?: string;
  showCardFields?: boolean;
  hideSubmitButton?: boolean;
  onReadyChange?: (ready: boolean) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
}

const PayPalCheckout = forwardRef<PayPalCheckoutHandle, PayPalCheckoutProps>(function PayPalCheckout({
  amount,
  currency = "USD",
  intent = "CAPTURE",
  cartItems,
  customerEmail,
  shippingAddress,
  customerName,
  subtotal,
  shippingCost,
  taxAmount,
  onSuccess,
  onError,
  onCancel,
  onCardIneligible,
  onCardDeclineError,
  defaultMethod = "card",
  disabled = false,
  className = "",
  showCardFields = true,
  hideSubmitButton = false,
  onReadyChange,
  onProcessingChange,
}: PayPalCheckoutProps, ref) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(defaultMethod);
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [isProcessingPayPal, setIsProcessingPayPal] = useState(false);
  const [cardFieldsReady, setCardFieldsReady] = useState(false);
  const [cardIneligible, setCardIneligible] = useState(false);
  const [cardDeclineError, setCardDeclineError] = useState<string | null>(null);
  const [isAvsError, setIsAvsError] = useState(false);
  const [postalCode, setPostalCode] = useState("");
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  // sdkReady flips true once the SDK is initialized and card eligibility confirmed
  const [sdkReady, setSdkReady] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const sdkInstanceRef = useRef<any>(null); // stored for use in mounting effect
  const cardSessionRef = useRef<any>(null);
  const paypalSessionRef = useRef<any>(null);
  const numberContainerRef = useRef<HTMLDivElement>(null);
  const expiryContainerRef = useRef<HTMLDivElement>(null);
  const cvvContainerRef = useRef<HTMLDivElement>(null);
  const declineErrorRef = useRef<HTMLDivElement>(null);

  const createOrder = async () => {
    const hasEnrichment =
      shippingAddress &&
      shippingAddress.street &&
      shippingAddress.city &&
      shippingAddress.state &&
      shippingAddress.zip &&
      cartItems &&
      cartItems.length > 0 &&
      subtotal !== undefined &&
      shippingCost !== undefined &&
      taxAmount !== undefined;

    const orderPayload: Record<string, any> = {
      amount: amount,
      currency: currency,
      intent: intent,
      items: cartItems?.map(item => ({
        productId: item.productId,
        dosage: item.dosage,
        quantity: item.quantity,
      })),
    };

    if (hasEnrichment) {
      orderPayload.shippingAddress = {
        fullName: customerName || "",
        street: shippingAddress!.street,
        city: shippingAddress!.city,
        state: shippingAddress!.state,
        zip: shippingAddress!.zip,
      };
      orderPayload.lineItems = cartItems!.map(item => ({
        name: getRandomItemName(),
        sku: getSkuCode(item.name, item.dosage || ""),
        quantity: item.quantity,
        unitAmount: item.price,
      }));
      orderPayload.breakdown = {
        shipping: (shippingCost!).toFixed(2),
        taxTotal: (taxAmount!).toFixed(2),
      };
    }

    const response = await fetch("/paypal/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const output = await response.json();
    if (!response.ok) {
      if (response.status === 409) {
        const errorMsg = output.stockErrors?.join(", ") || "Some items are out of stock";
        throw new Error(errorMsg);
      }
      throw new Error(output.error || "Failed to create PayPal order");
    }
    return { orderId: output.id };
  };

  const captureOrder = async (orderId: string) => {
    const response = await fetch(`/paypal/order/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to capture PayPal order");
    }
    return data;
  };

  const handleApprove = async (data: any) => {
    if (import.meta.env.DEV) { console.log("PayPal onApprove", data); }
    try {
      const orderData = await captureOrder(data.orderId);
      if (import.meta.env.DEV) { console.log("PayPal capture result", orderData); }
      onSuccess?.(orderData, data.orderId);
    } catch (e) {
      console.error("PayPal capture error:", e);
      onError?.(e);
    }
  };

  const handleCancel = async (data: any) => {
    if (import.meta.env.DEV) { console.log("PayPal onCancel", data); }
    onCancel?.();
  };

  const handleError = async (data: any) => {
    console.error("PayPal onError", data);
    onError?.(data);
  };

  useEffect(() => {
    let isMounted = true;

    const loadPayPalSDK = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        setError(null);
        setSdkReady(false); // reset so card field mounting effect re-runs after re-init

        if (!(window as any).paypal) {
          const script = document.createElement("script");
          script.src = import.meta.env.PROD
            ? "https://www.paypal.com/web-sdk/v6/core"
            : "https://www.sandbox.paypal.com/web-sdk/v6/core";
          script.async = true;
          script.onload = () => {
            if (isMounted) initPayPal();
          };
          script.onerror = () => {
            if (isMounted) {
              setError("Failed to load PayPal SDK");
              setIsLoading(false);
            }
          };
          document.body.appendChild(script);
        } else {
          await initPayPal();
        }
      } catch (e) {
        console.error("Failed to load PayPal SDK", e);
        if (isMounted) {
          setError("Failed to initialize PayPal");
          setIsLoading(false);
        }
      }
    };

    const initPayPal = async () => {
      try {
        const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
        if (!clientId) {
          throw new Error("PayPal client ID not configured. Set VITE_PAYPAL_CLIENT_ID in Replit Secrets.");
        }

        // Initialize SDK with both PayPal payments and card fields
        const components = showCardFields 
          ? ["paypal-payments", "card-fields"]
          : ["paypal-payments"];

        const sdkInstance = await (window as any).paypal.createInstance({
          clientId,
          components,
        });

        // Initialize PayPal button session and store in ref
        const paypalCheckout = sdkInstance.createPayPalOneTimePaymentSession({
          onApprove: handleApprove,
          onCancel: handleCancel,
          onError: handleError,
        });
        paypalSessionRef.current = paypalCheckout;

        // Skip eligibility pre-check — attempt to mount card fields directly.
        // findEligibleMethods() can return ineligible for valid accounts in some
        // environments; we let the actual card session creation determine viability.
        if (showCardFields) {
          sdkInstanceRef.current = sdkInstance;
          if (isMounted) setSdkReady(true);
        }

        // Mark as ready
        if (isMounted) setIsLoading(false);
      } catch (e) {
        console.error("PayPal init error:", e);
        if (isMounted) {
          setError("Failed to initialize PayPal. Please try again.");
          setIsLoading(false);
        }
      }
    };

    loadPayPalSDK();

    return () => {
      isMounted = false;
      cleanupRef.current?.();
    };
  }, [currency, intent, disabled]);

  // Mount card field web components. Runs (and re-runs cleanly) whenever sdkReady
  // flips true. Creating a fresh session each time makes this StrictMode-safe:
  // StrictMode's double-invoke gets a brand-new PayPal session, so there is no
  // "duplicate card field" error from reusing the same session across cycles.
  useEffect(() => {
    if (!sdkReady || !sdkInstanceRef.current) return;
    const sdkInstance = sdkInstanceRef.current;
    let isMounted = true;

    let cardSession: any;
    try {
      cardSession = sdkInstance.createCardFieldsOneTimePaymentSession();
      cardSessionRef.current = cardSession;
    } catch (sessionErr) {
      console.error("[PayPal] Failed to create card session — falling back to PayPal:", sessionErr);
      if (isMounted) {
        setCardIneligible(true);
        setSelectedMethod("paypal");
        onCardIneligible?.();
      }
      return;
    }

    const numberEl = numberContainerRef.current;
    const expiryEl = expiryContainerRef.current;
    const cvvEl    = cvvContainerRef.current;
    if (!numberEl || !expiryEl || !cvvEl) return;

    // Clear any stale children from prior cycle
    numberEl.innerHTML = "";
    expiryEl.innerHTML = "";
    cvvEl.innerHTML    = "";

    const numberComponent = cardSession.createCardFieldsComponent({ type: "number", placeholder: "Card number" });
    const expiryComponent = cardSession.createCardFieldsComponent({ type: "expiry", placeholder: "MM / YY" });
    const cvvComponent    = cardSession.createCardFieldsComponent({ type: "cvv",    placeholder: "CVV" });

    numberEl.appendChild(numberComponent);
    expiryEl.appendChild(expiryComponent);
    cvvEl.appendChild(cvvComponent);

    if (isMounted) setCardFieldsReady(true);

    return () => {
      isMounted = false;
      cardSessionRef.current = null;
      if (numberContainerRef.current) numberContainerRef.current.innerHTML = "";
      if (expiryContainerRef.current) expiryContainerRef.current.innerHTML = "";
      if (cvvContainerRef.current)    cvvContainerRef.current.innerHTML = "";
      setCardFieldsReady(false);
    };
  }, [sdkReady]);

  // Handle PayPal button click
  const handlePayPalClick = async () => {
    if (disabled || !paypalSessionRef.current) return;
    
    setIsProcessingPayPal(true);
    try {
      const checkoutOptionsPromise = createOrder();
      await paypalSessionRef.current.start(
        { paymentFlow: "auto" },
        checkoutOptionsPromise,
      );
    } catch (e) {
      console.error("PayPal checkout error:", e);
      onError?.(e);
    } finally {
      setIsProcessingPayPal(false);
    }
  };

  // Map PayPal decline codes / messages to user-friendly text.
  // Returns { message, isAvs } so callers can highlight the postal code field.
  const getDeclineInfo = (data: any): { message: string; isAvs: boolean } => {
    const raw: string = (data?.message ?? data?.description ?? data?.details?.[0]?.description ?? "").toLowerCase();
    const code: string = (data?.code ?? data?.details?.[0]?.issue ?? "").toLowerCase();

    // AVS / postal-code mismatch — check before generic "declined" fallback
    if (
      code.includes("avs") ||
      code.includes("card_avs") ||
      code.includes("avs_check") ||
      raw.includes("avs") ||
      raw.includes("address verification") ||
      raw.includes("postal") ||
      raw.includes("zip") ||
      raw.includes("billing address")
    ) {
      return {
        message: "Card declined — check your postal code and try again.",
        isAvs: true,
      };
    }
    if (code.includes("insufficient_funds") || raw.includes("insufficient funds") || raw.includes("insufficient_funds")) {
      return { message: "Your card was declined due to insufficient funds. Please try a different card or payment method.", isAvs: false };
    }
    if (code.includes("card_expired") || raw.includes("expired") || raw.includes("expir")) {
      return { message: "Your card appears to be expired. Please check the expiry date or use a different card.", isAvs: false };
    }
    if (code.includes("invalid_cvv") || raw.includes("cvv") || raw.includes("security code") || raw.includes("cvc")) {
      return { message: "The security code (CVV) entered is incorrect. Please double-check and try again.", isAvs: false };
    }
    if (code.includes("invalid_account") || raw.includes("invalid card") || raw.includes("invalid account") || raw.includes("card number")) {
      return { message: "The card number appears to be invalid. Please check your details and try again.", isAvs: false };
    }
    if (code.includes("do_not_honor") || raw.includes("do not honor") || raw.includes("do_not_honor")) {
      return { message: "Your bank declined the transaction. Please contact your bank or try a different card.", isAvs: false };
    }
    if (code.includes("fraud") || raw.includes("fraud") || raw.includes("restricted")) {
      return { message: "This transaction was flagged by your bank. Please contact your bank or use a different card.", isAvs: false };
    }
    if (raw.includes("declined") || code.includes("declined")) {
      return { message: "Your card was declined. Please check your details or try a different card.", isAvs: false };
    }
    return { message: "Your card payment could not be processed. Please check your details or try a different card.", isAvs: false };
  };


  // Detect network/transport-level errors that are NOT card declines.
  // These errors mean the request never reached the processor (or the response
  // was never received), so "check your card details" wording is wrong.
  const isNetworkError = (e: any): boolean => {
    if (e instanceof TypeError) return true; // "Failed to fetch", "Load failed", "NetworkError when attempting to fetch resource", etc.
    const msg: string = (e?.message ?? e?.description ?? "").toLowerCase();
    const code: string = (e?.code ?? "").toLowerCase();
    return (
      msg.includes("failed to fetch") ||
      msg.includes("networkerror") ||
      msg.includes("network error") ||
      msg.includes("load failed") ||
      msg.includes("connection") ||
      msg.includes("timeout") ||
      msg.includes("aborted") ||
      code === "network_error" ||
      code === "timeout"
    );
  };

  // Validate postal code per task spec: "5-digit US or alphanumeric international"
  //   US:            exactly 5 digits        e.g. 90210, 75008
  //   International: 3-10 chars containing at least one letter  e.g. SW1A 1AA, M5V 2H1
  const validatePostalCode = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return "Postal code is required";
    const isUsZip = /^\d{5}$/.test(trimmed);
    const isInternational = /^(?=.*[A-Za-z])[A-Za-z0-9 -]{3,10}$/.test(trimmed);
    if (!isUsZip && !isInternational) {
      return "Enter a valid postal code (e.g. 90210 or SW1A 1AA)";
    }
    return null;
  };

  // Handle card payment submission
  // v6: create order first, then pass orderId directly to submit()
  const handleCardSubmit = async () => {
    if (!cardSessionRef.current || isProcessingCard || disabled) return;
    const pcError = validatePostalCode(postalCode);
    if (pcError) {
      setPostalCodeError(pcError);
      return;
    }
    setPostalCodeError(null);
    setIsProcessingCard(true);
    onProcessingChange?.(true);
    setCardDeclineError(null);
    setIsAvsError(false);
    onCardDeclineError?.(null);
    let isSuccessful = false;
    try {
      const { orderId } = await createOrder();
      const { state, data } = await cardSessionRef.current.submit(orderId, {
        billingAddress: { postalCode: postalCode.trim() },
        // Passes cardholder name into the card iframe so it appears on
        // the PayPal transaction detail page (payment_source.card.name).
        // The activity list Name column is always "--" for direct card
        // payments — that is a PayPal platform limitation, not a code issue.
        ...(customerName ? { cardholderName: customerName } : {}),
      });
      if (state === "succeeded") {
        if (import.meta.env.DEV) { console.log("[PayPal Card] submit succeeded", orderId); }
        try {
          const captureResult = await captureOrder(orderId);
          isSuccessful = true;
          await onSuccess?.(captureResult, orderId);
        } catch (e) {
          console.error("[PayPal Card] capture error:", e);
          onError?.(e);
        }
      } else if (state === "canceled") {
        handleCancel(data ?? {});
      } else {
        const { message: friendlyMessage, isAvs } = getDeclineInfo(data);
        console.error("[PayPal Card] submit failed:", state, data);
        setCardDeclineError(friendlyMessage);
        setIsAvsError(isAvs);
        onCardDeclineError?.(friendlyMessage);
        onError?.(new Error(data?.message ?? "Card payment failed"));
      }
    } catch (e: any) {
      console.error("Card payment error:", e);
      let friendlyMessage: string;
      let isAvs = false;
      if (isNetworkError(e)) {
        friendlyMessage = "We couldn't reach the payment service. Please check your connection and try again.";
      } else {
        ({ message: friendlyMessage, isAvs } = getDeclineInfo(e));
      }
      setCardDeclineError(friendlyMessage);
      setIsAvsError(isAvs);
      onCardDeclineError?.(friendlyMessage);
      onError?.(e);
    } finally {
      if (!isSuccessful) {
        setIsProcessingCard(false);
        onProcessingChange?.(false);
      }
    }
  };

  // Expose submit and current decline error to parent via ref
  useImperativeHandle(ref, () => ({ submit: handleCardSubmit, cardDeclineError }));

  // Notify parent when card fields become ready or unready
  useEffect(() => {
    onReadyChange?.(cardFieldsReady);
  }, [cardFieldsReady]);

  // Scroll the decline error banner into view whenever a new decline is set.
  // cardDeclineError starts as null so the null guard also prevents firing on mount.
  useEffect(() => {
    if (!cardDeclineError) return;
    declineErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cardDeclineError]);

  if (error) {
    return (
      <div className={`w-full p-3 bg-red-500/10 border border-red-500/30 rounded-md text-center text-sm text-red-400 ${className}`} data-testid="paypal-error">
        {error}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {isLoading && (
        <div className="h-32 bg-muted/50 rounded-lg flex items-center justify-center" data-testid="paypal-loading">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading payment options...</span>
        </div>
      )}
      
      {!isLoading && showCardFields && (
        <>
          {/* Payment Method Tabs - only show when consumer hasn't pre-selected a method */}
          {cardFieldsReady && defaultMethod !== "card" && defaultMethod !== "paypal" && (
            <div className="flex gap-2 p-1 bg-muted/30 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedMethod("card")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                  selectedMethod === "card"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="tab-card"
              >
                <CreditCard className="h-4 w-4" />
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("paypal")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                  selectedMethod === "paypal"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="tab-paypal"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.9A.77.77 0 0 1 5.7 2.26h6.988c2.277 0 4.115.6 5.333 1.797.638.626 1.082 1.376 1.324 2.23.257.909.266 1.984.016 3.239l-.001.008v.006c-.432 2.2-1.408 3.938-2.858 5.098-1.425 1.14-3.22 1.695-5.328 1.695h-1.76a.76.76 0 0 0-.758.668l-.001.007-.74 4.7a.59.59 0 0 1-.587.506H7.076v.123z"/>
                </svg>
                <span>PayPal</span>
              </button>
            </div>
          )}

          {/* Card Fields Section */}
          {selectedMethod === "card" && (cardFieldsReady || sdkReady) && (
            <div className="space-y-4">
              {/* Skeleton while iframes are mounting */}
              {!cardFieldsReady && (
                <div className="space-y-3" data-testid="card-fields-skeleton">
                  <div className="h-12 bg-muted/30 border border-border rounded-md animate-pulse" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-12 bg-muted/30 border border-border rounded-md animate-pulse" />
                    <div className="h-12 bg-muted/30 border border-border rounded-md animate-pulse" />
                  </div>
                </div>
              )}

              <div className={`space-y-3 ${!cardFieldsReady ? "hidden" : ""}`}>
                <div>
                  <Label className="text-[10px] font-semibold text-muted-foreground/70 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                    <CreditCard className="h-3 w-3" />
                    Card Number
                  </Label>
                  <div ref={numberContainerRef} className="h-12 bg-white rounded-md border border-neutral-200 transition-all focus-within:border-[#d4ed1f] focus-within:shadow-[0_0_0_2px_rgba(212,237,31,0.35)]" data-testid="card-number-container" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] font-semibold text-muted-foreground/70 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar className="h-3 w-3" />
                      Expiry
                    </Label>
                    <div ref={expiryContainerRef} className="h-12 bg-white rounded-md border border-neutral-200 transition-all focus-within:border-[#d4ed1f] focus-within:shadow-[0_0_0_2px_rgba(212,237,31,0.35)]" data-testid="card-expiry-container" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-semibold text-muted-foreground/70 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                      <Shield className="h-3 w-3" />
                      CVV
                    </Label>
                    <div ref={cvvContainerRef} className="h-12 bg-white rounded-md border border-neutral-200 transition-all focus-within:border-[#d4ed1f] focus-within:shadow-[0_0_0_2px_rgba(212,237,31,0.35)]" data-testid="card-cvv-container" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="postal-code" className="text-[10px] font-semibold text-muted-foreground/70 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="h-3 w-3" />
                    Postal Code
                  </Label>
                  <Input
                    id="postal-code"
                    value={postalCode}
                    onChange={(e) => {
                      setPostalCode(e.target.value);
                      if (postalCodeError) setPostalCodeError(validatePostalCode(e.target.value));
                      if (isAvsError) { setIsAvsError(false); setCardDeclineError(null); onCardDeclineError?.(null); }
                    }}
                    onBlur={() => setPostalCodeError(validatePostalCode(postalCode))}
                    placeholder="e.g. 90210"
                    maxLength={10}
                    autoComplete="postal-code"
                    className={`h-12 bg-white text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-2 ${
                      isAvsError
                        ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-300/50"
                        : "border-neutral-200 focus-visible:border-[#d4ed1f] focus-visible:ring-[rgba(212,237,31,0.35)]"
                    }`}
                    data-testid="input-postal-code"
                    aria-invalid={isAvsError || !!postalCodeError}
                  />
                  {postalCodeError && (
                    <p className="mt-1 text-xs text-red-500" data-testid="postal-code-error">{postalCodeError}</p>
                  )}
                </div>
              </div>

              {!hideSubmitButton && (
                <Button
                  onClick={handleCardSubmit}
                  disabled={disabled || isProcessingCard || !cardFieldsReady}
                  className="w-full bg-[#d4ed1f] text-[#0a0a0a] font-display text-base gap-2"
                  size="lg"
                  data-testid="button-pay-card"
                >
                  {isProcessingCard ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay ${amount}
                    </>
                  )}
                </Button>
              )}

              {cardDeclineError && (
                <div
                  ref={declineErrorRef}
                  className="flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-400"
                  data-testid="card-decline-error"
                  role="alert"
                >
                  <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0zm-7-4a1 1 0 1 0-2 0v4a1 1 0 0 0 2 0V6zm-1 8a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 10 14z" clipRule="evenodd" />
                  </svg>
                  <span>{cardDeclineError}</span>
                </div>
              )}

            </div>
          )}

          {/* PayPal Button Section - only shown when PayPal tab is active */}
          {selectedMethod === "paypal" && (
            <div className="space-y-3">
              {cardIneligible && (
                <p className="text-xs text-center text-muted-foreground pb-1" data-testid="card-ineligible-notice">
                  Card payments aren't available right now — please use PayPal.
                </p>
              )}
              <Button
                onClick={handlePayPalClick}
                disabled={disabled || isProcessingPayPal || !paypalSessionRef.current}
                className="w-full bg-[#0070ba] hover:bg-[#003087] text-white font-semibold text-base gap-2"
                size="lg"
                data-testid="button-paypal"
              >
                {isProcessingPayPal ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting to PayPal...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.9A.77.77 0 0 1 5.7 2.26h6.988c2.277 0 4.115.6 5.333 1.797.638.626 1.082 1.376 1.324 2.23.257.909.266 1.984.016 3.239l-.001.008v.006c-.432 2.2-1.408 3.938-2.858 5.098-1.425 1.14-3.22 1.695-5.328 1.695h-1.76a.76.76 0 0 0-.758.668l-.001.007-.74 4.7a.59.59 0 0 1-.587.506H7.076v.123z"/>
                    </svg>
                    Pay with PayPal
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                {cardFieldsReady 
                  ? "You'll be redirected to PayPal to complete your purchase"
                  : "Pay securely with PayPal or your saved cards"
                }
              </p>
            </div>
          )}
        </>
      )}

      {/* Fallback to just PayPal button if card fields not enabled */}
      {!isLoading && !showCardFields && (
        <Button
          onClick={handlePayPalClick}
          disabled={disabled || isProcessingPayPal || !paypalSessionRef.current}
          className="w-full bg-[#0070ba] hover:bg-[#003087] text-white font-semibold text-base gap-2"
          size="lg"
          data-testid="button-paypal"
        >
          {isProcessingPayPal ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting to PayPal...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.9A.77.77 0 0 1 5.7 2.26h6.988c2.277 0 4.115.6 5.333 1.797.638.626 1.082 1.376 1.324 2.23.257.909.266 1.984.016 3.239l-.001.008v.006c-.432 2.2-1.408 3.938-2.858 5.098-1.425 1.14-3.22 1.695-5.328 1.695h-1.76a.76.76 0 0 0-.758.668l-.001.007-.74 4.7a.59.59 0 0 1-.587.506H7.076v.123z"/>
              </svg>
              Pay with PayPal
            </>
          )}
        </Button>
      )}
    </div>
  );
});

export default PayPalCheckout;
