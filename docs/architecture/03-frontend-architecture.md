# Enterprise AI Platform Frontend Architecture

## Purpose

This document defines the frontend architecture for Enterprise AI Platform. It describes how the frontend should evolve from an enterprise admin starter into a workspace-first AI platform with runtime orchestration, provider abstraction, prompt operations, knowledge management, observability, governance, and extensibility.

This is an architecture handbook. It is not an implementation guide and does not prescribe individual component code. It defines boundaries, dependency rules, folder ownership, module conventions, store responsibilities, runtime rules, and long-term evolution paths.

Current technology stack:

- Vue3
- TypeScript
- Vite
- Pinia
- Vue Router
- Element Plus
- UnoCSS

The stack is intentionally pragmatic. The architecture should not depend on framework-specific tricks. The platform must be able to evolve toward SSR, desktop shells, micro frontends, plugins, and SDK surfaces without rewriting the domain model or runtime model.

## Frontend Vision

The frontend is the operating surface of the Enterprise AI Platform.

It must support several product modes:

- Workspace administration
- AI application management
- Prompt engineering
- Knowledge operations
- Runtime testing
- Provider control
- Observability and debugging
- Governance review
- Enterprise administration

The frontend should not be treated as a collection of pages. It should be treated as a product shell that hosts domain modules. Each module owns a clear business area, interacts with stores through stable contracts, uses composables for presentation orchestration, and delegates AI execution to runtime services.

The frontend vision is:

```text
Enterprise AI Platform Frontend
  = Product Shell
  + Workspace Context
  + Domain Modules
  + Runtime Bridge
  + State Stores
  + Shared Design System
  + Extensible Integration Surface
```

The most important architectural shift is from admin-page thinking to platform-context thinking.

Old mental model:

```text
Route -> Page -> API -> Table/Form
```

Target mental model:

```text
Shell
  -> Workspace Context
    -> Application Context
      -> Domain Module
        -> Composable
          -> Store or Runtime
            -> Domain Service or Provider
```

The UI should express business workflows. It should not expose implementation structure. Users should feel they are operating an AI platform, not navigating a generic Vue admin template.

## Architecture Principles

### Workspace First

Workspace is the root frontend context. Every AI-related screen must be aware of workspace scope, even if workspace is not yet implemented in all runtime paths.

Frontend implications:

- The shell should display the current workspace.
- AI Studio pages should read workspace context.
- Application, prompt, knowledge, runtime, and trace pages should be workspace-scoped.
- Stores should avoid global AI state that cannot be resolved to workspace.
- When workspace changes, application and runtime selections must be revalidated.

Workspace is not a visual filter. It is a domain boundary reflected in frontend state.

### Application First

Applications are the business-facing unit of AI behavior. Provider, prompt, knowledge, and runtime settings become meaningful when bound to an application.

Frontend implications:

- Conversation pages should require an application context.
- Runtime Playground should execute against an application.
- Prompt and knowledge pages may show workspace-level assets, but should make application bindings visible.
- Observability should filter by application.
- Runtime settings should distinguish workspace defaults from application overrides.

### Runtime Driven

AI execution is controlled by runtime services, not by UI pages.

Frontend implications:

- UI cannot implement streaming logic.
- UI cannot manually merge chunks into assistant messages.
- UI cannot own retry, abort, token, context, provider, or prompt logic.
- UI triggers runtime actions and renders runtime snapshots.
- Runtime emits state and lifecycle events.

The frontend should make runtime behavior visible without duplicating runtime behavior.

### Configuration Over Hardcode

Runtime behavior should be changed through validated configuration, not code edits.

Frontend implications:

- Provider, model, temperature, topP, max tokens, context window, compression strategy, knowledge toggle, streaming toggle, timeout, retry, and prompt should be configurable.
- Config changes must pass through ConfigStore or configuration domain services.
- Invalid config should be rejected before it affects runtime.
- Config import/export should be treated as an advanced operation with validation and diff preview.

### Loose Coupling

Frontend modules must be coupled through stable contracts, not through direct imports across business areas.

Rules:

- UI cannot call Provider directly.
- UI cannot mutate runtime internals.
- Composable cannot own durable business logic.
- Store cannot manipulate DOM.
- Runtime cannot import Vue.
- Provider cannot know UI.
- Knowledge should not depend on ChatRuntime.
- Prompt should not depend on UI components.
- Observability listens to runtime events and must not alter runtime execution.

### Event Driven Runtime

AI execution produces lifecycle events. Events are used for snapshots, observability, debugging, and eventually audit.

Frontend implications:

- Runtime events should have stable names and payload contracts.
- Stores may subscribe through bridge composables or runtime services.
- Observability modules should subscribe passively.
- UI should not use event payloads as an excuse to own business logic.
- Events should include trace identity and future workspace/application identity.

### Domain Modules Over Technical Pages

The project should move from route-centric organization to domain module organization.

Frontend implications:

- Workspace, Application, Prompt, Knowledge, Provider, Runtime, Observability, Governance, and Admin should be modules.
- Pages inside a module should share local composables, stores, and domain adapters.
- Shared code should move to `shared` only when it is genuinely reusable and domain-neutral.
- Domain code should not be hidden inside generic page folders.

### Typed Boundaries

TypeScript types are architecture boundaries.

Frontend implications:

- Domain entities should be typed in the domain layer.
- Runtime contracts should be typed in the runtime layer.
- Store state should use domain and runtime types.
- Component props should not redefine core domain entities.
- Avoid page-local interfaces for entities such as Workspace, Application, Conversation, Message, Prompt, KnowledgeBase, Trace, Provider, User, Role, and Permission.

### Progressive Hardening

The frontend should support mock operation today and production integration later.

Frontend implications:

- Mock services should follow the same contracts as production services.
- Credential references should never be replaced with frontend raw key storage.
- Observability should remain bounded.
- Runtime guardrails should remain active even in development.
- Stores should be ready for backend synchronization.

## Target Folder Architecture

The target source structure is:

```text
src
├── core
├── domain
├── runtime
├── modules
├── shared
├── shell
├── assets
└── plugins
```

This structure separates platform infrastructure, domain model, runtime orchestration, product modules, shared utilities, and application shell.

## Layer Responsibilities

### core

`core` contains platform-level infrastructure that is not specific to AI or any business module.

Belongs in `core`:

- HTTP client abstraction
- Error handling primitives
- Storage abstraction
- Environment access
- Logging adapter
- Feature flag reader
- Permission evaluator interface
- App bootstrap contracts
- Global constants
- Cross-cutting type helpers

