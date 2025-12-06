import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Info, TrendingUp, Droplets, Zap, CheckCircle2 } from "lucide-react";

interface PurityGrade {
  name: string;
  percentage: string;
  color: string;
  use: string;
}

const purityGrades: PurityGrade[] = [
  { name: "Research Grade", percentage: ">95%", color: "#f97316", use: "General research" },
  { name: "High Purity", percentage: ">98%", color: "#21d8ff", use: "Sensitive assays" },
  { name: "Ultra Pure", percentage: ">99%", color: "#22c55e", use: "In vivo studies" },
];

export function HPLCExplainer() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [showDetails, setShowDetails] = useState(false);

  const chromatogramPoints = [
    { x: 10, y: 90, label: "Solvent" },
    { x: 25, y: 85, label: "Minor impurity" },
    { x: 40, y: 70, label: "Related peptide" },
    { x: 60, y: 15, label: "Target peptide (98.5%)", isMain: true },
    { x: 80, y: 88, label: "Truncated form" },
  ];

  return (
    <div ref={ref} className="py-8" data-testid="hplc-explainer">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <h3 className="text-xl font-bold text-foreground mb-2">
          How HPLC Measures Purity
        </h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          High-Performance Liquid Chromatography separates peptides by their properties. 
          The largest peak represents your target peptide.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative bg-card border rounded-xl p-6"
          style={{ borderColor: "rgba(33, 216, 255, 0.2)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="h-4 w-4 text-[#21d8ff]" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              HPLC Chromatogram
            </span>
          </div>

          <div className="relative w-full" style={{ paddingBottom: "66.67%" }}>
            <div className="absolute inset-0 bg-background/50 rounded-lg overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-px bg-muted-foreground/30" />
              <div className="absolute bottom-0 left-0 top-0 w-px bg-muted-foreground/30" />
              
              <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">0</div>
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">Time →</div>
              <div className="absolute top-2 left-2 text-xs font-semibold text-muted-foreground">Signal</div>

              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="peakGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#21d8ff" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#21d8ff" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#21d8ff" stopOpacity="0" />
                    <stop offset="50%" stopColor="#21d8ff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#21d8ff" stopOpacity="0" />
                  </linearGradient>
                  <mask id="waveMask">
                    <motion.rect
                      x="-20"
                      y="0"
                      width="30"
                      height="100"
                      fill="white"
                      animate={{ x: ["-20", "120"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                    />
                  </mask>
                </defs>

                <motion.path
                  d={`
                    M 0 95
                    Q 8 95 10 ${chromatogramPoints[0].y}
                    Q 12 95 20 95
                    Q 23 95 25 ${chromatogramPoints[1].y}
                    Q 27 95 35 95
                    Q 38 95 40 ${chromatogramPoints[2].y}
                    Q 42 95 50 95
                    Q 55 95 60 ${chromatogramPoints[3].y}
                    Q 65 95 70 95
                    Q 78 95 80 ${chromatogramPoints[4].y}
                    Q 82 95 100 95
                  `}
                  fill="url(#peakGradient)"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ duration: 1, delay: 0.5 }}
                />

                <motion.path
                  d={`
                    M 0 95
                    Q 8 95 10 ${chromatogramPoints[0].y}
                    Q 12 95 20 95
                    Q 23 95 25 ${chromatogramPoints[1].y}
                    Q 27 95 35 95
                    Q 38 95 40 ${chromatogramPoints[2].y}
                    Q 42 95 50 95
                    Q 55 95 60 ${chromatogramPoints[3].y}
                    Q 65 95 70 95
                    Q 78 95 80 ${chromatogramPoints[4].y}
                    Q 82 95 100 95
                  `}
                  fill="none"
                  stroke="#21d8ff"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { pathLength: 1 } : {}}
                  transition={{ duration: 2, delay: 0.5 }}
                />

                <path
                  d={`
                    M 0 95
                    Q 8 95 10 ${chromatogramPoints[0].y}
                    Q 12 95 20 95
                    Q 23 95 25 ${chromatogramPoints[1].y}
                    Q 27 95 35 95
                    Q 38 95 40 ${chromatogramPoints[2].y}
                    Q 42 95 50 95
                    Q 55 95 60 ${chromatogramPoints[3].y}
                    Q 65 95 70 95
                    Q 78 95 80 ${chromatogramPoints[4].y}
                    Q 82 95 100 95
                  `}
                  fill="none"
                  stroke="#21d8ff"
                  strokeWidth="1.5"
                  mask="url(#waveMask)"
                  style={{ filter: "drop-shadow(0 0 4px #21d8ff)" }}
                />
              </svg>

              {chromatogramPoints.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 1 + i * 0.15 }}
                  className="absolute"
                  style={{ 
                    left: `${point.x}%`, 
                    top: `${point.y}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                >
                  {point.isMain ? (
                    <div className="relative flex flex-col items-center">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-4 h-4 rounded-full bg-[#22c55e] shadow-lg"
                        style={{ boxShadow: "0 0 12px #22c55e, 0 0 24px #22c55e50" }}
                      />
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <span className="text-xs font-bold text-[#22c55e] bg-background/95 px-2 py-1 rounded border border-[#22c55e]/30">
                          {point.label}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#21d8ff] shadow-md" style={{ boxShadow: "0 0 6px #21d8ff, 0 0 12px #21d8ff40" }} />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.5 }}
            className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
              <span>Target peptide (main peak)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#21d8ff]" />
              <span>Impurities (minor peaks)</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-6"
        >
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#21d8ff]" />
            Purity Grades Explained
          </h4>
          
          <div className="grid gap-3">
            {purityGrades.map((grade, i) => (
              <motion.div
                key={grade.name}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 1.2 + i * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-card/50 border"
                style={{ borderColor: `${grade.color}30` }}
              >
                <div 
                  className="w-16 h-2 rounded-full relative overflow-hidden bg-muted/30"
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: grade.color }}
                    initial={{ width: "0%" }}
                    animate={isInView ? { width: grade.percentage.replace(">", "") } : {}}
                    transition={{ duration: 1, delay: 1.5 + i * 0.2 }}
                  />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-sm" style={{ color: grade.color }}>
                    {grade.name}
                  </span>
                  <span className="text-muted-foreground text-sm ml-2">
                    ({grade.percentage})
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {grade.use}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.8 }}
          className="mt-6 p-4 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20"
        >
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-[#21d8ff] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">Key insight:</strong> The main peak's area 
              divided by total peak area gives the purity percentage. A 98.5% purity means 
              98.5% of the sample is your target peptide.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function PurityComparisonChart() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div ref={ref} className="py-4" data-testid="purity-comparison-chart">
      <div className="flex items-center justify-around gap-4">
        {purityGrades.map((grade, i) => (
          <motion.div
            key={grade.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: i * 0.15 }}
            className="text-center"
          >
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/30"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke={grade.color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${parseFloat(grade.percentage.replace(">", "")) * 1.76} 176`}
                  initial={{ strokeDashoffset: 176 }}
                  animate={isInView ? { strokeDashoffset: 0 } : {}}
                  transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold" style={{ color: grade.color }}>
                  {grade.percentage}
                </span>
              </div>
            </div>
            <div className="text-xs font-medium text-foreground">{grade.name}</div>
            <div className="text-xs text-muted-foreground">{grade.use}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
