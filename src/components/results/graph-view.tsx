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
  // Scale factor: we'll map logical coordinates to SVG space
  const padding = 80;
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
  const scale = Math.min(scaleX, scaleY, 60);

  const toSVGX = (x: number) => padding + (x - minX) * scale + (width - padding * 2 - rangeX * scale) / 2;
  const toSVGY = (y: number) => padding + (y - minY) * scale + (height - padding * 2 - rangeY * scale) / 2;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      style={{ maxHeight: 600 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
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

        // Midpoint for label
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
                y={my - 6}
                textAnchor="middle"
                fontSize={10}
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
        const r = n.type === "source" ? 28 : 22;
        // Truncate label
        const label = n.label.length > 20 ? n.label.slice(0, 18) + "..." : n.label;

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
            <text
              x={cx}
              y={cy + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fill={colors.text}
              fontWeight={600}
            >
              {label}
            </text>
            <text
              x={cx}
              y={cy + r + 12}
              textAnchor="middle"
              fontSize={8}
              fill="#94a3b8"
            >
              {n.type}
            </text>
          </g>
        );
      })}
    </svg>
  );
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
          Decision Graph
        </h3>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {graph.nodes.length} nodes
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {graph.edges.length} edges
          </Badge>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm overflow-auto">
        <DecisionGraphSVG
          width={800}
          height={Math.max(400, graph.nodes.length * 50 + 100)}
          nodes={graph.nodes.map(n => ({ ...n, x: n.x ?? 0, y: n.y ?? 0 }))}
          edges={graph.edges}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        {Object.entries(NODE_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: colors.fill, border: `1.5px solid ${colors.stroke}` }}
            />
            {type}
          </div>
        ))}
      </div>
    </div>
  );
}
