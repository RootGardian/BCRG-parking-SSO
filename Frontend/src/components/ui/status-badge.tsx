import { Clock, Eye, Shield, ShieldAlert, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Type représentant les valeurs possibles de statut de mouvement ('sur_site' | 'hors_site') */
export type StatutType = "sur_site" | "hors_site" | "sur site" | "hors site";

/** Type représentant les rôles utilisateur du système ('admin' | 'supervision' | 'agent' | 'personnel') */
export type RoleType = "admin" | "supervision" | "agent" | "personnel";

/**
 * Interface décrivant les propriétés du composant StatusBadge.
 */
interface StatusBadgeProps {
  /** Mode d'affichage ('statut' pour sur/hors site, 'role' pour les accès utilisateur) */
  type: "statut" | "role";
  /** Valeur à représenter */
  value: StatutType | RoleType | string;
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Composant de badge métier spécifique au parking BCRG (StatusBadge).
 */
export function StatusBadge({ type, value, className }: StatusBadgeProps) {
  const normalizedValue = String(value).toLowerCase().trim();

  if (type === "statut") {
    const isSurSite =
      normalizedValue === "sur_site" || normalizedValue === "sur site";
    return (
      <Badge
        variant={isSurSite ? "success" : "secondary"}
        className={cn("gap-1.5 font-medium py-1 px-3", className)}
      >
        {isSurSite ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Sur site
          </>
        ) : (
          <>
            <Clock className="size-3 text-muted-foreground" />
            Hors site
          </>
        )}
      </Badge>
    );
  }

  if (type === "role") {
    switch (normalizedValue) {
      case "admin":
        return (
          <Badge
            variant="default"
            className={cn(
              "gap-1.5 bg-brand-green-700 text-white py-1 px-3",
              className,
            )}
          >
            <Shield className="size-3.5" />
            Administrateur
          </Badge>
        );
      case "supervision":
        return (
          <Badge variant="gold" className={cn("gap-1.5 py-1 px-3", className)}>
            <Eye className="size-3.5" />
            Supervision
          </Badge>
        );
      case "agent":
        return (
          <Badge
            variant="secondary"
            className={cn("gap-1.5 py-1 px-3 border border-border", className)}
          >
            <ShieldAlert className="size-3.5 text-brand-green-700" />
            Agent de sécurité
          </Badge>
        );
      case "personnel":
        return (
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 py-1 px-3 border-emerald-600/30 text-emerald-800 bg-emerald-500/10 font-medium",
              className,
            )}
          >
            <User className="size-3.5 text-emerald-600" />
            Personnel BCRG
          </Badge>
        );
      default:
        return <Badge variant="outline">{value}</Badge>;
    }
  }

  return <Badge variant="outline">{value}</Badge>;
}