Does not belong in `core`:

- Workspace business logic
- AI runtime execution
- Prompt rendering
- Knowledge retrieval
- Provider adapters
- UI page logic
- Store modules for specific domains

Design rule:

`core` should be small. If `core` becomes large, the project is hiding domain logic in infrastructure.

### domain

`domain` contains business domain types, value objects, domain policies, and domain-level contracts. It should not depend on UI or runtime implementation.

Belongs in `domain`:

- Workspace types
- Application types
- Conversation and Message types
- Prompt and PromptVersion types
- KnowledgeBase, Document, Chunk, Citation types
- Provider domain types
- CredentialReference type
- Runtime domain types
- Trace and TokenUsage types
- User, Role, Permission, AuditLog types
- Domain events
- Domain policies
- Domain validation contracts

Does not belong in `domain`:

- UI components
- Page composables
- Provider network adapters
- DOM utilities
- Element Plus specific types
- Route definitions

Design rule:

`domain` defines the language of the platform. If two modules need the same business concept, it should live in `domain`.

### runtime

`runtime` contains pure AI execution orchestration. It is framework-independent and must not import Vue, Pinia, router, DOM, or UI-specific packages.

Belongs in `runtime`:

- ChatRuntime
- RuntimeFactory
- ProviderFactory
- ContextBuilder
- PromptBuilder
- KnowledgeRetriever
- StreamingPipeline
- TokenEstimator
- RetryPolicy
- RuntimeGuard
- TraceCollector
- EventBus
- Runtime events
- Provider interfaces
- Runtime configuration contracts

Does not belong in `runtime`:

- Vue composables
- Pinia stores
- UI state
- Page filters
- DOM scroll logic
- Toast messages
- Router navigation

Design rule:

Runtime is the execution engine. UI can trigger runtime, but runtime must not know UI exists.

### modules

`modules` contains product modules. Each module maps to a business capability and may contain pages, composables, local stores, adapters, and module-specific presentation logic.

Target modules:

- workspace
- application
- conversation
- provider
- prompt
- knowledge
- runtime-settings
- observability
- governance
- admin
- profile

Belongs in a module:

- Module routes
- Module pages
- Module-specific composables
- Module-specific store when not global
- Module-specific adapters
- Module-level constants
- Module-specific presentation helpers

Does not belong in a module:

- Runtime execution internals
- Provider implementation details
- Generic UI components used everywhere
- Cross-domain entity types
- Global app shell

Design rule:

A module should be independently understandable. A new engineer should be able to open `modules/prompt` and understand prompt operations without reading unrelated workspace or knowledge page files.

### shared

`shared` contains reusable frontend building blocks that are domain-neutral.

Belongs in `shared`:

- Shared UI primitives
- Reusable form shells
- Reusable table wrappers
- Empty state patterns
- Status badges
- Copy-to-clipboard helper UI
- Layout helpers
- Formatting utilities
- Date/time formatting
- Generic validation display
- Generic composables without business ownership

Does not belong in `shared`:

- Prompt-specific editor logic
- Knowledge retrieval logic
- Provider routing behavior
- Workspace state
- Application selection logic
- Runtime orchestration

Design rule:

Only promote code to `shared` after at least two modules need it and it has no domain-specific assumptions.

### shell

`shell` contains the application frame.

Belongs in `shell`:

- Main layout
- Sidebar navigation
- Header
- Workspace switcher slot
- Application switcher slot
- Breadcrumbs
- Account menu
- Route guards at shell level
- Navigation model
- Global loading or error boundaries

Does not belong in `shell`:

- Prompt editor
- Knowledge document upload logic
- Provider settings form logic
- Runtime execution logic
- Domain-specific data fetching

Design rule:

The shell provides context and navigation. It does not own module behavior.

### assets

`assets` contains static resources.

Belongs in `assets`:

- Images
- Fonts
- Icons when not from icon library
- Static illustrations
- Static JSON samples when truly static

Does not belong in `assets`:

- Runtime config
- Prompt templates that users can edit
- Knowledge documents
- Provider definitions

### plugins

`plugins` contains app installation and integration adapters.

Belongs in `plugins`:

- UI library registration
- i18n registration
- router registration
- Pinia registration
- icon registration
- analytics installation
- future plugin host bootstrap

Does not belong in `plugins`:

- Business plugin marketplace domain
- Runtime provider plugins
- Tool plugins
- Prompt packs

Design rule:

App plugins install infrastructure. Product plugins belong to domain/runtime/plugin marketplace design.

## Folder Convention

Target convention:

```text
src
├── core
│   ├── http
│   ├── storage
│   ├── errors
│   ├── env
│   └── permissions
├── domain
│   ├── workspace
│   ├── application
│   ├── conversation
│   ├── prompt
│   ├── knowledge
│   ├── provider
│   ├── runtime
│   ├── observability
│   ├── governance
│   └── identity
├── runtime
│   ├── chat
│   ├── context
│   ├── events
│   ├── knowledge
│   ├── prompt
│   ├── providers
│   ├── streaming
│   ├── token
│   ├── trace
│   └── guard
├── modules
│   ├── workspace
│   ├── application
│   ├── conversation
│   ├── provider
│   ├── prompt
│   ├── knowledge
│   ├── runtime-settings
│   ├── observability
│   ├── governance
│   └── admin
├── shared
│   ├── ui
│   ├── composables
│   ├── utils
│   └── styles
├── shell
│   ├── layout
│   ├── navigation
│   ├── guards
│   └── context
├── assets
└── plugins
```

The current project may not yet use this structure fully. Migration should happen gradually. The goal is to avoid breaking working modules while moving domain and runtime concepts into stable homes.

## Dependency Rules

### Allowed Direction

```text
modules
  -> shared
  -> domain
  -> runtime contracts
  -> core

runtime
  -> domain
  -> core

shell
  -> modules route metadata
  -> shared
  -> stores
  -> domain

stores
  -> domain
  -> runtime snapshots/contracts
  -> core storage
```

### Forbidden Direction

```text
runtime -> modules
runtime -> shell
runtime -> UI library
runtime -> Pinia
runtime -> router

domain -> modules
domain -> runtime implementation
domain -> UI library

provider -> UI
provider -> stores
provider -> router

store -> DOM
store -> UI component
store -> page-specific draft state

shared -> modules
shared -> runtime implementation
```

### Practical Rules

