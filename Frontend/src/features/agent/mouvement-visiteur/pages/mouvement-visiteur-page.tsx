"use client";

import { ChevronDown, Users } from "lucide-react";
import * as React from "react";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { VisiteurFormCard } from "../components/visiteur-form-card";
import { VisiteurScanCard } from "../components/visiteur-scan-card";
import { VisiteurSurSiteTable } from "../components/visiteur-sur-site-table";
import { useMouvementVisiteur } from "../hooks/use-mouvement-visiteur";

/**
 * Vue principale du guichet vigile — Mouvement Visiteur (MouvementVisiteurPage).
 *
 * - En Desktop (>= lg) : Préserve la présentation classique (Header, Formulaire, Tableau complet ouvert).
 * - Sur Mobile & Tablette (< lg) : Interface condensée avec registre rétractable.
 */
export function MouvementVisiteurPage() {
  const {
    mouvementsList,
    totalItems,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    isLoadingList,
    scanQuery,
    setScanQuery,
    isSearching,
    scanResult,
    scanInputRef,
    handleSearch,
    handleClearScan,
    isSubmitting,
    statutFilter,
    setStatutFilter,
    searchFilter,
    setSearchFilter,
    dateDebut,
    setDateDebut,
    dateFin,
    setDateFin,
    handleResetFilters,
    pendingExit,
    setPendingExit,
    handleValiderEntreeVisiteur,
    requestValiderSortieVisiteur,
    confirmValiderSortieVisiteur,
  } = useMouvementVisiteur();

  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);

  // Nombre de visiteurs sur site dans la liste
  const visiteursSurSiteCount = (mouvementsList || []).filter(
    (m) => m.statut === "sur_site",
  ).length;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 0. En-tête de section (affiché en Desktop >= lg, masqué sur mobile & tablette) */}
      <div className="hidden lg:block">
        <PageHeader
          title="Guichet Vigile - Mouvement Visiteur"
          description="Enregistrement des véhicules de visiteurs externes et contrôle d'accès temporaire."
        />
      </div>

      {/* 1. Carte de Recherche par Plaque Visiteur (Raccourci F2) */}
      <VisiteurScanCard
        scanQuery={scanQuery}
        onQueryChange={setScanQuery}
        onSearch={() => handleSearch()}
        onClear={handleClearScan}
        isSearching={isSearching}
        inputRef={scanInputRef}
      />

      {/* 2. Formulaire / Carte d'Action Visiteur (Entrée ou Sortie dynamique) */}
      <VisiteurFormCard
        scanResult={scanResult}
        onValiderEntree={handleValiderEntreeVisiteur}
        onValiderSortie={requestValiderSortieVisiteur}
        isSubmitting={isSubmitting}
      />

      {/* ========================================================================= */}
      {/* 3. Tableau des Mouvements Visiteurs                                       */}
      {/* ========================================================================= */}

      {/* 3a. Version Desktop (>= lg) : Tableau complet visible directement           */}
      <div className="hidden lg:block">
        <VisiteurSurSiteTable
          data={mouvementsList}
          totalItems={totalItems}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          isLoading={isLoadingList}
          searchFilter={searchFilter}
          onSearchChange={setSearchFilter}
          statutFilter={statutFilter}
          onStatutChange={setStatutFilter}
          dateDebut={dateDebut}
          onDateDebutChange={setDateDebut}
          dateFin={dateFin}
          onDateFinChange={setDateFin}
          onResetFilters={handleResetFilters}
          onRequestSortie={requestValiderSortieVisiteur}
        />
      </div>

      {/* 3b. Version Mobile & Tablette (< lg) : Accordéon replié pour désencombrer  */}
      <div className="block lg:hidden overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all">
        <button
          type="button"
          onClick={() => setIsRegisterOpen((prev) => !prev)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 p-3.5 text-left transition-colors hover:bg-accent/40 sm:p-4"
          aria-expanded={isRegisterOpen}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-yellow-500/10 text-brand-yellow-500">
              <Users className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-brand font-bold text-sm text-foreground sm:text-base">
                  Véhicules Visiteurs sur Site
                </span>
                <span className="rounded-full border border-brand-yellow-500/20 bg-brand-yellow-500/10 px-2 py-0.5 font-mono text-xs font-bold text-brand-yellow-500">
                  {visiteursSurSiteCount}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isRegisterOpen
                  ? "Masquer les filtres et le registre des visiteurs"
                  : `Afficher le registre complet des visiteurs (${totalItems} mouvements)`}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 font-brand font-bold text-xs text-brand-yellow-500">
            <span className="hidden sm:inline">
              {isRegisterOpen ? "Masquer" : "Consulter le registre"}
            </span>
            <ChevronDown
              className={cn(
                "size-5 transition-transform duration-200",
                isRegisterOpen && "rotate-180",
              )}
            />
          </div>
        </button>

        {isRegisterOpen && (
          <div className="border-t border-border p-3 pt-3 animate-in fade-in-50 duration-200 sm:p-4 sm:pt-4">
            <VisiteurSurSiteTable
              data={mouvementsList}
              totalItems={totalItems}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              isLoading={isLoadingList}
              searchFilter={searchFilter}
              onSearchChange={setSearchFilter}
              statutFilter={statutFilter}
              onStatutChange={setStatutFilter}
              dateDebut={dateDebut}
              onDateDebutChange={setDateDebut}
              dateFin={dateFin}
              onDateFinChange={setDateFin}
              onResetFilters={handleResetFilters}
              onRequestSortie={requestValiderSortieVisiteur}
            />
          </div>
        )}
      </div>

      {/* Modale de confirmation de Sortie Visiteur */}
      <ConfirmModal
        isOpen={Boolean(pendingExit)}
        onClose={() => setPendingExit(null)}
        onConfirm={confirmValiderSortieVisiteur}
        title="Confirmation de Sortie Visiteur"
        description={`Voulez-vous vraiment enregistrer la sortie du véhicule visiteur ${
          pendingExit?.plaque ? `[${pendingExit.plaque}]` : ""
        } du parking ?`}
        confirmText="Confirmer la Sortie"
        cancelText="Annuler"
        variant="warning"
        isLoading={isSubmitting}
      />
    </div>
  );
}
