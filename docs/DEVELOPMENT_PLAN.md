# UniExpress — Development Plan

**Status:** Ready for implementation  
**Prepared:** 2026-11-04  
**Project:** UniExpress (formerly CampusGo)  
**Primary goal:** A working React Native campus-delivery application demonstrated on a real phone.

## 1. Decisions and scope

This plan follows the original *CampusGo – Antonine Campus Delivery Application* brief (`docs/Project_CampusGo_Campus_Delivery.pdf`), `docs/TECH_STACK.md`, and `docs/ARCHITECTURE.md`.

- **Instructor approval for PocketBase has been obtained.** PocketBase is the chosen backend for authentication, persistent data, and API operations; no additional PocketBase approval checkpoint is needed.
- Use **React Native + Expo, JavaScript, React Navigation (bottom tabs and native stacks), PocketBase, the official PocketBase JavaScript SDK, VS Code, Codex, Git, and GitHub**.
- The app is the priority. **No Express backend, MongoDB, TypeScript, Expo Router, Redux, AsyncStorage for app data, real payments, GPS, document upload, or separate courier app.** The cart lives in React Context memory; persisted orders and wallet data live in PocketBase.
- Use functional components and Hooks; use **`FlatList` for displayed lists**, as required by the academic brief.
- Retain the minimum sample-data targets: **4 stores, 25 products, 6 buildings, and 5 delivery slots**. Wallet payments/top-ups and tracking are **simulated coursework features**, not production financial services.
- The original brief requests AsyncStorage, while the approved project architecture specifies an in-memory cart and PocketBase persistence. The PocketBase choice is approved; record whether the instructor's approval explicitly covers replacing AsyncStorage in the existing project requirement notes if this has not been documented already. **Do not delay implementation solely to reapprove PocketBase.**
- Implement **one phase at a time**. A phase is complete only when its checklist passes, the app still starts, and the change is committed.

**Definitions:** `src/` is the mobile source tree; `pocketbase/` contains versioned migrations/hooks/seed data, **not committed database files or binaries**. Folder names and service boundaries must match `docs/ARCHITECTURE.md`. Create files only as their phase needs them.

## 2. Phase-by-phase roadmap

### Phase 1 — Verify the development environment

**Objective:** Prove that the team's Windows computer and test phone can run the selected tools.

**Main tasks**
1. Install/verify Node.js LTS, npm, Git, VS Code, the Codex extension, and Expo Go on the phone.
2. Check the **Expo SDK supported by the installed Expo Go app**; select a compatible JavaScript `blank` template rather than assuming the latest SDK works. Record the tested SDK and device.
3. Download a Windows-compatible PocketBase release from the official site. Record the selected version; inspect the binary's available commands.
4. Confirm the PC and phone can use the same trusted Wi-Fi network (physical Android is the simplest Windows test option).

**Expected result:** A documented, compatible toolchain; no app code required yet.

**Verification checklist**
- [ ] `node --version`, `npm --version`, `npx --version`, `git --version`, and `code --version` work.
- [ ] VS Code opens and Codex is signed in/available.
- [ ] Expo Go is installed; its compatibility with the chosen SDK is checked.
- [ ] `pocketbase.exe --version` and `pocketbase.exe serve --help` work.

**Proceed when:** Versions and phone compatibility are known, not guessed.

### Phase 2 — Create the GitHub repository and project baseline

**Objective:** Establish one shared repository and the instructions Codex will follow.

**Main tasks**
1. Create an **empty** GitHub repository named `uniexpress` (no generated README or template files to conflict with Expo initialization).
2. Clone it locally or create a local Git repository; open the **repository root** in VS Code.
3. Keep `AGENTS.md` at the **repository root**. Put `docs/TECH_STACK.md`, `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT_PLAN.md`, and `docs/Project_CampusGo_Campus_Delivery.pdf` under `docs/` so Codex can consult them.
4. Add or review `.gitignore`: exclude `node_modules/`, `.expo/`, `.env`, `.env.*` (but not `.env.example`), `pocketbase/pb_data/`, the PocketBase executable, local logs, and private test data. Do not commit tokens or credentials.
5. Commit the documentation and repository baseline; use small, meaningful commits thereafter.

**Expected result:** A clean GitHub repository with authoritative project instructions.

**Verification checklist**
- [ ] `git status` shows the expected files and no sensitive/generated files.
- [ ] Root `AGENTS.md` and all four project documents under `docs/` exist and are available to the team.
- [ ] `AGENTS.md` names JavaScript, Expo, React Navigation, and PocketBase.
- [ ] Initial commit can be pushed and cloned by a teammate.

