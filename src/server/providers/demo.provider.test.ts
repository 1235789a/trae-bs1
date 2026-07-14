/**
 * Demo Provider Tests
 */
import { describe, it, expect } from "vitest";
import { compileDemo } from "./demo.provider";
import { CanonicalContextPackageSchema } from "@/schemas/context-package.schema";

describe("compileDemo", () => {
  it("returns a valid CanonicalContextPackage", () => {
    const pkg = compileDemo();
    const result = CanonicalContextPackageSchema.safeParse(pkg);
    expect(result.success).toBe(true);
  });

  it("has expected demo fields", () => {
    const pkg = compileDemo();
    expect(pkg.packageId).toBe("pkg_demo_trae_001");
    expect(pkg.task.title).toBe("ContextMirror P0 Demo");
    expect(pkg.task.targetAgent).toBe("coding");
  });

  it("contains non-empty arrays for key sections", () => {
    const pkg = compileDemo();
    expect(pkg.facts.length).toBeGreaterThan(0);
    expect(pkg.decisions.length).toBeGreaterThan(0);
    expect(pkg.constraints.length).toBeGreaterThan(0);
    expect(pkg.risks.length).toBeGreaterThan(0);
    expect(pkg.nextActions.length).toBeGreaterThan(0);
    expect(pkg.evidence.length).toBeGreaterThan(0);
  });

  it("has valid readiness score within range", () => {
    const pkg = compileDemo();
    expect(pkg.readiness.score).toBeGreaterThanOrEqual(0);
    expect(pkg.readiness.score).toBeLessThanOrEqual(100);
  });

  it("has privacy findings in demo fixture", () => {
    const pkg = compileDemo();
    expect(pkg.privacyReport.scanned).toBe(true);
    expect(pkg.privacyReport.findings.length).toBeGreaterThan(0);
  });
});
