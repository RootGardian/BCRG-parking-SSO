import type { Metadata } from "next";
import { MouvementVisiteurPage } from "@/features/agent/mouvement-visiteur/pages/mouvement-visiteur-page";

export const metadata: Metadata = {
  title: "Guichet Mouvement Visiteur ",
  description:
    "Enregistrement et contrôle des accès visiteurs au parking sous-sol BCRG.",
};

export default function Page() {
  return <MouvementVisiteurPage />;
}
