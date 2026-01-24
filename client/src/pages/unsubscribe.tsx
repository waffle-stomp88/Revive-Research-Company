import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MailX, ArrowLeft, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-[#1a1a1f] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#21d8ff]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#9D4EDD]/5 rounded-full blur-[150px]" />
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md">
        {/* Glow effect behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#21d8ff]/20 via-[#9D4EDD]/20 to-[#21d8ff]/20 rounded-2xl blur-xl opacity-50" />
        
        <div className="relative bg-[#232329]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Decorative top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#21d8ff] to-transparent rounded-full" />
          
          {status === "loading" && (
            <div className="text-center space-y-6 py-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#21d8ff]/10 flex items-center justify-center mx-auto">
                  <Loader2 className="w-10 h-10 text-[#21d8ff] animate-spin" />
                </div>
                <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-[#21d8ff]/20 blur-xl" />
              </div>
              <p className="text-white/60 text-lg">Processing...</p>
            </div>
          )}

          {status === "confirm" && (
            <div className="text-center space-y-6">
              {/* Icon with glow */}
              <div className="relative pt-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#21d8ff]/20 to-[#9D4EDD]/20 border border-white/10 flex items-center justify-center mx-auto">
                  <MailX className="w-9 h-9 text-[#21d8ff]" />
                </div>
                <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-[#21d8ff]/10 blur-2xl" />
              </div>
              
              {/* Heading */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Unsubscribe
                </h1>
                <p className="text-white/50">
                  You're about to unsubscribe:
                </p>
              </div>
              
              {/* Email display box */}
              <div className="bg-[#1a1a1f] border border-white/10 rounded-xl px-4 py-3">
                <p className="text-white font-medium break-all">
                  {email}
                </p>
              </div>
              
              <p className="text-white/40 text-sm leading-relaxed">
                You will no longer receive newsletter emails from Revive Research.
              </p>
              
              {/* Action buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleUnsubscribe}
                  className="w-full h-12 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold rounded-xl transition-all duration-200"
                  data-testid="button-confirm-unsubscribe"
                >
                  Confirm Unsubscribe
                </Button>
                
                <Button
                  onClick={() => setLocation("/")}
                  variant="ghost"
                  className="w-full text-[#21d8ff] hover:text-[#21d8ff] hover:bg-[#21d8ff]/10"
                  data-testid="button-cancel-unsubscribe"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back Home
                </Button>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-6">
              {/* Success icon with glow */}
              <div className="relative pt-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-emerald-500/20 blur-2xl" />
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Unsubscribed
                </h1>
                <p className="text-white/50">
                  You've been removed from our newsletter.
                </p>
              </div>
              
              <p className="text-white/40 text-sm">
                If this was a mistake, you can always resubscribe from our website.
              </p>
              
              <div className="pt-4">
                <Button
                  onClick={() => setLocation("/")}
                  className="w-full h-12 bg-[#E7FB10] hover:bg-[#E7FB10]/90 text-black font-bold rounded-xl shadow-[0_0_30px_rgba(231,251,16,0.3)] transition-all duration-200"
                  data-testid="button-return-home"
                >
                  Return to Revive Research
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-6">
              {/* Error icon */}
              <div className="relative pt-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center mx-auto">
                  <MailX className="w-9 h-9 text-red-400" />
                </div>
                <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-red-500/20 blur-2xl" />
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Something Went Wrong
                </h1>
                <p className="text-white/50">
                  {errorMessage}
                </p>
              </div>
              
              <div className="pt-4">
                <Button
                  onClick={() => setLocation("/")}
                  className="w-full h-12 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold rounded-xl transition-all duration-200"
                  data-testid="button-error-return-home"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </div>
            </div>
          )}

          {/* Bottom branding */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-white/30 text-xs tracking-widest uppercase">
              Revive Research
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
