import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Product, Order, HomepageContent } from './types';
import { PRODUCTS, DEFAULT_HOMEPAGE_CONTENT } from './data';

export const dataService = {
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && data && data.length > 0) return data as Product[];
      } catch (err) {
        console.warn('Supabase fetch products failed, falling back to local storage', err);
      }
    }
    // Fallback Local Storage
    try {
      const stored = localStorage.getItem("myriam_veil_products");
      if (stored) return JSON.parse(stored);
    } catch {}
    return PRODUCTS;
  },

  async getHomepageContent(): Promise<HomepageContent> {
    try {
      const stored = localStorage.getItem("myriam_veil_homepage");
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_HOMEPAGE_CONTENT;
  },

  async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
        if (!error && data) return data as Order[];
      } catch (err) {
        console.warn('Supabase fetch orders failed, falling back to local storage', err);
      }
    }
    // Fallback Local Storage
    try {
      const stored = localStorage.getItem("myriam_veil_orders");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  },
};
