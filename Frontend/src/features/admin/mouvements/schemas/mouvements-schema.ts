import { z } from "zod";

/**
 * Schéma Zod pour la correction ou annotation administrative d'un passage.
 */
export const correctionSchema = z.object({
  observation: z
    .string()
    .min(
      3,
      "L'observation ou le motif de correction doit comporter au moins 3 caractères",
    )
    .trim(),
});

export type CorrectionFormValues = z.infer<typeof correctionSchema>;

/**
 * Schéma Zod pour le filtrage par plage de dates.
 */
export const dateRangeSchema = z.object({
  date_debut: z.string().optional(),
  date_fin: z.string().optional(),
});

export type DateRangeFormValues = z.infer<typeof dateRangeSchema>;
