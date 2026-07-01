# Enterprise AI Platform Feature Backlog and Implementation Plan

## Purpose

This document converts the platform roadmap into an executable engineering backlog.

The existing project already has the foundation of an Enterprise AI Platform:

- Workspace and Application domain modeling.
- AI Runtime pipeline.
- Provider abstraction.
- Prompt Engine.
- Knowledge mock RAG engine.
- Context management.
- Runtime observability.
- AI Control Plane pages.
- Conversation Center shell.

However, several capabilities are still incomplete as product workflows. Some modules exist as runtime abstractions but are not yet fully persisted, governed, linked, or exposed as enterprise-grade user flows.

This document records the unfinished work, the recommended implementation approach, the role of each capability in the platform, and how each capability connects with the rest of the system.

## Current Implementation Snapshot

| Capability                   | Current Status        | Main Gap                                                                                                                 |
| ---------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Workspace                    | Partially implemented | Needs governance, membership, archive/delete policy, audit boundary                                                      |
| Application                  | Partially implemented | Needs release binding, runtime asset snapshot, deployment-oriented lifecycle                                             |
| ChatRuntime                  | Implemented           | Needs stronger persisted conversation replay and production backend boundary                                             |
| Runtime Pipeline             | Implemented           | Needs richer trace linkage and UI-level inspection by execution step                                                     |
| Conversation Center          | Implemented baseline  | Message persistence, token summary, trace references, and restore flow exist; next gap is deeper trace detail navigation |
| Provider Center              | Partial               | Provider switching/config exists, but provider registry, health, credentials, and policies need domainization            |
| Knowledge Center             | Partial               | Mock RAG engine exists, but knowledge assets are mostly not durable domain resources                                     |
| Prompt Studio                | Partial               | Prompt engine exists, but prompt templates need versioning, lifecycle, bindings, and validation                          |
| Observability                | Partial               | Runtime inspector exists, but trace detail, retention UI, and cross-linking are incomplete                               |
| Runtime Settings             | Partial               | Configuration exists, but governance, diff preview, and applied profile history need consolidation                       |
| Governance                   | Not implemented       | Needs audit log, policy, access boundary, and workspace-level controls                                                   |
| Evaluation Center            | Not implemented       | Needed before serious prompt/RAG optimization                                                                            |
| Agent Runtime                | Not started           | Should wait until v2.1-v2.5 platform backbone is stable                                                                  |
| Workflow Builder             | Not started           | Depends on Agent Runtime, tools, and trace execution graph                                                               |
| Plugin Marketplace           | Not started           | Depends on stable provider/tool/retriever extension contracts                                                            |
| Backend Integration Boundary | Not implemented       | LocalStorage repositories need backend-ready adapter contracts                                                           |

## Prioritization Principles

1. Finish the platform backbone before advanced AI features.

   Workspace, Application, Conversation, Knowledge, Prompt, Provider, and Observability must be reliable before Agent, Workflow, and Marketplace work begins.

2. Persist domain assets before adding more runtime behaviors.

   Prompt templates, knowledge documents, conversation messages, provider profiles, and traces must become durable resources. Otherwise the platform remains an advanced demo.

3. Keep Runtime pure and UI-driven state shallow.

   ChatRuntime must remain independent from Vue and Pinia. UI pages should trigger actions and render snapshots, not own AI logic.

4. Workspace and Application scope must be enforced everywhere.

   No AI asset should behave as a global singleton unless it is explicitly a platform default.

5. Every Control Plane page must expose a real workflow.

   Pages should not only show menus or static cards. Each page should create, edit, test, bind, inspect, or govern a real platform resource.

6. Keep mock implementation, but design production contracts.

   The current local and mock engines are acceptable, but repository and service contracts should mimic future backend integration.

## Recommended Execution Order

```text
1. Knowledge Center Domainization
2. Prompt Store and Prompt Versioning
3. Observability Deep Linking
4. Provider Gateway Store, Credentials, and Health
5. Workspace Governance
6. Application Runtime Release Binding
7. Runtime Settings Governance
8. Evaluation Center
9. Agent Runtime
10. Workflow Builder
11. Plugin Marketplace
12. Backend Integration Boundary
```

Conversation Message Persistence has completed its first implementation baseline. The next seven items should be treated as the next major engineering focus. Agent, Workflow, and Marketplace should not be started until knowledge, prompt, provider, observability, workspace governance, and application runtime binding are properly scoped and linked.

## Dependency Map

```text
Workspace
  -> Applications
    -> RuntimeProfile
    -> ProviderConfig
    -> PromptVersion
    -> KnowledgeBase
    -> Conversations
      -> Messages
        -> Citations
        -> TokenUsage
        -> TraceReference
      -> Traces
        -> PipelineSteps
        -> Events
        -> ProviderMetrics
```

