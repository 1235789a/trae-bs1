import * as React from "react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/*  Variant map                                                        */
/* ------------------------------------------------------------------ */

const variantStyles = {
  default: "bg-slate-900 text-white",
  secondary: "bg-slate-100 text-slate-700",
  outline: "border border-slate-300 text-slate-700 bg-transparent",
  destructive: "bg-red-600 text-white",
  success: "bg-emerald-600 text-white",
  warning: "bg-amber-500 text-white",
} as const;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantStyles;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-none whitespace-nowrap",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
