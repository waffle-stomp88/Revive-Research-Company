import { motion } from "framer-motion";
import { SEOHead } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import {
  CheckCircle2,
  AlertTriangle,
  Package,
  HelpCircle,
  ArrowRight,
  XCircle,
  Thermometer,
  FlaskConical,
} from "lucide-react";

export default function PackageWarm() {
  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead title="Package Arrived Warm?" description="Lyophilized peptides are remarkably stable at ambient temperature. Here's what to know if your package arrived warm." canonicalPath="/guides/peptide-package-arrived-warm" />
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
            Your peptides are almost certainly fine. Lyophilized (freeze-dried) 
            compounds are designed to remain stable at ambient temperature during shipping.
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
                  We ship in discreet dry packaging — no ice packs needed. Lyophilized peptides 
                  are specifically engineered to tolerate ambient temperatures during transit.
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
              <FlaskConical className="h-6 w-6 text-[#9d4edd]" />
              <h2 className="font-display text-xl font-bold">Why Lyophilized Peptides Are Stable</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Lyophilization (freeze-drying) removes water from peptides under vacuum while frozen, 
              creating a dry powder that is highly resistant to degradation:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">How It Works</h3>
                <p className="text-sm text-muted-foreground">
                  Water is removed from the peptide solution, creating a dry powder. 
                  Without moisture, the chemical reactions that break down peptides cannot occur.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Why No Ice Packs Are Needed</h3>
                <p className="text-sm text-muted-foreground">
                  Dry lyophilized powder is far more stable than peptide solutions. 
                  Normal shipping temperatures — even in warm weather — do not degrade 
                  properly lyophilized compounds.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-6 w-6 text-[#21d8ff]" />
              <h2 className="font-display text-xl font-bold">Our Packaging Approach</h2>
            </div>
            <p className="text-muted-foreground">
              All orders ship in plain, discreet dry packaging with no indication of contents. 
              Because our compounds are fully lyophilized, discreet protective dry packaging 
              is all that's needed — no ice packs or insulated liners are required or included. 
              Your privacy and product integrity are both protected by this approach.
            </p>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-green-500/20">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h3 className="font-display text-lg font-bold text-green-500">When It's Fine</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Package feels warm but powder appears normal (white/off-white)",
                  "Transit time was under 7 days",
                  "Vial seal is fully intact",
                  "No visible moisture inside vial",
                  "Powder is dry with no clumping from moisture",
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
                  "Package was in extreme heat for an extended period (days, not hours)",
                  "Visible moisture or liquid inside vial",
                  "Powder has unusual color or texture",
                  "Vial seal appears compromised or broken",
                  "Package was delayed significantly beyond the estimated delivery window",
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
                    Place vials in your freezer (-20°C) or refrigerator (2–8°C) right away. 
                    This is standard practice for all received peptides regardless of packaging temperature.
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
                    Check for moisture, unusual color, or compromised seals. In the vast 
                    majority of cases the powder will appear perfectly normal.
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
                    Take photos and contact us within 48 hours if you notice anything unusual 
                    about the powder, seal, or packaging condition.
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
