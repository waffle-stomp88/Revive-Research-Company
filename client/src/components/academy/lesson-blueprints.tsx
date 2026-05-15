import { FREE_SHIPPING_THRESHOLD } from "@shared/constants";
import {
  Compass,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Scale,
  ShoppingCart,
  FlaskConical,
  Snowflake,
  Thermometer,
  Droplets,
  FileCheck,
  Search,
  Shield,
  ClipboardList,
  Puzzle,
  Wrench,
  Sparkles,
  Award,
  Beaker,
  TestTube,
  Package,
  AlertTriangle,
  CheckCircle2,
  Target,
  TrendingUp,
  Eye,
  Users,
  Globe,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  HeroVisual,
  ProcessStoryboard,
  ConceptInfographic,
  HandsOnLab,
  KnowledgeCheck,
  Callout,
  LessonDivider,
  type StepData,
  type KeyPoint,
  type QuizQuestion,
} from "./lesson-visuals";

function PeptideChainVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const aminoAcids = [
    { letter: "A", name: "Ala", color: "#E7FB10" },
    { letter: "G", name: "Gly", color: "#21d8ff" },
    { letter: "S", name: "Ser", color: "#22c55e" },
    { letter: "T", name: "Thr", color: "#9d4edd" },
    { letter: "Y", name: "Tyr", color: "#f97316" },
  ];

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-1">
        {aminoAcids.map((aa, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: idx * 0.15, type: "spring" }}
            className="flex items-center"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: `${aa.color}30`, color: aa.color, border: `2px solid ${aa.color}` }}
            >
              {aa.letter}
            </div>
            {idx < aminoAcids.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ delay: idx * 0.15 + 0.1 }}
                className="w-4 h-1 bg-white/30"
              />
            )}
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-white/50 text-center">
        Amino acids linked by peptide bonds
      </p>
    </div>
  );
}

function ResearchPurposeVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const purposes = [
    { icon: Beaker, label: "In-vitro studies", color: "#21d8ff" },
    { icon: Target, label: "Mechanism research", color: "#E7FB10" },
    { icon: TrendingUp, label: "Pathway analysis", color: "#22c55e" },
  ];

  return (
    <div ref={ref} className="flex flex-col items-center gap-6">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #E7FB10 0%, #21d8ff 50%, #22c55e 100%)",
          opacity: 0.2,
        }}
      >
        <FlaskConical className="w-12 h-12 text-white" />
      </div>
      <div className="flex gap-4">
        {purposes.map((p, idx) => (
          <motion.div
            key={idx}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: idx * 0.15 }}
            className="flex flex-col items-center gap-2"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${p.color}20` }}
            >
              <p.icon className="w-5 h-5" style={{ color: p.color }} />
            </div>
            <span className="text-xs text-white/60 text-center">{p.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function LegalFrameworkVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        className="flex flex-col items-center gap-4"
      >
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <span className="text-xs text-white/60 text-center">Not FDA Approved</span>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#E7FB10]/10 border border-[#E7FB10]/20"
          >
            <FileCheck className="w-8 h-8 text-[#E7FB10]" />
            <span className="text-xs text-white/60 text-center">RUO Labeled</span>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20"
          >
            <ShieldCheck className="w-8 h-8 text-[#22c55e]" />
            <span className="text-xs text-white/60 text-center">Compliant Supply</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function OrderingJourneyMini() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const steps = [
    { icon: ShoppingCart, label: "Order", color: "#E7FB10" },
    { icon: Package, label: "Ship", color: "#21d8ff" },
    { icon: Eye, label: "Inspect", color: "#22c55e" },
    { icon: Thermometer, label: "Store", color: "#9d4edd" },
  ];

  return (
    <div ref={ref} className="flex items-center justify-center gap-2">
      {steps.map((step, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: idx * 0.15 }}
          className="flex items-center"
        >
          <div
            className="w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1"
            style={{ backgroundColor: `${step.color}15`, border: `1px solid ${step.color}30` }}
          >
            <step.icon className="w-5 h-5" style={{ color: step.color }} />
            <span className="text-[10px] text-white/50">{step.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ delay: idx * 0.15 + 0.1 }}
              className="w-4 h-0.5 bg-white/20"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ========== CORE FOUNDATIONS CUSTOM VISUALS ==========

function PurityScaleVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const grades = [
    { pct: 95, label: "Standard", color: "#f97316" },
    { pct: 98, label: "Research", color: "#E7FB10" },
    { pct: 99, label: "High", color: "#22c55e" },
  ];

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <div className="relative w-full h-4 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: "98%" } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #f97316 0%, #E7FB10 50%, #22c55e 100%)" }}
        />
      </div>
      <div className="flex justify-between w-full">
        {grades.map((g, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 + idx * 0.2 }}
            className="flex flex-col items-center"
          >
            <span className="text-lg font-bold" style={{ color: g.color }}>{g.pct}%</span>
            <span className="text-xs text-white/50">{g.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function LyophilizationProcessVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const stages = [
    { icon: Droplets, label: "Solution", color: "#21d8ff" },
    { icon: Snowflake, label: "Frozen", color: "#60a5fa" },
    { icon: TrendingUp, label: "Vacuum", color: "#E7FB10" },
    { icon: Sparkles, label: "Powder", color: "#22c55e" },
  ];

  return (
    <div ref={ref} className="flex items-center justify-center gap-1">
      {stages.map((stage, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: idx * 0.2, type: "spring" }}
          className="flex items-center"
        >
          <div
            className="w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5"
            style={{ backgroundColor: `${stage.color}20`, border: `1px solid ${stage.color}40` }}
          >
            <stage.icon className="w-5 h-5" style={{ color: stage.color }} />
            <span className="text-[8px] text-white/50">{stage.label}</span>
          </div>
          {idx < stages.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ delay: idx * 0.2 + 0.15 }}
              className="w-3 h-0.5 bg-white/20"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

function StorageConditionsVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <div className="flex gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center p-4 rounded-xl bg-[#21d8ff]/10 border border-[#21d8ff]/20"
        >
          <Snowflake className="w-8 h-8 text-[#21d8ff] mb-2" />
          <span className="text-xl font-bold text-[#21d8ff]">-20°C</span>
          <span className="text-xs text-white/50">Lyophilized</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center p-4 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20"
        >
          <Thermometer className="w-8 h-8 text-[#22c55e] mb-2" />
          <span className="text-xl font-bold text-[#22c55e]">2-8°C</span>
          <span className="text-xs text-white/50">Reconstituted</span>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-2 text-xs text-white/40"
      >
        <Shield className="w-4 h-4" />
        <span>Protect from light & moisture</span>
      </motion.div>
    </div>
  );
}

function ReconstitutionStepsVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex items-center justify-center gap-2">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center"
      >
        <div className="w-10 h-14 rounded-lg bg-[#E7FB10]/20 border border-[#E7FB10]/30 flex items-center justify-center">
          <div className="w-4 h-4 rounded-sm bg-white/30" />
        </div>
        <span className="text-[10px] text-white/50 mt-1">Powder</span>
      </motion.div>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ delay: 0.4 }}
        className="text-white/30 text-lg"
      >
        +
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center"
      >
        <Droplets className="w-8 h-8 text-[#21d8ff]" />
        <span className="text-[10px] text-white/50 mt-1">Solvent</span>
      </motion.div>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ delay: 0.7 }}
        className="text-white/30 text-lg"
      >
        =
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.8 }}
        className="flex flex-col items-center"
      >
        <div className="w-10 h-14 rounded-lg bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center">
          <div className="w-4 h-8 rounded-sm bg-[#22c55e]/40" />
        </div>
        <span className="text-[10px] text-white/50 mt-1">Solution</span>
      </motion.div>
    </div>
  );
}

// ========== RESEARCH SKILLS CUSTOM VISUALS ==========

function COADocumentVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="w-32 p-3 rounded-lg bg-white/5 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-2">
          <FileCheck className="w-4 h-4 text-[#E7FB10]" />
          <span className="text-[10px] font-bold text-white/70">COA</span>
        </div>
        <div className="space-y-1">
          {[
            { label: "Purity", value: "98.7%", color: "#22c55e" },
            { label: "Mass", value: "1024.5", color: "#21d8ff" },
            { label: "Batch", value: "RR-2024", color: "#E7FB10" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="flex justify-between text-[9px]"
            >
              <span className="text-white/40">{item.label}</span>
              <span style={{ color: item.color }}>{item.value}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function LiteratureStackVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative">
        {[0, 1, 2].map((idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20, x: idx * 4 }}
            animate={isInView ? { opacity: 1, y: idx * -4, x: idx * 4 } : {}}
            transition={{ delay: idx * 0.15 }}
            className="absolute w-20 h-6 rounded bg-white/10 border border-white/20"
            style={{ top: idx * 4, left: idx * 4, zIndex: 3 - idx }}
          />
        ))}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="relative z-10 w-20 h-8 rounded bg-[#9d4edd]/20 border border-[#9d4edd]/30 flex items-center justify-center"
        >
          <BookOpen className="w-4 h-4 text-[#9d4edd]" />
        </motion.div>
      </div>
      <span className="text-[10px] text-white/40 mt-6">Research Papers</span>
    </div>
  );
}

function SafetyEquipmentVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const items = [
    { icon: Eye, label: "Goggles", color: "#21d8ff" },
    { icon: Shield, label: "Gloves", color: "#22c55e" },
    { icon: ShieldCheck, label: "Coat", color: "#E7FB10" },
  ];

  return (
    <div ref={ref} className="flex items-center justify-center gap-3">
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: idx * 0.15 }}
          className="flex flex-col items-center gap-1"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}40` }}
          >
            <item.icon className="w-5 h-5" style={{ color: item.color }} />
          </div>
          <span className="text-[9px] text-white/40">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

