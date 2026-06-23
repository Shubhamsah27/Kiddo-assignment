export type Action =
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: { id: string } }
  | { type: "NAVIGATE"; payload: { route: string } }
  | { type: "APPLY_COUPON"; payload: { couponCode: string } };

export interface ThemeConfig {
  primary: string;
  background: string;
  accent: string;
  surface: string;
  text: string;
  textMuted: string;
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
