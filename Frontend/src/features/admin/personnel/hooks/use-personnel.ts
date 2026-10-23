"use client";

import * as React from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import { personnelService } from "../services/personnel.service";
import type {
  PersonnelCreateInput,
  PersonnelFilterInput,
  PersonnelItem,
  PersonnelUpdateInput,
} from "../types";

/**
 * Custom hook de gestion réactive pour la section Gestion du Personnel BCRG.
 */
export function usePersonnel() {
  const [data, setData] = React.useState<PersonnelItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<PersonnelFilterInput>({
    search: "",
    est_actif: "all",
  });

  // États des modales
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedPersonnel, setSelectedPersonnel] =
    React.useState<PersonnelItem | null>(null);

  const [qrModal, setQrModal] = React.useState<{
    isOpen: boolean;
    personnel: PersonnelItem | null;
  }>({
    isOpen: false,
    personnel: null,
  });

  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    personnel: PersonnelItem | null;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    personnel: null,
    isSubmitting: false,
  });

  const fetchPersonnel = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await personnelService.getPersonnel(filters, page, pageSize);
      setData(res.data);
      setTotal(res.total);
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          "Erreur lors du chargement de la liste du personnel",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize]);

  React.useEffect(() => {
    fetchPersonnel();
  }, [fetchPersonnel]);

  const handleSearchChange = (q: string) => {
    setFilters((prev) => ({ ...prev, search: q }));
    setPage(1);
  };

  const handleStatusFilter = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      est_actif: val as "all" | "actif" | "inactif",
    }));
    setPage(1);
  };

  const handleCreate = async (input: PersonnelCreateInput) => {
    try {
      await personnelService.createPersonnel(input);
      toast.success("Membre du personnel créé avec succès");
      setIsFormOpen(false);
      fetchPersonnel();
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Erreur lors de la création du personnel"),
      );
    }
  };

  const handleUpdate = async (input: PersonnelUpdateInput) => {
    if (!selectedPersonnel) return;
    try {
      await personnelService.updatePersonnel(
        selectedPersonnel.matricule,
        input,
      );
      toast.success("Informations du personnel mises à jour");
      setIsFormOpen(false);
      setSelectedPersonnel(null);
      fetchPersonnel();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Erreur lors de la modification"));
    }
  };

  const openDeleteConfirm = (p: PersonnelItem) => {
    setConfirmModal({
      isOpen: true,
      personnel: p,
      isSubmitting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.personnel) return;
    setConfirmModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await personnelService.deletePersonnel(confirmModal.personnel.matricule);
      toast.success(
        `Membre du personnel ${confirmModal.personnel.prenom} ${confirmModal.personnel.nom} désactivé.`,
      );
      setConfirmModal({ isOpen: false, personnel: null, isSubmitting: false });
      fetchPersonnel();
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Échec lors de la désactivation du personnel"),
      );
      setConfirmModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const openQrModal = (p: PersonnelItem) => {
    setQrModal({ isOpen: true, personnel: p });
  };

  const closeQrModal = () => {
    setQrModal({ isOpen: false, personnel: null });
  };

  const handleDownloadQRCodesZip = async () => {
    try {
      toast.info("Génération de l'archive ZIP des QR Codes en cours...");
      await personnelService.downloadQRCodesZip();
      toast.success("Archive ZIP des QR Codes téléchargée !");
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          "Erreur lors de l'exportation ZIP des QR Codes",
        ),
      );
    }
  };

  const openCreateModal = () => {
    setSelectedPersonnel(null);
    setIsFormOpen(true);
  };

  const openEditModal = (p: PersonnelItem) => {
    setSelectedPersonnel(p);
    setIsFormOpen(true);
  };

  return {
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
    closeConfirmModal: () =>
      setConfirmModal({ isOpen: false, personnel: null, isSubmitting: false }),
    qrModal,
    openQrModal,
    closeQrModal,
    handleDownloadQRCodesZip,
    refetch: fetchPersonnel,
  };
}
