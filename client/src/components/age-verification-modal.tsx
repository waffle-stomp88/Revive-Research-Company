import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Zap } from "lucide-react";
import logoUrl from "@assets/Revive_PNG_1766012118069.png";
import { useHoverCapable, hoverIf } from "@/hooks/use-hover-capable";

const AGE_VERIFIED_KEY = "revive-research-age-verified";

function isSearchBot(): boolean {
  if (typeof window !== "undefined" && (window as any).__IS_BOT__) return true;
  if (typeof navigator === "undefined") return false;
  return /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebot|ia_archiver|semrushbot|ahrefsbot|mj12bot|dotbot|rogerbot|seznambot|google-inspectiontool|google web preview|mediapartners-google|adsbot-google|apis-google|feedfetcher-google/i.test(navigator.userAgent);
}

export function AgeVerificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (isSearchBot()) return;
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

  const hoverCapable = useHoverCapable();

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
              <div className="flex items-center justify-center mb-4 sm:mb-8">
                <motion.img 
                  src={logoUrl}
                  alt="Revive Research"
                  className="h-12 sm:h-20 object-contain"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="space-y-3 sm:space-y-6 text-foreground/90">
                <p className="text-xs sm:text-base leading-relaxed">
                  Welcome to Revive Research. Every compound we offer is third-party tested with full documentation available. We believe researchers deserve transparency—from pricing to purity.
                </p>

                <motion.div
                  className="rounded-lg cursor-pointer w-full overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.03)' }}
                  whileHover={hoverIf(hoverCapable, { background: 'rgba(255,255,255,0.05)' })}
                  onClick={() => setAgreed(!agreed)}
                  data-testid="button-age-terms"
                >
                  <div className="px-4 pt-4 pb-3 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <Shield className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Products are for lawful research use only — not for human or animal consumption.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Purchaser assumes full responsibility for use, handling, and distribution.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <Checkbox
                      id="age-terms"
                      checked={agreed}
                      onCheckedChange={(checked) => setAgreed(checked === true)}
                      data-testid="checkbox-age-verification"
                      className="pointer-events-none"
                    />
                    <label
                      htmlFor="age-terms"
                      className="text-xs sm:text-sm font-medium cursor-pointer select-none flex-1 pointer-events-none"
                    >
                      I confirm that I am 21 years of age or older and agree to the terms above.
                    </label>
                  </div>
                </motion.div>
              </div>

              <div className="flex flex-col gap-2 mt-4 sm:mt-8">
                <motion.div
                  whileHover={hoverIf(agreed && hoverCapable, { scale: 1.05, y: -2 })}
                  whileTap={agreed ? { scale: 0.98 } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={handleEnter}
                    disabled={!agreed}
                    className="w-full h-10 bg-[#D4FF1F] text-black font-semibold"
                    style={{
                      boxShadow: agreed ? '0 0 20px rgba(212, 255, 31, 0.5)' : 'none',
                      opacity: agreed ? 1 : 0.5,
                      cursor: agreed ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (agreed) {
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 255, 31, 0.8), 0 0 30px rgba(212, 255, 31, 0.5)';
                        e.currentTarget.style.backgroundColor = 'rgb(212, 255, 31)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (agreed) {
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 255, 31, 0.5)';
                        e.currentTarget.style.backgroundColor = 'rgb(212, 255, 31)';
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
