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

function SubtleSmoke() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[50%]"
        style={{
          background: 'linear-gradient(to top, rgba(20, 25, 30, 0.8) 0%, rgba(30, 40, 50, 0.4) 40%, transparent 100%)',
        }}
        animate={{
          opacity: [0.8, 0.9, 0.8],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-0 left-[-10%] w-[60%] h-[40%] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(50, 60, 70, 0.5) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 30, 0],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-0 right-[-10%] w-[60%] h-[40%] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(50, 60, 70, 0.5) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, -30, 0],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
}

function VialGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <motion.div
        className="absolute w-[180px] h-[30px] md:w-[220px] md:h-[35px]"
        style={{
          top: '42%',
          background: 'radial-gradient(ellipse at center, rgba(33, 216, 255, 0.3) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
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
    <div className="min-h-screen relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${heroBackground})`,
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      
      <VialGlow />
      <SubtleSmoke />
      
      <div className="absolute top-0 left-0 right-0 z-20 pt-10 md:pt-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-[#21d8ff]/30 mb-4"
            animate={{
              boxShadow: [
                "0 0 15px rgba(33, 216, 255, 0.2)",
                "0 0 25px rgba(33, 216, 255, 0.3)",
                "0 0 15px rgba(33, 216, 255, 0.2)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-[#21d8ff]" />
            <span className="text-sm font-medium text-[#21d8ff] uppercase tracking-wider">
              Coming Soon
            </span>
          </motion.div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <motion.span
              className="block text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              The Future of
            </motion.span>
            <motion.span
              className="block bg-gradient-to-r from-[#21d8ff] via-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Supplementation
            </motion.span>
          </h1>
        </motion.div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-10 md:pb-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <motion.p
            className="text-sm md:text-base text-gray-300 mb-6 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Premium compounds, rigorously tested, with complete transparency.
            <span className="text-[#21d8ff]"> Be the first to know.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="relative"
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-black/60 backdrop-blur-sm border-[#21d8ff]/40 text-white placeholder:text-gray-500 focus:border-[#21d8ff] focus:ring-[#21d8ff]/20 text-base flex-1"
                      data-testid="input-email"
                    />
                    <Button
                      type="submit"
                      disabled={isSubmitting || !email}
                      className="h-12 px-6 bg-[#21d8ff] text-black font-bold hover:bg-[#4de4ff] border-0 shadow-[0_0_20px_rgba(33,216,255,0.4)] hover:shadow-[0_0_30px_rgba(33,216,255,0.6)] transition-all duration-300"
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center bg-black/60 backdrop-blur-sm rounded-lg p-6 border border-[#21d8ff]/30"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
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
            className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#21d8ff]" />
              <span>99.9% Purity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#E7FB10]" />
              <span>Lab Tested</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#21d8ff]" />
              <span>COA Verified</span>
            </div>
          </motion.div>

          <motion.p
            className="mt-6 text-[10px] text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            For Research Use Only. Not for human consumption.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
