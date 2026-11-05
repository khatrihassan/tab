import type { PaymentLine, SplitShare } from '@tab/shared';
import type { Fraction, GuestBill, GuestItem } from './types';

/**
 * Client-side estimates in integer cents. The server does the real rounding
 * when it charges; these keep the screens' live totals in step with the boards.
 */

/** Ontario HST, shown as "HST 13%". */
export const HST_RATE = 0.13;

export const lineTotal = (item: GuestItem) => item.unitPrice * item.quantity;

export const isItemPaid = (item: GuestItem) => item.paidAmount >= lineTotal(item);

/** Cents for a fraction of an item's line total, e.g. 1/2 of $16.00 = 800. */
export const fractionCents = (item: GuestItem, f: Fraction) =>
  Math.round((lineTotal(item) * f.numerator) / f.denominator);

export const taxOn = (cents: number) => Math.round(cents * HST_RATE);

export const amountLeft = (bill: GuestBill) => Math.max(0, bill.total - bill.amountPaid);

/** What one payment covers before the tip. */
export type Quote = {
  /** Pre-tax amount the tip is worked out on. */
  preTax: number;
  tax: number;
  /** preTax + tax. */
  amount: number;
} & ({ lines: PaymentLine[]; splitShare?: never } | { splitShare: SplitShare; lines?: never });

/** Paying for picked item fractions: HST on the sum, as in Items.dc.html. */
export function quoteItems(bill: GuestBill, fractions: Record<string, Fraction>): Quote {
  const lines: PaymentLine[] = [];
  let preTax = 0;
  for (const item of bill.items) {
    const f = fractions[item.id];
    if (!f || f.numerator <= 0) continue;
    lines.push({ itemId: item.id, numerator: f.numerator, denominator: f.denominator });
    preTax += fractionCents(item, f);
  }
  const tax = taxOn(preTax);
  return { preTax, tax, amount: preTax + tax, lines };
}

/** Paying for everything still unpaid: the remaining fraction of each line. */
export function quoteWhole(bill: GuestBill): Quote {
  const fractions: Record<string, Fraction> = {};
  for (const item of bill.items) {
    const left = lineTotal(item) - item.paidAmount;
    if (left > 0) fractions[item.id] = { numerator: left, denominator: lineTotal(item) };
  }
  return quoteItems(bill, fractions);
}

/** Equal split: every payer pays floor(total / n); the last payer covers leftover cents. */
export function splitAmounts(total: number, people: number) {
  const share = Math.floor(total / people);
  return { share, last: total - share * (people - 1) };
}

/** One share of an equal split. Tax is the share's proportional slice of the bill's tax. */
export function quoteSplit(bill: GuestBill, people: number): Quote {
  const amount = Math.min(splitAmounts(bill.total, people).share, amountLeft(bill));
  const preTax = Math.round((amount * bill.subtotal) / bill.total);
  return { preTax, tax: amount - preTax, amount, splitShare: { shares: 1, of: people } };
}

export const tipFor = (preTax: number, percent: number) => Math.round((preTax * percent) / 100);

/** Board glyphs for fractions of a single item. */
export const FRACTION_GLYPH: Record<number, string> = { 1: '1', 2: '½', 3: '⅓', 4: '¼' };
