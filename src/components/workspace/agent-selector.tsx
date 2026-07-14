"use client";

import { Code, PenLine, Lightbulb, Search, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { useWorkspace } from "@/store/workspace";
import { AGENT_OPTIONS } from "@/lib/constants";

/* ------------------------------------------------------------------ */
/*  Icon map for each agent type                                       */
/* ------------------------------------------------------------------ */

const AGENT_ICONS: Record<string, React.ElementType> = {
  coding: Code,
  writing: PenLine,
  product: Lightbulb,
  research: Search,
  general: User,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AgentSelector() {
  const targetAgent = useWorkspace((s) => s.targetAgent);
  const setTargetAgent = useWorkspace((s) => s.setTargetAgent);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">
        目标智能体
      </label>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {AGENT_OPTIONS.map((opt) => {
          const Icon = AGENT_ICONS[opt.value] ?? User;
          const active = targetAgent === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTargetAgent(opt.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all",
                "cursor-pointer select-none",
                active
                  ? "border-slate-900 bg-slate-50 text-slate-900"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6",
                  active ? "text-slate-900" : "text-slate-400",
                )}
              />
              <span className="text-xs font-semibold">{opt.label}</span>
              <span className="text-[10px] leading-tight text-slate-500 text-center line-clamp-2">
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
