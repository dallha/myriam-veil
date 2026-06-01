/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * emailService.ts — Service d'envoi d'emails transactionnels
 *
 * Utilise l'API Resend pour l'envoi d'emails en production.
 * En développement, les emails sont loggés dans la console.
 *
 * Configuration requise dans .env :
 *   VITE_RESEND_API_KEY=re_xxx
 *   VITE_EMAIL_FROM=contact@myriamveil.com
 */

import { Order } from "../types";

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || "";
const EMAIL_FROM = import.meta.env.VITE_EMAIL_FROM || "noreply@myriamveil.com";

function isConfigured(): boolean {
  return RESEND_API_KEY !== "" && RESEND_API_KEY.startsWith("re_");
}

/**
 * Envoie un email via l'API Resend.
 * En développement, simule l'envoi.
 */
async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!isConfigured()) {
    console.log("[EmailService] Mode développement — Email simulé :", {
      to: params.to,
      subject: params.subject,
    });
    return { success: true, messageId: `simulated-${Date.now()}` };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Myriam Veil <${EMAIL_FROM}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Resend API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (err: any) {
    console.error("[EmailService] Erreur d'envoi :", err);
    return { success: false, error: err.message };
  }
}

// ============================================================
// TEMPLATES D'EMAILS
// ============================================================

