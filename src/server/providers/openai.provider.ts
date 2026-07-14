/**
 * OpenAI-compatible Provider
 * Reads API key from server-side environment variables only
 * Includes JSON repair mechanism for unstable model outputs
 * URL normalization: handles both /v1/suffix and bare base URLs
 * Supports long text chunking with deterministic merge
 */
import { uid } from "@/lib/ids";
import { CanonicalContextPackageSchema } from "@/schemas/context-package.schema";
import type { CanonicalContextPackage } from "@/schemas/context-package.schema";
import type { CompileRequest } from "@/schemas/request.schema";
import {
  splitText,
  mergeChunkResults,
  validateInputLength,
  type TextChunk,
  type ChunkExtraction,
} from "@/server/chunking/chunk-processor";

const COMPILE_SYSTEM_PROMPT = `You are ContextMirror, an AI context handoff compiler.
Given raw conversation/project records, extract and structure a CanonicalContextPackage.
Every fact, decision, and risk must be grounded in the source text.

You MUST return a single JSON object with EXACTLY this structure (all fields required):

{
  "schemaVersion": "1.0",
  "packageId": "pkg_generated",
  "generatedAt": "2026-01-01T00:00:00Z",
  "task": {
    "title": "string - the task title",
    "desiredOutcome": "string - what the next agent should achieve",
    "targetAgent": "coding" | "writing" | "product" | "research" | "general"
  },
  "summary": {
    "oneSentence": "string - one sentence summary",
    "handoffBrief": "string - 2-3 sentence handoff brief"
  },
  "objective": [
    {
      "id": "obj_1",
      "title": "string",
      "content": "string",
      "status": "confirmed" | "inferred" | "conflicted" | "unknown",
      "confidence": 0.0-1.0,
      "evidenceRefs": ["ev_1"]
    }
  ],
  "currentState": [
    {
      "id": "cs_1",
      "title": "string",
      "content": "string",
      "status": "confirmed" | "inferred" | "conflicted" | "unknown",
      "confidence": 0.0-1.0,
      "evidenceRefs": ["ev_1"]
    }
  ],
  "facts": [
    {
      "id": "fact_1",
      "title": "string",
      "content": "string",
      "status": "confirmed" | "inferred" | "conflicted" | "unknown",
      "confidence": 0.0-1.0,
      "evidenceRefs": ["ev_1"]
    }
  ],
  "decisions": [
    {
      "id": "dec_1",
      "title": "string",
      "content": "string",
      "status": "confirmed" | "inferred" | "conflicted" | "unknown",
      "confidence": 0.0-1.0,
      "evidenceRefs": ["ev_1"],
      "rationale": "string - why this decision was made",
      "alternativesRejected": ["string"],
      "downstreamEffects": ["string"]
    }
  ],
  "constraints": [
    {
      "id": "con_1",
      "title": "string",
      "content": "string",
      "status": "confirmed" | "inferred" | "conflicted" | "unknown",
      "confidence": 0.0-1.0,
      "evidenceRefs": ["ev_1"]
    }
  ],
  "preferences": [],
  "rejectedOptions": [],
  "artifacts": [],
  "risks": [
    {
      "id": "risk_1",
      "title": "string",
      "content": "string",
      "status": "confirmed" | "inferred" | "conflicted" | "unknown",
      "confidence": 0.0-1.0,
      "evidenceRefs": ["ev_1"],
      "severity": "low" | "medium" | "high",
      "mitigation": "string - optional mitigation strategy"
    }
  ],
  "openQuestions": [],
  "nextActions": [
    {
      "id": "na_1",
      "title": "string",
      "content": "string",
      "status": "confirmed" | "inferred" | "conflicted" | "unknown",
      "confidence": 0.0-1.0,
      "evidenceRefs": ["ev_1"],
      "priority": "P0" | "P1" | "P2",
      "owner": "user" | "next_agent" | "unknown",
      "doneWhen": "string - completion criteria",
      "dependencies": ["string"]
    }
  ],
  "contradictions": [],
  "evidence": [
    {
      "id": "ev_1",
      "sourceName": "string - source file/conversation name",
      "startLine": 1,
      "endLine": 5,
      "quote": "string - exact quote from source"
    }
  ],
  "readiness": {
    "score": 0-100,
    "level": "blocked" | "needs_clarification" | "ready",
    "missing": ["string - what information is missing"],
    "explanation": "string"
  },
  "privacyReport": {
    "scanned": true,
    "findings": [],
    "sentToModelAfterRedaction": false
  }
}

Rules:
- Every fact, decision, constraint, risk, and nextAction MUST have at least one evidenceRef
- Evidence line numbers should approximate the position in the source text
- Return ONLY the JSON object, no markdown wrapping, no explanation text`;

