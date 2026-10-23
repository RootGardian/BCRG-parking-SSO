import { apiClient } from "@/shared/services/api-client";
import { ENDPOINTS } from "@/shared/services/endpoints";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import { MOCK_AUDIT_LOGS } from "../data/mock-audit-logs";
import type {
  AuditLog,
  AuditLogFilterInput,
  AuditLogsApiResponse,
} from "../types";

/**
 * Extrait un tableau d'éléments bruts depuis n'importe quelle structure de réponse backend.
 * Supporte { data: [...] }, { logs: [...] }, { audit_logs: [...] }, { items: [...] },
 * { data: { logs: [...] } }, tableau direct, etc.
 */
function extractArrayFromResponse(raw: unknown): Record<string, unknown>[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return extractArrayFromResponse(parsed);
    } catch {
      return [];
    }
  }

  if (typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;

  // 1. Clés directes courantes
  const candidateKeys = [
    "data",
    "logs",
    "audit_logs",
    "auditLogs",
    "audits",
    "items",
    "results",
    "historique",
    "history",
    "actions",
    "events",
  ];

  for (const key of candidateKeys) {
    if (Array.isArray(obj[key])) {
      return obj[key] as Record<string, unknown>[];
    }
  }

  // 2. Sous-objet "data" encapsulant la collection
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
    const sub = obj.data as Record<string, unknown>;
    for (const key of candidateKeys) {
      if (Array.isArray(sub[key])) {
        return sub[key] as Record<string, unknown>[];
      }
    }
  }

  // 3. Parcours de toutes les propriétés du premier niveau contenant un tableau d'objets
  for (const val of Object.values(obj)) {
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
      return val as Record<string, unknown>[];
    }
  }

  return [];
}

/**
 * Normalise un enregistrement brut du journal d'audit en modèle AuditLog typé.
 * Extrêmement défensif face aux variations de noms de champs backend.
 */
function normalizeAuditLog(
  item: Record<string, unknown>,
  index: number,
): AuditLog {
  // 1. Identifiant unique
  const id = Number(
    item.id || item.log_id || item.id_log || item.audit_id || index + 1,
  );

  // 2. Action exécutée
  const action = String(
    item.action ||
      item.action_type ||
      item.type_action ||
      item.type ||
      item.event ||
      item.operation ||
      "ACTION_SYSTEME",
  ).toUpperCase();

  // 3. Entité ou cible concernée
  const cible = String(
    item.cible ||
      item.target ||
      item.entite ||
      item.entity ||
      item.table ||
      item.resource ||
      item.matricule_cible ||
      item.plaque ||
      "—",
  );

  // 4. Détails textuels
  let detailsText: string | undefined;
  if (item.details !== undefined && item.details !== null) {
    detailsText =
      typeof item.details === "object"
        ? JSON.stringify(item.details)
        : String(item.details);
  } else if (item.description) {
    detailsText = String(item.description);
  } else if (item.message) {
    detailsText = String(item.message);
  } else if (item.commentaire) {
    detailsText = String(item.commentaire);
  } else if (item.metadata) {
    detailsText =
      typeof item.metadata === "object"
        ? JSON.stringify(item.metadata)
        : String(item.metadata);
  }

  // 5. Horodatage ISO
  const dateAction = String(
    item.date_action ||
      item.created_at ||
      item.timestamp ||
      item.date ||
      item.horodatage ||
      new Date().toISOString(),
  );

  // 6. Opérateur (Utilisateur ayant réalisé l'action)
  let userMatricule = "SYSTEM";
  let userNom = "Système BCRG";

  const userObj = (item.utilisateur ||
    item.user ||
    item.admin ||
    item.agent ||
    item.author ||
    item.operateur) as Record<string, unknown> | string | undefined;

  if (typeof userObj === "string" && userObj.trim() !== "") {
    userNom = userObj.trim();
    userMatricule = String(
      item.matricule ||
        item.user_matricule ||
        item.matricule_utilisateur ||
        "ADM",
    );
  } else if (userObj && typeof userObj === "object") {
    userMatricule = String(
      userObj.matricule ||
        userObj.username ||
        item.matricule ||
        item.user_matricule ||
        "ADM",
    );
    const prenom = userObj.prenom ? `${userObj.prenom} ` : "";
    const nom = String(
      userObj.nom || userObj.name || userObj.username || "Administrateur",
    );
    userNom = `${prenom}${nom}`.trim();
  } else if (item.matricule_utilisateur || item.nom_utilisateur || item.nom) {
    userMatricule = String(
      item.matricule_utilisateur || item.matricule || "SYSTEM",
    );
    userNom = String(item.nom_utilisateur || item.nom || "Système BCRG");
  }

  return {
    id,
    action,
    cible,
    details: detailsText,
    date_action: dateAction,
    utilisateur: {
      matricule: userMatricule,
      nom: userNom,
    },
  };
}

/**
 * Service pour la gestion et la consultation du journal d'audit administratif.
 */
