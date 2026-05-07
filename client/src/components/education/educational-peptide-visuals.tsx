import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { 
  Heart, Brain, Moon, Shield, Sparkles, Zap, Activity, 
  TrendingUp, ArrowRight, Droplets, FlaskConical, Clock
} from "lucide-react";

function KisspeptinAxisAnimation({ isInView }: { isInView: boolean }) {
  return (
    <div className="relative w-full h-72 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.1) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 320 220" className="w-full h-full">
        <defs>
          <filter id="kissGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <marker id="kissArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#ec4899" />
          </marker>
        </defs>
        
        <motion.rect
          x="120"
          y="15"
          width="80"
          height="35"
          rx="8"
          fill="rgba(236, 72, 153, 0.2)"
          stroke="#ec4899"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          style={{ filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.4))' }}
        />
        <motion.text x="160" y="30" textAnchor="middle" fill="#ec4899" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Kisspeptin
        </motion.text>
        <motion.text x="160" y="42" textAnchor="middle" fill="#ec4899" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Neurons
        </motion.text>
        
        <motion.line
          x1="160" y1="50" x2="160" y2="75"
          stroke="#ec4899"
          strokeWidth="2"
          markerEnd="url(#kissArrow)"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.3 }}
        />
        
        <motion.ellipse
          cx="160"
          cy="100"
          rx="50"
          ry="25"
          fill="rgba(157, 78, 221, 0.2)"
          stroke="#9d4edd"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.4 }}
          style={{ filter: 'drop-shadow(0 0 10px rgba(157, 78, 221, 0.4))' }}
        />
        <motion.text x="160" y="97" textAnchor="middle" fill="#9d4edd" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          GnRH Neurons
        </motion.text>
        <motion.text x="160" y="108" textAnchor="middle" fill="#9d4edd" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          GPR54 Receptor
        </motion.text>
        
        <motion.line
          x1="160" y1="125" x2="160" y2="150"
          stroke="#9d4edd"
          strokeWidth="2"
          markerEnd="url(#kissArrow)"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.6 }}
        />
        
        <motion.ellipse
          cx="160"
          cy="175"
          rx="45"
          ry="25"
          fill="rgba(33, 216, 255, 0.2)"
          stroke="#21d8ff"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.7 }}
          style={{ filter: 'drop-shadow(0 0 10px rgba(33, 216, 255, 0.4))' }}
        />
        <motion.text x="160" y="172" textAnchor="middle" fill="#21d8ff" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Pituitary
        </motion.text>
        <motion.text x="160" y="183" textAnchor="middle" fill="#21d8ff" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          LH / FSH Release
        </motion.text>
        
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`kiss-pulse-${i}`}
            r="4"
            fill="#ec4899"
            initial={{ opacity: 0, cx: 160, cy: 50 }}
            animate={isInView ? {
              cy: [50, 75, 175],
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 1, 0.5]
            } : {}}
            transition={{
              duration: 1.5,
              delay: 1 + i * 0.4,
              repeat: Infinity,
              repeatDelay: 0.8,
              ease: "easeInOut"
            }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(236, 72, 153, 0.8))' }}
          />
        ))}
        
        <motion.text x="45" y="100" textAnchor="middle" fill="#E7FB10" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
        >
          Leptin
        </motion.text>
        <motion.text x="45" y="112" textAnchor="middle" fill="#E7FB10" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
        >
          Signaling
        </motion.text>
        <motion.path
          d="M 75 105 L 110 100"
          stroke="#E7FB10"
          strokeWidth="1.5"
          strokeDasharray="4,2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 1.2 }}
        />
        
        <motion.text x="275" y="100" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
        >
          Sex Steroid
        </motion.text>
        <motion.text x="275" y="112" textAnchor="middle" fill="#22c55e" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
        >
          Feedback
        </motion.text>
        <motion.path
          d="M 245 105 L 210 100"
          stroke="#22c55e"
          strokeWidth="1.5"
          strokeDasharray="4,2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 1.2 }}
        />
      </svg>
    </div>
  );
}

export function KisspeptinVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.08) 0%, transparent 70%)'
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
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(157, 78, 221, 0.05) 100%)',
            borderColor: '#ec4899',
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)'
          }}
        >
          <Heart className="h-5 w-5 text-[#ec4899]" style={{ filter: 'drop-shadow(0 0 4px rgba(236, 72, 153, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#ec4899] to-[#9d4edd] bg-clip-text text-transparent">
            HPG Axis Regulation via GPR54
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How kisspeptin neurons control reproductive neuroendocrine function
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(236, 72, 153, 0.3)',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, transparent 50%)'
        }}
      >
        <KisspeptinAxisAnimation isInView={isInView} />
        
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            { title: 'Puberty Initiation', desc: 'Essential for triggering puberty onset via GnRH activation', color: '#ec4899', icon: Sparkles },
            { title: 'Metabolic Integration', desc: 'Links energy status (leptin) to reproductive function', color: '#E7FB10', icon: Activity },
            { title: 'Feedback Hub', desc: 'Integrates sex steroid feedback to modulate GnRH release', color: '#22c55e', icon: TrendingUp },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1 + idx * 0.15 }}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: `${item.color}10`,
                  border: `1px solid ${item.color}30`
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                    <Icon className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: item.color }}>{item.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Kisspeptin neuroendocrine mechanism • For research education only
        </span>
      </motion.div>
    </div>
  );
}

