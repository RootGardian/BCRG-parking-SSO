"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Inbox } from "lucide-react";
import type * as React from "react";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Interface décrivant la configuration d'une colonne de DataTable.
 * @template T Type de données de la ligne du tableau
 */
export interface Column<T> {
  /** Clé unique identifiant la propriété dans l'objet de données */
  key: string;
  /** Libellé affiché dans l'en-tête de la colonne */
  header: string;
  /** Fonction personnalisée pour afficher le rendu de la cellule */
  accessor?: (row: T) => React.ReactNode;
  /** Indique si la colonne prend en charge le tri interactif */
  sortable?: boolean;
  /** Alignement du texte dans la colonne */
  align?: "left" | "center" | "right";
  /** Classes CSS supplémentaires appliquées à la colonne */
  className?: string;
}

/**
 * Interface décrivant les propriétés du composant générique DataTable.
 * @template T Type de données manipulé par le tableau
 */
export interface DataTableProps<T> {
  /** Définition des colonnes du tableau */
  columns: Column<T>[];
  /** Tableau de données à afficher */
  data: T[];
  /** Fonction retournant une clé unique pour chaque ligne */
  keyExtractor: (row: T) => string | number;
  /** Indique si le tableau est en cours de chargement */
  isLoading?: boolean;
  /** Message affiché lorsque la liste de données est vide */
  emptyMessage?: string;
  /** Indique si la colonne de numérotation automatique N° doit être affichée (par défaut: true) */
  showRowNumbers?: boolean;

  // Propriétés de Pagination optionnelles
  /** Numéro de la page courante (1-indexed) */
  currentPage?: number;
  /** Nombre total de pages disponibles */
  totalPages?: number;
  /** Nombre total d'éléments dans la liste */
  totalItems?: number;
  /** Nombre d'éléments affichés par page */
  pageSize?: number;
  /** Callback déclenché lors du changement de page */
  onPageChange?: (page: number) => void;
  /** Callback déclenché lors du changement de la taille de page */
  onPageSizeChange?: (size: number) => void;

  // État du trieur optionnel
  /** Clé de la colonne actuellement triée */
  sortColumn?: string;
  /** Direction du tri actif ('asc' pour croissant, 'desc' pour décroissant) */
  sortDirection?: "asc" | "desc";
  /** Callback déclenché lors du clic sur une colonne triable */
  onSort?: (columnKey: string) => void;
}

/**
 * Composant de tableau de données réutilisable (DataTable) avec tri, numérotation N°, chargement et pagination.
 *
 * Fonctionnalités incluses :
 * - Colonne de numérotation N° automatique prenant en compte la pagination.
 * - Rendu dynamique des colonnes avec custom accessor.
 * - Tri interactif ascendant/descendant par en-tête.
 * - Masques d'attente (Skeletons) pendant le chargement des données.
 * - État vide illustré (`EmptyState`) en l'absence de données.
 * - Intégration transparente du pied de tableau de pagination (`Pagination`).
 *
 * @template T Type de l'objet représentant une ligne
 * @param props Props du composant DataTable {@link DataTableProps}
 * @returns Le composant de tableau réutilisable
 */
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = "Aucune donnée disponible pour le moment.",
  showRowNumbers = true,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sortColumn,
  sortDirection,
  onSort,
}: DataTableProps<T>) {
  const totalCols = showRowNumbers ? columns.length + 1 : columns.length;

  return (
    <div
      className="w-full rounded-xl border border-border bg-card shadow-xs overflow-hidden"
      aria-busy={isLoading}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          {/* Table En-têtes */}
          <thead>
            <tr className="border-b border-border bg-secondary/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {showRowNumbers && (
                <th className="px-4 py-3.5 text-center select-none font-semibold w-14 text-muted-foreground">
                  N°
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sortColumn === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    role={col.sortable ? "button" : undefined}
                    tabIndex={col.sortable ? 0 : undefined}
                    aria-sort={
                      isSorted
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    className={cn(
                      "px-4 py-3.5 select-none font-semibold",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      col.sortable &&
                        "cursor-pointer hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus-ring",
                      col.className,
                    )}
                    onClick={() => col.sortable && onSort?.(col.key)}
                    onKeyDown={(e) => {
                      if (
                        col.sortable &&
                        (e.key === "Enter" || e.key === " ")
                      ) {
                        e.preventDefault();
                        onSort?.(col.key);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        col.align === "center" && "justify-center w-full",
                        col.align === "right" && "justify-end w-full",
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-muted-foreground">
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="size-3.5 text-primary" />
                            ) : (
                              <ArrowDown className="size-3.5 text-primary" />
                            )
                          ) : (
                            <ArrowUpDown className="size-3 text-muted-foreground/60" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Corps */}
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, idx) => (
                /* biome-ignore lint/suspicious/noArrayIndexKey: Les squelettes d'attente ont un index statique */
                <tr key={`skeleton-row-${idx}`} className="animate-pulse">
                  {showRowNumbers && (
                    <td className="px-4 py-4 text-center">
                      <Skeleton className="h-4 w-6 mx-auto" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <Skeleton
                        className={cn(
                          "h-4",
                          col.align === "center"
                            ? "w-16 mx-auto"
                            : col.align === "right"
                              ? "w-20 ml-auto"
                              : "w-3/4",
                        )}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={totalCols}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="size-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                      <Inbox className="size-6" />
                    </div>
                    <p className="font-medium text-sm text-foreground">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Render Rows
              data.map((row, index) => {
                const rowNumber =
                  currentPage !== undefined &&
                  pageSize !== undefined &&
                  currentPage > 0
                    ? (currentPage - 1) * pageSize + index + 1
                    : index + 1;

                return (
                  <tr
                    key={keyExtractor(row)}
                    className="transition-colors hover:bg-muted/40 font-medium"
                  >
                    {showRowNumbers && (
                      <td className="px-4 py-3.5 text-center text-xs font-mono font-semibold text-muted-foreground align-middle w-14">
                        {rowNumber}
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3.5 text-foreground align-middle",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                          col.className,
                        )}
                      >
                        {col.accessor
                          ? col.accessor(row)
                          : (row as Record<string, unknown>)[col.key] !==
                              undefined
                            ? String((row as Record<string, unknown>)[col.key])
                            : "-"}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Integration */}
      {currentPage !== undefined &&
        totalPages !== undefined &&
        totalItems !== undefined &&
        pageSize !== undefined &&
        onPageChange && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        )}
    </div>
  );
}