const COMPILE_USER_TEMPLATE = `## Task
Title: {title}
Target Agent: {targetAgent}
Desired Outcome: {desiredOutcome}

## Source Text
{sourceText}

## Instructions
Analyze the source text and produce a CanonicalContextPackage JSON object following the schema in the system prompt.
- Extract facts, decisions, constraints, risks, and next actions from the source text
- Each item must reference evidence with line numbers from the source
- Calculate a readiness score (0-100) based on information completeness
- Set privacyReport.scanned to true and sentToModelAfterRedaction to false
- Return ONLY the JSON object`;

interface ModelMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/* ── Environment Readers ────────────────────────────────────────── */

function getBaseUrl(): string {
  const raw = process.env.AI_BASE_URL || "https://api.openai.com";
  // Remove trailing slashes
  return raw.replace(/\/+$/, "");
}

function getChatCompletionsUrl(): string {
  const base = getBaseUrl();
  // Already includes /v1 -> append only /chat/completions
  if (base.endsWith("/v1")) {
    return `${base}/chat/completions`;
  }
  // Bare base -> append /v1/chat/completions
  return `${base}/v1/chat/completions`;
}

function getApiKey(): string {
  return process.env.AI_API_KEY || "";
}

function getModel(): string {
  return process.env.AI_MODEL || "gpt-4o-mini";
}

export function isLiveProviderConfigured(): boolean {
  return !!getApiKey();
}

/* ── Message Builder ───────────────────────────────────────────── */

function buildMessages(req: CompileRequest, sourceText?: string): ModelMessage[] {
  const text = sourceText ?? req.source.text;
  const userContent = COMPILE_USER_TEMPLATE
    .replace("{title}", req.task.title)
    .replace("{targetAgent}", req.task.targetAgent)
    .replace("{desiredOutcome}", req.task.desiredOutcome)
    .replace("{sourceText}", text);

  return [
    { role: "system", content: COMPILE_SYSTEM_PROMPT },
    { role: "user", content: userContent },
  ];
}

/* ── JSON Extraction & Repair ──────────────────────────────────── */

export function extractJson(raw: string): string {
  const codeBlockMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    return raw.slice(first, last + 1);
  }
  return raw;
}

export function tryRepairJson(broken: string): string | null {
  let fixed = broken;
  fixed = fixed.replace(/,\s*([\]}])/g, "$1");
  fixed = fixed.replace(/'/g, '"');
  fixed = fixed.replace(/\n/g, "\\n").replace(/\\n"/g, '\n"');
  fixed = fixed.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "");
  try {
    JSON.parse(fixed);
    return fixed;
  } catch {
    return null;
  }
}

/* ── Model Call ────────────────────────────────────────────────── */

