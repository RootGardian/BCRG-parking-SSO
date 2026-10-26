import { apiClient } from "@/shared/services/api-client";
import { ENDPOINTS } from "@/shared/services/endpoints";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import type { Vehicule } from "@/types/models";
import type {
  PaginatedPersonnelResponse,
  PersonnelCreateInput,
  PersonnelFilterInput,
  PersonnelItem,
  PersonnelUpdateInput,
} from "../types";

/**
 * Normalise un enregistrement brut issu du backend en PersonnelItem typé.
 */
function normalizePersonnelItem(
  item: Record<string, unknown>,
  index: number,
): PersonnelItem {
  const personnelObj = item.personnel as Record<string, unknown> | undefined;
  const fonctionObj = (personnelObj?.fonction || item.fonction) as
    | Record<string, unknown>
    | string
    | undefined;

  let fonctionNom: string | undefined;
  if (typeof fonctionObj === "string") {
    fonctionNom = fonctionObj;
  } else if (fonctionObj && typeof fonctionObj === "object") {
    fonctionNom = fonctionObj.nom ? String(fonctionObj.nom) : undefined;
  }

  const rawVehicles = (personnelObj?.vehicules || item.vehicules) as
    | Record<string, unknown>[]
    | undefined;

  const vehicules: Vehicule[] = Array.isArray(rawVehicles)
    ? rawVehicles.map((v, i) => ({
        id: Number(v.id || i + 1),
        numero_plaque: String(v.numero_plaque || v.plaque || ""),
        marque_modele: String(v.marque || v.marque_modele || ""),
        couleur: String(v.couleur || ""),
        type_vehicule: (v.type as "personnel" | "visiteur") || "personnel",
      }))
    : [];

  return {
    id: Number(item.id || personnelObj?.id || index + 1),
    matricule: String(item.matricule || ""),
    email: item.email ? String(item.email) : null,
    nom: String(item.nom || ""),
    prenom: String(item.prenom || ""),
    fonction: fonctionNom,
    id_fonction:
      typeof item.id_fonction === "number"
        ? item.id_fonction
        : typeof personnelObj?.id_fonction === "number"
          ? (personnelObj.id_fonction as number)
          : null,
    qr_code:
      (personnelObj?.qr_code as string) || (item.qr_code as string) || null,
    est_actif: item.est_actif !== false,
    vehicules,
    created_at: item.created_at ? String(item.created_at) : undefined,
  };
}

/**
 * Service HTTP de gestion du Personnel BCRG.
 */
