"use client";

import * as React from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import { auditService } from "../services/audit.service";
import type {
  AuditActionCategory,
  AuditLog,
  AuditLogFilterInput,
} from "../types";

/**
 * Custom hook pour la gestion réactive du journal d'audit administratif.
 */
export function useAuditLogs() {
  const [data, setData] = React.useState<AuditLog[]>([]);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [isLoading, setIsLoading] = React.useState(true);

  // État des filtres
  const [filters, setFilters] = React.useState<AuditLogFilterInput>({
    search: "",
    category: "all",
  });

  // Log sélectionné pour la modale de détails
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null);

  /**
   * Charge la liste des enregistrements d'audit selon la pagination et les filtres actifs.
   */
  const fetchLogs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await auditService.getAuditLogs(page, pageSize, filters);
      setData(res.data);
      setTotal(res.meta.total);
      setTotalPages(res.meta.total_pages || 1);
    } catch (error) {
      toast.error(
        `Erreur lors du chargement de l'audit : ${getApiErrorMessage(error)}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filters]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  /**
   * Gestionnaire de saisie de recherche avec réinitialisation à la page 1.
   */
  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setPage(1);
  };

  /**
   * Gestionnaire de sélection de catégorie d'action.
   */
  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: category as AuditActionCategory,
    }));
    setPage(1);
  };

  /**
   * Ouvre la modale d'inspection détaillée d'un log.
   */
  const openDetailsModal = (log: AuditLog) => {
    setSelectedLog(log);
  };

  /**
   * Ferme la modale d'inspection détaillée.
   */
  const closeDetailsModal = () => {
    setSelectedLog(null);
  };

  /**
   * Génération et export des logs en format CSV téléchargeable.
   */
  const handleExportCsv = () => {
    if (data.length === 0) {
      toast.error("Aucune donnée d'audit à exporter.");
      return;
    }

    try {
      const headers = [
        "ID",
        "Date Action",
        "Action",
        "Cible",
        "Matricule Auteur",
        "Nom Auteur",
        "Détails",
      ];

      const rows = data.map((log) => [
        log.id,
        log.date_action,
        `"${log.action.replace(/"/g, '""')}"`,
        `"${log.cible.replace(/"/g, '""')}"`,
        `"${log.utilisateur.matricule.replace(/"/g, '""')}"`,
        `"${log.utilisateur.nom.replace(/"/g, '""')}"`,
        `"${(log.details || "").replace(/"/g, '""')}"`,
      ]);

      const csvContent = [
        headers.join(";"),
        ...rows.map((r) => r.join(";")),
      ].join("\r\n");

      const blob = new Blob([`\ufeff${csvContent}`], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `journal_audit_bcrg_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Le journal d'audit a été exporté avec succès.");
    } catch {
      toast.error("Erreur lors de la génération du fichier d'audit CSV.");
    }
  };

  return {
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
    refetch: fetchLogs,
  };
}
