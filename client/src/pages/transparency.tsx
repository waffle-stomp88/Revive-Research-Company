import { motion } from "framer-motion";
import { SEOHead } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import {
  Shield,
  Target,
  Heart,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Users,
  Beaker,
  Award,
} from "lucide-react";

const values = [
  {
    icon: Eye,
    title: "Radical Transparency",
    description: "We show you exactly how our products are made, tested, and verified. No secrets, no hidden processes.",
    color: "#21d8ff",
  },
  {
    icon: Shield,
    title: "Uncompromising Quality",
    description: "Every batch undergoes third-party testing. We never cut corners on purity or consistency.",
    color: "#E7FB10",
  },
  {
    icon: Users,
    title: "Researcher First",
    description: "Built by researchers, for researchers. We understand what you need and why it matters.",
    color: "#9d4edd",
  },
  {
    icon: Heart,
    title: "Ethical Operations",
    description: "Clear pricing, honest communication, and no misleading claims. Ever.",
    color: "#ec4899",
  },
];

const doList = [
  "Provide batch-specific COAs for every product",
  "Use third-party testing from accredited labs",
  "Clearly label all products as research-use only",
  "Publish our quality and production process",
  "Respond to support inquiries within 24 hours",
  "Maintain transparent pricing with no hidden fees",
  "Archive all batch data for traceability",
  "Ship with discreet protective packaging",
];

const dontList = [
  "Make health claims or provide medical advice",
  "Offer dosing recommendations or protocols",
  "Recycle COAs across different batches",
  "Sell products without current testing",
  "Repackage expired or questionable inventory",
  "Use vague or misleading product descriptions",
  "Hide our processes from customers",
  "Pressure customers with fake urgency tactics",
];

export default function Transparency() {
  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead title="Transparency" description="Full transparency on sourcing, testing, and pricing. See exactly what goes into every research compound." canonicalPath="/about/our-transparency-commitment" />
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-[#9d4edd]/20 text-[#9d4edd] border-[#9d4edd]/30">
            About Us
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-transparency-title">
            Why Revive Research Exists
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            In an industry full of uncertainty, we're building something different: 
            a research supply company that operates with complete transparency.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <Card className="p-8 border-[#E7FB10]/20 bg-gradient-to-br from-[#E7FB10]/5 to-transparent">
            <div className="max-w-3xl mx-auto text-center">
              <Award className="h-12 w-12 text-[#E7FB10] mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground">
                To provide researchers with the highest quality peptide compounds, backed by 
                verifiable testing and complete transparency—setting a new standard for 
                what a research supply company should be.
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="font-display text-2xl font-bold text-center mb-8">Our Core Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card 
                    className="p-6 h-full"
                    style={{ borderColor: `${value.color}30` }}
                  >
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${value.color}20` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: value.color }} />
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2" style={{ color: value.color }}>
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <Separator className="my-16" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="font-display text-2xl font-bold text-center mb-4">What We Do (And Don't Do)</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Clear commitments that define how we operate.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border-green-500/20">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <h3 className="font-display text-xl font-bold text-green-500">What We Do</h3>
              </div>
              <ul className="space-y-3">
                {doList.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 border-red-500/20">
              <div className="flex items-center gap-2 mb-6">
                <XCircle className="h-6 w-6 text-red-500" />
                <h3 className="font-display text-xl font-bold text-red-500">What We Don't Do</h3>
              </div>
              <ul className="space-y-3">
                {dontList.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <Card className="p-8 border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
            <div className="max-w-3xl mx-auto">
              <Beaker className="h-10 w-10 text-[#21d8ff] mb-4" />
              <h2 className="font-display text-2xl font-bold mb-4">Our Standards</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Testing:</strong> Every batch is tested by 
                  independent, accredited laboratories. We use HPLC for purity analysis, mass 
                  spectrometry for identity confirmation, and additional testing as required.
                </p>
                <p>
                  <strong className="text-foreground">Traceability:</strong> Every vial includes 
                  a batch number and QR code linking directly to its Certificate of Analysis. 
                  You can verify exactly what you're receiving.
                </p>
                <p>
                  <strong className="text-foreground">Fulfillment:</strong> Orders placed before 
                  12:00 PM CT ship same day. We use discreet protective packaging and 
                  provide tracking on all shipments.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <Link href="/guides/peptide-quality-assurance-process">
            <Card className="p-6 h-full border-[#21d8ff]/20 hover:border-[#21d8ff]/40 transition-colors cursor-pointer group" data-testid="link-quality-process">
              <Target className="h-8 w-8 text-[#21d8ff] mb-4" />
              <h3 className="font-display text-lg font-bold mb-2 group-hover:text-[#21d8ff] transition-colors">
                See Our Process
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Step-by-step breakdown of how we produce and test every batch.
              </p>
              <div className="flex items-center text-[#21d8ff] text-sm">
                View Process <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </Card>
          </Link>

          <Link href="/coa-library">
            <Card className="p-6 h-full border-[#E7FB10]/20 hover:border-[#E7FB10]/40 transition-colors cursor-pointer group" data-testid="link-coa-library">
              <Shield className="h-8 w-8 text-[#E7FB10] mb-4" />
              <h3 className="font-display text-lg font-bold mb-2 group-hover:text-[#E7FB10] transition-colors">
                COA Library
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Browse our complete library of third-party verified certificates.
              </p>
              <div className="flex items-center text-[#E7FB10] text-sm">
                Browse Library <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </Card>
          </Link>

          <Link href="/contact">
            <Card className="p-6 h-full border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-colors cursor-pointer group" data-testid="link-contact">
              <Users className="h-8 w-8 text-[#9d4edd] mb-4" />
              <h3 className="font-display text-lg font-bold mb-2 group-hover:text-[#9d4edd] transition-colors">
                Get in Touch
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Questions? We respond to all inquiries within 24 hours.
              </p>
              <div className="flex items-center text-[#9d4edd] text-sm">
                Contact Us <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </Card>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
