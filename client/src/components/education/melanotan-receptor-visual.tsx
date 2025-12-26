import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Sun, Palette, Heart, Brain, Sparkles } from "lucide-react";

interface MelanotanType {
  id: number;
  name: string;
  color: string;
  receptors: { name: string; level: number; effect: string }[];
}

const melanotanTypes: MelanotanType[] = [
  {
    id: 0,
    name: "Melanotan 1",
    color: "#E7FB10",
    receptors: [
      { name: "MC1R", level: 95, effect: "Pigmentation" },
      { name: "MC3R", level: 15, effect: "Minimal" },
      { name: "MC4R", level: 10, effect: "Minimal" },
      { name: "MC5R", level: 30, effect: "Low" },
    ]
  },
  {
    id: 1,
    name: "Melanotan 2",
    color: "#21d8ff",
    receptors: [
      { name: "MC1R", level: 90, effect: "Pigmentation" },
      { name: "MC3R", level: 60, effect: "Metabolism" },
      { name: "MC4R", level: 95, effect: "Sexual Function" },
      { name: "MC5R", level: 55, effect: "Exocrine" },
    ]
  }
];

function ReceptorComparisonChart({ isInView, activeType }: { isInView: boolean; activeType: number }) {
  const mt = melanotanTypes[activeType];
  
  return (
    <div className="relative w-full min-h-[18rem] flex flex-col items-center justify-center">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: `radial-gradient(ellipse at center, ${mt.color}15 0%, transparent 70%)`
        }}
      />
      
      <div className="w-full max-w-md px-4 relative z-10">
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
        >
          <span 
            className="text-lg font-bold"
            style={{ color: mt.color, textShadow: `0 0 10px ${mt.color}50` }}
          >
            {mt.name}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            {activeType === 0 ? "(Linear, 13 AA)" : "(Cyclic, 7 AA)"}
          </span>
        </motion.div>

        <div className="space-y-3">
          {mt.receptors.map((receptor, i) => (
            <motion.div
              key={receptor.name}
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: mt.color }}>
                    {receptor.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {receptor.effect}
                  </span>
                </div>
                <span className="text-xs font-semibold" style={{ color: receptor.level >= 80 ? mt.color : 'rgba(255,255,255,0.5)' }}>
                  {receptor.level}%
                </span>
              </div>
              
              <div 
                className="h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ 
                    background: receptor.level >= 80 
                      ? `linear-gradient(90deg, ${mt.color}80, ${mt.color})` 
                      : `linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.4))`,
                    boxShadow: receptor.level >= 80 ? `0 0 10px ${mt.color}50` : 'none'
                  }}
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${receptor.level}%` } : {}}
                  transition={{ delay: 0.4 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {receptor.level >= 80 && (
                <motion.div
                  className="absolute right-0 top-0"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 1 + i * 0.1 }}
                >
                  <Sparkles className="h-3 w-3" style={{ color: mt.color }} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-6 p-3 rounded-lg text-center"
          style={{
            backgroundColor: `${mt.color}10`,
            border: `1px solid ${mt.color}30`
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2 }}
        >
          <p className="text-xs text-muted-foreground">
            {activeType === 0 
              ? "Selective MC1R agonist - focused pigmentation effects"
              : "Non-selective multi-receptor agonist - broader systemic effects"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function StructureComparison({ isInView }: { isInView: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <motion.div
        className="p-4 rounded-lg text-center"
        style={{ backgroundColor: 'rgba(231, 251, 16, 0.1)', border: '1px solid rgba(231, 251, 16, 0.3)' }}
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
      >
        <div className="text-sm font-bold text-[#E7FB10] mb-2">MT1 (Linear)</div>
        <svg viewBox="0 0 100 30" className="w-full h-8">
          <motion.line
            x1="10" y1="15" x2="90" y2="15"
            stroke="#E7FB10"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
          {[10, 30, 50, 70, 90].map((x, i) => (
            <motion.circle
              key={i}
              cx={x} cy="15" r="4"
              fill="#E7FB10"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.7 + i * 0.1 }}
            />
          ))}
        </svg>
        <div className="text-[10px] text-muted-foreground mt-1">13 Amino Acids</div>
      </motion.div>

      <motion.div
        className="p-4 rounded-lg text-center"
        style={{ backgroundColor: 'rgba(33, 216, 255, 0.1)', border: '1px solid rgba(33, 216, 255, 0.3)' }}
        initial={{ opacity: 0, x: 20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
      >
        <div className="text-sm font-bold text-[#21d8ff] mb-2">MT2 (Cyclic)</div>
        <svg viewBox="0 0 100 40" className="w-full h-10">
          <motion.ellipse
            cx="50" cy="20" rx="30" ry="15"
            fill="none"
            stroke="#21d8ff"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ delay: 0.5, duration: 1 }}
          />
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const x = 50 + 30 * Math.cos((angle * Math.PI) / 180);
            const y = 20 + 15 * Math.sin((angle * Math.PI) / 180);
            return (
              <motion.circle
                key={i}
                cx={x} cy={y} r="4"
                fill="#21d8ff"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 0.9 + i * 0.1 }}
              />
            );
          })}
        </svg>
        <div className="text-[10px] text-muted-foreground mt-1">7 AA with Lactam Bridge</div>
      </motion.div>
    </div>
  );
}

export function MelanotanReceptorVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [activeType, setActiveType] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    
    const interval = setInterval(() => {
      setActiveType((prev) => (prev + 1) % melanotanTypes.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isPlaying, isInView]);

  const icons = [
    { Icon: Sun, label: "Pigmentation", color: "#E7FB10" },
    { Icon: Heart, label: "Sexual Function", color: "#ec4899" },
    { Icon: Palette, label: "Photoprotection", color: "#21d8ff" },
    { Icon: Brain, label: "Central Effects", color: "#9d4edd" },
  ];

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(231, 251, 16, 0.06) 0%, rgba(33, 216, 255, 0.06) 50%, transparent 70%)'
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
            background: 'linear-gradient(135deg, rgba(231, 251, 16, 0.15) 0%, rgba(33, 216, 255, 0.15) 100%)',
            borderColor: melanotanTypes[activeType].color,
            boxShadow: `0 0 20px ${melanotanTypes[activeType].color}30`
          }}
        >
          <Sun className="h-5 w-5" style={{ color: melanotanTypes[activeType].color, filter: `drop-shadow(0 0 4px ${melanotanTypes[activeType].color}60)` }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent">
            Melanocortin Receptor Selectivity
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Comparing MT1 and MT2 receptor binding profiles and biological effects
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: `${melanotanTypes[activeType].color}30`,
          background: `linear-gradient(135deg, ${melanotanTypes[activeType].color}08 0%, transparent 50%)`
        }}
      >
        <StructureComparison isInView={isInView} />
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Receptor Binding Profile
          </span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-xs px-3 py-1 rounded-full transition-all"
            style={{
              backgroundColor: isPlaying ? `${melanotanTypes[activeType].color}20` : 'rgba(255,255,255,0.1)',
              color: isPlaying ? melanotanTypes[activeType].color : 'rgba(255,255,255,0.5)',
              border: `1px solid ${isPlaying ? `${melanotanTypes[activeType].color}40` : 'rgba(255,255,255,0.1)'}`
            }}
            data-testid="button-toggle-animation"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {melanotanTypes.map((mt) => (
            <motion.button
              key={mt.id}
              onClick={() => {
                setActiveType(mt.id);
                setIsPlaying(false);
              }}
              className="relative p-3 rounded-lg text-center transition-all cursor-pointer"
              style={{
                backgroundColor: activeType === mt.id ? `${mt.color}20` : 'rgba(255,255,255,0.03)',
                border: `2px solid ${activeType === mt.id ? mt.color : 'rgba(255,255,255,0.1)'}`,
                boxShadow: activeType === mt.id ? `0 0 20px ${mt.color}30` : 'none'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid={`mt-type-${mt.id}`}
            >
              <span 
                className="text-sm font-bold"
                style={{ color: activeType === mt.id ? mt.color : 'rgba(255,255,255,0.6)' }}
              >
                {mt.name}
              </span>
              <div className="text-[10px] text-muted-foreground mt-1">
                {mt.id === 0 ? "Selective MC1R" : "Multi-Receptor"}
              </div>
            </motion.button>
          ))}
        </div>
        
        <ReceptorComparisonChart isInView={isInView} activeType={activeType} />

        <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4 text-[#21d8ff]" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Key Effects
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {icons.map((item, i) => (
              <motion.div
                key={i}
                className="p-2 rounded-lg text-center"
                style={{ backgroundColor: `${item.color}10`, border: `1px solid ${item.color}20` }}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.5 + i * 0.1 }}
              >
                <item.Icon className="h-4 w-4 mx-auto mb-1" style={{ color: item.color }} />
                <div className="text-[9px] text-muted-foreground">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Melanotan receptor selectivity comparison • For educational purposes only
        </span>
      </motion.div>
    </div>
  );
}
