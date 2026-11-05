/** Guest flow URLs for a table token, e.g. guestPath('demo', 'tip') -> /t/demo/tip. */
export type GuestStep = 'choose' | 'split' | 'items' | 'tip' | 'pay' | 'done';

export const guestPath = (tableToken: string, step?: GuestStep) =>
  step ? `/t/${tableToken}/${step}` : `/t/${tableToken}`;
