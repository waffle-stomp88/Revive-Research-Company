import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FlaskConical, Shield, AlertTriangle } from "lucide-react";

const AGE_VERIFIED_KEY = "revive-research-age-verified";

export function AgeVerificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem(AGE_VERIFIED_KEY);
    if (!verified) {
      setIsOpen(true);
      document.body.style.overflow = "hidden";
    }
  }, []);

  const handleEnter = () => {
    if (agreed) {
      localStorage.setItem(AGE_VERIFIED_KEY, "true");
      setIsOpen(false);
      document.body.style.overflow = "";
    }
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] overflow-y-auto bg-black/90 backdrop-blur-md"
        data-testid="modal-age-verification"
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="min-h-full flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-2xl"
          >
            <div className="p-6 sm:p-8 md:p-10">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FlaskConical className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                REVIVE<span className="text-primary">RESEARCH</span>
              </h1>
            </div>

            <div className="space-y-6 text-foreground/90">
              <p className="text-lg leading-relaxed">
                At Revive Research, we do things differently. Unlike typical U.S. peptide 
                resellers who import bulk compounds, slap on flashy labels, and charge 
                outrageous markups, we keep it simple and honest. We source high-quality 
                research compounds, skip the labels, and offer them at fair, cost-plus 
                pricing—just like a transparent pharmacy model. No hype, no fluff—just 
                reliable peptides for research purposes only.
              </p>

              <div className="bg-muted/50 rounded-lg p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    By purchasing from Revive Research, the buyer acknowledges and agrees 
                    that all products are supplied solely for lawful research use and are 
                    not intended for human or animal consumption, or for use in any 
                    diagnostic or therapeutic procedures.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    The purchaser assumes full responsibility and liability for the use, 
                    handling, storage, and distribution of all materials, and agrees to 
                    indemnify, defend, and hold harmless Revive Research from any and all 
                    claims, damages, losses, or liabilities arising from misuse, 
                    unauthorized use, or failure to comply with applicable laws and 
                    regulations.
                  </p>
                </div>
              </div>

              <div 
                className="flex items-start gap-3 pt-4 cursor-pointer"
                onClick={() => setAgreed(!agreed)}
              >
                <Checkbox
                  id="age-terms"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked === true)}
                  className="mt-1"
                  data-testid="checkbox-age-verification"
                />
                <label 
                  htmlFor="age-terms" 
                  className="text-base font-medium cursor-pointer select-none"
                >
                  I agree to these terms and certify that I am over the age of 21.
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                onClick={handleEnter}
                disabled={!agreed}
                size="lg"
                className="flex-1 text-lg h-12"
                data-testid="button-enter-site"
              >
                Enter Site
              </Button>
              <Button
                onClick={handleDecline}
                variant="outline"
                size="lg"
                className="flex-1 text-lg h-12"
                data-testid="button-decline-entry"
              >
                Leave
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              You must be 21 years or older to access this website.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
