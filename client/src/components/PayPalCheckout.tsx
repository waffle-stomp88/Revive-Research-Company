// PayPal Advanced Checkout Component
// Supports both PayPal button and embedded card fields for direct card entry
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Loader2, CreditCard, Lock, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";


type PaymentMethod = "paypal" | "card";

export interface PayPalCheckoutHandle {
  submit: () => void;
}

interface PayPalCheckoutProps {
  amount: string;
  currency?: string;
  intent?: string;
  cartItems?: any[];
  customerEmail?: string;
  onSuccess?: (orderData: any, paypalOrderId: string) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  onCardIneligible?: () => void;
  defaultMethod?: "card" | "paypal";
  disabled?: boolean;
  className?: string;
  showCardFields?: boolean;
  hideSubmitButton?: boolean;
  onReadyChange?: (ready: boolean) => void;
}

const PayPalCheckout = forwardRef<PayPalCheckoutHandle, PayPalCheckoutProps>(function PayPalCheckout({
  amount,
  currency = "USD",
  intent = "CAPTURE",
  cartItems,
  customerEmail,
  onSuccess,
  onError,
  onCancel,
  onCardIneligible,
  defaultMethod = "card",
  disabled = false,
  className = "",
  showCardFields = true,
  hideSubmitButton = false,
  onReadyChange,
}: PayPalCheckoutProps, ref) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(defaultMethod);
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [isProcessingPayPal, setIsProcessingPayPal] = useState(false);
  const [cardFieldsReady, setCardFieldsReady] = useState(false);
  const [cardIneligible, setCardIneligible] = useState(false);
  // sdkReady flips true once the SDK is initialized and card eligibility confirmed
  const [sdkReady, setSdkReady] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const sdkInstanceRef = useRef<any>(null); // stored for use in mounting effect
  const cardSessionRef = useRef<any>(null);
  const paypalSessionRef = useRef<any>(null);
  const numberContainerRef = useRef<HTMLDivElement>(null);
  const expiryContainerRef = useRef<HTMLDivElement>(null);
  const cvvContainerRef = useRef<HTMLDivElement>(null);

  const createOrder = async () => {
    const orderPayload = {
      amount: amount,
      currency: currency,
      intent: intent,
      items: cartItems?.map(item => ({
        productId: item.productId,
        dosage: item.dosage,
        quantity: item.quantity,
      })),
    };
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

        // Check eligibility for advanced card fields
        let cardEligible = false;
        if (showCardFields) {
          try {
            const paymentMethods = await sdkInstance.findEligibleMethods();
            cardEligible = paymentMethods.isEligible("advanced_cards");
          } catch (eligibilityError) {
            console.warn("[PayPal] findEligibleMethods() failed — defaulting card fields to ineligible:", eligibilityError);
            cardEligible = false;
          }
          if (!cardEligible && isMounted) {
            setCardIneligible(true);
            setSelectedMethod("paypal");
            onCardIneligible?.();
            if (import.meta.env.DEV) { console.log("[PayPal] advanced_cards ineligible — PayPal fallback active"); }
          }
        }

        // Store SDK instance for mounting effect; flip sdkReady to trigger it
        if (showCardFields && cardEligible) {
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
  }, [amount, currency, intent, disabled]);

  // Mount card field web components. Runs (and re-runs cleanly) whenever sdkReady
  // flips true. Creating a fresh session each time makes this StrictMode-safe:
  // StrictMode's double-invoke gets a brand-new PayPal session, so there is no
  // "duplicate card field" error from reusing the same session across cycles.
  useEffect(() => {
    if (!sdkReady || !sdkInstanceRef.current) return;
    const sdkInstance = sdkInstanceRef.current;
    let isMounted = true;

    const cardStyle = {
      body: { background: "#0a0a0a", padding: "0" },
      input: {
        fontFamily: "DM Sans, system-ui, sans-serif",
        fontSize: "14px",
        color: "#ffffff",
        padding: "0 12px",
      },
    };

    let cardSession: any;
    try {
      cardSession = sdkInstance.createCardFieldsOneTimePaymentSession({
        createOrder: async () => {
          const result = await createOrder();
          return result.orderId; // v6 requires plain string
        },
        onApprove: async ({ orderId }: { orderId: string }) => {
          if (import.meta.env.DEV) { console.log("[PayPal Card] onApprove", orderId); }
          try {
            const captureResult = await captureOrder(orderId);
            onSuccess?.(captureResult, orderId);
          } catch (e) {
            console.error("[PayPal Card] capture error:", e);
            onError?.(e);
          }
        },
        onError: handleError,
        onCancel: handleCancel,
      });
      cardSessionRef.current = cardSession;
    } catch (sessionErr) {
      console.error("[PayPal] Failed to create card session:", sessionErr);
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

    const numberComponent = cardSession.createCardFieldsComponent({ type: "number", placeholder: "Card number", style: cardStyle });
    const expiryComponent = cardSession.createCardFieldsComponent({ type: "expiry", placeholder: "MM / YY",     style: cardStyle });
    const cvvComponent    = cardSession.createCardFieldsComponent({ type: "cvv",    placeholder: "CVV",         style: cardStyle });

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

  // Handle card payment submission
  // v6: createOrder + onApprove live on the session; submit() fires the full flow
  const handleCardSubmit = async () => {
    if (!cardSessionRef.current || isProcessingCard || disabled) return;
    setIsProcessingCard(true);
    try {
      await cardSessionRef.current.submit();
    } catch (e: any) {
      console.error("Card payment error:", e);
      onError?.(e);
    } finally {
      setIsProcessingCard(false);
    }
  };

  // Expose submit to parent via ref
  useImperativeHandle(ref, () => ({ submit: handleCardSubmit }));

  // Notify parent when card fields become ready or unready
  useEffect(() => {
    onReadyChange?.(cardFieldsReady);
  }, [cardFieldsReady]);

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
                  <div className="min-h-[44px] bg-muted/30 border border-border rounded-md animate-pulse" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-h-[44px] bg-muted/30 border border-border rounded-md animate-pulse" />
                    <div className="min-h-[44px] bg-muted/30 border border-border rounded-md animate-pulse" />
                  </div>
                </div>
              )}

              <div className={`space-y-3 ${!cardFieldsReady ? "hidden" : ""}`}>
                <div>
                  <Label className="text-[10px] font-semibold text-muted-foreground/70 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                    <CreditCard className="h-3 w-3" />
                    Card Number
                  </Label>
                  <div ref={numberContainerRef} className="h-[44px] overflow-hidden bg-[#0a0a0a] border border-white/10 rounded-md transition-all focus-within:border-[#d4ed1f] focus-within:shadow-[0_0_0_1px_rgba(212,237,31,0.25),0_0_12px_rgba(212,237,31,0.08)]" data-testid="card-number-container" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] font-semibold text-muted-foreground/70 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar className="h-3 w-3" />
                      Expiry
                    </Label>
                    <div ref={expiryContainerRef} className="h-[44px] overflow-hidden bg-[#0a0a0a] border border-white/10 rounded-md transition-all focus-within:border-[#d4ed1f] focus-within:shadow-[0_0_0_1px_rgba(212,237,31,0.25),0_0_12px_rgba(212,237,31,0.08)]" data-testid="card-expiry-container" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-semibold text-muted-foreground/70 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                      <Shield className="h-3 w-3" />
                      CVV
                    </Label>
                    <div ref={cvvContainerRef} className="h-[44px] overflow-hidden bg-[#0a0a0a] border border-white/10 rounded-md transition-all focus-within:border-[#d4ed1f] focus-within:shadow-[0_0_0_1px_rgba(212,237,31,0.25),0_0_12px_rgba(212,237,31,0.08)]" data-testid="card-cvv-container" />
                  </div>
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
