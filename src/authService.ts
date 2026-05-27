/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference types="vite/client" />

/**
 * authService.ts — Authentification via proxy Vercel (production) / Supabase direct (local)
 *
 * En production (Vercel) :
 *   → Appelle /api/admin-auth (même domaine = zéro CORS, zéro Safari, zéro restriction)
 *   → La clé Supabase reste côté serveur, invisible du navigateur
 *
 * En développement local (Vite dev server) :
 *   → Appelle Supabase directement (localhost est toujours autorisé)
 */

const sanitizeUrl = (url: string): string => {
  if (!url) return "";
  return url.replace(/^['"]+|['"]+$/g, "").trim().replace(/\/+$/, "");
};

const sanitizeKey = (key: string): string => {
  if (!key) return "";
  return key.replace(/^['"]+|['"]+$/g, "").trim();
};

const SUPABASE_URL = sanitizeUrl(
  (import.meta.env.VITE_SUPABASE_URL as string) || ""
);
const SUPABASE_ANON_KEY = sanitizeKey(
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ""
);

export interface AuthUser {
  email: string;
  id: string;
  aud: string;
}

export const authService = {
  isConfigured(): boolean {
    return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
  },

  async login(email: string, password: string): Promise<AuthUser> {
    const cleanEmail = email.toLowerCase().trim();

    // ─── PRODUCTION : proxy Vercel (même domaine = aucun CORS) ─────────────
    if (!import.meta.env.DEV) {
      let response: Response;
      try {
        response = await fetch("/api/admin-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password }),
        });
      } catch {
        throw new Error(
          "Impossible de joindre le serveur. Vérifiez votre connexion internet."
        );
      }

      const data = (await response.json().catch(() => ({}))) as {
        user?: { email: string; id: string; aud: string };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Erreur d'authentification.");
      }

      if (!data.user) {
        throw new Error(
          "Réponse inattendue du serveur. Veuillez réessayer."
        );
      }

      return {
        email: data.user.email,
        id: data.user.id,
        aud: data.user.aud,
      };
    }

    // ─── DÉVELOPPEMENT LOCAL : appel direct à Supabase ─────────────────────
    if (!this.isConfigured()) {
      throw new Error(
        "Variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY " +
          "manquantes dans le fichier .env local."
      );
    }

    let devResponse: Response;
    try {
      devResponse = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: cleanEmail, password }),
        }
      );
    } catch {
      throw new Error(
        "Impossible de joindre Supabase. Vérifiez votre connexion et le fichier .env."
      );
    }

    if (!devResponse.ok) {
      const errData = (await devResponse.json().catch(() => ({}))) as Record<
        string,
        string
      >;
      const msg =
        errData.error_description || errData.error || errData.msg || "";
      throw new Error(
        msg.toLowerCase().includes("invalid")
          ? "Adresse email ou mot de passe incorrect."
          : msg || `Erreur Supabase (code ${devResponse.status}).`
      );
    }

    const devData = (await devResponse.json()) as {
      user: { email: string; id: string; aud: string };
    };

    if (!devData.user) {
      throw new Error("Réponse inattendue de Supabase.");
    }

    return {
      email: devData.user.email,
      id: devData.user.id,
      aud: devData.user.aud,
    };
  },
};
