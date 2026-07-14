"use client";

import { useWorkspace } from "@/store/workspace";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AgentSelector } from "@/components/workspace/agent-selector";
import { SourceEditor } from "@/components/workspace/source-editor";
import { PrivacyPanel } from "@/components/workspace/privacy-panel";
import { CompileButton } from "@/components/workspace/compile-btn";
import { ResultShell } from "@/components/results/result-shell";

export default function WorkspacePage() {
  const store = useWorkspace();

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <h1 className="text-lg font-semibold text-slate-900">工作台</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => store.loadDemo()}>
            加载示例
          </Button>
          <Button variant="ghost" size="sm" onClick={() => store.reset()}>
            重置
          </Button>
        </div>
      </header>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left column - inputs */}
        <div className="flex w-1/2 flex-col gap-4 overflow-y-auto border-r border-slate-200 p-6">
          {/* Task title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">任务标题</label>
            <Textarea
              placeholder="例：为 SkyNotify 搭建用户管理 REST API"
              value={store.taskTitle}
              onChange={(e) => store.setTaskTitle(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Desired outcome */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">期望结果</label>
            <Textarea
              placeholder="下一个智能体 Agent 接手此上下文后应达成什么目标？"
              value={store.desiredOutcome}
              onChange={(e) => store.setDesiredOutcome(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Agent selector */}
          <AgentSelector />

          {/* Source editor */}
          <SourceEditor />

          {/* Privacy panel */}
          <PrivacyPanel />

          {/* Compile button */}
          <CompileButton />
        </div>

        {/* Right column - results */}
        <div className="w-1/2 overflow-y-auto p-6">
          <ResultShell />
        </div>
      </div>
    </div>
  );
}
