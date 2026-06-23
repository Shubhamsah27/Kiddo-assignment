import React from "react";
import { Block } from "../types/blocks";
import { BannerHero } from "../blocks/BannerHero";
import { ProductGrid } from "../blocks/ProductGrid";
import { DynamicCollection } from "../blocks/DynamicCollection";

export type BlockComponentMap = {
  [K in Block["type"]]: React.ComponentType<{ block: any }>;
};

export const ComponentRegistry: BlockComponentMap = {
  BANNER_HERO: BannerHero,
  PRODUCT_GRID: ProductGrid,
  DYNAMIC_COLLECTION: DynamicCollection,
  FULL_SCREEN_OVERLAY: () => null, // Root overlay element managed conditionally
};
export default ComponentRegistry;
