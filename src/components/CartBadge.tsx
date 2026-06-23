import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useCartStore } from "../state/cartStore";
import { useTheme } from "../state/ThemeContext";

export const CartBadge: React.FC = () => {
  const theme = useTheme();
  
  // Selector subscription to total items quantity
  const totalCount = useCartStore((state) =>
    Object.values(state.items).reduce((acc, item) => acc + (item.quantity || 0), 0)
  );

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (totalCount > 0) {
      scale.value = withSequence(
        withSpring(1.35, { damping: 5, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );
    }
  }, [totalCount]);

  return (
    <View style={styles.container}>
      <View style={[styles.cartIconWrapper, { backgroundColor: theme.primary + "15" }]}>
        <Text style={[styles.iconText, { color: theme.primary }]}>🛒</Text>
        {totalCount > 0 && (
          <Animated.View style={[styles.badge, animatedStyle, { backgroundColor: theme.primary, borderColor: theme.surface }]}>
            <Text style={[styles.badgeText, { color: theme.surface }]}>{totalCount}</Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingRight: 8,
  },
  cartIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconText: {
    fontSize: 20,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
});
export default CartBadge;
