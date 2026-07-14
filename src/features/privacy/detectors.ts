/**
 * Browser-side sensitive information scanner
 * Uses deterministic regex matching - no data leaves the browser
 */
import type { SensitiveType } from "@/schemas/context-package.schema";

export interface SensitiveFinding {
  id: string;
  type: SensitiveType;
  severity: "low" | "medium" | "high";
  start: number;
  end: number;
  maskedPreview: string;
  action: "redacted" | "kept" | "pending";
}

interface Rule {
  type: SensitiveType;
  severity: "low" | "medium" | "high";
  patterns: RegExp[];
  mask: "full" | "prefix" | "middle";
}

const RULES: Rule[] = [
  {
    type: "api_key", severity: "high", mask: "prefix",
    patterns: [
      /\b(sk-[a-zA-Z0-9]{20,})\b/g,
      /\b(pk-[a-zA-Z0-9]{20,})\b/g,
      /\b(ak-[a-zA-Z0-9]{20,})\b/g,
      /API[_\s-]?[Kk]ey[:=\s]+([a-zA-Z0-9_-]{16,})/g,
    ],
  },
  {
    type: "github_token", severity: "high", mask: "prefix",
    patterns: [
      /\b(ghp_[a-zA-Z0-9]{30,})\b/g,
      /\b(gho_[a-zA-Z0-9]{30,})\b/g,
      /\b(ghu_[a-zA-Z0-9]{30,})\b/g,
      /\b(ghs_[a-zA-Z0-9]{30,})\b/g,
    ],
  },
  {
    type: "private_key", severity: "high", mask: "full",
    patterns: [/-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g],
  },
  {
    type: "password", severity: "high", mask: "prefix",
    patterns: [
      /password[:=\s]+([^\s]{6,})/gi,
      /passwd[:=\s]+([^\s]{6,})/gi,
      /secret[:=\s]+([^\s]{6,})/gi,
    ],
  },
  {
    type: "email", severity: "low", mask: "middle",
    patterns: [/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g],
  },
  {
    type: "phone", severity: "medium", mask: "middle",
    patterns: [/\b(1[3-9]\d{9})\b/g],
  },
  {
    type: "id_number", severity: "high", mask: "middle",
    patterns: [/\b(\d{17}[\dXx])\b/g],
  },
  {
    type: "wallet_address", severity: "medium", mask: "prefix",
    patterns: [
      /\b(0x[a-fA-F0-9]{40})\b/g,
      /\b(bc1[a-zA-HJ-NP-Z0-9]{25,})\b/g,
    ],
  },
];

let findId = 0;
function maskMatch(raw: string, strategy: "full" | "prefix" | "middle"): string {
  if (strategy === "full") return "[REDACTED]";
  if (strategy === "prefix") return raw.slice(0, Math.min(8, raw.length)) + "[REDACTED]";
  if (raw.length <= 6) return "[REDACTED]";
  return raw.slice(0, 3) + "****" + raw.slice(-3);
}

export function scanText(text: string): SensitiveFinding[] {
  const findings: SensitiveFinding[] = [];
  const seen = new Set<string>();

  for (const rule of RULES) {
    for (const pat of rule.patterns) {
      const re = new RegExp(pat.source, pat.flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const matched = m[1] ?? m[0];
        const s = m.index + m[0].indexOf(matched);
        const e = s + matched.length;
        const key = `${s}-${e}`;
        if (seen.has(key)) continue;
        seen.add(key);
        findId += 1;
        findings.push({
          id: `sf_${findId}`,
          type: rule.type,
          severity: rule.severity,
          start: s,
          end: e,
          maskedPreview: maskMatch(matched, rule.mask),
          action: rule.severity === "high" ? "redacted" : "pending",
        });
      }
    }
  }
  return findings.sort((a, b) => a.start - b.start);
}

export function applyRedactions(text: string, findings: SensitiveFinding[]): string {
  let result = text;
  const sorted = [...findings]
    .filter((f) => f.action === "redacted")
    .sort((a, b) => b.start - a.start);
  for (const f of sorted) {
    result = result.slice(0, f.start) + f.maskedPreview + result.slice(f.end);
  }
  return result;
}
