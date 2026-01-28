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
  AlertTriangle,
  Smartphone,
  Copy,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [isManualPayment, setIsManualPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const CASHAPP_TAG = "$reviveresearchco";
  const ZELLE_INFO = "payments@reviveresearch.co";
  
  // Format order ID to short reference (last 8 chars, uppercase) - matches email format
  const getShortOrderRef = (id: string) => id.slice(-8).toUpperCase();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paypalId = params.get("paypalOrderId");
    const manualParam = params.get("manual");
    const orderIdParam = params.get("orderId");
    const methodParam = params.get("method");
    
    setPaypalOrderId(paypalId);
    setIsManualPayment(manualParam === "true");
    setOrderId(orderIdParam);
    setPaymentMethod(methodParam);
    
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
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Payment info copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

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

          {/* Manual Payment Instructions - Show for CashApp/Zelle orders */}
          {isManualPayment && (() => {
            const isCashApp = paymentMethod === "cashapp" || !paymentMethod;
            const color = isCashApp ? "#00D632" : "#6D1ED4";
            const methodName = isCashApp ? "CashApp" : "Zelle";
            const paymentInfo = isCashApp ? CASHAPP_TAG : ZELLE_INFO;
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Card className="p-6 mb-6" style={{ borderColor: `${color}80` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                      <DollarSign className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-semibold" style={{ color }}>Complete Your Payment</h2>
                      <p className="text-xs text-muted-foreground">Your order is pending until payment is received</p>
                    </div>
                  </div>

                  {/* Order Number Display */}
                  {orderId && (
                    <div className="rounded-lg p-4 mb-4 bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Your Order Number</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-lg font-bold text-[#E7FB10]">#{getShortOrderRef(orderId)}</p>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 px-2"
                          onClick={() => copyToClipboard(getShortOrderRef(orderId))}
                          data-testid="button-copy-order-id"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: `${color}10`, borderColor: `${color}30`, borderWidth: 1 }}>
                    <div className="flex items-center gap-3 mb-3">
                      <Smartphone className="w-5 h-5" style={{ color }} />
                      <span className="font-semibold">Send payment via {methodName}:</span>
                    </div>
                    <div 
                      className="flex items-center gap-2 p-3 rounded-md bg-background cursor-pointer md:hover:bg-muted transition-colors"
                      onClick={() => copyToClipboard(paymentInfo)}
                      data-testid="button-copy-payment-info"
                    >
                      <span className="font-mono font-bold text-lg flex-1" style={{ color }}>
                        {paymentInfo}
                      </span>
                      <Button size="sm" variant="outline" style={{ borderColor: `${color}50` }}>
                        {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: color }}>
                        1
                      </div>
                      <p className="text-muted-foreground">Open {methodName} and send payment to <span className="font-mono font-semibold" style={{ color }}>{paymentInfo}</span></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: color }}>
                        2
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          In the payment note, enter <span className="font-semibold text-foreground">ONLY</span> your order number: <span className="font-mono font-bold" style={{ color }}>{orderId ? `#${getShortOrderRef(orderId)}` : "your order #"}</span>
                        </p>
                        <p className="text-xs text-[#E7FB10] mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Important: Do not include any other text — only the order number
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: color }}>
                        3
                      </div>
                      <p className="text-muted-foreground">We'll verify payment and ship within <span className="font-semibold text-foreground">1-2 business hours</span></p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4" style={{ borderTopColor: `${color}30`, borderTopWidth: 1 }}>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-[#E7FB10]" />
                      Your order status will update to "Paid" once we confirm your {methodName} transfer.
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })()}

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
              
              {(paypalOrderId || orderId) && (
                <div className="bg-gradient-to-r from-[#E7FB10]/5 to-[#21d8ff]/5 border border-[#E7FB10]/20 rounded-lg p-4 mb-5">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Order Reference</p>
                  <p className="font-mono text-sm font-medium text-[#E7FB10]">
                    #{getShortOrderRef(paypalOrderId || orderId || '')}
                  </p>
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

              {/* Status Items - Condensed */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg md:hover:bg-muted/20 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#21d8ff]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-[#21d8ff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">Confirmation Email</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {orderSummary?.customerEmail 
                        ? `Sent to ${orderSummary.customerEmail}`
                        : "You'll receive an email confirmation shortly."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg md:hover:bg-muted/20 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#E7FB10]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-[#E7FB10]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Processing Time</p>
                    <p className="text-xs text-muted-foreground">Typically within 24 hours on business days</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg md:hover:bg-muted/20 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#21d8ff]/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-[#21d8ff]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Shipping</p>
                    <p className="text-xs text-muted-foreground">Tracking info sent when shipped (2-5 business days)</p>
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
