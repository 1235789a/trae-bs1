"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface TabsContextValue {
  value: string;
  onValueChange: (v: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("<TabsTrigger> / <TabsContent> must be used inside <Tabs>");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Tabs (root)                                                        */
/* ------------------------------------------------------------------ */

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue = "", value: controlledValue, onValueChange, className, children }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);

  const value = controlledValue ?? internalValue;
  const handleChange = React.useCallback(
    (v: string) => {
      setInternalValue(v);
      onValueChange?.(v);
    },
    [onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  TabsList                                                           */
/* ------------------------------------------------------------------ */

export interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TabsTrigger                                                        */
/* ------------------------------------------------------------------ */

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const { value: activeValue, onValueChange } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        "cursor-pointer select-none",
        isActive
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:text-slate-700",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  TabsContent                                                        */
/* ------------------------------------------------------------------ */

export interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const { value: activeValue } = useTabsContext();
  if (activeValue !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("mt-3 outline-none", className)}
    >
      {children}
    </div>
  );
}
