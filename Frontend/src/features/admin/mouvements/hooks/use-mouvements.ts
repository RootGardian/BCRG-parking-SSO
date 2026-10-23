"use client";

import * as React from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import { mouvementsService } from "../services/mouvements.service";
import type { MouvementFilterInput, MouvementItem } from "../types";

/**
 * Custom hook de gestion réactive pour l'historique des mouvements du parking.
 */
export function useMouvements() {
  const [data, setData] = React.useState<MouvementItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<MouvementFilterInput>({
    search: "",
    date_debut: "",
    date_fin: "",
    type_entree: "all",
    statut: "all",
  });

  const [detailModal, setDetailModal] = React.useState<{
    isOpen: boolean;
    mouvement: MouvementItem | null;
  }>({
    isOpen: false,
    mouvement: null,
  });

  const [correctionModal, setCorrectionModal] = React.useState<{
    isOpen: boolean;
    mouvement: MouvementItem | null;
  }>({
    isOpen: false,
    mouvement: null,
  });

  const fetchMouvements = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await mouvementsService.getMouvements(
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
          "Erreur lors du chargement de l'historique des mouvements",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize]);

  React.useEffect(() => {
    fetchMouvements();
  }, [fetchMouvements]);

  const handleSearchChange = (q: string) => {
    setFilters((prev) => ({ ...prev, search: q }));
    setPage(1);
  };

  const handleCategoryFilter = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      type_entree: val as MouvementFilterInput["type_entree"],
    }));
    setPage(1);
  };

  const handleStatutFilter = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      statut: val as MouvementFilterInput["statut"],
    }));
    setPage(1);
  };

  const handleDateChange = (dateDebut?: string, dateFin?: string) => {
    setFilters((prev) => ({
      ...prev,
      date_debut: dateDebut || "",
      date_fin: dateFin || "",
    }));
    setPage(1);
  };

  const handleExportPDF = async () => {
    try {
      toast.info("Génération du rapport PDF en cours...");
      await mouvementsService.exportRapport("pdf", filters);
      toast.success("Rapport PDF de l'historique téléchargé !");
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Échec lors de l'exportation du rapport PDF"),
      );
    }
  };

  const handleExportCSV = async () => {
    try {
      toast.info("Génération du rapport CSV en cours...");
      await mouvementsService.exportRapport("csv", filters);
      toast.success("Rapport CSV de l'historique téléchargé !");
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Échec lors de l'exportation du rapport CSV"),
      );
    }
  };

  const openDetailModal = (mouvement: MouvementItem) => {
    setDetailModal({ isOpen: true, mouvement });
  };

  const closeDetailModal = () => {
    setDetailModal({ isOpen: false, mouvement: null });
  };

  const openCorrectionModal = (mouvement: MouvementItem) => {
    setCorrectionModal({ isOpen: true, mouvement });
  };

  const closeCorrectionModal = () => {
    setCorrectionModal({ isOpen: false, mouvement: null });
  };

  const handleSubmitCorrection = async (observation: string) => {
    if (!correctionModal.mouvement) return;
    try {
      await mouvementsService.correctionMouvement(
        correctionModal.mouvement.id,
        observation,
      );
      toast.success("Correction/observation enregistrée avec succès.");
      closeCorrectionModal();
      fetchMouvements();
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          "Impossible d'enregistrer la correction du passage.",
        ),
      );
    }
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
    refetch: fetchMouvements,
  };
}
