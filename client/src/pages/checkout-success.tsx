import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { SEO_CONFIG } from "@/lib/seo-config";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Package, FlaskConical, ArrowRight } from "lucide-react";
import type { Order } from "@shared/schema";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get("session_id");

  const { data, isLoading, error } = useQuery<{ order: Order; alreadyProcessed: boolean }>({
    queryKey: ["/api/stripe/checkout-session", sessionId],
    enabled: !!sessionId,
  });

  if (!sessionId) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">Invalid Session</h2>
          <p className="text-muted-foreground mb-6">
            No checkout session found. Please try again.
          </p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </Card>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24 flex items-center justify-center">
        <Card className="p-12 text-center max-w-lg">
          <Skeleton className="h-20 w-20 rounded-full mx-auto mb-6" />
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </Card>
      </main>
    );
  }

  if (error || !data?.order) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">Error Processing Order</h2>
          <p className="text-muted-foreground mb-6">
            There was an issue processing your order. Please contact support.
          </p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </Card>
      </main>
    );
  }

  const order = data.order;

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24 flex items-center justify-center">
      <SEOHead {...SEO_CONFIG.checkoutSuccess} canonicalPath="/checkout/success" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg mx-4"
      >
        <Card className="p-8 md:p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-foreground" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2" data-testid="text-order-success">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your order. We've received your payment.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-muted/50 rounded-lg p-4 mb-6"
          >
            <p className="text-sm text-muted-foreground mb-1">Order ID</p>
            <p className="font-mono text-lg font-semibold" data-testid="text-order-id">
              {order.id.slice(0, 8).toUpperCase()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 mb-8"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Shipping to {order.firstName} {order.lastName}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {order.address}, {order.city}, {order.state} {order.zipCode}
            </p>
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to {order.email}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/products">
              <Button variant="outline" className="w-full sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/coa">
              <Button className="w-full sm:w-auto gap-2">
                Verify COA
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </Card>
      </motion.div>
    </main>
  );
}
