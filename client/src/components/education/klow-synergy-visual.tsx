import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Shield, Activity } from "lucide-react";

function KLOWSynergyAnimation({ isInView, activationLevel }: { isInView: boolean; activationLevel: number }) {
  return (
    <div className="relative w-full flex flex-col items-center justify-center overflow-hidden">
      <svg viewBox="0 0 500 400" className="w-full h-auto" style={{ maxHeight: '480px' }}>
        <defs>
          <radialGradient id="klowCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#21d8ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#21d8ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        <motion.text x="250" y="30" textAnchor="middle" fill="currentColor" fillOpacity="0.9" fontSize="18" fontWeight="700"
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
          <circle cx="60" cy="80" r="22" fill="#ec4899" style={{ filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.7))' }} />
          <text x="60" y="86" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">TB</text>
          <text x="60" y="120" textAnchor="middle" fill="#ec4899" fontSize="12" fontWeight="600">TB-500</text>
          <text x="60" y="136" textAnchor="middle" fill="currentColor" fillOpacity="0.7" fontSize="10">Tissue Repair</text>
        </motion.g>

        {/* PEPTIDE 2: BPC-157 */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          <circle cx="175" cy="80" r="22" fill="#21d8ff" style={{ filter: 'drop-shadow(0 0 10px rgba(33, 216, 255, 0.7))' }} />
          <text x="175" y="86" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">BP</text>
          <text x="175" y="120" textAnchor="middle" fill="#21d8ff" fontSize="12" fontWeight="600">BPC-157</text>
          <text x="175" y="136" textAnchor="middle" fill="currentColor" fillOpacity="0.7" fontSize="10">Angiogenesis</text>
        </motion.g>

        {/* PEPTIDE 3: GHK-Cu */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
        >
          <circle cx="325" cy="80" r="22" fill="#D4FF1F" style={{ filter: 'drop-shadow(0 0 10px rgba(231, 251, 16, 0.7))' }} />
          <text x="325" y="86" textAnchor="middle" fill="black" fontSize="12" fontWeight="700">GK</text>
          <text x="325" y="120" textAnchor="middle" fill="#D4FF1F" fontSize="12" fontWeight="600">GHK-Cu</text>
          <text x="325" y="136" textAnchor="middle" fill="currentColor" fillOpacity="0.7" fontSize="10">Collagen</text>
        </motion.g>

        {/* PEPTIDE 4: KPV - The differentiator */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
        >
          <circle cx="440" cy="80" r="22" fill="#22c55e" style={{ filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.7))' }} />
          <text x="440" y="86" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">KPV</text>
          <text x="440" y="120" textAnchor="middle" fill="#22c55e" fontSize="12" fontWeight="600">KPV</text>
          <text x="440" y="136" textAnchor="middle" fill="currentColor" fillOpacity="0.7" fontSize="10">Anti-Inflam.</text>
        </motion.g>

        {/* Arrows converging to tissue target */}
        {activationLevel > 20 && (
          <>
            {activationLevel < 45 ? (
              <>
                <motion.path d="M 60 150 L 60 185" stroke="#ec4899" strokeWidth="2.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
                <motion.path d="M 175 150 L 175 185" stroke="#21d8ff" strokeWidth="2.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
                <motion.path d="M 325 150 L 325 185" stroke="#D4FF1F" strokeWidth="2.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
                <motion.path d="M 440 150 L 440 185" stroke="#22c55e" strokeWidth="2.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
              </>
            ) : (
              <>
                <motion.path d="M 60 150 Q 60 175 150 210" stroke="#ec4899" strokeWidth="2.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.2 }} />
                <motion.path d="M 175 150 Q 175 180 200 210" stroke="#21d8ff" strokeWidth="2.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
                <motion.path d="M 325 150 Q 325 180 300 210" stroke="#D4FF1F" strokeWidth="2.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.2 }} />
                <motion.path d="M 440 150 Q 440 175 350 210" stroke="#22c55e" strokeWidth="2.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.3 }} />
              </>
            )}
          </>
        )}

        {/* Central convergence - Tissue Target */}
        {activationLevel > 30 && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <ellipse cx="250" cy="230" rx="120" ry="35" fill="rgba(33, 216, 255, 0.15)" stroke="#21d8ff" strokeWidth="2.5"
              style={{ filter: 'drop-shadow(0 0 15px rgba(33, 216, 255, 0.4))' }}
            />
            <text x="250" y="236" textAnchor="middle" fill="#21d8ff" fontSize="14" fontWeight="700">
              Tissue Repair + Protection
            </text>
          </motion.g>
        )}

        {/* LEFT PATHWAY: Regeneration */}
        {activationLevel > 50 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <path d="M 170 250 L 110 295" stroke="#ec4899" strokeWidth="2.5" fill="none" strokeDasharray="4,4" />
            
            {[0, 1, 2].map((i) => (
              <motion.g key={`regen-${i}`}>
                <circle cx={70 + i * 30} cy={320} r="8" fill="#ec4899" 
                  style={{ filter: 'drop-shadow(0 0 6px rgba(236, 72, 153, 0.6))' }}
                />
              </motion.g>
            ))}
            
            <text x="110" y="355" textAnchor="middle" fill="#ec4899" fontSize="13" fontWeight="700">
              Cellular Regeneration
            </text>
            <text x="110" y="372" textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="11">
              TB-500 + BPC-157
            </text>
          </motion.g>
        )}

        {/* RIGHT PATHWAY: Inflammation Control */}
        {activationLevel > 60 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <path d="M 330 250 L 390 295" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeDasharray="4,4" />
            
            {[0, 1, 2].map((i) => (
              <motion.g key={`antiinflam-${i}`}>
                <circle cx={340 + i * 30} cy={320} r="8" fill="#22c55e"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.6))' }}
                />
              </motion.g>
            ))}
            
            <text x="390" y="355" textAnchor="middle" fill="#22c55e" fontSize="13" fontWeight="700">
              Inflammation Control
            </text>
            <text x="390" y="372" textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="11">
              KPV NF-κB Block
            </text>
          </motion.g>
        )}

        {/* RESULT: Complete Healing */}
        {activationLevel > 75 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <ellipse cx="250" cy="350" rx="170" ry="30" fill="none" stroke="#D4FF1F" strokeWidth="2.5" strokeDasharray="4,4" opacity="0.6" />
            <text x="250" y="356" textAnchor="middle" fill="#D4FF1F" fontSize="14" fontWeight="700">
              RESULT: Complete Healing Environment
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
          background: 'radial-gradient(ellipse at center, rgba(33, 216, 255, 0.08) 0%, transparent 70%)'
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
            background: 'linear-gradient(135deg, rgba(33, 216, 255, 0.15) 0%, rgba(231, 251, 16, 0.05) 100%)',
            borderColor: '#21d8ff',
            boxShadow: '0 0 20px rgba(33, 216, 255, 0.2)'
          }}
        >
          <Shield className="h-5 w-5 text-[#21d8ff]" style={{ filter: 'drop-shadow(0 0 4px rgba(33, 216, 255, 0.6))' }} />
          <span className="text-sm font-bold text-[#21d8ff]">
            Quad-Peptide Healing Complex
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          KLOW adds KPV anti-inflammatory power to the tissue repair stack, enabling healing without inflammatory interference
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(33, 216, 255, 0.2)',
          background: 'linear-gradient(135deg, rgba(33, 216, 255, 0.03) 0%, transparent 50%)'
        }}
      >
        <div ref={klowRef}>
          <KLOWSynergyAnimation isInView={isInView} activationLevel={activationLevel} />
        </div>

        {/* Detailed explanation cards - 4 columns on large, 2x2 on medium */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
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
              <span className="text-sm font-bold text-[#ec4899]">TB-500</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Triggers cellular repair via actin regulation, promoting wound healing at the molecular level.
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
              <span className="text-sm font-bold text-[#21d8ff]">BPC-157</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Stimulates angiogenesis to deliver nutrients and oxygen via VEGF pathway activation.
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
              <div className="w-3 h-3 rounded-full bg-[#D4FF1F]" style={{ boxShadow: '0 0 6px #D4FF1F' }}></div>
              <span className="text-sm font-bold text-[#D4FF1F]">GHK-Cu</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Copper peptide activates collagen I, III, IV synthesis for structural matrix support.
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
              <span className="text-sm font-bold text-[#22c55e]">KPV</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Anti-inflammatory tripeptide inhibits NF-κB pathway, reducing TNF-α, IL-6, and IL-8.
            </p>
          </motion.div>
        </div>

        {/* Synergy explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-6 p-5 rounded-lg border"
          style={{
            backgroundColor: 'rgba(33, 216, 255, 0.08)',
            borderColor: 'rgba(33, 216, 255, 0.3)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-5 w-5 text-[#21d8ff]" />
            <span className="text-sm font-bold text-[#21d8ff]">The KLOW Advantage</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>TB-500</strong> repairs tissue → <strong>BPC-157</strong> increases blood flow → <strong>GHK-Cu</strong> builds collagen → <strong>KPV</strong> controls inflammation. Unlike basic healing stacks, KPV enters cells via PepT1 transporter and directly blocks NF-κB, the master inflammatory switch. This creates an optimal healing environment without inflammatory interference.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="text-center text-xs"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-red-400">
          For research education only • KLOW peptide complex
        </span>
      </motion.div>
    </div>
  );
}
