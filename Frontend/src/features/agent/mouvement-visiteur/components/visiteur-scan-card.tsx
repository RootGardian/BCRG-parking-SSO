"use client";

import { Car, Search, X } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VisiteurScanCardProps {
  scanQuery: string;
  onQueryChange: (q: string) => void;
  onSearch: () => void;
  onClear: () => void;
  isSearching: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

/**
 * Carte de recherche par plaque d'immatriculation visiteur pour le guichet vigile (VisiteurScanCard).
 */
export function VisiteurScanCard({
  scanQuery,
  onQueryChange,
  onSearch,
  onClear,
  isSearching,
  inputRef,
}: VisiteurScanCardProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Car className="size-5 text-amber-600" />
          <h3 className="font-bold text-sm text-foreground font-brand">
            Recherche par Plaque d&apos;Immatriculation Visiteur
          </h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={scanQuery}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Saisir la plaque d'immatriculation (ex: RC-9988-V, GN-4411)..."
            className="pl-10 pr-9 text-sm h-11 border-2 focus:border-amber-600 font-mono uppercase"
            autoFocus
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Search className="size-4" />
          </div>

          {scanQuery && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <Button
          type="submit"
          variant="default"
          isLoading={isSearching}
          className="h-11 px-6 gap-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
        >
          Rechercher
        </Button>
      </form>
    </div>
  );
}
