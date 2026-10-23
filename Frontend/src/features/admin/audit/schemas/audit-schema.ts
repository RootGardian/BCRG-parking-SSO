import { z } from "zod";

/**
 * Schéma de validation Zod pour les filtres du journal d'audit.
 */
export const auditFilterSchema = z.object({
  search: z.string().optional(),
  category: z
    .enum(["all", "creation", "modification", "securite", "suppression"])
    .default("all"),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export type AuditFilterValues = z.infer<typeof auditFilterSchema>;
