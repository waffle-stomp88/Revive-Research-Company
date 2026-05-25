import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthGate } from "./auth-gate";

interface ProtectedRouteProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function ProtectedRoute({ children, title, description }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#D4FF1F] border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthGate title={title} description={description} />;
  }

  return <>{children}</>;
}
