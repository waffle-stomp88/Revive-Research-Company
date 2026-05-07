import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Activity, Zap, TrendingUp, ArrowRight, Brain } from "lucide-react";

function HormonalAxisAnimation({ isInView, isActive }: { isInView: boolean; isActive: boolean }) {
  return (
    <div className="relative w-full h-72 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(33, 216, 255, 0.1) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 320 220" className="w-full h-full">
        <defs>
          <filter id="hcgGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <marker id="hcgArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#21d8ff" />
          </marker>
          <marker id="feedbackArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
          </marker>
        </defs>
        
        <motion.ellipse
          cx="160"
          cy="35"
          rx="45"
          ry="25"
          fill="rgba(157, 78, 221, 0.2)"
          stroke="#9d4edd"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          style={{ filter: 'drop-shadow(0 0 10px rgba(157, 78, 221, 0.4))' }}
        />
        <motion.text x="160" y="32" textAnchor="middle" fill="#9d4edd" fontSize="9" fontWeight="bold">
          Hypothalamus
        </motion.text>
        <motion.text x="160" y="43" textAnchor="middle" fill="#9d4edd" fontSize="7">
          GnRH Release
        </motion.text>
        
        <motion.line
          x1="160" y1="60" x2="160" y2="85"
          stroke="#9d4edd"
          strokeWidth="2"
          markerEnd="url(#hcgArrow)"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.5 }}
        />
        
        <motion.ellipse
          cx="160"
          cy="110"
          rx="45"
          ry="25"
          fill="rgba(33, 216, 255, 0.2)"
          stroke="#21d8ff"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.3 }}
          style={{ filter: 'drop-shadow(0 0 10px rgba(33, 216, 255, 0.4))' }}
        />
        <motion.text x="160" y="107" textAnchor="middle" fill="#21d8ff" fontSize="9" fontWeight="bold">
          Pituitary
        </motion.text>
        <motion.text x="160" y="118" textAnchor="middle" fill="#21d8ff" fontSize="7">
          LH/FSH Release
        </motion.text>
        
        <motion.line
          x1="160" y1="135" x2="160" y2="160"
          stroke="#21d8ff"
          strokeWidth="2"
          markerEnd="url(#hcgArrow)"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.8 }}
        />
        
        <motion.ellipse
          cx="160"
          cy="185"
          rx="45"
          ry="25"
          fill="rgba(231, 251, 16, 0.2)"
          stroke="#E7FB10"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.6 }}
          style={{ filter: 'drop-shadow(0 0 10px rgba(231, 251, 16, 0.4))' }}
        />
        <motion.text x="160" y="182" textAnchor="middle" fill="#E7FB10" fontSize="9" fontWeight="bold">
          Gonads
        </motion.text>
        <motion.text x="160" y="193" textAnchor="middle" fill="#E7FB10" fontSize="7">
          Testosterone/Estrogen
        </motion.text>
        
        <motion.path
          d="M 205 185 Q 250 185 250 110 Q 250 35 205 35"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeDasharray="4,2"
          fill="none"
          markerEnd="url(#feedbackArrow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 0.6 } : {}}
          transition={{ delay: 1.2, duration: 1 }}
        />
        <motion.text x="265" y="110" fill="#ef4444" fontSize="7" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.5 }}
        >
          Negative
        </motion.text>
        <motion.text x="265" y="120" fill="#ef4444" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.5 }}
        >
          Feedback
        </motion.text>
        
        {isActive && (
          <motion.g>
            <motion.rect
              x="25"
              y="95"
              width="60"
              height="30"
              rx="6"
              fill="rgba(236, 72, 153, 0.2)"
              stroke="#ec4899"
              strokeWidth="2"
              initial={{ scale: 0, x: -30 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ type: "spring" }}
              style={{ filter: 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.5))' }}
            />
            <motion.text x="55" y="113" textAnchor="middle" fill="#ec4899" fontSize="10" fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              HCG
            </motion.text>
            
            <motion.path
              d="M 85 110 L 115 110"
              stroke="#ec4899"
              strokeWidth="3"
              markerEnd="url(#hcgArrow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3 }}
              style={{ filter: 'drop-shadow(0 0 6px rgba(236, 72, 153, 0.6))' }}
            />
            
            <motion.text x="55" y="140" textAnchor="middle" fill="#ec4899" fontSize="7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              LH Mimetic
            </motion.text>
            
            <motion.path
              d="M 85 115 Q 100 140 115 175"
              stroke="#ec4899"
              strokeWidth="2"
              strokeDasharray="4,2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{ filter: 'drop-shadow(0 0 4px rgba(236, 72, 153, 0.4))' }}
            />
            
            <motion.circle
              r="4"
              fill="#ec4899"
              initial={{ opacity: 0 }}
              animate={{
                cx: [85, 100, 115],
                cy: [115, 140, 175],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ filter: 'drop-shadow(0 0 6px rgba(236, 72, 153, 0.8))' }}
            />
          </motion.g>
        )}
      </svg>
    </div>
  );
}

