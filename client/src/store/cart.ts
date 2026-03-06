import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@shared/schema';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  getTotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, { product, quantity }], isOpen: true };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: quantity === 0
            ? state.items.filter((i) => i.product.id !== productId)
            : state.items.map((i) => i.product.id === productId ? { ...i, quantity } : i),
        }));
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (isOpen) => set({ isOpen }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },
    }),
    {
      name: 'makhana-cart',
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);
