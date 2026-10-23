/**
 * Centralisation de toutes les constantes d'endpoints HTTP de l'API Backend BCRG.
 * Basé sur la spécification OpenAPI (resources/api/document.json).
 */
export const ENDPOINTS = {
  /** Endpoints d'authentification et de session */
  AUTH: {
    LOGIN: "/api/auth/login",
    SSO_LOGIN: "/api/auth/sso-login",
    SSO: "/api/auth/sso",
    SLO: "/api/auth/slo",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
    CHANGE_PASSWORD: "/api/auth/change-password",
  },
  /** Endpoints de consultation du personnel et véhicules */
  PERSONNEL: {
    LIST: "/api/v1/personnel",
    BY_MATRICULE: (matricule: string) => `/api/v1/personnel/${matricule}`,
    VEHICLES: (matricule: string) => `/api/v1/personnel/${matricule}/vehicules`,
    QRCODE: (matricule: string) => `/api/v1/personnel/${matricule}/qrcode`,
  },
  /** Endpoints de gestion des véhicules et autorisations */
  VEHICULES: {
    LIST: "/api/v1/vehicules",
    AUTORISES: "/api/v1/vehicules/autorises",
  },
  /** Endpoints du registre guichet vigile (entrées/sorties et mouvements) */
  REGISTRE: {
    ENTREE: "/api/v1/registre/entree",
    SORTIE: "/api/v1/registre/sortie",
    MOUVEMENT_PERSONNEL: "/api/v1/registre/mouvement/personnel",
    MOUVEMENT_VISITEUR: "/api/v1/registre/mouvement/visiteur",
    CORRECTION: (idPassage: string | number) =>
      `/api/v1/registre/correction/${idPassage}`,
  },
  /** Endpoints de statut du parking */
  PARKING: {
    STATUT: "/api/v1/parking/statut",
  },
  /** Endpoints d'administration et de gestion */
  ADMIN: {
    PARKINGS: "/api/v1/admin/parkings",
    PARKING_BY_ID: (id: number | string) => `/api/v1/admin/parkings/${id}`,
    PERSONNEL: "/api/v1/personnel",
    PERSONNEL_CREATE: "/api/v1/admin/personnel",
    PERSONNEL_BY_MATRICULE: (matricule: string) =>
      `/api/v1/admin/personnel/${matricule}`,
    UTILISATEURS: "/api/v1/admin/utilisateurs",
    UTILISATEUR_BY_MATRICULE: (matricule: string) =>
      `/api/v1/admin/utilisateurs/${matricule}`,
    VEHICULES: "/api/v1/admin/vehicules",
    VEHICULES_STATS: "/api/v1/admin/vehicules/stats",
    PARKING_PLACES: "/api/v1/admin/parking/places",
    PARKING_VISITEURS: "/api/v1/admin/parking/visiteurs",
    PARKING_VISITEUR_BY_ID: (id: number | string) =>
      `/api/v1/admin/parking/visiteurs/${id}`,
    FONCTIONS: "/api/v1/admin/fonctions",
    FONCTION_BY_ID: (id: number | string) => `/api/v1/admin/fonctions/${id}`,
    IMPORTS_PERSONNEL: "/api/v1/imports/personnel",
    IMPORTS_UTILISATEURS: "/api/v1/imports/utilisateurs",
    QRCODES: "/api/v1/admin/personnel/qrcodes",
    HISTORIQUE: "/api/v1/admin/historique",
    AUDIT_LOGS: "/api/v1/admin/audit-logs",
    STATISTIQUES: "/api/v1/admin/statistiques",
    RAPPORTS: "/api/v1/admin/rapports",
  },
  /** Endpoints de l'espace personnel (profil, badge QR, véhicules, historique) */
  MON_ESPACE: {
    PROFIL: "/api/v1/mon-espace/profil",
    QRCODE: "/api/v1/mon-espace/qrcode",
    STATUT: "/api/v1/mon-espace/statut",
    PLACE: "/api/v1/mon-espace/place",
    VEHICULES: "/api/v1/mon-espace/vehicules",
    HISTORIQUE: "/api/v1/mon-espace/historique",
  },
} as const;
