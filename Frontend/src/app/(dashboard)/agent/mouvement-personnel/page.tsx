import type { Metadata } from "next";
import { MouvementPersonnelPage } from "@/features/agent/mouvement-personnel/pages/mouvement-personnel-page";

export const metadata: Metadata = {
  title: "Guichet Mouvement Personnel ",
  description:
    "Scan de badge QR Code et contrôle d'accès du personnel au parking sous-sol BCRG.",
};

export default function Page() {
  return <MouvementPersonnelPage />;
}
