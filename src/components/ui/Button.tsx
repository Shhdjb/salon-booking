import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  children,
  className,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full";

  const variants = {
    primary:
      "bg-gradient-to-l from-salon-gold to-salon-gold-dark text-white hover:shadow-xl hover:shadow-salon-gold/30 focus:ring-salon-gold/50",
    secondary:
      "bg-salon-cream text-salon-brown-muted hover:bg-salon-cream-border focus:ring-salon-gold/30",
    outline:
      "border-2 border-salon-brown-muted text-salon-brown-muted hover:bg-salon-cream focus:ring-salon-gold/30",
    ghost: "text-salon-brown-muted hover:bg-salon-cream/50",
  };

  const sizes = {
    sm: "px-6 py-3 text-sm",
    md: "px-8 py-4 text-sm",
    lg: "px-10 py-5 text-base",
  };

  const classes = cn(baseStyles, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
