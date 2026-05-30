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
  mfaRequired?: boolean;
}

import { supabase, isSupabaseConfigured } from "./lib/supabase";

export const authService = {
  isConfigured(): boolean {
    return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
  },

  async signInGuest() {
    if (!isSupabaseConfigured()) throw new Error("Supabase non configuré pour le mode invité.");
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data;
  },

  async upgradeGuestToClient(email: string, password?: string) {
    if (!isSupabaseConfigured()) throw new Error("Supabase non configuré pour le mode invité.");
    
    // Si password est fourni, on fait un upgrade classique Email/Password
    const updatePayload: any = { email };
    if (password) updatePayload.password = password;

    const { data, error } = await supabase.auth.updateUser(updatePayload);
    if (error) throw error;
    return data;
  },

  async login(email: string, password: string): Promise<AuthUser> {
    const cleanEmail = email.toLowerCase().trim();

    if (!isSupabaseConfigured()) {
      throw new Error(
        "Supabase n'est pas configuré. Veuillez renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY."
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      throw new Error(error.message || "Adresse email ou mot de passe incorrect.");
    }

    if (!data.user) {
      throw new Error("Réponse inattendue de Supabase.");
    }

    // Vérifier si la double authentification (MFA) est requise pour cette session
    const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    if (aalError) {
      console.warn("Erreur lors de la vérification AAL:", aalError);
    }

    const mfaRequired = aalData && aalData.nextLevel === 'aal2' && aalData.currentLevel === 'aal1';

    return {
      email: data.user.email || "",
      id: data.user.id,
      aud: data.user.aud,
      mfaRequired: !!mfaRequired,
    };
  },

  /**
   * Enrôle l'utilisateur dans la MFA TOTP.
   * Retourne le factorId et les détails du QR Code (Base64 SVG, clé secrète, uri).
   */
  async enrollMfa(friendlyName: string) {
    if (!isSupabaseConfigured()) throw new Error("Supabase non configuré.");
    
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'Myriam Veil',
      friendlyName
    });

    if (error) throw error;
    return data;
  },

  /**
   * Challenge et valide le code TOTP pour finaliser l'enrôlement.
   */
  async verifyMfaEnrollment(factorId: string, code: string) {
    if (!isSupabaseConfigured()) throw new Error("Supabase non configuré.");

    // 1. Créer un challenge
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) throw challengeError;

    // 2. Valider le challenge
    const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code
    });

    if (verifyError) throw verifyError;
    return verifyData;
  },

  /**
   * Challenge et valide le code TOTP lors de la connexion.
   */
  async verifyMfaLogin(code: string) {
    if (!isSupabaseConfigured()) throw new Error("Supabase non configuré.");

    // 1. Lister les facteurs actifs
    const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) throw factorsError;

    const activeFactor = factorsData.all?.find(
      (f: any) => f.factor_type === 'totp' && f.status === 'verified'
    );

    if (!activeFactor) {
      throw new Error("Aucun facteur de double authentification actif trouvé.");
    }

    // 2. Créer un challenge
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: activeFactor.id });
    if (challengeError) throw challengeError;

    // 3. Valider le challenge
    const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
      factorId: activeFactor.id,
      challengeId: challengeData.id,
      code
    });

    if (verifyError) throw verifyError;
    return verifyData;
  },

  /**
   * Désactive et supprime tous les facteurs MFA TOTP.
   */
  async unenrollMfa() {
    if (!isSupabaseConfigured()) throw new Error("Supabase non configuré.");

    const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) throw factorsError;

    const factors = factorsData.all || [];
    for (const factor of factors) {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
      if (error) throw error;
    }
  },

  /**
   * Vérifie si la double authentification est activée pour l'utilisateur.
   */
  async isMfaActive(): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) return false;
      return (data.all || []).some(
        (f: any) => f.factor_type === 'totp' && f.status === 'verified'
      );
    } catch {
      return false;
    }
  },

  /**
   * Déconnexion de l'utilisateur.
   */
  async logout() {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};
