/**
 * Chunk Processor Tests
 * - Text splitting with sourceId, paragraph index, char ranges
 * - Evidence remapping
 * - Merge, deduplication, conflict detection
 * - Input validation
 */
import { describe, it, expect } from "vitest";
import {
  splitText,
  mergeChunkResults,
  validateInputLength,
  CHUNK_MAX_CHARS,
  ABSOLUTE_MAX_CHARS,
  type ChunkExtraction,
} from "./chunk-processor";

function makeExtraction(overrides: Partial<ChunkExtraction> = {}): ChunkExtraction {
  return {
    chunkId: "chunk_1",
    facts: [],
    decisions: [],
    constraints: [],
    risks: [],
    nextActions: [],
    evidence: [],
    ...overrides,
  };
}

describe("validateInputLength", () => {
  it("accepts text within valid range", () => {
    const text = "A".repeat(1000);
    const result = validateInputLength(text);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("rejects text below minimum", () => {
    const text = "short";
    const result = validateInputLength(text);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("minimum 200");
  });

  it("rejects text above maximum", () => {
    const text = "A".repeat(ABSOLUTE_MAX_CHARS + 1);
    const result = validateInputLength(text);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("maximum 60000");
  });
});

describe("splitText", () => {
  it("returns single chunk for short text", () => {
    const text = "Hello world\nLine 2\nLine 3";
    const chunks = splitText(text, "src1");
    expect(chunks).toHaveLength(1);
    expect(chunks[0].sourceId).toBe("src1");
    expect(chunks[0].index).toBe(0);
    expect(chunks[0].start).toBe(0);
    expect(chunks[0].end).toBe(text.length);
    expect(chunks[0].startLine).toBe(1);
    expect(chunks[0].endLine).toBe(3);
  });

  it("splits long text into multiple chunks", () => {
    const text = "A".repeat(CHUNK_MAX_CHARS * 2 + 1000);
    const chunks = splitText(text, "src2");
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].sourceId).toBe("src2");
    expect(chunks[0].index).toBe(0);
    expect(chunks[1].index).toBe(1);
  });

  it("maintains char range continuity with overlap", () => {
    const text = "A".repeat(CHUNK_MAX_CHARS * 2 + 1000);
    const chunks = splitText(text, "src3");
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i].start).toBeLessThan(chunks[i - 1].end);
      expect(chunks[i].start).toBeGreaterThan(chunks[i - 1].start);
    }
  });

  it("throws for text exceeding absolute max", () => {
    const text = "A".repeat(ABSOLUTE_MAX_CHARS + 1);
    expect(() => splitText(text, "src4")).toThrow("INPUT_TOO_LONG");
  });

  it("tracks line numbers correctly", () => {
    const lines = Array.from({ length: 1000 }, (_, i) => `Line ${i + 1}`);
    const text = lines.join("\n");
    const chunks = splitText(text, "src5");
    expect(chunks[0].startLine).toBe(1);
    expect(chunks[0].endLine).toBeGreaterThanOrEqual(1);
    if (chunks.length > 1) {
      expect(chunks[1].startLine).toBeGreaterThan(chunks[0].startLine);
    }
  });

  it("assigns stable sourceIds to all chunks", () => {
    const text = "A".repeat(CHUNK_MAX_CHARS * 3);
    const chunks = splitText(text, "stable-src");
    for (const chunk of chunks) {
      expect(chunk.sourceId).toBe("stable-src");
    }
  });
});

