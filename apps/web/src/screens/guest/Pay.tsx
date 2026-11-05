import { useState, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { BottomBar } from '../../components/BottomBar';
import { Button } from '../../components/Button';
import { GuestHeader } from '../../components/GuestHeader';
import { PhoneScreen } from '../../components/PhoneScreen';
import { useGuest, useQuote } from '../../context/guest';
import { pay } from '../../lib/api';
import { amountLeft } from '../../lib/billing';
import { formatCents } from '../../lib/money';
import { guestPath } from '../../lib/paths';
import type { PayMethod, PayPayload } from '../../lib/types';

const FIELD =
  'h-[52px] w-full rounded-xl border-[1.5px] border-field bg-surface px-3.5 text-[16px] text-ink';

/** 5 · Payment (Pay.dc.html) */
export function Pay() {
  const { bill, tableToken, mode, tipPick, recordPayment } = useGuest();
  const live = useQuote();
  const navigate = useNavigate();
  const [paying, setPaying] = useState<PayMethod | null>(null);

  if (!mode || !live) return <Navigate to={guestPath(tableToken, 'choose')} replace />;
  const { quote, tip, total } = live;

  async function handlePay(method: PayMethod) {
    if (!mode) return;
    setPaying(method);
    const payload: PayPayload = quote.splitShare
      ? { tipAmount: tip, splitShare: quote.splitShare }
      : { tipAmount: tip, lines: quote.lines };
    const payment = await pay(bill.id, payload);
    recordPayment({
      payment,
      quote,
      mode,
      tipPick,
      method,
      paidAt: new Date(),
      leftAfter: Math.max(0, amountLeft(bill) - quote.amount),
    });
    navigate(guestPath(tableToken, 'done'), { replace: true });
  }

  const busy = paying !== null;

  return (
    <PhoneScreen>
      <GuestHeader tableNumber={bill.tableNumber} backTo={guestPath(tableToken, 'tip')} />

      <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-5 pt-3 pb-5">
        <div className="flex items-end justify-between rounded-card bg-ink px-5 py-[18px] text-surface">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-on-ink-muted">You pay</span>
            <span className="font-mono text-[34px] font-bold text-accent">
              {formatCents(total)}
            </span>
          </div>
          <span className="text-right text-[12px] leading-normal text-on-ink-muted">
            {formatCents(quote.amount)} incl. HST
            <br />+ {formatCents(tip)} tip
          </span>
        </div>

        <Button
          onClick={() => handlePay('Apple Pay')}
          disabled={busy}
          aria-busy={paying === 'Apple Pay'}
        >
          Apple Pay
        </Button>
        <Button
          variant="outline"
          onClick={() => handlePay('Google Pay')}
          disabled={busy}
          aria-busy={paying === 'Google Pay'}
        >
          Google Pay
        </Button>

        <div className="flex items-center gap-3 text-[12px] text-muted">
          <span className="h-px flex-1 bg-rule" />
          <span>or pay by card</span>
          <span className="h-px flex-1 bg-rule" />
        </div>

        <form
          className="m-0 flex flex-col gap-3"
          aria-label="Card details"
          onSubmit={(e) => {
            e.preventDefault();
            handlePay('Card');
          }}
        >
          <Field id="cc-num" label="Card number">
            <input
              id="cc-num"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 1234 1234 1234"
              className={`${FIELD} font-mono`}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field id="cc-exp" label="Expiry">
              <input
                id="cc-exp"
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM / YY"
                className={`${FIELD} font-mono`}
              />
            </Field>
            <Field id="cc-cvc" label="CVC">
              <input
                id="cc-cvc"
                type="text"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
                className={`${FIELD} font-mono`}
              />
            </Field>
          </div>
          <Field
            id="cc-email"
            label={
              <>
                Email for receipt <span className="font-normal text-muted">(optional)</span>
              </>
            }
          >
            <input
              id="cc-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={FIELD}
            />
          </Field>
        </form>
      </div>

      <BottomBar className="flex flex-col gap-2">
        <Button
          variant="accent"
          onClick={() => handlePay('Card')}
          disabled={busy}
          aria-busy={paying === 'Card'}
          trailing={formatCents(total)}
        >
          Pay by card
        </Button>
        <span className="text-center text-[12px] text-muted">
          Secure payment · nothing is charged until you confirm
        </span>
      </BottomBar>
    </PhoneScreen>
  );
}

function Field({ id, label, children }: { id: string; label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}
