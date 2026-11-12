import type { PaymentLine, SplitShare } from '@tab/shared';

/** A guest's share of one item's line total, e.g. 1/3 of the drinks line. */
export type Fraction = Pick<PaymentLine, 'numerator' | 'denominator'>;

/** What a guest is paying for: item fractions, or an equal split of the bill. */
export type PayPayload = { tipAmount: number } & (
  { lines: PaymentLine[]; splitShare?: never } | { splitShare: SplitShare; lines?: never }
);

/** How the guest chose to pay on the How to pay screen. */
export type SplitMode = 'whole' | 'split' | 'items';

/** Wallet or card, shown on the receipt as "Paid · Apple Pay". */
export type PayMethod = 'Apple Pay' | 'Google Pay' | 'Card';
