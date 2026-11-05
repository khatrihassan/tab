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
 */

/** One line on a bill. */
export type Item = {
  /** Unique ID of this bill line. */
  id: string;
  /** Name shown to guests, e.g. "Burger". */
  name: string;
  /** Price of one unit in cents, before tax. */
  unitPrice: number;
  /** Number of units on the bill. */
  quantity: number;
  /** Cents paid so far. Fully paid when paidAmount >= unitPrice * quantity. */
  paidAmount: number;
};

/** A table's bill. */
export type Bill = {
  /** Unique ID of the bill. */
  id: string;
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
