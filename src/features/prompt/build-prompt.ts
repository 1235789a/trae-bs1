import type { CanonicalContextPackage } from "@/schemas/context-package.schema";

export function buildAgentPrompt(pkg: CanonicalContextPackage): string {
  const lines: string[] = [];

  lines.push("# Your Role");
  lines.push(`You are taking over this project as a ${pkg.task.targetAgent} agent.`);
  lines.push("");

  lines.push("# Required Outcome");
  lines.push(pkg.task.desiredOutcome);
  lines.push("");

  if (pkg.currentState.length > 0) {
    lines.push("# Current State");
    pkg.currentState.forEach((s) => lines.push(`- ${s.title}: ${s.content}`));
    lines.push("");
  }

  if (pkg.facts.length > 0) {
    lines.push("# Established Facts");
    pkg.facts.forEach((f) => {
      const tag = f.status === "inferred" ? " (inferred)" : "";
      lines.push(`- ${f.title}${tag}: ${f.content}`);
    });
    lines.push("");
  }

  if (pkg.decisions.length > 0) {
    lines.push("# Decisions Made (do NOT re-debate these)");
    pkg.decisions.forEach((d) => {
      lines.push(`## ${d.title}`);
      lines.push(d.content);
      if (d.rationale) lines.push(`**Rationale**: ${d.rationale}`);
      if (d.alternativesRejected.length) lines.push(`**Rejected**: ${d.alternativesRejected.join(", ")}`);
    });
    lines.push("");
  }

  if (pkg.constraints.length > 0) {
    lines.push("# Constraints (must NOT violate)");
    pkg.constraints.forEach((c) => lines.push(`- ${c.title}: ${c.content}`));
    lines.push("");
  }

  if (pkg.preferences.length > 0) {
    lines.push("# User Preferences");
    pkg.preferences.forEach((p) => lines.push(`- ${p.title}: ${p.content}`));
    lines.push("");
  }

  if (pkg.risks.length > 0) {
    lines.push("# Risks");
    pkg.risks.forEach((r) => {
      lines.push(`- [${r.severity}] ${r.title}: ${r.content}`);
      if (r.mitigation) lines.push(`  Mitigation: ${r.mitigation}`);
    });
    lines.push("");
  }

  if (pkg.nextActions.length > 0) {
    lines.push("# Execution Order");
    const sorted = [...pkg.nextActions].sort((a, b) => (a.priority === "P0" ? 0 : a.priority === "P1" ? 1 : 2) - (b.priority === "P0" ? 0 : b.priority === "P1" ? 1 : 2));
    sorted.forEach((a, i) => {
      const who = a.owner === "next_agent" ? "[YOU]" : `[${a.owner}]`;
      lines.push(`${i + 1}. [${a.priority}] ${who} ${a.title}: ${a.content}`);
      lines.push(`   Done when: ${a.doneWhen}`);
    });
    lines.push("");
  }

  lines.push("# Readiness");
  lines.push(`Score: ${pkg.readiness.score}/100 (${pkg.readiness.level})`);
  lines.push(pkg.readiness.explanation);
  lines.push("");
  lines.push("# Rules");
  lines.push("- Do not treat inferred items as confirmed facts");
  lines.push("- Ask if you encounter conflicts");
  lines.push("- Preserve existing user changes");
  lines.push("- Report verification results when done");

  return lines.join("\n");
}
