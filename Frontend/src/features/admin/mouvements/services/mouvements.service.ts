import { apiClient } from "@/shared/services/api-client";
import { ENDPOINTS } from "@/shared/services/endpoints";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import type { Vehicule } from "@/types/models";
import type {
  MouvementFilterInput,
  MouvementItem,
  PaginatedMouvementResponse,
} from "../types";

/**
 * Normalise un enregistrement brut de mouvement en MouvementItem typé.
 */
function normalizeMouvementItem(
  item: Record<string, unknown>,
  index: number,
): MouvementItem {
  const vehiculeObj = item.vehicule as Record<string, unknown> | undefined;
  const personnelObj = (vehiculeObj?.personnel || item.personnel) as
    | Record<string, unknown>
    | undefined;
  const userObj = (personnelObj?.utilisateur || item.utilisateur) as
    | Record<string, unknown>
    | undefined;
  const agentObj = item.agent as Record<string, unknown> | undefined;
  const agentUser = agentObj?.utilisateur as
    | Record<string, unknown>
    | undefined;

  const heureArrivee = String(
    item.heure_arrivee || item.created_at || new Date().toISOString(),
  );
  const heureDepart = item.heure_depart ? String(item.heure_depart) : null;

  // Calcul de la durée en minutes si disponible
  let dureeMinutes: number | undefined;
  if (heureArrivee && heureDepart) {
    const tStart = new Date(heureArrivee).getTime();
    const tEnd = new Date(heureDepart).getTime();
    if (!Number.isNaN(tStart) && !Number.isNaN(tEnd) && tEnd >= tStart) {
      dureeMinutes = Math.round((tEnd - tStart) / 60000);
    }
  }

  const vehicule: Vehicule | undefined =
    vehiculeObj || item.numero_plaque
      ? {
          id: Number(vehiculeObj?.id || index + 1),
          numero_plaque: String(
            vehiculeObj?.numero_plaque ||
              item.numero_plaque ||
              item.plaque ||
              "Inconnue",
          ).toUpperCase(),
          marque_modele: String(
            vehiculeObj?.marque ||
              vehiculeObj?.marque_modele ||
              item.marque ||
              "Modèle non spécifié",
          ),
          couleur: String(
            vehiculeObj?.couleur || item.couleur || "Indéterminée",
          ),
          type_vehicule: (vehiculeObj?.type ||
            item.type_entree ||
            "personnel") as "personnel" | "visiteur",
          personnel:
            personnelObj || userObj
              ? {
                  id: Number(personnelObj?.id || 0),
                  id_utilisateur: Number(personnelObj?.id_utilisateur || 0),
                  fonction: String(personnelObj?.fonction || "Personnel BCRG"),
                  utilisateur: {
                    id: Number(userObj?.id || 0),
                    nom: String(
                      userObj?.nom ||
                        personnelObj?.nom ||
                        item.nom_proprietaire ||
                        "",
                    ),
                    prenom: String(
                      userObj?.prenom || personnelObj?.prenom || "",
                    ),
                    matricule: String(
                      userObj?.matricule || personnelObj?.matricule || "",
                    ),
                    role: "personnel",
                    est_actif: true,
                  },
                }
              : undefined,
        }
      : undefined;

  return {
    id: Number(item.id || index + 1),
    heure_arrivee: heureArrivee,
    heure_depart: heureDepart,
    statut:
      (item.statut as "sur_site" | "hors_site") ||
      (heureDepart ? "hors_site" : "sur_site"),
    type_entree: (item.type_entree as "personnel" | "visiteur") || "personnel",
    observation: item.observation ? String(item.observation) : null,
    vehicule,
    agent:
      agentObj || agentUser
        ? {
            id: Number(agentObj?.id || 0),
            nom: String(agentUser?.nom || agentObj?.nom || ""),
            prenom: String(agentUser?.prenom || agentObj?.prenom || ""),
            matricule: String(
              agentUser?.matricule || agentObj?.matricule || "",
            ),
          }
        : null,
    duree_minutes: dureeMinutes,
  };
}

