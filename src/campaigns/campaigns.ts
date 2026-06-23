import { CampaignConfig } from "../types/blocks";

export const CAMPAIGN_CONFIGS: Record<string, CampaignConfig> = {
  summer: {
    id: "summer",
    name: "Summer Splash Festival",
    theme: {
      primary: "#FF6B6B",
      background: "#FFF9F0",
      accent: "#4ECDC4",
      surface: "#FFFFFF",
      text: "#111111",
      textMuted: "#666666",
      ambientMotion: "bubbles"
    },
    overlay: {
      id: "overlay_summer",
      type: "FULL_SCREEN_OVERLAY",
      lottieUrl: "https://assets4.lottiefiles.com/packages/lf20_5n8ybb1b.json",
      durationMs: 5000
    },
    blockOverrides: {
      "carousel_bestsellers": {
        type: "DYNAMIC_COLLECTION",
        title: "Summer Essentials ☀️"
      }
    },
    extraBlocks: [
      {
        id: "extra_summer_row",
        type: "DYNAMIC_COLLECTION",
        title: "Petting Zoo & Playhouse Tickets 🎟️",
        items: [
          {
            id: "p_zoo_ticket",
            name: "Zoo Entry Ticket",
            price: 19900,
            imageUrl: "",
            category: "toys",
            badge: { label: "Fast Access" }
          },
          {
            id: "p_playhouse_ticket",
            name: "Playhouse Day Pass",
            price: 29900,
            imageUrl: "",
            category: "toys"
          }
        ]
      }
    ]
  },
  back_to_school: {
    id: "back_to_school",
    name: "Back to School Mega-Sale",
    theme: {
      primary: "#4ECDC4",
      background: "#FFF9F0",
      accent: "#FFE66D",
      surface: "#FFFFFF",
      text: "#111111",
      textMuted: "#666666",
      ambientMotion: "confetti"
    },
    overlay: {
      id: "overlay_school",
      type: "FULL_SCREEN_OVERLAY",
      lottieUrl: "https://assets7.lottiefiles.com/packages/lf20_96b5cho7.json",
      durationMs: 5000
    },
    blockOverrides: {
      "carousel_bestsellers": {
        type: "DYNAMIC_COLLECTION",
        title: "Back to School Picks 🎒"
      }
    },
    extraBlocks: [
      {
        id: "extra_school_row",
        type: "DYNAMIC_COLLECTION",
        title: "School Lunchboxes & Bags 🎒",
        items: [
          {
            id: "p_extra_lunchbox",
            name: "Bento Box Multi-Grid",
            price: 34900,
            imageUrl: "",
            category: "stationery"
          },
          {
            id: "p_extra_backpack",
            name: "Waterproof Unicorn Bag",
            price: 79900,
            imageUrl: "",
            category: "clothing",
            badge: { label: "50% OFF" }
          }
        ]
      }
    ]
  },
  festive: {
    id: "festive",
    name: "Festive Carnival",
    theme: {
      primary: "#FFE66D",
      background: "#FFF9F0",
      accent: "#FF6B6B",
      surface: "#FFFFFF",
      text: "#111111",
      textMuted: "#666666",
      ambientMotion: "sparkle"
    },
    overlay: {
      id: "overlay_festive",
      type: "FULL_SCREEN_OVERLAY",
      lottieUrl: "https://assets9.lottiefiles.com/packages/lf20_vu5jwhuq.json",
      durationMs: 5000
    },
    blockOverrides: {
      "carousel_bestsellers": {
        type: "DYNAMIC_COLLECTION",
        title: "Festive Season Hot Deals 🔥"
      }
    },
    extraBlocks: [
      {
        id: "extra_mystery_banner",
        type: "BANNER_HERO",
        headline: "Unlock Mystery Coupons!",
        subline: "Redeem festival gifts instantly inside your cart.",
        ctaLabel: "Apply Coupon",
        ctaAction: {
          type: "APPLY_COUPON",
          payload: { couponCode: "KIDDOCARNIVAL2026" }
        },
        imageUrl: ""
      }
    ]
  }
};
