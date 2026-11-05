# UniExpress — Instructions for Codex

## Project and sources

UniExpress (formerly CampusGo) is a **React Native campus-delivery coursework app**. Before making changes or technical or architectural decisions, read **`docs/TECH_STACK.md`**, **`docs/ARCHITECTURE.md`**, **`docs/DEVELOPMENT_PLAN.md`**, and the original CampusGo project brief **`docs/Project_CampusGo_Campus_Delivery.pdf`**. The instructor has approved **PocketBase**. Follow the documented requirements, implementation phases, and repository layout; do not silently substitute a different design.

## Required stack and structure

- Write **JavaScript**, not TypeScript. Use **React Native + Expo**, functional components, and Hooks (`useState`, `useEffect`, etc.).
- Use **React Navigation** (bottom tabs and native stacks), **not Expo Router**.
- Use **`FlatList` for all displayed lists**, as required by the brief.
- Use **PocketBase and its official JavaScript SDK**; no Express, MongoDB, Firebase, Redux, Zustand, or AsyncStorage for application data. Keep the cart **in memory** using the planned `CartContext`.
- Follow `docs/ARCHITECTURE.md`: `src/screens/`, `components/`, `navigation/`, `services/`, `context/`, `hooks/`, `utils/`, `constants/`, and `assets/`; PocketBase migrations/hooks/seed files belong in `pocketbase/`. Create folders/files **only when needed**.
- Only **`src/services/`** may import or call the PocketBase SDK. Screens and components obtain data through services/hooks/context, not direct SDK calls.

## Code quality and behavior

- Prefer short, readable files, reusable UI components, clear names, and simple React patterns over abstractions or additional libraries.
- Keep UI state local when possible. Use `AuthContext` and `CartContext` for the documented shared state; do not introduce another state architecture without explaining why.
- Preserve the core brief: four campus services; product browsing; one-store cart; simulated print jobs/pricing; valid building, room, and class-break slot; wallet/cash checkout; tracking; history/reorder; profiles; saved locations; ratings.
- Include sensible loading, empty, error, and validation states. Clean up timers/subscriptions in `useEffect`.
- Use **integer cents** for stored money. Frontend totals are **estimates**; only trusted PocketBase server-side logic may finalize prices, accept orders, deduct/refund wallet balances, or change authoritative order status. Apply and test per-collection access rules; do not trust client-supplied totals, identity, or status.
- Treat payment, top-up, and tracking as **simulated academic features**; do not add real payments, real GPS, or actual document upload.

## How to work

1. Implement the **current phase only** from `docs/DEVELOPMENT_PLAN.md`; make the smallest useful change. Do not generate the entire application at once.
2. Before editing, identify affected files and dependencies. Do **not** modify unrelated files or reorganize the project casually.
3. Keep Expo Go runnable after each change. Run relevant available checks, report what actually ran, and state any unverified behavior.
4. Before adding a dependency, framework, route, hook, or significant design change, explain the need and **which document** (`docs/TECH_STACK.md`, `docs/ARCHITECTURE.md`, or `docs/DEVELOPMENT_PLAN.md`) should be updated. Make changes only when authorized.
5. At the end of each task, summarize files changed, what works, tests/commands executed, blockers, and the next phase/checkpoint.

## Security and repository hygiene

- **Never commit** passwords, API secrets, superuser tokens, auth tokens, real user records, `.env.local`, `pocketbase/pb_data/`, or the PocketBase executable.
- `EXPO_PUBLIC_*` values are visible in the mobile app; use them only for **nonsecret** configuration such as the PocketBase URL.
- Keep superuser credentials out of mobile code. Enforce owner-only reads, deny direct client wallet/order mutations, and use authenticated PocketBase hooks/routes for trusted operations.
- Do not state that documentation, tests, or files were updated unless you actually updated or ran them.
