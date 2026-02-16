import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Check, ArrowRight, FlaskConical, Shield, QrCode, Sparkles, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { captureEmail, isEmailCaptured, validateEmail, isExitPopupSuppressed, suppressExitPopup, isScrollPopupShownThisSession, markScrollPopupShown, getTimeOnSite, initSiteEnterTime } from "@/lib/waitlist-utils";
import { trackEvent } from "@/lib/analytics";

export function WaitlistHeroBanner() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [foundingMember, setFoundingMember] = useState(false);
  const [alreadyCaptured, setAlreadyCaptured] = useState(false);
  const [error, setError] = useState("");

  const { data: countData } = useQuery<{ total: number; byProduct: Record<string, number> }>({
    queryKey: ["/api/waitlist/count"],
  });

  const count = countData?.total ?? 0;

  useEffect(() => {
    if (isEmailCaptured()) {
      setAlreadyCaptured(true);
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await captureEmail(email, "hero");
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setFoundingMember(result.foundingMember);
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  return (
    <section className="py-6 sm:py-10" data-testid="section-waitlist-hero">
      <div className="max-w-5xl mx-auto px-4">
        <Card className="border-[#21d8ff]/30 bg-gradient-to-b from-[#21d8ff]/5 to-transparent p-6 sm:p-8 overflow-visible">
          <div className="flex flex-col items-center text-center gap-4">
            <Badge className="no-default-hover-elevate bg-[#E7FB10]/10 text-[#E7FB10] border-[#E7FB10]/30 gap-1.5">
              <Bell className="h-3 w-3" />
              LAUNCHING IN 2-3 WEEKS
            </Badge>

            <h2 className="font-display text-xl sm:text-2xl">
              We're finalizing third-party testing
            </h2>

            <p className="text-muted-foreground text-sm">
              Join {count > 0 ? count : ""}+ researchers on the waitlist for early access
            </p>

            {alreadyCaptured ? (
              <div className="flex items-center gap-2 text-green-400" data-testid="text-waitlist-success-hero">
                <Check className="h-5 w-5" />
                <span className="text-sm font-medium">You're already on the list!</span>
              </div>
            ) : success ? (
              <div className="flex flex-col items-center gap-2" data-testid="text-waitlist-success-hero">
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="h-5 w-5" />
                  <span className="text-sm font-medium">You're on the list! We'll notify you at launch.</span>
                </div>
                {foundingMember && (
                  <div className="flex items-center gap-1.5 text-[#E7FB10]">
                    <Crown className="h-4 w-4" />
                    <span className="text-sm font-semibold">You're a Founding Member!</span>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full max-w-md">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    data-testid="input-waitlist-email-hero"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="no-default-hover-elevate bg-[#E7FB10] text-black border-[#E7FB10] gap-1.5"
                    data-testid="button-waitlist-submit-hero"
                  >
                    {loading ? (
                      <span className="animate-spin h-4 w-4 border-2 border-black/30 border-t-black rounded-full" />
                    ) : (
                      <>
                        Get Notified
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
                {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
              </form>
            )}

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-1">
              <span className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground/70">
                <Crown className="h-3 w-3" /> Founding Member status (first 100)
              </span>
              <span className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground/70">
                <Sparkles className="h-3 w-3" /> Lifetime 10% discount
              </span>
              <span className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground/70">
                <Bell className="h-3 w-3" /> Early access to new compounds
              </span>
            </div>
          </div>
        </Card>
      </div>
    </section>
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

  const { data: countData } = useQuery<{ total: number; byProduct: Record<string, number> }>({
    queryKey: ["/api/waitlist/count"],
  });

  const count = countData?.total ?? 0;

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
                  <p className="text-sm text-muted-foreground">We're launching in 2-3 weeks with:</p>

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
                    Join {count > 0 ? count : ""}+ researchers waiting:
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

                  <Badge className="no-default-hover-elevate self-center bg-[#E7FB10]/10 text-[#E7FB10] border-[#E7FB10]/30 gap-1">
                    <Crown className="h-3 w-3" />
                    First 100 get Founding Member perks
                  </Badge>

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

export function ScrollPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    initSiteEnterTime();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (shownRef.current || dismissed) return;
      if (isEmailCaptured()) return;
      if (isScrollPopupShownThisSession()) return;
      if (getTimeOnSite() < 60) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      if (scrollPercent >= 50) {
        shownRef.current = true;
        setVisible(true);
        markScrollPopupShown();
        trackEvent("scroll_popup_shown", "lead_capture");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dismissed]);

  const handleClose = () => {
    setVisible(false);
    setDismissed(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await captureEmail(email, "scroll");
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setVisible(false);
        setDismissed(true);
      }, 2000);
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed bottom-4 right-4 z-[9998] w-80"
          data-testid="popup-scroll"
        >
          <Card className="border-[#E7FB10]/30 shadow-lg p-4 relative overflow-visible">
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-muted-foreground/50 hover:text-foreground transition-colors"
              data-testid="button-scroll-popup-close"
            >
              <X className="h-4 w-4" />
            </button>

            {success ? (
              <div className="flex items-center gap-2 text-green-400 py-2">
                <Check className="h-5 w-5" />
                <span className="text-sm font-medium">You're on the list!</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pr-4">
                <p className="text-sm font-semibold">Liking what you see?</p>
                <p className="text-xs text-muted-foreground">Get notified when we launch:</p>
                <form onSubmit={handleSubmit} className="flex gap-1.5">
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 text-xs"
                    data-testid="input-waitlist-email-scroll"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={loading}
                    className="no-default-hover-elevate bg-[#E7FB10] text-black border-[#E7FB10] flex-shrink-0"
                    data-testid="button-waitlist-submit-scroll"
                  >
                    {loading ? (
                      <span className="animate-spin h-3 w-3 border-2 border-black/30 border-t-black rounded-full" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </Button>
                </form>
                {error && <p className="text-red-400 text-[10px]">{error}</p>}
                <p className="text-[10px] text-muted-foreground/50">First 100 get Founding Member perks</p>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
