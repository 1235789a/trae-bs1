import * as React from "react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/*  Variant / size maps                                               */
/* ------------------------------------------------------------------ */

const variantStyles = {
  default: "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300",
  outline: "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 active:bg-slate-100",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200",
  destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
} as const;

const sizeStyles = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
} as const;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "cursor-pointer select-none",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