function MelanocortinAnimation({ isInView }: { isInView: boolean }) {
  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(157, 78, 221, 0.1) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 320 200" className="w-full h-full">
        <motion.ellipse
          cx="80"
          cy="100"
          rx="55"
          ry="45"
          fill="rgba(157, 78, 221, 0.15)"
          stroke="#9d4edd"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          style={{ filter: 'drop-shadow(0 0 15px rgba(157, 78, 221, 0.4))' }}
        />
        <motion.text x="80" y="90" textAnchor="middle" fill="#9d4edd" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Hypothalamus
        </motion.text>
        <motion.text x="80" y="102" textAnchor="middle" fill="#9d4edd" fontSize="8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          MC3R / MC4R
        </motion.text>
        <motion.text x="80" y="115" textAnchor="middle" fill="#9d4edd" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Receptors
        </motion.text>
        
        <motion.rect
          x="165"
          y="75"
          width="70"
          height="50"
          rx="10"
          fill="rgba(236, 72, 153, 0.2)"
          stroke="#ec4899"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.3 }}
          style={{ filter: 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.5))' }}
        />
        <motion.text x="200" y="97" textAnchor="middle" fill="#ec4899" fontSize="10" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          PT-141
        </motion.text>
        <motion.text x="200" y="112" textAnchor="middle" fill="#ec4899" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Bremelanotide
        </motion.text>
        
        <motion.path
          d="M 165 100 L 135 100"
          stroke="#ec4899"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.6 }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(236, 72, 153, 0.6))' }}
        />
        
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`pt141-${i}`}
            r="5"
            fill="#ec4899"
            initial={{ opacity: 0 }}
            animate={isInView ? {
              cx: [165, 145, 135],
              cy: [100, 100, 100],
              opacity: [0, 1, 0],
            } : {}}
            transition={{
              duration: 1.2,
              delay: 1 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(236, 72, 153, 0.8))' }}
          />
        ))}
        
        <motion.path
          d="M 80 145 Q 80 165 120 175 Q 160 185 200 175 Q 230 165 260 80"
          stroke="#21d8ff"
          strokeWidth="2"
          strokeDasharray="4,2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 1.2 }}
        />
        <motion.text x="140" y="180" textAnchor="middle" fill="#21d8ff" fontSize="8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.5 }}
        >
          Dopamine & Oxytocin Pathways
        </motion.text>
        
        <motion.ellipse
          cx="260"
          cy="60"
          rx="35"
          ry="20"
          fill="rgba(33, 216, 255, 0.15)"
          stroke="#21d8ff"
          strokeWidth="1.5"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.8 }}
        />
        <motion.text x="260" y="55" textAnchor="middle" fill="#21d8ff" fontSize="7" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          CNS-Mediated
        </motion.text>
        <motion.text x="260" y="67" textAnchor="middle" fill="#21d8ff" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Response
        </motion.text>
      </svg>
    </div>
  );
}

export function PT141Visual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(157, 78, 221, 0.08) 0%, transparent 70%)'
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
            background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.15) 0%, rgba(236, 72, 153, 0.05) 100%)',
            borderColor: '#9d4edd',
            boxShadow: '0 0 20px rgba(157, 78, 221, 0.3)'
          }}
        >
          <Brain className="h-5 w-5 text-[#9d4edd]" style={{ filter: 'drop-shadow(0 0 4px rgba(157, 78, 221, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#9d4edd] to-[#ec4899] bg-clip-text text-transparent">
            Melanocortin Receptor Agonism
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How PT-141 activates MC3R/MC4R receptors through CNS pathways
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(157, 78, 221, 0.3)',
          background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.05) 0%, transparent 50%)'
        }}
      >
        <MelanocortinAnimation isInView={isInView} />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.5 }}
          className="mt-4 p-3 rounded-lg bg-[#ec4899]/10 border border-[#ec4899]/20"
        >
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-[#ec4899] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Key distinction:</strong> Unlike vascular-targeted compounds, 
              PT-141 works through central nervous system melanocortin receptors, activating dopaminergic 
              and oxytocinergic pathways independent of the nitric oxide pathway.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          PT-141 melanocortin mechanism • For research education only
        </span>
      </motion.div>
    </div>
  );
}

