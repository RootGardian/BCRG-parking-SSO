import { z } from "zod";

/**
 * Schéma Zod de validation des formulaires de véhicules / plaques.
 */
export const plaqueSchema = z.object({
  numero_plaque: z
    .string()
    .min(3, "La plaque doit contenir au moins 3 caractères")
    .toUpperCase()
    .trim(),
  marque_modele: z.string().optional(),
  couleur: z.string().optional(),
  matricule_personnel: z
    .string()
    .min(1, "Veuillez sélectionner le membre du personnel propriétaire")
    .trim(),
});

export type PlaqueFormValues = z.infer<typeof plaqueSchema>;
