import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Sparkles, Zap, Activity } from "lucide-react";

function GLOWSynergyAnimation({ isInView, activationLevel }: { isInView: boolean; activationLevel: number }) {
  return (
    <div className="relative w-full flex flex-col items-center justify-center overflow-hidden">
      <svg viewBox="0 0 500 380" className="w-full h-auto" style={{ maxHeight: '420px' }}>
        <defs>
          <radialGradient id="peptideGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Title */}
        <motion.text x="250" y="25" textAnchor="middle" fill="currentColor" fillOpacity="0.8" fontSize="12" fontWeight="700"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          How GLOW Peptides Work Together
        </motion.text>

        {/* PEPTIDE 1: TB-500 */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
        >
          <circle cx="80" cy="80" r="18" fill="#ec4899" style={{ filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.7))' }} />
          <text x="80" y="85" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">TB</text>
          <text x="80" y="125" textAnchor="middle" fill="#ec4899" fontSize="8" fontWeight="600">TB-500</text>
          <text x="80" y="140" textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="7">Tissue Repair</text>
          <text x="80" y="150" textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="6.5">Actin dynamics</text>
        </motion.g>

        {/* PEPTIDE 2: BPC-157 */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          <circle cx="250" cy="80" r="18" fill="#21d8ff" style={{ filter: 'drop-shadow(0 0 10px rgba(33, 216, 255, 0.7))' }} />
          <text x="250" y="85" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">BP</text>
          <text x="250" y="125" textAnchor="middle" fill="#21d8ff" fontSize="8" fontWeight="600">BPC-157</text>
          <text x="250" y="140" textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="7">Angiogenesis</text>
          <text x="250" y="150" textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="6.5">Blood vessel growth</text>
        </motion.g>

        {/* PEPTIDE 3: GHK-Cu */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
        >
          <circle cx="420" cy="80" r="18" fill="#D4FF1F" style={{ filter: 'drop-shadow(0 0 10px rgba(231, 251, 16, 0.7))' }} />
          <text x="420" y="85" textAnchor="middle" fill="black" fontSize="9" fontWeight="700">GK</text>
          <text x="420" y="125" textAnchor="middle" fill="#D4FF1F" fontSize="8" fontWeight="600">GHK-Cu</text>
          <text x="420" y="140" textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="7">Collagen Boost</text>
          <text x="420" y="150" textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="6.5">Copper peptide</text>
        </motion.g>

        {/* Arrows pointing down to convergence - TB-500 (pink) curves into oval */}
        {activationLevel > 20 && (
          <>
            {activationLevel < 45 ? (
              <motion.path
                d="M 80 165 L 80 200"
                stroke="#ec4899"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
              />
            ) : (
              <motion.path
                d="M 80 165 Q 80 190 160 220"
                stroke="#ec4899"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            )}
            
            {/* BPC-157 (cyan) straight to center */}
            <motion.path
              d="M 250 165 L 250 190"
              stroke="#21d8ff"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8 }}
            />
            
            {/* GHK-Cu (yellow) curves into oval */}
            {activationLevel < 45 ? (
              <motion.path
                d="M 420 165 L 420 200"
                stroke="#D4FF1F"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
              />
            ) : (
              <motion.path
                d="M 420 165 Q 420 190 340 220"
                stroke="#D4FF1F"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            )}
          </>
        )}

        {/* Convergence point - Skin Tissue */}
        {activationLevel > 30 && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <ellipse cx="250" cy="220" rx="100" ry="30" fill="rgba(236, 72, 153, 0.15)" stroke="#ec4899" strokeWidth="2"
              style={{ filter: 'drop-shadow(0 0 15px rgba(236, 72, 153, 0.4))' }}
            />
            <text x="250" y="225" textAnchor="middle" fill="#ec4899" fontSize="9" fontWeight="700">
              Skin Tissue Activation
            </text>
          </motion.g>
        )}

        {/* LEFT SIDE: COLLAGEN PATHWAY */}
        {activationLevel > 50 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {/* Arrow to left */}
            <path d="M 180 220 L 120 280" stroke="#22c55e" strokeWidth="2" fill="none" strokeDasharray="4,4" />
            
            {/* Collagen molecules */}
            {[0, 1, 2].map((i) => (
              <motion.g key={`collagen-${i}`}>
                <circle cx={80 + i * 30} cy={310} r="6" fill="#22c55e" 
                  style={{ filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.6))' }}
                />
              </motion.g>
            ))}
            
            {/* Collagen label */}
            <text x="120" y="345" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="700">
              Collagen Synthesis
            </text>
            <text x="120" y="360" textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="7">
              Strong structural support
            </text>
          </motion.g>
        )}

        {/* RIGHT SIDE: ELASTIN PATHWAY */}
        {activationLevel > 60 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {/* Arrow to right */}
            <path d="M 320 220 L 380 280" stroke="#f97316" strokeWidth="2" fill="none" strokeDasharray="4,4" />
            
            {/* Elastin molecules */}
            {[0, 1, 2].map((i) => (
              <motion.g key={`elastin-${i}`}>
                <circle cx={330 + i * 30} cy={310} r="6" fill="#f97316"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(249, 115, 22, 0.6))' }}
                />
              </motion.g>
            ))}
            
            {/* Elastin label */}
            <text x="380" y="345" textAnchor="middle" fill="#f97316" fontSize="9" fontWeight="700">
              Elastin Activation
            </text>
            <text x="380" y="360" textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="7">
              Flexible, bouncy skin
            </text>
          </motion.g>
        )}

        {/* RESULT: Glow effect */}
        {activationLevel > 75 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <ellipse cx="250" cy="320" rx="140" ry="35" fill="none" stroke="#D4FF1F" strokeWidth="2" strokeDasharray="4,4" opacity="0.6" />
            <text x="250" y="330" textAnchor="middle" fill="#D4FF1F" fontSize="10" fontWeight="700">
              RESULT: Firmer, More Radiant Skin
            </text>
          </motion.g>
        )}
      </svg>
    </div>
  );
}

