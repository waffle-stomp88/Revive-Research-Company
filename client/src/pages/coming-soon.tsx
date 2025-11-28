import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  Zap, 
  ArrowRight,
  CheckCircle
} from "lucide-react";
import heroBackground from "@assets/69bf34cc-d177-46c6-af24-c51da5ee10fa_1764314422747.png";

function SmokeEffect({ position, delay = 0 }: { position: 'left' | 'right' | 'bottom'; delay?: number }) {
  const baseStyles = {
    left: { left: '-10%', bottom: '0%', width: '60%', height: '80%' },
    right: { right: '-10%', bottom: '0%', width: '60%', height: '80%' },
    bottom: { left: '20%', bottom: '-20%', width: '60%', height: '60%' },
  };

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={baseStyles[position]}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 0.5, duration: 2 }}
    >
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(ellipse at center, rgba(100, 120, 140, ${0.15 - i * 0.03}) 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          animate={{
            x: position === 'left' ? [0, 30, -20, 10, 0] : position === 'right' ? [0, -30, 20, -10, 0] : [0, 20, -20, 0],
            y: [-20, -60, -40, -80, -20],
            scale: [1, 1.2, 0.9, 1.1, 1],
            opacity: [0.4, 0.6, 0.3, 0.5, 0.4],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay + i * 0.8,
          }}
        />
      ))}
    </motion.div>
  );
}

function FloatingSmoke() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${10 + i * 12}%`,
            bottom: '-10%',
            width: `${150 + Math.random() * 100}px`,
            height: `${150 + Math.random() * 100}px`,
            background: 'radial-gradient(ellipse at center, rgba(80, 100, 120, 0.3) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
          animate={{
            y: [0, -400 - Math.random() * 200],
            x: [0, (Math.random() - 0.5) * 100],
            opacity: [0, 0.5, 0.3, 0],
            scale: [0.8, 1.5, 2],
          }}
          transition={{
            duration: 12 + Math.random() * 8,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 1.5,
          }}
        />
      ))}
    </div>
  );
}

function NeonGlowLines() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <motion.div
        className="absolute w-[300px] h-[400px] md:w-[400px] md:h-[500px]"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <motion.div
          className="absolute"
          style={{
            top: '28%',
            left: '25%',
            width: '50%',
            height: '8%',
          }}
          animate={{
            boxShadow: [
              '0 0 10px 2px rgba(33, 216, 255, 0.3), 0 0 20px 4px rgba(33, 216, 255, 0.2), 0 0 40px 8px rgba(33, 216, 255, 0.1)',
              '0 0 20px 4px rgba(33, 216, 255, 0.5), 0 0 40px 8px rgba(33, 216, 255, 0.3), 0 0 60px 12px rgba(33, 216, 255, 0.2)',
              '0 0 15px 3px rgba(231, 251, 16, 0.4), 0 0 30px 6px rgba(231, 251, 16, 0.2), 0 0 50px 10px rgba(231, 251, 16, 0.1)',
              '0 0 10px 2px rgba(33, 216, 255, 0.3), 0 0 20px 4px rgba(33, 216, 255, 0.2), 0 0 40px 8px rgba(33, 216, 255, 0.1)',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 200 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <motion.stop
                offset="0%"
                animate={{
                  stopColor: ['#21d8ff', '#E7FB10', '#21d8ff'],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.stop
                offset="50%"
                animate={{
                  stopColor: ['#E7FB10', '#21d8ff', '#E7FB10'],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.stop
                offset="100%"
                animate={{
                  stopColor: ['#21d8ff', '#E7FB10', '#21d8ff'],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </linearGradient>
          </defs>
          
          <motion.path
            d="M 60 65 L 75 65 L 85 80 L 75 95 L 60 95 L 60 80 L 70 80 L 75 85 L 70 90 L 65 90 L 65 70 L 70 70"
            stroke="url(#neonGradient)"
            strokeWidth="1.5"
            fill="none"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0.5, 1, 0.5] }}
            transition={{
              pathLength: { duration: 3, ease: "easeInOut" },
              opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          
          <motion.rect
            x="55"
            y="60"
            width="90"
            height="40"
            rx="3"
            stroke="url(#neonGradient)"
            strokeWidth="0.5"
            fill="none"
            filter="url(#glow)"
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

function VialGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <motion.div
        className="absolute w-[200px] h-[350px] md:w-[280px] md:h-[450px]"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(33, 216, 255, 0.05) 40%, rgba(33, 216, 255, 0.1) 60%, rgba(33, 216, 255, 0.05) 80%, transparent 100%)',
          borderRadius: '20px',
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute w-[180px] h-[30px] md:w-[250px] md:h-[40px]"
        style={{
          top: '58%',
          background: 'radial-gradient(ellipse at center, rgba(33, 216, 255, 0.4) 0%, transparent 70%)',
          filter: 'blur(15px)',
        }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${heroBackground})`,
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
      
      <VialGlow />
      <NeonGlowLines />
      
      <SmokeEffect position="left" delay={0} />
      <SmokeEffect position="right" delay={1} />
      <SmokeEffect position="bottom" delay={0.5} />
      <FloatingSmoke />
      
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#21d8ff]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center mt-[40vh] md:mt-[35vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-[#21d8ff]/30 mb-6"
            animate={{
              boxShadow: [
                "0 0 20px rgba(33, 216, 255, 0.2)",
                "0 0 40px rgba(33, 216, 255, 0.4)",
                "0 0 20px rgba(33, 216, 255, 0.2)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-[#21d8ff]" />
            <span className="text-sm font-medium text-[#21d8ff] uppercase tracking-wider">
              Something Big Is Coming
            </span>
          </motion.div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
            <motion.span
              className="block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              The Future of
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <span className="bg-gradient-to-r from-[#21d8ff] via-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(33,216,255,0.5)]">
                Research
              </span>
            </motion.span>
          </h1>

          <motion.p
            className="text-base md:text-lg text-gray-300 max-w-xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Premium research compounds, rigorously tested, with complete transparency.
            <span className="text-[#21d8ff]"> Be the first to know.</span>
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="max-w-md mx-auto"
        >
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="relative"
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-black/50 backdrop-blur-sm border-[#21d8ff]/40 text-white placeholder:text-gray-500 focus:border-[#21d8ff] focus:ring-[#21d8ff]/20 text-base"
                      data-testid="input-email"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="h-12 px-6 bg-[#21d8ff] text-black font-bold hover:bg-[#4de4ff] border-0 shadow-[0_0_30px_rgba(33,216,255,0.5)] hover:shadow-[0_0_50px_rgba(33,216,255,0.7)] transition-all duration-300"
                    data-testid="button-notify"
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <>
                        Notify Me
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Join the waitlist. No spam, just launch updates.
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-[#21d8ff]/30"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#21d8ff]/20 border-2 border-[#21d8ff] mb-4"
                >
                  <CheckCircle className="w-7 h-7 text-[#21d8ff]" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-2">You're on the list!</h3>
                <p className="text-gray-400 text-sm">We'll notify you when we launch.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 rounded-full bg-[#21d8ff]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>99.9% Purity</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 rounded-full bg-[#E7FB10]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <span>Lab Tested</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 rounded-full bg-[#21d8ff]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
            <span>COA Verified</span>
          </div>
        </motion.div>

        <motion.p
          className="mt-8 text-[10px] text-gray-600 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          For Research Use Only. Not for human consumption. 
          All products are strictly intended for laboratory and research purposes.
        </motion.p>
      </div>
    </div>
  );
}
