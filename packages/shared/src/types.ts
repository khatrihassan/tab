/**
 * Shared types for Tab. Used by both the web app and the API.
 *
 * Money: every amount is an integer number of cents. Format only when rendering.
 *
 * Fraction model: a guest pays for an item as a fraction of its line total
 * (unitPrice * quantity), not as a count of units. Paying for 1 of 3 drinks is
 * 1/3 of the drinks line; half a shared burger is 1/2; a whole item is 1/1.
 * Clients send fractions only. The server converts each fraction to cents and
 * does all rounding, so that a fully paid bill lands exactly on its total.
 * The server must also reject invalid fractions (denominator of 0, or a
 * fraction outside 0 to 1).
 *
 * Dates: every date is an ISO 8601 string, since these types travel as JSON.
 */

/** A restaurant using Tab. */
export type Restaurant = {
  /** Unique ID of the restaurant. */
  id: string;
  /** Name shown to guests, e.g. "Harbour & Elm". */
  name: string;
  /** Tax rate in basis points, an integer: 1300 = 13% HST. */
  taxRateBasisPoints: number;
};

/** What a staff member can do in the staff app. */
export type StaffRole = 'server' | 'manager';

/**
 * A staff member. Has no password field: password hashes live only in the
 * database and are never sent to clients.
 */
export type Staff = {
  /** Unique ID of the staff member. */
  id: string;
  /** ID of the Restaurant they work at. */
  restaurantId: string;
  /** Name shown in the staff app, e.g. "Sam". */
  name: string;
  /** Server or manager. */
  role: StaffRole;
};

/** A dish or drink on a restaurant's menu, which servers add to bills. */
export type MenuItem = {
  /** Unique ID of the menu item. */
  id: string;
  /** ID of the Restaurant whose menu this is on. */
  restaurantId: string;
  /** Name shown to staff and guests, e.g. "Burger". */
  name: string;
  /** Price of one unit in cents, before tax. */
  price: number;
  /** Menu section, e.g. "Mains" or "Drinks". */
  category: string;
  /** Whether servers can currently add it to a bill. */
  available: boolean;
};

/** A physical table in a restaurant. */
export type Table = {
  /** Unique ID of the table. */
  id: string;
  /** ID of the Restaurant the table is in. */
  restaurantId: string;
  /** Table number, e.g. 7 (rendered as "TABLE 07"). */
  tableNumber: number;
  /** Random string used in the /t/:tableToken URL. Never the table number. */
  qrToken: string;
  /** ID of the Bill open at this table, or null when the table is free. */
  currentBillId: string | null;
};

/** One line on a bill. */
export type Item = {
  /** Unique ID of this bill line. */
  id: string;
  /** ID of the MenuItem this line was added from. */
  menuItemId: string;
  /** Name shown to guests, e.g. "Burger". */
  name: string;
  /** Price of one unit in cents, before tax. */
  unitPrice: number;
  /** Number of units on the bill. */
  quantity: number;
  /** Cents paid so far. Fully paid when paidAmount >= unitPrice * quantity. */
  paidAmount: number;
};

/** Lifecycle of a bill. */
export type BillStatus = 'open' | 'paid' | 'closed';

/** A table's bill. */
export type Bill = {
  /** Unique ID of the bill. */
  id: string;
  /** ID of the Table the bill is open at. */
  tableId: string;
  /** ID of the Staff member (the server) looking after the table. */
  serverId: string;
  /** Where the bill is in its lifecycle. */
  status: BillStatus;
  /** Guests at the table, e.g. 3 in "2 of 3 paid". */
  partySize: number;
  /** When the server opened the bill. */
  openedAt: string;
  /** When the bill was closed, or null while it is still open or paid. */
  closedAt: string | null;
  /** Restaurant name shown at the top of the bill. */
  restaurantName: string;
  /** Table number, e.g. 7 (rendered as "TABLE 07"). */
  tableNumber: number;
  /** Lines on the bill. */
  items: Item[];
  /** Sum of all line totals in cents, before tax. */
  subtotal: number;
  /** Tax in cents (HST). */
  tax: number;
  /** subtotal + tax, in cents. */
  total: number;
  /** Cents paid so far across all payments, excluding tips. */
  amountPaid: number;
};

/** A fraction of one item's line total, paid in a single payment. */
export type PaymentLine = {
  /** ID of the Item being paid for. */
  itemId: string;
  /** Top of the fraction, e.g. 1 in 1/3. */
  numerator: number;
  /** Bottom of the fraction, e.g. 3 in 1/3. Must be greater than 0. */
  denominator: number;
};

/** An equal split of the whole bill. */
export type SplitShare = {
  /** Number of shares this payment covers, e.g. 1. */
  shares: number;
  /** Total number of shares the bill is split into, e.g. 3. */
  of: number;
};

/** Lifecycle of a payment. */
export type PaymentStatus = 'pending' | 'succeeded' | 'failed';

/** A payment covers either specific item fractions or an equal split, never both. */
export type Payment = {
  /** Unique ID of the payment. */
  id: string;
  /** ID of the Bill this payment is for. */
  billId: string;
  /** Tip in cents. */
  tipAmount: number;
  /** Cents charged, including tip. total - tipAmount is the bill amount covered. */
  total: number;
  /** Where the payment is in its lifecycle. */
  status: PaymentStatus;
} & (
  | {
      /** Item fractions paid for. */
      lines: PaymentLine[];
      splitShare?: never;
    }
  | {
      /** Equal share of the whole bill paid for. */
      splitShare: SplitShare;
      lines?: never;
    }
);

/** Payment progress for one table, as servers see it. */
export type TableStatus = {
  /** Table number, e.g. 7. */
  tableNumber: number;
  /** Guests who have paid, e.g. 2 in "2 of 3 paid". */
  seatsPaid: number;
  /** Guests at the table, e.g. 3 in "2 of 3 paid". */
  seatsTotal: number;
  /** Cents still to pay on the bill. */
  amountRemaining: number;
};

/** A guest's rating of their server, left on the Done screen after paying. */
export type Rating = {
  /** Unique ID of the rating. */
  id: string;
  /** ID of the Bill that was paid. */
  billId: string;
  /** ID of the Payment the rating was left after. */
  paymentId: string;
  /** ID of the Staff member (the server) being rated. */
  staffId: string;
  /** Number of stars, 1 to 5. */
  stars: 1 | 2 | 3 | 4 | 5;
  /** Labels of the reason chips the guest picked (from Done.dc.html). */
  reasons: string[];
  /** When the rating was left. */
  createdAt: string;
};

/** Item fractions held for one guest while they pay, so nobody else can take them. */
export type ItemLock = {
  /** Unique ID of the lock. */
  id: string;
  /** ID of the Bill the items are on. */
  billId: string;
  /** Random ID stored in the guest's browser, since guests don't log in. */
  guestSessionId: string;
  /** Item fractions being held. */
  lines: PaymentLine[];
  /** When the lock runs out and the items are free again. */
  expiresAt: string;
};