**Proceed when:** Git is working and Codex can read the project references.

> **Expo initializer note:** `create-expo-app` may refuse to write over existing files. The simplest reliable sequence is: create/clone an **empty repository**, initialize Expo there in Phase 3, **then copy root `AGENTS.md` and the four project documents into `docs/`** and make the first commit. This does not change the Phase 2 acceptance criteria.

### Phase 3 — Initialize the JavaScript Expo application

**Objective:** Run the smallest possible React Native app before writing features.

**Main tasks**
1. From the empty `uniexpress/` repository root, initialize Expo using the compatible **JavaScript `blank`** template (see commands in §3). Use `--no-agents-md` if supported so Expo does not generate a competing `AGENTS.md`.
2. Confirm `App.js`, `app.json`, `package.json`, and the lockfile are present. Set the display name to **UniExpress**.
3. Start Metro with `npx expo start`; open the app in Expo Go on the phone.
4. Run `npx expo install --check` and `npx expo-doctor@latest`; address relevant compatibility problems before adding features.
5. Preserve a minimal working app; no backend or full screen generation yet.

**Expected result:** UniExpress launches from VS Code on a real phone.

**Verification checklist**
- [ ] `npx expo start` starts without a blocking error.
- [ ] Expo Go loads a simple UniExpress screen on the test phone.
- [ ] Editing `App.js` refreshes the phone.
- [ ] No TypeScript or Expo Router has been introduced.
- [ ] Required docs and ignore rules are in place before the first source-code commit.

**Proceed when:** The blank app works reliably on the demonstration phone.

### Phase 4 — Add navigation and the basic UI structure

**Objective:** Make the required screen flow navigable before connecting data.

**Main tasks**
1. Install React Navigation core, native stack, bottom tabs, and Expo-compatible native prerequisites.
2. Add `src/navigation/` and small placeholder screens under `src/screens/` **as needed**, following `docs/ARCHITECTURE.md`.
3. Configure `App.js`, `RootNavigator.js`, `AuthNavigator.js`, `MainTabNavigator.js`, and `MainStackNavigator.js` without introducing Expo Router.
4. Make navigation between Welcome/Login/Sign Up and main Home/Cart/Orders/Profile tabs work with provisional UI; add detail navigation paths for Store, Product, Printing, Checkout, Tracking, and Wallet.
5. Introduce only minimal reusable common UI components and safe-area handling.

**Expected result:** A stable navigation skeleton, with obvious placeholders for features not built yet.

**Implementation checkpoint (2026-11-05):** Phase 4 skeleton implemented; Android/iOS bundle compilation, Expo dependency checks and router transition checks passed. Physical Expo Go testing remains pending, so Phase 4 is not marked complete. `RootNavigator` uses a local, memory-only development preview flag guarded by `__DEV__`; Phase 7 must replace it with `AuthContext`. See [the verification record](PHASE_4_VERIFICATION.md) for the hierarchy, changed files, commands and device walkthrough. Do not proceed to Phase 5 automatically.

**Verification checklist**
- [ ] All primary tabs and representative stack routes open and return correctly.
- [ ] No duplicated/conflicting navigation headers or broken back behavior.
- [ ] Every screen has a functional component; no TypeScript files.
- [ ] App still starts in Expo Go.

**Proceed when:** Navigation works with placeholder content and no backend dependencies.

### Phase 5 — Install PocketBase and connect the phone

**Objective:** Make one shared PocketBase instance reachable by the development machine and Expo Go.

**Main tasks**
1. Place the downloaded Windows binary locally under `pocketbase/` (or a documented separate local location); **ignore the binary and `pb_data/` in Git**.
2. Start PocketBase, create the initial **superuser through the local setup flow**, and confirm the dashboard and `/api/health` endpoint.
3. For phone testing, check PocketBase's version-specific `serve --help`, bind to the development PC's LAN interface (for example `--http=0.0.0.0:8090`), and allow trusted private-network firewall access.
4. Add `.env.example` with `EXPO_PUBLIC_POCKETBASE_URL=`; set the actual PC LAN URL in gitignored `.env.local`. Do not put secrets in any `EXPO_PUBLIC_` variable.
5. Add the **one SDK client** in `src/services/pocketbase.js` and a tiny service-level health/read check. Screens must not import `pocketbase` directly.

