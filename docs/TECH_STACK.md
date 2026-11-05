# UniExpress — Technology Stack & Development Setup

**Status:** Approved technology reference · **Reviewed:** 2026-11-04  
**Source:** *CampusGo – Antonine Campus Delivery Application* project brief (`docs/Project_CampusGo_Campus_Delivery.pdf`; former project name), pp. 1–3, 5.  
**Scope:** Student-focused React Native mobile app for Université Antonine. This file specifies tools; it does **not** initialize a project.

## 1. Confirmed technology decisions

| Area | Choice | Role |
|---|---|---|
| Mobile UI | **React Native + Expo**, **JavaScript** | Android/iOS application; functional components, Hooks and `FlatList` |
| Navigation | **React Navigation** | Bottom tabs and native-stack screens, as required by the brief |
| Backend | **PocketBase** | SQLite-backed collections, email/password authentication, REST API, admin dashboard |
| Client integration | **PocketBase JavaScript SDK** (`pocketbase`) | Call PocketBase directly from the mobile app; no Express proxy required |
| Development | **Windows + VS Code + Codex extension** | Editing and assisted development |
| Version control | **Git + GitHub** | Collaboration and repository history |
| Device testing | **Expo Go on a real phone** | Rapid development and required live demonstration |

**Approval:** The instructor has confirmed and approved **PocketBase** for UniExpress. No additional approval checkpoint is needed before development. The original brief remains the functional requirements reference.

**Not in the initial stack:** MongoDB Atlas, Mongoose, Express/Node backend, AsyncStorage for application data, Expo Router, Redux, Zustand, Firebase, Docker, Android Studio, or a payment gateway. Node.js **is** required on the development computer for Expo/npm, but not as a custom application server.

## 2. Required software (Windows)