- UI cannot call Provider directly.
- UI cannot instantiate ChatRuntime directly.
- UI should use composables or module services.
- Composable cannot own durable business rules.
- Store cannot manipulate DOM.
- Store cannot perform streaming chunk assembly unless it is explicitly a runtime snapshot cache.
- Runtime cannot import Vue.
- Runtime cannot import Pinia.
- Runtime cannot trigger toast, modal, drawer, or route navigation.
- Provider cannot know UI.
- Provider cannot write stores.
- Observability cannot alter runtime execution.
- Config must be validated before runtime consumes it.

## Module Convention

Each product module should follow a stable internal layout:

```text
modules/<module-name>
├── pages
├── composables
├── store
├── services
├── adapters
├── types
├── constants
└── index
```

Not every module needs every folder. The convention defines where things go when they exist.

### pages

Pages define route-level product surfaces. They compose stores, composables, and shared UI. They do not own business logic.

Allowed:

- Layout composition
- Rendering state
- Binding user input to composable methods
- Passing route parameters to composables
- Showing empty states

Not allowed:

- Runtime orchestration
- Provider calls
- Direct persistence
- Cross-module mutation
- Complex domain decisions

### composables

Module composables coordinate page behavior. They are the bridge between UI, stores, runtime, and services.

Allowed:

- Map store state into page-friendly computed values
- Subscribe/unsubscribe to runtime or module events
- Expose page actions
- Manage temporary draft state
- Call store actions
- Call runtime bridge actions

Not allowed:

- Own aggregate lifecycle rules
- Own provider implementation
- Own context compression
- Own retrieval scoring
- Own durable source of truth

### store

Module stores own durable frontend state for a domain scope. Stores must have clear ownership and persistence rules.

Allowed:

- Store current domain selection
- Store list data
- Store snapshot cache
- Store validated configuration
- Store normalized entity summaries
- Expose actions that represent domain operations

Not allowed:

- Manipulate DOM
- Render markdown
- Manage scroll behavior
- Assemble provider chunks if runtime owns that behavior
- Store raw secrets

### services

Module services coordinate domain operations and remote calls. In early mock mode, services may use local memory or local storage. In production, services become API clients.

Allowed:

- Fetch domain data
- Persist domain state
- Normalize backend payloads
- Call repositories or API adapters
- Implement module-specific business operations

Not allowed:

- UI rendering
- DOM access
- Runtime streaming internals

### adapters

Adapters translate external or legacy data into domain/module contracts.

Examples:

- Transform provider API model into Provider domain model.
- Transform legacy mock response into Application summary.
- Transform route params into domain IDs.
- Transform observability event payload into timeline row.

Adapters protect the module from external shape changes.

### types

Module-local types are allowed only when they are presentation or module-specific. Shared domain entities belong in `domain`.

Examples of allowed module types:

- ProviderCenterViewModel
- TraceTimelineRow
- PromptVariableDraft
- KnowledgeUploadDraft

Examples that should not be module-local:

- Workspace
- Application
- Conversation
- Message
- Prompt
- KnowledgeBase
- Provider
- Trace

## Composable Convention

Composables are orchestration bridges. They should be small, named by intent, and scoped clearly.

### Naming

Preferred naming:

- `useWorkspace`
- `useWorkspaceSwitcher`
- `useApplicationContext`
- `useConversationRuntime`
- `useProviderCenter`
- `usePromptStudio`
- `useKnowledgeCenter`
- `useRuntimeSettings`
- `useTraceInspector`
- `useGovernancePolicy`

Avoid vague names:

- `useData`
- `usePage`
- `useHelper`
- `useCommon`
- `useAI`

### Responsibilities

A composable may:

- Read stores
- Expose computed state
- Manage temporary form drafts
- Call store actions
- Call runtime bridge methods
- Subscribe to event streams
- Clean up subscriptions
- Convert domain state into page view models

A composable may not:

- Define core domain entities
- Own runtime message state
- Own provider streaming logic
- Store raw credentials
- Mutate DOM directly
- Become a hidden service layer with unrelated responsibilities

### Scope

Composables should be placed according to scope:

- Module-specific composable: `modules/<module>/composables`
- Domain-neutral reusable composable: `shared/composables`
- Shell context composable: `shell/context`
- Runtime bridge composable: runtime-facing module or runtime bridge area

If a composable imports many modules, it is probably hiding an architectural boundary problem.

### Draft State

Composables may own draft state because draft state is often page-local.

Examples:

- Prompt template draft
- Config JSON draft
- Credential reference draft
- Knowledge upload draft
- Retrieval test query

Draft state must be submitted through store actions or domain services before it becomes durable.

## Store Convention

Stores define frontend state ownership. They should use domain language and should avoid becoming arbitrary global data bags.

### Store Types

The platform uses several store categories:

- Context stores: current workspace, current application
- Entity stores: workspace list, application list, prompt list
- Runtime snapshot stores: current runtime state
- Configuration stores: validated runtime/provider settings
- Observability stores: trace and event snapshots
- Identity stores: auth, role, permissions

### Persistence Rules

Persistence should be explicit.

Persist:

- Auth session if policy allows
- Current workspace ID
- Current application ID if still valid
- UI preferences
- Validated configuration when intended

Do not persist:

- Raw credentials
- Streaming message chunks as unstable drafts
- Large trace timelines without retention policy
- Sensitive message content unless product policy allows
- Page-level drafts unless autosave is intentional

### Store Dependency Rules

Stores may depend on:

- Domain types
- Core storage abstractions
- Domain services
- Runtime snapshot contracts

Stores may not depend on:

- UI components
- DOM
- Element Plus message boxes
- Router navigation side effects unless isolated in shell/navigation logic
- Provider implementation details

## Store Design

### WorkspaceStore

Responsibilities:

- Own current workspace selection.
- Store available workspace list.
- Persist last selected workspace.
- Provide workspace switching behavior.
- Expose workspace-scoped metadata for shell and modules.

State:

- `currentWorkspace`
- `workspaceList`
- `currentWorkspaceId`
- `loading`
- `error`

Actions:

- createWorkspace
- deleteWorkspace
- renameWorkspace
- switchWorkspace
- loadWorkspaces
- persistWorkspace
- clearWorkspace

Getters:

- currentWorkspaceName
- hasWorkspace
- workspaceOptions
- canSwitchWorkspace

Persistence:

- Persist current workspace ID.
- Persist workspace list only in mock/local mode.
- Production should hydrate from backend.

Dependencies:

- Workspace domain types
- Workspace service
- AuthStore for accessible workspace scope
- Storage abstraction

### ApplicationStore

Responsibilities:

- Own current application selection inside workspace.
- Store application list for current workspace.
- Provide application metadata and status.
- Reset or re-resolve when workspace changes.