function ImmuneModulationAnimation({ isInView }: { isInView: boolean }) {
  const [activeCell, setActiveCell] = useState(0);
  
  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveCell(prev => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, [isInView]);

  const cells = [
    { name: 'T-Cell', color: '#21d8ff', x: 80, y: 90 },
    { name: 'Dendritic Cell', color: '#E7FB10', x: 160, y: 140 },
    { name: 'NK Cell', color: '#22c55e', x: 240, y: 90 },
  ];

  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 320 200" className="w-full h-full">
        <motion.rect
          x="130"
          y="20"
          width="60"
          height="35"
          rx="8"
          fill="rgba(236, 72, 153, 0.2)"
          stroke="#ec4899"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          style={{ filter: 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.5))' }}
        />
        <motion.text x="160" y="35" textAnchor="middle" fill="#ec4899" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Thymosin
        </motion.text>
        <motion.text x="160" y="47" textAnchor="middle" fill="#ec4899" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Alpha-1
        </motion.text>
        
        {cells.map((cell, idx) => (
          <motion.g key={cell.name}>
            <motion.circle
              cx={cell.x}
              cy={cell.y}
              r="30"
              fill={activeCell === idx ? `${cell.color}30` : `${cell.color}10`}
              stroke={cell.color}
              strokeWidth={activeCell === idx ? 2.5 : 1.5}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.3 + idx * 0.2 }}
              style={{ filter: activeCell === idx ? `drop-shadow(0 0 15px ${cell.color}60)` : 'none' }}
            />
            <motion.text x={cell.x} y={cell.y - 5} textAnchor="middle" fill={cell.color} fontSize="8" fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
            >
              {cell.name.split(' ')[0]}
            </motion.text>
            {cell.name.split(' ')[1] && (
              <motion.text x={cell.x} y={cell.y + 7} textAnchor="middle" fill={cell.color} fontSize="7"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
              >
                {cell.name.split(' ')[1]}
              </motion.text>
            )}
            
            <motion.path
              d={`M 160 55 Q ${cell.x} 70 ${cell.x} ${cell.y - 30}`}
              stroke="#ec4899"
              strokeWidth="1.5"
              strokeDasharray="4,2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ delay: 0.8 + idx * 0.2 }}
            />
          </motion.g>
        ))}
        
        <motion.rect
          x="100"
          y="165"
          width="120"
          height="25"
          rx="6"
          fill="rgba(157, 78, 221, 0.15)"
          stroke="#9d4edd"
          strokeWidth="1.5"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2 }}
        />
        <motion.text x="160" y="181" textAnchor="middle" fill="#9d4edd" fontSize="8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          TLR9 / Cytokine Modulation
        </motion.text>
      </svg>
    </div>
  );
}

export function ThymosinAlpha1Visual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.08) 0%, transparent 70%)'
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
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(33, 216, 255, 0.05) 100%)',
            borderColor: '#ec4899',
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)'
          }}
        >
          <Shield className="h-5 w-5 text-[#ec4899]" style={{ filter: 'drop-shadow(0 0 4px rgba(236, 72, 153, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#ec4899] to-[#21d8ff] bg-clip-text text-transparent">
            Immune Cell Modulation
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How Thymosin Alpha-1 coordinates T-cell, dendritic cell, and NK cell function
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(236, 72, 153, 0.3)',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, transparent 50%)'
        }}
      >
        <ImmuneModulationAnimation isInView={isInView} />
        
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            { title: 'T-Cell Maturation', desc: 'Promotes differentiation of T-cell precursors to mature T-cells', color: '#21d8ff' },
            { title: 'Dendritic Cell Activation', desc: 'Activates DCs via TLR9 for enhanced antigen presentation', color: '#E7FB10' },
            { title: 'NK Cell Enhancement', desc: 'Increases natural killer cell cytotoxicity against targets', color: '#22c55e' },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.5 + idx * 0.15 }}
              className="p-4 rounded-lg"
              style={{
                backgroundColor: `${item.color}10`,
                border: `1px solid ${item.color}30`
              }}
            >
              <span className="text-sm font-bold block mb-1" style={{ color: item.color }}>{item.title}</span>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Thymosin Alpha-1 immune mechanism • For research education only
        </span>
      </motion.div>
    </div>
  );
}

function SleepWaveAnimation({ isInView }: { isInView: boolean }) {
  return (
    <div className="relative w-full h-48 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 320 150" className="w-full h-full">
        <defs>
          <linearGradient id="deltaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9d4edd" />
            <stop offset="100%" stopColor="#21d8ff" />
          </linearGradient>
        </defs>
        
        <motion.path
          d="M 20 75 Q 40 30 60 75 T 100 75 T 140 75 T 180 75 T 220 75 T 260 75 T 300 75"
          stroke="url(#deltaGradient)"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { 
            pathLength: 1, 
            opacity: 1,
            d: [
              "M 20 75 Q 40 30 60 75 T 100 75 T 140 75 T 180 75 T 220 75 T 260 75 T 300 75",
              "M 20 75 Q 40 120 60 75 T 100 75 T 140 75 T 180 75 T 220 75 T 260 75 T 300 75",
              "M 20 75 Q 40 30 60 75 T 100 75 T 140 75 T 180 75 T 220 75 T 260 75 T 300 75"
            ]
          } : {}}
          transition={{
            pathLength: { duration: 1 },
            d: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(157, 78, 221, 0.5))' }}
        />
        
        <motion.text x="160" y="25" textAnchor="middle" fill="#9d4edd" fontSize="10" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Delta Wave (0.5-4 Hz)
        </motion.text>
        
        <motion.text x="160" y="130" textAnchor="middle" fill="#21d8ff" fontSize="9"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
        >
          Deep Slow-Wave Sleep Pattern
        </motion.text>
        
        <motion.rect
          x="230"
          y="55"
          width="60"
          height="40"
          rx="6"
          fill="rgba(231, 251, 16, 0.2)"
          stroke="#E7FB10"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.5 }}
          style={{ filter: 'drop-shadow(0 0 10px rgba(231, 251, 16, 0.4))' }}
        />
        <motion.text x="260" y="75" textAnchor="middle" fill="#E7FB10" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          DSIP
        </motion.text>
        <motion.text x="260" y="87" textAnchor="middle" fill="#E7FB10" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Modulation
        </motion.text>
      </svg>
    </div>
  );
}

