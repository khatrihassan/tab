import type { Bill } from '@tab/shared';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { BottomBar } from '../../components/BottomBar';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { GuestHeader } from '../../components/GuestHeader';
import { CheckIcon, StarIcon } from '../../components/icons';
import { PhoneScreen } from '../../components/PhoneScreen';
import { ScreenTitle } from '../../components/ScreenTitle';
import { useGuest, type PaymentRecord } from '../../context/guest';
import { FRACTION_GLYPH, fractionCents } from '../../lib/billing';
import { formatCents } from '../../lib/money';
import { guestPath } from '../../lib/paths';

const GOOD_REASONS = ['Friendly', 'Attentive', 'Quick', 'Knew the menu'];
const BAD_REASONS = ['Slow', 'Hard to flag down', 'Order mix-up', 'Not friendly'];

/** 6 · Receipt & rating (Done.dc.html) */
export function Done() {
  const { bill, tableToken, lastPayment, resetChoices } = useGuest();

  // The payment is recorded; clear choices so a rescan starts fresh.
  useEffect(resetChoices, [resetChoices]);

  if (!lastPayment) return <Navigate to={guestPath(tableToken)} replace />;
  const { payment, quote, tipPick, method, paidAt, leftAfter } = lastPayment;

  return (
    <PhoneScreen>
      <GuestHeader tableNumber={bill.tableNumber} />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-5">
        <div className="flex flex-col items-start gap-2.5">
          <span className="flex size-14 items-center justify-center rounded-button border-[1.5px] border-ink bg-accent">
            <CheckIcon />
          </span>
          <ScreenTitle>You're all set</ScreenTitle>
          <p className="m-0 text-[14px] text-muted">
            Paid <span className="font-mono text-ink">{formatCents(payment.total)}</span>. Your
            server has been told. You're free to go.
          </p>
        </div>

        <Card pad="p-4" className="flex flex-col gap-2 text-[14px]" aria-label="Receipt">
          <div className="flex justify-between border-b-[1.5px] border-dashed border-ink pb-1.5 font-mono text-[12px] text-muted">
            <span>RECEIPT</span>
            <span>{formatReceiptTime(paidAt)}</span>
          </div>
          {receiptLines(bill, lastPayment).map((line) => (
            <div key={line.key} className="flex justify-between">
              <span>{line.label}</span>
              <span className="font-mono">{formatCents(line.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-divider pt-1.5 text-muted">
            <span>Subtotal</span>
            <span className="font-mono">{formatCents(quote.preTax)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>HST 13%</span>
            <span className="font-mono">{formatCents(quote.tax)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>{tipPick === 'custom' ? 'Tip' : `Tip ${tipPick}%`}</span>
            <span className="font-mono">{formatCents(payment.tipAmount)}</span>
          </div>
          <div className="flex justify-between border-t-[1.5px] border-dashed border-ink pt-2 text-[16px] font-bold">
            <span>Paid · {method}</span>
            <span className="font-mono">{formatCents(payment.total)}</span>
          </div>
        </Card>

        <div className="flex items-center justify-between rounded-xl bg-well px-3.5 py-3 text-[13px] text-ink-soft">
          <span>Still to pay at Table {bill.tableNumber}</span>
          <span className="font-mono text-ink">{formatCents(leftAfter)}</span>
        </div>

        <Rating />
      </div>

      <BottomBar>
        <Button variant="secondary">Email me this receipt</Button>
      </BottomBar>
    </PhoneScreen>
  );
}

/** Optional star rating with reason chips. Kept on the page only for now. */
function Rating() {
  const [rating, setRating] = useState(0);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const good = rating >= 4;
  const prompt = good ? 'What stood out?' : 'What could be better?';

  return (
    <section className="flex flex-col gap-2.5" aria-label="Rate your service">
      <span className="text-[15px] font-semibold">
        How was your service? <span className="font-normal text-muted">(optional)</span>
      </span>
      <div className="flex gap-2" role="group" aria-label="Rating, 1 to 5 stars">
        {[1, 2, 3, 4, 5].map((n) => {
          const on = n <= rating;
          return (
            <button
              key={n}
              type="button"
              aria-label={n === 1 ? '1 star' : `${n} stars`}
              aria-pressed={on}
              onClick={() => {
                setRating(rating === n ? 0 : n);
                setPicked({});
              }}
              className={`flex size-14 cursor-pointer items-center justify-center rounded-xl border-[1.5px] border-ink p-0 text-ink ${on ? 'bg-accent' : 'bg-surface'}`}
            >
              <StarIcon filled={on} />
            </button>
          );
        })}
      </div>
      {rating > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className="text-[14px] font-semibold">{prompt}</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label={prompt}>
            {(good ? GOOD_REASONS : BAD_REASONS).map((label) => (
              <button
                key={label}
                type="button"
                aria-pressed={!!picked[label]}
                onClick={() => setPicked({ ...picked, [label]: !picked[label] })}
                className={`h-11 cursor-pointer rounded-[10px] border-[1.5px] border-ink px-3.5 text-[14px] font-medium text-ink ${picked[label] ? 'bg-accent' : 'bg-surface'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-[13px] text-ink-soft">Thanks, we've passed that on.</span>
        </div>
      )}
    </section>
  );
}

type ReceiptLine = { key: string; label: string; amount: number };

/** "Burger", "½ Nachos", "House drink ×1"; or one "Split 1 of 3" / "Whole bill" line. */
function receiptLines(bill: Bill, record: PaymentRecord): ReceiptLine[] {
  const { quote, mode } = record;
  if (mode === 'whole') return [{ key: 'whole', label: 'Whole bill', amount: quote.preTax }];
  if (quote.splitShare) {
    const { shares, of } = quote.splitShare;
    return [{ key: 'split', label: `Split ${shares} of ${of}`, amount: quote.preTax }];
  }
  return quote.lines.flatMap((line) => {
    const item = bill.items.find((i) => i.id === line.itemId);
    if (!item) return [];
    const label =
      item.quantity > 1
        ? `${item.name} ×${line.numerator}`
        : line.denominator === 1
          ? item.name
          : `${FRACTION_GLYPH[line.denominator]} ${item.name}`;
    return [{ key: item.id, label, amount: fractionCents(item, line) }];
  });
}

/** e.g. "NOV 5 · 7:42 PM" */
function formatReceiptTime(date: Date) {
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${month} ${date.getDate()} · ${time}`;
}