State:

- `currentApplication`
- `applicationList`
- `currentApplicationId`
- `workspaceId`
- `loading`
- `error`

Actions:

- loadApplications
- createApplication
- renameApplication
- archiveApplication
- switchApplication
- clearApplicationSelection
- refreshApplicationStatus

Getters:

- activeApplications
- archivedApplications
- currentApplicationName
- hasApplication
- applicationOptions

Persistence:

- Persist current application ID only with workspace ID.
- Clear persisted application if it does not belong to current workspace.

Dependencies:

- WorkspaceStore
- Application service
- Application domain types
- Runtime status summaries

### ConversationStore

Responsibilities:

- Store conversation list for current application.
- Store selected conversation.
- Cache conversation message snapshots for UI rendering.
- Link conversation records to runtime traces.

State:

- `conversationList`
- `currentConversation`
- `currentConversationId`
- `messages`
- `applicationId`
- `loading`
- `error`

Actions:

- loadConversations
- createConversation
- switchConversation
- archiveConversation
- clearConversation
- setRuntimeSnapshot
- linkTraceToConversation

Getters:

- visibleMessages
- latestMessage
- hasActiveConversation
- conversationOptions
- messagesByRole

Persistence:

- Persist selected conversation ID if product policy allows.
- Message content persistence depends on retention and privacy policy.
- Runtime snapshots should remain bounded.

Dependencies:

- ApplicationStore
- RuntimeStore
- Conversation domain types
- TraceStore for trace links

### ProviderStore

Responsibilities:

- Store provider list, provider capabilities, selected provider config, model options, and credential reference status.
- Expose provider health and availability summaries.

State:

- `providerList`
- `currentProvider`
- `modelList`
- `capabilitiesByProvider`
- `credentialReferences`
- `healthByProvider`
- `loading`
- `error`

Actions:

- loadProviders
- switchProvider
- setModel
- updateProviderParameters
- saveCredentialReference
- clearCredentialReference
- testProviderHealth
- refreshCapabilities

Getters:

- currentProviderName
- currentModelOptions
- currentCapabilities
- hasCredentialReference
- providerHealthStatus

Persistence:

- Persist provider selection only through validated configuration.
- Persist credential references, never raw credentials.
- Production should hydrate provider list and credential references from backend.

Dependencies:

- ConfigStore
- Provider domain types
- CredentialReference domain type
- ProviderFactory contract for local/mock mode

### KnowledgeStore

Responsibilities:

- Store knowledge bases for current workspace.
- Store active knowledge base.
- Store document list and retrieval test results.
- Provide citation preview state.

State:

- `knowledgeBaseList`
- `currentKnowledgeBase`
- `documentList`
- `retrievedChunks`
- `citations`
- `retrievalQuery`
- `topK`
- `loading`
- `error`

Actions:

- loadKnowledgeBases
- createKnowledgeBase
- switchKnowledgeBase
- uploadDocument
- deleteDocument
- runRetrieval
- clearRetrievalResults
- refreshDocuments

Getters:

- activeKnowledgeBaseName
- documentCount
- hasDocuments
- retrievalResultCount
- citationCount

Persistence:

- Persist active knowledge base ID by workspace.
- Document content persistence must follow data policy.
- Mock mode may persist locally; production should use backend knowledge services.

Dependencies:

- WorkspaceStore
- Knowledge domain types
- Knowledge service
- ConfigStore for knowledge settings

### PromptStore

Responsibilities:

- Store prompts and prompt versions for current workspace.
- Store selected prompt/template.
- Manage prompt draft and preview state through actions or composables.
- Expose prompt variable contract.

State:

- `promptList`
- `selectedPrompt`
- `selectedPromptVersion`
- `templateDraft`
- `systemPromptDraft`
- `previewVariables`
- `previewResult`
- `validationError`
- `loading`

Actions:

- loadPrompts
- selectPrompt
- createPrompt
- saveDraft
- publishVersion
- renderPreview
- updateSystemPrompt
- discardDraft

Getters:

- selectedPromptName
- promptVersions
- variableList
- hasDraftChanges
- isPreviewValid

Persistence:

- Persist selected prompt ID by workspace/application.
- Draft persistence should be explicit.
- Published prompt versions should be immutable and backend-owned in production.

Dependencies:

- WorkspaceStore
- ApplicationStore
- Prompt domain types
- PromptBuilder or prompt rendering service
- ConfigStore for system prompt

### RuntimeStore

Responsibilities:

- Store runtime snapshot for UI rendering.
- Store global runtime status.
- Store streaming state.
- Store active trace ID.
- Provide read-only runtime view state.

State:

- `snapshot`
- `status`
- `streaming`
- `activeTraceId`
- `lastError`
- `activeConversationId`
- `activeApplicationId`

Actions:

- setSnapshot
- setStatus
- setActiveTrace
- clearRuntimeState
- setRuntimeError

Getters:

- messages
- isStreaming
- isIdle
- isErrored
- latestAssistantMessage
- tokenUsageSummary

Persistence:

- Usually not persisted as durable source of truth.
- May persist lightweight conversation selection.
- Runtime message persistence belongs to ConversationStore or backend conversation service.

Dependencies:

- Runtime snapshot contracts
- ConversationStore for conversation linkage
- TraceStore for trace linkage

Important rule:

RuntimeStore is not the runtime engine. It is a UI-facing snapshot cache.

### TraceStore

Responsibilities:

- Store trace list, selected trace, timeline events, token usage, latency metrics, and error summaries.
- Provide observability data for runtime inspection pages.

State:

- `traceList`
- `selectedTraceId`
- `events`
- `tokenUsage`
- `latencyMetrics`
- `errorGroups`
- `samplingMode`
- `loading`

Actions:

- loadTraces
- selectTrace
- appendTraceSnapshot
- clearTraceCache
- setSamplingMode
- exportTrace
- filterTraces

Getters:

- selectedTrace
- selectedTraceEvents
- selectedTokenUsage
- selectedLatency
- runningTraces
- failedTraces

Persistence:

- Bounded cache only.
- Production trace persistence belongs to observability backend.
- Local trace data must respect retention limits.

Dependencies:

- Runtime observability contracts
- WorkspaceStore
- ApplicationStore
- Runtime events or observability service

### ConfigStore

Responsibilities:

- Store validated runtime and AI configuration.
- Provide config update actions.
- Support import/export.
- Provide diff preview.
- Reject invalid config.
- Emit configuration change events when appropriate.

State:

