import { z } from "zod";

/**
 * Schéma Zod de validation de l'enregistrement des visiteurs au guichet.
 */
export const visiteurSchema = z.object({
  numero_plaque: z
    .string()
    .min(3, "La plaque doit contenir au moins 3 caractères")
    .toUpperCase()
    .trim(),
  nom_visiteur: z.string().min(2, "Le nom du visiteur est requis").trim(),
  prenom_visiteur: z.string().optional(),
  numero_piece_identite: z.string().optional(),
  service_visite: z.string().min(2, "Le service visité est requis").trim(),
  motif_visite: z.string().optional(),
  observation: z.string().optional(),
});

export type VisiteurFormValues = z.infer<typeof visiteurSchema>;
