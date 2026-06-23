export type ActionType =
  | "ADD_TO_CART"
  | "REMOVE_FROM_CART"
  | "NAVIGATE"
  | "APPLY_COUPON";

export interface Action {
  type: ActionType;
  payload: Record<string, unknown>;
}

export interface ThemeConfig {
  primary: string;
  background: string;
  accent: string;
  ambientMotion?: "confetti" | "bubbles" | "sparkle";
}
export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  quantity?: number;
}
