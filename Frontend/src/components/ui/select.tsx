import { ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Interface définissant une option de sélection.
 */
export interface SelectOption {
  /** Libellé textuel affiché dans la liste déroulante */
  label: string;
  /** Valeur associée à l'option */
  value: string;
}

/**
 * Interface décrivant les propriétés du composant Select.
 */
export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Libellé (label) au-dessus du sélecteur */
  label?: string;
  /** Message d'erreur sous le sélecteur */
  error?: string;
  /** Liste des options disponibles */
  options: SelectOption[];
  /** Texte indicatif par défaut (option désactivée) */
  placeholder?: string;
}

/**
 * Composant de liste déroulante réutilisable (Select).
 *
 * Fournit une expérience de sélection propre avec icône flèche customisée,
 * support de labels et messages d'erreur.
 *
 * @param props Props du composant Select {@link SelectProps}
 * @returns Le sélecteur de liste déroulante
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-10 text-base sm:text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
              error && "border-destructive focus-visible:ring-destructive",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none text-muted-foreground">
            <ChevronDown className="size-4" />
          </div>
        </div>
        {error && (
          <p className="text-xs font-medium text-destructive animate-in fade-in-50">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
