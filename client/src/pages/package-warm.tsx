import { motion } from "framer-motion";
import { SEOHead } from "@/components/seo-head";
import { SEO_CONFIG } from "@/lib/seo-config";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import {
  Thermometer,
  CheckCircle2,
  AlertTriangle,
  Snowflake,
  Package,
  HelpCircle,
  ArrowRight,
  XCircle,
} from "lucide-react";

export default function PackageWarm() {
  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead {...SEO_CONFIG.packageWarm} canonicalPath="/package-warm" />
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-[#f97316]/20 text-[#f97316] border-[#f97316]/30">
            Shipping Guide
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-package-warm-title">
            If Your Package Arrives Warm
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A melted cold pack doesn't mean your peptides are compromised. 
            Here's what you need to know.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold mb-2 text-green-500">The Short Answer</h2>
                <p className="text-muted-foreground">
                  In most cases, <strong className="text-foreground">your peptides are fine</strong>. 
                  Lyophilized (freeze-dried) peptides are remarkably stable and can tolerate 
                  short periods at ambient temperature without degradation.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Snowflake className="h-6 w-6 text-[#21d8ff]" />
              <h2 className="font-display text-xl font-bold">Why Cold Packs Melt</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Cold packs are available as an optional add-on and are designed to 
              maintain temperature for 24-48 hours in transit if selected. Several factors can cause them to thaw:
            </p>
            <ul className="space-y-2">
              {[
                "Extended transit times due to carrier delays",
                "Hot weather during summer months",
                "Package sitting in a delivery vehicle",
                "Warehouse temperature fluctuations",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#21d8ff] mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-6 w-6 text-[#9d4edd]" />
              <h2 className="font-display text-xl font-bold">Understanding Lyophilization</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Lyophilization (freeze-drying) is specifically designed to create a stable product:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">How It Works</h3>
                <p className="text-sm text-muted-foreground">
                  Water is removed from the peptide solution under vacuum while frozen. 
                  This creates a dry powder that resists degradation.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Why It's Stable</h3>
                <p className="text-sm text-muted-foreground">
                  Without water, the chemical reactions that break down peptides 
                  can't occur. The powder form is far more stable than solutions.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-green-500/20">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h3 className="font-display text-lg font-bold text-green-500">When It's Fine</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Cold pack is thawed but package cool to touch",
                  "Transit time was under 72 hours",
                  "Powder appears normal (white/off-white)",
                  "Vial seal is intact",
                  "No visible moisture inside vial",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 border-red-500/20">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="font-display text-lg font-bold text-red-500">When to Contact Us</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Package was in extreme heat (hot car, direct sun)",
                  "Transit time exceeded 5+ days",
                  "Visible moisture or liquid inside vial",
                  "Powder has unusual color or texture",
                  "Vial seal appears compromised",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Thermometer className="h-6 w-6 text-[#E7FB10]" />
              <h2 className="font-display text-xl font-bold">What To Do Next</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#E7FB10]/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-bold text-[#E7FB10]">1</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Transfer to Storage Immediately</h4>
                  <p className="text-sm text-muted-foreground">
                    Place vials in your freezer (-20°C) or refrigerator (2-8°C) right away.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#E7FB10]/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-bold text-[#E7FB10]">2</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Inspect the Vials</h4>
                  <p className="text-sm text-muted-foreground">
                    Check for moisture, unusual color, or compromised seals.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#E7FB10]/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-bold text-[#E7FB10]">3</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Document If Concerned</h4>
                  <p className="text-sm text-muted-foreground">
                    Take photos and contact us within 48 hours if you notice anything unusual.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Separator />

          <Card className="p-6 border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
            <div className="flex items-start gap-4">
              <HelpCircle className="h-6 w-6 text-[#21d8ff] flex-shrink-0" />
              <div>
                <h3 className="font-display text-lg font-bold mb-2">Still Have Questions?</h3>
                <p className="text-muted-foreground mb-4">
                  We're here to help. If you're unsure about your shipment, reach out with 
                  your order number and photos, and we'll assess the situation.
                </p>
                <Link href="/contact">
                  <Button className="bg-[#21d8ff] text-black gap-2" data-testid="button-contact-support">
                    Contact Support
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
