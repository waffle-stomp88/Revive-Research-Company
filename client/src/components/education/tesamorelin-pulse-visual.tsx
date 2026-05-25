import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Activity, Zap, TrendingUp, AlertCircle, Check } from "lucide-react";
import { useHoverCapable, hoverIf } from "@/hooks/use-hover-capable";

function GHPulseWaveAnimation({ isInView, mode }: { isInView: boolean; mode: 'tesamorelin' | 'direct' }) {
  const isPulsatile = mode === 'tesamorelin';
  
  return (
    <div className="relative w-full h-56 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: `radial-gradient(ellipse at center, ${isPulsatile ? 'rgba(236, 72, 153, 0.1)' : 'rgba(249, 115, 22, 0.1)'} 0%, transparent 70%)`
        }}
      />
      
      <svg viewBox="0 0 320 160" className="w-full h-full">
        <defs>
          <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#D4FF1F" />
          </linearGradient>
          <linearGradient id="flatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        
        <motion.line
          x1="30" y1="130" x2="290" y2="130"
          stroke="currentColor" strokeOpacity="0.2"
          strokeWidth="1"
        />
        <motion.line
          x1="30" y1="20" x2="30" y2="130"
          stroke="currentColor" strokeOpacity="0.2"
          strokeWidth="1"
        />
        <motion.text x="15" y="25" fill="currentColor" fillOpacity="0.4" fontSize="7">GH</motion.text>
        <motion.text x="280" y="145" fill="currentColor" fillOpacity="0.4" fontSize="7">Time</motion.text>
        
        {isPulsatile ? (
          <motion.g>
            <motion.path
              d="M 30 100 
                 Q 45 100 50 80 Q 55 30 60 80 Q 65 100 80 100
                 Q 95 100 100 70 Q 105 25 110 70 Q 115 100 130 100
                 Q 145 100 150 75 Q 155 28 160 75 Q 165 100 180 100
                 Q 195 100 200 72 Q 205 30 210 72 Q 215 100 230 100
                 Q 245 100 250 78 Q 255 32 260 78 Q 265 100 290 100"
              fill="none"
              stroke="url(#pulseGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 2, ease: "easeInOut" }}
              style={{ filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.5))' }}
            />
            
            {[
              { x: 57, y: 55 },
              { x: 107, y: 48 },
              { x: 157, y: 52 },
              { x: 207, y: 52 },
              { x: 257, y: 56 }
            ].map((peak, i) => (
              <motion.circle
                key={i}
                cx={peak.x}
                cy={peak.y}
                r="5"
                fill="#ec4899"
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { 
                  scale: [0, 1.5, 1],
                  opacity: [0, 1, 0.7]
                } : {}}
                transition={{ delay: 0.5 + i * 0.3, duration: 0.5 }}
                style={{ filter: 'drop-shadow(0 0 6px rgba(236, 72, 153, 0.8))' }}
              />
            ))}
            
            <motion.text x="160" y="15" textAnchor="middle" fill="#ec4899" fontSize="9" fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 2 }}
            >
              Physiological Pulsatile Pattern
            </motion.text>
          </motion.g>
        ) : (
          <motion.g>
            <motion.path
              d="M 30 100 L 40 100 L 45 40 L 290 40"
              fill="none"
              stroke="url(#flatGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{ filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.5))' }}
            />
            
            <motion.rect
              x="45" y="35" width="245" height="10"
              fill="rgba(249, 115, 22, 0.2)"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.5, duration: 1 }}
              style={{ transformOrigin: '45px 40px' }}
            />
            
            <motion.line
              x1="45" y1="40" x2="290" y2="40"
              stroke="#f97316"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: [0, 1, 0.5] } : {}}
              transition={{ delay: 1.5, duration: 1, repeat: Infinity }}
            />
            
            <motion.text x="160" y="15" textAnchor="middle" fill="#f97316" fontSize="9" fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.5 }}
            >
              Supraphysiologic Constant Level
            </motion.text>
          </motion.g>
        )}
        
        <motion.text x="30" y="145" fill="currentColor" fillOpacity="0.5" fontSize="7">
          {isPulsatile ? 'Natural rhythm preserved' : 'Feedback overridden'}
        </motion.text>
      </svg>
    </div>
  );
}

