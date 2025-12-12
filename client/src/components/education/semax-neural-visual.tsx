import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Brain, Zap, Activity, Sparkles, TrendingUp } from "lucide-react";

function NeuralSynapseAnimation({ isInView, activeFactor }: { isInView: boolean; activeFactor: number }) {
  const neurotransmitters = ['#E7FB10', '#21d8ff', '#ec4899', '#9d4edd'];
  
  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(249, 115, 22, 0.1) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 320 200" className="w-full h-full">
        <defs>
          <filter id="neuralGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="neuronGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        
        <motion.ellipse
          cx="80"
          cy="100"
          rx="45"
          ry="40"
          fill="url(#neuronGradient)"
          stroke="#f97316"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          style={{ filter: 'drop-shadow(0 0 15px rgba(249, 115, 22, 0.4))' }}
        />
        <motion.text x="80" y="95" textAnchor="middle" fill="#f97316" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Presynaptic
        </motion.text>
        <motion.text x="80" y="108" textAnchor="middle" fill="#f97316" fontSize="8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Neuron
        </motion.text>
        
        <motion.ellipse
          cx="240"
          cy="100"
          rx="45"
          ry="40"
          fill="rgba(33, 216, 255, 0.15)"
          stroke="#21d8ff"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ filter: 'drop-shadow(0 0 15px rgba(33, 216, 255, 0.4))' }}
        />
        <motion.text x="240" y="95" textAnchor="middle" fill="#21d8ff" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Postsynaptic
        </motion.text>
        <motion.text x="240" y="108" textAnchor="middle" fill="#21d8ff" fontSize="8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Neuron
        </motion.text>
        
        <motion.rect
          x="130"
          y="70"
          width="60"
          height="60"
          rx="5"
          fill="rgba(157, 78, 221, 0.1)"
          stroke="#9d4edd"
          strokeWidth="1"
          strokeDasharray="4,2"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        />
        <motion.text x="160" y="90" textAnchor="middle" fill="#9d4edd" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Synaptic
        </motion.text>
        <motion.text x="160" y="100" textAnchor="middle" fill="#9d4edd" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Cleft
        </motion.text>
        
        {[0, 1, 2, 3].map((i) => (
          <motion.circle
            key={`vesicle-${i}`}
            r="6"
            fill={neurotransmitters[i]}
            initial={{ opacity: 0 }}
            animate={isInView ? {
              cx: [95, 130, 175, 200],
              cy: [90 + i * 8, 95 + i * 5, 95 + i * 5, 100],
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 1, 0.5]
            } : {}}
            transition={{
              duration: 2,
              delay: 1 + i * 0.3,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut"
            }}
            style={{ filter: `drop-shadow(0 0 6px ${neurotransmitters[i]})` }}
          />
        ))}
        
        {[0, 1, 2].map((i) => {
          const y = 85 + i * 15;
          const isActive = activeFactor === i;
          const colors = ['#21d8ff', '#E7FB10', '#ec4899'];
          
          return (
            <motion.g key={`receptor-${i}`}>
              <motion.rect
                x="195"
                y={y - 5}
                width="10"
                height="10"
                rx="2"
                fill={isActive ? `${colors[i]}40` : 'rgba(255,255,255,0.1)'}
                stroke={isActive ? colors[i] : 'rgba(255,255,255,0.2)'}
                strokeWidth={isActive ? 2 : 1}
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 0.8 + i * 0.1 }}
                style={{ filter: isActive ? `drop-shadow(0 0 8px ${colors[i]})` : 'none' }}
              />
              
              {isActive && (
                <motion.circle
                  cx="200"
                  cy={y}
                  r="8"
                  fill="none"
                  stroke={colors[i]}
                  strokeWidth="1"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.8, 0, 0.8]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.g>
          );
        })}
        
        <motion.rect
          x="130"
          y="160"
          width="60"
          height="25"
          rx="5"
          fill="rgba(249, 115, 22, 0.2)"
          stroke="#f97316"
          strokeWidth="1.5"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2 }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.4))' }}
        />
        <motion.text x="160" y="176" textAnchor="middle" fill="#f97316" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.4 }}
        >
          Semax
        </motion.text>
        
        <motion.path
          d="M 160 160 Q 140 140 125 100"
          stroke="#f97316"
          strokeWidth="1.5"
          strokeDasharray="4,2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 1.5, duration: 0.8 }}
        />
        <motion.path
          d="M 160 160 Q 180 140 195 100"
          stroke="#f97316"
          strokeWidth="1.5"
          strokeDasharray="4,2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 1.6, duration: 0.8 }}
        />
      </svg>
    </div>
  );
}

