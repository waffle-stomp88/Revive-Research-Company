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

  const chromatogramPoints = [
    { x: 10, y: 90, label: "Solvent" },
    { x: 25, y: 85, label: "Minor impurity" },
    { x: 40, y: 70, label: "Related peptide" },
    { x: 60, y: 20, label: "Target peptide (98.5%)", isMain: true },
    { x: 80, y: 88, label: "Truncated form" },
  ];

  const pathData = `
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
  `;

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

          <div className="relative bg-background/50 rounded-lg overflow-visible p-4">
            <div className="text-xs text-muted-foreground mb-2">Signal</div>
            
            <svg 
              className="w-full" 
              viewBox="0 0 100 60" 
              preserveAspectRatio="xMidYMid meet"
              style={{ height: "200px" }}
            >
              <defs>
                <linearGradient id="peakGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#21d8ff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#21d8ff" stopOpacity="0" />
                </linearGradient>
                <mask id="waveMask">
                  <motion.rect
                    x="-20"
                    y="0"
                    width="30"
                    height="60"
                    fill="white"
                    animate={{ x: ["-20", "120"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                  />
                </mask>
              </defs>

              <line x1="5" y1="55" x2="95" y2="55" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.3" />
              <line x1="5" y1="55" x2="5" y2="5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.3" />

              <motion.path
                d={`
                  M 5 55
                  Q 9 55 10 50
                  Q 11 55 18 55
                  Q 22 55 24 47
                  Q 26 55 33 55
                  Q 37 55 40 38
                  Q 43 55 48 55
                  Q 53 55 58 12
                  Q 63 55 68 55
                  Q 75 55 78 48
                  Q 81 55 95 55
                `}
                fill="url(#peakGradient)"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 1, delay: 0.5 }}
              />

              <motion.path
                d={`
                  M 5 55
                  Q 9 55 10 50
                  Q 11 55 18 55
                  Q 22 55 24 47
                  Q 26 55 33 55
                  Q 37 55 40 38
                  Q 43 55 48 55
                  Q 53 55 58 12
                  Q 63 55 68 55
                  Q 75 55 78 48
                  Q 81 55 95 55
                `}
                fill="none"
                stroke="#21d8ff"
                strokeWidth="0.8"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : {}}
                transition={{ duration: 2, delay: 0.5 }}
              />

              <path
                d={`
                  M 5 55
                  Q 9 55 10 50
                  Q 11 55 18 55
                  Q 22 55 24 47
                  Q 26 55 33 55
                  Q 37 55 40 38
                  Q 43 55 48 55
                  Q 53 55 58 12
                  Q 63 55 68 55
                  Q 75 55 78 48
                  Q 81 55 95 55
                `}
                fill="none"
                stroke="#21d8ff"
                strokeWidth="0.8"
                mask="url(#waveMask)"
                style={{ filter: "drop-shadow(0 0 2px #21d8ff)" }}
              />

              <motion.circle
                cx="10" cy="50" r="1.5"
                fill="#21d8ff"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.2 }}
              />
              <motion.circle
                cx="24" cy="47" r="1.5"
                fill="#21d8ff"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.35 }}
              />
              <motion.circle
                cx="40" cy="38" r="1.5"
                fill="#21d8ff"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.5 }}
              />
              <motion.circle
                cx="78" cy="48" r="1.5"
                fill="#21d8ff"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.8 }}
              />

              <motion.circle
                cx="58" cy="12" r="2.5"
                fill="#22c55e"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: [1, 1.3, 1] } : {}}
                transition={{ 
                  opacity: { delay: 1.65, duration: 0.3 },
                  scale: { delay: 1.65, duration: 2, repeat: Infinity }
                }}
                style={{ filter: "drop-shadow(0 0 3px #22c55e)" }}
              />

              <motion.g
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.65 }}
              >
                <rect 
                  x="32" y="1" 
                  width="52" height="8" 
                  rx="1.5" 
                  fill="rgba(0,0,0,0.8)" 
                  stroke="#22c55e" 
                  strokeWidth="0.3"
                  strokeOpacity="0.5"
                />
                <text 
                  x="58" y="6.5" 
                  textAnchor="middle" 
                  fill="#22c55e" 
                  fontSize="4" 
                  fontWeight="bold"
                >
                  Target peptide (98.5%)
                </text>
              </motion.g>

              <text x="5" y="59" fill="currentColor" fillOpacity="0.5" fontSize="3">0</text>
              <text x="90" y="59" fill="currentColor" fillOpacity="0.5" fontSize="3">Time →</text>
            </svg>
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