- `currentConfig`
- `configVersion`
- `validationErrors`
- `validationWarnings`
- `lastDiff`
- `safeFallbackConfig`

Actions:

- updateConfig
- validateConfig
- previewConfigDiff
- importConfig
- exportConfig
- resetConfig
- applyFallback

Getters:

- isConfigValid
- currentProvider
- currentModel
- isStreamingEnabled
- isKnowledgeEnabled
- runtimeLimits

Persistence:

- Persist only validated config.
- Strip invalid or unsafe credential shapes.
- Never persist raw credentials.

Dependencies:

- Configuration domain types
- Configuration validator
- Provider capabilities
- Storage abstraction
- Runtime event bus for config update notification

### AuthStore

Responsibilities:

- Store authenticated user.
- Store role and permissions.
- Hydrate dynamic access scope.
- Provide logout and session reset.

State:

- `token`
- `profile`
- `role`
- `permissions`
- `isLoggedIn`
- `availableWorkspaceIds`

Actions:

- login
- logout
- hydrateSession
- hydrateRoutes
- refreshProfile
- clearSession

Getters:

- userName
- userRole
- routePermissions
- buttonPermissions
- fieldPermissions
- canAccessWorkspace

Persistence:

- Persist session according to security policy.
- Never persist sensitive tokens without policy.
- Clear on logout.

Dependencies:

- Identity domain types
- Permission evaluator
- Auth service
- Storage abstraction

## Runtime Architecture

The runtime layer is a framework-independent execution system. It should be usable from web UI, tests, future desktop shells, future SDKs, or backend-like simulation environments.

### Runtime Components

```text
ChatRuntime
├── RuntimeFactory
├── ProviderFactory
├── ContextBuilder
├── PromptBuilder
├── KnowledgeRetriever
├── StreamingPipeline
├── TokenEstimator
├── RetryPolicy
└── TraceCollector
```

### ChatRuntime

Responsibility:

- Orchestrate one conversation request.
- Own message state machine.
- Manage abort, retry, clear, and streaming status.
- Build runtime execution flow.
- Emit lifecycle events.
- Emit snapshots.

Rules:

- No Vue import.
- No Pinia import.
- No UI logic.
- No direct DOM behavior.
- No vendor-specific provider logic.

### RuntimeFactory

Responsibility:

- Create runtime instances from workspace/application configuration.
- Inject provider, config reader, event bus, context builder, prompt builder, knowledge retriever, trace collector, and policies.

Rules:

- Factory resolves dependencies.
- Runtime remains focused on orchestration.
- Factory should eventually support workspace/application scoped runtime creation.

### ProviderFactory

Responsibility:

- Resolve provider implementation from provider configuration.
- Return provider through common provider contract.
- Hide vendor-specific construction details.

Rules:

- Runtime depends on provider interface.
- ProviderFactory may use provider registry.
- ProviderFactory must not expose raw secrets.
- ProviderFactory should receive credential references or resolved secure provider capability through a safe boundary.

### ContextBuilder

Responsibility:

- Build model context from conversation messages.
- Enforce context window.
- Apply compression strategy.
- Preserve system prompt and latest user message.
- Produce token usage estimate.

Rules:

- ContextBuilder does not call provider.
- ContextBuilder does not know UI.
- ContextBuilder should return structured context result, not only messages.

### PromptBuilder

Responsibility:

- Render final prompt from prompt template, variables, context, knowledge, citations, and user input.
- Validate required variables.
- Preserve prompt template identity and version metadata.

Rules:

- PromptBuilder does not execute AI.
- PromptBuilder does not retrieve knowledge.
- PromptBuilder must remain deterministic for the same inputs.

### KnowledgeRetriever

Responsibility:

- Retrieve relevant chunks from knowledge base.
- Enforce workspace/application knowledge scope.
- Apply topK limit and score constraints.
- Produce citation candidates.

Rules:

- KnowledgeRetriever does not own prompt rendering.
- KnowledgeRetriever does not call provider.
- KnowledgeRetriever should return structured retrieval results.

### StreamingPipeline

Responsibility:

- Normalize provider streaming chunks.
- Handle incremental output.
- Respect abort signal.
- Emit stream lifecycle callbacks.

Rules:

- StreamingPipeline should avoid UI assumptions.
- It should operate in terms of chunks, full text, status, and trace identity.
- It should guard against duplicate or out-of-order chunk handling where possible.

### TokenEstimator

Responsibility:

- Estimate prompt tokens, completion tokens, and total tokens.
- Support context management and runtime safety.
- Provide cost estimation inputs in future.

Rules:

- Token estimation may be approximate in mock mode.
- Provider-reported token usage may override estimates when available.
- Token usage must be associated with trace and message where relevant.

### RetryPolicy

Responsibility:

- Determine whether a failed request can be retried.
- Enforce max retry count.
- Respect retryable provider error codes.
- Coordinate with circuit breaker policy.

Rules:

- RetryPolicy should not retry non-idempotent side effects without explicit design.
- Retry should preserve original request context.
- Retry should produce observable events.

### TraceCollector

Responsibility:

- Create and update trace records.
- Record runtime events.
- Record token usage.
- Record latency metrics.
- Bound observability memory.

Rules:

- TraceCollector is passive relative to runtime behavior.
- It should not change provider execution.
- It should enforce trace and event retention constraints.

## Runtime Flow

Runtime request flow:

```text
User submits message
  -> Conversation creates user message
  -> ChatRuntime starts execution
  -> TraceCollector starts trace
  -> ContextBuilder builds context
  -> KnowledgeRetriever retrieves chunks
  -> PromptBuilder builds final prompt
  -> ProviderFactory-selected Provider streams response
  -> StreamingPipeline normalizes chunks
  -> ChatRuntime updates assistant message state
  -> TraceCollector records events, tokens, latency
  -> Runtime emits final snapshot
```

Runtime terminal states:

- done
- error
- cancelled
- timeout represented as error with normalized code

Runtime must never fail silently. If provider fails, runtime emits error. If user aborts, runtime emits abort. If context exceeds limits, runtime emits error before unsafe provider call.

## Data Flow

Target frontend data flow:

```text
UI
  -> Composable
    -> Runtime
      -> Provider
        -> Store
          -> UI
```

This diagram is simplified. In practice, runtime emits events and snapshots, stores cache UI-facing state, and composables expose actions to UI.

Detailed flow:

```text
UI action
  -> module composable action
    -> store action or runtime bridge
      -> runtime execution or domain service
        -> event/snapshot/config result
          -> store update
            -> computed view model
              -> UI render
```

