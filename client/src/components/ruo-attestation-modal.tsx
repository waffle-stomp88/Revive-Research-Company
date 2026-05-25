import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const ATTESTATION_TEXT =
  "I confirm I am 21+ years of age and that all products purchased are for laboratory research purposes only. Not for human or animal consumption.";

export function RuoAttestationModal() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [checked, setChecked] = useState(false);
  const { toast } = useToast();

  const needsAttestation =
    isAuthenticated && !isLoading && user && !user.ruoAttestationAt;

  const attestMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/attest-ruo");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record attestation. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!needsAttestation) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
        data-testid="modal-ruo-attestation"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-lg"
        >
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#D4FF1F]/30 via-[#21d8ff]/20 to-red-500/20 blur-sm" />
          <div className="relative rounded-2xl bg-[#1a1a1f] border border-white/10 p-8 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4FF1F]/40 to-transparent" />

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2
                  className="text-xl font-bold text-white tracking-wide"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  data-testid="heading-attestation-modal"
                >
                  Research Use Confirmation Required
                </h2>
                <p className="text-xs text-zinc-500">Required before accessing your account</p>
              </div>
            </div>

            <div className="mb-5 p-4 rounded-xl bg-red-950/30 border border-red-500/25">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-400 font-semibold uppercase tracking-wider">
                  Legal Compliance Notice
                </p>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                To comply with regulations, all account holders must confirm their eligibility
                and intended research use before accessing pricing and order features.
              </p>
            </div>

            <label
              className="flex items-start gap-3 cursor-pointer group mb-6"
              htmlFor="ruo-attestation-checkbox"
            >
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  id="ruo-attestation-checkbox"
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="sr-only"
                  data-testid="checkbox-ruo-attestation"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    checked
                      ? "bg-[#D4FF1F] border-[#D4FF1F]"
                      : "border-zinc-600 bg-transparent group-hover:border-zinc-400"
                  }`}
                >
                  {checked && <CheckSquare className="w-3 h-3 text-black" />}
                </div>
              </div>
              <span className="text-sm text-zinc-300 leading-relaxed">
                {ATTESTATION_TEXT}
              </span>
            </label>

            <Button
              className="w-full h-11 font-semibold bg-[#D4FF1F] text-black"
              disabled={!checked || attestMutation.isPending}
              onClick={() => attestMutation.mutate()}
              data-testid="button-submit-attestation"
            >
              {attestMutation.isPending ? "Confirming…" : "Confirm & Continue"}
            </Button>

            <p className="text-center text-xs text-zinc-600 mt-4">
              This confirmation is required by law and recorded with a timestamp.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
