# Kiddo SDUI Homepage — Product Requirements Document

**Version:** 2.0 (post-session update — §14, §15, §16 added)
**Platform:** React Native (Expo + expo-dev-client)
**Assignment type:** Take-home / portfolio

---

## §1 — Purpose & Scope

Build a server-driven UI (SDUI) homepage renderer for the **Kiddo** kids' e-commerce app. The renderer ingests a JSON payload and maps each block to a React Native component, producing a scrollable homepage without any component-level logic hard-coded to specific content.

The assignment is graded on architectural cleanliness, render isolation, TypeScript rigour, and defensive resilience — not visual polish or backend integration.

---

## §2 — Goals

| ID | Goal |
|----|------|
| G1 | **Architectural cleanliness** — factory-pattern Component Registry; zero direct switch statements in the feed renderer |
| G2 | **Sustained frame performance** — 60 fps scrolling; no unnecessary re-renders |
| G3 | **TypeScript strategy** — strict mode, discriminated unions for all block and action types; no `any` |
| G4 | **Defensive resilience** — a bad block must never crash the feed; unknown types are silently skipped |
| G5 | **Cart isolation** — quantity mutations re-render only the affected `ProductCard`, not siblings |
| G6 | **OTA theming** — campaign skin (colours + overlay animation) swappable at runtime without a native rebuild |

---

## §3 — Non-Goals

- Pixel-perfect production design
- Real backend / GraphQL / REST calls (mock JSON only)
- Authentication or user accounts
- Accessibility standards (WCAG)
- Persistence (no AsyncStorage, no DB)
- Unit or E2E test coverage (Playwright is optional tooling only)
- App Store submission

---

## §4 — Tech Stack

| Concern | Library |
|---------|---------|
| List rendering | `@shopify/flash-list` |
| Animations | `react-native-reanimated`, `lottie-react-native` |
| State (cart) | `zustand` |
| Theming | React Context |
| Language | TypeScript (strict) |
| Runtime | Expo SDK + `expo-dev-client` (native modules required) |
| Haptics | `expo-haptics` |

> **Note:** Plain Expo Go will not run FlashList or Lottie. A dev-client build is required.

---

## §5 — Block Types

```typescript
type BlockType =
  | 'BANNER_HERO'
  | 'PRODUCT_GRID'
  | 'DYNAMIC_COLLECTION'   // horizontal carousel
  | 'FULL_SCREEN_OVERLAY'  // Lottie / WebP campaign animation
```

Unknown block types are silently skipped — the registry returns `null` and the FlashList moves on.

---

## §6 — Action Types

```typescript
type ActionType =
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'NAVIGATE'
  | 'APPLY_COUPON'
```

Unknown action types are safely ignored by the dispatcher switch statement.

---

## §7 — Campaign System

Three pre-configured campaigns, each with:

- A distinct colour scheme (primary + background + accent)
- Campaign-specific featured blocks injected into the feed
- A full-screen Lottie overlay animation
- Optional ambient motion behind the hero banner

Campaigns are swappable at runtime via a dev-mode switcher — no native rebuild required.

| Campaign ID | Theme name | Primary colour | Overlay animation |
|-------------|------------|----------------|-------------------|
| `summer` | Summer Splash | `#FF6B6B` (coral) | Bubbles |
| `back_to_school` | Back to School | `#4ECDC4` (sky) | Confetti |
| `festive` | Festive | `#FFE66D` (sun) | Sparkles |

---

## §8 — Data Model

