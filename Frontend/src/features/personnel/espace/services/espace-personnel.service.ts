import type { MouvementItem } from "@/features/admin/mouvements/types";
import { apiClient } from "@/shared/services/api-client";
import { ENDPOINTS } from "@/shared/services/endpoints";
import type {
  MaPlaceParking,
  MonHistoriqueResponse,
  MonProfilPersonnel,
  MonQrCodeResponse,
  MonStatutPresence,
  VehiculePersonnelItem,
} from "../types";

/**
 * Service API pour le module Espace Personnel (`/mon-espace/*`).
 */
export const espacePersonnelService = {
  /**
   * Récupère le profil complet du personnel connecté (`GET /api/v1/mon-espace/profil`).
   */
  async getMonProfil(): Promise<MonProfilPersonnel | null> {
    try {
      const res = await apiClient.get<unknown>(ENDPOINTS.MON_ESPACE.PROFIL);
      const raw = res.data;
      if (!raw) return null;
      const rawObj = raw as {
        data?: MonProfilPersonnel;
        personnel?: MonProfilPersonnel;
        user?: MonProfilPersonnel;
      } & MonProfilPersonnel;
      return rawObj.data || rawObj.personnel || rawObj.user || rawObj;
    } catch {
      return null;
    }
  },

  /**
   * Récupère le QR Code d'accès sous-sol en image base64 (`GET /api/v1/mon-espace/qrcode`).
   */
  async getMonQrCode(): Promise<string | null> {
    try {
      const res = await apiClient.get<MonQrCodeResponse>(
        ENDPOINTS.MON_ESPACE.QRCODE,
      );
      return res.data?.qr_code || null;
    } catch {
      return null;
    }
  },

  /**
   * Récupère le statut de présence temps réel (`GET /api/v1/mon-espace/statut`).
   * Retourne: `{ statut: "sur_site", heure_arrivee: "...", place_parking: {...}, vehicule: {...} }`
   */
  async getMonStatut(): Promise<MonStatutPresence> {
    try {
      const res = await apiClient.get<MonStatutPresence>(
        ENDPOINTS.MON_ESPACE.STATUT,
      );
      return (
        res.data || {
          statut: "hors_site",
          sur_site: false,
        }
      );
    } catch {
      return {
        statut: "hors_site",
        sur_site: false,
      };
    }
  },

  /**
   * Récupère les détails de la place réservée selon la fonction (`GET /api/v1/mon-espace/place`).
   * Retourne: `{ fonction: "DGFI", places_attitrees: [{ id: 46, numero: "P-10", niveau: "Sous-sol 1", ... }] }`
   */
  async getMaPlace(): Promise<MaPlaceParking> {
    try {
      const res = await apiClient.get<MaPlaceParking>(
        ENDPOINTS.MON_ESPACE.PLACE,
      );
      return res.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Récupère la liste des véhicules enregistrés du personnel (`GET /api/v1/mon-espace/vehicules`).
   */
  async getMesVehicules(): Promise<VehiculePersonnelItem[]> {
    try {
      const res = await apiClient.get<unknown>(ENDPOINTS.MON_ESPACE.VEHICULES);
      const data = res.data;
      if (Array.isArray(data)) return data as VehiculePersonnelItem[];
      const dataObj = data as {
        data?: VehiculePersonnelItem[];
        vehicules?: VehiculePersonnelItem[];
      } | null;
      if (Array.isArray(dataObj?.data)) return dataObj.data;
      if (Array.isArray(dataObj?.vehicules)) return dataObj.vehicules;
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Récupère l'historique des mouvements personnels (`GET /api/v1/mon-espace/historique`).
   */
  async getMonHistorique(params?: {
    page?: number;
    limit?: number;
    date_debut?: string;
    date_fin?: string;
  }): Promise<MonHistoriqueResponse> {
    try {
      const res = await apiClient.get<unknown>(
        ENDPOINTS.MON_ESPACE.HISTORIQUE,
        {
          params,
        },
      );
      const raw = res.data;

      // Si l'API retourne directement un tableau de mouvements
      if (Array.isArray(raw)) {
        return {
          data: raw as MouvementItem[],
          meta: {
            total: raw.length,
            page: params?.page || 1,
            limit: params?.limit || 10,
            total_pages: Math.ceil(raw.length / (params?.limit || 10)) || 1,
            totalPages: Math.ceil(raw.length / (params?.limit || 10)) || 1,
          },
        };
      }

      const rawObj = raw as {
        data?: MouvementItem[];
        historique?: MouvementItem[];
        mouvements?: MouvementItem[];
        meta?: {
          total?: number;
          page?: number;
          limit?: number;
          totalPages?: number;
          total_pages?: number;
        };
      } | null;

      const items =
        rawObj?.data || rawObj?.historique || rawObj?.mouvements || [];
      const total = rawObj?.meta?.total ?? items.length;
      const page = rawObj?.meta?.page ?? params?.page ?? 1;
      const limit = rawObj?.meta?.limit ?? params?.limit ?? 10;
      const totalPages =
        rawObj?.meta?.totalPages ||
        rawObj?.meta?.total_pages ||
        Math.ceil(total / limit) ||
        1;

      return {
        data: items,
        meta: {
          total,
          page,
          limit,
          total_pages: totalPages,
          totalPages,
        },
      };
    } catch {
      return {
        data: [],
        meta: {
          total: 0,
          page: params?.page || 1,
          limit: params?.limit || 10,
          total_pages: 1,
          totalPages: 1,
        },
      };
    }
  },
};
