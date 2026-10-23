import { apiClient } from "@/shared/services/api-client";
import { ENDPOINTS } from "@/shared/services/endpoints";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import type { Vehicule } from "@/types/models";
import type {
  MouvementListResponse,
  MouvementPersonnelEntreeInput,
  MouvementPersonnelSortieInput,
  ParkingStatus,
  PersonnelScanResult,
} from "../types";

/**
 * Service HTTP pour les opérations du guichet vigile — Mouvement Personnel BCRG.
 */
export const mouvementPersonnelService = {
  /**
   * Récupère le statut et taux d'occupation temps réel du parking (`GET /api/v1/parking/statut`).
   * Supporte la structure complète renvoyée par le backend (total, personnel, visiteurs).
   */
  async getParkingStatus(): Promise<ParkingStatus> {
    try {
      const response = await apiClient.get(ENDPOINTS.PARKING.STATUT);
      const resData = response.data || {};

      let presentsSurSite = 0;
      let capaciteMax = 0;

      if (resData.total && typeof resData.total === "object") {
        presentsSurSite = Number(resData.total.occupees ?? 0);
        capaciteMax = Number(
          resData.total.places ?? resData.total.capacite_max ?? 0,
        );
      } else {
        presentsSurSite = Number(
          resData.presents_sur_site ?? resData.occupees ?? 0,
        );
        capaciteMax = Number(resData.capacite_max ?? resData.places ?? 200);
      }

      const tauxOccupation = Number(
        resData.taux_occupation ??
          (capaciteMax > 0
            ? Math.round((presentsSurSite / capaciteMax) * 100)
            : 0),
      );

      return {
        presents_sur_site: presentsSurSite,
        capacite_max: capaciteMax,
        taux_occupation: tauxOccupation,
        personnel: resData.personnel
          ? {
              total: Number(resData.personnel.total || 0),
              occupees: Number(resData.personnel.occupees || 0),
              disponibles: Number(resData.personnel.disponibles || 0),
            }
          : undefined,
        visiteurs: resData.visiteurs
          ? {
              total: Number(resData.visiteurs.total || 0),
              occupees: Number(resData.visiteurs.occupees || 0),
              disponibles: Number(resData.visiteurs.disponibles || 0),
            }
          : undefined,
      };
    } catch (error) {
      console.error("Erreur récupération statut parking:", error);
      return {
        presents_sur_site: 0,
        capacite_max: 200,
        taux_occupation: 0,
      };
    }
  },

  /**
   * Rechercher un membre du personnel par scan QR / matricule (`GET /api/v1/personnel?matricule=...`).
   * Vérifie également s'il est actuellement présent sur site via `GET /api/v1/registre/mouvement/personnel?statut=sur_site`.
   */
  /**
   * Rechercher un membre du personnel par scan QR, matricule ou plaque (`GET /api/v1/personnel`, `GET /api/v1/vehicules`).
   * Vérifie également s'il est actuellement présent sur site via `GET /api/v1/registre/mouvement/personnel?statut=sur_site`.
   */
  async searchPersonnel(query: string): Promise<PersonnelScanResult | null> {
    try {
      const cleanQuery = query.trim().toUpperCase();
      if (!cleanQuery) return null;

      let personnelData: Record<string, unknown> | null = null;

      // 1. Recherche par matricule
      try {
        const response = await apiClient.get(ENDPOINTS.PERSONNEL.LIST, {
          params: { matricule: cleanQuery },
        });
        const resData = response.data || {};

        if (Array.isArray(resData.data) && resData.data.length > 0) {
          personnelData = resData.data[0];
        } else if (resData.matricule || resData.id || resData.personnel) {
          personnelData = resData;
        } else if (Array.isArray(resData) && resData.length > 0) {
          personnelData = resData[0];
        }
      } catch {
        // Fallback vers les étapes suivantes
      }

      // 2. Si pas trouvé par matricule, recherche par plaque d'immatriculation (GET /api/v1/vehicules?plaque=...)
      if (
        !personnelData ||
        (!personnelData.matricule &&
          !personnelData.id &&
          !personnelData.personnel)
      ) {
        try {
          const vehiculeRes = await apiClient.get(ENDPOINTS.VEHICULES.LIST, {
            params: { plaque: cleanQuery },
          });
          const vehData = vehiculeRes.data || {};
          let vehObj: Record<string, unknown> | null = null;

          if (Array.isArray(vehData.data) && vehData.data.length > 0) {
            vehObj = vehData.data[0];
          } else if (vehData.numero_plaque || vehData.id) {
            vehObj = vehData;
          } else if (Array.isArray(vehData) && vehData.length > 0) {
            vehObj = vehData[0];
          }

          if (vehObj) {
            const pObj = (vehObj.personnel || vehObj.utilisateur) as
              | Record<string, unknown>
              | undefined;
            const uObj = (pObj?.utilisateur || pObj || vehObj.utilisateur) as
              | Record<string, unknown>
              | undefined;
            const foundMatricule = String(
              uObj?.matricule ||
                pObj?.matricule ||
                vehObj.matricule_personnel ||
                vehObj.matricule ||
                "",
            );

            if (foundMatricule) {
              const fullPersRes = await apiClient.get(
                ENDPOINTS.PERSONNEL.LIST,
                {
                  params: { matricule: foundMatricule },
                },
              );
              const fpData = fullPersRes.data || {};
              if (Array.isArray(fpData.data) && fpData.data.length > 0) {
                personnelData = fpData.data[0];
              } else if (fpData.matricule || fpData.id || fpData.personnel) {
                personnelData = fpData;
              } else if (Array.isArray(fpData) && fpData.length > 0) {
                personnelData = fpData[0];
              }
            }

            if (!personnelData && pObj) {
              personnelData = pObj;
            }
          }
        } catch {
          // Fallback vers recherche par nom
        }
      }

      // 3. Si toujours pas trouvé, recherche par nom (GET /api/v1/personnel?nom=...)
      if (
        !personnelData ||
        (!personnelData.matricule &&
          !personnelData.id &&
          !personnelData.personnel)
      ) {
        try {
          const fallbackRes = await apiClient.get(ENDPOINTS.PERSONNEL.LIST, {
            params: { nom: cleanQuery },
          });
          const fallbackData = fallbackRes.data || {};
          if (
            Array.isArray(fallbackData.data) &&
            fallbackData.data.length > 0
          ) {
            personnelData = fallbackData.data[0];
          } else if (
            fallbackData.matricule ||
            fallbackData.id ||
            fallbackData.personnel
          ) {
            personnelData = fallbackData;
          } else if (Array.isArray(fallbackData) && fallbackData.length > 0) {
            personnelData = fallbackData[0];
          }
        } catch {
          // Introuvable
        }
      }

      if (!personnelData) return null;

      // Extraction des sous-structures (personnel & utilisateur)
      const innerPersonnel = (
        typeof personnelData.personnel === "object" &&
        personnelData.personnel !== null
          ? personnelData.personnel
          : typeof personnelData.utilisateur === "object" &&
              personnelData.utilisateur !== null
            ? personnelData
            : personnelData
      ) as Record<string, unknown>;

      const userObj = (
        typeof personnelData.utilisateur === "object" &&
        personnelData.utilisateur !== null
          ? personnelData.utilisateur
          : personnelData
      ) as Record<string, unknown>;

      const matricule = String(
        userObj.matricule || personnelData.matricule || cleanQuery,
      );
      const nom = String(userObj.nom ?? personnelData.nom ?? "");
      const prenom = String(userObj.prenom ?? personnelData.prenom ?? "");

      // Extraction de la fonction
      let fonction: string | undefined;
      const rawFonction =
        innerPersonnel.fonction || personnelData.fonction || userObj.fonction;

      if (typeof rawFonction === "string") {
        fonction = rawFonction;
      } else if (typeof rawFonction === "object" && rawFonction !== null) {
        const foncObj = rawFonction as Record<string, unknown>;
        if (typeof foncObj.nom === "string") {
          fonction = foncObj.nom;
        } else if (typeof foncObj.libelle === "string") {
          fonction = foncObj.libelle;
        }
      }

      // Extraction des véhicules
      const rawVehicles = (
        Array.isArray(innerPersonnel.vehicules)
          ? innerPersonnel.vehicules
          : Array.isArray(personnelData.vehicules)
            ? personnelData.vehicules
            : Array.isArray(userObj.vehicules)
              ? userObj.vehicules
              : []
      ) as Record<string, unknown>[];

      const vehicules: Vehicule[] = rawVehicles.map((v, i) => ({
        id: Number(v.id || i + 1),
        numero_plaque: String(v.numero_plaque || v.plaque || "").toUpperCase(),
        marque_modele: String(v.marque || v.marque_modele || v.modele || ""),
        couleur: String(v.couleur || ""),
        type_vehicule: "personnel" as const,
      }));

      // Pré-sélection du véhicule correspondant à la plaque recherchée ou le premier véhicule
      const matchedVehicule = vehicules.find(
        (v) => v.numero_plaque.toUpperCase() === cleanQuery,
      );
      const vehiculeSelectionne =
        matchedVehicule || (vehicules.length > 0 ? vehicules[0] : null);

      // 4. Vérifier si ce membre est actuellement présent sur site (`GET /api/v1/registre/mouvement/personnel?statut=sur_site`)
      const surSiteRes = await apiClient.get(
        ENDPOINTS.REGISTRE.MOUVEMENT_PERSONNEL,
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
        const pVeh = m.vehicule as Record<string, unknown> | undefined;
        const pUser = (pVeh?.personnel || m.personnel || m.utilisateur) as
          | Record<string, unknown>
          | undefined;
        const pUserObj = pUser?.utilisateur as
          | Record<string, unknown>
          | undefined;
        const mMatricule = String(
          pUser?.matricule || pUserObj?.matricule || m.matricule || "",
        ).toUpperCase();
        const mPlaque = String(
          pVeh?.numero_plaque || m.numero_plaque || "",
        ).toUpperCase();

        return (
          mMatricule === matricule || (cleanQuery && mPlaque === cleanQuery)
        );
      });

      const estSurSite = Boolean(activeMovement);
      const passageActifId = activeMovement
        ? Number(activeMovement.id)
        : undefined;

      return {
        matricule,
        nom,
        prenom,
        fonction,
        qr_code: String(innerPersonnel.qr_code || personnelData.qr_code || ""),
        est_sur_site: estSurSite,
        passage_actif_id: passageActifId,
        vehicules,
        vehicule_selectionne: vehiculeSelectionne,
      };
    } catch (error) {
      console.error("Erreur lors de la recherche du personnel:", error);
      return null;
    }
  },

  /**
   * Enregistre un mouvement d'entrée personnel (`POST /api/v1/registre/entree`).
   */
  async enregistrerEntree(input: MouvementPersonnelEntreeInput): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.REGISTRE.ENTREE, {
        type_entree: "personnel",
        matricule_personnel: input.matricule_personnel.trim(),
        numero_plaque: input.numero_plaque
          ? input.numero_plaque.trim().toUpperCase()
          : undefined,
        observation: input.observation ? input.observation.trim() : undefined,
      });
    } catch (error) {
      console.error("Erreur enregistrement entrée personnel:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Impossible d'enregistrer l'entrée du membre du personnel.",
        ),
      );
    }
  },

  /**
   * Enregistre un mouvement de sortie personnel (`PUT /api/v1/registre/sortie`).
   */
  async enregistrerSortie(input: MouvementPersonnelSortieInput): Promise<void> {
    try {
      await apiClient.put(ENDPOINTS.REGISTRE.SORTIE, {
        matricule_personnel: input.matricule_personnel.trim(),
        id_passage: input.id_passage,
        observation: input.observation ? input.observation.trim() : undefined,
      });
    } catch (error) {
      console.error("Erreur enregistrement sortie personnel:", error);
      throw new Error(
        getApiErrorMessage(
          error,
          "Impossible d'enregistrer la sortie du membre du personnel.",
        ),
      );
    }
  },

  /**
   * Récupère la liste des mouvements du personnel (`GET /api/v1/registre/mouvement/personnel`).
   * Supporte la pagination serveur (`page`, `limit`), le statut, les dates et la recherche.
   */
  async getPersonnelMouvements(filters?: {
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
        ENDPOINTS.REGISTRE.MOUVEMENT_PERSONNEL,
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
        const personnelObj = (vehiculeObj?.personnel || item.personnel) as
          | Record<string, unknown>
          | undefined;
        const userObj = (personnelObj?.utilisateur || item.utilisateur) as
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
          type_entree: "personnel" as const,
          observation: item.observation ? String(item.observation) : null,
          vehicule: vehiculeObj
            ? {
                id: Number(vehiculeObj.id || index + 1),
                numero_plaque: String(
                  vehiculeObj.numero_plaque ||
                    item.numero_plaque ||
                    "IMMAT-INCONNUE",
                ).toUpperCase(),
                marque_modele: String(
                  vehiculeObj.marque ||
                    vehiculeObj.marque_modele ||
                    "Modèle non spécifié",
                ),
                couleur: String(vehiculeObj.couleur || "Indéterminée"),
                type_vehicule: "personnel" as const,
                personnel:
                  personnelObj || userObj
                    ? {
                        id: Number(personnelObj?.id || 0),
                        id_utilisateur: Number(
                          personnelObj?.id_utilisateur || 0,
                        ),
                        fonction: String(
                          personnelObj?.fonction || "Personnel BCRG",
                        ),
                        utilisateur: {
                          id: Number(userObj?.id || 0),
                          nom: String(userObj?.nom || personnelObj?.nom || ""),
                          prenom: String(
                            userObj?.prenom || personnelObj?.prenom || "",
                          ),
                          matricule: String(
                            userObj?.matricule || personnelObj?.matricule || "",
                          ),
                          role: "personnel" as const,
                          est_actif: true,
                        },
                      }
                    : undefined,
              }
            : undefined,
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
      console.error("Erreur récupération des mouvements du personnel:", error);
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
      };
    }
  },
};