This map is the target operating model. Every AI action should be explainable through this chain:

```text
Workspace -> Application -> Conversation -> Runtime Execution -> Trace
```

## 1. Conversation Message Persistence

### Current Status

Conversation Center exists and conversation summaries are stored through a local repository. ChatRuntime owns active message state at runtime. Durable message history now has a baseline implementation through a conversation message repository and runtime snapshot persistence bridge.

The platform can create, list, switch, restore, and delete conversations with persisted messages. Assistant messages can preserve citations, token usage, and trace references. The remaining work is deeper trace navigation and production-grade backend storage.

### Implementation Status

Implemented baseline:

- `ConversationMessage` domain model.
- `ConversationMessageRepository` with localStorage persistence.
- Message restore when switching/opening conversations.
- Runtime snapshot persistence from `useChatRuntime`.
- Citation, token usage, status, metadata, and trace ID persistence.
- Conversation summary updates for message count, token total, and trace count.
- Conversation Center UI indicators for tokens, traces, message status, and message trace IDs.
- Repository tests for save, restore, replacement, and deletion behavior.

### Why It Matters

Conversation is the user-facing record of AI behavior. Without message persistence, the platform cannot support:

- Conversation replay.
- Audit review.
- Trace-to-message debugging.
- Citation review.
- Token and cost analysis per conversation.
- Workspace/application historical continuity.

This is the highest-priority unfinished feature because it turns runtime chat from transient execution into a managed enterprise record.

### Implementation Plan

1. Add a conversation message domain model. Completed.

   Suggested fields:

   - `id`
   - `workspaceId`
   - `applicationId`
   - `conversationId`
   - `role`
   - `content`
   - `status`
   - `tokenUsage`
   - `citations`
   - `traceId`
   - `createdAt`
   - `updatedAt`
   - `metadata`

2. Add a `ConversationMessageRepository`. Completed.

   The first implementation can use localStorage. The contract should behave like a backend adapter:

   - `listByConversation(conversationId)`
   - `saveSnapshot(conversationId, messages)`
   - `appendMessage(message)`
   - `updateMessage(messageId, patch)`
   - `deleteByConversation(conversationId)`

3. Update the runtime bridge layer. Completed.

   Message persistence should happen outside ChatRuntime, most likely in `useChatRuntime` or a dedicated conversation sync service. ChatRuntime should not import repositories, Pinia, or Vue.

4. Restore messages when opening a conversation. Completed.

   When a conversation is selected, the bridge should load persisted messages, open the scoped runtime conversation, and hydrate the runtime state through an explicit runtime method.

5. Persist message metadata from runtime snapshots. Completed.

   The saved message should include:

   - Token usage.
   - Citations.
   - Message state.
   - Trace ID.
   - Provider/model metadata when available.

6. Update conversation summaries. Partially completed.

   Conversation list rows should reflect:

   - Latest user/assistant message. Still pending.
   - Last activity time.
   - Message count. Completed.
   - Last runtime status. Still pending.
   - Application scope.
   - Token total. Completed.
   - Trace count. Completed.

### Role in the Platform

Conversation persistence is the foundation of Conversation Center. It makes the platform auditable and turns AI execution into a business record.

### Integrations

| Module                 | Linkage                                                      |
| ---------------------- | ------------------------------------------------------------ |
| ChatRuntime            | Produces snapshots and message state                         |
| useChatRuntime         | Bridges runtime snapshots to persistence and store cache     |
| ConversationStore      | Displays current conversation and message list               |
| ConversationRepository | Stores conversation summaries                                |
| Observability          | Links trace records to messages                              |
| Knowledge              | Persists citations attached to assistant messages            |
| RuntimeProfile         | Records provider/model/config used during message generation |
| Application            | Scopes conversation records to an AI application             |

### Acceptance Criteria

- Switching conversations restores previous messages. Completed.
- Refreshing the page does not lose conversation messages. Completed for localStorage baseline.
- Assistant messages preserve token usage and citations. Completed.
- Each assistant response stores trace references when trace data exists. Completed.
- ChatRuntime remains independent from Vue, Pinia, and repository code. Completed.
- Conversation Center can deep-link from message trace ID to trace detail. Pending.
- Conversation summary displays latest message and last runtime status. Pending.

## 2. Knowledge Center Domainization

### Current Status

The mock RAG engine exists. It supports documents, chunking, retrieval, citation generation, and workspace-like structures. The UI exposes Knowledge Center workflows, but the domain is not yet fully durable or application-bound.

Knowledge state is still too close to control-plane local state. It must become a platform domain asset.

### Why It Matters

