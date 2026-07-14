import type { TargetAgentType } from "@/schemas/context-package.schema";

export const INPUT_MIN_CHARS = 200;
export const INPUT_MAX_CHARS = 60_000;

export const AGENT_OPTIONS: { value: TargetAgentType; label: string; description: string }[] = [
  { value: "coding", label: "代码 Agent", description: "继续开发、调试、重构" },
  { value: "writing", label: "写作 Agent", description: "撰写文档、博客、报告" },
  { value: "product", label: "产品 Agent", description: "需求分析、PRD、用户研究" },
  { value: "research", label: "研究 Agent", description: "技术调研、竞品分析" },
  { value: "general", label: "通用 Agent", description: "通用任务交接" },
];
