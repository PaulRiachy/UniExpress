# PocketBase schema and sample data — Phase 6

**Phase 7 update (2026-11-14):** The third migration enables validated registration; owner/profile rules and all catalog/money/order restrictions remain. Earlier Phase 6 descriptions of locked registration are historical. See [Phase 7 verification](PHASE_7_VERIFICATION.md) for current behavior, existing ID validation and the pending verification-policy decision.


Use the pinned **PocketBase 0.41.1** executable and Node.js already required by Expo. No extra framework, SDK, credentials file or database server is needed to migrate or test the schema.

## Apply on a teammate's machine or an existing local database

1. Stop the PocketBase server before a planned migration and take a private backup of the full `pocketbase/pb_data/` directory (including uploaded files). Keep backups outside version control. Preserve the existing executable and `.env.local`; neither belongs in Git.
2. From the repository root:

   ```powershell
   Set-Location pocketbase
   .\pocketbase.exe --version
   .\pocketbase.exe migrate up --dir=./pb_data --migrationsDir=./pb_migrations --automigrate=false
   .\pocketbase.exe serve --dir=./pb_data --migrationsDir=./pb_migrations --automigrate=false --http=0.0.0.0:8090
   ```

   The **working directory must be `pocketbase/`** because the sample-data migration loads `./seed/*.json`. Bind to the LAN only on a trusted private network. `--automigrate=false` disables generated dashboard-change migrations, not execution of pending application migrations. Restart an already-running server after applying migrations so it refreshes cached collections.
3. Open the PC dashboard at `http://127.0.0.1:8090/_/` using your existing local superuser. On a new installation, use the local initial setup flow. Never paste credentials into mobile code, migrations, seed JSON or tracked documentation.
4. Verify 14 application collections, the seed counts below, and the collection API rules. The migration is the schema source of truth; no manual collection creation or public-write rule changes are required.

## Migrations and repeatable seed import

`pocketbase/pb_migrations/1794268800_phase6_collections.js` creates the schema and configures the default empty `users` auth collection. It refuses to overwrite any existing application collection and refuses to alter a populated users collection. If it reports a conflict, keep the backup and prepare a reviewed additive migration for that database; do not delete its collections or users to make the import work.

`pocketbase/pb_migrations/1794268801_phase6_sample_data.js` imports the versioned synthetic JSON in `pocketbase/seed/` in relation order. It runs through the PocketBase record validation APIs in the migration transaction. It rejects conflicting seed IDs or unique keys rather than overwriting data. Failed pending migrations roll back as a transaction. This behavior is tested for an existing catalog conflict.

`migrate up` applies each migration once. Repeating it is a no-op and preserves later catalog edits. Do not edit the applied seed JSON or delete migration-history entries to reseed. Add a new migration for future changes. To reproduce the original demo data, apply the same migrations to a **new, separate database**. Do not clear the current `pb_data` directory.

These migrations intentionally refuse `migrate down`: dropping a collection or deleting referenced seed rows could destroy data. Recover using the private pre-migration backup after stopping the server, or write a forward corrective migration. Never restore database files over a running server.

| Source | Imported records |
|---|---|
| `pocketbase/seed/catalog.json` | 4 stores, 28 daily-hours records, 4 product categories, 25 products |
| `pocketbase/seed/campus.json` | 6 buildings, 5 delivery slots |
| `pocketbase/seed/pricing.json` | 1 active pricing policy |

All records are fabricated demo data. The Printing Office uses its future simulated printing form, so no invented physical printing product is needed among the 25 products. Logos and image URLs are optional and left empty. No user accounts, passwords, wallets, orders, transactions or ratings are seeded into the application database.

## Validation and documented demo decisions

