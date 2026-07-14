/**
 * 内置示例：TRAE 大赛项目交接场景
 * 这是 Demo 模式下的唯一内置示例
 * 在未配置 API Key 时使用
 */
import type { CanonicalContextPackage } from "@/schemas/context-package.schema";

export const TRAE_FIXTURE: CanonicalContextPackage = {
  schemaVersion: "1.0",
  packageId: "pkg_demo_trae_001",
  generatedAt: "2026-07-13T10:00:00Z",
  task: {
    title: "ContextMirror P0 演示",
    desiredOutcome: "交付一个可部署的 Web 应用，将混乱的 AI 协作历史编译为结构化的 Agent 上下文包",
    targetAgent: "coding",
  },
  summary: {
    oneSentence: "构建一个智能体上下文交接编译器，将长对话转化为可执行的上下文包。",
    handoffBrief:
      "ContextMirror 是一个编译器（而非总结器），从杂乱的项目讨论中提取事实、决策、约束、风险和下一步行动，编译为结构化的 CanonicalContextPackage。",
  },
  objective: [
    { id: "obj_1", title: "核心定位", content: "不是总结器，而是可执行的交接编译器", status: "confirmed", confidence: 1, evidenceRefs: ["ev_1"], impact: "定义产品边界及所有输出格式" },
    { id: "obj_2", title: "参赛赛道", content: "学习与生产力赛道，解决 AI 协作中的上下文碎片化问题", status: "confirmed", confidence: 1, evidenceRefs: ["ev_2"] },
  ],
  currentState: [
    { id: "cs_1", title: "开发阶段", content: "需求已冻结，技术栈已确定，进入编码阶段", status: "confirmed", confidence: 0.95, evidenceRefs: ["ev_3"] },
    { id: "cs_2", title: "时间预算", content: "总计 48 小时", status: "confirmed", confidence: 0.9, evidenceRefs: ["ev_4"] },
  ],
  facts: [
    { id: "f_1", title: "技术栈", content: "Next.js App Router + TypeScript + Tailwind CSS + Vercel", status: "confirmed", confidence: 1, evidenceRefs: ["ev_5"] },
    { id: "f_2", title: "模型接口", content: "OpenAI 兼容适配器，不锁定单一供应商", status: "confirmed", confidence: 1, evidenceRefs: ["ev_6"] },
    { id: "f_3", title: "隐私策略", content: "浏览器端敏感信息扫描，服务端永不记录原始上下文", status: "confirmed", confidence: 1, evidenceRefs: ["ev_7"] },
    { id: "f_4", title: "无数据库", content: "P0 阶段仅使用浏览器存储和内存", status: "confirmed", confidence: 0.95, evidenceRefs: ["ev_8"] },
  ],
  decisions: [
    {
      id: "d_1", title: "产品命名从总结器改为编译器",
      content: "明确定位为智能体上下文交接编译器（Agent Handoff Compiler），而非文本总结器",
      status: "confirmed", confidence: 0.9, evidenceRefs: ["ev_9"],
      rationale: "总结只告诉你说了什么；编译器告诉下一个 Agent 如何正确做事",
      alternativesRejected: ["长文本总结器", "提示词仓库"],
      downstreamEffects: ["所有 6 个输出选项卡重新设计", "首页文案调整"],
    },
    {
      id: "d_2", title: "六种输出格式",
      content: "上下文包、Agent 提示词、决策图、思维导图、风险检查、JSON/YAML 导出",
      status: "confirmed", confidence: 1, evidenceRefs: ["ev_10"],
      rationale: "覆盖人类可读、可视化和机器可读三种交接场景",
      alternativesRejected: ["仅 Markdown 导出", "仅可视化无文本"],
      downstreamEffects: ["前端复杂度更高", "CanonicalPackage 作为唯一数据源"],
    },
    {
      id: "d_3", title: "Demo 降级方案",
      content: "无 API Key 时使用内置示例，UI 明确标注示例模式",
      status: "confirmed", confidence: 1, evidenceRefs: ["ev_11"],
      rationale: "评委和用户无需任何配置即可完整体验产品",
      alternativesRejected: ["要求先配置 API Key", "对自由输入返回伪造结果"],
      downstreamEffects: ["需要高质量示例", "显式标注示例/实时模式"],
    },
  ],
  constraints: [
    { id: "c_1", title: "隐私红线", content: "API Key 仅存于服务器环境变量，原始上下文不进入 URL 或日志", status: "confirmed", confidence: 1, evidenceRefs: ["ev_12"], impact: "影响部署配置和日志策略" },
    { id: "c_2", title: "时间限制", content: "48 小时，最后一天仅修复 Bug", status: "confirmed", confidence: 1, evidenceRefs: ["ev_13"], impact: "需要严格的优先级裁剪" },
    { id: "c_3", title: "技术范围", content: "P0 阶段不含数据库、用户认证和浏览器扩展", status: "confirmed", confidence: 1, evidenceRefs: ["ev_14"], impact: "所有状态在客户端管理" },
  ],
  preferences: [
    { id: "p_1", title: "UI 风格", content: "清晰、专业的工作台风格，非营销着陆页", status: "confirmed", confidence: 0.9, evidenceRefs: ["ev_15"] },
  ],
  rejectedOptions: [
    { id: "r_1", title: "不做提示词仓库", content: "与核心定位无关", status: "confirmed", confidence: 1, evidenceRefs: ["ev_16"] },
  ],
  artifacts: [
    { id: "a_1", title: "架构蓝图", content: "ContextMirror 工程架构与验收标准文档", status: "confirmed", confidence: 1, evidenceRefs: ["ev_17"], uri: "project-docs/architecture-v1.md" },
  ],
  risks: [
    { id: "rk_1", title: "模型输出不稳定", content: "AI 可能返回非法的 JSON", severity: "high", status: "confirmed", confidence: 0.85, evidenceRefs: ["ev_18"], mitigation: "JSON 修复 + 重试，Demo 降级" },
    { id: "rk_2", title: "图表渲染性能", content: "节点过多可能导致卡顿", severity: "medium", status: "confirmed", confidence: 0.8, evidenceRefs: ["ev_19"], mitigation: "上限 35 个节点，折叠低优先级" },
  ],
  openQuestions: [
    { id: "q_1", title: "分块策略", content: "如何处理超过 18000 字符的文本？", status: "inferred", confidence: 0.6, evidenceRefs: ["ev_20"] },
  ],
  nextActions: [
    { id: "na_1", title: "搭建项目脚手架", content: "初始化 Next.js + TS + Tailwind，配置目录结构", priority: "P0", owner: "next_agent", status: "confirmed", confidence: 1, evidenceRefs: ["ev_21"], doneWhen: "项目可运行，所有页面可访问", dependencies: [] },
    { id: "na_2", title: "隐私扫描器", content: "客户端敏感信息检测、脱敏、服务端校验", priority: "P0", owner: "next_agent", status: "confirmed", confidence: 1, evidenceRefs: ["ev_22"], doneWhen: "测试 Token 不会到达编译端点", dependencies: ["na_1"] },
    { id: "na_3", title: "编译 API", content: "请求 Schema、Provider 接口、LLM 集成、Zod 校验", priority: "P0", owner: "next_agent", status: "confirmed", confidence: 1, evidenceRefs: ["ev_23"], doneWhen: "两个不同输入产生不同结构化输出", dependencies: ["na_1", "na_2"] },
    { id: "na_4", title: "六个输出视图", content: "上下文包、提示词、决策图、思维导图、风险检查、导出", priority: "P0", owner: "next_agent", status: "confirmed", confidence: 1, evidenceRefs: ["ev_24"], doneWhen: "六个输出均从同一 Package 派生，无矛盾", dependencies: ["na_3"] },
  ],
  contradictions: [
    { id: "con_1", description: "产品从总结器改名为编译器，部分历史讨论仍使用旧术语", itemIds: ["obj_1", "d_1"], evidenceRefs: ["ev_9"], resolution: "prefer_latest" },
  ],
  evidence: [
    { id: "ev_1", sourceName: "讨论记录", startLine: 8, endLine: 10, quote: "不是总结器，而是可执行的交接" },
    { id: "ev_2", sourceName: "讨论记录", startLine: 1, endLine: 3, quote: "大赛项目，AI Agent 上下文交接" },
    { id: "ev_3", sourceName: "会议纪要", startLine: 5, endLine: 7, quote: "需求已冻结，技术栈已确定" },
    { id: "ev_4", sourceName: "讨论记录", startLine: 45, endLine: 47, quote: "48 小时" },
    { id: "ev_5", sourceName: "讨论记录", startLine: 18, endLine: 20, quote: "Next.js + TypeScript + Tailwind" },
    { id: "ev_6", sourceName: "讨论记录", startLine: 18, endLine: 20, quote: "OpenAI 兼容接口" },
    { id: "ev_7", sourceName: "讨论记录", startLine: 25, endLine: 28, quote: "浏览器端敏感信息扫描" },
    { id: "ev_8", sourceName: "会议纪要", startLine: 9, endLine: 11, quote: "无数据库，仅浏览器存储" },
    { id: "ev_9", sourceName: "讨论记录", startLine: 55, endLine: 58, quote: "目标从总结器改为编译器" },
    { id: "ev_10", sourceName: "讨论记录", startLine: 32, endLine: 38, quote: "六个选项卡" },
    { id: "ev_11", sourceName: "讨论记录", startLine: 22, endLine: 24, quote: "需要无 API Key 的 Demo 模式" },
    { id: "ev_12", sourceName: "讨论记录", startLine: 25, endLine: 28, quote: "服务端不得记录原始上下文" },
    { id: "ev_13", sourceName: "讨论记录", startLine: 45, endLine: 47, quote: "48 小时" },
    { id: "ev_14", sourceName: "会议纪要", startLine: 9, endLine: 11, quote: "无数据库、无认证、无扩展" },
    { id: "ev_15", sourceName: "讨论记录", startLine: 42, endLine: 44, quote: "清晰、专业的工作台风格" },
    { id: "ev_16", sourceName: "讨论记录", startLine: 65, endLine: 67, quote: "不做提示词仓库" },
    { id: "ev_17", sourceName: "讨论记录", startLine: 1, endLine: 3, quote: "架构蓝图文档" },
    { id: "ev_18", sourceName: "会议纪要", startLine: 17, endLine: 19, quote: "模型输出不稳定" },
    { id: "ev_19", sourceName: "会议纪要", startLine: 17, endLine: 19, quote: "图表渲染性能" },
    { id: "ev_20", sourceName: "讨论记录", startLine: 45, endLine: 47, quote: "48 小时" },
    { id: "ev_21", sourceName: "会议纪要", startLine: 21, endLine: 23, quote: "技术负责人搭建项目脚手架" },
    { id: "ev_22", sourceName: "会议纪要", startLine: 21, endLine: 23, quote: "隐私扫描必须客户端执行" },
    { id: "ev_23", sourceName: "会议纪要", startLine: 21, endLine: 23, quote: "集成编译 API" },
    { id: "ev_24", sourceName: "会议纪要", startLine: 21, endLine: 23, quote: "六个输出选项卡" },
  ],
  readiness: {
    score: 68,
    level: "needs_clarification",
    missing: ["长文本分块策略", "MCP 集成时间线"],
    explanation: "核心需求和决策已明确。部分实现细节需要进一步澄清后才能完成完整交接。",
  },
  privacyReport: {
    scanned: true,
    findings: [
      { id: "pf_1", type: "api_key", severity: "high", start: 2450, end: 2480, maskedPreview: "sk-vercel-[已脱敏]", action: "redacted" },
      { id: "pf_2", type: "github_token", severity: "high", start: 2500, end: 2540, maskedPreview: "ghp_[已脱敏]", action: "redacted" },
      { id: "pf_3", type: "password", severity: "high", start: 2560, end: 2580, maskedPreview: "DbP@ss[已脱敏]", action: "redacted" },
      { id: "pf_4", type: "phone", severity: "medium", start: 2600, end: 2611, maskedPreview: "138****8000", action: "redacted" },
      { id: "pf_5", type: "email", severity: "low", start: 2630, end: 2658, maskedPreview: "dev****[已脱敏].com", action: "redacted" },
    ],
    sentToModelAfterRedaction: true,
  },
};