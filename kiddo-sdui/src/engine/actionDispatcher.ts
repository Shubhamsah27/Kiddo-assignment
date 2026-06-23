import { Action } from "../types/actions";
import { useCartStore } from "../state/cartStore";
import { Alert } from "react-native";

export function handleAction(action: Action) {
  console.log(`[ActionDispatcher] Processing action type: ${action.type}`, action.payload);
  
  switch (action.type) {
    case "ADD_TO_CART":
      useCartStore.getState().addToCart(action.payload.productId, action.payload.qty);
      break;
    case "DEEP_LINK":
      Alert.alert("Deep Link Triggered", `Navigating to: ${action.payload.url}`);
      break;
    case "APPLY_MYSTERY_GIFT_COUPON":
      Alert.alert(
        "Coupon Applied! 🎁",
        `Mystery Gift coupon code "${action.payload.couponCode}" has been successfully added to your order.`
      );
      break;
    default:
      console.warn(`[ActionDispatcher] Unknown or unhandled action:`, action);
  }
}
