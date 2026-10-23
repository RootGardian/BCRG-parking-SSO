import * as React from "react";
import { LoginBrandPanel } from "../components/login-brand-panel";
import { LoginForm } from "../components/login-form";

/**
 * Composant de page réelle pour l'authentification (LoginPage).
 *
 * Implémente la vue Split-Screen institutionnelle :
 * - Côté gauche (desktop lg+) : Panneau de marque BCRG Vert `#1d433b` (`LoginBrandPanel`).
 * - Côté droit : Formulaire de connexion réactif et épuré (`LoginForm`).
 *
 * @returns La vue d'authentification complète
 */
export function LoginPage() {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Panneau Gauche de Marque Institutionnelle BCRG */}
      <LoginBrandPanel />

      {/* Panneau Droit de Formulaire */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-card text-card-foreground">

        {/* Zone centrale : Formulaire encapsulé dans Suspense pour useSearchParams */}
        <div className="my-auto flex justify-center items-center">
          <React.Suspense
            fallback={
              <div className="w-full max-w-md h-64 flex items-center justify-center text-sm text-muted-foreground">
                Chargement...
              </div>
            }
          >
            <LoginForm />
          </React.Suspense>
        </div>

        {/* Footer Droit */}
        <div className="pt-8 text-center text-xs text-muted-foreground font-medium">
          © {new Date().getFullYear()} Banque Centrale de la République de
          Guinée. Tous droits réservés.
        </div>
      </div>
    </main>
  );
}
