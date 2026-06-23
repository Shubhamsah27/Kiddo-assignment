import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useTheme } from "../state/ThemeContext";
import { DynamicCollectionBlock } from "../types/blocks";
import { ProductCard } from "../components/ProductCard";

import { FlashList } from "@shopify/flash-list";

interface DynamicCollectionProps {
  block: DynamicCollectionBlock;
}

export const DynamicCollection: React.FC<DynamicCollectionProps> = ({ block }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: useTheme().text }]}>{block.title}</Text>
      <FlashList
        data={block.items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <ProductCard product={item} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        estimatedItemSize={140}
        decelerationRate="fast"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
    paddingHorizontal: 16,
    letterSpacing: 0.2,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  itemContainer: {
    width: 140,
    marginHorizontal: 4,
  },
});
