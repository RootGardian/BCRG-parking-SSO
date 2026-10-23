import type { AuditLog } from "../types";

/**
 * Jeu de données de démonstration pour le journal d'audit administratif de la BCRG.
 * Utilisé comme solution de repli en mode hors-ligne ou lors du développement local.
 */
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    action: "CREATE_UTILISATEUR",
    cible: "AGT-010",
    details:
      "Création du compte agent pour Abdoulaye Camara avec affectation au Parking Central",
    date_action: "2026-09-07T14:35:12Z",
    utilisateur: {
      matricule: "ADM-001",
      nom: "Barry",
    },
  },
  {
    id: 2,
    action: "UPDATE_PARKING",
    cible: "PARK-01",
    details:
      "Mise à jour de la capacité maximale du Parking Sous-Sol Bâtiment Principal (passage de 18 à 24 places)",
    date_action: "2026-09-07T13:20:45Z",
    utilisateur: {
      matricule: "ADM-001",
      nom: "Barry",
    },
  },
  {
    id: 3,
    action: "SUSPEND_COMPTE",
    cible: "USR-010",
    details:
      "Suspension administrative du compte utilisateur après 3 signalements d'anomalie de pointage",
    date_action: "2026-09-07T11:45:00Z",
    utilisateur: {
      matricule: "ADM-002",
      nom: "Diallo",
    },
  },
  {
    id: 4,
    action: "RESET_PASSWORD",
    cible: "AGT-009",
    details:
      "Réinitialisation forcée du mot de passe agent suite à une demande au guichet de sécurité",
    date_action: "2026-09-07T10:12:18Z",
    utilisateur: {
      matricule: "ADM-001",
      nom: "Barry",
    },
  },
  {
    id: 5,
    action: "CORRECTION_PASSAGE",
    cible: "MOUV-4421",
    details:
      "Correction manuelle de l'heure de sortie enregistrée pour le véhicule officiel RC-9912-B",
    date_action: "2026-09-07T09:05:33Z",
    utilisateur: {
      matricule: "ADM-002",
      nom: "Diallo",
    },
  },
  {
    id: 6,
    action: "CREATE_PERSONNEL",
    cible: "PERS-881",
    details:
      "Enregistrement d'un nouveau membre du personnel de la Direction des Études Économiques",
    date_action: "2026-09-06T16:50:00Z",
    utilisateur: {
      matricule: "ADM-001",
      nom: "Barry",
    },
  },
  {
    id: 7,
    action: "DELETE_PLACE",
    cible: "PLACE-V-08",
    details:
      "Suppression de la baie visiteur V-08 au Niveau -2 pour cause de travaux de maintenance électrique",
    date_action: "2026-09-06T15:22:10Z",
    utilisateur: {
      matricule: "ADM-001",
      nom: "Barry",
    },
  },
  {
    id: 8,
    action: "IMPORT_PERSONNEL_CSV",
    cible: "LOT-CSV-20260906",
    details:
      "Import massif de 45 agents et cadres via fichier CSV avec attribution automatique de QR codes",
    date_action: "2026-09-06T14:00:00Z",
    utilisateur: {
      matricule: "ADM-001",
      nom: "Barry",
    },
  },
  {
    id: 9,
    action: "UPDATE_FONCTION",
    cible: "FNC-04",
    details:
      "Attribution de l'emplacement réservé Sous-Sol Niveau -1 (Baie N°04) au Directeur des Systèmes d'Information",
    date_action: "2026-09-06T11:15:20Z",
    utilisateur: {
      matricule: "ADM-002",
      nom: "Diallo",
    },
  },
  {
    id: 10,
    action: "REACTIVATE_COMPTE",
    cible: "USR-004",
    details:
      "Réactivation du compte suite à la régularisation de la fiche administrative",
    date_action: "2026-09-05T17:30:00Z",
    utilisateur: {
      matricule: "ADM-001",
      nom: "Barry",
    },
  },
  {
    id: 11,
    action: "CREATE_VEHICULE",
    cible: "RC-4411-A",
    details:
      "Enregistrement du véhicule de service affecté au Département de la Trésorerie",
    date_action: "2026-09-05T10:45:12Z",
    utilisateur: {
      matricule: "ADM-002",
      nom: "Diallo",
    },
  },
  {
    id: 12,
    action: "DELETE_FONCTION",
    cible: "FNC-12",
    details:
      "Suppression de la fonction obsolète Conseiller Technique Adjoint et libération de la place",
    date_action: "2026-09-05T08:20:00Z",
    utilisateur: {
      matricule: "ADM-001",
      nom: "Barry",
    },
  },
];