Knowledge is one of the main enterprise differentiators. A platform without durable knowledge management cannot support real RAG operations, quality review, source governance, or per-application knowledge binding.

### Implementation Plan

1. Create durable knowledge domain resources.

   Model:

   - `KnowledgeBase`
   - `KnowledgeDocument`
   - `KnowledgeChunk`
   - `RetrievalResult`
   - `Citation`
   - `KnowledgeBinding`

2. Add a `KnowledgeRepository`.

   The local implementation should support:

   - Create knowledge base by workspace.
   - List knowledge bases by workspace.
   - Add document.
   - Store generated chunks.
   - Retrieve chunks by query and topK.
   - Delete or archive documents.

3. Add a `KnowledgeStore`.

   Responsibilities:

   - Current workspace knowledge bases.
   - Active knowledge base.
   - Documents and chunks.
   - Retrieval test results.
   - UI loading/error state only.

4. Bind knowledge to application runtime profile.

   Each application should reference the knowledge base used by runtime execution. A future application may support multiple knowledge bases, but the first implementation should keep one primary binding.

5. Move Knowledge Center UI from temporary state to domain store.

   The page should read from `KnowledgeStore`, call knowledge actions, and show persisted documents/chunks/retrieval results.

6. Pass selected knowledge base into runtime pipeline.

   ChatRuntime should continue to receive dependencies through runtime composition. It should not discover knowledge globally.

### Role in the Platform

Knowledge Center becomes the RAG operations surface. It allows teams to maintain the documents that the AI application can cite and use.

### Integrations

| Module        | Linkage                                                          |
| ------------- | ---------------------------------------------------------------- |
| Workspace     | Owns knowledge bases                                             |
| Application   | Binds to active knowledge base                                   |
| ChatRuntime   | Uses injected knowledge retriever during execution               |
| PromptEngine  | Receives retrieved knowledge as prompt input                     |
| Conversation  | Stores citations produced by knowledge retrieval                 |
| Observability | Records retrieval step, topK, score range, and source references |
| Governance    | Enforces document size, workspace boundary, and deletion policy  |

### Acceptance Criteria

- Knowledge bases persist by workspace.
- Documents and chunks survive refresh.
- Retrieval test results come from persisted chunks.
- Application runtime can use the selected knowledge base.
- Assistant citations reference persisted document/chunk identities.

## 3. Prompt Store and Prompt Versioning

### Current Status

PromptEngine, templates, registry, variable injection, and preview logic exist. Prompt Studio UI exists, but prompt templates are not yet treated as durable enterprise assets with lifecycle, versioning, and application bindings.

### Why It Matters

Prompt is a first-class AI asset. In enterprises, prompt changes must be reviewable, versioned, testable, and connected to runtime outcomes.

Without prompt versioning, it is hard to answer:

- Which prompt generated this response?
- Who changed the prompt?
- What variables were used?
- Which application is using which prompt version?
- Can we roll back a prompt change?

### Implementation Plan

1. Define prompt domain models.

   Model:

   - `PromptTemplate`
   - `PromptVersion`
   - `PromptVariable`
   - `PromptBinding`
   - `PromptPreview`

2. Add a `PromptRepository`.

   It should support:

   - Create template.
   - Edit draft.
   - Publish version.
   - List versions.
   - Archive template.
   - Bind version to application.

3. Add a `PromptStore`.

   Responsibilities:

   - Current workspace templates.
   - Active template.
   - Active version.
   - Draft content.
   - Preview result.
   - Validation errors.

4. Add template lifecycle.

   Recommended states:

   - `draft`
   - `published`
   - `archived`

5. Add variable validation.

   The store or prompt domain service should detect:

   - Missing variable values.
   - Unused variable values.
   - Invalid variable names.
   - Oversized rendered prompts.

6. Record prompt version in runtime trace.

   Each runtime execution should identify the prompt template/version used to construct the final prompt.

### Role in the Platform

Prompt Studio becomes a PromptOps system rather than a text editor. It governs the language and behavior of AI applications.

### Integrations

| Module        | Linkage                                                |
| ------------- | ------------------------------------------------------ |
| Workspace     | Owns prompt templates                                  |
| Application   | Binds to a published prompt version                    |
| PromptEngine  | Renders selected prompt version                        |
| ChatRuntime   | Uses PromptEngine output, not hardcoded prompts        |
| Observability | Records prompt build step and prompt version reference |
| Evaluation    | Uses prompt versions as test targets                   |
| Governance    | Reviews and audits prompt changes                      |

### Acceptance Criteria

- Prompt templates persist by workspace.
- Prompt versions can be created and selected.
- Application can bind to a prompt version.
- Prompt preview uses the same rendering engine as runtime.
- Runtime trace records prompt template/version reference.

