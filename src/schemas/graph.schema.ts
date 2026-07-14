/**
 * Graph data schemas
 */
import { z } from "zod";
import { GraphNodeTypeSchema, GraphEdgeRelationSchema } from "./context-package.schema";

export const GraphNodeSchema = z.object({
  id: z.string(),
  type: GraphNodeTypeSchema,
  label: z.string(),
  description: z.string(),
  status: z.enum(["confirmed", "inferred", "conflicted", "unknown"]),
  evidenceRefs: z.array(z.string()),
  x: z.number().optional(),
  y: z.number().optional(),
});

export const GraphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  relation: GraphEdgeRelationSchema,
  label: z.string().optional(),
});

export const GraphDataSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});

export type GraphNode = z.infer<typeof GraphNodeSchema>;
export type GraphEdge = z.infer<typeof GraphEdgeSchema>;
export type GraphData = z.infer<typeof GraphDataSchema>;
