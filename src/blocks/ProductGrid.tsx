import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ProductGridBlock } from "../types/blocks";
import { ProductCard } from "../components/ProductCard";
import { BrandTokens } from "../tokens/brandTokens";

interface ProductGridProps {
  block: ProductGridBlock;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ block }) => {
  const displayItems = (block.products || []).slice(0, 4);

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
    paddingHorizontal: BrandTokens.space3,
    paddingVertical: BrandTokens.space3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: BrandTokens.coral,
    marginBottom: BrandTokens.space2,
    fontFamily: BrandTokens.fontDisplay,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCell: {
    width: "48%",
    marginBottom: BrandTokens.space3,
  },
});
export default ProductGrid;
