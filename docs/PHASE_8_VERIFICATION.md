# Phase 8 — Home, campus stores and product browsing

Implemented 2026-11-17 for the current PocketBase dataset. **Final acceptance is pending Expo Go testing and resolution of populated product options if those are required. Phase 9 has not started.** No commit was created.

## Functionality

- Home displays UniExpress/Université Antonine, the signed-in user's first name, a wallet/next-break banner, store-name search, categories derived from backend store records, tappable store cards and the existing compact PocketBase connectivity check.
- Search trims outer whitespace, matches case-insensitively, combines with category selection and provides a labelled clear action and empty results state. All returns to the complete active catalog.
- Closed stores stay browsable, display Closed and explain that ordering is unavailable. Cards include optional logo/fallback, backend category/description and preparation minutes.
- Existing `Store` and `ProductDetails` stack routes receive only `storeId`/`productId`. They fetch current backend records. Authentication gating and the navigator hierarchy are unchanged.
- Store products are sorted/grouped by category with category headers as `FlatList` items. Out-of-stock products remain visible. Product details include image/fallback, description, store, base price, availability, quantity and an estimated item total. Cart controls are disabled; there are no fake cart updates.
- Initial loading, empty/error states and retry/refresh are implemented on each catalog screen. Missing or broken image URLs use a simple initial-letter fallback. Responses after screen blur/unmount are ignored.
- The existing blue theme and correctly encoded shared university name are reused. Login, Sign Up, department dropdown and field validation files were not changed.

## Files created

| Location | Files |
|---|---|
| Services | `src/services/catalogService.js`, `src/services/walletService.js` |
| Shared UI | `src/components/common/CatalogFeedback.js`, `CatalogImage.js`, `FilterChips.js` |
| Store/product UI | `src/components/stores/StoreCard.js`, `OpenClosedBadge.js`; `src/components/products/ProductCard.js`, `QuantitySelector.js` |
| Hook/utilities | `src/hooks/useStoreStatus.js`; `src/utils/campusTime.js`, `catalog.js`, `formatters.js` |
| Verification | `pocketbase/tests/verify-phase8.cjs`, this report |

## Files modified

- `src/screens/home/HomeScreen.js`
- `src/screens/store/StoreScreen.js`
- `src/screens/store/ProductDetailsScreen.js`
- `src/services/deliveryService.js` — added read-only delivery-slot retrieval; existing locations/building functions preserved.
- `docs/DEVELOPMENT_PLAN.md` — implementation, results, limitations and pending acceptance.

No dependency, schema, seed, auth, navigation or theme changes. `ARCHITECTURE.md` and `TECH_STACK.md` did not need updates because the implementation follows their existing layout, documented hook and approved stack.

## Actual schema and queries

Read the required three project documents, `AGENTS.md`, original five-page PDF, migrations, seed files and existing code before editing. Inspected the seven relevant local collections through a **read-only SQLite connection**, without reading user records or wallet identities. The actual fields/rules agree with the Phase 6 migrations.

| Collection | Read behavior |
|---|---|
| `stores` | `is_active = true`, sort `name,id`; reverse-expand `store_hours_via_store`. Detail fetches by ID and rejects inactive stores. |
| `store_hours` | Included with stores in one request, avoiding per-card queries. The standalone service filters by store ID and active parent; sorts `weekday,id`. |
| `product_categories` | Filter selected store and active parent; sort `sort_order,name,id`. There is **no category `is_active` field**. |
| `products` | Filter selected store, active product and active parent; expand `category`; sort `category.sort_order,name,id`. No stock filter. There is **no product `sort_order` field**. Detail expands `category,store,store.store_hours_via_store` and rejects inactive product/parent. |
| `wallets` | Signed-in user only, explicit owner filter and limited `id,user,balance_cents` fields; one result. Service accepts no arbitrary user ID, verifies returned owner/cents and rejects responses after session identity changes. |
| `delivery_slots` | Active only, sort `start_time,sort_order,id`. No fabricated slot times or dates. |
| `pricing_rules` | Inspected the existing active integer-cent policy. Not queried by Phase 8 because no printing, fee calculation or paid product options are implemented. |