export function DSIPVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(157, 78, 221, 0.08) 0%, transparent 70%)'
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
            background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.15) 0%, rgba(33, 216, 255, 0.05) 100%)',
            borderColor: '#9d4edd',
            boxShadow: '0 0 20px rgba(157, 78, 221, 0.3)'
          }}
        >
          <Moon className="h-5 w-5 text-[#9d4edd]" style={{ filter: 'drop-shadow(0 0 4px rgba(157, 78, 221, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#9d4edd] to-[#21d8ff] bg-clip-text text-transparent">
            Sleep Architecture Modulation
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How DSIP influences delta wave sleep patterns and stress response
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(157, 78, 221, 0.3)',
          background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.05) 0%, transparent 50%)'
        }}
      >
        <SleepWaveAnimation isInView={isInView} />
        
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          {[
            { title: 'Sleep Regulation', desc: 'Promotes slow-wave sleep and modulates sleep architecture', color: '#9d4edd', icon: Moon },
            { title: 'Stress Adaptation', desc: 'Normalizes HPA axis and reduces stress-induced cortisol', color: '#E7FB10', icon: Activity },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1 + idx * 0.15 }}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: `${item.color}10`,
                  border: `1px solid ${item.color}30`
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                    <Icon className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: item.color }}>{item.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.5 }}
          className="mt-4 p-3 rounded-lg bg-[#9d4edd]/10 border border-[#9d4edd]/20"
        >
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-[#9d4edd] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Unique property:</strong> Despite a very short plasma half-life (minutes), 
              DSIP produces prolonged biological effects, suggesting possible action through metabolites or signaling cascades.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          DSIP sleep mechanism • For research education only
        </span>
      </motion.div>
    </div>
  );
}

function SelankNeuropeptideAnimation({ isInView }: { isInView: boolean }) {
  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 320 200" className="w-full h-full">
        <motion.rect
          x="125"
          y="20"
          width="70"
          height="35"
          rx="8"
          fill="rgba(249, 115, 22, 0.2)"
          stroke="#f97316"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          style={{ filter: 'drop-shadow(0 0 12px rgba(249, 115, 22, 0.5))' }}
        />
        <motion.text x="160" y="35" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Selank
        </motion.text>
        <motion.text x="160" y="48" textAnchor="middle" fill="#f97316" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          (Tuftsin Analog)
        </motion.text>
        
        <motion.ellipse
          cx="80"
          cy="110"
          rx="50"
          ry="35"
          fill="rgba(33, 216, 255, 0.15)"
          stroke="#21d8ff"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.3 }}
          style={{ filter: 'drop-shadow(0 0 10px rgba(33, 216, 255, 0.4))' }}
        />
        <motion.text x="80" y="105" textAnchor="middle" fill="#21d8ff" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          GABA-A
        </motion.text>
        <motion.text x="80" y="118" textAnchor="middle" fill="#21d8ff" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Modulation
        </motion.text>
        
        <motion.ellipse
          cx="240"
          cy="110"
          rx="50"
          ry="35"
          fill="rgba(231, 251, 16, 0.15)"
          stroke="#E7FB10"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.4 }}
          style={{ filter: 'drop-shadow(0 0 10px rgba(231, 251, 16, 0.4))' }}
        />
        <motion.text x="240" y="105" textAnchor="middle" fill="#E7FB10" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Serotonin
        </motion.text>
        <motion.text x="240" y="118" textAnchor="middle" fill="#E7FB10" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          & Dopamine
        </motion.text>
        
        <motion.path
          d="M 140 55 Q 110 75 100 85"
          stroke="#f97316"
          strokeWidth="2"
          strokeDasharray="4,2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.6 }}
        />
        <motion.path
          d="M 180 55 Q 210 75 220 85"
          stroke="#f97316"
          strokeWidth="2"
          strokeDasharray="4,2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.7 }}
        />
        
        <motion.ellipse
          cx="160"
          cy="170"
          rx="55"
          ry="25"
          fill="rgba(34, 197, 94, 0.15)"
          stroke="#22c55e"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.8 }}
          style={{ filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.4))' }}
        />
        <motion.text x="160" y="165" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          BDNF Expression
        </motion.text>
        <motion.text x="160" y="178" textAnchor="middle" fill="#22c55e" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Neuroplasticity
        </motion.text>
        
        <motion.path
          d="M 160 55 Q 160 90 160 145"
          stroke="#f97316"
          strokeWidth="2"
          strokeDasharray="4,2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.9 }}
        />
      </svg>
    </div>
  );
}

