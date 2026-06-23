# PRD: Kiddo Homepage — Server-Driven UI (SDUI) Renderer

**Doc type:** Product & Engineering Requirements Document
**Owner:** [You]
**Status:** Draft — derived from assignment brief
**Last updated:** 2026-06-23

---

## 1. Purpose

This PRD translates the "Kiddo Tech Assignment" brief into a concrete spec: what the system is, what it must do, how it's structured, and how it will be judged. It exists to give the build a single source of truth instead of working straight off a loosely-worded brief — and to double as the documentation reviewers will expect alongside the code.

## 2. Background

Kiddo's mobile homepage changes constantly — Diwali sales, New Year promos, summer campaigns — and the business constraint is **zero app store release cycles** for any of this. The standard way growth/marketing-heavy apps (Blinkit, Zomato, Swiggy Instamart) solve this is **Server-Driven UI (SDUI)**: the backend emits a JSON payload describing *what* to render and *how it should look*; the client is a generic rendering engine with no hardcoded screen content, only registered building blocks.

This assignment asks you to build that rendering engine end-to-end, using a local mock JSON file in place of a real backend.

## 3. Problem Statement

Build a React Native client that can:
- Ingest an arbitrary, deeply nested JSON payload describing a home screen.
- Render it as a smooth, native-feeling feed of heterogeneous components.
- Stay stable when the payload contains data it doesn't understand.
- Let the *visual identity* of the whole app (colors, overlays, promo rows) change at runtime, driven purely by data — proving no code change / app store release is needed to run a campaign.
- Avoid the classic "everything re-renders" trap that large config-driven feeds fall into.

## 4. Goals

| # | Goal |
|---|------|
| G1 | A type-safe, declarative Component Registry (factory pattern) maps JSON `type` strings to React components — no `switch`/`if-else` chains. |
| G2 | The full homepage renders inside **one** virtualized vertical list, with a horizontal virtualized carousel nested inside one of the block types, without dropping frames. |
| G3 | A single centralized `handleAction()` dispatcher is the only place that interprets action semantics; UI components stay "dumb." |
| G4 | Three runtime-swappable "campaign" configs demonstrate full theme/overlay/animation swaps from data alone. |
| G5 | Cart-state updates from any single card never cause sibling cards to re-render. |
| G6 | Unknown/malformed block types are dropped silently and never crash or corrupt the surrounding tree. |

