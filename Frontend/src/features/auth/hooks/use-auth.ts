"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/shared/store/use-auth-store";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import type { LoginInput } from "../schemas/login-schema";
import { authService } from "../services/auth.service";

/**
 * Custom hook encapsulant la logique d'authentification,
 * la récupération du profil connecté, le changement de mot de passe et les redirections.
 *
 * @returns Fonctions et états de gestion de l'authentification
 */
export function useAuth() {
  const router = useRouter();
  const updateUserDoitChangerMdp = useAuthStore(
    (state) => state.updateUserDoitChangerMdp,
  );
  const logoutStore = useAuthStore((state) => state.logout);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const fetchCurrentUser = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const user = await authService.getMe();
      return user;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = async (data: LoginInput) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const user = await authService.login(data);

      // 1. Vérification du changement obligatoire de mot de passe (première connexion)
      if (user.doit_changer_mdp) {
        toast.info(
          "Première connexion : Veuillez renouveler votre mot de passe pour accéder à votre espace.",
        );
        if (typeof window !== "undefined") {
          window.location.href = "/change-password";
        } else {
          router.replace("/change-password");
        }
        return;
      }

      toast.success(`Bienvenue, ${user.prenom} ${user.nom} !`);

      // 2. Redirection stricte selon le rôle RBAC vers son espace dédié
      const targetPath =
        user.role === "agent"
          ? "/agent"
          : user.role === "personnel"
            ? "/personnel"
            : "/admin";

      if (typeof window !== "undefined") {
        window.location.href = targetPath;
      } else {
        router.replace(targetPath);
      }
    } catch (err: unknown) {
      const msg = getApiErrorMessage(
        err,
        "Identifiants invalides. Veuillez réessayer.",
      );
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (nouveau_mot_de_passe: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await authService.changePassword(nouveau_mot_de_passe);
      updateUserDoitChangerMdp(false);
      toast.success(result.message);
      return true;
    } catch (err: unknown) {
      const msg = getApiErrorMessage(
        err,
        "Impossible de modifier le mot de passe.",
      );
      setErrorMessage(msg);
      toast.error(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    logoutStore();
    if (typeof window !== "undefined") {
      const hubUrl = process.env.NEXT_PUBLIC_BCRG_HUB_FRONTEND_URL || "http://localhost:5173";
      window.location.href = hubUrl;
    } else {
      router.replace("/login");
    }
  };

  return {
    fetchCurrentUser,
    handleLogin,
    handleChangePassword,
    handleLogout,
    isLoading,
    errorMessage,
  };
}
