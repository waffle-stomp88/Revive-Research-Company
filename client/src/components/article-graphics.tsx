import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  Shield, ShieldAlert, ShieldCheck, ShieldX,
  FlaskConical, Truck, TestTube, CheckCircle2, Package, Microscope,
  Clock, DollarSign, FileCheck, Building2, Scale,
  AlertTriangle, Check, X, Eye, EyeOff,
  Search, Fingerprint, Hash, Beaker, Award,
  Scissors, Thermometer, HeadphonesIcon, PackageCheck, Users, TrendingUp
} from "lucide-react";

function AnimatedCounter({ target, duration = 2, prefix = "", suffix = "", color }: { target: number; duration?: number; prefix?: string; suffix?: string; color?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref} style={{ color }}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

export function TrustScaleGraphic() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const levels = [
    { label: "No COA", color: "#ef4444", icon: ShieldX, description: "No testing documentation provided", position: 5 },
    { label: "In-House COA", color: "#f59e0b", icon: ShieldAlert, description: "Seller tests their own product", position: 35 },
    { label: "Third-Party COA", color: "#22c55e", icon: ShieldCheck, description: "Independent lab verification", position: 65 },
    { label: "Verified + Archived", color: "#21d8ff", icon: Shield, description: "Third-party + batch archive + QR codes", position: 92 },
  ];

  return (
    <div ref={ref} className="my-6 sm:my-8 not-prose" data-testid="graphic-trust-scale">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">Trust Verification Scale</h3>
      <Card className="p-4 sm:p-6 border-[#21d8ff]/20 bg-[#21d8ff]/5 overflow-visible">
        <div className="hidden sm:block">
          <div className="relative h-16 mb-4">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 rounded-full overflow-hidden bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: "100%" } : {}}
                transition={{ duration: 2, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #ef4444, #f59e0b, #22c55e, #21d8ff)" }}
              />
            </div>
            {levels.map((level, i) => (
              <motion.div
                key={level.label}
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.3, type: "spring" }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${level.position}%` }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                  style={{ backgroundColor: `${level.color}20`, borderColor: level.color }}
                >
                  <level.icon className="h-5 w-5" style={{ color: level.color }} />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            {levels.map((level, i) => (
              <motion.div
                key={level.label}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.8 + i * 0.2 }}
                className="text-center"
              >
                <p className="text-xs font-semibold" style={{ color: level.color }}>{level.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="sm:hidden space-y-3">
          <div className="h-2 rounded-full overflow-hidden bg-muted mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: "100%" } : {}}
              transition={{ duration: 2, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #ef4444, #f59e0b, #22c55e, #21d8ff)" }}
            />
          </div>
          {levels.map((level, i) => (
            <motion.div
              key={level.label}
              initial={{ opacity: 0, x: -15 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="flex items-center gap-3"
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0"
                style={{ backgroundColor: `${level.color}20`, borderColor: level.color }}
              >
                <level.icon className="h-4 w-4" style={{ color: level.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: level.color }}>{level.label}</p>
                <p className="text-[11px] text-muted-foreground">{level.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function COAAnatomyDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeSection, setActiveSection] = useState<number | null>(null);

  const sections = [
    { label: "Lab Name & Accreditation", icon: Building2, color: "#22c55e", description: "Identifies who performed the test. Should be an independent, accredited lab — not in-house." },
    { label: "Batch / Lot Number", icon: Hash, color: "#21d8ff", description: "Must match the number on your product. This links the COA to your specific batch." },
    { label: "Purity % (HPLC)", icon: TrendingUp, color: "#a855f7", description: "Shows what percentage of the sample is the target compound. Measured via chromatography." },
    { label: "Identity (Mass Spec)", icon: Fingerprint, color: "#ec4899", description: "Confirms the molecular structure matches the expected compound. Essential for verification." },
    { label: "Test Date", icon: Clock, color: "#f59e0b", description: "When the testing was performed. Should be recent and relevant to your batch." },
    { label: "Methodology", icon: Microscope, color: "#06b6d4", description: "The specific testing methods used (HPLC column type, MS parameters, etc.)." },
  ];

  return (
    <div ref={ref} className="my-6 sm:my-8 not-prose" data-testid="graphic-coa-anatomy">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">Anatomy of a COA</h3>
      <Card className="p-4 sm:p-6 border-[#21d8ff]/20 bg-[#21d8ff]/5">
        <div className="hidden sm:grid md:grid-cols-2 gap-6">
          <div className="relative">
            <div className="bg-muted/30 rounded-lg p-5 border border-border space-y-3">
              <div className="text-center mb-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Certificate of Analysis</p>
                <div className="w-16 h-0.5 bg-muted mx-auto mt-2" />
              </div>
              {sections.map((section, i) => (
                <motion.div
                  key={section.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all"
                  style={{ 
                    backgroundColor: activeSection === i ? `${section.color}15` : "transparent",
                    borderLeft: `3px solid ${activeSection === i ? section.color : "transparent"}`
                  }}
                  onMouseEnter={() => setActiveSection(i)}
                  onMouseLeave={() => setActiveSection(null)}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: `${section.color}60` }} />
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-muted/50" style={{ width: `${[75, 85, 65, 90, 70, 80][i]}%` }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {sections.map((section, i) => (
              <motion.div
                key={section.label}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-start gap-3 p-2.5 rounded-md cursor-pointer transition-all"
                style={{ 
                  backgroundColor: activeSection === i ? `${section.color}10` : "transparent",
                }}
                onMouseEnter={() => setActiveSection(i)}
                onMouseLeave={() => setActiveSection(null)}
              >
                <section.icon className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: section.color }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: activeSection === i ? section.color : undefined }}>{section.label}</p>
                  <motion.p 
                    className="text-xs text-muted-foreground mt-0.5"
                    animate={{ opacity: activeSection === i ? 1 : 0.6 }}
                  >
                    {section.description}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="sm:hidden space-y-3">
          {sections.map((section, i) => (
            <motion.div
              key={section.label}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/50"
              style={{ backgroundColor: `${section.color}08` }}
            >
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border"
                style={{ backgroundColor: `${section.color}15`, borderColor: `${section.color}40` }}
              >
                <section.icon className="h-3.5 w-3.5" style={{ color: section.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: section.color }}>{section.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function BatchTestingPipeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    { label: "Raw Materials", icon: FlaskConical, color: "#a855f7", detail: "Peptide synthesis from verified facilities" },
    { label: "Production", icon: Package, color: "#ec4899", detail: "Consistent filling & lyophilization process" },
    { label: "Sample Pull", icon: TestTube, color: "#f59e0b", detail: "Representative samples from batch" },
    { label: "Lab Testing", icon: Microscope, color: "#21d8ff", detail: "Independent third-party HPLC + MS analysis" },
    { label: "Approval", icon: CheckCircle2, color: "#22c55e", detail: "Batch passes quality thresholds" },
    { label: "Ship", icon: Truck, color: "#E7FB10", detail: "Cold-chain delivery to your door" },
  ];

  return (
    <div ref={ref} className="my-6 sm:my-8 not-prose" data-testid="graphic-batch-pipeline">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">Batch Testing Pipeline</h3>
      <Card className="p-4 sm:p-6 border-[#9d4edd]/20 bg-[#9d4edd]/5">
        <div className="hidden md:flex items-center justify-between relative">
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-muted">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#a855f7] via-[#21d8ff] to-[#E7FB10]"
              initial={{ width: 0 }}
              animate={isInView ? { width: "100%" } : {}}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </div>
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.25 }}
              className="flex flex-col items-center relative z-10 flex-1"
            >
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background"
                style={{ borderColor: step.color }}
                animate={isInView ? { boxShadow: `0 0 12px ${step.color}40` } : {}}
                transition={{ delay: 0.5 + i * 0.25 }}
              >
                <step.icon className="h-5 w-5" style={{ color: step.color }} />
              </motion.div>
              <p className="text-xs font-semibold mt-2 text-center" style={{ color: step.color }}>{step.label}</p>
              <p className="text-[10px] text-muted-foreground mt-1 text-center max-w-[100px]">{step.detail}</p>
            </motion.div>
          ))}
        </div>
        <div className="md:hidden space-y-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15 }}
              className="flex items-center gap-3"
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0"
                style={{ borderColor: step.color, backgroundColor: `${step.color}15` }}
              >
                <step.icon className="h-4 w-4" style={{ color: step.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: step.color }}>{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.detail}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="absolute left-4 mt-10 w-0.5 h-3 bg-muted" />
              )}
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function CostCalculatorVisual() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="my-6 sm:my-8 not-prose" data-testid="graphic-cost-calculator">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">The Math Behind Testing Every Vial</h3>
      <Card className="p-4 sm:p-6 border-[#f59e0b]/20 bg-[#f59e0b]/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="text-center p-4 sm:p-6 rounded-lg bg-background/50 border border-border">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">With Batch Testing</p>
            <div className="text-4xl font-bold font-display">
              {isInView && <AnimatedCounter target={50} prefix="$" color="#22c55e" />}
            </div>
            <p className="text-sm text-muted-foreground mt-2">per vial (typical retail)</p>
            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground text-left">
              <div className="flex justify-between"><span>Synthesis & materials</span><span>$15-20</span></div>
              <div className="flex justify-between"><span>Batch testing (shared)</span><span>$3-5</span></div>
              <div className="flex justify-between"><span>Storage & handling</span><span>$5-8</span></div>
              <div className="flex justify-between"><span>Operations & margin</span><span>$17-27</span></div>
            </div>
          </div>
          <div className="text-center p-4 sm:p-6 rounded-lg bg-background/50 border border-[#ef4444]/20">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">If Every Vial Were Tested</p>
            <div className="text-4xl font-bold font-display">
              {isInView && <AnimatedCounter target={350} prefix="$" suffix="+" color="#ef4444" />}
            </div>
            <p className="text-sm text-muted-foreground mt-2">per vial (hypothetical)</p>
            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground text-left">
              <div className="flex justify-between"><span>Synthesis & materials</span><span>$15-20</span></div>
              <div className="flex justify-between"><span>Individual HPLC test</span><span className="text-[#ef4444]">$150-300</span></div>
              <div className="flex justify-between"><span>Individual MS test</span><span className="text-[#ef4444]">$100-200</span></div>
              <div className="flex justify-between"><span>Storage, ops & margin</span><span>$85-130</span></div>
            </div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.5 }}
              className="text-xs text-[#f59e0b] mt-4 font-medium"
            >
              ...and you still wouldn't receive the tested sample
            </motion.p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function RegulatoryPathwayComparison() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="my-6 sm:my-8 not-prose" data-testid="graphic-regulatory-pathway">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">Regulatory Pathway Comparison</h3>
      <Card className="p-4 sm:p-6 border-[#22c55e]/20 bg-[#22c55e]/5">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
              <p className="text-sm font-semibold text-[#f59e0b]">FDA Drug Approval Path</p>
              <p className="text-xs text-muted-foreground">10-15 years</p>
            </div>
            <div className="relative h-8 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: "100%" } : {}}
                transition={{ duration: 2, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[#f59e0b]/80 to-[#ef4444]/80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="hidden sm:inline text-xs font-medium text-white drop-shadow">Discovery → Preclinical → Phase I → Phase II → Phase III → FDA Review → Approval</span>
                <span className="sm:hidden text-[10px] font-medium text-white drop-shadow">Discovery → Phase I-III → Approval</span>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3 text-[#f59e0b]" /> <AnimatedCounter target={1} prefix="$" suffix="B+" color="#f59e0b" /></span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[#f59e0b]" /> 10-15 years</span>
              <span className="hidden sm:flex items-center gap-1"><Users className="h-3 w-3 text-[#f59e0b]" /> Thousands of trial participants</span>
            </div>
          </div>
          
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
              <p className="text-sm font-semibold text-[#22c55e]">Research Use Only (RUO) Path</p>
              <p className="text-xs text-muted-foreground">Ongoing verification</p>
            </div>
            <div className="relative h-8 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: "45%" } : {}}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[#22c55e]/80 to-[#21d8ff]/80"
              />
              <div className="absolute inset-0 flex items-center px-3 sm:px-4">
                <span className="hidden sm:inline text-xs font-medium text-white drop-shadow">Synthesis → Third-Party Testing → COA Documentation → Research Market</span>
                <span className="sm:hidden text-[10px] font-medium text-white drop-shadow">Synthesis → Testing → COA → Market</span>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3 text-[#22c55e]" /> Per batch cost</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[#22c55e]" /> Weeks per batch</span>
              <span className="hidden sm:flex items-center gap-1"><FileCheck className="h-3 w-3 text-[#22c55e]" /> Verified documentation</span>
            </div>
          </div>
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
          className="text-xs text-muted-foreground mt-4 text-center italic"
        >
          RUO isn't a shortcut — it serves a different market with different verification requirements
        </motion.p>
      </Card>
    </div>
  );
}

export function RUOMythsVsReality() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const items = [
    { myth: "RUO = low quality", reality: "RUO refers to regulatory status, not quality. Many RUO compounds exceed pharmaceutical purity." },
    { myth: "It's a legal loophole", reality: "RUO is a legitimate market category serving academic and private research labs." },
    { myth: "No oversight exists", reality: "Quality is verified through independent third-party testing and COA documentation." },
    { myth: "Only sketchy companies use it", reality: "Major chemical suppliers (Sigma-Aldrich, etc.) sell thousands of RUO products." },
  ];

  return (
    <div ref={ref} className="my-6 sm:my-8 not-prose" data-testid="graphic-ruo-myths">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">Common Misconceptions</h3>
      <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-4">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.15 }}
          >
            <Card className="p-3.5 sm:p-5 h-full border-border">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start gap-2">
                  <X className="h-4 w-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#ef4444] line-through">{item.myth}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#22c55e] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{item.reality}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function VerificationStepper() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const timer = setInterval(() => {
      setActiveStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 800);
    return () => clearInterval(timer);
  }, [isInView]);

  const steps = [
    { label: "Demand Third-Party COAs", icon: FileCheck, description: "Ask for independent lab documentation" },
    { label: "Verify the Lab", icon: Building2, description: "Research the lab's accreditation and reputation" },
    { label: "Match Batch Numbers", icon: Hash, description: "Confirm COA batch matches your product" },
    { label: "Check Test Methods", icon: Microscope, description: "Look for HPLC + Mass Spec testing" },
    { label: "Consider Independent Testing", icon: Search, description: "Send a sample to your own chosen lab" },
  ];

  return (
    <div ref={ref} className="my-6 sm:my-8 not-prose" data-testid="graphic-verification-stepper">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">Your 5-Step Verification Process</h3>
      <Card className="p-4 sm:p-6 border-[#E7FB10]/20 bg-[#E7FB10]/5">
        <div className="space-y-3">
          {steps.map((step, i) => {
            const isActive = i <= activeStep;
            const isCurrent = i === activeStep;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: isActive ? 1 : 0.4 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <motion.div
                  className="w-9 h-9 rounded-full flex items-center justify-center border-2 flex-shrink-0"
                  style={{ 
                    borderColor: isActive ? "#22c55e" : "hsl(var(--border))",
                    backgroundColor: isActive ? "#22c55e15" : "transparent" 
                  }}
                  animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {isActive ? (
                    <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                  ) : (
                    <span className="text-xs text-muted-foreground font-medium">{i + 1}</span>
                  )}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: isActive ? "#22c55e" : undefined }}>
                    Step {i + 1}: {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                <step.icon className="h-4 w-4 flex-shrink-0" style={{ color: isActive ? "#22c55e" : "hsl(var(--muted-foreground))" }} />
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export function RedGreenFlags() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const redFlags = [
    "No COA available or only 'upon request'",
    "In-house testing with no independent verification",
    "Prices dramatically below market average",
    "Defensive when questioned about quality",
    "No batch number traceability system",
  ];

  const greenFlags = [
    "Third-party COAs from named, verifiable labs",
    "Batch numbers match between product and docs",
    "Transparent batch archive with historical records",
    "Welcomes questions about testing and sourcing",
    "Honest about limitations and what testing proves",
  ];

  return (
    <div ref={ref} className="my-6 sm:my-8 not-prose" data-testid="graphic-red-green-flags">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">Supplier Evaluation at a Glance</h3>
      <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 border-[#ef4444]/20 bg-[#ef4444]/5">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
            <h4 className="font-semibold text-sm text-[#ef4444]">Warning Signs</h4>
          </div>
          <div className="space-y-2">
            {redFlags.map((flag, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.12 }}
                className="flex items-start gap-2"
              >
                <X className="h-4 w-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">{flag}</p>
              </motion.div>
            ))}
          </div>
        </Card>
        <Card className="p-4 sm:p-5 border-[#22c55e]/20 bg-[#22c55e]/5">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <ShieldCheck className="h-5 w-5 text-[#22c55e]" />
            <h4 className="font-semibold text-sm text-[#22c55e]">Confidence Builders</h4>
          </div>
          <div className="space-y-2">
            {greenFlags.map((flag, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 15 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.12 }}
                className="flex items-start gap-2"
              >
                <Check className="h-4 w-4 text-[#22c55e] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">{flag}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function HPLCChromatogram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const peaks = [
    { x: 15, height: 15, width: 6, label: "Solvent", color: "#64748b" },
    { x: 30, height: 8, width: 5, label: "Truncated seq.", color: "#f59e0b" },
    { x: 48, height: 92, width: 12, label: "Target Peptide (98.2%)", color: "#22c55e" },
    { x: 68, height: 6, width: 4, label: "Oxidation product", color: "#f59e0b" },
    { x: 82, height: 4, width: 5, label: "Salt/TFA", color: "#64748b" },
  ];

  return (
    <div ref={ref} className="my-6 sm:my-8 not-prose" data-testid="graphic-hplc-chromatogram">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">Simplified HPLC Chromatogram</h3>
      <Card className="p-4 sm:p-6 border-[#a855f7]/20 bg-[#a855f7]/5">
        <div className="relative h-48 sm:h-64 md:h-72">
          <div className="absolute bottom-6 left-4 sm:left-8 right-2 sm:right-4 top-4">
            <p className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] sm:text-[10px] text-muted-foreground whitespace-nowrap">Intensity</p>
            <p className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] text-muted-foreground">Retention Time (min)</p>
            
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="100" x2="100" y2="100" stroke="hsl(var(--border))" strokeWidth="0.3" />
              <line x1="0" y1="0" x2="0" y2="100" stroke="hsl(var(--border))" strokeWidth="0.3" />
              
              {[20, 40, 60, 80].map(y => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--border))" strokeWidth="0.15" strokeDasharray="1,1" />
              ))}
              
              {peaks.map((peak, i) => (
                <motion.path
                  key={i}
                  d={`M ${peak.x - peak.width} 100 Q ${peak.x - peak.width/2} ${100 - peak.height} ${peak.x} ${100 - peak.height} Q ${peak.x + peak.width/2} ${100 - peak.height} ${peak.x + peak.width} 100`}
                  fill={`${peak.color}30`}
                  stroke={peak.color}
                  strokeWidth="0.5"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.5 + i * 0.3, duration: 0.8 }}
                />
              ))}
            </svg>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-2 justify-center">
          {peaks.map((peak, i) => (
            <motion.div 
              key={i} 
              className="flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1 + i * 0.15 }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: peak.color }} />
              <span className="text-[10px] text-muted-foreground">{peak.label}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function PurityComparisonBars() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const comparisons = [
    { label: "Verified 97.5%", value: 97.5, trustScore: 95, color: "#22c55e", labStatus: "Accredited third-party lab" },
    { label: "Claimed 99.9%", value: 99.9, trustScore: 25, color: "#ef4444", labStatus: "Unverified / no lab named" },
    { label: "In-House 99.2%", value: 99.2, trustScore: 50, color: "#f59e0b", labStatus: "Seller's own testing" },
  ];

  return (
    <div ref={ref} className="my-6 sm:my-8 not-prose" data-testid="graphic-purity-comparison">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">Purity Number vs. Trustworthiness</h3>
      <Card className="p-4 sm:p-6 border-[#a855f7]/20 bg-[#a855f7]/5">
        <div className="space-y-5">
          {comparisons.map((comp, i) => (
            <motion.div
              key={comp.label}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.2 }}
            >
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <p className="text-sm font-medium">{comp.label}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground">{comp.labStatus}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Reported Purity</p>
                  <div className="h-5 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: comp.color }}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${comp.value}%` } : {}}
                      transition={{ delay: 0.5 + i * 0.2, duration: 1 }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Trust Score</p>
                  <div className="h-5 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: comp.trustScore >= 80 ? "#22c55e" : comp.trustScore >= 40 ? "#f59e0b" : "#ef4444" }}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${comp.trustScore}%` } : {}}
                      transition={{ delay: 0.7 + i * 0.2, duration: 1 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
          className="text-xs text-center text-[#a855f7] mt-4 font-medium"
        >
          A trustworthy 97% beats a suspicious 99.9% every time
        </motion.p>
      </Card>
    </div>
  );
}

export function CostBreakdownChart() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const qualityBreakdown = [
    { label: "Synthesis", percent: 30, color: "#a855f7", icon: FlaskConical },
    { label: "Third-Party Testing", percent: 18, color: "#21d8ff", icon: Microscope },
    { label: "Storage & Cold Chain", percent: 15, color: "#22c55e", icon: Thermometer },
    { label: "Packaging & Labels", percent: 10, color: "#f59e0b", icon: PackageCheck },
    { label: "Support & Ops", percent: 12, color: "#ec4899", icon: HeadphonesIcon },
    { label: "Margin", percent: 15, color: "#64748b", icon: TrendingUp },
  ];

  const budgetBreakdown = [
    { label: "Cheap Synthesis", percent: 45, color: "#a855f7", icon: FlaskConical },
    { label: "No Testing", percent: 0, color: "#ef4444", icon: Scissors },
    { label: "Minimal Storage", percent: 8, color: "#f59e0b", icon: Thermometer },
    { label: "Basic Packaging", percent: 5, color: "#64748b", icon: PackageCheck },
    { label: "No Support", percent: 0, color: "#ef4444", icon: Scissors },
    { label: "Higher Margin", percent: 42, color: "#ef4444", icon: TrendingUp },
  ];

  const DonutChart = ({ data, label, totalPrice }: { data: typeof qualityBreakdown; label: string; totalPrice: string }) => {
    let cumulativePercent = 0;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    return (
      <div className="text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">{label}</p>
        <div className="relative w-40 h-40 mx-auto">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {data.filter(d => d.percent > 0).map((segment, i) => {
              const offset = (cumulativePercent / 100) * circumference;
              const length = (segment.percent / 100) * circumference;
              cumulativePercent += segment.percent;
              return (
                <motion.circle
                  key={i}
                  cx="50" cy="50" r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="12"
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.3 + i * 0.15 }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold font-display">{totalPrice}</span>
          </div>
        </div>
        <div className="mt-4 space-y-1.5 text-left">
          {data.map((segment, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-2"
            >
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: segment.color }} />
              <span className="text-[11px] text-muted-foreground flex-1">{segment.label}</span>
              <span className="text-[11px] font-medium" style={{ color: segment.percent === 0 ? "#ef4444" : undefined }}>
                {segment.percent === 0 ? "Skipped" : `${segment.percent}%`}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} className="my-6 sm:my-8 not-prose" data-testid="graphic-cost-breakdown">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">Where Your Money Goes</h3>
      <Card className="p-4 sm:p-6 border-[#ec4899]/20 bg-[#ec4899]/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <DonutChart data={qualityBreakdown} label="Quality Vendor ($50-70)" totalPrice="~$60" />
          <DonutChart data={budgetBreakdown} label="Budget Vendor ($20-30)" totalPrice="~$25" />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
          className="text-xs text-center text-muted-foreground mt-6 italic"
        >
          The cheapest peptide isn't cheap when research results suffer
        </motion.p>
      </Card>
    </div>
  );
}

export function PriceValueMatrix() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const vendors = [
    { name: "No Documentation", price: 15, docs: 8, color: "#ef4444", size: 12 },
    { name: "In-House Only", price: 30, docs: 30, color: "#f59e0b", size: 12 },
    { name: "Some Third-Party", price: 50, docs: 55, color: "#a855f7", size: 12 },
    { name: "Full Verification", price: 70, docs: 88, color: "#22c55e", size: 14 },
    { name: "Premium (No Extra Value)", price: 95, docs: 60, color: "#f59e0b", size: 12 },
  ];

  const gridLinesH = [25, 50, 75];
  const gridLinesV = [25, 50, 75];
  const priceLabels = ["$20", "$45", "$70", "$95", "$120+"];
  const docLabels = ["Low", "", "Mid", "", "High"];

  return (
    <div ref={ref} className="my-6 sm:my-8 not-prose" data-testid="graphic-price-value">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">Price vs. Documentation Quality</h3>
      <Card className="p-4 sm:p-6 border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 via-transparent to-[#E7FB10]/5">
        <div className="relative" style={{ height: 260 }}>
          <p className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 text-[9px] sm:text-[10px] text-[#21d8ff]/70 font-medium -rotate-90 whitespace-nowrap">Doc Quality</p>

          <div className="absolute top-2 left-8 sm:left-10 right-2 bottom-8">
            <div className="absolute inset-0 border-l-2 border-b-2 border-[#21d8ff]/30 rounded-bl-sm">
              {gridLinesH.map((pos) => (
                <div
                  key={`h-${pos}`}
                  className="absolute left-0 right-0"
                  style={{
                    top: `${100 - pos}%`,
                    borderBottom: "1px dashed rgba(33, 216, 255, 0.12)",
                  }}
                />
              ))}
              {gridLinesV.map((pos) => (
                <div
                  key={`v-${pos}`}
                  className="absolute top-0 bottom-0"
                  style={{
                    left: `${pos}%`,
                    borderLeft: "1px dashed rgba(33, 216, 255, 0.12)",
                  }}
                />
              ))}

              <div
                className="absolute rounded-lg"
                style={{
                  top: 0,
                  right: 0,
                  width: "45%",
                  height: "45%",
                  background: "linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.04))",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                }}
              >
                <p className="text-[9px] sm:text-[10px] font-semibold text-[#22c55e] absolute top-1 right-1 sm:top-2 sm:right-3 tracking-wide">BEST VALUE</p>
              </div>

              <div
                className="absolute rounded-lg"
                style={{
                  bottom: 0,
                  left: 0,
                  width: "35%",
                  height: "40%",
                  background: "linear-gradient(315deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.04))",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                <p className="text-[9px] sm:text-[10px] font-semibold text-[#ef4444] absolute bottom-1 left-1 sm:bottom-2 sm:left-3 tracking-wide">WORST</p>
              </div>

              <div
                className="absolute rounded-lg"
                style={{
                  bottom: 0,
                  right: 0,
                  width: "30%",
                  height: "50%",
                  background: "linear-gradient(225deg, rgba(249, 115, 22, 0.08), rgba(249, 115, 22, 0.02))",
                  border: "1px dashed rgba(249, 115, 22, 0.15)",
                }}
              >
                <p className="text-[9px] sm:text-[10px] font-medium text-[#f97316]/60 absolute bottom-1 right-1 sm:bottom-2 sm:right-3 tracking-wide">OVERPAY</p>
              </div>

              {vendors.map((vendor, i) => {
                const x = (vendor.price / 100) * 100;
                const y = 100 - vendor.docs;
                return (
                  <motion.div
                    key={vendor.name}
                    className="absolute group z-10"
                    style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.5 + i * 0.2, type: "spring" }}
                  >
                    <div
                      className="rounded-full relative"
                      style={{
                        width: vendor.size * 2,
                        height: vendor.size * 2,
                        backgroundColor: `${vendor.color}30`,
                        border: `2px solid ${vendor.color}`,
                        boxShadow: `0 0 12px ${vendor.color}40, 0 0 4px ${vendor.color}20`,
                      }}
                    />
                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-3 whitespace-nowrap bg-background/95 backdrop-blur-sm border border-border rounded-md px-3 py-2 z-20 shadow-lg">
                      <p className="text-[11px] font-semibold" style={{ color: vendor.color }}>{vendor.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">${vendor.price} avg | Documentation: {vendor.docs}%</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {[0, 25, 50, 75, 100].map((pos, i) => (
              <p
                key={`y-${pos}`}
                className="absolute text-[9px] text-muted-foreground"
                style={{ left: -8, top: `${100 - pos}%`, transform: "translateY(-50%) translateX(-100%)" }}
              >
                {docLabels[i]}
              </p>
            ))}

            {[0, 25, 50, 75, 100].map((pos, i) => (
              <p
                key={`x-${pos}`}
                className="absolute text-[9px] text-muted-foreground"
                style={{ left: `${pos}%`, bottom: -20, transform: "translateX(-50%)" }}
              >
                {priceLabels[i]}
              </p>
            ))}
          </div>

          <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] text-[#21d8ff]/70 font-medium">Price Point</p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mt-6 pt-4 border-t border-border/50">
          {vendors.map((vendor, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.5 + i * 0.1 }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: vendor.color,
                  boxShadow: `0 0 6px ${vendor.color}60`,
                }}
              />
              <span className="text-[11px] text-muted-foreground">{vendor.name}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