## 4. Observability Deep Linking and Trace Detail

### Current Status

The observability layer records traces, events, token metrics, latency, and streaming chunks. The Observability page exists, but it should become a stronger runtime debugging console with direct links to conversations, messages, providers, prompt versions, and knowledge citations.

### Why It Matters

Enterprise AI failures are often caused by pipeline interactions:

- Wrong provider or model.
- Oversized context.
- Missing knowledge.
- Bad prompt rendering.
- Provider timeout.
- Streaming interruption.
- Low retrieval score.

Trace detail is where these problems become visible.

### Implementation Plan

1. Add trace detail route or drawer.

   The trace detail should show:

   - Trace summary.
   - Pipeline steps.
   - Event timeline.
   - Token usage.
   - Latency breakdown.
   - Provider/model.
   - Error information.
   - Linked conversation/message.

2. Link messages to traces.

   Assistant messages should store `traceId`. Conversation Center can open trace detail from a message.

3. Link traces to runtime assets.

   Trace metadata should reference:

   - Workspace ID.
   - Application ID.
   - Conversation ID.
   - Provider ID.
   - Model.
   - Prompt version.
   - Knowledge base.

4. Expose bounded observability settings.

   UI should show:

   - Trace retention limit.
   - Max events per trace.
   - Sampling mode.
   - Clear traces action.

5. Add pipeline step visualization.

   The trace should show:

   ```text
   Context Build -> Knowledge Retrieval -> Prompt Build -> Provider Stream -> Finish
   ```

### Role in the Platform

Observability is the AI debugging and audit console. It explains why a response was generated and how the runtime behaved.

### Integrations

| Module           | Linkage                                              |
| ---------------- | ---------------------------------------------------- |
| ChatRuntime      | Emits lifecycle and pipeline events                  |
| EventBus         | Delivers passive observability events                |
| Conversation     | Links messages to trace records                      |
| Prompt           | Links prompt version to trace                        |
| Knowledge        | Links retrieval and citations to trace               |
| Provider         | Links model, capability, error, and latency to trace |
| Runtime Settings | Controls sampling and retention                      |

### Acceptance Criteria

- A user can open a trace from an assistant message.
- A user can identify which prompt, provider, and knowledge base were used.
- Trace event count remains bounded.
- Pipeline steps are visible and ordered.
- Token usage and latency metrics are visible per trace.

## 5. Provider Gateway Store, Credentials, and Health

### Current Status

The Provider abstraction exists. MockProvider is working and provider stubs exist. Provider Center can modify runtime profile configuration. The missing part is a real Provider Gateway domain model with provider registry, capabilities, credential references, health checks, policies, and normalized errors.

### Why It Matters

Provider Gateway is the platform's vendor abstraction boundary. It protects the runtime from provider-specific details and gives enterprises a controlled way to switch providers.

### Implementation Plan

1. Create provider domain resources.

   Model:

   - `ProviderDefinition`
   - `ProviderProfile`
   - `ProviderCredentialReference`
   - `ProviderCapability`
   - `ProviderHealthStatus`
   - `ProviderPolicy`

2. Add a `ProviderStore`.

   Responsibilities:

   - Provider registry.
   - Active provider profile by workspace/application.
   - Provider health status.
   - Credential references.
   - Capability display.

3. Keep raw API keys out of frontend runtime logic.

   The frontend should only store credential references:

   - `id`
   - `name`
   - `type`
   - `encryptedRef` or mock reference

4. Add mock health check.

   Provider Center should expose:

   - Connectivity status.
   - Streaming support.
   - Context limit.
   - Max output tokens.
   - Cost tier.
   - Last checked time.

5. Normalize provider errors.

   Provider adapters should surface:

   - Standard error code.
   - Retryable flag.
   - Provider raw code as metadata.
   - Human-readable message.

### Role in the Platform

Provider Gateway is the AI model access control plane. It separates business configuration from vendor implementation.

### Integrations

| Module         | Linkage                                    |
| -------------- | ------------------------------------------ |
| RuntimeProfile | Stores selected provider/model/settings    |
| ChatRuntime    | Depends only on provider interface         |
| RuntimeGuard   | Enforces provider capability limits        |
| Observability  | Records provider latency, error, and model |
| Governance     | Controls credentials and provider policy   |
| Settings       | Exposes provider-related runtime defaults  |

### Acceptance Criteria

- Provider Center shows provider capabilities and health status.
- Runtime uses selected provider through factory/interface only.
- Raw API keys are not stored in UI runtime state.
- Provider errors are normalized.
- Application-level provider profile can be changed without modifying ChatRuntime.

## 6. Workspace Governance

### Current Status

