import { formatCents } from '../lib/money';

/** Paid / "Left to pay" tiles (Main.dc.html, GuestPaid.dc.html). */
export function BalanceTiles({
  paid,
  left,
  paidLabel,
}: {
  paid: number;
  left: number;
  paidLabel: string;
}) {
  return (
    <section className="grid grid-cols-2 gap-2.5" aria-label="Balance">
      <div className="flex flex-col gap-1.5 rounded-button border border-line bg-surface p-3.5">
        <span className="text-[12px] text-muted">{paidLabel}</span>
        <span className="font-mono text-[20px] font-bold">{formatCents(paid)}</span>
      </div>
      <div className="flex flex-col gap-1.5 rounded-button bg-accent p-3.5">
        <span className="text-[12px] text-ink">Left to pay</span>
        <span className="font-mono text-[20px] font-bold">{formatCents(left)}</span>
      </div>
    </section>
  );
}
