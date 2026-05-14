import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Shield, Eye, EyeOff, ArrowRight, Loader2, HeartHandshake, Lock, Database, BellOff, ChevronRight, CheckSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import logoPath from "@assets/Revive_PNG_1766012118069.png";

const TRUST_POINTS = [
  { icon: FlaskConical, color: "#E7FB10", title: "Research tools built into the platform.", subtitle: "Synergy scoring, pharmacokinetics charts, and a reconstitution wizard — tools for your research, not just your order." },
  { icon: Shield, color: "#21d8ff", title: "Transparency you can verify.", subtitle: "Batch archive, COA library, and ethical pricing — published openly, not hidden behind a claim." },
  { icon: HeartHandshake, color: "#a855f7", title: "More than a vendor. A research partner.", subtitle: "Compound profiles, guided education, and stack analysis — the relationship doesn't end when the box ships." },
];

const TRUST_BADGES = [
  { icon: Lock, label: "SSL Encrypted" },
  { icon: Database, label: "Data Protected" },
  { icon: BellOff, label: "No Spam" },
];

const AVATAR_COLORS = ["#E7FB10", "#21d8ff", "#a855f7", "#ec4899", "#22c55e"];

function PKChartVisual() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="absolute inset-0 p-5 flex flex-col"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#E7FB1015", border: "1px solid #E7FB1030" }}>
          <FlaskConical className="w-4 h-4" style={{ color: "#E7FB10" }} />
        </div>
        <span className="text-sm font-semibold text-white/80 tracking-wide">Pharmacokinetics</span>
        <span className="ml-auto text-[10px] font-mono text-gray-500">BPC-157</span>
      </div>
      <div className="flex-1 relative">
        <svg viewBox="0 0 220 80" className="w-full h-full" preserveAspectRatio="none">
          <line x1="0" y1="65" x2="220" y2="65" stroke="#ffffff06" strokeWidth="1"/>
          <line x1="0" y1="38" x2="220" y2="38" stroke="#ffffff06" strokeWidth="1"/>
          <line x1="0" y1="10" x2="220" y2="10" stroke="#ffffff06" strokeWidth="1"/>
          <motion.path
            d="M 0 75 C 8 75 12 8 28 6 C 40 4 52 22 75 40 C 105 60 145 70 220 74"
            fill="none" stroke="#E7FB10" strokeWidth="2.5" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.3, ease: "easeInOut" }}
          />
          <motion.path
            d="M 0 75 C 8 75 12 8 28 6 C 40 4 52 22 75 40 C 105 60 145 70 220 74 L 220 75 Z"
            fill="#E7FB10" fillOpacity="0.08"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          />
          <motion.circle cx="28" cy="6" r="4" fill="#E7FB10"
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 400 }}
          />
        </svg>
      </div>
      <div className="flex gap-2 mt-3">
        {[["T½", "4.2h"], ["Tmax", "1.8h"], ["Bio", "85%"]].map(([label, val]) => (
          <div key={label} className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ background: "#E7FB1010", border: "1px solid #E7FB1020" }}>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm font-bold" style={{ color: "#E7FB10" }}>{val}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function COAVisual() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="absolute inset-0 p-5 flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Certificate of Analysis</p>
          <p className="text-base font-mono font-bold text-white mt-1">#2025-BPC-047</p>
          <p className="text-xs text-gray-400 mt-0.5">Janoshik Analytical</p>
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "#21d8ff18", border: "1px solid #21d8ff40" }}
        >
          <CheckCircle2 className="w-6 h-6" style={{ color: "#21d8ff" }} />
        </motion.div>
      </div>
      <div className="space-y-3.5">
        {[["Purity", 99.2, "#21d8ff"], ["Identity", 100, "#E7FB10"], ["Endotoxin", 97, "#a855f7"]].map(([label, val, color]) => (
          <div key={String(label)}>
            <div className="flex justify-between mb-1.5">
              <span className="text-sm text-gray-300">{String(label)}</span>
              <span className="text-sm font-bold font-mono" style={{ color: String(color) }}>{Number(val).toFixed(1)}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: "#ffffff08" }}>
              <motion.div className="h-full rounded-full" style={{ background: String(color) }}
                initial={{ width: "0%" }} animate={{ width: `${val}%` }}
                transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <motion.div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#21d8ff" }}
          animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-xs text-gray-400">Independent · Third-party verified</span>
      </div>
    </motion.div>
  );
}

