"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CheckCircle2, Lock, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/shared/store/use-auth-store";
import {
  type ChangePasswordInput,
  changePasswordSchema,
} from "../schemas/change-password-schema";
import { authService } from "../services/auth.service";

/**
 * Formulaire institutionnel de changement obligatoire de mot de passe (ChangePasswordForm).
 *
 * Conçu pour les premières connexions (`doit_changer_mdp = true`).
 * Intègre :
 * - Validation dynamique des règles de sécurité (min 8 car., majuscule, minuscule, chiffre).
 * - Appel direct vers l'API Backend BCRG.
 * - Invalidation de la session courante et redirection propre vers la page de reconnexion.
 */
export function ChangePasswordForm() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      nouveau_mot_de_passe: "",
      confirmation_mot_de_passe: "",
    },
    mode: "onChange",
  });

  const pwdValue = watch("nouveau_mot_de_passe") || "";

  // Critères de validation en direct
  const rules = [
    { label: "Au moins 8 caractères", valid: pwdValue.length >= 8 },
    { label: "Au moins une lettre majuscule", valid: /[A-Z]/.test(pwdValue) },
    { label: "Au moins une lettre minuscule", valid: /[a-z]/.test(pwdValue) },
    { label: "Au moins un chiffre (0-9)", valid: /[0-9]/.test(pwdValue) },
  ];

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.changePassword(data.nouveau_mot_de_passe);
      toast.success(
        "Mot de passe renouvelé avec succès ! Reconnexion requise.",
      );

      // Invalidation de la session courante selon la politique de sécurité de l'API
      logout();

      if (typeof window !== "undefined") {
        window.location.href = "/login?password_changed=1";
      } else {
        router.replace("/login?password_changed=1");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Impossible de modifier le mot de passe.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* En-tête */}
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold">
          <ShieldAlert className="size-3.5" />
          <span>Première Connexion</span>
        </div>
        <h2 className="font-brand text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Nouveau Mot de Passe
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {user ? `Bonjour ${user.prenom} ${user.nom}. ` : ""}
          Pour garantir la sécurité de votre compte, vous devez définir un
          nouveau mot de passe personnel avant d&apos;accéder à votre espace.
        </p>
      </div>

      {/* Alerte d'erreur */}
      {errorMessage && (
        <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-3.5 text-xs font-medium text-destructive animate-in fade-in-50">
          {errorMessage}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          type="password"
          label="Nouveau mot de passe"
          placeholder="••••••••••••"
          leftIcon={<Lock className="size-4" />}
          error={errors.nouveau_mot_de_passe?.message}
          {...register("nouveau_mot_de_passe")}
          autoComplete="new-password"
          autoFocus
        />

        {/* Checklist des exigences de sécurité */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border/60 space-y-1.5 text-xs">
          <p className="font-semibold text-muted-foreground mb-1">
            Exigences de sécurité BCRG :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {rules.map((rule) => (
              <div
                key={rule.label}
                className={`flex items-center gap-1.5 transition-colors ${
                  rule.valid
                    ? "text-brand-green-700 dark:text-emerald-400 font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`size-3.5 rounded-full flex items-center justify-center shrink-0 ${
                    rule.valid
                      ? "bg-brand-green-700/20 text-brand-green-700 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Check className="size-2.5" />
                </div>
                <span className="text-[11px]">{rule.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Input
          type="password"
          label="Confirmer le nouveau mot de passe"
          placeholder="••••••••••••"
          leftIcon={<Lock className="size-4" />}
          error={errors.confirmation_mot_de_passe?.message}
          {...register("confirmation_mot_de_passe")}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full mt-2 font-semibold shadow-md bg-brand-green-700 hover:bg-brand-green-700/90 text-white"
          isLoading={isLoading}
        >
          <CheckCircle2 className="size-4" />
          Valider le nouveau mot de passe
        </Button>
      </form>
    </div>
  );
}
