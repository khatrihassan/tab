const formatter = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });

/** Format integer cents for display, e.g. 9605 -> "$96.05". */
export function formatCents(cents: number): string {
  return formatter.format(cents / 100);
}