function orderConfirmationTemplate(order: Order): string {
  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>${item.product.name}</strong>
            ${item.selectedSize ? `<span style="color: #888;"> (Taille: ${item.selectedSize})</span>` : ""}
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">
            ${(item.product.price * item.quantity).toLocaleString("fr-FR")} FCFA
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
          <h1 style="color: #C6A962; font-size: 24px; margin: 0; letter-spacing: 2px; font-weight: 300;">MYRIAM VEIL</h1>
          <p style="color: #ffffff; font-size: 12px; margin-top: 8px; opacity: 0.8;">Confirmation de commande</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <p style="color: #333; font-size: 14px; line-height: 1.6;">
            Bonjour <strong>${order.customerName}</strong>,
          </p>
          <p style="color: #555; font-size: 13px; line-height: 1.6;">
            Nous avons le plaisir de vous confirmer la réception de votre commande. 
            Notre atelier s'affaire déjà à préparer vos pièces avec le plus grand soin.
          </p>

          <div style="background: #fafafa; border: 1px solid #eee; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <p style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
              N° de commande
            </p>
            <p style="font-size: 16px; color: #C6A962; font-weight: bold; margin: 0;">
              ${order.id}
            </p>
          </div>

          <!-- Order Details -->
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f8f8f8;">
                <th style="padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #888;">Article</th>
                <th style="padding: 10px; text-align: center; font-size: 11px; text-transform: uppercase; color: #888;">Qté</th>
                <th style="padding: 10px; text-align: right; font-size: 11px; text-transform: uppercase; color: #888;">Prix</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Total -->
          <div style="border-top: 2px solid #C6A962; padding-top: 12px; text-align: right; margin: 16px 0;">
            <p style="font-size: 18px; color: #1a1a2e; font-weight: bold; margin: 0;">
              Total : ${order.total.toLocaleString("fr-FR")} FCFA
            </p>
            <p style="font-size: 11px; color: #888; margin: 4px 0 0 0;">
              ${order.paymentMethod === "online" ? "✓ Paiement en ligne validé" : "💳 Paiement à la livraison"}
            </p>
          </div>

          <!-- Delivery Info -->
          <div style="background: #f8f8f8; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <p style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
              Informations de livraison
            </p>
            <p style="font-size: 13px; color: #333; margin: 2px 0;">
              📍 ${order.customerAddress}
            </p>
            <p style="font-size: 13px; color: #333; margin: 2px 0;">
              📞 ${order.customerPhone}
            </p>
            <p style="font-size: 12px; color: #888; margin: 4px 0 0 0;">
              ${order.deliveryOption === "dakar" ? "🚚 Livraison Dakar (24-48h)" : "📦 Livraison hors Dakar (3-5 jours ouvrés)"}
            </p>
          </div>

          <p style="color: #555; font-size: 12px; line-height: 1.6; margin-top: 20px;">
            Notre équipe reste à votre disposition pour toute question. 
            Vous pouvez nous joindre par WhatsApp au <strong>+221 77 319 42 79</strong>.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #1a1a2e; padding: 20px; text-align: center;">
          <p style="color: #888; font-size: 11px; margin: 0;">
            Maison Myriam Veil — Dakar, Sénégal<br>
            L'Élégance de la Pudeur, l'Héritage d'une Mère.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function orderStatusTemplate(order: Order): string {
  const statusLabels: Record<string, string> = {
    "Nouvelle": "📋 Commande reçue",
    "En préparation": "👗 En cours de confection",
    "Expédiée": "📦 Expédiée",
    "Livrée": "✅ Livrée",
  };

  const statusMessages: Record<string, string> = {
    "Nouvelle": "Votre commande a bien été reçue et est en attente de traitement.",
    "En préparation": "Votre commande est actuellement en cours de confection dans notre atelier.",
    "Expédiée": "Votre commande a été expédiée et est en route vers votre adresse.",
    "Livrée": "Votre commande a été livrée. Nous espérons qu'elle vous apporte toute la satisfaction que vous méritez.",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
          <h1 style="color: #C6A962; font-size: 24px; margin: 0; letter-spacing: 2px; font-weight: 300;">MYRIAM VEIL</h1>
          <p style="color: #ffffff; font-size: 12px; margin-top: 8px; opacity: 0.8;">Mise à jour de votre commande</p>
        </div>

        <div style="padding: 30px;">
          <p style="color: #333; font-size: 14px; line-height: 1.6;">
            Bonjour <strong>${order.customerName}</strong>,
          </p>

          <div style="background: #fafafa; border: 1px solid #C6A962; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="font-size: 32px; margin: 0;">${statusLabels[order.status] || "📋 Mise à jour"}</p>
            <p style="font-size: 14px; color: #555; margin: 12px 0 0 0; line-height: 1.6;">
              ${statusMessages[order.status] || "Le statut de votre commande a été mis à jour."}
            </p>
          </div>

          <div style="background: #f8f8f8; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <p style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">
              N° de commande
            </p>
            <p style="font-size: 14px; color: #C6A962; font-weight: bold; margin: 0;">
              ${order.id}
            </p>
          </div>

          <p style="color: #555; font-size: 12px; line-height: 1.6;">
            Pour toute question, contactez-nous sur WhatsApp au <strong>+221 77 319 42 79</strong>.
          </p>
        </div>

        <div style="background: #1a1a2e; padding: 20px; text-align: center;">
          <p style="color: #888; font-size: 11px; margin: 0;">
            Maison Myriam Veil — Dakar, Sénégal
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================================
// EXPORTED FUNCTIONS
// ============================================================

export const emailService = {
  /**
   * Envoie un email de confirmation de commande au client.
   */
  async sendOrderConfirmation(order: Order, customerEmail?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const email = customerEmail || order.customerEmail || "";
    if (!email) {
      console.warn("[EmailService] Aucun email client fourni pour la confirmation de commande.");
      return { success: false, error: "Email client manquant" };
    }

    return sendEmail({
      to: email,
      subject: `Confirmation de commande #${order.id} — Myriam Veil`,
      html: orderConfirmationTemplate(order),
    });
  },

  /**
   * Envoie un email de mise à jour de statut de commande au client.
   */
  async sendOrderStatusUpdate(order: Order, customerEmail?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const email = customerEmail || order.customerEmail || "";
    if (!email) {
      console.warn("[EmailService] Aucun email client fourni pour la mise à jour de statut.");
      return { success: false, error: "Email client manquant" };
    }

    return sendEmail({
      to: email,
      subject: `Mise à jour commande #${order.id} — ${order.status} — Myriam Veil`,
      html: orderStatusTemplate(order),
    });
  },

  /**
   * Vérifie si le service est configuré.
   */
  isConfigured,
};
