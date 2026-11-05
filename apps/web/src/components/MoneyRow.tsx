import type { ReactNode } from 'react';
import { formatCents } from '../lib/money';

type MoneyRowProps = {
  label: ReactNode;
  amountCents: number;
  variant?: 'default' | 'total';
};

const variants = {
  default: 'text-[14px] text-muted',
  total: 'border-t-[1.5px] border-dashed border-ink pt-2 text-[17px] font-bold',
};

/** Label on the left, Space Mono amount on the right (Subtotal / HST / Total in Main.dc.html). */
export function MoneyRow({ label, amountCents, variant = 'default' }: MoneyRowProps) {
  return (
    <div className={`flex justify-between ${variants[variant]}`}>
      <span>{label}</span>
      <span className="font-mono">{formatCents(amountCents)}</span>
    </div>
  );
}
