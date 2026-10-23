import { Car, CheckCircle2 } from "lucide-react";
import type { Vehicule } from "@/types/models";
import type { VehiculePersonnelItem } from "../types";

type VehiculeItemType = Vehicule | VehiculePersonnelItem;

interface MesVehiculesCardProps {
  vehicules: VehiculeItemType[];
  isLoading?: boolean;
}

/**
 * Carte listant les véhicules enregistrés et autorisés du personnel (MesVehiculesCard).
 */
export function MesVehiculesCard({
  vehicules,
  isLoading = false,
}: MesVehiculesCardProps) {
  return (
    <div className="rounded-xl bg-card border border-border p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-brand-yellow-500/10 text-brand-yellow-600 dark:text-amber-400">
            <Car className="size-5" />
          </div>
          <div>
            <h3 className="font-brand font-bold text-sm text-foreground">
              Mes Véhicules
            </h3>
            <p className="text-xs text-muted-foreground">
              Flotte enregistrée au sous-sol
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-secondary text-foreground border border-border">
          {vehicules.length} véhicule{vehicules.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Liste des véhicules */}
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-12 bg-muted animate-pulse rounded-lg" />
          <div className="h-12 bg-muted animate-pulse rounded-lg" />
        </div>
      ) : vehicules.length === 0 ? (
        <div className="p-4 rounded-lg bg-secondary/40 border border-border/60 text-center text-xs text-muted-foreground">
          Aucun véhicule n&apos;est actuellement rattaché à votre matricule.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {vehicules.map((v) => {
            const vCustom = v as VehiculePersonnelItem;
            const marqueModele =
              vCustom.marque || v.marque_modele
                ? `${vCustom.marque || ""}${
                    vCustom.modele ? ` ${vCustom.modele}` : ""
                  }`.trim() || v.marque_modele
                : "Véhicule personnel";

            return (
              <div
                key={v.id || v.numero_plaque}
                className="p-3 rounded-lg bg-secondary/40 border border-border/60 flex items-center justify-between gap-2 hover:border-brand-green-700/40 transition-colors"
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="font-mono font-bold text-sm text-foreground tracking-wide block truncate">
                    {v.numero_plaque}
                  </span>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {marqueModele}
                    {v.couleur ? ` • ${v.couleur}` : ""}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-green-700 dark:text-emerald-400 bg-brand-green-700/10 px-2 py-0.5 rounded-full shrink-0">
                  <CheckCircle2 className="size-3" />
                  Autorisé
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
