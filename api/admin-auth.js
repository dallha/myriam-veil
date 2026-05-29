/**
 * api/admin-auth.js
 * Fonction Vercel Serverless — Proxy d'authentification Supabase
 *
 * L'appel à Supabase se fait ici, côté serveur, en dehors du navigateur.
 * Cela élimine à 100% tous les problèmes CORS, Safari, mode privé, etc.
 * Le navigateur appelle simplement /api/admin-auth (même domaine Vercel = aucune restriction).
 */

export default async function handler(req, res) {
  // GET : diagnostic — ouvrez /api/admin-auth dans un navigateur pour tester
  if (req.method === "GET") {
    const urlSet = !!(process.env.VITE_SUPABASE_URL || "").trim();
    const keySet = !!(process.env.VITE_SUPABASE_ANON_KEY || "").trim();
    return res.status(200).json({
      status: "Fonction Vercel opérationnelle",
      supabase_url_configured: urlSet,
      supabase_key_configured: keySet,
      timestamp: new Date().toISOString(),
    });
  }

  // Autoriser uniquement les requêtes POST pour l'auth
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }

  // Lire les variables d'environnement côté serveur
  const supabaseUrl = (process.env.VITE_SUPABASE_URL || "")
    .replace(/^['"]+|['"]+$/g, "")
    .trim()
    .replace(/\/+$/, "");

  const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || "")
    .replace(/^['"]+|['"]+$/g, "")
    .trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(503).json({
      error:
        "Configuration serveur manquante : VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY " +
        "non définie dans les variables d'environnement Vercel.",
    });
  }

  let supabaseResponse;
  try {
    // Appel Supabase depuis le serveur — aucune restriction navigateur
    supabaseResponse = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      }
    );
  } catch (networkError) {
    return res.status(502).json({
      error:
        "Le serveur n'a pas pu joindre Supabase. Vérifiez que l'URL du projet Supabase est correcte.",
    });
  }

  const supabaseText = await supabaseResponse.text();
  let data = {};
  try {
    data = JSON.parse(supabaseText);
  } catch {
    data = {};
  }

  if (!supabaseResponse.ok) {
    const errorCode = String(
      (data.error_code || data.error || "unknown")
    ).trim();
    const msg = String(
      (data.error_description || data.msg || data.error || supabaseText || "")
    ).trim();

    // Email non confirmé
    if (
      errorCode === "email_not_confirmed" ||
      msg.toLowerCase().includes("email not confirmed")
    ) {
      return res.status(403).json({
        error:
          "Votre email n'a pas encore été confirmé. " +
          "Allez dans Supabase → Authentication → Users, trouvez votre email et cliquez sur \"Confirm email\". " +
          "Ou confirmez-le via SQL : UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = '" +
          (email + "';"),
        supabase_error_code: errorCode,
        supabase_status: supabaseResponse.status,
        supabase_body: supabaseText,
      });
    }

    // Mauvais identifiants
    if (
      errorCode === "invalid_credentials" ||
      msg.toLowerCase().includes("invalid")
    ) {
      return res.status(401).json({
        error: "Adresse email ou mot de passe incorrect.",
        supabase_error_code: errorCode,
        supabase_status: supabaseResponse.status,
        supabase_body: supabaseText,
      });
    }

    // Autre erreur Supabase — renvoie le message brut pour diagnostic
    return res.status(supabaseResponse.status).json({
      error:
        msg ||
        `Erreur Supabase (code: ${errorCode}, statut: ${supabaseResponse.status}).`,
      supabase_error_code: errorCode,
      supabase_status: supabaseResponse.status,
      supabase_body: supabaseText,
    });
  }

  if (!data.user) {
    return res
      .status(502)
      .json({ error: "Réponse inattendue de Supabase. Veuillez réessayer." });
  }

  // Renvoyer uniquement les informations nécessaires au client
  return res.status(200).json({
    user: {
      email: data.user.email,
      id: data.user.id,
      aud: data.user.aud,
    },
  });
}
