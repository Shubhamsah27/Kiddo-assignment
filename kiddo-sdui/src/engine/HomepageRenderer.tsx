import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { IncomingBlock, KnownBlock } from "../types/blocks";
import { ComponentRegistry } from "./ComponentRegistry";
import { BlockErrorBoundary } from "./BlockErrorBoundary";
import { useTheme } from "../state/ThemeContext";
import { StaggeredView } from "../components/StaggeredView";

interface HomepageRendererProps {
  blocks: IncomingBlock[];
}

export const HomepageRenderer: React.FC<HomepageRendererProps> = ({ blocks }) => {
  const theme = useTheme();

  // Defensive validation of blocks: filter null/undefined and check structure
  const validatedBlocks = blocks.filter((block): block is IncomingBlock => {
    if (!block || typeof block !== "object") return false;
    if (!block.id || !block.type) return false;
    return true;
  });

  const renderBlockItem = ({ item }: { item: IncomingBlock }) => {
    const Component = ComponentRegistry[item.type as KnownBlock["type"]];

    if (!Component) {
      if (__DEV__) {
        console.warn(`[SDUI] Unrecognized block type "${item.type}" — dropped.`);
      }
      return null;
    }

    // Defensive check: grid and collections require items array
    if (
      (item.type === "PRODUCT_GRID_2X2" || item.type === "DYNAMIC_COLLECTION") &&
      (!item.items || !Array.isArray(item.items))
    ) {
      if (__DEV__) {
        console.warn(`[SDUI] Block "${item.type}" is missing required 'items' array — dropped.`);
      }
      return null;
    }

    return (
      <BlockErrorBoundary blockType={item.type} blockId={item.id}>
        <StaggeredView index={blocks.indexOf(item)}>
          <Component block={item} />
        </StaggeredView>
      </BlockErrorBoundary>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlashList
        data={validatedBlocks}
        renderItem={renderBlockItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={200}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 10,
  },
});
