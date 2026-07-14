"use client";

import { Loader2, Package, RotateCcw, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/store/workspace";
import { ContextPackView } from "./context-pack-view";
import { PromptView } from "./prompt-view";
import { GraphView } from "./graph-view";
import { MindMapView } from "./mindmap-view";
import { RiskView } from "./risk-view";
import { ExportView } from "./export-view";

/* ------------------------------------------------------------------ */
/*  Empty / Loading / Error states                                     */
/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="rounded-full bg-slate-100 p-4">
        <Package className="h-8 w-8 text-slate-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-600">暂无结果</p>
        <p className="mt-1 text-xs text-slate-400">
          粘贴上下文后点击&ldquo;编译上下文&rdquo;按钮，生成结构化交接包。
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      <p className="text-sm font-medium text-slate-600">正在编译上下文...</p>
      <p className="text-xs text-slate-400">取决于提供程序，可能需要一些时间。</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="rounded-full bg-red-50 p-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700">编译失败</p>
        <p className="mt-1 text-xs text-red-600 max-w-md">{message}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.location.reload()}
      >
        <RotateCcw className="h-4 w-4" />
        重试
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Result Shell (main)                                                */
/* ------------------------------------------------------------------ */

export function ResultShell() {
  const result = useWorkspace((s) => s.result);
  const error = useWorkspace((s) => s.error);
  const compiling = useWorkspace((s) => s.compiling);
  const reset = useWorkspace((s) => s.reset);

  // Loading
  if (compiling) return <LoadingState />;

  // Error
  if (error) return <ErrorState message={error} />;

  // Empty
  if (!result) return <EmptyState />;

  const isDemo = result.mode === "demo";
  const pkg = result.data;

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-900">
            编译结果
          </h2>
          <Badge variant={isDemo ? "warning" : "success"}>
            {isDemo ? "示例模式" : "实时 AI"}
          </Badge>
          <span className="text-xs text-slate-400">
            {result.durationMs}ms &middot; {pkg.packageId.slice(0, 12)}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          重置
        </Button>
      </div>

      {/* Tabbed content */}
      <Tabs defaultValue="pack">
        <TabsList className="flex-wrap gap-y-1">
          <TabsTrigger value="pack">上下文包</TabsTrigger>
          <TabsTrigger value="prompt">智能体提示词</TabsTrigger>
          <TabsTrigger value="graph">决策图</TabsTrigger>
          <TabsTrigger value="mindmap">思维导图</TabsTrigger>
          <TabsTrigger value="risk">风险检查</TabsTrigger>
          <TabsTrigger value="export">导出</TabsTrigger>
        </TabsList>

        <TabsContent value="pack">
          <ContextPackView pkg={pkg} />
        </TabsContent>
        <TabsContent value="prompt">
          <PromptView pkg={pkg} />
        </TabsContent>
        <TabsContent value="graph">
          <GraphView pkg={pkg} />
        </TabsContent>
        <TabsContent value="mindmap">
          <MindMapView pkg={pkg} />
        </TabsContent>
        <TabsContent value="risk">
          <RiskView pkg={pkg} />
        </TabsContent>
        <TabsContent value="export">
          <ExportView pkg={pkg} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
