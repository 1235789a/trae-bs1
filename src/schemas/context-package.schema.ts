/**
 * ContextMirror - Zod Schema for CanonicalContextPackage
 * 所有模型输出必须经过此 Schema 校验
 */
import { z } from "zod";

// ── Enums ──
export const TargetAgentTypeSchema = z.enum([
  "coding", "writing", "product", "research", "general",
]);
export type TargetAgentType = z.infer<typeof TargetAgentTypeSchema>;

export const ItemStatusSchema = z.enum([
  "confirmed", "inferred", "conflicted", "unknown",
]);
export type ItemStatus = z.infer<typeof ItemStatusSchema>;

export const SensitiveTypeSchema = z.enum([
  "api_key", "github_token", "password", "private_key",
  "email", "phone", "id_number", "wallet_address",
]);
export type SensitiveType = z.infer<typeof SensitiveTypeSchema>;

export const GraphNodeTypeSchema = z.enum([
  "source", "fact", "decision", "constraint",
  "rejected", "risk", "question", "next_action",
]);
export type GraphNodeType = z.infer<typeof GraphNodeTypeSchema>;

export const GraphEdgeRelationSchema = z.enum([
  "supports", "causes", "constrains", "rejects", "blocks", "leads_to",
]);
export type GraphEdgeRelation = z.infer<typeof GraphEdgeRelationSchema>;

// ── Sub-schemas ──
export const EvidenceRefSchema = z.object({
  id: z.string(),
  sourceName: z.string(),
  startLine: z.number().int().min(0),
  endLine: z.number().int().min(0),
  quote: z.string(),
});

export const ContextItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  status: ItemStatusSchema,
  confidence: z.number().min(0).max(1),
  evidenceRefs: z.array(z.string()),
  impact: z.string().optional(),
});

export const DecisionItemSchema = ContextItemSchema.extend({
  rationale: z.string().optional(),
  alternativesRejected: z.array(z.string()),
  downstreamEffects: z.array(z.string()),
});

export const SensitiveFindingSchema = z.object({
  id: z.string(),
  type: SensitiveTypeSchema,
  severity: z.enum(["low", "medium", "high"]),
  start: z.number().int().min(0),
  end: z.number().int().min(0),
  maskedPreview: z.string(),
  action: z.enum(["redacted", "kept", "pending"]),
});

export const PrivacyReportSchema = z.object({
  scanned: z.boolean(),
  findings: z.array(SensitiveFindingSchema),
  sentToModelAfterRedaction: z.boolean(),
});

export const NextActionSchema = ContextItemSchema.extend({
  priority: z.enum(["P0", "P1", "P2"]),
  owner: z.enum(["user", "next_agent", "unknown"]),
  doneWhen: z.string(),
  dependencies: z.array(z.string()),
});

export const RiskItemSchema = ContextItemSchema.extend({
  severity: z.enum(["low", "medium", "high"]),
  mitigation: z.string().optional(),
});

export const ArtifactSchema = ContextItemSchema.extend({
  uri: z.string().optional(),
});

export const ContradictionSchema = z.object({
  id: z.string(),
  description: z.string(),
  itemIds: z.array(z.string()),
  evidenceRefs: z.array(z.string()),
  resolution: z.enum(["ask_user", "prefer_latest", "unresolved"]),
});

export const ReadinessSchema = z.object({
  score: z.number().int().min(0).max(100),
  level: z.enum(["blocked", "needs_clarification", "ready"]),
  missing: z.array(z.string()),
  explanation: z.string(),
});

// ── Root Schema ──
export const CanonicalContextPackageSchema = z.object({
  schemaVersion: z.string(),
  packageId: z.string(),
  generatedAt: z.string(),
  task: z.object({
    title: z.string(),
    desiredOutcome: z.string(),
    targetAgent: TargetAgentTypeSchema,
  }),
  summary: z.object({
    oneSentence: z.string(),
    handoffBrief: z.string(),
  }),
  objective: z.array(ContextItemSchema),
  currentState: z.array(ContextItemSchema),
  facts: z.array(ContextItemSchema),
  decisions: z.array(DecisionItemSchema),
  constraints: z.array(ContextItemSchema),
  preferences: z.array(ContextItemSchema),
  rejectedOptions: z.array(ContextItemSchema),
  artifacts: z.array(ArtifactSchema),
  risks: z.array(RiskItemSchema),
  openQuestions: z.array(ContextItemSchema),
  nextActions: z.array(NextActionSchema),
  contradictions: z.array(ContradictionSchema),
  evidence: z.array(EvidenceRefSchema),
  readiness: ReadinessSchema,
  privacyReport: PrivacyReportSchema,
});

export type ContextItem = z.infer<typeof ContextItemSchema>;
export type DecisionItem = z.infer<typeof DecisionItemSchema>;
export type RiskItem = z.infer<typeof RiskItemSchema>;
export type NextAction = z.infer<typeof NextActionSchema>;
export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;
export type Contradiction = z.infer<typeof ContradictionSchema>;
export type Artifact = z.infer<typeof ArtifactSchema>;
export type CanonicalContextPackage = z.infer<typeof CanonicalContextPackageSchema>;
