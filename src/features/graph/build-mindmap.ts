import type { CanonicalContextPackage } from "@/schemas/context-package.schema";
import type { GraphData } from "@/schemas/graph.schema";

export function buildMindMap(pkg: CanonicalContextPackage): GraphData {
  const nodes: GraphData["nodes"] = [];
  const edges: GraphData["edges"] = [];

  nodes.push({ id: "center", type: "source", label: pkg.task.title, description: pkg.summary.oneSentence, status: "confirmed", evidenceRefs: [], x: 0, y: 0 });

  const branches = [
    { id: "b_state", label: "当前状态", items: pkg.currentState, nodeType: "fact" as const },
    { id: "b_dec", label: "关键决策", items: pkg.decisions, nodeType: "decision" as const },
    { id: "b_con", label: "约束条件", items: pkg.constraints, nodeType: "constraint" as const },
    { id: "b_art", label: "项目产物", items: pkg.artifacts, nodeType: "fact" as const },
    { id: "b_risk", label: "风险", items: pkg.risks, nodeType: "risk" as const },
    { id: "b_next", label: "下一步行动", items: pkg.nextActions, nodeType: "next_action" as const },
  ];

  const step = (2 * Math.PI) / branches.length;
  branches.forEach((b, i) => {
    const angle = i * step - Math.PI / 2;
    const bx = Math.round(Math.cos(angle) * 4);
    const by = Math.round(Math.sin(angle) * 4);

    nodes.push({ id: b.id, type: b.nodeType, label: `${b.label} (${b.items.length})`, description: "", status: "confirmed", evidenceRefs: [], x: bx, y: by });
    edges.push({ id: `e_c_${b.id}`, source: "center", target: b.id, relation: "supports" });

    b.items.forEach((item, j) => {
      const subAngle = angle + (j - b.items.length / 2) * 0.3;
      const sx = Math.round(bx + Math.cos(subAngle) * 3);
      const sy = Math.round(by + Math.sin(subAngle) * 3);
      nodes.push({ id: item.id, type: b.nodeType, label: item.title, description: item.content, status: item.status, evidenceRefs: item.evidenceRefs, x: sx, y: sy });
      edges.push({ id: `e_${b.id}_${item.id}`, source: b.id, target: item.id, relation: "supports" });
    });
  });

  return { nodes, edges };
}
