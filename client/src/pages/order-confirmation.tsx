import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  CheckCircle, 
  Package, 
  Mail, 
  ArrowRight, 
  Home,
  ShoppingBag,
  Clock,
  Truck
} from "lucide-react";

export default function OrderConfirmation() {
  const [, setLocation] = useLocation();
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("paypalOrderId");
    setPaypalOrderId(orderId);
  }, []);

  return (
    <>
      <SEOHead
        title="Order Confirmed | Revive Research"
        description="Your order has been successfully placed. Thank you for choosing Revive Research."
      />
      
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Order Confirmed!
            </h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your purchase. Your order is being processed.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">Order Details</h2>
              </div>
              
              {paypalOrderId && (
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Order Reference</p>
                  <p className="font-mono text-sm font-medium">{paypalOrderId}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Confirmation Email</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive an email confirmation with your order details shortly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Processing Time</p>
                    <p className="text-sm text-muted-foreground">
                      Orders are typically processed within 24 hours on business days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Shipping</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive tracking information once your order ships (2-5 business days).
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <h3 className="font-display font-semibold mb-2">Research Use Only</h3>
              <p className="text-sm text-muted-foreground">
                All products are intended for laboratory research purposes only. 
                Not for human consumption. By completing this purchase, you confirm 
                that you are 21+ years old and will use these products responsibly 
                for legitimate research purposes.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              asChild
              className="flex-1 bg-primary text-primary-foreground font-display"
              size="lg"
              data-testid="button-continue-shopping"
            >
              <Link href="/peptides">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              className="flex-1 font-display"
              size="lg"
              data-testid="button-go-home"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Questions about your order?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact our support team
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
