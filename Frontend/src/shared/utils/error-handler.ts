/**
 * Extrait de manière robuste le message d'erreur renvoyé par l'API backend.
 *
 * @param error Erreur capturée
 * @param defaultMessage Message de secours si aucun message précis n'est renvoyé par le serveur
 * @returns Message d'erreur prêt pour l'affichage utilisateur (toasts, alertes)
 */
export function getApiErrorMessage(
  error: unknown,
  defaultMessage = "Une erreur est survenue.",
): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resData = (error as { response?: { data?: Record<string, unknown> } })
      .response?.data;

    if (resData) {
      if (
        typeof resData.message === "string" &&
        resData.message.trim() !== ""
      ) {
        return resData.message;
      }
      if (Array.isArray(resData.message) && resData.message.length > 0) {
        return resData.message.join(" ");
      }
      if (typeof resData.error === "string" && resData.error.trim() !== "") {
        return resData.error;
      }
      if (typeof resData.detail === "string" && resData.detail.trim() !== "") {
        return resData.detail;
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return defaultMessage;
}
