# Finance Tracker

A personal finance tracker with detailed analytics — accounts, transactions
(including transfers), categories, budgets, an archive for important
transactions, and a dashboard/analytics view with charts.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [Drizzle ORM](https://orm.drizzle.team) + [NeonDB](https://neon.tech) (Postgres)
- [Firebase Auth](https://firebase.google.com/docs/auth) (email/password, session cookies)
- [shadcn/ui](https://ui.shadcn.com) + [Recharts](https://recharts.org) for analytics charts

## Setup

1. Copy the env template and fill in your own values:

   ```bash
   cp .env.local.example .env.local
   ```

   - `DATABASE_URL` — Neon connection string (Neon dashboard → Connection string)
   - `NEXT_PUBLIC_FIREBASE_*` — Firebase Console → Project settings → your Web app
   - `FIREBASE_*` — Firebase Console → Project settings → Service accounts → Generate new private key

2. Install dependencies and apply the database schema:

   ```bash
   npm install
   npx drizzle-kit migrate
   ```

3. In Firebase Console → Authentication → enable Email/Password, then add
   yourself as a user (there's no public sign-up — this app is single-user).

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) and log in.

## Project structure

- `app/(app)/` — authenticated routes (dashboard, transactions, analytics,
  budgets, accounts, categories, archive, settings), sharing one sidebar layout
- `app/login/` — sign-in page
- `app/api/auth/` — session cookie creation/logout
- `lib/db/` — Drizzle schema and client
- `lib/finance/` — data-access queries and formatting helpers
- `lib/auth/` — server-side session helper
- `lib/firebase/` — Firebase client/admin SDK setup
- `proxy.ts` — optimistic auth redirect (Next 16's renamed `middleware.ts`)
- `drizzle/` — generated SQL migrations

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # eslint
npx drizzle-kit generate   # generate a migration after editing lib/db/schema.ts
npx drizzle-kit migrate    # apply pending migrations
```
