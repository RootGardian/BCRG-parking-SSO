import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type KPICardVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "emerald"
  | "blue"
  | "amber"
  | "gold"
  | "rose";

/**
 * Interface définissant les données nécessaires pour alimenter une carte KPI.
 */
export interface KPICardData {
  /** Titre ou libellé de l'indicateur clé */
  title: string;
  /** Valeur chiffrée ou textuelle principale de l'indicateur */
  value: string | number;
  /** Sous-titre ou explication contextuelle optionnelle */
  subtitle?: string;
  /** Description contextuelle optionnelle (alias de subtitle) */
  description?: string;
  /** Icône d'illustration sémantique (élément React ou composant Lucide) */
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  /** Objet décrivant l'évolution ou la tendance de l'indicateur */
  trend?: {
    /** Libellé de la variation (ex: "+12%", "-5") */
    value: string;
    /** Indique si la variation est positive (vert) ou négative (rouge) */
    isPositive?: boolean;
  };
  /** Variante visuelle de couleur de bordure */
  variant?: KPICardVariant;
  /** Indique si la carte est en cours de chargement (affiche un skeleton anti-CLS) */
  isLoading?: boolean;
}

/**
 * Squelette d'attente dédié pour carte KPI préservant les dimensions exactes (anti-CLS).
 */
export function KPICardSkeleton(_props: { variant?: KPICardVariant } = {}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="size-9 rounded-lg" />
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-3.5 w-36" />
      </CardContent>
    </Card>
  );
}

/**
 * Composant de carte d'indicateur clé de performance (KPICard).
 *
 * @param props Données du composant KPICard {@link KPICardData}
 * @returns La carte d'indicateur KPI ou son squelette de chargement
 */
export function KPICard({
  title,
  value,
  subtitle,
  description,
  icon,
  trend,
  variant = "default",
  isLoading = false,
}: KPICardData) {
  if (isLoading) {
    return <KPICardSkeleton variant={variant} />;
  }

  const subText = description || subtitle;

  const renderIcon = () => {
    if (!icon) return null;
    if (
      typeof icon === "function" ||
      (typeof icon === "object" && icon !== null && "render" in icon)
    ) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="size-5" />;
    }
    return icon;
  };

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          {icon && (
            <div className="size-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
              {renderIcon()}
            </div>
          )}
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-brand tracking-tight text-foreground">
            {value}
          </span>
          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
                trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
              )}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>

        {subText && (
          <p className="mt-1 text-xs text-muted-foreground">{subText}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface KPICardsGridProps {
  children: React.ReactNode;
  columns?: number;
  className?: string;
}

/**
 * Composant conteneur en grille responsive pour aligner plusieurs cartes KPICard.
 */
export function KPICardsGrid({
  children,
  columns = 4,
  className,
}: KPICardsGridProps) {
  const gridColClass =
    columns === 3
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : columns === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";

  return (
    <div className={cn("grid gap-4", gridColClass, className)}>{children}</div>
  );
}
