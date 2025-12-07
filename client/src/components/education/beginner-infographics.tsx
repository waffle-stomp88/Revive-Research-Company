import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { 
  Puzzle, 
  Package, 
  Snowflake, 
  FileCheck, 
  FlaskConical,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ThermometerSnowflake,
  Sparkles,
  Shield,
  AlertTriangle
} from "lucide-react";

export function WhatIsPeptideVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const blocks = [
    { letter: "A", color: "#ec4899", delay: 0 },
    { letter: "M", color: "#21d8ff", delay: 0.1 },
    { letter: "I", color: "#22c55e", delay: 0.2 },
    { letter: "N", color: "#f97316", delay: 0.3 },
    { letter: "O", color: "#9d4edd", delay: 0.4 },
  ];

  return (
    <div ref={ref} className="py-6" data-testid="what-is-peptide-visual">
      <div className="text-center mb-6">
        <h4 className="text-lg font-bold text-foreground mb-2">Think of Peptides Like LEGO Blocks</h4>
        <p className="text-sm text-muted-foreground">
          Peptides are small chains of building blocks called amino acids
        </p>
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center justify-center gap-2">
          {blocks.map((block, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, rotateY: -90 }}
              animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
              transition={{ delay: block.delay, duration: 0.4, type: "spring" }}
              className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-lg"
              style={{ 
                backgroundColor: block.color,
                boxShadow: `0 4px 20px ${block.color}40`
              }}
            >
              {block.letter}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#21d8ff]/10 border border-[#21d8ff]/30">
            <Puzzle className="h-4 w-4 text-[#21d8ff]" />
            <span className="text-sm text-[#21d8ff]">Each letter = 1 Amino Acid</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.8 }}
            className="p-4 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-[#22c55e]">2-50</span>
              <span className="text-sm text-muted-foreground">amino acids</span>
            </div>
            <p className="text-xs text-muted-foreground">= Peptide (small chain)</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.9 }}
            className="p-4 rounded-lg bg-[#9d4edd]/10 border border-[#9d4edd]/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-[#9d4edd]">50+</span>
              <span className="text-sm text-muted-foreground">amino acids</span>
            </div>
            <p className="text-xs text-muted-foreground">= Protein (long chain)</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function SimplePurityMeter() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className="py-6" data-testid="simple-purity-meter">
      <div className="text-center mb-6">
        <h4 className="text-lg font-bold text-foreground mb-2">Purity = How Clean Is It?</h4>
        <p className="text-sm text-muted-foreground">
          Higher purity means more of what you want, less unwanted stuff
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="flex items-center gap-4">
            <div className="w-20 text-right">
              <span className="text-sm font-bold text-[#22c55e]">99%</span>
            </div>
            <div className="flex-1 h-8 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: "99%" } : {}}
                transition={{ delay: 0.5, duration: 1 }}
                className="h-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full"
              />
            </div>
            <div className="w-24">
              <span className="text-xs text-[#22c55e]">Ultra Pure</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="flex items-center gap-4">
            <div className="w-20 text-right">
              <span className="text-sm font-bold text-[#21d8ff]">98%</span>
            </div>
            <div className="flex-1 h-8 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: "98%" } : {}}
                transition={{ delay: 0.6, duration: 1 }}
                className="h-full bg-gradient-to-r from-[#21d8ff] to-[#0ea5e9] rounded-full"
              />
            </div>
            <div className="w-24">
              <span className="text-xs text-[#21d8ff]">High Purity</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="flex items-center gap-4">
            <div className="w-20 text-right">
              <span className="text-sm font-bold text-[#f97316]">95%</span>
            </div>
            <div className="flex-1 h-8 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: "95%" } : {}}
                transition={{ delay: 0.7, duration: 1 }}
                className="h-full bg-gradient-to-r from-[#f97316] to-[#ea580c] rounded-full"
              />
            </div>
            <div className="w-24">
              <span className="text-xs text-[#f97316]">Research Grade</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1 }}
        className="mt-6 p-4 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20 max-w-md mx-auto"
      >
        <p className="text-sm text-center text-muted-foreground">
          <strong className="text-foreground">Simple rule:</strong> Higher percentage = purer product = better for sensitive research
        </p>
      </motion.div>
    </div>
  );
}

