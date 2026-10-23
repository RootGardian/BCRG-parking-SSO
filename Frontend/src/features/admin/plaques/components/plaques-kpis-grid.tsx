"use client";

import { Car } from "lucide-react";
import {
  KPICard,
  KPICardSkeleton,
  KPICardsGrid,
} from "@/components/shared/kpi-card";
import type { Vehicule } from "@/types/models";

interface PlaquesKPIsGridProps {
  data: Vehicule[];
  total: number;
  isLoading: boolean;
}

/**
 * Grille des métriques synthétiques de la flotte automobile (PlaquesKPIsGrid) avec gestion des squelettes de chargement (Skeleton).
 */
export function PlaquesKPIsGrid({
  data,
  total,
  isLoading,
}: PlaquesKPIsGridProps) {
  if (isLoading) {
    return (
      <KPICardsGrid columns={3}>
        <KPICardSkeleton variant="emerald" />
        <KPICardSkeleton variant="blue" />
        <KPICardSkeleton variant="gold" />
      </KPICardsGrid>
    );
  }

  const countPersonnel = data.filter(
    (v) => v.type_vehicule === "personnel",
  ).length;
  const countVisiteurs = data.filter(
    (v) => v.type_vehicule === "visiteur",
  ).length;

  return (
    <KPICardsGrid columns={3}>
      <KPICard
        title="Flotte Totale Enregistrée"
        value={total}
        description="Véhicules répertoriés"
        icon={Car}
        variant="emerald"
      />
      <KPICard
        title="Véhicules Personnel BCRG"
        value={countPersonnel}
        description="Cadres & Employés"
        icon={Car}
        variant="blue"
      />
      <KPICard
        title="Visiteurs "
        value={countVisiteurs}
        description="Immatriculations externes"
        icon={Car}
        variant="amber"
      />
    </KPICardsGrid>
  );
}
