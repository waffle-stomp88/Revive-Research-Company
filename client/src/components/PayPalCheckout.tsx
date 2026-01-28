// PayPal Checkout Wrapper Component
// Wraps the base PayPalButton with order creation and success handling for Revive Research
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
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
  disabled?: boolean;
  className?: string;
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
  disabled = false,
  className = "",
}: PayPalCheckoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const buttonId = useRef(`paypal-button-${Math.random().toString(36).substr(2, 9)}`);

  const createOrder = async () => {
    const orderPayload = {
      amount: amount,
      currency: currency,
      intent: intent,
    };
    const response = await fetch("/paypal/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const output = await response.json();
    if (!response.ok) {
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
    console.log("PayPal onApprove", data);
    try {
      const orderData = await captureOrder(data.orderId);
      console.log("PayPal capture result", orderData);
      onSuccess?.(orderData, data.orderId);
    } catch (e) {
      console.error("PayPal capture error:", e);
      onError?.(e);
    }
  };

  const handleCancel = async (data: any) => {
    console.log("PayPal onCancel", data);
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
        const response = await fetch("/paypal/setup");
        if (!response.ok) {
          throw new Error("Failed to get PayPal client token");
        }
        const data = await response.json();
        const clientToken = data.clientToken;

        const sdkInstance = await (window as any).paypal.createInstance({
          clientToken,
          components: ["paypal-payments"],
        });

        const paypalCheckout = sdkInstance.createPayPalOneTimePaymentSession({
          onApprove: handleApprove,
          onCancel: handleCancel,
          onError: handleError,
        });

        const onClick = async () => {
          if (disabled) return;
          try {
            const checkoutOptionsPromise = createOrder();
            await paypalCheckout.start(
              { paymentFlow: "auto" },
              checkoutOptionsPromise,
            );
          } catch (e) {
            console.error("PayPal checkout error:", e);
            handleError(e);
          }
        };

        // Wait a bit for DOM to be ready
        setTimeout(() => {
          const paypalButton = document.getElementById(buttonId.current);
          if (paypalButton) {
            paypalButton.addEventListener("click", onClick);
            cleanupRef.current = () => {
              paypalButton.removeEventListener("click", onClick);
            };
          }
          if (isMounted) setIsLoading(false);
        }, 100);
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

  if (error) {
    return (
      <div className={`w-full p-3 bg-red-500/10 border border-red-500/30 rounded-md text-center text-sm text-red-400 ${className}`} data-testid="paypal-error">
        {error}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-[#0070ba] rounded-md flex items-center justify-center z-10" data-testid="paypal-loading">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        </div>
      )}
      <paypal-button 
        id={buttonId.current}
        className={`w-full cursor-pointer block ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        style={{ minHeight: '48px', display: 'block' }}
        data-testid="button-paypal"
      />
    </div>
  );
}
