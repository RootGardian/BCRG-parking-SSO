import type { Mouvement } from "@/types/models";

/**
 * Statistiques synthétiques du taux d'occupation du parking sous-sol.
 */
export interface OccupancyStats {
  /** Nombre total de véhicules actuellement garés dans le parking */
  vehiculesSurSite: number;
  /** Cumul des véhicules entrés aujourd'hui */
  entreesAujourdhui: number;
  /** Cumul des véhicules sortis aujourd'hui */
  sortiesAujourdhui: number;
  /** Capacité maximale théorique du parking sous-sol */
  capaciteTotale: number;
  /** Pourcentage d'occupation du parking */
  tauxOccupation: number;
}

/**
 * Données d'affluence des mouvements par tranche horaire.
 */
export interface HourlyTrafficData {
  /** Label de l'heure (ex: '08:00', '09:00') */
  heure: string;
  /** Nombre d'entrées durant cette tranche */
  entrees: number;
  /** Nombre de sorties durant cette tranche */
  sorties: number;
}

/**
 * Données de répartition par catégorie de véhicules.
 */
export interface CategoryDistributionData {
  /** Libellé de la catégorie (ex: 'Personnel BCRG', 'Visiteurs') */
  name: string;
  /** Nombre de véhicules */
  value: number;
  /** Code couleur hexadécimal associé pour le graphique */
  color: string;
}

/**
 * Réponse regroupant toutes les données analytiques du tableau de bord.
 */
export interface DashboardAnalytics {
  stats: OccupancyStats;
  traffic: HourlyTrafficData[];
  distribution: CategoryDistributionData[];
  recentMovements: Mouvement[];
}
