"use client";

import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SearchableSelectProps {
  label?: string;
  error?: string;
  options: SearchableSelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  /** Permet de saisir et valider une valeur personnalisée non présente dans la liste */
  allowCustomValue?: boolean;
}

/**
 * Composant de sélection réutilisable avec recherche en temps réel et création optionnelle de valeur (SearchableSelect).
 */
export function SearchableSelect({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = "Sélectionner une option...",
  searchPlaceholder = "Rechercher...",
  isLoading = false,
  disabled = false,
  className,
  id,
  allowCustomValue = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const generatedId = React.useId();
  const selectId = id || generatedId;

  const selectedOption =
    options.find((opt) => opt.value === value) ||
    (value && allowCustomValue ? { value, label: value } : undefined);

  // Fermer le menu déroulant en cliquant à l'extérieur
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus sur le champ de recherche à l'ouverture
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.description?.toLowerCase().includes(q),
    );
  }, [options, searchQuery]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange("");
  };

  const showCustomOption =
    allowCustomValue &&
    searchQuery.trim() !== "" &&
    !options.some(
      (opt) =>
        opt.value.toLowerCase() === searchQuery.trim().toLowerCase() ||
        opt.label.toLowerCase() === searchQuery.trim().toLowerCase(),
    );

  return (
    <div
      className={cn("w-full space-y-1.5 relative", className)}
      ref={containerRef}
    >
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <button
          id={selectId}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 cursor-pointer",
            selectedOption && "pr-14",
            disabled && "cursor-not-allowed opacity-50 bg-muted/40",
            error && "border-destructive focus-visible:ring-destructive",
            isOpen && "border-brand-green-700 ring-2 ring-brand-green-700/20",
          )}
        >
          <span
            className={cn(
              "truncate flex-1 text-left",
              !selectedOption && "text-muted-foreground",
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2",
              isOpen && "rotate-180 text-brand-green-700",
            )}
          />
        </button>

        {selectedOption && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 p-1 hover:text-foreground text-muted-foreground rounded-full transition-colors cursor-pointer"
            title="Effacer la sélection"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Menu Déroulant (Popover Flottant) */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-xl z-[100] animate-in fade-in-50 zoom-in-95 overflow-hidden">
          {/* Input de recherche */}
          <div className="flex items-center border-b border-border px-3 py-2 bg-muted/30">
            <Search className="size-4 text-muted-foreground mr-2 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Liste des options */}
          <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
            {isLoading ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Chargement des options...
              </div>
            ) : (
              <>
                {showCustomOption && (
                  <button
                    type="button"
                    onClick={() => handleSelect(searchQuery.trim())}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded text-xs text-brand-green-700 bg-brand-green-500/10 hover:bg-brand-green-500/20 font-semibold cursor-pointer border-b border-border text-left"
                  >
                    <Plus className="size-3.5 shrink-0" />
                    <span>
                      Créer ou utiliser &quot;{searchQuery.trim()}&quot;
                    </span>
                  </button>
                )}

                {filteredOptions.length === 0 && !showCustomOption ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    Aucun résultat pour &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredOptions.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          "flex w-full items-center justify-between px-3 py-2 rounded text-xs transition-colors cursor-pointer text-left",
                          isSelected
                            ? "bg-brand-green-500/15 text-brand-green-700 font-semibold"
                            : "hover:bg-accent text-foreground",
                        )}
                      >
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          {opt.description && (
                            <span className="text-[11px] text-muted-foreground font-normal">
                              {opt.description}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="size-4 text-brand-green-700 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })
                )}
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-destructive animate-in fade-in-50">
          {error}
        </p>
      )}
    </div>
  );
}
