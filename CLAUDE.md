# Tab.

QR pay-at-table web app for restaurants in London, Ontario. Guests scan a QR code on the table, see the bill, split it or pick their items, tip, and pay with Apple Pay / Google Pay. Servers see "X of Y paid" per table.

## Team

- Hassan: front end (apps/web). Hamza: back end (apps/api).
- Never edit apps/api unless asked. Shared types live in packages/shared.

## Stack

- TypeScript everywhere. React + Vite, Tailwind CSS v4, React Router. npm workspaces.
- Money is integer cents everywhere. Format only when rendering.

## Design source of truth

- design/boards/*.dc.html: one file per board from Claude Design. design/boards/canvas.json maps files to board titles.
- Never edit anything in design/. Read it, build from it.
- Match the boards exactly: copy, spacing, radii, font sizes, colours.
- Guest and server screens are phone-first, designed at 390 x 844. The manager floor view is desktop, 1800 x 1000.
- The boards point to the logo at /_blob/...; in the app, always use design/assets/tab-logo.png (copy it into apps/web/src/assets/).
- Don't invent screens, copy or features that aren't in the boards. Ask instead.

## Design tokens (define once as Tailwind theme tokens, never hard-code hex in components)

- bg #F5F4F0, ink #111111, muted #5C5C58, line #E2E0DA, divider #EEEDE8, accent #C8F031
- Fonts: Inter (UI), Space Mono (prices, totals, table tags)
- Radius: card 16px, button and tile 14px. Primary button 56px tall, ink background, white 17px semibold text.

## Data

- Until the API is live, all data comes from apps/web/src/lib/api.ts, which returns mock data from apps/web/src/mocks/ after a short delay.
- Functions: getBill(tableToken), lockItems(billId, itemIds), pay(billId, payload).
- VITE_USE_MOCKS=true keeps the demo working when the API is down.

## Routes

- Guest: /t/:tableToken, then /t/:tableToken/choose, /split, /items, /tip, /pay, /done
- Server: /staff/login, /staff/tables, /staff/open, /staff/tables/:id, /staff/tables/:id/add, /staff/tables/:id/close
- Manager: /manager

## Working rules

- One screen per task. Show a plan first, then build.
- Shared pieces go in apps/web/src/components; screens go in apps/web/src/screens.
- When a screen is done: run lint and typecheck, start the dev server, and tell me which URL to open.
- Work on a feature branch with small, clearly named commits.
