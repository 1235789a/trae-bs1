"use client";

import { useMemo } from "react";
import { Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buildMindMap } from "@/features/graph/build-mindmap";
import type { CanonicalContextPackage, GraphNodeType } from "@/schemas/context-package.schema";

/* ------------------------------------------------------------------ */
/*  Color map for node types                                          */
/* ------------------------------------------------------------------ */

const NODE_COLORS: Record<GraphNodeType, { fill: string; stroke: string; text: string }> = {
  source:     { fill: "#1e293b", stroke: "#0f172a", text: "#fff" },
  fact:       { fill: "#dbeafe", stroke: "#93c5fd", text: "#1e40af" },
  decision:   { fill: "#fef3c7", stroke: "#fcd34d", text: "#92400e" },
  constraint: { fill: "#fce7f3", stroke: "#f9a8d4", text: "#9d174d" },
  rejected:   { fill: "#fee2e2", stroke: "#fca5a5", text: "#991b1b" },
  risk:       { fill: "#ffedd5", stroke: "#fdba74", text: "#9a3412" },
  question:   { fill: "#e0e7ff", stroke: "#a5b4fc", text: "#3730a3" },
  next_action:{ fill: "#d1fae5", stroke: "#6ee7b7", text: "#065f46" },
};

const TYPE_LABEL_MAP: Record<string, string> = {
  source: "来源", fact: "事实", decision: "决策", constraint: "约束",
  rejected: "已排除", risk: "风险", question: "问题", next_action: "下一步",
};

/* ------------------------------------------------------------------ */
/*  SVG renderer                                                       */
/* ------------------------------------------------------------------ */

function MindMapSVG({
  width,
  height,
  nodes,
  edges,
}: {
  width: number;
  height: number;
  nodes: { id: string; type: GraphNodeType; label: string; x: number; y: number; description?: string }[];
  edges: { source: string; target: string }[];
}) {
  const cx = width / 2;
  const cy = height / 2;
  // Larger scale for better readability on typical screens
  const scale = Math.min(width, height) / 18;

  const toSVGX = (x: number) => cx + x * scale;
  const toSVGY = (y: number) => cy + y * scale;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      style={{ maxHeight: 720 }}
    >
      {/* Edges */}
      {edges.map((e) => {
        const src = nodeMap.get(e.source);
        const tgt = nodeMap.get(e.target);
        if (!src || !tgt) return null;

        const x1 = toSVGX(src.x);
        const y1 = toSVGY(src.y);
        const x2 = toSVGX(tgt.x);
        const y2 = toSVGY(tgt.y);

        return (
          <line
            key={`${e.source}-${e.target}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#cbd5e1"
            strokeWidth={1.5}
            opacity={0.6}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((n) => {
        const nx = toSVGX(n.x ?? 0);
        const ny = toSVGY(n.y ?? 0);
        const colors = NODE_COLORS[n.type] ?? NODE_COLORS.fact;
        const isCenter = n.id === "center";
        const isBranch = (n.description ?? "").length === 0;
        // Larger radii for readability
        const r = isCenter ? 50 : isBranch ? 34 : 24;
        const maxChars = isCenter ? 16 : isBranch ? 14 : 12;
        const displayLabel = n.label.length > maxChars * 2 ? n.label.slice(0, maxChars * 2 - 1) + "…" : n.label;
        const lines = splitLabel(displayLabel, maxChars);

        return (
          <g key={n.id}>
            <circle
              cx={nx}
              cy={ny}
              r={r}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={isCenter ? 3 : 2}
            />
            {/* Title with line wrapping */}
            {lines.map((line, i) => (
              <text
                key={i}
                x={nx}
                y={ny - ((lines.length - 1) * 8) / 2 + i * 16}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isCenter ? 14 : isBranch ? 12 : 11}
                fill={colors.text}
                fontWeight={isCenter ? 700 : 600}
              >
                {line}
              </text>
            ))}
            {/* Hover tooltip showing full label */}
            <title>{n.label}</title>
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

export interface MindMapViewProps {
  pkg: CanonicalContextPackage;
}

export function MindMapView({ pkg }: MindMapViewProps) {
  const graph = useMemo(() => buildMindMap(pkg), [pkg]);

  // Count branch nodes (those with empty description, excluding center)
  const branchCount = graph.nodes.filter(
    (n) => n.id !== "center" && n.description === "",
  ).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Brain className="h-4 w-4 text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-800">
          思维导图（Mind Map）
        </h3>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {graph.nodes.length} 个节点
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {branchCount} 个分支
          </Badge>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm overflow-auto">
        <MindMapSVG
          width={800}
          height={800}
          nodes={graph.nodes.map(n => ({ ...n, x: n.x ?? 0, y: n.y ?? 0, description: n.description ?? "" }))}
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
