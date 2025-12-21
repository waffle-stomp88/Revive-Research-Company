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

const STORAGE_KEY = "reviveEarlyAccessAcknowledged";

export function EarlyAccessModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const acknowledged = localStorage.getItem(STORAGE_KEY);
    if (!acknowledged) {
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

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

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#1a1a1f] border border-[#E7FB10]/30 rounded-2xl p-6 md:p-8 shadow-2xl"
          style={{
            boxShadow: "0 0 60px rgba(231, 251, 16, 0.15), 0 0 30px rgba(33, 216, 255, 0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#E7FB10]/20 to-[#21d8ff]/20 border border-[#E7FB10]/40">
              <Sparkles className="h-4 w-4 text-[#E7FB10]" />
              <span className="text-sm font-bold text-[#E7FB10]">EARLY ACCESS</span>
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

            <div className="flex items-center gap-2 justify-center mb-6 px-3 py-2 rounded-lg bg-[#E7FB10]/10 border border-[#E7FB10]/20">
              <Eye className="h-4 w-4 text-[#E7FB10]" />
              <span className="text-xs text-[#E7FB10]">
                Preview pricing shown — subject to change at launch.
              </span>
            </div>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50 focus:border-[#E7FB10]/50"
                    required
                    data-testid="input-early-access-email"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90 font-bold"
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
              variant="ghost"
              className="w-full mt-3 text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
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
  return (
    <span className={`text-[10px] text-[#E7FB10]/70 block ${className}`}>
      Preview pricing — subject to change
    </span>
  );
}
