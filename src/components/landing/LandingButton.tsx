import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type LandingButtonVariant = "primary" | "outline";
type LandingButtonSize = "xs" | "sm" | "md" | "lg";

type LandingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: LandingButtonVariant;
  size?: LandingButtonSize;
  to?: string;
  href?: string;
  className?: string;
};

function join(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const base =
  "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60";
const variants: Record<LandingButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/30",
  outline:
    "bg-white/70 text-slate-900 border border-slate-200/80 hover:bg-white dark:bg-slate-900/50 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800/70",
};
const sizes: Record<LandingButtonSize, string> = {
  xs: "h-8 px-3 text-xs",
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-11 px-8 text-base",
};

export function LandingButton({
  children,
  variant = "primary",
  size = "md",
  to,
  href,
  className,
  ...props
}: LandingButtonProps) {
  const cls = join(base, variants[variant], sizes[size], className);

  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}

