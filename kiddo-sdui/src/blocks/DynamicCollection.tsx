import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { DynamicCollectionBlock } from "../types/blocks";
import { ProductCard } from "../components/ProductCard";

interface DynamicCollectionProps {
  block: DynamicCollectionBlock;
}

export const DynamicCollection: React.FC<DynamicCollectionProps> = ({ block }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{block.title}</Text>
      <FlatList
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
        nestedScrollEnabled={true}
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