export const VISUAL_LESSONS: Record<string, () => JSX.Element> = {
  "welcome": function WelcomeLesson() {
    return (
      <>
        <HeroVisual
          title="Welcome to Research"
          subtitle="Begin your journey into peptide research with confidence. This course will transform you from curious beginner to knowledgeable researcher."
          icon={<Compass className="w-10 h-10 text-[#21d8ff]" />}
          color="#21d8ff"
          stats={[
            { label: "Lessons", value: "17" },
            { label: "Modules", value: "4" },
            { label: "XP to Earn", value: "400+" },
          ]}
        />

        <ConceptInfographic
          title="Your Learning Journey"
          subtitle="Progress through structured modules at your own pace"
          keyPoints={[
            {
              icon: Compass,
              title: "Orientation",
              description: "Understand the basics of peptide research and regulations",
              color: "#21d8ff",
            },
            {
              icon: BookOpen,
              title: "Core Foundations",
              description: "Master purity, storage, and reconstitution fundamentals",
              color: "#E7FB10",
            },
            {
              icon: FlaskConical,
              title: "Research Skills",
              description: "Learn to read COAs, review literature, and document properly",
              color: "#9d4edd",
            },
            {
              icon: Award,
              title: "Lab Confidence",
              description: "Put it all together and earn your certification",
              color: "#22c55e",
            },
          ]}
        />

        <Callout type="tip" title="Pro Tip">
          Complete lessons in order to build on your knowledge progressively. Each module unlocks new achievements and XP rewards!
        </Callout>
      </>
    );
  },

  "what-is-peptide": function WhatIsPeptideLesson() {
    return (
      <>
        <HeroVisual
          title="What is a Peptide?"
          subtitle="Discover the fascinating world of peptides — nature's signaling molecules that drive biological processes."
          icon={<Beaker className="w-10 h-10 text-[#E7FB10]" />}
          color="#E7FB10"
          illustration={<PeptideChainVisual />}
        />

        <ConceptInfographic
          title="The Building Blocks of Life"
          visual={<PeptideChainVisual />}
          keyPoints={[
            {
              icon: Target,
              title: "2-50 Amino Acids",
              description: "Peptides are short chains — smaller than proteins but highly active",
              color: "#E7FB10",
            },
            {
              icon: TrendingUp,
              title: "Signaling Molecules",
              description: "They communicate between cells, triggering biological responses",
              color: "#21d8ff",
            },
            {
              icon: Sparkles,
              title: "High Specificity",
              description: "Each peptide targets specific receptors or pathways",
              color: "#22c55e",
            },
          ]}
        />

        <LessonDivider />

        <ProcessStoryboard
          title="Peptide Categories in Research"
          subtitle="Different peptides target different biological systems"
          steps={[
            {
              id: 1,
              title: "Growth Hormone Secretagogues",
              description: "Peptides that influence GH release pathways",
              icon: TrendingUp,
              color: "#E7FB10",
              details: ["GHRH analogs", "Ghrelin mimetics", "Combined approaches"],
            },
            {
              id: 2,
              title: "Metabolic Peptides",
              description: "Target metabolic and energy regulation pathways",
              icon: Beaker,
              color: "#21d8ff",
              details: ["GLP-1 analogs", "Insulin sensitizers", "Appetite modulators"],
            },
            {
              id: 3,
              title: "Tissue Support Peptides",
              description: "Research compounds for tissue and recovery studies",
              icon: Shield,
              color: "#22c55e",
              details: ["BPC sequences", "TB family", "Healing factors"],
            },
          ]}
          layout="horizontal"
        />

        <Callout type="info" title="Key Insight">
          Peptides are not drugs — they are research tools that help scientists understand biological mechanisms and pathways.
        </Callout>
      </>
    );
  },

  "research-only": function ResearchOnlyLesson() {
    return (
      <>
        <HeroVisual
          title="Research Use Only"
          subtitle="Understanding the RUO classification is essential for every researcher. Learn what it means and your responsibilities."
          icon={<ShieldCheck className="w-10 h-10 text-[#22c55e]" />}
          color="#22c55e"
          illustration={<ResearchPurposeVisual />}
        />

        <Callout type="warning" title="Critical Understanding">
          All peptides from Revive Research are classified as Research Use Only (RUO). They are NOT approved for human or animal use.
        </Callout>

        <LessonDivider />

        <ConceptInfographic
          title="What RUO Means"
          subtitle="Research Use Only compounds have specific intended purposes"
          visual={<ResearchPurposeVisual />}
          keyPoints={[
            {
              icon: Beaker,
              title: "Laboratory Research Only",
              description: "Intended exclusively for in-vitro (test tube/cell culture) research",
              color: "#21d8ff",
            },
            {
              icon: AlertTriangle,
              title: "Not For Consumption",
              description: "Never approved for human, animal, or therapeutic use",
              color: "#ef4444",
            },
            {
              icon: FileCheck,
              title: "Documentation Required",
              description: "Proper records of research use must be maintained",
              color: "#E7FB10",
            },
          ]}
        />

        <LessonDivider />

        <HandsOnLab
          title="Researcher Responsibilities"
          sections={[
            {
              title: "Documentation Requirements",
              type: "checklist",
              items: [
                "Maintain detailed research logs",
                "Record compound usage and experiments",
                "Keep purchase records organized",
                "Document all observations and results",
              ],
            },
            {
              title: "Safe Handling Practices",
              type: "safety",
              items: [
                "Use appropriate PPE at all times",
                "Work in proper lab environment",
                "Follow storage requirements strictly",
                "Dispose of materials properly",
              ],
            },
            {
              title: "Compliance Standards",
              type: "checklist",
              items: [
                "Verify local regulations before ordering",
                "Purchase only from verified suppliers",
                "Never misrepresent intended use",
                "Maintain researcher qualifications",
              ],
            },
          ]}
        />
      </>
    );
  },

  "legal-landscape": function LegalLandscapeLesson() {
    return (
      <>
        <HeroVisual
          title="Legal Landscape"
          subtitle="Navigate the regulatory framework for research peptides with confidence. Understanding the rules protects your research."
          icon={<Scale className="w-10 h-10 text-[#9d4edd]" />}
          color="#9d4edd"
          illustration={<LegalFrameworkVisual />}
        />

        <ConceptInfographic
          title="Regulatory Framework"
          subtitle="How research peptides fit into the regulatory landscape"
          visual={<LegalFrameworkVisual />}
          keyPoints={[
            {
              icon: AlertTriangle,
              title: "Not FDA Approved",
              description: "Research peptides are not FDA-approved drugs and cannot be marketed as such",
              color: "#ef4444",
            },
            {
              icon: FileCheck,
              title: "RUO Classification",
              description: "Must be clearly labeled and sold as research chemicals only",
              color: "#E7FB10",
            },
            {
              icon: ShieldCheck,
              title: "Quality Standards",
              description: "Legitimate suppliers maintain strict quality and documentation standards",
              color: "#22c55e",
            },
          ]}
        />

        <LessonDivider />

        <ProcessStoryboard
          title="Compliance Best Practices"
          subtitle="Protect yourself and your research by following these guidelines"
          steps={[
            {
              id: 1,
              title: "Verify Your Supplier",
              description: "Only purchase from reputable sources with third-party testing",
              icon: Search,
              color: "#21d8ff",
              details: ["Check for COA availability", "Verify lab testing claims", "Look for quality certifications"],
            },
            {
              id: 2,
              title: "Maintain Documentation",
              description: "Keep detailed records of all purchases and research use",
              icon: ClipboardList,
              color: "#E7FB10",
              details: ["Save all invoices", "Document batch numbers", "Log research activities"],
            },
            {
              id: 3,
              title: "Know Your Jurisdiction",
              description: "Regulations vary by country — research local requirements",
              icon: Globe,
              color: "#9d4edd",
              details: ["Check import rules", "Verify local restrictions", "Understand classification"],
              tip: "Some countries have specific requirements for research chemical imports",
            },
          ]}
        />

        <Callout type="info" title="International Researchers">
          If you're ordering internationally, check your country's specific import regulations before placing an order. Some jurisdictions may have additional requirements.
        </Callout>
      </>
    );
  },

  "your-first-order": function YourFirstOrderLesson() {
    return (
      <>
        <HeroVisual
          title="Your First Order"
          subtitle="Ready to get started? Here's everything you need to know about ordering, receiving, and preparing your research compounds."
          icon={<ShoppingCart className="w-10 h-10 text-[#f97316]" />}
          color="#f97316"
          illustration={<OrderingJourneyMini />}
          stats={[
            { label: "Processing", value: "24hr" },
            { label: "Free Ship", value: `$${FREE_SHIPPING_THRESHOLD}+` },
          ]}
        />

        <ProcessStoryboard
          title="The Ordering Process"
          subtitle="From click to research-ready in a few simple steps"
          steps={[
            {
              id: 1,
              title: "Place Your Order",
              description: "Select your compounds, verify quantities, and complete checkout",
              icon: ShoppingCart,
              color: "#E7FB10",
              details: ["Choose research compounds", "Select appropriate quantities", "Apply any discount codes"],
              tip: `Orders over $${FREE_SHIPPING_THRESHOLD} ship free!`,
            },
            {
              id: 2,
              title: "Order Processing",
              description: "Your order is quality-checked and carefully packaged",
              icon: Package,
              color: "#21d8ff",
              details: ["Quality verification", "Careful packaging", "Discreet dry packaging"],
            },
            {
              id: 3,
              title: "Delivery & Inspection",
              description: "Receive your package and verify contents immediately",
              icon: Eye,
              color: "#22c55e",
              details: ["Inspect for damage", "Verify all items present", "Check documentation"],
              warning: "Report any issues within 24 hours of delivery",
            },
            {
              id: 4,
              title: "Proper Storage",
              description: "Store compounds according to requirements right away",
              icon: Thermometer,
              color: "#9d4edd",
              details: ["Lyophilized: -20°C or colder", "Protect from light", "Keep sealed until use"],
            },
          ]}
        />

        <LessonDivider />

        <HandsOnLab
          title="First Order Checklist"
          sections={[
            {
              title: "Before You Order",
              type: "checklist",
              items: [
                "Verify you have proper storage (freezer)",
                "Review local regulations",
                "Understand RUO requirements",
                "Have reconstitution supplies ready",
              ],
            },
            {
              title: "Upon Delivery",
              type: "checklist",
              items: [
                "Inspect package for damage",
                "Check items against order",
                "Verify batch numbers match COAs",
                "Store immediately in freezer",
              ],
            },
            {
              title: "Documentation to Keep",
              type: "supplies",
              items: [
                "Order confirmation email",
                "Invoice/receipt",
                "COA documents",
                "Shipping tracking info",
              ],
            },
          ]}
        />

        <Callout type="success" title="You're Ready!">
          Complete this lesson and you'll be prepared to place your first order with confidence. Welcome to the research community!
        </Callout>
      </>
    );
  },

  // ========== CORE FOUNDATIONS MODULE ==========

  "purity-basics": function PurityBasicsLesson() {
    return (
      <>
        <HeroVisual
          title="Understanding Purity"
          subtitle="Learn what purity means for research peptides and why it's the most critical quality indicator you'll evaluate."
          icon={<FlaskConical className="w-10 h-10 text-[#E7FB10]" />}
          color="#E7FB10"
          stats={[
            { label: "Target Purity", value: "98%+" },
            { label: "Testing Method", value: "HPLC" },
          ]}
          illustration={<PurityScaleVisual />}
        />

        <ConceptInfographic
          title="What is Peptide Purity?"
          subtitle="Purity represents the percentage of the intended peptide in your sample"
          keyPoints={[
            {
              icon: Target,
              title: "Target Molecule",
              description: "The specific peptide sequence you ordered, synthesized correctly",
              color: "#22c55e",
            },
            {
              icon: AlertTriangle,
              title: "Impurities",
              description: "Truncated sequences, side products, or synthesis byproducts",
              color: "#ef4444",
            },
            {
              icon: FlaskConical,
              title: "HPLC Analysis",
              description: "High-Performance Liquid Chromatography measures exact purity percentages",
              color: "#21d8ff",
            },
          ]}
        />

        <LessonDivider />

        <ProcessStoryboard
          title="Purity Grades Explained"
          subtitle="Different research applications may require different purity levels"
          steps={[
            {
              id: 1,
              title: "Standard Grade (95-97%)",
              description: "Suitable for preliminary research and screening studies",
              icon: Beaker,
              color: "#f97316",
              details: ["Cost-effective option", "Initial experiments", "Bulk applications"],
            },
            {
              id: 2,
              title: "Research Grade (98-99%)",
              description: "The standard for most in-vitro research applications",
              icon: FlaskConical,
              color: "#E7FB10",
              details: ["Most common choice", "Reliable results", "Recommended starting point"],
              tip: "This is what Revive Research provides as standard",
            },
            {
              id: 3,
              title: "High Purity (99%+)",
              description: "Premium grade for sensitive or quantitative studies",
              icon: Sparkles,
              color: "#22c55e",
              details: ["Sensitive assays", "Quantitative work", "Publication-quality"],
            },
          ]}
          layout="horizontal"
        />

        <Callout type="info" title="Pro Tip">
          Always check the COA (Certificate of Analysis) for the exact purity of your batch. Even within the same product, batch-to-batch variation is normal.
        </Callout>
      </>
    );
  },

  "lyophilization": function LyophilizationLesson() {
    return (
      <>
        <HeroVisual
          title="Lyophilization Explained"
          subtitle="Discover how freeze-drying preserves peptides and why this process is essential for stability and shelf life."
          icon={<Snowflake className="w-10 h-10 text-[#21d8ff]" />}
          color="#21d8ff"
          illustration={<LyophilizationProcessVisual />}
        />

        <ProcessStoryboard
          title="The Freeze-Drying Process"
          subtitle="How lyophilization works to preserve your peptides"
          steps={[
            {
              id: 1,
              title: "Freezing",
              description: "The peptide solution is rapidly frozen to very low temperatures",
              icon: Snowflake,
              color: "#21d8ff",
              details: ["Temperatures below -40°C", "Rapid freezing preserves structure", "Creates ice crystals"],
            },
            {
              id: 2,
              title: "Primary Drying",
              description: "Vacuum applied, ice sublimates directly to vapor (no liquid phase)",
              icon: TrendingUp,
              color: "#E7FB10",
              details: ["Sublimation process", "Low pressure environment", "Removes bulk water"],
            },
            {
              id: 3,
              title: "Secondary Drying",
              description: "Remaining bound water molecules are removed at higher temperature",
              icon: Thermometer,
              color: "#f97316",
              details: ["Removes residual moisture", "Temperature increase", "Final moisture <1%"],
            },
            {
              id: 4,
              title: "Final Product",
              description: "Stable, dry powder ready for long-term storage",
              icon: CheckCircle2,
              color: "#22c55e",
              details: ["Fluffy white powder", "Highly stable", "Easy to reconstitute"],
              tip: "Lyophilized peptides can remain stable for years when stored properly",
            },
          ]}
        />

        <LessonDivider />

        <ConceptInfographic
          title="Why Lyophilization Matters"
          subtitle="Key benefits of freeze-dried peptides"
          keyPoints={[
            {
              icon: Shield,
              title: "Enhanced Stability",
              description: "Removes water that causes degradation and oxidation",
              color: "#22c55e",
            },
            {
              icon: Package,
              title: "Easy Storage",
              description: "Dry powder is easier to store and transport than solutions",
              color: "#21d8ff",
            },
            {
              icon: Thermometer,
              title: "Extended Shelf Life",
              description: "Properly stored lyophilized peptides last much longer",
              color: "#E7FB10",
            },
            {
              icon: Droplets,
              title: "Precise Dosing",
              description: "Reconstitute with exact volumes for accurate concentrations",
              color: "#9d4edd",
            },
          ]}
        />

        <Callout type="warning" title="Important">
          Once reconstituted, the stability advantage of lyophilization is lost. Reconstituted peptides must be stored cold and used within a reasonable timeframe.
        </Callout>
      </>
    );
  },

  "stability": function StabilityLesson() {
    return (
      <>
        <HeroVisual
          title="Storage & Stability"
          subtitle="Master the science of peptide storage to ensure your research compounds maintain their integrity and activity."
          icon={<Thermometer className="w-10 h-10 text-[#9d4edd]" />}
          color="#9d4edd"
          stats={[
            { label: "Lyophilized", value: "-20°C" },
            { label: "Reconstituted", value: "2-8°C" },
          ]}
          illustration={<StorageConditionsVisual />}
        />

        <ConceptInfographic
          title="Degradation Factors"
          subtitle="Understanding what harms peptide stability"
          keyPoints={[
            {
              icon: Thermometer,
              title: "Heat Exposure",
              description: "Elevated temperatures accelerate degradation exponentially",
              color: "#ef4444",
            },
            {
              icon: Eye,
              title: "Light Damage",
              description: "UV and visible light can oxidize amino acids",
              color: "#f97316",
            },
            {
              icon: Droplets,
              title: "Moisture",
              description: "Water enables chemical reactions that break peptide bonds",
              color: "#21d8ff",
            },
            {
              icon: AlertTriangle,
              title: "Freeze-Thaw Cycles",
              description: "Repeated freezing and thawing damages peptide structure",
              color: "#E7FB10",
            },
          ]}
        />

        <LessonDivider />

        <HandsOnLab
          title="Storage Best Practices"
          sections={[
            {
              title: "Lyophilized (Unreconstituted) Peptides",
              type: "checklist",
              items: [
                "Store at -20°C or colder (freezer)",
                "Keep in original sealed vial until use",
                "Protect from light — store in dark location",
                "Allow to reach room temp before opening (prevents condensation)",
                "Can be stable for 2+ years when properly stored",
              ],
            },
            {
              title: "Reconstituted Peptides",
              type: "safety",
              items: [
                "Store at 2-8°C (refrigerator) for short-term use",
                "For longer storage, aliquot and freeze at -20°C",
                "Avoid repeated freeze-thaw cycles",
                "Use within recommended timeframe (usually 2-4 weeks refrigerated)",
                "Consider bacteriostatic water for multi-dose usage",
              ],
            },
            {
              title: "Warning Signs of Degradation",
              type: "supplies",
              items: [
                "Color change (should be white/off-white)",
                "Clumping or unusual texture",
                "Difficulty dissolving during reconstitution",
                "Cloudy solution after reconstitution",
              ],
            },
          ]}
        />

        <Callout type="tip" title="Storage Tip">
          Consider creating aliquots (smaller portions) when you reconstitute. This way you only thaw what you need and avoid multiple freeze-thaw cycles on your main stock.
        </Callout>
      </>
    );
  },

  "reconstitution": function ReconstitutionLesson() {
    return (
      <>
        <HeroVisual
          title="Reconstitution Mastery"
          subtitle="Learn the proper techniques to dissolve lyophilized peptides and prepare research solutions with accuracy."
          icon={<Droplets className="w-10 h-10 text-[#22c55e]" />}
          color="#22c55e"
          stats={[
            { label: "Common Solvent", value: "BAC Water" },
            { label: "Technique", value: "Gentle" },
          ]}
          illustration={<ReconstitutionStepsVisual />}
        />

        <ProcessStoryboard
          title="Step-by-Step Reconstitution"
          subtitle="Follow these steps for proper peptide preparation"
          steps={[
            {
              id: 1,
              title: "Gather Supplies",
              description: "Prepare your workspace with all necessary materials",
              icon: FlaskConical,
              color: "#21d8ff",
              details: ["Bacteriostatic water or sterile water", "Alcohol swabs", "Sterile syringes", "Clean workspace"],
            },
            {
              id: 2,
              title: "Calculate Volume",
              description: "Determine how much solvent to add for desired concentration",
              icon: Target,
              color: "#E7FB10",
              details: ["Check peptide amount (mg)", "Decide target concentration", "Use reconstitution calculator"],
              tip: "Common concentration: 2mg/mL (add 5mL to a 10mg vial)",
            },
            {
              id: 3,
              title: "Add Solvent Gently",
              description: "Inject solvent along the vial wall, not directly on powder",
              icon: Droplets,
              color: "#22c55e",
              details: ["Aim at glass wall", "Let liquid run down", "Never spray directly on peptide"],
              warning: "Direct injection on powder can damage the peptide structure",
            },
            {
              id: 4,
              title: "Dissolve Carefully",
              description: "Allow peptide to dissolve naturally without aggressive shaking",
              icon: Eye,
              color: "#9d4edd",
              details: ["Gentle swirling motion", "Let sit if needed", "Solution should be clear"],
              tip: "Most peptides dissolve within minutes — be patient",
            },
          ]}
        />

        <LessonDivider />

        <ConceptInfographic
          title="Choosing Your Solvent"
          subtitle="Different solvents for different research needs"
          keyPoints={[
            {
              icon: Droplets,
              title: "Bacteriostatic Water",
              description: "Contains 0.9% benzyl alcohol as preservative. Best for multi-dose use.",
              color: "#22c55e",
            },
            {
              icon: FlaskConical,
              title: "Sterile Water",
              description: "Pure water without preservatives. Use for single-dose applications.",
              color: "#21d8ff",
            },
            {
              icon: Beaker,
              title: "Acetic Acid (0.6%)",
              description: "Helps dissolve peptides that are difficult to reconstitute in water.",
              color: "#E7FB10",
            },
          ]}
        />

        <HandsOnLab
          title="Reconstitution Checklist"
          sections={[
            {
              title: "Before You Start",
              type: "checklist",
              items: [
                "Remove vial from freezer, let reach room temperature (15-30 min)",
                "Calculate required solvent volume",
                "Clean work surface with alcohol",
                "Wash hands or wear gloves",
              ],
            },
            {
              title: "During Reconstitution",
              type: "checklist",
              items: [
                "Swab vial stopper with alcohol",
                "Draw calculated volume of solvent",
                "Insert needle at angle, inject along wall",
                "Swirl gently — do NOT shake",
                "Wait for complete dissolution",
              ],
            },
            {
              title: "After Reconstitution",
              type: "supplies",
              items: [
                "Label vial with date and concentration",
                "Store immediately in refrigerator",
                "Record in research log",
                "Dispose of sharps properly",
              ],
            },
          ]}
        />

        <Callout type="success" title="You Did It!">
          Proper reconstitution is a foundational skill. Master this and you're well on your way to conducting quality research!
        </Callout>
      </>
    );
  },

  // ========== RESEARCH SKILLS MODULE ==========

  "reading-coas": function ReadingCOAsLesson() {
    return (
      <>
        <HeroVisual
          title="Reading COAs"
          subtitle="Master the art of interpreting Certificates of Analysis — your key to verifying peptide quality and authenticity."
          icon={<FileCheck className="w-10 h-10 text-[#E7FB10]" />}
          color="#E7FB10"
          stats={[
            { label: "Key Sections", value: "5" },
            { label: "Critical Data", value: "Purity %" },
          ]}
          illustration={<COADocumentVisual />}
        />

        <ProcessStoryboard
          title="COA Anatomy"
          subtitle="Understanding each section of a Certificate of Analysis"
          steps={[
            {
              id: 1,
              title: "Product Identification",
              description: "Verify the peptide name, sequence, and batch number match your order",
              icon: Target,
              color: "#21d8ff",
              details: ["Peptide name", "Amino acid sequence", "Batch/Lot number", "Manufacturing date"],
            },
            {
              id: 2,
              title: "HPLC Purity Results",
              description: "The main indicator of peptide quality — look for 98%+ purity",
              icon: FlaskConical,
              color: "#E7FB10",
              details: ["Purity percentage", "Peak analysis", "Retention time", "Method specifications"],
              tip: "HPLC (High-Performance Liquid Chromatography) separates and quantifies compounds",
            },
            {
              id: 3,
              title: "Mass Spectrometry",
              description: "Confirms molecular identity by measuring molecular weight",
              icon: Search,
              color: "#9d4edd",
              details: ["Observed mass", "Theoretical mass", "Mass deviation", "Should match within 0.1%"],
            },
            {
              id: 4,
              title: "Physical Properties",
              description: "Appearance and solubility characteristics",
              icon: Eye,
              color: "#22c55e",
              details: ["Appearance (white powder)", "Solubility notes", "pH if applicable"],
            },
            {
              id: 5,
              title: "Testing Laboratory",
              description: "Third-party verification adds credibility",
              icon: ShieldCheck,
              color: "#f97316",
              details: ["Lab name", "Accreditations", "Test date", "Analyst signature"],
              tip: "Revive Research uses independent third-party labs for all testing",
            },
          ]}
        />

        <Callout type="info" title="Red Flags to Watch For">
          Be cautious of COAs missing batch numbers, showing purity below 95%, having no lab identification, or with dates far from your purchase date.
        </Callout>
      </>
    );
  },

  "literature-review": function LiteratureReviewLesson() {
    return (
      <>
        <HeroVisual
          title="Literature Review"
          subtitle="Learn how to find, evaluate, and understand scientific literature related to your research compounds."
          icon={<BookOpen className="w-10 h-10 text-[#9d4edd]" />}
          color="#9d4edd"
          illustration={<LiteratureStackVisual />}
        />

        <ConceptInfographic
          title="Research Resources"
          subtitle="Where to find reliable scientific information"
          keyPoints={[
            {
              icon: Search,
              title: "PubMed",
              description: "The gold standard for biomedical literature. Free access to millions of research papers.",
              color: "#21d8ff",
            },
            {
              icon: Globe,
              title: "Google Scholar",
              description: "Broad academic search engine that indexes journals, theses, and conference papers.",
              color: "#E7FB10",
            },
            {
              icon: BookOpen,
              title: "Review Articles",
              description: "Comprehensive summaries of research topics — great starting points for new compounds.",
              color: "#22c55e",
            },
            {
              icon: Users,
              title: "Research Forums",
              description: "Community discussions can provide practical insights, but verify claims independently.",
              color: "#f97316",
            },
          ]}
        />

        <LessonDivider />

        <HandsOnLab
          title="Research Checklist"
          sections={[
            {
              title: "Finding Quality Sources",
              type: "checklist",
              items: [
                "Start with PubMed or Google Scholar",
                "Look for peer-reviewed journals",
                "Check publication dates (recent = relevant)",
                "Prefer primary research over blogs",
              ],
            },
            {
              title: "Evaluating Sources",
              type: "checklist",
              items: [
                "Is it published in a reputable journal?",
                "Are the authors affiliated with research institutions?",
                "Is the methodology described clearly?",
                "Are conclusions supported by data?",
              ],
            },
          ]}
        />

        <Callout type="tip" title="Pro Tip">
          Keep a research journal. Document the papers you read, key findings, and how they relate to your research goals.
        </Callout>
      </>
    );
  },

  "lab-safety": function LabSafetyLesson() {
    return (
      <>
        <HeroVisual
          title="Lab Safety Essentials"
          subtitle="Protect yourself and maintain a safe research environment with proper safety protocols and equipment."
          icon={<Shield className="w-10 h-10 text-[#ef4444]" />}
          color="#ef4444"
          illustration={<SafetyEquipmentVisual />}
        />

        <HandsOnLab
          title="Personal Protective Equipment (PPE)"
          sections={[
            {
              title: "Always Required",
              type: "safety",
              items: [
                "Nitrile or latex gloves",
                "Safety glasses or goggles",
                "Lab coat or protective clothing",
                "Closed-toe shoes",
              ],
            },
            {
              title: "Recommended Additions",
              type: "supplies",
              items: [
                "Face mask when working with powders",
                "Hair tie for long hair",
                "First aid kit nearby",
                "Eyewash station access",
              ],
            },
          ]}
        />

        <LessonDivider />

        <ProcessStoryboard
          title="Safe Handling Procedures"
          subtitle="Follow these protocols every time you work"
          steps={[
            {
              id: 1,
              title: "Prepare Your Space",
              description: "Clean, organized workspace reduces accidents",
              icon: FlaskConical,
              color: "#21d8ff",
              details: ["Wipe surfaces with alcohol", "Remove clutter", "Ensure good ventilation", "Have all materials ready"],
            },
            {
              id: 2,
              title: "Handle With Care",
              description: "Treat all research compounds as potentially hazardous",
              icon: AlertTriangle,
              color: "#E7FB10",
              details: ["Never taste or inhale", "Avoid skin contact", "Work in well-lit area", "Stay focused — no distractions"],
            },
            {
              id: 3,
              title: "Proper Disposal",
              description: "Dispose of materials according to local regulations",
              icon: Shield,
              color: "#22c55e",
              details: ["Sharps in puncture-resistant containers", "Chemical waste properly labeled", "Follow local disposal guidelines"],
            },
          ]}
        />

        <Callout type="warning" title="Emergency Response">
          Know your emergency procedures. If a spill or exposure occurs, clean the affected area with soap and water, and seek medical attention if symptoms develop.
        </Callout>
      </>
    );
  },

  "documentation": function DocumentationLesson() {
    return (
      <>
        <HeroVisual
          title="Research Documentation"
          subtitle="Learn professional documentation practices to maintain accurate records and support reproducible research."
          icon={<ClipboardList className="w-10 h-10 text-[#21d8ff]" />}
          color="#21d8ff"
          stats={[
            { label: "Key Records", value: "4" },
            { label: "Best Practice", value: "Daily Log" },
          ]}
        />

        <ConceptInfographic
          title="What to Document"
          subtitle="Essential records every researcher should maintain"
          keyPoints={[
            {
              icon: Package,
              title: "Inventory Records",
              description: "Track all compounds: batch numbers, quantities, storage locations, expiration dates",
              color: "#E7FB10",
            },
            {
              icon: FlaskConical,
              title: "Experiment Logs",
              description: "Date, time, procedures followed, observations, and results for each session",
              color: "#21d8ff",
            },
            {
              icon: Thermometer,
              title: "Storage Conditions",
              description: "Temperature logs, freeze-thaw records, reconstitution dates",
              color: "#9d4edd",
            },
            {
              icon: FileCheck,
              title: "COA Archive",
              description: "Keep all Certificates of Analysis organized by batch number",
              color: "#22c55e",
            },
          ]}
        />

        <LessonDivider />

        <HandsOnLab
          title="Documentation Best Practices"
          sections={[
            {
              title: "Daily Log Entries",
              type: "checklist",
              items: [
                "Date and time of work session",
                "Compounds used (with batch numbers)",
                "Procedures performed",
                "Any deviations from protocol",
                "Observations and results",
              ],
            },
            {
              title: "Record Organization",
              type: "supplies",
              items: [
                "Use bound notebooks (not loose paper)",
                "Never erase — cross out mistakes",
                "Include page numbers",
                "Back up digital records regularly",
              ],
            },
          ]}
        />

        <Callout type="success" title="Why It Matters">
          Good documentation protects you legally, helps troubleshoot problems, and ensures your research can be reproduced and verified.
        </Callout>
      </>
    );
  },

  // ========== LAB CONFIDENCE MODULE ==========

  "putting-together": function PuttingTogetherLesson() {
    return (
      <>
        <HeroVisual
          title="Putting It All Together"
          subtitle="Combine everything you've learned into a complete research workflow from order to documentation."
          icon={<Puzzle className="w-10 h-10 text-[#22c55e]" />}
          color="#22c55e"
          stats={[
            { label: "Steps", value: "6" },
            { label: "Skill Level", value: "Ready!" },
          ]}
        />

        <ProcessStoryboard
          title="Complete Research Workflow"
          subtitle="Your end-to-end process for peptide research"
          steps={[
            {
              id: 1,
              title: "Research & Plan",
              description: "Study literature, define objectives, prepare protocols",
              icon: BookOpen,
              color: "#9d4edd",
              details: ["Review relevant papers", "Define research questions", "Write detailed protocol"],
            },
            {
              id: 2,
              title: "Order & Verify",
              description: "Place order, verify COA, inspect upon delivery",
              icon: ShoppingCart,
              color: "#E7FB10",
              details: ["Check purity on COA", "Verify batch numbers", "Inspect packaging"],
            },
            {
              id: 3,
              title: "Store Properly",
              description: "Immediate proper storage preserves compound integrity",
              icon: Thermometer,
              color: "#21d8ff",
              details: ["Freezer for lyophilized", "Refrigerator for reconstituted", "Protect from light"],
            },
            {
              id: 4,
              title: "Prepare & Reconstitute",
              description: "Follow proper technique for solution preparation",
              icon: Droplets,
              color: "#22c55e",
              details: ["Calculate concentration", "Use proper solvent", "Gentle technique"],
            },
            {
              id: 5,
              title: "Conduct Research",
              description: "Execute your protocol with careful observation",
              icon: FlaskConical,
              color: "#f97316",
              details: ["Follow safety protocols", "Make careful observations", "Note any deviations"],
            },
            {
              id: 6,
              title: "Document Everything",
              description: "Record all details for reproducibility",
              icon: ClipboardList,
              color: "#9d4edd",
              details: ["Log all activities", "Save COAs", "Archive results"],
            },
          ]}
        />

        <Callout type="tip" title="Success Mindset">
          Treat every research session as if it needs to be reproducible by someone else. This mindset drives quality and attention to detail.
        </Callout>
      </>
    );
  },

  "troubleshooting": function TroubleshootingLesson() {
    return (
      <>
        <HeroVisual
          title="Troubleshooting Guide"
          subtitle="Learn to identify, diagnose, and solve common issues that arise during peptide research."
          icon={<Wrench className="w-10 h-10 text-[#f97316]" />}
          color="#f97316"
        />

        <ConceptInfographic
          title="Common Issues & Solutions"
          subtitle="Quick reference for frequent problems"
          keyPoints={[
            {
              icon: Droplets,
              title: "Won't Dissolve",
              description: "Try gentle warming, different solvent (acetic acid), or longer wait time. Never shake vigorously.",
              color: "#21d8ff",
            },
            {
              icon: Eye,
              title: "Cloudy Solution",
              description: "May indicate aggregation or contamination. Try filtering or reconstituting fresh vial.",
              color: "#E7FB10",
            },
            {
              icon: AlertTriangle,
              title: "Unexpected Results",
              description: "Check storage conditions, verify concentration calculations, review COA for purity.",
              color: "#ef4444",
            },
            {
              icon: Thermometer,
              title: "Degradation Signs",
              description: "Color change, clumping, or odor indicates degradation. Dispose and use fresh compound.",
              color: "#9d4edd",
            },
          ]}
        />

        <LessonDivider />

        <HandsOnLab
          title="Troubleshooting Checklist"
          sections={[
            {
              title: "Before Panicking",
              type: "checklist",
              items: [
                "Verify you're using the correct compound",
                "Check concentration calculations",
                "Review storage history",
                "Confirm reconstitution was done correctly",
              ],
            },
            {
              title: "When to Start Fresh",
              type: "safety",
              items: [
                "Visible contamination or particles",
                "Significant color change",
                "Multiple freeze-thaw cycles",
                "Expired or unknown storage history",
              ],
            },
          ]}
        />

        <Callout type="info" title="Remember">
          When in doubt, reach out. Our support team is here to help troubleshoot issues and ensure your research success.
        </Callout>
      </>
    );
  },

  "advanced-tips": function AdvancedTipsLesson() {
    return (
      <>
        <HeroVisual
          title="Advanced Research Tips"
          subtitle="Level up your research with professional techniques and optimization strategies."
          icon={<Sparkles className="w-10 h-10 text-[#E7FB10]" />}
          color="#E7FB10"
          stats={[
            { label: "Pro Tips", value: "8+" },
            { label: "Level", value: "Advanced" },
          ]}
        />

        <ConceptInfographic
          title="Optimization Strategies"
          subtitle="Take your research to the next level"
          keyPoints={[
            {
              icon: FlaskConical,
              title: "Aliquoting",
              description: "Divide reconstituted peptides into single-use portions to minimize freeze-thaw damage.",
              color: "#22c55e",
            },
            {
              icon: Thermometer,
              title: "Temperature Control",
              description: "Invest in a reliable thermometer and monitor storage temperatures regularly.",
              color: "#21d8ff",
            },
            {
              icon: FileCheck,
              title: "Batch Tracking",
              description: "Keep detailed records of which batch you use for each experiment for reproducibility.",
              color: "#E7FB10",
            },
            {
              icon: Shield,
              title: "Contamination Prevention",
              description: "Use fresh needles for each withdrawal. Never touch the stopper with ungloved hands.",
              color: "#9d4edd",
            },
          ]}
        />

        <LessonDivider />

        <HandsOnLab
          title="Pro Techniques"
          sections={[
            {
              title: "Maximize Stability",
              type: "checklist",
              items: [
                "Use bacteriostatic water for multi-use",
                "Create single-dose aliquots",
                "Label everything with dates",
                "Keep backup stock in deep freeze",
              ],
            },
            {
              title: "Improve Accuracy",
              type: "supplies",
              items: [
                "Invest in quality insulin syringes",
                "Use a reconstitution calculator",
                "Verify concentrations with test runs",
                "Maintain consistent technique",
              ],
            },
          ]}
        />

        <Callout type="success" title="You're Almost There!">
          Complete the final lesson to earn your Research Academy certification!
        </Callout>
      </>
    );
  },

  "certification": function CertificationLesson() {
    return (
      <>
        <HeroVisual
          title="Certification Complete!"
          subtitle="Congratulations! You've mastered the fundamentals of peptide research. Here's your summary and next steps."
          icon={<Award className="w-10 h-10 text-[#22c55e]" />}
          color="#22c55e"
          stats={[
            { label: "Modules", value: "4" },
            { label: "Lessons", value: "17" },
            { label: "Status", value: "Certified!" },
          ]}
        />

        <ConceptInfographic
          title="What You've Learned"
          subtitle="Your complete knowledge foundation"
          keyPoints={[
            {
              icon: Compass,
              title: "Orientation",
              description: "Understanding peptides, RUO regulations, legal compliance, and ordering",
              color: "#21d8ff",
            },
            {
              icon: BookOpen,
              title: "Core Foundations",
              description: "Purity, lyophilization, storage, stability, and reconstitution",
              color: "#E7FB10",
            },
            {
              icon: FlaskConical,
              title: "Research Skills",
              description: "Reading COAs, literature review, lab safety, and documentation",
              color: "#9d4edd",
            },
            {
              icon: Award,
              title: "Lab Confidence",
              description: "Complete workflows, troubleshooting, and advanced techniques",
              color: "#22c55e",
            },
          ]}
        />

        <LessonDivider />

        <HandsOnLab
          title="Your Next Steps"
          sections={[
            {
              title: "Immediate Actions",
              type: "checklist",
              items: [
                "Set up your research workspace",
                "Review your storage equipment",
                "Create your documentation system",
                "Plan your first research protocol",
              ],
            },
            {
              title: "Ongoing Development",
              type: "supplies",
              items: [
                "Stay updated on new research",
                "Join research communities",
                "Refine your techniques over time",
                "Share knowledge with fellow researchers",
              ],
            },
          ]}
        />

        <Callout type="success" title="Welcome to the Research Community!">
          You're now equipped with the knowledge to conduct safe, compliant, and effective peptide research. Start your journey with confidence!
        </Callout>
      </>
    );
  },
};

export function getVisualLesson(lessonId: string): (() => JSX.Element) | null {
  return VISUAL_LESSONS[lessonId] || null;
}
