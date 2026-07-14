import type { CanonicalContextPackage } from "@/schemas/context-package.schema";

export function buildAgentPrompt(pkg: CanonicalContextPackage): string {
  const lines: string[] = [];

  lines.push("# 你的角色");
  lines.push(`你正在作为 ${pkg.task.targetAgent} Agent 接手此项目。`);
  lines.push("");

  lines.push("# 期望结果");
  lines.push(pkg.task.desiredOutcome);
  lines.push("");

  if (pkg.currentState.length > 0) {
    lines.push("# 当前状态");
    pkg.currentState.forEach((s) => lines.push(`- ${s.title}: ${s.content}`));
    lines.push("");
  }

  if (pkg.facts.length > 0) {
    lines.push("# 已确认事实");
    pkg.facts.forEach((f) => {
      const tag = f.status === "inferred" ? "（推断）" : "";
      lines.push(`- ${f.title}${tag}: ${f.content}`);
    });
    lines.push("");
  }

  if (pkg.decisions.length > 0) {
    lines.push("# 已做出的决策（请勿重新讨论）");
    pkg.decisions.forEach((d) => {
      lines.push(`## ${d.title}`);
      lines.push(d.content);
      if (d.rationale) lines.push(`**理由**: ${d.rationale}`);
      if (d.alternativesRejected.length) lines.push(`**已排除**: ${d.alternativesRejected.join(", ")}`);
    });
    lines.push("");
  }

  if (pkg.constraints.length > 0) {
    lines.push("# 约束条件（不得违反）");
    pkg.constraints.forEach((c) => lines.push(`- ${c.title}: ${c.content}`));
    lines.push("");
  }

  if (pkg.preferences.length > 0) {
    lines.push("# 用户偏好");
    pkg.preferences.forEach((p) => lines.push(`- ${p.title}: ${p.content}`));
    lines.push("");
  }

  if (pkg.risks.length > 0) {
    lines.push("# 风险");
    pkg.risks.forEach((r) => {
      lines.push(`- [${r.severity}] ${r.title}: ${r.content}`);
      if (r.mitigation) lines.push(`  缓解措施: ${r.mitigation}`);
    });
    lines.push("");
  }

  if (pkg.nextActions.length > 0) {
    lines.push("# 执行顺序");
    const sorted = [...pkg.nextActions].sort((a, b) => (a.priority === "P0" ? 0 : a.priority === "P1" ? 1 : 2) - (b.priority === "P0" ? 0 : b.priority === "P1" ? 1 : 2));
    sorted.forEach((a, i) => {
      const who = a.owner === "next_agent" ? "[由你执行]" : `[${a.owner}]`;
      lines.push(`${i + 1}. [${a.priority}] ${who} ${a.title}: ${a.content}`);
      lines.push(`   完成标准: ${a.doneWhen}`);
    });
    lines.push("");
  }

  lines.push("# 交接完整度");
  lines.push(`得分: ${pkg.readiness.score}/100 (${pkg.readiness.level})`);
  lines.push(pkg.readiness.explanation);
  lines.push("");
  lines.push("# 规则");
  lines.push("- 不要将推断项视为已确认事实");
  lines.push("- 遇到冲突时请提问");
  lines.push("- 保留用户已有的修改");
  lines.push("- 完成后报告验证结果");

  return lines.join("\n");
}
