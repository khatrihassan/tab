import type { SVGProps } from 'react';

/** Stroke icons copied from the guest boards. Colour follows currentColor. */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 22, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="square"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const ChevronLeftIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Svg size={20} {...p}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg size={28} strokeWidth={3} {...p}>
    <path d="M5 12l5 5 9-10" />
  </Svg>
);

export const ChecklistIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7l2 2 3-3M12 8h8M4 15l2 2 3-3M12 16h8" />
  </Svg>
);

export const LockIcon = (p: IconProps) => (
  <Svg size={18} strokeLinecap="butt" {...p}>
    <rect x="5" y="11" width="14" height="10" rx="1" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Svg>
);

export const ClockIcon = (p: IconProps) => (
  <Svg size={16} strokeLinecap="butt" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const StarIcon = ({ filled, ...p }: IconProps & { filled: boolean }) => (
  <Svg
    size={26}
    strokeWidth={1.8}
    strokeLinecap="butt"
    strokeLinejoin="round"
    fill={filled ? 'currentColor' : 'none'}
    {...p}
  >
    <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z" />
  </Svg>
);