Workspace domain, store, repository, and pages exist. Users can operate workspace-level navigation and switching. Governance is not yet implemented.

### Why It Matters

Workspace is the root domain. If workspace boundaries are weak, enterprise multi-team operation becomes unsafe.

Governance must define what happens when a workspace is renamed, archived, deleted, switched, or accessed by different roles.

### Implementation Plan

1. Add workspace lifecycle states.

   Recommended states:

   - `active`
   - `archived`
   - `deleted`

2. Prefer archive over hard delete.

   Hard delete should be a later admin-only operation. Archive preserves audit history.

3. Add workspace membership mock.

   Model:

   - `workspaceId`
   - `userId`
   - `role`
   - `joinedAt`

4. Add workspace boundary validation.

   Every Application, KnowledgeBase, PromptTemplate, Conversation, and Trace should include `workspaceId`.

5. Add workspace audit log.

   Initial events:

   - Workspace created.
   - Workspace renamed.
   - Workspace switched.
   - Workspace archived.
   - Application created.
   - Runtime config changed.
   - Prompt published.
   - Document added.

### Role in the Platform

Workspace Governance turns workspace from a selector into a true enterprise tenant/team boundary.

### Integrations

| Module        | Linkage                                          |
| ------------- | ------------------------------------------------ |
| Application   | Applications belong to one workspace             |
| Knowledge     | Knowledge assets are workspace-scoped            |
| Prompt        | Templates are workspace-scoped                   |
| Conversation  | Conversation records are workspace-scoped        |
| Observability | Traces are workspace-scoped                      |
| RBAC          | Permissions are evaluated within workspace scope |
| AuditLog      | Records workspace-level changes                  |

### Acceptance Criteria

- Workspace archive is supported.
- Workspace switch revalidates current application.
- Workspace-owned assets cannot leak into another workspace.
- Workspace actions produce audit records.
- UI clearly shows current workspace scope.

## 7. Application Runtime Release Binding

### Current Status

Application domain exists and runtime profiles can be associated with current Workspace/Application scope. The missing part is release-style binding: recording exactly which provider config, prompt version, knowledge base, and runtime settings are active for an application at a point in time.

### Why It Matters

Applications are the business-facing AI product units. Enterprises need stable releases, rollback, and reproducible runtime behavior.

### Implementation Plan

1. Add `ApplicationRuntimeRelease`.

   Suggested fields:

   - `id`
   - `workspaceId`
   - `applicationId`
   - `version`
   - `providerProfileId`
   - `promptVersionId`
   - `knowledgeBaseId`
   - `runtimeConfigId`
   - `createdAt`
   - `createdBy`
   - `status`

2. Add release lifecycle.

   Recommended states:

   - `draft`
   - `active`
   - `archived`
   - `rolled_back`

3. Add release history to Application detail.

   Users should see:

   - Active runtime release.
   - Previous releases.
   - Changes between releases.
   - Rollback action mock.

4. Ensure runtime execution records release identity.

   Each trace and assistant message should know which application release was used.

### Role in the Platform

Application Runtime Release Binding creates reproducibility. It makes AI application behavior traceable across time.

### Integrations

| Module         | Linkage                              |
| -------------- | ------------------------------------ |
| Application    | Owns runtime releases                |
| RuntimeProfile | Supplies config snapshot             |
| Prompt         | Provides prompt version              |
| Knowledge      | Provides knowledge base              |
| Provider       | Provides provider profile            |
| Conversation   | Records release identity per message |
| Observability  | Records release identity per trace   |

### Acceptance Criteria

- Application detail shows active runtime binding.
- Users can create a new mock release from current settings.
- Runtime execution records the active release ID.
- Release history survives refresh.
- Rollback can restore a previous binding in mock mode.

## 8. Runtime Settings Governance

### Current Status

AI config store, runtime profile, validation, defaults, and guardrails exist. Settings UI exists. The missing part is governance around configuration changes: diff preview, versioning, fallback config, and policy explanation.

### Why It Matters

Runtime settings change model behavior. Enterprises need safe configuration management, not uncontrolled form edits.

### Implementation Plan

1. Add config versioning.

   Each applied config should have:

   - Version.
   - Change summary.
   - Previous config reference.
   - Applied time.
   - Applied by.

2. Add config diff preview.

   Before applying settings, show:

   - Changed fields.
   - Previous value.
   - New value.
   - Risk level.

3. Add fallback config.

   Runtime should have a safe fallback if invalid config is rejected or current config becomes unavailable.

4. Add policy hints.

   Settings UI should explain if a value is constrained by:

   - Provider capability.
   - Workspace policy.
   - Runtime guard.
   - Application override.

### Role in the Platform

Runtime Settings Governance makes runtime behavior safer and reviewable.

### Integrations

