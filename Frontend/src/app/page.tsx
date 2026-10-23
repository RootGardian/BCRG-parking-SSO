import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Route racine applicative (`/`).
 * Redirige automatiquement l'utilisateur vers l'espace d'administration (`/admin`)
 * ou vers la mire de connexion (`/login`) selon la présence d'un cookie de session actif.
 */
export default async function HomePage(props: {
  searchParams: Promise<{ sso_token?: string }>;
}) {
  const searchParams = await props.searchParams;
  if (searchParams?.sso_token) {
    redirect(`/login?sso_token=${encodeURIComponent(searchParams.sso_token)}`);
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("bcrg_session")?.value;
  const role = cookieStore.get("bcrg_user_role")?.value;
  const mustChangePwd =
    cookieStore.get("bcrg_must_change_pwd")?.value === "true";

  if (!sessionToken) {
    redirect("/login");
  }

  if (mustChangePwd) {
    redirect("/change-password");
  }

  if (role === "agent") {
    redirect("/agent");
  }
  if (role === "personnel") {
    redirect("/personnel");
  }
  redirect("/admin");
}
