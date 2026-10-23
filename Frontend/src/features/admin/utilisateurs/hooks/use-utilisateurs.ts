"use client";

import * as React from "react";
import { toast } from "sonner";
import { parkingService } from "@/features/admin/parking/services/parking.service";
import type { ParkingItem } from "@/features/admin/parking/types";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import type { RoleEnum, Utilisateur } from "@/types/models";
import { utilisateursService } from "../services/utilisateurs.service";
import type { UtilisateurFilterInput, UtilisateurInput } from "../types";

export type ConfirmActionType = "toggle_status" | "reset_password" | null;

/**
 * Custom hook pour la gestion réactive de la section Utilisateurs avec modales de confirmation.
 */
export function useUtilisateurs() {
  const [data, setData] = React.useState<Utilisateur[]>([]);
  const [parkings, setParkings] = React.useState<ParkingItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<UtilisateurFilterInput>({
    search: "",
    role: "all",
  });

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<Utilisateur | null>(
    null,
  );

  // État de la modale de confirmation
  const [confirmModal, setConfirmModal] = React.useState<{
    type: ConfirmActionType;
    user: Utilisateur | null;
    isOpen: boolean;
    isSubmitting: boolean;
  }>({
    type: null,
    user: null,
    isOpen: false,
    isSubmitting: false,
  });

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await utilisateursService.getUtilisateurs(
        filters,
        page,
        pageSize,
      );
      setData(res.data);
      setTotal(res.total);
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          "Erreur lors du chargement de la liste des utilisateurs",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize]);

  React.useEffect(() => {
    fetchUsers();
    parkingService
      .getParkings()
      .then(setParkings)
      .catch(() => {});
  }, [fetchUsers]);

  const handleSearchChange = (q: string) => {
    setFilters((prev) => ({ ...prev, search: q }));
    setPage(1);
  };

  const handleRoleFilter = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      role: val as RoleEnum | "all",
    }));
    setPage(1);
  };

  const handleCreate = async (input: UtilisateurInput) => {
    try {
      await utilisateursService.createUtilisateur(input);
      toast.success("Utilisateur créé avec succès");
      setIsFormOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Erreur lors de la création de l'utilisateur"),
      );
    }
  };

  const handleUpdate = async (input: UtilisateurInput) => {
    if (!selectedUser) return;
    try {
      await utilisateursService.updateUtilisateur(
        selectedUser.matricule,
        input,
      );
      toast.success("Informations de l'utilisateur mises à jour");
      setIsFormOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Erreur lors de la modification"));
    }
  };

  const openToggleStatusConfirm = (user: Utilisateur) => {
    setConfirmModal({
      type: "toggle_status",
      user,
      isOpen: true,
      isSubmitting: false,
    });
  };

  const openResetPasswordConfirm = (user: Utilisateur) => {
    setConfirmModal({
      type: "reset_password",
      user,
      isOpen: true,
      isSubmitting: false,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      type: null,
      user: null,
      isOpen: false,
      isSubmitting: false,
    });
  };

  const handleExecuteConfirmedAction = async () => {
    const { type, user } = confirmModal;
    if (!type || !user) return;

    setConfirmModal((prev) => ({ ...prev, isSubmitting: true }));

    try {
      if (type === "toggle_status") {
        const newStatus = await utilisateursService.toggleUserStatus(
          user.matricule,
          user.est_actif,
        );
        toast.success(
          newStatus
            ? `Compte de ${user.prenom} ${user.nom} réactivé avec succès.`
            : `Compte de ${user.prenom} ${user.nom} suspendu.`,
        );
      } else if (type === "reset_password") {
        const newPass = await utilisateursService.resetPassword(user.matricule);
        toast.success(
          `Mot de passe réinitialisé pour ${user.prenom} ${user.nom} (remis à son matricule : ${newPass}).`,
        );
      }
      closeConfirmModal();
      fetchUsers();
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Erreur lors de l'exécution de l'action"),
      );
      setConfirmModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const openEditModal = (user: Utilisateur) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  return {
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
    refetch: fetchUsers,
  };
}
