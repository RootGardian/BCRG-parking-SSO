"use client";

import * as React from "react";
import { dashboardService } from "../services/dashboard.service";
import type { DashboardAnalytics } from "../types";

/**
 * Custom hook pour la récupération et le rafraîchissement réactif
 * des données analytiques du Dashboard Administration & Supervision avec filtrage par date.
 */
export function useAdminDashboard() {
  const [data, setData] = React.useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dateDebut, setDateDebut] = React.useState<string>("");
  const [dateFin, setDateFin] = React.useState<string>("");

  const fetchAnalytics = React.useCallback(
    async (isBackground = false, debut = dateDebut, fin = dateFin) => {
      if (!isBackground) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const result = await dashboardService.getAnalytics(debut, fin);
        setData(result);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les métriques du tableau de bord.",
        );
      } finally {
        if (!isBackground) {
          setIsLoading(false);
        }
      }
    },
    [dateDebut, dateFin],
  );

  React.useEffect(() => {
    fetchAnalytics(false, dateDebut, dateFin);

    // Rafraîchissement automatique en arrière-plan toutes les 30 secondes
    const interval = setInterval(() => {
      fetchAnalytics(true, dateDebut, dateFin);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAnalytics, dateDebut, dateFin]);

  const handleDateRangeChange = (debut?: string, fin?: string) => {
    const newDebut = debut || "";
    const newFin = fin || "";
    setDateDebut(newDebut);
    setDateFin(newFin);
  };

  return {
    data,
    isLoading,
    error,
    dateDebut,
    dateFin,
    handleDateRangeChange,
    refetch: () => fetchAnalytics(false, dateDebut, dateFin),
  };
}
