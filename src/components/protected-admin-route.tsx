import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { isLoading, session, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!session || !isAdmin)) {
      setLocation("/admin/login");
    }
  }, [isAdmin, isLoading, session, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">
            Verification
          </p>
          <h1 className="mt-3 text-2xl font-display font-medium text-zinc-900">
            Chargement de l'espace admin
          </h1>
        </div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
