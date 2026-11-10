# Phase 6 verification — 2026-11-10

The 14 application collections, access rules, indexes and synthetic sample data are implemented and applied to the local PocketBase 0.41.1 database. All Phase 6 technical acceptance checks pass. Local server restart/dashboard review and committing the reviewed source remain manual checkpoints; no Git commit was made. Phase 7 was not started.

## Existing state and preservation

Initial read-only inspection found only PocketBase's default system collections and an empty `users` auth collection. No application catalog, order or wallet collections existed. The existing mobile connection, navigation and `.env.local` were preserved.

Before applying migrations, Python's SQLite backup API created consistent snapshots of `data.db` and `auxiliary.db` under the ignored directory `pocketbase/pb_data/backups/phase6-before-20261110-160723/`. Existing collection record fingerprints were compared before/after: all records in the six original collections were preserved, including superuser records. Schema settings for the empty users collection were intentionally constrained. No credentials were printed, no user accounts were added to the local application database, and no existing records were deleted or overwritten.

Both migrations applied successfully locally. Read-only SQLite inspection confirmed 14 application collections and counts of 4 stores, 25 products, 6 buildings and 5 slots. The already-running user server was not stopped or restarted; restart it before reviewing the new schema via the dashboard/API.

## Files created or modified

Created:

- `pocketbase/pb_migrations/1794268800_phase6_collections.js`
- `pocketbase/pb_migrations/1794268801_phase6_sample_data.js`
- `pocketbase/seed/catalog.json`
- `pocketbase/seed/campus.json`
- `pocketbase/seed/pricing.json`
- `pocketbase/tests/verify-phase6.cjs`
- `docs/pocketbase-setup.md`
- `docs/PHASE_6_VERIFICATION.md`

Modified:

- `docs/ARCHITECTURE.md`: implemented schema decisions, optional media representation, owner/access boundaries and pricing policy reference.
- `docs/TECH_STACK.md`: current Phase 6 checkpoint; user-confirmed Phase 5 phone connectivity.
- `docs/DEVELOPMENT_PLAN.md`: Phase 5 confirmation, Phase 6 implementation/test evidence and checkpoint.
- `docs/PHASE_5_VERIFICATION.md`: historical follow-up noting user confirmation and Phase 6.
- `pocketbase/README.md`: pointer to canonical setup/migration guide and current status.

Generated local changes: ignored database schema/seed rows, migration history and backup snapshots. The executable and frontend source/package files were not modified.

## Collections and relationships

`users` (auth); `stores`; `store_hours` → stores; `product_categories` → stores; `products` → stores/categories; `buildings`; `delivery_slots`; `saved_locations` → users/buildings; `pricing_rules`; `orders` → users/stores/buildings/slots; `order_items` → orders/optional products; `wallets` → users (unique); `wallet_transactions` → users/wallets/optional orders; `ratings` → users/orders (one rating per order).

Required fields, allowed enums, bounded integer values, time/date text patterns, email domain, relation existence and unique indexes are defined in the migration. Relations do not cascade-delete. Public catalog reads are intentional; private reads are owner-filtered. Direct client writes to authoritative values stay locked. Public user creation remains locked until controlled Phase 7 registration.

## Tests executed and results

- `pocketbase.exe migrate --help`, `superuser --help`; inspected 0.41.1 JS migration, collection, record and API-rule references and installed type declarations.
- `node pocketbase/tests/verify-phase6.cjs`: **passed 225 HTTP API assertions**, plus schema/relation/count/price checks and migration conflict preservation checks. The final run used fresh disposable databases with random test credentials and private loopback servers; all temporary test data was removed by the runner.
- Verified all 14 application collections, 4 stores, 25 products, 6 buildings, 5 slots, 28 store-hours rows, four categories and one active pricing policy. Product categories belong to their seeded store. Both JSON datasets and relational imports reproduced on fresh databases.
- Anonymous public reads passed; anonymous/private and unrelated-user record reads were filtered/denied; owner reads passed, including indirect `order.user` reads. Catalog and authoritative collection create/update/delete were denied to anonymous, owner and unrelated users. Profile identity guards and saved-location owner CRUD/spoof protection passed.
- Fractional/negative prices, missing required relations/room/user details, invalid relations/domain/short password, duplicate IDs/names/wallets/ratings/active pricing, and invalid stars were rejected through the validated APIs. Inactive pricing was hidden from public reads.
- Repeating `migrate up` was a no-op. A synthetic existing-catalog conflict rejected migration, retained the existing record and left no partial Phase 6 schema.
- `pocketbase.exe migrate up` against local data (after snapshot backup): both migrations applied. Existing-record fingerprint comparison passed for all six original collections. Read-only count checks passed.
- `npx.cmd expo install --check`: dependencies up to date. Initial sandbox network request failed with EACCES; network-enabled retry passed.
- `npx.cmd expo-doctor@latest`: **20/20 checks passed**. No mobile source or dependency changes were needed.
- `git check-ignore -v` confirmed `.env.local`, executable, `pb_data` and its backup path are ignored. `git ls-files` for these paths returned no tracked files. Final `git diff --check` was clean, with only a Git line-ending notice. Local Markdown link validation and `node --check` for both migrations and the test runner passed. The initial isolated migration scratch database was removed after verification.

During development, an initial isolated seed attempt exposed that PocketBase 0.41.1 has no `__migrations` global. The seed migration was corrected to load JSON relative to the documented backend working directory. The failed isolated run rolled back; it never touched local data. A test helper's collection-metadata path was also corrected before the passing runs.

## Repeatable procedure and manual checkpoint

Follow [the setup and migration guide](pocketbase-setup.md). `migrate up` applies schema plus seed once; do not manually duplicate-import JSON, delete migration history or reset `pb_data`. Migrations are forward-only and stop on existing schema/seed conflicts.

Restart the local PocketBase process, open the dashboard with your existing superuser, and review the 14 collections, counts and API rules. No hand-created collections, seed accounts or rule changes are required. Optionally verify public catalog reads from the phone after restart; Phase 5 phone connectivity was already confirmed by the user. Do not enable public registration or direct wallet/order writes.

The user confirmed Phase 5 works from a physical phone. This phase's API security tests ran on this computer against disposable PocketBase databases; no additional physical-phone UI success is claimed. Review/commit only safe source files after the dashboard check. The next authorized development checkpoint is Phase 7 authentication, which has not been implemented here.
