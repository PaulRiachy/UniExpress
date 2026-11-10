# UniExpress — Application Architecture

**Status:** Approved-stack architecture reference — PocketBase instructor approval confirmed  
**Date:** 2026-11-04  
**Project:** UniExpress (renamed from CampusGo)  
**Sources:** Original *CampusGo – Antonine Campus Delivery Application* brief (`docs/Project_CampusGo_Campus_Delivery.pdf`), pp. 1–3; `docs/TECH_STACK.md`.  
**Purpose:** Guide incremental implementation in VS Code with Codex. **No application source code is included.**

**Instructor approval:** PocketBase has been explicitly approved for UniExpress. It is the confirmed backend for authentication, persistent application data and API operations. **No further approval of PocketBase is required before development.**

## 1. Architecture at a glance

- **Mobile:** JavaScript, React Native + Expo, functional components and Hooks, React Navigation (bottom tabs + native stacks), `FlatList` for every displayed list.
- **Backend:** PocketBase (SQLite, built-in authentication, collections, REST API), called directly with the official `pocketbase` JavaScript SDK. **No Express server.**
- **State:** Local component state for forms/UI; a small Auth Context and Cart Context for shared session/cart state; PocketBase as the source of truth for accounts, catalog, orders, wallet and saved locations.
- **Storage:** No AsyncStorage for application data. Keep cart in **memory** until checkout; retrieve committed orders and wallet records from PocketBase. Optionally persist **only an auth token** using `expo-secure-store` if that decision is approved.
- **Security:** Mobile code is untrusted. Read-only catalog calls can use ordinary SDK collection queries. A small, authenticated **PocketBase server-side checkout route** is required before accepting orders and wallet deductions; it validates and persists everything in one database transaction. This is PocketBase scripting, **not** a separate backend framework.
- **Scope:** Academic prototype; cash and wallet top-up are simulated. No real card payments, GPS, document uploads, courier application, or realtime dependency.

### Logical data flow

```text
React Native screens + reusable components
              |
       Hooks / Context
              |
   Frontend service modules
              |
        pocketbase.js (one SDK client)
              |
      PocketBase HTTP API
              |
    +-------------------------+
    | Collection APIs         | -> safe catalog/user-owned reads
    | Custom trusted routes   | -> checkout, cancellation, demo top-up
    | Access rules / hooks    | -> authorization, validation, transitions
    +-------------------------+
              |
       SQLite collections
```

The app never imports the PocketBase SDK directly into screens, hooks, components or Context files. Only the `src/services/` layer does.

## 2. Recommended repository structure

This is the **target layout**, not a requirement to create every file on day one. Add files only when a feature is implemented. `pocketbase/` represents the standalone binary's **version-controlled configuration and scripts**, not its executable or live data.

