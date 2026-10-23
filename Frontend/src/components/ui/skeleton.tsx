import { cn } from "@/lib/utils";

/**
 * Composant de masque d'attente (Skeleton).
 *
 * Affiche un rectangle pulsant pour matérialiser visuellement les éléments en cours de chargement
 * (DataTables, KPIs, Fiches).
 *
 * @param props Attributs HTML standards d'une div
 * @returns L'élément skeleton avec animation pulsante
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60 dark:bg-muted/40",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
