import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  FileCheck, 
  Fingerprint, 
  TestTube2, 
  Scale, 
  Shield, 
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
  details: string[];
}

const coaSections: COASection[] = [
  {
    id: "header",
    title: "Header Information",
    description: "Product identification and lab details",
    icon: Building2,
    color: "#21d8ff",
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

function PeptideVial() {
  return (
    <svg viewBox="0 0 80 140" className="w-24 h-44">
      <defs>
        <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1a1a20" />
          <stop offset="15%" stopColor="#2a2a35" />
          <stop offset="50%" stopColor="#3a3a48" />
          <stop offset="85%" stopColor="#2a2a35" />
          <stop offset="100%" stopColor="#1a1a20" />
        </linearGradient>
        <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E7FB10" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#d4e50e" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#c4d40d" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="capGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E7FB10" />
          <stop offset="50%" stopColor="#d4e50e" />
          <stop offset="100%" stopColor="#a8b80a" />
        </linearGradient>
        <linearGradient id="rubberGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#555" />
          <stop offset="50%" stopColor="#444" />
          <stop offset="100%" stopColor="#333" />
        </linearGradient>
        <linearGradient id="neckGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1a1a20" />
          <stop offset="50%" stopColor="#2a2a35" />
          <stop offset="100%" stopColor="#1a1a20" />
        </linearGradient>
        <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="30%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      
      <ellipse cx="40" cy="6" rx="12" ry="4" fill="url(#capGradient)" />
      <rect x="28" y="4" width="24" height="10" fill="url(#capGradient)" />
      <ellipse cx="40" cy="14" rx="12" ry="3" fill="#a8b80a" />
      
      <rect x="30" y="14" width="20" height="10" fill="url(#rubberGradient)" />
      <ellipse cx="40" cy="24" rx="10" ry="2" fill="#333" />
      
      <rect x="32" y="24" width="16" height="8" fill="url(#neckGradient)" />
      <ellipse cx="40" cy="32" rx="8" ry="2" fill="#2a2a35" />
      
      <path 
        d="M 32 32 
           L 20 45 
           L 20 120 
           Q 20 130 40 130 
           Q 60 130 60 120 
           L 60 45 
           L 48 32 Z" 
        fill="url(#glassGradient)"
        stroke="#555"
        strokeWidth="0.5"
      />
      
      <path 
        d="M 22 55 
           L 22 118 
           Q 22 128 40 128 
           Q 58 128 58 118 
           L 58 55 Z" 
        fill="url(#liquidGradient)"
      />
      
      <path 
        d="M 32 32 
           L 20 45 
           L 20 120 
           Q 20 130 40 130 
           Q 60 130 60 120 
           L 60 45 
           L 48 32 Z" 
        fill="url(#glassShine)"
      />
      
      <rect x="24" y="72" width="32" height="28" rx="2" fill="currentColor" fillOpacity="0.9" />
      
      <text x="40" y="84" textAnchor="middle" fill="#1a1a1f" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
        REVIVE
      </text>
      <text x="40" y="93" textAnchor="middle" fill="#666" fontSize="5" fontFamily="sans-serif">
        RESEARCH
      </text>
      
      <motion.ellipse
        cx="40"
        cy="58"
        rx="16"
        ry="3"
        fill="#E7FB10"
        opacity="0.4"
        animate={{ 
          ry: [3, 4, 3],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

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

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-3">
            {coaSections.slice(0, 3).map((section, index) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="relative"
                  onMouseEnter={() => setActiveSection(section.id)}
                  onMouseLeave={() => setActiveSection(null)}
                  data-testid={`coa-section-${section.id}`}
                >
                  <div
                    className={`p-4 rounded-xl border transition-all duration-300 ${isActive ? 'shadow-lg' : ''}`}
                    style={{
                      backgroundColor: isActive ? `${section.color}10` : 'transparent',
                      borderColor: isActive ? section.color : `${section.color}30`,
                      boxShadow: isActive ? `0 0 20px ${section.color}20` : 'none'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${section.color}20` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: section.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground">
                          {section.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {section.description}
                        </p>
                        
                        {isActive && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2 space-y-1 overflow-hidden"
                          >
                            {section.details.map((detail, i) => (
                              <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                                <span className="mt-0.5" style={{ color: section.color }}>•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(231, 251, 16, 0.1)',
                    '0 0 40px rgba(231, 251, 16, 0.2)',
                    '0 0 20px rgba(231, 251, 16, 0.1)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="rounded-full p-4"
              >
                <PeptideVial />
              </motion.div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs text-muted-foreground">Your Peptide Vial</span>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {coaSections.slice(3).map((section, index) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="relative"
                  onMouseEnter={() => setActiveSection(section.id)}
                  onMouseLeave={() => setActiveSection(null)}
                  data-testid={`coa-section-${section.id}`}
                >
                  <div
                    className={`p-4 rounded-xl border transition-all duration-300 ${isActive ? 'shadow-lg' : ''}`}
                    style={{
                      backgroundColor: isActive ? `${section.color}10` : 'transparent',
                      borderColor: isActive ? section.color : `${section.color}30`,
                      boxShadow: isActive ? `0 0 20px ${section.color}20` : 'none'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${section.color}20` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: section.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground">
                          {section.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {section.description}
                        </p>
                        
                        {isActive && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2 space-y-1 overflow-hidden"
                          >
                            {section.details.map((detail, i) => (
                              <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                                <span className="mt-0.5" style={{ color: section.color }}>•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1 }}
          className="mt-10"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowRedFlags(!showRedFlags);
            }}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-red-950/30 border border-red-500/30 text-red-400 hover:bg-red-950/50 transition-colors cursor-pointer"
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
              className="mt-4 p-4 rounded-lg bg-red-950/20 border border-red-500/20 max-w-md mx-auto"
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