- Money uses bounded, nonnegative integer-cent number fields (`onlyInt`). PocketBase stores zero as the default for omitted numeric fields; zero-valued money is allowed, including a zero wallet balance. Transaction `amount_cents` is a positive magnitude; `kind` indicates top-up/payment/refund direction. There is no client balance mutation.
- Policy values: minimum 200 cents; delivery fee 50 cents below subtotal 1000; free at 1000 or above; B&W 5 cents/page; color 25 cents/page; spiral binding 150 cents/job. These are stored policy values; checkout enforcement is a later trusted-server phase.
- Unspecified demo policy decisions: stapling costs **0 cents**, duplex costs **per printed page with no extra surcharge**, and seeded products have **no paid extras or sizes** (`options_json: []`). These are explicit academic defaults, not university prices. Agree and version any later option-price changes before implementing calculations.
- Store hours are synthetic 08:00–17:00 Monday–Friday, closed Saturday/Sunday; `weekday` uses Sunday=0 through Saturday=6. Slot windows and `DEMO-A` through `DEMO-F` buildings are fabricated. Future schedule evaluation uses campus time **Asia/Beirut**; delivery dates use ISO `YYYY-MM-DD`, and event timestamps use PocketBase date fields. Cross-field/date-calendar/stock/one-store/slot-cutoff/order-total validations belong in the later trusted operations, not client access rules.
- Users require university-domain email, full name, account type, university ID, faculty and phone. Email domains are restricted to `ua.edu.lb`; password minimum remains 8. IDs are unique and provisionally accept 3–32 alphanumeric/hyphen characters, beginning alphanumeric. This is a conservative demo format, **not a claimed official university ID format**. Exact institutional IDs/phone/faculty policies and email verification must be finalized in Phase 7. Public registration stays locked until then.
- Unique indexes cover university IDs, store names, store/day hours, category/store names, product/store names, building codes, slot windows, saved-location labels per user, wallet per user, rating per order and a single active pricing policy. Additional indexes support owner/history, category, order, wallet and store lookup.
- Relations are single-record, validated targets and **non-cascading** to avoid accidental data removal. Optional relations include a print item's product and a transaction's order. Price/order JSON options are bounded in size; their business structure and cross-record consistency must be checked by future trusted endpoints.

## Access policy

| Collections | Read | Create / update / delete by ordinary clients |
|---|---|---|
| `stores`, `store_hours`, `product_categories`, `products`, `buildings`, `delivery_slots` | Public, including demo inactive/out-of-stock records for display | Locked |
| `pricing_rules` | Public for active policy only | Locked |
| `users` | Own record only, including list filtering | Create/delete locked; owner can edit ordinary profile fields; email, verified, ID, account type, password, token key and email visibility changes blocked; manage rule locked |
| `saved_locations` | Own only | Own create/edit/delete; user spoofing and ownership reassignment blocked |
| `orders`, `order_items` | Owner; order items follow `order.user` | Locked |
| `wallets`, `wallet_transactions`, `ratings` | Own only | Locked |

Superusers are trusted administrators and can bypass collection API rules. There are no client SDK calls, credentials or authentication screens in this phase. Later checkout/top-up/refund/status/rating operations must remain server-authorized and transactional; do not unlock direct collection writes to build those features.

## Run the reproducible integration suite

From the repository root:

```powershell
node pocketbase/tests/verify-phase6.cjs
```

The suite uses Node built-ins and the pinned executable, creates fresh OS-temporary databases, generates temporary random credentials, tests real HTTP requests as anonymous/owner/unrelated users, stops its private loopback server and removes its temporary data. It does not access the app's `.env.local` or current `pb_data`, and never logs credentials. It validates seed counts, field rules, uniqueness, all relation targets, access restrictions, migration repeatability and preservation on schema conflict.

See [Phase 6 verification](PHASE_6_VERIFICATION.md) for the actual results and remaining local review checkpoint. Official references: [migrations](https://pocketbase.io/docs/js-migrations/), [collection APIs](https://pocketbase.io/docs/js-collections/), [access rules](https://pocketbase.io/docs/api-rules-and-filters/).
