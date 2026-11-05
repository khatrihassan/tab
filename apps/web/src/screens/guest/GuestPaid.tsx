import { BalanceTiles } from '../../components/BalanceTiles';
import { GuestHeader } from '../../components/GuestHeader';
import { CheckIcon } from '../../components/icons';
import { PhoneScreen } from '../../components/PhoneScreen';
import { ScreenTitle } from '../../components/ScreenTitle';
import { useGuest } from '../../context/guest';

/** 7 · Scanned after it's paid (GuestPaid.dc.html). Shown at /t/:tableToken when nothing is left. */
export function GuestPaid() {
  const { bill } = useGuest();

  return (
    <PhoneScreen>
      <GuestHeader tableNumber={bill.tableNumber} />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-12 pb-5">
        <span className="flex size-14 items-center justify-center rounded-button bg-ink">
          <CheckIcon className="text-accent" />
        </span>
        <div className="flex flex-col gap-2">
          <p className="m-0 text-[13px] tracking-[0.02em] text-muted">{bill.restaurantName}</p>
          <ScreenTitle>This bill is fully paid</ScreenTitle>
          <p className="m-0 text-[15px] leading-normal text-ink-soft">
            There's nothing left to pay at Table {bill.tableNumber}. If you just sat down, your
            server will start a new bill when you order.
          </p>
        </div>

        <BalanceTiles paid={bill.amountPaid} left={0} paidLabel="Paid" />
      </div>
    </PhoneScreen>
  );
}
