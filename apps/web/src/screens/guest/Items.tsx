import type { Item } from '@tab/shared';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BottomBar } from '../../components/BottomBar';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { GuestHeader } from '../../components/GuestHeader';
import { ClockIcon, LockIcon } from '../../components/icons';
import { PhoneScreen } from '../../components/PhoneScreen';
import { ScreenTitle } from '../../components/ScreenTitle';
import { useGuest } from '../../context/guest';
import { lockItems } from '../../lib/api';
import {
  FRACTION_GLYPH,
  fractionCents,
  isItemPaid,
  lineTotal,
  quoteItems,
} from '../../lib/billing';
import { formatCents } from '../../lib/money';
import { guestPath } from '../../lib/paths';
import type { Fraction } from '../../lib/types';

const ROW = 'border-b border-divider py-3 last:border-b-0';
const TILE =
  'flex size-11 shrink-0 items-center justify-center rounded-[10px] border-[1.5px] border-ink font-mono text-[15px] font-bold';
const SQUARE_BUTTON =
  'h-11 cursor-pointer rounded-[10px] border-[1.5px] border-ink font-mono text-ink';

/** 3B · Pay for my items (Items.dc.html) */
export function Items() {
  const { bill, tableToken, fractions, setFraction, setMode } = useGuest();
  const navigate = useNavigate();
  const [locking, setLocking] = useState(false);
  const quote = quoteItems(bill, fractions);

  async function handleContinue() {
    if (!quote.lines) return;
    setLocking(true);
    setMode('items');
    await lockItems(bill.id, quote.lines);
    navigate(guestPath(tableToken, 'tip'));
  }

  return (
    <PhoneScreen>
      <GuestHeader tableNumber={bill.tableNumber} backTo={guestPath(tableToken, 'choose')} />

      <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-5 pt-2 pb-4">
        <div className="flex flex-col gap-1.5">
          <ScreenTitle>What did you have?</ScreenTitle>
          <p className="m-0 text-[14px] text-muted">
            Tick your items. Anything left stays on the bill for the others.
          </p>
        </div>

        <Card pad="px-3.5" aria-label="Bill items">
          {bill.items.map((item) =>
            isItemPaid(item) || item.takenBy ? (
              <TakenRow key={item.id} item={item} />
            ) : item.quantity > 1 ? (
              <QuantityRow
                key={item.id}
                item={item}
                count={fractions[item.id]?.numerator ?? 0}
                onChange={(n) => setFraction(item.id, { numerator: n, denominator: item.quantity })}
              />
            ) : (
              <FractionRow
                key={item.id}
                item={item}
                fraction={fractions[item.id]}
                onChange={(f) => setFraction(item.id, f)}
              />
            ),
          )}
        </Card>

        <div className="flex items-center gap-2 text-[12px] text-muted">
          <ClockIcon />
          <span>Your picks are held for 5 minutes while you pay.</span>
        </div>
      </div>

      <BottomBar compact className="flex flex-col gap-2.5">
        <div className="flex justify-between text-[13px] text-muted">
          <span>
            Items {formatCents(quote.preTax)} + HST {formatCents(quote.tax)}
          </span>
          <span className="font-mono font-bold text-ink">{formatCents(quote.amount)}</span>
        </div>
        <Button
          onClick={handleContinue}
          disabled={quote.amount === 0 || locking}
          aria-busy={locking}
          trailing={formatCents(quote.amount)}
        >
          Continue
        </Button>
      </BottomBar>
    </PhoneScreen>
  );
}

/** Paid for, or held by another guest. */
function TakenRow({ item }: { item: Item }) {
  return (
    <div className={`flex items-center gap-3 ${ROW}`}>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-well">
        <LockIcon className="text-muted" />
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-medium text-muted line-through">{item.name}</span>
        {item.takenBy && <span className="text-[12px] text-muted">Taken by {item.takenBy}</span>}
      </span>
      <span className="font-mono text-[14px] text-muted">{formatCents(lineTotal(item))}</span>
    </div>
  );
}

const FRACTION_OPTIONS = [
  { label: 'All', denominator: 1 },
  { label: '½', denominator: 2 },
  { label: '⅓', denominator: 3 },
  { label: '¼', denominator: 4 },
];

/** A single item: take all of it, or a half, third or quarter of a shared plate. */
function FractionRow({
  item,
  fraction,
  onChange,
}: {
  item: Item;
  fraction: Fraction | undefined;
  onChange: (f: Fraction | null) => void;
}) {
  const picked = fraction?.denominator ?? 0;
  return (
    <div className={`flex flex-col gap-2.5 ${ROW}`}>
      <div className="flex items-center gap-3">
        <span className={`${TILE} ${picked ? 'bg-accent' : 'bg-surface'}`}>
          {FRACTION_GLYPH[picked] ?? '—'}
        </span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="text-[15px] font-medium">{item.name}</span>
          <span className="text-[12px] text-muted">{formatCents(lineTotal(item))}</span>
        </span>
        <span className="font-mono text-[14px]">
          {formatCents(fraction ? fractionCents(item, fraction) : 0)}
        </span>
      </div>
      <div
        className="grid grid-cols-4 gap-1.5 pl-14"
        role="group"
        aria-label={`Your share of the ${item.name.toLowerCase()}`}
      >
        {FRACTION_OPTIONS.map((opt) => {
          const on = picked === opt.denominator;
          return (
            <button
              key={opt.denominator}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? null : { numerator: 1, denominator: opt.denominator })}
              className={`${SQUARE_BUTTON} text-[14px] font-bold ${on ? 'bg-accent' : 'bg-surface'}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Several of the same item, e.g. 3 House drinks: pick how many were yours. */
function QuantityRow({
  item,
  count,
  onChange,
}: {
  item: Item;
  count: number;
  onChange: (count: number) => void;
}) {
  const name = item.name.toLowerCase();
  return (
    <div className={`flex items-center gap-3 ${ROW}`}>
      <span className={`${TILE} ${count ? 'bg-accent' : 'bg-surface'}`}>{count}</span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-medium">{item.name}</span>
        <span className="text-[12px] text-muted">
          {count} of {item.quantity} · {formatCents(item.unitPrice)} each
        </span>
      </span>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, count - 1))}
          aria-label={`One fewer ${name}`}
          className={`${SQUARE_BUTTON} w-11 bg-surface text-[18px]`}
        >
          −
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.min(item.quantity, count + 1))}
          aria-label={`One more ${name}`}
          className={`${SQUARE_BUTTON} w-11 bg-surface text-[18px]`}
        >
          +
        </button>
      </div>
    </div>
  );
}
