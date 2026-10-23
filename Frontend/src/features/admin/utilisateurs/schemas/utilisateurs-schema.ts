import { z } from "zod";

/**
 * Schéma Zod de validation pour les formulaires de gestion des utilisateurs.
 */
export const utilisateurSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères").trim(),
  prenom: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .trim(),
  matricule: z
    .string()
    .min(1, "Le matricule est obligatoire")
    .trim(),
  role: z.enum(["admin", "supervision", "agent", "personnel"]),
  fonction: z.string().optional(),
  id_parking: z.number().nullable().optional(),
});

export type UtilisateurFormValues = z.infer<typeof utilisateurSchema>;
