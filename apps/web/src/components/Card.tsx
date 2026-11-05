import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLElement> & {
  /** Padding classes. Defaults to the bill card's 4px 16px (Main.dc.html). */
  pad?: string;
};

/** White card with a line border. */
export function Card({ className = '', pad = 'px-4 py-1', ...rest }: CardProps) {
  return (
    <section
      className={`rounded-card border border-line bg-surface ${pad} ${className}`.trim()}
      {...rest}
    />
  );
}
