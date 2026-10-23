import type { Metadata } from "next";
import { AdminDashboardPage } from "@/features/admin/dashboard/pages/admin-dashboard-page";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Tableau de bord et statistiques du parking sous-sol de la Banque Centrale de la République de Guinée",
};

/**
 * Route Next.js App Router `/admin`.
 */
export default function Page() {
  return <AdminDashboardPage />;
}