Rules:

- UI reads store/composable state.
- UI triggers composable methods.
- Composable decides whether to call store, service, or runtime bridge.
- Runtime owns execution.
- Provider produces output through runtime contract.
- Store updates are explicit.
- UI re-renders from store/composable state.

## Event Flow

Target event flow:

```text
User Input
  -> Runtime
    -> Provider
      -> Streaming
        -> Store
          -> UI
```

Expanded event flow:

```text
User sends prompt
  -> Runtime emits chat:start
  -> Runtime emits chat:pipeline for context build
  -> Runtime emits chat:pipeline for knowledge retrieval
  -> Runtime emits chat:pipeline for prompt build
  -> Provider streaming starts
  -> Runtime emits chat:chunk repeatedly
  -> Runtime emits chat:finish or chat:error or chat:abort
  -> Runtime emits chat:snapshot
  -> Store caches snapshot
  -> UI renders latest state
```

Event rules:

- Events should be named by domain lifecycle.
- Events should be typed.
- Events should include trace identity.
- Future events should include workspace and application identity.
- Event payloads should avoid large raw text when used for long-term observability.
- Observability listens passively.

## Runtime Convention

### Runtime State Machine

Runtime-visible message states:

- idle
- loading
- streaming
- done
- error
- cancelled

Rules:

- loading can transition to streaming, done, error, or cancelled.
- streaming can transition to done, error, or cancelled.
- done should not transition back to streaming.
- error may transition to loading through retry.
- cancelled may transition to loading through retry.

### Runtime Snapshot

Runtime snapshot should provide read-only UI state:

- messages
- sessions or conversations
- status
- active conversation ID
- streaming flag
- timestamp
- optional trace identity

Rules:

- Snapshot is plain data.
- Snapshot should not expose mutable runtime internals.
- Store may cache snapshot.
- UI should render from snapshot.

### Runtime Events

Runtime events should be stable contracts:

- chat:start
- chat:chunk
- chat:finish
- chat:error
- chat:abort
- chat:pipeline
- chat:snapshot
- provider:change
- config:update

Rules:

- Do not rename events casually.
- Add new events rather than overloading unrelated events.
- Keep payloads lightweight for observability.
- Use trace ID to group events.

## Provider Convention

Provider is a plugin-like runtime dependency.

Provider contract should expose:

- name
- models
- capabilities
- stream support
- normalized errors

Provider capabilities should include:

- streaming support
- max tokens
- context limit
- cost tier

Provider rules:

- Provider cannot import UI.
- Provider cannot write stores.
- Provider cannot show messages or modals.
- Provider must respect abort signal.
- Provider should normalize errors.
- Provider should not receive raw workspace UI state.
- Provider should receive runtime request data through runtime contract.

## Knowledge Convention

Knowledge frontend architecture must distinguish between management and runtime retrieval.

Knowledge management belongs to modules:

- create knowledge base
- upload document
- list documents
- inspect chunks
- test retrieval
- preview citations

Knowledge retrieval belongs to runtime:

- query active knowledge base
- enforce scope
- return chunks
- return citations

Rules:

- Knowledge UI cannot directly modify runtime messages.
- Runtime cannot know knowledge management UI.
- Retriever should be domain/runtime service, not page logic.

## Prompt Convention

Prompt frontend architecture must treat prompts as assets.

Prompt management belongs to modules:

- list templates
- edit template draft
- inspect variables
- render preview
- manage system prompt
- prepare versions

Prompt rendering during execution belongs to runtime:

- choose prompt template
- inject variables
- include context
- include knowledge
- include user input

Rules:

- UI preview may use PromptBuilder, but must not duplicate runtime prompt rules.
- Runtime must not hardcode prompt strings.
- Prompt versions should be traceable.

## Observability Convention

Observability reads execution data. It does not control execution.

Responsibilities:

- trace list
- trace detail
- event timeline
- token usage
- latency metrics
- error grouping
- streaming chunk inspection

Rules:

- Observability subscribes passively.
- Observability must be bounded.
- Observability should support sampling modes.
- Observability should link traces to workspace, application, conversation, message, provider, prompt, and knowledge where possible.

## Routing Architecture

The routing model should reflect product domains.

Target high-level routes:

```text
/home
/workspace
/workspace/:workspaceId
/workspace/:workspaceId/applications
/workspace/:workspaceId/applications/:applicationId
/workspace/:workspaceId/applications/:applicationId/conversations
/workspace/:workspaceId/ai/provider
/workspace/:workspaceId/ai/prompt
/workspace/:workspaceId/ai/knowledge
/workspace/:workspaceId/runtime/settings
/workspace/:workspaceId/runtime/observability
/workspace/:workspaceId/governance
/admin
```

Current routes may remain simpler during migration. The target route model should eventually encode workspace and application context.

Routing rules:

- Public routes are minimal.
- Authenticated shell routes require auth.
- Workspace routes require workspace access.
- Application routes require workspace and application access.
- Governance routes require governance permissions.
- Runtime trace detail should be deep-linkable.
- Prompt, knowledge, and provider pages should be deep-linkable within workspace scope.

## Shell Architecture

The shell is the persistent product frame.

Shell responsibilities:

- global navigation
- workspace switcher
- application switcher
- account menu
- breadcrumb
- responsive layout
- route guard integration
- permission-aware menu rendering

Shell must not own:

- prompt editing
- knowledge retrieval
- provider streaming
- runtime execution
- trace collection

The shell should make context visible at all times. A user should always know which workspace and application are active.

## Shared Design System Rules

The platform uses Element Plus and UnoCSS, but product consistency should come from platform-level design rules.

Rules:

- Cards should represent repeated objects or contained tools, not every section.
- Dense operational pages should prioritize scanning and comparison.
- AI platform pages should emphasize runtime status, traces, prompts, knowledge, and provider identity.
- Destructive actions require confirmation.
- Long inspection content should use drawers or dedicated detail pages.
- Modals should be short and action-focused.
- Empty states should explain domain hierarchy.
- Status colors should be consistent across provider, runtime, trace, and document states.

## Coding Standards

### Naming

Use domain language.

Prefer:

- WorkspaceStore
- ApplicationStore
- ConversationStore
- RuntimeStore
- TraceStore
- ProviderStore
- PromptStore
- KnowledgeStore
- ConfigStore

Avoid:

- DataStore
- CommonStore
- AiStore for everything
- HelperStore

Runtime names should describe responsibility:

- ChatRuntime
- RuntimeFactory
- ContextBuilder
- PromptBuilder
- KnowledgeRetriever
- StreamingPipeline
- TokenEstimator
- RetryPolicy
- TraceCollector

### Folder Names

Rules:

- Use kebab-case for route/module folders when representing URLs.
- Use PascalCase for class-like runtime/domain types.
- Use camelCase for composables and utilities.
- Avoid generic folders such as `misc`, `common2`, `new`, `temp`.

### Imports

Rules:

- Prefer absolute aliases for cross-layer imports.
- Prefer relative imports inside the same module.
- Avoid circular imports.
- Do not import from module internals across modules; export stable entry points.
- Runtime imports should not point to modules or shell.
- Domain imports should not point upward.

### Events

Rules:

- Event names should be lowercase and domain-scoped.
- Use colon-separated lifecycle names.
- Payloads should be typed.
- Events should represent facts or lifecycle changes.
- Do not use events for arbitrary function calls.

Good event names:

- chat:start
- chat:chunk
- chat:finish
- chat:error
- runtime:timeout
- config:update
- provider:change
- trace:recorded

### Store Actions

Rules:

- Action names should be verbs.
- Actions should represent domain operations.
- Avoid generic `setData` for meaningful operations.
- Use `setSnapshot` only when store explicitly acts as cache.
- Validate before persistence.
- Keep persistence centralized in store/service actions.

### Runtime Code

Rules:

- Runtime classes must be pure TypeScript.
- Runtime should accept dependencies through constructor or factory.
- Runtime should expose stable command methods.
- Runtime should emit events rather than call UI.
- Runtime should normalize errors.
- Runtime should enforce guardrails.
- Runtime should return plain objects.

### Type Definitions

Rules:

- Shared business entities live in domain.
- Runtime-specific contracts live in runtime.
- Store state types may live with stores if not shared.
- Component-local view models may live with modules.
- Avoid redefining domain entities in pages.

### Error Handling

Rules:

- Provider errors must be normalized.
- Runtime errors must be visible in trace and message state.
- Config validation errors must not be swallowed.
- UI should show user-friendly errors but preserve technical detail for observability.
- Unknown errors should be converted to platform error contracts.

### Persistence

Rules:

- Persist only intentional state.
- Version persisted schemas.
- Validate persisted config before use.
- Strip unsafe credential shapes.
- Respect retention for traces and messages.
- Keep mock persistence replaceable with backend persistence.

## Migration Strategy

The project should evolve in phases.

### Phase 1: Stabilize Current Runtime

Goals:

- Keep ChatRuntime as source of truth.
- Keep runtime independent from UI.
- Keep provider abstraction stable.
- Keep observability bounded.
- Keep config validation active.

### Phase 2: Introduce Workspace Context

Goals:

- Add WorkspaceStore.
- Add workspace switcher.
- Scope AI pages by workspace.
- Persist current workspace.
- Ensure runtime can later receive workspace context.

### Phase 3: Introduce Application Context

Goals:

- Add ApplicationStore.
- Add application list and selection.
- Bind conversations to application.
- Bind prompt, knowledge, provider, and runtime config to application.

### Phase 4: Move AI Pages Into Modules

Goals:

- Move provider page into provider module.
- Move prompt page into prompt module.
- Move knowledge page into knowledge module.
- Move observability page into observability module.
- Move runtime settings into runtime-settings module.

### Phase 5: Extract Domain Types

Goals:

- Move shared business types into domain.
- Remove duplicated page-local interfaces.
- Make stores use domain entities.
- Make runtime use runtime contracts and domain value objects.

### Phase 6: Production Backend Integration

Goals:

- Replace mock services with API-backed services.
- Keep same store contracts.
- Keep same runtime contracts.
- Add repository/adapters where needed.
- Introduce backend credential resolver.

## Future Extension

### SSR

SSR may be needed for public documentation, marketplace pages, or SEO-oriented platform surfaces.

Architecture impact:

- Runtime must remain environment-safe.
- Browser-only storage must be abstracted.
- Auth hydration must support server/client boundary.
- Observability collection should not assume browser globals.
- Domain types remain reusable.

SSR should not force runtime to become UI-dependent.

### Electron

Electron may support desktop enterprise deployments.

Architecture impact:

- Storage abstraction becomes more important.
- File upload and document parsing may use desktop capabilities.
- Runtime can remain pure.
- Provider and credential resolution should still avoid raw frontend secrets.
- Shell may need desktop-specific navigation and update handling.

### Tauri

Tauri provides a lighter desktop shell alternative.

Architecture impact:

- Core environment abstraction should isolate platform APIs.
- Domain and runtime layers should remain unchanged.
- Modules should not assume browser-only capabilities.
- Secure credential integration may use OS keychain through backend-like command layer.

### Micro Frontend

Micro frontend may be useful if AI Studio, Governance, Observability, and Admin are owned by different teams.

Architecture impact:

- Domain contracts must be versioned.
- Shell owns workspace/application context.
- Modules communicate through stable APIs/events.
- Shared design system must be packaged.
- Runtime should be exposed through SDK-like facade.

Micro frontend should not be introduced before domain boundaries are stable.

### Plugin

Plugin architecture may support provider plugins, tool plugins, prompt packs, knowledge connectors, workflow nodes, and observability exporters.

Architecture impact:

- Plugin registry belongs to domain/runtime boundary.
- Plugin UI should be sandboxed or permissioned.
- Provider plugins must implement provider contract.
- Tool plugins must declare schema and permissions.
- Plugin installation must be auditable.

### SDK

SDK enables external systems to use platform-managed AI applications.

Architecture impact:

- Runtime commands need stable public facade.
- Application configuration must be serializable.
- Trace identity should be returned to callers.
- SDK should not expose internal store or UI details.
- SDK should operate against application/workspace identity.

## Architecture Decision Rules

When introducing a new frontend feature, answer these questions:

- Which domain owns this feature?
- Which workspace/application scope does it require?
- Is this durable state, draft state, or runtime snapshot?
- Which store owns it?
- Which composable exposes it?
- Does it call runtime, service, or store?
- Does it need route-level access control?
- Does it require audit?
- Does it introduce provider-specific coupling?
- Does it create cross-module imports?
- Does it need to be in shared, or is it module-specific?

If these questions cannot be answered, the feature is not ready for implementation.

## Frontend Boundary Contracts

Boundary contracts define how layers communicate. They are more important than folder names. A project can survive imperfect folders if contracts are clean, but it will not survive unclear contracts.

### UI to Composable Contract

UI surfaces communicate with composables through view state and user actions.

The UI may provide:

- Form input
- Selected IDs
- User-triggered action intent
- Display options
- Local visual state such as drawer visibility

The UI may receive:

- Computed display state
- Loading state
- Error state
- Action methods
- View models
- Empty-state information

The UI must not receive:

- Provider implementation
- Runtime internals
- Mutable aggregate internals
- Raw credential values
- Unbounded trace/event streams

This boundary keeps pages simple. A page should read like a product surface, not like an execution engine.

### Composable to Store Contract

Composables communicate with stores through state selectors and domain actions.

The composable may call:

- load actions
- create actions
- update actions
- switch/select actions
- reset actions
- snapshot cache actions

The composable may read:

- current entity
- lists
- status
- validation state
- derived getters

The composable must not:

- mutate store state directly outside store actions
- bypass validation
- persist unsafe state
- duplicate store getters with conflicting logic

If a composable starts to contain many persistence rules, those rules belong in a store or service.

### Store to Service Contract

Stores use services for domain operations and data access.

The store may ask a service to:

- fetch entities
- create entities
- update entities
- delete/archive entities
- validate remote constraints
- synchronize local mock data with backend data

The service should return domain-shaped results or adapter-normalized payloads.

The store should not expose backend payload details to UI. If backend shape changes, services and adapters absorb that change.

### Composable to Runtime Contract

Composables may call runtime bridge methods. They should not instantiate runtime directly.

Allowed runtime bridge actions:

- send message
- stop streaming
- retry
- clear runtime state
- select runtime context where appropriate

Runtime bridge returns:

- runtime status
- streaming flag
- snapshot-derived messages
- command methods

Runtime bridge hides:

- provider selection
- context building
- prompt construction
- knowledge retrieval
- streaming pipeline
- retry policy
- trace collection internals

### Runtime to Store Contract

Runtime does not write stores directly. It emits snapshots and events. A bridge layer or subscription layer updates stores.

Allowed:

- runtime emits `chat:snapshot`
- runtime emits lifecycle events
- bridge receives event
- store caches snapshot

Not allowed:

- runtime imports store
- runtime mutates store
- runtime calls UI notification
- runtime navigates routes

This boundary is essential for future SDK, desktop, and test usage.

### Runtime to Provider Contract

Runtime calls providers through a provider interface.

Runtime provides:

- prompt or request payload
- configuration values
- callbacks
- abort signal
- trace context where appropriate

Provider returns:

- streaming chunks
- completion result
- normalized errors

Provider must not know:

- UI
- store
- route
- workspace switcher
- page state

### Store to Persistence Contract

Stores may persist through storage abstraction or domain services.

Persistence rules:

- Persisted data must be versioned when shape may evolve.
- Persisted config must be validated when read.
- Persisted workspace/application selection must be revalidated.
- Persisted auth must follow security policy.
- Persisted traces must respect retention limits.
- Raw credentials must never be persisted.

The project should eventually centralize persistence behind `core/storage` so browser storage, desktop storage, SSR-safe storage, and backend persistence can be swapped.

## Quality Gates

Architecture is only useful if enforced through review and validation. The frontend should use quality gates for every significant change.

### Dependency Gate

Review questions:

- Does runtime import Vue, Pinia, router, or UI code?
- Does provider import UI or store code?
- Does domain import module code?
- Does shared import a product module?
- Does a page call provider directly?
- Does a store manipulate DOM?

Any “yes” should block the change unless there is an explicit architecture decision record.

### State Ownership Gate

Review questions:

- Which store owns this state?
- Is this durable state or draft state?
- Is this runtime state or UI state?
- Is this state duplicated elsewhere?
- What happens when workspace changes?
- What happens when application changes?
- Should this state be persisted?

This gate prevents dual source of truth problems.

### Runtime Gate

Review questions:

- Does the UI own any streaming behavior?
- Does retry happen in runtime?
- Does abort normalize state?
- Are provider errors normalized?
- Are token/context limits enforced?
- Does execution produce trace events?
- Is observability passive?

This gate protects the runtime-driven architecture.

### Configuration Gate

Review questions:

- Is config validated before apply?
- Are invalid values rejected or safely clamped?
- Is a safe fallback available?
- Is config versioned?
- Are raw credential shapes stripped?
- Is config change auditable in future?

This gate prevents unsafe runtime behavior.

### Security Gate

Review questions:

- Are raw credentials stored anywhere?
- Are credential references used instead?
- Are permissions checked for sensitive operations?
- Does the page expose data outside workspace/application scope?
- Are traces and messages retained according to policy?
- Is exported data safe?

This gate protects enterprise trust.

### Observability Gate

Review questions:

- Are traces bounded?
- Are event timelines bounded?
- Is chunk recording sampled when needed?
- Can errors be diagnosed?
- Can trace be linked to workspace/application/conversation?
- Does observability avoid changing runtime behavior?

This gate ensures debugging does not become a stability risk.

### UX Architecture Gate

Review questions:

- Does the page communicate workspace and application context?
- Does the empty state teach the correct next step?
- Are advanced controls grouped logically?
- Are destructive actions confirmed?
- Does the page show status clearly?
- Is the page a platform surface rather than a generic admin table?

This gate keeps product positioning aligned with Enterprise AI Platform.

## Architecture Review Checklist

Before merging a new frontend module, reviewers should confirm:

- The module has a clear domain owner.
- The module has clear route ownership.
- The module does not import unrelated module internals.
- Business entities come from domain types.
- Runtime execution is delegated to runtime.
- Stores have documented state ownership.
- Persistence is intentional and safe.
- Workspace/application scope is considered.
- Loading, error, empty, and permission states exist.
- Observability and audit implications are considered.
- Future backend replacement is not blocked by mock shortcuts.

This checklist should be applied especially to provider, prompt, knowledge, runtime, observability, governance, and workspace changes.

## Closing Position

The frontend architecture of Enterprise AI Platform must evolve from admin pages into a domain-driven platform shell. The platform should be workspace-first, application-centered, runtime-driven, and governance-aware.

The target architecture is:

```text
Shell provides context.
Modules provide product surfaces.
Composables bridge UI to state and runtime.
Stores own frontend state.
Runtime owns AI execution.
Providers are pluggable.
Domain types define the language.
Shared code stays domain-neutral.
```

This architecture allows the project to grow from a Vue-based enterprise starter into a serious AI platform that can support provider switching, prompt operations, knowledge retrieval, runtime tracing, governance, future agents, workflows, plugins, desktop shells, micro frontends, and SDK integration without collapsing into a single monolithic frontend.
