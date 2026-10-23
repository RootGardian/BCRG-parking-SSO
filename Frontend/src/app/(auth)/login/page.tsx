import type { Metadata } from "next";
import { LoginPage } from "@/features/auth/pages/login-page";

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Page de connexion au système de gestion du parking de la BCRG",
};

/**
 * Route Next.js App Router `/login`.
 *
 * Agit comme un pont de routage mince (Thin Routing Bridge) en déléguant le rendu
 * au composant métier `LoginPage` situé dans `src/features/auth/pages/`.
 */
export default function Page() {
  return <LoginPage />;
}
