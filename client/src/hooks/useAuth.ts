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

  const login = () => {
    loginWithRedirect();
  };

  const logout = async () => {
    // Clear server session first (for dev bypass)
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include" 
      });
    } catch (e) {
      // Ignore errors, proceed with Auth0 logout
    }
    
    // If we're authenticated via Auth0, do Auth0 logout
    if (auth0IsAuthenticated) {
      auth0Logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
    } else {
      // For dev bypass, just reload to clear state
      window.location.href = "/";
    }
  };

  // User is authenticated if either Auth0 says so AND we have dbUser,
  // OR if we have a session user from dev bypass
  const isAuthenticated = (auth0IsAuthenticated && !!sessionUser) || !!sessionUser;
  const isLoading = auth0Loading || sessionLoading;

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