async function callModel(messages: ModelMessage[], timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = getChatCompletionsUrl();
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: getModel(),
        messages,
        temperature: 0.15,
        max_tokens: 8000,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`MODEL_HTTP_${res.status}: ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return json.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("MODEL_TIMEOUT");
    }
    throw err;
  }
}

/* ── Single Chunk Compilation ──────────────────────────────────── */

async function compileSingleChunk(
  req: CompileRequest,
  chunk: TextChunk,
  timeoutMs: number
): Promise<ChunkExtraction> {
  const messages = buildMessages(req, chunk.text);
  const raw = await callModel(messages, timeoutMs);
  let jsonStr = extractJson(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    const fixed = tryRepairJson(jsonStr);
    if (fixed) {
      jsonStr = fixed;
      parsed = JSON.parse(jsonStr);
    } else {
      throw new Error(`JSON_PARSE_FAILED: ${(e as Error).message}`);
    }
  }

  const result = CanonicalContextPackageSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`SCHEMA_INVALID: ${issues.join("; ")}`);
  }

  const pkg = result.data;

  // Remap evidence line numbers from chunk-local to original text
  const remappedEvidence = pkg.evidence.map((ev) => ({
    ...ev,
    id: uid("ev"),
    sourceName: req.source.sourceName || ev.sourceName,
    startLine: Math.max(1, ev.startLine + chunk.startLine - 1),
    endLine: Math.max(1, ev.endLine + chunk.startLine - 1),
  }));

  return {
    chunkId: chunk.id,
    facts: pkg.facts.map((f) => ({ ...f, id: uid("fact") })),
    decisions: pkg.decisions.map((d) => ({ ...d, id: uid("dec") })),
    constraints: pkg.constraints.map((c) => ({ ...c, id: uid("con") })),
    risks: pkg.risks.map((r) => ({ ...r, id: uid("risk") })),
    nextActions: pkg.nextActions.map((a) => ({ ...a, id: uid("na") })),
    evidence: remappedEvidence,
  };
}

/* ── Compile Entrypoint ────────────────────────────────────────── */

export async function compileWithLLM(
  req: CompileRequest,
  timeoutMs = 45000
): Promise<{ pkg: CanonicalContextPackage; repaired: boolean; mode: "live" }> {
  if (!isLiveProviderConfigured()) {
    throw new Error("PROVIDER_NOT_CONFIGURED: AI_API_KEY is not set in environment variables");
  }

  // Validate input length
  const lengthCheck = validateInputLength(req.source.text);
  if (!lengthCheck.valid) {
    throw new Error(`VALIDATION_ERROR: ${lengthCheck.error}`);
  }

  const chunks = splitText(req.source.text, req.source.sourceName || "source");

  // If single chunk, use fast path
  if (chunks.length === 1) {
    const messages = buildMessages(req);
    const raw = await callModel(messages, timeoutMs);
    let jsonStr = extractJson(raw);

    let repaired = false;
    let parsed: unknown;

    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      const fixed = tryRepairJson(jsonStr);
      if (fixed) {
        jsonStr = fixed;
        repaired = true;
        try {
          parsed = JSON.parse(jsonStr);
        } catch {
          throw new Error(`JSON_PARSE_FAILED: ${(e as Error).message}`);
        }
      } else {
        throw new Error(`JSON_PARSE_FAILED: ${(e as Error).message}`);
      }
    }

    const result = CanonicalContextPackageSchema.safeParse(parsed);
    if (!result.success) {
      const issues = result.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`);
      throw new Error(`SCHEMA_INVALID: ${issues.join("; ")}`);
    }

    const pkg: CanonicalContextPackage = {
      ...result.data,
      schemaVersion: "1.0",
      packageId: uid("pkg"),
      generatedAt: new Date().toISOString(),
    };

    return { pkg, repaired, mode: "live" };
  }

  // Multi-chunk: compile each chunk and merge
  const perChunkTimeout = Math.floor(timeoutMs / chunks.length);
  const chunkResults: ChunkExtraction[] = [];
  let anyRepaired = false;

  for (const chunk of chunks) {
    try {
      const cx = await compileSingleChunk(req, chunk, perChunkTimeout);
      chunkResults.push(cx);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("JSON_PARSE_FAILED")) {
        anyRepaired = true;
        // Try once more with repair
        const messages = buildMessages(req, chunk.text);
        const raw = await callModel(messages, perChunkTimeout);
        const jsonStr = extractJson(raw);
        const fixed = tryRepairJson(jsonStr);
        if (fixed) {
          const parsed = JSON.parse(fixed);
          const result = CanonicalContextPackageSchema.safeParse(parsed);
          if (result.success) {
            const pkg = result.data;
            chunkResults.push({
              chunkId: chunk.id,
              facts: pkg.facts.map((f) => ({ ...f, id: uid("fact") })),
              decisions: pkg.decisions.map((d) => ({ ...d, id: uid("dec") })),
              constraints: pkg.constraints.map((c) => ({ ...c, id: uid("con") })),
              risks: pkg.risks.map((r) => ({ ...r, id: uid("risk") })),
              nextActions: pkg.nextActions.map((a) => ({ ...a, id: uid("na") })),
              evidence: pkg.evidence.map((ev) => ({
                ...ev,
                id: uid("ev"),
                sourceName: req.source.sourceName || ev.sourceName,
                startLine: Math.max(1, ev.startLine + chunk.startLine - 1),
                endLine: Math.max(1, ev.endLine + chunk.startLine - 1),
              })),
            });
            continue;
          }
        }
      }
      throw err;
    }
  }

  const merged = mergeChunkResults(chunkResults);

  // Build final package from merged results
  const finalPkg: CanonicalContextPackage = {
    schemaVersion: "1.0",
    packageId: uid("pkg"),
    generatedAt: new Date().toISOString(),
    task: {
      title: req.task.title,
      desiredOutcome: req.task.desiredOutcome,
      targetAgent: req.task.targetAgent,
    },
    summary: {
      oneSentence: `Compiled ${chunks.length} chunk(s) with ${merged.duplicatesRemoved} duplicates removed`,
      handoffBrief: `Context compiled from ${req.source.sourceName || "source"} with ${merged.facts.length} facts, ${merged.decisions.length} decisions, ${merged.risks.length} risks`,
    },
    objective: [],
    currentState: [],
    facts: merged.facts,
    decisions: merged.decisions,
    constraints: merged.constraints,
    preferences: [],
    rejectedOptions: [],
    artifacts: [],
    risks: merged.risks,
    openQuestions: [],
    nextActions: merged.nextActions,
    contradictions: merged.contradictions,
    evidence: merged.evidence,
    readiness: {
      score: 70,
      level: "needs_clarification",
      missing: merged.contradictions.length > 0 ? ["Resolve contradictions between chunks"] : [],
      explanation: `Compiled from ${chunks.length} chunk(s). ${merged.duplicatesRemoved} duplicates removed. ${merged.contradictions.length} contradictions detected.`,
    },
    privacyReport: {
      scanned: true,
      findings: [],
      sentToModelAfterRedaction: req.privacy.redacted,
    },
  };

  return { pkg: finalPkg, repaired: anyRepaired, mode: "live" };
}
