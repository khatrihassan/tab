import { useState } from 'react';
import { Navigate } from 'react-router';
import { BottomBar } from '../../components/BottomBar';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { GuestHeader } from '../../components/GuestHeader';
import { MoneyRow } from '../../components/MoneyRow';
import { PhoneScreen } from '../../components/PhoneScreen';
import { ScreenTitle } from '../../components/ScreenTitle';
import { useGuest, useQuote, type TipPick } from '../../context/guest';
import { tipFor } from '../../lib/billing';
import { formatCents } from '../../lib/money';
import { guestPath, type GuestStep } from '../../lib/paths';
import type { SplitMode } from '../../lib/types';

const PERCENTS = [15, 18, 20];

/** Back goes to wherever the guest chose how to pay. */
const BACK_STEP: Record<SplitMode, GuestStep> = {
  whole: 'choose',
  split: 'split',
  items: 'items',
};

/** 4 · Tip (Tip.dc.html) */
export function Tip() {
  const { bill, tableToken, mode, tipPick, setTipPick, customTip, setCustomTip } = useGuest();
  const live = useQuote();
  const [customText, setCustomText] = useState((customTip / 100).toFixed(2));

  if (!mode || !live) return <Navigate to={guestPath(tableToken, 'choose')} replace />;
  const { quote, tip, total } = live;

  const options: { pick: TipPick; label: string; sub: string }[] = [
    ...PERCENTS.map((p) => ({
      pick: p,
      label: `${p}%`,
      sub: formatCents(tipFor(quote.preTax, p)),
    })),
    {
      pick: 'custom' as const,
      label: 'Custom',
      sub: tipPick === 'custom' ? formatCents(customTip) : 'Any amount',
    },
  ];

  function handleCustomChange(text: string) {
    setCustomText(text);
    const cents = Math.round(parseFloat(text || '0') * 100);
    setCustomTip(Number.isNaN(cents) ? 0 : Math.max(0, cents));
  }

  return (
    <PhoneScreen>
      <GuestHeader tableNumber={bill.tableNumber} backTo={guestPath(tableToken, BACK_STEP[mode])} />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-3 pb-5">
        <div className="flex flex-col gap-1.5">
          <ScreenTitle>Add a tip</ScreenTitle>
          <p className="m-0 text-[14px] text-muted">
            Your share is <span className="font-mono text-ink">{formatCents(quote.amount)}</span>{' '}
            with HST included.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="Tip amount">
          {options.map((o) => {
            const on = tipPick === o.pick;
            return (
              <button
                key={String(o.pick)}
                type="button"
                aria-pressed={on}
                onClick={() => setTipPick(o.pick)}
                className={`flex h-[88px] cursor-pointer flex-col items-center justify-center gap-1 rounded-button border-[1.5px] border-ink text-ink ${on ? 'bg-accent' : 'bg-surface'}`}
              >
                <span className="font-mono text-[22px] font-bold">{o.label}</span>
                <span className="text-[13px] text-ink-soft">{o.sub}</span>
              </button>
            );
          })}
        </div>

        {tipPick === 'custom' && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="custom-tip" className="text-[13px] font-semibold">
              Custom tip in dollars
            </label>
            <input
              id="custom-tip"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={customText}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="h-[52px] rounded-xl border-[1.5px] border-ink bg-surface px-3.5 font-mono text-[18px] text-ink"
            />
          </div>
        )}

        <p className="m-0 text-[12px] leading-[1.45] text-muted">
          Tip is worked out on your pre-tax amount ({formatCents(quote.preTax)}), then added on top.
        </p>

        <Card pad="px-4 py-3.5" className="flex flex-col gap-2" aria-label="Summary">
          <MoneyRow label="Your items" amountCents={quote.preTax} />
          <MoneyRow label="HST 13%" amountCents={quote.tax} />
          <MoneyRow label="Tip" amountCents={tip} />
          <MoneyRow label="You pay" amountCents={total} variant="total" />
        </Card>
      </div>

      <BottomBar>
        <Button to={guestPath(tableToken, 'pay')} trailing={formatCents(total)}>
          Go to payment
        </Button>
      </BottomBar>
    </PhoneScreen>
  );
}
