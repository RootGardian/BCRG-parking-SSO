import type { Metadata } from "next";
import { AuditPage } from "@/features/admin/audit/pages/audit-page";

export const metadata: Metadata = {
  title: "Journal d'Audit - BCRG Parking",
  description:
    "Historique et traçabilité des opérations administratives et de sécurité du parking sous-sol BCRG",
};

/**
 * Route Next.js App Router `/admin/audit`.
 */
export default function Page() {
  return <AuditPage />;
}
