import type { Bill, Payment } from '@tab/shared';
import { createContext, useContext } from 'react';
import { quoteItems, quoteSplit, quoteWhole, tipFor, type Quote } from '../lib/billing';
import type { Fraction, PayMethod, SplitMode } from '../lib/types';

/** 15 / 18 / 20 % from Tip.dc.html, or a custom amount in cents. */
export type TipPick = number | 'custom';

/** A finished payment, kept for the receipt screen. */
export type PaymentRecord = {
  payment: Payment;
  quote: Quote;
  mode: SplitMode;
  tipPick: TipPick;
  method: PayMethod;
  paidAt: Date;
  /** Cents left on the bill after this payment. */
  leftAfter: number;
};

/** The guest's choices across the flow, plus the bill they apply to. */
export type GuestState = {
  tableToken: string;
  bill: Bill;
  mode: SplitMode | null;
  /** People splitting the bill equally (2 to 12). */
  people: number;
  /** Picked share of each item, keyed by item ID. */
  fractions: Record<string, Fraction>;
  tipPick: TipPick;
  /** Custom tip in cents. */
  customTip: number;
  lastPayment: PaymentRecord | null;

  setMode: (mode: SplitMode) => void;
  setPeople: (people: number) => void;
  setFraction: (itemId: string, fraction: Fraction | null) => void;
  setTipPick: (pick: TipPick) => void;
  setCustomTip: (cents: number) => void;
  recordPayment: (record: PaymentRecord) => void;
  /** Clears split mode, picks and tip once a payment is done. */
  resetChoices: () => void;
};

export const GuestContext = createContext<GuestState | null>(null);

export function useGuest(): GuestState {
  const ctx = useContext(GuestContext);
  if (!ctx) throw new Error('useGuest must be used inside <GuestProvider>');
  return ctx;
}

/** Live quote for the current choices, or null before a split mode is picked. */
export function useQuote(): { quote: Quote; tip: number; total: number } | null {
  const { bill, mode, people, fractions, tipPick, customTip } = useGuest();
  if (!mode) return null;
  const quote =
    mode === 'whole'
      ? quoteWhole(bill)
      : mode === 'split'
        ? quoteSplit(bill, people)
        : quoteItems(bill, fractions);
  const tip = tipPick === 'custom' ? customTip : tipFor(quote.preTax, tipPick);
  return { quote, tip, total: quote.amount + tip };
}
