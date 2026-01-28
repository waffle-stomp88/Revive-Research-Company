import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Package, 
  Mail, 
  Home,
  ShoppingBag,
  Clock,
  Truck,
  Sparkles,
  FlaskConical,
  AlertTriangle
} from "lucide-react";

interface OrderItem {
  name: string;
  dosage: string;
  quantity: number;
  price: number;
}

interface OrderSummary {
  paypalOrderId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  customerEmail: string;
}

export default function OrderConfirmation() {
  const [, setLocation] = useLocation();
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("paypalOrderId");
    setPaypalOrderId(orderId);
    
    // Retrieve order summary from sessionStorage
    const storedSummary = sessionStorage.getItem('orderSummary');
    if (storedSummary) {
      try {
        const summary = JSON.parse(storedSummary);
        setOrderSummary(summary);
        // Clear after reading so it doesn't persist
        sessionStorage.removeItem('orderSummary');
      } catch (e) {
        console.error('Failed to parse order summary:', e);
      }
    }
  }, []);

  return (
    <>
      <SEOHead
        title="Order Confirmed | Revive Research"
        description="Your order has been successfully placed. Thank you for choosing Revive Research."
      />
      
      <div className="min-h-screen bg-background pt-24 pb-12 px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-20 left-10 w-64 h-64 bg-[#E7FB10]/5 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-80 h-80 bg-[#21d8ff]/5 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          {/* Success Header with Neon Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="text-center mb-8"
          >
            {/* Animated checkmark with glow */}
            <motion.div 
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#E7FB10]/20 to-[#21d8ff]/20 flex items-center justify-center relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="absolute inset-0 rounded-full bg-[#E7FB10]/20 animate-ping" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E7FB10] to-[#21d8ff] flex items-center justify-center shadow-[0_0_40px_rgba(231,251,16,0.4)]">
                <CheckCircle className="w-10 h-10 text-black" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent">
                Order Confirmed!
              </h1>
              <p className="text-lg text-muted-foreground flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E7FB10]" />
                Thank you for choosing Revive Research
                <Sparkles className="w-5 h-5 text-[#21d8ff]" />
              </p>
            </motion.div>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 mb-6 border-[#E7FB10]/20 bg-gradient-to-br from-card/80 to-card shadow-[0_0_30px_rgba(231,251,16,0.1)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-[#E7FB10]/10">
                  <Package className="w-5 h-5 text-[#E7FB10]" />
                </div>
                <h2 className="font-display text-xl font-semibold">Order Details</h2>
              </div>
              
              {paypalOrderId && (
                <div className="bg-gradient-to-r from-[#E7FB10]/5 to-[#21d8ff]/5 border border-[#E7FB10]/20 rounded-lg p-4 mb-5">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Order Reference</p>
                  <p className="font-mono text-sm font-medium text-[#E7FB10]">{paypalOrderId}</p>
                </div>
              )}

              {/* Order Items */}
              {orderSummary && orderSummary.items.length > 0 && (
                <>
                  <div className="space-y-4 mb-5">
                    {orderSummary.items.map((item, index) => (
                      <motion.div 
                        key={index} 
                        className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border/50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#21d8ff]/10 flex items-center justify-center">
                            <FlaskConical className="w-5 h-5 text-[#21d8ff]" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.dosage} × {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-[#E7FB10]">${(item.price * item.quantity).toFixed(2)}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="bg-muted/20 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${orderSummary.subtotal.toFixed(2)}</span>
                    </div>
                    {orderSummary.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-400">
                        <span>Discount</span>
                        <span>-${orderSummary.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{orderSummary.shipping === 0 ? (
                        <Badge variant="outline" className="text-[#21d8ff] border-[#21d8ff]/30 text-xs">FREE</Badge>
                      ) : `$${orderSummary.shipping.toFixed(2)}`}</span>
                    </div>
                    <Separator className="my-3 bg-border/50" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-[#E7FB10]">${orderSummary.total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-5 bg-border/30" />
                </>
              )}

              {/* Status Items */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 rounded-lg md:hover:bg-muted/20 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#21d8ff]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#21d8ff]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Confirmation Email</p>
                    <p className="text-sm text-muted-foreground">
                      {orderSummary?.customerEmail 
                        ? `Sent to ${orderSummary.customerEmail}`
                        : "You'll receive an email confirmation with your order details shortly."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-lg md:hover:bg-muted/20 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#E7FB10]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#E7FB10]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Processing Time</p>
                    <p className="text-sm text-muted-foreground">
                      Orders are typically processed within 24 hours on business days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-lg md:hover:bg-muted/20 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#21d8ff]/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-[#21d8ff]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Shipping</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive tracking information once your order ships (2-5 business days).
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* RUO Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-5 mb-6 border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display font-semibold mb-1 text-red-400">Research Use Only</h3>
                  <p className="text-sm text-muted-foreground">
                    All products are intended for laboratory research purposes only. 
                    Not for human consumption.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              asChild
              className="flex-1 font-display gap-2 bg-[#E7FB10] text-black md:hover:bg-[#E7FB10]/90 shadow-[0_0_20px_rgba(231,251,16,0.3)] md:hover:shadow-[0_0_30px_rgba(231,251,16,0.5)] transition-all duration-300"
              size="lg"
              data-testid="button-continue-shopping"
            >
              <Link href="/peptides">
                <ShoppingBag className="w-5 h-5" />
                Continue Shopping
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              className="flex-1 font-display gap-2 border-[#21d8ff]/30 md:hover:border-[#21d8ff]/60 md:hover:bg-[#21d8ff]/10 transition-all duration-300"
              size="lg"
              data-testid="button-go-home"
            >
              <Link href="/">
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
            </Button>
          </motion.div>

          {/* Support Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Questions about your order?{" "}
              <Link href="/contact" className="text-[#21d8ff] md:hover:text-[#21d8ff]/80 hover:underline transition-colors">
                Contact our support team
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
