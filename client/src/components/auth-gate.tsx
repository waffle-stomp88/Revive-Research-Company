import { motion } from "framer-motion";
import { Lock, FlaskConical, Shield, GraduationCap, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface AuthGateProps {
  title?: string;
  description?: string;
}

export function AuthGate({ title, description }: AuthGateProps) {
  const { login } = useAuth();

  const defaultTitle = "Researcher Access";
  const defaultDescription = "Create a free account to unlock our verified peptide catalog.";

  const badges = [
    { icon: FlaskConical, label: "Verified Peptides" },
    { icon: Shield, label: "COA Access" },
    { icon: GraduationCap, label: "Academy" },
  ];

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#E7FB10]/40 via-[#21d8ff]/20 to-[#E7FB10]/10 blur-sm" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#E7FB10]/20 via-transparent to-[#21d8ff]/20" />
        
        <div className="relative rounded-2xl bg-[#1a1a1f]/95 backdrop-blur-xl border border-white/10 p-6 overflow-hidden">
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
                  className="text-xl font-bold text-white tracking-wide"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {title || defaultTitle}
                </h2>
              </div>
            </div>

            <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
              {description || defaultDescription}
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#21d8ff]/30 bg-[#21d8ff]/5"
                >
                  <badge.icon className="w-3.5 h-3.5 text-[#21d8ff]" />
                  <span className="text-xs text-[#21d8ff] font-medium">{badge.label}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={() => login()}
                className="w-full h-11 text-sm font-semibold bg-[#E7FB10] hover:bg-[#E7FB10]/90 text-black rounded-xl group"
                data-testid="button-auth-gate-login"
              >
                <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </motion.div>

            <p className="text-center text-xs text-zinc-500 mt-3">
              Already a researcher?{" "}
              <button
                onClick={() => login()}
                className="text-[#21d8ff] hover:text-[#21d8ff]/80 font-medium transition-colors"
                data-testid="button-auth-gate-signin"
              >
                Sign in
              </button>
            </p>

            <div className="mt-4 pt-3 border-t border-white/5">
              <p className="text-[10px] text-zinc-600 text-center">
                <span className="text-red-400/80">RUO:</span> Products are for research use only. 
                Must be 21+ to create account.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
