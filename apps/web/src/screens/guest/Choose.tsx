import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { BottomBar } from '../../components/BottomBar';
import { Button } from '../../components/Button';
import { GuestHeader } from '../../components/GuestHeader';
import { ChecklistIcon, ChevronRightIcon, LockIcon } from '../../components/icons';
import { PhoneScreen } from '../../components/PhoneScreen';
import { ScreenTitle } from '../../components/ScreenTitle';
import { useGuest } from '../../context/guest';
import { amountLeft } from '../../lib/billing';
import { formatCents } from '../../lib/money';
import { guestPath } from '../../lib/paths';

/** 2 · How to pay (Choose.dc.html) */
export function Choose() {
  const { bill, tableToken, setMode } = useGuest();

  return (
    <PhoneScreen>
      <GuestHeader
        tableNumber={bill.tableNumber}
        backTo={guestPath(tableToken)}
        backLabel="Back to bill"
      />

      <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-5 pt-3 pb-5">
        <div className="mb-1.5 flex flex-col gap-1.5">
          <ScreenTitle>How do you want to pay?</ScreenTitle>
          <p className="m-0 text-[14px] text-muted">
            Total <span className="font-mono text-ink">{formatCents(bill.total)}</span> incl. HST
          </p>
        </div>

        <OptionCard
          to={guestPath(tableToken, 'split')}
          onClick={() => setMode('split')}
          icon={<span className="font-mono text-[16px] font-bold">÷</span>}
          title="Split equally"
          description="Everyone pays the same share of the total, tax included."
        />
        <OptionCard
          to={guestPath(tableToken, 'items')}
          onClick={() => setMode('items')}
          icon={<ChecklistIcon />}
          title="Pay for my items"
          description="Tick what you had. Share plates in halves, thirds or quarters."
        />

        <div className="flex items-start gap-2.5 rounded-xl bg-well px-3.5 py-3">
          <LockIcon className="mt-px shrink-0 text-ink-soft" />
          <p className="m-0 text-[13px] leading-[1.45] text-ink-soft">
            The first payment locks this choice for the whole table, so everyone splits the same
            way.
          </p>
        </div>
      </div>

      <BottomBar className="flex flex-col gap-2">
        <span className="text-center text-[12px] text-muted">Covering everyone?</span>
        <Button
          variant="secondary"
          to={guestPath(tableToken, 'tip')}
          onClick={() => setMode('whole')}
          trailing={formatCents(amountLeft(bill))}
        >
          Pay whole bill
        </Button>
      </BottomBar>
    </PhoneScreen>
  );
}

function OptionCard({
  to,
  onClick,
  icon,
  title,
  description,
}: {
  to: string;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-start gap-3.5 rounded-card border-[1.5px] border-ink bg-surface p-[18px] text-ink no-underline"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-accent">
        {icon}
      </span>
      <span className="flex flex-1 flex-col gap-1">
        <span className="text-[17px] font-semibold">{title}</span>
        <span className="text-[14px] leading-[1.4] text-muted">{description}</span>
      </span>
      <ChevronRightIcon className="mt-3 shrink-0" />
    </Link>
  );
}
