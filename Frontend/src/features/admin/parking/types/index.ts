/**
 * Entité Place de Parking sous-sol BCRG.
 */
export interface PlaceParkingItem {
  id: number;
  numero: string;
  niveau: string;
  id_parking?: number;
  est_visiteur: boolean;
  est_occupee: boolean;
}

/**
 * Entité Infrastructure Parking BCRG.
 */
export interface ParkingItem {
  id: number;
  nom: string;
  adresse?: string | null;
  nombre_niveaux: number;
  capacite_maximale?: number | null;
  capacites_niveaux?: Record<string, number> | null;
  places?: PlaceParkingItem[];
}

/**
 * Entité Fonction Institutionnelle BCRG avec ses places réservées.
 */
export interface FonctionItem {
  id: number;
  nom: string;
  places_parking?: PlaceParkingItem[];
}

/**
 * Données d'entrée pour la création d'un parking (OpenAPI: ParkingCreateRequest).
 */
export interface ParkingCreateInput {
  nom: string;
  adresse?: string;
  nombre_niveaux?: number;
  capacite_maximale?: number;
  capacites_niveaux?: Record<string, number>;
}

/**
 * Données d'entrée pour la modification d'un parking (OpenAPI: ParkingUpdateRequest).
 */
export interface ParkingUpdateInput {
  nom?: string;
  adresse?: string;
  nombre_niveaux?: number;
  capacite_maximale?: number;
  capacites_niveaux?: Record<string, number>;
}

/**
 * Données d'entrée pour la création d'une place réservée visiteur.
 */
export interface PlaceVisiteurInput {
  id_parking?: number;
  niveau_parking: string;
  numero_place: string;
}

/**
 * Données d'entrée pour la création d'une fonction institutionnelle et sa place.
 */
export interface FonctionCreateInput {
  id_parking?: number;
  nom_fonction: string;
  niveau_parking: string;
  numero_place: string;
}
