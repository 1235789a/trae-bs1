"use client";

import { useMemo } from "react";
import { GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buildDecisionGraph } from "@/features/graph/build-graph";
import type { CanonicalContextPackage, GraphNodeType } from "@/schemas/context-package.schema";

/* ------------------------------------------------------------------ */
/*  Color map for node types                                          */
/* ------------------------------------------------------------------ */

const NODE_COLORS: Record<GraphNodeType, { fill: string; stroke: string; text: string }> = {
  source:    { fill: "#1e293b", stroke: "#0f172a", text: "#fff" },
  fact:      { fill: "#dbeafe", stroke: "#93c5fd", text: "#1e40af" },
  decision:  { fill: "#fef3c7", stroke: "#fcd34d", text: "#92400e" },
  constraint:{ fill: "#fce7f3", stroke: "#f9a8d4", text: "#9d174d" },
  rejected:  { fill: "#fee2e2", stroke: "#fca5a5", text: "#991b1b" },
  risk:      { fill: "#ffedd5", stroke: "#fdba74", text: "#9a3412" },
  question:  { fill: "#e0e7ff", stroke: "#a5b4fc", text: "#3730a3" },
  next_action:{ fill: "#d1fae5", stroke: "#6ee7b7", text: "#065f46" },
};

const EDGE_COLORS: Record<string, string> = {
  supports: "#94a3b8",
  causes: "#f87171",
  constrains: "#fbbf24",
  rejects: "#f87171",
  blocks: "#ef4444",
  leads_to: "#34d399",
};

const TYPE_LABEL_MAP: Record<string, string> = {
  source: "来源", fact: "事实", decision: "决策", constraint: "约束",
  rejected: "已排除", risk: "风险", question: "问题", next_action: "下一步",
};

/* ------------------------------------------------------------------ */
/*  SVG renderer                                                       */
/* ------------------------------------------------------------------ */

function DecisionGraphSVG({
  width,
  height,
  nodes,
  edges,
}: {
  width: number;
  height: number;
  nodes: { id: string; type: GraphNodeType; label: string; x: number; y: number }[];
  edges: { source: string; target: string; relation: string; label?: string }[];
}) {
  const padding = 100;
  const allX = nodes.map((n) => n.x);
  const allY = nodes.map((n) => n.y);
  const minX = Math.min(...allX, 0);
  const maxX = Math.max(...allX, 0);
  const minY = Math.min(...allY, 0);
  const maxY = Math.max(...allY, 0);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const scaleX = (width - padding * 2) / rangeX;
  const scaleY = (height - padding * 2) / rangeY;
  const scale = Math.min(scaleX, scaleY, 90);

  const toSVGX = (x: number) => padding + (x - minX) * scale + (width - padding * 2 - rangeX * scale) / 2;
  const toSVGY = (y: number) => padding + (y - minY) * scale + (height - padding * 2 - rangeY * scale) / 2;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      style={{ maxHeight: 700 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Edges */}
      {edges.map((e) => {
        const src = nodeMap.get(e.source);
        const tgt = nodeMap.get(e.target);
        if (!src || !tgt) return null;

        const x1 = toSVGX(src.x);
        const y1 = toSVGY(src.y);
        const x2 = toSVGX(tgt.x);
        const y2 = toSVGY(tgt.y);

        const edgeColor = EDGE_COLORS[e.relation] ?? "#94a3b8";
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;

        return (
          <g key={`${e.source}-${e.target}`}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={edgeColor}
              strokeWidth={1.5}
              strokeDasharray={e.relation === "blocks" ? "6 3" : undefined}
              markerEnd="url(#arrowhead)"
              opacity={0.7}
            />
            {e.label && (
              <text
                x={mx}
                y={my - 8}
                textAnchor="middle"
                fontSize={11}
                fill="#64748b"
                fontWeight={600}
              >
                {e.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((n) => {
        const cx = toSVGX(n.x);
        const cy = toSVGY(n.y);
        const colors = NODE_COLORS[n.type] ?? NODE_COLORS.fact;
        const isSource = n.type === "source";
        const r = isSource ? 36 : 28;
        const maxChars = isSource ? 14 : 12;
        const displayLabel = n.label.length > maxChars * 2 ? n.label.slice(0, maxChars * 2 - 1) + "…" : n.label;
        const lines = splitLabel(displayLabel, maxChars);
        const typeLabel = TYPE_LABEL_MAP[n.type] ?? n.type;

        return (
          <g key={n.id}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={2}
            />
            {/* Title with line wrapping */}
            {lines.map((line, i) => (
              <text
                key={i}
                x={cx}
                y={cy - ((lines.length - 1) * 7) / 2 + i * 14}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isSource ? 13 : 12}
                fill={colors.text}
                fontWeight={600}
              >
                {line}
              </text>
            ))}
            {/* Hover tooltip showing full label */}
            <title>{n.label}</title>
            {/* Type label below node */}
            <text
              x={cx}
              y={cy + r + 14}
              textAnchor="middle"
              fontSize={10}
              fill="#94a3b8"
            >
              {typeLabel}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function splitLabel(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let remaining = text;
  while (remaining.length > 0 && lines.length < 3) {
    if (remaining.length <= maxChars) {
      lines.push(remaining);
      break;
    }
    // Try to break at a space
    let breakPoint = maxChars;
    while (breakPoint > 0 && remaining[breakPoint] !== " " && remaining[breakPoint] !== "，" && remaining[breakPoint] !== "。") {
      breakPoint--;
    }
    if (breakPoint <= 0) breakPoint = maxChars;
    lines.push(remaining.slice(0, breakPoint).trim());
    remaining = remaining.slice(breakPoint).trim();
  }
  if (remaining.length > 0 && lines.length === 3) {
    lines[2] = lines[2].slice(0, -1) + "…";
  }
  return lines;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export interface GraphViewProps {
  pkg: CanonicalContextPackage;
}

export function GraphView({ pkg }: GraphViewProps) {
  const graph = useMemo(() => buildDecisionGraph(pkg), [pkg]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <GitBranch className="h-4 w-4 text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-800">
          决策图（Decision Graph）
        </h3>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {graph.nodes.length} 个节点
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {graph.edges.length} 条边
          </Badge>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm overflow-auto">
        <DecisionGraphSVG
          width={900}
          height={Math.max(500, graph.nodes.length * 55 + 120)}
          nodes={graph.nodes.map(n => ({ ...n, x: n.x ?? 0, y: n.y ?? 0 }))}
          edges={graph.edges}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        {Object.entries(NODE_COLORS).map(([type, colors]) => {
          return (
            <div key={type} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: colors.fill, border: `1.5px solid ${colors.stroke}` }}
              />
              {TYPE_LABEL_MAP[type] ?? type}
            </div>
          );
        })}
      </div>
    </div>
  );
}
