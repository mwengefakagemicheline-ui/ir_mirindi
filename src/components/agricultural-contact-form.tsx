import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { useCreateAgriculturalInquiry } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type AgriculturalContactFormProps = {
  variant?: "light" | "dark";
  title?: string;
  description?: string;
  compact?: boolean;
};

const styles = {
  light: {
    card: "bg-white text-zinc-900",
    title: "text-zinc-900",
    description: "text-zinc-500",
    input:
      "border-b-2 border-zinc-200 text-zinc-900 placeholder-transparent focus:border-[#166534]",
    label:
      "text-zinc-500 peer-focus:text-[#166534]",
    button:
      "bg-[#166534] text-white hover:bg-[#14532d] shadow-xl shadow-green-900/20",
    successIcon: "bg-green-50",
    successIconColor: "text-green-600",
    successText: "text-zinc-500",
    resetButton: "text-[#166534] hover:text-[#14532d]",
  },
  dark: {
    card: "bg-white/5 text-white border border-white/10 backdrop-blur-sm",
    title: "text-white",
    description: "text-zinc-300",
    input:
      "border-b-2 border-white/15 text-white placeholder-transparent focus:border-[#4ade80]",
    label:
      "text-zinc-400 peer-focus:text-[#4ade80]",
    button:
      "bg-[#4ade80] text-green-950 hover:bg-[#22c55e] shadow-xl shadow-green-950/20",
    successIcon: "bg-white/10",
    successIconColor: "text-[#4ade80]",
    successText: "text-zinc-300",
    resetButton: "text-[#4ade80] hover:text-[#86efac]",
  },
} as const;

export function AgriculturalContactForm({
  variant = "light",
  title = "Démarrer une collaboration",
  description,
  compact = false,
}: AgriculturalContactFormProps) {
  const [form, setForm] = useState({ nom: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const createAgriculturalInquiry = useCreateAgriculturalInquiry();
  const ui = styles[variant];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await createAgriculturalInquiry.mutateAsync({
        name: form.nom,
        email: form.email,
        message: form.message,
      });
      setSent(true);
      setForm({ nom: "", email: "", message: "" });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible d'envoyer votre demande.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className={cn("rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden", ui.card)}>
      {sent ? (
        <div className={cn("text-center flex flex-col items-center justify-center", compact ? "py-8" : "py-12")}>
          <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-6", ui.successIcon)}>
            <CheckCircle2 className={cn("w-10 h-10", ui.successIconColor)} />
          </div>
          <h3 className={cn("font-display font-semibold mb-3", compact ? "text-2xl" : "text-3xl", ui.title)}>
            Demande reçue
          </h3>
          <p className={cn("mb-6 max-w-sm", ui.successText)}>
            Un membre de l&apos;équipe étudie votre message et vous recontactera rapidement.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className={cn("font-semibold border-b-2 border-transparent pb-1 transition-colors", ui.resetButton)}
          >
            Nouvelle demande
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={compact ? "space-y-6" : "space-y-8"}>
          <div>
            <h3 className={cn("font-display font-semibold", compact ? "text-2xl mb-2" : "text-3xl mb-4", ui.title)}>
              {title}
            </h3>
            {description && <p className={cn("leading-relaxed", ui.description)}>{description}</p>}
          </div>

          <div className={compact ? "space-y-5" : "space-y-6"}>
            <div className="relative">
              <input
                type="text"
                id={`nom-${variant}-${compact ? "compact" : "full"}`}
                required
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className={cn(
                  "peer w-full bg-transparent px-0 py-3 text-lg focus:outline-none transition-colors",
                  ui.input
                )}
                placeholder="Jean Dupont"
              />
              <label
                htmlFor={`nom-${variant}-${compact ? "compact" : "full"}`}
                className={cn(
                  "absolute left-0 -top-3.5 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:-top-3.5 peer-focus:text-sm font-medium pointer-events-none",
                  ui.label
                )}
              >
                Votre nom complet
              </label>
            </div>

            <div className="relative">
              <input
                type="email"
                id={`email-${variant}-${compact ? "compact" : "full"}`}
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={cn(
                  "peer w-full bg-transparent px-0 py-3 text-lg focus:outline-none transition-colors",
                  ui.input
                )}
                placeholder="email@domaine.com"
              />
              <label
                htmlFor={`email-${variant}-${compact ? "compact" : "full"}`}
                className={cn(
                  "absolute left-0 -top-3.5 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:-top-3.5 peer-focus:text-sm font-medium pointer-events-none",
                  ui.label
                )}
              >
                Adresse email
              </label>
            </div>

            <div className="relative">
              <textarea
                id={`message-${variant}-${compact ? "compact" : "full"}`}
                required
                rows={compact ? 3 : 4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={cn(
                  "peer w-full bg-transparent px-0 py-3 text-lg focus:outline-none transition-colors resize-none",
                  ui.input
                )}
                placeholder="Décrivez votre besoin"
              />
              <label
                htmlFor={`message-${variant}-${compact ? "compact" : "full"}`}
                className={cn(
                  "absolute left-0 -top-3.5 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:-top-3.5 peer-focus:text-sm font-medium pointer-events-none",
                  ui.label
                )}
              >
                Votre message
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={createAgriculturalInquiry.isPending}
            className={cn(
              "w-full font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-60",
              compact ? "text-base py-4" : "text-lg py-5",
              ui.button
            )}
          >
            {createAgriculturalInquiry.isPending ? "Envoi..." : "Envoyer la demande"}
            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </form>
      )}
    </div>
  );
}
