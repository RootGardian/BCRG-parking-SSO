"use client";

import {
  Building2,
  Car,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Interface décrivant un élément de navigation dans la Sidebar.
 */
export interface NavItem {
  /** Titre affiché de l'élément de menu */
  title: string;
  /** Route cible Next.js (ex: '/admin/plaques') */
  href: string;
  /** Composant icône Lucide React associé */
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Liste par défaut des éléments de navigation de la Sidebar d'Administration.
 */
export const defaultNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Parking et Fonctions",
    href: "/admin/parking",
    icon: Building2,
  },
  {
    title: "Plaque (Flotte)",
    href: "/admin/plaques",
    icon: Car,
  },
  {
    title: "Personnel",
    href: "/admin/personnel",
    icon: Users,
  },
  {
    title: "Utilisateurs",
    href: "/admin/utilisateurs",
    icon: UserCheck,
  },
  {
    title: "Mouvements",
    href: "/admin/mouvements",
    icon: RefreshCw,
  },
  {
    title: "Journal d'Audit",
    href: "/admin/audit",
    icon: ShieldCheck,
  },
];

/**
 * Liste par défaut des éléments de navigation de la Sidebar Agent Guichet.
 */
export const agentNavItems: NavItem[] = [
  {
    title: "Mouvement Personnel",
    href: "/agent/mouvement-personnel",
    icon: Car,
  },
  {
    title: "Mouvement Visiteur",
    href: "/agent/mouvement-visiteur",
    icon: Users,
  },
];

/**
 * Liste par défaut des éléments de navigation de la Sidebar Espace Personnel.
 */
export const personnelNavItems: NavItem[] = [
  {
    title: "Mon Espace",
    href: "/personnel",
    icon: LayoutDashboard,
  },
  {
    title: "Mon Historique",
    href: "/personnel/historique",
    icon: RefreshCw,
  },
];

/**
 * Interface décrivant les propriétés du composant Sidebar.
 */
interface SidebarProps {
  /** Indique si le menu latéral est réduit sur grand écran */
  isCollapsed: boolean;
  /** Callback déclenché pour basculer le mode réduit/développé */
  onToggle: () => void;
  /** Liste personnalisée des éléments de navigation */
  navItems?: NavItem[];
  /** Indique si le tiroir mobile est ouvert */
  isMobileOpen?: boolean;
  /** Callback déclenché pour fermer le tiroir mobile */
  onCloseMobile?: () => void;
}

/**
 * Composant de menu latéral rétractable (Sidebar).
 *
 * Design conforme au thème institutionnel vert BCRG (#183c34) avec :
 * - Mode Desktop pliable (`hidden md:flex`) avec tooltips flottantes en mode réduit.
 * - Mode Mobile en tiroir coulissant (Drawer / Sheet) déclenché par le menu hamburger.
 * - Fermeture automatique au clic sur un lien ou sur appui de la touche Échap.
 */
export function Sidebar({
  isCollapsed,
  onToggle,
  navItems = defaultNavItems,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const rootHomeHref = navItems[0]?.href || "/";

  // Fermeture du menu mobile avec la touche Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. Sidebar Desktop classique (masquée sur mobile et tablette < lg)         */}
      {/* ========================================================================= */}
      <aside
        className={cn(
          "relative hidden lg:flex flex-col bg-[#183c34] text-[#ffffff] border-r border-[#1d433b]/40 transition-all duration-300 z-40 select-none",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        {/* Header avec Logo BCRG */}
        <div className="flex h-16 items-center justify-between px-3 border-b border-white/10">
          <Link
            href={rootHomeHref}
            className="flex items-center overflow-hidden py-1"
          >
            <Image
              src="/assets/logo/bcrg_logo_descri_inverse_288.png"
              alt="Logo BCRG"
              width={160}
              height={48}
              className={cn(
                "object-contain transition-all duration-300",
                isCollapsed ? "h-18 w-auto" : "h-11 w-auto max-w-[140px]",
              )}
              priority
            />
          </Link>

          {/* Bouton de bascule pliable desktop */}
          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-lg text-emerald-100/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? "Développer le menu" : "Réduire le menu"}
          >
            {isCollapsed ? (
              <ChevronRight className="size-5" />
            ) : (
              <ChevronLeft className="size-5" />
            )}
          </button>
        </div>

        {/* Liens de navigation Desktop */}
        <nav
          className={cn(
            "flex-1 space-y-1.5 p-3",
            isCollapsed ? "overflow-visible" : "overflow-y-auto",
          )}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all relative group",
                  isActive
                    ? "bg-white text-[#183c34] shadow-md font-semibold"
                    : "text-white/80 hover:text-white hover:bg-white/10",
                  isCollapsed && "justify-center px-0",
                )}
              >
                <Icon
                  className={cn(
                    "size-5 shrink-0 transition-colors",
                    isActive
                      ? "text-[#183c34]"
                      : "text-white/80 group-hover:text-white",
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.title}</span>}

                {/* Tooltip au survol en mode plié */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs font-semibold shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-[100] border border-white/10">
                    {item.title}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 size-2 rotate-45 bg-gray-900 border-l border-b border-white/10" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ========================================================================= */}
      {/* 2. Tiroir Mobile (Drawer / Sheet) sur smartphone et tablette < lg          */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Arrière-plan semi-transparent flouté */}
          <button
            type="button"
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 cursor-pointer border-none"
            onClick={onCloseMobile}
            aria-label="Fermer le menu de navigation"
          />

          {/* Panneau latéral mobile coulissant */}
          <aside className="relative z-50 flex flex-col w-72 max-w-[85vw] bg-[#183c34] text-white h-full shadow-2xl animate-in slide-in-from-left duration-300 select-none">
            {/* Header Mobile avec Logo et Bouton de fermeture */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
              <Link
                href={rootHomeHref}
                onClick={onCloseMobile}
                className="flex items-center overflow-hidden py-1"
              >
                <Image
                  src="/assets/logo/bcrg_logo_descri_inverse_288.png"
                  alt="Logo BCRG"
                  width={140}
                  height={44}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </Link>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Fermer le menu"
                className="p-2 rounded-lg text-emerald-100/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Liens de Navigation Mobile avec zone tactile >= 44px */}
            <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "flex items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-medium transition-all min-h-[44px]",
                      isActive
                        ? "bg-white text-[#183c34] shadow-md font-semibold"
                        : "text-white/80 hover:text-white hover:bg-white/10",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5 shrink-0",
                        isActive ? "text-[#183c34]" : "text-white/80",
                      )}
                    />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
