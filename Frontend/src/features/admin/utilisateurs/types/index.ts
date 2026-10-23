import type { RoleEnum, Utilisateur } from "@/types/models";

/**
 * Filtres applicables à la liste des utilisateurs du système.
 */
export interface UtilisateurFilterInput {
  /** Recherche textuelle par nom, prénom ou matricule */
  search?: string;
  /** Filtre par rôle RBAC ('all' | 'admin' | 'supervision' | 'agent') */
  role?: "all" | RoleEnum;
  /** Filtre par état du compte ('all' | 'actif' | 'inactif') */
  est_actif?: "all" | "actif" | "inactif";
}

/**
 * Payload envoyé lors de la création ou mise à jour d'un utilisateur.
 */
export interface UtilisateurInput {
  nom: string;
  prenom: string;
  matricule: string;
  role: RoleEnum;
  fonction?: string;
  id_parking?: number | null;
}

/**
 * Réponse paginée de la liste des utilisateurs.
 */
export interface PaginatedUtilisateursResponse {
  data: Utilisateur[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
