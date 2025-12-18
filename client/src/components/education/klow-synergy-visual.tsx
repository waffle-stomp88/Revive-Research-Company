import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Shield, Zap, Activity, Heart } from "lucide-react";

function KLOWSynergyAnimation({ isInView, activationLevel }: { isInView: boolean; activationLevel: number }) {
  return (
    <div className="relative w-full flex flex-col items-center justify-center overflow-hidden">
      <svg viewBox="0 0 500 420" className="w-full h-auto" style={{ maxHeight: '460px' }}>
        <defs>
          <radialGradient id="klowCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </radialGradient>
          <filter id="klowGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <motion.text x="250" y="25" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="12" fontWeight="700"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          How KLOW Peptides Work Together
        </motion.text>

        {/* PEPTIDE 1: TB-500 */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
        >
          <circle cx="65" cy="80" r="18" fill="#ec4899" style={{ filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.7))' }} />
          <text x="65" y="85" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">TB</text>
          <text x="65" y="125" textAnchor="middle" fill="#ec4899" fontSize="8" fontWeight="600">TB-500</text>
          <text x="65" y="140" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7">Tissue Repair</text>
          <text x="65" y="150" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="6.5">Actin dynamics</text>
        </motion.g>

        {/* PEPTIDE 2: BPC-157 */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          <circle cx="185" cy="80" r="18" fill="#21d8ff" style={{ filter: 'drop-shadow(0 0 10px rgba(33, 216, 255, 0.7))' }} />
          <text x="185" y="85" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">BP</text>
          <text x="185" y="125" textAnchor="middle" fill="#21d8ff" fontSize="8" fontWeight="600">BPC-157</text>
          <text x="185" y="140" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7">Angiogenesis</text>
          <text x="185" y="150" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="6.5">Blood vessel growth</text>
        </motion.g>

        {/* PEPTIDE 3: GHK-Cu */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
        >
          <circle cx="315" cy="80" r="18" fill="#E7FB10" style={{ filter: 'drop-shadow(0 0 10px rgba(231, 251, 16, 0.7))' }} />
          <text x="315" y="85" textAnchor="middle" fill="black" fontSize="9" fontWeight="700">GK</text>
          <text x="315" y="125" textAnchor="middle" fill="#E7FB10" fontSize="8" fontWeight="600">GHK-Cu</text>
          <text x="315" y="140" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7">Collagen Boost</text>
          <text x="315" y="150" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="6.5">Copper peptide</text>
        </motion.g>

        {/* PEPTIDE 4: KPV - The differentiator */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
        >
          <circle cx="435" cy="80" r="18" fill="#22c55e" style={{ filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.7))' }} />
          <text x="435" y="85" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">KPV</text>
          <text x="435" y="125" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="600">KPV</text>
          <text x="435" y="140" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7">Anti-Inflammatory</text>
          <text x="435" y="150" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="6.5">NF-κB inhibitor</text>
        </motion.g>

        {/* Arrows converging to tissue target */}
        {activationLevel > 20 && (
          <>
            {/* TB-500 arrow */}
            <motion.path
              d="M 65 165 Q 65 190 140 220"
              stroke="#ec4899"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8 }}
            />
            
            {/* BPC-157 arrow */}
            <motion.path
              d="M 185 165 Q 185 190 210 220"
              stroke="#21d8ff"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            />
            
            {/* GHK-Cu arrow */}
            <motion.path
              d="M 315 165 Q 315 190 290 220"
              stroke="#E7FB10"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />

            {/* KPV arrow */}
            <motion.path
              d="M 435 165 Q 435 190 360 220"
              stroke="#22c55e"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </>
        )}

        {/* Central convergence - Tissue Target */}
        {activationLevel > 35 && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <ellipse cx="250" cy="240" rx="120" ry="35" fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e" strokeWidth="2"
              style={{ filter: 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.4))' }}
            />
            <text x="250" y="237" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="700">
              Tissue & Cellular Target
            </text>
            <text x="250" y="252" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">
              Repair + Protect + Regenerate
            </text>
          </motion.g>
        )}

        {/* LEFT PATHWAY: Repair Cascade */}
        {activationLevel > 55 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <path d="M 160 260 L 100 310" stroke="#ec4899" strokeWidth="2" fill="none" strokeDasharray="4,4" />
            
            <rect x="40" y="310" rx="8" ry="8" width="120" height="50" fill="rgba(236, 72, 153, 0.1)" stroke="#ec4899" strokeWidth="1" />
            <text x="100" y="332" textAnchor="middle" fill="#ec4899" fontSize="8" fontWeight="700">
              Tissue Regeneration
            </text>
            <text x="100" y="348" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">
              TB-500 + BPC-157 synergy
            </text>
          </motion.g>
        )}

        {/* CENTER PATHWAY: Collagen & Structure */}
        {activationLevel > 65 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <path d="M 250 275 L 250 310" stroke="#E7FB10" strokeWidth="2" fill="none" strokeDasharray="4,4" />
            
            <rect x="190" y="310" rx="8" ry="8" width="120" height="50" fill="rgba(231, 251, 16, 0.1)" stroke="#E7FB10" strokeWidth="1" />
            <text x="250" y="332" textAnchor="middle" fill="#E7FB10" fontSize="8" fontWeight="700">
              Collagen Synthesis
            </text>
            <text x="250" y="348" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">
              GHK-Cu structural support
            </text>
          </motion.g>
        )}

        {/* RIGHT PATHWAY: Inflammation Control */}
        {activationLevel > 75 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <path d="M 340 260 L 400 310" stroke="#22c55e" strokeWidth="2" fill="none" strokeDasharray="4,4" />
            
            <rect x="340" y="310" rx="8" ry="8" width="120" height="50" fill="rgba(34, 197, 94, 0.1)" stroke="#22c55e" strokeWidth="1" />
            <text x="400" y="332" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="700">
              Inflammation Control
            </text>
            <text x="400" y="348" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">
              KPV NF-κB inhibition
            </text>
          </motion.g>
        )}

        {/* RESULT: Complete Healing */}
        {activationLevel > 85 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <ellipse cx="250" cy="395" rx="160" ry="20" fill="none" stroke="#21d8ff" strokeWidth="2" strokeDasharray="6,4" opacity="0.6" />
            <text x="250" y="400" textAnchor="middle" fill="#21d8ff" fontSize="10" fontWeight="700">
              RESULT: Comprehensive Tissue Healing + Anti-Inflammation
            </text>
          </motion.g>
        )}
      </svg>
    </div>
  );
}

