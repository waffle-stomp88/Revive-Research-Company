import { motion } from "framer-motion";
import { SEOHead } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  Shield,
  Sparkles,
  QrCode,
  FileCheck,
} from "lucide-react";
import { ProcessPipeline } from "@/components/infographics/process-pipeline";
import { VerificationJourneyCompact } from "@/components/infographics/verification-journey";

export default function QualityProcess() {
  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead title="Quality Process" description="Our 6-step quality assurance process. From sourcing to shipping, every step is verified and documented." canonicalPath="/guides/peptide-quality-assurance-process" />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#21d8ff]/10 border border-[#21d8ff]/30 mb-6"
          >
            <Sparkles className="h-4 w-4 text-[#21d8ff]" />
            <span className="text-sm font-medium text-[#21d8ff]">Full Transparency</span>
          </motion.div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-quality-title">
            Our Quality & Production Process
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From synthesis to your laboratory — every step of our process is designed 
            for quality, consistency, and complete traceability.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <Card className="p-6 border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#21d8ff]/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#21d8ff]" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold mb-2">Our Role in Quality</h2>
                <p className="text-muted-foreground">
                  Revive Research is a premium distributor. While we do not manufacture peptides ourselves, 
                  we oversee a rigorous multi-stage quality protocol that ensures only the highest grade 
                  compounds from top-tier synthesis facilities reach your laboratory. Every batch is 
                  independently verified to ensure research integrity.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
              The 6-Step Journey
            </h2>
            <p className="text-muted-foreground">
              Hover over each step to explore the details
            </p>
          </div>
          <ProcessPipeline />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-2 gap-8 mb-16"
        >
          <Card className="p-8 border-[#9d4edd]/20 bg-gradient-to-br from-[#9d4edd]/5 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#9d4edd]/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-[#9d4edd]/20 flex items-center justify-center mb-4">
                <FileCheck className="h-7 w-7 text-[#9d4edd]" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-[#9d4edd]">
                Third-Party Testing
              </h3>
              <p className="text-muted-foreground mb-4">
                Every single batch goes through independent laboratory testing. We don't 
                test in-house and call it verified — we use accredited third-party labs 
                that have no connection to our business.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9d4edd]" />
                  HPLC purity analysis (98%+ target)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9d4edd]" />
                  Mass spectrometry molecular confirmation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9d4edd]" />
                  Endotoxin and sterility screening
                </li>
              </ul>
            </div>
          </Card>

          <Card className="p-8 border-[#E7FB10]/20 bg-gradient-to-br from-[#E7FB10]/5 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E7FB10]/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-[#E7FB10]/20 flex items-center justify-center mb-4">
                <QrCode className="h-7 w-7 text-[#E7FB10]" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-[#E7FB10]">
                Full Traceability
              </h3>
              <p className="text-muted-foreground mb-4">
                Every vial includes a unique QR code that links directly to its 
                batch-specific Certificate of Analysis. Scan it anytime to verify 
                exactly what you're working with.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E7FB10]" />
                  Unique batch numbers per production run
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E7FB10]" />
                  QR codes linked to COA verification
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E7FB10]" />
                  Complete production history on record
                </li>
              </ul>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <Card className="p-8 border-[#21d8ff]/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E7FB10]/5 via-[#21d8ff]/5 to-[#9d4edd]/5" />
            <div className="relative">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30">
                  Verification Flow
                </Badge>
                <h3 className="font-display text-2xl font-bold mb-2">
                  From QR to Verified COA
                </h3>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  The complete journey to verify any product takes just seconds
                </p>
              </div>
              <VerificationJourneyCompact />
              <div className="text-center mt-8">
                <Link href="/coa/verify-certificate-of-analysis">
                  <Button className="bg-[#21d8ff] text-black gap-2" data-testid="button-verify-now">
                    Verify a Product Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <Card className="p-8 border-[#22c55e]/20 bg-gradient-to-br from-[#22c55e]/5 to-transparent" data-testid="card-commitment">
            <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-[#22c55e]" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-4">
              Our Commitment to You
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              We never cut corners. Every step of this process exists because we believe 
              researchers deserve to know exactly what they're working with. If you have 
              questions about our process, we're always happy to explain.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/coa-library">
                <Button variant="outline" className="gap-2 border-[#9d4edd]/30 text-[#9d4edd]" data-testid="link-coa-library">
                  <FileCheck className="h-4 w-4" />
                  Browse COA Library
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="gap-2" data-testid="link-contact">
                  Ask Us Anything
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
