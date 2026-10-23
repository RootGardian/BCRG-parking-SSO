import type { Metadata } from "next";
import { PersonnelPage } from "@/features/admin/personnel/pages/personnel-page";

export const metadata: Metadata = {
  title: "Gestion du Personnel",
  description:
    "Répertoire du personnel BCRG, attribution des fonctions, badges QR Code et véhicules autorisés au parking.",
};

export default function Page() {
  return <PersonnelPage />;
}
