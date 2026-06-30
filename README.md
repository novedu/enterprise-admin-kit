# Enterprise Admin Kit

A modern enterprise-level admin starter based on Vue3 + TypeScript.

中文：一个面向企业后台、AI Runtime 控制台和权限复杂场景的 Vue3 + TypeScript Admin Kit。

## Features

- RBAC permission model with route, menu, button and field control
- Dynamic route and menu generation from login response
- Schema Form with Input, Select, Date, Radio and Upload renderers
- TablePage CRUD generator with search, table, pagination and actions
- Enterprise AI Runtime with EventBus, ChatRuntime, Provider abstraction, Context Manager, Prompt Engine, mock RAG and Observability
- AI Admin Console for provider routing, model parameters, provider credentials, knowledge retrieval, prompt preview, runtime settings and trace inspection
- MockProvider streaming, stop/retry/clear, Markdown rendering, code highlight and runtime event tracing
- Bilingual UI with English and Chinese locale packs
- Realtime notification service with simulated WebSocket events
- Dashboard with metrics, server status and ECharts visualization
- Axios request layer with interceptor, retry, loading, error and business error handling
- Pinia stores with local persistence
- Element Plus + UnoCSS responsive admin UI
- ESLint, Prettier, Husky, Commitlint and Vitest ready

## Tech Stack

Vue3, TypeScript, Vite, Pinia, Vue Router, Vue I18n, Element Plus, Axios, ECharts, UnoCSS, Mock.js, Vitest, ESLint, Prettier, Husky and Commitlint.

## Quick Start

```bash
npm install
npm run dev
```

Browser mock is enabled by default. To use the standalone Node mock server:

```bash
npm run dev:mock-server
VITE_USE_BROWSER_MOCK=false npm run dev
```

Demo accounts:

```text
admin / admin123
user / user123
```

## AI Runtime

The AI layer is designed as an enterprise runtime framework rather than a page-level demo.

```text
Chat UI
  ↓
useChatRuntime
  ↓
ChatRuntime
  ↓
EventBus
  ↓
Provider / Context / Prompt / Knowledge / Observability
```

Core modules:

- `src/ai/events`: framework-level EventBus and runtime event contract
- `src/ai/types`: shared AI data contracts for messages, requests, providers, token usage, citations and config
- `src/ai/runtime`: ChatRuntime orchestration layer
- `src/ai/providers`: provider interface, MockProvider and provider factory
- `src/ai/context`: token estimation and context compression strategies
- `src/ai/knowledge`: mock RAG workspace, document store, chunker, retriever and citations
- `src/ai/prompt`: PromptEngine, template registry and variable injection
- `src/ai/observability`: trace collector, timeline, token monitor, latency tracker and runtime inspector
- `src/store/modules/aiConfig.ts`: Pinia-backed AI configuration center

架构原则：`Chat.vue` 只负责展示和交互，AI 行为由 Runtime、Provider、Context、Prompt、Knowledge 和 Observability 模块解耦承接。

## AI Admin Console

The `/ai` route is an AI control plane exposing runtime capabilities through UI:

- Provider Center: switch provider/model, tune `temperature`, `topP`, `maxTokens`, and run a runtime probe
- Provider Credentials: configure `API Key`, `Base URL`, `Organization ID` and `Project ID` per provider
- Knowledge Base Manager: create workspaces, upload mock text documents, retrieve topK chunks and inspect citations
- Prompt Studio: edit templates, inject variables and preview rendered prompts
- Observability Dashboard: inspect traces, token usage, latency, event timeline and streaming chunks
- Settings Center: manage context window, compression strategy, streaming, knowledge retrieval, cache and config JSON import/export
- Runtime Playground: run the existing chat UI through the runtime bridge

Credential note:

- Provider credentials are stored in localStorage as part of the AI config store.
- This is suitable for local demos, mock providers and framework-level configuration previews.
- For production, keep long-lived API keys on a backend vault or proxy service, and let the frontend call your own secure gateway.

中文说明：

- `/ai` 页面现在是 AI 控制台，不只是聊天 Demo。
- 支持模型服务切换、Key 配置、知识库检索、提示词预览、可观测性和运行时配置。
- API Key 当前为前端本地持久化能力，生产环境应迁移到后端密钥托管或代理层。

## Project Structure

```text
src
├── api
├── ai
├── assets
├── components
├── composables
├── directives
├── hooks
├── layouts
├── pages
├── plugins
├── router
├── schemas
├── services
├── store
├── types
└── utils
```

## Interview Talking Points

- Why RBAC is split into route, directive, button and field layers
- Why menus are generated from backend data instead of hard-coded locally
- Why TablePage owns CRUD orchestration while Schema controls rendering
- Why dynamic forms use a component mapping instead of branching in pages
- Why AI Runtime is modeled as event-driven data flow instead of component calls
- Why ChatRuntime owns streaming, cancellation, retry and message state transitions
- Why Provider, ContextManager, PromptEngine, KnowledgeBase and Observability are standalone TypeScript modules
- Why Provider credentials belong to the AI Config Center, not to page-local state
- How Axios interceptors normalize business errors, retry transient failures and keep UI feedback consistent

## Validation

Recommended checks:

```bash
npm exec eslint -- src/pages/ai/index.vue src/ai/types/index.ts src/ai/config/defaultConfig.ts src/store/modules/aiConfig.ts src/locales/en-US.ts src/locales/zh-CN.ts
npm exec vue-tsc -- -b
npm exec vite -- build --target esnext
```

## Roadmap

- Dark theme token switcher
- Virtual table
- Excel export
- Monaco editor
- Markdown editor
- Real OpenAI / Claude / Qwen / DeepSeek provider adapters
- Backend-managed provider credentials
- Micro frontend shell
