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
            { label: "Free Ship", value: "$175+" },
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
              tip: "Orders over $175 ship free!",
            },
            {
              id: 2,
              title: "Order Processing",
              description: "Your order is quality-checked and carefully packaged",
              icon: Package,
              color: "#21d8ff",
              details: ["Quality verification", "Careful packaging", "Cold packs for stability"],
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
};

export function getVisualLesson(lessonId: string): (() => JSX.Element) | null {
  return VISUAL_LESSONS[lessonId] || null;
}