**Expected result:** Both PC and phone can reach the local PocketBase API, without an Express server.

**Verification checklist**
- [ ] PocketBase dashboard opens on the PC.
- [ ] `http://127.0.0.1:8090/api/health` responds on the PC.
- [ ] `http://<PC_LAN_IP>:8090/api/health` responds in the phone's browser.
- [ ] The Expo client uses the LAN URL, **not `localhost`**.
- [ ] No superuser secret, binary, or `pb_data` is staged in Git.

**Proceed when:** Phone-to-PocketBase connectivity is confirmed on trusted Wi-Fi.

### Phase 6 — Define collections, rules, and reproducible sample data

**Objective:** Establish reliable data before building data-driven screens.

**Main tasks**
1. Follow `docs/ARCHITECTURE.md` to add only the required PocketBase collections: `users` (auth), `stores`, `store_hours`, `product_categories`, `products`, `buildings`, `delivery_slots`, `saved_locations`, `pricing_rules`, `orders`, `order_items`, `wallets`, `wallet_transactions`, `ratings`.
2. Define important fields, relation targets, required values, uniqueness, indexes, and admin/user access rules. Use **integer cents** for money.
3. Commit generated/checked `pocketbase/pb_migrations/`; create repeatable **synthetic** seed files under `pocketbase/seed/` with at least 4 stores, 25 products, 6 buildings, and 5 delivery slots.
4. Seed the four named services: **Cafeteria, Coffee Corner, Bookstore & Stationery, Printing Office**. Include prices, stock flags, preparation times, opening hours, building codes, and class-break windows.
5. Define demo pricing policy: minimum subtotal **$2.00**; delivery **$0.50** if subtotal is below **$10.00**, otherwise free; B&W **$0.05/page**, color **$0.25/page**, spiral binding **+$1.50**. Explicitly decide and record any unspecified extras/duplex/staple charges before coding them.
6. Test read/write rules with anonymous, owner, and unrelated-user requests. Restrict direct client mutations of wallet balances, orders, order status, and transaction records.

**Expected result:** A seeded schema and safe collection APIs with no real student data.

**Verification checklist**
- [ ] Minimum counts: 4 stores, 25 products, 6 buildings, 5 slots.
- [ ] Collections, relations, pricing rules, and migrations are reproducible.
- [ ] Public or approved catalog reads work; protected data is not globally visible.
- [ ] Client writes to authoritative money/order fields are denied.
- [ ] No `pb_data/` or actual accounts/passwords are committed.

**Proceed when:** Data and access-rule checks pass before authentication-dependent features.

### Phase 7 — Implement authentication, profiles, and saved locations

**Objective:** Allow a university user to register, sign in/out, and manage their own details.

**Main tasks**
1. Implement `authService.js`, `AuthContext.js`, and the Welcome/Login/Sign Up screens.
2. Validate `@ua.edu.lb` email, university ID format, password length, required name/faculty/phone fields, and readable error messages. Enforce identity-critical checks **in PocketBase hooks/rules**, not just in forms. Finalize the university ID format and demo email-verification policy.
3. Implement owner-only profile read/edit and `saved_locations` list/create/edit/delete through service modules.
4. Keep auth state in memory initially. Add `expo-secure-store` **only if persistent authentication is explicitly selected**, and only for the PocketBase auth token—not app data.
5. Clear auth state **and the in-memory cart** on logout.

**Expected result:** Demo users can register/login and see only their own profile/locations.

**Verification checklist**
- [ ] Valid university demo account signs up and signs in.
- [ ] Invalid domain, missing fields, malformed ID, and short password are rejected.
- [ ] Incorrect password shows a recoverable error; logout returns to auth screens.
- [ ] User A cannot read or edit User B's profile or saved locations.
- [ ] No credential or auth token is logged or committed.

**Proceed when:** Authentication and user isolation work before any private data is displayed.

### Phase 8 — Build Home, stores, and product browsing

**Objective:** Deliver the core browsing experience from live PocketBase collections.

**Main tasks**
1. Implement `catalogService.js`, `HomeScreen.js`, `StoreScreen.js`, and `ProductDetailsScreen.js` using the planned reusable components.
2. Show store name/logo/category/preparation time and **open/closed status** computed from stored hours and current campus-local time. Closed stores must be visibly unavailable for ordering.
3. Add store search and category filter; show product categories, images, prices, sizes/extras, quantity, and out-of-stock indicators.
4. Use **`FlatList`** for store/product lists; include loading, empty, error, and retry states.
5. Show a home banner with wallet balance and next candidate delivery slot when these services are available; treat these as display values, not final checkout validation.

