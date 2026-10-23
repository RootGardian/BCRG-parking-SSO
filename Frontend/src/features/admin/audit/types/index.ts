import type { PaginationMeta } from "@/types/models";

/**
 * Catégorie d'action du journal d'audit pour le filtrage et les badges sémantiques.
 */
export type AuditActionCategory =
  | "all"
  | "creation"
  | "modification"
  | "securite"
  | "suppression";

/**
 * Modèle de données représentant une entrée dans le journal d'audit.
 * Conforme à la spécification OpenAPI /api/v1/admin/audit-logs.
 */
export interface AuditLog {
  /** Identifiant unique du log */
  id: number;
  /** Code de l'action système exécutée (ex: CREATE_UTILISATEUR, SUSPEND_COMPTE) */
  action: string;
  /** Identifiant ou référence de la cible affectée (ex: AGT-010, RC-1234-A) */
  cible: string;
  /** Description ou détails textuels de l'opération */
  details?: string;
  /** Horodatage ISO de l'action */
  date_action: string;
  /** Administrateur auteur de l'action */
  utilisateur: {
    matricule: string;
    nom: string;
  };
}

/**
 * Critères de filtrage applicables au journal d'audit.
 */
export interface AuditLogFilterInput {
  /** Terme de recherche textuelle (action, cible, détails, matricule ou nom de l'auteur) */
  search?: string;
  /** Catégorie sémantique ou type d'action spécifique */
  category?: AuditActionCategory;
  /** Date de début (format YYYY-MM-DD) */
  date_from?: string;
  /** Date de fin (format YYYY-MM-DD) */
  date_to?: string;
}

/**
 * Réponse typée retournée par l'API pour la consultation paginée des logs d'audit.
 */
export interface AuditLogsApiResponse {
  data: AuditLog[];
  meta: PaginationMeta;
}
