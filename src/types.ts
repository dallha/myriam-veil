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
  related_product_ids?: string[];
  visible?: boolean;
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

export interface ReassuranceBlock {
  title: string;
  desc: string;
}

export interface HomepageContent {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText?: string;
  heroBgUrl?: string;
  logoText?: string;
  
  // Contacts
  contactPhone?: string;
  contactSecPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  
  // Socials
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  
  // Histoire
  historyTitle: string;
  historySubtitle: string;
  historyText: string;
  
  // Reassurance
  statsClients?: string;
  statsRating?: string;
  reassurance1?: ReassuranceBlock;
  reassurance2?: ReassuranceBlock;
  reassurance3?: ReassuranceBlock;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  
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

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  imageUrl: string;
  date: string;
  visible: boolean;
}

