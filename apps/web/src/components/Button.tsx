import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';

type Variant = 'primary' | 'secondary' | 'outline' | 'accent';

const base =
  'flex h-14 w-full items-center rounded-button no-underline disabled:cursor-not-allowed disabled:opacity-40';

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-[17px] font-semibold text-surface',
  secondary: 'border-[1.5px] border-ink bg-transparent text-[16px] font-semibold text-ink',
  // "Google Pay" in Pay.dc.html.
  outline: 'border-[1.5px] border-ink bg-surface text-[17px] font-semibold text-ink',
  // "Pay by card" in Pay.dc.html.
  accent: 'border-[1.5px] border-ink bg-accent text-[17px] font-bold text-ink',
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
  /** Amount shown on the right in Space Mono, e.g. "Continue · $35.03". */
  trailing?: ReactNode;
};

type LinkButtonProps = CommonProps & { to: string; onClick?: () => void };
type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { to?: undefined };

export type ButtonProps = LinkButtonProps | NativeButtonProps;

export function Button({
  variant = 'primary',
  className = '',
  children,
  trailing,
  ...props
}: ButtonProps) {
  const layout = trailing === undefined ? 'justify-center' : 'justify-between px-5';
  const classes = `${base} ${layout} ${variants[variant]} ${className}`.trim();
  const content =
    trailing === undefined ? (
      children
    ) : (
      <>
        <span>{children}</span>
        <span className="font-mono">{trailing}</span>
      </>
    );

  if (props.to !== undefined) {
    return (
      <Link to={props.to} onClick={props.onClick} className={classes}>
        {content}
      </Link>
    );
  }

  const { type = 'button', ...rest } = props;
  return (
    <button type={type} className={`${classes} cursor-pointer`} {...rest}>
      {content}
    </button>
  );
}
