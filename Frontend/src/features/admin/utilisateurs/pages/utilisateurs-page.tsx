"use client";

import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { FilterBar } from "@/components/shared/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { useAuthStore } from "@/shared/store/use-auth-store";
import { UtilisateurFormModal } from "../components/utilisateur-form-modal";
import { UtilisateursHeader } from "../components/utilisateurs-header";
import { UtilisateursKPIsGrid } from "../components/utilisateurs-kpis-grid";
import { UtilisateursTable } from "../components/utilisateurs-table";
import { useUtilisateurs } from "../hooks/use-utilisateurs";

/**
 * Vue principale de Gestion des Utilisateurs (UtilisateursPage).
 */
export function UtilisateursPage() {
  const { user } = useAuthStore();
  const isSupervision = user?.role === "supervision";

  const {
    data,
    parkings,
    total,
    page,
    pageSize,
    isLoading,
    filters,
    setPage,
    setPageSize,
    handleSearchChange,
    handleRoleFilter,
    isFormOpen,
    setIsFormOpen,
    selectedUser,
    openCreateModal,
    openEditModal,
    handleCreate,
    handleUpdate,
    confirmModal,
    openToggleStatusConfirm,
    openResetPasswordConfirm,
    closeConfirmModal,
    handleExecuteConfirmedAction,
    refetch,
  } = useUtilisateurs();

  const handleExportReport = () => {
    toast.success(
      "Génération et téléchargement du rapport des utilisateurs en cours...",
    );
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  const confirmUser = confirmModal.user;
  const isToggleStatus = confirmModal.type === "toggle_status";

  const confirmTitle = isToggleStatus
    ? confirmUser?.est_actif
      ? "Suspendre le compte utilisateur ?"
      : "Réactiver le compte utilisateur ?"
    : "Réinitialiser le mot de passe ?";

  const confirmDescription = isToggleStatus
    ? confirmUser?.est_actif
      ? `Êtes-vous sûr de vouloir suspendre le compte de ${confirmUser?.prenom} ${confirmUser?.nom} (Matricule: ${confirmUser?.matricule}) ? Cet utilisateur ne pourra plus se connecter.`
      : `Êtes-vous sûr de vouloir réactiver le compte de ${confirmUser?.prenom} ${confirmUser?.nom} (Matricule: ${confirmUser?.matricule}) ?`
    : `Êtes-vous sûr de vouloir réinitialiser le mot de passe de ${confirmUser?.prenom} ${confirmUser?.nom} ? Le nouveau mot de passe sera réinitialisé à son matricule (${confirmUser?.matricule}).`;

  return (
    <div className="space-y-5">
      {/* 1. En-tête de section */}
      <UtilisateursHeader
        isSupervision={isSupervision}
        onOpenCreateModal={openCreateModal}
        onExportReport={handleExportReport}
        onImportSuccess={refetch}
      />

      {/* 2. Grille KPI + Skeletons */}
      <UtilisateursKPIsGrid data={data} total={total} isLoading={isLoading} />

      {/* 3. Barre de Filtres & Recherche */}
      <FilterBar
        searchQuery={filters.search || ""}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Rechercher par nom, prénom ou matricule..."
        filterOptions={[
          { label: "Tous les rôles", value: "all" },
          { label: "Administrateur", value: "admin" },
          { label: "Supervision", value: "supervision" },
          { label: "Agent de sécurité", value: "agent" },
          { label: "Personnel", value: "personnel" },
        ]}
        selectedFilter={filters.role || "all"}
        onFilterChange={handleRoleFilter}
      />

      {/* 4. Tableau d'utilisateurs autonome */}
      <UtilisateursTable
        data={data}
        parkings={parkings}
        isLoading={isLoading}
        isSupervision={isSupervision}
        onEdit={openEditModal}
        onResetPassword={openResetPasswordConfirm}
        onToggleStatus={openToggleStatusConfirm}
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

      {/* Modale de Formulaire */}
      {!isSupervision && (
        <UtilisateurFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={selectedUser ? handleUpdate : handleCreate}
          initialData={selectedUser}
          parkings={parkings}
        />
      )}

      {/* Modale de Confirmation pour Actions Sensibles */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleExecuteConfirmedAction}
        title={confirmTitle}
        description={confirmDescription}
        confirmText={
          isToggleStatus
            ? confirmUser?.est_actif
              ? "Oui, suspendre"
              : "Oui, réactiver"
            : "Oui, réinitialiser"
        }
        variant={
          isToggleStatus
            ? confirmUser?.est_actif
              ? "destructive"
              : "default"
            : "warning"
        }
        isLoading={confirmModal.isSubmitting}
      />
    </div>
  );
}
