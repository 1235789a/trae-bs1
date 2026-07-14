import type { CanonicalContextPackage } from "@/schemas/context-package.schema";
import type { GraphData } from "@/schemas/graph.schema";

export function buildDecisionGraph(pkg: CanonicalContextPackage): GraphData {
  const nodes: GraphData["nodes"] = [];
  const edges: GraphData["edges"] = [];

  nodes.push({ id: "src", type: "source", label: "来源", description: pkg.task.title, status: "confirmed", evidenceRefs: [], x: 0, y: 0 });

  let yOff = 1;
  for (const f of pkg.facts) {
    nodes.push({ id: f.id, type: "fact", label: f.title, description: f.content, status: f.status, evidenceRefs: f.evidenceRefs, x: -3, y: yOff });
    edges.push({ id: `e_s_${f.id}`, source: "src", target: f.id, relation: "supports" });
    yOff++;
  }
  for (const d of pkg.decisions) {
    nodes.push({ id: d.id, type: "decision", label: d.title, description: d.content, status: d.status, evidenceRefs: d.evidenceRefs, x: 3, y: yOff });
    edges.push({ id: `e_s_${d.id}`, source: "src", target: d.id, relation: "supports" });
    yOff++;
  }
  for (const c of pkg.constraints) {
    nodes.push({ id: c.id, type: "constraint", label: c.title, description: c.content, status: c.status, evidenceRefs: c.evidenceRefs, x: -4, y: yOff });
    edges.push({ id: `e_s_${c.id}`, source: "src", target: c.id, relation: "constrains" });
    yOff++;
  }
  for (const r of pkg.rejectedOptions) {
    nodes.push({ id: r.id, type: "rejected", label: r.title, description: r.content, status: r.status, evidenceRefs: r.evidenceRefs, x: 5, y: yOff });
    yOff++;
  }
  for (const r of pkg.risks) {
    nodes.push({ id: r.id, type: "risk", label: r.title, description: r.content, status: r.status, evidenceRefs: r.evidenceRefs, x: -2, y: yOff });
    yOff++;
  }
  for (const q of pkg.openQuestions) {
    nodes.push({ id: q.id, type: "question", label: q.title, description: q.content, status: q.status, evidenceRefs: q.evidenceRefs, x: 2, y: yOff });
    yOff++;
  }
  for (const a of pkg.nextActions) {
    nodes.push({ id: a.id, type: "next_action", label: a.title, description: a.content, status: a.status, evidenceRefs: a.evidenceRefs, x: 0, y: yOff });
    if (pkg.decisions.length > 0) {
      edges.push({ id: `e_d_${a.id}`, source: pkg.decisions[0].id, target: a.id, relation: "leads_to", label: a.priority });
    }
    yOff++;
  }

  return { nodes, edges };
}
