import type { TargetAgentType } from "@/schemas/context-package.schema";

export const INPUT_MIN_CHARS = 200;
export const INPUT_MAX_CHARS = 60_000;

export const AGENT_OPTIONS: { value: TargetAgentType; label: string; description: string }[] = [
  { value: "coding", label: "Code Agent", description: "Continue development, debug, refactor" },
  { value: "writing", label: "Writing Agent", description: "Write docs, blogs, reports" },
  { value: "product", label: "Product Agent", description: "Requirements, PRD, user research" },
  { value: "research", label: "Research Agent", description: "Tech research, competitive analysis" },
  { value: "general", label: "General Agent", description: "General task handoff" },
];