function StackVisual() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="absolute inset-0 p-5 flex flex-col justify-between"
    >
      <div className="flex items-center justify-center gap-4">
        {(["BPC-157", "TB-500"] as const).map((name, i) => (
          <motion.div key={name}
            initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
            className="px-5 py-3 rounded-xl text-center"
            style={{ background: "#a855f718", border: "1px solid #a855f740" }}
          >
            <p className="text-sm font-bold text-white">{name}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Peptide</p>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className="flex-1">
          <motion.div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #a855f7)" }}
            initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          />
        </div>
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
            <circle cx="32" cy="32" r="24" fill="none" stroke="#ffffff08" strokeWidth="5" />
            <motion.circle cx="32" cy="32" r="24" fill="none" stroke="#a855f7" strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 24}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - 0.94) }}
              transition={{ delay: 0.5, duration: 1.1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span className="text-2xl font-black text-white leading-none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>94</motion.span>
            <span className="text-[9px] text-gray-500 mt-0.5">synergy</span>
          </div>
        </div>
        <div className="flex-1">
          <motion.div className="h-px w-full" style={{ background: "linear-gradient(90deg, #21d8ff, transparent)" }}
            initial={{ scaleX: 0, originX: 1 }} animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {["Tissue Repair", "Healing", "Recovery"].map((tag, i) => (
          <motion.span key={tag}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + i * 0.08 }}
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: "#a855f712", color: "#a855f7", border: "1px solid #a855f730" }}
          >{tag}</motion.span>
        ))}
      </div>
    </motion.div>
  );
}

const ATTESTATION_TEXT =
  "I confirm I am 21+ years of age and that all products purchased are for laboratory research purposes only. Not for human or animal consumption.";

type Mode = "login" | "signup" | "forgot";

