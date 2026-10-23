import type { MouvementItem } from "@/features/admin/mouvements/types";

/**
 * Résultat de recherche d'une plaque d'immatriculation visiteur au guichet.
 */
export interface VisiteurScanResult {
  numero_plaque: string;
  est_sur_site: boolean;
  passage_actif_id?: number;
  heure_arrivee?: string;
  observation?: string;
  marque_modele?: string;
  couleur?: string;
}

/**
 * Input de validation d'entrée d'un visiteur externe.
 */
export interface MouvementVisiteurEntreeInput {
  type_entree: "visiteur";
  numero_plaque: string;
  observation?: string;
}

/**
 * Input de validation de sortie d'un visiteur.
 */
export interface MouvementVisiteurSortieInput {
  numero_plaque?: string;
  id_passage?: number;
  observation?: string;
}

export interface MouvementListResponse {
  data: MouvementItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type { MouvementItem };
