import { type NextRequest, NextResponse } from "next/server";

function getRedirectPathForRole(role?: string): string {
  const r = (role || "").toLowerCase();
  if (r === "agent") return "/agent";
  if (r === "personnel") return "/personnel";
  return "/admin";
}

async function handleSsoRequest(request: NextRequest) {
  let ssoToken: string | null = null;

  // 1. Extraction du jeton depuis les paramètres URL (GET ou POST)
  const searchParams = request.nextUrl.searchParams;
  ssoToken = searchParams.get("sso_token");

  // 2. Extraction depuis le corps de requête (POST form-data ou json)
  if (!ssoToken && request.method === "POST") {
    try {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        ssoToken = (formData.get("sso_token") as string) || null;
      } else if (contentType.includes("application/json")) {
        const json = await request.json();
        ssoToken = json.sso_token || json.token || null;
      }
    } catch (e) {
      console.error("[SSO] Erreur lecture corps de requête:", e);
    }
  }

  // Si aucun jeton n'est transmis, rediriger vers la page de connexion avec indication
  if (!ssoToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "sso_token_missing");
    return NextResponse.redirect(loginUrl);
  }

  // 3. Validation auprès de l'API Backend Parking BCRG
  const apiUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000";

  try {
    const backendResponse = await fetch(`${apiUrl}/api/auth/sso-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ sso_token: ssoToken.trim() }),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      const errMsg = encodeURIComponent(
        data.error || data.message || "Échec de l'authentification SSO BCRG HUB."
      );
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "sso_auth_failed");
      loginUrl.searchParams.set("message", errMsg);
      return NextResponse.redirect(loginUrl);
    }

    const token = data.token || data.access_token;
    const user = data.utilisateur || data.user;
    const rawRole = Array.isArray(user?.role) ? user.role[0] : user?.role;
    const role = (rawRole || "personnel").toLowerCase();
    const redirectPath = getRedirectPathForRole(role);

    // 4. Initialisation des cookies de session pour le middleware Next.js
    const response = new NextResponse(
      `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>BCRG Parking — Redirection SSO</title>
  <style>
    body {
      background: #0c1d19;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      text-align: center;
      padding: 2rem;
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(8px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
      max-width: 400px;
      width: 90%;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 3px solid rgba(212, 175, 55, 0.2);
      border-top-color: #d4af37;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1.25rem;
    }
    h2 { font-size: 1.15rem; margin: 0 0 0.5rem; font-weight: 600; }
    p { font-size: 0.875rem; color: #94a3b8; margin: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2>Authentification BCRG HUB réussie</h2>
    <p>Synchronisation de votre session sécurisée en cours...</p>
  </div>
  <script>
    try {
      localStorage.setItem('bcrg_token', ${JSON.stringify(token)});
      var authState = {
        state: {
          token: ${JSON.stringify(token)},
          user: ${JSON.stringify(user)},
          isAuthenticated: true
        },
        version: 0
      };
      localStorage.setItem('bcrg_auth_session', JSON.stringify(authState));
    } catch (e) {
      console.warn("Storage sync:", e);
    }
    window.location.replace(${JSON.stringify(redirectPath)});
  </script>
</body>
</html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      }
    );

    // Définition des cookies
    response.cookies.set("bcrg_session", token, {
      path: "/",
      sameSite: "lax",
      maxAge: 86400, // 24h
    });
    response.cookies.set("bcrg_user_role", role, {
      path: "/",
      sameSite: "lax",
      maxAge: 86400,
    });
    response.cookies.set("bcrg_must_change_pwd", "false", {
      path: "/",
      sameSite: "lax",
      maxAge: 86400,
    });

    return response;
  } catch (networkErr: any) {
    console.error("[SSO] Erreur réseau lors de la validation SSO:", networkErr);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "sso_server_unreachable");
    return NextResponse.redirect(loginUrl);
  }
}

export async function GET(request: NextRequest) {
  return handleSsoRequest(request);
}

export async function POST(request: NextRequest) {
  return handleSsoRequest(request);
}
