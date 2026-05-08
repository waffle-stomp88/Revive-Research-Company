// PayPal Advanced Checkout Component
// Supports both PayPal button and embedded card fields for direct card entry
import { useEffect, useRef, useState } from "react";
import { Loader2, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";


type PaymentMethod = "paypal" | "card";

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
}

export default function PayPalCheckout({
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
}: PayPalCheckoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(defaultMethod);
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [isProcessingPayPal, setIsProcessingPayPal] = useState(false);
  const [cardFieldsReady, setCardFieldsReady] = useState(false);
  const [cardIneligible, setCardIneligible] = useState(false);
  const [cardSessionCreated, setCardSessionCreated] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);
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

        // Initialize Card Fields only if eligible
        if (showCardFields && cardEligible) {
          try {
            const cardSession = sdkInstance.createCardFieldsOneTimePaymentSession({
              createOrder: async () => {
                const result = await createOrder();
                return result.orderId; // v6 requires plain string, not { orderId }
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
            if (isMounted) setCardSessionCreated(true); // triggers mounting useEffect after render
          } catch (cardError) {
            console.warn("Card fields not available - PayPal Advanced Checkout may not be enabled:", cardError);
            if (isMounted) {
              setSelectedMethod("paypal");
              setCardFieldsReady(false);
            }
          }
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

  // Mount card field web components into their DOM containers once the session
  // is created and refs are guaranteed to be populated (runs after paint)
  useEffect(() => {
    if (!cardSessionCreated || !cardSessionRef.current) return;
    const session = cardSessionRef.current;
    const numberEl = numberContainerRef.current;
    const expiryEl = expiryContainerRef.current;
    const cvvEl = cvvContainerRef.current;
    if (!numberEl || !expiryEl || !cvvEl) return;

    const cardStyle = {
      input: {
        fontFamily: "DM Sans, system-ui, sans-serif",
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#0a0a0a",
        padding: "0 12px",
      },
      ":focus": { color: "#ffffff" },
      ".invalid": { color: "#f87171" },
    };

    // Clear any stale children (StrictMode / HMR safety)
    numberEl.innerHTML = "";
    expiryEl.innerHTML = "";
    cvvEl.innerHTML = "";

    const numberComponent = session.createCardFieldsComponent({ type: "number", placeholder: "Card number", style: cardStyle });
    const expiryComponent = session.createCardFieldsComponent({ type: "expiry", placeholder: "MM / YY",     style: cardStyle });
    const cvvComponent    = session.createCardFieldsComponent({ type: "cvv",    placeholder: "CVV",         style: cardStyle });

    numberEl.appendChild(numberComponent);
    expiryEl.appendChild(expiryComponent);
    cvvEl.appendChild(cvvComponent);

    setCardFieldsReady(true);

    return () => {
      if (numberContainerRef.current) numberContainerRef.current.innerHTML = "";
      if (expiryContainerRef.current) expiryContainerRef.current.innerHTML = "";
      if (cvvContainerRef.current)    cvvContainerRef.current.innerHTML = "";
      setCardFieldsReady(false);
    };
  }, [cardSessionCreated]);

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
          {/* Payment Method Tabs - only show if card fields are available */}
          {cardFieldsReady && (
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
          {selectedMethod === "card" && (cardFieldsReady || cardSessionCreated) && (
            <div className="space-y-4">
              {/* Skeleton while iframes are mounting */}
              {!cardFieldsReady && (
                <div className="space-y-3" data-testid="card-fields-skeleton">
                  <div className="min-h-[48px] bg-muted/30 border border-border rounded-md animate-pulse" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-h-[48px] bg-muted/30 border border-border rounded-md animate-pulse" />
                    <div className="min-h-[48px] bg-muted/30 border border-border rounded-md animate-pulse" />
                  </div>
                </div>
              )}

              <div className={`space-y-3 ${!cardFieldsReady ? "hidden" : ""}`}>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Card Number</Label>
                  <div ref={numberContainerRef} className="min-h-[48px] bg-[#0a0a0a] border border-border rounded-md focus-within:border-[#d4ed1f]" data-testid="card-number-container" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Expiry</Label>
                    <div ref={expiryContainerRef} className="min-h-[48px] bg-[#0a0a0a] border border-border rounded-md focus-within:border-[#d4ed1f]" data-testid="card-expiry-container" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">CVV</Label>
                    <div ref={cvvContainerRef} className="min-h-[48px] bg-[#0a0a0a] border border-border rounded-md focus-within:border-[#d4ed1f]" data-testid="card-cvv-container" />
                  </div>
                </div>
              </div>

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

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Secured by PayPal</span>
              </div>
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
}
