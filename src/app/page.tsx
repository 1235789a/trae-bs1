import Link from "next/link";
import { Layers, ArrowRight, Shield, Zap, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/shared/header";

const features = [
  {
    icon: Shield,
    title: "Traceable",
    description:
      "Every compiled context line maps back to its source segment. Full provenance chain, zero information loss.",
  },
  {
    icon: Zap,
    title: "Executable",
    description:
      "Context packs include structured task definitions, acceptance criteria, and next-step instructions that agents can act on immediately.",
  },
  {
    icon: GitBranch,
    title: "Transferable",
    description:
      "Agent-agnostic output format. Hand off from any agent to any agent -- Claude, GPT, Gemini, or your own model.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm text-slate-600">
            <Layers className="h-4 w-4" />
            Agent Handoff Compiler
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Turn Long Conversations into{" "}
            <span className="text-blue-600">Actionable Context Packs</span>
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            ContextMirror is a <strong>compiler</strong>, not a summarizer. It
            traces, structures, and packages your conversation context so the
            next agent can pick up exactly where you left off -- without losing
            a single decision or detail.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <Link href="/workspace">
              <Button size="lg">
                Start Compiling
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/workspace">
              <Button variant="outline" size="lg">
                Try Demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid gap-8 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-6 text-center text-sm text-slate-500">
        ContextMirror -- Agent Handoff Compiler
      </footer>
    </div>
  );
}
