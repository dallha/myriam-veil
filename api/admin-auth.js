/**
 * api/admin-auth.js
 * Fonction Vercel Serverless — Proxy d'authentification Supabase
 *
 * L'appel à Supabase se fait ici, côté serveur, en dehors du navigateur.
 * Cela élimine à 100% tous les problèmes CORS, Safari, mode privé, etc.
 * Le navigateur appelle simplement /api/admin-auth (même domaine Vercel = aucune restriction).
 */

export default async function handler(req, res) {
  // Autoriser uniquement les requêtes POST
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

  const data = await supabaseResponse.json().catch(() => ({}));

  if (!supabaseResponse.ok) {
    const msg =
      data.error_description || data.error || data.msg || "";

    if (
      supabaseResponse.status === 400 &&
      msg.toLowerCase().includes("invalid")
    ) {
      return res
        .status(401)
        .json({ error: "Adresse email ou mot de passe incorrect." });
    }

    if (
      supabaseResponse.status === 400 &&
      msg.toLowerCase().includes("email not confirmed")
    ) {
      return res.status(403).json({
        error:
          "Votre email n'a pas encore été confirmé. " +
          "Vérifiez votre boîte de réception et cliquez sur le lien de confirmation.",
      });
    }

    return res.status(supabaseResponse.status).json({
      error:
        msg ||
        `Erreur d'authentification (code ${supabaseResponse.status}).`,
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
