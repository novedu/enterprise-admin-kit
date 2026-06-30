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
- Provider credential references without exposing raw API keys
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
- Provider capabilities and normalized provider error contracts
- Context Manager for token estimation and compression strategies
- Prompt Engine with template registry and variable injection
- Mock RAG Knowledge System with document chunks, keyword retrieval and citations
- Bounded Observability layer with trace collection, event timeline, token monitor and latency tracker
- RuntimeGuard for state transition, timeout, retry, token and circuit-breaker protection
- AI Config governance with schema validation, config diff preview and safe fallback
- Streaming chat with stop, retry and clear behavior through the runtime bridge

### AI Admin Console (`/ai`)

#### Provider Center

- Switch active AI provider
- Select model
- Tune `temperature`, `topP` and `maxTokens`
- Send runtime probe messages

#### Provider Credentials

- Configure managed credential references
- Store `ProviderCredential` as `{ id, name, type, encryptedRef }`
- Prevent raw API keys from entering frontend runtime config
- Persist only credential references per provider through the AI config store

Credential note:

- Raw API keys are intentionally not stored in localStorage.
- `encryptedRef` is a mock-safe reference for a backend vault or gateway-managed secret.
- Production systems should resolve credentials server-side, never in ChatRuntime or UI code.

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

Observability is bounded by design:

- Max trace limit per session
- Max event count per trace
- Chunk sampling modes for `debug`, `normal` and `production`
- Automatic trimming for old traces, latency metrics and token usage

This makes the AI system inspectable without coupling debug logic into ChatRuntime or UI components.

## Production Hardening

The runtime has been hardened from an advanced demo architecture into a production-grade engineering blueprint.

### Configuration Governance

- Central `AIConfig` versioning with `v1`
- Runtime config validation before apply
- Provider, context, token, timeout and knowledge settings are constrained
- Invalid config is rejected
- Safe fallback config is used when persisted config is broken
- Config diff preview is available before apply

### Security Model

- Frontend runtime stores credential references only
- Raw `apiKey` / `baseUrl` credential shapes are detected and stripped during config migration
- Provider credentials are represented as managed references:

```ts
type ProviderCredential = {
  id: string
  name: string
  type: 'mock' | 'openai' | 'claude' | 'qwen' | 'deepseek'
  encryptedRef: string
}
```

### Runtime Safety

- ChatRuntime state transitions are guarded by RuntimeGuard
- Provider token and context limits are enforced before execution
- Request timeout protection is applied to provider streaming
- Retry count is limited by config
- Provider failures are normalized and can trigger a mock circuit breaker

### RAG Governance

- Knowledge documents are scoped by workspace
- Oversized documents are rejected
- Chunk size is clamped to a safe range
- Retrieval `topK` is capped
- Retrieval score is bounded

### Provider Hardening

Providers expose a common capability contract:

```ts
type ProviderCapabilities = {
  streaming: boolean
  maxTokens: number
  contextLimit: number
  costTier: 'mock' | 'low' | 'medium' | 'high'
}
```

Provider errors are normalized with:

- Standard error code
- Retryable flag
- Provider name
- Original cause

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
│   ├── ai
│   │   ├── index.vue
│   │   ├── provider
│   │   ├── knowledge
│   │   ├── prompt
│   │   ├── observability
│   │   ├── settings
│   │   └── shared
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

### 7. Safety by default

Runtime configuration, provider execution, observability and RAG retrieval are bounded by explicit guardrails.

## Architecture Principles

- UI layer is purely presentational
- Runtime layer controls AI behavior
- Providers are pluggable modules
- Context is independently managed
- Prompt system is template-driven
- Knowledge retrieval is standalone and runtime-ready
- Observability is passive and non-intrusive
- Observability memory usage is bounded
- Configuration is centralized, validated and versioned in AI Config Store
- Runtime safety guards prevent invalid state transitions and unsafe provider calls

## Validation

Recommended checks:

```bash
npm run lint
npm exec vue-tsc -- -b
npm run test -- --run
npm exec vite -- build --target esnext
```

Targeted AI Console checks:

```bash
npm exec eslint -- src/pages/ai/index.vue src/pages/ai/provider/index.vue src/pages/ai/knowledge/index.vue src/pages/ai/prompt/index.vue src/pages/ai/observability/index.vue src/pages/ai/settings/index.vue src/pages/ai/shared/useAiControlPlane.ts src/router/index.ts src/router/routes.ts
```

Phase 4 hardening checks:

```bash
npm exec vue-tsc -- -b
npm run test -- --run
npm exec vite -- build --target esnext
```

Current expected build warnings:

- `mockjs` uses `eval` in its distributed browser mock bundle
- Rollup may remove unsupported pure annotations from `@vueuse/core`
- Monaco/editor chunks may exceed the default 500KB chunk warning threshold

## Interview Talking Points

- Why AI Runtime should be event-driven instead of component-driven
- Why ChatRuntime owns streaming, cancellation, retry and message state transitions
- Why Provider abstraction enables multi-model scalability
- Why ContextManager is critical for LLM token constraints
- Why Prompt must be treated as a runtime asset
- Why Observability is required for production AI systems
- Why UI must be separated from the AI execution layer
- Why Provider credentials belong to the AI Config Center instead of page-local state
- Why frontend AI platforms should store credential references, not raw keys
- Why production AI runtime needs config validation, bounded observability and runtime guardrails
- Why an AI Control Plane is necessary for enterprise usage

## Roadmap

- Dark theme token switcher
- Virtual table for large datasets
- Excel export
- Advanced RAG with vector database integration
- Real OpenAI / Claude / Qwen / DeepSeek provider adapters
- Backend-managed credential vault
- Server-side provider gateway and credential resolver
- Plugin marketplace for Provider / Prompt / Tool modules
- Workflow orchestration through AI Flow Builder
- Micro frontend shell

## Summary

This project demonstrates:

> Enterprise-level AI Runtime architecture design capability + scalable frontend system engineering.

It is not just an admin system.

It is an AI application infrastructure framework.
