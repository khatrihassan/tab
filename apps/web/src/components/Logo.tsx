import logoUrl from '../assets/tab-logo-trimmed.png';

/**
 * Header logo, sized to the board header's 64 x 25 box (Main.dc.html).
 * Uses a whitespace-trimmed copy of design/assets/tab-logo.png, so no crop is needed.
 */
export function Logo() {
  return (
    <div className="flex h-[25px] w-[64px] items-center" role="img" aria-label="tab.">
      <img src={logoUrl} alt="" className="block h-auto w-[64px] mix-blend-multiply" />
    </div>
  );
}
