import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@shared/schema";

interface WishlistState {
    items: Product[];
    isOpen: boolean;
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    toggleItem: (product: Product) => void;
    setIsOpen: (isOpen: boolean) => void;
    clearWishlist: () => void;
}

export const useWishlist = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            addItem: (product) => {
                const { items } = get();
                if (!items.find((i) => i.id === product.id)) {
                    set({ items: [...items, product] });
                }
            },
            removeItem: (productId) =>
                set((state) => ({
                    items: state.items.filter((i) => i.id !== productId),
                })),
            toggleItem: (product) => {
                const { items } = get();
                if (items.find((i) => i.id === product.id)) {
                    set({ items: items.filter((i) => i.id !== product.id) });
                } else {
                    set({ items: [...items, product] });
                }
            },
            setIsOpen: (isOpen) => set({ isOpen }),
            clearWishlist: () => set({ items: [] }),
        }),
        {
            name: "wishlist-storage", // stores in localStorage
        }
    )
);
