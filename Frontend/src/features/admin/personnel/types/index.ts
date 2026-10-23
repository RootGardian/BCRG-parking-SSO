import type { Vehicule } from "@/types/models";

/**
 * Entité Membre du Personnel BCRG typée pour le module Personnel.
 */
export interface PersonnelItem {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  fonction?: string;
  id_fonction?: number | null;
  qr_code?: string | null;
  est_actif: boolean;
  vehicules?: Vehicule[];
  created_at?: string;
}

/**
 * Données en entrée pour la création d'un membre du personnel (`POST /api/v1/admin/personnel`).
 */
export interface PersonnelCreateInput {
  nom: string;
  prenom: string;
  matricule: string;
  fonction?: string;
  id_fonction?: number;
  numero_plaque?: string;
}

/**
 * Données en entrée pour la modification d'un membre du personnel (`PUT /api/v1/admin/personnel/{matricule}`).
 */
export interface PersonnelUpdateInput {
  nom?: string;
  prenom?: string;
  matricule?: string;
  id_fonction?: number;
}

/**
 * Filtres de recherche du personnel.
 */
export interface PersonnelFilterInput {
  search?: string;
  est_actif?: "all" | "actif" | "inactif";
}

/**
 * Structure de réponse paginée du personnel.
 */
export interface PaginatedPersonnelResponse {
  data: PersonnelItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