export function SelankVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(249, 115, 22, 0.08) 0%, transparent 70%)'
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
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(33, 216, 255, 0.05) 100%)',
            borderColor: '#f97316',
            boxShadow: '0 0 20px rgba(249, 115, 22, 0.3)'
          }}
        >
          <Brain className="h-5 w-5 text-[#f97316]" style={{ filter: 'drop-shadow(0 0 4px rgba(249, 115, 22, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#f97316] to-[#21d8ff] bg-clip-text text-transparent">
            Multi-System Anxiolytic Action
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How Selank modulates GABA, monoamine, and neurotrophic pathways
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(249, 115, 22, 0.3)',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, transparent 50%)'
        }}
      >
        <SelankNeuropeptideAnimation isInView={isInView} />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
          className="mt-4 p-3 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20"
        >
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-[#f97316] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Key feature:</strong> Unlike benzodiazepines, Selank provides 
              anxiolytic effects without sedation or dependence in preclinical studies, upregulating 36+ genes 
              related to neurotransmission.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Selank anxiolytic mechanism • For research education only
        </span>
      </motion.div>
    </div>
  );
}

function LipolysisAnimation({ isInView }: { isInView: boolean }) {
  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 320 200" className="w-full h-full">
        <motion.ellipse
          cx="80"
          cy="100"
          rx="55"
          ry="50"
          fill="rgba(231, 251, 16, 0.15)"
          stroke="#E7FB10"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          style={{ filter: 'drop-shadow(0 0 12px rgba(231, 251, 16, 0.4))' }}
        />
        <motion.text x="80" y="95" textAnchor="middle" fill="#E7FB10" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Adipocyte
        </motion.text>
        <motion.text x="80" y="108" textAnchor="middle" fill="#E7FB10" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          (Fat Cell)
        </motion.text>
        
        <motion.rect
          x="170"
          y="35"
          width="70"
          height="40"
          rx="8"
          fill="rgba(33, 216, 255, 0.2)"
          stroke="#21d8ff"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.3 }}
          style={{ filter: 'drop-shadow(0 0 12px rgba(33, 216, 255, 0.5))' }}
        />
        <motion.text x="205" y="52" textAnchor="middle" fill="#21d8ff" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          AOD-9604
        </motion.text>
        <motion.text x="205" y="65" textAnchor="middle" fill="#21d8ff" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          hGH 177-191
        </motion.text>
        
        <motion.path
          d="M 170 55 L 135 80"
          stroke="#21d8ff"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.5 }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(33, 216, 255, 0.6))' }}
        />
        
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`lipolysis-${i}`}
            r="4"
            fill="#22c55e"
            initial={{ opacity: 0 }}
            animate={isInView ? {
              cx: [100, 150, 220],
              cy: [100, 110, 140],
              opacity: [0, 1, 0],
            } : {}}
            transition={{
              duration: 2,
              delay: 1 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))' }}
          />
        ))}
        
        <motion.rect
          x="170"
          y="120"
          width="80"
          height="50"
          rx="6"
          fill="rgba(34, 197, 94, 0.15)"
          stroke="#22c55e"
          strokeWidth="1.5"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.7 }}
        />
        <motion.text x="210" y="140" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Fat Oxidation
        </motion.text>
        <motion.text x="210" y="155" textAnchor="middle" fill="#22c55e" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          No IGF-1 Increase
        </motion.text>
        <motion.text x="210" y="165" textAnchor="middle" fill="#22c55e" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Glucose Neutral
        </motion.text>
        
        <motion.line
          x1="135"
          y1="100"
          x2="170"
          y2="140"
          stroke="#22c55e"
          strokeWidth="1.5"
          strokeDasharray="4,2"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.9 }}
        />
      </svg>
    </div>
  );
}

export function AOD9604Visual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

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
            boxShadow: '0 0 20px rgba(33, 216, 255, 0.3)'
          }}
        >
          <Droplets className="h-5 w-5 text-[#21d8ff]" style={{ filter: 'drop-shadow(0 0 4px rgba(33, 216, 255, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#21d8ff] to-[#E7FB10] bg-clip-text text-transparent">
            Selective Lipolytic Action
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How AOD-9604 targets adipose tissue without growth or metabolic effects
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(33, 216, 255, 0.3)',
          background: 'linear-gradient(135deg, rgba(33, 216, 255, 0.05) 0%, transparent 50%)'
        }}
      >
        <LipolysisAnimation isInView={isInView} />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
          className="mt-4 p-3 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20"
        >
          <div className="flex items-start gap-2">
            <FlaskConical className="h-4 w-4 text-[#21d8ff] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Key advantage:</strong> As a modified hGH fragment (177-191), 
              AOD-9604 retains lipolytic properties while eliminating growth-promoting and diabetogenic effects 
              of full growth hormone.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          AOD-9604 lipolytic mechanism • For research education only
        </span>
      </motion.div>
    </div>
  );
}

