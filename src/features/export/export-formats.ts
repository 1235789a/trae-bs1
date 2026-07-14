import type { CanonicalContextPackage } from "@/schemas/context-package.schema";
import { buildAgentPrompt } from "@/features/prompt/build-prompt";
import YAML from "yaml";

export function exportMarkdown(pkg: CanonicalContextPackage): string {
  const lines = [
    "# ContextMirror Handoff Pack",
    "",
    `- Package: ${pkg.packageId}`,
    `- Generated: ${pkg.generatedAt}`,
    `- Schema: ${pkg.schemaVersion}`,
    `- Readiness: ${pkg.readiness.score}/100 (${pkg.readiness.level})`,
    "",
    "---",
    "",
    buildAgentPrompt(pkg),
    "",
    "---",
    "",
  ];

  if (pkg.contradictions.length > 0) {
    lines.push("## Contradictions");
    pkg.contradictions.forEach((c) => {
      lines.push(`- ${c.description} (resolution: ${c.resolution})`);
    });
    lines.push("");
  }

  if (pkg.evidence.length > 0) {
    lines.push("## Evidence");
    pkg.evidence.forEach((e) => {
      lines.push(`- ${e.id}: ${e.sourceName} L${e.startLine}-L${e.endLine}`);
      lines.push(`  > ${e.quote}`);
    });
  }

  return lines.join("\n");
}

export function exportJSON(pkg: CanonicalContextPackage): string {
  return JSON.stringify(pkg, null, 2);
}

export function exportYAML(pkg: CanonicalContextPackage): string {
  return YAML.stringify(pkg, {
    indent: 2,
    lineWidth: 120,
    defaultKeyType: "PLAIN",
    defaultStringType: "QUOTE_DOUBLE",
  });
}
