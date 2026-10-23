import type { Metadata } from "next";
import { MouvementsPage } from "@/features/admin/mouvements/pages/mouvements-page";

export const metadata: Metadata = {
  title: "Historique des Mouvements",
  description:
    "Journalisation des entrées et sorties au parking sous-sol BCRG, filtres d'audit et export des rapports.",
};

export default function Page() {
  return <MouvementsPage />;
}
