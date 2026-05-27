/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference types="vite/client" />

/**
 * authService.ts — Authentification Supabase professionnelle
 * Aucun mot de passe codé en dur. Aucun bypass. Aucun émulateur.
 * Toute connexion passe exclusivement par Supabase Auth.
 */

// Nettoyage des clés au cas où elles auraient été copiées avec des guillemets dans Vercel
const sanitizeUrl = (url: string): string => {
  if (!url) return "";
  return url.replace(/^['"]+|['"]+$/g, "").trim().replace(/\/+$/, "");
};

const sanitizeKey = (key: string): string => {
  if (!key) return "";
  return key.replace(/^['"]+|['"]+$/g, "").trim();
};

const SUPABASE_URL = sanitizeUrl((import.meta.env.VITE_SUPABASE_URL as string) || "");
const SUPABASE_ANON_KEY = sanitizeKey((import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "");

export interface AuthUser {
  email: string;
  id: string;
  aud: string;
}

export const authService = {
  /**
   * Vérifie que les clés Supabase sont bien configurées dans les variables d'environnement.
   */
  isConfigured(): boolean {
    return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
  },

  /**
   * Connexion par email + mot de passe via Supabase Auth.
   * Aucun identifiant codé en dur. Aucun mode dégradé.
   * Si Supabase n'est pas configuré, une erreur explicite est levée.
   */
  async login(email: string, password: string): Promise<AuthUser> {
    if (!this.isConfigured()) {
      throw new Error(
        "Configuration manquante : les variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY " +
        "ne sont pas définies. Veuillez les configurer dans votre tableau de bord Vercel et relancer un déploiement."
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    let response: Response;
    try {
      response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
    } catch (networkError: any) {
      // Erreur réseau pure (DNS, CORS sans réponse du serveur, Safari mode privé…)
      throw new Error(
        "Impossible de joindre le serveur d'authentification. " +
        "Vérifiez votre connexion internet et que l'URL Supabase est correcte. " +
        "Note : Safari en mode navigation privée bloque les requêtes vers des services tiers — " +
        "utilisez Chrome ou Firefox si besoin."
      );
    }

    if (!response.ok) {
      // Le serveur a répondu avec une erreur HTTP
      const errData = await response.json().catch(() => ({})) as Record<string, string>;
      const msg = errData.error_description || errData.error || errData.msg || "";

      if (response.status === 400 && msg.toLowerCase().includes("invalid")) {
        throw new Error("Adresse email ou mot de passe incorrect.");
      }

      if (response.status === 400 && msg.toLowerCase().includes("email not confirmed")) {
        throw new Error(
          "Votre email n'a pas encore été confirmé. " +
          "Vérifiez votre boîte de réception et cliquez sur le lien de confirmation Supabase."
        );
      }

      if (response.status === 422) {
        throw new Error("Format d'email ou de mot de passe invalide.");
      }

      throw new Error(
        msg || `Erreur d'authentification (code ${response.status}). Contactez l'administrateur du projet.`
      );
    }

    const data = await response.json() as { user: { email: string; id: string; aud: string } };

    if (!data.user) {
      throw new Error("Réponse inattendue du serveur d'authentification. Veuillez réessayer.");
    }

    return {
      email: data.user.email,
      id: data.user.id,
      aud: data.user.aud,
    };
  },
};