const hcgApplications = [
  {
    title: 'LH Receptor Agonism',
    description: 'HCG binds to LH receptors on Leydig cells, stimulating testosterone production without pituitary involvement',
    icon: Zap,
    color: '#ec4899'
  },
  {
    title: 'Testicular Function',
    description: 'Maintains testicular size and function by providing direct gonadal stimulation',
    icon: Activity,
    color: '#E7FB10'
  },
  {
    title: 'Hormonal Support',
    description: 'Used in research protocols to maintain endogenous hormone production pathways',
    icon: TrendingUp,
    color: '#21d8ff'
  },
];

export function HCGHormonalVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [showHCG, setShowHCG] = useState(true);

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
            background: 'linear-gradient(135deg, rgba(33, 216, 255, 0.15) 0%, rgba(236, 72, 153, 0.05) 100%)',
            borderColor: '#21d8ff',
            boxShadow: '0 0 20px rgba(33, 216, 255, 0.3)'
          }}
        >
          <Brain className="h-5 w-5 text-[#21d8ff]" style={{ filter: 'drop-shadow(0 0 4px rgba(33, 216, 255, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#21d8ff] to-[#ec4899] bg-clip-text text-transparent">
            HPG Axis & LH Receptor Agonism
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How HCG mimics luteinizing hormone to directly stimulate gonadal function
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(33, 216, 255, 0.3)',
          background: 'linear-gradient(135deg, rgba(33, 216, 255, 0.05) 0%, transparent 50%)'
        }}
      >
        <div className="flex justify-center mb-4">
          <motion.button
            onClick={() => setShowHCG(!showHCG)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: showHCG ? 'rgba(236, 72, 153, 0.2)' : 'hsl(var(--foreground) / 0.03)',
              border: `1.5px solid ${showHCG ? '#ec4899' : 'hsl(var(--foreground) / 0.1)'}`,
              color: showHCG ? '#ec4899' : 'hsl(var(--foreground) / 0.5)',
              boxShadow: showHCG ? '0 0 15px rgba(236, 72, 153, 0.3)' : 'none'
            }}
            whileHover={{ scale: 1.02 }}
            data-testid="button-toggle-hcg"
          >
            {showHCG ? '✓ HCG Active' : 'Show HCG Mechanism'}
          </motion.button>
        </div>
        
        <HormonalAxisAnimation isInView={isInView} isActive={showHCG} />
        
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {hcgApplications.map((app, idx) => {
            const Icon = app.icon;
            
            return (
              <motion.div
                key={app.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1 + idx * 0.15 }}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: `${app.color}10`,
                  border: `1px solid ${app.color}30`
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${app.color}20` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: app.color }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: app.color }}>
                    {app.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {app.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.5 }}
          className="mt-4 p-3 rounded-lg bg-[#ec4899]/10 border border-[#ec4899]/20"
        >
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-[#ec4899] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Key insight:</strong> Unlike LH from the pituitary, 
              HCG has a longer half-life (~24-36 hours) and can directly stimulate Leydig cells, 
              making it valuable for research into hormonal support and gonadal function.
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
          HCG hormonal axis visualization • For research education only
        </span>
      </motion.div>
    </div>
  );
}
