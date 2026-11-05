/** Outlined "TABLE 07" pill from the board header. */
export function TableTag({ number }: { number: number }) {
  return (
    <span className="rounded-[6px] border-[1.5px] border-ink px-2.5 py-1.5 font-mono text-[13px]">
      TABLE {String(number).padStart(2, '0')}
    </span>
  );
}