const neurotrophicFactors = [
  {
    id: 0,
    name: 'BDNF',
    fullName: 'Brain-Derived Neurotrophic Factor',
    icon: Brain,
    description: 'Key factor for neuronal survival, growth, and synaptic plasticity',
    color: '#21d8ff',
    effects: ['Neurogenesis', 'Memory formation', 'Learning enhancement']
  },
  {
    id: 1,
    name: 'NGF',
    fullName: 'Nerve Growth Factor',
    icon: Sparkles,
    description: 'Essential for development and maintenance of sympathetic and sensory neurons',
    color: '#E7FB10',
    effects: ['Neuron survival', 'Axon growth', 'Cholinergic function']
  },
  {
    id: 2,
    name: 'CNTF',
    fullName: 'Ciliary Neurotrophic Factor',
    icon: Activity,
    description: 'Supports motor neuron survival and promotes oligodendrocyte maturation',
    color: '#ec4899',
    effects: ['Motor neuron support', 'Neuroprotection', 'Glial support']
  },
];

export function SemaxNeuralVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const visualRef = useRef<HTMLDivElement>(null);
  const visualInView = useInView(visualRef, { margin: "-20px" });
  const [activeFactor, setActiveFactor] = useState(0);
  const [progress, setProgress] = useState(0);

  // Auto-cycle through factors - slow enough to read
  useEffect(() => {
    if (!visualInView) return;
    
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 1.43; // ~100% over 7 seconds
      });
    }, 100);
    
    // Switch factor every 7 seconds
    const switchInterval = setInterval(() => {
      setActiveFactor(prev => (prev + 1) % 3);
      setProgress(0);
    }, 7000);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(switchInterval);
    };
  }, [visualInView]);

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
            Neurotrophic Factor Modulation
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How Semax enhances neurotrophic signaling for cognitive and neuroprotective research
        </p>
      </motion.div>

      <div 
        ref={visualRef}
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(249, 115, 22, 0.3)',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, transparent 50%)'
        }}
      >
        <NeuralSynapseAnimation isInView={isInView} activeFactor={activeFactor} />
        
        {/* Auto-play progress bar */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-[10px] text-muted-foreground">Auto-playing factor {activeFactor + 1}/3</span>
          <div className="w-24 h-1 rounded-full bg-white/10 overflow-hidden">
            <motion.div 
              className="h-full rounded-full"
              style={{ 
                width: `${progress}%`,
                background: neurotrophicFactors[activeFactor].color 
              }}
            />
          </div>
        </div>
        
        <div className="mt-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-4 block">
            Neurotrophic Factors Enhanced by Semax
          </span>
          
          <div className="grid grid-cols-3 gap-3">
            {neurotrophicFactors.map((factor) => {
              const Icon = factor.icon;
              const isActive = activeFactor === factor.id;
              
              return (
                <motion.button
                  key={factor.id}
                  onClick={() => setActiveFactor(factor.id)}
                  className="p-4 rounded-lg text-left transition-all cursor-pointer"
                  style={{
                    backgroundColor: isActive ? `${factor.color}20` : 'rgba(255,255,255,0.02)',
                    border: `1.5px solid ${isActive ? factor.color : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: isActive ? `0 0 20px ${factor.color}30` : 'none'
                  }}
                  whileHover={{ scale: 1.02 }}
                  data-testid={`factor-${factor.name.toLowerCase()}`}
                >
                  <motion.div
                    className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${factor.color}20` }}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
                  >
                    <Icon className="h-5 w-5" style={{ color: factor.color, filter: `drop-shadow(0 0 4px ${factor.color})` }} />
                  </motion.div>
                  <span className="text-sm font-bold block mb-1" style={{ color: factor.color }}>
                    {factor.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {factor.fullName}
                  </span>
                </motion.button>
              );
            })}
          </div>
          
          <motion.div
            key={activeFactor}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-lg"
            style={{
              backgroundColor: `${neurotrophicFactors[activeFactor].color}10`,
              border: `1px solid ${neurotrophicFactors[activeFactor].color}30`
            }}
          >
            <p className="text-sm text-muted-foreground mb-3">
              {neurotrophicFactors[activeFactor].description}
            </p>
            <div className="flex flex-wrap gap-2">
              {neurotrophicFactors[activeFactor].effects.map((effect, idx) => (
                <motion.span
                  key={effect}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * idx }}
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${neurotrophicFactors[activeFactor].color}20`,
                    color: neurotrophicFactors[activeFactor].color,
                    border: `1px solid ${neurotrophicFactors[activeFactor].color}40`
                  }}
                >
                  {effect}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
          className="mt-4 p-3 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20"
        >
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-[#f97316] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Research context:</strong> Semax is a synthetic 
              peptide derived from ACTH(4-10), studied for its potential to enhance neurotrophic 
              factor expression and support cognitive function in research models.
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
          Semax neurotrophic mechanism • For research education only
        </span>
      </motion.div>
    </div>
  );
}
