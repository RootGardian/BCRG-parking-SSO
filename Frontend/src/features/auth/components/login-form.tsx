"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Globe, Lock, LogIn, ShieldAlert, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "../services/auth.service";
import { useAuth } from "../hooks/use-auth";
import { type LoginInput, loginSchema } from "../schemas/login-schema";

const BCRG_HUB_URL =
  process.env.NEXT_PUBLIC_BCRG_HUB_URL || "http://localhost:5001";

/**
 * Composant de formulaire de connexion institutionnel BCRG.
 *
 * Supporte :
 * - Authentification fédérée SSO via le BCRG HUB (connecté à l'Active Directory)
 * - Authentification locale (matricule & mot de passe)
 * - Détection automatique de jeton SSO dans les paramètres d'URL
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPasswordChanged = searchParams.get("password_changed") === "1";
  const errorParam = searchParams.get("error");
  const errorMessageParam = searchParams.get("message");

  const [isSsoAuthenticating, setIsSsoAuthenticating] = React.useState(false);
  const [ssoError, setSsoError] = React.useState<string | null>(null);

  const { handleLogin, isLoading, errorMessage } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      matricule: "",
      mot_de_passe: "",
    },
  });

  // Détection d'un jeton sso_token transmis directement en query param
  React.useEffect(() => {
    const ssoToken = searchParams.get("sso_token");
    if (ssoToken && !isSsoAuthenticating) {
      setIsSsoAuthenticating(true);
      authService
        .loginWithSso(ssoToken)
        .then((user) => {
          const role = (user.role || "").toLowerCase();
          const target =
            role === "agent"
              ? "/agent"
              : role === "personnel"
                ? "/personnel"
                : "/admin";
          window.location.replace(target);
        })
        .catch((err: any) => {
          setSsoError(err.message || "Échec de validation du jeton SSO.");
          setIsSsoAuthenticating(false);
        });
    }
  }, [searchParams, isSsoAuthenticating, router]);

  const onSubmit = (data: LoginInput) => {
    handleLogin(data);
  };

  const handleHubSsoRedirect = () => {
    window.location.href = BCRG_HUB_URL;
  };

  if (isSsoAuthenticating) {
    return (
      <div className="w-full max-w-md space-y-4 text-center py-10">
        <div className="size-10 border-3 border-brand-green-700/20 border-t-brand-green-700 rounded-full animate-spin mx-auto" />
        <h3 className="text-base font-semibold text-foreground">
          Validation SSO BCRG HUB...
        </h3>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* En-tête du Formulaire */}
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="font-brand text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Connexion
        </h2>
        <p className="text-sm text-muted-foreground">
          Connectez-vous via le portail unique <strong>BCRG HUB</strong> ou vos
          identifiants internes.
        </p>
      </div>

      {/* Alerte de mot de passe renouvelé avec succès */}
      {isPasswordChanged && (
        <div className="rounded-lg bg-brand-green-700/10 border border-brand-green-700/30 p-3.5 text-xs font-medium text-brand-green-700 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>
            Votre mot de passe a été mis à jour avec succès. Veuillez vous
            connecter avec vos nouveaux identifiants.
          </span>
        </div>
      )}

      {/* Alerte d'erreur SSO provenant de la redirection */}
      {(errorParam || ssoError) && (
        <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-3.5 text-xs font-medium text-destructive flex items-start gap-2 animate-in fade-in-50">
          <ShieldAlert className="size-4 shrink-0 mt-0.5" />
          <div>
            <strong>Échec de la connexion SSO :</strong>{" "}
            {ssoError ||
              (errorMessageParam ? decodeURIComponent(errorMessageParam) : null) ||
              "Jeton d'authentification invalide, expiré ou révoqué par le BCRG HUB."}
          </div>
        </div>
      )}

      {/* Alerte d'erreur globale locale */}
      {errorMessage && (
        <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-3.5 text-xs font-medium text-destructive animate-in fade-in-50">
          {errorMessage}
        </div>
      )}

      {/* BOUTON SSO BCRG HUB RECOMMANDÉ */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleHubSsoRedirect}
          className="w-full h-12 border-brand-green-700/40 hover:bg-brand-green-700/10 hover:border-brand-green-700 text-foreground font-semibold flex items-center justify-center gap-2.5 shadow-sm transition-all"
        >
          <Globe className="size-4 text-brand-green-700" />
          <span>Connexion unique via BCRG HUB (SSO)</span>
        </Button>
        <p className="text-[11px] text-center text-muted-foreground">
          Accès direct sécurisé avec l&apos;Active Directory de la Banque
          Centrale.
        </p>
      </div>

      <div className="relative my-4 flex items-center">
        <div className="flex-grow border-t border-border" />
        <span className="mx-3 flex-shrink text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          Accès Guichet Vigiles & Superviseurs (Par Matricule)
        </span>
        <div className="flex-grow border-t border-border" />
      </div>

      {/* Formulaire local pour Vigiles et Superviseurs de guichet */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Matricule"
          placeholder="ex: 1234"
          leftIcon={<User className="size-4" />}
          error={errors.matricule?.message}
          {...register("matricule")}
          autoComplete="username"
        />

        <Input
          type="password"
          label="Mot de Passe"
          placeholder="••••••••••••"
          leftIcon={<Lock className="size-4" />}
          error={errors.mot_de_passe?.message}
          {...register("mot_de_passe")}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full mt-2 font-semibold shadow-md"
          isLoading={isLoading}
        >
          <LogIn className="size-4" />
          Se Connecter
        </Button>
      </form>
    </div>
  );
}