```text
uniexpress/
├── App.js                         # Application entry: providers + app navigation
├── app.json                       # Expo application configuration
├── package.json
├── package-lock.json
├── babel.config.js                # Only if required by selected Expo template
├── .gitignore
├── .env.example                   # EXPO_PUBLIC_POCKETBASE_URL placeholder only
├── .env.local                     # Local nonsecret API URL; gitignored
├── AGENTS.md                     # Codex instructions stay at the root
├── assets/                       # Expo starter assets
│
├── src/
│   ├── navigation/
│   │   ├── RootNavigator.js       # Authenticated vs unauthenticated flow
│   │   ├── AuthNavigator.js       # Welcome, Login, Sign Up
│   │   ├── MainTabNavigator.js    # Home, Cart, Orders, Profile tabs
│   │   └── MainStackNavigator.js  # Store, Product, Printing, Checkout, Tracking, Wallet
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.js
│   │   │   ├── LoginScreen.js
│   │   │   └── SignUpScreen.js
│   │   ├── home/
│   │   │   └── HomeScreen.js
│   │   ├── store/
│   │   │   ├── StoreScreen.js
│   │   │   └── ProductDetailsScreen.js
│   │   ├── printing/
│   │   │   └── PrintingScreen.js
│   │   ├── checkout/
│   │   │   ├── CartScreen.js
│   │   │   └── CheckoutScreen.js
│   │   ├── orders/
│   │   │   ├── OrderTrackingScreen.js
│   │   │   └── OrderHistoryScreen.js
│   │   └── profile/
│   │       ├── ProfileScreen.js
│   │       ├── SavedLocationsScreen.js
│   │       └── WalletScreen.js
│   │
│   ├── components/
│   │   ├── common/                # Loading, ErrorMessage, EmptyState, form controls
│   │   ├── stores/                # StoreCard, OpenClosedBadge
│   │   ├── products/              # ProductCard, QuantitySelector
│   │   ├── cart/                  # CartItem, OrderTotals
│   │   └── orders/                # OrderCard, StatusTimeline, RatingInput
│   │
│   ├── context/
│   │   ├── AuthContext.js          # Signed-in user/auth readiness; sign-in/out actions
│   │   └── CartContext.js          # One-store, in-memory cart and printing jobs
│   │
│   ├── hooks/
│   │   ├── useAuth.js              # Thin AuthContext consumer
│   │   ├── useCart.js              # Thin CartContext consumer
│   │   └── useStoreStatus.js       # Opening-hours display logic
│   │
│   ├── services/
│   │   ├── pocketbase.js           # Sole SDK instance, URL and auth-store setup
│   │   ├── authService.js          # Login, registration, logout, refresh, profile
│   │   ├── catalogService.js       # Stores, product categories/products, hours
│   │   ├── deliveryService.js      # Buildings, slots, saved locations
│   │   ├── pricingService.js       # Fetch price policy; display-only estimates
│   │   ├── orderService.js         # Checkout route, order queries, cancel, rating
│   │   └── walletService.js        # Balance, transactions, demo top-up route
│   │
│   ├── utils/
│   │   ├── validation.js          # Form validation and clear messages
│   │   ├── formatters.js          # Currency, dates, times
│   │   └── calculations.js        # Client estimates only; never trusted at checkout
│   │
│   ├── constants/
│   │   ├── orderStatus.js          # Known status labels/order
│   │   └── categories.js           # UI-only stable category labels if needed
│   │
│   └── assets/
│       ├── images/                # App logo, placeholders, local artwork
│       └── icons/                 # Only locally owned icons if needed
│
├── pocketbase/
│   ├── pb_migrations/             # Committed schema/access-rule/index migrations
│   ├── pb_hooks/                  # PocketBase JavaScript server hooks/routes
│   │   ├── checkout.pb.js         # Verified pricing + atomic order/payment handling
│   │   ├── orderActions.pb.js     # Authorized cancel/rate/demo status operations
│   │   └── demoWallet.pb.js        # Controlled simulated top-up endpoint
│   ├── seed/                      # Synthetic test data, not sensitive user data
│   │   ├── catalog.json           # >=4 stores and >=25 products
│   │   └── campus.json            # >=6 buildings and >=5 break slots
│   └── pb_data/                   # Local SQLite/files: NEVER commit
│
└── docs/
    ├── Project_CampusGo_Campus_Delivery.pdf
    ├── TECH_STACK.md
    ├── ARCHITECTURE.md
    ├── DEVELOPMENT_PLAN.md
    ├── README.md                 # Future user guide
    ├── pocketbase-setup.md       # Future pinned version/startup/migration guide
    ├── pocketbase-seed.md        # Future repeatable seed/import procedure
    └── test-checklist.md         # Future brief-derived manual tests
```

**Physical PocketBase executable:** Download/pin the selected Windows binary separately (e.g. into `pocketbase/` locally) and ignore it in Git. Run PocketBase with a working directory/configuration that loads `pb_migrations` and `pb_hooks`; document the exact startup command after the binary version and layout are confirmed. Do not make undocumented assumptions about where PocketBase finds folders.

### Folder responsibilities

| Location | Responsibility / boundary |
|---|---|
| `src/screens/` | One screen per task. Display data, collect user input, invoke hooks/services, handle loading and error states. Avoid database queries, long calculations and security rules inside screens. |
| `src/components/` | Reusable, mostly presentational UI. Accept props and callbacks. No PocketBase imports. |
| `src/navigation/` | Routes, tab/stack structure, authentication gating, navigation parameters. No backend queries. |
| `src/services/` | **Only frontend access point** for PocketBase. Centralized SDK calls, query/filter construction, error mapping, custom route requests. Make future backend replacement possible by preserving service interfaces. |
| `src/context/` | Small cross-screen client state: auth and single-store cart. No replicated backend database. |
| `src/hooks/` | Reuse simple React behavior; add a hook only when behavior truly repeats. |
| `src/utils/` | Pure formatting/validation/estimate functions, with no API access or React imports. |
| `src/constants/` | Stable UI constants, not editable server price tables. |
| `src/assets/` | Images/icons bundled with Expo. Catalog media may instead come from PocketBase file URLs. |
| `pocketbase/pb_migrations/` | Versioned schema, indexes, and per-operation access rules. |
| `pocketbase/pb_hooks/` | Minimum necessary trusted operations. PocketBase JavaScript hook files are not Node/Express middleware. |
| `pocketbase/seed/` | Version-controlled *synthetic* example data and import guidance. |

