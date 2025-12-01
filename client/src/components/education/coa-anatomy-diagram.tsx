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
  angle: number;
  details: string[];
}

const coaSections: COASection[] = [
  {
    id: "header",
    title: "Header Information",
    description: "Product identification and lab details",
    icon: Building2,
    color: "#21d8ff",
    angle: 270,
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
    angle: 225,
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
    angle: 315,
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
    angle: 180,
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
    angle: 0,
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
    angle: 135,
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
    angle: 45,
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
    <svg viewBox="0 0 60 120" className="w-16 h-32">
      <defs>
        <linearGradient id="vialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2a2a35" />
          <stop offset="50%" stopColor="#3a3a45" />
          <stop offset="100%" stopColor="#2a2a35" />
        </linearGradient>
        <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E7FB10" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#E7FB10" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="capGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E7FB10" />
          <stop offset="100%" stopColor="#c4d40d" />
        </linearGradient>
      </defs>
      
      <rect x="15" y="0" width="30" height="12" rx="2" fill="url(#capGradient)" />
      <rect x="20" y="10" width="20" height="6" fill="#888" />
      
      <path 
        d="M 12 18 L 12 100 Q 12 115 30 115 Q 48 115 48 100 L 48 18 Z" 
        fill="url(#vialGradient)"
        stroke="#555"
        strokeWidth="1"
      />
      
      <path 
        d="M 14 45 L 14 98 Q 14 112 30 112 Q 46 112 46 98 L 46 45 Z" 
        fill="url(#liquidGradient)"
      />
      
      <text x="30" y="75" textAnchor="middle" fill="#E7FB10" fontSize="7" fontWeight="bold">
        REVIVE
      </text>
      <text x="30" y="85" textAnchor="middle" fill="#888" fontSize="5">
        RESEARCH
      </text>
      
      <motion.ellipse
        cx="30"
        cy="50"
        rx="8"
        ry="2"
        fill="#E7FB10"
        opacity="0.3"
        animate={{ 
          cy: [50, 55, 50],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

export function COAAnatomyDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showRedFlags, setShowRedFlags] = useState(false);

  const radius = 160;
  const centerX = 200;
  const centerY = 180;

  const getPosition = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY + radius * Math.sin(rad)
    };
  };

  const getTooltipPosition = (angle: number) => {
    if (angle >= 45 && angle <= 135) {
      return { horizontal: "center", vertical: "bottom" };
    } else if (angle > 135 && angle < 225) {
      return { horizontal: "right", vertical: "center" };
    } else if (angle >= 225 && angle <= 315) {
      return { horizontal: "center", vertical: "top" };
    } else {
      return { horizontal: "left", vertical: "center" };
    }
  };

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

      <div className="relative max-w-xl mx-auto overflow-visible">
        <div className="relative" style={{ height: "420px" }}>
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            viewBox="0 0 400 360"
            style={{ overflow: "visible" }}
          >
            <defs>
              {coaSections.map((section) => (
                <linearGradient 
                  key={`gradient-${section.id}`} 
                  id={`line-${section.id}`} 
                  x1="0%" 
                  y1="0%" 
                  x2="100%" 
                  y2="0%"
                >
                  <stop offset="0%" stopColor={section.color} stopOpacity="0.1" />
                  <stop offset="100%" stopColor={section.color} stopOpacity="0.8" />
                </linearGradient>
              ))}
            </defs>

            {coaSections.map((section, index) => {
              const pos = getPosition(section.angle);
              const isActive = activeSection === section.id;
              
              return (
                <g key={section.id}>
                  <motion.line
                    x1={centerX}
                    y1={centerY}
                    x2={pos.x}
                    y2={pos.y}
                    stroke={`url(#line-${section.id})`}
                    strokeWidth={isActive ? 3 : 2}
                    strokeDasharray={isActive ? "0" : "4 4"}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={isInView ? { 
                      pathLength: 1, 
                      opacity: isActive ? 1 : 0.6 
                    } : {}}
                    transition={{ 
                      duration: 1, 
                      delay: 0.5 + index * 0.1,
                      ease: "easeOut"
                    }}
                  />
                  
                  {isActive && (
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r="4"
                      fill={section.color}
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </g>
              );
            })}

            <motion.circle
              cx={centerX}
              cy={centerY}
              r="50"
              fill="none"
              stroke="#E7FB10"
              strokeWidth="1"
              strokeOpacity="0.3"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </svg>

          <motion.div 
            className="absolute"
            style={{ 
              left: "50%", 
              top: "50%", 
              transform: "translate(-50%, -50%)"
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <PeptideVial />
          </motion.div>

          {coaSections.map((section, index) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const pos = getPosition(section.angle);
            const tooltipPos = getTooltipPosition(section.angle);
            
            let tooltipClasses = "absolute z-30 w-56";
            let tooltipStyle: React.CSSProperties = {};
            
            if (tooltipPos.horizontal === "left") {
              tooltipClasses += " left-full ml-3";
              tooltipStyle.top = "50%";
              tooltipStyle.transform = "translateY(-50%)";
            } else if (tooltipPos.horizontal === "right") {
              tooltipClasses += " right-full mr-3";
              tooltipStyle.top = "50%";
              tooltipStyle.transform = "translateY(-50%)";
            } else {
              tooltipClasses += " left-1/2";
              tooltipStyle.transform = "translateX(-50%)";
              if (tooltipPos.vertical === "top") {
                tooltipClasses += " bottom-full mb-3";
              } else {
                tooltipClasses += " top-full mt-3";
              }
            }

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.6 + index * 0.1, type: "spring", stiffness: 200 }}
                className="absolute z-10"
                style={{ 
                  left: `${(pos.x / 400) * 100}%`, 
                  top: `${(pos.y / 360) * 100}%`,
                  transform: "translate(-50%, -50%)"
                }}
                onMouseEnter={() => setActiveSection(section.id)}
                onMouseLeave={() => setActiveSection(null)}
                data-testid={`coa-section-${section.id}`}
              >
                <motion.div
                  animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                  className="relative cursor-pointer"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: `${section.color}20`,
                      border: `2px solid ${section.color}`,
                      boxShadow: isActive ? `0 0 25px ${section.color}60` : "none"
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: section.color }} />
                  </div>

                  <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs font-medium text-muted-foreground">
                      {section.title}
                    </span>
                  </div>

                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={tooltipClasses}
                      style={tooltipStyle}
                    >
                      <div 
                        className="bg-background border rounded-lg p-4 shadow-2xl"
                        style={{ borderColor: `${section.color}50` }}
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
                        <ul className="space-y-1.5">
                          {section.details.map((detail, i) => (
                            <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                              <span className="mt-0.5" style={{ color: section.color }}>•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2 }}
          className="mt-8"
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
