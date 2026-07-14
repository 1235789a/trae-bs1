/**
 * ContextMirror - Long Text Chunk Processor
 *
 * 1. Splits input into overlapping chunks with stable sourceIds and char ranges
 * 2. Each chunk retains paragraph numbering relative to the original text
 * 3. Supports per-chunk extraction results (facts, decisions, constraints, risks, actions)
 * 4. Deterministic merge with deduplication and conflict detection
 * 5. Evidence references map back to original text positions
 */

import { uid } from "@/lib/ids";
import type {
  ContextItem,
  DecisionItem,
  RiskItem,
  NextAction,
  EvidenceRef,
  Contradiction,
} from "@/schemas/context-package.schema";

/* ── Chunk Types ───────────────────────────────────────────────── */

export interface TextChunk {
  id: string;
  sourceId: string;
  index: number;
  start: number; // char index in original text
  end: number;   // char index in original text
  text: string;
  startLine: number; // approx line number in original text
  endLine: number;
}

export interface ChunkExtraction {
  chunkId: string;
  facts: ContextItem[];
  decisions: DecisionItem[];
  constraints: ContextItem[];
  risks: RiskItem[];
  nextActions: NextAction[];
  evidence: EvidenceRef[];
}

export interface MergedExtraction {
  facts: ContextItem[];
  decisions: DecisionItem[];
  constraints: ContextItem[];
  risks: RiskItem[];
  nextActions: NextAction[];
  evidence: EvidenceRef[];
  contradictions: Contradiction[];
  duplicatesRemoved: number;
}

/* ── Configuration ─────────────────────────────────────────────── */

export const CHUNK_MAX_CHARS = 12_000;
export const CHUNK_OVERLAP = 800;
export const ABSOLUTE_MAX_CHARS = 60_000;

/* ── Text Splitting ────────────────────────────────────────────── */

export function splitText(text: string, sourceId: string): TextChunk[] {
  if (text.length > ABSOLUTE_MAX_CHARS) {
    throw new Error(`INPUT_TOO_LONG: ${text.length} chars exceeds maximum ${ABSOLUTE_MAX_CHARS}`);
  }

  if (text.length <= CHUNK_MAX_CHARS) {
    const lines = text.split("\n").length;
    return [{
      id: uid("chunk"),
      sourceId,
      index: 0,
      start: 0,
      end: text.length,
      text,
      startLine: 1,
      endLine: lines,
    }];
  }

  const chunks: TextChunk[] = [];
  let pos = 0;
  let idx = 0;

  // Pre-calculate line positions for accurate line mapping
  const lineStarts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") lineStarts.push(i + 1);
  }

  function charToLine(charIdx: number): number {
    let line = 1;
    for (let i = 1; i < lineStarts.length; i++) {
      if (lineStarts[i] <= charIdx) line = i + 1;
      else break;
    }
    return line;
  }

  while (pos < text.length) {
    const end = Math.min(pos + CHUNK_MAX_CHARS, text.length);
    // Try to break at newline if within 200 chars of boundary
    let breakAt = end;
    if (end < text.length) {
      const searchStart = Math.max(pos + CHUNK_MAX_CHARS - 200, pos);
      const nextNewline = text.indexOf("\n", searchStart);
      if (nextNewline !== -1 && nextNewline <= end + 100) {
        breakAt = nextNewline + 1;
      }
    }

    const chunkText = text.slice(pos, breakAt);
    chunks.push({
      id: uid("chunk"),
      sourceId,
      index: idx,
      start: pos,
      end: breakAt,
      text: chunkText,
      startLine: charToLine(pos),
      endLine: charToLine(breakAt),
    });

    pos = breakAt - CHUNK_OVERLAP;
    if (pos <= chunks[chunks.length - 1].start) {
      pos = chunks[chunks.length - 1].start + 1000; // prevent infinite loop
    }
    idx++;
  }

  return chunks;
}

/* ── Deterministic Merge & Deduplication ───────────────────────── */

function normalizeForDedup(item: { title: string; content: string }): string {
  return (item.title + "|" + item.content).toLowerCase().replace(/\s+/g, " ").trim();
}

function mergeContextItems(chunks: ChunkExtraction[], field: "facts" | "constraints"): ContextItem[] {
  const seen = new Map<string, ContextItem>();
  for (const cx of chunks) {
    const items = cx[field];
    for (const item of items) {
      const key = normalizeForDedup(item);
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, { ...item, id: uid("item") });
      } else {
        // Merge confidence upward, keep higher confidence
        if (item.confidence > existing.confidence) {
          existing.confidence = item.confidence;
          existing.status = item.status;
        }
        // Merge evidence refs
        const evSet = new Set([...existing.evidenceRefs, ...item.evidenceRefs]);
        existing.evidenceRefs = Array.from(evSet);
      }
    }
  }
  return Array.from(seen.values());
}

function mergeDecisions(chunks: ChunkExtraction[]): DecisionItem[] {
  const seen = new Map<string, DecisionItem>();
  for (const cx of chunks) {
    for (const item of cx.decisions) {
      const key = normalizeForDedup(item);
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, { ...item, id: uid("dec") });
      } else {
        if (item.confidence > existing.confidence) {
          existing.confidence = item.confidence;
          existing.status = item.status;
        }
        const evSet = new Set([...existing.evidenceRefs, ...item.evidenceRefs]);
        existing.evidenceRefs = Array.from(evSet);
        const altSet = new Set([...existing.alternativesRejected, ...item.alternativesRejected]);
        existing.alternativesRejected = Array.from(altSet);
      }
    }
  }
  return Array.from(seen.values());
}

