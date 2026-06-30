# Enterprise Admin Kit

A modern enterprise-level admin starter based on Vue3 + TypeScript.

中文：一个面向企业后台系统与 AI Runtime 控制台的企业级前端框架（Enterprise AI Control Plane + Admin System）。

## System Positioning

Enterprise Admin Kit is not a traditional admin dashboard.

It is an:

> AI Runtime Framework + Enterprise Control Plane for LLM Applications

It combines:

- Enterprise Admin System: RBAC, schema-driven UI and CRUD engine
- AI Runtime Framework: ChatRuntime, Provider, Context, Prompt, Knowledge and Observability
- AI Control Plane: configuration, debugging, prompt operations and runtime observability UI

## AI Runtime Architecture

The AI system is designed as a layered runtime engine:

```text
Chat UI
  ->
useChatRuntime (UI Bridge Layer)
  ->
ChatRuntime (Orchestration Kernel)
  ->
EventBus (Runtime Event System)
  ->
Provider Layer (Multi-model Abstraction)
  ->
Context Manager (Token & Memory Control)
  ->
Prompt Engine (Template-based Prompt System)
  ->
Knowledge System (Mock RAG Retrieval Layer)
  ->
Observability Layer (Tracing & Metrics)
```

The key architectural rule:

> Chat does not control AI. Chat only renders runtime state.

架构原则：Chat 页面只负责展示和交互，AI 行为由 Runtime、Provider、Context、Prompt、Knowledge 和 Observability 模块解耦承接。

## AI Control Plane

The `/ai` module acts as a unified control plane for AI runtime configuration and debugging.

It provides visibility and control over:

- Model routing and multi-provider switching
- Provider credentials and endpoint configuration
- Prompt engineering with template preview
- Knowledge retrieval through a mock RAG workspace
- Runtime configuration for context, tokens and compression
- Observability for trace, latency, tokens and streaming chunks

This turns AI behavior from a code-driven feature into a configuration-driven runtime system.

## Features

### Enterprise Admin System

- RBAC permission model with route, menu, button and field control
- Dynamic route and menu generation from login response
- Schema-driven form system
- TablePage CRUD generator with search, table, pagination and actions
- Axios request layer with retry, loading, error and business error interceptors
- Pinia stores with local persistence
- Bilingual i18n support
- Mock.js browser mock and optional Node mock server
- Element Plus + UnoCSS responsive admin UI

### AI Runtime Framework

- ChatRuntime orchestration engine
- Event-driven runtime lifecycle with EventBus
- Provider abstraction layer with MockProvider and OpenAI / Claude / Qwen / DeepSeek stub providers
- Context Manager for token estimation and compression strategies
- Prompt Engine with template registry and variable injection
- Mock RAG Knowledge System with document chunks, keyword retrieval and citations
- Observability layer with trace collection, event timeline, token monitor and latency tracker
- Streaming chat with stop, retry and clear behavior through the runtime bridge

### AI Admin Console (`/ai`)

#### Provider Center

- Switch active AI provider
- Select model
- Tune `temperature`, `topP` and `maxTokens`
- Send runtime probe messages

#### Provider Credentials

- Configure `API Key`
- Configure provider `Base URL`
- Store optional `Organization ID` and `Project ID`
- Persist credentials per provider through the AI config store

Credential note:

- Credentials are currently stored in localStorage for demo and framework configuration previews.
- Production systems should keep long-lived API keys in a backend vault or gateway layer.

#### Knowledge Base Manager

- Create mock knowledge workspaces
- Upload text documents through textarea input
- Split documents into chunks
- Test keyword-based retrieval
- Preview citations from retrieved chunks

#### Prompt Studio

- View and edit prompt templates
- Inject variables with `{{variableName}}` syntax
- Preview rendered prompts
- Manage global system prompt

#### Observability Dashboard

- Inspect request traces
- View token usage
- Analyze latency metrics, including TTFT and total request time
- Replay runtime event timeline
- Inspect streaming chunks

#### Settings Center

- Configure context window
- Select compression strategy
- Toggle streaming, knowledge retrieval and cache
- Export and import AI runtime config JSON

