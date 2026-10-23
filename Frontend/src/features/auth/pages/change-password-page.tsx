import { ChangePasswordForm } from "../components/change-password-form";
import { LoginBrandPanel } from "../components/login-brand-panel";

/**
 * Vue de page réelle pour le renouvellement obligatoire du mot de passe (ChangePasswordPage).
 *
 * Implémente la vue Split-Screen institutionnelle :
 * - Côté gauche : Panneau institutionnel BCRG (`LoginBrandPanel`).
 * - Côté droit : Formulaire de changement sécurisé (`ChangePasswordForm`).
 */
export function ChangePasswordPage() {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Panneau Gauche de Marque Institutionnelle BCRG */}
      <LoginBrandPanel />

      {/* Panneau Droit de Formulaire */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-card text-card-foreground">

        {/* Zone centrale : Formulaire */}
        <div className="my-auto flex justify-center items-center">
          <ChangePasswordForm />
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