function ZincBindingAnimation({ isInView }: { isInView: boolean }) {
  const [zincBound, setZincBound] = useState(false);
  
  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setZincBound(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 320 200" className="w-full h-full">
        <motion.ellipse
          cx="160"
          cy="100"
          rx="70"
          ry="55"
          fill={zincBound ? "rgba(33, 216, 255, 0.2)" : "rgba(100, 100, 100, 0.1)"}
          stroke={zincBound ? "#21d8ff" : "#666"}
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          style={{ filter: zincBound ? 'drop-shadow(0 0 15px rgba(33, 216, 255, 0.5))' : 'none' }}
        />
        <motion.text x="160" y="90" textAnchor="middle" fill={zincBound ? "#21d8ff" : "#888"} fontSize="10" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Thymulin
        </motion.text>
        <motion.text x="160" y="105" textAnchor="middle" fill={zincBound ? "#21d8ff" : "#666"} fontSize="8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          (9 amino acids)
        </motion.text>
        <motion.text x="160" y="120" textAnchor="middle" fill={zincBound ? "#22c55e" : "#666"} fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          {zincBound ? "ACTIVE" : "INACTIVE"}
        </motion.text>
        
        <motion.circle
          cx={zincBound ? 160 : 270}
          cy={zincBound ? 100 : 50}
          r="18"
          fill={zincBound ? "rgba(231, 251, 16, 0.3)" : "rgba(231, 251, 16, 0.15)"}
          stroke="#E7FB10"
          strokeWidth="2"
          animate={{ 
            cx: zincBound ? 160 : 270,
            cy: zincBound ? 100 : 50 
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ filter: 'drop-shadow(0 0 10px rgba(231, 251, 16, 0.5))' }}
        />
        <motion.text x={zincBound ? 160 : 270} y={zincBound ? 105 : 55} textAnchor="middle" fill="#E7FB10" fontSize="10" fontWeight="bold"
          animate={{ 
            x: zincBound ? 160 : 270,
            y: zincBound ? 135 : 55 
          }}
        >
          Zn²⁺
        </motion.text>
        
        {!zincBound && (
          <motion.text x="270" y="75" textAnchor="middle" fill="#E7FB10" fontSize="7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            (Free Zinc)
          </motion.text>
        )}
        
        <motion.rect
          x="40"
          y="160"
          width="100"
          height="30"
          rx="6"
          fill="rgba(236, 72, 153, 0.15)"
          stroke="#ec4899"
          strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: zincBound ? 1 : 0.4 } : {}}
        />
        <motion.text x="90" y="178" textAnchor="middle" fill="#ec4899" fontSize="8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: zincBound ? 1 : 0.4 } : {}}
        >
          T-Cell Maturation
        </motion.text>
        
        <motion.rect
          x="180"
          y="160"
          width="100"
          height="30"
          rx="6"
          fill="rgba(157, 78, 221, 0.15)"
          stroke="#9d4edd"
          strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: zincBound ? 1 : 0.4 } : {}}
        />
        <motion.text x="230" y="178" textAnchor="middle" fill="#9d4edd" fontSize="8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: zincBound ? 1 : 0.4 } : {}}
        >
          Immune Function
        </motion.text>
        
        {zincBound && (
          <>
            <motion.path
              d="M 130 145 L 100 160"
              stroke="#ec4899"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            />
            <motion.path
              d="M 190 145 L 220 160"
              stroke="#9d4edd"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            />
          </>
        )}
      </svg>
      
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <motion.span 
          className="text-xs px-3 py-1 rounded-full"
          style={{
            backgroundColor: zincBound ? 'rgba(33, 216, 255, 0.2)' : 'rgba(100, 100, 100, 0.2)',
            color: zincBound ? '#21d8ff' : '#888',
            border: `1px solid ${zincBound ? '#21d8ff' : '#666'}`
          }}
        >
          {zincBound ? "Zinc-bound (bioactive)" : "Apo-thymulin (inactive)"}
        </motion.span>
      </div>
    </div>
  );
}

export function ThymulinVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

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
            borderColor: '#E7FB10',
            boxShadow: '0 0 20px rgba(231, 251, 16, 0.3)'
          }}
        >
          <Zap className="h-5 w-5 text-[#E7FB10]" style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent">
            Zinc-Dependent Activation
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How thymulin requires zinc binding for biological activity
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(231, 251, 16, 0.3)',
          background: 'linear-gradient(135deg, rgba(231, 251, 16, 0.05) 0%, transparent 50%)'
        }}
      >
        <ZincBindingAnimation isInView={isInView} />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
          className="mt-4 p-3 rounded-lg bg-[#E7FB10]/10 border border-[#E7FB10]/20"
        >
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-[#E7FB10] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Aging connection:</strong> Thymulin levels decline with age, 
              mirroring thymic involution. This decline correlates with zinc status, making thymulin activity 
              a potential biomarker for both zinc deficiency and immunosenescence.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Thymulin zinc-binding mechanism • For research education only
        </span>
      </motion.div>
    </div>
  );
}

// ─── Kisspeptin-54 KISS1R Signaling Pathway ───────────────────────────────────

