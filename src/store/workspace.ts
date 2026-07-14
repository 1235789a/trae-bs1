import { create } from "zustand";
import type { CanonicalContextPackage } from "@/schemas/context-package.schema";
import type { SensitiveFinding } from "@/features/privacy/detectors";

export type CompileMode = "idle" | "demo" | "live";

export interface CompileResult {
  requestId: string;
  mode: CompileMode;
  durationMs: number;
  data: CanonicalContextPackage;
  repaired?: boolean;
}

interface WorkspaceState {
  taskTitle: string;
  desiredOutcome: string;
  targetAgent: string;
  sourceText: string;
  sourceName: string;
  sourceType: string;
  findings: SensitiveFinding[];
  privacyAcknowledged: boolean;
  compiling: boolean;
  result: CompileResult | null;
  error: string | null;

  setTaskTitle: (v: string) => void;
  setDesiredOutcome: (v: string) => void;
  setTargetAgent: (v: string) => void;
  setSourceText: (v: string) => void;
  setFindings: (v: SensitiveFinding[]) => void;
  updateFindingAction: (id: string, action: SensitiveFinding["action"]) => void;
  setPrivacyAcknowledged: (v: boolean) => void;
  setCompiling: (v: boolean) => void;
  setResult: (v: CompileResult | null) => void;
  setError: (v: string | null) => void;
  reset: () => void;
  loadDemo: () => void;
}

const initialState = {
  taskTitle: "",
  desiredOutcome: "",
  targetAgent: "coding",
  sourceText: "",
  sourceName: "",
  sourceType: "mixed",
  findings: [],
  privacyAcknowledged: false,
  compiling: false,
  result: null,
  error: null,
};

export const useWorkspace = create<WorkspaceState>((set) => ({
  ...initialState,

  setTaskTitle: (v) => set({ taskTitle: v }),
  setDesiredOutcome: (v) => set({ desiredOutcome: v }),
  setTargetAgent: (v) => set({ targetAgent: v }),
  setSourceText: (v) => set({ sourceText: v }),
  setFindings: (v) => set({ findings: v, privacyAcknowledged: false }),
  updateFindingAction: (id, action) =>
    set((s) => ({ findings: s.findings.map((f) => (f.id === id ? { ...f, action } : f)) })),
  setPrivacyAcknowledged: (v) => set({ privacyAcknowledged: v }),
  setCompiling: (v) => set({ compiling: v, error: null }),
  setResult: (v) => set({ result: v, compiling: false }),
  setError: (v) => set({ error: v, compiling: false }),
  reset: () => set({ ...initialState }),

  loadDemo: () => {
    // We'll fetch from /api/compile with demo mode, but for instant UX we load fixture directly
    import("@/server/providers/demo.provider").then(({ compileDemo }) => {
      const pkg = compileDemo();
      set({
        result: {
          requestId: "demo_local",
          mode: "demo",
          durationMs: 0,
          data: pkg,
        },
        compiling: false,
        error: null,
        taskTitle: pkg.task.title,
        desiredOutcome: pkg.task.desiredOutcome,
        targetAgent: pkg.task.targetAgent,
        sourceText: "[Built-in TRAE Contest Demo - loaded from fixture]",
        sourceName: pkg.task.title,
        findings: pkg.privacyReport.findings,
        privacyAcknowledged: true,
      });
    });
  },
}));
