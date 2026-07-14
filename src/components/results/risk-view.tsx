"use client";

import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CanonicalContextPackage } from "@/schemas/context-package.schema";

/* ------------------------------------------------------------------ */
/*  Readiness progress bar                                             */
/* ------------------------------------------------------------------ */

function ReadinessScore({ score, level, explanation }: CanonicalContextPackage["readiness"]) {
  const barColor =
    score >= 80
      ? "bg-emerald-500"
      : score >= 50
        ? "bg-amber-500"
        : "bg-red-500";

  const levelColor: Record<string, "success" | "warning" | "destructive"> = {
    ready: "success",
    needs_clarification: "warning",
    blocked: "destructive",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-slate-600" />
            交接完整度
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              {score}
            </span>
            <span className="text-xs text-slate-500">/ 100</span>
            <Badge variant={levelColor[level] ?? "secondary"} className="ml-1">
              {level === "ready" ? "就绪" : level === "needs_clarification" ? "需澄清" : "受阻"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {/* Progress bar */}
        <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", barColor)}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{explanation}</p>

        {score >= 80 && (
          <div className="flex items-center gap-2 text-xs text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            上下文已就绪，可以进行 Agent 交接。
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Privacy findings section                                           */
/* ------------------------------------------------------------------ */

function PrivacyFindingsSection({ findings }: { findings: CanonicalContextPackage["privacyReport"]["findings"] }) {
  if (findings.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-sm text-slate-600">未检测到隐私问题。</span>
        </CardContent>
      </Card>
    );
  }

  const severityColor: Record<string, "warning" | "destructive"> = {
    low: "warning",
    medium: "warning",
    high: "destructive",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-600" />
          隐私发现
          <Badge variant="destructive" className="text-[10px] ml-1">
            {findings.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {findings.map((f) => (
          <div
            key={f.id}
            className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs"
          >
            <Badge variant={severityColor[f.severity] ?? "warning"} className="shrink-0">
              {f.severity === "high" ? "高" : f.severity === "medium" ? "中" : "低"}
            </Badge>
            <span className="font-mono text-slate-600 truncate flex-1">
              {f.maskedPreview}
            </span>
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {f.action}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Quality risks section                                              */
/* ------------------------------------------------------------------ */

function QualityRisksSection({ risks }: { risks: CanonicalContextPackage["risks"] }) {
  if (risks.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-sm text-slate-600">未发现质量风险。</span>
        </CardContent>
      </Card>
    );
  }

  const severityColor: Record<string, "warning" | "destructive"> = {
    low: "warning",
    medium: "warning",
    high: "destructive",
  };

  const severityBorder: Record<string, string> = {
    low: "border-slate-200",
    medium: "border-amber-200",
    high: "border-red-200",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          质量风险
          <Badge variant="secondary" className="text-[10px] ml-1">
            {risks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {risks.map((r) => (
          <div
            key={r.id}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-xs",
              severityBorder[r.severity] ?? "border-slate-200",
            )}
          >
            <div className="flex items-start gap-2">
              <Badge variant={severityColor[r.severity] ?? "warning"} className="mt-0.5 shrink-0">
                {r.severity === "high" ? "高" : r.severity === "medium" ? "中" : "低"}
              </Badge>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="font-medium text-slate-800">{r.title}</span>
                <p className="text-slate-600 leading-relaxed">{r.content}</p>
                {r.mitigation && (
                  <div className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">
                    <span className="font-medium">缓解措施: </span>
                    {r.mitigation}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main view                                                          */
/* ------------------------------------------------------------------ */

export interface RiskViewProps {
  pkg: CanonicalContextPackage;
}

export function RiskView({ pkg }: RiskViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <ReadinessScore {...pkg.readiness} />
      <PrivacyFindingsSection findings={pkg.privacyReport.findings} />
      <QualityRisksSection risks={pkg.risks} />
    </div>
  );
}
