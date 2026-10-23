import { apiClient } from "@/shared/services/api-client";
import { ENDPOINTS } from "@/shared/services/endpoints";
import { useAuthStore } from "@/shared/store/use-auth-store";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import type { RoleEnum, Utilisateur } from "@/types/models";
import type { ApiUserProfile, LoginPayload } from "../types";

/**
 * Normalise un profil brut renvoyé par l'API en une entité Utilisateur cliente typée.
 */
function normalizeUserProfile(profile: ApiUserProfile): Utilisateur {
  let role: RoleEnum = "admin";
  if (Array.isArray(profile.role) && profile.role.length > 0) {
    role = (profile.role[0] as RoleEnum) || "admin";
  } else if (typeof profile.role === "string") {
    role = (profile.role as RoleEnum) || "admin";
  }

  const rawObj = profile as unknown as Record<string, unknown>;
  const agentObj = rawObj.agent as Record<string, unknown> | undefined;
  const parkingObj = (rawObj.parking || agentObj?.parking) as
    | Record<string, unknown>
    | undefined;

  const parkingNom = parkingObj?.nom
    ? String(parkingObj.nom)
    : rawObj.parking_nom
      ? String(rawObj.parking_nom)
      : undefined;

  const idParking =
    rawObj.id_parking !== undefined && rawObj.id_parking !== null
      ? Number(rawObj.id_parking)
      : agentObj?.id_parking !== undefined && agentObj.id_parking !== null
        ? Number(agentObj.id_parking)
        : parkingObj?.id !== undefined && parkingObj.id !== null
          ? Number(parkingObj.id)
          : undefined;

  return {
    id: profile.id,
    nom: profile.nom,
    prenom: profile.prenom,
    matricule: profile.matricule,
    role,
    est_actif: profile.est_actif ?? true,
    doit_changer_mdp: profile.doit_changer_mdp ?? false,
    avatar: profile.avatar,
    id_parking: idParking,
    parking_nom: parkingNom,
    agent: agentObj
      ? {
          id: Number(agentObj.id || 0),
          id_parking: idParking,
          parking: parkingObj
            ? { id: Number(parkingObj.id), nom: String(parkingObj.nom) }
            : null,
        }
      : undefined,
  };
}

/**
 * Service d'authentification responsable des interactions directes avec le serveur Backend Render.
 * Option B : Stockage direct du jeton JWT (Bearer) dans le localStorage.
 */
