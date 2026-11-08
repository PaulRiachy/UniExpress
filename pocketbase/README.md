# UniExpress — PocketBase Setup

## Backend version

- PocketBase version: **0.41.1**
- Platform: Windows
- Backend type: PocketBase (SQLite, authentication, REST API)
- Instructor approval: Confirmed

## Local setup

The PocketBase executable is stored locally in the `pocketbase/` directory.

To verify the installed version:

```powershell
.\pocketbase.exe --version
```

To start the development server:

```powershell
.\pocketbase.exe serve --http=0.0.0.0:8090
```

Run these commands from the `pocketbase/` directory.

Only expose the development server on trusted private networks.

## Administrative dashboard

Open on the development computer:

http://127.0.0.1:8090/_/

Create the initial PocketBase superuser through the local setup flow. Never store superuser credentials in the React Native application.

## Health check

Local computer:

http://127.0.0.1:8090/api/health

Physical phone:

http://YOUR_PC_LAN_IP:8090/api/health

The computer and phone must be connected to the same reachable network.

## Expo connection

The React Native application uses the PocketBase JavaScript SDK.

Configure the backend URL in the repository-root `.env.local`:

```dotenv
EXPO_PUBLIC_POCKETBASE_URL=http://YOUR_PC_LAN_IP:8090
```

Do not use localhost as the PocketBase URL when testing on a physical phone.

## Repository structure

- `pb_migrations/` — Version-controlled database schema migrations (Phase 6)
- `pb_hooks/` — Server-side business logic (later phases)
- `seed/` — Synthetic sample data (Phase 6)
- `pb_data/` — Local database and uploaded files; never commit
- `pocketbase.exe` — Local executable; never commit

## Security

Never commit:

- The PocketBase executable
- `pb_data/`
- `.env.local`
- Superuser credentials or authentication tokens
- Private student or staff information

## Development status

- PocketBase 0.41.1 executable verified.
- Server startup: Pending verification.
- Superuser creation: Pending verification.
- PC health check: Pending verification.
- Phone connectivity check: Pending verification.
- React Native SDK integration: Phase 5.

## Official documentation

https://pocketbase.io/docs/
