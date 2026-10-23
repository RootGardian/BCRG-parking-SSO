import type { Metadata } from "next";
import { EspacePersonnelPage } from "@/features/personnel/espace/pages/espace-personnel-page";

export const metadata: Metadata = {
  title: "Mon Espace Personnel",
  description:
    "Espace dédié aux agents et cadres de la BCRG : badge QR code d'accès, statut de présence en temps réel et historique.",
};

/**
 * Route Next.js App Router `/personnel`.
 *
 * Agit comme un pont de routage mince (Thin Routing Bridge) vers `EspacePersonnelPage`.
 */
export default function Page() {
  return <EspacePersonnelPage />;
}
