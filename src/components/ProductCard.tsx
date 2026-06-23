import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Product } from "../types/blocks";
import { useCartStore, selectQuantity } from "../state/cartStore";
import { useTheme } from "../state/ThemeContext";
import { handleAction } from "../engine/actionDispatcher";
import { BrandTokens } from "../tokens/brandTokens";

import { Image } from "expo-image";

interface ProductCardProps {
  product: Product;
}

// Category to Emoji and Tinted Color Mapping
const CATEGORY_MAP: Record<string, { emoji: string; bg: string }> = {
  toys: { emoji: "🧸", bg: "#FFE8EC" },
  books: { emoji: "📚", bg: "#E6F4FE" },
  stationery: { emoji: "✏️", bg: "#FFF9E6" },
  clothing: { emoji: "👕", bg: "#E6F9F5" },
  default: { emoji: "📦", bg: "#F5F5F5" },
};

export const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ product }) => {
    const theme = useTheme();
    
    // Selector subscription to quantity
    const quantity = useCartStore(selectQuantity(product.id));

    const addToCart = () =>
      handleAction({
        type: "ADD_TO_CART",
        payload: {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category,
        } as any,
      });

    const removeFromCart = () =>
      handleAction({
        type: "REMOVE_FROM_CART",
        payload: { id: product.id },
      });

    // Pulse animation logic for hot/trending product badge (delight layer 14.8)
    const glowOpacity = useSharedValue(0.4);
    useEffect(() => {
      if (product.badge?.pulse) {
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 600 }),
            withTiming(0.4, { duration: 600 })
          ),
          -1,
          true
        );
      }
    }, [product.badge?.pulse]);

    const pulseStyle = useAnimatedStyle(() => ({
      opacity: glowOpacity.value,
      transform: [
        {
          scale: withSequence(
            withTiming(1.05, { duration: 600 }),
            withTiming(1, { duration: 600 })
          ),
        },
      ],
    }));

    // Render count auditing
    const renderCount = useRef(0);
    renderCount.current += 1;

    const categoryInfo = CATEGORY_MAP[product.category] || CATEGORY_MAP.default;

    return (
      <View style={[styles.card, { borderColor: theme.primary + "15" }]}>
        {/* Render isolation tracking label */}
        <View style={styles.renderBadge}>
          <Text style={styles.renderText}>R: {renderCount.current}</Text>
        </View>

        {/* Brand System category-keyed background icon tile */}
        <View style={[styles.tileContainer, { backgroundColor: categoryInfo.bg }]}>
          {product.imageUrl ? (
            <Image
              source={
                product.imageUrl === "assets/products/pencil_case.png"
                  ? require("../../assets/products/pencil_case.png")
                  : product.imageUrl === "assets/products/crayons.png"
                  ? require("../../assets/products/crayons.png")
                  : product.imageUrl === "assets/products/backpack.png"
                  ? require("../../assets/products/backpack.png")
                  : product.imageUrl === "assets/products/notebook.png"
                  ? require("../../assets/products/notebook.png")
                  : product.imageUrl === "assets/products/geometry_box.png"
                  ? require("../../assets/products/geometry_box.png")
                  : product.imageUrl === "assets/products/lunchbox.png"
                  ? require("../../assets/products/lunchbox.png")
                  : product.imageUrl === "assets/products/waterbottle.png"
                  ? require("../../assets/products/waterbottle.png")
                  : product.imageUrl === "assets/products/markers.png"
                  ? require("../../assets/products/markers.png")
                  : { uri: product.imageUrl }
              }
              style={styles.image}
              contentFit="contain"
            />
          ) : (
            <Text style={styles.tileEmoji}>{categoryInfo.emoji}</Text>
          )}
        </View>

        {product.badge && (
          <Animated.View
            style={[
              styles.productBadge,
              { backgroundColor: theme.accent },
              product.badge.pulse ? pulseStyle : null,
            ]}
          >
            <Text style={styles.productBadgeText}>{product.badge.label}</Text>
          </Animated.View>
        )}

        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>
            {product.name}
          </Text>
          {/* Display price in rupees (pence / 100) */}
          <Text style={styles.price}>₹{Math.round(product.price / 100)}</Text>

          {quantity > 0 ? (
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={removeFromCart}
                style={[styles.qtyButton, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                onPress={addToCart}
                style={[styles.qtyButton, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={addToCart}
              style={[styles.addButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => prevProps.product.id === nextProps.product.id
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandTokens.cream,
    borderRadius: BrandTokens.radiusMd,
    borderWidth: 1,
    overflow: "hidden",
    width: "100%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    position: "relative",
  },
  renderBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: BrandTokens.radiusSm - 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    zIndex: 10,
  },
  renderText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: BrandTokens.fontBody,
    fontWeight: "bold",
  },
  tileContainer: {
    width: "100%",
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  tileEmoji: {
    fontSize: 42,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  productBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    borderRadius: BrandTokens.radiusSm - 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 10,
  },
  productBadgeText: {
    color: "#333",
    fontSize: 9,
    fontWeight: "700",
    fontFamily: BrandTokens.fontBody,
  },
  details: {
    padding: BrandTokens.space2,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    fontFamily: BrandTokens.fontBody,
  },
  price: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
    marginVertical: 4,
    fontFamily: BrandTokens.fontBody,
  },
  addButton: {
    borderRadius: BrandTokens.radiusPill,
    paddingVertical: 6,
    alignItems: "center",
    marginTop: 4,
  },
  addText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: BrandTokens.fontBody,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  qtyButton: {
    borderRadius: BrandTokens.radiusSm,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: BrandTokens.fontBody,
  },
  quantityText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
    fontFamily: BrandTokens.fontBody,
  },
});
