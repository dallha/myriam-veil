/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference types="vite/client" />

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
   * with an immediate master key bypass for local/emergency development.
   */
  async login(email: string, password: string): Promise<AuthUser> {
    const cleanEmail = email.toLowerCase().trim();
    const isLocalBypass = cleanEmail === LOCAL_ADMIN_EMAIL.toLowerCase() && password === LOCAL_ADMIN_PASSWORD;

    // Master Key Bypass - always allowed to ensure administrator is never locked out
    if (isLocalBypass) {
      return {
        email: LOCAL_ADMIN_EMAIL,
        id: "local-admin-uid-1988",
        aud: "authenticated"
      };
    }

    if (this.isConfigured()) {
      try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email: cleanEmail, password })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error_description || errData.error || "Adresse email ou mot de passe incorrect.");
        }

        const data = await response.json();
        return {
          email: data.user.email,
          id: data.user.id,
          aud: data.user.aud
        };
      } catch (error: any) {
        // Detailed premium developer diagnostics for Vercel/Supabase CORS/403 gateway issues
        const errorMsg = error.message || "";
        const isNetworkOrCORS = errorMsg.includes("Failed to fetch") || errorMsg.includes("access control checks") || errorMsg.includes("Origin");
        
        let diagnosticMessage = `Erreur Supabase: ${errorMsg || "Échec de connexion"}`;
        
        if (isNetworkOrCORS || responseStatusIs403(errorMsg)) {
          diagnosticMessage = `⚠️ Blocage de Connexion Supabase (CORS / 403)
----------------------------------------
• URL Supabase : ${SUPABASE_URL || "Non définie"}
• Clé API Anon  : ${SUPABASE_ANON_KEY ? (SUPABASE_ANON_KEY.substring(0, 10) + "..." + SUPABASE_ANON_KEY.substring(SUPABASE_ANON_KEY.length - 10) + " (" + SUPABASE_ANON_KEY.length + " caractères)") : "Non définie"}

🔍 Diagnostic & Résolution :
1. Avez-vous Redéployé sur Vercel ? Vercel n'applique pas les nouvelles variables d'environnement sur un build existant. Allez sur Vercel et cliquez sur "Redeploy" pour forcer la compilation Vite avec vos clés.
2. Clé ou URL Incorrecte : Vérifiez que les clés copiées dans Vercel ne contiennent pas de guillemets doubles en trop.
3. Blocage de Navigateur : Safari en mode Privé bloque les requêtes cross-origin vers supabase.co (considérés comme traceurs). Utilisez Chrome ou désactivez le mode privé.

🔑 Bypass d'Urgence :
Utilisez les identifiants maîtres Maison ci-dessous pour contourner Supabase et vous connecter instantanément !`;
        }
        
        throw new Error(diagnosticMessage);
      }
    }

    // Fallback Emulation Mode (allows out-of-the-box local testing)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (isLocalBypass) {
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

// Helper outside authService block
function responseStatusIs403(msg: string): boolean {
  return msg.toLowerCase().includes("403") || msg.toLowerCase().includes("forbidden");
}
