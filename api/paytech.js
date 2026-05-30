/**
 * api/paytech.js
 * Fonction Vercel Serverless — Initialisation de paiement sécurisé via l'API PayTech
 *
 * Reçoit les détails de la commande et renvoie l'URL de redirection sécurisée PayTech
 * pour effectuer le paiement via Wave, Orange Money, Free Money ou Carte Bancaire.
 */

export default async function handler(req, res) {
  // Optionnel: autoriser GET pour un diagnostic simple
  if (req.method === "GET") {
    const keySet = !!(process.env.PAYTECH_API_KEY || "").trim();
    const secretSet = !!(process.env.PAYTECH_API_SECRET || "").trim();
    return res.status(200).json({
      status: "Service de paiement PayTech opérationnel",
      api_key_configured: keySet,
      api_secret_configured: secretSet,
      timestamp: new Date().toISOString(),
    });
  }

  // Seul le POST est accepté pour initier une transaction
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const { orderId, total, customerName } = req.body || {};

  if (!orderId || !total) {
    return res.status(400).json({ error: "orderId et total requis." });
  }

  // Lecture des clés API PayTech
  const apiKey = (process.env.PAYTECH_API_KEY || "").trim();
  const apiSecret = (process.env.PAYTECH_API_SECRET || "").trim();

  // Si non configuré, mode simulation
  if (!apiKey || !apiSecret) {
    console.warn("⚠️ Clés PayTech non configurées. Activation de la simulation.");
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    const mockRedirectUrl = `${protocol}://${host}/?payment=success&orderId=${orderId}&mock=true`;

    return res.status(200).json({
      success: 1,
      redirect_url: mockRedirectUrl,
      simulation: true
    });
  }

  // Déterminer dynamiquement le protocole et l'hôte de retour
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  const successUrl = `${baseUrl}/?payment=success&orderId=${orderId}`;
  const cancelUrl = `${baseUrl}/?payment=cancel&orderId=${orderId}`;
  const ipnUrl = `${baseUrl}/api/paytech-ipn`;

  // Construire la requête PayTech
  const payload = {
    item_name: `Commande Maison Myriam Veil - ${orderId}`,
    item_price: Number(total),
    command_name: `Paiement ${orderId}`,
    ref_command: orderId,
    env: "live", // Passer en live pour les clés réelles
    ipn_url: ipnUrl,
    success_url: successUrl,
    cancel_url: cancelUrl,
    custom_field: JSON.stringify({ customerName })
  };

  try {
    const paytechResponse = await fetch("https://paytech.sn/api/payment/request-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API_KEY": apiKey,
        "API_SECRET": apiSecret
      },
      body: JSON.stringify(payload)
    });

    const responseText = await paytechResponse.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(`Réponse PayTech invalide : ${responseText}`);
    }

    if (!paytechResponse.ok || data.success !== 1) {
      console.error("Erreur PayTech API Response:", data);
      return res.status(paytechResponse.status || 502).json({
        error: data.error?.[0] || data.message || "Une erreur est survenue lors de l'appel à PayTech.",
        raw: data
      });
    }

    // Succès: retourner l'URL de redirection sécurisée PayTech
    return res.status(200).json({
      success: 1,
      redirect_url: data.redirect_url,
      token: data.token
    });

  } catch (error) {
    console.error("Erreur lors de l'initialisation de la transaction:", error);
    return res.status(500).json({
      error: "Impossible d'initier le paiement en ligne. Veuillez réessayer."
    });
  }
}
