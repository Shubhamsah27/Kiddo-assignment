import { create } from "zustand";

export interface CartState {
  items: Record<string, number>;
  addToCart: (productId: string, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: {},
  addToCart: (productId, qty = 1) =>
    set((state) => ({
      items: { ...state.items, [productId]: (state.items[productId] ?? 0) + qty },
    })),
  removeFromCart: (productId) =>
    set((state) => {
      const updated = { ...state.items };
      if (updated[productId] > 1) {
        updated[productId] -= 1;
      } else {
        delete updated[productId];
      }
      return { items: updated };
    }),
  clearCart: () => set({ items: {} }),
}));
