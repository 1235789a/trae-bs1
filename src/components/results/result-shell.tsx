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
        <p className="text-sm font-medium text-slate-600">No results yet</p>
        <p className="mt-1 text-xs text-slate-400">
          Paste your context and click &ldquo;Compile Context&rdquo; to generate a structured handoff package.
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      <p className="text-sm font-medium text-slate-600">Compiling context...</p>
      <p className="text-xs text-slate-400">This may take a moment depending on the provider.</p>
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
        <p className="text-sm font-medium text-slate-700">Compilation failed</p>
        <p className="mt-1 text-xs text-red-600 max-w-md">{message}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.location.reload()}
      >
        <RotateCcw className="h-4 w-4" />
        Retry
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
            Compilation Result
          </h2>
          <Badge variant={isDemo ? "warning" : "success"}>
            {isDemo ? "DEMO MODE" : "LIVE"}
          </Badge>
          <span className="text-xs text-slate-400">
            {result.durationMs}ms &middot; {pkg.packageId.slice(0, 12)}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* Tabbed content */}
      <Tabs defaultValue="pack">
        <TabsList className="flex-wrap gap-y-1">
          <TabsTrigger value="pack">Context Pack</TabsTrigger>
          <TabsTrigger value="prompt">Agent Prompt</TabsTrigger>
          <TabsTrigger value="graph">Decision Graph</TabsTrigger>
          <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
          <TabsTrigger value="risk">Risk Check</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
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