*(§14 adds an optional, additive "Delight Layer" of motion/micro-interaction polish on top of this architecture. It does not replace, weaken, or count against G1–G6 — it's a stretch layer, not a goal.)*

## 5. Non-Goals (Out of Scope)

- A real backend, real network calls, or real payment/cart persistence.
- Pixel-perfect production visual design — functional, clean UI is sufficient.
- Authentication, user accounts, or order history.
- Real Lottie/WebP assets — placeholder or freely-licensed sample assets are fine, referenced by URL/local file as if remote.
- Cross-platform pixel parity (iOS vs Android) — best-effort only.

## 6. Users / Stakeholders (in-fiction)

- **Shopper (end user):** sees a fast, glitch-free home feed regardless of which campaign is live.
- **Growth/Marketing team (payload author):** can "ship" a new campaign by publishing a new JSON config — this is the persona whose constraint (no app release) the whole architecture serves.
- **Mobile engineering team (you):** owns the rendering engine and the registry; should be able to add a brand-new block type by registering a component, not by editing a core switch statement.

---

## 7. Functional Requirements

### FR1 — Mock JSON Payload & Schema
Construct a local JSON file simulating the backend payload. It must contain a `theme` object, a `blocks` array with a realistic mix of block types (including at least one block whose `type` is **not** in the registry, to exercise resilience), and enough item-level data (images, prices, titles, actions) to look like a real catalog feed — not just 2–3 stub blocks.

### FR2 — Component Registry (Factory Pattern)
A single lookup structure (object/Map) of `type → Component`. The renderer does `registry[block.type]`; if undefined, it returns `null`/skips and (ideally) logs a dev-only warning. Adding a new block type should mean adding one entry, not touching renderer logic.

### FR3 — Required Block Types
| Type | Behavior |
|---|---|
| `BANNER_HERO` | Full-width promo image/card, tappable, fires an `action`. |
| `PRODUCT_GRID_2X2` | 2x2 grid of product cards nested in one block, each independently tappable/addable to cart. |
| `DYNAMIC_COLLECTION` | Horizontal carousel with a title (e.g. "Snacks under ₹99"), items independently tappable/addable to cart. |
| `FULL_SCREEN_OVERLAY` | Campaign-only — see FR7/FR8. |

### FR4 — Structural Resilience
Any block with an unrecognized `type`, or a recognized `type` with missing/malformed required fields, must be dropped without throwing, without breaking sibling block rendering, and without an unhandled visual gap that looks broken (e.g. don't render a broken-image icon — just omit the block).

### FR5 — Nested Virtualization (Dynamic Collection)
`DYNAMIC_COLLECTION` is a horizontal FlashList/FlatList mounted as a list-item inside the outer vertical FlashList/FlatList. Horizontal gestures on the carousel must not steal, throttle, or visually compete with the outer list's vertical scroll velocity. No new horizontal-list instance should be created per re-render of the outer list (would cause memory growth) — instances should be stable across normal scroll/interaction.

### FR6 — Universal Action Dispatcher
A single exported `handleAction(action: Action)` function is the only place that branches on `action.type` (`ADD_TO_CART`, `DEEP_LINK`, `APPLY_MYSTERY_GIFT_COUPON`, etc.) and decides what happens. Leaf components (`ProductCard`, `BannerHero`, …) only know "I was tapped, here's my action object" — they import and call the dispatcher, they don't contain cart/navigation logic themselves.

### FR7 — Live Campaign Engine
Three bundled local campaign configs, switchable at runtime via local UI control (e.g. a dev-only switcher) simulating what a backend flag would do in production:

| Campaign | Theme | Distinct elements |
|---|---|---|
| Back to School Mega-Sale | bright yellow + primary blue | Lottie animation (paper airplanes/pencils); dedicated "Lunchboxes & Bags" row |
| Summer Playhouse Festival | ocean blue palette | Animated WebP overlay (water splash/beach ball); "Petting Zoo Tickets" row |
| Mystery Gift Carnival | carnival red | Confetti overlay; row whose action is `APPLY_MYSTERY_GIFT_COUPON` |

Switching the active campaign must only require swapping which local JSON config is loaded — no component code changes.

### FR8 — Full-Screen Overlay Behavior
`FULL_SCREEN_OVERLAY` (`{ type: "FULL_SCREEN_OVERLAY", animation_url }`) renders above the entire screen, scaled to fill it, with `pointerEvents="none"` on the overlay's outer wrapper so all taps pass through to the underlying feed. Remote animation assets are loaded through a caching-aware loader (e.g. cache-first fetch, or `expo-image`/Lottie's built-in caching) rather than re-fetched on every mount.

### FR9 — OTA Runtime Theming
The payload's `theme: { primary, background }` is read once and provided via a React Context at the root of the engine. Buttons, headers, borders, and CTAs read from this context rather than hardcoded colors, so switching campaigns visibly re-skins the whole tree without a re-mount of the list itself.

### FR10 — Local State Collocation (Cart Isolation)
Tapping "add to cart" on any single product card (in a grid or a carousel) updates a global cart-quantity counter immediately and correctly, while provably **not** re-rendering unrelated cards elsewhere in the feed. This must be demonstrable (e.g. a visible render-count badge per card, or a profiler screenshot) — not just claimed.

---

## 8. Data Model (TypeScript)

```ts
// ---- Actions ----
type ActionType =
  | "ADD_TO_CART"
  | "DEEP_LINK"
  | "APPLY_MYSTERY_GIFT_COUPON";

interface BaseAction<T extends ActionType, P> {
  type: T;
  payload: P;
}

type AddToCartAction = BaseAction<"ADD_TO_CART", { productId: string; qty?: number }>;
type DeepLinkAction = BaseAction<"DEEP_LINK", { url: string }>;
type ApplyMysteryGiftAction = BaseAction<"APPLY_MYSTERY_GIFT_COUPON", { couponCode: string }>;

type Action = AddToCartAction | DeepLinkAction | ApplyMysteryGiftAction;

// ---- Product ----
interface Product {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  action: AddToCartAction;
  badge?: { label: string; pulse?: boolean }; // optional — §14 D7, absent = no visual change
}

// ---- Blocks (discriminated union) ----
interface BaseBlock {
  id: string;
  type: string; // intentionally widened here; narrowed per-variant below
}

interface BannerHeroBlock extends BaseBlock {
  type: "BANNER_HERO";
  imageUrl: string;
  action?: Action;
}

interface ProductGrid2x2Block extends BaseBlock {
  type: "PRODUCT_GRID_2X2";
  title?: string;
  items: Product[]; // expect exactly 4, but don't crash if fewer
}

interface DynamicCollectionBlock extends BaseBlock {
  type: "DYNAMIC_COLLECTION";
  title: string;
  items: Product[];
}

interface FullScreenOverlayBlock extends BaseBlock {
  type: "FULL_SCREEN_OVERLAY";
  animation_url: string;
}

type KnownBlock =
  | BannerHeroBlock
  | ProductGrid2x2Block
  | DynamicCollectionBlock
  | FullScreenOverlayBlock;

// What actually arrives over the wire — type may be anything, including garbage
type IncomingBlock = KnownBlock | (BaseBlock & { type: string; [k: string]: unknown });

// ---- Theme & Campaign ----
interface ThemeConfig {
  primary: string;
  background: string;
  ambientMotion?: "confetti" | "bubbles" | "sparkle" | "none"; // optional — §14 D6
}

interface CampaignConfig {
  id: "back_to_school" | "summer_playhouse" | "mystery_gift_carnival";
  name: string;
  theme: ThemeConfig;
  overlay?: FullScreenOverlayBlock;
  extraBlocks?: KnownBlock[];
  refreshAnimationUrl?: string; // optional — §14 D9, themed pull-to-refresh
}

// ---- Root payload ----
interface HomepagePayload {
  theme: ThemeConfig;
  activeCampaignId?: CampaignConfig["id"];
  blocks: IncomingBlock[];
}
```

## 9. Technical Architecture

### 9.1 Registry pattern (FR2)
```ts
type BlockComponent<B extends KnownBlock> = React.FC<{ block: B }>;

const ComponentRegistry: { [K in KnownBlock["type"]]: BlockComponent<Extract<KnownBlock, { type: K }>> } = {
  BANNER_HERO: BannerHero,
  PRODUCT_GRID_2X2: ProductGrid,
  DYNAMIC_COLLECTION: DynamicCollection,
  FULL_SCREEN_OVERLAY: FullScreenOverlay,
};

function renderBlock(block: IncomingBlock) {
  const Component = ComponentRegistry[block.type as KnownBlock["type"]];
  if (!Component) {
    if (__DEV__) console.warn(`[SDUI] Unrecognized block type "${block.type}" — dropped.`);
    return null;
  }
  return <Component block={block as any} />;
}
```

### 9.2 Action dispatcher (FR6)
```ts
export function handleAction(action: Action) {
  switch (action.type) {
    case "ADD_TO_CART":
      useCartStore.getState().addToCart(action.payload.productId, action.payload.qty);
      break;
    case "DEEP_LINK":
      router.push(action.payload.url); // expo-router or React Navigation
      break;
    case "APPLY_MYSTERY_GIFT_COUPON":
      applyCoupon(action.payload.couponCode);
      break;
  }
}
```
This is the *one* sanctioned switch statement in the codebase — it's branching on a closed, exhaustive action union, not on open-ended/unknown server strings, which is the distinction the resilience requirement (FR4) cares about.

### 9.3 Isolated cart state (FR10)
Use Zustand (or a hand-rolled store) with **selector-based subscriptions** so each card only re-renders when *its own* slice changes:
```ts
interface CartState {
  items: Record<string, number>;
  addToCart: (productId: string, qty?: number) => void;
}

const useCartStore = create<CartState>((set) => ({
  items: {},
  addToCart: (productId, qty = 1) =>
    set((state) => ({
      items: { ...state.items, [productId]: (state.items[productId] ?? 0) + qty },
    })),
}));

// Inside ProductCard:
const qty = useCartStore((s) => s.items[product.id] ?? 0); // only re-renders if THIS id's count changes
```
Wrap `ProductCard` in `React.memo` with a custom comparator on `product.id` so the parent grid/carousel re-rendering (e.g. from theme change) doesn't cascade either.

### 9.4 Theming context (FR9)
```ts
const ThemeContext = createContext<ThemeConfig>({ primary: "#000", background: "#fff" });
// <ThemeContext.Provider value={payload.theme}> wraps the root engine
// const { primary } = useContext(ThemeContext) inside leaf components
```

### 9.5 Suggested folder structure
```
/src
  /engine
    HomepageRenderer.tsx      // outer FlashList + renderBlock
    ComponentRegistry.ts
    actionDispatcher.ts
  /blocks
    BannerHero.tsx
    ProductGrid2x2.tsx
    DynamicCollection.tsx
    FullScreenOverlay.tsx
  /components
    ProductCard.tsx           // memoized leaf
  /state
    cartStore.ts
    ThemeContext.tsx
  /campaigns
    backToSchool.json
    summerPlayhouse.json
    mysteryGiftCarnival.json
  /mock
    homepage.mock.json        // includes ≥1 unsupported block type on purpose
  /types
    blocks.ts
    actions.ts
```

## 10. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | No dropped-frame stutter on outer list scroll while inner carousel is being dragged; verified via `react-native` perf monitor or Flipper. |
| Type safety | `strict: true` in `tsconfig.json`; no `any` in the registry/dispatcher signatures (the one acceptable `as` is the registry lookup cast shown above). |
| Resilience | Engine must not crash on: unknown `type`, missing `items` array, malformed `action`, missing `imageUrl`. |
| Memory | Repeated mount/unmount of `DYNAMIC_COLLECTION` rows (via scroll) must not show unbounded memory growth. |
| Maintainability | Adding a 5th block type = 1 new component + 1 registry entry; zero edits to `HomepageRenderer.tsx`. |

## 11. Acceptance Criteria (mapped to the stated grading rubric)

| Rubric item | How this PRD's design satisfies it |
|---|---|
| Architectural cleanliness | Registry object (FR2/§9.1), not switch-on-type. |
| Sustained frame performance | Single outer FlashList, `keyExtractor` by stable `block.id`, `React.memo` on leaf cards, nested horizontal list isolated per FR5. |
| TypeScript strategy | Discriminated unions for blocks & actions (§8); `IncomingBlock` deliberately widened to model "anything could arrive." |
| Defensive resilience | `renderBlock` returns `null` + dev warning on miss (§9.1); mock payload intentionally includes a bad block type to prove it. |

## 12. Assumptions & Open Questions

- Assuming Expo (faster iteration, asset/Lottie support out of the box) unless reviewer specifies Bare Workflow.
- Assuming `@shopify/flash-list` over `FlatList` given the explicit "highly recommended" framing and the perf rubric weight.
- Open question: should campaign switching be exposed as a visible dev toggle in the demo, or only swappable by editing which JSON file is imported? (Recommend: visible toggle — makes the "no app release needed" story demoable live.)
- Open question: real remote asset URLs vs. bundled local assets referenced by a fake `https://` URL — recommend bundling locally and treating the path as if it were remote, to avoid flaky network dependencies during review.

## 13. Suggested Build Plan

1. **Schema + Registry skeleton** — types, mock JSON (with one deliberately bad block), registry, outer FlashList rendering all blocks as plain placeholder boxes.
2. **Real block UIs** — BannerHero, ProductGrid2x2, DynamicCollection with real styling and `keyExtractor`/memoization in place from the start.
3. **Action dispatcher** — wire all taps through `handleAction`, stub out cart/navigation/coupon handlers.
4. **Cart state isolation** — Zustand store + selector subscriptions + memo; add a visible render-count badge per card to prove isolation.
5. **Theming context** — root `ThemeContext`, wire 2–3 components to consume it, confirm live re-skin.
6. **Campaign engine** — 3 campaign JSONs, switcher UI, `FULL_SCREEN_OVERLAY` with `pointerEvents="none"`, Lottie/WebP per campaign.
7. **Resilience pass** — throw more malformed blocks at it (missing fields, null arrays, wrong types) and confirm nothing crashes.
8. **Performance pass** — profile scroll, confirm no nested-list re-mount churn, finalize `keyExtractor`/memo boundaries.

---

## 14. Delight Layer — Motion & Micro-Interaction Polish (Stretch, Non-Blocking)

**Why this section exists:** the brief's rubric is architecture-first — registry pattern, frame performance, type safety, resilience (§"Candidate Evaluation Criteria" in the assignment). None of it scores on visual flourish. Everything below is therefore explicitly a *stretch layer*: build it only after FR1–FR10 (§7) are solid and demoable, never instead of them. Every item is designed to bolt onto the existing architecture — registry, dispatcher, theme context, single outer list, isolated cart store — rather than introduce a parallel system, so none of it puts the assignment's stated constraints at risk.

**Guardrails that keep this section inside the brief's rules:**
- **No new top-level list.** Every effect lives either *inside* an existing block component, or as a single root-level overlay sibling to the outer FlashList — the exact pattern the brief already uses for `FULL_SCREEN_OVERLAY` (FR8). The "single, singular vertical FlatList/FlashList" rule (§1D of the assignment) is never violated.
- **UI thread only.** All motion runs on Reanimated shared values (`withTiming` / `withSpring` / `withRepeat`), never the legacy JS-thread `Animated` API — so it stays invisible to the frame-rate rubric line and to the outer list's scroll responder, and never threatens the "no stutter / no dropped vertical velocity" constraint (§1B).
- **Leaf components stay dumb.** Cards still only fire their `action` object. Any visual flair tied to *what happens after* the action (fly-to-cart ghost, confetti burst, haptic buzz) is triggered *from inside* `handleAction`, never from the card itself — the same decoupling the assignment mandates for business logic (§1C / FR6) just carries the FX trigger too.
- **Schema additions are optional and additive.** Every new JSON field defaults to "absent," and an absent field means zero visual change from today's behavior — so the Resilience Critical Rule (§1A) and FR4 are untouched by any of this.

### 14.1 Wow-factor catalogue

| # | Feature | What the user sees | Where it lives / how it stays inside the rules |
|---|---|---|---|
| D1 | Skeleton shimmer placeholders | Each block type shows a shaped, softly-shimmering placeholder — matched to its final layout — while the mock payload "arrives," instead of a blank screen or spinner. | Pure presentational state inside each existing block component; one looped Reanimated shared value drives the shimmer. No new list, no layout shift once real content swaps in. |
| D2 | Staggered entrance animation | Each block fades + slides up ~12px the first time it scrolls into view, staggered ~40ms per item. | Driven by `viewabilityConfig` / `onViewableItemsChanged` on the *existing* outer list; a `Set<blockId>` kept in a ref (not state) tracks "already animated" so recycled cells never replay it — the strict `keyExtractor`/memo boundaries (§1D) stay untouched. |
| D3 | "Fly-to-cart" ghost + spring cart badge | Tapping "Add" sends a small ghost copy of the product thumbnail arcing into the header's cart icon, which does a quick spring "pop." | The card only fires `ADD_TO_CART` as before. `handleAction` measures the card's on-screen rect and triggers a single root-mounted `CartFXOverlay` — same `pointerEvents="none"` overlay pattern already required for `FULL_SCREEN_OVERLAY`. The badge subscribes only to its own Zustand slice, so this never touches sibling cards — preserves FR10/G5 exactly. |
| D4 | Sliding mini-cart bar | A slim bar slides up from the bottom the moment cart count > 0, showing total items + tiny thumbnails of what's inside. | Its own component, subscribed to its own store selector — isolated from the feed's render tree, same isolation guarantee as D3. |
| D5 | Campaign theme cross-fade | Switching the active campaign melts the background/primary colors over ~300ms instead of popping instantly. | Same `ThemeContext` (FR9, §9.4) — just wraps the values in a Reanimated `interpolateColor`. No new state source of truth. |
| D6 | Data-driven ambient motion | A faint looping particle treatment behind the hero banner only — confetti drift, bubbles, or sparkle, depending on the active campaign. | Uses the new optional `theme.ambientMotion` field (§8), resolved through a tiny lookup table built the exact same way as the §9.1 Component Registry — same factory pattern, one more entry, not a new paradigm. Scoped to the hero only, never the full screen, to keep it cheap. |
| D7 | Pulsing "Hot" badge on carousel items | An optional soft pulse-glow ring around a `DYNAMIC_COLLECTION` item's badge (e.g. "🔥 Trending"). | Uses the new optional `Product.badge` field (§8) — absent by default, so existing mock items are unaffected and FR4 resilience is untouched. |
| D8 | Confetti burst on mystery-gift redemption | A short, contained Lottie confetti burst near the row that fired the action, instead of (or alongside) the full-screen overlay. | Triggered from inside `handleAction`'s existing `APPLY_MYSTERY_GIFT_COUPON` branch (§9.2) — reuses the same cached Lottie loader already required for FR8. |
| D9 | Themed pull-to-refresh | The outer list's native `refreshControl` plays a tiny campaign-themed Lottie loop while refreshing (falling pencils for Back to School, a wave ripple for Summer Playhouse). | Uses the new optional `CampaignConfig.refreshAnimationUrl` field (§8) — same "swap JSON, get new visuals" principle as FR7; falls back to the platform default spinner if absent. |
| D10 | Haptic feedback | A light haptic tick on a successful add-to-cart and on campaign switch. | One-line call inside `handleAction`'s `ADD_TO_CART` branch and the campaign-switch handler — zero leaf-component involvement, same decoupling as D3/D8. |

### 14.2 Two representative sketches

**Cart badge spring-pop, fully isolated (extends §9.3):**
```ts
// components/CartBadge.tsx
const count = useCartStore((s) => Object.values(s.items).reduce((a, b) => a + b, 0));
const scale = useSharedValue(1);

useEffect(() => {
  scale.value = withSequence(withSpring(1.35, { damping: 6 }), withSpring(1));
}, [count]);

const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
// <Animated.View style={style}><Text>{count}</Text></Animated.View>
```
Only re-renders on its own selector slice — the 30+ sibling cards never see this component re-render, the same guarantee FR10 already demands.

**Theme cross-fade (extends §9.4):**
```ts
// state/ThemeContext.tsx
const progress = useSharedValue(0);
useEffect(() => { progress.value = withTiming(1, { duration: 300 }); }, [activeCampaignId]);

const bg = useDerivedValue(() =>
  interpolateColor(progress.value, [0, 1], [prevTheme.background, nextTheme.background])
);
```
Same single `ThemeContext` source of truth — just animated instead of snapping.

### 14.3 Suggested build order
Only after Build Plan steps 1–8 (§13) are done and demoable:
1. **D1 + D2** — cheapest visual lift; touches only existing components.
2. **D3 + D4** — biggest "wow," and directly showcases the cart-isolation work FR10 already required you to do.
3. **D5 + D6** — reuse the FR9/FR2 patterns almost verbatim.
4. **D7–D10** — small and independent; do as many as time allows.

### 14.4 One honest caveat
`react-native-reanimated` (and `expo-haptics` for D10) aren't named in the brief's "Stack to Know." Neither conflicts with anything listed there — Reanimated is the standard, UI-thread-safe pairing for FlashList-based feeds, and is what keeps D1–D9 from costing you the frame-rate rubric line — but if your reviewer is strict about *only* the named libraries, treat this whole section as optional and say so plainly in your README rather than silently adding dependencies.

---

## 15. Tooling Division — MCP-Assisted Workflow

You mentioned five connected MCP tools (names were truncated in the panel, so identities below are inferred from name + tool-count and should be confirmed against the actual connector picker before relying on this section). None of them change anything in §1–§14 — they're how you'll move faster through the existing plan, not new requirements. Only assign a tool work where it's a genuine fit; forcing one in everywhere would just add noise.

| MCP (as shown) | Likely identity | Where it actually helps | What it should not be trusted to do |
|---|---|---|---|
| conte... (2/2 tools) | Context7 — live library-docs lookup | Build Plan steps 1, 2, 6 (§13): pull current, version-accurate API signatures for `@shopify/flash-list`, `react-native-reanimated` v3, `lottie-react-native`, and Zustand before writing the registry/dispatcher/animation code. Directly protects the TypeScript Strategy and Sustained Frame Performance rubric lines — stale FlashList/Reanimated APIs are a common, silent way perf work breaks. | Architectural decisions (registry vs. switch, memo boundaries) — those are this PRD's call, not a docs lookup's. |
| GitHub | GitHub — repo ops | Bookend the build: scaffold the repo from the §9.5 folder structure at the start, commit per Build Plan step (1→8, then 14.3's delight steps) so there's a clean, reviewable history rather than one giant final commit — reviewers of "production-ready" submissions often skim commit hygiene, not just the diff. | Anything destructive (force-push, branch deletion) without you confirming first. |
| magi... mcp (3/3 tools) | Magic MCP (21st.dev-style AI component generator) | First-pass scaffolds for Delight Layer pieces (§14) that are mostly visual boilerplate — e.g. a shimmer skeleton shell or the `CartFXOverlay` container — to hand-refine afterward, not core SDUI engine code (registry, dispatcher, cart store), which needs to match this PRD's exact contracts. | Ship as final without retrofitting to §14's guardrails (UI-thread animation, dumb leaf components, root-overlay pattern) — generated scaffolds rarely arrive already obeying those by default. |
| pla... (23/23 tools) | Playwright — browser automation | Only relevant if you also stand up a React Native Web preview for fast visual QA without a simulator. Optional, not part of the core plan. | Testing the actual iOS/Android app — Playwright drives browsers, not native RN runtimes; don't let its presence imply RN-native E2E coverage you don't actually have. |
| stitch (9/9 tools) | Stitch — Google's AI UI/visual design generator | Filling the gap the assignment itself left open: the brief's campaign table says "[Attach/Embed Video Here]" for each campaign's look but never specifies exact colors/composition. Use it to generate reference mockups for the three campaign skins (§FR7) and the hero's ambient motion (§14 D6) — then read the actual hex values off the result into `theme.primary` / `theme.background` (§8), so the visual design has a source instead of being invented ad hoc while coding. | Don't treat its output as final asset files — re-export/recreate anything used as a real Lottie/WebP asset rather than shipping a design-tool screenshot. |

**Suggested order:** Stitch (design reference) → GitHub (repo init) → Context7 (verify APIs as you build §13 steps 1–8) → Magic MCP (delight-layer scaffolds, §14.3) → Playwright only if a web preview is in scope.

---

*End of PRD.*
