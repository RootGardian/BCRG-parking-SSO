import type { Metadata } from "next";
import { PlaquesPage } from "@/features/admin/plaques/pages/plaques-page";

export const metadata: Metadata = {
  title: "Gestion Flotte (Plaques) - BCRG Parking",
  description:
    "Répertoire et administration des véhicules autorisés dans le parking sous-sol de la BCRG",
};

/**
 * Route Next.js App Router `/admin/plaques`.
 */
export default function Page() {
  return <PlaquesPage />;
}