| Module        | Linkage                       |
| ------------- | ----------------------------- |
| RuntimeGuard  | Enforces config safety        |
| Provider      | Supplies capability limits    |
| Application   | Uses active runtime profile   |
| Observability | Records config used per trace |
| AuditLog      | Records config changes        |
| Workspace     | Defines policy boundary       |

### Acceptance Criteria

- Invalid config is rejected with clear reason.
- Settings changes can be previewed before apply.
- Applied configs are versioned.
- Runtime can fall back to safe defaults.
- Observability records config identity.

## 9. Evaluation Center

### Current Status

Not implemented.

### Why It Matters

Prompt and RAG changes need measurable feedback. Without evaluation, prompt editing and knowledge tuning are subjective.

### Implementation Plan

1. Add evaluation domain.

   Model:

   - `EvaluationDataset`
   - `EvaluationCase`
   - `EvaluationRun`
   - `EvaluationResult`
   - `EvaluationMetric`

2. Start with mock scoring.

   Initial metrics:

   - Answer contains expected keywords.
   - Citation exists.
   - Retrieval score threshold.
   - Token usage within limit.
   - Runtime completed without error.

3. Bind evaluation to application release.

   Evaluation should test a specific Application + Runtime Release.

4. Add Evaluation Center page later.

   It should show datasets, runs, scores, and failed cases.

### Role in the Platform

Evaluation Center is the quality loop for prompts, knowledge, provider settings, and runtime changes.

### Integrations

| Module        | Linkage                               |
| ------------- | ------------------------------------- |
| Application   | Evaluation target                     |
| Prompt        | Tests prompt versions                 |
| Knowledge     | Tests retrieval/citation quality      |
| Provider      | Compares model behavior               |
| Observability | Uses trace metrics as evaluation data |
| Conversation  | Can convert messages into test cases  |

### Acceptance Criteria

- Users can create test cases for an application.
- Users can run mock evaluation against current runtime release.
- Results identify failed cases.
- Evaluation results reference trace IDs.

## 10. Agent Runtime

### Current Status

Not started. It should remain future work until platform backbone is stable.

### Why It Matters

Agent Runtime extends the platform from single-turn or conversation-based AI into goal-oriented execution with tools, memory, and multi-step reasoning.

### Implementation Plan

1. Add agent domain.

   Model:

   - `Agent`
   - `AgentProfile`
   - `AgentRun`
   - `AgentStep`
   - `ToolBinding`
   - `MemoryBinding`

2. Add `AgentRuntime`.

   It should follow the same architectural rules as ChatRuntime:

   - No Vue dependency.
   - No Pinia dependency.
   - Event-driven.
   - Provider-agnostic.
   - Traceable.

3. Add tool registry mock.

   Tools can be mocked first:

   - Search document.
   - Summarize text.
   - Extract fields.
   - Call mock API.

4. Connect to observability.

   Agent runs should produce execution steps, tool calls, and runtime traces.

### Role in the Platform

Agent Runtime is the next execution engine after ChatRuntime. It should reuse Provider, Prompt, Knowledge, Context, Config, and Observability.

### Integrations

| Module        | Linkage                       |
| ------------- | ----------------------------- |
| Provider      | Model execution               |
| Prompt        | Agent instructions            |
| Knowledge     | Retrieval for agent steps     |
| Tools         | External action surface       |
| Observability | Agent run tracing             |
| Application   | Agent-backed application type |
| Evaluation    | Agent run quality testing     |

### Acceptance Criteria

- Agent is workspace/application-scoped.
- Agent run emits traceable steps.
- Tool calls are visible in observability.
- AgentRuntime does not duplicate ChatRuntime internals unnecessarily.

## 11. Workflow Builder

### Current Status

Not started.

### Why It Matters

Workflow Builder turns isolated AI actions into business processes. It is important for enterprise automation, but it depends on a stable runtime and agent/tool model.

### Implementation Plan

1. Add workflow domain.

   Model:

   - `Workflow`
   - `WorkflowNode`
   - `WorkflowEdge`
   - `WorkflowRun`
   - `WorkflowStep`

2. Start with non-visual execution model.

   Before building a visual editor, define execution semantics:

   - Start node.
   - Prompt node.
   - Retriever node.
   - Provider node.
   - Condition node.
   - Tool node.
   - End node.

3. Add visual builder later.

   The UI can use a node canvas after the domain is stable.

4. Trace every workflow run.

   Workflow execution must be observable from the beginning.

### Role in the Platform

Workflow Builder is the orchestration layer for multi-step AI processes.

### Integrations

