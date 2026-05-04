import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { User } from "@shared/schema";

export function useAuth() {
  const {
    user: auth0User,
    isAuthenticated: auth0IsAuthenticated,
    isLoading: auth0Loading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
    getIdTokenClaims,
  } = useAuth0();

  // Check for session-based user (dev bypass or other server sessions)
  const { data: sessionUser, isLoading: sessionLoading, refetch: refetchSession } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Always try to fetch - server will return user if session exists
    enabled: true,
  });

  // Sync Auth0 user to database when authenticated via Auth0.
  // The raw ID token is sent in the Authorization header so the server
  // can cryptographically verify the caller's identity before creating
  // a session — request body fields are never trusted for identity.
  useEffect(() => {
    if (auth0IsAuthenticated && auth0User) {
      (async () => {
        try {
          // Read the current ID token first.
          let idTokenClaims = await getIdTokenClaims();

          // Decode the exp claim from the JWT payload (no library needed).
          // Only refresh if the token is genuinely expired — fresh logins
          // (exp is in the future) skip the iframe call entirely so Samsung
          // Browser tracking protection cannot corrupt the auth state.
          const raw = idTokenClaims?.__raw;
          if (raw) {
            try {
              const payloadB64 = raw.split(".")[1];
              const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
              const exp: number = payload.exp;
              if (exp < Date.now() / 1000) {
                // Token is expired — attempt a silent refresh.
                try {
                  await getAccessTokenSilently();
                  // Re-read claims after refresh so we send the new token.
                  idTokenClaims = await getIdTokenClaims();
                } catch (refreshErr) {
                  console.warn("[Auth] Token refresh failed, using expired token:", refreshErr);
                  // Fall through with the original (expired) token; the server
                  // will reject it and the user can re-login manually.
                }
              }
            } catch (decodeErr) {
              console.warn("[Auth] Could not decode ID token exp claim:", decodeErr);
            }
          }

          const idToken = idTokenClaims?.__raw;
          if (!idToken) {
            console.error("[Auth] Failed to retrieve ID token");
            return;
          }

          const res = await fetch("/api/auth/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`,
            },
            credentials: "include",
            body: JSON.stringify({}),
          });

          if (!res.ok) {
            console.error("[Auth] Sync failed:", res.status, await res.text());
            return;
          }

          refetchSession();
        } catch (err) {
          console.error("[Auth] Error during sync:", err);
        }
      })();
    }
  }, [auth0IsAuthenticated, auth0User, refetchSession, getIdTokenClaims, getAccessTokenSilently]);

  const login = (returnTo?: string) => {
    loginWithRedirect({
      appState: {
        returnTo: returnTo || window.location.pathname + window.location.search,
      },
    });
  };

  const logout = async () => {
    // Clear server session first
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include" 
      });
    } catch (e) {
      // Ignore errors, proceed with logout
    }
    
    // If we're authenticated via Auth0, do Auth0 logout
    if (auth0IsAuthenticated) {
      auth0Logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
    } else {
      // For session-based auth, redirect to home after clearing session
      window.location.href = "/";
    }
  };

  // User is authenticated if we have a session user (from Auth0 sync or dev bypass)
  const isAuthenticated = !!sessionUser;
  
  // Only show loading if:
  // 1. Session is loading AND Auth0 is also loading (initial page load)
  // 2. Auth0 says authenticated but we're waiting for session sync
  // Key: If session check is done (not loading) and no user, show AuthGate immediately
  // This prevents infinite loading when user is not authenticated
  const isLoading = (sessionLoading && auth0Loading) || (auth0IsAuthenticated && !sessionUser);

  return {
    user: sessionUser,
    auth0User,
    isLoading,
    isAuthenticated,
    login,
    logout,
    getAccessTokenSilently,
    refetch: refetchSession,
  };
}
