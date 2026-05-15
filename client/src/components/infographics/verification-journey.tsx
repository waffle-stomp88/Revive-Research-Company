import { motion } from "framer-motion";
import { 
  QrCode, 
  Hash, 
  FileCheck, 
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useHoverCapable, hoverIf } from "@/hooks/use-hover-capable";

const verificationSteps = [
  {
    id: 1,
    icon: QrCode,
    title: "Scan QR Code",
    subtitle: "On Your Vial",
    description: "Every vial has a unique QR code linking to its specific batch",
    color: "#E7FB10",
  },
  {
    id: 2,
    icon: Hash,
    title: "Batch Number",
    subtitle: "Identified",
    description: "The batch number connects your product to its test results",
    color: "#21d8ff",
  },
  {
    id: 3,
    icon: FileCheck,
    title: "View COA",
    subtitle: "Third-Party Verified",
    description: "See the actual lab results: purity, identity, and more",
    color: "#9d4edd",
  },
  {
    id: 4,
    icon: CheckCircle2,
    title: "Verified",
    subtitle: "100% Authentic",
    description: "Complete confidence in what you're using for research",
    color: "#22c55e",
  },
];

export function VerificationJourney() {
  const hoverCapable = useHoverCapable();
  return (
    <div className="relative py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-0 relative">
        {verificationSteps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === verificationSteps.length - 1;
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="relative flex flex-col items-center text-center px-4"
              data-testid={`verification-step-${step.id}`}
            >
              <div className="relative">
                <motion.div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center relative z-10"
                  style={{ 
                    backgroundColor: `${step.color}15`,
                    boxShadow: `0 0 30px ${step.color}30, 0 0 60px ${step.color}15`
                  }}
                  whileHover={hoverIf(hoverCapable, { scale: 1.1, boxShadow: `0 0 40px ${step.color}50, 0 0 80px ${step.color}25` })}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      delay: index * 0.5,
                      ease: "easeInOut"
                    }}
                  >
                    <Icon className="h-9 w-9" style={{ color: step.color }} />
                  </motion.div>
                  
                  <motion.div
                    className="absolute -inset-1 rounded-2xl opacity-50"
                    style={{ 
                      background: `linear-gradient(135deg, ${step.color}40 0%, transparent 50%, ${step.color}20 100%)`,
                    }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                  />
                </motion.div>
                
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full opacity-20 blur-xl"
                  style={{ backgroundColor: step.color }}
                />
                
                <motion.div
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ 
                    backgroundColor: step.color,
                    color: step.color === "#E7FB10" ? "#000" : "#fff"
                  }}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.3, type: "spring" }}
                >
                  {step.id}
                </motion.div>
              </div>
              
              <h4 className="font-display text-lg font-bold mt-5 mb-1" style={{ color: step.color }}>
                {step.title}
              </h4>
              <p className="text-sm text-muted-foreground font-medium mb-2">
                {step.subtitle}
              </p>
              <p className="text-xs text-muted-foreground/80 max-w-[180px]">
                {step.description}
              </p>
              
              {!isLast && (
                <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)]">
                  <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 20">
                    <defs>
                      <linearGradient id={`gradient-${step.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={step.color} stopOpacity="0.8" />
                        <stop offset="100%" stopColor={verificationSteps[index + 1].color} stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    
                    <motion.path
                      d="M 0 10 Q 25 10 50 10 T 100 10"
                      stroke={`url(#gradient-${step.id})`}
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="6 4"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.5, duration: 0.8 }}
                    />
                    
                    <motion.circle
                      cx="50"
                      cy="10"
                      r="3"
                      fill={step.color}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.7 }}
                    />
                    
                    <motion.polygon
                      points="95,10 85,5 85,15"
                      fill={verificationSteps[index + 1].color}
                      initial={{ scale: 0, x: -10 }}
                      whileInView={{ scale: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.9, type: "spring" }}
                    />
                  </svg>
                </div>
              )}
              
              {!isLast && (
                <motion.div 
                  className="md:hidden my-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.3 }}
                >
                  <ArrowRight className="h-6 w-6 rotate-90" style={{ color: step.color }} />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-foreground/30"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

export function VerificationJourneyCompact() {
  return (
    <div className="relative">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {verificationSteps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === verificationSteps.length - 1;
          
          return (
            <div key={step.id} className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 px-3 py-2 rounded-full"
                style={{ backgroundColor: `${step.color}15` }}
              >
                <Icon className="h-4 w-4" style={{ color: step.color }} />
                <span className="text-sm font-medium" style={{ color: step.color }}>
                  {step.title}
                </span>
              </motion.div>
              
              {!isLast && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.05 }}
                >
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
