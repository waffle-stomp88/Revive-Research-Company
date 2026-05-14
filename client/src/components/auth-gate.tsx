import { motion } from "framer-motion";
import { Lock, FlaskConical, Shield, GraduationCap, Sparkles, ArrowRight, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface AuthGateProps {
  title?: string;
  description?: string;
  inline?: boolean;
  inlineTitle?: string;
  inlineDescription?: string;
}

export function AuthGate({ title, description, inline, inlineTitle, inlineDescription }: AuthGateProps) {
  const [location, setLocation] = useLocation();

  const defaultTitle = "Researcher Access";
  const defaultDescription = "Create a free account to unlock our verified peptide catalog.";

  const badges = [
    { icon: FlaskConical, label: "Verified Peptides" },
    { icon: Shield, label: "COA Access" },
    { icon: GraduationCap, label: "Academy" },
  ];

  const returnTo = encodeURIComponent(location);
  const handleLogin = () => setLocation(`/login?returnTo=${returnTo}`);
  const handleCreateAccount = () => setLocation(`/login?returnTo=${returnTo}&mode=signup`);

  if (inline) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative rounded-2xl overflow-hidden"
        style={{ background: "#0d0d12", border: "1px solid #ffffff0f" }}
        data-testid="auth-gate-inline"
      >
        {/* Top accent line */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #E7FB10 40%, #21d8ff 70%, transparent)" }} />

        {/* Ambient glow */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-48 h-16 rounded-full blur-2xl pointer-events-none"
          style={{ background: "#E7FB1015" }} />

        <div className="relative px-5 py-5">
          {/* Header row */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #E7FB1020, #E7FB1008)", border: "1px solid #E7FB1035" }}
            >
              <Lock className="w-4 h-4" style={{ color: "#E7FB10" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-base font-bold text-white leading-tight"
                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em", fontSize: "1.1rem" }}
              >
                {inlineTitle || "Researcher Access Required"}
              </p>
              {!inlineDescription ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Droplets className="w-3 h-3 flex-shrink-0" style={{ color: "#21d8ff" }} />
                  <p className="text-xs" style={{ color: "#21d8ff" }}>Free BAC water included with first order</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5">{inlineDescription}</p>
              )}
            </div>
          </div>

          {/* Perks strip */}
          <div className="flex items-center mb-4 px-3 py-2.5 rounded-xl" style={{ background: "#ffffff06" }}>
            {["Verified pricing", "COA library", "Dashboard"].map((label, i) => (
              <div key={label} className="flex items-center flex-1 justify-center gap-1.5">
                {i > 0 && <div className="w-px h-3 bg-white/10 mr-3 flex-shrink-0" />}
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#E7FB10" }} />
                <span className="text-[10px] font-medium text-gray-300 whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <Button
            className="w-full h-10 text-sm font-bold text-black mb-2 rounded-xl"
            style={{ background: "#E7FB10" }}
            onClick={handleCreateAccount}
            data-testid="button-inline-gate-create"
          >
            Create Free Account
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>

          <button
            onClick={handleLogin}
            className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors py-1"
            data-testid="button-inline-gate-signin"
          >
            Already a researcher? <span className="text-gray-300 font-medium">Sign in</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 pt-16 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#E7FB10]/40 via-[#21d8ff]/20 to-[#E7FB10]/10 blur-sm" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#E7FB10]/20 via-transparent to-[#21d8ff]/20" />

        <div className="relative rounded-2xl bg-[#1a1a1f]/95 backdrop-blur-xl border border-white/10 p-8 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E7FB10]/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#21d8ff]/30 to-transparent" />

          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#E7FB10]/5 blur-3xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E7FB10]/20 to-[#E7FB10]/5 border border-[#E7FB10]/30 flex items-center justify-center"
              >
                <Lock className="w-5 h-5 text-[#E7FB10]" />
              </motion.div>
              <div>
                <h2
                  className="text-2xl font-bold text-white tracking-wide"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {title || defaultTitle}
                </h2>
              </div>
            </div>

            <p className="text-base text-zinc-400 mb-6 leading-relaxed">
              {description || defaultDescription}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#21d8ff]/30 bg-[#21d8ff]/5"
                >
                  <badge.icon className="w-4 h-4 text-[#21d8ff]" />
                  <span className="text-sm text-[#21d8ff] font-medium">{badge.label}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={handleCreateAccount}
                className="w-full h-12 text-base font-semibold bg-[#E7FB10] hover:bg-[#E7FB10]/90 text-black rounded-xl group"
                data-testid="button-auth-gate-login"
              >
                <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </motion.div>

            <p className="text-center text-sm text-zinc-500 mt-4">
              Already a researcher?{" "}
              <button
                onClick={handleLogin}
                className="text-[#21d8ff] hover:text-[#21d8ff]/80 font-medium transition-colors"
                data-testid="button-auth-gate-signin"
              >
                Sign in
              </button>
            </p>

            <div className="mt-5 pt-4 border-t border-white/5">
              <div className="px-3 py-2 rounded-lg bg-red-950/30 border border-red-500/20">
                <p className="text-xs text-red-400 text-center">
                  <span className="font-semibold">Research Use Only:</span> Products are for laboratory research.
                  Must be 21+ to create account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
