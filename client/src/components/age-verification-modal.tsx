import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Zap } from "lucide-react";
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

              {/* 1. Logo */}
              <div className="flex items-center justify-center mb-6 sm:mb-8">
                <motion.img
                  src={logoUrl}
                  alt="Revive Research"
                  className="h-12 sm:h-20 object-contain"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* 2. Headline + sub-copy */}
              <div className="text-center mb-8">
                <h1
                  className="text-white"
                  style={{
                    fontSize: 'clamp(28px, 5vw, 36px)',
                    fontWeight: 500,
                    letterSpacing: '-0.8px',
                    lineHeight: 1.15,
                    marginBottom: '14px',
                    textWrap: 'balance',
                  } as React.CSSProperties}
                >
                  You've seen this site a hundred times.
                </h1>
                <p
                  style={{
                    fontSize: '16px',
                    color: '#b0b0b5',
                    lineHeight: 1.5,
                    margin: '0 auto',
                    maxWidth: '370px',
                    textWrap: 'pretty',
                  } as React.CSSProperties}
                >
                  We're not going to convince you we're different. Walk in and judge for yourself.
                </p>
              </div>

              {/* 3. RUO compliance block — red warning */}
              <div
                style={{
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  borderRadius: '8px',
                  padding: '16px 18px',
                  marginBottom: '24px',
                }}
              >
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    paddingBottom: '12px',
                    marginBottom: '14px',
                    borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <AlertTriangle
                    style={{ color: '#ef4444', width: '18px', height: '18px', flexShrink: 0 }}
                    aria-hidden="true"
                  />
                  <p
                    style={{
                      color: '#ef4444',
                      fontSize: '13px',
                      fontWeight: 600,
                      letterSpacing: '2px',
                      margin: 0,
                      textTransform: 'uppercase',
                    }}
                  >
                    Research Use Only
                  </p>
                </motion.div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ color: '#ef4444', fontSize: '11px', fontFamily: 'monospace', fontWeight: 500, flexShrink: 0, paddingTop: '2px', letterSpacing: '1px' }}>01</span>
                  <p style={{ color: '#ffffff', fontSize: '13px', lineHeight: 1.55, margin: 0 }}>
                    For lawful research use only. Not for human or animal consumption.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: '#ef4444', fontSize: '11px', fontFamily: 'monospace', fontWeight: 500, flexShrink: 0, paddingTop: '2px', letterSpacing: '1px' }}>02</span>
                  <p style={{ color: '#ffffff', fontSize: '13px', lineHeight: 1.55, margin: 0 }}>
                    Purchaser assumes full responsibility for use, handling, and distribution.
                  </p>
                </div>
              </div>

              {/* 4. Checkbox + attestation */}
              <div
                className="flex items-center gap-3 cursor-pointer"
                style={{ marginBottom: '24px' }}
                onClick={() => setAgreed(!agreed)}
                data-testid="button-age-terms"
              >
                <Checkbox
                  id="age-terms"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked === true)}
                  data-testid="checkbox-age-verification"
                  className="pointer-events-none flex-shrink-0 h-[18px] w-[18px]"
                />
                <label
                  htmlFor="age-terms"
                  className="font-medium cursor-pointer flex-1 pointer-events-none"
                  style={{ color: '#ffffff', fontSize: '14px', lineHeight: 1.5 }}
                >
                  I am 21 or older and I understand the terms above.
                </label>
              </div>

              {/* 5 & 6. CTAs */}
              <div className="flex flex-col gap-2.5">
                <motion.div
                  whileHover={hoverIf(agreed && hoverCapable, { scale: 1.03, y: -1 })}
                  whileTap={agreed ? { scale: 0.98 } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={handleEnter}
                    disabled={!agreed}
                    className="w-full bg-[#D4FF1F] text-black font-bold text-[18px]"
                    style={{
                      boxShadow: agreed ? '0 0 24px rgba(212, 255, 31, 0.35)' : 'none',
                      opacity: agreed ? 1 : 0.5,
                      cursor: agreed ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      borderRadius: '9px',
                      paddingTop: '14px',
                      paddingBottom: '14px',
                    }}
                    onMouseEnter={(e) => {
                      if (agreed) {
                        e.currentTarget.style.boxShadow = '0 0 24px rgba(212, 255, 31, 0.6), 0 0 40px rgba(212, 255, 31, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (agreed) {
                        e.currentTarget.style.boxShadow = '0 0 24px rgba(212, 255, 31, 0.35)';
                      }
                    }}
                    data-testid="button-prove-it"
                  >
                    <Zap className="h-4 w-4 mr-1.5" />
                    Prove it
                  </Button>
                </motion.div>

                <Button
                  onClick={handleDecline}
                  variant="outline"
                  className="w-full text-[#21d8ff] border-[#2a2a2f]"
                  style={{
                    borderRadius: '9px',
                    fontSize: '13px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    background: 'transparent',
                  }}
                  data-testid="button-decline-entry"
                >
                  Not interested
                </Button>
              </div>

              {/* 7. Footer */}
              <p
                className="text-center mt-5"
                style={{
                  color: '#555',
                  fontSize: '10px',
                  letterSpacing: '0.5px',
                }}
              >
                You must be 21+ to access this website.
              </p>

            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
