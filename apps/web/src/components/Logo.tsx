import logoUrl from '../assets/tab-logo.png';

/** Header logo, cropped to match the board header (Main.dc.html). */
export function Logo() {
  return (
    <div className="h-[25px] w-[64px] overflow-hidden" role="img" aria-label="tab.">
      <img
        src={logoUrl}
        alt=""
        className="-mt-[9px] -ml-[13px] block h-auto w-[92px] mix-blend-multiply"
      />
    </div>
  );
}