export function GLOWSynergyVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const glowRef = useRef<HTMLDivElement>(null);
  const glowInView = useInView(glowRef, { margin: "-20px" });
  const [activationLevel, setActivationLevel] = useState(0);

  useEffect(() => {
    if (!glowInView) return;
    
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
  }, [glowInView]);

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(231, 251, 16, 0.08) 0%, transparent 70%)'
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
            background: 'linear-gradient(135deg, rgba(231, 251, 16, 0.15) 0%, rgba(33, 216, 255, 0.05) 100%)',
            borderColor: '#D4FF1F',
            boxShadow: '0 0 20px rgba(231, 251, 16, 0.2)'
          }}
        >
          <Sparkles className="h-5 w-5 text-[#D4FF1F]" style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.6))' }} />
          <span className="text-sm font-bold text-[#D4FF1F]">
            Multi-Peptide Synergy Explained
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          GLOW combines three powerhouse peptides that work together to repair tissue, improve blood flow, and boost collagen production
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(231, 251, 16, 0.2)',
          background: 'linear-gradient(135deg, rgba(231, 251, 16, 0.03) 0%, transparent 50%)'
        }}
      >
        <div ref={glowRef}>
          <GLOWSynergyAnimation isInView={isInView} activationLevel={activationLevel} />
        </div>

        {/* Detailed explanation cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: 'rgba(236, 72, 153, 0.08)',
              borderColor: 'rgba(236, 72, 153, 0.3)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-[#ec4899]" style={{ boxShadow: '0 0 6px #ec4899' }}></div>
              <span className="text-xs font-bold text-[#ec4899]">TB-500 (Thymosin Beta-4)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Triggers cellular repair mechanisms and restores tissue integrity. Works at the actin level to repair damaged tissue and promote wound healing.
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
              <span className="text-xs font-bold text-[#21d8ff]">BPC-157 (Body Protection Compound)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Stimulates angiogenesis (new blood vessel formation) to improve nutrient delivery and oxygen to skin tissue. Enhances healing pathways.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: 'rgba(231, 251, 16, 0.08)',
              borderColor: 'rgba(231, 251, 16, 0.3)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-[#D4FF1F]" style={{ boxShadow: '0 0 6px #D4FF1F' }}></div>
              <span className="text-xs font-bold text-[#D4FF1F]">GHK-Cu (Copper Tripeptide)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Directly stimulates collagen I, III, and IV synthesis. Enhances skin firmness, elasticity, and promotes fibroblast proliferation.
            </p>
          </motion.div>
        </div>

        {/* Synergy explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
          className="mt-6 p-4 rounded-lg border"
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            borderColor: 'rgba(34, 197, 94, 0.3)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-[#22c55e]" />
            <span className="text-xs font-bold text-[#22c55e]">Why This Combination?</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>TB-500</strong> repairs tissue and activates fibroblasts → <strong>BPC-157</strong> increases blood flow to feed those fibroblasts → <strong>GHK-Cu</strong> signals them to produce collagen & elastin. Together, they create a synergistic effect greater than any single peptide alone.
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
          For research education only • GLOW peptide complex
        </span>
      </motion.div>
    </div>
  );
}
