import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo-head";
import {
  CheckCircle,
  Repeat,
  Calendar,
  Package,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const frequencyLabels: { [key: string]: string } = {
  weekly: "Weekly",
  biweekly: "Every 2 Weeks",
  monthly: "Monthly",
};

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const subscriptionId = searchParams.get("subscription_id");
  const productId = searchParams.get("productId");
  const quantity = searchParams.get("quantity") || "1";
  const dosage = searchParams.get("dosage");
  const frequency = searchParams.get("frequency") || "monthly";

  useEffect(() => {
    // Give PayPal a moment to activate the subscription
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-12 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">Activating Subscription...</h2>
          <p className="text-muted-foreground">Please wait while we confirm your subscription.</p>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-12 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/products">
            <Button>Return to Shop</Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <>
      <SEOHead
        title="Subscription Confirmed - Revive Research"
        description="Your subscription has been successfully activated."
      />
      <main className="min-h-screen pt-32 md:pt-40 pb-12">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="h-10 w-10 text-green-500" />
              </motion.div>

              <h1 className="font-display text-3xl font-bold mb-2">
                Subscription Activated!
              </h1>
              <p className="text-muted-foreground mb-8">
                Thank you for subscribing. Your first order is being prepared.
              </p>

              <div className="bg-muted/30 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-primary" />
                  Subscription Details
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequency</span>
                    <Badge variant="secondary">{frequencyLabels[frequency]}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span>{quantity} unit(s) per delivery</span>
                  </div>
                  {dosage && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dosage</span>
                      <span>{dosage}</span>
                    </div>
                  )}
                  {subscriptionId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subscription ID</span>
                      <span className="text-xs font-mono">{subscriptionId.slice(0, 12)}...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>You'll receive your shipments {frequencyLabels[frequency].toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Package className="h-4 w-4 text-primary" />
                  <span>Free shipping on all subscription orders</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button className="gap-2">
                    View My Subscriptions
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline">Continue Shopping</Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </>
  );
}
