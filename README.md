# Kiddo SDUI Homepage Renderer

A generic, server-driven React Native (Expo) rendering engine for Q-commerce home feeds. The application is driven dynamically by a local mock JSON payload; visual themes, layout hierarchies, campaign banners, overlays, and action dispatchers are fully controlled by server data without requiring App Store / Play Store binary release cycles.

---

## 🚀 Key Architectural Pillars

### 1. Component Registry (Factory Pattern)
* Renders blocks dynamically by looking up mapping definitions in [`src/engine/ComponentRegistry.ts`](file:///d:/Assessment/Kiddo%20Assigment/kiddo-sdui/src/engine/ComponentRegistry.ts).
* Replaces brittle `switch`/`if-else` cascades with a clean type-safe `Record<BlockType, ReactComponent>` lookup mapper. Adding a new component only requires registering it inside the registry dictionary.

### 2. High Frame-Rate Optimization & List Virtualization
* Runs the entire homepage stream inside a single vertical Shopify `FlashList` ([`src/engine/HomepageRenderer.tsx`](file:///d:/Assessment/Kiddo%20Assigment/kiddo-sdui/src/engine/HomepageRenderer.tsx)) configured with stable string-based `keyExtractor` keys.
* Resolves nested list scroll fights by configuring the horizontal scroll carousel ([`src/blocks/DynamicCollection.tsx`](file:///d:/Assessment/Kiddo%20Assigment/kiddo-sdui/src/blocks/DynamicCollection.tsx)) with independent virtualization boundaries, `nestedScrollEnabled={true}`, and optimized fast layout recycling properties.

### 3. Isolated Cart State (Render-Cycle Challenge)
* Incorporates a global Zustand store ([`src/state/cartStore.ts`](file:///d:/Assessment/Kiddo%20Assigment/kiddo-sdui/src/state/cartStore.ts)) mapping cart items under a record mapping.
* Utilizes **selector-based subscriptions** inside [`ProductCard`](file:///d:/Assessment/Kiddo%20Assigment/kiddo-sdui/src/components/ProductCard.tsx) to listen only to its specific slice of data:
  ```ts
  const quantity = useCartStore((state) => state.items[product.id] ?? 0);
  ```
* Combined with `React.memo` custom item comparators, mutating the quantity of a single card **never triggers a re-render** across sibling product cards or the outer SDUI layout feed (verifiable by the visual render badge `R: [count]` in the top corner of each card).

### 4. Over-The-Air Theme Injections & Live Campaigns
* Emits runtime color variables (`primary`, `background`) supplied dynamically from the mock payload using a React context provider wrapping the root node ([`src/state/ThemeContext.tsx`](file:///d:/Assessment/Kiddo%20Assigment/kiddo-sdui/src/state/ThemeContext.tsx)).
* Contains a Campaign Control Panel (Dev Mode) enabling instantaneous swapping between three campaign states:
  1. **Back to School Mega-Sale** (Yellow theme, paper airplanes overlay, lunchboxes carousel row)
  2. **Summer Playhouse Festival** (Ocean blue theme, water splash overlay, zoo ticket components)
  3. **Mystery Gift Carnival** (Carnival red theme, confetti overlay, coupon redemption deep actions)

### 5. Defensive Resilience (Critical Rules)
* Traps nested component exceptions locally using a layout-level `BlockErrorBoundary` ([`src/engine/BlockErrorBoundary.tsx`](file:///d:/Assessment/Kiddo%20Assigment/kiddo-sdui/src/engine/BlockErrorBoundary.tsx)) keeping the rest of the stream fully responsive.
* Filters out malformed payloads (e.g. grids missing item arrays) and drops unknown types silently to ensure structural view tree stability.

---

## 🛠️ Delight Layer (Motion Polish)
* **D1 Shimmer Placeholders**: Looping high-performance skeleton cards running on the Reanimated UI thread while the feed loads ([`src/components/ShimmerPlaceholder.tsx`](file:///d:/Assessment/Kiddo%20Assigment/kiddo-sdui/src/components/ShimmerPlaceholder.tsx)).
* **D2 Staggered Entrances**: Smooth slide and fade-in animations timed per list cell index ([`src/components/StaggeredView.tsx`](file:///d:/Assessment/Kiddo%20Assigment/kiddo-sdui/src/components/StaggeredView.tsx)).
* **D5 Theme Morphing**: Dynamic context colors morphing during campaign swaps.
* **Spring Pop Cart Badges**: Spring scaling indicators wrapping the cart badge when item count increases.

---

## 📦 Setting Up the Environment

1. Install dependencies:
   ```bash
   cd kiddo-sdui
   npm install
   ```
2. Verify TypeScript strict check:
   ```bash
   npx tsc --noEmit
   ```
3. Start the application preview server:
   ```bash
   npx expo start
   ```
