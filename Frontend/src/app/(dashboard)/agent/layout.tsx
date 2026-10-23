"use client";

import * as React from "react";
import { AgentNavigationTabs } from "@/components/shared/agent-navigation-tabs";
import { AppShell } from "@/components/shared/app-shell";
import { useAuthStore } from "@/shared/store/use-auth-store";

/**
 * Layout racine de l'Espace Agent Guichet de Sécurité (`src/app/(dashboard)/agent/layout.tsx`).
 *
 * Encapsule toutes les sous-routes agent dans le conteneur réutilisable `AppShell`.
 * Intègre la barre d'onglets rapides centrée pour basculer en un tap entre
 * "Mouvement Personnel" et "Mouvement Visiteur" sur mobile, tablette et desktop.
 *
 * @param props Enfants composant les vues de l'agent
 * @returns Le conteneur d'interface agent avec Navigation par onglets
 */
export default function AgentLayout({
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
  const userRole = (mounted && user ? user.role : "agent") as
    | "admin"
    | "supervision"
    | "agent";
  const userAvatar = mounted && user ? user.avatar : undefined;

  return (
    <AppShell
      userName={userName}
      userMatricule={userMatricule}
      userRole={userRole}
      userAvatar={userAvatar}
    >
      <div className="w-full mx-auto space-y-3">
        {/* Onglets rapides centrés pour l'agent (Mouvement Personnel / Visiteur) */}
        <AgentNavigationTabs />
        {children}
      </div>
    </AppShell>
  );
}
