/**
 * Énumération des rôles d'utilisateurs au sein du système BCRG.
 * - 'admin' : Accès complet d'administration et de gestion.
 * - 'supervision' : Accès en lecture seule identique à l'admin avec droits exclusifs d'impression/export.
 * - 'agent' : Accès guichet sécurité pour la saisie des entrées/sorties.
 * - 'personnel' : Espace membre du personnel BCRG.
 */
export type RoleEnum = "admin" | "supervision" | "agent" | "personnel";

/**
 * Énumération du statut d'un mouvement de véhicule sur le parking.
 * - 'sur_site' : Véhicule actuellement présent dans le parking sous-sol.
 * - 'hors_site' : Véhicule sorti du parking sous-sol.
 */
export type StatutEnum = "sur_site" | "hors_site";

/**
 * Fonctions institutionnelles au sein de la BCRG.
 */
export type FonctionEnum =
  | "Gouverneur"
  | "1er Vice Gouverneur"
  | "2ème Vice Gouverneur"
  | "Conseiller"
  | "DGFI"
  | "DGASJ"
  | "DGES"
  | "DG"
  | "FMI"
  | string;

/**
 * Entité Utilisateur principale représentant les comptes d'accès au système.
 */
export interface Utilisateur {
  /** Identifiant unique (PK) */
  id: number;
  /** Nom de famille */
  nom: string;
  /** Prénom(s) */
  prenom: string;
  /** Matricule unique institutionnel BCRG (ex: 'BCRG-8842') */
  matricule: string;
  /** Adresse email professionnelle */
  email?: string;
  /** Numéro de téléphone professionnel */
  telephone?: string;
  /** Rôle RBAC associé */
  role: RoleEnum;
  /** Fonction institutionnelle (ex: 'DSA', 'DER', '1er vice gouverneur') */
  fonction?: string;
  /** Statut du compte (actif ou suspendu) */
  est_actif: boolean;
  /** Indique si le mot de passe doit être obligatoirement changé */
  doit_changer_mdp?: boolean;
  /** URL optionnelle de la photo/avatar */
  avatar?: string;
  /** Date d'enregistrement dans le système */
  created_at?: string;
  /** Identifiant du parking assigné (Agent uniquement) */
  id_parking?: number | null;
  /** Nom du parking assigné si disponible */
  parking_nom?: string | null;
  /** Informations agent spécifiques */
  agent?: {
    id: number;
    id_parking?: number | null;
    parking?: { id: number; nom: string } | null;
  };
}

/**
 * Profil Personnel BCRG rattaché à un Utilisateur.
 */
export interface Personnel {
  /** Identifiant unique du profil personnel */
  id: number;
  /** Identifiant de l'utilisateur rattaché */
  id_utilisateur: number;
  /** Fonction au sein de la Banque Centrale */
  fonction: FonctionEnum;
  /** Département ou direction institutionnelle */
  direction?: string;
  /** Entité utilisateur complète rattachée */
  utilisateur?: Utilisateur;
}

/**
 * Profil Agent de Sécurité rattaché à un Utilisateur opérant aux guichets.
 */
export interface Agent {
  /** Identifiant unique du profil agent */
  id: number;
  /** Identifiant de l'utilisateur rattaché */
  id_utilisateur: number;
  /** Zone de poste affectée (ex: 'Portail Principal', 'Parking VIP') */
  post_affectation?: string;
  /** Entité utilisateur complète rattachée */
  utilisateur?: Utilisateur;
}

/**
 * Entité Véhicule représentant les automobiles autorisées ou visiteuses.
 */
export interface Vehicule {
  /** Identifiant unique du véhicule */
  id: number;
  /** Numéro de plaque d'immatriculation unique (ex: 'RC-1234-A') */
  numero_plaque: string;
  /** Marque et modèle (ex: 'Toyota Land Cruiser', 'Peugeot 508') */
  marque_modele?: string;
  /** Couleur du véhicule */
  couleur?: string;
  /** Type de véhicule ('personnel' ou 'visiteur') */
  type_vehicule?: "personnel" | "visiteur";
  /** Identifiant du membre du personnel propriétaire (null si visiteur) */
  id_personnel?: number | null;
  /** Entité personnel rattachée (optionnelle) */
  personnel?: Personnel;
}

/**
 * Entité Mouvement traçant chaque événement d'entrée et de sortie du parking.
 */
export interface Mouvement {
  /** Identifiant unique du mouvement */
  id: number | string;
  /** Date et heure précises d'arrivée au parking */
  heure_arrivee: string;
  /** Identifiant du véhicule concerné */
  id_vehicule?: number;
  /** Entité véhicule associée */
  vehicule?: Vehicule;
  /** Date et heure précises de départ (null si actuellement sur site) */
  heure_depart?: string | null;
  /** Identifiant de l'agent ayant enregistré le mouvement */
  id_agent?: number;
  /** Agent ayant opéré */
  agent?: Agent;
  /** Statut courant du mouvement ('sur_site' ou 'hors_site') */
  statut: StatutEnum;
  /** Observations, motif de visite ou remarques de l'agent */
  observation?: string;
  /** Indique si le véhicule appartient au personnel BCRG ou à un visiteur */
  categorie?: "personnel" | "visiteur";
  /** Propriétés DTO optionnelles renvoyées par l'API backend */
  plaque_immatriculation?: string;
  nom_complet?: string;
  type_flux?: "personnel" | "visiteur";
  horodatage?: string;
  nom_vigile?: string;
  matricule?: string;
  motif_visite?: string;
}

/**
 * Métadonnées de pagination renvoyées par l'API backend BCRG.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages?: number;
}
