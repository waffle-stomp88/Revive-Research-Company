import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Repeat, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SubscriptionCheckoutProps {
  basePrice: number;
  frequency: "weekly" | "biweekly" | "monthly";
  productName: string;
  productId: string;
  dosage?: string;
  quantity: number;
  disabled?: boolean;
  onSuccess?: (subscriptionData: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

const frequencyLabels = {
  weekly: "Weekly",
  biweekly: "Every 2 Weeks",
  monthly: "Monthly",
};

const discountPercents = {
  weekly: 15,
  biweekly: 12,
  monthly: 10,
};

export default function SubscriptionCheckout({
  basePrice,
  frequency,
  productName,
  productId,
  dosage,
  quantity,
  disabled = false,
  onSuccess,
  onError,
  className = "",
}: SubscriptionCheckoutProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"ready" | "creating" | "redirecting">("ready");

  const discountPercent = discountPercents[frequency];
  const discountedPrice = Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100;
  const totalPrice = discountedPrice * quantity;

  const handleSubscribe = async () => {
    setIsLoading(true);
    setStep("creating");

    try {
      // Step 1: Create a subscription plan
      const planResponse = await apiRequest("POST", "/api/subscriptions/plan", {
        frequency,
        basePrice: totalPrice.toFixed(2),
      });

      if (!planResponse.ok) {
        const error = await planResponse.json();
        throw new Error(error.error || "Failed to create subscription plan");
      }

      const planData = await planResponse.json();

      // Step 2: Create the subscription
      const returnUrl = `${window.location.origin}/subscription/success?productId=${productId}&quantity=${quantity}&dosage=${dosage || ""}&frequency=${frequency}`;
      const cancelUrl = `${window.location.origin}/checkout?productId=${productId}&subscription=true&interval=${frequency}`;

      const subscriptionResponse = await apiRequest("POST", "/api/subscriptions/create", {
        planId: planData.planId,
        returnUrl,
        cancelUrl,
      });

      if (!subscriptionResponse.ok) {
        const error = await subscriptionResponse.json();
        throw new Error(error.error || "Failed to create subscription");
      }

      const subscriptionData = await subscriptionResponse.json();

      if (subscriptionData.approvalUrl) {
        setStep("redirecting");
        // Redirect to PayPal for approval
        window.location.href = subscriptionData.approvalUrl;
      } else {
        throw new Error("No approval URL returned from PayPal");
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to set up subscription. Please try again.",
        variant: "destructive",
      });
      onError?.(error);
      setStep("ready");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="p-4 bg-muted/30 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Repeat className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">Subscription</span>
              <Badge variant="secondary" className="text-xs">
                {discountPercent}% OFF
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {frequencyLabels[frequency]} delivery of {productName}
              {dosage && ` (${dosage})`}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Regular price</span>
            <span className="line-through text-muted-foreground">${basePrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subscription discount</span>
            <span className="text-green-500">-{discountPercent}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quantity</span>
            <span>x{quantity}</span>
          </div>
          <div className="flex justify-between font-medium pt-2 border-t border-border/50">
            <span>You pay {frequencyLabels[frequency].toLowerCase()}</span>
            <span className="text-primary">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>Cancel anytime from your account</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          <span>Free shipping on all subscription orders</span>
        </div>
      </div>

      <Button
        onClick={handleSubscribe}
        disabled={disabled || isLoading}
        className="w-full bg-[#0070ba] hover:bg-[#003087] text-white font-medium gap-2"
        size="lg"
        data-testid="button-subscribe"
      >
        {step === "creating" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Setting up subscription...
          </>
        ) : step === "redirecting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting to PayPal...
          </>
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.9A.77.77 0 0 1 5.7 2.26h6.988c2.277 0 4.115.6 5.333 1.797.638.626 1.082 1.376 1.324 2.23.257.909.266 1.984.016 3.239l-.001.008v.006c-.432 2.2-1.408 3.938-2.858 5.098-1.425 1.14-3.22 1.695-5.328 1.695h-1.76a.76.76 0 0 0-.758.668l-.001.007-.74 4.7a.59.59 0 0 1-.587.506H7.076v.123z"/>
            </svg>
            Subscribe with PayPal
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        You'll be redirected to PayPal to authorize recurring payments
      </p>
    </div>
  );
}
