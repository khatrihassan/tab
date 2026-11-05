import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';

type Variant = 'primary' | 'secondary';

const base =
  'flex h-14 w-full items-center justify-center rounded-button font-semibold no-underline';

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-[17px] text-surface',
  secondary: 'border-[1.5px] border-ink bg-transparent text-[16px] text-ink',
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

type LinkButtonProps = CommonProps & { to: string };
type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { to?: undefined };

export type ButtonProps = LinkButtonProps | NativeButtonProps;

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`.trim();

  if (props.to !== undefined) {
    return (
      <Link to={props.to} className={classes}>
        {children}
      </Link>
    );
  }

  const { type = 'button', ...rest } = props;
  return (
    <button type={type} className={`${classes} cursor-pointer`} {...rest}>
      {children}
    </button>
  );
}
