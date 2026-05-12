import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Shield, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import logoPath from "@assets/Revive_PNG_1766012118069.png";

type Mode = "login" | "signup" | "forgot";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // On success, Supabase redirects the browser — no further action needed
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/auth/callback",
        },
      });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg("Check your email to confirm your account.");
      }
      return;
    }

    // Login
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    }
    // On success, the onAuthStateChange listener in useAuth picks up SIGNED_IN,
    // syncs to backend, and redirects via the stored return_to path.
  };

  const modeLabel = mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password";

  return (
    <div className="min-h-screen bg-[#0d0d12] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] bg-[#0a0a0f] border-r border-white/5 p-12 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full bg-[#E7FB10]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-80px] right-[-60px] w-[400px] h-[400px] rounded-full bg-[#21d8ff]/5 blur-[120px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src={logoPath} alt="Revive Research" className="h-9 w-auto" />
          <span
            className="text-white text-xl tracking-widest uppercase"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.2em" }}
          >
            Revive
          </span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1
              className="text-5xl text-white leading-tight mb-4"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Premium Peptide Research
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Third-party tested compounds with full Certificates of Analysis. Transparent pricing. Verified purity.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: FlaskConical, label: "Third-Party Lab Verified", sub: "Every batch tested by independent labs" },
              { icon: Shield, label: "Full COA Documentation", sub: "Certificate of Analysis for every product" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#E7FB10]/10 border border-[#E7FB10]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-[#E7FB10]" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{label}</p>
                  <p className="text-zinc-500 text-sm">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom disclaimer */}
        <div className="relative z-10">
          <p className="text-xs text-zinc-600 leading-relaxed">
            For research use only. Not for human or animal consumption. Must be 21+ to access. Products are not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <img src={logoPath} alt="Revive Research" className="h-8 w-auto" />
            <span
              className="text-white text-xl tracking-widest uppercase"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.2em" }}
            >
              Revive
            </span>
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
                <h2 className="text-3xl font-bold text-white mb-1">{modeLabel}</h2>
                <p className="text-zinc-500 text-sm">
                  {mode === "login" && "Welcome back to Revive Research."}
                  {mode === "signup" && "Create your researcher account."}
                  {mode === "forgot" && "Enter your email to receive a reset link."}
                </p>
              </div>

              {/* Error / success */}
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

              {/* Google OAuth — only on login/signup */}
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
                      <span className="px-3 bg-[#0d0d12] text-zinc-500">or continue with email</span>
                    </div>
                  </div>
                </>
              )}

              {/* Email/Password form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm text-zinc-400">Email address</Label>
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
                    <Label htmlFor="password" className="text-sm text-zinc-400">Password</Label>
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

                <Button
                  type="submit"
                  disabled={loading || googleLoading}
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

              {/* Toggle mode */}
              <div className="mt-6 text-center text-sm text-zinc-500">
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

              {/* RUO disclaimer */}
              <div className="mt-8 px-4 py-3 rounded-lg bg-red-950/20 border border-red-500/15">
                <p className="text-xs text-red-400/80 text-center leading-relaxed">
                  <span className="font-semibold text-red-400">Research Use Only.</span> You must be 21+ to create an account. Products are not for human or animal consumption.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
