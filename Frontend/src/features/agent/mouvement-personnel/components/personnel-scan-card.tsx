"use client";

import { Camera, QrCode, Search, X } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PersonnelScanCardProps {
  scanQuery: string;
  onQueryChange: (q: string) => void;
  onSearch: () => void;
  onClear: () => void;
  isSearching: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onOpenScanner?: () => void;
}

/**
 * Composant de scan QR Code / Matricule pour le guichet vigile (PersonnelScanCard).
 *
 * - En Desktop (>= lg) : Préserve exactement la disposition historique compacte.
 * - Sur Mobile & Tablette (< lg) : Affiche le grand bouton d'action Hero tactile
 *   immédiatement accessible au doigt avec formulaire de repli.
 */
export function PersonnelScanCard({
  scanQuery,
  onQueryChange,
  onSearch,
  onClear,
  isSearching,
  inputRef,
  onOpenScanner,
}: PersonnelScanCardProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div>
      {/* ========================================================================= */}
      {/* 1. Version Desktop (>= lg) : Version classique compacte                   */}
      {/* ========================================================================= */}
      <div className="hidden lg:block space-y-3.5 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <QrCode className="size-5 text-brand-green-700" />
            <h3 className="font-brand font-bold text-sm text-foreground">
              Contrôle d&apos;Accès Personnel (Badge QR Code)
            </h3>
          </div>

          {onOpenScanner && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onOpenScanner}
              className="h-8 cursor-pointer gap-1.5 bg-brand-green-700 px-3 font-bold text-xs text-white shadow-xs hover:bg-brand-green-700/90"
            >
              <Camera className="size-4" />
              <span>Scanner Badge QR</span>
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={scanQuery}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Recherche par plaque d'immatriculation ou le matricule (ex: 2004)"
              className="h-11 border-2 font-mono text-sm pl-10 pr-9 focus:border-brand-green-700"
            />
            <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
              <Search className="size-4" />
            </div>

            {scanQuery && (
              <button
                type="button"
                onClick={onClear}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Effacer la saisie"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            isLoading={isSearching}
            className="h-11 cursor-pointer bg-brand-green-700 px-6 font-semibold text-xs text-white shrink-0 hover:bg-brand-green-700/90"
          >
            Rechercher
          </Button>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 2. Version Mobile & Tablette (< lg) : Bouton HERO tactile + Repli sobre   */}
      {/* ========================================================================= */}
      <div className="block lg:hidden space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs">
        {onOpenScanner && (
          <button
            type="button"
            onClick={onOpenScanner}
            className="group relative flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-brand-green-700 px-4 text-white shadow-md transition-all hover:bg-brand-green-700/95 hover:shadow-lg active:scale-[0.99] sm:h-16"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-white/15 text-white transition-transform group-hover:scale-110">
              <Camera className="size-6" />
            </div>
            <div className="flex flex-col text-left sm:text-center">
              <span className="font-brand text-base font-bold sm:text-lg">
                Scanner le Badge QR Code
              </span>
              <span className="text-[11px] text-white/80 font-sans">
                Appuyer pour activer la caméra ou le lecteur
              </span>
            </div>
          </button>
        )}

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-card px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            ou saisie manuelle de secours
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <Input
              value={scanQuery}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Recherche par plaque d'immatriculation ou matricule (ex: 2004)..."
              className="h-12 border border-border pl-10 pr-9 font-mono text-sm focus:border-brand-green-700"
            />
            <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
              <Search className="size-4" />
            </div>

            {scanQuery && (
              <button
                type="button"
                onClick={onClear}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Effacer la recherche"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            isLoading={isSearching}
            className="h-12 cursor-pointer bg-brand-green-700 px-6 font-brand font-bold text-sm text-white hover:bg-brand-green-700/90 shrink-0"
          >
            <Search className="mr-1.5 size-4" />
            <span>Rechercher</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
