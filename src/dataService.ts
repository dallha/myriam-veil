/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * dataService.ts — Service de données avec synchronisation Supabase bidirectionnelle
 *
 * Ce service assure :
 *  - Lecture depuis Supabase avec fallback localStorage
 *  - Écriture vers Supabase (CRUD complet) avec fallback localStorage
 *  - Synchronisation automatique des modifications
 */

import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Product, Order, HomepageContent, BlogPost } from './types';
import { PRODUCTS, DEFAULT_HOMEPAGE_CONTENT } from './data';

// ============================================================
// HELPERS
// ============================================================

function getLocalProducts(): Product[] {
  try {
    const stored = localStorage.getItem("myriam_veil_products");
    if (stored) return JSON.parse(stored);
  } catch {}
  return PRODUCTS;
}

function setLocalProducts(products: Product[]) {
  localStorage.setItem("myriam_veil_products", JSON.stringify(products));
}

function getLocalHomepage(): HomepageContent {
  try {
    const stored = localStorage.getItem("myriam_veil_homepage");
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_HOMEPAGE_CONTENT;
}

function setLocalHomepage(content: HomepageContent) {
  localStorage.setItem("myriam_veil_homepage", JSON.stringify(content));
}

function getLocalOrders(): Order[] {
  try {
    const stored = localStorage.getItem("myriam_veil_orders");
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function setLocalOrders(orders: Order[]) {
  localStorage.setItem("myriam_veil_orders", JSON.stringify(orders));
}

// ============================================================
// PRODUCTS
// ============================================================

async function syncProductsToSupabase(products: Product[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    // Upsert all products (delete + re-insert for simplicity)
    const { error: deleteError } = await supabase.from('products').delete().neq('id', '__dummy__');
    if (deleteError) throw deleteError;

    const { error: insertError } = await supabase.from('products').insert(
      products.map(p => ({
        ...p,
        additionalImages: p.additionalImages || [],
        sizes: p.sizes || [],
        visible: p.visible ?? true,
      }))
    );
    if (insertError) throw insertError;
    return true;
  } catch (err) {
    console.warn('Supabase sync products failed:', err);
    return false;
  }
}

// ============================================================
// ORDERS
// ============================================================

async function syncOrdersToSupabase(orders: Order[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error: deleteError } = await supabase.from('orders').delete().neq('id', '__dummy__');
    if (deleteError) throw deleteError;

    if (orders.length > 0) {
      const { error: insertError } = await supabase.from('orders').insert(orders);
      if (insertError) throw insertError;
    }
    return true;
  } catch (err) {
    console.warn('Supabase sync orders failed:', err);
    return false;
  }
}

// ============================================================
// HOMEPAGE CONTENT
// ============================================================

async function syncHomepageToSupabase(content: HomepageContent): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    // Store homepage content as a single row in a 'settings' table
    const { error } = await supabase
      .from('settings')
      .upsert({ id: 'homepage', content }, { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase sync homepage failed:', err);
    return false;
  }
}

// ============================================================
// EXPORTED SERVICE
// ============================================================

export const dataService = {
  // ---- READ ----

  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && data && data.length > 0) {
          const products = data as Product[];
          // Sync to localStorage as cache
          setLocalProducts(products);
          return products;
        }
      } catch (err) {
        console.warn('Supabase fetch products failed, falling back to local storage', err);
      }
    }
    return getLocalProducts();
  },

  async getHomepageContent(): Promise<HomepageContent> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('settings').select('content').eq('id', 'homepage').single();
        if (!error && data?.content) {
          const content = data.content as HomepageContent;
          setLocalHomepage(content);
          return content;
        }
      } catch (err) {
        console.warn('Supabase fetch homepage failed, falling back to local storage', err);
      }
    }
    return getLocalHomepage();
  },

  async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
        if (!error && data) {
          const orders = data as Order[];
          setLocalOrders(orders);
          return orders;
        }
      } catch (err) {
        console.warn('Supabase fetch orders failed, falling back to local storage', err);
      }
    }
    return getLocalOrders();
  },

  // ---- WRITE (with sync) ----

  async saveProducts(products: Product[]): Promise<void> {
    setLocalProducts(products);
    await syncProductsToSupabase(products);
  },

  async saveHomepageContent(content: HomepageContent): Promise<void> {
    setLocalHomepage(content);
    await syncHomepageToSupabase(content);
  },

  async saveOrders(orders: Order[]): Promise<void> {
    setLocalOrders(orders);
    await syncOrdersToSupabase(orders);
  },

  async addOrder(order: Order): Promise<void> {
    const orders = [order, ...getLocalOrders()];
    setLocalOrders(orders);
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('orders').insert(order);
        if (error) throw error;
      } catch (err) {
        console.warn('Supabase insert order failed:', err);
      }
    }
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const orders = getLocalOrders().map(o => (o.id === orderId ? { ...o, status } : o));
    setLocalOrders(orders);
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
        if (error) throw error;
      } catch (err) {
        console.warn('Supabase update order status failed:', err);
      }
    }
  },

  async deleteOrder(orderId: string): Promise<void> {
    const orders = getLocalOrders().filter(o => o.id !== orderId);
    setLocalOrders(orders);
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (error) throw error;
      } catch (err) {
        console.warn('Supabase delete order failed:', err);
      }
    }
  },

  // ---- BLOG POSTS ----

  async getBlogPosts(): Promise<BlogPost[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('blog_posts').select('*').order('date', { ascending: false });
        if (!error && data) return data as BlogPost[];
      } catch (err) {
        console.warn('Supabase fetch blog posts failed:', err);
      }
    }
    try {
      const stored = localStorage.getItem("myriam_veil_blog_posts");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  },

  async saveBlogPosts(posts: BlogPost[]): Promise<void> {
    localStorage.setItem("myriam_veil_blog_posts", JSON.stringify(posts));
    if (!isSupabaseConfigured()) return;
    try {
      const { error: deleteError } = await supabase.from('blog_posts').delete().neq('id', '__dummy__');
      if (deleteError) throw deleteError;
      if (posts.length > 0) {
        const { error: insertError } = await supabase.from('blog_posts').insert(posts);
        if (insertError) throw insertError;
      }
    } catch (err) {
      console.warn('Supabase sync blog posts failed:', err);
    }
  },

  // ---- FULL EXPORT / IMPORT ----

  async exportAll(): Promise<{ products: Product[]; homepageContent: HomepageContent; orders: Order[] }> {
    const [products, homepageContent, orders] = await Promise.all([
      this.getProducts(),
      this.getHomepageContent(),
      this.getOrders(),
    ]);
    return { products, homepageContent, orders };
  },

  async importAll(data: { products: Product[]; homepageContent: HomepageContent; orders: Order[] }): Promise<void> {
    await Promise.all([
      this.saveProducts(data.products),
      this.saveHomepageContent(data.homepageContent),
      this.saveOrders(data.orders),
    ]);
  },
};
