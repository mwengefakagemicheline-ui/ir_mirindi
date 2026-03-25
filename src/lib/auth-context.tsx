import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getAllowedAdminEmails() {
  const raw = import.meta.env.VITE_ADMIN_EMAILS as string | undefined;

  if (!raw) {
    return null;
  }

  const emails = raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return emails.length > 0 ? emails : null;
}

function isAllowedAdmin(user: User | null) {
  if (!user?.email) {
    return false;
  }

  const allowedEmails = getAllowedAdminEmails();

  if (!allowedEmails) {
    return true;
  }

  return allowedEmails.includes(user.email.toLowerCase());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Erreur de recuperation de session admin", error);
      }

      if (isMounted) {
        setSession(data.session ?? null);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      isAdmin: isAllowedAdmin(session?.user ?? null),
    }),
    [isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit etre utilise dans AuthProvider");
  }

  return context;
}
