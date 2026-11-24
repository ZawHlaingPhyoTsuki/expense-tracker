# Expense Tracker

A personal expense tracker Android app built with Expo and React Native. Data is stored locally in SQLite on the device.

## What it does

- **Daily tab:** month switcher, monthly total, expense count, average per day, category breakdown bars, and expenses grouped by day. Long-press an expense to delete it.
- **Months tab:** compares this month vs last month and lists tracked months with totals/bars.
- **Add expense modal:** amount input supports quick sums like `45+25`; category picker; Today/Yesterday/date picker; optional note. Save shows the parsed amount.
- **Settings tab:** appearance mode (System/Light/Dark) and theme selection (Sage Green, Vercel, Cloudflare, Twitter, Claude, Supabase). Preferences are persisted locally.
- **Data model:** amounts are stored as integer minor units (`satang`/cents) to avoid floating-point errors. Currency display is `฿` via `src/lib/money.ts`.
- **Storage:** local SQLite database (`app.db`) managed by Expo SQLite + Drizzle ORM. Migrations are generated into `drizzle/` and applied at startup.

## Tech stack

Versions are from `package.json`:

| Area | Package | Version |
| --- | --- | --- |
| Runtime | `expo` | `~58.0.26` |
| UI | `react` | `19.3.0` |
| UI | `react-native` | `0.88.1` |
| Routing | `expo-router` | `~58.0.32` |
| Database | `expo-sqlite` | `~58.0.18` |
| ORM | `drizzle-orm` | `^1.0.0-rc.5` |
| ORM tooling | `drizzle-kit` (dev) | `^1.0.0-rc.5` |
| Updates | `expo-updates` | `~58.0.22` |
| Language | `typescript` (dev) | `~6.0.3` |

## Project structure

```text
.
├── app.json                  # Expo config, plugins, EAS project, fingerprint runtime policy
├── eas.json                  # EAS build/submit profiles
├── drizzle.config.ts         # Drizzle Kit config (sqlite, expo driver)
├── drizzle/                  # Generated SQL migrations + migrations.js metadata
├── docs/
│   └── RELEASING.md          # Build/update/release commands
├── src/
│   ├── app/                  # Expo Router routes
│   │   ├── _layout.tsx       # Root layout, splash, DB migrations, theme/nav providers
│   │   └── (tabs)/           # Daily, Months, Settings tabs
│   ├── components/           # UI components (expense rows, modal, charts, themed primitives)
│   ├── constants/            # Theme tokens and theme definitions
│   ├── db/                   # SQLite client and Drizzle schema
│   ├── hooks/                # Theme and data hooks
│   ├── lib/                  # Money/date/category helpers
│   └── providers/            # Theme preference provider (color mode + theme id)
└── .github/workflows/
    └── preview.yml           # PR preview EAS Update via GitHub Actions
```

## Getting started

### Prerequisites

- [Bun](https://bun.sh/)
- Android SDK/emulator or an Android device with a development build

### Install

```sh
bun install
```

### Run on Android

```sh
bun run start
```

Then open the Android target from the Expo dev server, or run:

```sh
bun run android
```

This project is Android-only by default. Native `android/` and `ios/` directories are not checked in; Expo/CNG and EAS handle native builds.

### Database migrations

- Schema: `src/db/schema.ts`
- Drizzle config: `drizzle.config.ts`
- Generated migrations: `drizzle/`

Generate migrations after schema changes:

```sh
bun run db:generate
```

Migrations are applied at app startup in `src/app/_layout.tsx` using `useMigrations(db, migrations)` before the app UI is shown.

## Releasing

See [docs/RELEASING.md](docs/RELEASING.md) for fingerprint checks, EAS Build, manual EAS Update, PR preview channel testing, inspection, cleanup, and rollback commands.
