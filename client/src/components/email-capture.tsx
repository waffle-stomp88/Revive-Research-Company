import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, CheckCircle2, Loader2, FlaskConical } from "lucide-react";

interface EmailCaptureProps {
  heading?: string;
  description?: string;
  source?: string;
  variant?: "default" | "compact" | "academy";
  className?: string;
}

export function EmailCapture({
  heading = "Be the First to Know",
  description = "Get notified when we launch new compounds, plus a one-time welcome discount. No spam — only updates that matter.",
  source = "article_footer",
  variant = "default",
  className = "",
}: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async (emailAddress: string) => {
      const res = await apiRequest("POST", "/api/newsletter/subscribe", {
        email: emailAddress,
        source,
      });
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      setEmail("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || subscribeMutation.isPending) return;
    subscribeMutation.mutate(email);
  };

  if (submitted || subscribeMutation.isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={className}
      >
        <Card className={`${variant === "compact" ? "p-4" : "p-6 md:p-8"} border-green-500/30 bg-green-500/5 text-center`} data-testid="email-capture-success">
          <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <p className="font-semibold text-green-400">You're on the list</p>
          <p className="text-sm text-muted-foreground mt-1">
            You'll be the first to know about new compound launches. Check your email for your welcome discount.
          </p>
        </Card>
      </motion.div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={className} data-testid="email-capture-compact">
        <Card className="p-4 border-[#21d8ff]/20 bg-[#21d8ff]/5">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Mail className="h-4 w-4 text-[#21d8ff] flex-shrink-0" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-background/50 border-[#21d8ff]/20 focus:border-[#21d8ff]/50 h-9 text-sm"
                data-testid="input-email-capture-compact"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!email || subscribeMutation.isPending}
              className="bg-[#21d8ff] text-black font-medium whitespace-nowrap"
              data-testid="button-email-capture-compact"
            >
              {subscribeMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Subscribe"
              )}
            </Button>
          </form>
          {subscribeMutation.isError && (
            <p className="text-xs text-red-400 mt-2" data-testid="text-email-capture-error">
              {subscribeMutation.error?.message?.includes("already subscribed")
                ? "You're already subscribed!"
                : "Something went wrong. Please try again."}
            </p>
          )}
        </Card>
      </div>
    );
  }

  if (variant === "academy") {
    return (
      <div className={className} data-testid="email-capture-academy">
        <Card className="p-5 border-[#D4FF1F]/20 bg-[#D4FF1F]/5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-[#D4FF1F]/10 flex items-center justify-center flex-shrink-0">
              <FlaskConical className="h-4 w-4 text-[#D4FF1F]" />
            </div>
            <div>
              <p className="font-semibold text-sm">{heading}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-background/50 border-[#D4FF1F]/20 focus:border-[#D4FF1F]/50 h-9 text-sm"
              data-testid="input-email-capture-academy"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!email || subscribeMutation.isPending}
              className="bg-[#D4FF1F] text-black font-medium"
              data-testid="button-email-capture-academy"
            >
              {subscribeMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Notify Me"
              )}
            </Button>
          </form>
          {subscribeMutation.isError && (
            <p className="text-xs text-red-400 mt-2" data-testid="text-email-capture-error">
              {subscribeMutation.error?.message?.includes("already subscribed")
                ? "You're already subscribed!"
                : "Something went wrong. Please try again."}
            </p>
          )}
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={className}
      data-testid="email-capture-default"
    >
      <Card className="p-6 md:p-8 border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
        <div className="text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-[#21d8ff]/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-[#21d8ff]" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">{heading}</h3>
          <p className="text-sm text-muted-foreground mb-5">{description}</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-background/50 border-[#21d8ff]/20 focus:border-[#21d8ff]/50"
              data-testid="input-email-capture"
            />
            <Button
              type="submit"
              disabled={!email || subscribeMutation.isPending}
              className="bg-[#21d8ff] text-black font-display whitespace-nowrap"
              data-testid="button-email-capture"
            >
              {subscribeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Joining...
                </>
              ) : (
                "Join the Community"
              )}
            </Button>
          </form>
          {subscribeMutation.isError && (
            <p className="text-xs text-red-400 mt-3" data-testid="text-email-capture-error">
              {subscribeMutation.error?.message?.includes("already subscribed")
                ? "You're already subscribed!"
                : "Something went wrong. Please try again."}
            </p>
          )}
          <p className="text-xs text-muted-foreground/60 mt-3">
            No spam. Unsubscribe anytime. We respect your inbox.
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
