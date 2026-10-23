"use client";

import { Pagination } from "@/components/shared/pagination";
import { useAuthStore } from "@/shared/store/use-auth-store";
import { MouvementCorrectionModal } from "../components/mouvement-correction-modal";
import { MouvementDetailModal } from "../components/mouvement-detail-modal";
import { MouvementsFilterBar } from "../components/mouvements-filter-bar";
import { MouvementsHeader } from "../components/mouvements-header";
import { MouvementsKPIsGrid } from "../components/mouvements-kpis-grid";
import { MouvementsTable } from "../components/mouvements-table";
import { useMouvements } from "../hooks/use-mouvements";

/**
 * Vue principale d'Historique et Registre des Mouvements (MouvementsPage).
 */
export function MouvementsPage() {
  const { user } = useAuthStore();
  const isSupervision = user?.role === "supervision";

  const {
    data,
    total,
    page,
    pageSize,
    isLoading,
    filters,
    setPage,
    setPageSize,
    handleSearchChange,
    handleCategoryFilter,
    handleStatutFilter,
    handleDateChange,
    handleExportPDF,
    handleExportCSV,
    detailModal,
    openDetailModal,
    closeDetailModal,
    correctionModal,
    openCorrectionModal,
    closeCorrectionModal,
    handleSubmitCorrection,
  } = useMouvements();

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-5">
      {/* 1. En-tête de section */}
      <MouvementsHeader
        isSupervision={isSupervision}
        onExportPDF={handleExportPDF}
        onExportCSV={handleExportCSV}
      />

      {/* 2. Grille KPIs + Skeletons */}
      <MouvementsKPIsGrid data={data} total={total} isLoading={isLoading} />

      {/* 3. Barre de filtrage avancée */}
      <MouvementsFilterBar
        filters={filters}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryFilter}
        onStatutChange={handleStatutFilter}
        onDateChange={handleDateChange}
      />

      {/* 4. Tableau de données réactif */}
      <MouvementsTable
        data={data}
        isLoading={isLoading}
        isSupervision={isSupervision}
        onViewDetail={openDetailModal}
        onCorrection={openCorrectionModal}
      />

      {/* 5. Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* Modale de Détails d'un Passage */}
      <MouvementDetailModal
        isOpen={detailModal.isOpen}
        onClose={closeDetailModal}
        mouvement={detailModal.mouvement}
      />

      {/* Modale de Correction d'un Passage */}
      {!isSupervision && (
        <MouvementCorrectionModal
          isOpen={correctionModal.isOpen}
          onClose={closeCorrectionModal}
          onSubmit={handleSubmitCorrection}
          mouvement={correctionModal.mouvement}
        />
      )}
    </div>
  );
}
