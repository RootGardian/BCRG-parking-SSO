"use client";

import { RefreshCw, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/shared/store/use-auth-store";
import { MaPlaceCard } from "../components/ma-place-card";
import { MesVehiculesCard } from "../components/mes-vehicules-card";
import { MonBadgeQrCard } from "../components/mon-badge-qr-card";
import { MonHistoriqueTable } from "../components/mon-historique-table";
import { MonStatutCard } from "../components/mon-statut-card";
import { useEspacePersonnel } from "../hooks/use-espace-personnel";

/**
 * Vue principale de l'Espace Personnel (`EspacePersonnelPage`).
 *
 * Conçue pour offrir aux agents et cadres de la BCRG une vision unifiée :
 * 1. Présentation de leur Badge QR d'accès.
 * 2. Contrôle de leur statut de présence dans le parking.
 * 3. Consultation de leur place attribuée et de leurs véhicules.
 * 4. Historique de leurs mouvements.
 */
export function EspacePersonnelPage() {
  const {
    profil,
    qrCode,
    statut,
    place,
    vehicules,
    historique,
    currentPage,
    setCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    isLoading,
    isRefreshing,
    refetch,
  } = useEspacePersonnel();

  const authUser = useAuthStore((state) => state.user);

  // Résolution sécurisée du nom, prénom et matricule pour affichage irréprochable
  const resolvedNom = profil?.nom || authUser?.nom || "";
  const resolvedPrenom = profil?.prenom || authUser?.prenom || "";
  const resolvedMatricule = profil?.matricule || authUser?.matricule || "----";
  const nomComplet =
    `${resolvedPrenom} ${resolvedNom}`.trim() ||
    authUser?.nom ||
    "Personnel BCRG";
  const initiales =
    `${resolvedPrenom?.[0] || ""}${resolvedNom?.[0] || ""}`.toUpperCase() ||
    "BC";

  const resolvedFonction =
    (typeof profil?.fonction === "object"
      ? profil.fonction?.nom
      : profil?.fonction) ||
    place?.fonction ||
    profil?.direction ||
    profil?.departement ||
    "Personnel BCRG";

  return (
    <div className="space-y-6">
      {/* En-tête de section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader
          title="Mon Espace Personnel"
          description="Badge d'accès sous-sol, statut de présence en direct, véhicules autorisés et historique."
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={refetch}
          isLoading={isRefreshing}
          className="self-start sm:self-auto text-xs gap-1.5 shrink-0"
        >
          <RefreshCw className="size-3.5" />
          <span>Actualiser</span>
        </Button>
      </div>

      {/* Bandeau d'information du profil */}
      <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full bg-brand-green-700/10 text-brand-green-700 dark:text-emerald-400 flex items-center justify-center font-brand font-bold text-sm">
            {initiales}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-brand font-bold text-base text-foreground">
                {nomComplet}
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border font-semibold">
                {resolvedMatricule}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{resolvedFonction}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
          <UserCheck className="size-4 text-brand-green-700 dark:text-emerald-400" />
          <span>Compte Personnel Actif</span>
        </div>
      </div>

      {/* Grille principale : Badge QR, Statut & Place */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <MonBadgeQrCard
          qrCodeBase64={qrCode}
          matricule={resolvedMatricule}
          nomComplet={nomComplet}
          isLoading={isLoading}
        />

        <MonStatutCard statut={statut} isLoading={isLoading} />

        <MaPlaceCard
          place={place}
          fonctionNom={resolvedFonction}
          isLoading={isLoading}
        />
      </div>

      {/* Véhicules Autorisés */}
      <MesVehiculesCard
        vehicules={vehicules.length > 0 ? vehicules : profil?.vehicules || []}
        isLoading={isLoading}
      />

      {/* Historique des Passages */}
      <MonHistoriqueTable
        data={historique}
        totalItems={totalItems}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
      />
    </div>
  );
}
