"use client";

import * as React from "react";
import { toast } from "sonner";

import type { MouvementItem } from "@/features/admin/mouvements/types";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import type { Vehicule } from "@/types/models";

import { mouvementPersonnelService } from "../services/mouvement-personnel.service";
import type { ParkingStatus, PersonnelScanResult } from "../types";

export interface PendingPersonnelExit {
  id?: number;
  matricule: string;
  plaque?: string;
  nomComplet?: string;
}

/**
 * Extrait un matricule propre à partir du texte décodé du QR Code.
 * Prend en charge les formats bruts ("BCRG-003"), JSON ('{"matricule":"BCRG-003"}') et URLs.
 */
function extractMatriculeFromQr(rawText: string): string {
  const trimmed = rawText.trim();
  if (!trimmed) return "";

  // 1. Parsing JSON éventuel
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed.matricule === "string" && parsed.matricule.trim()) {
        return parsed.matricule.trim();
      }
      if (
        typeof parsed.matricule_personnel === "string" &&
        parsed.matricule_personnel.trim()
      ) {
        return parsed.matricule_personnel.trim();
      }
    } catch {
      // Ignorer l'erreur de parsing JSON
    }
  }

  // 2. Format URL éventuel (ex: https://.../personnel/BCRG-003 ou /qrcode)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      const segments = url.pathname.split("/").filter(Boolean);
      if (segments.length > 0) {
        const last = segments[segments.length - 1];
        if (last.toLowerCase() === "qrcode" && segments.length > 1) {
          return segments[segments.length - 2];
        }
        return last;
      }
    } catch {
      // Ignorer l'erreur d'URL
    }
  }

  return trimmed;
}

/**
 * Custom hook de gestion du guichet vigile — Mouvement Personnel.
 */
