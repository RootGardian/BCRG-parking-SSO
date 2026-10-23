"use client";

import * as React from "react";
import { AppShell } from "@/components/shared/app-shell";
import { personnelNavItems } from "@/components/shared/sidebar";
import { useAuthStore } from "@/shared/store/use-auth-store";

/**
 * Layout racine de l'Espace Personnel (`src/app/(dashboard)/personnel/layout.tsx`).
 *
 * Encapsule toutes les sous-routes du personnel (`/personnel`, `/personnel/vehicules`, `/personnel/historique`, `/personnel/profil`)
 * dans le conteneur `AppShell` avec la barre de navigation dédiée au personnel.
 */
export default function PersonnelLayout({
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
  const userRole = (mounted && user ? user.role : "personnel") as
    | "admin"
    | "supervision"
    | "agent"
    | "personnel";
  const userAvatar = mounted && user ? user.avatar : undefined;

  return (
    <AppShell
      userName={userName}
      userMatricule={userMatricule}
      userRole={userRole}
      userAvatar={userAvatar}
      navItems={personnelNavItems}
    >
      {children}
    </AppShell>
  );
}
