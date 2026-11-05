import { BottomBar } from '../../components/BottomBar';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { GuestHeader } from '../../components/GuestHeader';
import { PhoneScreen } from '../../components/PhoneScreen';
import { ScreenTitle } from '../../components/ScreenTitle';
import { useGuest } from '../../context/guest';
import { splitAmounts } from '../../lib/billing';
import { formatCents } from '../../lib/money';
import { guestPath } from '../../lib/paths';

const MIN_PEOPLE = 2;
const MAX_PEOPLE = 12;
const RING_R = 84;
const RING_C = 2 * Math.PI * RING_R;

/** 3A · Split equally (SplitEqual.dc.html) */
export function SplitEqual() {
  const { bill, tableToken, people, setPeople, setMode } = useGuest();
  const { share, last } = splitAmounts(bill.total, people);
  const total = formatCents(bill.total);
  const shareText = formatCents(share);

  return (
    <PhoneScreen>
      <GuestHeader tableNumber={bill.tableNumber} backTo={guestPath(tableToken, 'choose')} />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-3 pb-5">
        <div className="flex flex-col gap-1.5">
          <ScreenTitle>Split equally</ScreenTitle>
          <p className="m-0 text-[14px] text-muted">How many people are paying?</p>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-[20px] bg-ink px-5 py-6 text-surface">
          <div className="relative size-[200px]">
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              role="img"
              aria-label={`Your share is 1 of ${people} parts of ${total}`}
              className="block -rotate-90"
            >
              <circle
                cx="100"
                cy="100"
                r={RING_R}
                fill="none"
                strokeWidth="16"
                className="stroke-ink-soft"
              />
              <circle
                cx="100"
                cy="100"
                r={RING_R}
                fill="none"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${(RING_C / people).toFixed(1)} ${RING_C.toFixed(1)}`}
                className="stroke-accent transition-[stroke-dasharray] duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="font-mono text-[26px] font-bold">{total}</span>
              <span className="text-[13px] text-on-ink-muted">To share</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-[13px] text-on-ink-muted">Total guests at the table</span>
            <div className="flex items-center gap-1 rounded-full bg-surface p-1">
              <button
                type="button"
                onClick={() => setPeople(Math.max(MIN_PEOPLE, people - 1))}
                aria-label="Fewer people"
                className="size-11 cursor-pointer rounded-full border-none bg-surface font-mono text-[22px] text-ink"
              >
                −
              </button>
              <span className="min-w-9 text-center font-mono text-[20px] font-bold text-ink">
                {people}
              </span>
              <button
                type="button"
                onClick={() => setPeople(Math.min(MAX_PEOPLE, people + 1))}
                aria-label="More people"
                className="size-11 cursor-pointer rounded-full border-none bg-accent font-mono text-[22px] text-ink"
              >
                +
              </button>
            </div>
            <span className="text-[13px] text-on-ink-muted">people</span>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[13px] text-on-ink-muted">Your share</span>
            <span className="font-mono text-[38px] font-bold text-accent">{shareText}</span>
          </div>
        </div>

        <Card aria-label="Shares">
          {Array.from({ length: people - 1 }, (_, i) => (
            <ShareRow key={i} label={`Payer ${i + 1}`} amount={share} />
          ))}
          <ShareRow label="Last payer" amount={last} />
          <p className="m-0 py-3 text-[12px] leading-[1.45] text-muted">
            Whoever pays last covers the leftover cents, so the bill lands on exactly $0.00.
          </p>
        </Card>

        <p className="m-0 text-[13px] leading-[1.45] text-muted">
          You're setting the split for Table {bill.tableNumber}. Anyone else who scans will see
          “Split {people} ways: your share is {shareText}”.
        </p>
      </div>

      <BottomBar>
        <Button
          to={guestPath(tableToken, 'tip')}
          onClick={() => setMode('split')}
          trailing={shareText}
        >
          Continue
        </Button>
      </BottomBar>
    </PhoneScreen>
  );
}

function ShareRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between border-b border-divider py-3 text-[14px]">
      <span className="text-ink-soft">{label}</span>
      <span className="font-mono">{formatCents(amount)}</span>
    </div>
  );
}