export function useMouvementPersonnel() {
  const [parkingStatus, setParkingStatus] = React.useState<ParkingStatus>({
    presents_sur_site: 0,
    capacite_max: 0,
    taux_occupation: 0,
  });
  const [isLoadingStatus, setIsLoadingStatus] = React.useState(true);

  const [scanQuery, setScanQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [scanResult, setScanResult] =
    React.useState<PersonnelScanResult | null>(null);
  const [selectedVehicule, setSelectedVehicule] =
    React.useState<Vehicule | null>(null);
  const [observation, setObservation] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Filtres de liste & Pagination
  const [statutFilter, setStatutFilter] = React.useState<string>("all");
  const [searchFilter, setSearchFilter] = React.useState<string>("");
  const [dateDebut, setDateDebut] = React.useState<string>("");
  const [dateFin, setDateFin] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [totalPages, setTotalPages] = React.useState<number>(1);

  const [mouvementsList, setMouvementsList] = React.useState<MouvementItem[]>(
    [],
  );
  const [isLoadingList, setIsLoadingList] = React.useState(true);

  // Modal de confirmation de sortie
  const [pendingExit, setPendingExit] =
    React.useState<PendingPersonnelExit | null>(null);

  // État d'ouverture de la modale de scan QR Code
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);

  const scanInputRef = React.useRef<HTMLInputElement>(null);

  // Chargement des mouvements du personnel et du statut du parking
  const fetchStatusAndList = React.useCallback(
    async (isBackground = false) => {
      if (!isBackground) {
        setIsLoadingList(true);
        setIsLoadingStatus(true);
      }
      try {
        const [status, mouvementsRes] = await Promise.all([
          mouvementPersonnelService.getParkingStatus(),
          mouvementPersonnelService.getPersonnelMouvements({
            page: currentPage,
            limit: pageSize,
            statut: statutFilter,
            search: searchFilter,
            date_debut: dateDebut || undefined,
            date_fin: dateFin || undefined,
          }),
        ]);
        setParkingStatus(status);
        setMouvementsList(mouvementsRes.data);
        setTotalItems(mouvementsRes.meta.total);
        setTotalPages(mouvementsRes.meta.totalPages);
      } catch (err: unknown) {
        console.error("Erreur mise à jour guichet personnel:", err);
      } finally {
        if (!isBackground) {
          setIsLoadingList(false);
          setIsLoadingStatus(false);
        }
      }
    },
    [currentPage, pageSize, statutFilter, searchFilter, dateDebut, dateFin],
  );

  React.useEffect(() => {
    fetchStatusAndList(false);

    // Rafraîchissement modéré en arrière-plan toutes les 60 secondes pour éviter les clignotements
    const interval = setInterval(() => {
      fetchStatusAndList(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchStatusAndList]);

  const handleClearScan = React.useCallback(() => {
    setScanQuery("");
    setScanResult(null);
    setSelectedVehicule(null);
    setObservation("");
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

  const handleSearch = React.useCallback(
    async (queryToSearch?: string) => {
      const q = queryToSearch || scanQuery;
      if (!q.trim()) return;

      setIsSearching(true);
      try {
        const result = await mouvementPersonnelService.searchPersonnel(q);
        if (!result) {
          toast.error(
            `Aucun membre du personnel trouvé avec le matricule/nom "${q}".`,
          );
          setScanResult(null);
          setSelectedVehicule(null);
        } else {
          setScanResult(result);
          setSelectedVehicule(
            result.vehicule_selectionne ||
              (result.vehicules && result.vehicules.length > 0
                ? result.vehicules[0]
                : null),
          );
          toast.success(`Personnel trouvé : ${result.prenom} ${result.nom}`);
        }
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err, "Erreur lors de la recherche"));
        setScanResult(null);
      } finally {
        setIsSearching(false);
      }
    },
    [scanQuery],
  );

  /**
   * Traite le résultat d'un scan réussi depuis la caméra mobile ou webcam.
   */
  const handleQrScanSuccess = React.useCallback(
    async (decodedText: string) => {
      setIsScannerOpen(false);
      const matricule = extractMatriculeFromQr(decodedText);
      if (!matricule) {
        toast.error("Format de QR Code non reconnu.");
        return;
      }

      setScanQuery(matricule);
      await handleSearch(matricule);
    },
    [handleSearch],
  );

  // Valider une ENTRÉE personnel
  const handleValiderEntree = async () => {
    if (!scanResult) return;
    setIsSubmitting(true);
    try {
      await mouvementPersonnelService.enregistrerEntree({
        type_entree: "personnel",
        matricule_personnel: scanResult.matricule,
        numero_plaque: selectedVehicule?.numero_plaque,
        observation: observation || undefined,
      });

      toast.success(
        `ENTRÉE validée pour ${scanResult.prenom} ${scanResult.nom} (${scanResult.matricule}).`,
      );
      handleClearScan();
      fetchStatusAndList(false);
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Erreur lors de la validation de l'entrée"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demander confirmation avant SORTIE
  const requestValiderSortie = (exitData: PendingPersonnelExit) => {
    setPendingExit(exitData);
  };

  // Confirmer l'exécution de la SORTIE
  const confirmValiderSortie = async () => {
    if (!pendingExit) return;
    setIsSubmitting(true);
    try {
      await mouvementPersonnelService.enregistrerSortie({
        matricule_personnel: pendingExit.matricule,
        id_passage: pendingExit.id,
        observation: observation || undefined,
      });

      toast.success(
        `SORTIE validée pour le matricule ${pendingExit.matricule}.`,
      );
      setPendingExit(null);
      handleClearScan();
      fetchStatusAndList(false);
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Erreur lors de la validation de la sortie"),
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
    parkingStatus,
    isLoadingStatus,
    scanQuery,
    setScanQuery,
    isSearching,
    scanResult,
    selectedVehicule,
    setSelectedVehicule,
    observation,
    setObservation,
    isSubmitting,
    mouvementsList,
    totalItems,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    isLoadingList,
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
    isScannerOpen,
    setIsScannerOpen,
    handleQrScanSuccess,
    scanInputRef,
    handleSearch,
    handleClearScan,
    handleValiderEntree,
    requestValiderSortie,
    confirmValiderSortie,
    refetch: () => fetchStatusAndList(false),
  };
}