```typescript
// Products
interface Product {
  id: string;
  name: string;
  price: number;          // in pence / cents
  imageUrl: string;
  category: string;
  badge?: {
    label: string;
    pulse?: boolean;      // optional delight field — §14
  };
}

// Block base
interface BaseBlock {
  id: string;
  type: BlockType;
  campaignId?: string;
}

// Block variants
interface BannerHeroBlock extends BaseBlock {
  type: 'BANNER_HERO';
  headline: string;
  subline?: string;
  ctaLabel: string;
  ctaAction: Action;
  imageUrl: string;
}

interface ProductGridBlock extends BaseBlock {
  type: 'PRODUCT_GRID';
  title: string;
  products: Product[];
}

interface DynamicCollectionBlock extends BaseBlock {
  type: 'DYNAMIC_COLLECTION';
  title: string;
  items: Product[];
}

interface FullScreenOverlayBlock extends BaseBlock {
  type: 'FULL_SCREEN_OVERLAY';
  lottieUrl: string;
  durationMs: number;
}

type Block =
  | BannerHeroBlock
  | ProductGridBlock
  | DynamicCollectionBlock
  | FullScreenOverlayBlock;

// Actions
interface Action {
  type: ActionType;
  payload: Record<string, unknown>;
}

// Theme
interface ThemeConfig {
  primary: string;
  background: string;
  accent: string;
  ambientMotion?: 'confetti' | 'bubbles' | 'sparkle'; // optional — §14
}

// Homepage payload
interface HomepagePayload {
  campaignId?: string;
  blocks: Block[];
}
```

---

## §9 — Architecture

### 9.1 Component Registry

```typescript
// src/registry/blockRegistry.ts
import { BannerHero } from '../blocks/BannerHero';
import { ProductGrid } from '../blocks/ProductGrid';
import { DynamicCollection } from '../blocks/DynamicCollection';
import { FullScreenOverlay } from '../blocks/FullScreenOverlay';

const REGISTRY: Partial<Record<BlockType, React.ComponentType<any>>> = {
  BANNER_HERO: BannerHero,
  PRODUCT_GRID: ProductGrid,
  DYNAMIC_COLLECTION: DynamicCollection,
  FULL_SCREEN_OVERLAY: FullScreenOverlay,
};

export function renderBlock(block: Block): React.ReactElement | null {
  const Component = REGISTRY[block.type];
  if (!Component) return null;   // unknown type — silently skip
  return <Component {...block} />;
}
```

Adding a new block type = import component + add one line to `REGISTRY`. The feed renderer never needs to change.

### 9.2 Action Dispatcher

```typescript
// src/actions/dispatcher.ts
import { useCartStore } from '../store/cartStore';
import { router } from 'expo-router';

export function handleAction(action: Action): void {
  const { addItem, removeItem } = useCartStore.getState();

  switch (action.type) {
    case 'ADD_TO_CART':
      addItem(action.payload as CartItem);
      triggerCartDelight(); // §14 fly-to-cart + haptic
      break;
    case 'REMOVE_FROM_CART':
      removeItem((action.payload as { id: string }).id);
      break;
    case 'NAVIGATE':
      router.push((action.payload as { route: string }).route);
      break;
    case 'APPLY_COUPON':
      // coupon logic + confetti burst — §14
      triggerCouponDelight();
      break;
    default:
      // unknown action — safe no-op
      break;
  }
}
```

### 9.3 Cart Store (Zustand)

```typescript
// src/store/cartStore.ts
import { create } from 'zustand';

interface CartState {
  items: Record<string, CartItem>;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  getQuantity: (id: string) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: {},
  addItem: (item) =>
    set((state) => ({
      items: {
        ...state.items,
        [item.id]: {
          ...item,
          quantity: (state.items[item.id]?.quantity ?? 0) + 1,
        },
      },
    })),
  removeItem: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.items;
      return { items: rest };
    }),
  getQuantity: (id) => get().items[id]?.quantity ?? 0,
}));

// Per-item selector — ProductCard subscribes to this, not the whole store
export const selectQuantity = (id: string) => (state: CartState) =>
  state.items[id]?.quantity ?? 0;
```

`ProductCard` calls `useCartStore(selectQuantity(product.id))` — sibling cards never re-render on another card's quantity change.

### 9.4 ThemeContext

```typescript
// src/context/ThemeContext.tsx
const defaultTheme: ThemeConfig = {
  primary: '#FF6B6B',
  background: '#FFF9F0',
  accent: '#FFE66D',
};

export const ThemeContext = createContext<ThemeConfig>(defaultTheme);

export function ThemeProvider({ campaignId, children }: Props) {
  const theme = CAMPAIGN_THEMES[campaignId ?? ''] ?? defaultTheme;
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
```

