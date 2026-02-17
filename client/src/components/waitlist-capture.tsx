import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Check, ArrowRight, Crown, Lock, Clock, AlertTriangle, Shield, FlaskConical, QrCode } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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

function getUrgencyMessage(spotsLeft: number): string {
  if (spotsLeft <= 0) return "";
  if (spotsLeft <= 4) return `LAST ${spotsLeft} SPOTS`;
  if (spotsLeft <= 9) return `FINAL ${spotsLeft} SPOTS`;
  if (spotsLeft <= 19) return `Only ${spotsLeft} spots left`;
  if (spotsLeft <= 29) return `${spotsLeft} of 50 remaining`;
  if (spotsLeft <= 39) return `${spotsLeft} spots remaining`;
  return `${spotsLeft} spots left`;
}

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
        height: "2px",
        background: "linear-gradient(90deg, transparent 5%, rgba(33,216,255,0.6) 30%, rgba(231,251,16,0.5) 50%, rgba(33,216,255,0.6) 70%, transparent 95%)",
        boxShadow: "0 0 12px rgba(33,216,255,0.3), 0 0 4px rgba(231,251,16,0.2)",
      }}
      animate={{
        top: ["0%", "100%", "0%"],
      }}
      transition={{
        duration: 5,
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

function GlowingBadge({ number }: { number: number }) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <motion.div
        animate={{
          boxShadow: [
            "0 0 15px rgba(33,216,255,0.3), 0 0 30px rgba(231,251,16,0.15)",
            "0 0 30px rgba(231,251,16,0.5), 0 0 60px rgba(33,216,255,0.25)",
            "0 0 15px rgba(33,216,255,0.3), 0 0 30px rgba(231,251,16,0.15)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="h-16 w-16 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, rgba(231,251,16,0.15), rgba(33,216,255,0.1))",
          border: "2px solid rgba(231,251,16,0.4)",
        }}
      >
        <span className="font-display text-2xl bg-gradient-to-r from-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent">
          #{number}
        </span>
      </motion.div>
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            "0 0 0 0px rgba(33,216,255,0.3)",
            "0 0 0 8px rgba(33,216,255,0)",
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
      />
    </div>
  );
}

