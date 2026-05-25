import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  Mail,
  ArrowRight,
  CheckCircle,
  Loader2,
  FlaskConical,
  Eye,
} from "lucide-react";

const PRODUCTS_SESSION_KEY = "reviveEarlyAccessProductsAcknowledged";

export function EarlyAccessModal({ showOnProductPages = false }: { showOnProductPages?: boolean } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (showOnProductPages) {
      // Use sessionStorage so it shows fresh each session
      const acknowledged = sessionStorage.getItem(PRODUCTS_SESSION_KEY);
      if (!acknowledged) {
        const timer = setTimeout(() => setIsOpen(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [showOnProductPages]);

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", "/api/newsletter/subscribe", { email, source: "early_access_modal" });
    },
    onSuccess: () => {
      setSubscribed(true);
      toast({
        title: "You're on the list!",
        description: "We'll notify you when we launch.",
      });
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to subscribe";
      if (message.includes("already subscribed")) {
        setSubscribed(true);
        toast({
          title: "Already subscribed",
          description: "You're already on the launch list!",
        });
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      subscribeMutation.mutate(email.trim());
    }
  };

  const handleContinue = () => {
    sessionStorage.setItem(PRODUCTS_SESSION_KEY, "true");
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add("modal-open");
      document.body.classList.add("modal-open");
      
      return () => {
        document.documentElement.classList.remove("modal-open");
        document.body.classList.remove("modal-open");
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#1a1a1f] border border-[#D4FF1F]/30 rounded-2xl p-6 md:p-8 shadow-2xl"
          style={{
            boxShadow: "0 0 60px rgba(212, 255, 31, 0.15), 0 0 30px rgba(33, 216, 255, 0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#D4FF1F]/20 to-[#21d8ff]/20 border border-[#D4FF1F]/40">
              <Sparkles className="h-4 w-4 text-[#D4FF1F]" />
              <span className="text-sm font-bold text-[#D4FF1F]">EARLY ACCESS</span>
            </div>
          </div>

          <div className="text-center pt-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-[#9d4edd]/20 border border-[#9d4edd]/40">
                <FlaskConical className="h-8 w-8 text-[#9d4edd]" />
              </div>
            </div>

            <h2 className="font-display text-2xl md:text-3xl font-black mb-3">
              Early Access — Soft Launch Preview
            </h2>

            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              You're viewing Revive in <span className="text-[#21d8ff] font-medium">Early Access</span>. 
              You can explore products and go through checkout, but purchasing is not enabled yet.
            </p>


            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50 focus:border-[#D4FF1F]/50"
                    required
                    data-testid="input-early-access-email"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#D4FF1F] text-black hover:bg-[#D4FF1F]/90 font-bold"
                  disabled={subscribeMutation.isPending}
                  data-testid="button-early-access-notify"
                >
                  {subscribeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Notify me at launch
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-500 font-medium">You're on the list!</span>
              </div>
            )}

            <Button
              className="w-full mt-3 bg-white/10 border border-white/20 text-white hover:bg-white/20"
              onClick={handleContinue}
              data-testid="button-early-access-continue"
            >
              Continue browsing
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function PreviewPricingNotice({ className = "" }: { className?: string }) {
  return null;
}
