"use client";

import { Award, Car, UserCheck, Users } from "lucide-react";
import {
  KPICard,
  KPICardSkeleton,
  KPICardsGrid,
} from "@/components/shared/kpi-card";
import type { PersonnelItem } from "../types";

interface PersonnelKPIsGridProps {
  data: PersonnelItem[];
  total: number;
  isLoading: boolean;
}

/**
 * Grille KPI réactive pour la section Personnel BCRG (PersonnelKPIsGrid).
 */
export function PersonnelKPIsGrid({
  data,
  total,
  isLoading,
}: PersonnelKPIsGridProps) {
  if (isLoading) {
    return (
      <KPICardsGrid columns={4}>
        <KPICardSkeleton variant="emerald" />
        <KPICardSkeleton variant="gold" />
        <KPICardSkeleton variant="blue" />
        <KPICardSkeleton variant="success" />
      </KPICardsGrid>
    );
  }

  const countCadres = data.filter(
    (p) =>
      p.fonction &&
      /gouverneur|directeur|dg|ds|auditeur|conseiller|chef/i.test(p.fonction),
  ).length;

  const totalVehicles = data.reduce(
    (acc, p) => acc + (p.vehicules?.length || 0),
    0,
  );

  const countActifs = data.filter((p) => p.est_actif).length;

  return (
    <KPICardsGrid columns={4}>
      <KPICard
        title="Total Personnel BCRG"
        value={total}
        icon={Users}
        variant="emerald"
      />
      <KPICard
        title="Direction & Cadres"
        value={countCadres}
        icon={Award}
        variant="blue"
      />
      <KPICard
        title="Véhicules Rattachés"
        value={totalVehicles}
        icon={Car}
        variant="amber"
      />
      <KPICard
        title="Comptes Actifs"
        value={countActifs}
        icon={UserCheck}
        variant="gold"
      />
    </KPICardsGrid>
  );
}