### 9.5 Folder Structure

```
src/
  blocks/
    BannerHero.tsx
    ProductGrid.tsx
    ProductCard.tsx
    DynamicCollection.tsx
    FullScreenOverlay.tsx
    BlockErrorBoundary.tsx
  registry/
    blockRegistry.ts
  actions/
    dispatcher.ts
    delight.ts          // §14 wow-layer side-effects
  store/
    cartStore.ts
  context/
    ThemeContext.tsx
  campaigns/
    campaigns.ts        // three campaign configs
  renderer/
    HomepageRenderer.tsx
  hooks/
    useHomepagePayload.ts
```

---

## §10 — Functional Requirements

| ID | Requirement |
|----|-------------|
| FR1 | The entire homepage is rendered by a **single vertical `FlashList`**. No nested vertical lists. Stable `keyExtractor` on `block.id`. `estimatedItemSize` tuned per block type. |
| FR2 | A **Component Registry** (factory pattern) maps `BlockType → React.ComponentType`. The renderer calls `renderBlock(block)` — no switch statements in render path. |
| FR3 | `DYNAMIC_COLLECTION` renders a **horizontal `FlashList`** (or `ScrollView`) nested inside the vertical cell. Must not interrupt vertical scroll momentum. |
| FR4 | Every block cell is wrapped in a **`BlockErrorBoundary`**. A thrown error in one cell logs to console, renders a silent fallback, and does not affect other cells. |
| FR5 | A **mock JSON payload** is served locally (no network call). It includes at least: one `BANNER_HERO`, one `PRODUCT_GRID` with ≥4 products, one `DYNAMIC_COLLECTION` with ≥4 items, one `FULL_SCREEN_OVERLAY`. |
| FR6 | All interactions are routed through **`handleAction(action)`**. Leaf components receive `onAction` props — no direct store imports in block components. |
| FR7 | Switching campaign ID at runtime **re-skins colours and swaps the overlay animation** with no native rebuild. |
| FR8 | `FULL_SCREEN_OVERLAY` blocks mount as **root-level siblings** to the feed (not inside a list cell) via a portal or top-level conditional render. |
| FR9 | All components consume colours from **`ThemeContext`** — no hard-coded hex values in component files. |
| FR10 | Cart quantity changes re-render **only the affected `ProductCard`**. Sibling cards must not re-render. Verified with a `DEV`-only render-count badge. |

---

## §11 — Non-Functional Requirements

| Concern | Target |
|---------|--------|
| Scroll frame rate | 60 fps on mid-range Android device |
| Initial render | Feed visible within 500 ms of payload load |
| Cart isolation | Sibling `ProductCard` re-render count stays at 0 on add-to-cart |
| TypeScript | `tsc --strict` passes with zero errors |
| Resilience | Malformed / missing block fields never crash the app |
| Bundle size | No unnecessary peer dependencies |

---

## §12 — Acceptance Criteria

| AC | Criterion |
|----|-----------|
| AC1 | Homepage renders all four block types from mock JSON |
| AC2 | Switching campaign ID changes colours and overlay animation without app restart |
| AC3 | Adding product A to cart does not trigger a re-render on product B's card |
| AC4 | Introducing a malformed block (missing required field) causes only that cell to show a silent fallback — rest of feed unaffected |
| AC5 | Unknown block type in payload is silently skipped — no crash, no visible gap |
| AC6 | Unknown action type dispatched is safely ignored |
| AC7 | `tsc --strict` exits 0 |
| AC8 | `FULL_SCREEN_OVERLAY` renders above the feed without blocking scroll |

---

## §13 — Assumptions & Open Questions

**Assumptions**

