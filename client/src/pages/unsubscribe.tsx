import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, MailX, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Unsubscribe() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "confirm" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

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
      const response = await apiRequest("POST", "/api/newsletter/unsubscribe", { email });
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
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[800px] h-[800px] bg-[#21d8ff]/8 rounded-full blur-[200px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] bg-[#9D4EDD]/10 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#E7FB10]/5 rounded-full blur-[150px]" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(33, 216, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(33, 216, 255, 0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Main card */}
      <div className="relative w-full max-w-lg z-10">
        {/* Outer glow ring */}
        <div className="absolute -inset-[2px] bg-gradient-to-r from-[#21d8ff] via-[#9D4EDD] to-[#21d8ff] rounded-3xl opacity-60 blur-sm" />
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#21d8ff] via-[#9D4EDD] to-[#21d8ff] rounded-3xl opacity-80" />
        
        <div className="relative bg-[#12121a] rounded-3xl p-10 shadow-[0_0_100px_rgba(33,216,255,0.15)]">
          
          {status === "loading" && (
            <div className="text-center space-y-8 py-8">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#21d8ff]/30 to-[#9D4EDD]/30 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-[#21d8ff] animate-spin" />
                </div>
                <div className="absolute -inset-4 bg-[#21d8ff]/30 rounded-full blur-2xl animate-pulse" />
              </div>
              <p className="text-white/70 text-xl font-medium">Processing...</p>
            </div>
          )}

          {status === "confirm" && (
            <div className="text-center space-y-8">
              {/* Icon with intense glow */}
              <div className="relative inline-block">
                <div className="absolute -inset-6 bg-gradient-to-r from-[#21d8ff]/40 to-[#9D4EDD]/40 rounded-full blur-2xl" />
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#21d8ff]/20 to-[#9D4EDD]/20 border-2 border-[#21d8ff]/50 flex items-center justify-center shadow-[0_0_40px_rgba(33,216,255,0.4),inset_0_0_30px_rgba(33,216,255,0.1)]">
                  <MailX className="w-11 h-11 text-[#21d8ff]" />
                </div>
              </div>
              
              {/* Heading with gradient */}
              <div className="space-y-3">
                <h1 className="text-4xl font-black bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                  Unsubscribe
                </h1>
                <p className="text-white/50 text-lg">
                  You're about to unsubscribe:
                </p>
              </div>
              
              {/* Email display with glow border */}
              <div className="relative">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-[#21d8ff]/50 via-[#9D4EDD]/50 to-[#21d8ff]/50 rounded-xl" />
                <div className="relative bg-[#1a1a24] rounded-xl px-6 py-4">
                  <p className="text-white font-bold text-lg break-all">
                    {email}
                  </p>
                </div>
              </div>
              
              <p className="text-white/40 text-base">
                You will no longer receive newsletter emails from Revive Research.
              </p>
              
              {/* Action buttons */}
              <div className="space-y-4 pt-4">
                {/* Primary button with intense glow */}
                <button
                  onClick={handleUnsubscribe}
                  className="relative w-full group"
                  data-testid="button-confirm-unsubscribe"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#21d8ff] via-[#9D4EDD] to-[#21d8ff] rounded-xl opacity-70 blur-md group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative h-14 bg-gradient-to-r from-[#21d8ff] to-[#9D4EDD] rounded-xl flex items-center justify-center font-bold text-lg text-black shadow-[0_0_30px_rgba(33,216,255,0.5)] group-hover:shadow-[0_0_50px_rgba(33,216,255,0.7)] transition-all duration-300">
                    Confirm Unsubscribe
                  </div>
                </button>
                
                <button
                  onClick={() => setLocation("/")}
                  className="w-full h-12 flex items-center justify-center gap-2 text-[#21d8ff] hover:text-white font-medium transition-colors duration-200"
                  data-testid="button-cancel-unsubscribe"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Go Back Home
                </button>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-8">
              {/* Success icon with green glow */}
              <div className="relative inline-block">
                <div className="absolute -inset-6 bg-emerald-500/30 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-2 border-emerald-500/50 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4),inset_0_0_30px_rgba(16,185,129,0.1)]">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-4xl font-black text-white">
                  Unsubscribed
                </h1>
                <p className="text-white/50 text-lg">
                  You've been removed from our newsletter.
                </p>
              </div>
              
              <p className="text-white/40">
                If this was a mistake, you can always resubscribe from our website.
              </p>
              
              {/* Neon yellow return button */}
              <div className="pt-4">
                <button
                  onClick={() => setLocation("/")}
                  className="relative w-full group"
                  data-testid="button-return-home"
                >
                  <div className="absolute -inset-1 bg-[#E7FB10] rounded-xl opacity-50 blur-md group-hover:opacity-80 transition-opacity duration-300" />
                  <div className="relative h-14 bg-[#E7FB10] rounded-xl flex items-center justify-center gap-3 font-bold text-lg text-black shadow-[0_0_40px_rgba(231,251,16,0.4)] group-hover:shadow-[0_0_60px_rgba(231,251,16,0.6)] transition-all duration-300">
                    <Sparkles className="w-5 h-5" />
                    Return to Revive Research
                  </div>
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-8">
              {/* Error icon with red glow */}
              <div className="relative inline-block">
                <div className="absolute -inset-6 bg-red-500/30 rounded-full blur-2xl" />
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 border-2 border-red-500/50 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.4),inset_0_0_30px_rgba(239,68,68,0.1)]">
                  <MailX className="w-11 h-11 text-red-400" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-4xl font-black text-white">
                  Something Went Wrong
                </h1>
                <p className="text-white/50 text-lg">
                  {errorMessage}
                </p>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={() => setLocation("/")}
                  className="relative w-full group"
                  data-testid="button-error-return-home"
                >
                  <div className="absolute -inset-1 bg-white/20 rounded-xl blur-md group-hover:bg-white/30 transition-opacity duration-300" />
                  <div className="relative h-14 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center gap-2 font-bold text-lg text-white group-hover:bg-white/15 transition-all duration-300">
                    <ArrowLeft className="w-5 h-5" />
                    Return Home
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Bottom branding with glow */}
          <div className="mt-10 pt-6 border-t border-white/10 text-center">
            <p className="text-transparent bg-gradient-to-r from-[#21d8ff]/60 via-white/40 to-[#9D4EDD]/60 bg-clip-text text-sm font-bold tracking-[0.3em] uppercase">
              Revive Research
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