function ShimmerCard({ children, delay = 0, accentColor }: { children: React.ReactNode; delay?: number; accentColor: string }) {
  return (
    <motion.div
      initial={{ x: -15, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, type: "spring", damping: 20 }}
      className="relative flex items-center gap-3 p-3 rounded-md overflow-hidden"
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
  const [foundingMember, setFoundingMember] = useState(false);
  const [foundingNumber, setFoundingNumber] = useState<number | null>(null);
  const [error, setError] = useState("");
  const shownRef = useRef(false);

  const { data: countData, refetch } = useQuery<WaitlistCountData>({
    queryKey: ["/api/waitlist/count"],
  });

  const foundingMembers = countData?.foundingMembers ?? 0;
  const spotsRemaining = countData?.spotsRemaining ?? 50;
  const isSoldOut = spotsRemaining <= 0;

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
            refetch();
            trackEvent("founding_popup_shown", "lead_capture");
          }
        }, 7000);
      }
    };

    checkAgeGate();

    const interval = setInterval(checkAgeGate, 500);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleClose = useCallback(() => {
    setVisible(false);
    suppressFoundingPopup();
    trackEvent("founding_popup_skipped", "lead_capture");
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    const source = isSoldOut ? "waitlist_popup" : "founding_popup";
    const result = await captureEmail(email, source);
    setLoading(false);
    if (result.success || result.duplicate) {
      setSuccess(true);
      setFoundingMember(result.foundingMember);
      setFoundingNumber(result.foundingMemberNumber);
      suppressFoundingPopup();
      setTimeout(() => {
        setVisible(false);
      }, 4000);
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  const nextNumber = foundingMembers + 1;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          data-testid="modal-founding-members"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 50 }}
            transition={{ type: "spring", damping: 18, stiffness: 250 }}
            style={{ width: "min(460px, calc(100vw - 32px))", maxHeight: "90vh", overflowY: "auto" }}
          >
            {success ? (
              <SuccessState
                foundingMember={foundingMember}
                foundingNumber={foundingNumber}
                isSoldOut={isSoldOut}
                handleClose={handleClose}
              />
            ) : isSoldOut ? (
              <SoldOutState
                email={email}
                setEmail={setEmail}
                loading={loading}
                error={error}
                handleSubmit={handleSubmit}
                handleClose={handleClose}
              />
            ) : (
              <FoundingState
                email={email}
                setEmail={setEmail}
                loading={loading}
                error={error}
                handleSubmit={handleSubmit}
                handleClose={handleClose}
                spotsRemaining={spotsRemaining}
                nextNumber={nextNumber}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SuccessState({
  foundingMember,
  foundingNumber,
  isSoldOut,
  handleClose,
}: {
  foundingMember: boolean;
  foundingNumber: number | null;
  isSoldOut: boolean;
  handleClose: () => void;
}) {
  return (
    <Card className="relative overflow-hidden border-0 bg-[#0a0a0e]">
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
      <HexGrid />
      <FloatingParticle color="#E7FB10" delay={0} x="15%" y="20%" size={4} />
      <FloatingParticle color="#21d8ff" delay={0.5} x="80%" y="30%" size={3} />
      <FloatingParticle color="#a78bfa" delay={1} x="60%" y="70%" size={3} />
      <FloatingParticle color="#E7FB10" delay={1.5} x="25%" y="75%" size={2} />

      <div className="relative z-10 flex flex-col items-center text-center gap-5 p-8">
        {foundingMember && foundingNumber ? (
          <>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, delay: 0.2 }}
            >
              <div className="relative">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 25px rgba(231,251,16,0.3), 0 0 50px rgba(33,216,255,0.15)",
                      "0 0 50px rgba(33,216,255,0.5), 0 0 100px rgba(231,251,16,0.3)",
                      "0 0 25px rgba(231,251,16,0.3), 0 0 50px rgba(33,216,255,0.15)",
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="h-24 w-24 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(231,251,16,0.2), rgba(33,216,255,0.1))",
                    border: "2px solid rgba(231,251,16,0.5)",
                  }}
                >
                  <Crown className="h-12 w-12 text-[#E7FB10]" />
                </motion.div>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: [0, 3], opacity: [0.8, 0] }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: `1px solid ${i % 2 === 0 ? "rgba(231,251,16,0.4)" : "rgba(33,216,255,0.3)"}`,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-display text-5xl bg-gradient-to-r from-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent"
              data-testid="text-founding-success"
            >
              YOU'RE IN
            </motion.h3>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="px-5 py-2.5 rounded-md"
              style={{
                background: "linear-gradient(135deg, rgba(231,251,16,0.1), rgba(33,216,255,0.05))",
                border: "1px solid rgba(231,251,16,0.3)",
              }}
            >
              <span className="font-display text-2xl bg-gradient-to-r from-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent">
                FOUNDING MEMBER #{foundingNumber}
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-base text-white/50"
            >
              Your pricing is locked forever. We'll email you at launch.
            </motion.p>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, delay: 0.1 }}
              className="h-20 w-20 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center"
            >
              <Check className="h-10 w-10 text-green-400" />
            </motion.div>
            <h3 className="font-display text-4xl text-[#21d8ff]" data-testid="text-waitlist-success">
              YOU'RE ON THE LIST
            </h3>
            <p className="text-base text-white/50">
              We'll notify you when we launch.
            </p>
          </>
        )}

        <button
          onClick={handleClose}
          className="text-sm text-[#21d8ff]/60 hover:text-[#21d8ff] transition-colors flex items-center gap-1 mt-1"
          data-testid="button-success-continue"
        >
          Continue exploring <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </Card>
  );
}

