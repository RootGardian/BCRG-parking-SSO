import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Mouvement } from "@/types/models";

interface RecentMovementsTableProps {
  movements?: Mouvement[];
  isLoading?: boolean;
}

const MOV_SKEL_KEYS = ["mov-skel-1", "mov-skel-2", "mov-skel-3", "mov-skel-4"];

/**
 * Composant récapitulatif des 5 derniers mouvements enregistrés (RecentMovementsTable).
 */
export function RecentMovementsTable({
  movements,
  isLoading,
}: RecentMovementsTableProps) {
  if (isLoading || !movements) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {MOV_SKEL_KEYS.map((key) => (
            <Skeleton key={key} className="h-12 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (movements.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold">
            Derniers Mouvements Enregistrés
          </CardTitle>
          <Link
            href="/admin/mouvements"
            className="text-xs font-semibold text-brand-green-700 dark:text-emerald-400 hover:underline"
          >
            Voir tout le journal →
          </Link>
        </CardHeader>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Aucun mouvement récent enregistré pour le moment.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">
          Derniers Mouvements Enregistrés
        </CardTitle>
        <Link
          href="/admin/mouvements"
          className="text-xs font-semibold text-brand-green-700 dark:text-emerald-400 hover:underline"
        >
          Voir tout le journal →
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <th className="pb-3 pl-2">Plaque & Conducteur</th>
                <th className="pb-3">Catégorie</th>
                <th className="pb-3">Heure Arrivée</th>
                <th className="pb-3">Agent Guichet</th>
                <th className="pb-3 pr-2 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {movements.map((mov) => {
                const plaque =
                  typeof mov.plaque_immatriculation === "string" &&
                  mov.plaque_immatriculation !== "undefined"
                    ? mov.plaque_immatriculation
                    : mov.vehicule?.numero_plaque || "Non renseigné";

                const nomComplet =
                  typeof mov.nom_complet === "string" &&
                  mov.nom_complet !== "undefined"
                    ? mov.nom_complet
                    : mov.vehicule?.personnel?.utilisateur
                      ? `${mov.vehicule.personnel.utilisateur.prenom} ${mov.vehicule.personnel.utilisateur.nom}`.trim()
                      : "Conducteur";

                const flux = mov.type_flux || mov.categorie || "personnel";
                const passageDate = mov.heure_arrivee || mov.horodatage;
                const dateStr = passageDate
                  ? new Date(passageDate).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--";

                const agentName =
                  typeof mov.nom_vigile === "string" &&
                  mov.nom_vigile !== "undefined"
                    ? mov.nom_vigile
                    : mov.agent?.utilisateur
                      ? `${mov.agent.utilisateur.prenom} ${mov.agent.utilisateur.nom}`.trim()
                      : "Agent Guichet";

                return (
                  <tr
                    key={mov.id}
                    className="hover:bg-accent/40 transition-colors"
                  >
                    <td className="py-3 pl-2 font-medium">
                      <div className="font-bold text-foreground font-brand">
                        {plaque}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {nomComplet}
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={flux === "personnel" ? "default" : "gold"}
                      >
                        {flux === "personnel" ? "Personnel BCRG" : "Visiteur"}
                      </Badge>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground font-mono">
                      {dateStr}
                    </td>
                    <td className="py-3 text-xs font-medium">{agentName}</td>
                    <td className="py-3 pr-2 text-right">
                      <StatusBadge
                        type="statut"
                        value={mov.statut || "sur_site"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
