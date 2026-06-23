import { Action, CartItem } from "../types/actions";
import { useCartStore } from "../state/cartStore";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";

export function handleAction(action: Action): void {
  console.log(`[ActionDispatcher] Processing action type: ${action.type}`, action.payload);
  
  switch (action.type) {
    case "ADD_TO_CART":
      const itemToAdd = action.payload as unknown as CartItem;
      useCartStore.getState().addItem(itemToAdd);
      
      // Haptics tick delight (Light impact feedback)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      break;

    case "REMOVE_FROM_CART":
      const itemToRemove = action.payload as { id: string };
      useCartStore.getState().removeItem(itemToRemove.id);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      break;

    case "NAVIGATE":
      const navigationPayload = action.payload as { route: string };
      Alert.alert("Navigation Triggered", `Navigating to route: ${navigationPayload.route}`);
      break;

    case "APPLY_COUPON":
      const couponPayload = action.payload as { couponCode: string };
      Alert.alert(
        "Coupon Applied! 🎁",
        `Mystery Gift coupon "${couponPayload.couponCode}" has been successfully added to your order.`
      );
      break;

    default:
      console.warn(`[ActionDispatcher] Unknown or unhandled action:`, action);
  }
}
