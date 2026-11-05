import type { Payment, PaymentLine } from '@tab/shared';
import { mockBills } from '../mocks/bills';
import { amountLeft, fractionCents, lineTotal, quoteItems, splitAmounts } from './billing';
import type { GuestBill, PayPayload } from './types';

/**
 * Data access for the guest flow. Until the API is live this serves mock data
 * from src/mocks after a short delay. Mock bills live in memory, so payments
 * update the balance until the page is reloaded.
 */

const LOAD_DELAY_MS = 600;
const PAY_DELAY_MS = 1000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const store: Record<string, GuestBill> = structuredClone(mockBills);

const findById = (billId: string) => {
  const bill = Object.values(store).find((b) => b.id === billId);
  if (!bill) throw new Error(`Bill ${billId} not found`);
  return bill;
};

export async function getBill(tableToken: string): Promise<GuestBill> {
  await wait(LOAD_DELAY_MS);
  const bill = store[tableToken];
  if (!bill) throw new Error(`No bill for table ${tableToken}`);
  return structuredClone(bill);
}

/** Holds the picked item fractions for 5 minutes while the guest pays. */
export async function lockItems(
  billId: string,
  lines: PaymentLine[],
): Promise<{ billId: string; lines: PaymentLine[]; expiresAt: string }> {
  await wait(LOAD_DELAY_MS);
  findById(billId);
  return { billId, lines, expiresAt: new Date(Date.now() + 5 * 60_000).toISOString() };
}

/** Always succeeds after 1 second in mock mode. */
export async function pay(billId: string, payload: PayPayload): Promise<Payment> {
  await wait(PAY_DELAY_MS);
  const bill = findById(billId);

  let amount: number;
  if (payload.splitShare) {
    const { share } = splitAmounts(bill.total, payload.splitShare.of);
    amount = Math.min(share * payload.splitShare.shares, amountLeft(bill));
  } else {
    const fractions = Object.fromEntries(payload.lines.map((l) => [l.itemId, l]));
    amount = Math.min(quoteItems(bill, fractions).amount, amountLeft(bill));
    for (const line of payload.lines) {
      const item = bill.items.find((i) => i.id === line.itemId);
      if (item) {
        item.paidAmount = Math.min(lineTotal(item), item.paidAmount + fractionCents(item, line));
      }
    }
  }
  bill.amountPaid += amount;

  const base = {
    id: `pay-${Date.now()}`,
    billId,
    tipAmount: payload.tipAmount,
    total: amount + payload.tipAmount,
    status: 'succeeded' as const,
  };
  return payload.splitShare
    ? { ...base, splitShare: payload.splitShare }
    : { ...base, lines: payload.lines };
}
