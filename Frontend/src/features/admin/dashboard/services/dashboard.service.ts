import { apiClient } from "@/shared/services/api-client";
import { ENDPOINTS } from "@/shared/services/endpoints";
import type { Mouvement } from "@/types/models";
import type { DashboardAnalytics } from "../types";

/**
 * Service Métier du Tableau de Bord Administration & Supervision.
 *
 * Interroge l'endpoint récapitulatif unique de l'API Backend BCRG :
 * - GET /api/v1/admin/statistiques
 *
 * Mappe et normalise précisément la structure renvoyée par le backend :
 * - `kpis` (presents_sur_site, capacite_max, taux_occupation, entrees_jour, sorties_jour)
 * - `flux_horaire` (entrées / sorties par tranche horaire)
 * - `repartition_flotte` (personnel, visiteurs)
 * - `derniers_mouvements` (liste enrichie des 5 derniers passages avec véhicule, personnel et vigile)
 */
export const dashboardService = {
  /**
   * Récupère et normalise les indicateurs temps réel du tableau de bord avec filtrage par date optionnel.
   *
   * @param dateDebut Date de début (ex: 2025-09-01T00:00:00Z ou YYYY-MM-DD)
   * @param dateFin Date de fin (ex: 2025-09-01T23:59:59Z ou YYYY-MM-DD)
   * @returns Les données analytiques complètes adaptées à la période sélectionnée
   */
  async getAnalytics(
    dateDebut?: string,
    dateFin?: string,
  ): Promise<DashboardAnalytics> {
    try {
      const params: Record<string, string> = {};
      if (dateDebut && dateDebut.trim() !== "") {
        params.date_debut = dateDebut.includes("T")
          ? dateDebut
          : `${dateDebut}T00:00:00Z`;
      }
      if (dateFin && dateFin.trim() !== "") {
        params.date_fin = dateFin.includes("T")
          ? dateFin
          : `${dateFin}T23:59:59Z`;
      }

      const response = await apiClient.get(ENDPOINTS.ADMIN.STATISTIQUES, {
        params,
      });
      const data = response.data || {};

      // 1. Extraction et normalisation des KPIs
      const kpis = data.kpis || {};
      const vehiculesSurSite = Number(
        kpis.presents_sur_site ?? data.presents_sur_site ?? 0,
      );
      const capaciteTotale = Number(
        kpis.capacite_max ?? data.capacite_max ?? 200,
      );
      const tauxOccupation = Number(
        kpis.taux_occupation ??
          (capaciteTotale > 0
            ? Math.round((vehiculesSurSite / capaciteTotale) * 100)
            : 0),
      );
      const entreesAujourdhui = Number(
        kpis.entrees_jour ?? data.entrees_jour ?? 0,
      );
      const sortiesAujourdhui = Number(
        kpis.sorties_jour ?? data.sorties_jour ?? 0,
      );

      // 2. Extraction du flux horaire (Graphique d'affluence)
      const rawFlux = Array.isArray(data.flux_horaire)
        ? data.flux_horaire
        : Array.isArray(data.traffic)
          ? data.traffic
          : [];

      const traffic = rawFlux.map(
        (item: { heure?: string; entrees?: number; sorties?: number }) => ({
          heure: item.heure || "00:00",
          entrees: Number(item.entrees || 0),
          sorties: Number(item.sorties || 0),
        }),
      );

      // 3. Extraction de la répartition de la flotte (Camembert)
      const repartition = data.repartition_flotte || {};
      const distribution = [
        {
          name: "Personnel BCRG",
          value: Number(repartition.personnel ?? 0),
          color: "#0d5c3a", // Vert institutionnel BCRG
        },
        {
          name: "Visiteurs",
          value: Number(repartition.visiteurs ?? 0),
          color: "#eab308", // Jaune Or BCRG
        },
      ];

      // 4. Extraction et normalisation des derniers mouvements
      const rawMovements = Array.isArray(data.derniers_mouvements)
        ? data.derniers_mouvements
        : Array.isArray(data.mouvements)
          ? data.mouvements
          : [];

      const recentMovements: Mouvement[] = rawMovements
        .slice(0, 5)
        .map((item: Record<string, unknown>, index: number) => {
          const vehiculeObj = item.vehicule as
            | Record<string, unknown>
            | undefined;
          const personnelObj = (vehiculeObj?.personnel || item.personnel) as
            | Record<string, unknown>
            | undefined;
          const userObj = (personnelObj?.utilisateur || item.utilisateur) as
            | Record<string, unknown>
            | undefined;
          const agentObj = item.agent as Record<string, unknown> | undefined;
          const agentUserObj = agentObj?.utilisateur as
            | Record<string, unknown>
            | undefined;

          // Nom du conducteur (Personnel BCRG ou Visiteur externe)
          let nomComplet = "Non renseigné";
          if (userObj?.prenom || userObj?.nom) {
            nomComplet = `${userObj.prenom || ""} ${userObj.nom || ""}`.trim();
          } else if (
            item.nom_proprietaire_externe ||
            vehiculeObj?.nom_proprietaire_externe
          ) {
            nomComplet = String(
              item.nom_proprietaire_externe ||
                vehiculeObj?.nom_proprietaire_externe,
            );
          } else if (item.nom_complet) {
            nomComplet = String(item.nom_complet);
          }

          // Nom de l'agent de sécurité au guichet
          let nomVigile = "Agent Guichet";
          if (agentUserObj?.prenom || agentUserObj?.nom) {
            nomVigile =
              `${agentUserObj.prenom || ""} ${agentUserObj.nom || ""}`.trim();
          } else if (typeof item.nom_vigile === "string") {
            nomVigile = item.nom_vigile;
          }

          const plaque = String(
            vehiculeObj?.numero_plaque ||
              item.numero_plaque ||
              item.plaque_immatriculation ||
              "Non renseigné",
          );

          const marque = String(
            vehiculeObj?.marque ||
              vehiculeObj?.marque_modele ||
              item.marque_modele ||
              "",
          );

          const flux =
            (item.type_entree || item.categorie || item.type_flux) ===
            "visiteur"
              ? "visiteur"
              : "personnel";

          return {
            id: Number(item.id || index + 1),
            heure_arrivee: String(
              item.heure_arrivee || item.horodatage || new Date().toISOString(),
            ),
            heure_depart: item.heure_depart ? String(item.heure_depart) : null,
            statut: (item.statut || "sur_site") as "sur_site" | "hors_site",
            categorie: flux,
            observation: item.observation
              ? String(item.observation)
              : undefined,
            plaque_immatriculation: plaque,
            nom_complet: nomComplet,
            type_flux: flux,
            horodatage: String(
              item.heure_arrivee || item.horodatage || new Date().toISOString(),
            ),
            nom_vigile: nomVigile,
            vehicule: vehiculeObj
              ? {
                  id: Number(vehiculeObj.id || 0),
                  numero_plaque: plaque,
                  marque_modele: marque,
                  couleur: vehiculeObj.couleur
                    ? String(vehiculeObj.couleur)
                    : undefined,
                }
              : undefined,
          };
        });

      return {
        stats: {
          vehiculesSurSite,
          entreesAujourdhui,
          sortiesAujourdhui,
          capaciteTotale,
          tauxOccupation,
        },
        traffic,
        distribution,
        recentMovements,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des statistiques backend:",
        error,
      );
      throw new Error(
        "Impossible de charger les métriques du tableau de bord.",
      );
    }
  },
};
