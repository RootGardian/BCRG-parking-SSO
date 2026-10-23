import type { Metadata } from "next";
import { MonHistoriquePage } from "@/features/personnel/espace/pages/mon-historique-page";

export const metadata: Metadata = {
  title: "Mon Historique ",
  description:
    "Historique personnel des passages et stationnements au parking sous-sol de la BCRG.",
};

/**
 * Route Next.js App Router `/personnel/historique`.
 */
export default function Page() {
  return <MonHistoriquePage />;
}