Catalog/hours/category/product/slot list and view rules are public; their writes are locked. Wallet list/view rules require `user = @request.auth.id`; all client wallet writes stay locked. Pricing reads require active records and writes are locked. No rules were changed. The existing suite revalidated anonymous/owner/unrelated-user access and authoritative write denials.

Home performs one store request including daily hours, one wallet request and one slot request per focus/refresh; banner reads resolve independently. Store loads store/categories/products once per focus/refresh. Product details uses one expanded product request. Search, categories, quantity and clock changes make no network requests. There is no shared backend-data cache that could retain private balances across users.

## Campus opening hours

- `Intl.DateTimeFormat` explicitly uses `Asia/Beirut`; device timezone is irrelevant. Its timezone database supplies winter/summer offsets.
- `weekday` is Sunday=0 through Saturday=6. Parse validated `HH:mm` times into minutes; use the campus weekday's record and `opens <= current time < closes`.
- Inactive stores, explicit closed days, missing hours and invalid/non-increasing windows display Closed. Seeded hours are 08:00–17:00 Monday–Friday with closed weekends. No schedule is invented.
- `useStoreStatus` refreshes the clock on screen focus, app foreground and every 15 seconds while active; it clears the interval and AppState subscription on blur/unmount. All cards on a screen share one clock.
- Overnight/24-hour and holiday semantics are not defined in current data; non-increasing windows safely display unavailable. Final order eligibility still belongs to trusted Phase 10 logic.

## Products, quantities and options

- The database contains 25 products: 8 cafeteria, 8 coffee and 9 stationery, with Ruler out of stock. Printing Office has a category but no products, as documented for the later simulated printing form. The empty store is intentional.
- `logo` and `image` are optional **URL fields**, not PocketBase file fields; all seeded values are empty. No file SDK calls, uploads or invented image URLs were added.
- Quantity is a local integer bounded to **1–99**; the decrement/increment controls disable at the limits. Out-of-stock products and unknown option/price configurations disable quantity editing. Closed-store browsing still permits preview estimates; purchase actions remain disabled everywhere.
- Currency formatting and `price_cents * quantity` use integer cents; totals are labelled estimates. No fees, wallet deductions, order writes or final prices are calculated here.
- Every actual `options_json` is `[]`. `docs/pocketbase-setup.md` explicitly says there are no seeded paid extras/sizes and later option-price changes need agreement/versioning. The UI therefore shows a no-options state. Null/absent options are also safe. Nonempty options display an unavailable state and suppress estimates instead of guessing a shape or charge.
- **Remaining data-contract requirement:** There is no populated size/extra structure to implement or verify. Selection and option pricing are not claimed complete. Agree and version that structure/sample data before adding populated option support; no schema/seed correction was made silently.

## Home banner and preserved health check

- `getBalance()` returns the current owner's integer balance or `null` for an uninitialized wallet. The local database has no wallet records, so “Not initialized” is expected. A real zero displays `$0.00`. Home never initializes, edits or tops up a wallet.
- The next-break display chooses today's next active window whose start is strictly after campus time and whose end follows its start. It recomputes with the shared clock without polling the API. After the last start, it shows “No later slot today”.
- Slots are recurring `HH:mm` records with no date, operating-day or holiday fields. Home labels them informational candidates in Beirut time. It does not invent a tomorrow calendar or enforce preparation cutoffs; selected-date/calendar/preparation/store validation belongs to Phase 10.
- Missing data and read failures have separate banner states and retry. Wallet/slot failures do not hide stores.
- Home still calls the unchanged `checkPocketBaseHealth` service with abort cleanup, displays Connected/Checking/Unreachable, and provides Check connection. It does not import the SDK or expose admin information.