const comparisonData = {
  tesamorelin: {
    color: '#ec4899',
    title: 'Tesamorelin (GHRH Analog)',
    characteristics: [
      { text: 'Physiological pulsatile GH release', good: true },
      { text: 'Preserves natural feedback mechanisms', good: true },
      { text: 'Lower insulin resistance risk', good: true },
      { text: 'Reduced fluid retention', good: true },
      { text: 'FDA-approved for research indications', good: true },
    ],
    concerns: [
      { text: 'May develop antibodies over extended use', warn: true },
    ]
  },
  direct: {
    color: '#f97316',
    title: 'Direct Recombinant GH',
    characteristics: [
      { text: 'Supraphysiologic constant levels', good: false },
      { text: 'Rapid effects on body composition', good: true },
      { text: 'IGF-1 feedback overridden', good: false },
    ],
    concerns: [
      { text: 'Increased insulin resistance', warn: true },
      { text: 'Carpal tunnel syndrome risk', warn: true },
      { text: 'Joint and fluid retention', warn: true },
      { text: 'Potential thyroid suppression', warn: true },
    ]
  }
};

export function TesomorelinPulseVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const hoverCapable = useHoverCapable();
  const [activeMode, setActiveMode] = useState<'tesamorelin' | 'direct'>('tesamorelin');
  const data = comparisonData[activeMode];

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: `radial-gradient(ellipse at center, ${data.color}15 0%, transparent 70%)`
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
            background: `linear-gradient(135deg, ${data.color}20 0%, rgba(212, 255, 31, 0.05) 100%)`,
            borderColor: data.color,
            boxShadow: `0 0 20px ${data.color}40`
          }}
        >
          <Activity className="h-5 w-5" style={{ color: data.color, filter: `drop-shadow(0 0 4px ${data.color})` }} />
          <span className="text-sm font-bold" style={{ 
            background: `linear-gradient(90deg, ${data.color}, #D4FF1F)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            GH Release Patterns
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Comparing physiological pulsatile vs supraphysiologic GH administration
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: `${data.color}30`,
          background: `linear-gradient(135deg, ${data.color}08 0%, transparent 50%)`
        }}
      >
        <div className="flex justify-center gap-3 mb-6">
          <motion.button
            onClick={() => setActiveMode('tesamorelin')}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeMode === 'tesamorelin' ? 'rgba(236, 72, 153, 0.2)' : 'hsl(var(--foreground) / 0.03)',
              border: `1.5px solid ${activeMode === 'tesamorelin' ? '#ec4899' : 'hsl(var(--foreground) / 0.1)'}`,
              color: activeMode === 'tesamorelin' ? '#ec4899' : 'hsl(var(--foreground) / 0.5)',
              boxShadow: activeMode === 'tesamorelin' ? '0 0 15px rgba(236, 72, 153, 0.3)' : 'none'
            }}
            whileHover={hoverIf(hoverCapable, { scale: 1.02 })}
            data-testid="button-tesamorelin"
          >
            Tesamorelin (Pulsatile)
          </motion.button>
          <motion.button
            onClick={() => setActiveMode('direct')}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeMode === 'direct' ? 'rgba(249, 115, 22, 0.2)' : 'hsl(var(--foreground) / 0.03)',
              border: `1.5px solid ${activeMode === 'direct' ? '#f97316' : 'hsl(var(--foreground) / 0.1)'}`,
              color: activeMode === 'direct' ? '#f97316' : 'hsl(var(--foreground) / 0.5)',
              boxShadow: activeMode === 'direct' ? '0 0 15px rgba(249, 115, 22, 0.3)' : 'none'
            }}
            whileHover={hoverIf(hoverCapable, { scale: 1.02 })}
            data-testid="button-direct-gh"
          >
            Direct GH (Constant)
          </motion.button>
        </div>
        
        <GHPulseWaveAnimation isInView={isInView} mode={activeMode} />
        
        <motion.div
          key={activeMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 grid md:grid-cols-2 gap-4"
        >
          <div 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: `${data.color}10`,
              border: `1px solid ${data.color}30`
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4" style={{ color: data.color }} />
              <span className="text-sm font-bold" style={{ color: data.color }}>
                Key Characteristics
              </span>
            </div>
            <div className="space-y-2">
              {data.characteristics.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: item.good ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      border: `1px solid ${item.good ? '#22c55e' : '#ef4444'}`
                    }}
                  >
                    {item.good ? (
                      <Check className="h-3 w-3 text-[#22c55e]" />
                    ) : (
                      <span className="text-[10px] text-[#ef4444]">!</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-[#f97316]" />
              <span className="text-sm font-bold text-foreground">Considerations</span>
            </div>
            <div className="space-y-2">
              {data.concerns.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="flex items-center gap-2"
                >
                  <span 
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: '#f97316' }}
                  />
                  <span className="text-xs text-muted-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.5 }}
          className="mt-4 p-3 rounded-lg bg-[#ec4899]/10 border border-[#ec4899]/20"
        >
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-[#ec4899] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Research insight:</strong> Pulsatile GH release 
              mimics the body's natural secretion pattern, which may preserve receptor sensitivity 
              and feedback mechanisms better than constant supraphysiologic levels.
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
          GH release pattern comparison • For research education only
        </span>
      </motion.div>
    </div>
  );
}
