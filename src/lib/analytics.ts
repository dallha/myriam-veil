/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * analytics.ts — Service d'analytics minimaliste et respectueux de la vie privée
 *
 * Utilise le localStorage pour stocker les événements localement.
 * Pas de cookie tiers, pas de tracking externe.
 * Les données peuvent être exportées depuis le dashboard admin.
 */

export type AnalyticsEventType = 
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "remove_from_cart"
  | "checkout_start"
  | "order_placed"
  | "order_status_update"
  | "admin_login"
  | "search"
  | "collection_view";

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: string;
  data?: Record<string, string | number | boolean>;
  sessionId: string;
}

// ============================================================
// SESSION MANAGEMENT
// ============================================================

function getSessionId(): string {
  let sessionId = sessionStorage.getItem("mv_session_id");
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("mv_session_id", sessionId);
  }
  return sessionId;
}

// ============================================================
// EVENT STORAGE
// ============================================================

function getEvents(): AnalyticsEvent[] {
  try {
    const stored = localStorage.getItem("mv_analytics_events");
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveEvents(events: AnalyticsEvent[]) {
  // Keep only last 1000 events to avoid localStorage overflow
  const trimmed = events.slice(-1000);
  localStorage.setItem("mv_analytics_events", JSON.stringify(trimmed));
}

// ============================================================
// EXPORTED FUNCTIONS
// ============================================================

export const analytics = {
  /**
   * Enregistre un événement analytics.
   */
  track(eventType: AnalyticsEventType, data?: Record<string, string | number | boolean>): void {
    try {
      const event: AnalyticsEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: eventType,
        timestamp: new Date().toISOString(),
        data,
        sessionId: getSessionId(),
      };

      const events = getEvents();
      events.push(event);
      saveEvents(events);
    } catch (err) {
      // Silently fail — analytics should never break the app
      console.warn("[Analytics] Failed to track event:", err);
    }
  },

  /**
   * Récupère tous les événements enregistrés.
   */
  getEvents(): AnalyticsEvent[] {
    return getEvents();
  },

  /**
   * Récupère les statistiques agrégées.
   */
  getStats(): {
    totalPageViews: number;
    totalOrders: number;
    totalAddToCart: number;
    topProducts: { productId: string; count: number }[];
    dailyViews: { date: string; count: number }[];
  } {
    const events = getEvents();

    const totalPageViews = events.filter(e => e.type === "page_view").length;
    const totalOrders = events.filter(e => e.type === "order_placed").length;
    const totalAddToCart = events.filter(e => e.type === "add_to_cart").length;

    // Top products by add_to_cart events
    const productCounts: Record<string, number> = {};
    events
      .filter(e => e.type === "add_to_cart" && e.data?.productId)
      .forEach(e => {
        const pid = String(e.data!.productId);
        productCounts[pid] = (productCounts[pid] || 0) + 1;
      });

    const topProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([productId, count]) => ({ productId, count }));

    // Daily page views (last 30 days)
    const dailyCounts: Record<string, number> = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    events
      .filter(e => e.type === "page_view" && new Date(e.timestamp) >= thirtyDaysAgo)
      .forEach(e => {
        const date = e.timestamp.split("T")[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });

    const dailyViews = Object.entries(dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    return {
      totalPageViews,
      totalOrders,
      totalAddToCart,
      topProducts,
      dailyViews,
    };
  },

  /**
   * Efface tous les événements analytics.
   */
  clear(): void {
    localStorage.removeItem("mv_analytics_events");
  },

  /**
   * Exporte les événements au format JSON.
   */
  export(): string {
    return JSON.stringify(getEvents(), null, 2);
  },
};