**Expected result:** Users can browse all campus services and product details from PocketBase.

**Verification checklist**
- [ ] All four stores and seeded products are visible; filtering/search work.
- [ ] Closed stores and out-of-stock products are clearly identified.
- [ ] Product options and quantity controls behave correctly.
- [ ] Changing PocketBase sample data changes the app after refresh.
- [ ] Lists use `FlatList`; network failure displays an error instead of crashing.

**Proceed when:** Catalog browsing is stable without local hard-coded replacement datasets.

### Phase 9 — Implement the cart and simulated printing service

**Objective:** Complete pre-checkout selection and pricing previews.

**Main tasks**
1. Implement `CartContext.js`, `useCart.js`, `CartScreen.js`, reusable cart row/total components, and cart badge.
2. Keep cart **in memory**. Enforce the **one-store-only** rule: ask for confirmation before replacing existing store items; block out-of-stock products.
3. Implement `PrintingScreen.js`: simulated **document name** (no upload), page count, copies, B&W/color, single/double-sided, and none/staple/spiral binding.
4. Validate pages and copies above zero and **maximum 200 pages per order**; calculate and update a **display-only** print estimate from the current price policy. A print job belongs to the Printing Office cart.
5. Implement quantity changes, removal, subtotal estimate, and correct clearing behavior after logout/confirmed order.

**Expected result:** Product and print-job carts work consistently without persistent local storage.

**Verification checklist**
- [ ] Adding an item from a second store requires explicit cart replacement.
- [ ] Quantity/edit/remove/cart badge/totals respond correctly.
- [ ] Printing options immediately change the preview price.
- [ ] Zero/negative pages or copies and orders over 200 pages are rejected.
- [ ] Cart is intentionally lost after full app restart; this is consistent with the chosen architecture.

**Proceed when:** All cart/printing UI rules work before final order submission is added.

### Phase 10 — Implement checkout, delivery slots, wallet, and trusted order writes

**Objective:** Place valid demo orders without allowing the mobile client to forge totals or wallet changes.

**Main tasks**
1. Build `CheckoutScreen.js`, `deliveryService.js`, `pricingService.js`, `orderService.js`, `walletService.js`, and `WalletScreen.js`.
2. Let users choose a seeded building, required room number, a valid **future class-break slot**, and **wallet** or **simulated cash**. Disable slots already passed or too close to the store's preparation time.
3. Show a checkout estimate but send only cart item IDs/options or print specifications, location, slot/date, payment method, and a unique request identifier to PocketBase—**never trust client-supplied prices or user IDs**.
4. Implement a small authenticated `pocketbase/pb_hooks/checkout.pb.js` route to recalculate prices and validate stock, one-store rule, printing limits, store opening hours, preparation lead time, slot, minimum subtotal, fee, and wallet sufficiency. Create the order/items and wallet deduction/transaction **atomically**, with duplicate-submission protection.
5. Implement a tightly scoped **demo top-up** route and an authorized order cancellation/refund route (cancel only in `received` status). Only server code writes wallet balances, transactions, order totals, and status. Use PocketBase server APIs supported by the **pinned version**.
6. On success clear the cart, show confirmation, refresh wallet/order data; on failure retain the cart and show an actionable message.

**Expected result:** Real PocketBase order records with **simulated** wallet or cash payment and server-enforced rules.

**Verification checklist**
- [ ] Subtotal under $2 is refused; under $10 incurs $0.50 delivery, $10+ is free.
- [ ] Closed store, past/too-close slot, missing room, and unavailable items are refused **server-side**.
- [ ] Insufficient-wallet payment is refused; no partial order or deduction is created.
- [ ] Valid wallet checkout deducts once and writes an immutable transaction.
- [ ] Double tap/retry does not create a duplicate charge/order.
- [ ] Another user's token cannot change this user's wallet/order; direct client writes stay denied.
- [ ] Cancel works only when received and refunds wallet payment once.

**Proceed when:** A complete end-to-end order is correct **and** resists basic tampering/retry checks.

### Phase 11 — Add tracking, ratings, order history, and reorder

**Objective:** Complete the post-checkout experience required by the brief.

