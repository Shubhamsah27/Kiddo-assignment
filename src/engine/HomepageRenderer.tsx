import React from "react";
import { StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Block } from "../types/blocks";
import { ComponentRegistry } from "./ComponentRegistry";
import { BlockErrorBoundary } from "./BlockErrorBoundary";
import { useTheme } from "../state/ThemeContext";
import { StaggeredView } from "../components/StaggeredView";

interface HomepageRendererProps {
  blocks: Block[];
  blockOverrides?: Record<string, Partial<Block>>;
}

export const HomepageRenderer: React.FC<HomepageRendererProps> = ({
  blocks,
  blockOverrides = {},
}) => {
  const theme = useTheme();

  // Defensive validation & runtime overrides merging
  const validatedBlocks = blocks
    .filter((block): block is Block => {
      if (!block || typeof block !== "object") return false;
      if (!block.id || !block.type) return false;
      return true;
    })
    .map((block) => {
      // Merge overrides dynamically without mutating the original mock payload
      if (blockOverrides[block.id]) {
        return {
          ...block,
          ...blockOverrides[block.id],
        } as Block;
      }
      return block;
    });

  const renderBlockItem = ({ item }: { item: Block }) => {
    const Component = ComponentRegistry[item.type];

    if (!Component) {
      if (__DEV__) {
        console.warn(`[SDUI] Unrecognized block type "${item.type}" — dropped.`);
      }
      return null;
    }

    // Defensive check: grids require product array, collections require items array
    if (item.type === "PRODUCT_GRID" && (!item.products || !Array.isArray(item.products))) {
      if (__DEV__) {
        console.warn(`[SDUI] Block "${item.type}" is missing required 'products' array — dropped.`);
      }
      return null;
    }

    if (item.type === "DYNAMIC_COLLECTION" && (!item.items || !Array.isArray(item.items))) {
      if (__DEV__) {
        console.warn(`[SDUI] Block "${item.type}" is missing required 'items' array — dropped.`);
      }
      return null;
    }

    return (
      <BlockErrorBoundary blockType={item.type} blockId={item.id}>
        <StaggeredView index={validatedBlocks.indexOf(item)}>
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
export default HomepageRenderer;
