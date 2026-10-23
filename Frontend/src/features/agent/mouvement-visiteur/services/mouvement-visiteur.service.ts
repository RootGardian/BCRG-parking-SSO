import { apiClient } from "@/shared/services/api-client";
import { ENDPOINTS } from "@/shared/services/endpoints";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import type {
  MouvementListResponse,
  MouvementVisiteurEntreeInput,
  MouvementVisiteurSortieInput,
  VisiteurScanResult,
} from "../types";

/**
 * Service HTTP du guichet vigile — Mouvement Visiteurs Externes.
 */
export const mouvementVisiteurService = {
  /**
   * Rechercher un véhicule visiteur par plaque d'immatriculation (`GET /api/v1/registre/mouvement/visiteur?statut=sur_site`).
   * Détermine dynamiquement si le véhicule est actuellement présent sur site ou hors site.
   */
  async searchVisiteurPlaque(
    query: string,
  ): Promise<VisiteurScanResult | null> {
    try {
      const cleanPlaque = query.trim().toUpperCase();
      if (!cleanPlaque) return null;

      // 1. Consulter les mouvements visiteurs sur site pour détecter la présence
      const surSiteRes = await apiClient.get(
        ENDPOINTS.REGISTRE.MOUVEMENT_VISITEUR,
        {
          params: { statut: "sur_site" },
        },
      );
      const surSiteList: Record<string, unknown>[] = Array.isArray(
        surSiteRes.data,
      )
        ? surSiteRes.data
        : Array.isArray(surSiteRes.data?.data)
          ? surSiteRes.data.data
          : [];

      const activeMovement = surSiteList.find((m) => {
        const vObj = m.vehicule as Record<string, unknown> | undefined;
        const p1 = String(
          vObj?.numero_plaque || m.numero_plaque || m.plaque || "",
        ).toUpperCase();
        return p1 === cleanPlaque;
      });

      if (activeMovement) {
        const vObj = activeMovement.vehicule as
          | Record<string, unknown>
          | undefined;
        return {
          numero_plaque: cleanPlaque,
          est_sur_site: true,
          passage_actif_id: Number(activeMovement.id),
          heure_arrivee: String(
            activeMovement.heure_arrivee ||
              activeMovement.created_at ||
              new Date().toISOString(),
          ),
          observation: activeMovement.observation
            ? String(activeMovement.observation)
            : undefined,
          marque_modele: String(
            vObj?.marque || vObj?.marque_modele || activeMovement.marque || "",
          ),
          couleur: String(
            vObj?.couleur || activeMovement.couleur || "Indéterminée",
          ),
        };
      }

      return {
        numero_plaque: cleanPlaque,
        est_sur_site: false,
      };
    } catch (error) {
      console.error("Erreur lors de la recherche du véhicule visiteur:", error);
      return {
        numero_plaque: query.trim().toUpperCase(),
        est_sur_site: false,
      };
    }
  },

  /**
   * Enregistre l'entrée d'un visiteur externe (`POST /api/v1/registre/entree`).
   */
  async enregistrerEntreeVisiteur(
    input: MouvementVisiteurEntreeInput,
  ): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.REGISTRE.ENTREE, {
        type_entree: "visiteur",
        numero_plaque: input.numero_plaque.trim().toUpperCase(),
        observation: input.observation ? input.observation.trim() : undefined,
      });
    } catch (error) {
      console.error("Erreur enregistrement entrée visiteur:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Impossible d'enregistrer l'entrée du visiteur.",
        ),
      );
    }
  },

  /**
   * Enregistre la sortie d'un visiteur externe (`PUT /api/v1/registre/sortie`).
   */
  async enregistrerSortieVisiteur(
    input: MouvementVisiteurSortieInput,
  ): Promise<void> {
    try {
      await apiClient.put(ENDPOINTS.REGISTRE.SORTIE, {
        id_passage: input.id_passage,
        numero_plaque: input.numero_plaque
          ? input.numero_plaque.trim().toUpperCase()
          : undefined,
        observation: input.observation ? input.observation.trim() : undefined,
      });
    } catch (error) {
      console.error("Erreur enregistrement sortie visiteur:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Impossible d'enregistrer la sortie du visiteur.",
        ),
      );
    }
  },

  /**
   * Récupère la liste des mouvements des visiteurs (`GET /api/v1/registre/mouvement/visiteur`).
   * Supporte la pagination serveur (`page`, `limit`), le statut, les dates et la recherche.
   */
  async getVisiteurMouvements(filters?: {
    page?: number;
    limit?: number;
    statut?: string;
    date_debut?: string;
    date_fin?: string;
    search?: string;
  }): Promise<MouvementListResponse> {
    try {
      const params: Record<string, unknown> = {};
      if (filters?.page) params.page = filters.page;
      if (filters?.limit) params.limit = filters.limit;
      if (filters?.statut && filters.statut !== "all") {
        params.statut = filters.statut;
      }
      if (filters?.date_debut) {
        params.date_debut = filters.date_debut;
      }
      if (filters?.date_fin) {
        params.date_fin = filters.date_fin;
      }
      if (filters?.search?.trim()) {
        params.search = filters.search.trim();
      }

      const response = await apiClient.get(
        ENDPOINTS.REGISTRE.MOUVEMENT_VISITEUR,
        { params },
      );
      const resData = response.data || {};

      let rawList: Record<string, unknown>[] = [];
      let total = 0;
      let page = filters?.page || 1;
      let limit = filters?.limit || 10;
      let totalPages = 1;

      if (Array.isArray(resData)) {
        rawList = resData;
        total = rawList.length;
        totalPages = Math.ceil(total / limit) || 1;
      } else if (resData && typeof resData === "object") {
        rawList = Array.isArray(resData.data) ? resData.data : [];

        const metaObj = resData.meta as Record<string, unknown> | undefined;
        if (metaObj && typeof metaObj === "object") {
          total = Number(metaObj.total ?? rawList.length);
          page = Number(metaObj.page ?? page);
          limit = Number(metaObj.limit ?? limit);
          totalPages = Number(
            metaObj.totalPages ?? (Math.ceil(total / limit) || 1),
          );
        } else {
          total = Number(resData.total ?? rawList.length);
          page = Number(resData.page ?? page);
          limit = Number(resData.limit ?? limit);
          totalPages = Number(
            resData.totalPages ?? (Math.ceil(total / limit) || 1),
          );
        }
      }

      const mappedData = rawList.map((item, index) => {
        const vehiculeObj = item.vehicule as
          | Record<string, unknown>
          | undefined;

        const statutStr = String(item.statut || "sur_site") as
          | "sur_site"
          | "hors_site";

        return {
          id: Number(item.id || index + 1),
          heure_arrivee: String(
            item.heure_arrivee || item.created_at || new Date().toISOString(),
          ),
          heure_depart: item.heure_depart ? String(item.heure_depart) : null,
          statut: statutStr,
          type_entree: "visiteur" as const,
          observation: item.observation ? String(item.observation) : null,
          vehicule: {
            id: Number(vehiculeObj?.id || index + 1),
            numero_plaque: String(
              vehiculeObj?.numero_plaque ||
                item.numero_plaque ||
                item.plaque ||
                "VISITEUR-INCONNU",
            ).toUpperCase(),
            marque_modele: String(
              vehiculeObj?.marque ||
                vehiculeObj?.marque_modele ||
                item.marque ||
                "Véhicule Visiteur",
            ),
            couleur: String(
              vehiculeObj?.couleur || item.couleur || "Indéterminée",
            ),
            type_vehicule: "visiteur" as const,
          },
        };
      });

      return {
        data: mappedData,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Erreur récupération des mouvements des visiteurs:", error);
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
      };
    }
  },
};
