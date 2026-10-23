import type { MouvementItem } from "@/features/admin/mouvements/types";
import type { Vehicule } from "@/types/models";

/**
 * Statut d'occupation temps réel du parking sous-sol.
 */
export interface ParkingStatus {
  presents_sur_site: number;
  capacite_max: number;
  taux_occupation: number;
  personnel?: {
    total: number;
    occupees: number;
    disponibles: number;
  };
  visiteurs?: {
    total: number;
    occupees: number;
    disponibles: number;
  };
}

/**
 * Résultat de recherche ou de scan d'un membre du personnel au guichet.
 */
export interface PersonnelScanResult {
  matricule: string;
  nom: string;
  prenom: string;
  fonction?: string;
  qr_code?: string | null;
  est_sur_site: boolean;
  vehicules?: Vehicule[];
  vehicule_selectionne?: Vehicule | null;
  passage_actif_id?: number;
}

/**
 * Payload pour valider une entrée du personnel.
 */
export interface MouvementPersonnelEntreeInput {
  type_entree: "personnel";
  matricule_personnel: string;
  numero_plaque?: string;
  observation?: string;
}

/**
 * Payload pour valider une sortie du personnel.
 */
export interface MouvementPersonnelSortieInput {
  matricule_personnel: string;
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