export const auditService = {
  /**
   * Récupère la liste paginée et filtrée des journaux d'audit.
   *
   * @param page Numéro de page (1-indexed)
   * @param limit Nombre d'éléments par page
   * @param filters Critères de filtrage optionnels
   * @returns Liste paginée des logs d'audit et métadonnées
   */
  async getAuditLogs(
    page = 1,
    limit = 10,
    filters?: AuditLogFilterInput,
  ): Promise<AuditLogsApiResponse> {
    try {
      // 1. Paramètres basiques envoyés à l'API
      const params: Record<string, string | number> = {
        page,
        limit,
      };

      const response = await apiClient.get<unknown>(
        ENDPOINTS.ADMIN.AUDIT_LOGS,
        { params },
      );

      const rawData = response.data;
      if (process.env.NODE_ENV !== "production") {
        console.log("[auditService] Réponse brute API audit-logs :", rawData);
      }

      // 2. Extraction dynamique du tableau d'enregistrements
      const rawList = extractArrayFromResponse(rawData);

      // Si l'API a retourné un tableau valide
      if (rawList.length > 0) {
        let normalizedLogs = rawList.map((item, idx) =>
          normalizeAuditLog(item, idx),
        );

        // 3. Filtrage côté client pour la recherche textuelle (action, cible, détails, opérateur)
        if (filters?.search && filters.search.trim() !== "") {
          const q = filters.search.toLowerCase().trim();
          normalizedLogs = normalizedLogs.filter(
            (log) =>
              log.action.toLowerCase().includes(q) ||
              log.cible.toLowerCase().includes(q) ||
              log.details?.toLowerCase().includes(q) ||
              log.utilisateur.nom.toLowerCase().includes(q) ||
              log.utilisateur.matricule.toLowerCase().includes(q),
          );
        }

        // 4. Filtrage par catégorie sémantique
        if (filters?.category && filters.category !== "all") {
          const cat = filters.category;
          if (cat === "creation") {
            normalizedLogs = normalizedLogs.filter(
              (log) =>
                log.action.startsWith("CREATE") ||
                log.action.startsWith("IMPORT") ||
                log.action.startsWith("AJOUT"),
            );
          } else if (cat === "modification") {
            normalizedLogs = normalizedLogs.filter(
              (log) =>
                log.action.startsWith("UPDATE") ||
                log.action.startsWith("CORRECTION") ||
                log.action.startsWith("MODIF"),
            );
          } else if (cat === "securite") {
            normalizedLogs = normalizedLogs.filter(
              (log) =>
                log.action.includes("PASSWORD") ||
                log.action.includes("COMPTE") ||
                log.action.includes("AUTH") ||
                log.action.includes("LOGIN") ||
                log.action.includes("SECURITE"),
            );
          } else if (cat === "suppression") {
            normalizedLogs = normalizedLogs.filter(
              (log) =>
                log.action.startsWith("DELETE") ||
                log.action.startsWith("SUSPEND") ||
                log.action.startsWith("SUPPR"),
            );
          }
        }

        // 5. Métadonnées de pagination
        const rawObj =
          rawData && typeof rawData === "object"
            ? (rawData as Record<string, unknown>)
            : {};
        const metaObj = (rawObj.meta || rawObj.pagination) as
          | Record<string, unknown>
          | undefined;

        // Détection si la réponse est déjà paginée par le serveur
        const serverTotal = Number(
          metaObj?.total ?? metaObj?.totalItems ?? rawObj.total ?? rawObj.count,
        );

        const isServerPaginated =
          !Number.isNaN(serverTotal) && serverTotal > rawList.length;

        if (isServerPaginated) {
          const serverTotalPages = Number(
            metaObj?.totalPages ??
              metaObj?.total_pages ??
              metaObj?.last_page ??
              (Math.ceil(serverTotal / limit) || 1),
          );

          return {
            data: normalizedLogs,
            meta: {
              page,
              limit,
              total: serverTotal,
              total_pages: serverTotalPages,
            },
          };
        }

        // Pagination côté client si l'API a retourné la collection intégrale
        const total = normalizedLogs.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const startIndex = (page - 1) * limit;
        const paginatedLogs = normalizedLogs.slice(
          startIndex,
          startIndex + limit,
        );

        return {
          data: paginatedLogs,
          meta: {
            page,
            limit,
            total,
            total_pages: totalPages,
          },
        };
      }

      // Si l'API a renvoyé un tableau vide explicite (0 enregistrement réel)
      return {
        data: [],
        meta: {
          page: 1,
          limit,
          total: 0,
          total_pages: 1,
        },
      };
    } catch (error) {
      console.warn(
        "API Audit non disponible ou erreur, activation des données de repli :",
        getApiErrorMessage(error),
      );

      // Filtrage local sur le mock de démonstration
      let filtered = [...MOCK_AUDIT_LOGS];

      if (filters?.search?.trim()) {
        const query = filters.search.toLowerCase().trim();
        filtered = filtered.filter(
          (log) =>
            log.action.toLowerCase().includes(query) ||
            log.cible.toLowerCase().includes(query) ||
            log.details?.toLowerCase().includes(query) ||
            log.utilisateur.nom.toLowerCase().includes(query) ||
            log.utilisateur.matricule.toLowerCase().includes(query),
        );
      }

      if (filters?.category && filters.category !== "all") {
        const cat = filters.category;
        if (cat === "creation") {
          filtered = filtered.filter(
            (log) =>
              log.action.startsWith("CREATE") ||
              log.action.startsWith("IMPORT"),
          );
        } else if (cat === "modification") {
          filtered = filtered.filter(
            (log) =>
              log.action.startsWith("UPDATE") ||
              log.action.startsWith("CORRECTION"),
          );
        } else if (cat === "securite") {
          filtered = filtered.filter(
            (log) =>
              log.action.includes("PASSWORD") ||
              log.action.includes("COMPTE") ||
              log.action.includes("AUTH"),
          );
        } else if (cat === "suppression") {
          filtered = filtered.filter(
            (log) =>
              log.action.startsWith("DELETE") ||
              log.action.startsWith("SUSPEND"),
          );
        }
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      return {
        data: paginated,
        meta: {
          page,
          limit,
          total,
          total_pages: totalPages,
        },
      };
    }
  },
};
