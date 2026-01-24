import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-border/50">
        <CardContent className="pt-8 pb-8 px-8">
          {status === "loading" && (
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto" />
              <p className="text-muted-foreground">Processing...</p>
            </div>
          )}

          {status === "confirm" && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-card border border-border/50 flex items-center justify-center mx-auto">
                <MailX className="w-8 h-8 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Unsubscribe</h1>
                <p className="text-muted-foreground">
                  You're about to unsubscribe:
                </p>
                <p className="text-foreground font-medium break-all">
                  {email}
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                You will no longer receive newsletter emails from Revive Research.
              </p>
              
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleUnsubscribe}
                  variant="outline"
                  className="w-full"
                  data-testid="button-confirm-unsubscribe"
                >
                  Confirm Unsubscribe
                </Button>
                
                <Button
                  onClick={() => setLocation("/")}
                  variant="ghost"
                  className="w-full text-muted-foreground"
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
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Unsubscribed</h1>
                <p className="text-muted-foreground">
                  You've been removed from our newsletter.
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                If this was a mistake, you can always resubscribe from our website.
              </p>
              
              <Button
                onClick={() => setLocation("/")}
                className="w-full bg-[#E7FB10] hover:bg-[#E7FB10]/90 text-black font-semibold"
                data-testid="button-return-home"
              >
                Return to Revive Research
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <MailX className="w-8 h-8 text-red-400" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Something Went Wrong</h1>
                <p className="text-muted-foreground">
                  {errorMessage}
                </p>
              </div>
              
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                className="w-full"
                data-testid="button-error-return-home"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