## 3. Navigation and required functionality

Use **React Navigation**, not Expo Router. Keep a simple auth stack and authenticated tab navigation; push detail/checkout screens onto the main stack. Specific nesting can be adjusted to avoid duplicate headers.

| Original brief feature | Screen(s) | Core behavior |
|---|---|---|
| 1. Welcome / Login | `WelcomeScreen`, `LoginScreen`, `SignUpScreen` | `@ua.edu.lb` email validation, name, student/staff ID, faculty, phone, password; real PocketBase auth, server-side validation. |
| 2. Home – Campus Stores | `HomeScreen` | Four campus services, open/closed from hours, search/category filter, prep time, next valid slot, wallet balance. |
| 3. Store Menu & Product Details | `StoreScreen`, `ProductDetailsScreen` | Product categories and options, images, stock restrictions, quantities, cart badge, one-store cart constraint. |
| 4. Printing Service | `PrintingScreen` | **Simulated document name** (no upload), pages/copies, B&W/color, sides, binding, preview price; max 200 pages per job/order per validated policy. |
| 5. Cart & Checkout | `CartScreen`, `CheckoutScreen` | Edit items, estimated totals, building/room, valid break slot, wallet vs simulated cash, checkout confirmation. |
| 6. Order Tracking | `OrderTrackingScreen` | Received → Preparing → On the way → Delivered, courier/ETA placeholders, cancel only when Received, rating after delivery. |
| 7. History / Profile / Wallet | `OrderHistoryScreen`, `ProfileScreen`, `SavedLocationsScreen`, `WalletScreen` | Filter/reorder, user profile, favorite locations, wallet balance, simulated top-up, transactions. |

**Lists:** Implement all visual lists with `FlatList` (including grouped products via section headers in a `FlatList`, or a carefully justified `SectionList` only if the instructor permits). Avoid mapping collections directly into a `ScrollView` for displayed lists.

## 4. PocketBase schema (planned)

Use PocketBase's standard `id`, `created`, and `updated` fields where applicable. Define field requiredness, unique indexes, validation, relation targets, options and access rules in migrations. All amounts should use **integer cents** (USD demo currency) to avoid floating-point wallet errors. Times are campus-local; store unambiguous dates/timestamps and configure the intended timezone for schedule evaluation.

