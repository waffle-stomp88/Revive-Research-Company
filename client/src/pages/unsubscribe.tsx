import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, MailX, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const UNSUBSCRIBE_REASONS = [
  "Too many emails",
  "Content not relevant",
  "No longer interested",
  "Never signed up",
  "Other",
];

export default function Unsubscribe() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "confirm" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    
    if (emailParam) {
      setEmail(emailParam);
      setStatus("confirm");
    } else {
      setStatus("error");
      setErrorMessage("No email address provided");
    }
  }, []);

  const handleUnsubscribe = async () => {
    if (!email) return;
    
    setStatus("loading");
    
    try {
      const response = await apiRequest("POST", "/api/newsletter/unsubscribe", { 
        email,
        reason: selectedReason || undefined
      });
      const data = await response.json();
      
      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to unsubscribe");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#21d8ff]/8 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-[#9D4EDD]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md z-10">
        {/* Outer glow ring */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#21d8ff] via-[#9D4EDD] to-[#21d8ff] rounded-2xl opacity-60" />
        
        <div className="relative bg-[#12121a] rounded-2xl p-6 shadow-[0_0_60px_rgba(33,216,255,0.1)]">
          
          {status === "loading" && (
            <div className="text-center space-y-4 py-4">
              <div className="relative inline-block">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#21d8ff]/30 to-[#9D4EDD]/30 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-[#21d8ff] animate-spin" />
                </div>
              </div>
              <p className="text-white/70 text-base font-medium">Processing...</p>
            </div>
          )}

          {status === "confirm" && (
            <div className="text-center space-y-4">
              {/* Icon */}
              <div className="relative inline-block">
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-[#21d8ff]/20 to-[#9D4EDD]/20 border border-[#21d8ff]/50 flex items-center justify-center">
                  <MailX className="w-7 h-7 text-[#21d8ff]" />
                </div>
              </div>
              
              {/* Heading */}
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-white">
                  Unsubscribe
                </h1>
                <p className="text-white/50 text-sm">
                  You're about to unsubscribe:
                </p>
              </div>
              
              {/* Email display */}
              <div className="relative">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-[#21d8ff]/40 via-[#9D4EDD]/40 to-[#21d8ff]/40 rounded-lg" />
                <div className="relative bg-[#1a1a24] rounded-lg px-4 py-2.5">
                  <p className="text-white font-semibold text-sm break-all">
                    {email}
                  </p>
                </div>
              </div>
              
              {/* Optional reason selection */}
              <div className="space-y-2 text-left">
                <p className="text-white/40 text-xs text-center">
                  Mind telling us why? <span className="text-white/30">(optional)</span>
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {UNSUBSCRIBE_REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setSelectedReason(selectedReason === reason ? null : reason)}
                      className={`px-3 py-2 rounded-lg text-left text-xs font-medium transition-all duration-200 ${
                        selectedReason === reason
                          ? "bg-[#21d8ff]/20 border-[#21d8ff]/50 text-[#21d8ff] border"
                          : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                      data-testid={`reason-${reason.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="space-y-3 pt-1">
                <button
                  onClick={handleUnsubscribe}
                  className="relative w-full group"
                  data-testid="button-confirm-unsubscribe"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#21d8ff] via-[#9D4EDD] to-[#21d8ff] rounded-lg opacity-60 blur-sm md:group-hover:opacity-80 transition-opacity duration-300" />
                  <div className="relative h-10 bg-gradient-to-r from-[#21d8ff] to-[#9D4EDD] rounded-lg flex items-center justify-center font-semibold text-sm text-black">
                    Confirm Unsubscribe
                  </div>
                </button>
                
                <button
                  onClick={() => setLocation("/")}
                  className="w-full h-9 flex items-center justify-center gap-2 text-[#21d8ff] hover:text-white text-sm font-medium transition-colors duration-200"
                  data-testid="button-cancel-unsubscribe"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back Home
                </button>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-4">
              {/* Success icon */}
              <div className="relative inline-block">
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/50 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-white">
                  Unsubscribed
                </h1>
                <p className="text-white/50 text-sm">
                  You've been removed from our newsletter.
                </p>
              </div>
              
              <p className="text-white/40 text-xs">
                If this was a mistake, you can always resubscribe from our website.
              </p>
              
              <div className="pt-2">
                <button
                  onClick={() => setLocation("/")}
                  className="relative w-full group"
                  data-testid="button-return-home"
                >
                  <div className="absolute -inset-0.5 bg-[#D4FF1F] rounded-lg opacity-40 blur-sm md:group-hover:opacity-60 transition-opacity duration-300" />
                  <div className="relative h-10 bg-[#D4FF1F] rounded-lg flex items-center justify-center gap-2 font-semibold text-sm text-black">
                    <Sparkles className="w-4 h-4" />
                    Return to Revive Research
                  </div>
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              {/* Error icon */}
              <div className="relative inline-block">
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/50 flex items-center justify-center">
                  <MailX className="w-7 h-7 text-red-400" />
                </div>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-white">
                  Something Went Wrong
                </h1>
                <p className="text-white/50 text-sm">
                  {errorMessage}
                </p>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={() => setLocation("/")}
                  className="relative w-full group"
                  data-testid="button-error-return-home"
                >
                  <div className="relative h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm text-white hover:bg-white/15 transition-all duration-300">
                    <ArrowLeft className="w-4 h-4" />
                    Return Home
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Bottom branding */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-white/30 text-xs font-semibold tracking-[0.2em] uppercase">
              Revive Research
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
