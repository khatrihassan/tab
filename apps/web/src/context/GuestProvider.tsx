import type { Bill } from '@tab/shared';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Outlet, useParams } from 'react-router';
import { PhoneScreen } from '../components/PhoneScreen';
import { getBill } from '../lib/api';
import type { Fraction, SplitMode } from '../lib/types';
import { GuestContext, type GuestState, type PaymentRecord, type TipPick } from './guest';

/** Loads the table's bill and holds the guest's choices across screens. */
function GuestProvider({ tableToken, children }: { tableToken: string; children: ReactNode }) {
  const [bill, setBill] = useState<Bill | null>(null);
  const [mode, setMode] = useState<SplitMode | null>(null);
  const [people, setPeople] = useState(3);
  const [fractions, setFractions] = useState<Record<string, Fraction>>({});
  const [tipPick, setTipPick] = useState<TipPick>(18);
  const [customTip, setCustomTip] = useState(500);
  const [lastPayment, setLastPayment] = useState<PaymentRecord | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBill(tableToken).then((b) => {
      if (!cancelled) setBill(b);
    });
    return () => {
      cancelled = true;
    };
  }, [tableToken]);

  const setFraction = useCallback((itemId: string, fraction: Fraction | null) => {
    setFractions((prev) => {
      const next = { ...prev };
      if (fraction && fraction.numerator > 0) next[itemId] = fraction;
      else delete next[itemId];
      return next;
    });
  }, []);

  const recordPayment = useCallback(
    (record: PaymentRecord) => {
      setLastPayment(record);
      // Pick up the new balance for "Still to pay" and any rescan.
      getBill(tableToken).then(setBill);
    },
    [tableToken],
  );

  const resetChoices = useCallback(() => {
    setMode(null);
    setFractions({});
    setTipPick(18);
    setCustomTip(500);
  }, []);

  const value = useMemo<GuestState | null>(
    () =>
      bill && {
        tableToken,
        bill,
        mode,
        people,
        fractions,
        tipPick,
        customTip,
        lastPayment,
        setMode,
        setPeople,
        setFraction,
        setTipPick,
        setCustomTip,
        recordPayment,
        resetChoices,
      },
    [
      tableToken,
      bill,
      mode,
      people,
      fractions,
      tipPick,
      customTip,
      lastPayment,
      setFraction,
      recordPayment,
      resetChoices,
    ],
  );

  // No loading state on the boards: show the empty page background while the bill loads.
  if (!value) return <PhoneScreen aria-busy="true" />;

  return <GuestContext.Provider value={value}>{children}</GuestContext.Provider>;
}

/** Layout route for /t/:tableToken/*. Choices reset when the table token changes. */
export function GuestLayout() {
  const { tableToken = '' } = useParams();
  return (
    <GuestProvider key={tableToken} tableToken={tableToken}>
      <Outlet />
    </GuestProvider>
  );
}
