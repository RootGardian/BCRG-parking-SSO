import type { Utilisateur } from "@/types/models";

/**
 * Payload envoyé lors de la demande de connexion (`LoginRequest`).
 */
export interface LoginPayload {
  /** Matricule (ex: 'ADM-001') */
  matricule: string;
  /** Mot de passe de l'utilisateur */
  mot_de_passe: string;
}

/**
 * Structure brute du profil renvoyé par l'API Backend dans AuthTokenResponse ou UserMeResponse.
 */
export interface ApiUserProfile {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  role: string | string[];
  est_actif?: boolean;
  doit_changer_mdp?: boolean;
  email?: string;
  telephone?: string;
  avatar?: string;
}

/**
 * Réponse brute de l'API `/api/auth/login` (`AuthTokenResponse`).
 */
export interface AuthTokenResponse {
  message?: string;
  token?: string;
  access_token?: string;
  profil?: ApiUserProfile;
  utilisateur?: ApiUserProfile;
}

/**
 * Réponse brute de l'API `/api/auth/me` (`UserMeResponse`).
 */
export interface UserMeResponse {
  utilisateur: ApiUserProfile;
}

/**
 * Résultat unifié retourné par le service d'authentification frontend.
 */
export interface AuthResult {
  token: string;
  utilisateur: Utilisateur;
}
