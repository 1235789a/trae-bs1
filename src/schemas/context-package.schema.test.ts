/**
 * Zod Schema Validation Tests
 */
import { describe, it, expect } from "vitest";
import { CanonicalContextPackageSchema } from "./context-package.schema";

const validPackage = {
  schemaVersion: "1.0",
  packageId: "pkg_test_001",
  generatedAt: "2026-07-13T10:00:00Z",
  task: {
    title: "Test Task",
    desiredOutcome: "Test outcome",
    targetAgent: "coding",
  },
  summary: {
    oneSentence: "Test summary",
    handoffBrief: "Test brief",
  },
  objective: [],
  currentState: [],
  facts: [],
  decisions: [],
  constraints: [],
  preferences: [],
  rejectedOptions: [],
  artifacts: [],
  risks: [],
  openQuestions: [],
  nextActions: [],
  contradictions: [],
  evidence: [],
  readiness: {
    score: 50,
    level: "needs_clarification",
    missing: [],
    explanation: "Test",
  },
  privacyReport: {
    scanned: true,
    findings: [],
    sentToModelAfterRedaction: false,
  },
};

describe("CanonicalContextPackageSchema", () => {
  it("accepts a valid package", () => {
    const result = CanonicalContextPackageSchema.safeParse(validPackage);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const { packageId: _packageId, ...rest } = validPackage;
    void _packageId; // used for destructuring
    const result = CanonicalContextPackageSchema.safeParse(rest);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("packageId");
    }
  });

  it("rejects invalid targetAgent", () => {
    const invalid = {
      ...validPackage,
      task: { ...validPackage.task, targetAgent: "invalid_agent" },
    };
    const result = CanonicalContextPackageSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("task.targetAgent");
    }
  });

  it("rejects readiness score above 100", () => {
    const invalid = {
      ...validPackage,
      readiness: { ...validPackage.readiness, score: 150 },
    };
    const result = CanonicalContextPackageSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("readiness.score");
    }
  });

  it("rejects readiness score below 0", () => {
    const invalid = {
      ...validPackage,
      readiness: { ...validPackage.readiness, score: -5 },
    };
    const result = CanonicalContextPackageSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("readiness.score");
    }
  });

  it("rejects invalid evidence line numbers", () => {
    const invalid = {
      ...validPackage,
      evidence: [
        {
          id: "ev_1",
          sourceName: "test",
          startLine: -1,
          endLine: 5,
          quote: "test",
        },
      ],
    };
    const result = CanonicalContextPackageSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("evidence.0.startLine");
    }
  });

  it("rejects invalid confidence values", () => {
    const invalid = {
      ...validPackage,
      facts: [
        {
          id: "f_1",
          title: "Test",
          content: "Test content",
          status: "confirmed",
          confidence: 1.5,
          evidenceRefs: [],
        },
      ],
    };
    const result = CanonicalContextPackageSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("facts.0.confidence");
    }
  });

  it("rejects invalid item status", () => {
    const invalid = {
      ...validPackage,
      facts: [
        {
          id: "f_1",
          title: "Test",
          content: "Test content",
          status: "wrong_status",
          confidence: 0.8,
          evidenceRefs: [],
        },
      ],
    };
    const result = CanonicalContextPackageSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("facts.0.status");
    }
  });

  it("rejects invalid severity in risk items", () => {
    const invalid = {
      ...validPackage,
      risks: [
        {
          id: "r_1",
          title: "Test",
          content: "Test",
          status: "confirmed",
          confidence: 0.8,
          severity: "critical",
          evidenceRefs: [],
        },
      ],
    };
    const result = CanonicalContextPackageSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("risks.0.severity");
    }
  });

  it("rejects invalid priority in nextActions", () => {
    const invalid = {
      ...validPackage,
      nextActions: [
        {
          id: "na_1",
          title: "Test",
          content: "Test",
          status: "confirmed",
          confidence: 0.8,
          priority: "P3",
          owner: "user",
          doneWhen: "Done",
          dependencies: [],
          evidenceRefs: [],
        },
      ],
    };
    const result = CanonicalContextPackageSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("nextActions.0.priority");
    }
  });

  it("rejects invalid contradiction resolution", () => {
    const invalid = {
      ...validPackage,
      contradictions: [
        {
          id: "con_1",
          description: "Test",
          itemIds: [],
          evidenceRefs: [],
          resolution: "ignore",
        },
      ],
    };
    const result = CanonicalContextPackageSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("contradictions.0.resolution");
    }
  });
});
