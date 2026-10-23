import type { MouvementItem } from "@/features/admin/mouvements/types";
import type { PaginationMeta, Vehicule } from "@/types/models";

/**
 * Informations de baie de stationnement attribuée.
 */
export interface MaPlaceParkingItem {
  id: number;
  numero: string;
  niveau: string;
  id_parking?: number;
  parking?: { id: number; nom: string } | null;
  est_visiteur?: boolean;
  est_occupee?: boolean;
}

/**
 * Structure de réponse renvoyée par `GET /api/v1/mon-espace/place`.
 * Ex: `{ fonction: "DGFI", places_attitrees: [{ id: 46, numero: "P-10", niveau: "Sous-sol 1", ... }] }`
 */
export interface MaPlaceParkingResponse {
  fonction?: string;
  places_attitrees?: MaPlaceParkingItem[];
  // Rétro-compatibilité si renvoyé sous forme plate
  id?: number;
  numero?: string;
  niveau?: string;
  est_occupee?: boolean;
  est_visiteur?: boolean;
  parking?: { id: number; nom: string } | null;
}

export type MaPlaceParking = MaPlaceParkingResponse | null;

/**
 * Informations de véhicule rattaché au personnel.
 */
export interface VehiculePersonnelItem {
  id?: number;
  id_personnel?: number;
  numero_plaque: string;
  marque?: string;
  marque_modele?: string;
  modele?: string;
  couleur?: string;
  type?: string;
}

/**
 * Informations complètes de profil personnel issues de `GET /api/v1/mon-espace/profil`.
 */
export interface MonProfilPersonnel {
  id?: number;
  nom?: string;
  prenom?: string;
  matricule?: string;
  email?: string;
  telephone?: string;
  direction?: string;
  departement?: string;
  service?: string;
  fonction?:
    | {
        id?: number;
        nom?: string;
        description?: string;
      }
    | string;
  vehicules?: Vehicule[];
}

/**
 * Réponse de l'endpoint `GET /api/v1/mon-espace/qrcode`.
 */
export interface MonQrCodeResponse {
  /** Image du QR Code encodée en base64 ou URL de données */
  qr_code: string;
}

/**
 * Réponse de l'endpoint `GET /api/v1/mon-espace/statut`.
 * Ex: `{ statut: "sur_site", heure_arrivee: "...", place_parking: {...}, vehicule: {...} }`
 */
export interface MonStatutPresence {
  /** Statut textuel renvoyé par l'API ('sur_site' ou 'hors_site') */
  statut?: "sur_site" | "hors_site" | string;
  /** Heure d'arrivée de la session courante */
  heure_arrivee?: string | null;
  /** Heure de départ de la session */
  heure_depart?: string | null;
  /** Baie de stationnement occupée */
  place_parking?: {
    id?: number;
    numero?: string;
    niveau?: string;
    est_occupee?: boolean;
    est_visiteur?: boolean;
    id_parking?: number;
    id_fonction?: number;
  } | null;
  /** Véhicule utilisé lors du franchissement */
  vehicule?: VehiculePersonnelItem | null;
  /** Drapeaux et mouvements alternatifs pour rétro-compatibilité */
  sur_site?: boolean;
  dernier_mouvement?: MouvementItem | null;
}

/**
 * Réponse paginée de l'endpoint `GET /api/v1/mon-espace/historique`.
 */
export interface MonHistoriqueResponse {
  data: MouvementItem[];
  meta: PaginationMeta & { totalPages?: number };
}
