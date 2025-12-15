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

  const { data: dbUser, isLoading: dbLoading, refetch } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: auth0IsAuthenticated,
  });

  useEffect(() => {
    if (auth0IsAuthenticated && auth0User) {
      apiRequest("POST", "/api/auth/sync", {
        id: auth0User.sub,
        email: auth0User.email,
        firstName: auth0User.given_name || auth0User.nickname || '',
        lastName: auth0User.family_name || '',
        profileImageUrl: auth0User.picture,
      }).then(() => {
        refetch();
      }).catch(console.error);
    }
  }, [auth0IsAuthenticated, auth0User, refetch]);

  const login = () => {
    loginWithRedirect();
  };

  const logout = () => {
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return {
    user: dbUser,
    auth0User,
    isLoading: auth0Loading || (auth0IsAuthenticated && dbLoading),
    isAuthenticated: auth0IsAuthenticated && !!dbUser,
    login,
    logout,
    getAccessTokenSilently,
  };
}
