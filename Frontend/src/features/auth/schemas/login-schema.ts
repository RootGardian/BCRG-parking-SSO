import { z } from "zod";

/**
 * Schéma Zod de validation du formulaire de connexion.
 *
 * Exige :
 * - Un matricule au format BCRG valide ou chaîne d'au moins 4 caractères et qui contient uniquement des entiers
 * - Un mot de passe doit être complexe (au moins 8 caractères, une majuscule, une minuscule, un chiffre, un caractère spécial).
 */
export const loginSchema = z.object({
  matricule: z
    .string()
    .min(4, "Le matricule doit contenir au moins 4 caractères")
    // .regex(/^[0-9]+$/, "Le matricule doit contenir uniquement des entiers")
    .trim(),
  mot_de_passe: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(
      /[^a-zA-Z0-9]/,
      "Le mot de passe doit contenir au moins un caractère spécial",
    ),
});

/**
 * Type TypeScript inféré du schéma de connexion Zod.
 */
export type LoginInput = z.infer<typeof loginSchema>;