function mergeRisks(chunks: ChunkExtraction[]): RiskItem[] {
  const seen = new Map<string, RiskItem>();
  for (const cx of chunks) {
    for (const item of cx.risks) {
      const key = normalizeForDedup(item);
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, { ...item, id: uid("risk") });
      } else {
        if (item.confidence > existing.confidence) {
          existing.confidence = item.confidence;
          existing.status = item.status;
        }
        // Upgrade severity if needed
        const severityOrder = { low: 1, medium: 2, high: 3 } as const;
        const itemSev = item.severity as keyof typeof severityOrder;
        const existSev = existing.severity as keyof typeof severityOrder;
        if (severityOrder[itemSev] > severityOrder[existSev]) {
          existing.severity = item.severity;
        }
        const evSet = new Set([...existing.evidenceRefs, ...item.evidenceRefs]);
        existing.evidenceRefs = Array.from(evSet);
      }
    }
  }
  return Array.from(seen.values());
}

function mergeNextActions(chunks: ChunkExtraction[]): NextAction[] {
  const seen = new Map<string, NextAction>();
  for (const cx of chunks) {
    for (const item of cx.nextActions) {
      const key = normalizeForDedup(item);
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, { ...item, id: uid("na") });
      } else {
        if (item.confidence > existing.confidence) {
          existing.confidence = item.confidence;
        }
        // Keep higher priority
        const priorityOrder = { P0: 0, P1: 1, P2: 2 } as const;
        const itemPri = item.priority as keyof typeof priorityOrder;
        const existPri = existing.priority as keyof typeof priorityOrder;
        if (priorityOrder[itemPri] < priorityOrder[existPri]) {
          existing.priority = item.priority;
        }
        const evSet = new Set([...existing.evidenceRefs, ...item.evidenceRefs]);
        existing.evidenceRefs = Array.from(evSet);
        const depSet = new Set([...existing.dependencies, ...item.dependencies]);
        existing.dependencies = Array.from(depSet);
      }
    }
  }
  return Array.from(seen.values());
}

function mergeEvidence(chunks: ChunkExtraction[]): EvidenceRef[] {
  const seen = new Map<string, EvidenceRef>();
  for (const cx of chunks) {
    for (const ev of cx.evidence) {
      const key = `${ev.sourceName}:${ev.startLine}:${ev.endLine}:${ev.quote.slice(0, 40)}`;
      if (!seen.has(key)) {
        seen.set(key, { ...ev, id: uid("ev") });
      }
    }
  }
  return Array.from(seen.values());
}

/* ── Conflict Detection ────────────────────────────────────────── */

function detectConflicts(chunks: ChunkExtraction[]): Contradiction[] {
  const contradictions: Contradiction[] = [];

  // Gather all items with their chunk origin
  const allItems: Array<{ title: string; content: string; chunkId: string; type: string }> = [];
  for (const cx of chunks) {
    for (const f of cx.facts) allItems.push({ title: f.title, content: f.content, chunkId: cx.chunkId, type: "fact" });
    for (const d of cx.decisions) allItems.push({ title: d.title, content: d.content, chunkId: cx.chunkId, type: "decision" });
    for (const c of cx.constraints) allItems.push({ title: c.title, content: c.content, chunkId: cx.chunkId, type: "constraint" });
  }

  // Detect same title with different content
  const byTitle = new Map<string, typeof allItems>();
  for (const item of allItems) {
    const key = item.title.toLowerCase().trim();
    if (!byTitle.has(key)) byTitle.set(key, []);
    byTitle.get(key)!.push(item);
  }

  for (const [, items] of byTitle) {
    if (items.length < 2) continue;
    const contents = new Set(items.map((i) => i.content.toLowerCase().trim()));
    if (contents.size > 1) {
      contradictions.push({
        id: uid("con"),
        description: `Conflicting information about "${items[0].title}" across chunks`,
        itemIds: items.map((i) => i.chunkId),
        evidenceRefs: [],
        resolution: "ask_user",
      });
    }
  }

  return contradictions;
}

/* ── Public Merge API ──────────────────────────────────────────── */

export function mergeChunkResults(
  chunks: ChunkExtraction[]
): MergedExtraction & { inputTooLong?: boolean } {
  const merged: MergedExtraction = {
    facts: mergeContextItems(chunks, "facts"),
    decisions: mergeDecisions(chunks),
    constraints: mergeContextItems(chunks, "constraints"),
    risks: mergeRisks(chunks),
    nextActions: mergeNextActions(chunks),
    evidence: mergeEvidence(chunks),
    contradictions: detectConflicts(chunks),
    duplicatesRemoved: 0,
  };

  // Calculate duplicates removed
  let totalInputItems = 0;
  let totalOutputItems = 0;
  for (const cx of chunks) {
    totalInputItems += cx.facts.length + cx.decisions.length + cx.constraints.length + cx.risks.length + cx.nextActions.length;
  }
  totalOutputItems = merged.facts.length + merged.decisions.length + merged.constraints.length + merged.risks.length + merged.nextActions.length;
  merged.duplicatesRemoved = Math.max(0, totalInputItems - totalOutputItems);

  return merged;
}

/* ── Validation Helpers ────────────────────────────────────────── */

export function validateInputLength(text: string): { valid: boolean; error?: string } {
  if (text.length < 200) {
    return { valid: false, error: `Input too short: ${text.length} chars (minimum 200)` };
  }
  if (text.length > ABSOLUTE_MAX_CHARS) {
    return { valid: false, error: `Input too long: ${text.length} chars (maximum ${ABSOLUTE_MAX_CHARS})` };
  }
  return { valid: true };
}
