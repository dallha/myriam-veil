/**
 * api/paytech-ipn.js
 * Fonction Vercel Serverless — Instant Payment Notification (IPN) de PayTech
 *
 * Reçoit les notifications asynchrones sécurisées de PayTech lors de la réussite d'une transaction,
 * authentifie la source et valide le paiement dans le système.
 */

import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const payload = req.body || {};
  console.log("📥 Requête IPN PayTech reçue :", payload);

  const {
    type_event,
    token,
    ref_command,
    item_price,
    api_key_sha256,
    api_secret_sha256
  } = payload;

  if (!token || !ref_command) {
    return res.status(400).json({ error: "Paramètres requis manquants." });
  }

  // Clés API locales pour authentifier la provenance
  const apiKey = (process.env.PAYTECH_API_KEY || "").trim();
  const apiSecret = (process.env.PAYTECH_API_SECRET || "").trim();

  if (apiKey && apiSecret) {
    // Calculer les empreintes SHA-256 locales pour vérifier la sécurité de l'appel
    const localKeySha = crypto.createHash("sha256").update(apiKey).digest("hex");
    const localSecretSha = crypto.createHash("sha256").update(apiSecret).digest("hex");

    if (api_key_sha256 !== localKeySha || api_secret_sha256 !== localSecretSha) {
      console.error("❌ Échec d'authentification de la notification IPN. Hashes non valides.");
      return res.status(401).json({ error: "Authentification de la requête échouée." });
    }
  }

  // Traiter la réussite de la vente
  if (type_event === "sale_complete") {
    console.log(`✅ Transaction validée de manière asynchrone par IPN pour la commande ${ref_command} (${item_price} FCFA)`);
    // Ici, vous pouvez par exemple ajouter des appels Supabase pour modifier le statut
    // de la commande directement en base de données.
  }

  return res.status(200).json({ success: true, message: "IPN traité avec succès" });
}