export function KLOWSynergyVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const klowRef = useRef<HTMLDivElement>(null);
  const klowInView = useInView(klowRef, { margin: "-20px" });
  const [activationLevel, setActivationLevel] = useState(0);

  useEffect(() => {
    if (!klowInView) return;
    
    const runActivationCycle = () => {
      let level = 0;
      setActivationLevel(0);
      
      const interval = setInterval(() => {
        level += 1.5;
        setActivationLevel(level);
        
        if (level >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setActivationLevel(0);
            setTimeout(runActivationCycle, 1500);
          }, 2500);
        }
      }, 50);
      
      return interval;
    };
    
    const interval = runActivationCycle();
    return () => clearInterval(interval);
  }, [klowInView]);

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.08) 0%, transparent 70%)'
        }}
      />
      
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
      >
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(33, 216, 255, 0.05) 100%)',
            borderColor: '#22c55e',
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)'
          }}
        >
          <Shield className="h-5 w-5 text-[#22c55e]" style={{ filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.6))' }} />
          <span className="text-sm font-bold text-[#22c55e]">
            Quad-Peptide Healing Complex
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          KLOW combines four powerhouse peptides: tissue repair, angiogenesis, collagen synthesis, and inflammation control
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(34, 197, 94, 0.2)',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.03) 0%, transparent 50%)'
        }}
      >
        <div ref={klowRef}>
          <KLOWSynergyAnimation isInView={isInView} activationLevel={activationLevel} />
        </div>

        {/* Detailed explanation cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: 'rgba(236, 72, 153, 0.08)',
              borderColor: 'rgba(236, 72, 153, 0.3)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-[#ec4899]" style={{ boxShadow: '0 0 6px #ec4899' }}></div>
              <span className="text-xs font-bold text-[#ec4899]">TB-500</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Triggers cellular repair via actin regulation. Promotes wound healing and tissue regeneration at the molecular level.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: 'rgba(33, 216, 255, 0.08)',
              borderColor: 'rgba(33, 216, 255, 0.3)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-[#21d8ff]" style={{ boxShadow: '0 0 6px #21d8ff' }}></div>
              <span className="text-xs font-bold text-[#21d8ff]">BPC-157</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Stimulates angiogenesis (new blood vessel formation) to improve nutrient delivery and accelerate healing pathways.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: 'rgba(231, 251, 16, 0.08)',
              borderColor: 'rgba(231, 251, 16, 0.3)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-[#E7FB10]" style={{ boxShadow: '0 0 6px #E7FB10' }}></div>
              <span className="text-xs font-bold text-[#E7FB10]">GHK-Cu</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Copper tripeptide that stimulates collagen I, III, and IV synthesis. Enhances structural integrity and skin firmness.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7 }}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.08)',
              borderColor: 'rgba(34, 197, 94, 0.3)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-[#22c55e]" style={{ boxShadow: '0 0 6px #22c55e' }}></div>
              <span className="text-xs font-bold text-[#22c55e]">KPV</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Anti-inflammatory tripeptide that inhibits NF-κB pathway. Reduces cytokines (TNF-α, IL-6, IL-8) at nanomolar concentrations.
            </p>
          </motion.div>
        </div>

        {/* Synergy explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-6 p-4 rounded-lg border"
          style={{
            backgroundColor: 'rgba(33, 216, 255, 0.08)',
            borderColor: 'rgba(33, 216, 255, 0.3)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-[#21d8ff]" />
            <span className="text-xs font-bold text-[#21d8ff]">Why This Quad-Peptide Combination?</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>TB-500</strong> repairs damaged tissue at the cellular level → <strong>BPC-157</strong> increases blood flow to deliver nutrients → <strong>GHK-Cu</strong> builds collagen for structural support → <strong>KPV</strong> controls inflammation to prevent healing interference. Together, they address the complete healing cascade from repair to recovery.
          </p>
        </motion.div>

        {/* KPV Highlight Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9 }}
          className="mt-4 p-4 rounded-lg border"
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.12)',
            borderColor: 'rgba(34, 197, 94, 0.4)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-[#22c55e]" />
            <span className="text-xs font-bold text-[#22c55e]">The KLOW Advantage: KPV Anti-Inflammatory Power</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            KPV (Lys-Pro-Val) is derived from α-MSH and directly inhibits the NF-κB inflammatory pathway—the master switch for inflammation. 
            This allows tissue repair peptides to work without inflammatory interference. KPV is transported via PepT1 into cells where it blocks 
            pro-inflammatory cytokine production, making KLOW ideal for research into healing environments where inflammation is a barrier.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          For research education only • KLOW peptide complex
        </span>
      </motion.div>
    </div>
  );
}
