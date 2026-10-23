import type { Metadata } from "next";
import { UtilisateursPage } from "@/features/admin/utilisateurs/pages/utilisateurs-page";

export const metadata: Metadata = {
  title: "Gestion Utilisateurs & Rôles - BCRG Parking",
  description:
    "Administration des comptes utilisateurs, agents et superviseurs du système de parking BCRG",
};

/**
 * Route Next.js App Router `/admin/utilisateurs`.
 */
export default function Page() {
  return <UtilisateursPage />;
}
