import { z } from "zod";

/**
 * Schéma Zod de validation de la sélection d'un membre du personnel pour enregistrement d'entrée.
 */
export const personnelEntrySchema = z.object({
  personnel_id: z
    .string()
    .min(
      1,
      "Veuillez sélectionner un membre du personnel ou une plaque d'immatriculation",
    ),
});

export type PersonnelEntryFormValues = z.infer<typeof personnelEntrySchema>;
