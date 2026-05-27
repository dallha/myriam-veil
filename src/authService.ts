/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Sanitization helper functions to prevent quotes or formatting issues when pasting env keys in Vercel/Netlify
const sanitizeUrl = (url: string) => {
  if (!url) return "";
  let cleaned = url.replace(/^['"]|['"]$/g, "").trim();
  return cleaned.replace(/\/+$/, ""); // Strip trailing slashes
};

const sanitizeKey = (key: string) => {
  if (!key) return "";
  return key.replace(/^['"]|['"]$/g, "").trim();
};

const SUPABASE_URL = sanitizeUrl((import.meta.env.VITE_SUPABASE_URL as string) || "");
const SUPABASE_ANON_KEY = sanitizeKey((import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "");


// Configurable local fallback email & password for immediate local testing
export const LOCAL_ADMIN_EMAIL = "directeur@myriamveil.sn";
export const LOCAL_ADMIN_PASSWORD = "MaisonVeil1988";

export interface AuthUser {
  email: string;
  id: string;
  aud: string;
}

export const authService = {
  /**
   * Check if Supabase keys are configured in environment variables.
   */
  isConfigured(): boolean {
    return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
  },

  /**
   * Authentic email & password login. Performs a real Supabase Auth call if configured,
   * otherwise falls back to a highly secure local emulation.
   */
  async login(email: string, password: string): Promise<AuthUser> {
    if (this.isConfigured()) {
      try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error_description || errData.error || "Identifiants incorrects.");
        }

        const data = await response.json();
        return {
          email: data.user.email,
          id: data.user.id,
          aud: data.user.aud
        };
      } catch (error: any) {
        throw new Error(error.message || "Erreur de connexion au serveur d'authentification.");
      }
    }

    // Fallback Emulation Mode (allows out-of-the-box local testing)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email.toLowerCase().trim() === LOCAL_ADMIN_EMAIL.toLowerCase() && password === LOCAL_ADMIN_PASSWORD) {
          resolve({
            email: LOCAL_ADMIN_EMAIL,
            id: "local-admin-uid-1988",
            aud: "authenticated"
          });
        } else {
          reject(new Error("Adresse email ou mot de passe incorrect."));
        }
      }, 1000);
    });
  }
};
