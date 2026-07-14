"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CopyButton } from "@/components/shared/copy-btn";
import { buildAgentPrompt } from "@/features/prompt/build-prompt";
import type { CanonicalContextPackage } from "@/schemas/context-package.schema";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export interface PromptViewProps {
  pkg: CanonicalContextPackage;
}

export function PromptView({ pkg }: PromptViewProps) {
  const prompt = buildAgentPrompt(pkg);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">
          Generated Agent Prompt
        </h3>
        <CopyButton text={prompt} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <article className="prose prose-slate prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {prompt}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