| Module        | Linkage                               |
| ------------- | ------------------------------------- |
| Agent         | Agent steps can become workflow nodes |
| Provider      | Model nodes                           |
| Knowledge     | Retrieval nodes                       |
| Prompt        | Prompt nodes                          |
| Tools         | Action nodes                          |
| Observability | Workflow run trace                    |
| Application   | Workflow-backed application type      |

### Acceptance Criteria

- Workflow model supports nodes and edges.
- Mock workflow runs can execute a simple sequence.
- Runs generate trace data.
- Visual UI is not started before execution model is stable.

## 12. Plugin Marketplace

### Current Status

Not started.

### Why It Matters

The platform becomes extensible when providers, tools, retrievers, prompt packs, and workflow templates can be plugged in through a stable contract.

### Implementation Plan

1. Define plugin manifest.

   Model:

   - `Plugin`
   - `PluginManifest`
   - `PluginCapability`
   - `PluginInstallation`
   - `PluginPermission`

2. Start with mock local plugins.

   Plugin types:

   - Provider adapter.
   - Tool adapter.
   - Retriever adapter.
   - Prompt template pack.
   - Workflow template.

3. Add plugin enable/disable by workspace.

   A plugin should not become globally active by default.

4. Add plugin permission review.

   Even in mock mode, plugin permissions should be visible.

### Role in the Platform

Plugin Marketplace is the extension surface of the Enterprise AI Platform.

### Integrations

| Module           | Linkage                      |
| ---------------- | ---------------------------- |
| Provider Gateway | Provider plugins             |
| Knowledge        | Retriever plugins            |
| Agent            | Tool plugins                 |
| Workflow         | Workflow templates           |
| Governance       | Plugin permission approval   |
| Workspace        | Plugin installation boundary |

### Acceptance Criteria

- Plugin manifest model exists.
- Workspace can enable/disable mock plugins.
- Provider/tool/retriever plugin types are distinguishable.
- Plugin permissions are visible before enablement.

## 13. Backend Integration Boundary

### Current Status

The project uses local repositories and localStorage-like persistence patterns. This is acceptable for the current open-source mock platform, but production readiness requires a clear backend integration boundary.

### Why It Matters

The frontend should not be rewritten when the backend arrives. Repositories and domain services should already behave like backend adapters.

### Implementation Plan

1. Standardize repository contracts.

   Every domain repository should support:

   - List.
   - Get.
   - Create.
   - Update.
   - Archive/delete.
   - Scope filtering by workspace/application where relevant.

2. Add storage adapter abstraction.

   LocalStorage can remain the default implementation. Later implementations can target REST, GraphQL, RPC, or IndexedDB.

3. Add domain-level error types.

   Repositories should normalize:

   - Not found.
   - Validation failed.
   - Permission denied.
   - Conflict.
   - Storage unavailable.

4. Avoid API assumptions in UI pages.

   Pages should call stores/composables, not HTTP clients directly.

5. Prepare for async persistence.

   Even local implementations should return promises where future backend calls are likely.

### Role in the Platform

Backend Integration Boundary protects the frontend architecture from future backend changes.

### Integrations

| Module        | Linkage                             |
| ------------- | ----------------------------------- |
| Workspace     | Repository-backed root domain       |
| Application   | Repository-backed product domain    |
| Conversation  | Persistent messages and summaries   |
| Knowledge     | Documents/chunks/retrieval metadata |
| Prompt        | Templates and versions              |
| Provider      | Profiles and credential references  |
| Observability | Trace storage and retention         |
| Governance    | Audit logs and policies             |

### Acceptance Criteria

- Domain repositories have consistent APIs.
- UI pages do not call localStorage directly.
- Mock persistence can be swapped with API adapters.
- Repository errors are typed or normalized.

## Cross-Feature Linkage Rules

### Workspace Scope

Every AI domain object should include `workspaceId` unless it is a global platform default.

Workspace-scoped:

- Application.
- Conversation.
- Message.
- KnowledgeBase.
- Document.
- PromptTemplate.
- ProviderProfile.
- RuntimeProfile.
- Trace.
- AuditLog.

### Application Scope

Every runtime execution should include `applicationId`.

Application-scoped:

- Runtime release.
- Active provider binding.
- Active prompt version.
- Active knowledge binding.
- Conversation.
- Trace.
- Evaluation run.

### Trace Scope

Every AI-generated assistant response should be traceable.

Trace should link:

- Message ID.
- Conversation ID.
- Application ID.
- Workspace ID.
- Provider/model.
- Prompt version.
- Knowledge base.
- Runtime config version.
- Token usage.
- Latency metrics.

### Prompt and Knowledge Scope

Prompt and Knowledge should be independently managed but jointly used at runtime.

The runtime flow should remain:

```text
User message
  -> Context build
  -> Knowledge retrieval
  -> Prompt rendering
  -> Provider streaming
  -> Message snapshot
  -> Trace record
```

