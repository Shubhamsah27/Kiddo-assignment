import { Action } from "../types/actions";
import { useCartStore } from "../state/cartStore";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";

const actionHandlers: Record<Action["type"], (payload: any) => void> = {
  ADD_TO_CART: (payload) => {
    useCartStore.getState().addItem(payload);
    // Haptics tick delight (Light impact feedback)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  REMOVE_FROM_CART: (payload) => {
    useCartStore.getState().removeItem(payload.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  NAVIGATE: (payload) => {
    Alert.alert("Navigation Triggered", `Navigating to route: ${payload.route}`);
  },
  APPLY_COUPON: (payload) => {
    Alert.alert(
      "Coupon Applied! 🎁",
      `Mystery Gift coupon "${payload.couponCode}" has been successfully added to your order.`
    );
  },
};

export function handleAction(action: Action): void {
  console.log(`[ActionDispatcher] Processing action type: ${action.type}`, action.payload);
  
  const handler = actionHandlers[action.type];
  if (handler) {
    handler(action.payload);
  } else {
    console.warn(`[ActionDispatcher] Unknown or unhandled action:`, action);
  }
}
