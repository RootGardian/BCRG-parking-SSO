"use client";

import * as React from "react";
import { AppShell } from "@/components/shared/app-shell";
import { useAuthStore } from "@/shared/store/use-auth-store";

/**
 * Layout racine de l'Espace Administration & Supervision (`src/app/(dashboard)/admin/layout.tsx`).
 *
 * Encapsule toutes les sous-routes d'administration (`/admin`, `/admin/plaques`, `/admin/utilisateurs`, `/admin/mouvements`, `/admin/profil`)
 * dans le composant de structure réutilisable `AppShell`.
 *
 * Récupère dynamiquement le profil utilisateur connecté depuis le store Zustand `useAuthStore`.
 *
 * @param props Enfants composant les vues d'administration
 * @returns Le conteneur d'administration avec Sidebar et Navbar
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const userName =
    mounted && user ? `${user.prenom} ${user.nom}`.trim() : undefined;
  const userMatricule = mounted && user ? user.matricule : undefined;
  const userRole = mounted && user ? user.role : undefined;
  const userAvatar = mounted && user ? user.avatar : undefined;

  return (
    <AppShell
      userName={userName}
      userMatricule={userMatricule}
      userRole={userRole}
      userAvatar={userAvatar}
    >
      {children}
    </AppShell>
  );
}
