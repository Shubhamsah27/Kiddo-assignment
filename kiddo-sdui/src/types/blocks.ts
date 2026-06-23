import { ThemeConfig } from "./actions";

export type BlockType =
  | "BANNER_HERO"
  | "PRODUCT_GRID"
  | "DYNAMIC_COLLECTION"
  | "FULL_SCREEN_OVERLAY";

export interface Product {
  id: string;
  name: string;
  price: number; // in pence / cents
  imageUrl: string;
  category: string;
  badge?: {
    label: string;
    pulse?: boolean;
  };
}

export interface BaseBlock {
  id: string;
  type: BlockType;
  campaignId?: string;
}

export interface BannerHeroBlock extends BaseBlock {
  type: "BANNER_HERO";
  headline: string;
  subline?: string;
  ctaLabel: string;
  ctaAction: {
    type: string;
    payload: any;
  };
  imageUrl: string;
}

export interface ProductGridBlock extends BaseBlock {
  type: "PRODUCT_GRID";
  title: string;
  products: Product[];
}

export interface DynamicCollectionBlock extends BaseBlock {
  type: "DYNAMIC_COLLECTION";
  title: string;
  items: Product[];
}

export interface FullScreenOverlayBlock extends BaseBlock {
  type: "FULL_SCREEN_OVERLAY";
  lottieUrl: string;
  durationMs: number;
}

export type Block =
  | BannerHeroBlock
  | ProductGridBlock
  | DynamicCollectionBlock
  | FullScreenOverlayBlock;

export interface CampaignConfig {
  id: "summer" | "back_to_school" | "festive";
  name: string;
  theme: ThemeConfig;
  overlay?: FullScreenOverlayBlock;
  extraBlocks?: Block[];
  blockOverrides?: Record<string, Partial<Block>>;
}

export interface HomepagePayload {
  campaignId?: string;
  blocks: Block[];
}
export type IncomingBlock = Block | (BaseBlock & { type: string; [k: string]: unknown });
