import { create } from "zustand";
import { CartItem } from "../types/actions";

interface CartState {
  items: Record<string, CartItem>;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  getQuantity: (id: string) => number;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: {},
  addItem: (item) =>
    set((state) => ({
      items: {
        ...state.items,
        [item.id]: {
          ...item,
          quantity: (state.items[item.id]?.quantity ?? 0) + 1,
        },
      },
    })),
  removeItem: (id) =>
    set((state) => {
      const updated = { ...state.items };
      const current = updated[id];
      if (!current) return state;
      if ((current.quantity ?? 1) > 1) {
        updated[id] = { ...current, quantity: (current.quantity ?? 1) - 1 };
      } else {
        delete updated[id];
      }
      return { items: updated };
    }),
  getQuantity: (id) => get().items[id]?.quantity ?? 0,
  clearCart: () => set({ items: {} }),
}));

// Per-item selector subscription to ensure render isolation
export const selectQuantity = (id: string) => (state: CartState) =>
  state.items[id]?.quantity ?? 0;
