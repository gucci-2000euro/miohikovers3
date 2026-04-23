interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 40, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size * 0.65}
      viewBox="0 0 100 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Hiko"
      data-testid="logo-hiko"
    >
      <ellipse
        cx="50"
        cy="32.5"
        rx="46"
        ry="28"
        stroke="#0ebc68"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M22 50 L32 18 L40 18 L36 32 L52 32 L56 18 L64 18 L54 50 L46 50 L50 38 L34 38 L30 50 Z"
        fill="#0ebc68"
      />
      <path
        d="M62 50 L70 18 L78 18 L74 32 L88 50 L78 50 L72 38 L70 50 Z"
        fill="#0ebc68"
      />
      <circle cx="80" cy="14" r="4" fill="#0ebc68" />
    </svg>
  );
}
