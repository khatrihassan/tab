# Tab. API spec

Plain-English spec for the back end in `apps/api`. It describes every request the web app and Stripe make, using the types in `packages/shared` (`@tab/shared`).

## Conventions

- Requests and responses are JSON.
- Money is integer cents everywhere. Clients send fractions (`PaymentLine`) or shares (`SplitShare`); the server converts them to cents and does all rounding.
- Dates are ISO 8601 strings.
- Type names in this doc (`Bill`, `ItemLock`, `Payment`, …) are from `@tab/shared`. Response shapes written like `{ table: Table, bill: Bill | null }` are combinations of shared types that don't have a name yet; they can become shared types later.
- Every request body is validated with Zod. A body that doesn't match fails with `VALIDATION_FAILED`.

## Who can call what

| Caller  | How they're identified                                                                                                                                                                   |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guest   | No login. The table's `qrToken` (from the `/t/:tableToken` URL) and a `guestSessionId`, a random ID the web app stores in the guest's browser and sends in the `X-Guest-Session` header. |
| Staff   | Logged in with email and password. `POST /auth/login` sets an HTTP-only session cookie that is sent with every staff request.                                                            |
| Manager | A logged-in staff member with `role: 'manager'`. Managers can also call every staff request.                                                                                             |
| Stripe  | Only calls the webhook. Identified by the `Stripe-Signature` header, checked with the webhook signing secret.                                                                            |

Staff and managers only ever see data for their own restaurant. A request for another restaurant's table or bill fails with `NOT_FOUND`.

## Error format

Every error, from every request, has the same JSON shape and a matching HTTP status:

```json
{
  "error": {
    "code": "ITEMS_LOCKED",
    "message": "Someone else is paying for Pasta. Pick other items."
  }
}
```

- `code` is stable and meant for code to check. `message` is for logs and debugging; the web app shows its own copy from the boards.
- `VALIDATION_FAILED` may add `details`: a list of `{ path, message }` from Zod.

