import { Link } from 'react-router';
import { ChevronLeftIcon } from './icons';
import { Logo } from './Logo';
import { TableTag } from './TableTag';

type GuestHeaderProps = {
  tableNumber: number;
  /** Where the back arrow goes. No arrow when omitted. */
  backTo?: string;
  backLabel?: string;
};

/** Guest screen header: optional back arrow, logo, TABLE 07 tag. */
export function GuestHeader({ tableNumber, backTo, backLabel = 'Back' }: GuestHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 pt-5 pb-3">
      {backTo !== undefined && (
        <Link
          to={backTo}
          aria-label={backLabel}
          className="-ml-2.5 flex size-11 items-center justify-center rounded-[10px]"
        >
          <ChevronLeftIcon />
        </Link>
      )}
      <Logo />
      <TableTag number={tableNumber} />
    </header>
  );
}