- Expo SDK with `expo-dev-client` is acceptable (plain Expo Go won't run FlashList + Lottie)
- Lottie assets bundled locally (free assets from LottieFiles); CDN not required
- Android is the primary test target; iOS parity is a bonus
- The render-count badge (`__DEV__` only) can remain in the submission to demonstrate AC3

**Open Questions**

| # | Question | Status |
|---|----------|--------|
| OQ1 | Does the reviewer require a physical device build or is the iOS/Android simulator sufficient? | Open |
| OQ2 | Should the dev-mode campaign switcher be visible in the demo video? | Open |
| OQ3 | Are there preferred Lottie asset sources, or is LottieFiles acceptable? | Open |

---

## §14 — Delight Layer (Optional Stretch)

> **Constraint:** Everything in this section bolts onto the existing architecture. No new top-level lists. All motion runs on the UI thread via Reanimated shared values. All effects are triggered from `handleAction` or viewability callbacks — leaf components stay dumb. Schema additions use optional fields with no defaults, so any payload without them renders identically to today (FR4 resilience preserved).

### 14.1 Shimmer Skeleton

During payload load a single looped `useSharedValue` drives shimmer placeholders for every block type. Layout is reserved upfront — no shift when real content arrives.

```typescript
const shimmerProgress = useSharedValue(0);
useEffect(() => {
  shimmerProgress.value = withRepeat(
    withTiming(1, { duration: 1000, easing: Easing.linear }),
    -1
  );
}, []);
```

### 14.2 Staggered Block Entrance

Blocks fade + slide up as they enter the viewport. Driven by FlashList's `onViewableItemsChanged` — each block gets a 60 ms stagger offset based on its index.

```typescript
const translateY = useSharedValue(24);
const opacity = useSharedValue(0);
// triggered when block enters viewport:
translateY.value = withDelay(index * 60, withSpring(0));
opacity.value = withDelay(index * 60, withTiming(1));
```

### 14.3 Fly-to-Cart Ghost

On `ADD_TO_CART`, a thumbnail ghost mounts at the tapped card's position and arc-animates to the cart icon (top-right). Implemented as a single root-level overlay (sibling to the feed) — completely outside the render tree, zero impact on feed performance.

```typescript
// in delight.ts — triggered from handleAction
export function triggerFlyToCart(sourceLayout: LayoutRect) {
  flyToCartStore.mount({ sourceLayout });
}
```

### 14.4 Cart Badge Spring-Pop

Cart icon badge scale-springs on every item addition:

```typescript
const scale = useSharedValue(1);
export function popCartBadge() {
  scale.value = withSequence(withSpring(1.4), withSpring(1));
}
```

### 14.5 Mini-Cart Bar

When cart count goes from 0 → 1, a bottom bar slides up (`withSpring`) showing item count and a checkout CTA. It slides down when cart empties. Fully independent component — does not touch the FlashList.

### 14.6 Campaign Theme Cross-Fade

When campaign switches, colours cross-fade over 300 ms via Reanimated interpolated colour values on the `ThemeContext` consumer root — not on individual components.

### 14.7 Ambient Motion (Hero Banner)

Optional data-driven faint particles behind the hero banner. Enabled when `themeConfig.ambientMotion` is set (`'confetti' | 'bubbles' | 'sparkle'`). Scoped only to the `BannerHero` component — no global particle system.

### 14.8 Pulse Badge

Products with `badge.pulse: true` get a soft looped glow. The `pulse` field is optional and defaults to `false` — no behaviour change for existing products.

```typescript
const glowOpacity = useSharedValue(0.4);
useEffect(() => {
  if (!badge?.pulse) return;
  glowOpacity.value = withRepeat(
    withSequence(withTiming(1, { duration: 600 }), withTiming(0.4, { duration: 600 })),
    -1
  );
}, [badge?.pulse]);
```

### 14.9 Confetti Burst on Coupon

When `APPLY_COUPON` dispatches successfully, a Lottie confetti burst triggers near that row. Reuses the same cached animation loader as `FullScreenOverlay` — no new dependency.

### 14.10 Campaign Pull-to-Refresh

Pull-to-refresh plays a campaign-themed Lottie animation while loading; falls back to the platform default if no animation URL is configured. Swapped at runtime via campaign config — no native rebuild.

### 14.11 Haptic Feedback

Light haptic tick on cart addition and campaign switch:

```typescript
import * as Haptics from 'expo-haptics';
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

One line, no new dependency (already in Expo SDK).

### 14.12 Delight Build Order

1. Shimmer skeletons (cheapest — touches no existing components)
2. Staggered entrances (viewability callback hook)
3. Pulse badge (one `useEffect` in `ProductCard`)
4. Cart badge spring-pop
5. Mini-cart bar
6. Confetti coupon burst
7. Campaign cross-fade
8. Ambient hero motion
9. Fly-to-cart ghost (most complex — root overlay)
10. Themed pull-to-refresh
11. Haptics (sprinkle last — one line per trigger)

> All of §14 is optional polish. Ship only after all ACs in §12 pass.

---

## §15 — Tooling Division — MCP-Assisted Workflow

Each MCP connector has a precise, bounded role. The table below defines what each tool covers and — critically — what it does **not** own.

| Tool | Role | Boundaries |
|------|------|------------|
| **Context7** | Fetch live API signatures for `@shopify/flash-list`, `react-native-reanimated`, `lottie-react-native`, `zustand` before each implementation phase | Read-only reference. Does not write code or scaffolds. Boot first — before any code is written. |
| **GitHub MCP** | Initialise repo, create branch per phase, commit after each phase gate | Commit messages follow `feat(phase-N): description` convention. Must be running before Phase 1 code is written. |
| **Magic MCP** | Scaffold component shells for delight-layer items: shimmer wrapper, mini-cart bar, fly-to-cart overlay, confetti trigger | Phase 9 (delight) only. Output must be validated against the `React.memo` and Reanimated contracts in §9. Do not use for core registry, cart store, or action dispatcher — those must match §9 contracts exactly. |
| **Stitch** | Generate hex colour tokens for the three campaign skins (§7) and the brand base palette (§16) from the Kiddo brand mark | Run before Phase 6. Outputs go into `src/campaigns/campaigns.ts` and `src/tokens/brandTokens.ts`. The brief's campaign table is incomplete on colours — Stitch fills this gap. |
| **Playwright** | Screenshot-test the web preview across all three campaign themes | Optional / web only. Does not cover native RN build path. Run after Phase 8 if time allows. |

### 15.1 Sequencing

```
Boot Context7 → Init GitHub repo → [Phases 1–5] → Run Stitch (colours) →
[Phase 6 theming] → [Phase 7 overlays] → [Phase 8 cleanup] →
Magic MCP scaffolds (Phase 9 delight) → Playwright screenshots (optional)
```

---

## §16 — Visual Design System & Known Issues

### 16.1 Brand Token Table

Extracted from the Kiddo brand mark (warm cream base, coral wordmark, rainbow stripe).

```typescript
// src/tokens/brandTokens.ts
export const BrandTokens = {
  // Base palette
  cream:   '#FFF9F0',   // app background
  coral:   '#FF6B6B',   // primary / CTA
  sky:     '#4ECDC4',   // secondary accent
  sun:     '#FFE66D',   // highlight / badge
  pink:    '#FF8FAB',   // tertiary

  // Typography
  fontDisplay: 'Baloo2',        // headings, hero text
  fontBody:    'NunitoSans',    // product names, prices, body copy

  // Spacing scale (8pt grid)
  space1: 4,
  space2: 8,
  space3: 16,
  space4: 24,
  space5: 32,
  space6: 48,

  // Border radius
  radiusSm: 8,
  radiusMd: 16,
  radiusLg: 24,
  radiusPill: 999,
} as const;
```

### 16.2 Typography Pairing

| Role | Font | Weight | Size |
|------|------|--------|------|
| Hero headline | Baloo 2 | 700 | 28 |
| Section title | Baloo 2 | 600 | 20 |
| Product name | Nunito Sans | 600 | 14 |
| Price | Nunito Sans | 700 | 14 |
| Badge label | Nunito Sans | 700 | 11 |
| Body / subline | Nunito Sans | 400 | 14 |
| CTA button | Nunito Sans | 700 | 15 |

Load via `expo-font` in `_layout.tsx` before the feed renders.

### 16.3 Component Chrome Rules

| Token | Value | Applied to |
|-------|-------|------------|
| Card background | `cream` | `ProductCard`, `DynamicCollection` item |
| Card border radius | `radiusMd` (16) | All cards |
| Card shadow | `elevation: 2` / `shadowOpacity: 0.08` | iOS + Android |
| CTA button radius | `radiusPill` | All buttons |
| Section title colour | `coral` | `ProductGrid.title`, `DynamicCollection.title` |
| Badge background | `sun` | Default badge |
| Badge text | `#333` | All badges |
| Primary button bg | `coral` | Add-to-cart, hero CTA |
| Primary button text | `#fff` | — |

### 16.4 Signature Decorative Element

A rainbow arc (three concentric arcs: coral → sun → sky, 20 % opacity) sits behind the `BannerHero` headline text. Implemented as an SVG layer inside `BannerHero`. Does not repeat on other blocks.

### 16.5 Known Bug — Stale Carousel Titles

**Problem:** Campaign-specific titles (e.g. "Back to School Picks") are baked into the static mock `DYNAMIC_COLLECTION` blocks. When the user switches campaigns in the dev switcher, the block titles don't update because the mock payload is loaded once at mount.

**Fix:** Give `DYNAMIC_COLLECTION` blocks evergreen titles (e.g. "Trending Now") in the base mock, and inject campaign-specific title overrides via the campaign config:

```typescript
// src/campaigns/campaigns.ts
export const CAMPAIGN_CONFIGS: Record<string, CampaignConfig> = {
  summer: {
    theme: { ... },
    blockOverrides: {
      'dynamic-collection-1': { title: 'Summer Essentials' },
    },
  },
  ...
};
```

The `HomepageRenderer` merges `blockOverrides` into the payload at render time — no mutation of the original mock.

### 16.6 Known Bug — Irrelevant Placeholder Images

**Problem:** `product.imageUrl` values using random Unsplash seeds pull unrelated stock photos (e.g. architecture photos in a kids' toy grid).

**Fix (preferred):** Replace with category-keyed Unsplash collections:

```typescript
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  toys:       'https://source.unsplash.com/collection/1111111/200x200',
  books:      'https://source.unsplash.com/collection/2222222/200x200',
  clothing:   'https://source.unsplash.com/collection/3333333/200x200',
  stationery: 'https://source.unsplash.com/collection/4444444/200x200',
};
```

**Fix (alternative — more cohesive):** Replace product images with coloured category icon tiles (tinted background + category emoji/icon). Eliminates network dependency, loads instantly, suits the Kiddo brand aesthetic.

---

## §17 — Suggested Build Plan

| Phase | Deliverable | Gate before next phase |
|-------|-------------|------------------------|
| 1 | Expo project scaffold, TypeScript strict config, all interfaces from §8 defined | `tsc --strict` passes |
| 2 | Mock JSON payload (`src/mock/homepage.json`), block registry with stub components | Registry renders without crash on all 4 block types |
| 3 | `HomepageRenderer` with single `FlashList`, `BlockErrorBoundary` wrapping each cell | Malformed block = silent fallback, rest of feed OK |
| 4 | Full block components: `BannerHero`, `ProductGrid`, `ProductCard`, `DynamicCollection`, `FullScreenOverlay` | All 4 block types render correct content |
| 5 | Zustand cart store, per-item selector, `React.memo` on `ProductCard`, render-count badge | AC3 passes (sibling card render count = 0) |
| 6 | `ThemeContext`, three campaign configs (Stitch colours), dev-mode campaign switcher | AC2 passes — colour + overlay swap without restart |
| 7 | `FullScreenOverlay` mounted as root sibling (portal), Lottie assets bundled | AC8 passes — overlay above feed, scroll unblocked |
| 8 | Cleanup: remove dead code, run `tsc`, record demo video, write README | All 8 ACs pass; `tsc` exits 0 |
| 9 | Delight layer (§14) — optional, only if all ACs already green | Shimmer → staggered entrance → pulse → cart delight → ambient motion |
