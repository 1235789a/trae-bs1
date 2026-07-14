"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/store/workspace";

export function Header() {
  const result = useWorkspace((s) => s.result);
  const isDemo = result?.mode === "demo";
  const hasResult = !!result;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 select-none">
          <Layers className="h-6 w-6 text-slate-900" />
          <span className="text-lg font-bold tracking-tight text-slate-900">
            ContextMirror
          </span>
        </Link>

        {/* Nav + mode badge */}
        <div className="flex items-center gap-4">
          <Link
            href="/workspace"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            工作台
          </Link>

          {hasResult && (
            <Badge variant={isDemo ? "warning" : "success"}>
              {isDemo ? "示例模式" : "实时 AI"}
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
}
