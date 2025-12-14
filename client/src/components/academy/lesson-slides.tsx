import { motion } from "framer-motion";
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
  Lightbulb,
  Lock,
  Users,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Slide {
  title: string;
  content: React.ReactNode;
}

function SlideHero({ 
  icon: Icon, 
  title, 
  subtitle, 
  color 
}: { 
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; 
  title: string; 
  subtitle: string; 
  color: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
        style={{ backgroundColor: `${color}20`, border: `2px solid ${color}40` }}
      >
        <Icon className="w-12 h-12" style={{ color }} />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold text-white mb-4"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/70 text-lg max-w-md"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}

function SlideInfoCard({ 
  items, 
  title 
}: { 
  items: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; title: string; description: string; color: string }[];
  title?: string;
}) {
  return (
    <div className="w-full">
      {title && (
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-semibold text-white mb-6 text-center"
        >
          {title}
        </motion.h3>
      )}
      <div className="grid gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <Icon className="w-6 h-6" style={{ color: item.color }} />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                <p className="text-sm text-white/60">{item.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SlideCallout({ 
  type, 
  title, 
  children 
}: { 
  type: "tip" | "warning" | "info"; 
  title: string; 
  children: React.ReactNode;
}) {
  const styles = {
    tip: { color: "#22c55e", icon: Lightbulb, bg: "#22c55e" },
    warning: { color: "#f97316", icon: AlertTriangle, bg: "#f97316" },
    info: { color: "#21d8ff", icon: BookOpen, bg: "#21d8ff" },
  };
  const { color, icon: Icon, bg } = styles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl border"
      style={{ backgroundColor: `${bg}10`, borderColor: `${bg}30` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-5 h-5" style={{ color }} />
        <span className="font-semibold text-white">{title}</span>
      </div>
      <p className="text-white/70">{children}</p>
    </motion.div>
  );
}

function SlideVisual({ children, caption }: { children: React.ReactNode; caption?: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-2xl bg-white/5 border border-white/10"
      >
        {children}
      </motion.div>
      {caption && (
        <p className="mt-4 text-sm text-white/50 text-center">{caption}</p>
      )}
    </div>
  );
}

function PeptideChainVisual() {
  const aminoAcids = [
    { letter: "A", name: "Ala", color: "#E7FB10" },
    { letter: "G", name: "Gly", color: "#21d8ff" },
    { letter: "S", name: "Ser", color: "#22c55e" },
    { letter: "T", name: "Thr", color: "#9d4edd" },
    { letter: "Y", name: "Tyr", color: "#f97316" },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-1">
        {aminoAcids.map((aa, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
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
                animate={{ scaleX: 1 }}
                transition={{ delay: idx * 0.15 + 0.1 }}
                className="w-4 h-1 bg-white/30"
              />
            )}
          </motion.div>
        ))}
      </div>
      <p className="text-sm text-white/50">Amino acids linked by peptide bonds</p>
    </div>
  );
}

