"use client";

import {
  CheckCircle2, CircleDot, AlertCircle, HelpCircle,
  XCircle, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CanonicalContextPackage, ItemStatus } from "@/schemas/context-package.schema";

/* ------------------------------------------------------------------ */
/*  Status icon helper                                                 */
/* ------------------------------------------------------------------ */

const STATUS_ICON: Record<ItemStatus, React.ElementType> = {
  confirmed: CheckCircle2,
  inferred: CircleDot,
  conflicted: AlertCircle,
  unknown: HelpCircle,
};

const STATUS_COLOR: Record<ItemStatus, string> = {
  confirmed: "text-emerald-600",
  inferred: "text-blue-500",
  conflicted: "text-amber-600",
  unknown: "text-slate-400",
};

/* ------------------------------------------------------------------ */
/*  Confidence bar                                                     */
/* ------------------------------------------------------------------ */

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const barColor =
    pct >= 80
      ? "bg-emerald-500"
      : pct >= 50
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-500 tabular-nums">{pct}%</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section renderer                                                   */
/* ------------------------------------------------------------------ */

interface Item {
  id: string;
  title: string;
  content: string;
  status: ItemStatus;
  confidence: number;
  evidenceRefs: string[];
}

function renderItemCard(item: Item) {
  const Icon = STATUS_ICON[item.status];
  return (
    <Card key={item.id}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", STATUS_COLOR[item.status])} />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <CardTitle className="text-slate-800">{item.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {item.status}
              </Badge>
              <ConfidenceBar value={item.confidence} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 leading-relaxed">{item.content}</p>
        {item.evidenceRefs.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.evidenceRefs.map((ref) => (
              <Badge key={ref} variant="outline" className="text-[10px] font-mono">
                {ref}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function renderDecisionCard(d: CanonicalContextPackage["decisions"][number]) {
  const Icon = STATUS_ICON[d.status];
  return (
    <Card key={d.id}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", STATUS_COLOR[d.status])} />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <CardTitle className="text-slate-800">{d.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">{d.status}</Badge>
              <ConfidenceBar value={d.confidence} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-slate-600 leading-relaxed">{d.content}</p>
        {d.rationale && (
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span className="font-medium text-slate-700">Rationale: </span>
            {d.rationale}
          </div>
        )}
        {d.alternativesRejected.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Rejected Alternatives</span>
            <div className="flex flex-wrap gap-1">
              {d.alternativesRejected.map((alt, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  <XCircle className="h-3 w-3 text-slate-400" />
                  {alt}
                </span>
              ))}
            </div>
          </div>
        )}
        {d.evidenceRefs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {d.evidenceRefs.map((ref) => (
              <Badge key={ref} variant="outline" className="text-[10px] font-mono">
                {ref}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <Badge variant="secondary" className="text-[10px]">{count}</Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NextActions (sorted by priority)                                   */
/* ------------------------------------------------------------------ */

function NextActionsSection({ items }: { items: CanonicalContextPackage["nextActions"] }) {
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) =>
    (a.priority === "P0" ? 0 : a.priority === "P1" ? 1 : 2) -
    (b.priority === "P0" ? 0 : b.priority === "P1" ? 1 : 2),
  );

  const priorityColor: Record<string, string> = {
    P0: "bg-red-100 text-red-700",
    P1: "bg-amber-100 text-amber-700",
    P2: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-800">Next Actions</h3>
        <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
      </div>
      <div className="flex flex-col gap-2">
        {sorted.map((a) => {
          return (
            <Card key={a.id}>
              <CardContent className="flex items-start gap-3 py-3">
                <ArrowRight className={cn("h-4 w-4 mt-0.5 shrink-0", STATUS_COLOR[a.status])} />
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{a.title}</span>
                    <span className={cn("inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold", priorityColor[a.priority])}>
                      {a.priority}
                    </span>
                    <Badge variant="outline" className="text-[10px]">{a.owner}</Badge>
                  </div>
                  <p className="text-xs text-slate-600">{a.content}</p>
                  <p className="text-[10px] text-slate-500">
                    Done when: {a.doneWhen}
                  </p>
                  <ConfidenceBar value={a.confidence} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Contradictions                                                     */
/* ------------------------------------------------------------------ */

function ContradictionsSection({ items }: { items: CanonicalContextPackage["contradictions"] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-800">Contradictions</h3>
        <Badge variant="destructive" className="text-[10px]">{items.length}</Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((c) => (
          <Card key={c.id} className="border-amber-200">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
                <CardTitle className="text-amber-800">{c.description}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  Resolution: {c.resolution}
                </Badge>
              </div>
              {c.evidenceRefs.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {c.evidenceRefs.map((ref) => (
                    <Badge key={ref} variant="outline" className="text-[10px] font-mono">
                      {ref}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main view                                                          */
/* ------------------------------------------------------------------ */

export interface ContextPackViewProps {
  pkg: CanonicalContextPackage;
}

export function ContextPackView({ pkg }: ContextPackViewProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-800">{pkg.summary.oneSentence}</p>
          <p className="text-xs text-slate-500 leading-relaxed">{pkg.summary.handoffBrief}</p>
        </CardContent>
      </Card>

      {/* Task info */}
      <Card>
        <CardHeader>
          <CardTitle>Task</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-slate-500">Title</span>
            <p className="font-medium text-slate-800">{pkg.task.title}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Target Agent</span>
            <Badge className="mt-0.5">{pkg.task.targetAgent}</Badge>
          </div>
          <div className="col-span-2">
            <span className="text-xs text-slate-500">Desired Outcome</span>
            <p className="text-slate-700">{pkg.task.desiredOutcome}</p>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <Section title="Objectives" count={pkg.objective.length}>
        {pkg.objective.map(renderItemCard)}
      </Section>

      <Section title="Current State" count={pkg.currentState.length}>
        {pkg.currentState.map(renderItemCard)}
      </Section>

      <Section title="Facts" count={pkg.facts.length}>
        {pkg.facts.map(renderItemCard)}
      </Section>

      {/* Decisions - special layout */}
      {pkg.decisions.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800">Decisions</h3>
            <Badge variant="secondary" className="text-[10px]">{pkg.decisions.length}</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {pkg.decisions.map(renderDecisionCard)}
          </div>
        </div>
      )}

      <Section title="Constraints" count={pkg.constraints.length}>
        {pkg.constraints.map(renderItemCard)}
      </Section>

      <Section title="Preferences" count={pkg.preferences.length}>
        {pkg.preferences.map(renderItemCard)}
      </Section>

      <Section title="Risks" count={pkg.risks.length}>
        {pkg.risks.map((r) => renderItemCard(r))}
      </Section>

      <Section title="Rejected Options" count={pkg.rejectedOptions.length}>
        {pkg.rejectedOptions.map(renderItemCard)}
      </Section>

      <Section title="Open Questions" count={pkg.openQuestions.length}>
        {pkg.openQuestions.map(renderItemCard)}
      </Section>

      <NextActionsSection items={pkg.nextActions} />

      <ContradictionsSection items={pkg.contradictions} />
    </div>
  );
}
