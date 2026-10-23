"use client";

import { PageHeader } from "@/components/shared/page-header";
import { MonHistoriqueTable } from "../components/mon-historique-table";
import { useEspacePersonnel } from "../hooks/use-espace-personnel";

/**
 * Vue dédiée à l'historique personnel des passages (MonHistoriquePage).
 */
export function MonHistoriquePage() {
  const {
    historique,
    currentPage,
    setCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    isLoading,
  } = useEspacePersonnel();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon Historique de Stationnement"
        description="Consultez l'ensemble de vos franchissements et relevés d'entrées/sorties du parking sous-sol."
      />

      <MonHistoriqueTable
        data={historique}
        totalItems={totalItems}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
      />
    </div>
  );
}