function PurityScaleVisual() {
  const grades = [
    { pct: 95, label: "Standard", color: "#f97316" },
    { pct: 98, label: "Research", color: "#E7FB10" },
    { pct: 99, label: "High", color: "#22c55e" },
  ];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="relative w-full h-4 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "98%" }}
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
            animate={{ opacity: 1, y: 0 }}
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

function StorageVisual() {
  return (
    <div className="flex gap-6 justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center p-5 rounded-xl bg-[#21d8ff]/10 border border-[#21d8ff]/20"
      >
        <Snowflake className="w-10 h-10 text-[#21d8ff] mb-2" />
        <span className="text-2xl font-bold text-[#21d8ff]">-20°C</span>
        <span className="text-xs text-white/50 mt-1">Lyophilized</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col items-center p-5 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20"
      >
        <Thermometer className="w-10 h-10 text-[#22c55e] mb-2" />
        <span className="text-2xl font-bold text-[#22c55e]">2-8°C</span>
        <span className="text-xs text-white/50 mt-1">Reconstituted</span>
      </motion.div>
    </div>
  );
}

function COAVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-48 p-4 rounded-xl bg-white/5 border border-white/10"
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
        <FileCheck className="w-5 h-5 text-[#E7FB10]" />
        <span className="text-sm font-bold text-white">Certificate of Analysis</span>
      </div>
      <div className="space-y-2">
        {[
          { label: "Purity", value: "98.7%", color: "#22c55e" },
          { label: "Mass", value: "1024.5 Da", color: "#21d8ff" },
          { label: "Batch", value: "RR-2024-001", color: "#E7FB10" },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
            className="flex justify-between text-sm"
          >
            <span className="text-white/40">{item.label}</span>
            <span style={{ color: item.color }}>{item.value}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function LyophilizationVisual() {
  const stages = [
    { icon: Droplets, label: "Solution", color: "#21d8ff" },
    { icon: Snowflake, label: "Frozen", color: "#60a5fa" },
    { icon: TrendingUp, label: "Vacuum", color: "#E7FB10" },
    { icon: Sparkles, label: "Powder", color: "#22c55e" },
  ];

  return (
    <div className="flex items-center justify-center gap-2">
      {stages.map((stage, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: idx * 0.2, type: "spring" }}
          className="flex items-center"
        >
          <div
            className="w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1"
            style={{ backgroundColor: `${stage.color}20`, border: `1px solid ${stage.color}40` }}
          >
            <stage.icon className="w-6 h-6" style={{ color: stage.color }} />
            <span className="text-[9px] text-white/50">{stage.label}</span>
          </div>
          {idx < stages.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: idx * 0.2 + 0.15 }}
              className="w-4 h-0.5 bg-white/20"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

function SafetyEquipmentVisual() {
  const items = [
    { icon: Eye, label: "Safety Goggles", color: "#21d8ff" },
    { icon: Shield, label: "Lab Gloves", color: "#22c55e" },
    { icon: ShieldCheck, label: "Lab Coat", color: "#E7FB10" },
  ];

  return (
    <div className="flex items-center justify-center gap-4">
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.15 }}
          className="flex flex-col items-center gap-2"
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}40` }}
          >
            <item.icon className="w-7 h-7" style={{ color: item.color }} />
          </div>
          <span className="text-xs text-white/50">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

export const LESSON_SLIDES: Record<string, Slide[]> = {
  "welcome": [
    {
      title: "Welcome",
      content: (
        <SlideHero
          icon={Compass}
          title="Welcome to Peptide Academy"
          subtitle="Your journey to becoming a knowledgeable peptide researcher starts here."
          color="#21d8ff"
        />
      ),
    },
    {
      title: "What You'll Learn",
      content: (
        <SlideInfoCard
          title="Your Learning Journey"
          items={[
            { icon: Compass, title: "Orientation", description: "Understand the basics of peptide research", color: "#21d8ff" },
            { icon: BookOpen, title: "Core Foundations", description: "Master purity, storage, and handling", color: "#E7FB10" },
            { icon: FlaskConical, title: "Research Skills", description: "Learn to read COAs and document properly", color: "#9d4edd" },
            { icon: Award, title: "Lab Confidence", description: "Put it all together and get certified", color: "#22c55e" },
          ]}
        />
      ),
    },
    {
      title: "Ready to Start",
      content: (
        <SlideCallout type="tip" title="Pro Tip">
          Complete lessons in order to build your knowledge progressively. Each module unlocks achievements and XP rewards!
        </SlideCallout>
      ),
    },
  ],

  "what-is-peptide": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Beaker}
          title="What is a Peptide?"
          subtitle="Discover the fascinating world of peptides — nature's signaling molecules."
          color="#E7FB10"
        />
      ),
    },
    {
      title: "Peptide Structure",
      content: (
        <SlideVisual caption="Amino acids linked together form a peptide chain">
          <PeptideChainVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Key Characteristics",
      content: (
        <SlideInfoCard
          title="The Building Blocks of Life"
          items={[
            { icon: Target, title: "2-50 Amino Acids", description: "Short chains that are smaller than proteins but highly active", color: "#E7FB10" },
            { icon: TrendingUp, title: "Signaling Molecules", description: "They communicate between cells, triggering biological responses", color: "#21d8ff" },
            { icon: Sparkles, title: "High Specificity", description: "Each peptide targets specific receptors or pathways", color: "#22c55e" },
          ]}
        />
      ),
    },
    {
      title: "Key Insight",
      content: (
        <SlideCallout type="info" title="Remember">
          Peptides are research tools that help scientists understand biological mechanisms and pathways — they are not drugs.
        </SlideCallout>
      ),
    },
  ],

  "research-only": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={ShieldCheck}
          title="Research Use Only"
          subtitle="Understanding the RUO classification is essential for every researcher."
          color="#22c55e"
        />
      ),
    },
    {
      title: "Critical Warning",
      content: (
        <SlideCallout type="warning" title="Important">
          All peptides from Revive Research are classified as Research Use Only (RUO). They are NOT approved for human or animal use.
        </SlideCallout>
      ),
    },
    {
      title: "What RUO Means",
      content: (
        <SlideInfoCard
          title="RUO Classification"
          items={[
            { icon: Beaker, title: "Laboratory Research Only", description: "Intended exclusively for in-vitro research", color: "#21d8ff" },
            { icon: AlertTriangle, title: "Not For Consumption", description: "Never approved for human or animal use", color: "#ef4444" },
            { icon: FileCheck, title: "Proper Labeling Required", description: "All products must be clearly labeled RUO", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "Your Responsibility",
      content: (
        <SlideCallout type="info" title="Researcher Responsibility">
          As a researcher, you are responsible for ensuring proper use, storage, and documentation of all RUO compounds.
        </SlideCallout>
      ),
    },
  ],

  "legal-landscape": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Scale}
          title="Legal Landscape"
          subtitle="Navigate the regulatory framework for peptide research compounds."
          color="#9d4edd"
        />
      ),
    },
    {
      title: "Regulatory Framework",
      content: (
        <SlideInfoCard
          title="Key Regulations"
          items={[
            { icon: AlertTriangle, title: "Not FDA Approved", description: "Research peptides are not evaluated by the FDA", color: "#ef4444" },
            { icon: FileCheck, title: "RUO Labeled", description: "All compounds must carry Research Use Only labels", color: "#E7FB10" },
            { icon: ShieldCheck, title: "Compliant Supply", description: "Source from vendors who follow regulations", color: "#22c55e" },
          ]}
        />
      ),
    },
    {
      title: "Stay Compliant",
      content: (
        <SlideCallout type="warning" title="Legal Compliance">
          Always ensure your research activities comply with local, state, and federal regulations. Documentation is key.
        </SlideCallout>
      ),
    },
  ],

  "your-first-order": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={ShoppingCart}
          title="Your First Order"
          subtitle="Learn what to expect when ordering research peptides."
          color="#21d8ff"
        />
      ),
    },
    {
      title: "Order Process",
      content: (
        <SlideInfoCard
          title="Step-by-Step"
          items={[
            { icon: ShoppingCart, title: "Place Order", description: "Select products and complete checkout", color: "#E7FB10" },
            { icon: Package, title: "Shipping", description: "Temperature-controlled shipping to preserve quality", color: "#21d8ff" },
            { icon: Eye, title: "Inspect Package", description: "Check for damage and verify contents", color: "#22c55e" },
            { icon: Thermometer, title: "Proper Storage", description: "Store immediately at recommended temperature", color: "#9d4edd" },
          ]}
        />
      ),
    },
    {
      title: "Pro Tip",
      content: (
        <SlideCallout type="tip" title="Best Practice">
          Always verify your COA (Certificate of Analysis) matches your order and store products immediately upon arrival.
        </SlideCallout>
      ),
    },
  ],

  "purity-basics": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={FlaskConical}
          title="Purity Basics"
          subtitle="Understanding peptide purity and why it matters for research."
          color="#E7FB10"
        />
      ),
    },
    {
      title: "Purity Scale",
      content: (
        <SlideVisual caption="Different purity grades for different research needs">
          <PurityScaleVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Why Purity Matters",
      content: (
        <SlideInfoCard
          title="Research Impact"
          items={[
            { icon: Target, title: "Accurate Results", description: "Higher purity means more reliable experimental data", color: "#22c55e" },
            { icon: FlaskConical, title: "Reduced Variables", description: "Fewer impurities means fewer confounding factors", color: "#21d8ff" },
            { icon: FileCheck, title: "Reproducibility", description: "Consistent purity enables reproducible research", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "Key Takeaway",
      content: (
        <SlideCallout type="info" title="Remember">
          For most research applications, 98%+ purity is recommended. Always check your COA for exact purity levels.
        </SlideCallout>
      ),
    },
  ],

  "lyophilization": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Snowflake}
          title="Lyophilization"
          subtitle="The freeze-drying process that preserves peptide stability."
          color="#21d8ff"
        />
      ),
    },
    {
      title: "The Process",
      content: (
        <SlideVisual caption="From solution to stable powder">
          <LyophilizationVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Benefits",
      content: (
        <SlideInfoCard
          title="Why Lyophilize?"
          items={[
            { icon: Thermometer, title: "Extended Shelf Life", description: "Lyophilized peptides remain stable for years", color: "#22c55e" },
            { icon: Package, title: "Easy Storage", description: "Dry powder is easier to store and ship", color: "#21d8ff" },
            { icon: Sparkles, title: "Preserved Activity", description: "Maintains biological activity until reconstitution", color: "#E7FB10" },
          ]}
        />
      ),
    },
  ],

  "stability": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Thermometer}
          title="Peptide Stability"
          subtitle="Proper storage ensures your peptides remain active and effective."
          color="#22c55e"
        />
      ),
    },
    {
      title: "Storage Conditions",
      content: (
        <SlideVisual caption="Optimal storage temperatures">
          <StorageVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Best Practices",
      content: (
        <SlideInfoCard
          items={[
            { icon: Snowflake, title: "Keep Cold", description: "Store lyophilized at -20°C, reconstituted at 2-8°C", color: "#21d8ff" },
            { icon: Shield, title: "Protect from Light", description: "UV exposure degrades peptides quickly", color: "#E7FB10" },
            { icon: Lock, title: "Avoid Freeze-Thaw", description: "Repeated cycles damage peptide structure", color: "#ef4444" },
          ]}
        />
      ),
    },
  ],

  "reconstitution": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Droplets}
          title="Reconstitution"
          subtitle="Learn to properly dissolve lyophilized peptides for research use."
          color="#21d8ff"
        />
      ),
    },
    {
      title: "Steps",
      content: (
        <SlideInfoCard
          title="Reconstitution Process"
          items={[
            { icon: FlaskConical, title: "Choose Solvent", description: "Typically bacteriostatic water or sterile saline", color: "#21d8ff" },
            { icon: Droplets, title: "Add Slowly", description: "Let solvent run down the vial side gently", color: "#22c55e" },
            { icon: Sparkles, title: "Swirl Gently", description: "Never shake — this can denature the peptide", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "Warning",
      content: (
        <SlideCallout type="warning" title="Important">
          Never shake the vial vigorously. Gentle swirling preserves peptide integrity. Once reconstituted, refrigerate immediately.
        </SlideCallout>
      ),
    },
  ],

  "reading-coas": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={FileCheck}
          title="Reading COAs"
          subtitle="Master the art of interpreting Certificates of Analysis."
          color="#E7FB10"
        />
      ),
    },
    {
      title: "COA Example",
      content: (
        <SlideVisual caption="Key data points on a Certificate of Analysis">
          <COAVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Key Metrics",
      content: (
        <SlideInfoCard
          title="What to Look For"
          items={[
            { icon: Target, title: "Purity Percentage", description: "Should match or exceed stated product purity", color: "#22c55e" },
            { icon: FlaskConical, title: "Molecular Mass", description: "Confirms correct peptide identity", color: "#21d8ff" },
            { icon: FileCheck, title: "Batch Number", description: "For traceability and documentation", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "Pro Tip",
      content: (
        <SlideCallout type="tip" title="Best Practice">
          Always request and verify the COA before using any research peptide. Keep COAs on file for your research records.
        </SlideCallout>
      ),
    },
  ],

  "literature-review": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Search}
          title="Literature Review"
          subtitle="How to find and evaluate peptide research publications."
          color="#9d4edd"
        />
      ),
    },
    {
      title: "Resources",
      content: (
        <SlideInfoCard
          title="Where to Search"
          items={[
            { icon: Globe, title: "PubMed", description: "Primary database for biomedical literature", color: "#21d8ff" },
            { icon: BookOpen, title: "Google Scholar", description: "Broad academic search across disciplines", color: "#E7FB10" },
            { icon: Users, title: "Research Forums", description: "Community discussions and shared experiences", color: "#9d4edd" },
          ]}
        />
      ),
    },
    {
      title: "Evaluation",
      content: (
        <SlideCallout type="info" title="Critical Reading">
          Always evaluate study methodology, sample sizes, and peer-review status. Not all published research is equal quality.
        </SlideCallout>
      ),
    },
  ],

  "lab-safety": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Shield}
          title="Lab Safety"
          subtitle="Essential safety practices for peptide research."
          color="#22c55e"
        />
      ),
    },
    {
      title: "Equipment",
      content: (
        <SlideVisual caption="Essential personal protective equipment">
          <SafetyEquipmentVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Safety Rules",
      content: (
        <SlideInfoCard
          items={[
            { icon: Eye, title: "Eye Protection", description: "Always wear safety goggles when handling", color: "#21d8ff" },
            { icon: Shield, title: "Gloves Required", description: "Use nitrile gloves to prevent contamination", color: "#22c55e" },
            { icon: ClipboardList, title: "Document Everything", description: "Log all activities for safety records", color: "#E7FB10" },
          ]}
        />
      ),
    },
  ],

  "documentation": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={ClipboardList}
          title="Documentation"
          subtitle="Proper record-keeping for research integrity."
          color="#E7FB10"
        />
      ),
    },
    {
      title: "What to Record",
      content: (
        <SlideInfoCard
          title="Essential Records"
          items={[
            { icon: Package, title: "Product Details", description: "Batch numbers, COAs, purchase dates", color: "#21d8ff" },
            { icon: Thermometer, title: "Storage Logs", description: "Temperature records and storage conditions", color: "#22c55e" },
            { icon: FlaskConical, title: "Usage Records", description: "When and how compounds were used", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "Best Practice",
      content: (
        <SlideCallout type="tip" title="Organization">
          Keep a dedicated lab notebook or digital log. Good documentation supports reproducibility and compliance.
        </SlideCallout>
      ),
    },
  ],

  "putting-together": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Puzzle}
          title="Putting It All Together"
          subtitle="Apply your knowledge in a complete research workflow."
          color="#22c55e"
        />
      ),
    },
    {
      title: "Workflow",
      content: (
        <SlideInfoCard
          title="Complete Research Flow"
          items={[
            { icon: ShoppingCart, title: "1. Order & Receive", description: "Select products, verify COAs on arrival", color: "#E7FB10" },
            { icon: Thermometer, title: "2. Store Properly", description: "Immediate storage at correct temperature", color: "#21d8ff" },
            { icon: Droplets, title: "3. Reconstitute", description: "Prepare for use with proper technique", color: "#22c55e" },
            { icon: ClipboardList, title: "4. Document", description: "Record all activities thoroughly", color: "#9d4edd" },
          ]}
        />
      ),
    },
    {
      title: "Success",
      content: (
        <SlideCallout type="tip" title="You're Ready">
          You now have the knowledge foundation to conduct peptide research properly and safely.
        </SlideCallout>
      ),
    },
  ],

  "troubleshooting": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Wrench}
          title="Troubleshooting"
          subtitle="Common issues and how to resolve them."
          color="#f97316"
        />
      ),
    },
    {
      title: "Common Issues",
      content: (
        <SlideInfoCard
          title="Problem Solving"
          items={[
            { icon: Droplets, title: "Won't Dissolve", description: "Try gentle warming or different solvent pH", color: "#21d8ff" },
            { icon: Eye, title: "Cloudy Solution", description: "May indicate precipitation — check pH and concentration", color: "#f97316" },
            { icon: Sparkles, title: "Unexpected Results", description: "Verify purity, storage history, and technique", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "When in Doubt",
      content: (
        <SlideCallout type="warning" title="Contact Support">
          If you encounter persistent issues, reach out to your supplier's technical support team for guidance.
        </SlideCallout>
      ),
    },
  ],

  "advanced-tips": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Sparkles}
          title="Advanced Tips"
          subtitle="Expert techniques for experienced researchers."
          color="#9d4edd"
        />
      ),
    },
    {
      title: "Pro Techniques",
      content: (
        <SlideInfoCard
          title="Expert Tips"
          items={[
            { icon: Snowflake, title: "Aliquoting", description: "Divide into single-use portions to prevent freeze-thaw", color: "#21d8ff" },
            { icon: Shield, title: "Inert Atmosphere", description: "Use nitrogen to displace oxygen in storage vials", color: "#22c55e" },
            { icon: FileCheck, title: "Batch Testing", description: "Validate each batch before full use", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "Optimization",
      content: (
        <SlideCallout type="info" title="Continuous Improvement">
          Keep detailed notes on what works best. Your experience becomes valuable institutional knowledge.
        </SlideCallout>
      ),
    },
  ],

  "certification": [
    {
      title: "Congratulations!",
      content: (
        <SlideHero
          icon={Award}
          title="Course Complete!"
          subtitle="You've mastered the fundamentals of peptide research."
          color="#22c55e"
        />
      ),
    },
    {
      title: "What You've Learned",
      content: (
        <SlideInfoCard
          title="Your Achievements"
          items={[
            { icon: Compass, title: "Research Fundamentals", description: "RUO classification and legal compliance", color: "#21d8ff" },
            { icon: FlaskConical, title: "Technical Skills", description: "Storage, reconstitution, and handling", color: "#E7FB10" },
            { icon: FileCheck, title: "Documentation", description: "COA interpretation and record-keeping", color: "#9d4edd" },
            { icon: Shield, title: "Safety Protocols", description: "Lab safety and best practices", color: "#22c55e" },
          ]}
        />
      ),
    },
    {
      title: "Next Steps",
      content: (
        <SlideCallout type="tip" title="Keep Learning">
          Continue exploring our education center for in-depth articles and stay updated on the latest research techniques.
        </SlideCallout>
      ),
    },
  ],
};

export function getLessonSlides(lessonId: string): Slide[] | null {
  return LESSON_SLIDES[lessonId] || null;
}