export function COASimplified() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const checkItems = [
    { label: "Product name matches what you ordered", icon: CheckCircle2, good: true },
    { label: "Purity percentage (higher is better)", icon: CheckCircle2, good: true },
    { label: "Test date is recent", icon: CheckCircle2, good: true },
    { label: "Lab name is listed", icon: CheckCircle2, good: true },
  ];

  return (
    <div ref={ref} className="py-6" data-testid="coa-simplified">
      <div className="text-center mb-6">
        <h4 className="text-lg font-bold text-foreground mb-2">What is a COA?</h4>
        <p className="text-sm text-muted-foreground">
          Certificate of Analysis = Lab report card for your peptide
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-card border border-border relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#22c55e]/10 rounded-bl-full" />
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#9d4edd]/20 flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-[#9d4edd]" />
            </div>
            <div>
              <h5 className="font-bold text-foreground">Certificate of Analysis</h5>
              <p className="text-xs text-muted-foreground">Independent lab testing</p>
            </div>
          </div>

          <div className="space-y-3">
            {checkItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <item.icon className="h-4 w-4 text-[#22c55e] flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <Shield className="h-4 w-4 text-[#E7FB10]" />
          <span>We provide COAs for every batch</span>
        </motion.div>
      </div>
    </div>
  );
}

export function StorageBasics() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className="py-6" data-testid="storage-basics">
      <div className="text-center mb-6">
        <h4 className="text-lg font-bold text-foreground mb-2">Storage Made Simple</h4>
        <p className="text-sm text-muted-foreground">
          Keep your research materials safe with these basics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-gradient-to-br from-[#21d8ff]/10 to-transparent border border-[#21d8ff]/30 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-[#21d8ff]/20 flex items-center justify-center mx-auto mb-3">
            <Snowflake className="h-6 w-6 text-[#21d8ff]" />
          </div>
          <h5 className="font-bold text-foreground mb-1">Keep Cold</h5>
          <p className="text-xs text-muted-foreground">Refrigerator or freezer</p>
          <div className="mt-2 text-lg font-bold text-[#21d8ff]">2-8°C</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-gradient-to-br from-[#9d4edd]/10 to-transparent border border-[#9d4edd]/30 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-[#9d4edd]/20 flex items-center justify-center mx-auto mb-3">
            <Package className="h-6 w-6 text-[#9d4edd]" />
          </div>
          <h5 className="font-bold text-foreground mb-1">Keep Sealed</h5>
          <p className="text-xs text-muted-foreground">Original container</p>
          <div className="mt-2 text-lg font-bold text-[#9d4edd]">Airtight</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-gradient-to-br from-[#f97316]/10 to-transparent border border-[#f97316]/30 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-[#f97316]/20 flex items-center justify-center mx-auto mb-3">
            <XCircle className="h-6 w-6 text-[#f97316]" />
          </div>
          <h5 className="font-bold text-foreground mb-1">Avoid Light</h5>
          <p className="text-xs text-muted-foreground">Dark environment</p>
          <div className="mt-2 text-lg font-bold text-[#f97316]">No UV</div>
        </motion.div>
      </div>
    </div>
  );
}

export function ResearchOnlyExplainer() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className="py-6" data-testid="research-only-explainer">
      <div className="text-center mb-6">
        <h4 className="text-lg font-bold text-foreground mb-2">Why "Research Use Only"?</h4>
        <p className="text-sm text-muted-foreground">
          Understanding the legal framework for peptide research
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h5 className="font-bold text-foreground mb-2">Legal Requirement</h5>
              <p className="text-sm text-muted-foreground mb-4">
                Peptides sold for research purposes are not FDA-approved for human use. 
                This designation allows scientists to study these compounds in controlled laboratory settings.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                  <span className="text-muted-foreground">Laboratory research</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                  <span className="text-muted-foreground">Scientific studies</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                  <span className="text-muted-foreground">Educational purposes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-muted-foreground">Not for human consumption</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function OrderingJourneySimple() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const steps = [
    { num: 1, title: "Browse", desc: "Find what you need", icon: FlaskConical, color: "#ec4899" },
    { num: 2, title: "Order", desc: "Secure checkout", icon: Package, color: "#21d8ff" },
    { num: 3, title: "Verify", desc: "Check your COA", icon: FileCheck, color: "#9d4edd" },
    { num: 4, title: "Store", desc: "Keep it cold", icon: Snowflake, color: "#22c55e" },
  ];

  return (
    <div ref={ref} className="py-6" data-testid="ordering-journey-simple">
      <div className="text-center mb-6">
        <h4 className="text-lg font-bold text-foreground mb-2">Your Research Journey</h4>
        <p className="text-sm text-muted-foreground">
          From order to research in 4 simple steps
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.15 }}
            className="flex items-center gap-2"
          >
            <div 
              className="w-16 h-16 rounded-xl flex flex-col items-center justify-center"
              style={{ 
                backgroundColor: `${step.color}15`,
                border: `1px solid ${step.color}30`
              }}
            >
              <step.icon className="h-5 w-5 mb-1" style={{ color: step.color }} />
              <span className="text-xs font-medium" style={{ color: step.color }}>{step.title}</span>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
