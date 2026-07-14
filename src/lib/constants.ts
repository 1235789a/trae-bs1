import type { TargetAgentType } from "@/schemas/context-package.schema";

export const INPUT_MIN_CHARS = 200;
export const INPUT_MAX_CHARS = 60_000;

export const AGENT_OPTIONS: { value: TargetAgentType; label: string; description: string }[] = [
  { value: "coding", label: "代码智能体", description: "继续开发、调试、重构" },
  { value: "writing", label: "写作智能体", description: "撰写文档、博客、报告" },
  { value: "product", label: "产品智能体", description: "需求分析、PRD、用户研究" },
  { value: "research", label: "研究智能体", description: "技术调研、竞品分析" },
  { value: "general", label: "通用智能体", description: "通用任务交接" },
];
