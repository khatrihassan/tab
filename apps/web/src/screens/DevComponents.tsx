import type { ReactNode } from 'react';
import { BottomBar } from '../components/BottomBar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { MoneyRow } from '../components/MoneyRow';
import { TableTag } from '../components/TableTag';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-[12px] text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

/** Dev-only gallery for comparing components against the boards. */
export function DevComponents() {
  return (
    <div className="mx-auto flex min-h-svh w-[390px] flex-col bg-bg">
      <div className="flex flex-1 flex-col gap-8 px-5 py-6">
        <Section title="Header (Logo + TableTag)">
          <header className="-mx-5 flex items-center justify-between px-5 pt-5 pb-3">
            <Logo />
            <TableTag number={7} />
          </header>
        </Section>

        <Section title="Button · primary">
          <Button>Pay bill</Button>
        </Section>

        <Section title="Button · secondary">
          <Button variant="secondary">Email me this receipt</Button>
        </Section>

        <Section title="Card + MoneyRow">
          <Card>
            <div className="flex flex-col gap-2 pt-3.5 pb-3">
              <MoneyRow label="Subtotal" amountCents={8500} />
              <MoneyRow label="HST 13%" amountCents={1105} />
              <MoneyRow label="Total" amountCents={9605} variant="total" />
            </div>
          </Card>
        </Section>

        <Section title="BottomBar · compact (staff)">
          <BottomBar compact className="static -mx-5">
            <Button>Open a table</Button>
          </BottomBar>
        </Section>
      </div>

      <BottomBar>
        <Button>Pay bill</Button>
      </BottomBar>
    </div>
  );
}
