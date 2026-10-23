"use client";

import * as React from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import type { Vehicule } from "@/types/models";
import { plaquesService } from "../services/plaques.service";
import type { PlaqueInput, VehiculeFilterInput } from "../types";

/**
 * Custom hook pour la gestion réactive de la section Flotte / Plaques.
 */
export function usePlaques() {
  const [data, setData] = React.useState<Vehicule[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<VehiculeFilterInput>({
    search: "",
    type_vehicule: "all",
  });

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [selectedPlaque, setSelectedPlaque] = React.useState<Vehicule | null>(
    null,
  );

  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    vehicule: Vehicule | null;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    vehicule: null,
    isSubmitting: false,
  });

  const fetchPlaques = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await plaquesService.getPlaques(filters, page, pageSize);
      setData(res.data);
      setTotal(res.total);
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          "Erreur lors du chargement de la flotte de véhicules",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize]);

  React.useEffect(() => {
    fetchPlaques();
  }, [fetchPlaques]);

  const handleSearchChange = (q: string) => {
    setFilters((prev) => ({ ...prev, search: q }));
    setPage(1);
  };

  const handleCategoryFilter = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      type_vehicule: val as VehiculeFilterInput["type_vehicule"],
    }));
    setPage(1);
  };

  const handleCreate = async (input: PlaqueInput) => {
    try {
      await plaquesService.createPlaque(input);
      toast.success("Véhicule enregistré dans la flotte avec succès");
      setIsFormOpen(false);
      fetchPlaques();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Erreur lors de l'enregistrement"));
    }
  };

  const handleUpdate = async (input: PlaqueInput) => {
    if (!selectedPlaque) return;
    try {
      await plaquesService.updatePlaque(selectedPlaque.id, input);
      toast.success("Informations du véhicule mises à jour");
      setIsFormOpen(false);
      setSelectedPlaque(null);
      fetchPlaques();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Erreur lors de la modification"));
    }
  };

  const openDeleteConfirm = (vehicule: Vehicule) => {
    setConfirmModal({
      isOpen: true,
      vehicule,
      isSubmitting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.vehicule) return;
    setConfirmModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await plaquesService.deletePlaque(confirmModal.vehicule.id);
      toast.success(
        `Véhicule ${confirmModal.vehicule.numero_plaque} retiré de la flotte.`,
      );
      setConfirmModal({ isOpen: false, vehicule: null, isSubmitting: false });
      fetchPlaques();
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Impossible de supprimer le véhicule"),
      );
      setConfirmModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const openEditModal = (vehicule: Vehicule) => {
    setSelectedPlaque(vehicule);
    setIsFormOpen(true);
  };

  const openCreateModal = () => {
    setSelectedPlaque(null);
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
    closeConfirmModal: () =>
      setConfirmModal({ isOpen: false, vehicule: null, isSubmitting: false }),
    refetch: fetchPlaques,
  };
}