| Collection | Type | Important application fields | Relationships / notes |
|---|---|---|---|
| `users` | **Auth** | `email` (university domain), `name`, `university_id` (unique), `account_type` (student/staff), `faculty`, `phone`, `verified` | PocketBase handles password hashes and auth. Do not expose identity fields beyond owner. Registration validation must be enforced server-side; email verification policy pending. |
| `stores` | Base | `name`, `category`, `description`, `logo`, `preparation_minutes`, `is_active` | Seed four named services: Cafeteria, Coffee Corner, Bookstore & Stationery, Printing Office. |
| `store_hours` | Base | `store`, `weekday`, `opens_at`, `closes_at`, `is_closed` | Many-to-one → `stores`. Supports daily display; exception/holiday schedules can be added only if required. |
| `product_categories` | Base | `store`, `name`, `sort_order` | Many-to-one → `stores`. |
| `products` | Base | `store`, `category`, `name`, `description`, `image`, `price_cents`, `in_stock`, `is_active`, `options_json` | Many-to-one → `stores` and `product_categories`; `options_json` for small fixed size/extra choices with server-validated prices. Seed at least 25. |
| `buildings` | Base | `code` (unique), `name`, `is_active` | Seed at least six. |
| `delivery_slots` | Base | `label`, `start_time`, `end_time`, `is_active`, `sort_order` | Recurring campus class-break windows; seed at least five. Date is chosen at checkout, and the backend checks cutoff vs preparation time. |
| `saved_locations` | Base | `user`, `label`, `building`, `room` | Many-to-one → `users`, `buildings`; private per owner. |
| `pricing_rules` | Base | `minimum_order_cents` (200), `free_delivery_threshold_cents` (1000), `delivery_fee_cents` (50), `bw_page_cents` (5), `color_page_cents` (25), `spiral_binding_cents` (150), `staple_fee_cents` (default 0), `duplex_policy` | Single active policy for demo. Default example values follow brief where given; unspecified extras/duplex costs must be explicitly defined before implementation. **Admin-only edits.** |
| `orders` | Base | `user`, `store`, `building`, `room`, `slot`, `delivery_date`, `payment_method`, `status`, `subtotal_cents`, `delivery_fee_cents`, `total_cents`, `courier_name`, `estimated_delivery_at`, `delivered_at`, `cancelled_at` | Many-to-one → `users`, `stores`, `buildings`, `delivery_slots`. Store final server-calculated totals and delivery snapshot, including original room. Status enum `received`, `preparing`, `on_the_way`, `delivered`, `cancelled`. |
| `order_items` | Base | `order`, `item_type`, `product` (optional), `name_snapshot`, `quantity`, `selected_options_json`, `printing_spec_json` (optional), `unit_price_cents`, `line_total_cents` | Many-to-one → `orders`; `item_type` = `product` or `printing`. Store snapshots for history/reorder; recompute current prices on reorder. Printing spec includes name, pages, copies, color, sides, binding. |
| `wallets` | Base | `user` (unique), `balance_cents` | One-to-one → `users`. Server-owned balance; no client write. Initialize at registration according to documented demo policy. |
| `wallet_transactions` | Base | `user`, `wallet`, `order` (optional), `kind`, `amount_cents`, `balance_after_cents`, `description` | Many-to-one → `users`, `wallets`, optionally `orders`; `kind` = `demo_topup`, `payment`, `refund`. Immutable, server-created. |
| `ratings` | Base | `order` (unique), `user`, `stars`, `comment` | One rating per delivered order; validate 1–5; owner-only read/create through controlled endpoint or validated rule. |

**Why separate `order_items`:** Order history must retain the original quantity, options and paid price even if the product catalog changes. A printing job shares the same single-store cart and becomes an order item belonging to the Printing Office.

**Default data:** Preserve at least **4 stores, 25 products, 6 buildings, 5 slots** from the academic brief. Store opening times, product prices/options, and break slots are editable data, not hard-coded screen values. Use a reproducible seed file/import process; don't commit real student records.

### Relationship summary

```text
users 1 ─── * orders 1 ─── * order_items * ─── 0..1 products
  |              |                              |
  |              +── 1 stores                    +── printing spec (alternative)
  |              +── 1 buildings
  |              +── 1 delivery_slots
  +── * saved_locations ─── 1 buildings
  +── 1 wallets 1 ─── * wallet_transactions ─── 0..1 orders
  +── * ratings ─── 1 orders (unique rating/order)

stores 1 ─── * store_hours
stores 1 ─── * product_categories 1 ─── * products
stores 1 ─── * products
pricing_rules: active trusted price/fee policy
```

## 5. PocketBase access rules and server-side hooks

**Phase 6 implementation (2026-11-10):** The 14 collections above are implemented in `pocketbase/pb_migrations/` for PocketBase 0.41.1, with versioned synthetic data under `pocketbase/seed/`. Public catalog reads are selected; private records use owner filters. Registration stays locked until Phase 7; authoritative writes stay locked until trusted routes exist. `pricing_rules` includes `is_active` with a unique partial index allowing one active policy. Optional `stores.logo` and `products.image` are URL fields, left empty in the synthetic seed. Existing optional auth-avatar fields are preserved. All relations are single-select and non-cascading. See [schema policies and migration procedure](pocketbase-setup.md) for required fields, indexes, demo schedules, provisional ID validation and explicit staple/duplex/extras decisions. Cross-record business validation remains assigned to the later trusted operations below.

**Rules are an authorization layer, not a price calculator.** Define and test all five collection rules (`list`, `view`, `create`, `update`, `delete`) individually. In PocketBase **empty rule = public**, while **locked / `null` = superuser-only**. Never grant a public write rule accidentally.

