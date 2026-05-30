import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const handled = useRef(false);

  useEffect(() => {
    const finishSignIn = async (accessToken: string) => {
      if (handled.current) return;
      handled.current = true;

      try {
        const response = await fetch("/api/auth/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
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

        // Bust the stale null cache so the destination page always sees
        // isLoading:true (spinner) instead of isAuthenticated:false (auth gate)
        // during the brief window before the query re-fetches with the new session.
        queryClient.removeQueries({ queryKey: ["/api/auth/user"] });

        // If user attested RUO during signup, record it now that we have a session
        const attestPending = sessionStorage.getItem("ruo_attest_pending");
        if (attestPending) {
          sessionStorage.removeItem("ruo_attest_pending");
          try {
            await fetch("/api/auth/attest-ruo", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });
          } catch {
            // Non-fatal — attestation modal will catch it on next visit
          }
        }

        navigate(returnTo);
      } catch (err) {
        console.error("[AuthCallback] Unexpected error:", err);
        setErrorMsg("An unexpected error occurred. Please try again.");
        setStatus("error");
      }
    };

    // Listen for the SIGNED_IN event — Supabase fires this once it has
    // finished parsing the OAuth tokens from the URL hash.  Calling
    // getSession() immediately races against that parsing and can return
    // null, causing a spurious "cannot be signed in" flash.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
          finishSignIn(session.access_token);
        }
      }
    );

    // Fallback: if the session was already established before this component
    // mounted (e.g. back-forward cache), getSession() will have it.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        finishSignIn(session.access_token);
      }
    });

    // Safety timeout — if nothing fires in 8 s, show an error rather than
    // leaving the user on a spinner forever.
    const timer = setTimeout(() => {
      if (!handled.current) {
        setErrorMsg("Sign-in timed out. Please try again.");
        setStatus("error");
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [navigate]);

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-bold text-foreground mb-3">Sign-in failed</h1>
          <p className="text-muted-foreground mb-6">{errorMsg}</p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-[#D4FF1F] text-black font-semibold rounded-md hover:opacity-90 transition-opacity"
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
        <div className="w-10 h-10 border-4 border-[#D4FF1F] border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Completing sign-in...</p>
      </div>
    </div>
  );
}
