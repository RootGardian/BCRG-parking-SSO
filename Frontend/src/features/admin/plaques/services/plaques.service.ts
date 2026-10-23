import { apiClient } from "@/shared/services/api-client";
import { ENDPOINTS } from "@/shared/services/endpoints";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import type { Vehicule } from "@/types/models";
import type {
  PaginatedPlaquesResponse,
  PlaqueInput,
  VehiculeFilterInput,
} from "../types";

/**
 * Service Métier pour la gestion de la flotte automobile et l'intégration API backend.
 */
export const plaquesService = {
  /**
   * Récupère la liste filtrée et paginée des véhicules de la flotte (`GET /api/v1/admin/vehicules`).
   */
  async getPlaques(
    filters: VehiculeFilterInput = {},
    page = 1,
    pageSize = 10,
  ): Promise<PaginatedPlaquesResponse> {
    try {
      let rawList: Record<string, unknown>[] = [];

      try {
        const response = await apiClient.get(ENDPOINTS.ADMIN.VEHICULES);
        const resData = response.data || {};
        rawList = Array.isArray(resData.data)
          ? resData.data
          : Array.isArray(resData.vehicules)
            ? resData.vehicules
            : Array.isArray(resData)
              ? resData
              : [];
      } catch {
        // Fallback sur /api/v1/vehicules/autorises si l'endpoint admin restreint
        const response = await apiClient.get(ENDPOINTS.VEHICULES.AUTORISES);
        const resData = response.data || {};
        rawList = Array.isArray(resData.data)
          ? resData.data
          : Array.isArray(resData)
            ? resData
            : [];
      }

      // Normalisation des véhicules de la flotte
      let normalizedVehicules: Vehicule[] = rawList.map(
        (item: Record<string, unknown>, index: number) => {
          const personnelObj = item.personnel as
            | Record<string, unknown>
            | undefined;
          const userObj = (personnelObj?.utilisateur || item.utilisateur) as
            | Record<string, unknown>
            | undefined;

          const plaque = String(
            item.numero_plaque || item.plaque || "Non renseigné",
          ).toUpperCase();

          const marque = String(
            item.marque_modele || item.marque || "Modèle non spécifié",
          );

          const nomProprietaire = userObj
            ? `${userObj.prenom || ""} ${userObj.nom || ""}`.trim()
            : personnelObj
              ? `${personnelObj.prenom || ""} ${personnelObj.nom || ""}`.trim()
              : item.nom_proprietaire
                ? String(item.nom_proprietaire)
                : undefined;

          return {
            id: Number(item.id || index + 1),
            numero_plaque: plaque,
            marque_modele: marque,
            couleur: item.couleur ? String(item.couleur) : "Indéterminée",
            type_vehicule: (item.type_vehicule || item.type || "personnel") as
              | "personnel"
              | "visiteur",
            id_personnel: item.id_personnel
              ? Number(item.id_personnel)
              : undefined,
            personnel:
              personnelObj || nomProprietaire
                ? {
                    id: Number(personnelObj?.id || 0),
                    id_utilisateur: Number(personnelObj?.id_utilisateur || 0),
                    fonction: String(
                      personnelObj?.fonction || "Personnel BCRG",
                    ),
                    utilisateur: {
                      id: Number(userObj?.id || 0),
                      nom: userObj?.nom
                        ? String(userObj.nom)
                        : personnelObj?.nom
                          ? String(personnelObj.nom)
                          : nomProprietaire || "",
                      prenom: userObj?.prenom
                        ? String(userObj.prenom)
                        : personnelObj?.prenom
                          ? String(personnelObj.prenom)
                          : "",
                      matricule: String(
                        userObj?.matricule || personnelObj?.matricule || "",
                      ),
                      role: "personnel",
                      est_actif: true,
                    },
                  }
                : undefined,
          };
        },
      );

      // Filtrage par texte
      if (filters.search && filters.search.trim() !== "") {
        const q = filters.search.toLowerCase().trim();
        normalizedVehicules = normalizedVehicules.filter(
          (v) =>
            v.numero_plaque.toLowerCase().includes(q) ||
            (v.marque_modele || "").toLowerCase().includes(q) ||
            v.personnel?.utilisateur?.nom.toLowerCase().includes(q) ||
            v.personnel?.utilisateur?.prenom.toLowerCase().includes(q) ||
            v.personnel?.utilisateur?.matricule.toLowerCase().includes(q),
        );
      }

      // Filtrage par catégorie
      if (filters.type_vehicule && filters.type_vehicule !== "all") {
        normalizedVehicules = normalizedVehicules.filter(
          (v) => v.type_vehicule === filters.type_vehicule,
        );
      }

      // Pagination côté client
      const total = normalizedVehicules.length;
      const totalPages = Math.ceil(total / pageSize) || 1;
      const start = (page - 1) * pageSize;
      const paginatedData = normalizedVehicules.slice(start, start + pageSize);

      return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des véhicules de la flotte:",
        error,
      );
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
   * Récupère la liste des options du personnel pour le sélecteur avec recherche.
   */
  async getPersonnelOptions(): Promise<
    { value: string; label: string; description?: string }[]
  > {
    try {
      const response = await apiClient.get(ENDPOINTS.ADMIN.PERSONNEL);
      const resData = response.data || {};
      const rawList: Record<string, unknown>[] = Array.isArray(resData.data)
        ? resData.data
        : Array.isArray(resData.utilisateurs)
          ? resData.utilisateurs
          : Array.isArray(resData)
            ? resData
            : [];

      return rawList.map((item) => {
        const matricule = String(item.matricule || "");
        const nom = String(item.nom || "");
        const prenom = String(item.prenom || "");
        const fonction = typeof item.fonction === "string" ? item.fonction : "";

        return {
          value: matricule,
          label:
            `${prenom} ${nom}`.trim() + (matricule ? ` (${matricule})` : ""),
          description: fonction || `Matricule : ${matricule}`,
        };
      });
    } catch (error) {
      console.error("Erreur récupération options personnel:", error);
      return [];
    }
  },

  /**
   * Enregistre un nouveau véhicule dans la flotte et le rattache au personnel (`POST /api/v1/personnel/{matricule}/vehicules`).
   */
  async createPlaque(input: PlaqueInput): Promise<Vehicule> {
    try {
      const payload: Record<string, string> = {
        numero_plaque: input.numero_plaque.trim().toUpperCase(),
      };

      if (input.marque_modele && input.marque_modele.trim() !== "") {
        payload.marque = input.marque_modele.trim();
      }

      if (input.couleur && input.couleur.trim() !== "") {
        payload.couleur = input.couleur.trim();
      }

      const matricule = input.matricule_personnel.trim();
      const response = await apiClient.post(
        ENDPOINTS.PERSONNEL.VEHICLES(matricule),
        payload,
      );

      const resData = response.data || {};

      return {
        id: Number(resData.id || Date.now()),
        numero_plaque: payload.numero_plaque,
        marque_modele: payload.marque || "Modèle non spécifié",
        couleur: payload.couleur || "Indéterminée",
        type_vehicule: "personnel",
      };
    } catch (error) {
      console.error("Erreur lors de la création d'un véhicule:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Erreur lors de l'enregistrement du véhicule.",
        ),
      );
    }
  },

  /**
   * Met à jour un véhicule existant.
   */
  async updatePlaque(
    id: number,
    input: Partial<PlaqueInput>,
  ): Promise<Vehicule> {
    try {
      const payload = {
        ...input,
        numero_plaque: input.numero_plaque
          ? input.numero_plaque.trim().toUpperCase()
          : undefined,
      };

      const response = await apiClient.put(
        `${ENDPOINTS.VEHICULES.LIST}/${id}`,
        payload,
      );
      const resData = response.data || {};

      return {
        id,
        numero_plaque: payload.numero_plaque || "RC-0000-A",
        marque_modele: payload.marque_modele,
        couleur: payload.couleur,
        type_vehicule: payload.type_vehicule || "personnel",
        id_personnel: payload.id_personnel,
        ...resData,
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour du véhicule:", error);
      throw new Error(
        getApiErrorMessage(error, "Impossible de mettre à jour le véhicule."),
      );
    }
  },

  /**
   * Supprime un véhicule de la flotte.
   */
  async deletePlaque(id: number): Promise<void> {
    try {
      await apiClient.delete(`${ENDPOINTS.VEHICULES.LIST}/${id}`);
    } catch (error) {
      console.error("Erreur lors de la suppression du véhicule:", error);
      throw new Error(
        getApiErrorMessage(error, "Impossible de supprimer le véhicule."),
      );
    }
  },

  /**
   * Importe un fichier CSV de la flotte et du personnel.
   */
  async importCsv(file: File): Promise<{ count: number; message: string }> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(
        ENDPOINTS.ADMIN.IMPORTS_PERSONNEL,
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
