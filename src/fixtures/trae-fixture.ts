/**
 * Built-in fixture: TRAE contest project handoff scenario
 * This is the ONLY built-in example for Demo mode
 * Used when no API key is configured
 */
import type { CanonicalContextPackage } from "@/schemas/context-package.schema";

export const TRAE_FIXTURE: CanonicalContextPackage = {
  schemaVersion: "1.0",
  packageId: "pkg_demo_trae_001",
  generatedAt: "2026-07-13T10:00:00Z",
  task: {
    title: "ContextMirror P0 Demo",
    desiredOutcome: "Ship a deployable web app that compiles messy AI collaboration history into structured agent context packs",
    targetAgent: "coding",
  },
  summary: {
    oneSentence: "Build an Agent Handoff Compiler that turns long conversations into executable context packs.",
    handoffBrief:
      "ContextMirror is a compiler (not a summarizer) that extracts facts, decisions, constraints, risks and next-actions from messy project discussions into a structured CanonicalContextPackage.",
  },
  objective: [
    { id: "obj_1", title: "Core positioning", content: "Not a summarizer, but an executable handoff compiler", status: "confirmed", confidence: 1, evidenceRefs: ["ev_1"], impact: "Defines product boundary and all output formats" },
    { id: "obj_2", title: "Competition track", content: "Learning & Productivity track, solving context fragmentation in AI collaboration", status: "confirmed", confidence: 1, evidenceRefs: ["ev_2"] },
  ],
  currentState: [
    { id: "cs_1", title: "Development phase", content: "Requirements frozen, tech stack decided, entering coding", status: "confirmed", confidence: 0.95, evidenceRefs: ["ev_3"] },
    { id: "cs_2", title: "Time budget", content: "48 hours total", status: "confirmed", confidence: 0.9, evidenceRefs: ["ev_4"] },
  ],
  facts: [
    { id: "f_1", title: "Tech stack", content: "Next.js App Router + TypeScript + Tailwind CSS + Vercel", status: "confirmed", confidence: 1, evidenceRefs: ["ev_5"] },
    { id: "f_2", title: "Model interface", content: "OpenAI-compatible adapter, not locked to single vendor", status: "confirmed", confidence: 1, evidenceRefs: ["ev_6"] },
    { id: "f_3", title: "Privacy strategy", content: "Browser-side sensitive info scan, server never logs raw context", status: "confirmed", confidence: 1, evidenceRefs: ["ev_7"] },
    { id: "f_4", title: "No database", content: "P0 uses browser storage and memory only", status: "confirmed", confidence: 0.95, evidenceRefs: ["ev_8"] },
  ],
  decisions: [
    {
      id: "d_1", title: "Product renamed from summarizer to compiler",
      content: "Explicitly position as Agent Handoff Compiler, not a text summarizer",
      status: "confirmed", confidence: 0.9, evidenceRefs: ["ev_9"],
      rationale: "Summaries tell what was said; compilers tell the next agent how to do things right",
      alternativesRejected: ["Long text summarizer", "Prompt store"],
      downstreamEffects: ["All 6 output tabs redesigned", "Homepage copy changed"],
    },
    {
      id: "d_2", title: "Six output formats",
      content: "Context Pack, Agent Prompt, Decision Graph, Mind Map, Risk Check, JSON/YAML",
      status: "confirmed", confidence: 1, evidenceRefs: ["ev_10"],
      rationale: "Covers human-readable, visual, and machine-readable handoff scenarios",
      alternativesRejected: ["Markdown export only", "Visual only no text"],
      downstreamEffects: ["Higher frontend complexity", "Canonical Package as single source of truth"],
    },
    {
      id: "d_3", title: "Demo fallback",
      content: "Built-in fixtures when no API key, clear UI label for demo mode",
      status: "confirmed", confidence: 1, evidenceRefs: ["ev_11"],
      rationale: "Judges and users can fully experience the product without any configuration",
      alternativesRejected: ["Require API key setup", "Fake results for free input"],
      downstreamEffects: ["Need high-quality fixtures", "Explicit demo/live mode indicator"],
    },
  ],
  constraints: [
    { id: "c_1", title: "Privacy红线", content: "API keys only in server env vars, raw context never in URLs or logs", status: "confirmed", confidence: 1, evidenceRefs: ["ev_12"], impact: "Affects deployment config and logging strategy" },
    { id: "c_2", title: "Time limit", content: "48 hours, last day is bugfix only", status: "confirmed", confidence: 1, evidenceRefs: ["ev_13"], impact: "Strict priority slicing required" },
    { id: "c_3", title: "Tech scope", content: "No database, no user auth, no browser extension in P0", status: "confirmed", confidence: 1, evidenceRefs: ["ev_14"], impact: "All state managed client-side" },
  ],
  preferences: [
    { id: "p_1", title: "UI style", content: "Clean, professional, workbench feel, not a marketing landing page", status: "confirmed", confidence: 0.9, evidenceRefs: ["ev_15"] },
  ],
  rejectedOptions: [
    { id: "r_1", title: "No Prompt Store", content: "Unrelated to core positioning", status: "confirmed", confidence: 1, evidenceRefs: ["ev_16"] },
  ],
  artifacts: [
    { id: "a_1", title: "Architecture blueprint", content: "ContextMirror engineering architecture and acceptance criteria document", status: "confirmed", confidence: 1, evidenceRefs: ["ev_17"], uri: "project-docs/architecture-v1.md" },
  ],
  risks: [
    { id: "rk_1", title: "Unstable model output", content: "AI may return invalid JSON", severity: "high", status: "confirmed", confidence: 0.85, evidenceRefs: ["ev_18"], mitigation: "JSON repair + retry, Demo fallback" },
    { id: "rk_2", title: "Graph rendering perf", content: "Too many nodes may cause lag", severity: "medium", status: "confirmed", confidence: 0.8, evidenceRefs: ["ev_19"], mitigation: "Cap at 35 nodes, collapse low-priority" },
  ],
  openQuestions: [
    { id: "q_1", title: "Chunking strategy", content: "How to handle texts over 18000 chars?", status: "inferred", confidence: 0.6, evidenceRefs: ["ev_20"] },
  ],
  nextActions: [
    { id: "na_1", title: "Scaffold project", content: "Init Next.js + TS + Tailwind, configure directory structure", priority: "P0", owner: "next_agent", status: "confirmed", confidence: 1, evidenceRefs: ["ev_21"], doneWhen: "Project runs, all pages accessible", dependencies: [] },
    { id: "na_2", title: "Privacy scanner", content: "Client-side sensitive info detection, redaction, server validation", priority: "P0", owner: "next_agent", status: "confirmed", confidence: 1, evidenceRefs: ["ev_22"], doneWhen: "Test tokens never reach compile endpoint", dependencies: ["na_1"] },
    { id: "na_3", title: "Compile API", content: "Request schema, provider interface, LLM integration, Zod validation", priority: "P0", owner: "next_agent", status: "confirmed", confidence: 1, evidenceRefs: ["ev_23"], doneWhen: "Two different inputs produce different structured outputs", dependencies: ["na_1", "na_2"] },
    { id: "na_4", title: "Six output views", content: "Context Pack, Prompt, Graph, Mind Map, Risk, Export", priority: "P0", owner: "next_agent", status: "confirmed", confidence: 1, evidenceRefs: ["ev_24"], doneWhen: "All six outputs derive from one Package, no contradictions", dependencies: ["na_3"] },
  ],
  contradictions: [
    { id: "con_1", description: "Product renamed from summarizer to compiler, some historical discussions use old terms", itemIds: ["obj_1", "d_1"], evidenceRefs: ["ev_9"], resolution: "prefer_latest" },
  ],
  evidence: [
    { id: "ev_1", sourceName: "Discussion", startLine: 8, endLine: 10, quote: "Not a summarizer, but executable handoff" },
    { id: "ev_2", sourceName: "Discussion", startLine: 1, endLine: 3, quote: "Contest project, AI agent context handoff" },
    { id: "ev_3", sourceName: "Meeting notes", startLine: 5, endLine: 7, quote: "Requirements frozen, tech stack decided" },
    { id: "ev_4", sourceName: "Discussion", startLine: 45, endLine: 47, quote: "48 hours" },
    { id: "ev_5", sourceName: "Discussion", startLine: 18, endLine: 20, quote: "Next.js + TypeScript + Tailwind" },
    { id: "ev_6", sourceName: "Discussion", startLine: 18, endLine: 20, quote: "OpenAI-compatible interface" },
    { id: "ev_7", sourceName: "Discussion", startLine: 25, endLine: 28, quote: "Browser-side scan for sensitive info" },
    { id: "ev_8", sourceName: "Meeting notes", startLine: 9, endLine: 11, quote: "No database, browser storage only" },
    { id: "ev_9", sourceName: "Discussion", startLine: 55, endLine: 58, quote: "Changed goal from summarizer to compiler" },
    { id: "ev_10", sourceName: "Discussion", startLine: 32, endLine: 38, quote: "Six tabs" },
    { id: "ev_11", sourceName: "Discussion", startLine: 22, endLine: 24, quote: "Need demo mode without API key" },
    { id: "ev_12", sourceName: "Discussion", startLine: 25, endLine: 28, quote: "Server must not log raw context" },
    { id: "ev_13", sourceName: "Discussion", startLine: 45, endLine: 47, quote: "48 hours" },
    { id: "ev_14", sourceName: "Meeting notes", startLine: 9, endLine: 11, quote: "No database, no auth, no extension" },
    { id: "ev_15", sourceName: "Discussion", startLine: 42, endLine: 44, quote: "Clean, professional, workbench feel" },
    { id: "ev_16", sourceName: "Discussion", startLine: 65, endLine: 67, quote: "No Prompt Store" },
    { id: "ev_17", sourceName: "Discussion", startLine: 1, endLine: 3, quote: "Architecture blueprint document" },
    { id: "ev_18", sourceName: "Meeting notes", startLine: 17, endLine: 19, quote: "Model output instability" },
    { id: "ev_19", sourceName: "Meeting notes", startLine: 17, endLine: 19, quote: "Graph rendering performance" },
    { id: "ev_20", sourceName: "Discussion", startLine: 45, endLine: 47, quote: "48 hours" },
    { id: "ev_21", sourceName: "Meeting notes", startLine: 21, endLine: 23, quote: "Tech lead scaffolds project" },
    { id: "ev_22", sourceName: "Meeting notes", startLine: 21, endLine: 23, quote: "Privacy scan must be client-side" },
    { id: "ev_23", sourceName: "Meeting notes", startLine: 21, endLine: 23, quote: "Integrate compile API" },
    { id: "ev_24", sourceName: "Meeting notes", startLine: 21, endLine: 23, quote: "Six output tabs" },
  ],
  readiness: {
    score: 68,
    level: "needs_clarification",
    missing: ["Chunking strategy for long texts", "MCP integration timeline"],
    explanation: "Core requirements and decisions are clear. Some implementation details need clarification before full handoff.",
  },
  privacyReport: {
    scanned: true,
    findings: [
      { id: "pf_1", type: "api_key", severity: "high", start: 2450, end: 2480, maskedPreview: "sk-vercel-[REDACTED]", action: "redacted" },
      { id: "pf_2", type: "github_token", severity: "high", start: 2500, end: 2540, maskedPreview: "ghp_[REDACTED]", action: "redacted" },
      { id: "pf_3", type: "password", severity: "high", start: 2560, end: 2580, maskedPreview: "DbP@ss[REDACTED]", action: "redacted" },
      { id: "pf_4", type: "phone", severity: "medium", start: 2600, end: 2611, maskedPreview: "138****8000", action: "redacted" },
      { id: "pf_5", type: "email", severity: "low", start: 2630, end: 2658, maskedPreview: "dev****[REDACTED].com", action: "redacted" },
    ],
    sentToModelAfterRedaction: true,
  },
};