#### Runtime Playground

- Run the existing chat interface through `useChatRuntime`
- Verify message state, streaming and runtime events from the UI layer

## Runtime Observability

The observability layer is passive and subscribes through EventBus only.

It tracks:

- Request traces with `traceId`
- Event timeline for chat lifecycle events
- Token usage
- Streaming chunk count and chunk rate
- Latency metrics
- Error and abort states

This makes the AI system inspectable without coupling debug logic into ChatRuntime or UI components.

## Tech Stack

Vue3, TypeScript, Vite, Pinia, Vue Router, Vue I18n, Element Plus, Axios, ECharts, UnoCSS, Mock.js, Vitest, ESLint, Prettier, Husky and Commitlint.

## Quick Start

```bash
npm install
npm run dev
```

Browser mock is enabled by default.

## Mock Server Optional

To use the standalone Node mock server:

```bash
npm run dev:mock-server
VITE_USE_BROWSER_MOCK=false npm run dev
```

## Demo Accounts

```text
admin / admin123
user / user123
```

## Project Structure

```text
src
├── api
├── ai
│   ├── composables
│   ├── config
│   ├── context
│   ├── events
│   ├── knowledge
│   ├── observability
│   ├── prompt
│   ├── providers
│   ├── runtime
│   └── types
├── assets
├── components
├── composables
├── directives
├── hooks
├── layouts
├── locales
├── pages
├── plugins
├── router
├── schemas
├── services
├── store
├── types
└── utils
```

## Core Design Principles

### 1. Runtime-first architecture

AI behavior is controlled by the runtime engine, not by UI components.

### 2. Event-driven system

AI lifecycle changes are modeled as EventBus events such as `chat:start`, `chat:chunk`, `chat:finish`, `chat:error` and `chat:abort`.

### 3. Provider abstraction

AI vendors are decoupled behind a provider interface, allowing provider switching without rewriting ChatRuntime.

### 4. Context-aware generation

Token estimation, message windows and compression strategies are handled by ContextManager.

### 5. Prompt as a first-class runtime asset

Prompt templates are managed by PromptEngine instead of being hardcoded inside ChatRuntime.

### 6. Observability by design

Every AI request can be traced, measured and inspected without changing runtime behavior.

## Architecture Principles

- UI layer is purely presentational
- Runtime layer controls AI behavior
- Providers are pluggable modules
- Context is independently managed
- Prompt system is template-driven
- Knowledge retrieval is standalone and runtime-ready
- Observability is passive and non-intrusive
- Configuration is centralized in AI Config Store

## Validation

Recommended checks:

```bash
npm run lint
npm exec vue-tsc -- -b
npm exec vite -- build --target esnext
```

Targeted AI Console checks:

```bash
npm exec eslint -- src/pages/ai/index.vue src/ai/types/index.ts src/ai/config/defaultConfig.ts src/store/modules/aiConfig.ts src/locales/en-US.ts src/locales/zh-CN.ts
```

## Interview Talking Points

- Why AI Runtime should be event-driven instead of component-driven
- Why ChatRuntime owns streaming, cancellation, retry and message state transitions
- Why Provider abstraction enables multi-model scalability
- Why ContextManager is critical for LLM token constraints
- Why Prompt must be treated as a runtime asset
- Why Observability is required for production AI systems
- Why UI must be separated from the AI execution layer
- Why Provider credentials belong to the AI Config Center instead of page-local state
- Why an AI Control Plane is necessary for enterprise usage

## Roadmap

- Dark theme token switcher
- Virtual table for large datasets
- Excel export
- Advanced RAG with vector database integration
- Real OpenAI / Claude / Qwen / DeepSeek provider adapters
- Backend-managed credential vault
- Plugin marketplace for Provider / Prompt / Tool modules
- Workflow orchestration through AI Flow Builder
- Micro frontend shell

## Summary

This project demonstrates:

> Enterprise-level AI Runtime architecture design capability + scalable frontend system engineering.

It is not just an admin system.

It is an AI application infrastructure framework.
