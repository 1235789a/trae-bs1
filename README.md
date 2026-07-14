# ContextMirror

> 智能体上下文交接编译器 — 将长对话和项目记录编译为结构化的 Agent 上下文包。

## 定位

ContextMirror **不是总结器**，而是 **Agent Handoff Compiler（智能体交接编译器）**。它从杂乱的项目讨论、会议纪要和代码记录中提取事实、决策、约束、风险和下一步行动，编译为可执行的 `CanonicalContextPackage`，让下一个智能体可以无缝接手项目。

## 核心功能

### 隐私扫描

- 浏览器端实时检测敏感信息（API Key、Token、密码、手机号、邮箱等）
- 用户可逐条确认脱敏或保留
- 服务端永不记录原始上下文，API Key 仅存于环境变量

### 六种输出视图

所有视图从同一个 `CanonicalContextPackage` 派生，保证数据一致：

1. **上下文包** — 结构化展示任务、目标、事实、决策、约束、偏好、风险、下一步行动
2. **Agent 提示词** — 生成可直接粘贴给下一个智能体的交接提示词
3. **决策图** — 可视化事实、决策、风险之间的因果关系
4. **思维导图** — 以任务为中心的分层知识结构
5. **风险检查** — 隐私发现、质量风险、交接完整度评分
6. **JSON / YAML / Markdown 导出** — 机器可读格式，支持复制和下载

### 无 Key Demo 模式

未配置 API Key 时，应用自动使用内置 TRAE 大赛演示数据。UI 明确标注"示例模式"，用户可完整体验所有功能。配置 Key 后自动切换为"实时编译"模式。

## 技术栈

- **前端**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes + Zod Schema 校验
- **AI**: OpenAI 兼容接口（支持 DeepSeek 等供应商）
- **部署**: Vercel

## 环境变量（可选服务端配置）

| 变量名 | 说明 |
|--------|------|
| `AI_API_KEY` | AI 模型 API Key（不设置则使用内置 Demo） |
| `AI_BASE_URL` | API 基地址（如 `https://api.deepseek.com`） |
| `AI_MODEL` | 模型名称（如 `deepseek-chat`） |

> 以上变量仅在服务端读取，不会暴露给浏览器。不设置时应用自动降级为 Demo 模式。

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build && npm start

# 运行测试
npm test
```

## 在线访问

- 线上地址: https://trae-bs1.vercel.app
- 工作台: https://trae-bs1.vercel.app/workspace

## 许可证

MIT
