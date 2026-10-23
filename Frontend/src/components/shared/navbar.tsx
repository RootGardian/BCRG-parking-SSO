"use client";

import { ChevronDown, LogOut, Menu, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import type { RoleEnum } from "@/types/models";

/**
 * Interface décrivant les propriétés du composant Navbar.
 */
interface NavbarProps {
  /** Nom et prénom de l'utilisateur actuellement connecté */
  userName?: string;
  /** Matricule identifiant de l'utilisateur connecté */
  userMatricule?: string;
  /** Rôle de l'utilisateur ('admin', 'supervision', 'agent', ou 'personnel') */
  userRole?: RoleEnum;
  /** URL optionnelle de l'image de profil de l'utilisateur */
  userAvatar?: string;
  /** Callback optionnel personnalisé lors du clic sur Déconnexion */
  onLogout?: () => void;
  /** Callback déclenché pour ouvrir ou fermer le menu latéral mobile */
  onToggleMobileMenu?: () => void;
}

/**
 * Composant de barre d'en-tête supérieure (Navbar).
 */
export function Navbar({
  userName = "Mamadou Barry",
  userMatricule = "BCRG-8842",
  userRole = "admin",
  userAvatar,
  onLogout,
  onToggleMobileMenu,
}: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 sm:px-6 backdrop-blur-xs select-none">
      {/* Gauche : Bouton Menu Hamburger (mobile & tablette < lg) + Affichage du Rôle actif */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Ouvrir le menu de navigation"
            className="flex lg:hidden p-2 rounded-lg text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <Menu className="size-5" />
          </button>
        )}
        <StatusBadge type="role" value={userRole} />
      </div>

      {/* Droite : Dropdown Utilisateur (Nom, Matricule, Profil, Déconnexion) */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-accent transition-colors">
            <Avatar name={userName} src={userAvatar} size="md" />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-semibold text-foreground font-brand leading-none">
                {userName}
              </span>
              <span className="text-xs text-muted-foreground font-mono mt-1">
                {userMatricule}
              </span>
            </div>
            <ChevronDown className="size-4 text-muted-foreground ml-1" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="right" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-0.5">
                <span className="font-semibold text-foreground text-sm">
                  {userName}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  Matricule : {userMatricule}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                const profilePath =
                  userRole === "personnel"
                    ? "/personnel/profil"
                    : userRole === "agent"
                      ? "/agent/profil"
                      : "/admin/profil";
                router.push(profilePath);
              }}
            >
              <User className="size-4 text-muted-foreground" />
              <span>Mon profil</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="size-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
