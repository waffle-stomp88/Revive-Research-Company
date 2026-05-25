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
      className="mb-6 rounded-lg px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center"
      style={{
        background: "linear-gradient(135deg, #1c1c26, #141419)",
        border: "1px solid #D4FF1F38",
        boxShadow: "0 0 24px #D4FF1F10",
      }}
      data-testid="banner-soft-gate"
    >
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "#D4FF1F15", border: "1px solid #D4FF1F40" }}
        >
          <Lock className="w-3.5 h-3.5" style={{ color: "#D4FF1F" }} />
        </div>
        <p className="text-sm text-gray-400 leading-snug">
          <span className="text-gray-200 font-medium">You're browsing in read-only mode.</span>
          {" "}Sign in to unlock verified pricing and place orders.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setLocation(`/login?returnTo=${returnTo}`)}
          className="flex-1 md:flex-none h-8 px-3 rounded-md text-xs font-medium text-gray-300 hover:text-white border border-white/10 hover:border-white/20 transition-colors text-center"
          style={{ background: "#ffffff08" }}
          data-testid="button-gate-banner-signin"
        >
          Sign In
        </button>
        <button
          onClick={() => setLocation(`/login?returnTo=${returnTo}&mode=signup`)}
          className="flex-1 md:flex-none h-8 px-3 rounded-md text-xs font-bold text-black flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
          style={{ background: "#D4FF1F" }}
          data-testid="button-gate-banner-create"
        >
          Create Free Account
          <ArrowRight className="w-3 h-3 flex-shrink-0" />
        </button>
      </div>
    </motion.div>
  );
}
