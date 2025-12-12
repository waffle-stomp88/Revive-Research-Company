import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FlaskConical, Shield, AlertTriangle, Zap } from "lucide-react";

const AGE_VERIFIED_KEY = "revive-research-age-verified";

export function AgeVerificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem(AGE_VERIFIED_KEY);
    if (!verified) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add("modal-open");
      document.body.classList.add("modal-open");
      
      return () => {
        document.documentElement.classList.remove("modal-open");
        document.body.classList.remove("modal-open");
      };
    }
  }, [isOpen]);

  const handleEnter = () => {
    if (agreed) {
      localStorage.setItem(AGE_VERIFIED_KEY, "true");
      setIsOpen(false);
    }
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="age-modal-overlay"
        data-testid="modal-age-verification"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="age-modal-backdrop"
        />
        <div className="age-modal-scroll-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="age-modal-card"
          >
            <div className="p-4 sm:p-8">
              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-8">
                <motion.div 
                  className="w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(231, 251, 16, 0.2) 0%, rgba(33, 216, 255, 0.1) 100%)',
                    border: '2px solid #E7FB10',
                    boxShadow: '0 0 20px rgba(231, 251, 16, 0.6)'
                  }}
                  animate={{ boxShadow: ['0 0 20px rgba(231, 251, 16, 0.6)', '0 0 30px rgba(231, 251, 16, 0.8)', '0 0 20px rgba(231, 251, 16, 0.6)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <FlaskConical className="h-5 w-5 sm:h-8 sm:w-8 text-[#E7FB10]" style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.8))' }} />
                </motion.div>
                <h1 className="font-display text-lg sm:text-3xl font-bold tracking-tight">
                  REVIVE<span className="text-[#E7FB10]" style={{ textShadow: '0 0 10px rgba(231, 251, 16, 0.6)' }}>RESEARCH</span>
                </h1>
              </div>

              <div className="space-y-3 sm:space-y-6 text-foreground/90">
                <p className="text-xs sm:text-base leading-relaxed">
                  We source high-quality research compounds at fair, cost-plus 
                  pricing. No hype, no fluff—just reliable peptides for research purposes only.
                </p>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(33, 216, 255, 0.1) 0%, rgba(33, 216, 255, 0.05) 100%)', border: '1px solid rgba(33, 216, 255, 0.3)', boxShadow: '0 0 15px rgba(33, 216, 255, 0.2)' }}>
                    <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#21d8ff' }} />
                    <p className="text-xs text-muted-foreground">
                      Products are for lawful research use only—not for human or animal consumption.
                    </p>
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)', border: '1px solid rgba(236, 72, 153, 0.3)', boxShadow: '0 0 15px rgba(236, 72, 153, 0.2)' }}>
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#ec4899' }} />
                    <p className="text-xs text-muted-foreground">
                      Purchaser assumes full responsibility for use, handling, and distribution.
                    </p>
                  </div>
                </div>

                <motion.div 
                  className="flex items-start gap-2 pt-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
                  style={{ background: 'rgba(157, 78, 221, 0.05)', border: '1px solid rgba(157, 78, 221, 0.2)' }}
                  whileHover={{ background: 'rgba(157, 78, 221, 0.1)', boxShadow: '0 0 15px rgba(157, 78, 221, 0.3)' }}
                  onClick={() => setAgreed(!agreed)}
                >
                  <Checkbox
                    id="age-terms"
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked === true)}
                    className="mt-0.5"
                    data-testid="checkbox-age-verification"
                  />
                  <label 
                    htmlFor="age-terms" 
                    className="text-xs sm:text-sm font-medium cursor-pointer select-none"
                  >
                    I agree to these terms and confirm I am 21+.
                  </label>
                </motion.div>
              </div>

              <div className="flex flex-col gap-2 mt-4 sm:mt-8">
                <motion.div
                  whileHover={agreed ? { scale: 1.05, y: -2 } : {}}
                  whileTap={agreed ? { scale: 0.98 } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={handleEnter}
                    disabled={!agreed}
                    className="w-full h-10 bg-[#E7FB10] text-black font-semibold"
                    style={{
                      boxShadow: agreed ? '0 0 20px rgba(231, 251, 16, 0.5)' : 'none',
                      opacity: agreed ? 1 : 0.5,
                      cursor: agreed ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (agreed) {
                        e.currentTarget.style.boxShadow = '0 0 40px rgba(231, 251, 16, 0.8), 0 0 60px rgba(231, 251, 16, 0.5)';
                        e.currentTarget.style.backgroundColor = 'rgb(231, 251, 16)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (agreed) {
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(231, 251, 16, 0.5)';
                        e.currentTarget.style.backgroundColor = 'rgb(231, 251, 16)';
                      }
                    }}
                    data-testid="button-enter-site"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Enter Site
                  </Button>
                </motion.div>
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  className="w-full h-10 border-[#21d8ff]/50 text-[#21d8ff] hover:bg-[#21d8ff]/10 hover:border-[#21d8ff]"
                  data-testid="button-decline-entry"
                >
                  Leave
                </Button>
              </div>

              <p className="text-center text-[10px] text-muted-foreground mt-3">
                You must be 21+ to access this website.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
