import { motion } from "framer-motion";
import { 
  Lightbulb, 
  Target, 
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { 
  WhatIsPeptideVisual, 
  SimplePurityMeter, 
  COASimplified, 
  StorageBasics,
  ResearchOnlyExplainer,
  OrderingJourneySimple
} from "./beginner-infographics";

interface BeginnerContentProps {
  slug: string;
  title: string;
}

const beginnerArticleVisuals: Record<string, () => JSX.Element> = {
  "research-use-only-explained": () => <ResearchOnlyExplainer />,
  "how-to-read-coas": () => <COASimplified />,
  "understanding-peptide-purity": () => <SimplePurityMeter />,
  "storage-101": () => <StorageBasics />,
  "ordering-expectations": () => <OrderingJourneySimple />,
};

const beginnerContent: Record<string, {
  tldr: string;
  keyPoints: string[];
  whyItMatters: string;
  actionItem: string;
}> = {
  "research-use-only-explained": {
    tldr: "Peptides we sell are meant for lab research only - not for personal use. This is a legal requirement.",
    keyPoints: [
      "Research peptides aren't FDA-approved for humans",
      "They're used by scientists in controlled lab settings",
      "This designation allows for scientific study",
      "We follow all legal requirements strictly"
    ],
    whyItMatters: "Understanding this helps you know what you're getting and why we have specific disclaimers on our products.",
    actionItem: "Always use peptides only for legitimate research purposes in appropriate laboratory settings."
  },
  "how-to-read-coas": {
    tldr: "A COA (Certificate of Analysis) is like a report card that shows how pure and high-quality your peptide is.",
    keyPoints: [
      "COA shows the product was tested by an independent lab",
      "Look for purity percentage - higher is better",
      "Check that the product name matches your order",
      "Make sure the test date is recent"
    ],
    whyItMatters: "Reading a COA helps you verify you're getting exactly what you paid for - pure, tested research materials.",
    actionItem: "Always check the COA before starting your research to confirm product quality."
  },
  "understanding-peptide-purity": {
    tldr: "Purity tells you how 'clean' your peptide is. Think of it like gold - 99% pure gold is better than 90% pure.",
    keyPoints: [
      "99%+ purity = Ultra pure (best for sensitive research)",
      "98%+ purity = High quality (good for most research)",
      "95%+ purity = Research grade (general purpose)",
      "Higher purity = fewer unwanted substances"
    ],
    whyItMatters: "Using the right purity level ensures your research results are accurate and reliable.",
    actionItem: "Choose purity based on your research needs - more sensitive work needs higher purity."
  },
  "storage-101": {
    tldr: "Keep peptides cold, sealed, and away from light. It's that simple!",
    keyPoints: [
      "Store in refrigerator (2-8°C) or freezer for long-term",
      "Keep in original sealed container",
      "Protect from direct light and moisture",
      "Don't leave out at room temperature"
    ],
    whyItMatters: "Proper storage keeps your research materials effective for longer - saving money and ensuring reliable results.",
    actionItem: "As soon as you receive your order, put it in the refrigerator or freezer right away."
  },
  "ordering-expectations": {
    tldr: "From checkout to delivery, here's what to expect when you order from us.",
    keyPoints: [
      "Secure checkout with multiple payment options",
      "Discreet packaging for privacy",
      "COA included with every order",
      "Tracking number provided for all shipments"
    ],
    whyItMatters: "Knowing what to expect reduces stress and helps you plan your research timeline.",
    actionItem: "After ordering, check your email for tracking information and prepare proper storage."
  },
  "understanding-batches": {
    tldr: "Batch numbers let you trace exactly when and where your peptide was made and tested.",
    keyPoints: [
      "Every batch is tested independently",
      "Batch numbers link to specific COA results",
      "Same peptide, different batches = same quality standards",
      "We keep records for full traceability"
    ],
    whyItMatters: "Batch tracking means you can always verify the quality and origin of your research materials.",
    actionItem: "Note your batch number and keep your COA for your research records."
  }
};

const defaultBeginnerContent = {
  tldr: "This research compound has been studied for its unique properties in laboratory settings.",
  keyPoints: [
    "Used in scientific research environments",
    "Quality verified through third-party testing",
    "Proper handling ensures best results",
    "For research purposes only"
  ],
  whyItMatters: "Understanding the basics helps you make informed decisions about your research materials.",
  actionItem: "Review the full article for detailed information specific to this compound."
};

export function BeginnerArticleContent({ slug, title }: BeginnerContentProps) {
  const content = beginnerContent[slug] || defaultBeginnerContent;
  const Visual = beginnerArticleVisuals[slug];

  return (
    <div className="space-y-6" data-testid="beginner-article-content">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-r from-[#22c55e]/10 to-[#22c55e]/5 border border-[#22c55e]/30"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#22c55e]/20 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-[#22c55e]" />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">TL;DR (The Quick Version)</h3>
            <p className="text-sm text-muted-foreground">{content.tldr}</p>
          </div>
        </div>
      </motion.div>

      {Visual && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-card border border-border"
        >
          <Visual />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-card border border-border"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-[#21d8ff]" />
          <h3 className="font-bold text-foreground">Key Points</h3>
        </div>
        <ul className="space-y-3">
          {content.keyPoints.map((point, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-start gap-3"
            >
              <CheckCircle2 className="h-4 w-4 text-[#22c55e] mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{point}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-4 rounded-xl bg-[#9d4edd]/10 border border-[#9d4edd]/30"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-[#9d4edd]" />
          <h3 className="font-bold text-foreground">Why This Matters</h3>
        </div>
        <p className="text-sm text-muted-foreground">{content.whyItMatters}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="p-4 rounded-xl bg-[#21d8ff]/10 border border-[#21d8ff]/30"
      >
        <div className="flex items-center gap-2 mb-2">
          <ArrowRight className="h-5 w-5 text-[#21d8ff]" />
          <h3 className="font-bold text-foreground">Your Next Step</h3>
        </div>
        <p className="text-sm text-muted-foreground">{content.actionItem}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30"
      >
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-200/90">
            <strong className="text-amber-400">Research Use Only:</strong> All products and information 
            are intended solely for laboratory and research purposes. Not for human consumption.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-center pt-4"
      >
        <p className="text-xs text-muted-foreground">
          Want more details? Switch to <span className="text-[#9d4edd] font-medium">Deep Dive</span> mode for the full researcher version.
        </p>
      </motion.div>
    </div>
  );
}

export function WhatIsPeptideSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl bg-card border border-[#ec4899]/30 mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-[#ec4899]" />
        <h3 className="font-bold text-foreground">New to Peptides?</h3>
      </div>
      <WhatIsPeptideVisual />
    </motion.div>
  );
}
