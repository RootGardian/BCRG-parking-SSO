import { z } from "zod";

/**
 * Schéma Zod pour la création d'un membre du personnel BCRG.
 */
export const personnelCreateSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères").trim(),
  prenom: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .trim(),
  matricule: z.string().min(1, "Le matricule est obligatoire").trim(),
  email: z.string().email("Format d'email invalide").optional().or(z.literal("")),
  fonction: z.string().optional(),
  numero_plaque: z.string().optional(),
});

export type PersonnelCreateFormValues = z.infer<typeof personnelCreateSchema>;

/**
 * Schéma Zod pour la modification d'un membre du personnel BCRG.
 */
export const personnelUpdateSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères").trim(),
  prenom: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .trim(),
  email: z.string().email("Format d'email invalide").optional().or(z.literal("")),
  fonction: z.string().optional(),
});

export type PersonnelUpdateFormValues = z.infer<typeof personnelUpdateSchema>;

/**
 * Schéma Zod pour l'ajout d'un véhicule rattaché au personnel.
 */
export const vehiculeAddSchema = z.object({
  numero_plaque: z
    .string()
    .min(3, "La plaque d'immatriculation doit comporter au moins 3 caractères")
    .trim(),
  marque: z.string().optional(),
  couleur: z.string().optional(),
  type: z.enum(["personnel", "visiteur"]),
});

export type VehiculeAddFormValues = z.infer<typeof vehiculeAddSchema>;
