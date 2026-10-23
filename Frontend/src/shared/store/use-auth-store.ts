import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Utilisateur } from "@/types/models";

/**
 * Interface décrivant l'état du store d'authentification Zustand.
 */
interface AuthState {
  /** Jeton d'accès JWT de la session */
  token: string | null;
  /** Utilisateur actuellement connecté */
  user: Utilisateur | null;
  /** Indique si l'utilisateur est authentifié */
  isAuthenticated: boolean;
  /** Initialise la session client avec l'utilisateur et son jeton JWT */
  setAuth: (user: Utilisateur, token?: string) => void;
  /** Met à jour les informations de l'utilisateur */
  setUser: (user: Utilisateur) => void;
  /** Met à jour le flag doit_changer_mdp de l'utilisateur */
  updateUserDoitChangerMdp: (doitChangerMdp: boolean) => void;
  /** Réinitialise l'état client lors de la déconnexion */
  logout: () => void;
}

/**
 * Store Zustand réactif et persistant (localStorage + Cookie de session).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        const activeToken = token || get().token;

        if (typeof window !== "undefined" && activeToken) {
          localStorage.setItem("bcrg_token", activeToken);
          // biome-ignore lint/suspicious/noDocumentCookie: Cookies de synchronisation pour le middleware proxy Next.js
          document.cookie = `bcrg_session=${activeToken}; path=/; SameSite=Lax`;
          // biome-ignore lint/suspicious/noDocumentCookie: Cookie de rôle RBAC
          document.cookie = `bcrg_user_role=${user.role}; path=/; SameSite=Lax`;
          // biome-ignore lint/suspicious/noDocumentCookie: Cookie d'obligation de changement de mot de passe
          document.cookie = `bcrg_must_change_pwd=${user.doit_changer_mdp ? "true" : "false"}; path=/; SameSite=Lax`;
        }

        set({
          user,
          token: activeToken,
          isAuthenticated: true,
        });
      },

      setUser: (user) => {
        if (typeof window !== "undefined" && user) {
          // biome-ignore lint/suspicious/noDocumentCookie: Synchronisation rôle
          document.cookie = `bcrg_user_role=${user.role}; path=/; SameSite=Lax`;
          // biome-ignore lint/suspicious/noDocumentCookie: Synchronisation obligation changement mot de passe
          document.cookie = `bcrg_must_change_pwd=${user.doit_changer_mdp ? "true" : "false"}; path=/; SameSite=Lax`;
        }
        set({ user, isAuthenticated: !!user });
      },

      updateUserDoitChangerMdp: (doitChangerMdp) => {
        if (typeof window !== "undefined") {
          // biome-ignore lint/suspicious/noDocumentCookie: Mise à jour obligation changement mot de passe
          document.cookie = `bcrg_must_change_pwd=${doitChangerMdp ? "true" : "false"}; path=/; SameSite=Lax`;
        }
        set((state) => ({
          user: state.user
            ? { ...state.user, doit_changer_mdp: doitChangerMdp }
            : null,
        }));
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("bcrg_token");
          // biome-ignore lint/suspicious/noDocumentCookie: Nettoyage des cookies de session pour le middleware proxy
          document.cookie =
            "bcrg_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          // biome-ignore lint/suspicious/noDocumentCookie: Nettoyage cookie rôle
          document.cookie =
            "bcrg_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          // biome-ignore lint/suspicious/noDocumentCookie: Nettoyage cookie mot de passe
          document.cookie =
            "bcrg_must_change_pwd=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: "bcrg_auth_session",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
