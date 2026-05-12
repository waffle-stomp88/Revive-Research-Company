import { useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: sessionUser, isLoading: sessionLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 30_000,
  });

  // Sync the Supabase session to the Express backend session.
  // The access token is sent in the Authorization header so the server
  // can verify identity cryptographically — body fields are never trusted.
  const syncToBackend = useCallback(async (accessToken: string) => {
    try {
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        console.error("[Auth] Backend sync failed:", res.status, await res.text());
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (err) {
      console.error("[Auth] Error syncing to backend:", err);
    }
  }, [queryClient]);

  // On mount: check for an existing Supabase session and sync if present.
  // Also listen for auth state changes (login, logout, token refresh).
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        // Only sync if we don't already have a backend session
        if (!sessionUser) {
          syncToBackend(session.access_token);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          await syncToBackend(session.access_token);
        }
        if (event === "TOKEN_REFRESHED" && session) {
          // Keep backend session alive with refreshed token
          await syncToBackend(session.access_token);
        }
        if (event === "SIGNED_OUT") {
          queryClient.setQueryData(["/api/auth/user"], null);
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [syncToBackend, queryClient, sessionUser]);

  const login = (returnTo?: string) => {
    if (returnTo) {
      sessionStorage.setItem("auth_return_to", returnTo);
    } else {
      sessionStorage.setItem(
        "auth_return_to",
        window.location.pathname + window.location.search
      );
    }
    window.location.href = "/login";
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore
    }
    await supabase.auth.signOut();
    queryClient.setQueryData(["/api/auth/user"], null);
    window.location.href = "/";
  };

  const isAuthenticated = !!sessionUser;
  const isLoading = sessionLoading;

  return {
    user: sessionUser ?? null,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }),
  };
}
