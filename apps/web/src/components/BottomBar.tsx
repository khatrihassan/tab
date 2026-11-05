import type { ReactNode } from 'react';

type BottomBarProps = {
  children: ReactNode;
  /** Staff screens use 12px top padding; guest screens use 14px. */
  compact?: boolean;
  className?: string;
};

/** Sticky footer with a top border (Main.dc.html, StaffTables.dc.html). */
export function BottomBar({ children, compact = false, className = '' }: BottomBarProps) {
  return (
    <div
      className={`sticky bottom-0 border-t border-line bg-bg px-5 pb-7 ${compact ? 'pt-3' : 'pt-3.5'} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
