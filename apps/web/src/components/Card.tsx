import type { HTMLAttributes } from 'react';

/** White card with a line border (bill card in Main.dc.html). */
export function Card({ className = '', ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`rounded-card border border-line bg-surface px-4 py-1 ${className}`.trim()}
      {...rest}
    />
  );
}
