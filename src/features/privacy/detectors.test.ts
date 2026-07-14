/**
 * Privacy Detection & Redaction Tests
 */
import { describe, it, expect } from "vitest";
import { scanText, applyRedactions } from "./detectors";

describe("scanText", () => {
  it("detects OpenAI API keys", () => {
    const text = "My API key is sk-abcdefghijklmnopqrstuvwxyz123456";
    const findings = scanText(text);
    expect(findings.length).toBeGreaterThanOrEqual(1);
    expect(findings.some((f) => f.type === "api_key")).toBe(true);
  });

  it("detects GitHub tokens", () => {
    const text = "GitHub token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
    const findings = scanText(text);
    expect(findings.some((f) => f.type === "github_token")).toBe(true);
  });

  it("detects private keys", () => {
    const text = "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...";
    const findings = scanText(text);
    expect(findings.some((f) => f.type === "private_key")).toBe(true);
  });

  it("detects passwords", () => {
    const text = "password: SuperSecret123!";
    const findings = scanText(text);
    expect(findings.some((f) => f.type === "password")).toBe(true);
  });

  it("detects emails", () => {
    const text = "Contact me at user@example.com for details.";
    const findings = scanText(text);
    expect(findings.some((f) => f.type === "email")).toBe(true);
  });

  it("detects phone numbers", () => {
    const text = "Call me at 13812345678.";
    const findings = scanText(text);
    expect(findings.some((f) => f.type === "phone")).toBe(true);
  });

  it("detects ID numbers", () => {
    const text = "ID: 110101199001011234";
    const findings = scanText(text);
    expect(findings.some((f) => f.type === "id_number")).toBe(true);
  });

  it("detects wallet addresses", () => {
    const text = "ETH: 0x0000000000000000000000000000000000000000";
    const findings = scanText(text);
    expect(findings.some((f) => f.type === "wallet_address")).toBe(true);
  });

  it("assigns high severity to API keys and auto-redacts", () => {
    const text = "sk-1234567890123456789012345";
    const findings = scanText(text);
    const apiKeyFinding = findings.find((f) => f.type === "api_key");
    expect(apiKeyFinding).toBeDefined();
    expect(apiKeyFinding!.severity).toBe("high");
    expect(apiKeyFinding!.action).toBe("redacted");
  });

  it("assigns low severity to emails and leaves pending", () => {
    const text = "Email: test@example.com";
    const findings = scanText(text);
    const emailFinding = findings.find((f) => f.type === "email");
    expect(emailFinding).toBeDefined();
    expect(emailFinding!.severity).toBe("low");
    expect(emailFinding!.action).toBe("pending");
  });

  it("returns empty array for clean text", () => {
    const text = "This is a completely safe text with no sensitive information at all.";
    const findings = scanText(text);
    expect(findings).toHaveLength(0);
  });

  it("sorts findings by start position", () => {
    const text = "Email: a@b.com and phone: 13812345678";
    const findings = scanText(text);
    for (let i = 1; i < findings.length; i++) {
      expect(findings[i].start).toBeGreaterThanOrEqual(findings[i - 1].start);
    }
  });
});

describe("applyRedactions", () => {
  it("replaces redacted findings with masked preview", () => {
    const text = "API key: sk-abc1234567890 and email: user@example.com";
    const findings = scanText(text);
    // Mark email as redacted too for testing
    const allRedacted = findings.map((f) => ({ ...f, action: "redacted" as const }));
    const result = applyRedactions(text, allRedacted);
    expect(result).not.toContain("sk-abc1234567890");
    expect(result).not.toContain("user@example.com");
    expect(result).toContain("[REDACTED]");
  });

  it("preserves text when no redactions", () => {
    const text = "Safe text without secrets";
    const findings = scanText(text);
    const result = applyRedactions(text, findings);
    expect(result).toBe(text);
  });

  it("handles multiple redactions correctly", () => {
    const text = "password: secret123 and api: sk-12345678901234567890 and email: x@y.com";
    const findings = scanText(text).map((f) => ({ ...f, action: "redacted" as const }));
    const result = applyRedactions(text, findings);
    expect(result).not.toContain("secret123");
    expect(result).not.toContain("sk-12345678901234567890");
    expect(result).not.toContain("x@y.com");
  });
});
