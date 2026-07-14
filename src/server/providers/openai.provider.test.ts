/**
 * OpenAI Provider Tests
 * - JSON extraction & repair
 * - Live provider with mock HTTP
 * - Error handling: not configured, timeout, rate limit, model errors
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  extractJson,
  tryRepairJson,
  compileWithLLM,
  isLiveProviderConfigured,
} from "./openai.provider";
import type { CompileRequest } from "@/schemas/request.schema";

const validRequest: CompileRequest = {
  task: {
    title: "Test Task",
    desiredOutcome: "Test outcome",
    targetAgent: "coding",
    outputLanguage: "zh-CN",
  },
  source: {
    text: "A".repeat(500),
    sourceName: "test-source",
    sourceType: "mixed",
  },
  privacy: {
    redacted: false,
    acknowledgedFindingIds: [],
  },
  options: {
    detailLevel: "standard",
    includeEvidence: true,
  },
};

const mockValidResponse = {
  schemaVersion: "1.0",
  packageId: "pkg_mock",
  generatedAt: "2026-07-13T10:00:00Z",
  task: {
    title: "Test",
    desiredOutcome: "Test",
    targetAgent: "coding",
  },
  summary: { oneSentence: "Test", handoffBrief: "Test" },
  objective: [],
  currentState: [],
  facts: [
    {
      id: "f_1",
      title: "Fact 1",
      content: "Content",
      status: "confirmed",
      confidence: 0.9,
      evidenceRefs: ["ev_1"],
    },
  ],
  decisions: [],
  constraints: [],
  preferences: [],
  rejectedOptions: [],
  artifacts: [],
  risks: [],
  openQuestions: [],
  nextActions: [],
  contradictions: [],
  evidence: [
    { id: "ev_1", sourceName: "test", startLine: 1, endLine: 2, quote: "quote" },
  ],
  readiness: { score: 80, level: "ready", missing: [], explanation: "Good" },
  privacyReport: { scanned: true, findings: [], sentToModelAfterRedaction: false },
};

describe("extractJson", () => {
  it("extracts JSON from markdown code block", () => {
    const raw = '```json\n{"key": "value"}\n```';
    expect(extractJson(raw)).toBe('{"key": "value"}');
  });

  it("extracts JSON from plain code block", () => {
    const raw = '```\n{"key": "value"}\n```';
    expect(extractJson(raw)).toBe('{"key": "value"}');
  });

  it("extracts JSON without code block", () => {
    const raw = 'Some text\n{"key": "value"}\nMore text';
    expect(extractJson(raw)).toBe('{"key": "value"}');
  });

  it("returns raw string if no JSON found", () => {
    const raw = "Just plain text without braces";
    expect(extractJson(raw)).toBe(raw);
  });
});

describe("tryRepairJson", () => {
  it("repairs trailing commas", () => {
    const broken = '{"a": 1,}';
    const fixed = tryRepairJson(broken);
    expect(fixed).toBe('{"a": 1}');
    expect(() => JSON.parse(fixed!)).not.toThrow();
  });

  it("repairs single quotes", () => {
    const broken = "{'a': 1}";
    const fixed = tryRepairJson(broken);
    expect(() => JSON.parse(fixed!)).not.toThrow();
  });

  it("repairs control characters", () => {
    const broken = '{"a": "hello\x00world"}';
    const fixed = tryRepairJson(broken);
    expect(() => JSON.parse(fixed!)).not.toThrow();
  });

  it("returns null for unrepairable JSON", () => {
    const broken = "{ completely broken json [[[";
    expect(tryRepairJson(broken)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(tryRepairJson("")).toBeNull();
  });
});

describe("isLiveProviderConfigured", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns false when AI_API_KEY is not set", () => {
    delete process.env.AI_API_KEY;
    expect(isLiveProviderConfigured()).toBe(false);
  });

  it("returns true when AI_API_KEY is set", () => {
    process.env.AI_API_KEY = "sk-test-key";
    expect(isLiveProviderConfigured()).toBe(true);
  });

  it("returns false for empty string AI_API_KEY", () => {
    process.env.AI_API_KEY = "";
    expect(isLiveProviderConfigured()).toBe(false);
  });
});

describe("compileWithLLM", () => {
  const originalEnv = process.env;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env = { ...originalEnv };
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("throws PROVIDER_NOT_CONFIGURED when API key is missing", async () => {
    delete process.env.AI_API_KEY;
    await expect(compileWithLLM(validRequest)).rejects.toThrow("PROVIDER_NOT_CONFIGURED");
  });

  it("throws VALIDATION_ERROR when input is too short", async () => {
    process.env.AI_API_KEY = "sk-test";
    const shortRequest = {
      ...validRequest,
      source: { ...validRequest.source, text: "short" },
    };
    await expect(compileWithLLM(shortRequest)).rejects.toThrow("VALIDATION_ERROR");
  });

  it("throws VALIDATION_ERROR when input exceeds max length", async () => {
    process.env.AI_API_KEY = "sk-test";
    const longRequest = {
      ...validRequest,
      source: { ...validRequest.source, text: "A".repeat(70_000) },
    };
    await expect(compileWithLLM(longRequest)).rejects.toThrow("VALIDATION_ERROR");
  });

  it("returns live mode and package on successful API call", async () => {
    process.env.AI_API_KEY = "sk-test";
    process.env.AI_BASE_URL = "https://api.openai.com";

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockValidResponse) } }],
      }),
    });

    const result = await compileWithLLM(validRequest);
    expect(result.mode).toBe("live");
    expect(result.pkg).toBeDefined();
    expect(result.pkg.facts.length).toBeGreaterThan(0);
  });

  it("handles MODEL_TIMEOUT by throwing MODEL_TIMEOUT", async () => {
    process.env.AI_API_KEY = "sk-test";
    process.env.AI_BASE_URL = "https://api.openai.com";

    fetchMock.mockImplementationOnce(() => {
      const err = new Error("AbortError");
      err.name = "AbortError";
      return Promise.reject(err);
    });

    await expect(compileWithLLM(validRequest, 1)).rejects.toThrow("MODEL_TIMEOUT");
  });

  it("handles HTTP 429 rate limit error", async () => {
    process.env.AI_API_KEY = "sk-test";
    process.env.AI_BASE_URL = "https://api.openai.com";

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => "Rate limit exceeded",
    });

    await expect(compileWithLLM(validRequest)).rejects.toThrow("MODEL_HTTP_429");
  });

  it("handles HTTP 500 model error", async () => {
    process.env.AI_API_KEY = "sk-test";
    process.env.AI_BASE_URL = "https://api.openai.com";

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal server error",
    });

    await expect(compileWithLLM(validRequest)).rejects.toThrow("MODEL_HTTP_500");
  });

  it("repairs broken JSON and returns repaired=true", async () => {
    process.env.AI_API_KEY = "sk-test";
    process.env.AI_BASE_URL = "https://api.openai.com";

    // Create broken JSON with trailing comma before closing brace
    const rawJson = JSON.stringify(mockValidResponse);
    const brokenJson = rawJson.slice(0, -1) + ",}";
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: brokenJson } }],
      }),
    });

    const result = await compileWithLLM(validRequest);
    expect(result.repaired).toBe(true);
    expect(result.pkg).toBeDefined();
  });

  it("throws JSON_PARSE_FAILED for unrepairable JSON", async () => {
    process.env.AI_API_KEY = "sk-test";
    process.env.AI_BASE_URL = "https://api.openai.com";

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "not json at all" } }],
      }),
    });

    await expect(compileWithLLM(validRequest)).rejects.toThrow("JSON_PARSE_FAILED");
  });

  it("throws SCHEMA_INVALID for JSON missing required fields", async () => {
    process.env.AI_API_KEY = "sk-test";
    process.env.AI_BASE_URL = "https://api.openai.com";

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"invalid": true}' } }],
      }),
    });

    await expect(compileWithLLM(validRequest)).rejects.toThrow("SCHEMA_INVALID");
  });

  it("normalizes base URL without /v1 suffix", async () => {
    process.env.AI_API_KEY = "sk-test";
    process.env.AI_BASE_URL = "https://custom.api.com";

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockValidResponse) } }],
      }),
    });

    await compileWithLLM(validRequest);
    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[0]).toBe("https://custom.api.com/v1/chat/completions");
  });

  it("normalizes base URL with /v1 suffix", async () => {
    process.env.AI_API_KEY = "sk-test";
    process.env.AI_BASE_URL = "https://custom.api.com/v1";

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockValidResponse) } }],
      }),
    });

    await compileWithLLM(validRequest);
    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[0]).toBe("https://custom.api.com/v1/chat/completions");
  });

  it("strips trailing slashes from base URL", async () => {
    process.env.AI_API_KEY = "sk-test";
    process.env.AI_BASE_URL = "https://custom.api.com///";

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockValidResponse) } }],
      }),
    });

    await compileWithLLM(validRequest);
    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[0]).toBe("https://custom.api.com/v1/chat/completions");
  });

  it("does not include API key in error messages", async () => {
    process.env.AI_API_KEY = "sk-super-secret-key-12345";
    process.env.AI_BASE_URL = "https://api.openai.com";

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => "Bad request",
    });

    try {
      await compileWithLLM(validRequest);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      expect(msg).not.toContain("sk-super-secret-key");
    }
  });
});
