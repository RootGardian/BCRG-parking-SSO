import { Building2, MapPin, ShieldAlert } from "lucide-react";
import type { MaPlaceParking } from "../types";

interface MaPlaceCardProps {
  place?: MaPlaceParking;
  fonctionNom?: string;
  isLoading?: boolean;
}

/**
 * Carte de détails de la place réservée selon la fonction du personnel (MaPlaceCard).
 */
export function MaPlaceCard({
  place,
  fonctionNom,
  isLoading = false,
}: MaPlaceCardProps) {
  const primaryPlace =
    place?.places_attitrees?.[0] || (place?.numero ? place : null);
  const resolvedFonction = fonctionNom || place?.fonction;
  const hasPlace = Boolean(primaryPlace?.numero);

  return (
    <div className="rounded-xl bg-card border border-border p-5 shadow-xs flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <MapPin className="size-5" />
          </div>
          <div>
            <h3 className="font-brand font-bold text-sm text-foreground">
              Ma Place Attribuée
            </h3>
            <p className="text-xs text-muted-foreground">
              Réservée à votre fonction
            </p>
          </div>
        </div>

        {hasPlace ? (
          <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Place N° {primaryPlace?.numero}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border">
            Non attribuée
          </span>
        )}
      </div>

      {/* Contenu */}
      <div className="p-3.5 rounded-lg bg-secondary/40 border border-border/60 space-y-2">
        {isLoading ? (
          <div className="h-10 bg-muted animate-pulse rounded" />
        ) : hasPlace && primaryPlace ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Niveau :</span>
              <span className="font-bold text-foreground">
                {primaryPlace.niveau || "Sous-Sol 1"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Parking :</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Building2 className="size-3 text-muted-foreground" />
                {primaryPlace.parking?.nom || "Parking Principal"}
              </span>
            </div>
            {resolvedFonction && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                <span className="text-muted-foreground">Fonction :</span>
                <span className="font-medium text-brand-green-700 dark:text-emerald-400">
                  {resolvedFonction}
                </span>
              </div>
            )}
            {primaryPlace.est_occupee !== undefined && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                <span className="text-muted-foreground">Disponibilité :</span>
                <span
                  className={`font-medium ${
                    primaryPlace.est_occupee
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-brand-green-700 dark:text-emerald-400"
                  }`}
                >
                  {primaryPlace.est_occupee ? "Actuellement occupée" : "Libre"}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldAlert className="size-4 shrink-0 text-amber-500 mt-0.5" />
            <p className="leading-relaxed">
              Aucun numéro de baie nominatif n&apos;est actuellement rattaché à
              votre fonction. Le stationnement s&apos;effectue selon les zones
              disponibles.
            </p>
          </div>
        )}
      </div>

      {/* Info complémentaire */}
      <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/50">
        <span>Type de stationnement</span>
        <span className="font-semibold text-foreground">
          {hasPlace ? "Place attribuée" : "Accès standard"}
        </span>
      </div>
    </div>
  );
}
