import React, { useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Product } from "../types/blocks";
import { useCartStore } from "../state/cartStore";
import { useTheme } from "../state/ThemeContext";
import { handleAction } from "../engine/actionDispatcher";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ product }) => {
    const theme = useTheme();
    
    // Subscribe to count ONLY for this specific product ID
    const quantity = useCartStore((state) => state.items[product.id] ?? 0);
    const addToCart = () => handleAction(product.action);
    const removeFromCart = () => useCartStore.getState().removeFromCart(product.id);

    // Track renders in a ref for visual audit
    const renderCount = useRef(0);
    renderCount.current += 1;

    return (
      <View style={[styles.card, { borderColor: theme.primary + "30" }]}>
        {/* Render counter visual proof */}
        <View style={styles.renderBadge}>
          <Text style={styles.renderText}>R: {renderCount.current}</Text>
        </View>

        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />

        {product.badge && (
          <View style={[styles.productBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.productBadgeText}>{product.badge.label}</Text>
          </View>
        )}

        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>
            {product.title}
          </Text>
          <Text style={styles.price}>₹{product.price}</Text>

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
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    width: "100%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: "relative",
  },
  renderBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    zIndex: 10,
  },
  renderText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "System",
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 110,
    backgroundColor: "#f5f5f5",
  },
  productBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 10,
  },
  productBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
  details: {
    padding: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  price: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111",
    marginVertical: 4,
  },
  addButton: {
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: "center",
    marginTop: 4,
  },
  addText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  qtyButton: {
    borderRadius: 6,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  quantityText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },
});
