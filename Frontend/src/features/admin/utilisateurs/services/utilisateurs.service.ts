import { apiClient } from "@/shared/services/api-client";
import { ENDPOINTS } from "@/shared/services/endpoints";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import type { RoleEnum, Utilisateur } from "@/types/models";
import type {
  PaginatedUtilisateursResponse,
  UtilisateurFilterInput,
  UtilisateurInput,
} from "../types";

/**
 * Formate le rôle en majuscule initiale pour respecter l'énumération backend.
 * (enum: ["Agent", "Supervision", "Administrateur"])
 */
function formatRoleForApi(role?: string): string | undefined {
  if (!role) return undefined;
  const r = role.toLowerCase().trim();
  if (r === "admin" || r === "administrateur") return "Administrateur";
  if (r === "supervision") return "Supervision";
  if (r === "agent") return "Agent";
  return role;
}

/**
 * Normalise un objet utilisateur brut renvoyé par l'API backend.
 */
function normalizeUtilisateur(
  item: Record<string, unknown>,
  index: number,
): Utilisateur {
  const personnelObj = item.personnel as Record<string, unknown> | undefined;
  const fonctionObj = personnelObj?.fonction as
    | Record<string, unknown>
    | undefined;
  const fonctionNom = fonctionObj?.nom ? String(fonctionObj.nom) : undefined;

  let role: RoleEnum = "personnel";

  if (Array.isArray(item.role) && item.role.length > 0) {
    const r = String(item.role[0]).toLowerCase();
    if (r === "admin" || r === "administrateur") role = "admin";
    else if (r === "supervision") role = "supervision";
    else if (r === "agent") role = "agent";
    else if (r === "personnel") role = "personnel";
  } else if (typeof item.role === "string" && item.role.trim() !== "") {
    const r = item.role.toLowerCase();
    if (r === "admin" || r === "administrateur") role = "admin";
    else if (r === "supervision") role = "supervision";
    else if (r === "agent") role = "agent";
    else if (r === "personnel") role = "personnel";
  } else if (personnelObj) {
    role = "personnel";
  }

  const agentObj = item.agent as Record<string, unknown> | undefined;
  const parkingObj = (item.parking || agentObj?.parking) as
    | Record<string, unknown>
    | undefined;
  const parkingNom = parkingObj?.nom ? String(parkingObj.nom) : undefined;
  const idParkingFromObj =
    parkingObj?.id !== undefined && parkingObj.id !== null
      ? Number(parkingObj.id)
      : undefined;

  const idParking =
    item.id_parking !== undefined && item.id_parking !== null
      ? Number(item.id_parking)
      : agentObj?.id_parking !== undefined && agentObj.id_parking !== null
        ? Number(agentObj.id_parking)
        : idParkingFromObj;

  return {
    id: Number(item.id || index + 1),
    nom: String(item.nom || ""),
    prenom: String(item.prenom || ""),
    matricule: String(item.matricule || ""),
    role,
    fonction: fonctionNom,
    est_actif: item.est_actif !== false,
    doit_changer_mdp: item.doit_changer_mdp === true,
    avatar: item.avatar ? String(item.avatar) : undefined,
    created_at: item.created_at ? String(item.created_at) : undefined,
    id_parking: idParking,
    parking_nom: parkingNom,
    agent: agentObj
      ? {
        id: Number(agentObj.id || 0),
        id_parking: idParking ?? null,
      }
      : undefined,
  };
}

/**
 * Service HTTP de gestion des Utilisateurs du Système BCRG.
 */
