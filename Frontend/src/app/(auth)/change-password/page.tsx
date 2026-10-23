import type { Metadata } from "next";
import { ChangePasswordPage } from "@/features/auth/pages/change-password-page";

export const metadata: Metadata = {
  title: "Changement de Mot de Passe",
  description:
    "Définition d'un nouveau mot de passe sécurisé pour l'accès au parking sous-sol de la BCRG.",
};

/**
 * Route Next.js App Router `/change-password`.
 *
 * Agit comme un pont de routage mince (Thin Routing Bridge) vers `ChangePasswordPage`.
 */
export default function Page() {
  return <ChangePasswordPage />;
}
