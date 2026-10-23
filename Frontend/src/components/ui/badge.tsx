import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Variantes de style du composant Badge définies avec class-variance-authority.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/15 text-destructive border-destructive/30",
        success:
          "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
        outline: "text-foreground border-border",
        gold: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/**
 * Interface décrivant les propriétés du composant Badge générique.
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Composant Badge pour l'affichage de petites étiquettes de statut ou catégories.
 *
 * @param props Props du composant Badge {@link BadgeProps}
 * @returns L'élément badge stylisé
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
