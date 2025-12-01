import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to subscribe");
        return;
      }

      setIsSubmitted(true);
      trackEvent('newsletter_signup', 'conversion', email);
      toast({
        title: "Success!",
        description: data.message || "You've been added to our mailing list",
      });

      setTimeout(() => {
        setEmail("");
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Newsletter signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-md mx-auto"
    >
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-[#E7FB10] opacity-50" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-black/40 backdrop-blur-sm border-[#E7FB10]/30 text-white placeholder:text-gray-400 focus:border-[#E7FB10] focus:ring-[#E7FB10]/20"
                  data-testid="input-newsletter-email"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="h-11 px-6 bg-[#E7FB10] text-black font-bold border-0 shadow-[0_0_20px_rgba(231,251,16,0.4)] hover:shadow-[0_0_30px_rgba(231,251,16,0.6)] transition-all duration-300"
                data-testid="button-newsletter-subscribe"
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Be the first to know about product launches and lab research updates.
            </p>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-destructive text-sm"
              >
                <AlertCircle className="h-4 w-4" />
                {error}
              </motion.div>
            )}
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-[#E7FB10]/30"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#E7FB10]/20 border-2 border-[#E7FB10] mb-2"
            >
              <CheckCircle className="w-6 h-6 text-[#E7FB10]" />
            </motion.div>
            <p className="text-sm font-semibold text-white mb-1">You're on the list!</p>
            <p className="text-xs text-gray-400">Check your email for confirmation</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