export const personnelService = {
  /**
   * Récupère la liste des options de fonctions existantes dans le système (`GET /api/v1/admin/fonctions`).
   */
  async getFonctionOptions(): Promise<{ value: string; label: string }[]> {
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
          return { value: nom, label: nom };
        })
        .filter((opt) => opt.value !== "");

      const uniqueMap = new Map<string, { value: string; label: string }>();
      for (const opt of options) {
        if (!uniqueMap.has(opt.value.toLowerCase())) {
          uniqueMap.set(opt.value.toLowerCase(), opt);
        }
      }
      return Array.from(uniqueMap.values());
    } catch (error) {
      console.error("Erreur récupération options fonctions:", error);
      return [];
    }
  },

  /**
   * Récupère la liste paginée du personnel avec filtrage.
   */
  async getPersonnel(
    filters: PersonnelFilterInput = {},
    page = 1,
    pageSize = 10,
  ): Promise<PaginatedPersonnelResponse> {
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

      let list = rawList
        .map(normalizePersonnelItem)
        .filter(
          (p) =>
            p.fonction ||
            p.vehicules?.length ||
            p.matricule.startsWith("DIR") ||
            p.matricule.startsWith("EMP"),
        );

      if (list.length === 0 && rawList.length > 0) {
        list = rawList.map(normalizePersonnelItem);
      }

      if (filters.search && filters.search.trim() !== "") {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(
          (p) =>
            p.nom.toLowerCase().includes(q) ||
            p.prenom.toLowerCase().includes(q) ||
            p.matricule.toLowerCase().includes(q) ||
            p.fonction?.toLowerCase().includes(q),
        );
      }

      if (filters.est_actif && filters.est_actif !== "all") {
        const isActif = filters.est_actif === "actif";
        list = list.filter((p) => p.est_actif === isActif);
      }

      const total = list.length;
      const totalPages = Math.ceil(total / pageSize) || 1;
      const start = (page - 1) * pageSize;
      const paginatedData = list.slice(start, start + pageSize);

      return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      console.error("Erreur récupération du personnel:", error);
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
   * Crée un nouveau membre du personnel (`POST /api/v1/admin/personnel`).
   */
  async createPersonnel(input: PersonnelCreateInput): Promise<PersonnelItem> {
    try {
      const payload: Record<string, unknown> = {
        nom: input.nom.trim(),
        prenom: input.prenom.trim(),
        matricule: input.matricule.trim().toUpperCase(),
      };
      if (input.fonction) payload.fonction = input.fonction.trim();
      if (input.id_fonction) payload.id_fonction = input.id_fonction;
      if (input.numero_plaque)
        payload.numero_plaque = input.numero_plaque.trim().toUpperCase();

      const response = await apiClient.post(
        ENDPOINTS.ADMIN.PERSONNEL_CREATE,
        payload,
      );

      return normalizePersonnelItem(response.data || {}, Date.now());
    } catch (error) {
      console.error("Erreur lors de la création du personnel:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Impossible de créer le membre du personnel.",
        ),
      );
    }
  },

  /**
   * Modifie un membre du personnel (`PUT /api/v1/admin/personnel/{matricule}`).
   */
  async updatePersonnel(
    matricule: string,
    input: PersonnelUpdateInput,
  ): Promise<PersonnelItem> {
    try {
      const payload: Record<string, unknown> = {};
      if (input.nom) payload.nom = input.nom.trim();
      if (input.prenom) payload.prenom = input.prenom.trim();
      if (input.id_fonction) payload.id_fonction = input.id_fonction;

      const response = await apiClient.put(
        ENDPOINTS.ADMIN.PERSONNEL_BY_MATRICULE(matricule),
        payload,
      );

      return normalizePersonnelItem(response.data || {}, 0);
    } catch (error) {
      console.error("Erreur lors de la modification du personnel:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Impossible de modifier le membre du personnel.",
        ),
      );
    }
  },

  /**
   * Désactive un membre du personnel (`DELETE /api/v1/admin/personnel/{matricule}`).
   */
  async deletePersonnel(matricule: string): Promise<boolean> {
    try {
      await apiClient.delete(ENDPOINTS.ADMIN.PERSONNEL_BY_MATRICULE(matricule));
      return true;
    } catch (error) {
      console.error("Erreur désactivation du personnel:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Impossible de désactiver le membre du personnel.",
        ),
      );
    }
  },

  /**
   * Ajoute un véhicule à un membre du personnel (`POST /api/v1/personnel/{matricule}/vehicules`).
   */
  async addVehiculeToPersonnel(
    matricule: string,
    vehicule: {
      numero_plaque: string;
      marque?: string;
      couleur?: string;
      type?: string;
    },
  ): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.PERSONNEL.VEHICLES(matricule), {
        numero_plaque: vehicule.numero_plaque.trim().toUpperCase(),
        marque: vehicule.marque || "Non spécifié",
        couleur: vehicule.couleur || "Indéterminée",
        type: vehicule.type || "personnel",
      });
    } catch (error) {
      console.error("Erreur ajout de véhicule au personnel:", error);
      throw new Error(
        getApiErrorMessage(error, "Impossible d'ajouter le véhicule."),
      );
    }
  },

  /**
   * Exporte tous les QR Codes du personnel actif dans un fichier ZIP (`GET /api/v1/admin/personnel/qrcodes?format=zip`).
   */
  async downloadQRCodesZip(): Promise<void> {
    try {
      const response = await apiClient.get(ENDPOINTS.ADMIN.QRCODES, {
        params: { format: "zip" },
        responseType: "blob",
        headers: {
          Accept: "application/zip, application/octet-stream, */*",
        },
      });

      // Détection si le serveur a renvoyé du JSON d'erreur encapsulé dans le blob
      const contentType =
        response.headers?.["content-type"] ||
        (response.data instanceof Blob ? response.data.type : "");

      if (typeof contentType === "string" && contentType.includes("application/json")) {
        const text =
          response.data instanceof Blob
            ? await response.data.text()
            : String(response.data);
        let errorMsg = "Erreur lors du téléchargement de l'archive ZIP";
        try {
          const json = JSON.parse(text);
          errorMsg = json.message || json.error || errorMsg;
        } catch {
          // Ignorer l'erreur de parsing JSON
        }
        throw new Error(errorMsg);
      }

      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], { type: "application/zip" });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `QRCodes_Personnel_BCRG_${new Date().toISOString().slice(0, 10)}.zip`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors de l'export des QR Codes:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Erreur lors du téléchargement de l'archive ZIP des QR Codes.",
        ),
      );
    }
  },

  /**
   * Importation massive du personnel via fichier CSV (`POST /api/v1/imports/personnel`).
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
        message: response.data?.message || "Importation du personnel réussie.",
      };
    } catch (error) {
      console.error("Erreur lors de l'importation du CSV du personnel:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Erreur lors de l'importation du fichier CSV.",
        ),
      );
    }
  },
};
