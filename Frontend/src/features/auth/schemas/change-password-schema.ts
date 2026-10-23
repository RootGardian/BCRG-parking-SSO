import { z } from "zod";

/**
 * Schéma de validation Zod pour le changement de mot de passe.
 */
export const changePasswordSchema = z
  .object({
    nouveau_mot_de_passe: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
      .regex(/[A-Z]/, "Le mot de passe doit inclure au moins une majuscule.")
      .regex(/[a-z]/, "Le mot de passe doit inclure au moins une minuscule.")
      .regex(/[0-9]/, "Le mot de passe doit inclure au moins un chiffre."),
    confirmation_mot_de_passe: z
      .string()
      .min(1, "Veuillez confirmer le nouveau mot de passe."),
  })
  .refine(
    (data) => data.nouveau_mot_de_passe === data.confirmation_mot_de_passe,
    {
      message: "Les mots de passe ne correspondent pas.",
      path: ["confirmation_mot_de_passe"],
    },
  );

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