## Engineering Rules for Upcoming Work

1. ChatRuntime remains the source of truth for active chat state.

   Persistence can observe or hydrate runtime state, but runtime should not import store or repository code.

2. Pinia stores are UI state and domain cache, not AI execution engines.

   Stores can coordinate repositories and expose state to pages. They should not implement streaming, prompt rendering, retrieval scoring, or provider execution.

3. UI never calls Provider directly.

   Provider access must go through runtime composition and provider factory contracts.

4. Knowledge and Prompt modules do not depend on ChatRuntime.

   ChatRuntime orchestrates them, but they must remain standalone domain/runtime services.

5. Observability is passive.

   It listens to EventBus and records runtime lifecycle. It must not alter runtime execution flow.

6. Application is the runtime product boundary.

   Chat, prompt, provider, knowledge, settings, and traces should always be explainable through an application.

7. Repositories should be backend-ready.

   Local mock storage is acceptable, but contracts should not assume synchronous local-only behavior forever.

## Completed Sprint: Conversation Message Persistence

Conversation Message Persistence has completed its first implementation baseline. It unlocks several downstream capabilities, especially trace inspection, citation review, and durable conversation operations.

### Sprint Goal

Make Conversation Center durable and traceable.

### Scope

- Add `ConversationMessage` model. Completed.
- Add `ConversationMessageRepository`. Completed.
- Persist runtime snapshots from bridge layer. Completed.
- Restore messages when switching conversation. Completed.
- Add trace ID and citation persistence. Completed.
- Update Conversation Center UI to show message count, tokens, traces, message status, and message trace IDs. Completed.
- Update Conversation Center UI to show last message and last runtime status. Pending polish.

### Out of Scope

- Real backend API.
- Agent Runtime.
- Workflow Builder.
- Advanced evaluation.
- Full audit approval workflow.

### Technical Steps

1. Define message domain type. Completed.
2. Implement local repository. Completed.
3. Add store actions for loading/saving messages. Completed.
4. Subscribe to `chat:snapshot` and persist changed messages. Completed.
5. Hydrate runtime when opening an existing conversation. Completed.
6. Link assistant message metadata to trace ID. Completed.
7. Update Conversation Center table/detail behavior. Partially completed.
8. Add tests for repository and runtime hydration path. Repository tests completed; runtime hydration path still needs integration coverage.

### Acceptance Criteria

- Existing conversations restore messages after refresh. Completed.
- Runtime streaming still works. Verified by type check and preserved runtime flow; browser QA still recommended.
- Retry and abort still update persisted message state correctly. Implemented through snapshot persistence; browser QA still recommended.
- Conversation list reflects message count, token total, and trace count. Completed.
- No direct Pinia/Vue dependency is added to ChatRuntime. Completed.

## Next Sprint Candidate: Knowledge Center Domainization

The recommended next sprint should focus on Knowledge Center Domainization.

### Sprint Goal

Turn Knowledge Center from a scoped runtime mock surface into a durable workspace/application RAG domain.

### Scope

- Add durable `KnowledgeBase`, `KnowledgeDocument`, and `KnowledgeChunk` repository contracts.
- Add `KnowledgeStore`.
- Persist uploaded documents and generated chunks by workspace.
- Bind an application to a primary knowledge base.
- Make retrieval tests read from persisted chunks.
- Preserve citation identities from retrieval to assistant messages and traces.

### Out of Scope

- Real embedding service.
- Vector database integration.
- File parser implementation for PDF/DOCX.
- Multi-index routing.
- Knowledge approval workflow.

### Technical Steps

1. Define durable knowledge domain types.
2. Implement local repository for knowledge bases, documents, and chunks.
3. Move Knowledge Center page state from temporary composable state to `KnowledgeStore`.
4. Connect application runtime binding to selected knowledge base.
5. Ensure ChatRuntime receives knowledge dependencies through runtime composition.
6. Add retrieval test persistence and citation preview.
7. Add repository and retrieval tests.

### Acceptance Criteria

- Knowledge bases persist by workspace.
- Uploaded mock documents survive refresh.
- Chunks are visible and linked to documents.
- Retrieval tests use persisted chunks.
- Application runtime can use the selected knowledge base.
- Assistant citations reference persisted document/chunk identities.

## Release Framing

The next release should be framed as:

```text
v2.1-v2.5 Foundation Consolidation

Focus:
  Workspace/Application scope
  Conversation persistence
  Knowledge domainization
  Prompt versioning
  Provider gateway hardening
  Runtime observability linking
```

This release is more important than starting Agent Runtime early. It turns the platform from a set of impressive modules into a connected enterprise AI control plane.