export const authService = {
  /**
   * Effectue la connexion auprès du serveur Backend Render.
   *
   * @param payload Données de connexion (matricule & mot de passe)
   * @returns L'utilisateur normalisé
   */
  async login(payload: LoginPayload): Promise<Utilisateur> {
    try {
      const response = await apiClient.post<{
        access_token?: string;
        token?: string;
        utilisateur?: ApiUserProfile;
        user?: ApiUserProfile;
      }>(ENDPOINTS.AUTH.LOGIN, {
        matricule: payload.matricule.trim(),
        mot_de_passe: payload.mot_de_passe,
      });

      const resData = response.data || {};
      const token = resData.access_token || resData.token;
      const rawUser =
        resData.utilisateur ||
        resData.user ||
        (resData as unknown as { profil?: ApiUserProfile }).profil;

      if (!rawUser) {
        throw new Error("Réponse d'authentification invalide.");
      }

      // 1. Détection depuis les champs de réponse
      let mustChangePassword = Boolean(
        (resData as unknown as { doit_changer_mdp?: boolean })
          .doit_changer_mdp ||
          (resData as unknown as { requires_password_change?: boolean })
            .requires_password_change ||
          rawUser.doit_changer_mdp ||
          (rawUser as unknown as { requires_password_change?: boolean })
            .requires_password_change,
      );

      // 2. Détection depuis le payload JWT si disponible
      if (token && !mustChangePassword) {
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payloadDecoded = JSON.parse(atob(parts[1]));
            if (
              payloadDecoded.requires_password_change === true ||
              payloadDecoded.doit_changer_mdp === true ||
              payloadDecoded.must_change_password === true
            ) {
              mustChangePassword = true;
            }
          }
        } catch {
          // Ignorer si non-JWT
        }
      }

      // 3. Détection proactive via vérification immédiate auprès de /api/auth/me
      if (token && !mustChangePassword) {
        try {
          const meRes = await apiClient.get<{
            utilisateur?: ApiUserProfile;
            user?: ApiUserProfile;
            profil?: ApiUserProfile;
            doit_changer_mdp?: boolean;
            requires_password_change?: boolean;
          }>(ENDPOINTS.AUTH.ME, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const meData = meRes.data;
          const meUser = (meData?.utilisateur ||
            meData?.user ||
            meData?.profil) as
            | (ApiUserProfile & { requires_password_change?: boolean })
            | undefined;
          if (
            meData?.requires_password_change === true ||
            meData?.doit_changer_mdp === true ||
            meUser?.requires_password_change === true ||
            meUser?.doit_changer_mdp === true
          ) {
            mustChangePassword = true;
          }
        } catch (meErr: unknown) {
          const axiosErr = meErr as {
            response?: {
              status?: number;
              data?: {
                requires_password_change?: boolean;
                doit_changer_mdp?: boolean;
                error?: string;
              };
            };
          };
          if (
            axiosErr?.response?.status === 403 &&
            (axiosErr.response.data?.requires_password_change ||
              axiosErr.response.data?.doit_changer_mdp ||
              axiosErr.response.data?.error
                ?.toLowerCase()
                .includes("réinitialiser votre mot de passe"))
          ) {
            mustChangePassword = true;
          }
        }
      }

      const user = normalizeUserProfile(rawUser);
      user.doit_changer_mdp = mustChangePassword;

      if (token) {
        useAuthStore.getState().setAuth(user, token);
      }

      return user;
    } catch (error: unknown) {
      console.error("Erreur d'authentification:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Identifiants incorrects ou serveur indisponible.",
        ),
      );
    }
  },

  /**
   * Effectue la connexion SSO auprès du serveur Backend via le jeton BCRG HUB.
   *
   * @param ssoToken Jeton SSO émis par le BCRG HUB
   * @returns L'utilisateur normalisé connecté
   */
  async loginWithSso(ssoToken: string): Promise<Utilisateur> {
    try {
      const response = await apiClient.post<{
        access_token?: string;
        token?: string;
        utilisateur?: ApiUserProfile;
        user?: ApiUserProfile;
      }>(ENDPOINTS.AUTH.SSO_LOGIN, {
        sso_token: ssoToken.trim(),
      });

      const resData = response.data || {};
      const token = resData.access_token || resData.token;
      const rawUser =
        resData.utilisateur ||
        resData.user ||
        (resData as unknown as { profil?: ApiUserProfile }).profil;

      if (!rawUser) {
        throw new Error("Réponse SSO invalide du serveur Parking.");
      }

      const user = normalizeUserProfile(rawUser);
      user.doit_changer_mdp = false; // Compte SSO Active Directory, pas de changement imposé

      if (token) {
        useAuthStore.getState().setAuth(user, token);
      }

      return user;
    } catch (error: unknown) {
      console.error("Erreur d'authentification SSO:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Échec de l'authentification SSO avec le BCRG HUB.",
        ),
      );
    }
  },

  /**
   * Récupère le profil de l'utilisateur connecté via `/api/auth/me`.
   */
  async getMe(): Promise<Utilisateur> {
    try {
      const response = await apiClient.get<{
        utilisateur?: ApiUserProfile;
        user?: ApiUserProfile;
        profil?: ApiUserProfile;
      }>(ENDPOINTS.AUTH.ME);

      const rawUser =
        response.data?.utilisateur ||
        response.data?.user ||
        response.data?.profil;
      if (!rawUser) {
        throw new Error("Impossible de récupérer les informations de profil.");
      }

      const user = normalizeUserProfile(rawUser);
      useAuthStore.getState().setUser(user);
      return user;
    } catch (error: unknown) {
      console.error("Erreur récupération profil:", error);
      const axiosErr = error as {
        response?: {
          status?: number;
          data?: {
            requires_password_change?: boolean;
            doit_changer_mdp?: boolean;
          };
        };
      };
      if (
        axiosErr?.response?.status === 403 &&
        (axiosErr.response.data?.requires_password_change ||
          axiosErr.response.data?.doit_changer_mdp)
      ) {
        useAuthStore.getState().updateUserDoitChangerMdp(true);
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/change-password")
        ) {
          window.location.href = "/change-password";
        }
      }

      throw new Error(
        getApiErrorMessage(error, "Session expirée ou non autorisée."),
      );
    }
  },

  /**
   * Permet à l'utilisateur de changer son mot de passe (`POST /api/auth/change-password`).
   */
  async changePassword(
    nouveau_mot_de_passe: string,
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        ENDPOINTS.AUTH.CHANGE_PASSWORD,
        {
          nouveau_mot_de_passe,
        },
      );
      return {
        message:
          response.data?.message || "Mot de passe mis à jour avec succès.",
      };
    } catch (error: unknown) {
      console.error("Erreur changement mot de passe:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Impossible de changer le mot de passe. Veuillez réessayer.",
        ),
      );
    }
  },

  /**
   * Déconnecte l'utilisateur et nettoie le localStorage.
   */
  async logout(): Promise<void> {
    useAuthStore.getState().logout();
  },
};
