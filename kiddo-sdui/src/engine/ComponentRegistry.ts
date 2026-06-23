import React from "react";
import { KnownBlock } from "../types/blocks";
import { BannerHero } from "../blocks/BannerHero";
import { ProductGrid2x2 } from "../blocks/ProductGrid2x2";
import { DynamicCollection } from "../blocks/DynamicCollection";

export type BlockComponentMap = {
  [K in KnownBlock["type"]]: React.ComponentType<{ block: any }>;
};

export const ComponentRegistry: BlockComponentMap = {
  BANNER_HERO: BannerHero,
  PRODUCT_GRID_2X2: ProductGrid2x2,
  DYNAMIC_COLLECTION: DynamicCollection,
  FULL_SCREEN_OVERLAY: () => null, // Managed as global overlays rather than inline items
};
