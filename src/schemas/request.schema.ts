/**
 * Zod Schema for CompileRequest (client -> server)
 */
import { z } from "zod";
import { TargetAgentTypeSchema } from "./context-package.schema";

export const CompileRequestSchema = z.object({
  task: z.object({
    title: z.string().min(1),
    desiredOutcome: z.string().min(1),
    targetAgent: TargetAgentTypeSchema,
    outputLanguage: z.enum(["zh-CN", "en"]).default("zh-CN"),
  }),
  source: z.object({
    text: z.string().min(200).max(60000),
    sourceName: z.string().min(1),
    sourceType: z.enum(["conversation", "readme", "notes", "requirements", "mixed"]).default("mixed"),
  }),
  privacy: z.object({
    redacted: z.boolean(),
    acknowledgedFindingIds: z.array(z.string()),
  }),
  options: z.object({
    detailLevel: z.enum(["compact", "standard", "detailed"]).default("standard"),
    includeEvidence: z.boolean().default(true),
  }),
});

export type CompileRequest = z.infer<typeof CompileRequestSchema>;

export const CompileResponseSchema = z.object({
  requestId: z.string(),
  mode: z.enum(["live", "demo"]),
  durationMs: z.number(),
  data: z.any(), // will be validated separately as CanonicalContextPackage
});

export type CompileResponse = z.infer<typeof CompileResponseSchema>;
