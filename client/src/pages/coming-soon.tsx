import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FlaskConical, 
  Sparkles, 
  Zap, 
  ArrowRight,
  CheckCircle,
  Dna,
  Atom,
  Activity
} from "lucide-react";

const floatingParticles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 10 + 15,
  delay: Math.random() * 5,
}));

const glowingOrbs = [
  { x: "20%", y: "30%", size: "600px", color: "rgba(231, 251, 16, 0.08)", delay: 0 },
  { x: "70%", y: "60%", size: "500px", color: "rgba(33, 216, 255, 0.06)", delay: 2 },
  { x: "50%", y: "80%", size: "400px", color: "rgba(231, 251, 16, 0.05)", delay: 4 },
];

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {glowingOrbs.map((orb, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full blur-3xl"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: orb.color,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: orb.delay,
          }}
        />
      ))}
      
      {floatingParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-[#E7FB10]"
          style={{
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
          }}
          initial={{ y: "100vh", opacity: 0 }}
          animate={{
            y: "-100vh",
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear",
            delay: particle.delay,
          }}
        />
      ))}
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_hsl(220,13%,13%)_70%)]" />
    </div>
  );
}

function GlowingIcon({ icon: Icon, delay = 0 }: { icon: any; delay?: number }) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring" }}
    >
      <motion.div
        className="absolute inset-0 bg-[#E7FB10] rounded-full blur-xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#E7FB10]/20 border-2 border-[#E7FB10]/50 flex items-center justify-center">
        <Icon className="w-8 h-8 md:w-10 md:h-10 text-[#E7FB10]" />
      </div>
    </motion.div>
  );
}

function DNAHelix() {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block">
      <motion.div
        animate={{ rotateY: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="w-32"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex justify-between items-center h-8"
            style={{ transform: `rotateY(${i * 30}deg)` }}
          >
            <motion.div
              className="w-3 h-3 rounded-full bg-[#E7FB10]"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ delay: i * 0.1, duration: 2, repeat: Infinity }}
            />
            <div className="flex-1 h-0.5 bg-gradient-to-r from-[#E7FB10]/50 via-[#21d8ff]/30 to-[#E7FB10]/50 mx-2" />
            <motion.div
              className="w-3 h-3 rounded-full bg-[#21d8ff]"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ delay: i * 0.1 + 0.5, duration: 2, repeat: Infinity }}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function PulsingRing() {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#E7FB10]/20"
          initial={{ width: 100, height: 100, opacity: 0 }}
          animate={{
            width: [100, 600 + ring * 100],
            height: [100, 600 + ring * 100],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: ring * 1.2,
            ease: "easeOut",
          }}
        />
      ))}
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
    <div className="min-h-screen bg-[#1a1a1f] relative overflow-hidden flex items-center justify-center">
      <AnimatedBackground />
      <PulsingRing />
      <DNAHelix />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <FlaskConical className="w-10 h-10 md:w-12 md:h-12 text-[#E7FB10]" />
            </motion.div>
            <span className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              REVIVE<span className="text-[#E7FB10]">RESEARCH</span>
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-8"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E7FB10]/10 border border-[#E7FB10]/30 mb-8"
            animate={{
              boxShadow: [
                "0 0 20px rgba(231, 251, 16, 0.2)",
                "0 0 40px rgba(231, 251, 16, 0.4)",
                "0 0 20px rgba(231, 251, 16, 0.2)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-[#E7FB10]" />
            <span className="text-sm font-medium text-[#E7FB10] uppercase tracking-wider">
              Something Big Is Coming
            </span>
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <motion.span
              className="block text-white"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              The Future of
            </motion.span>
            <motion.span
              className="block bg-gradient-to-r from-[#E7FB10] via-[#21d8ff] to-[#E7FB10] bg-clip-text text-transparent"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              style={{ backgroundSize: "200% 100%" }}
            >
              <motion.span
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="inline-block bg-gradient-to-r from-[#E7FB10] via-[#21d8ff] to-[#E7FB10] bg-clip-text text-transparent"
                style={{ backgroundSize: "200% 100%" }}
              >
                Research
              </motion.span>
            </motion.span>
          </h1>

          <motion.p
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            We're building something revolutionary. Premium research compounds, 
            rigorously tested, with complete transparency. 
            <span className="text-[#E7FB10]"> Be the first to know.</span>
          </motion.p>
        </motion.div>

        <motion.div
          className="flex justify-center gap-6 md:gap-10 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <GlowingIcon icon={Dna} delay={1.1} />
          <GlowingIcon icon={Atom} delay={1.3} />
          <GlowingIcon icon={Activity} delay={1.5} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
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
                      className="h-14 bg-white/5 border-[#E7FB10]/30 text-white placeholder:text-gray-500 focus:border-[#E7FB10] focus:ring-[#E7FB10]/20 pr-4 text-base"
                      data-testid="input-email"
                    />
                    <motion.div
                      className="absolute inset-0 rounded-md pointer-events-none"
                      animate={{
                        boxShadow: [
                          "0 0 0px rgba(231, 251, 16, 0)",
                          "0 0 20px rgba(231, 251, 16, 0.3)",
                          "0 0 0px rgba(231, 251, 16, 0)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="h-14 px-8 bg-[#E7FB10] text-black font-bold hover:bg-[#d4e50e] border-2 border-[#E7FB10] shadow-[0_0_30px_rgba(231,251,16,0.4)] hover:shadow-[0_0_50px_rgba(231,251,16,0.6)] transition-all duration-300"
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
                        <ArrowRight className="w-5 h-5 ml-2" />
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
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E7FB10]/20 border-2 border-[#E7FB10] mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-[#E7FB10]" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">You're on the list!</h3>
                <p className="text-gray-400">We'll notify you when we launch.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="mt-16 pt-8 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#E7FB10] animate-pulse" />
              <span>99.9% Purity Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#21d8ff] animate-pulse" />
              <span>3rd Party Lab Tested</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#E7FB10] animate-pulse" />
              <span>COA Verified</span>
            </div>
          </div>
        </motion.div>

        <motion.p
          className="mt-12 text-xs text-gray-600 max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          For Research Use Only. Not for human consumption. 
          All products are strictly intended for laboratory and research purposes.
        </motion.p>
      </div>
    </div>
  );
}
