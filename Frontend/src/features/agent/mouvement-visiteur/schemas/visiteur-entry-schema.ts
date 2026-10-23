import { z } from "zod";

/**
 * Schéma Zod de validation de l'enregistrement d'une entrée visiteur au guichet.
 */
export const visiteurEntrySchema = z.object({
  numero_plaque: z
    .string()
    .min(3, "La plaque d'immatriculation doit comporter au moins 3 caractères")
    .toUpperCase()
    .trim(),
  observation: z.string().optional(),
});

export type VisiteurEntryFormValues = z.infer<typeof visiteurEntrySchema>;
