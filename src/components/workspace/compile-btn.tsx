"use client";

import { useCallback } from "react";
import { Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/store/workspace";
import { applyRedactions } from "@/features/privacy/detectors";
import { INPUT_MIN_CHARS } from "@/lib/constants";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CompileButton() {
  const sourceText = useWorkspace((s) => s.sourceText);
  const findings = useWorkspace((s) => s.findings);
  const taskTitle = useWorkspace((s) => s.taskTitle);
  const desiredOutcome = useWorkspace((s) => s.desiredOutcome);
  const targetAgent = useWorkspace((s) => s.targetAgent);
  const privacyAcknowledged = useWorkspace((s) => s.privacyAcknowledged);
  const compiling = useWorkspace((s) => s.compiling);
  const setCompiling = useWorkspace((s) => s.setCompiling);
  const setResult = useWorkspace((s) => s.setResult);
  const setError = useWorkspace((s) => s.setError);

  const tooShort = sourceText.length < INPUT_MIN_CHARS;
  const hasPending = findings.some((f) => f.action === "pending");
  const needsAck = findings.length > 0 && !privacyAcknowledged;

  const disabled = tooShort || hasPending || needsAck || compiling || sourceText.length === 0;

  const handleCompile = useCallback(async () => {
    setCompiling(true);

    try {
      // Apply redactions to source text
      const processedText = applyRedactions(sourceText, findings);
      const hasRedactions = findings.some((f) => f.action === "redacted");

      const body = {
        task: {
          title: taskTitle || "未命名任务",
          desiredOutcome: desiredOutcome || "基于提供的上下文继续项目",
          targetAgent,
          outputLanguage: "zh-CN" as const,
        },
        source: {
          text: processedText,
          sourceName: "workspace-paste",
          sourceType: "mixed" as const,
        },
        privacy: {
          redacted: hasRedactions,
          acknowledgedFindingIds: findings
            .filter((f) => f.action === "redacted")
            .map((f) => f.id),
        },
        options: {
          detailLevel: "standard" as const,
          includeEvidence: true,
        },
      };

      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error?.message ?? `HTTP ${res.status}`);
      }

      setResult({
        requestId: json.requestId,
        mode: json.mode,
        durationMs: json.durationMs,
        data: json.data,
        repaired: json.meta?.repaired,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "编译失败");
    }
  }, [
    sourceText,
    findings,
    taskTitle,
    desiredOutcome,
    targetAgent,
    setCompiling,
    setResult,
    setError,
  ]);

  return (
    <Button
      variant="default"
      size="lg"
      disabled={disabled}
      onClick={handleCompile}
      className="w-full gap-2"
    >
      {compiling ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          编译中...
        </>
      ) : (
        <>
          <Zap className="h-5 w-5" />
          编译上下文
        </>
      )}
    </Button>
  );
}
