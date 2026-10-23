"use client";

import { PageHeader } from "@/components/shared/page-header";
import { CategoryDistributionChart } from "../components/category-distribution-chart";
import { DashboardFilterBar } from "../components/dashboard-filter-bar";
import { HourlyTrafficChart } from "../components/hourly-traffic-chart";
import { OccupancyKPIsGrid } from "../components/occupancy-kpis-grid";
import { RecentMovementsTable } from "../components/recent-movements-table";
import { useAdminDashboard } from "../hooks/use-admin-dashboard";

/**
 * Page métier réelle du Tableau de Bord Administration & Supervision (AdminDashboardPage).
 *
 * Assemble l'en-tête, le filtre de dates réactif, la grille de cartes KPIs d'occupation,
 * les graphiques analytiques Recharts et l'aperçu des derniers mouvements.
 */
export function AdminDashboardPage() {
  const { data, isLoading, dateDebut, dateFin, handleDateRangeChange } =
    useAdminDashboard();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tableau de Bord & Analytics"
        description="Aperçu synthétique du taux d'occupation, des flux d'affluence et des mouvements sur le parking sous-sol."
      />

      {/* Barre de filtrage réactive par plage de dates */}
      <DashboardFilterBar
        dateDebut={dateDebut}
        dateFin={dateFin}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Cartes KPI Synthétiques (adaptées à la date) */}
      <OccupancyKPIsGrid stats={data?.stats} isLoading={isLoading} />

      {/* Section Graphiques analytiques (adaptés à la date) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HourlyTrafficChart data={data?.traffic} isLoading={isLoading} />
        </div>
        <div>
          <CategoryDistributionChart
            data={data?.distribution}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Tableau des 5 derniers mouvements récents (adaptés à la date) */}
      <RecentMovementsTable
        movements={data?.recentMovements}
        isLoading={isLoading}
      />
    </div>
  );
}
