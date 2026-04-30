import { motion } from "framer-motion";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Clock,
  Package,
  MapPin,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

const SHIPPING_INFO = {
  freeShippingThreshold: 250,
  flatRate: 20,
  processingTime: "24 hours",
  sameDayCutoff: "12:00 PM CT",
  carrier: "USPS Priority / UPS Ground",
  transitTime: "2–5 business days"
};

export default function Shipping() {
  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead title="Shipping Information" description="Free shipping over $250. Same-day dispatch before 12 PM CT. Discreet packaging with temperature protection." canonicalPath="/peptide-shipping-and-handling" />
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-full bg-[#9d4edd]/10 flex items-center justify-center mx-auto mb-6">
            <Truck className="h-8 w-8 text-[#9d4edd]" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-shipping-title">
            Shipping Information
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fast, reliable shipping on all research compounds. We prioritize getting your 
            materials to you quickly and safely.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          <Card className="p-6 border-[#9d4edd]/50 bg-[#9d4edd]/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#9d4edd]/20 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-6 w-6 text-[#9d4edd]" />
              </div>
              <div>
                <Badge className="mb-2 bg-[#9d4edd] text-white">FREE SHIPPING</Badge>
                <h3 className="font-display text-xl font-bold mb-2">
                  Orders Over ${SHIPPING_INFO.freeShippingThreshold}
                </h3>
                <p className="text-muted-foreground">
                  Enjoy free standard shipping on all orders totaling ${SHIPPING_INFO.freeShippingThreshold} or more. 
                  No promo code needed—discount applies automatically at checkout.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold mb-2">
                  Flat Rate ${SHIPPING_INFO.flatRate}
                </h3>
                <p className="text-muted-foreground">
                  For orders under ${SHIPPING_INFO.freeShippingThreshold}, a flat rate of ${SHIPPING_INFO.flatRate} 
                  applies regardless of order size or weight within the continental U.S.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Card className="p-6 md:p-8 mb-12" data-testid="card-shipping-details">
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-3">
              <Clock className="h-6 w-6 text-[#9d4edd]" />
              Processing & Delivery Times
            </h2>

            <div className="space-y-6">
              <div className="bg-[#9d4edd]/10 rounded-lg p-6 border border-[#9d4edd]/20">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#9d4edd] flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Same Day Shipping</h3>
                    <p className="text-muted-foreground">
                      Orders placed <span className="font-semibold text-foreground">before {SHIPPING_INFO.sameDayCutoff}</span> on 
                      business days (Monday–Friday, excluding holidays) ship the same day.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="h-5 w-5 text-[#9d4edd]" />
                    <span className="font-semibold">Standard Processing</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    All orders ship within {SHIPPING_INFO.processingTime} of being placed, 
                    guaranteed. Most orders ship much faster.
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="h-5 w-5 text-[#9d4edd]" />
                    <span className="font-semibold">Estimated Transit</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {SHIPPING_INFO.transitTime} once shipped via {SHIPPING_INFO.carrier}, 
                    depending on your location.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6 md:p-8 mb-12" data-testid="card-shipping-policies">
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-[#9d4edd]" />
              Shipping Policies
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-border">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Discreet Packaging</h4>
                  <p className="text-sm text-muted-foreground">
                    All orders ship in plain, unmarked packaging with no indication of contents. 
                    Your privacy is our priority.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 pb-4 border-b border-border">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Temperature-Controlled Packaging</h4>
                  <p className="text-sm text-muted-foreground">
                    Products are packaged to maintain integrity during transit. We use insulated 
                    materials and ice packs when necessary.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 pb-4 border-b border-border">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Tracking Provided</h4>
                  <p className="text-sm text-muted-foreground">
                    Every order includes full tracking information sent via email once your 
                    package ships. Track your order in real-time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 pb-4 border-b border-border">
                <MapPin className="h-5 w-5 text-[#9d4edd] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Shipping Zones</h4>
                  <p className="text-sm text-muted-foreground">
                    We currently ship to all 50 U.S. states. Alaska and Hawaii may experience 
                    slightly longer transit times. International shipping is not available at this time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Address Accuracy</h4>
                  <p className="text-sm text-muted-foreground">
                    Please double-check your shipping address before completing your order. 
                    We are not responsible for packages delivered to incorrect addresses provided 
                    by the customer.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <Card className="p-6 md:p-8 border-destructive/50 bg-destructive/5 mb-12">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Important: Order Issues</h3>
                <p className="text-muted-foreground mb-4">
                  If your package arrives damaged or appears to have been tampered with, 
                  please document the condition with photos before opening. Contact our 
                  support team within 48 hours of delivery with:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Your order number</li>
                  <li>Photos of the packaging and any damage</li>
                  <li>Description of the issue</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4 font-medium">
                  Note: Due to the nature of our products, all sales are final. See our 
                  <Link href="/peptide-research-faq" className="text-[#9d4edd] hover:underline ml-1">FAQ</Link> for 
                  details on our refund policy.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Card className="p-8 bg-muted/30">
            <h3 className="font-display text-xl font-bold mb-3">Ready to Order?</h3>
            <p className="text-muted-foreground mb-4">
              Browse our selection of premium research compounds with fast, reliable shipping.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              New to ordering? Check out our{" "}
              <Link href="/guides/ordering-expectations" className="text-[#9d4edd] hover:underline">
                complete ordering & delivery guide
              </Link>.
            </p>
            <Link href="/products">
              <Button size="lg" data-testid="button-shop-now">
                Shop Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
