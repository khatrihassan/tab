import type { HTMLAttributes } from 'react';

/** Full-height phone column (boards are 390 x 844): header, scrolling body, bottom bar. */
export function PhoneScreen({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`mx-auto flex h-svh w-full max-w-[390px] flex-col bg-bg text-ink ${className}`.trim()}
      {...rest}
    />
  );
}