function Kisspeptin54SignalingAnimation({ isInView }: { isInView: boolean }) {
  const PINK = "#ec4899";
  const VIOLET = "#9d4edd";
  const CYAN = "#21d8ff";
  const AMBER = "#f59e0b";

  return (
    <div className="relative w-full h-80 flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(236,72,153,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(157,78,221,0.10) 0%, transparent 60%)",
        }}
      />

      <svg viewBox="0 0 380 240" className="w-full h-full">
        <defs>
          <filter id="kp54Glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="kp54Arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={PINK} />
          </marker>
          <marker id="kp54ArrowV" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={VIOLET} />
          </marker>
          <marker id="kp54ArrowC" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={CYAN} />
          </marker>
          <marker id="kp54ArrowA" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={AMBER} />
          </marker>
        </defs>

        {/* ── ISOFORM COMPARISON PANEL (left column) ── */}

        {/* KP-54 bar */}
        <motion.text x="12" y="24" fill={PINK} fontSize="7.5" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.1 }}>
          KP-54
        </motion.text>
        <motion.rect x="12" y="28" height="12" rx="3"
          fill={`${PINK}30`} stroke={PINK} strokeWidth="1.5"
          initial={{ width: 0 }} animate={isInView ? { width: 110 } : {}} transition={{ delay: 0.2, duration: 0.8 }}
          style={{ filter: `drop-shadow(0 0 4px ${PINK}66)` }}
        />
        <motion.text x="126" y="37" fill={PINK} fontSize="6.5"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.1 }}>
          54 aa
        </motion.text>

        {/* KP-10 bar */}
        <motion.text x="12" y="54" fill={VIOLET} fontSize="7.5" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.3 }}>
          KP-10
        </motion.text>
        <motion.rect x="12" y="58" height="12" rx="3"
          fill={`${VIOLET}25`} stroke={VIOLET} strokeWidth="1.5"
          initial={{ width: 0 }} animate={isInView ? { width: 20 } : {}} transition={{ delay: 0.35, duration: 0.4 }}
          style={{ filter: `drop-shadow(0 0 4px ${VIOLET}55)` }}
        />
        <motion.text x="36" y="67" fill={VIOLET} fontSize="6.5"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.9 }}>
          10 aa
        </motion.text>

        {/* label */}
        <motion.text x="12" y="84" fill="currentColor" fillOpacity="0.4" fontSize="6"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.2 }}>
          Isoform length
        </motion.text>

        {/* Neprilysin cleavage arrow */}
        <motion.text x="12" y="102" fill={AMBER} fontSize="6.5" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.4 }}>
          Neprilysin
        </motion.text>
        <motion.text x="12" y="112" fill="currentColor" fillOpacity="0.45" fontSize="5.8"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.5 }}>
          cleaves KP-54 → KP-10
        </motion.text>
        <motion.line x1="75" y1="38" x2="75" y2="62" stroke={AMBER} strokeWidth="1" strokeDasharray="3 2"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 1.6 }}
        />

        {/* ── RECEPTOR NODE (center) ── */}
        <motion.ellipse cx="205" cy="80" rx="40" ry="22"
          fill={`${PINK}20`} stroke={PINK} strokeWidth="2"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 0.5 }}
          style={{ filter: `drop-shadow(0 0 10px ${PINK}55)` }}
        />
        <motion.text x="205" y="77" textAnchor="middle" fill={PINK} fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}>
          KISS1R
        </motion.text>
        <motion.text x="205" y="88" textAnchor="middle" fill={PINK} fontSize="6"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.8 }}>
          GPR54
        </motion.text>

        {/* Occupancy bars under receptor */}
        <motion.text x="165" y="114" fill="currentColor" fillOpacity="0.5" fontSize="5.5"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.2 }}>
          Receptor occupancy
        </motion.text>

        {/* KP-54 occupancy (long) */}
        <motion.text x="165" y="124" fill={PINK} fontSize="5.5"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.3 }}>
          KP-54 ▶
        </motion.text>
        <motion.rect x="192" y="118" height="8" rx="2"
          fill={`${PINK}40`} stroke={PINK} strokeWidth="1"
          initial={{ width: 0 }} animate={isInView ? { width: 50 } : {}} transition={{ delay: 1.3, duration: 0.7 }}
        />

        {/* KP-10 occupancy (short) */}
        <motion.text x="165" y="138" fill={VIOLET} fontSize="5.5"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.5 }}>
          KP-10 ▶
        </motion.text>
        <motion.rect x="192" y="132" height="8" rx="2"
          fill={`${VIOLET}30`} stroke={VIOLET} strokeWidth="1"
          initial={{ width: 0 }} animate={isInView ? { width: 14 } : {}} transition={{ delay: 1.5, duration: 0.3 }}
        />

        {/* connection line: isoform panel → receptor */}
        <motion.line x1="145" y1="80" x2="162" y2="80"
          stroke={PINK} strokeWidth="1.5" markerEnd="url(#kp54Arrow)"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 0.9 }}
        />

        {/* ── Gq/11 ── */}
        <motion.rect x="248" y="62" width="48" height="22" rx="6"
          fill={`${VIOLET}20`} stroke={VIOLET} strokeWidth="1.5"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 0.9 }}
          style={{ filter: `drop-shadow(0 0 8px ${VIOLET}44)` }}
        />
        <motion.text x="272" y="76" textAnchor="middle" fill={VIOLET} fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.0 }}>
          Gq/11
        </motion.text>

        {/* KISS1R → Gq/11 */}
        <motion.line x1="245" y1="78" x2="249" y2="75"
          stroke={VIOLET} strokeWidth="1.5" markerEnd="url(#kp54ArrowV)"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 1.1 }}
        />

        {/* ── PLCβ ── */}
        <motion.rect x="310" y="55" width="46" height="22" rx="6"
          fill={`${CYAN}18`} stroke={CYAN} strokeWidth="1.5"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 1.1 }}
          style={{ filter: `drop-shadow(0 0 8px ${CYAN}33)` }}
        />
        <motion.text x="333" y="69" textAnchor="middle" fill={CYAN} fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.2 }}>
          PLCβ
        </motion.text>

        {/* Gq/11 → PLCβ */}
        <motion.line x1="296" y1="73" x2="311" y2="68"
          stroke={CYAN} strokeWidth="1.5" markerEnd="url(#kp54ArrowC)"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 1.3 }}
        />

        {/* ── IP3 / DAG ── */}
        <motion.rect x="305" y="98" width="28" height="18" rx="5"
          fill={`${CYAN}18`} stroke={CYAN} strokeWidth="1.2"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 1.4 }}
        />
        <motion.text x="319" y="110" textAnchor="middle" fill={CYAN} fontSize="6.5" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.5 }}>
          IP₃
        </motion.text>

        <motion.rect x="339" y="98" width="28" height="18" rx="5"
          fill={`${AMBER}18`} stroke={AMBER} strokeWidth="1.2"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 1.5 }}
        />
        <motion.text x="353" y="110" textAnchor="middle" fill={AMBER} fontSize="6.5" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.6 }}>
          DAG
        </motion.text>

        {/* PLCβ → IP3 + DAG */}
        <motion.line x1="333" y1="77" x2="333" y2="99"
          stroke={CYAN} strokeWidth="1.2" strokeDasharray="3 2"
          markerEnd="url(#kp54ArrowC)"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 1.4 }}
        />

        {/* ── Ca2+ release ── */}
        <motion.text x="319" y="130" textAnchor="middle" fill={CYAN} fontSize="5.5"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.7 }}>
          Ca²⁺↑
        </motion.text>

        {/* ── GnRH Pulse (bottom center) ── */}
        <motion.ellipse cx="205" cy="195" rx="52" ry="22"
          fill={`${AMBER}18`} stroke={AMBER} strokeWidth="2"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 1.8 }}
          style={{ filter: `drop-shadow(0 0 12px ${AMBER}55)` }}
        />
        <motion.text x="205" y="192" textAnchor="middle" fill={AMBER} fontSize="8.5" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 2.0 }}>
          GnRH Pulse
        </motion.text>
        <motion.text x="205" y="203" textAnchor="middle" fill={AMBER} fontSize="6"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 2.1 }}>
          Sustained (KP-54)
        </motion.text>

        {/* Receptor → GnRH */}
        <motion.line x1="205" y1="102" x2="205" y2="173"
          stroke={AMBER} strokeWidth="2" markerEnd="url(#kp54ArrowA)"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 1.9 }}
        />

        {/* Ca2+ / IP3 side link down to GnRH */}
        <motion.line x1="319" y1="134" x2="260" y2="182"
          stroke={CYAN} strokeWidth="1" strokeDasharray="3 2"
          markerEnd="url(#kp54ArrowC)"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 2.1 }}
        />

        {/* pituitary label */}
        <motion.text x="205" y="225" textAnchor="middle" fill="currentColor" fillOpacity="0.4" fontSize="6"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 2.2 }}>
          → LH / FSH release
        </motion.text>
      </svg>
    </div>
  );
}

