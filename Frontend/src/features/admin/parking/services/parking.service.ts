import { apiClient } from "@/shared/services/api-client";
import { ENDPOINTS } from "@/shared/services/endpoints";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import type {
  FonctionCreateInput,
  FonctionItem,
  ParkingCreateInput,
  ParkingItem,
  ParkingUpdateInput,
  PlaceParkingItem,
  PlaceVisiteurInput,
} from "../types";

/**
 * Service HTTP pour l'administration des parkings, des places et du référentiel des fonctions BCRG.
 */
export const parkingService = {
  /**
   * Récupère la liste de tous les parkings enregistrés (`GET /api/v1/admin/parkings`).
   */
  async getParkings(): Promise<ParkingItem[]> {
    try {
      const response = await apiClient.get(ENDPOINTS.ADMIN.PARKINGS);
      const resData = response.data || {};
      const rawList: Record<string, unknown>[] = Array.isArray(resData.data)
        ? resData.data
        : Array.isArray(resData.parkings)
          ? resData.parkings
          : Array.isArray(resData)
            ? resData
            : [];

      return rawList.map((item, index) => {
        let capacitesNiveaux: Record<string, number> | null = null;
        if (
          item.capacites_niveaux &&
          typeof item.capacites_niveaux === "object" &&
          !Array.isArray(item.capacites_niveaux)
        ) {
          capacitesNiveaux = Object.entries(item.capacites_niveaux).reduce(
            (acc, [key, val]) => {
              acc[key] = Number(val) || 0;
              return acc;
            },
            {} as Record<string, number>,
          );
        }

        return {
          id: Number(item.id || index + 1),
          nom: String(item.nom || `Parking ${index + 1}`),
          adresse: item.adresse ? String(item.adresse) : null,
          nombre_niveaux: Number(item.nombre_niveaux ?? 0),
          capacite_maximale: item.capacite_maximale
            ? Number(item.capacite_maximale)
            : null,
          capacites_niveaux: capacitesNiveaux,
        };
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la liste des parkings:",
        error,
      );
      return [];
    }
  },

  /**
   * Créer une infrastructure de parking (`POST /api/v1/admin/parkings`).
   */
  async createParking(input: ParkingCreateInput): Promise<ParkingItem> {
    try {
      const response = await apiClient.post(ENDPOINTS.ADMIN.PARKINGS, input);
      const resData = response.data || {};
      const returnedParking = resData.data || resData.parking || resData;

      return {
        id: Number(returnedParking.id || Date.now()),
        nom: input.nom,
        adresse: input.adresse || null,
        nombre_niveaux: input.nombre_niveaux ?? 0,
        capacite_maximale: input.capacite_maximale || null,
        capacites_niveaux: input.capacites_niveaux || null,
      };
    } catch (error: unknown) {
      console.error("Erreur création parking:", error);
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosError?.response?.status === 409) {
        throw new Error("Un parking portant ce nom existe déjà.");
      }
      throw new Error(
        getApiErrorMessage(error, "Impossible de créer ce parking."),
      );
    }
  },

  /**
   * Modifier un parking (`PUT /api/v1/admin/parkings/{id_parking}`).
   */
  async updateParking(
    idParking: number,
    input: ParkingUpdateInput,
  ): Promise<void> {
    try {
      await apiClient.put(ENDPOINTS.ADMIN.PARKING_BY_ID(idParking), input);
    } catch (error: unknown) {
      console.error("Erreur modification parking:", error);
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosError?.response?.status === 404) {
        throw new Error("Ce parking est introuvable.");
      }
      if (axiosError?.response?.status === 409) {
        throw new Error("Un parking portant ce nom existe déjà.");
      }
      throw new Error(
        getApiErrorMessage(error, "Impossible de modifier ce parking."),
      );
    }
  },

  /**
   * Supprimer un parking (`DELETE /api/v1/admin/parkings/{id_parking}`).
   */
  async deleteParking(idParking: number): Promise<void> {
    try {
      await apiClient.delete(ENDPOINTS.ADMIN.PARKING_BY_ID(idParking));
    } catch (error) {
      console.error("Erreur suppression parking:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Impossible de supprimer ce parking. Vérifiez qu'aucune place ne lui est rattachée.",
        ),
      );
    }
  },

  /**
   * Récupère toutes les places du parking sous-sol (`GET /api/v1/admin/parking/places`).
   * Peut être filtrée par id_parking.
   */
  async getPlaces(idParking?: number): Promise<PlaceParkingItem[]> {
    try {
      const response = await apiClient.get(ENDPOINTS.ADMIN.PARKING_PLACES, {
        params: idParking ? { id_parking: idParking } : undefined,
      });
      const resData = response.data || {};
      const rawList: Record<string, unknown>[] = Array.isArray(resData.data)
        ? resData.data
        : Array.isArray(resData.places)
          ? resData.places
          : Array.isArray(resData)
            ? resData
            : [];

      return rawList.map((item, index) => ({
        id: Number(item.id || index + 1),
        numero: String(item.numero || item.numero_place || `P-${index + 1}`),
        niveau: String(
          item.niveau || item.niveau_parking || "Sous-sol 1",
        ).trim(),
        id_parking: item.id_parking ? Number(item.id_parking) : undefined,
        est_visiteur: Boolean(item.est_visiteur),
        est_occupee: Boolean(item.est_occupee),
      }));
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des places de parking:",
        error,
      );
      return [];
    }
  },

  /**
   * Ajoute une place de parking réservée aux visiteurs (`POST /api/v1/admin/parking/visiteurs`).
   */
  async createPlaceVisiteur(input: PlaceVisiteurInput): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.ADMIN.PARKING_VISITEURS, {
        id_parking: input.id_parking,
        niveau_parking: input.niveau_parking,
        numero_place: input.numero_place.trim().toUpperCase(),
      });
    } catch (error) {
      console.error("Erreur création place visiteur:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Erreur lors de l'ajout de la place visiteur.",
        ),
      );
    }
  },

  /**
   * Supprime une place visiteur (`DELETE /api/v1/admin/parking/visiteurs/{id_place}`).
   */
  async deletePlaceVisiteur(idPlace: number): Promise<void> {
    try {
      await apiClient.delete(ENDPOINTS.ADMIN.PARKING_VISITEUR_BY_ID(idPlace));
    } catch (error) {
      console.error("Erreur suppression place visiteur:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Impossible de supprimer cette place visiteur.",
        ),
      );
    }
  },

  /**
   * Récupère la liste des fonctions institutionnelles et leurs places rattachées (`GET /api/v1/admin/fonctions`).
   * Peut être filtrée par id_parking.
   */
  async getFonctions(idParking?: number): Promise<FonctionItem[]> {
    try {
      const response = await apiClient.get(ENDPOINTS.ADMIN.FONCTIONS, {
        params: idParking ? { id_parking: idParking } : undefined,
      });
      const resData = response.data || {};
      const rawList: Record<string, unknown>[] = Array.isArray(resData.data)
        ? resData.data
        : Array.isArray(resData.fonctions)
          ? resData.fonctions
          : Array.isArray(resData)
            ? resData
            : [];

      return rawList.map((item, index) => {
        const placesRaw = Array.isArray(item.places_parking)
          ? item.places_parking
          : [];
        const places: PlaceParkingItem[] = placesRaw.map(
          (p: Record<string, unknown>, pIdx: number) => ({
            id: Number(p.id || pIdx + 1),
            numero: String(p.numero || p.numero_place || `P-${pIdx + 1}`),
            niveau: String(p.niveau || p.niveau_parking || "Sous-sol 1").trim(),
            id_parking: p.id_parking ? Number(p.id_parking) : undefined,
            est_visiteur: Boolean(p.est_visiteur),
            est_occupee: Boolean(p.est_occupee),
          }),
        );

        return {
          id: Number(item.id || index + 1),
          nom: String(
            item.nom || item.nom_fonction || "Fonction non spécifiée",
          ),
          places_parking: places,
        };
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des fonctions institutionnelles:",
        error,
      );
      return [];
    }
  },

  /**
   * Récupère la liste des options de fonctions institutionnelles pour les formulaires (`GET /api/v1/admin/fonctions`).
   */
  async getFonctionOptions(): Promise<
    { value: string; label: string; description?: string }[]
  > {
    try {
      const response = await apiClient.get(ENDPOINTS.ADMIN.FONCTIONS);
      const resData = response.data || {};
      const rawList: Record<string, unknown>[] = Array.isArray(resData.data)
        ? resData.data
        : Array.isArray(resData.fonctions)
          ? resData.fonctions
          : Array.isArray(resData)
            ? resData
            : [];

      const options = rawList
        .map((item) => {
          const nom = String(item.nom || item.nom_fonction || "").trim();
          const places = Array.isArray(item.places_parking)
            ? (item.places_parking as unknown[])
            : [];
          const description =
            places.length > 0
              ? `${places.length} place(s) déjà attribuée(s)`
              : "Fonction ";

          return {
            value: nom,
            label: nom,
            description,
          };
        })
        .filter((opt) => opt.value !== "");

      const uniqueMap = new Map<
        string,
        { value: string; label: string; description?: string }
      >();
      for (const opt of options) {
        if (!uniqueMap.has(opt.value.toLowerCase())) {
          uniqueMap.set(opt.value.toLowerCase(), opt);
        }
      }
      return Array.from(uniqueMap.values());
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des options de fonctions:",
        error,
      );
      return [];
    }
  },

  /**
   * Créer une fonction institutionnelle et réserver sa place (`POST /api/v1/admin/fonctions`).
   */
  async createFonction(input: FonctionCreateInput): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.ADMIN.FONCTIONS, {
        id_parking: input.id_parking,
        nom_fonction: input.nom_fonction.trim(),
        niveau_parking: input.niveau_parking,
        numero_place: input.numero_place.trim().toUpperCase(),
      });
    } catch (error: unknown) {
      console.error("Erreur création fonction :", error);
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosError?.response?.status === 409) {
        throw new Error(
          `La place "${input.numero_place.trim().toUpperCase()}" est déjà attribuée ou réservée sur ce parking.`,
        );
      }
      throw new Error(
        getApiErrorMessage(
          error,
          "Erreur lors de l'affectation de la fonction et de sa place.",
        ),
      );
    }
  },

  /**
   * Supprime une fonction institutionnelle (`DELETE /api/v1/admin/fonctions/{id_fonction}`).
   */
  async deleteFonction(idFonction: number): Promise<void> {
    try {
      await apiClient.delete(ENDPOINTS.ADMIN.FONCTION_BY_ID(idFonction));
    } catch (error) {
      console.error("Erreur suppression fonction:", error);
      throw new Error(
        getApiErrorMessage(error, "Impossible de supprimer cette fonction."),
      );
    }
  },
};