export default function LoginPage() {
  const [, navigate] = useLocation();

  // Read returnTo and mode from URL query params
  const searchParams = new URLSearchParams(window.location.search);
  const returnTo = searchParams.get("returnTo") || "/dashboard";
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [attestationChecked, setAttestationChecked] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveSlide(p => (p + 1) % 3), 4500);
    return () => clearInterval(timer);
  }, []);

  // Navigate to returnTo after successful email/password sign-in
  const handlePostSignIn = () => {
    navigate(returnTo);
  };

  const handleGoogleLogin = async () => {
    setError("");
    // When in signup mode, attestation must be checked before proceeding
    if (mode === "signup" && !attestationChecked) {
      setError("You must confirm the research use attestation to create an account.");
      return;
    }
    setGoogleLoading(true);
    // Persist returnTo so auth-callback can redirect back after OAuth
    try {
      sessionStorage.setItem("auth_return_to", returnTo);
      if (mode === "signup") sessionStorage.setItem("ruo_attest_pending", "1");
    } catch {}
    const redirectTo = window.location.origin + "/auth/callback";
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
      return;
    }
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/auth/callback",
      });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg("Check your email for a password reset link.");
      }
      return;
    }

    if (mode === "signup") {
      if (!attestationChecked) {
        setError("You must confirm the research use attestation to create an account.");
        setLoading(false);
        return;
      }
      // Persist the returnTo and attestation flag so auth-callback can use them
      try {
        sessionStorage.setItem("auth_return_to", returnTo);
        sessionStorage.setItem("ruo_attest_pending", "1");
      } catch {}
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/auth/callback",
        },
      });
      setLoading(false);
      if (error) {
        try { sessionStorage.removeItem("ruo_attest_pending"); } catch {}
        setError(error.message);
      } else {
        setSuccessMsg("Check your email to confirm your account.");
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      handlePostSignIn();
    }
  };

  const modeLabel = mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password";

  return (
    <div className="min-h-screen flex bg-[#1a1a1f]">
      {/* Left Panel — brand hero */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(231,251,16,0.06) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(33,216,255,0.07) 0%, transparent 55%), linear-gradient(135deg, #0d0d10 0%, #1a1a1f 50%, #0f0f14 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          <Link href="/">
            <img
              src={logoPath}
              alt="Revive Research"
              className="h-16 w-auto opacity-95 hover:opacity-100 transition-opacity"
              data-testid="img-login-logo"
            />
          </Link>

          <div className="flex-1 flex flex-col justify-center items-center text-center mt-12">
            <h1
              className="text-5xl xl:text-6xl font-bold mb-2 leading-tight text-white"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}
              data-testid="heading-login-hero"
            >
              Why Researchers Choose
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #E7FB10, #21d8ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Revive Research
              </span>
            </h1>
            <p className="text-base text-gray-400 mb-10">
              Premium peptide compounds with verified purity you can trust.
            </p>

            <div className="w-full max-w-sm">
              {/* Animated visual panel */}
              <div
                className="relative rounded-2xl overflow-hidden mb-4"
                style={{ background: "#0b0b10", border: "1px solid #ffffff0d", height: "280px" }}
              >
                {/* Subtle scanline overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, #ffffff03 3px, #ffffff03 4px)",
                  zIndex: 10
                }} />
                <AnimatePresence mode="wait">
                  {activeSlide === 0 && <PKChartVisual key="pk" />}
                  {activeSlide === 1 && <COAVisual key="coa" />}
                  {activeSlide === 2 && <StackVisual key="stack" />}
                </AnimatePresence>
              </div>

              {/* Text below panel */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}
                  className="text-left min-h-[56px]"
                >
                  <p className="font-semibold text-sm leading-snug" style={{ color: TRUST_POINTS[activeSlide].color }}>
                    {TRUST_POINTS[activeSlide].title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    {TRUST_POINTS[activeSlide].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Dot / progress navigation */}
              <div className="flex items-center gap-2 mt-3">
                {TRUST_POINTS.map((point, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className="h-1 rounded-full transition-all duration-400 cursor-pointer"
                    style={{
                      background: i === activeSlide ? point.color : "#ffffff18",
                      width: i === activeSlide ? "28px" : "8px",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-10">
            <div className="flex items-center gap-3" data-testid="social-proof-row">
              <div className="flex -space-x-2">
                {AVATAR_COLORS.map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#1a1a1f] flex items-center justify-center text-[10px] font-bold"
                    style={{ background: `${color}22`, color, zIndex: 5 - i }}
                  >
                    {["R", "K", "M", "J", "S"][i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Trusted by 1,000+ Researchers</p>
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 text-[#E7FB10]">
                      <svg viewBox="0 0 12 12" fill="currentColor"><path d="M6 0l1.5 4.5H12L8.25 7.5 9.75 12 6 9l-3.75 3 1.5-4.5L0 4.5h4.5z" /></svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/peptides" data-testid="link-browse-products">
              <span className="text-xs text-gray-400 hover:text-[#21d8ff] transition-colors flex items-center gap-1 cursor-pointer">
                Browse Products
                <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel — auth forms */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12 bg-[#12121a]">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/">
            <img src={logoPath} alt="Revive Research" className="h-9 w-auto mx-auto" />
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Free BAC water first-order promo badge */}
          <div className="flex justify-center mb-6">
            <Badge
              className="bg-[#21d8ff]/10 text-[#21d8ff] border border-[#21d8ff]/30 text-xs font-semibold px-3 py-1"
              data-testid="badge-promo"
            >
              First Order? Free Bacteriostatic Water Included
            </Badge>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-8">
                <h2
                  className="text-3xl font-bold text-white mb-1"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}
                >
                  {modeLabel}
                </h2>
                <p className="text-sm text-gray-400">
                  {mode === "login" && "Welcome back to Revive Research."}
                  {mode === "signup" && "Create your researcher account."}
                  {mode === "forgot" && "Enter your email to receive a reset link."}
                </p>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-green-950/40 border border-green-500/30 text-green-400 text-sm">
                  {successMsg}
                </div>
              )}

              {mode !== "forgot" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-white/15 bg-white/5 hover:bg-white/10 text-white gap-3 mb-5"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                    data-testid="button-google-login"
                  >
                    {googleLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    Continue with Google
                  </Button>

                  <div className="relative mb-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-[#12121a] text-gray-500">or continue with email</span>
                    </div>
                  </div>
                </>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm text-gray-400">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-white/5 border-white/15 text-white placeholder:text-zinc-600 focus:border-[#E7FB10]/50 focus:ring-[#E7FB10]/20"
                    data-testid="input-email"
                  />
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm text-gray-400">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="h-11 bg-white/5 border-white/15 text-white placeholder:text-zinc-600 pr-10 focus:border-[#E7FB10]/50 focus:ring-[#E7FB10]/20"
                        data-testid="input-password"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => { setMode("forgot"); setError(""); setSuccessMsg(""); }}
                        className="text-xs text-zinc-500 hover:text-[#21d8ff] transition-colors mt-1"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                )}

                {/* Attestation checkbox — signup only */}
                {mode === "signup" && (
                  <label
                    className="flex items-start gap-3 cursor-pointer group"
                    htmlFor="signup-attestation"
                    data-testid="label-attestation"
                  >
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        id="signup-attestation"
                        type="checkbox"
                        checked={attestationChecked}
                        onChange={(e) => setAttestationChecked(e.target.checked)}
                        className="sr-only"
                        data-testid="checkbox-signup-attestation"
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          attestationChecked
                            ? "bg-[#E7FB10] border-[#E7FB10]"
                            : "border-zinc-600 bg-transparent group-hover:border-zinc-400"
                        }`}
                      >
                        {attestationChecked && <CheckSquare className="w-3 h-3 text-black" />}
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 leading-relaxed">
                      {ATTESTATION_TEXT}
                    </span>
                  </label>
                )}

                <Button
                  type="submit"
                  disabled={loading || googleLoading || (mode === "signup" && !attestationChecked)}
                  className="w-full h-11 bg-[#E7FB10] hover:bg-[#E7FB10]/90 text-black font-semibold gap-2 mt-2"
                  data-testid="button-submit-auth"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {modeLabel}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                {mode === "login" && (
                  <>
                    No account?{" "}
                    <button
                      onClick={() => { setMode("signup"); setError(""); setSuccessMsg(""); }}
                      className="text-[#21d8ff] hover:text-[#21d8ff]/80 font-medium transition-colors"
                      data-testid="button-switch-to-signup"
                    >
                      Create one
                    </button>
                  </>
                )}
                {(mode === "signup" || mode === "forgot") && (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                      className="text-[#21d8ff] hover:text-[#21d8ff]/80 font-medium transition-colors"
                      data-testid="button-switch-to-login"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 mt-6">
                {TRUST_BADGES.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div key={badge.label} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <Icon className="h-3 w-3" />
                      {badge.label}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 px-4 py-3 rounded-lg bg-red-950/20 border border-red-500/15">
                <p className="text-xs text-red-400/80 text-center leading-relaxed">
                  <span className="font-semibold text-red-400">Research Use Only.</span> You must be 21+ to create an account. Products are not for human or animal consumption.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:hidden mt-8">
          <Link href="/peptides" data-testid="link-browse-products-mobile">
            <span className="text-xs text-gray-500 hover:text-[#21d8ff] transition-colors flex items-center gap-1 justify-center cursor-pointer">
              Browse Products without signing in
              <ChevronRight className="h-3 w-3" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
