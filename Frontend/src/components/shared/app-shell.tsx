"use client";

import * as React from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/shared/navbar";
import {
  agentNavItems,
  defaultNavItems,
  type NavItem,
  personnelNavItems,
  Sidebar,
} from "@/components/shared/sidebar";
import { ChangePasswordDialog } from "@/features/auth/components/change-password-dialog";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/shared/store/use-auth-store";
import type { RoleEnum } from "@/types/models";

/**
 * Interface décrivant les propriétés du composant AppShell.
 */
interface AppShellProps {
  /** Contenu principal de la page injecté au centre de la zone de travail */
  children: React.ReactNode;
  /** Nom complet optionnel de l'utilisateur connecté */
  userName?: string;
  /** Matricule unique optionnel de l'utilisateur connecté */
  userMatricule?: string;
  /** Rôle optionnel de l'utilisateur connecté */
  userRole?: RoleEnum;
  /** URL optionnelle de l'avatar de l'utilisateur */
  userAvatar?: string;
  /** Liste personnalisée des liens de navigation de la sidebar */
  navItems?: NavItem[];
}

/**
 * Composant d'infrastructure global (AppShell) pour l'application BCRG.
 */
export function AppShell({
  children,
  userName,
  userMatricule,
  userRole,
  userAvatar,
  navItems,
}: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const { fetchCurrentUser, handleLogout } = useAuth();
  const user = useAuthStore((state) => state.user);

  // Détection du paramètre d'accès non autorisé et affichage d'un toast d'avertissement
  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.search.includes("unauthorized=1")
    ) {
      toast.warning(
        "Accès restreint : Vous n'avez pas les habilitations requises pour accéder à cette zone. Vous avez été redirigé vers votre espace dédié.",
      );
      const url = new URL(window.location.href);
      url.searchParams.delete("unauthorized");
      window.history.replaceState(
        {},
        "",
        url.pathname + (url.search ? url.search : ""),
      );
    }
  }, []);

  // Hydratation de la session au montage si le store in-memory est vide
  React.useEffect(() => {
    if (!user) {
      fetchCurrentUser();
    }
  }, [user, fetchCurrentUser]);

  const displayName = user
    ? `${user.prenom} ${user.nom}`.trim()
    : userName || "Chargement...";
  const displayMatricule = user?.matricule || userMatricule || "----";
  const displayRole = user?.role || userRole || "admin";
  const displayAvatar = user?.avatar || userAvatar;

  const isForcePasswordChangeRequired = user?.doit_changer_mdp === true;

  const activeNavItems =
    navItems ||
    (displayRole === "agent"
      ? agentNavItems
      : displayRole === "personnel"
        ? personnelNavItems
        : defaultNavItems);

  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-background text-foreground relative">
      {/* Sidebar Latérale Collapsible Desktop + Drawer Mobile */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
        navItems={activeNavItems}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobileMenu}
      />

      {/* Zone Principale : Navbar + Contenu de la page */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          userName={displayName}
          userMatricule={displayMatricule}
          userRole={displayRole}
          userAvatar={displayAvatar}
          onLogout={handleLogout}
          onToggleMobileMenu={toggleMobileMenu}
        />

        {/* Zone de Scroll du Contenu de la Page */}
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 bg-muted/30">
          <div className="mx-auto space-y-5">{children}</div>
        </main>
      </div>

      {/* Modale de changement de mot de passe obligatoire (Forcée lors de la connexion initiale) */}
      <ChangePasswordDialog
        open={isForcePasswordChangeRequired}
        isForceModal={true}
      />
    </div>
  );
}