describe("mergeChunkResults", () => {
  it("merges facts from multiple chunks", () => {
    const c1 = makeExtraction({
      chunkId: "c1",
      facts: [
        { id: "f1", title: "Fact A", content: "Content A", status: "confirmed", confidence: 0.8, evidenceRefs: ["ev1"] },
      ],
    });
    const c2 = makeExtraction({
      chunkId: "c2",
      facts: [
        { id: "f2", title: "Fact B", content: "Content B", status: "confirmed", confidence: 0.9, evidenceRefs: ["ev2"] },
      ],
    });
    const merged = mergeChunkResults([c1, c2]);
    expect(merged.facts).toHaveLength(2);
  });

  it("deduplicates identical facts", () => {
    const c1 = makeExtraction({
      chunkId: "c1",
      facts: [
        { id: "f1", title: "Same Fact", content: "Same Content", status: "confirmed", confidence: 0.8, evidenceRefs: ["ev1"] },
      ],
    });
    const c2 = makeExtraction({
      chunkId: "c2",
      facts: [
        { id: "f2", title: "Same Fact", content: "Same Content", status: "confirmed", confidence: 0.9, evidenceRefs: ["ev2"] },
      ],
    });
    const merged = mergeChunkResults([c1, c2]);
    expect(merged.facts).toHaveLength(1);
    expect(merged.duplicatesRemoved).toBe(1);
  });

  it("merges confidence upward on duplicates", () => {
    const c1 = makeExtraction({
      chunkId: "c1",
      facts: [
        { id: "f1", title: "Same", content: "Same", status: "confirmed", confidence: 0.7, evidenceRefs: [] },
      ],
    });
    const c2 = makeExtraction({
      chunkId: "c2",
      facts: [
        { id: "f2", title: "Same", content: "Same", status: "inferred", confidence: 0.9, evidenceRefs: [] },
      ],
    });
    const merged = mergeChunkResults([c1, c2]);
    expect(merged.facts[0].confidence).toBe(0.9);
    expect(merged.facts[0].status).toBe("inferred");
  });

  it("merges evidence refs on duplicates", () => {
    const c1 = makeExtraction({
      chunkId: "c1",
      facts: [
        { id: "f1", title: "Same", content: "Same", status: "confirmed", confidence: 0.8, evidenceRefs: ["ev1"] },
      ],
    });
    const c2 = makeExtraction({
      chunkId: "c2",
      facts: [
        { id: "f2", title: "Same", content: "Same", status: "confirmed", confidence: 0.8, evidenceRefs: ["ev2"] },
      ],
    });
    const merged = mergeChunkResults([c1, c2]);
    expect(merged.facts[0].evidenceRefs).toContain("ev1");
    expect(merged.facts[0].evidenceRefs).toContain("ev2");
  });

  it("upgrades risk severity on duplicates", () => {
    const c1 = makeExtraction({
      chunkId: "c1",
      risks: [
        { id: "r1", title: "Risk A", content: "Content", status: "confirmed", confidence: 0.8, severity: "low", evidenceRefs: [] },
      ],
    });
    const c2 = makeExtraction({
      chunkId: "c2",
      risks: [
        { id: "r2", title: "Risk A", content: "Content", status: "confirmed", confidence: 0.8, severity: "high", evidenceRefs: [] },
      ],
    });
    const merged = mergeChunkResults([c1, c2]);
    expect(merged.risks).toHaveLength(1);
    expect(merged.risks[0].severity).toBe("high");
  });

  it("keeps higher priority on duplicate actions", () => {
    const c1 = makeExtraction({
      chunkId: "c1",
      nextActions: [
        { id: "na1", title: "Action", content: "Content", status: "confirmed", confidence: 0.8, priority: "P2", owner: "user", doneWhen: "Done", dependencies: [], evidenceRefs: [] },
      ],
    });
    const c2 = makeExtraction({
      chunkId: "c2",
      nextActions: [
        { id: "na2", title: "Action", content: "Content", status: "confirmed", confidence: 0.8, priority: "P0", owner: "user", doneWhen: "Done", dependencies: [], evidenceRefs: [] },
      ],
    });
    const merged = mergeChunkResults([c1, c2]);
    expect(merged.nextActions).toHaveLength(1);
    expect(merged.nextActions[0].priority).toBe("P0");
  });

  it("detects conflicts across chunks", () => {
    const c1 = makeExtraction({
      chunkId: "c1",
      facts: [
        { id: "f1", title: "Conflicting", content: "Version A", status: "confirmed", confidence: 0.8, evidenceRefs: [] },
      ],
    });
    const c2 = makeExtraction({
      chunkId: "c2",
      facts: [
        { id: "f2", title: "Conflicting", content: "Version B", status: "confirmed", confidence: 0.8, evidenceRefs: [] },
      ],
    });
    const merged = mergeChunkResults([c1, c2]);
    expect(merged.contradictions.length).toBeGreaterThan(0);
    expect(merged.contradictions[0].resolution).toBe("ask_user");
  });

  it("deduplicates evidence by position and quote", () => {
    const c1 = makeExtraction({
      chunkId: "c1",
      evidence: [
        { id: "ev1", sourceName: "src", startLine: 1, endLine: 2, quote: "same quote here" },
      ],
    });
    const c2 = makeExtraction({
      chunkId: "c2",
      evidence: [
        { id: "ev2", sourceName: "src", startLine: 1, endLine: 2, quote: "same quote here" },
      ],
    });
    const merged = mergeChunkResults([c1, c2]);
    expect(merged.evidence).toHaveLength(1);
  });

  it("keeps distinct evidence separate", () => {
    const c1 = makeExtraction({
      chunkId: "c1",
      evidence: [
        { id: "ev1", sourceName: "src", startLine: 1, endLine: 2, quote: "quote one" },
      ],
    });
    const c2 = makeExtraction({
      chunkId: "c2",
      evidence: [
        { id: "ev2", sourceName: "src", startLine: 3, endLine: 4, quote: "quote two" },
      ],
    });
    const merged = mergeChunkResults([c1, c2]);
    expect(merged.evidence).toHaveLength(2);
  });

  it("merges decision alternatives on duplicates", () => {
    const c1 = makeExtraction({
      chunkId: "c1",
      decisions: [
        { id: "d1", title: "Decision", content: "Content", status: "confirmed", confidence: 0.8, rationale: "Because", alternativesRejected: ["A"], downstreamEffects: [], evidenceRefs: [] },
      ],
    });
    const c2 = makeExtraction({
      chunkId: "c2",
      decisions: [
        { id: "d2", title: "Decision", content: "Content", status: "confirmed", confidence: 0.8, rationale: "Because", alternativesRejected: ["B"], downstreamEffects: [], evidenceRefs: [] },
      ],
    });
    const merged = mergeChunkResults([c1, c2]);
    expect(merged.decisions).toHaveLength(1);
    expect(merged.decisions[0].alternativesRejected).toContain("A");
    expect(merged.decisions[0].alternativesRejected).toContain("B");
  });

  it("calculates duplicatesRemoved correctly", () => {
    const c1 = makeExtraction({
      chunkId: "c1",
      facts: [
        { id: "f1", title: "Same", content: "Same", status: "confirmed", confidence: 0.8, evidenceRefs: [] },
      ],
    });
    const c2 = makeExtraction({
      chunkId: "c2",
      facts: [
        { id: "f2", title: "Same", content: "Same", status: "confirmed", confidence: 0.8, evidenceRefs: [] },
      ],
    });
    const merged = mergeChunkResults([c1, c2]);
    expect(merged.duplicatesRemoved).toBe(1);
  });
});
