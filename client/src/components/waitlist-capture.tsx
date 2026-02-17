import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Check, ArrowRight, GraduationCap, FlaskConical, QrCode, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

import {
  captureEmail,
  isEmailCaptured,
  validateEmail,
  isExitPopupSuppressed,
  suppressExitPopup,
  isFoundingPopupSuppressed,
  suppressFoundingPopup,
  getTimeOnSite,
  initSiteEnterTime,
} from "@/lib/waitlist-utils";
import { trackEvent } from "@/lib/analytics";

const AGE_VERIFIED_KEY = "revive-research-age-verified";

function HexGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexagons" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
            <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66Z" fill="none" stroke="#E7FB10" strokeWidth="0.5" opacity="0.06"/>
            <path d="M28 116L0 100L0 66L28 50L56 66L56 100L28 116Z" fill="none" stroke="#21d8ff" strokeWidth="0.5" opacity="0.04"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
    </div>
  );
}

function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 pointer-events-none z-10"
      style={{
        height: "1px",
        background: "linear-gradient(90deg, transparent 10%, rgba(33,216,255,0.45) 35%, rgba(231,251,16,0.3) 50%, rgba(33,216,255,0.45) 65%, transparent 90%)",
        boxShadow: "0 0 6px rgba(33,216,255,0.15)",
      }}
      animate={{
        top: ["0%", "100%", "0%"],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

function FloatingParticle({ color, delay, x, y, size = 3 }: { color: string; delay: number; x: string; y: string; size?: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 ${size * 3}px ${color}`,
      }}
      animate={{
        opacity: [0, 0.8, 0.4, 0.8, 0],
        scale: [0.5, 1.2, 0.8, 1.2, 0.5],
        y: [0, -8, 0, 8, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function ShimmerCard({ children, delay = 0, accentColor }: { children: React.ReactNode; delay?: number; accentColor: string }) {
  return (
    <motion.div
      initial={{ x: -15, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, type: "spring", damping: 20 }}
      className="relative flex items-center gap-3 sm:gap-3 p-3.5 sm:p-3 rounded-lg overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${accentColor}08, transparent)`,
        border: `1px solid ${accentColor}20`,
      }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accentColor}10 50%, transparent 100%)`,
        }}
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 3,
          delay: delay + 1,
          repeat: Infinity,
          repeatDelay: 4,
          ease: "easeInOut",
        }}
      />
      {children}
    </motion.div>
  );
}

interface WaitlistCountData {
  total: number;
  foundingMembers: number;
  spotsRemaining: number;
}

export function FoundingMembersPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) return;
    if (isEmailCaptured()) return;
    if (isFoundingPopupSuppressed()) return;

    const checkAgeGate = () => {
      const verified = sessionStorage.getItem(AGE_VERIFIED_KEY);
      if (verified && !shownRef.current && !isEmailCaptured() && !isFoundingPopupSuppressed()) {
        shownRef.current = true;
        setTimeout(() => {
          if (!isEmailCaptured() && !isFoundingPopupSuppressed()) {
            setVisible(true);
            trackEvent("prelaunch_popup_shown", "lead_capture");
          }
        }, 7000);
      }
    };

    checkAgeGate();

    const interval = setInterval(checkAgeGate, 500);
    return () => clearInterval(interval);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    suppressFoundingPopup();
    trackEvent("prelaunch_popup_skipped", "lead_capture");
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await captureEmail(email, "prelaunch_popup");
    setLoading(false);
    if (result.success || result.duplicate) {
      setSuccess(true);
      suppressFoundingPopup();
      setTimeout(() => {
        setVisible(false);
      }, 5000);
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          style={{ WebkitBackdropFilter: "blur(12px)" }}
          data-testid="modal-prelaunch-capture"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 50 }}
            transition={{ type: "spring", damping: 18, stiffness: 250 }}
            style={{ width: "min(420px, calc(100vw - 32px))", maxHeight: "90vh", overflowY: "auto", transform: "translateZ(0)", WebkitOverflowScrolling: "touch" }}
          >
            {success ? (
              <SuccessState handleClose={handleClose} />
            ) : (
              <PreLaunchState
                email={email}
                setEmail={setEmail}
                loading={loading}
                error={error}
                handleSubmit={handleSubmit}
                handleClose={handleClose}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SuccessState({ handleClose }: { handleClose: () => void }) {
  const isMobile = useIsMobile();

  return (
    <Card className="relative overflow-hidden border-0 bg-[#0a0a0e]" style={{ transform: "translateZ(0)", willChange: "transform" }}>
      {isMobile ? (
        <div
          className="absolute inset-0 rounded-md"
          style={{
            border: "2px solid rgba(33,216,255,0.35)",
            boxShadow: "0 0 40px rgba(33,216,255,0.15), 0 0 80px rgba(231,251,16,0.1)",
          }}
        />
      ) : (
        <motion.div
          className="absolute inset-0 rounded-md"
          animate={{
            boxShadow: [
              "inset 0 0 0 2px rgba(231,251,16,0.3), 0 0 40px rgba(33,216,255,0.15), 0 0 80px rgba(231,251,16,0.1)",
              "inset 0 0 0 2px rgba(33,216,255,0.5), 0 0 60px rgba(231,251,16,0.3), 0 0 120px rgba(33,216,255,0.15)",
              "inset 0 0 0 2px rgba(231,251,16,0.3), 0 0 40px rgba(33,216,255,0.15), 0 0 80px rgba(231,251,16,0.1)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <HexGrid />
      <FloatingParticle color="#E7FB10" delay={0} x="15%" y="20%" size={4} />
      <FloatingParticle color="#21d8ff" delay={0.5} x="80%" y="30%" size={3} />
      {!isMobile && <FloatingParticle color="#a78bfa" delay={1} x="60%" y="70%" size={3} />}
      {!isMobile && <FloatingParticle color="#E7FB10" delay={1.5} x="25%" y="75%" size={2} />}

      <div className="relative z-10 flex flex-col items-center text-center gap-5 p-6 sm:p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, delay: 0.2 }}
        >
          <div className="relative">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(33,216,255,0.3), 0 0 40px rgba(231,251,16,0.15)",
                  "0 0 40px rgba(231,251,16,0.5), 0 0 80px rgba(33,216,255,0.25)",
                  "0 0 20px rgba(33,216,255,0.3), 0 0 40px rgba(231,251,16,0.15)",
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-20 w-20 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(33,216,255,0.15), rgba(231,251,16,0.1))",
                border: "2px solid rgba(33,216,255,0.4)",
              }}
            >
              <Check className="h-10 w-10 text-[#21d8ff]" />
            </motion.div>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 2.5], opacity: [0.6, 0] }}
                transition={{ duration: 1, delay: 0.3 + i * 0.2, ease: "easeOut" }}
                className="absolute inset-0 rounded-full"
                style={{
                  border: `1px solid ${i % 2 === 0 ? "rgba(33,216,255,0.3)" : "rgba(231,251,16,0.2)"}`,
                }}
              />
            ))}
          </div>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-display text-4xl bg-gradient-to-r from-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent"
          data-testid="text-prelaunch-success"
        >
          YOU'RE ON THE LIST
        </motion.h3>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-2"
        >
          <p className="text-base text-white/60">
            We'll reach out when we launch.
          </p>
          <p className="text-sm text-white/40 italic">
            Something special is coming for our earliest supporters.
          </p>
          <p className="text-sm text-[#21d8ff]/60 font-medium">
            Stay tuned.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={handleClose}
          className="text-sm text-[#21d8ff]/60 hover:text-[#21d8ff] transition-colors flex items-center gap-1.5 mt-1"
          data-testid="button-success-continue"
        >
          Explore the platform <ArrowRight className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </Card>
  );
}

function PreLaunchState({
  email,
  setEmail,
  loading,
  error,
  handleSubmit,
  handleClose,
}: {
  email: string;
  setEmail: (v: string) => void;
  loading: boolean;
  error: string;
  handleSubmit: (e?: React.FormEvent) => void;
  handleClose: () => void;
}) {
  const isMobile = useIsMobile();

  return (
    <Card className="relative overflow-hidden border-0 bg-[#0a0a0e]" style={{ transform: "translateZ(0)", willChange: "transform" }}>
      {isMobile ? (
        <div
          className="absolute inset-0 rounded-md"
          style={{
            border: "1px solid rgba(33,216,255,0.25)",
            boxShadow: "0 0 30px rgba(33,216,255,0.08), 0 0 60px rgba(231,251,16,0.05)",
          }}
        />
      ) : (
        <motion.div
          className="absolute inset-0 rounded-md"
          animate={{
            boxShadow: [
              "inset 0 0 0 1px rgba(231,251,16,0.15), inset 0 0 0 2px rgba(33,216,255,0.08), 0 0 30px rgba(231,251,16,0.08), 0 0 60px rgba(33,216,255,0.05)",
              "inset 0 0 0 1px rgba(33,216,255,0.4), inset 0 0 0 2px rgba(231,251,16,0.15), 0 0 50px rgba(33,216,255,0.15), 0 0 100px rgba(231,251,16,0.08)",
              "inset 0 0 0 1px rgba(167,139,250,0.25), inset 0 0 0 2px rgba(33,216,255,0.1), 0 0 40px rgba(167,139,250,0.1), 0 0 80px rgba(33,216,255,0.06)",
              "inset 0 0 0 1px rgba(231,251,16,0.15), inset 0 0 0 2px rgba(33,216,255,0.08), 0 0 30px rgba(231,251,16,0.08), 0 0 60px rgba(33,216,255,0.05)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <HexGrid />
      {!isMobile && <ScanLine />}

      {!isMobile && (
        <>
          <FloatingParticle color="#E7FB10" delay={0} x="10%" y="15%" size={3} />
          <FloatingParticle color="#21d8ff" delay={0.8} x="85%" y="25%" size={4} />
          <FloatingParticle color="#a78bfa" delay={1.6} x="90%" y="60%" size={3} />
        </>
      )}
      <FloatingParticle color="#21d8ff" delay={2.4} x="8%" y="70%" size={2} />
      <FloatingParticle color="#E7FB10" delay={3.2} x="50%" y="85%" size={2} />

      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors z-20"
        data-testid="button-prelaunch-close"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative z-10 p-4 sm:p-5 flex flex-col gap-3 sm:gap-3.5">
        <div className="space-y-1 sm:space-y-2 text-center">
          <motion.h3
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl text-white leading-tight"
          >
            We know why you're <span className="bg-gradient-to-r from-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent">here.</span>
          </motion.h3>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-0.5 sm:space-y-1"
        >
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
            You've been burned before.
          </p>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
            Fake COAs. Underdosed vials. Vendors who vanish.
          </p>
          <p className="text-sm sm:text-base font-bold leading-relaxed text-[#ff2d9b]">
            We built Revive because researchers deserve better.
          </p>
        </motion.div>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs sm:text-sm uppercase tracking-widest font-semibold bg-gradient-to-r from-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent">
              What we actually built
            </span>
            <span className="text-[10px] sm:text-xs text-white/25 italic">live on this site</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
            <ShimmerCard delay={0.3} accentColor="#E7FB10">
              <div
                className="h-11 w-11 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(231,251,16,0.1)",
                  border: "1px solid rgba(231,251,16,0.3)",
                  boxShadow: "0 0 16px rgba(231,251,16,0.2)",
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, -8, 8, 0],
                    filter: [
                      "drop-shadow(0 0 2px rgba(231,251,16,0.3))",
                      "drop-shadow(0 0 8px rgba(231,251,16,0.7))",
                      "drop-shadow(0 0 2px rgba(231,251,16,0.3))",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <GraduationCap className="h-5 w-5 sm:h-5 sm:w-5 text-[#E7FB10]" />
                </motion.div>
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base text-white font-semibold leading-tight">Revive Research Academy</p>
                <p className="text-xs sm:text-sm text-white/45 leading-snug mt-0.5">Beginner or advanced — structured education built for real researchers.</p>
              </div>
            </ShimmerCard>

            <ShimmerCard delay={0.45} accentColor="#21d8ff">
              <div
                className="h-11 w-11 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(33,216,255,0.1)",
                  border: "1px solid rgba(33,216,255,0.3)",
                  boxShadow: "0 0 16px rgba(33,216,255,0.2)",
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -6, 0],
                    filter: [
                      "drop-shadow(0 0 2px rgba(33,216,255,0.3))",
                      "drop-shadow(0 0 8px rgba(33,216,255,0.7))",
                      "drop-shadow(0 0 2px rgba(33,216,255,0.3))",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                >
                  <FlaskConical className="h-5 w-5 sm:h-5 sm:w-5 text-[#21d8ff]" />
                </motion.div>
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base text-white font-semibold leading-tight">Revive Synergy Engine</p>
                <p className="text-xs sm:text-sm text-white/45 leading-snug mt-0.5">Build stacks. See pathway interactions instantly.</p>
              </div>
            </ShimmerCard>

            <ShimmerCard delay={0.6} accentColor="#a78bfa">
              <div
                className="h-11 w-11 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(167,139,250,0.1)",
                  border: "1px solid rgba(167,139,250,0.3)",
                  boxShadow: "0 0 16px rgba(167,139,250,0.2)",
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, -6, 10, 0],
                    filter: [
                      "drop-shadow(0 0 2px rgba(167,139,250,0.3))",
                      "drop-shadow(0 0 8px rgba(167,139,250,0.7))",
                      "drop-shadow(0 0 2px rgba(167,139,250,0.3))",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.9 }}
                >
                  <QrCode className="h-5 w-5 sm:h-5 sm:w-5 text-[#a78bfa]" />
                </motion.div>
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base text-white font-semibold leading-tight">Trust Nothing. Verify Everything.</p>
                <p className="text-xs sm:text-sm text-white/45 leading-snug mt-0.5">Scan any vial. Real third-party results. Instantly.</p>
              </div>
            </ShimmerCard>
          </div>
        </div>

        <div
          className="relative rounded-lg p-4 sm:p-4 space-y-2.5 sm:space-y-2"
          style={{
            background: "linear-gradient(135deg, rgba(231,251,16,0.04), rgba(33,216,255,0.04), rgba(167,139,250,0.03))",
            border: "1px solid rgba(231,251,16,0.12)",
          }}
        >
          <div className="space-y-1 text-center">
            <h4 className="font-display text-2xl sm:text-2xl bg-gradient-to-r from-[#E7FB10] via-[#21d8ff] to-[#a78bfa] bg-clip-text text-transparent leading-tight">
              LAUNCHING SOON
            </h4>
            <p className="text-sm sm:text-base text-white/60 leading-snug">
              Be the first to know when we go live.
            </p>
          </div>
          <p className="text-xs sm:text-sm text-[#21d8ff] font-medium leading-snug text-center">
            First-batch inventory is limited — early notification means first access.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-1">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/60 border-white/15 text-white placeholder:text-white/30 focus:border-[#21d8ff]/50 text-sm h-10 sm:h-11"
              data-testid="input-prelaunch-email"
            />
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(231,251,16,0.2), 0 0 40px rgba(33,216,255,0.08)",
                  "0 0 30px rgba(33,216,255,0.3), 0 0 60px rgba(231,251,16,0.15)",
                  "0 0 20px rgba(231,251,16,0.2), 0 0 40px rgba(33,216,255,0.08)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-md"
            >
              <Button
                type="submit"
                disabled={loading}
                className="no-default-hover-elevate w-full font-bold text-sm sm:text-base uppercase tracking-wide text-black h-10 sm:h-11"
                style={{
                  background: "linear-gradient(90deg, #E7FB10, #b8e600)",
                  border: "1px solid #E7FB10",
                }}
                data-testid="button-prelaunch-submit"
              >
                {loading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-black/30 border-t-black rounded-full" />
                ) : (
                  "NOTIFY ME"
                )}
              </Button>
            </motion.div>
            {error && <p className="text-red-400 text-xs sm:text-sm text-center">{error}</p>}
          </form>
        </div>

        <button
          onClick={handleClose}
          className="text-xs text-white/25 hover:text-white/45 transition-colors cursor-pointer text-center"
          data-testid="button-prelaunch-skip"
        >
          Maybe later
        </button>
      </div>
    </Card>
  );
}

export function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const shownRef = useRef(false);

  useEffect(() => {
    initSiteEnterTime();
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    suppressExitPopup();
    trackEvent("exit_intent_closed", "lead_capture");
  }, []);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (shownRef.current) return;
      if (e.clientY > 10) return;
      if (window.innerWidth <= 768) return;
      if (getTimeOnSite() < 30) return;
      if (isEmailCaptured()) return;
      if (isExitPopupSuppressed()) return;

      shownRef.current = true;
      setVisible(true);
      trackEvent("exit_intent_shown", "lead_capture");
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await captureEmail(email, "exit_intent");
    setLoading(false);
    if (result.success || result.duplicate) {
      setSuccess(true);
      setTimeout(() => {
        setVisible(false);
        suppressExitPopup();
      }, 2500);
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          data-testid="modal-exit-intent"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            style={{ width: "min(420px, calc(100vw - 32px))" }}
          >
            <Card className="relative overflow-hidden border-0 bg-[#0a0a0e]">
              <motion.div
                className="absolute inset-0 rounded-md"
                animate={{
                  boxShadow: [
                    "inset 0 0 0 1px rgba(231,251,16,0.2), 0 0 25px rgba(231,251,16,0.08)",
                    "inset 0 0 0 1px rgba(33,216,255,0.35), 0 0 40px rgba(33,216,255,0.12)",
                    "inset 0 0 0 1px rgba(231,251,16,0.2), 0 0 25px rgba(231,251,16,0.08)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <HexGrid />

              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors z-20"
                data-testid="button-exit-intent-close"
              >
                <X className="h-5 w-5" />
              </button>

              {success ? (
                <div className="relative z-10 flex flex-col items-center gap-4 p-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="h-16 w-16 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center"
                  >
                    <Check className="h-8 w-8 text-green-400" />
                  </motion.div>
                  <p className="text-lg text-white font-medium">You're on the list!</p>
                  <p className="text-sm text-white/40 italic text-center">
                    Something special is coming for our earliest supporters.
                  </p>
                </div>
              ) : (
                <div className="relative z-10 p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-[#E7FB10] flex-shrink-0" />
                    <h3 className="font-display text-2xl sm:text-3xl text-white">
                      BEFORE YOU GO
                    </h3>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-sm text-white/50">You've seen what we're building.</p>
                    <p className="text-sm text-white/50">You know we're different.</p>
                    <p className="text-sm text-white/70 font-medium">Don't miss our launch.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-black/60 border-white/15 text-white placeholder:text-white/30 focus:border-[#21d8ff]/50 text-sm"
                      data-testid="input-exit-email"
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className="no-default-hover-elevate w-full font-bold text-sm uppercase tracking-wide text-black"
                      style={{
                        background: "linear-gradient(90deg, #E7FB10, #b8e600)",
                        border: "1px solid #E7FB10",
                        boxShadow: "0 0 15px rgba(231,251,16,0.2)",
                      }}
                      data-testid="button-exit-submit"
                    >
                      {loading ? (
                        <span className="animate-spin h-5 w-5 border-2 border-black/30 border-t-black rounded-full" />
                      ) : (
                        "NOTIFY ME AT LAUNCH"
                      )}
                    </Button>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                  </form>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <ArrowRight className="h-3 w-3 text-[#21d8ff] flex-shrink-0" />
                      <span>QR-verified testing on every batch</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <ArrowRight className="h-3 w-3 text-[#21d8ff] flex-shrink-0" />
                      <span>Revive Synergy Engine included</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <ArrowRight className="h-3 w-3 text-[#E7FB10] flex-shrink-0" />
                      <span className="text-white/50 italic">Something special for early supporters</span>
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    className="text-xs text-white/25 hover:text-white/45 transition-colors cursor-pointer text-center"
                    data-testid="button-exit-skip"
                  >
                    Maybe later
                  </button>
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
