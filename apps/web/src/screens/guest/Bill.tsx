import { BalanceTiles } from '../../components/BalanceTiles';
import { BottomBar } from '../../components/BottomBar';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { GuestHeader } from '../../components/GuestHeader';
import { MoneyRow } from '../../components/MoneyRow';
import { PhoneScreen } from '../../components/PhoneScreen';
import { ScreenTitle } from '../../components/ScreenTitle';
import { useGuest } from '../../context/guest';
import { amountLeft, lineTotal } from '../../lib/billing';
import { formatCents } from '../../lib/money';
import { guestPath } from '../../lib/paths';

/** 1 · Bill (Main.dc.html) */
export function Bill() {
  const { bill, tableToken } = useGuest();

  return (
    <PhoneScreen>
      <GuestHeader tableNumber={bill.tableNumber} />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-5">
        <div className="flex flex-col gap-1">
          <p className="m-0 text-[13px] tracking-[0.02em] text-muted">{bill.restaurantName}</p>
          <ScreenTitle>Your bill</ScreenTitle>
        </div>

        <Card aria-label="Items">
          {bill.items.map((item) => (
            <div
              key={item.id}
              className="flex items-baseline justify-between gap-3 border-b border-divider py-3.5"
            >
              <div className="flex items-baseline gap-2.5">
                <span className="min-w-[22px] font-mono text-[12px] text-muted">
                  {item.quantity}×
                </span>
                <span className="text-[15px] font-medium">{item.name}</span>
              </div>
              <span className="font-mono text-[14px]">{formatCents(lineTotal(item))}</span>
            </div>
          ))}
          <div className="flex flex-col gap-2 pt-3.5 pb-3">
            <MoneyRow label="Subtotal" amountCents={bill.subtotal} />
            <MoneyRow label="HST 13%" amountCents={bill.tax} />
            <MoneyRow label="Total" amountCents={bill.total} variant="total" />
          </div>
        </Card>

        <BalanceTiles paid={bill.amountPaid} left={amountLeft(bill)} paidLabel="Already paid" />

        <p className="m-0 text-center text-[12px] text-muted">
          No app, no account. Pay from this page.
        </p>
      </div>

      <BottomBar>
        <Button to={guestPath(tableToken, 'choose')}>Pay bill</Button>
      </BottomBar>
    </PhoneScreen>
  );
}
