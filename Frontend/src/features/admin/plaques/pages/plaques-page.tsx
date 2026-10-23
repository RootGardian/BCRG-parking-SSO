"use client";

import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { FilterBar } from "@/components/shared/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { useAuthStore } from "@/shared/store/use-auth-store";
import { ImportCSVModal } from "../components/import-csv-modal";
import { PlaqueFormModal } from "../components/plaque-form-modal";
import { PlaquesHeader } from "../components/plaques-header";
import { PlaquesKPIsGrid } from "../components/plaques-kpis-grid";
import { PlaquesTable } from "../components/plaques-table";
import { usePlaques } from "../hooks/use-plaques";

/**
 * Vue principale de Gestion de la Flotte Automobile (PlaquesPage).
 */
export function PlaquesPage() {
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
    isFormOpen,
    setIsFormOpen,
    isImportOpen,
    setIsImportOpen,
    selectedPlaque,
    openCreateModal,
    openEditModal,
    handleCreate,
    handleUpdate,
    confirmModal,
    openDeleteConfirm,
    handleConfirmDelete,
    closeConfirmModal,
    refetch,
  } = usePlaques();

  const handleExportReport = () => {
    toast.success(
      "Génération et téléchargement du rapport de la flotte en cours...",
    );
  };

  const totalPages = Math.ceil(total / pageSize) || 1;
  const vConfirm = confirmModal.vehicule;

  return (
    <div className="space-y-5">
      {/* 1. En-tête de section */}
      <PlaquesHeader
        isSupervision={isSupervision}
        onOpenCreateModal={openCreateModal}
        onOpenImportModal={() => setIsImportOpen(true)}
        onExportReport={handleExportReport}
      />

      {/* 2. Grille d'Indicateurs KPIs + Skeletons */}
      <PlaquesKPIsGrid data={data} total={total} isLoading={isLoading} />

      {/* 3. Barre de Filtres & Recherche */}
      <FilterBar
        searchQuery={filters.search || ""}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Rechercher par plaque, modèle ou nom du propriétaire..."
        filterOptions={[
          { label: "Toutes les catégories", value: "all" },
          { label: "Personnel BCRG", value: "personnel" },
          { label: "Visiteurs ", value: "visiteur" },
        ]}
        selectedFilter={filters.type_vehicule || "all"}
        onFilterChange={handleCategoryFilter}
      />

      {/* 4. Tableau de données autonome */}
      <PlaquesTable
        data={data}
        isLoading={isLoading}
        isSupervision={isSupervision}
        onEdit={openEditModal}
        onDelete={openDeleteConfirm}
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

      {/* Modales Métier */}
      {!isSupervision && (
        <>
          <PlaqueFormModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={selectedPlaque ? handleUpdate : handleCreate}
            initialData={selectedPlaque}
          />
          <ImportCSVModal
            isOpen={isImportOpen}
            onClose={() => setIsImportOpen(false)}
            onSuccess={refetch}
          />
          <ConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={closeConfirmModal}
            onConfirm={handleConfirmDelete}
            title="Retirer ce véhicule de la flotte ?"
            description={`Êtes-vous sûr de vouloir retirer le véhicule ${vConfirm?.numero_plaque} (${vConfirm?.marque_modele || "Sans modèle"}) de la flotte ?`}
            confirmText="Oui, retirer"
            variant="destructive"
            isLoading={confirmModal.isSubmitting}
          />
        </>
      )}
    </div>
  );
}
