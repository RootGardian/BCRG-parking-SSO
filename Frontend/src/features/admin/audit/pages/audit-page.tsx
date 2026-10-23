"use client";

import { Pagination } from "@/components/shared/pagination";
import { useAuthStore } from "@/shared/store/use-auth-store";
import { AuditDetailsModal } from "../components/audit-details-modal";
import { AuditFilters } from "../components/audit-filters";
import { AuditHeader } from "../components/audit-header";
import { AuditKPIsGrid } from "../components/audit-kpis-grid";
import { AuditTable } from "../components/audit-table";
import { useAuditLogs } from "../hooks/use-audit-logs";

/**
 * Page principale du Journal d'Audit de Sécurité (AuditPage).
 * Accessible depuis le menu d'administration (/admin/audit).
 */
export function AuditPage() {
  const { user } = useAuthStore();
  const isSupervision = user?.role === "supervision";

  const {
    data,
    total,
    totalPages,
    page,
    pageSize,
    isLoading,
    filters,
    selectedLog,
    setPage,
    setPageSize,
    handleSearchChange,
    handleCategoryChange,
    openDetailsModal,
    closeDetailsModal,
    handleExportCsv,
    refetch,
  } = useAuditLogs();

  return (
    <div className="space-y-5">
      {/* 1. En-tête de section avec actions */}
      <AuditHeader
        isSupervision={isSupervision}
        onRefresh={refetch}
        onExport={handleExportCsv}
      />

      {/* 2. Grille des KPIs de sécurité & traçabilité */}
      <AuditKPIsGrid data={data} total={total} isLoading={isLoading} />

      {/* 3. Barre de recherche et filtres de catégorie */}
      <AuditFilters
        searchQuery={filters.search || ""}
        onSearchChange={handleSearchChange}
        selectedCategory={filters.category || "all"}
        onCategoryChange={handleCategoryChange}
      />

      {/* 4. Tableau d'audit paginé */}
      <AuditTable
        data={data}
        isLoading={isLoading}
        onViewDetails={openDetailsModal}
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

      {/* 6. Modale d'inspection approfondie */}
      <AuditDetailsModal
        isOpen={Boolean(selectedLog)}
        onClose={closeDetailsModal}
        log={selectedLog}
      />
    </div>
  );
}
