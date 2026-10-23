import { z } from "zod";

/**
 * Schéma Zod pour la recherche/scan rapide au guichet vigile.
 */
export const scanSchema = z.object({
  query: z
    .string()
    .min(1, "Veuillez scanner un QR code ou saisir un matricule")
    .toUpperCase()
    .trim(),
});

export type ScanFormValues = z.infer<typeof scanSchema>;

/**
 * Schéma Zod pour la validation du mouvement d'entrée ou de sortie du personnel.
 */
export const mouvementPersonnelSchema = z.object({
  matricule_personnel: z
    .string()
    .min(1, "Matricule du personnel obligatoire")
    .trim(),
  numero_plaque: z.string().optional(),
  observation: z.string().optional(),
});

export type MouvementPersonnelFormValues = z.infer<
  typeof mouvementPersonnelSchema
>;
