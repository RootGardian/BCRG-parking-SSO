import type { Metadata } from "next";
import { ProfilPage } from "@/features/auth/pages/profil-page";

export const metadata: Metadata = {
  title: "Mon Profil ",
  description:
    "Consultation des informations personnelles et gestion de la sécurité du compte personnel.",
};

/**
 * Route Next.js App Router `/personnel/profil`.
 *
 * Permet au personnel de consulter ses données et de mettre à jour son mot de passe.
 */
export default function Page() {
  return <ProfilPage />;
}
