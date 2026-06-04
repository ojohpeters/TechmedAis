import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  withWordmark?: boolean;
  variant?: "light" | "dark" | "gradient";
}

/** Vector recreation of the TECHMED "TMS" shield monogram. */
export function Logo({ className, size = 40, withWordmark = false, variant = "gradient" }: LogoProps) {
  const fill =
    variant === "light" ? "#FFFFFF" : variant === "dark" ? "#0A1628" : "url(#tmLogoGrad)";
  const stroke = fill;
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="TECHMED"
        role="img"
      >
        <defs>
          <linearGradient id="tmLogoGrad" x1="120" y1="120" x2="392" y2="420" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#00D4FF" />
            <stop offset="1" stopColor="#0066CC" />
          </linearGradient>
        </defs>
        <path d="M256 60 L196 110 L256 96 L316 110 Z" fill={fill} />
        <path d="M96 150 L416 150 L372 186 L300 186 L256 150 L212 186 L140 186 Z" fill={fill} />
        <path d="M256 196 L406 232 L406 372 L256 452 L106 372 L106 232 Z" stroke={stroke} strokeWidth="18" fill="none" strokeLinejoin="round" />
        <path d="M150 236 L256 236 L256 270 L222 270 L222 372 L184 372 L184 270 L150 270 Z" fill={fill} />
        <path d="M232 252 L256 300 L280 252 L280 372 L256 372 L256 320 L256 372 L232 372 Z" fill={fill} />
        <path d="M362 248 L300 248 L300 300 L340 300 L340 320 L300 320 L300 360 L362 360 L362 336 L324 336 L324 326 L362 326 Z" fill={fill} />
      </svg>
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-lg font-extrabold tracking-tight">TECHMED</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Think Smart. Perform Elite.
          </span>
        </span>
      )}
    </span>
  );
}