export const utilisateursService = {
  /**
   * Récupère la liste paginée et filtrée des utilisateurs (`GET /api/v1/admin/utilisateurs`).
   */
  async getUtilisateurs(
    filters: UtilisateurFilterInput = {},
    page = 1,
    pageSize = 10,
  ): Promise<PaginatedUtilisateursResponse> {
    try {
      const response = await apiClient.get(ENDPOINTS.ADMIN.UTILISATEURS);
      const resData = response.data || {};

      const rawList: Record<string, unknown>[] = Array.isArray(resData.data)
        ? resData.data
        : Array.isArray(resData.utilisateurs)
          ? resData.utilisateurs
          : Array.isArray(resData)
            ? resData
            : [];

      let normalizedUsers = rawList.map(normalizeUtilisateur);

      // Recherche multicritères (nom, prénom, matricule)
      if (filters.search && filters.search.trim() !== "") {
        const q = filters.search.toLowerCase().trim();
        normalizedUsers = normalizedUsers.filter(
          (u) =>
            u.nom.toLowerCase().includes(q) ||
            u.prenom.toLowerCase().includes(q) ||
            u.matricule.toLowerCase().includes(q) ||
            u.fonction?.toLowerCase().includes(q),
        );
      }

      // Filtre par rôle RBAC ou catégorie
      if (filters.role && filters.role !== "all") {
        normalizedUsers = normalizedUsers.filter(
          (u) => u.role === filters.role,
        );
      }

      // Filtre par état du compte
      if (filters.est_actif && filters.est_actif !== "all") {
        const isActif = filters.est_actif === "actif";
        normalizedUsers = normalizedUsers.filter(
          (u) => u.est_actif === isActif,
        );
      }

      const total = normalizedUsers.length;
      const totalPages = Math.ceil(total / pageSize) || 1;
      const start = (page - 1) * pageSize;
      const paginatedData = normalizedUsers.slice(start, start + pageSize);

      return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 1,
      };
    }
  },

  /**
   * Crée un nouvel utilisateur dans le système BCRG.
   */
  async createUtilisateur(input: UtilisateurInput): Promise<Utilisateur> {
    try {
      const payload: Record<string, unknown> = {
        nom: input.nom.trim(),
        prenom: input.prenom.trim(),
        matricule: input.matricule.trim().toUpperCase(),
        role: formatRoleForApi(input.role),
        // doit_changer_mdp: true,
      };

      const roleLower = String(input.role || "").toLowerCase().trim();
      if (
        roleLower === "agent" &&
        input.id_parking !== undefined &&
        input.id_parking !== null &&
        input.id_parking !== ("" as unknown)
      ) {
        payload.id_parking = Number(input.id_parking);
      }

      const response = await apiClient.post(
        ENDPOINTS.ADMIN.UTILISATEURS,
        payload,
      );

      const resData = response.data || {};
      return normalizeUtilisateur(resData, Date.now());
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      throw new Error(
        getApiErrorMessage(error, "Impossible de créer l'utilisateur."),
      );
    }
  },

  /**
   * Met à jour les informations d'un utilisateur.
   */
  async updateUtilisateur(
    matricule: string,
    input: Partial<UtilisateurInput>,
  ): Promise<Utilisateur> {
    try {
      const payload: Record<string, unknown> = {};
      if (input.nom) payload.nom = input.nom.trim();
      if (input.prenom) payload.prenom = input.prenom.trim();
      if (input.matricule)
        payload.matricule = input.matricule.trim().toUpperCase();
      if (input.role) payload.role = formatRoleForApi(input.role);

      const roleLower = String(input.role || "").toLowerCase().trim();
      if (roleLower === "agent") {
        if (
          input.id_parking !== undefined &&
          input.id_parking !== null &&
          input.id_parking !== ("" as unknown)
        ) {
          payload.id_parking = Number(input.id_parking);
        } else {
          payload.id_parking = null;
        }
      }

      const response = await apiClient.put(
        ENDPOINTS.ADMIN.UTILISATEUR_BY_MATRICULE(matricule),
        payload,
      );

      const resData = response.data || {};
      return normalizeUtilisateur(resData, 0);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      throw new Error(
        getApiErrorMessage(error, "Impossible de mettre à jour l'utilisateur."),
      );
    }
  },

  /**
   * Alterne l'état actif/inactif du compte utilisateur.
   * - Suspendre (si actuellement actif) : DELETE /api/v1/admin/utilisateurs/{matricule}
   * - Réactiver (si actuellement inactif) : PUT /api/v1/admin/utilisateurs/{matricule} avec { est_actif: true }
   */
  async toggleUserStatus(
    matricule: string,
    currentStatus: boolean,
  ): Promise<boolean> {
    try {
      if (currentStatus) {
        // Soft delete / désactivation
        try {
          await apiClient.delete(
            ENDPOINTS.ADMIN.UTILISATEUR_BY_MATRICULE(matricule),
          );
        } catch {
          await apiClient.put(
            ENDPOINTS.ADMIN.UTILISATEUR_BY_MATRICULE(matricule),
            { est_actif: false },
          );
        }
        return false;
      }

      // Réactivation
      const response = await apiClient.put(
        ENDPOINTS.ADMIN.UTILISATEUR_BY_MATRICULE(matricule),
        { est_actif: true },
      );
      return response.data?.est_actif ?? true;
    } catch (error) {
      console.error("Erreur lors de la modification du statut:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Impossible de modifier le statut de l'utilisateur.",
        ),
      );
    }
  },

  /**
   * Réinitialise le mot de passe d'un utilisateur (remis à son matricule).
   */
  async resetPassword(matricule: string): Promise<string> {
    try {
      await apiClient.put(ENDPOINTS.ADMIN.UTILISATEUR_BY_MATRICULE(matricule), {
        reinitialiser_mot_de_passe: true,
        mot_de_passe: matricule,
        doit_changer_mdp: true,
      });
      return matricule;
    } catch (error) {
      console.error(
        "Erreur lors de la réinitialisation du mot de passe:",
        error,
      );
      throw new Error(
        getApiErrorMessage(
          error,
          "Impossible de réinitialiser le mot de passe.",
        ),
      );
    }
  },

  /**
   * Importe un fichier CSV d'utilisateurs.
   */
  async importCsv(file: File): Promise<{ count: number; message: string }> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(
        ENDPOINTS.ADMIN.IMPORTS_UTILISATEURS,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return {
        count: Number(response.data?.count || response.data?.total || 0),
        message: response.data?.message || "Importation CSV réussie.",
      };
    } catch (error) {
      console.error("Erreur lors de l'importation du fichier CSV:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Erreur lors de l'importation du fichier CSV.",
        ),
      );
    }
  },
};
