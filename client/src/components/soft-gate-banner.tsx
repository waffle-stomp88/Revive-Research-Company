import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export function SoftGateBanner() {
  const [location, setLocation] = useLocation();
  const returnTo = encodeURIComponent(location);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mb-6 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap"
      style={{
        background: "linear-gradient(135deg, #1c1c26, #141419)",
        border: "1px solid #E7FB1038",
        boxShadow: "0 0 24px #E7FB1010",
      }}
      data-testid="banner-soft-gate"
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: "#E7FB1015", border: "1px solid #E7FB1040" }}
        >
          <Lock className="w-3.5 h-3.5" style={{ color: "#E7FB10" }} />
        </div>
        <p className="text-sm text-gray-400 leading-snug">
          <span className="text-gray-200 font-medium">You're browsing in read-only mode.</span>
          {" "}Sign in to unlock verified pricing and place orders.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setLocation(`/login?returnTo=${returnTo}`)}
          className="h-8 px-3 rounded-md text-xs font-medium text-gray-300 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
          style={{ background: "#ffffff08" }}
          data-testid="button-gate-banner-signin"
        >
          Sign In
        </button>
        <button
          onClick={() => setLocation(`/login?returnTo=${returnTo}&mode=signup`)}
          className="h-8 px-3 rounded-md text-xs font-bold text-black flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          style={{ background: "#E7FB10" }}
          data-testid="button-gate-banner-create"
        >
          Create Free Account
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
