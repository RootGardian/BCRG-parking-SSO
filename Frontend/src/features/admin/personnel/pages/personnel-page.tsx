"use client";

import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { FilterBar } from "@/components/shared/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { useAuthStore } from "@/shared/store/use-auth-store";
import { PersonnelFormModal } from "../components/personnel-form-modal";
import { PersonnelHeader } from "../components/personnel-header";
import { PersonnelKPIsGrid } from "../components/personnel-kpis-grid";
import { PersonnelTable } from "../components/personnel-table";
import { QRCodeViewModal } from "../components/qrcode-view-modal";
import { usePersonnel } from "../hooks/use-personnel";

/**
 * Vue principale de Gestion du Personnel BCRG (PersonnelPage).
 */
export function PersonnelPage() {
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
    handleStatusFilter,
    isFormOpen,
    setIsFormOpen,
    selectedPersonnel,
    openCreateModal,
    openEditModal,
    handleCreate,
    handleUpdate,
    confirmModal,
    openDeleteConfirm,
    handleConfirmDelete,
    closeConfirmModal,
    qrModal,
    openQrModal,
    closeQrModal,
    handleDownloadQRCodesZip,
    refetch,
  } = usePersonnel();

  const handleExportReport = () => {
    toast.success(
      "Génération et téléchargement du rapport du personnel en cours...",
    );
  };

  const totalPages = Math.ceil(total / pageSize) || 1;
  const pConfirm = confirmModal.personnel;

  return (
    <div className="space-y-5">
      {/* 1. En-tête de section */}
      <PersonnelHeader
        isSupervision={isSupervision}
        onOpenCreateModal={openCreateModal}
        onExportQRCodesZip={handleDownloadQRCodesZip}
        onExportReport={handleExportReport}
        onImportSuccess={refetch}
      />

      {/* 2. Grille KPI + Skeletons */}
      <PersonnelKPIsGrid data={data} total={total} isLoading={isLoading} />

      {/* 3. Barre de Filtres & Recherche */}
      <FilterBar
        searchQuery={filters.search || ""}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Rechercher par nom, prénom, matricule ou fonction..."
        filterOptions={[
          { label: "Tous les statuts", value: "all" },
          { label: "Actifs uniquement", value: "actif" },
          { label: "Inactifs uniquement", value: "inactif" },
        ]}
        selectedFilter={filters.est_actif || "all"}
        onFilterChange={handleStatusFilter}
      />

      {/* 4. Tableau du personnel */}
      <PersonnelTable
        data={data}
        isLoading={isLoading}
        isSupervision={isSupervision}
        onEdit={openEditModal}
        onViewQrCode={openQrModal}
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

      {/* Modale de Formulaire Création / Édition */}
      {!isSupervision && (
        <PersonnelFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={selectedPersonnel ? handleUpdate : handleCreate}
          initialData={selectedPersonnel}
        />
      )}

      {/* Modale d'Affichage QR Code */}
      <QRCodeViewModal
        isOpen={qrModal.isOpen}
        onClose={closeQrModal}
        matricule={qrModal.personnel?.matricule}
        nomComplet={
          qrModal.personnel
            ? `${qrModal.personnel.prenom} ${qrModal.personnel.nom}`
            : undefined
        }
        fonction={qrModal.personnel?.fonction}
      />

      {/* Modale de Confirmation de Désactivation */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Désactiver le compte du personnel ?"
        description={`Êtes-vous sûr de vouloir désactiver ${pConfirm?.prenom} ${pConfirm?.nom} (Matricule: ${pConfirm?.matricule}) ? L'historique et les accès seront conservés.`}
        confirmText="Oui, désactiver"
        variant="destructive"
        isLoading={confirmModal.isSubmitting}
      />
    </div>
  );
}
