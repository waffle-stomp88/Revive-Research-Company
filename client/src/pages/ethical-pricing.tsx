import { motion } from "framer-motion";
import { SEOHead } from "@/components/seo-head";
import { FREE_SHIPPING_THRESHOLD } from "@shared/constants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PricingBreakdownInfographic } from "@/components/infographics/pricing-breakdown";
import {
  DollarSign,
  Shield,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

const commitments = [
  "No hidden fees or surprise charges",
  "Same pricing for all customers",
  "Transparent cost breakdown",
  "Competitive with quality vendors",
  "Volume discounts clearly stated",
  `Free shipping over $${FREE_SHIPPING_THRESHOLD}`,
];

export default function EthicalPricing() {
  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead title="Ethical Pricing" description="Fair, transparent pricing on all research compounds. No hidden fees, no price gouging, no games." canonicalPath="/guides/peptide-pricing-breakdown" />
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-[#D4FF1F]/20 text-[#D4FF1F] border-[#D4FF1F]/30">
            Transparency
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-pricing-title">
            Our Pricing Philosophy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We believe you deserve to understand exactly what goes into the price 
            of quality research compounds. Here's how we approach pricing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="p-8 border-[#D4FF1F]/20 bg-gradient-to-br from-[#D4FF1F]/5 to-transparent">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-[#D4FF1F]/20 flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-[#D4FF1F]" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold mb-2">The Bottom Line</h2>
                <p className="text-muted-foreground">
                  We're not the cheapest option on the market, and we're not trying to be. 
                  Our pricing reflects the true cost of producing properly tested, consistently 
                  pure research compounds with full traceability. Every dollar you spend goes 
                  toward quality you can verify.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="font-display text-2xl font-bold mb-6">What Determines Our Prices</h2>
          <PricingBreakdownInfographic />
        </motion.div>

        <Separator className="my-12" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="p-8 border-[#D4FF1F]/20 bg-gradient-to-br from-[#D4FF1F]/5 to-transparent">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-[#D4FF1F]/20 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-[#D4FF1F]" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold mb-3">Market Pricing Analysis & Stability</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    We continuously analyze the market for pricing trends across the research compound landscape. 
                    This analysis helps us understand competitive positioning, spot anomalies in the market, and 
                    ensure our pricing remains fair and aligned with the true value we deliver.
                  </p>
                  <p>
                    However, we recognize that <strong className="text-foreground">constant price fluctuations create uncertainty</strong> for 
                    our research partners. To balance market responsiveness with stability, we implement a 
                    deliberate pricing policy:
                  </p>
                  <div className="bg-background/50 border border-[#D4FF1F]/20 rounded-lg p-4 mt-4">
                    <p className="font-semibold text-foreground mb-2">Price updates occur only on the first of each month</p>
                    <p className="text-sm">
                      This 30-day minimum window between price changes gives you predictability in your research 
                      budgeting. You know that prices won't suddenly shift mid-project, allowing you to plan your 
                      compound purchases with confidence.
                    </p>
                  </div>
                  <p className="mt-4">
                    When we do adjust pricing based on market analysis, it's always justified by clear factors: 
                    supply chain changes, testing cost adjustments, or significant inventory shifts. Every price 
                    change is documented with a reason you can view—pure transparency.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <Separator className="my-12" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="font-display text-2xl font-bold mb-4">Why We Cost More Than Some</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  You'll find vendors selling peptides for significantly less. Here's why 
                  that's often a red flag:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                    <span><strong className="text-foreground">Recycled COAs:</strong> Same certificate used across multiple batches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                    <span><strong className="text-foreground">Skipped testing:</strong> No third-party verification or outdated tests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                    <span><strong className="text-foreground">Lower purity:</strong> 90% purity costs less but affects research quality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                    <span><strong className="text-foreground">Poor handling:</strong> Improper storage and shipping damages products</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-4">Our Pricing Commitments</h2>
              <Card className="p-6 border-green-500/20">
                <ul className="space-y-3">
                  {commitments.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-8 border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
            <div className="flex items-start gap-4">
              <Shield className="h-10 w-10 text-[#21d8ff] flex-shrink-0" />
              <div>
                <h3 className="font-display text-xl font-bold mb-2">The Value Proposition</h3>
                <p className="text-muted-foreground">
                  When you purchase from Revive Research, you're not just buying a compound. 
                  You're getting verified purity, batch-specific documentation, proper handling, 
                  and a team that stands behind every product. For serious research, that 
                  reliability is worth far more than any discount.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
