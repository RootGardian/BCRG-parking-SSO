"use client";

import { Activity, ArrowDownLeft, ArrowUpRight, LogOut } from "lucide-react";
import {
  KPICard,
  KPICardSkeleton,
  KPICardsGrid,
} from "@/components/shared/kpi-card";
import type { MouvementItem } from "../types";

interface MouvementsKPIsGridProps {
  data: MouvementItem[];
  total: number;
  isLoading: boolean;
}

/**
 * Grille d'indicateurs KPIs réactive pour l'historique des mouvements.
 */
export function MouvementsKPIsGrid({
  data,
  total,
  isLoading,
}: MouvementsKPIsGridProps) {
  if (isLoading) {
    return (
      <KPICardsGrid columns={4}>
        <KPICardSkeleton variant="blue" />
        <KPICardSkeleton variant="emerald" />
        <KPICardSkeleton variant="gold" />
        <KPICardSkeleton variant="amber" />
      </KPICardsGrid>
    );
  }

  const countSurSite = data.filter((m) => m.statut === "sur_site").length;
  const countSorties = data.filter((m) => Boolean(m.heure_depart)).length;
  const countVisiteurs = data.filter(
    (m) => m.type_entree === "visiteur",
  ).length;

  return (
    <KPICardsGrid columns={4}>
      <KPICard
        title="Total Passages Journalisés"
        value={total}
        icon={Activity}
        variant="emerald"
      />
      <KPICard
        title="Présents Dans le Parking"
        value={countSurSite}
        icon={ArrowDownLeft}
        variant="blue"
      />
      <KPICard
        title="Sorties Enregistrées"
        value={countSorties}
        icon={LogOut}
        variant="amber"
      />
      <KPICard
        title="Accès Visiteurs"
        value={countVisiteurs}
        icon={ArrowUpRight}
        variant="gold"
      />
    </KPICardsGrid>
  );
}
