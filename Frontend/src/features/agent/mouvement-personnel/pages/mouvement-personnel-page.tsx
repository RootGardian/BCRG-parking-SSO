"use client";

import { Car, ChevronDown } from "lucide-react";
import * as React from "react";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { ParkingStatusBar } from "../components/parking-status-bar";
import { PersonnelInfoCard } from "../components/personnel-info-card";
import { PersonnelScanCard } from "../components/personnel-scan-card";
import { PersonnelSurSiteTable } from "../components/personnel-sur-site-table";
import { QrScannerModal } from "../components/qr-scanner-modal";
import { useMouvementPersonnel } from "../hooks/use-mouvement-personnel";

/**
 * Vue principale du guichet vigile — Mouvement Personnel (MouvementPersonnelPage).
 *
 * - En Desktop (>= lg) : Préserve fidèlement l'interface historique complète (Header, KPIs, Tableau ouvert).
 * - Sur Mobile & Tablette (< lg) : Interface condensée ultra-rapide (Micro-KPI, Hero scan, Accordéon repliable).
 */
export function MouvementPersonnelPage() {
  const {
    parkingStatus,
    isLoadingStatus,
    scanQuery,
    setScanQuery,
    isSearching,
    scanResult,
    selectedVehicule,
    setSelectedVehicule,
    observation,
    setObservation,
    isSubmitting,
    mouvementsList,
    totalItems,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    isLoadingList,
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
    isScannerOpen,
    setIsScannerOpen,
    handleQrScanSuccess,
    scanInputRef,
    handleSearch,
    handleClearScan,
    handleValiderEntree,
    requestValiderSortie,
    confirmValiderSortie,
  } = useMouvementPersonnel();

  // Accordéon du registre des mouvements (pour mobile et tablette uniquement)
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);

  const handleRequestSortiePersonnel = (
    mouvement: (typeof mouvementsList)[number],
  ) => {
    const userObj = mouvement.vehicule?.personnel?.utilisateur;
    const mat = userObj?.matricule || "";
    if (mat) {
      requestValiderSortie({
        id: mouvement.id,
        matricule: mat,
        plaque: mouvement.vehicule?.numero_plaque,
        nomComplet: userObj
          ? `${userObj.prenom} ${userObj.nom}`.trim()
          : "Personnel BCRG",
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 0. En-tête de section (affiché en Desktop >= lg, masqué sur mobile & tablette) */}
      <div className="hidden lg:block">
        <PageHeader
          title="Guichet Vigile - Mouvement Personnel"
          description="Scan de badge QR Code, détection automatique entrée/sortie et contrôle d'accès des agents BCRG."
        />
      </div>

      {/* 1. Bandeau capacitaire (Micro-barre sur mobile/tablette < lg, 3 KPIs en Desktop >= lg) */}
      <ParkingStatusBar
        status={parkingStatus}
        isLoading={isLoadingStatus}
      />

      {/* 2. Carte de Scan QR Code / Recherche matricule (Hero tactile sur mobile/tablette, classique en desktop) */}
      <PersonnelScanCard
        scanQuery={scanQuery}
        onQueryChange={setScanQuery}
        onSearch={() => handleSearch()}
        onClear={handleClearScan}
        isSearching={isSearching}
        inputRef={scanInputRef}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* 3. Fiche du Personnel Scanné (Affichage dès résultat trouvé) */}
      {scanResult && (
        <PersonnelInfoCard
          scanResult={scanResult}
          selectedVehicule={selectedVehicule}
          onSelectVehicule={setSelectedVehicule}
          observation={observation}
          onObservationChange={setObservation}
          onValiderEntree={handleValiderEntree}
          onValiderSortie={() => {
            requestValiderSortie({
              id: scanResult.passage_actif_id,
              matricule: scanResult.matricule,
              plaque: selectedVehicule?.numero_plaque,
              nomComplet: `${scanResult.prenom} ${scanResult.nom}`.trim(),
            });
          }}
          isSubmitting={isSubmitting}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. Tableau des Mouvements du Personnel                                     */}
      {/* ========================================================================= */}

      {/* 4a. Version Desktop (>= lg) : Tableau complet visible directement           */}
      <div className="hidden lg:block">
        <PersonnelSurSiteTable
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
          onRequestSortie={handleRequestSortiePersonnel}
        />
      </div>

      {/* 4b. Version Mobile & Tablette (< lg) : Accordéon replié pour désencombrer  */}
      <div className="block lg:hidden overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all">
        <button
          type="button"
          onClick={() => setIsRegisterOpen((prev) => !prev)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 p-3.5 text-left transition-colors hover:bg-accent/40 sm:p-4"
          aria-expanded={isRegisterOpen}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-green-700/10 text-brand-green-700">
              <Car className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-brand font-bold text-sm text-foreground sm:text-base">
                  Véhicules Présents sur Site
                </span>
                <span className="rounded-full border border-brand-green-700/20 bg-brand-green-700/10 px-2 py-0.5 font-mono text-xs font-bold text-brand-green-700">
                  {parkingStatus.presents_sur_site}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isRegisterOpen
                  ? "Masquer les filtres et le registre détaillé"
                  : `Afficher le registre complet des passages (${totalItems} mouvements)`}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 font-brand font-bold text-xs text-brand-green-700">
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
            <PersonnelSurSiteTable
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
              onRequestSortie={handleRequestSortiePersonnel}
            />
          </div>
        )}
      </div>

      {/* Modale de confirmation de Sortie */}
      <ConfirmModal
        isOpen={Boolean(pendingExit)}
        onClose={() => setPendingExit(null)}
        onConfirm={confirmValiderSortie}
        title="Confirmation de Sortie du Parking"
        description={`Êtes-vous sûr de vouloir enregistrer la sortie du véhicule ${
          pendingExit?.plaque ? `[${pendingExit.plaque}]` : ""
        } pour ${pendingExit?.nomComplet || pendingExit?.matricule} ?`}
        confirmText="Confirmer la Sortie"
        cancelText="Annuler"
        variant="warning"
        isLoading={isSubmitting}
      />

      {/* Modale de scan QR Code avec Caméra */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleQrScanSuccess}
      />
    </div>
  );
}
