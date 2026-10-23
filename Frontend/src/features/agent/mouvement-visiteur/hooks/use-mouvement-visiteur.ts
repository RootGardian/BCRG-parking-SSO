"use client";

import * as React from "react";
import { toast } from "sonner";

import type { MouvementItem } from "@/features/admin/mouvements/types";
import { getApiErrorMessage } from "@/shared/utils/error-handler";

import { mouvementVisiteurService } from "../services/mouvement-visiteur.service";
import type {
  MouvementVisiteurEntreeInput,
  VisiteurScanResult,
} from "../types";

export interface PendingVisiteurExit {
  id: number;
  plaque?: string;
  observation?: string;
}

/**
 * Custom hook réactif pour la gestion des mouvements visiteurs au guichet vigile.
 */
export function useMouvementVisiteur() {
  const [mouvementsList, setMouvementsList] = React.useState<MouvementItem[]>(
    [],
  );
  const [isLoadingList, setIsLoadingList] = React.useState(true);

  // Recherche par Plaque et Détection de Statut Sur Site
  const [scanQuery, setScanQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [scanResult, setScanResult] = React.useState<VisiteurScanResult | null>(
    null,
  );

  const scanInputRef = React.useRef<HTMLInputElement>(null);

  // Filtres de liste & Pagination
  const [statutFilter, setStatutFilter] = React.useState<string>("all");
  const [searchFilter, setSearchFilter] = React.useState<string>("");
  const [dateDebut, setDateDebut] = React.useState<string>("");
  const [dateFin, setDateFin] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [totalPages, setTotalPages] = React.useState<number>(1);

  // Modal de confirmation de sortie
  const [pendingExit, setPendingExit] =
    React.useState<PendingVisiteurExit | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Charger les mouvements visiteurs
  const fetchVisiteurMouvements = React.useCallback(
    async (isBackground = false) => {
      if (!isBackground) {
        setIsLoadingList(true);
      }
      try {
        const res = await mouvementVisiteurService.getVisiteurMouvements({
          page: currentPage,
          limit: pageSize,
          statut: statutFilter,
          search: searchFilter,
          date_debut: dateDebut || undefined,
          date_fin: dateFin || undefined,
        });
        setMouvementsList(res.data);
        setTotalItems(res.meta.total);
        setTotalPages(res.meta.totalPages);
      } catch (err: unknown) {
        console.error("Erreur récupération mouvements visiteurs:", err);
      } finally {
        if (!isBackground) {
          setIsLoadingList(false);
        }
      }
    },
    [currentPage, pageSize, statutFilter, searchFilter, dateDebut, dateFin],
  );

  React.useEffect(() => {
    fetchVisiteurMouvements(false);

    // Rafraîchissement modéré en arrière-plan toutes les 60 secondes
    const interval = setInterval(() => {
      fetchVisiteurMouvements(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchVisiteurMouvements]);

  // Réinitialiser la recherche
  const handleClearScan = React.useCallback(() => {
    setScanQuery("");
    setScanResult(null);
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, []);

  // Raccourci Clavier F2 (Scan / Focus) & Escape (Réinitialiser)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2" || e.code === "F2") {
        e.preventDefault();
        e.stopPropagation();
        if (scanInputRef.current) {
          scanInputRef.current.focus();
          scanInputRef.current.select();
        }
      } else if (e.key === "Escape") {
        handleClearScan();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [handleClearScan]);

  // Rechercher un véhicule par plaque d'immatriculation
  const handleSearch = async (queryToSearch?: string) => {
    const q = queryToSearch || scanQuery;
    if (!q.trim()) return;

    setIsSearching(true);
    try {
      const result = await mouvementVisiteurService.searchVisiteurPlaque(q);
      if (result) {
        setScanResult(result);
        if (result.est_sur_site) {
          toast.info(
            `Véhicule ${result.numero_plaque} actuellement sur site. Action requise : Sortie.`,
          );
        } else {
          toast.success(
            `Véhicule ${result.numero_plaque} hors site. Prêt pour l'enregistrement d'entrée.`,
          );
        }
      }
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Erreur lors de la recherche de la plaque"),
      );
    } finally {
      setIsSearching(false);
    }
  };

  // Valider une ENTRÉE visiteur
  const handleValiderEntreeVisiteur = async (
    input: MouvementVisiteurEntreeInput,
  ) => {
    setIsSubmitting(true);
    try {
      await mouvementVisiteurService.enregistrerEntreeVisiteur(input);
      toast.success(
        `Accès Visiteur validé pour la plaque ${input.numero_plaque.toUpperCase()}.`,
      );
      handleClearScan();
      fetchVisiteurMouvements(false);
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          "Échec de l'enregistrement de l'entrée du visiteur",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demander confirmation avant SORTIE
  const requestValiderSortieVisiteur = (
    idPassage: number,
    numeroPlaque?: string,
    observation?: string,
  ) => {
    setPendingExit({ id: idPassage, plaque: numeroPlaque, observation });
  };

  // Confirmer l'exécution de la SORTIE visiteur
  const confirmValiderSortieVisiteur = async () => {
    if (!pendingExit) return;
    setIsSubmitting(true);
    try {
      await mouvementVisiteurService.enregistrerSortieVisiteur({
        id_passage: pendingExit.id,
        numero_plaque: pendingExit.plaque,
        observation: pendingExit.observation,
      });
      toast.success(
        `SORTIE Visiteur validée pour la plaque ${pendingExit.plaque || ""}.`,
      );
      setPendingExit(null);
      handleClearScan();
      fetchVisiteurMouvements(false);
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          "Échec de l'enregistrement de la sortie du visiteur",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchFilterChange = React.useCallback((q: string) => {
    setSearchFilter(q);
    setCurrentPage(1);
  }, []);

  const handleStatutFilterChange = React.useCallback((s: string) => {
    setStatutFilter(s);
    setCurrentPage(1);
  }, []);

  const handleDateDebutChange = React.useCallback((d: string) => {
    setDateDebut(d);
    setCurrentPage(1);
  }, []);

  const handleDateFinChange = React.useCallback((d: string) => {
    setDateFin(d);
    setCurrentPage(1);
  }, []);

  const handleResetFilters = React.useCallback(() => {
    setSearchFilter("");
    setStatutFilter("all");
    setDateDebut("");
    setDateFin("");
    setCurrentPage(1);
  }, []);

  return {
    mouvementsList,
    totalItems,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    isLoadingList,
    scanQuery,
    setScanQuery,
    isSearching,
    scanResult,
    scanInputRef,
    handleSearch,
    handleClearScan,
    isSubmitting,
    statutFilter,
    setStatutFilter: handleStatutFilterChange,
    searchFilter,
    setSearchFilter: handleSearchFilterChange,
    dateDebut,
    setDateDebut: handleDateDebutChange,
    dateFin,
    setDateFin: handleDateFinChange,
    handleResetFilters,
    pendingExit,
    setPendingExit,
    handleValiderEntreeVisiteur,
    requestValiderSortieVisiteur,
    confirmValiderSortieVisiteur,
    refetch: () => fetchVisiteurMouvements(false),
  };
}