function FoundingState({
  email,
  setEmail,
  loading,
  error,
  handleSubmit,
  handleClose,
  spotsRemaining,
  nextNumber,
}: {
  email: string;
  setEmail: (v: string) => void;
  loading: boolean;
  error: string;
  handleSubmit: (e?: React.FormEvent) => void;
  handleClose: () => void;
  spotsRemaining: number;
  nextNumber: number;
}) {
  const urgency = getUrgencyMessage(spotsRemaining);
  const progressPercent = ((50 - spotsRemaining) / 50) * 100;

  return (
    <Card className="relative overflow-hidden border-0 bg-[#0a0a0e]">
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

      <HexGrid />
      <ScanLine />

      <FloatingParticle color="#E7FB10" delay={0} x="10%" y="15%" size={3} />
      <FloatingParticle color="#21d8ff" delay={0.8} x="85%" y="25%" size={4} />
      <FloatingParticle color="#a78bfa" delay={1.6} x="90%" y="60%" size={3} />
      <FloatingParticle color="#21d8ff" delay={2.4} x="8%" y="70%" size={2} />
      <FloatingParticle color="#E7FB10" delay={3.2} x="50%" y="85%" size={2} />

      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors z-20"
        data-testid="button-founding-popup-close"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative z-10 p-6 flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <GlowingBadge number={nextNumber} />
          <div>
            <h3 className="font-display text-3xl sm:text-4xl text-white leading-none">
              THIS SPOT IS <span className="bg-gradient-to-r from-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent">YOURS!</span>
            </h3>
            <p className="text-sm text-white/40 mt-1">Founding Member #{nextNumber} of 50</p>
          </div>
        </div>

        <p className="text-sm text-white/50 leading-relaxed">
          Fake COAs. Ghost vendors. Underdosed vials.
          <span className="text-white/70"> We built Revive because we were tired of it too.</span>
        </p>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-widest font-semibold bg-gradient-to-r from-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent">
              What we actually built
            </span>
            <span className="text-xs text-white/25 italic">live on this site</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <ShimmerCard delay={0.2} accentColor="#E7FB10">
              <div
                className="h-9 w-9 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(231,251,16,0.1)",
                  border: "1px solid rgba(231,251,16,0.25)",
                  boxShadow: "0 0 12px rgba(231,251,16,0.15)",
                }}
              >
                <QrCode className="h-4.5 w-4.5 text-[#E7FB10]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white font-semibold leading-tight">QR-Verified COAs</p>
                <p className="text-xs text-white/45 leading-tight mt-0.5">Scan any vial. See real third-party lab results.</p>
              </div>
            </ShimmerCard>

            <ShimmerCard delay={0.35} accentColor="#21d8ff">
              <div
                className="h-9 w-9 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(33,216,255,0.1)",
                  border: "1px solid rgba(33,216,255,0.25)",
                  boxShadow: "0 0 12px rgba(33,216,255,0.15)",
                }}
              >
                <FlaskConical className="h-4.5 w-4.5 text-[#21d8ff]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white font-semibold leading-tight">Synergy Engine</p>
                <p className="text-xs text-white/45 leading-tight mt-0.5">Build stacks. See pathway interactions instantly.</p>
              </div>
            </ShimmerCard>

            <ShimmerCard delay={0.5} accentColor="#a78bfa">
              <div
                className="h-9 w-9 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(167,139,250,0.1)",
                  border: "1px solid rgba(167,139,250,0.25)",
                  boxShadow: "0 0 12px rgba(167,139,250,0.15)",
                }}
              >
                <Shield className="h-4.5 w-4.5 text-[#a78bfa]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white font-semibold leading-tight">Batch-Level Tracking</p>
                <p className="text-xs text-white/45 leading-tight mt-0.5">Every vial traced. Every batch documented.</p>
              </div>
            </ShimmerCard>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-4">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <span className="text-xs uppercase tracking-widest font-semibold bg-gradient-to-r from-[#E7FB10] via-[#21d8ff] to-[#a78bfa] bg-clip-text text-transparent">
              Founding Member Perks
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center text-center gap-1.5 p-3 rounded-md"
              style={{
                background: "linear-gradient(180deg, rgba(231,251,16,0.06), transparent)",
                border: "1px solid rgba(231,251,16,0.15)",
              }}
            >
              <motion.div
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 3, delay: 1, repeat: Infinity, repeatDelay: 5 }}
              >
                <Lock className="h-5 w-5 text-[#E7FB10]" />
              </motion.div>
              <span className="text-xs text-white/70 leading-tight font-medium">Locked<br/>Pricing</span>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col items-center text-center gap-1.5 p-3 rounded-md"
              style={{
                background: "linear-gradient(180deg, rgba(33,216,255,0.06), transparent)",
                border: "1px solid rgba(33,216,255,0.15)",
              }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, delay: 2, repeat: Infinity, repeatDelay: 4 }}
              >
                <Clock className="h-5 w-5 text-[#21d8ff]" />
              </motion.div>
              <span className="text-xs text-white/70 leading-tight font-medium">48hr Early<br/>Access</span>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col items-center text-center gap-1.5 p-3 rounded-md"
              style={{
                background: "linear-gradient(180deg, rgba(167,139,250,0.06), transparent)",
                border: "1px solid rgba(167,139,250,0.15)",
              }}
            >
              <motion.div
                animate={{
                  filter: [
                    "drop-shadow(0 0 0px rgba(167,139,250,0))",
                    "drop-shadow(0 0 6px rgba(167,139,250,0.6))",
                    "drop-shadow(0 0 0px rgba(167,139,250,0))",
                  ],
                }}
                transition={{ duration: 2, delay: 3, repeat: Infinity, repeatDelay: 3 }}
              >
                <Crown className="h-5 w-5 text-[#a78bfa]" />
              </motion.div>
              <span className="text-xs text-white/70 leading-tight font-medium">Badge<br/>#{nextNumber}</span>
            </motion.div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <span className="text-sm text-white/60 font-medium" data-testid="text-spots-remaining">
              <AlertTriangle className="h-3.5 w-3.5 inline mr-1.5 text-[#E7FB10]" />
              {urgency}
            </span>
            <span className="text-sm text-[#21d8ff] font-display">{50 - spotsRemaining}/50</span>
          </div>
          <div
            className="h-2 rounded-full bg-white/[0.06] overflow-hidden relative"
            role="progressbar"
            aria-valuenow={50 - spotsRemaining}
            aria-valuemin={0}
            aria-valuemax={50}
            aria-label={`${50 - spotsRemaining} of 50 founding member spots claimed`}
            data-testid="progress-spots-filled"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(progressPercent, 8)}%` }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #E7FB10 0%, #21d8ff 50%, #a78bfa 100%)",
                backgroundSize: "200% 100%",
                backgroundPosition: "left",
                boxShadow: "0 0 12px rgba(33,216,255,0.5), 0 0 4px rgba(231,251,16,0.3)",
              }}
            />
            <motion.div
              className="absolute top-0 bottom-0 w-[30%] rounded-full pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(33,216,255,0.25), rgba(231,251,16,0.15), transparent)",
              }}
              animate={{ left: ["-30%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/60 border-white/15 text-white placeholder:text-white/30 focus:border-[#21d8ff]/50 text-sm"
            data-testid="input-founding-email"
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
              className="no-default-hover-elevate w-full font-bold text-sm uppercase tracking-wide text-black"
              style={{
                background: "linear-gradient(90deg, #E7FB10, #b8e600)",
                border: "1px solid #E7FB10",
              }}
              data-testid="button-founding-submit"
            >
              {loading ? (
                <span className="animate-spin h-5 w-5 border-2 border-black/30 border-t-black rounded-full" />
              ) : (
                `BECOME FOUNDING MEMBER #${nextNumber}`
              )}
            </Button>
          </motion.div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </form>

        <button
          onClick={handleClose}
          className="text-xs text-white/25 hover:text-white/45 transition-colors cursor-pointer text-center"
          data-testid="button-founding-skip"
        >
          Maybe later
        </button>
      </div>
    </Card>
  );
}