1. **Node.js LTS** (includes npm; install from https://nodejs.org/). Use the LTS version supported by the selected Expo SDK.
2. **Visual Studio Code** (https://code.visualstudio.com/) and the **Codex VS Code extension** (sign-in/authorization as applicable).
3. **Git for Windows** (https://git-scm.com/downloads/win) and a **GitHub account**. GitHub Desktop is optional, not required.
4. **PocketBase Windows executable** matching the machine architecture (https://pocketbase.io/docs/). Extract it into a separate local backend directory; it includes SQLite, an HTTP API and a dashboard. Do **not** install a separate SQLite server.
5. **Expo Go** installed on the phone (https://expo.dev/go). A physical **Android phone is the simplest Windows test path**; iPhone is possible subject to the current Expo Go/SDK and account restrictions.
6. **PowerShell** (built into Windows) and reliable Wi-Fi. No global `expo-cli` installation is needed; use `npx`.

**Expo compatibility:** Pick an Expo SDK supported by the **actual Expo Go installed on the test phone**. Expo's SDK and store-app compatibility changes; verify before app creation. Do not automatically use the newest Expo template. Expo Go cannot load arbitrary custom native modules; use a development build only if a genuinely required feature demands it.

## 3. Frontend dependencies

Install **later, inside the Expo project**, not during documentation/setup review:

| Package | Required? | Purpose |
|---|---|---|
| `expo`, `react`, `react-native` | Yes — supplied by Expo template | App runtime, components and Hooks; use Expo-compatible versions |
| `@react-navigation/native` | Yes | Navigation container and core navigation API |
| `@react-navigation/native-stack` | Yes | Native-feeling stack navigation |
| `@react-navigation/bottom-tabs` | Yes | Required bottom-tab navigation |
| `react-native-screens` | Yes | React Navigation screen integration |
| `react-native-safe-area-context` | Yes | Safe positioning around notches/system bars |
| `pocketbase` | Yes | Official SDK for authentication and collections |
| `expo-secure-store` | **Conditional / recommended** | Securely persist a *small PocketBase auth token* between launches; not for cart, orders or other application data |
| `react-native-sse` | **Only if realtime subscriptions are implemented** | React Native `EventSource` implementation for PocketBase realtime; polling or ordinary fetches do not require it |

Use built-in `fetch`/SDK, `useState`, `useEffect`, `FlatList`, React Context only if shared state warrants it, and built-in form components initially. **Do not add** Axios, UI kits, form libraries or state-management libraries without an identified need. Stock/store images can use React Native `Image` and network URLs.

**Planned installation commands (after creating the app):**

```powershell
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs pocketbase
npx expo install react-native-screens react-native-safe-area-context
# Only if persistent sign-in is selected:
npx expo install expo-secure-store
# Only if PocketBase realtime subscriptions are needed:
npm install react-native-sse
```

Prefer `npx expo install` for Expo/native packages so versions match the chosen SDK. Avoid hand-pinning versions in this document before the SDK is selected.

**Phase 4 installed versions (2026-11-05):** React Navigation native 7.5.1, native-stack 7.21.0, bottom-tabs 7.21.0; react-native-screens 4.30.1 and react-native-safe-area-context 5.11.1. These packages were already installed when Phase 4 implementation began; no dependency files were changed during this task. Expo dependency validation and Expo Doctor (20/20) passed. PocketBase integration remains deferred. See `docs/PHASE_4_VERIFICATION.md` for navigation checks and pending device tests.

## 4. PocketBase setup and integration

- Use the downloaded **PocketBase Windows binary**, with a local `pb_data` directory and dashboard. The app communicates directly with the PocketBase server using the SDK and its REST APIs.
- Start it locally from the executable's directory (example):

  ```powershell
  .\pocketbase.exe serve
  # Dashboard on the development PC: http://127.0.0.1:8090/_/
  # Inspect startup flags when preparing physical-device access:
  .\pocketbase.exe serve --help
  ```

- Create the first **superuser** through the initial setup flow; do not use superuser credentials in the mobile app.
- For testing on a phone, **`localhost` / `127.0.0.1` inside the phone means the phone**, not your PC. Configure PocketBase to listen on a LAN-reachable interface (for example `--http=0.0.0.0:8090`, after checking `serve --help`), allow the necessary private-network Windows Firewall connection, and point the SDK to `http://<PC_LAN_IP>:8090`. Test in the phone's browser first. Keep this development endpoint on a trusted network only.
- Store the **nonsecret** backend URL in a local Expo environment variable, e.g. `EXPO_PUBLIC_POCKETBASE_URL=http://192.168.x.x:8090`. `EXPO_PUBLIC_` values are visible in the app bundle: never place credentials, signing keys or superuser tokens there.
- The schema should cover **users, stores, products, buildings, delivery slots, orders/order items, wallet transactions, saved delivery locations and ratings**, as needed by the brief. Minimum dataset in the brief: **4 stores, 25 products, 6 buildings, 5 delivery slots**. Plan seed/import data and commit safe schema migrations (`pb_migrations`); **never commit `pb_data`**.
- The printing flow in the brief uses a **simulated document name**, not actual file upload. Do not add document-picker/upload dependencies unless that requirement changes.
- Local PocketBase data lives on the developer PC; for multi-device/remote demonstrations choose a reachable **hosted HTTPS PocketBase instance** later. Hosting provider, domain and backup policy are **undecided**. PocketBase versions prior to 1.0 may include breaking changes; record and pin a tested backend version.

## 5. Physical phone testing (Windows + Expo Go)

1. Put the Windows PC and phone on the **same Wi-Fi** (avoid isolated guest Wi-Fi/VPN). Install a compatible Expo Go version.
2. Start PocketBase, ensure the phone can reach `http://<PC_LAN_IP>:8090/api/`, and confirm that Windows Firewall permits the development connection.
3. **After an Expo app exists**, open its folder in VS Code and run `npx expo start`.
4. On **Android**, scan the terminal QR code using Expo Go. On **iPhone**, use the camera; current Expo instructions may require the same Expo account signed in on CLI and device.
5. Verify login, store/menu loading, printing price calculation, single-store cart, opening hours, delivery-slot cutoff, minimum-order/delivery fee, insufficient-wallet rejection, simulated status tracking, order history and logout.
6. If Metro cannot connect over LAN, try `npx expo start --tunnel` (a fallback for the **Expo app bundle**, not a tunnel for PocketBase). PocketBase still needs a phone-reachable API address. Test with screen locked/unlocked and app restarted.

**Reminder:** Expo Go is appropriate for this coursework/demo, not a substitute for final release builds. The chosen phone/OS and SDK version remain to be recorded.

## 6. Authentication, access rules and business-rule security

- Use **PocketBase auth collections** and email/password login. Validate the `@ua.edu.lb` domain, ID format and password rules **server-side**, not only in input fields. A university email suffix alone **does not prove** that a student/staff member controls that account; email verification and enrollment policy must be decided.
- Keep user sessions in SDK memory initially. If persistent login is wanted, use PocketBase `AsyncAuthStore` with a small `expo-secure-store`-backed adapter, **not AsyncStorage**; restore/refresh tokens carefully and clear them on logout. **Auth-token persistence remains a decision**, rather than an assumed requirement.
- Set PocketBase **list, view, create, update and delete rules separately** for each collection. In PocketBase, an **empty rule means public access**; a **locked/null rule means superuser-only**. Example principles: public/approved read access for store catalogs as needed; users can view only their own orders, wallet records, profiles and saved locations; authenticated users can create only records associated with themselves; block client editing of wallet balances, order prices/statuses, and payment/transaction records.
- Do not confuse a client-supplied `user` field with authorization. Match owner relations against `@request.auth.id` in rules, and restrict create/update request bodies to prevent changing ownership. Never expose superuser tokens in the app.
- **Crucial limitation:** PocketBase access rules alone do **not** make multi-record wallet deductions and order placement atomic, nor do they ensure trustworthy totals. For a real trusted wallet, enforce prices, opening hours, delivery slots, minimums and balance **on the server with transaction-safe custom PocketBase logic** (or a server-side extension). Until then, label wallet/payment and automated tracking as **simulated coursework behavior**, not secure real-money operations. Do not let arbitrary clients write wallet balances.
- Use HTTPS for any hosted/shared environment. Limit administrative access, take backups, avoid committing `.env.local`, `pb_data`, user records or credentials, and use only synthetic/demo user data.

## 7. Installation & verification checklist

- [ ] Install Node.js LTS and npm.
- [ ] Install VS Code and Codex extension.
- [ ] Install Git; authenticate with GitHub when ready.
- [ ] Download and extract PocketBase for Windows.
- [ ] Install Expo Go on the demonstration phone; check SDK compatibility.
- [ ] Confirm PC and phone can communicate on the selected network.
- [ ] Verify the following **without initializing the app**:

```powershell
node --version
npm --version
npx --version
git --version
code --version
# In the extracted PocketBase directory:
.\pocketbase.exe --version
.\pocketbase.exe serve --help
# After starting PocketBase in a separate terminal:
Invoke-WebRequest http://127.0.0.1:8090/api/health
```

**Later, only after app creation:**

```powershell
npx expo --version
npx expo start
npx expo-doctor@latest
npx expo install --check
```

## 8. Open decisions and documents to align

| Decision / discrepancy | Status / next action |
|---|---|
| **Brief conflict** | The original brief (p. 2) explicitly requires local JSON/mock API and AsyncStorage for cart, wallet and orders, and says no real backend is required. **Instructor approval to use PocketBase is confirmed.** Proceed with PocketBase as the backend and the documented no-AsyncStorage architecture. Retain the required minimum sample dataset and simulated payment/tracking behavior. If the approval did not explicitly cover replacing AsyncStorage, clarify that specific grading requirement without delaying PocketBase implementation. |
| Expo SDK & template | **Installed 2026-11-05:** Expo 58.0.23 (SDK 58), React 19.3.0, React Native 0.88.1; JavaScript blank-style starter. Dependency check and Expo Doctor (20/20) passed. Physical Expo Go compatibility is still unverified. Match the actual Expo Go version and choose a **plain JavaScript / React Navigation** starting point rather than the default Expo Router architecture. |
| Phone platform | **Undecided.** Android recommended for simplest Windows setup; confirm exact device. |
| PocketBase deployment | **Undecided.** LAN-hosted on Windows for early development; decide remote HTTPS demo hosting if needed. |
| Session persistence | **Undecided.** In-memory session needs no storage library; `expo-secure-store` is only for persistent auth tokens if selected. |
| Real-time tracking | The brief specifies **simulated timer-driven statuses**. No realtime/SSE package is needed for the initial implementation. |
| Wallet integrity | Simulated academic prototype only until server-side transactional enforcement is defined. |

**Documentation maintenance:** This file is the source of truth for tooling. Record the confirmed PocketBase approval in the **original brief/project requirements notes**, if not already recorded. `docs/ARCHITECTURE.md` and `docs/DEVELOPMENT_PLAN.md` already describe the PocketBase approach; align any outdated approval wording in `docs/ARCHITECTURE.md` separately. No other project documents have been modified.

## Official references (checked 2026-11-04)

- Expo setup / requirements: https://docs.expo.dev/get-started/set-up-your-environment/
- Expo SDK / Expo Go compatibility: https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/
- Expo start and QR code: https://docs.expo.dev/get-started/start-developing/
- React Navigation prerequisites: https://reactnavigation.org/docs/getting-started/
- React Navigation stack & tabs: https://reactnavigation.org/docs/native-stack-navigator/ and https://reactnavigation.org/docs/bottom-tab-navigator/
- PocketBase download, server & docs: https://pocketbase.io/docs/
- PocketBase direct SDK use: https://pocketbase.io/docs/how-to-use/
- PocketBase API rules: https://pocketbase.io/docs/api-rules-and-filters/
- PocketBase SDK auth-store/realtime notes: https://github.com/pocketbase/js-sdk (repository archived/moved; follow its current upstream for new releases)
- Expo SecureStore: https://docs.expo.dev/versions/latest/sdk/securestore/
- Expo client environment-variable security: https://docs.expo.dev/guides/environment-variables/