| Code                    | HTTP | Meaning                                                                                               |
| ----------------------- | ---- | ----------------------------------------------------------------------------------------------------- |
| `VALIDATION_FAILED`     | 400  | The body, params or headers don't match the schema (e.g. a fraction with denominator 0, or above 1).  |
| `INVALID_SIGNATURE`     | 400  | Stripe webhook signature is missing or wrong.                                                         |
| `UNAUTHENTICATED`       | 401  | No valid staff session, or no `X-Guest-Session` header on a guest request that needs one.             |
| `INVALID_CREDENTIALS`   | 401  | Wrong email or password.                                                                              |
| `FORBIDDEN`             | 403  | Logged in, but not allowed (e.g. a server calling a manager route, or rating someone else's payment). |
| `NOT_FOUND`             | 404  | The table, bill, payment or menu item doesn't exist (or belongs to another restaurant).               |
| `TABLE_NOT_OPEN`        | 409  | The table has no open bill. Guests see "This table is closed".                                        |
| `TABLE_ALREADY_OPEN`    | 409  | Opening a table that already has a bill.                                                              |
| `BILL_NOT_OPEN`         | 409  | The bill is `paid` or `closed`, so it can't be changed or paid.                                       |
| `ITEMS_LOCKED`          | 409  | Some of the fractions are held by another guest.                                                      |
| `ITEMS_PAID`            | 409  | Some of the fractions are already paid.                                                               |
| `LOCK_REQUIRED`         | 409  | An item payment without an active lock by this guest covering exactly those fractions.                |
| `SPLIT_MODE_LOCKED`     | 409  | The bill already has a payment in the other mode (equal split vs. items).                             |
| `SHARES_UNAVAILABLE`    | 409  | An equal-split payment asks for more shares than are left, or a different number of total shares.     |
| `MENU_ITEM_UNAVAILABLE` | 409  | Adding a menu item that has `available: false`.                                                       |
| `BALANCE_UNPAID`        | 409  | Closing a table with money still owed, without `settledInPerson: true`.                               |
| `PAYMENT_NOT_SUCCEEDED` | 409  | Rating a payment that hasn't succeeded.                                                               |
| `ALREADY_RATED`         | 409  | The payment already has a rating.                                                                     |
| `INTERNAL_ERROR`        | 500  | Anything unexpected. Details go to the server logs, never to the client.                              |

## Guest requests

### `GET /tables/:qrToken/bill`

Loads the bill for the table whose QR code was scanned.

- **Who:** guest.
- **Sends:** nothing. The `qrToken` is in the path.
- **Returns:** `Bill`. A fully paid bill is still returned (status `'paid'`), so the guest sees "This bill is fully paid".
- **Errors:** `NOT_FOUND` (no table with this token), `TABLE_NOT_OPEN` (the table is free or its bill is closed).

### `POST /bills/:billId/locks`

Holds item fractions for this guest for 5 minutes while they tip and pay, so nobody else can take them.

- **Who:** guest, with `X-Guest-Session`.
- **Sends:** `{ lines: PaymentLine[] }`. Each fraction must have a denominator above 0 and be more than 0 and at most 1.
- **Returns:** `ItemLock`, with `expiresAt` 5 minutes from now.
- **Rules:**
  - A guest has at most one active lock per bill. Locking again replaces their previous lock (e.g. after "Pick items again").
  - The request is all or nothing: if any fraction is unavailable, nothing is locked.
- **Errors:** `UNAUTHENTICATED`, `VALIDATION_FAILED`, `NOT_FOUND`, `BILL_NOT_OPEN`, `ITEMS_LOCKED` (held by another guest), `ITEMS_PAID` (already paid), `SPLIT_MODE_LOCKED` (the bill is being split equally).

### `POST /bills/:billId/payments`

Starts a payment for item fractions or an equal split, plus a tip.

- **Who:** guest, with `X-Guest-Session`.
- **Sends:** one of:
  - `{ lines: PaymentLine[], tipAmount: number }`: pay for items. The lines must exactly match this guest's active lock.
  - `{ splitShare: SplitShare, tipAmount: number }`: pay equal shares, e.g. `{ shares: 1, of: 3 }`.

  `tipAmount` is in cents, an integer of 0 or more. The body never includes the amount to charge.

- **Returns:** `{ payment: Payment, clientSecret: string }`. The payment has status `'pending'`. The web app uses `clientSecret` to confirm the payment with Stripe (Apple Pay / Google Pay).
- **What the server does:**
  1. Works out the amount from the fractions or shares (see [Rounding](#rounding)). A client-sent amount is never used.
  2. Creates a Stripe PaymentIntent for that amount plus the tip, with the payment's ID in its metadata.
  3. Saves the `Payment` as `'pending'` and records the guest's `guestSessionId` with it (used to check ratings).
  4. Does **not** call `applyPayment` or change the bill. That only happens when Stripe's webhook confirms the payment.
- **Locks while pending:** the guest's lock is held for as long as its payment is pending and does not expire mid-payment. It is removed when the payment succeeds, and released when it fails.
- **Errors:** `UNAUTHENTICATED`, `VALIDATION_FAILED`, `NOT_FOUND`, `BILL_NOT_OPEN`, `LOCK_REQUIRED` (no active lock, it expired, or the lines don't match it), `SPLIT_MODE_LOCKED`, `SHARES_UNAVAILABLE`.

### `POST /payments/:paymentId/rating`

Rates the server after paying, from the Done screen.

- **Who:** guest, with the same `X-Guest-Session` that made the payment.
- **Sends:** `{ stars: 1 | 2 | 3 | 4 | 5, reasons: string[] }`. `reasons` are the chip labels from Done.dc.html.
- **Returns:** `Rating`. The server fills in `billId`, `staffId` (the bill's `serverId`) and `createdAt`.
- **Errors:** `UNAUTHENTICATED`, `VALIDATION_FAILED`, `NOT_FOUND`, `FORBIDDEN` (a different guest session made the payment), `PAYMENT_NOT_SUCCEEDED`, `ALREADY_RATED`.

## Staff requests

### `POST /auth/login`

- **Who:** anyone (this is how staff log in).
- **Sends:** `{ email: string, password: string }`.
- **Returns:** `{ staff: Staff, restaurant: Restaurant }` and sets the session cookie. `Staff` has no email or password field; password hashes never leave the database.
- **Errors:** `VALIDATION_FAILED`, `INVALID_CREDENTIALS` (same error whether the email or the password is wrong).

### `POST /auth/logout`

- **Who:** staff.
- **Sends:** nothing.
- **Returns:** `204 No Content` and clears the session cookie.
- **Errors:** `UNAUTHENTICATED`.

### `GET /auth/me`

- **Who:** staff.
- **Sends:** nothing.
- **Returns:** `{ staff: Staff, restaurant: Restaurant }` for the logged-in staff member.
- **Errors:** `UNAUTHENTICATED`.

### `GET /staff/tables`

The server's own tables with "X of Y paid" (S2 · My tables).

- **Who:** staff.
- **Sends:** nothing.
- **Returns:** `TableStatus[]`, one per table with an open or paid bill whose `serverId` is the caller.
- **Errors:** `UNAUTHENTICATED`.

### `POST /tables/:tableId/open`

Opens a free table and starts an empty bill (S3 · Open a table).

- **Who:** staff.
- **Sends:** `{ partySize: number }`, an integer of 1 or more.
- **Returns:** `{ table: Table, bill: Bill }`. The bill has `status: 'open'`, no items, the caller as `serverId`, and `openedAt` set. The table's `currentBillId` points to it.
- **Errors:** `UNAUTHENTICATED`, `VALIDATION_FAILED`, `NOT_FOUND`, `TABLE_ALREADY_OPEN`.

### `GET /menu`

- **Who:** staff.
- **Sends:** nothing.
- **Returns:** `MenuItem[]` for the caller's restaurant, including unavailable items (`available: false`).
- **Errors:** `UNAUTHENTICATED`.

### `POST /bills/:billId/items`

Adds menu items to a bill (S4 · Add items).

- **Who:** staff.
- **Sends:** `{ items: { menuItemId: string, quantity: number }[] }`. `quantity` is an integer of 1 or more.
- **Returns:** the updated `Bill`. Each new `Item` copies the menu item's name and price (`unitPrice`) and has `paidAmount: 0`. The server recalculates `subtotal`, `tax` and `total`.
- **Rules:** see [Items added mid-payment](#items-added-mid-payment).
- **Errors:** `UNAUTHENTICATED`, `VALIDATION_FAILED`, `NOT_FOUND`, `BILL_NOT_OPEN`, `MENU_ITEM_UNAVAILABLE`.

### `GET /tables/:tableId`

One table in detail (S5 · Table detail).

- **Who:** staff.
- **Sends:** nothing.
- **Returns:** `{ table: Table, bill: Bill | null, payments: Payment[], locks: ItemLock[] }`. `bill` is null when the table is free. `locks` are the active locks, so the server can see "Held · Jordan · 3:12".
- **Errors:** `UNAUTHENTICATED`, `NOT_FOUND`.

### `POST /tables/:tableId/close`

Closes the table's bill and frees the table (S6 · Close table).

- **Who:** staff.
- **Sends:** `{ settledInPerson?: boolean }`. Send `true` when there's an unpaid balance that the server collected in person (cash or the card terminal).
- **Returns:** `{ table: Table, bill: Bill }`. The bill has `status: 'closed'` and `closedAt` set; the table's `currentBillId` is null. Its QR code now gets `TABLE_NOT_OPEN`.
- **Rules:** a fully paid bill closes without the flag. With money still owed, the request fails unless `settledInPerson` is `true`. Pending payments must finish first.
- **Errors:** `UNAUTHENTICATED`, `VALIDATION_FAILED`, `NOT_FOUND`, `TABLE_NOT_OPEN`, `BALANCE_UNPAID`.

> **Board copy to update:** S6 still says "I collected $24.86 at the POS". That's from the old Square plan. Now that Tab. is its own POS, the copy should be updated in Claude Design to match `settledInPerson` (cash or card terminal).

## Manager requests

### `GET /manager/floor`

Every table in the restaurant, for the desktop floor view.

- **Who:** manager.
- **Sends:** nothing.
- **Returns:** `{ table: Table, bill: Bill | null, status: TableStatus | null }[]`. `bill` and `status` are null for free tables.
- **Errors:** `UNAUTHENTICATED`, `FORBIDDEN` (caller is a server, not a manager).

## Stripe

### `POST /webhooks/stripe`

The only place a payment becomes `'succeeded'`.

- **Who:** Stripe.
- **Sends:** a Stripe event, as the raw body (needed to check the signature).
- **Handles:**
  - `payment_intent.succeeded`: marks the `Payment` `'succeeded'`, calls `applyPayment(billId, amountCents, tipCents)`, removes the guest's lock, and notifies the server, e.g. "Sarah paid $40.61" (how live updates are sent is still to be decided). If that pays off the bill, the bill's status becomes `'paid'`.
  - `payment_intent.payment_failed`: marks the `Payment` `'failed'` and releases the guest's lock, so the items go back on the bill. The server is not notified.
- **Idempotent:** Stripe can send the same event more than once. The server records each Stripe event ID it has handled and ignores repeats, and only moves a payment out of `'pending'` once. The same event arriving twice never applies a payment twice. Repeats still get a `200`, so Stripe stops retrying.
- **Returns:** `200` with `{ received: true }`.
- **Errors:** `INVALID_SIGNATURE`.

## Middleman layer

Guest routes and the Stripe webhook never read or write bills in the database directly. They go through two functions:

- `getBill(qrToken)`: returns the `Bill` for a table.
- `applyPayment(billId, amountCents, tipCents)`: records a confirmed payment against a bill. Called only from the Stripe webhook.

Today there is one implementation, backed by Tab.'s own database. Tab. doesn't integrate with Square or any other POS, but because everything goes through this layer, a POS adapter (e.g. Toast or Lightspeed) can be added later without changing the routes.

## Bill rules

### Locks

- A lock holds item fractions for 5 minutes. With no payment in that time it expires and the items go back on the bill ("Your hold ran out").
- While its payment is pending, a lock doesn't expire. It's removed when the payment succeeds and released when it fails ("Card declined").
- Locks by other guests count as taken: two guests can't lock more than the unpaid part of an item between them.

### One split mode per bill

After the first payment, the bill keeps that mode: equal split or items. A payment in the other mode fails with `SPLIT_MODE_LOCKED`, and Pay for my items is off for the table. Pending payments count as the first payment.

> **Follow-up type change (not part of this spec's PR):** to enforce this, `Bill` will need `splitMode` and `splitShares` fields, so the server knows the mode and the number of shares the bill was split into.

### Items added mid-payment

From the Edge cases board (01): new items join the unpaid list. Anyone mid-checkout sees the "Bill updated" banner; their claimed items and amount stay the same.

- **Item payments:** locks and pending payments keep their fractions and amounts. The new items are unpaid and can be locked by anyone.
- **Equal split:** payments already made or in progress keep their amount. The remaining unpaid shares absorb the new item, so each remaining share = remaining balance ÷ remaining shares. The remaining balance is the bill total minus succeeded and pending payments (excluding tips).

### Rounding

The server does all rounding, so a fully paid bill lands exactly on its total.

- **Items:** each fraction becomes cents of its line total (`unitPrice × quantity`), plus its share of tax at the restaurant's `taxRateBasisPoints`. The payment that finishes off a line takes exactly what's left of it.
- **Equal split:** each share is the remaining balance ÷ remaining shares, rounded down; the last share takes whatever is left. For example, $96.05 split 3 ways is $32.01, $32.01, $32.03.
- No payment is ever larger than what's left on the bill.

## Open questions

- **Other guests' locks:** the guest items screen shows "Taken by Jordan", but `Bill` doesn't say which items are held. `GET /tables/:qrToken/bill` will need to return held fractions, without exposing other guests' `guestSessionId`, and a name to show. Where the name comes from isn't decided.
- **`TableStatus` has no table ID:** S2 needs to open a table's detail page (`/staff/tables/:id`), but `TableStatus` only has `tableNumber`. It will likely need `tableId`.
- **Free tables for S3:** Open a table lists free tables only, and `GET /staff/tables` returns only the server's own tables. S3 needs a way to list free tables.