/**
 * Service HTTP pour la gestion de l'historique des mouvements au parking.
 */
export const mouvementsService = {
  /**
   * Récupère la liste paginée et filtrée des mouvements (`GET /api/v1/admin/historique`).
   */
  async getMouvements(
    filters: MouvementFilterInput = {},
    page = 1,
    limit = 10,
  ): Promise<PaginatedMouvementResponse> {
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
      };

      if (filters.date_debut) params.date_debut = filters.date_debut;
      if (filters.date_fin) params.date_fin = filters.date_fin;
      if (filters.type_entree && filters.type_entree !== "all") {
        params.type_entree = filters.type_entree;
      }

      let rawList: Record<string, unknown>[] = [];
      let totalItems = 0;

      try {
        const response = await apiClient.get(ENDPOINTS.ADMIN.HISTORIQUE, {
          params,
        });
        const resData = response.data || {};
        rawList = Array.isArray(resData.data)
          ? resData.data
          : Array.isArray(resData)
            ? resData
            : [];
        totalItems = Number(
          resData.meta?.total || resData.total || rawList.length,
        );
      } catch {
        // Fallback sur /api/v1/registre/mouvement/personnel si endpoint admin indisponible
        const response = await apiClient.get(
          ENDPOINTS.REGISTRE.MOUVEMENT_PERSONNEL,
        );
        const resData = response.data || {};
        rawList = Array.isArray(resData.data)
          ? resData.data
          : Array.isArray(resData)
            ? resData
            : [];
        totalItems = rawList.length;
      }

      let normalized = rawList.map(normalizeMouvementItem);

      // Filtrage côté client pour la recherche textuelle
      if (filters.search && filters.search.trim() !== "") {
        const q = filters.search.toLowerCase().trim();
        normalized = normalized.filter(
          (m) =>
            m.vehicule?.numero_plaque.toLowerCase().includes(q) ||
            (m.vehicule?.marque_modele || "").toLowerCase().includes(q) ||
            m.vehicule?.personnel?.utilisateur?.nom.toLowerCase().includes(q) ||
            m.vehicule?.personnel?.utilisateur?.prenom
              .toLowerCase()
              .includes(q) ||
            m.vehicule?.personnel?.utilisateur?.matricule
              .toLowerCase()
              .includes(q),
        );
      }

      // Filtrage côté client pour statut d'emplacement
      if (filters.statut && filters.statut !== "all") {
        normalized = normalized.filter((m) => m.statut === filters.statut);
      }

      const total = totalItems || normalized.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const paginatedData =
        totalItems > rawList.length
          ? normalized
          : normalized.slice(start, start + limit);

      return {
        data: paginatedData,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 1,
      };
    }
  },

  /**
   * Génère et télécharge le rapport d'historique au format PDF ou CSV (`GET /api/v1/admin/rapports`).
   */
  async exportRapport(
    format: "pdf" | "csv",
    filters: MouvementFilterInput = {},
  ): Promise<void> {
    try {
      const params: Record<string, string> = { format };
      if (filters.date_debut) params.date_debut = filters.date_debut;
      if (filters.date_fin) params.date_fin = filters.date_fin;

      const response = await apiClient.get(ENDPOINTS.ADMIN.RAPPORTS, {
        params,
        responseType: "blob",
      });

      const mimeType = format === "pdf" ? "application/pdf" : "text/csv";
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Rapport_Mouvements_BCRG_${new Date().toISOString().slice(0, 10)}.${format}`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erreur lors de l'export du rapport:", error);
      throw new Error(
        getApiErrorMessage(error, "Erreur lors de la génération du rapport."),
      );
    }
  },

  /**
   * Transmet une correction ou observation sur un passage (`POST /api/v1/registre/correction/{idPassage}`).
   */
  async correctionMouvement(
    idPassage: number,
    observation: string,
  ): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.REGISTRE.CORRECTION(idPassage), {
        observation: observation.trim(),
      });
    } catch (error) {
      console.error("Erreur lors de la correction du passage:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Erreur lors de l'enregistrement de la correction.",
        ),
      );
    }
  },
};