export function Kisspeptin54Visual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <div ref={containerRef} className="relative">
      <div
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(236,72,153,0.10) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(157,78,221,0.08) 0%, transparent 60%)",
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
            background:
              "linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(157,78,221,0.08) 100%)",
            borderColor: "#ec4899",
            boxShadow: "0 0 20px rgba(236,72,153,0.3)",
          }}
        >
          <Heart
            className="h-5 w-5 text-[#ec4899]"
            style={{ filter: "drop-shadow(0 0 4px rgba(236,72,153,0.6))" }}
          />
          <span className="text-sm font-bold bg-gradient-to-r from-[#ec4899] to-[#9d4edd] bg-clip-text text-transparent">
            Kisspeptin-54 KISS1R Signaling Pathway
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Full-length KP-54 isoform vs KP-10 fragment — extended receptor occupancy, neprilysin cleavage kinetics, and the Gq/11 cascade that drives GnRH pulsatility
        </p>
      </motion.div>

      <div
        className="rounded-xl border p-6 mb-6"
        style={{
          borderColor: "rgba(236,72,153,0.3)",
          background:
            "linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(157,78,221,0.04) 60%, transparent 100%)",
        }}
      >
        <Kisspeptin54SignalingAnimation isInView={isInView} />

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            {
              title: "Extended Half-Life",
              desc: "The 54-residue full-length isoform resists rapid degradation compared to KP-10, resulting in a longer receptor-occupancy window and more sustained GnRH pulsatility.",
              color: "#ec4899",
              icon: Clock,
            },
            {
              title: "Neprilysin Cleavage",
              desc: "Neprilysin (NEP/CD10) is the primary protease responsible for converting KP-54 to the shorter KP-10 fragment in vivo, governing the kinetics of isoform interconversion.",
              color: "#f59e0b",
              icon: FlaskConical,
            },
            {
              title: "Gq/11 → GnRH Cascade",
              desc: "KISS1R couples to Gq/11 proteins, activating PLCβ to generate IP₃ and DAG. IP₃-driven Ca²⁺ mobilisation triggers coordinated GnRH pulse release to the pituitary.",
              color: "#21d8ff",
              icon: Zap,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.2 + idx * 0.15 }}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: `${item.color}10`,
                  border: `1px solid ${item.color}30`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: item.color }}>
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2.2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Kisspeptin-54 KISS1R signaling mechanism • For research education only
        </span>
      </motion.div>
    </div>
  );
}
