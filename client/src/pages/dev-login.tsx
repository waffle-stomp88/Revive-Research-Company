import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Lock, LogIn, AlertTriangle, CheckCircle, Terminal } from "lucide-react";

export default function DevLogin() {
  const [key, setKey] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (bypassKey: string) => {
      return apiRequest("POST", "/api/auth/dev-bypass", { key: bypassKey });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Dev Login Successful",
        description: data.message || "You are now logged in as a dev user.",
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid bypass key or dev login not available.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      loginMutation.mutate(key.trim());
    }
  };

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md p-8 border-[#E7FB10]/30">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#E7FB10]/10 flex items-center justify-center">
              <Terminal className="h-8 w-8 text-[#E7FB10]" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Dev Bypass Login</h1>
            <p className="text-sm text-muted-foreground">
              For development access when Auth0 is unavailable
            </p>
          </div>

          <div className="mb-6 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-orange-200">
                <p className="font-semibold mb-1">Development Only</p>
                <p className="text-muted-foreground">
                  This bypass is only available in development mode. 
                  Default key: <code className="text-[#E7FB10]">revive-dev-2024</code>
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Enter bypass key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="pl-10"
                  data-testid="input-dev-bypass-key"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90"
              disabled={loginMutation.isPending || !key.trim()}
              data-testid="button-dev-login"
            >
              {loginMutation.isPending ? (
                "Logging in..."
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Dev Login
                </>
              )}
            </Button>
          </form>

          {loginMutation.isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30"
            >
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Login successful! Redirecting...</span>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </main>
  );
}
