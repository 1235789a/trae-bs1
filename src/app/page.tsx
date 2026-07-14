import Link from "next/link";
import { Layers, ArrowRight, Shield, Zap, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/shared/header";

const features = [
  {
    icon: Shield,
    title: "可追溯",
    description:
      "每条编译后的上下文信息都映射回源文本片段，形成完整的溯源链，零信息丢失。",
  },
  {
    icon: Zap,
    title: "可执行",
    description:
      "上下文包 Context Pack 包含结构化的任务定义、验收标准和下一步指令，Agent 可立即执行。",
  },
  {
    icon: GitBranch,
    title: "可交接",
    description:
      "与 Agent 无关的输出格式，支持从任意 Agent 向任意 Agent 交接——Claude、GPT、Gemini 或你自己的模型。",
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
            智能体上下文交接编译器
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            将长对话转化为{" "}
            <span className="text-blue-600">可执行的上下文包</span>
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            ContextMirror 是一个<strong>编译器</strong>，而不是总结器。它追踪、结构化并打包你的对话上下文，让下一个智能体 Agent 能够无缝接手——不遗漏任何决策和细节。
          </p>

          <div className="mt-8 flex items-center gap-4">
            <Link href="/workspace">
              <Button size="lg">
                开始编译
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/workspace">
              <Button variant="outline" size="lg">
                体验示例
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
        ContextMirror｜智能体上下文交接编译器
      </footer>
    </div>
  );
}
