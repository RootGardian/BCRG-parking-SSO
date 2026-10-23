"use client";

import { UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Barre de navigation par onglets dédiés à l'Espace Agent Guichet (AgentNavigationTabs).
 *
 * Positionnée au centre de l'écran sur mobile, tablette et desktop, elle permet
 * à l'agent de sécurité de basculer instantanément entre "Mouvement Personnel"
 * et "Mouvement Visiteur" en un seul tap tactile sans ouvrir de menu latéral.
 */
export function AgentNavigationTabs() {
  const pathname = usePathname();

  // Ne pas encombrer l'écran sur la page de consultation du profil agent
  if (pathname.includes("/agent/profil")) {
    return null;
  }

  const isPersonnel =
    pathname.includes("/agent/mouvement-personnel") ||
    pathname === "/agent" ||
    pathname === "/agent/";
  const isVisiteur = pathname.includes("/agent/mouvement-visiteur");

  return (
    <nav
      aria-label="Navigation rapide guichet vigile"
      className="flex w-full items-center justify-center pt-1 pb-3 px-2 lg:hidden"
    >
      <div className="inline-flex w-full max-w-lg items-center gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-xs">
        <Link
          href="/agent/mouvement-personnel"
          className={cn(
            "flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-xs sm:text-sm font-brand font-bold transition-all select-none sm:h-12 sm:px-5",
            isPersonnel
              ? "bg-brand-green-700 text-white shadow-sm"
              : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
          )}
          aria-current={isPersonnel ? "page" : undefined}
        >
          <UserCheck className="size-4 shrink-0" />
          <span className="truncate">Mouvement Personnel</span>
        </Link>

        <Link
          href="/agent/mouvement-visiteur"
          className={cn(
            "flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-xs sm:text-sm font-brand font-bold transition-all select-none sm:h-12 sm:px-5",
            isVisiteur
              ? "bg-brand-green-700 text-white shadow-sm"
              : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
          )}
          aria-current={isVisiteur ? "page" : undefined}
        >
          <Users className="size-4 shrink-0" />
          <span className="truncate">Mouvement Visiteur</span>
        </Link>
      </div>
    </nav>
  );
}
