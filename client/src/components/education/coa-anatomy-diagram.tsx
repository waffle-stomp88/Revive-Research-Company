import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  FileCheck, 
  Fingerprint, 
  TestTube2, 
  Scale, 
  Shield, 
  Calendar,
  Building2,
  Hash,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface COASection {
  id: string;
  title: string;
  description: string;
  icon: typeof FileCheck;
  color: string;
  position: { top: string; left: string };
  details: string[];
}

const coaSections: COASection[] = [
  {
    id: "header",
    title: "Header Information",
    description: "Product identification and lab details",
    icon: Building2,
    color: "#21d8ff",
    position: { top: "5%", left: "50%" },
    details: [
      "Laboratory name & accreditation",
      "Product name & catalog number",
      "Date of analysis"
    ]
  },
  {
    id: "batch",
    title: "Batch/Lot Number",
    description: "Unique identifier for traceability",
    icon: Hash,
    color: "#E7FB10",
    position: { top: "20%", left: "15%" },
    details: [
      "Must match your vial label",
      "Links to production records",
      "Essential for quality verification"
    ]
  },
  {
    id: "identity",
    title: "Identity (Mass Spec)",
    description: "Confirms molecular structure",
    icon: Fingerprint,
    color: "#9d4edd",
    position: { top: "20%", left: "85%" },
    details: [
      "Expected vs observed MW",
      "Should match within ±0.5 Da",
      "Confirms correct peptide"
    ]
  },
  {
    id: "purity",
    title: "Purity (HPLC)",
    description: "Percentage of target peptide",
    icon: TestTube2,
    color: "#21d8ff",
    position: { top: "45%", left: "15%" },
    details: [
      "Target: 98%+ for most peptides",
      "Main peak percentage",
      "Related impurities listed"
    ]
  },
  {
    id: "endotoxin",
    title: "Endotoxin (LAL)",
    description: "Bacterial contamination check",
    icon: Shield,
    color: "#ec4899",
    position: { top: "45%", left: "85%" },
    details: [
      "Measures bacterial endotoxin",
      "Critical for biological assays",
      "Typically <0.5 EU/mg"
    ]
  },
  {
    id: "content",
    title: "Peptide Content",
    description: "Net peptide percentage",
    icon: Scale,
    color: "#f97316",
    position: { top: "70%", left: "15%" },
    details: [
      "Accounts for salt & moisture",
      "Important for accurate dosing",
      "Typically 80-90%"
    ]
  },
  {
    id: "results",
    title: "Results Summary",
    description: "Pass/Fail for all specifications",
    icon: CheckCircle2,
    color: "#22c55e",
    position: { top: "70%", left: "85%" },
    details: [
      "All specs should show 'Pass'",
      "Specification vs actual result",
      "Overall quality determination"
    ]
  }
];

const redFlags = [
  "No batch number or mismatched batch",
  "Generic/recycled COA (not batch-specific)",
  "Missing laboratory information",
  "Purity below 95%",
  "Outdated testing (6+ months old)"
];

export function COAAnatomyDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showRedFlags, setShowRedFlags] = useState(false);

  return (
    <div ref={ref} className="py-8" data-testid="coa-anatomy-diagram">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h3 className="text-xl font-bold text-foreground mb-2">
          Anatomy of a Certificate of Analysis
        </h3>
        <p className="text-sm text-muted-foreground">
          Hover over each section to learn what to look for
        </p>
      </motion.div>

      <div className="relative max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative bg-card border rounded-xl p-6 min-h-[400px]"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <div 
            className="absolute inset-4 rounded-lg border-2 border-dashed"
            style={{ borderColor: "rgba(33, 216, 255, 0.2)" }}
          >
            <div className="absolute top-2 left-4 text-xs text-muted-foreground/50 uppercase tracking-wider">
              Certificate of Analysis
            </div>
          </div>

          {coaSections.map((section, index) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 200 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ top: section.position.top, left: section.position.left }}
                onMouseEnter={() => setActiveSection(section.id)}
                onMouseLeave={() => setActiveSection(null)}
                data-testid={`coa-section-${section.id}`}
              >
                <motion.div
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  className="relative cursor-pointer"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: `${section.color}20`,
                      border: `2px solid ${section.color}`,
                      boxShadow: isActive ? `0 0 20px ${section.color}40` : "none"
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: section.color }} />
                  </div>

                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-20 w-64"
                    >
                      <div 
                        className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-xl"
                        style={{ borderColor: `${section.color}40` }}
                      >
                        <h4 
                          className="font-bold text-sm mb-1"
                          style={{ color: section.color }}
                        >
                          {section.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3">
                          {section.description}
                        </p>
                        <ul className="space-y-1">
                          {section.details.map((detail, i) => (
                            <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                              <span style={{ color: section.color }}>•</span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs font-medium text-muted-foreground">
                    {section.title}
                  </span>
                </div>
              </motion.div>
            );
          })}

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2 }}
          className="mt-6"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowRedFlags(!showRedFlags);
            }}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-red-950/30 border border-red-500/30 text-red-400 hover:bg-red-950/50 transition-colors"
            data-testid="button-toggle-red-flags"
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {showRedFlags ? "Hide" : "Show"} Red Flags to Watch For
            </span>
          </button>

          {showRedFlags && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 p-4 rounded-lg bg-red-950/20 border border-red-500/20"
            >
              <div className="grid gap-2">
                {redFlags.map((flag, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 text-sm text-red-300"
                  >
                    <AlertTriangle className="h-3 w-3 text-red-400 flex-shrink-0" />
                    {flag}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export function COAAnatomyCompact() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4" data-testid="coa-anatomy-compact">
      {coaSections.slice(0, 4).map((section) => {
        const Icon = section.icon;
        return (
          <div
            key={section.id}
            className="flex items-center gap-2 p-3 rounded-lg bg-card/50 border"
            style={{ borderColor: `${section.color}30` }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${section.color}20` }}
            >
              <Icon className="h-4 w-4" style={{ color: section.color }} />
            </div>
            <div>
              <div className="text-xs font-medium text-foreground">{section.title}</div>
              <div className="text-xs text-muted-foreground truncate">{section.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
