import type { Vehicule } from "@/types/models";

/**
 * Entité Mouvement / Passage au parking sous-sol BCRG.
 */
export interface MouvementItem {
  id: number;
  heure_arrivee: string;
  heure_depart?: string | null;
  statut: "sur_site" | "hors_site";
  type_entree: "personnel" | "visiteur";
  observation?: string | null;
  vehicule?: Vehicule | null;
  agent?: {
    id: number;
    nom?: string;
    prenom?: string;
    matricule?: string;
  } | null;
  duree_minutes?: number;
}

/**
 * Filtres applicables à l'historique des mouvements.
 */
export interface MouvementFilterInput {
  search?: string;
  date_debut?: string;
  date_fin?: string;
  type_entree?: "all" | "personnel" | "visiteur";
  statut?: "all" | "sur_site" | "hors_site";
}

/**
 * Réponse paginée de l'historique des mouvements.
 */
export interface PaginatedMouvementResponse {
  data: MouvementItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
