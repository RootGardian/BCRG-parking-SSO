import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Interface décrivant les propriétés du composant Input.
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Libellé (label) affiché au-dessus du champ */
  label?: string;
  /** Message d'erreur affiché sous le champ avec mise en forme rouge */
  error?: string;
  /** Icône d'illustration positionnée à gauche du champ */
  leftIcon?: React.ReactNode;
  /** Icône ou élément d'action positionné à droite du champ */
  rightIcon?: React.ReactNode;
}

/**
 * Composant de champ de saisie texte réutilisable (Input).
 *
 * Fonctionnalités incluses :
 * - Prise en charge des labels et messages d'erreur accessibles.
 * - Insertion d'icônes à gauche et à droite.
 * - Mode mot de passe avec bouton œil de démasquage automatique (`Eye`/`EyeOff`).
 * - Anneau de focus aux couleurs de la marque BCRG (`--focus-ring`).
 *
 * @param props Props du composant Input {@link InputProps}
 * @returns L'élément champ de saisie
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, label, error, leftIcon, rightIcon, id, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const isPassword = type === "password";
    const currentType = isPassword
      ? showPassword
        ? "text"
        : "password"
      : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-muted-foreground flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={currentType}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-10",
              (rightIcon || isPassword) && "pr-10",
              error && "border-destructive focus-visible:ring-destructive",
              className,
            )}
            ref={ref}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3 text-muted-foreground flex items-center">
                {rightIcon}
              </div>
            )
          )}
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

Input.displayName = "Input";

export { Input };
