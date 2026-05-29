import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';

interface CartState {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: Product, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  removeItem: (productId: string, selectedSize?: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      
      get cartCount() {
        return get().cartItems.reduce((acc, item) => acc + item.quantity, 0);
      },

      addToCart: (product, selectedSize) => {
        set((state) => {
          const existingIdx = state.cartItems.findIndex(
            (item) => item.product.id === product.id && item.selectedSize === selectedSize
          );

          if (existingIdx > -1) {
            const updated = [...state.cartItems];
            updated[existingIdx].quantity += 1;
            return { cartItems: updated };
          } else {
            return { cartItems: [...state.cartItems, { product, quantity: 1, selectedSize }] };
          }
        });
      },

      updateQuantity: (productId, quantity, selectedSize) => {
        if (quantity < 1) {
          get().removeItem(productId, selectedSize);
          return;
        }

        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.product.id === productId && item.selectedSize === selectedSize
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      removeItem: (productId, selectedSize) => {
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => !(item.product.id === productId && item.selectedSize === selectedSize)
          ),
        }));
      },

      clearCart: () => {
        set({ cartItems: [] });
      },
    }),
    {
      name: 'myriam_veil_cart', // Name of the localStorage key
    }
  )
);