## Automated checks executed

| Check | Result |
|---|---|
| `node pocketbase/tests/verify-phase8.cjs` | Passed: real services against disposable PocketBase; four stores, 25 products, all six catalog methods, reverse/nested relation expansion, inactive filtering, stock visibility, fresh prices, empty/missing records, wallet missing/zero/funded/account-switch isolation, denied writes, active slots and health. Also deterministic winter/summer/open/close/weekend/day-rollover time checks; UTC/Los Angeles/Tokyo host zones; combined filtering, grouping, cents, quantities and option safeguards. Network failure/recovery and actual disposable server stop/restart recover across catalog/wallet/slots/health. 12 fixture/API status assertions plus service/logic assertions. |
| `node pocketbase/tests/verify-service-errors.cjs` | Passed: existing service errors and registration field-validation regressions. |
| `node pocketbase/tests/verify-phase6.cjs` | Passed: 234 API assertions plus auth registration/login/profile/location CRUD/logout/session reset, ownership, protected writes, migration preservation and service recovery. |
| `npx.cmd expo export --platform android --platform ios --output-dir .expo/phase8-export` | Passed: both native bundles compiled. Output stays under gitignored `.expo/`. |
| `npx.cmd expo install --check` | Passed online: dependencies up to date. Earlier restricted-network attempt failed; offline fallback passed with Expo's reliability warning, then the online check succeeded. |
| Cached Expo Doctor CLI (`node …/expo-doctor/bin/expo-doctor.js`) | Passed online: **20/20**. The initial restricted `npx.cmd --no-install expo-doctor` attempt failed reaching npm; the already cached CLI succeeded with network access. |
| Babel parser over every `src/**/*.js` | Passed. |
| `git diff --check`; source SDK-boundary review | Passed. SDK collection/auth calls remain in services; only the existing singleton is instantiated. |

PowerShell blocks `npx.ps1` under its execution policy, so checks used `npx.cmd`; no execution policy was changed. Node emits its existing module-type warning when importing application ES modules from CommonJS tests. No package/module configuration was changed to suppress it.

The new integration test uses only Node built-ins, the installed SDK through services and the existing PocketBase executable. Credentials are generated per run and never printed. The disposable database is removed after stopping its server. The developer's PocketBase data was not modified.

## Expo Go manual acceptance — not performed

1. Start the existing LAN PocketBase and `npx.cmd expo start`; sign in on the physical phone. Confirm all four backend store names, categories/descriptions/prep times, vibrant theme, readable accents, safe areas and small-screen/card/banner layouts.
2. Type mixed-case names with outer spaces; combine search with each category and All; clear search; check empty matches and keyboard focus during typing. Verify comfortable touch targets and horizontal chip scrolling.
3. Browse each store and product; check ID correctness, back behavior, tabs, product grouping, image/fallback, descriptions/currency and Ruler's unavailable state. Printing Office should show the intentional empty state.
4. Check quantities at 1 and 99 and changing estimates. No add action may change the cart. Confirm the no-options state; populated options cannot be accepted until their contract is defined.
5. Confirm Open/Closed in Beirut time while the phone uses another timezone. Background/resume around opening/closing and slot boundaries; check visible status updates and that leaving screens stops their clocks.
6. Confirm missing wallet data displays “Not initialized”; in a separate synthetic backend fixture, check zero and funded balances plus account switching. Home must offer no edit/top-up. Check today's slot and no-later-slot state.
7. Stop/restart the phone's PocketBase connection, exercise store/product/banner retries and Check connection; verify helpful errors and successful recovery. Refresh after an admin edits synthetic catalog data.
8. Recheck login, registration, logout, protected navigation, profile editing, saved-location CRUD, field-specific validation and the department dropdown. Automated service regressions passed; the physical UI has not been exercised.

Next checkpoint: complete this Phase 8 device walkthrough and agree populated option data if needed. Do not begin Phase 9 automatically.