**Main tasks**
1. Implement `OrderTrackingScreen.js` with the timeline **Received → Preparing → On the way → Delivered**, courier name, destination, and estimated time.
2. Demonstrate timer-driven visual progress with `useEffect` **and cleanup**; distinguish local visual simulation from persisted server status. If the order must persist as `delivered` for ratings/history, add a minimal **server-authorized demo status progression** mechanism; the UI timer itself must not grant privileges.
3. Implement an owner-checked rating route for **1–5 stars plus comment**, enabled only for orders whose **server status is delivered**.
4. Implement `OrderHistoryScreen.js`: `FlatList` of orders with date/store/total/status, filters, order details, and reorder.
5. Reorder copies item specifications into the current one-store cart only after checking current availability/options; **recalculate current prices**, never reuse historical totals.
6. Ensure cancellation and delivered status stay consistent across refresh, history, tracking, and wallet transactions.

**Expected result:** A complete simulated order lifecycle and accurate order history.

**Verification checklist**
- [ ] Timeline advances in the demo and stops its timer on screen cleanup.
- [ ] Server-owned status is not editable directly from the client.
- [ ] Cancellation is absent after the Received state; ratings require persisted delivery.
- [ ] A delivered order can be rated once, with a 1–5 value and optional comment.
- [ ] History filters work, and User A cannot view User B's orders.
- [ ] Reorder honors current stock, store restriction, options, and prices.

**Proceed when:** Checkout → tracking → delivery → rating → history → reorder works on the phone.

### Phase 12 — Test, refine the UI, and prepare the final demonstration

**Objective:** Produce a stable, understandable coursework submission.

**Main tasks**
1. Test every flow on a **physical phone using Expo Go**; include real Wi-Fi/API errors, authentication failure, logout, empty cart, missing images, closed stores, invalid slot, wallet insufficiency, retry/double-tap, cancellation/refund, and reorder.
2. Add consistent loading/error/empty states, sensible text sizes, touch targets, and readable validation. Avoid a redesign or dependency expansion near the deadline.
3. Review `FlatList` usage, navigation/back behavior, `useEffect` timer cleanup, no secrets in Git, protected collection rules, and reproducible migrations/seed data.
4. Re-run Expo compatibility diagnostics. Restart PocketBase and Expo from a clean terminal and test using a second demo user where possible.
5. Prepare a short **user guide in `docs/README.md`** (setup, demo credentials stored safely outside Git, basic usage, launch commands) and a reproducible live-demo script. Include the required presentation and code submission.

**Expected result:** Runnable repository, demonstration-ready phone app, sample data, README guide, and presentation.

**Verification checklist**
- [ ] All seven screen groups from the brief are covered.
- [ ] Minimum seed data counts and all key business rules pass on the device.
- [ ] `npx expo start`, PocketBase startup, and clean login can be repeated reliably.
- [ ] No `.env.local`, passwords, tokens, `pb_data`, or PocketBase binaries in Git.
- [ ] GitHub repository, short user guide, and live demo are ready.

**Project complete when:** The entire demo works from a fresh app launch with the documented setup.

## 3. Exact first steps in VS Code (Windows / PowerShell)

**Recommended order:** Initialize Expo in an **empty** GitHub repository first, then copy the documentation. This avoids the initializer conflicting with preexisting root files or generating its own `AGENTS.md`.

### A. Verify tools

```powershell
node --version
npm --version
npx --version
git --version
code --version
```

On the chosen PocketBase executable, verify `--version` and `serve --help`. Check the installed Expo Go app's SDK compatibility **before choosing an Expo SDK**; Expo SDK release transitions can affect physical-device support.

### B. Open an empty GitHub repository and initialize Expo

Create an **empty** GitHub repository called `uniexpress`, then clone it into your preferred workspace:

```powershell
git clone https://github.com/<YOUR_GITHUB_USERNAME>/uniexpress.git
cd uniexpress
code .
```

Within that empty repository, run the Expo JavaScript blank template (after checking its current SDK compatibility with Expo Go):

```powershell
npx create-expo-app@latest . --template blank --no-agents-md
```

`blank` is intentional: the Expo default includes **Expo Router and TypeScript**, which are not in this architecture. If the current installer or SDK/Expo Go pairing differs, stop and select the compatible **blank JavaScript template**, not the default. `--no-agents-md` prevents a generated instructions file; if the CLI does not accept it, review its help and ensure the custom root `AGENTS.md` is not overwritten.

Now copy `AGENTS.md` to the repo root. Put the project references at `docs/TECH_STACK.md`, `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT_PLAN.md`, and `docs/Project_CampusGo_Campus_Delivery.pdf`. Merge the Expo `.gitignore` with the extra PocketBase and environment ignore rules from Phase 2. Ask Codex to **read the documents before editing**.

