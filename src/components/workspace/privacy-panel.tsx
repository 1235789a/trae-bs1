"use client";

import { Shield, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/store/workspace";
import type { SensitiveType } from "@/schemas/context-package.schema";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const SEVERITY_BADGE: Record<string, "warning" | "destructive"> = {
  low: "warning",
  medium: "warning",
  high: "destructive",
};

const TYPE_LABELS: Record<SensitiveType, string> = {
  api_key: "API Key",
  github_token: "GitHub Token",
  password: "Password",
  private_key: "Private Key",
  email: "Email",
  phone: "Phone Number",
  id_number: "ID Number",
  wallet_address: "Wallet Address",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PrivacyPanel() {
  const findings = useWorkspace((s) => s.findings);
  const updateFindingAction = useWorkspace((s) => s.updateFindingAction);
  const setPrivacyAcknowledged = useWorkspace((s) => s.setPrivacyAcknowledged);
  const privacyAcknowledged = useWorkspace((s) => s.privacyAcknowledged);

  if (findings.length === 0) return null;

  const hasPending = findings.some((f) => f.action === "pending");
  const redactedCount = findings.filter((f) => f.action === "redacted").length;
  const keptCount = findings.filter((f) => f.action === "kept").length;

  const handleConfirm = () => {
    setPrivacyAcknowledged(true);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-slate-700" />
        <h3 className="text-sm font-semibold text-slate-900">
          Privacy Scan Results
        </h3>
        <span className="ml-auto text-xs text-slate-500">
          {findings.length} finding{findings.length !== 1 ? "s" : ""} &middot;{" "}
          {redactedCount} redacted &middot; {keptCount} kept
        </span>
      </div>

      {/* Findings list */}
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        {findings.map((f) => {
          const isRedacted = f.action === "redacted";
          const isKept = f.action === "kept";

          return (
            <div
              key={f.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-xs",
                isRedacted
                  ? "border-slate-200 bg-slate-50"
                  : isKept
                    ? "border-amber-200 bg-amber-50"
                    : "border-slate-200 bg-white",
              )}
            >
              {/* Severity badge */}
              <Badge variant={SEVERITY_BADGE[f.severity] ?? "warning"} className="mt-0.5 shrink-0">
                {f.severity}
              </Badge>

              {/* Info */}
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="font-medium text-slate-800">
                  {TYPE_LABELS[f.type] ?? f.type}
                </span>
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600 truncate">
                  {f.maskedPreview}
                </code>
              </div>

              {/* Toggle */}
              <Button
                variant={isRedacted ? "outline" : isKept ? "secondary" : "ghost"}
                size="sm"
                onClick={() =>
                  updateFindingAction(
                    f.id,
                    isRedacted ? "kept" : "redacted",
                  )
                }
                className="shrink-0 gap-1"
              >
                {isRedacted ? (
                  <>
                    <Eye className="h-3 w-3" />
                    Kept
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" />
                    Redacted
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Warning for pending items */}
      {hasPending && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700">
            Some findings are pending review. Toggle each to redacted or kept before continuing.
          </p>
        </div>
      )}

      {/* Confirm button */}
      <Button
        variant="default"
        size="sm"
        disabled={hasPending}
        onClick={handleConfirm}
        className={cn(
          "self-end",
          privacyAcknowledged && "bg-emerald-600 hover:bg-emerald-700",
        )}
      >
        {privacyAcknowledged ? "Confirmed" : "Confirm & Continue"}
      </Button>
    </div>
  );
}
