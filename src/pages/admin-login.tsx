import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export function AdminLogin() {
  const { session, isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && session && isAdmin) {
      setLocation("/admin");
    }
  }, [isAdmin, isLoading, session, setLocation]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Connexion impossible",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Connexion reussie",
      description: "Bienvenue dans l'espace administration.",
    });
    setLocation("/admin");
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[radial-gradient(circle_at_top,_rgba(161,161,170,0.12),_transparent_35%),linear-gradient(180deg,_#fafafa_0%,_#f4f4f5_100%)] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-zinc-200 bg-white/80 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
            <ShieldCheck className="h-4 w-4" />
            Espace protege
          </div>
          <h1 className="mt-6 max-w-md text-4xl font-display font-medium tracking-tight text-zinc-950">
            Connexion requise pour acceder a l'administration
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-zinc-600">
            Connectez-vous avec un compte autorise pour gerer les produits,
            mettre a jour le catalogue et piloter la boutique.
          </p>
          <div className="mt-10 space-y-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
            <p className="text-sm font-medium text-zinc-900">
              Acces admin recommande
            </p>
            <p className="text-sm leading-6 text-zinc-600">
              Si vous renseignez `VITE_ADMIN_EMAILS` dans le fichier `.env`,
              seuls les emails listes auront acces a `/admin` apres connexion.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-zinc-900 bg-zinc-950 p-8 text-white shadow-[0_25px_80px_rgba(24,24,27,0.28)]">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-zinc-400">
            <LockKeyhole className="h-4 w-4" />
            Login Admin
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-400"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@boutique.fr"
                required
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-500"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-400"
              >
                Mot de passe
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Votre mot de passe"
                required
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