| Area | Recommended access |
|---|---|
| `stores`, `store_hours`, `product_categories`, `products`, `buildings`, `delivery_slots`, active `pricing_rules` | Public or authenticated **read** (choose one consistently). Client create/update/delete locked. Return only non-sensitive fields. |
| `users` | Registration only through an approved controlled path / validated auth collection; an authenticated user can view and edit their own allowed profile fields. Protect ownership, role/privileged fields, and email/password update workflows. No public user directory. |
| `saved_locations` | Owner can list/view/create/update/delete; enforce `user = @request.auth.id` on read and owner match on create; block changing owner. |
| `orders`, `order_items` | Owner can list/view, including through `order.user`; client direct create/update/delete **locked**. Server checkout and action routes handle writes. |
| `wallets`, `wallet_transactions` | Owner can list/view only. **All writes locked**; never permit a client to submit its balance or transaction history. |
| `ratings` | Owner can read. Write through protected order action route (or equivalently strict creation validation); edit/delete locked by default. |

Treat each candidate rule as **design guidance**, not copy-paste syntax; test with anonymous, owner, and different-user tokens before committing migrations. PocketBase rules support `@request.auth.id` and request-body ownership constraints. See official [API rules documentation](https://pocketbase.io/docs/api-rules-and-filters/).

### Minimum trusted PocketBase endpoints / hooks

These can be implemented in `pb_hooks/` using PocketBase's built-in JavaScript `routerAdd(...)`, authentication middleware, server APIs and transactions. No Express dependency.

1. **`POST /api/uniexpress/checkout`** — require signed-in user; accept only store ID, item IDs/options/quantities or printing specifications, chosen building/room/slot/date and payment method. **Do not accept client totals or arbitrary user IDs.** Within a single transaction: load current products and policy; validate stock, one-store restriction, printing constraints, open store, preparation lead time, future slot and room, minimum $2, fee/free-delivery threshold; recalculate item/subtotal/total cents; if wallet, check current balance and deduct it; create order/items and immutable transaction together. Reject any failure without partial changes. For cash, create an order with payment method `cash` but no wallet deduction. Make duplicate-submission protection part of implementation (e.g. per-user unique checkout request ID).
2. **`POST /api/uniexpress/orders/{id}/cancel`** — verify order owner and current `received` status; update to `cancelled`; refund any previously debited wallet amount atomically and record refund transaction. No cancellation once preparing.
3. **`POST /api/uniexpress/orders/{id}/rate`** — require owner, `delivered` status and no existing rating; validate stars 1–5 and comment length; insert rating once.
4. **`POST /api/uniexpress/wallet/demo-topup`** — simulated academic top-up, authenticated and capped/validated; update wallet and append transaction atomically. **Never expose this as a real-money endpoint.** Consider seed-only top-ups if instructor doesn't require interactive top-up.
5. **Registration/profile validation hook** — server-side university email suffix, ID uniqueness/format and password/phone policies. Avoid trusting the login/signup screen alone.

**Simulated tracking:** The brief specifically asks for timer-driven status updates using `useEffect` with cleanup. For the first UI demo, use a **screen-local simulated timeline** that advances every few seconds, clearly distinguished from persisted `orders.status`. It must not send untrusted direct status writes or unlock rating/cancellation based only on UI time. If durable cross-screen/cross-device tracking is required, introduce a **small server-authorized demo status progression hook/route** and persist transitions on the server; only then show Delivered and enable rating. Document that change in `docs/DEVELOPMENT_PLAN.md`. No SSE/realtime dependency for MVP; refetch at navigation/focus or on explicit refresh.

**Implementation note:** PocketBase's JavaScript hooks run in its embedded scripting environment, **not Node.js**; only use APIs supported by the pinned PocketBase release. Confirm the exact syntax for transactional writes and routes against that release before coding. Reference: [custom routes](https://pocketbase.io/docs/js-routing/), [event hooks](https://pocketbase.io/docs/js-event-hooks/).

## 6. App state, pricing and rules

| Concern | Owner of state/rule | Rationale |
|---|---|---|
| Login form, quantity selector, filters, print form, loading/errors | Screen-local `useState` / `useEffect` | UI-only; no global state needed. |
| Active auth user/session | PocketBase auth store + `AuthContext` | A single auth source; context exposes user and sign-in/out actions. |
| Current cart | `CartContext` in-memory | Shared across store, printing, cart, checkout; one store at a time; cleared on successful checkout or logout. Cart is intentionally lost on app restart unless future persistence is explicitly approved. |
| Store/product/schedule/profile/order/wallet records | PocketBase via services | Backend is source of truth. Screens fetch, show loading/error, and refresh after changes. |
| Open/closed badge; unavailable slot UX | Shared pure utilities / `useStoreStatus` | Display guidance only; server rechecks authoritative time/availability. |
| Printing/checkout preview | `calculations.js` driven by `pricingService.js` | Live estimate only; checkout route recalculates from trusted policy and data. |
| All final order totals, payment, refund, order status, eligibility | PocketBase secured endpoint/transaction | Never derived exclusively from modifiable mobile data. |

**Business rules from the brief:** one-store cart; out-of-stock items cannot be added; printing pages/copies > 0 and max 200 pages; minimum subtotal $2; $0.50 delivery fee if subtotal < $10 and free at/above $10; closed stores reject orders; class-break slots must not be in the past or too near prep time; wallet balance must cover final total. The original examples use B&W **$0.05/page**, color **$0.25/page** and spiral binding **+$1.50**. Confirm any unspecified duplex, extra-option and staple charges before pricing implementation.

## 7. Example request flows

### Login / read catalog

1. Login form calls `authService.login(email, password)`; service uses the shared PocketBase SDK.
2. SDK stores current session in memory and `AuthContext` updates; `RootNavigator` switches from auth stack to app tabs.
3. `HomeScreen` calls `catalogService.getStores()` and `deliveryService.getNextAvailableSlot()`; `walletService.getBalance()` fetches owner-owned data.
4. Services return plain record objects/errors to screens; screens render `FlatList` and loading/empty/error states. Logout clears both auth state and in-memory cart.

### Add product / printing job / checkout

1. Store/printing screen validates input and calls `CartContext.addItem()`. If a new item belongs to a different store, request confirmation to **clear the previous cart before adding**.
2. Checkout screen loads buildings, slots, and price policy; shows a live **estimate**. The user chooses a building, nonempty room, acceptable class break and `wallet`/`cash`.
3. `orderService.checkout()` calls the authenticated custom PocketBase route through the centralized SDK; sends only item specifications/IDs, location, selected slot and payment method.
4. Server revalidates the request, calculates authoritative cents and writes order/items and (if needed) wallet entries transactionally; returns a confirmed order ID and final total.
5. On success clear Cart Context, navigate to `OrderTrackingScreen`, and refresh order/wallet services. On failure retain cart, display the server's error and allow retry.

### History and reorder

1. `orderService.getMyOrders()` queries only signed-in user's visible orders and item snapshots.
2. Reorder copies **item selections**, not historical prices or status, into Cart Context after checking current product availability and one-store policy.
3. Current fees/options and current products are validated again at checkout; old printing document names remain simulated.

## 8. Naming conventions and Codex guardrails

- **JavaScript only:** `.js`/`.jsx` if needed; do not add TypeScript, new libraries or architectural patterns without an explicit decision.
- **Files/components:** PascalCase React screens/components/navigation/providers (`HomeScreen.js`, `StoreCard.js`, `AuthContext.js`); camelCase functions, hooks, services and utilities (`useCart.js`, `orderService.js`, `formatCurrency`).
- **PocketBase:** lowercase `snake_case` collections and stored fields (`order_items`, `price_cents`); `pb_hooks/*.pb.js` for server scripting; migration files follow PocketBase's generated naming conventions.
- **Services:** service method names are verbs (`getStores`, `getOrder`, `checkout`, `cancelOrder`); provide a consistent interface and normalized errors. Use the SDK from **only** `src/services/`.
- **Navigation:** named routes and matching screen components; keep route names consistent and avoid direct navigation nesting assumptions inside reusable components.
- **Data:** pass IDs across navigation, fetch details through services; do not store secrets or rely on full stale objects in navigation params.
- **UI:** functional components, Hooks, `FlatList`; basic built-in React Native components. Keep screens focused, small and readable; extract shared components only when reused or substantively long.
- **Rules:** never duplicate authoritative monetary logic solely in React Native; never accept client-provided price/balance/status. Always validate both client-side for UX and server-side for integrity.
- **Error handling:** show user-friendly validation and network failures; handle offline PocketBase gracefully; disable duplicate checkout while in flight and use idempotent server handling.
- **Change discipline:** when adding a file, put it in the existing designated folder; don't create `api/`, `repositories/`, `models/`, `controllers/`, Redux stores or another state layer without a specific need.
- **Scope discipline:** do not generate an Express backend, add AsyncStorage, file-upload tooling, real GPS tracking, payments, realtime/SSE, or new native libraries without an approved scope change.
- **Testing:** manually verify each screen, one-store cart, printing calculation, wallet decline, time cutoff, closed stores, cancellation/refund, demo top-up, history/reorder, token authorization and Expo Go phone connectivity. Add targeted tests only when the app's complexity justifies them.

## 9. Decisions, conflicts and documentation updates

| Item | Decision / outstanding action | Document to update |
|---|---|---|
| Original assignment conflict and approval | The original brief, p. 2, specifies local JSON/mock API and **AsyncStorage** for cart/wallet/orders, with no real backend required. **The instructor has approved PocketBase** for UniExpress; proceed with PocketBase and the documented in-memory cart/no-AsyncStorage architecture. **Do not request PocketBase approval again.** Preserve minimum seed-data counts and simulated payment/tracking. If the existing approval does not explicitly address the separate AsyncStorage grading requirement, clarify only that specific discrepancy without blocking development. | Original brief/project requirement notes (record approval and any AsyncStorage clarification); `docs/TECH_STACK.md` already records approval |
| Backend/server hook necessity | A few PocketBase JS routes are needed for trustworthy wallet/order mutations; this is **not** a custom Express backend. A zero-hook prototype cannot claim secure wallet payments. | `docs/ARCHITECTURE.md`; plan implementing hooks in `docs/DEVELOPMENT_PLAN.md` |
| Tracking consistency | First milestone may use local timer UI to match brief, but delivery/rating based on server status requires server-authorized demo progression; decide milestone prior to integration. | `docs/DEVELOPMENT_PLAN.md` |
| Expo/phone/PocketBase versions | Not yet selected. Match the Expo Go test device; pin a tested PocketBase build before writing migrations/hooks. | `docs/TECH_STACK.md`, `docs/pocketbase-setup.md` |
| Auth persistence | Initial memory-only. Optional `expo-secure-store` stores **token only** if chosen; no app data in AsyncStorage. | `docs/TECH_STACK.md` |
| PocketBase hosting | Local Windows/LAN during development; hosted HTTPS only if needed. Never ship LAN IP or admin credentials as secrets. | `docs/TECH_STACK.md`, deployment notes when decided |
| Data/design details | University ID pattern, faculty list, store hours, actual slot timetable, account funding seed, order-option price table and school email-verification policy need agreement before implementation. | `docs/DEVELOPMENT_PLAN.md` / `docs/pocketbase-seed.md` |

**Document ownership:** `docs/TECH_STACK.md` defines approved tools and dependencies (including confirmed PocketBase instructor approval); **this file** defines layout, data ownership and trust boundaries; `docs/DEVELOPMENT_PLAN.md` should define delivery order, schema/migration/seed milestones, access-rule validation, checkout hooks and phone-demo acceptance checks. No application source files or other project documentation are changed by this architecture proposal.

## 10. Implementation order (brief guidance only)

1. Verify Expo Go/Expo SDK and PocketBase versions; initialize a **JavaScript + React Navigation** Expo app; establish repository rules.
2. Add PocketBase schema/migrations/access rules, seed four stores/25 products/six buildings/five slots; validate LAN access from phone.
3. Build auth/navigation, Home/catalog/store/product screens; add Context cart and printing form with estimates.
4. Implement the **trusted checkout/top-up/cancel/rate backend routes** and test owner isolation, price tampering, wallet insufficiency, retries and atomicity **before** calling wallet/checkout complete.
5. Build checkout, tracking simulation/persistence decision, orders/history/reorder, profile/locations/wallet; test Expo Go demonstration end-to-end.

### Reference documents

- Original *CampusGo – Antonine Campus Delivery Application*, pp. 1–3 (feature, navigation, validation, mock-data and demo requirements).
- Project `docs/TECH_STACK.md`, reviewed 2026-11-04 (confirmed PocketBase/Expo/JavaScript choices, constraints and open decisions).
- PocketBase official docs: https://pocketbase.io/docs/ ; https://pocketbase.io/docs/api-rules-and-filters/ ; https://pocketbase.io/docs/js-routing/ ; https://pocketbase.io/docs/js-event-hooks/
- React Navigation: https://reactnavigation.org/docs/getting-started/
