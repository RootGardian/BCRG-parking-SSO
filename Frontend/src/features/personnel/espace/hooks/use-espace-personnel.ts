"use client";

import * as React from "react";
import type { MouvementItem } from "@/features/admin/mouvements/types";
import type { Vehicule } from "@/types/models";
import { espacePersonnelService } from "../services/espace-personnel.service";
import type {
  MaPlaceParking,
  MonProfilPersonnel,
  MonStatutPresence,
  VehiculePersonnelItem,
} from "../types";

/**
 * Hook personnalisé encapsulant la récupération et l'état des données de l'Espace Personnel.
 */
export function useEspacePersonnel() {
  const [profil, setProfil] = React.useState<MonProfilPersonnel | null>(null);
  const [qrCode, setQrCode] = React.useState<string | null>(null);
  const [statut, setStatut] = React.useState<MonStatutPresence>({
    statut: "hors_site",
    sur_site: false,
  });
  const [place, setPlace] = React.useState<MaPlaceParking>(null);
  const [vehicules, setVehicules] = React.useState<
    (Vehicule | VehiculePersonnelItem)[]
  >([]);

  // Historique & pagination
  const [historique, setHistorique] = React.useState<MouvementItem[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [totalItems, setTotalItems] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const fetchData = React.useCallback(
    async (isSilent = false) => {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const [
          profilRes,
          qrCodeRes,
          statutRes,
          placeRes,
          vehiculesRes,
          historiqueRes,
        ] = await Promise.all([
          espacePersonnelService.getMonProfil(),
          espacePersonnelService.getMonQrCode(),
          espacePersonnelService.getMonStatut(),
          espacePersonnelService.getMaPlace(),
          espacePersonnelService.getMesVehicules(),
          espacePersonnelService.getMonHistorique({
            page: currentPage,
            limit: pageSize,
          }),
        ]);

        if (profilRes) setProfil(profilRes);
        if (qrCodeRes) setQrCode(qrCodeRes);
        if (statutRes) setStatut(statutRes);
        if (placeRes) setPlace(placeRes);

        // Déduction intelligente des véhicules : endpoint dédié, ou véhicule présent dans le statut, ou profil
        let resolvedVehicules: (Vehicule | VehiculePersonnelItem)[] =
          Array.isArray(vehiculesRes) ? vehiculesRes : [];
        if (
          resolvedVehicules.length === 0 &&
          statutRes?.vehicule?.numero_plaque
        ) {
          resolvedVehicules = [statutRes.vehicule];
        } else if (
          resolvedVehicules.length === 0 &&
          Array.isArray(profilRes?.vehicules) &&
          profilRes.vehicules.length > 0
        ) {
          resolvedVehicules = profilRes.vehicules;
        }
        setVehicules(resolvedVehicules);

        // Historique avec tolérance absolue
        if (historiqueRes?.data) {
          setHistorique(historiqueRes.data);
          const count = historiqueRes.meta?.total ?? historiqueRes.data.length;
          setTotalItems(count);
          setTotalPages(
            historiqueRes.meta?.totalPages ||
              historiqueRes.meta?.total_pages ||
              Math.ceil(count / pageSize) ||
              1,
          );
        }
      } catch (err: unknown) {
        console.error("Erreur lors du chargement de l'espace personnel:", err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, pageSize],
  );

  React.useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  return {
    profil,
    qrCode,
    statut,
    place,
    vehicules,
    historique,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    isLoading,
    isRefreshing,
    refetch: () => fetchData(true),
  };
}