function SoldOutState({
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
  return (
    <Card className="relative overflow-hidden border-0 bg-[#0a0a0e]">
      <motion.div
        className="absolute inset-0 rounded-md"
        animate={{
          boxShadow: [
            "inset 0 0 0 1px rgba(33,216,255,0.2), 0 0 30px rgba(33,216,255,0.08)",
            "inset 0 0 0 1px rgba(33,216,255,0.5), 0 0 50px rgba(33,216,255,0.2)",
            "inset 0 0 0 1px rgba(33,216,255,0.2), 0 0 30px rgba(33,216,255,0.08)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <HexGrid />
      <ScanLine />
      <FloatingParticle color="#21d8ff" delay={0} x="15%" y="20%" size={3} />
      <FloatingParticle color="#a78bfa" delay={1} x="80%" y="40%" size={3} />

      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors z-20"
        data-testid="button-soldout-close"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative z-10 p-6 flex flex-col gap-5">
        <div className="text-center space-y-3">
          <h3 className="font-display text-3xl text-white">
            FOUNDING MEMBERS
          </h3>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-md px-4 py-2">
            <Crown className="h-4 w-4 text-[#E7FB10]" />
            <span className="text-sm text-white/60 font-medium">All 50 spots claimed</span>
          </div>
        </div>

        <p className="text-sm text-white/50 text-center leading-relaxed">
          Join the waitlist. We're launching soon with QR-verified testing, interactive synergy tools, and full batch documentation.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/60 border-white/15 text-white placeholder:text-white/30 focus:border-[#21d8ff]/50 text-sm"
            data-testid="input-waitlist-email"
          />
          <Button
            type="submit"
            disabled={loading}
            className="no-default-hover-elevate font-bold text-sm uppercase tracking-wide text-black"
            style={{
              background: "linear-gradient(90deg, #21d8ff, #1ab8dd)",
              border: "1px solid #21d8ff",
              boxShadow: "0 0 20px rgba(33,216,255,0.25)",
            }}
            data-testid="button-waitlist-submit"
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-black/30 border-t-black rounded-full" />
            ) : (
              "JOIN LAUNCH WAITLIST"
            )}
          </Button>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </form>

        <button
          onClick={handleClose}
          className="text-xs text-white/25 hover:text-white/45 transition-colors cursor-pointer text-center"
          data-testid="button-waitlist-skip"
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
  const [foundingMember, setFoundingMember] = useState(false);
  const [error, setError] = useState("");
  const shownRef = useRef(false);

  const { data: countData } = useQuery<WaitlistCountData>({
    queryKey: ["/api/waitlist/count"],
  });

  const total = countData?.total ?? 0;

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
    const result = await captureEmail(email, "exit");
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setFoundingMember(result.foundingMember);
      setTimeout(() => {
        setVisible(false);
        suppressExitPopup();
      }, 2000);
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          data-testid="modal-exit-intent"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <Card className="max-w-md w-full border-[#E7FB10]/30 bg-background p-6 relative overflow-visible">
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-muted-foreground/50 hover:text-foreground transition-colors"
                data-testid="button-exit-intent-close"
              >
                <X className="h-5 w-5" />
              </button>

              {success ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-6 w-6 text-green-400" />
                  </div>
                  <p className="text-green-400 font-medium">You're on the list!</p>
                  {foundingMember && (
                    <div className="flex items-center gap-1.5 text-[#E7FB10]">
                      <Crown className="h-4 w-4" />
                      <span className="text-sm font-semibold">You're a Founding Member!</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <h3 className="font-display text-2xl text-[#E7FB10]">Before You Go...</h3>
                  <p className="text-sm text-muted-foreground">We're launching soon with:</p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-[#21d8ff] flex-shrink-0" />
                      <span>Third-party tested peptides</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FlaskConical className="h-4 w-4 text-[#21d8ff] flex-shrink-0" />
                      <span>Interactive synergy tools</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <QrCode className="h-4 w-4 text-[#21d8ff] flex-shrink-0" />
                      <span>QR-verified batches</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Join {total > 0 ? `${total}+` : ""} researchers waiting:
                  </p>

                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1"
                      data-testid="input-waitlist-email-exit"
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className="no-default-hover-elevate bg-[#E7FB10] text-black border-[#E7FB10] gap-1.5"
                      data-testid="button-waitlist-submit-exit"
                    >
                      {loading ? "..." : "Notify Me"}
                      {!loading && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </form>
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
