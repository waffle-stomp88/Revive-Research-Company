import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const {
    user: auth0User,
    isAuthenticated: auth0IsAuthenticated,
    isLoading: auth0Loading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  // Check for session-based user (dev bypass or other server sessions)
  const { data: sessionUser, isLoading: sessionLoading, refetch: refetchSession } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Always try to fetch - server will return user if session exists
    enabled: true,
  });

  // Sync Auth0 user to database when authenticated via Auth0
  useEffect(() => {
    if (auth0IsAuthenticated && auth0User) {
      apiRequest("POST", "/api/auth/sync", {
        id: auth0User.sub,
        email: auth0User.email,
        firstName: auth0User.given_name || auth0User.nickname || '',
        lastName: auth0User.family_name || '',
        profileImageUrl: auth0User.picture,
      }).then(() => {
        refetchSession();
      }).catch(console.error);
    }
  }, [auth0IsAuthenticated, auth0User, refetchSession]);

  const login = (returnTo?: string) => {
    loginWithRedirect({
      appState: {
        returnTo: returnTo || window.location.pathname,
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
