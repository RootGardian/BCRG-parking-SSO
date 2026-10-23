import type { Vehicule } from "@/types/models";

/**
 * Filtres applicables à la liste de la flotte automobile.
 */
export interface VehiculeFilterInput {
  /** Recherche par plaque, nom ou matricule du propriétaire */
  search?: string;
  /** Filtre par catégorie ('personnel' ou 'visiteur') */
  type_vehicule?: "all" | "personnel" | "visiteur";
  /** Filtre par statut d'emplacement ('all' | 'sur_site' | 'hors_site') */
  statut?: "all" | "sur_site" | "hors_site";
}

/**
 * Données envoyées lors de la création ou modification d'un véhicule.
 */
export interface PlaqueInput {
  numero_plaque: string;
  marque_modele?: string;
  couleur?: string;
  matricule_personnel: string;
  type_vehicule?: "personnel" | "visiteur";
  id_personnel?: number | null;
}

/**
 * Réponse paginée de la liste des véhicules.
 */
export interface PaginatedPlaquesResponse {
  data: Vehicule[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
