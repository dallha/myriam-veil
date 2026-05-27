/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CollectionId = "couture" | "ecrin" | "heritage" | "origins";

export interface Product {
  id: string;
  name: string;
  price: number;
  collectionId: CollectionId;
  imageUrl: string;
  additionalImages?: string[];
  description: string;
  category?: string;
  sizes?: string[];
  composition?: string;
  entretien?: string;
  livraison?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface ValeurCard {
  title: string;
  desc: string;
  iconName?: string; // Icon name e.g., 'Feather', 'Leaf', etc.
}

export interface TestimonialItem {
  name: string;
  role: string;
  text: string;
}

export interface HomepageContent {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  historyTitle: string;
  historySubtitle: string;
  historyText: string;
  valeurs: ValeurCard[];
  testimonials: TestimonialItem[];
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryOption: "dakar" | "hors-dakar";
  items: CartItem[];
  subtotal: number;
  total: number;
  date: string;
  status: "Nouvelle" | "En préparation" | "Expédiée" | "Livrée";
}

