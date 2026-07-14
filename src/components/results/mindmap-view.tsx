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
  const scale = Math.min(width, height) / 22;

  const toSVGX = (x: number) => cx + x * scale;
  const toSVGY = (y: number) => cy + y * scale;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      style={{ maxHeight: 600 }}
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
        const r = isCenter ? 40 : isBranch ? 26 : 18;
        const label =
          isCenter
            ? n.label.length > 24 ? n.label.slice(0, 22) + "..." : n.label
            : n.label.length > 16 ? n.label.slice(0, 14) + "..." : n.label;

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
            <text
              x={nx}
              y={ny + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isCenter ? 12 : isBranch ? 10 : 9}
              fill={colors.text}
              fontWeight={isCenter ? 700 : 600}
            >
              {label}
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

export interface MindMapViewProps {
  pkg: CanonicalContextPackage;
}

export function MindMapView({ pkg }: MindMapViewProps) {
  const graph = useMemo(() => buildMindMap(pkg), [pkg]);

  // Count 6 branch nodes (those with empty description, excluding center)
  const branchCount = graph.nodes.filter(
    (n) => n.id !== "center" && n.description === "",
  ).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Brain className="h-4 w-4 text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-800">
          Mind Map
        </h3>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {graph.nodes.length} nodes
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {branchCount} branches
          </Badge>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm overflow-auto">
        <MindMapSVG
          width={700}
          height={700}
          nodes={graph.nodes.map(n => ({ ...n, x: n.x ?? 0, y: n.y ?? 0, description: n.description ?? "" }))}
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
