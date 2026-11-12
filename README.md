# tab.

QR pay-at-table web app for restaurants in London, Ontario. Scan the code, split the bill, tip and pay from your phone. Built with React + TypeScript.

Tab. runs its own small POS: servers open tables and add items in the Tab. staff app, and bills live in Tab.'s own database.

## Tech stack

- **Front end:** React, Vite, TypeScript, Tailwind CSS v4, React Router. Hosted on Vercel.
- **Back end:** Express + TypeScript, PostgreSQL on Neon, Drizzle ORM with drizzle-kit migrations, Zod request validation. Hosted on Render.
- **Payments:** Stripe (test mode).
- **Live updates:** Socket.IO or Server-Sent Events, to be decided.

## Why Tab. runs its own POS

Square's public API can't read open tickets or apply payments to them, and Toast and Lightspeed only open pay-at-table features to approved partners. So Tab. stores bills itself behind `getBill` / `applyPayment`, where a real POS can plug in later.

## Development

npm workspaces monorepo:

| Path              | What                                                            | Owner          |
| ----------------- | --------------------------------------------------------------- | -------------- |
| `apps/web`        | Front end — React, Vite, TypeScript, Tailwind CSS, React Router | Hassan         |
| `apps/api`        | Back end — Express, TypeScript, PostgreSQL (Neon), Drizzle      | Hassan & Hamza |
| `packages/shared` | TypeScript types shared by both apps (`@tab/shared`)            | Both           |

Requires Node 26 (see `.nvmrc`).

```sh
npm install          # install all workspaces
npm run dev          # start the web app (http://localhost:5173)
npm run build        # production build of the web app
npm run lint         # ESLint
npm run typecheck    # TypeScript across workspaces
npm run format       # Prettier (format:check to verify only)
```
