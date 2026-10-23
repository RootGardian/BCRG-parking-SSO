import type { Metadata } from "next";
import { MesVehiculesPage } from "@/features/personnel/espace/pages/mes-vehicules-page";

export const metadata: Metadata = {
  title: "Mes Véhicules ",
  description:
    "Liste des véhicules enregistrés et autorisés à franchir la barrière du sous-sol de la BCRG.",
};

/**
 * Route Next.js App Router `/personnel/vehicules`.
 */
export default function Page() {
  return <MesVehiculesPage />;
}
