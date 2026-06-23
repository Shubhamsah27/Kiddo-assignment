import { ThemeConfig } from "./actions";

export interface Product {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  action: {
    type: "ADD_TO_CART";
    payload: { productId: string; qty?: number };
  };
  badge?: { label: string; pulse?: boolean };
}

export interface BaseBlock {
  id: string;
  type: string;
}

export interface BannerHeroBlock extends BaseBlock {
  type: "BANNER_HERO";
  imageUrl: string;
  action?: any; // Widened action type for the universal dispatcher
}

export interface ProductGrid2x2Block extends BaseBlock {
  type: "PRODUCT_GRID_2X2";
  title?: string;
  items: Product[];
}

export interface DynamicCollectionBlock extends BaseBlock {
  type: "DYNAMIC_COLLECTION";
  title: string;
  items: Product[];
}

export interface FullScreenOverlayBlock extends BaseBlock {
  type: "FULL_SCREEN_OVERLAY";
  animation_url: string;
}

export type KnownBlock =
  | BannerHeroBlock
  | ProductGrid2x2Block
  | DynamicCollectionBlock
  | FullScreenOverlayBlock;

export type IncomingBlock = KnownBlock | (BaseBlock & { type: string; [k: string]: unknown });

export interface CampaignConfig {
  id: "back_to_school" | "summer_playhouse" | "mystery_gift_carnival";
  name: string;
  theme: ThemeConfig;
  overlay?: FullScreenOverlayBlock;
  extraBlocks?: KnownBlock[];
  refreshAnimationUrl?: string;
}

export interface HomepagePayload {
  theme: ThemeConfig;
  activeCampaignId?: CampaignConfig["id"];
  blocks: IncomingBlock[];
}
