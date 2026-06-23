import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ProductGrid2x2Block } from "../types/blocks";
import { ProductCard } from "../components/ProductCard";

interface ProductGrid2x2Props {
  block: ProductGrid2x2Block;
}

export const ProductGrid2x2: React.FC<ProductGrid2x2Props> = ({ block }) => {
  const displayItems = block.items.slice(0, 4);

  return (
    <View style={styles.container}>
      {block.title && <Text style={styles.sectionTitle}>{block.title}</Text>}
      <View style={styles.grid}>
        {displayItems.map((item) => (
          <View key={item.id} style={styles.gridCell}>
            <ProductCard product={item} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCell: {
    width: "48%",
    marginBottom: 14,
  },
});
