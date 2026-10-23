import { z } from "zod";

/**
 * Schéma Zod de validation de la recherche / scan QR code du personnel.
 */
export const personnelScanSchema = z.object({
  query: z
    .string()
    .min(1, "Veuillez scanner un QR Code ou saisir un matricule")
    .trim(),
});

export type PersonnelScanFormValues = z.infer<typeof personnelScanSchema>;