### C. First Expo run, before adding features

```powershell
npx expo install --check
npx expo-doctor@latest
npx expo start
```

On a phone connected to the same Wi-Fi as the PC, scan the Expo QR code with Expo Go. If Metro LAN discovery fails, `npx expo start --tunnel` may help **Expo only**; it does not expose PocketBase. Confirm the starter screen loads.

### D. Install only the planned frontend packages

Do this **after the blank app runs**:

```powershell
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs pocketbase
npx expo install react-native-screens react-native-safe-area-context
```

Do not install AsyncStorage, Expo Router, a UI framework, or an extra state library. The first Codex feature task should be **Phase 4's navigation skeleton**, not the whole app.

### E. Prepare PocketBase for the first connection test

1. Download the chosen PocketBase Windows binary, pin its version, and place it locally in the designated `pocketbase/` location; do not commit it or its data.
2. In a **separate PowerShell terminal**, from the executable's directory:

   ```powershell
   .\pocketbase.exe --version
   .\pocketbase.exe serve --help
   .\pocketbase.exe serve --http=0.0.0.0:8090
   ```

   Use the LAN binding option only if confirmed by the chosen release; keep it on a trusted network.
3. Set up the first PocketBase superuser from the **PC** only at `http://127.0.0.1:8090/_/`.
4. Verify the health endpoint from the PC and phone:

   ```powershell
   Invoke-WebRequest http://127.0.0.1:8090/api/health
   ipconfig  # Find the PC's IPv4 address on the same Wi-Fi as the phone.
   ```

5. Create `.env.example` containing `EXPO_PUBLIC_POCKETBASE_URL=`. In **gitignored** `.env.local`, set:

   ```dotenv
   EXPO_PUBLIC_POCKETBASE_URL=http://<PC_LAN_IP>:8090
   ```

6. The frontend connection test comes next in **Phase 5** through `src/services/pocketbase.js`. The app must **not** use `localhost` to reach the PC from a phone.

### F. Commit the known-good baseline

```powershell
git status
git add .
git commit -m "chore: initialize UniExpress Expo project and docs"
git push -u origin main
```

If the clone uses another current branch name, rename it to `main` before pushing (`git branch -M main`). **Review `git status` and the staged files before each commit**, especially after starting PocketBase.

## 4. First Codex prompt

Copy this into the Codex panel **after** the empty Expo app runs and `AGENTS.md` is present:

> Read `AGENTS.md`, `docs/TECH_STACK.md`, `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT_PLAN.md`, and `docs/Project_CampusGo_Campus_Delivery.pdf` first. We are implementing **Phase 4 only**. Set up React Navigation with the planned auth stack, main tab navigator, and main stack navigator using JavaScript and simple placeholder screens. Follow the documented `src/` structure. Do not add PocketBase collections, checkout, or other features yet. Keep Expo Go running. After editing, list changed files, commands/tests run, remaining issues, and the next checkpoint.

## 5. Documentation ownership and decision checkpoints

- **`docs/TECH_STACK.md`:** Selected Expo SDK, phone test device, pinned PocketBase release, and any approved dependency changes. **Also update its outdated pending-instructor-approval note** to record that PocketBase approval has been obtained.
- **`docs/ARCHITECTURE.md`:** Only update if folder structure, ownership of state, API trust boundaries, or server-hook design actually changes. Update its approval-status note to match the confirmed instructor decision.
- **`docs/DEVELOPMENT_PLAN.md`:** Record completed phases, test evidence, final demo rules, and changes in implementation order. If delivery-status persistence or auth-token persistence is chosen, record the decision here.
- **Original brief / requirement notes:** Preserve the instructor's PocketBase approval record and clarify the AsyncStorage deviation only if that detail was not part of the approval.

No documents are considered updated merely because this plan recommends a future edit.

## 6. Official setup references (checked 2026-11-04)

- Expo app templates / CLI: https://docs.expo.dev/more/create-expo/
- Expo SDK + Expo Go: https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/
- Expo first run: https://docs.expo.dev/get-started/start-developing/
- React Navigation setup: https://reactnavigation.org/docs/getting-started/
- PocketBase setup: https://pocketbase.io/docs/
- PocketBase migrations: https://pocketbase.io/docs/js-migrations/
- PocketBase rules: https://pocketbase.io/docs/api-rules-and-filters/
- PocketBase routes: https://pocketbase.io/docs/js-routing/
