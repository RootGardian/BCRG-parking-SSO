"use client";

import { ArrowDownRight, ArrowUpRight, History } from "lucide-react";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import type { MouvementItem } from "@/features/admin/mouvements/types";

/**
 * Formate un timestamp ISO en date et heure lisible en français.
 */
function formatDateHeure(isoString?: string | null): string {
  if (!isoString) return "----";
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

interface MonHistoriqueTableProps {
  data: MouvementItem[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

/**
 * Tableau de consultation de l'historique personnel des passages (MonHistoriqueTable).
 */
export function MonHistoriqueTable({
  data,
  totalItems,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  isLoading = false,
}: MonHistoriqueTableProps) {
  return (
    <div className="rounded-xl bg-card border border-border p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-secondary text-foreground">
            <History className="size-5" />
          </div>
          <div>
            <h3 className="font-brand font-bold text-sm text-foreground">
              Mon Historique de mouvements
            </h3>
            <p className="text-xs text-muted-foreground">
              Relevé officiel de mes mouvements
            </p>
          </div>
        </div>

        <span className="text-xs font-medium text-muted-foreground">
          {totalItems} passage{totalItems > 1 ? "s" : ""} enregistré
          {totalItems > 1 ? "s" : ""}
        </span>
      </div>

      {/* Table responsive */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-2.5 px-3">Date d&apos;Entrée</th>
                <th className="py-2.5 px-3">Date de Sortie</th>
                <th className="py-2.5 px-3">Véhicule (Plaque)</th>
                <th className="py-2.5 px-3">Catégorie</th>
                <th className="py-2.5 px-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton placeholders
                  <tr key={i} className="animate-pulse">
                    <td className="py-3 px-3">
                      <div className="h-3.5 w-28 bg-muted rounded" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-3.5 w-28 bg-muted rounded" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-3.5 w-20 bg-muted rounded" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-3.5 w-24 bg-muted rounded" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="h-3.5 w-16 bg-muted rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground italic text-xs"
                  >
                    Aucun historique de passage enregistré à ce jour.
                  </td>
                </tr>
              ) : (
                data.map((mvt) => {
                  const isPresent = !mvt.heure_depart;
                  return (
                    <tr
                      key={mvt.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <ArrowUpRight className="size-3.5 text-brand-green-700 dark:text-emerald-400" />
                          <span>{formatDateHeure(mvt.heure_arrivee)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {mvt.heure_depart ? (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <ArrowDownRight className="size-3.5 text-amber-600 dark:text-amber-400" />
                            <span>{formatDateHeure(mvt.heure_depart)}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-brand-green-700 dark:text-emerald-400 font-semibold italic">
                            Stationnement en cours
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-foreground">
                        {mvt.vehicule?.numero_plaque || "----"}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground capitalize">
                        {mvt.type_entree || "personnel"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <StatusBadge
                          type="statut"
                          value={isPresent ? "sur_site" : "hors_site"}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-border bg-card">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
