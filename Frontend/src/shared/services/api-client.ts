import axios from "axios";

/**
 * Instance centralisée du client HTTP Axios pour les appels API directs vers le serveur Backend Render.
 *
 * (Option B : Appels API directs avec token Bearer JWT stocké dans le localStorage)
 */
export const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://backend-parking-sous-sol-bcrg.onrender.com",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 180000,
});

// Intercepteur de requête : Injection automatique du token JWT Bearer depuis le localStorage
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("bcrg_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercepteur de réponse : Gestion centralisée des 401 (Non autorisé) et 403 (Changement de mot de passe obligatoire)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      // 1. Session expirée ou non autorisée -> Redirection vers /login
      if (error.response?.status === 401) {
        localStorage.removeItem("bcrg_token");
        // biome-ignore lint/suspicious/noDocumentCookie: Nettoyage cookies
        document.cookie =
          "bcrg_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        if (window.location.pathname !== "/login") {
          const hubUrl = process.env.NEXT_PUBLIC_BCRG_HUB_FRONTEND_URL || "http://localhost:5173";
          window.location.href = hubUrl;
        }
      }

      // 2. Erreur 403 indiquant que le mot de passe doit être changé
      const resData = error.response?.data;
      const isPwdChangeRequired = Boolean(
        error.response?.status === 403 &&
          (resData?.requires_password_change ||
            resData?.doit_changer_mdp ||
            (typeof resData?.error === "string" &&
              resData.error
                .toLowerCase()
                .includes("réinitialiser votre mot de passe"))),
      );

      if (
        isPwdChangeRequired &&
        !window.location.pathname.startsWith("/change-password")
      ) {
        // biome-ignore lint/suspicious/noDocumentCookie: Marquer le cookie pour le proxy
        document.cookie = "bcrg_must_change_pwd=true; path=/; SameSite=Lax";
        window.location.href = "/change-password";
      }
    }
    return Promise.reject(error);
  },
);
