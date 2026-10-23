import type { Metadata } from "next";
import { ProfilPage } from "@/features/auth/pages/profil-page";

export const metadata: Metadata = {
  title: "Mon Profil ",
  description:
    "Consultation des informations du compte agent et gestion de la sécurité.",
};

/**
 * Route Next.js App Router `/agent/profil`.
 *
 * Agit comme un pont de routage mince (Thin Routing Bridge) en déléguant le rendu
 * au composant métier `ProfilPage` situé dans `src/features/auth/pages/`.
 */
export default function Page() {
  return <ProfilPage />;
}
