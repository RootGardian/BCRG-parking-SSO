import type { Metadata } from "next";
import { ParkingPage } from "@/features/admin/parking/pages/parking-page";

export const metadata: Metadata = {
  title: "Gestion du Parking & Fonctions ",
  description:
    "Administration des emplacements de parking sous-sol et du référentiel des fonctions institutionnelles BCRG.",
};

export default function Page() {
  return <ParkingPage />;
}
