# tab.

QR pay-at-table web app for restaurants in London, Ontario. Scan the code, split the bill, tip and pay from your phone. Built with React + TypeScript.

## Development

npm workspaces monorepo:

| Path              | What                                                            | Owner  |
| ----------------- | --------------------------------------------------------------- | ------ |
| `apps/web`        | Front end — React, Vite, TypeScript, Tailwind CSS, React Router | Hassan |
| `apps/api`        | Back end (placeholder)                                          | Hamza  |
| `packages/shared` | TypeScript types shared by both apps (`@tab/shared`)            | Both   |

Requires Node 26 (see `.nvmrc`).

```sh
npm install          # install all workspaces
npm run dev          # start the web app (http://localhost:5173)
npm run build        # production build of the web app
npm run lint         # ESLint
npm run typecheck    # TypeScript across workspaces
npm run format       # Prettier (format:check to verify only)
```
