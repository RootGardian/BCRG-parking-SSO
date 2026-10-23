import { z } from "zod";

/**
 * Schéma Zod pour la création d'une infrastructure de parking (OpenAPI: ParkingCreateRequest).
 */
export const parkingCreateSchema = z.object({
  nom: z
    .string()
    .min(2, "Le nom du parking doit comporter au moins 2 caractères")
    .trim(),
  adresse: z.string().trim().optional(),
  nombre_niveaux: z
    .number({ message: "Le nombre de niveaux est requis" })
    .min(0, "Le nombre de niveaux ne peut pas être négatif"),
  capacite_maximale: z
    .number({ message: "Capacité invalide" })
    .min(0, "La capacité maximale ne peut pas être négative")
    .optional(),
  capacites_niveaux: z
    .record(
      z.string(),
      z.number().min(0, "La capacité d'un niveau ne peut pas être négative"),
    )
    .optional(),
});

export type ParkingCreateFormValues = z.infer<typeof parkingCreateSchema>;

/**
 * Schéma Zod pour la modification d'un parking (OpenAPI: ParkingUpdateRequest).
 */
export const parkingUpdateSchema = parkingCreateSchema.partial();

export type ParkingUpdateFormValues = z.infer<typeof parkingUpdateSchema>;

/**
 * Schéma Zod pour l'ajout d'une place de parking visiteur.
 */
export const placeVisiteurSchema = z.object({
  id_parking: z.number().optional(),
  niveau_parking: z
    .string({ message: "Veuillez sélectionner ou renseigner le niveau" })
    .min(1, "Le niveau est requis")
    .trim(),
  numero_place: z
    .string()
    .min(
      2,
      "Le numéro de place doit comporter au moins 2 caractères (ex: V-01)",
    )
    .toUpperCase()
    .trim(),
});

export type PlaceVisiteurFormValues = z.infer<typeof placeVisiteurSchema>;

/**
 * Schéma Zod pour la création d'une fonction institutionnelle et sa place attribuée.
 */
export const fonctionCreateSchema = z.object({
  id_parking: z.number().optional(),
  nom_fonction: z
    .string()
    .min(2, "Le nom de la fonction doit comporter au moins 2 caractères")
    .trim(),
  niveau_parking: z
    .string({ message: "Veuillez sélectionner ou renseigner le niveau" })
    .min(1, "Le niveau est requis")
    .trim(),
  numero_place: z
    .string()
    .min(
      2,
      "Le numéro de place doit comporter au moins 2 caractères (ex: P-01)",
    )
    .toUpperCase()
    .trim(),
});

export type FonctionCreateFormValues = z.infer<typeof fonctionCreateSchema>;
