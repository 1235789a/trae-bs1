"use client";

import { useState, useMemo, useCallback } from "react";
import { FileJson, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-btn";
import { exportJSON, exportYAML, exportMarkdown } from "@/features/export/export-formats";
import type { CanonicalContextPackage } from "@/schemas/context-package.schema";

/* ------------------------------------------------------------------ */
/*  Format definitions                                                 */
/* ------------------------------------------------------------------ */

type ExportFormat = "json" | "yaml" | "markdown";

const FORMATS: { value: ExportFormat; label: string; icon: React.ElementType; ext: string }[] = [
  { value: "json", label: "JSON", icon: FileJson, ext: ".json" },
  { value: "yaml", label: "YAML", icon: FileText, ext: ".yaml" },
  { value: "markdown", label: "Markdown", icon: FileText, ext: ".md" },
];

function getExportContent(format: ExportFormat, pkg: CanonicalContextPackage): string {
  switch (format) {
    case "json":
      return exportJSON(pkg);
    case "yaml":
      return exportYAML(pkg);
    case "markdown":
      return exportMarkdown(pkg);
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export interface ExportViewProps {
  pkg: CanonicalContextPackage;
}

export function ExportView({ pkg }: ExportViewProps) {
  const [format, setFormat] = useState<ExportFormat>("json");

  const content = useMemo(() => getExportContent(format, pkg), [format, pkg]);
  const lineCount = content.split("\n").length;

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fmtInfo = FORMATS.find((f) => f.value === format)!;
    a.href = url;
    a.download = `context-mirror-${pkg.packageId}${fmtInfo.ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content, format, pkg.packageId]);

  return (
    <div className="flex flex-col gap-4">
      {/* Format selector */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-800">Export Format</h3>
        <div className="flex gap-2">
          {FORMATS.map((fmt) => {
            const Icon = fmt.icon;
            const active = format === fmt.value;
            return (
              <Button
                key={fmt.value}
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => setFormat(fmt.value)}
                className="gap-1.5"
              >
                <Icon className="h-3.5 w-3.5" />
                {fmt.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <CopyButton text={content} label="Copy" />
        <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Download
        </Button>
        <span className="ml-auto text-xs text-slate-500">
          {lineCount.toLocaleString()} lines
        </span>
      </div>

      {/* Code preview */}
      <div className="relative rounded-xl border border-slate-200 bg-slate-950 shadow-sm overflow-auto max-h-[600px]">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] bg-slate-800 text-slate-300 border-slate-700">
              {format.toUpperCase()}
            </Badge>
            <span className="text-[10px] text-slate-500 font-mono">
              context-mirror-{pkg.packageId}{FORMATS.find((f) => f.value === format)?.ext}
            </span>
          </div>
        </div>
        <pre className="p-4 text-xs leading-relaxed text-slate-300 font-mono overflow-x-auto whitespace-pre">
          {content}
        </pre>
      </div>
    </div>
  );
}
