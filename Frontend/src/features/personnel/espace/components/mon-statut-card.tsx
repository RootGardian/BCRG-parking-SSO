import { Activity, ArrowDownRight, ArrowUpRight, Clock } from "lucide-react";
import type { MonStatutPresence } from "../types";

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

interface MonStatutCardProps {
  statut: MonStatutPresence;
  isLoading?: boolean;
}

/**
 * Carte de statut de présence temps réel (MonStatutCard).
 *
 * Indique si le personnel est actuellement stationné sur site ou hors site,
 * avec les détails de son véhicule, de sa baie occupée et de son heure de franchissement.
 */
export function MonStatutCard({
  statut,
  isLoading = false,
}: MonStatutCardProps) {
  const isSurSite = statut.statut === "sur_site" || statut.sur_site === true;
  const dernierMvt = statut.dernier_mouvement;

  // Véhicule actif ou du dernier mouvement
  const vehiculeActif = statut.vehicule || dernierMvt?.vehicule;
  const plaque = vehiculeActif?.numero_plaque;
  const marque =
    (vehiculeActif as { marque?: string })?.marque ||
    vehiculeActif?.marque_modele;
  const couleur = vehiculeActif?.couleur;

  // Heure de franchissement
  const heureFranchissement = isSurSite
    ? statut.heure_arrivee || dernierMvt?.heure_arrivee
    : statut.heure_depart || dernierMvt?.heure_depart;

  const placeOccupee = statut.place_parking;

  return (
    <div className="rounded-xl bg-card border border-border p-5 shadow-xs flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg ${
              isSurSite
                ? "bg-brand-green-700/10 text-brand-green-700 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Activity className="size-5" />
          </div>
          <div>
            <h3 className="font-brand font-bold text-sm text-foreground">
              Statut de Présence
            </h3>
            <p className="text-xs text-muted-foreground">
              Localisation temps réel
            </p>
          </div>
        </div>

        {/* Badge dynamique */}
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
            isSurSite
              ? "bg-brand-green-700/10 text-brand-green-700 dark:text-emerald-400 border-brand-green-700/20"
              : "bg-secondary text-muted-foreground border-border"
          }`}
        >
          <span
            className={`size-2 rounded-full ${
              isSurSite ? "bg-brand-green-700 animate-pulse" : "bg-zinc-400"
            }`}
          />
          {isSurSite ? "Actuellement Sur Site" : "Hors Site"}
        </span>
      </div>

      {/* Détails du franchissement */}
      <div className="p-3.5 rounded-lg bg-secondary/40 border border-border/60 space-y-2">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Dernier Franchissement
        </p>

        {isLoading ? (
          <div className="h-10 bg-muted animate-pulse rounded" />
        ) : isSurSite ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <ArrowUpRight className="size-4 text-brand-green-700 dark:text-emerald-400" />
                <span>Entrée enregistrée</span>
              </span>
              <span className="font-mono font-bold text-foreground bg-background px-2 py-0.5 rounded border border-border">
                {plaque || "Véhicule autorisé"}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground gap-1 pt-1 border-t border-border/40">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3" />
                <span>{formatDateHeure(heureFranchissement)}</span>
              </div>
              {marque && (
                <span className="text-foreground font-medium">
                  {marque}
                  {couleur ? ` (${couleur})` : ""}
                </span>
              )}
            </div>

            {placeOccupee?.numero && (
              <div className="text-[11px] text-brand-green-700 dark:text-emerald-400 font-medium">
                Stationné sur la place {placeOccupee.numero}
                {placeOccupee.niveau ? ` (${placeOccupee.niveau})` : ""}
              </div>
            )}
          </div>
        ) : heureFranchissement ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <ArrowDownRight className="size-4 text-amber-600 dark:text-amber-400" />
                <span>Sortie enregistrée</span>
              </span>
              <span className="font-mono font-bold text-foreground">
                {plaque || "----"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock className="size-3" />
              <span>{formatDateHeure(heureFranchissement)}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Aucun franchissement récent enregistré.
          </p>
        )}
      </div>

      {/* Info complémentaire */}
      <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/50">
        <span>Contrôle automatisé par vigile</span>
        <span className="font-semibold text-foreground">
          {isSurSite ? "Accès parking actif" : "Barrière ouverte à la demande"}
        </span>
      </div>
    </div>
  );
}
