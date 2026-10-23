import { z } from "zod";

/**
 * Schéma Zod pour l'enregistrement de l'accès d'un visiteur externe.
 */
export const visiteurEntreeSchema = z.object({
  numero_plaque: z
    .string()
    .min(3, "La plaque d'immatriculation doit comporter au moins 3 caractères")
    .toUpperCase()
    .trim(),
  observation: z.string().optional(),
});

export type VisiteurEntreeFormValues = z.infer<typeof visiteurEntreeSchema>;
