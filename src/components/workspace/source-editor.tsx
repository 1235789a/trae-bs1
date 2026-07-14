"use client";

import { useCallback } from "react";
import { AlertTriangle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/store/workspace";
import { scanText } from "@/features/privacy/detectors";
import { INPUT_MIN_CHARS, INPUT_MAX_CHARS } from "@/lib/constants";

export function SourceEditor() {
  const sourceText = useWorkspace((s) => s.sourceText);
  const setSourceText = useWorkspace((s) => s.setSourceText);
  const setFindings = useWorkspace((s) => s.setFindings);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      setSourceText(next);

      // Scan for sensitive info whenever text changes (debounced in practice)
      if (next.length >= INPUT_MIN_CHARS) {
        const findings = scanText(next);
        setFindings(findings);
      } else {
        setFindings([]);
      }
    },
    [setSourceText, setFindings],
  );

  const tooShort = sourceText.length > 0 && sourceText.length < INPUT_MIN_CHARS;
  const overMax = sourceText.length > INPUT_MAX_CHARS;
  const remaining = INPUT_MAX_CHARS - sourceText.length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="source-text"
          className="text-sm font-medium text-slate-700"
        >
          上下文来源
        </label>
        <span className="text-xs text-slate-500">
          {sourceText.length.toLocaleString()} / {INPUT_MAX_CHARS.toLocaleString()}
          {remaining <= 5000 && remaining > 0 && (
            <span className="ml-1 text-amber-600">（剩余 {remaining.toLocaleString()} 字符）</span>
          )}
          {overMax && <span className="ml-1 text-red-600">（超出限制）</span>}
        </span>
      </div>

      <Textarea
        id="source-text"
        placeholder="请粘贴你的对话记录、README、需求文档、笔记或任何需要编译为结构化交接包的上下文文本..."
        value={sourceText}
        onChange={handleChange}
        rows={12}
        className="font-mono text-xs leading-relaxed"
      />

      {tooShort && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700">
            至少需要 {INPUT_MIN_CHARS} 个字符才能编译。{" "}
            <span className="font-medium">
              还需要 {INPUT_MIN_CHARS - sourceText.length} 个字符。
            </span>
          </p>
        </div>
      )}

      {overMax && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <p className="text-xs text-red-700">
            文本超出最大限制 {INPUT_MAX_CHARS.toLocaleString()} 个字符，请精简输入内容。
          </p>
        </div>
      )}
    </div>
  );
}
