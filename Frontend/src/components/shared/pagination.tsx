import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Interface décrivant les propriétés du composant Pagination.
 */
interface PaginationProps {
  /** Numéro de la page active actuelle (1-indexed) */
  currentPage: number;
  /** Nombre total de pages disponibles */
  totalPages: number;
  /** Nombre total d'éléments dans la liste globale */
  totalItems: number;
  /** Nombre d'éléments affichés par page */
  pageSize: number;
  /** Callback déclenché lors du changement de page */
  onPageChange: (page: number) => void;
  /** Callback optionnel déclenché lors de la modification de la taille de page */
  onPageSizeChange?: (size: number) => void;
  /** Liste des options de taille de page proposées dans le sélecteur */
  pageSizeOptions?: number[];
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Composant de contrôle de pagination réutilisable (Pagination).
 *
 * Affiché en bas des DataTables, il propose :
 * - Un résumé synthétique dynamique ("Affichage de X à Y sur Z résultats").
 * - Un sélecteur du nombre d'éléments à afficher par page (optionnel).
 * - Des boutons de navigation 'Précédent' et 'Suivant' avec désactivation automatique aux bornes.
 *
 * @param props Props du composant Pagination {@link PaginationProps}
 * @returns La barre de pagination interactive
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border bg-card text-sm text-muted-foreground select-none",
        className,
      )}
    >
      {/* Gauche : Résumé des éléments */}
      <div className="flex items-center gap-4">
        <span>
          Affichage de <strong className="text-foreground">{startItem}</strong>{" "}
          à <strong className="text-foreground">{endItem}</strong> sur{" "}
          <strong className="text-foreground">{totalItems}</strong> résultats
        </span>

        {onPageSizeChange && (
          <div className="hidden md:flex items-center gap-2">
            <span>Afficher</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus-ring cursor-pointer"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Droite : Boutons de navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="gap-1"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Précédent</span>
        </Button>

        <span className="text-xs font-semibold px-2">
          Page {currentPage} sur {Math.max(1, totalPages)}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || totalPages === 0}
          className="gap-1"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
