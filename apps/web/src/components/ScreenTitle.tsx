import type { ReactNode } from 'react';

/** 28px bold screen heading used on every guest board. */
export function ScreenTitle({ children }: { children: ReactNode }) {
  return <h1 className="m-0 text-[28px] font-bold tracking-[-0.02em]">{children}</h1>;
}
