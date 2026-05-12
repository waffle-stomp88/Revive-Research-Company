import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("[AuthCallback] Session error:", sessionError.message);
          setErrorMsg(sessionError.message);
          setStatus("error");
          return;
        }

        if (!session) {
          console.error("[AuthCallback] No session found after OAuth redirect");
          setErrorMsg("No session found. Please try signing in again.");
          setStatus("error");
          return;
        }

        const response = await fetch("/api/auth/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          credentials: "include",
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          const body = await response.text();
          console.error("[AuthCallback] Sync failed:", response.status, body);
          setErrorMsg("Sign-in failed. Please try again.");
          setStatus("error");
          return;
        }

        const returnTo = sessionStorage.getItem("auth_return_to") || "/dashboard";
        sessionStorage.removeItem("auth_return_to");
        navigate(returnTo);
      } catch (err) {
        console.error("[AuthCallback] Unexpected error:", err);
        setErrorMsg("An unexpected error occurred. Please try again.");
        setStatus("error");
      }
    };

    handleCallback();
  }, [navigate]);

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-bold text-foreground mb-3">Sign-in failed</h1>
          <p className="text-muted-foreground mb-6">{errorMsg}</p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-[#E7FB10] text-black font-semibold rounded-md hover:opacity-90 transition-opacity"
          >
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#E7FB10] border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Completing sign-in...</p>
      </div>
    </div>
  );
}
