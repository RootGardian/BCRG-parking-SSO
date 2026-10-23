import { type NextRequest, NextResponse } from "next/server";

/**
 * Retourne le chemin d'accueil adapté selon le rôle de l'utilisateur.
 */
function getHomePathForRole(role?: string): string {
  if (role === "agent") return "/agent";
  if (role === "personnel") return "/personnel";
  return "/admin";
}

/**
 * Proxy Next.js (`src/proxy.ts`) pour l'interception réseau, le contrôle d'accès RBAC
 * et la vérification du changement obligatoire de mot de passe.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("bcrg_session")?.value;
  const userRole = request.cookies.get("bcrg_user_role")?.value;
  const mustChangePwd =
    request.cookies.get("bcrg_must_change_pwd")?.value === "true";

  const isChangePasswordRoute = pathname.startsWith("/change-password");
  const isLoginRoute = pathname.startsWith("/login");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAgentRoute = pathname.startsWith("/agent");
  const isPersonnelRoute = pathname.startsWith("/personnel");
  const isProtectedRoute = isAdminRoute || isAgentRoute || isPersonnelRoute;

  // 1. Utilisateur non authentifié tentant d'accéder à une route privée ou au changement de mdp
  if (!sessionToken) {
    if (isProtectedRoute || isChangePasswordRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 2. Utilisateur authentifié DEVANT changer son mot de passe (première connexion)
  if (mustChangePwd) {
    // Interdire tout accès aux dashboards tant que le mot de passe n'a pas été changé
    if (!isChangePasswordRoute && !isLoginRoute) {
      return NextResponse.redirect(new URL("/change-password", request.url));
    }
    return NextResponse.next();
  }

  // 3. Utilisateur authentifié en règle sur la page de changement de mot de passe -> rediriger vers son dashboard
  if (isChangePasswordRoute) {
    return NextResponse.redirect(
      new URL(getHomePathForRole(userRole), request.url),
    );
  }

  // 4. Utilisateur authentifié sur la page /login ou '/' -> rediriger vers son dashboard
  if (isLoginRoute || pathname === "/") {
    return NextResponse.redirect(
      new URL(getHomePathForRole(userRole), request.url),
    );
  }

  // 5. Cloisonnement strict des espaces par Rôle (RBAC)
  // Espace Admin / Supervision : accessible uniquement par admin et supervision
  if (isAdminRoute && userRole !== "admin" && userRole !== "supervision") {
    const targetUrl = new URL(getHomePathForRole(userRole), request.url);
    targetUrl.searchParams.set("unauthorized", "1");
    return NextResponse.redirect(targetUrl);
  }

  // Espace Agent Guichet : accessible uniquement par l'agent
  if (isAgentRoute && userRole !== "agent") {
    const targetUrl = new URL(getHomePathForRole(userRole), request.url);
    targetUrl.searchParams.set("unauthorized", "1");
    return NextResponse.redirect(targetUrl);
  }

  // Espace Personnel : accessible uniquement par le personnel
  if (isPersonnelRoute && userRole !== "personnel") {
    const targetUrl = new URL(getHomePathForRole(userRole), request.url);
    targetUrl.searchParams.set("unauthorized", "1");
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.next();
}

/**
 * Configuration du matcher pour appliquer le proxy uniquement sur les routes applicatives.
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico).*)"],
};
