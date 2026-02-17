import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Check, ArrowRight, FlaskConical, Shield, QrCode, Crown, Lock, Clock, AlertTriangle } from "lucide-react";
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
  if (spotsLeft <= 4) return `LAST ${spotsLeft} SPOTS - Closes forever at 50`;
  if (spotsLeft <= 9) return `FINAL ${spotsLeft} SPOTS`;
  if (spotsLeft <= 19) return `Only ${spotsLeft} spots left!`;
  if (spotsLeft <= 29) return `Less than half available - ${spotsLeft}/50 left`;
  if (spotsLeft <= 39) return `Only ${spotsLeft} Founding Member spots remaining`;
  return `Only ${spotsLeft} spots left`;
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
    if (result.success) {
      setSuccess(true);
      setFoundingMember(result.foundingMember);
      setFoundingNumber(result.foundingMemberNumber);
      suppressFoundingPopup();
      setTimeout(() => {
        setVisible(false);
      }, 3000);
    } else if (result.duplicate) {
      setSuccess(true);
      setFoundingMember(result.foundingMember);
      setFoundingNumber(result.foundingMemberNumber);
      suppressFoundingPopup();
      setTimeout(() => {
        setVisible(false);
      }, 3000);
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-0 sm:p-4"
          data-testid="modal-founding-members"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="w-full h-full sm:h-auto sm:max-w-[600px] overflow-y-auto"
          >
            <Card className="min-h-full sm:min-h-0 border-[#E7FB10]/40 bg-[#111115] relative overflow-visible shadow-[0_0_60px_rgba(231,251,16,0.08)]">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white/40 hover:text-[#E7FB10] transition-colors z-10"
                data-testid="button-founding-popup-close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-6 sm:p-8">
                {success ? (
                  <SuccessState
                    foundingMember={foundingMember}
                    foundingNumber={foundingNumber}
                    isSoldOut={isSoldOut}
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
              </div>
            </Card>
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
}: {
  foundingMember: boolean;
  foundingNumber: number | null;
  isSoldOut: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15, delay: 0.1 }}
        className="h-16 w-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center"
      >
        <Check className="h-8 w-8 text-green-400" />
      </motion.div>

      {foundingMember && foundingNumber ? (
        <>
          <h3 className="font-display text-3xl sm:text-4xl text-[#E7FB10]" data-testid="text-founding-success">
            YOU'RE IN!
          </h3>
          <p className="text-lg text-white/90">
            You're <span className="text-[#E7FB10] font-bold">Founding Member #{foundingNumber}</span> of 50
          </p>
          <p className="text-sm text-white/50">
            Your locked pricing is secured.<br />
            We'll email you when we launch.
          </p>
        </>
      ) : (
        <>
          <h3 className="font-display text-3xl sm:text-4xl text-[#E7FB10]" data-testid="text-waitlist-success">
            YOU'RE ON THE WAITLIST
          </h3>
          <p className="text-sm text-white/50">
            We'll notify you when we launch.
          </p>
        </>
      )}

      <a
        href="/"
        className="text-sm text-[#E7FB10]/80 hover:text-[#E7FB10] transition-colors flex items-center gap-1 mt-2"
      >
        Explore the platform <ArrowRight className="h-3 w-3" />
      </a>
    </div>
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

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-3">
        <h3 className="font-display text-2xl sm:text-3xl text-white leading-tight">
          We know why you're here.
        </h3>
        <p className="text-sm text-white/60 leading-relaxed">
          You've been burned before. Fake COAs. Underdosed vials. Vendors who vanish.
          You spend hours on PubMed researching synergies because you can't find a vendor you actually trust.
        </p>
        <p className="text-sm text-white/60 leading-relaxed">
          We built Revive because we were tired of the same thing.
        </p>
      </div>

      <div className="border-t border-white/10 pt-4">
        <p className="text-xs font-semibold text-[#E7FB10] uppercase tracking-wider mb-3">
          Here's what's different
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <QrCode className="h-4 w-4 text-[#E7FB10] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white/80">
              <span className="text-white font-medium">QR-scan any vial.</span>{" "}
              See the actual third-party test results. No fake PDFs. No trust required.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <FlaskConical className="h-4 w-4 text-[#E7FB10] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white/80">
              <span className="text-white font-medium">Interactive Synergy Map</span>{" "}
              shows you what works together. No more 3-hour PubMed rabbit holes.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="h-4 w-4 text-[#E7FB10] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white/80">
              <span className="text-white font-medium">Every batch documented.</span>{" "}
              Every claim verifiable. We put our reputation on every vial.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <p className="text-xs font-semibold text-[#E7FB10] uppercase tracking-wider mb-3">
          Launching Soon
        </p>
        <p className="text-sm text-white/70 mb-3">
          We're only taking <span className="text-[#E7FB10] font-bold">50 Founding Members</span>. Ever.
        </p>

        <div className="space-y-2.5 mb-4">
          <div className="flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-[#E7FB10] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white/80">
              <span className="text-white font-medium">You lock in our launch prices. Forever.</span>
              <br />
              <span className="text-white/50 text-xs">When we raise prices, you still pay today's rates.</span>
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock className="h-4 w-4 text-[#E7FB10] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white/80">
              <span className="text-white font-medium">48hrs early access to every new compound.</span>
              <br />
              <span className="text-white/50 text-xs">Before the public. Before the rush.</span>
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <Crown className="h-4 w-4 text-[#E7FB10] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white/80">
              <span className="text-white font-medium">You're not customer #4,847. You're Founding Member #{nextNumber}.</span>
              <br />
              <span className="text-white/50 text-xs">We'll actually remember your name.</span>
            </p>
          </div>
        </div>

        <p className="text-sm text-white/50 mb-4">
          After 50, this never happens again.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 bg-black/50 border-white/20 text-white placeholder:text-white/30 focus:border-[#E7FB10] text-base"
          data-testid="input-founding-email"
        />
        <Button
          type="submit"
          disabled={loading}
          className="no-default-hover-elevate h-12 bg-[#E7FB10] text-black border-[#E7FB10] font-bold text-sm uppercase tracking-wide"
          data-testid="button-founding-submit"
        >
          {loading ? (
            <span className="animate-spin h-5 w-5 border-2 border-black/30 border-t-black rounded-full" />
          ) : (
            `BECOME FOUNDING MEMBER #${nextNumber}`
          )}
        </Button>
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      </form>

      <div className="flex flex-col items-center gap-3 pt-1">
        <p className="text-sm font-semibold text-[#E7FB10]" data-testid="text-spots-remaining">
          <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
          {urgency}
        </p>
        <p className="text-xs text-white/30">
          Once we hit 50, this closes forever.
        </p>
        <button
          onClick={handleClose}
          className="text-xs text-white/25 hover:text-white/40 transition-colors cursor-pointer"
          data-testid="button-founding-skip"
        >
          Maybe later - I'll pay full price
        </button>
      </div>
    </div>
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
    <div className="flex flex-col gap-5">
      <div className="text-center space-y-2">
        <h3 className="font-display text-2xl sm:text-3xl text-white">
          FOUNDING MEMBER PROGRAM CLOSED
        </h3>
        <div className="inline-flex items-center gap-2 bg-[#E7FB10]/10 border border-[#E7FB10]/20 rounded-md px-3 py-1.5">
          <Crown className="h-4 w-4 text-[#E7FB10]" />
          <span className="text-sm text-[#E7FB10] font-medium">All 50 spots have been claimed!</span>
        </div>
      </div>

      <p className="text-sm text-white/60 text-center">
        You can still join the waitlist to get notified when we launch:
      </p>

      <div className="space-y-2.5">
        <div className="flex items-center gap-3">
          <QrCode className="h-4 w-4 text-[#21d8ff] flex-shrink-0" />
          <span className="text-sm text-white/80">QR-verifiable third-party testing</span>
        </div>
        <div className="flex items-center gap-3">
          <FlaskConical className="h-4 w-4 text-[#21d8ff] flex-shrink-0" />
          <span className="text-sm text-white/80">Interactive Synergy Map tool</span>
        </div>
        <div className="flex items-center gap-3">
          <Shield className="h-4 w-4 text-[#21d8ff] flex-shrink-0" />
          <span className="text-sm text-white/80">Batch documentation on every vial</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 bg-black/50 border-white/20 text-white placeholder:text-white/30 focus:border-[#21d8ff] text-base"
          data-testid="input-waitlist-email"
        />
        <Button
          type="submit"
          disabled={loading}
          className="no-default-hover-elevate h-12 bg-[#21d8ff] text-black border-[#21d8ff] font-bold text-sm uppercase tracking-wide"
          data-testid="button-waitlist-submit"
        >
          {loading ? (
            <span className="animate-spin h-5 w-5 border-2 border-black/30 border-t-black rounded-full" />
          ) : (
            "JOIN LAUNCH WAITLIST"
          )}
        </Button>
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      </form>

      <div className="flex flex-col items-center gap-2 pt-1">
        <p className="text-xs text-white/40">
          Standard pricing applies. (Locked Founding Member rates sold out)
        </p>
        <button
          onClick={handleClose}
          className="text-xs text-white/25 hover:text-white/40 transition-colors cursor-pointer"
          data-testid="button-waitlist-skip"
        >
          Maybe later
        </button>
      </div>
    </div>
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
                      {loading ? (
                        <span className="animate-spin h-4 w-4 border-2 border-black/30 border-t-black rounded-full" />
                      ) : (
                        "Get Notified"
                      )}
                    </Button>
                  </form>
                  {error && <p className="text-red-400 text-xs">{error}</p>}

                  <button
                    onClick={handleClose}
                    className="text-xs text-muted-foreground/50 underline cursor-pointer self-center mt-1"
                    data-testid="button-exit-intent-skip"
                  >
                    No thanks, I'll check back later
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
