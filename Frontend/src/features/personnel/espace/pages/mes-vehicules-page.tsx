"use client";

import { PageHeader } from "@/components/shared/page-header";
import { MesVehiculesCard } from "../components/mes-vehicules-card";
import { useEspacePersonnel } from "../hooks/use-espace-personnel";

/**
 * Vue dédiée aux véhicules autorisés du personnel (MesVehiculesPage).
 */
export function MesVehiculesPage() {
  const { vehicules, profil, isLoading } = useEspacePersonnel();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Véhicules Autorisés"
        description="Consultez la liste des véhicules enregistrés et habilités à franchir la barrière du sous-sol."
      />

      <MesVehiculesCard
        vehicules={vehicules.length > 0 ? vehicules : profil?.vehicules || []}
        isLoading={isLoading}
      />
    </div>
  );
}
