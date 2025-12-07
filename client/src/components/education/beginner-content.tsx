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
  // New education article slugs
  "understanding-peptide-purity": () => <SimplePurityMeter />,
  "reconstitution-101": () => <WhatIsPeptideVisual />,
  "proper-peptide-storage": () => <StorageBasics />,
  "reading-coa-documents": () => <COASimplified />,
  "peptide-research-applications": () => <WhatIsPeptideVisual />,
  "lab-safety-guidelines": () => <ResearchOnlyExplainer />,
  // Legacy slugs
  "research-use-only-explained": () => <ResearchOnlyExplainer />,
  "how-to-read-coas": () => <COASimplified />,
  "storage-101": () => <StorageBasics />,
  "ordering-expectations": () => <OrderingJourneySimple />,
};

const beginnerContent: Record<string, {
  tldr: string;
  keyPoints: string[];
  whyItMatters: string;
  actionItem: string;
}> = {
  // General education articles
  "understanding-peptide-purity": {
    tldr: "Purity tells you how 'clean' your peptide is - basically what percentage is the actual peptide vs. impurities. Think of it like gold: 99% pure is better than 90%.",
    keyPoints: [
      "99%+ purity means less than 1% is 'other stuff' (like leftover manufacturing materials)",
      "Purity is measured using a technique called HPLC - it separates molecules by size to count them",
      "Higher purity = more consistent and predictable results in research",
      "Most research peptides are 95-99%+ pure"
    ],
    whyItMatters: "When you're running experiments, impurities can mess up your results. Higher purity means you're actually testing the peptide, not random contaminants.",
    actionItem: "Check the purity percentage on your COA - for sensitive research, aim for 98%+ purity."
  },
  "reconstitution-101": {
    tldr: "Reconstitution means adding water to your freeze-dried peptide powder to turn it into a liquid you can measure and use. It's easier than it sounds!",
    keyPoints: [
      "Peptides are shipped as dry powder (lyophilized) because they stay stable longer that way",
      "You add 'bacteriostatic water' - sterile water with a tiny bit of preservative",
      "Go slowly! Squirt the water down the side of the vial, don't blast the powder",
      "Gently swirl to mix - never shake vigorously or it can damage the peptide"
    ],
    whyItMatters: "Proper reconstitution ensures your peptide is fully dissolved and at the right concentration for accurate dosing in research protocols.",
    actionItem: "Gather your supplies first: bacteriostatic water, alcohol wipes, and syringes. Work in a clean environment."
  },
  "proper-peptide-storage": {
    tldr: "Keep peptides cold, dry, and dark. Unreconstituted powder goes in the freezer; mixed solution goes in the fridge.",
    keyPoints: [
      "Dry powder (not mixed): Store in freezer (-20°C) - lasts months to years",
      "Mixed with water: Store in refrigerator (2-8°C) - use within 4-6 weeks",
      "Keep away from light - peptides can break down with UV exposure",
      "Don't freeze-thaw repeatedly - this damages the peptide structure"
    ],
    whyItMatters: "Peptides are delicate molecules. Heat, light, and moisture cause them to break down or 'denature' - meaning they won't work properly for research.",
    actionItem: "As soon as your order arrives, put unmixed peptides in the freezer. After reconstitution, refrigerate and note the date."
  },
  "reading-coa-documents": {
    tldr: "A COA (Certificate of Analysis) is basically a report card from an independent lab proving your peptide is what it says it is and how pure it is.",
    keyPoints: [
      "Product Identity: Confirms the peptide is actually BPC-157, Semaglutide, etc. (not something else)",
      "Purity %: The main number - shows how clean the peptide is (higher = better)",
      "Molecular Weight: Confirms the peptide has the correct chemical structure",
      "Appearance & Sterility: Shows it looks right and is free of contamination"
    ],
    whyItMatters: "Without a COA, you have no proof of what's in the vial. Third-party testing is the only way to verify quality from any peptide vendor.",
    actionItem: "Before using any peptide, check that the COA matches your batch number and shows 95%+ purity."
  },
  "peptide-research-applications": {
    tldr: "Peptides are short chains of amino acids (like mini-proteins) that researchers use to study how the body's signaling systems work.",
    keyPoints: [
      "Peptides act as 'messengers' that tell cells what to do - growth, healing, metabolism, etc.",
      "Scientists study them to understand diseases and develop new treatments",
      "Different peptides target different systems - growth hormone, metabolism, tissue repair, brain function",
      "Research helps discover how these natural signaling molecules work"
    ],
    whyItMatters: "Understanding peptide mechanisms helps advance medical science - from studying how wounds heal to how hormones regulate body functions.",
    actionItem: "Explore our peptide catalog to see the different categories: GH secretagogues, metabolic peptides, tissue repair, neuropeptides, and more."
  },
  "lab-safety-guidelines": {
    tldr: "Working with research peptides requires basic lab safety: clean workspace, proper protective gear, and careful handling procedures.",
    keyPoints: [
      "Always wear gloves and work on a clean, sanitized surface",
      "Use sterile needles and syringes - never reuse",
      "Wipe vial tops with alcohol before puncturing",
      "Dispose of sharps properly in designated containers"
    ],
    whyItMatters: "Good lab practices prevent contamination (which ruins your research) and keep you safe from accidental needlesticks or exposure.",
    actionItem: "Set up a dedicated clean workspace with proper supplies before handling any research materials."
  },
  "peptide-research-glossary": {
    tldr: "Peptide research has lots of technical terms that can be confusing. Here's your cheat sheet to the most common jargon.",
    keyPoints: [
      "Lyophilized = freeze-dried (the powder form peptides are shipped in)",
      "Reconstitute = mix with water to create a usable solution",
      "HPLC = the machine that measures purity by separating molecules",
      "Bacteriostatic Water = sterile water with preservative (what you mix peptides with)"
    ],
    whyItMatters: "Knowing the terminology helps you understand COAs, research papers, and product descriptions - so you can make informed decisions.",
    actionItem: "Bookmark this glossary! Refer back whenever you encounter unfamiliar terms in peptide research."
  },
  // Legacy slugs for backwards compatibility
  "research-use-only-explained": {
    tldr: "Peptides we sell are meant for lab research only - not for personal use. This is a legal requirement for unapproved compounds.",
    keyPoints: [
      "Research peptides aren't FDA-approved for use in humans",
      "They're sold specifically for scientific study in controlled lab settings",
      "This designation allows researchers to study promising compounds",
      "We comply strictly with all legal requirements"
    ],
    whyItMatters: "Understanding this distinction helps you know what you're purchasing and why our products have specific usage disclaimers.",
    actionItem: "Use peptides only for legitimate research purposes in appropriate laboratory settings."
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
  tldr: "This article covers important concepts for peptide research. Switch to Deep Dive mode for the full technical details, or read the summary below.",
  keyPoints: [
    "Peptides are short chains of amino acids that act as signaling molecules",
    "Quality and purity matter - always check your COA (Certificate of Analysis)",
    "Proper storage (cold and dark) keeps peptides stable",
    "All research peptides require proper lab handling and safety precautions"
  ],
  whyItMatters: "Whether you're new to peptide research or just want a refresher, understanding these fundamentals helps you work more effectively and safely.",
  actionItem: "Tap 'Deep Dive' above for the complete technical breakdown with all the scientific details."
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
