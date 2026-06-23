export type ActionType =
  | "ADD_TO_CART"
  | "DEEP_LINK"
  | "APPLY_MYSTERY_GIFT_COUPON";

export interface BaseAction<T extends ActionType, P> {
  type: T;
  payload: P;
}

export type AddToCartAction = BaseAction<"ADD_TO_CART", { productId: string; qty?: number }>;
export type DeepLinkAction = BaseAction<"DEEP_LINK", { url: string }>;
export type ApplyMysteryGiftAction = BaseAction<"APPLY_MYSTERY_GIFT_COUPON", { couponCode: string }>;

export type Action = AddToCartAction | DeepLinkAction | ApplyMysteryGiftAction;

export interface ThemeConfig {
  primary: string;
  background: string;
  ambientMotion?: "confetti" | "bubbles" | "sparkle" | "none";
}
