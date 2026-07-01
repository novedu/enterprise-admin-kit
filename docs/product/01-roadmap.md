# Enterprise AI Platform Roadmap

## Purpose

This document defines the long-term product roadmap for Enterprise AI Platform as an open-source enterprise AI platform. It describes how the project evolves from an advanced AI-enabled admin foundation into a workspace-first, application-centered, runtime-driven enterprise AI operating system.

This is a product planning document. It does not define implementation code. It defines product versions, business goals, technical goals, architecture changes, domain evolution, UI direction, stores, runtime changes, modules, acceptance criteria, demo scenarios, release strategy, documentation strategy, and interview talking points.

## Product Direction

Enterprise AI Platform is intended to become an open-source control plane for enterprise AI applications.

The platform should help teams:

- Create and manage AI workspaces.
- Build business-facing AI applications.
- Configure model providers without vendor lock-in.
- Manage prompt templates as first-class assets.
- Operate knowledge bases for retrieval-augmented generation.
- Run conversations with traceable runtime behavior.
- Observe token usage, latency, events, and errors.
- Govern credentials, permissions, configuration, and audit logs.
- Extend the platform with agents, workflows, tools, plugins, and APIs.

The product evolution is:

```text
v2.0 Enterprise AI Platform
  -> v2.1 Workspace
  -> v2.2 Knowledge Center
  -> v2.3 Provider Gateway
  -> v2.4 Runtime Observability
  -> v2.5 Conversation Center
  -> v2.6 Agent Runtime
  -> v2.7 Workflow Builder
  -> v2.8 Plugin Marketplace
  -> v3.0 Enterprise AI Operating System
```

## Overall Roadmap

| Version | Theme                          | Product Outcome                                  |
| ------- | ------------------------------ | ------------------------------------------------ |
| v2.0    | Enterprise AI Platform         | Reposition from admin kit to AI platform         |
| v2.1    | Workspace                      | Introduce workspace as root domain               |
| v2.2    | Knowledge Center               | Make RAG operations a first-class module         |
| v2.3    | Provider Gateway               | Strengthen provider routing and credential model |
| v2.4    | Runtime Observability          | Make runtime execution fully inspectable         |
| v2.5    | Conversation Center            | Turn chat records into managed conversation ops  |
| v2.6    | Agent Runtime                  | Add agent execution model                        |
| v2.7    | Workflow Builder               | Add visual orchestration for AI workflows        |
| v2.8    | Plugin Marketplace             | Open platform extension layer                    |
| v3.0    | Enterprise AI Operating System | Consolidate platform into enterprise AI OS       |

## Timeline

The roadmap is designed for staged delivery. The timeline assumes part-time open-source development or a small product engineering team.

```text
Quarter 1
  v2.0 Enterprise AI Platform
  v2.1 Workspace

Quarter 2
  v2.2 Knowledge Center
  v2.3 Provider Gateway

Quarter 3
  v2.4 Runtime Observability
  v2.5 Conversation Center

Quarter 4
  v2.6 Agent Runtime
  v2.7 Workflow Builder

Next Cycle
  v2.8 Plugin Marketplace
  v3.0 Enterprise AI Operating System
```

Milestone sequencing should remain flexible. Provider Gateway and Runtime Observability may advance earlier if the project prioritizes production readiness. Agent Runtime and Workflow Builder should not begin until workspace, application, runtime, provider, prompt, knowledge, and observability foundations are stable.

## v2.0 Enterprise AI Platform

### Vision

v2.0 repositioning transforms the project from “Enterprise Admin Kit” into “Enterprise AI Platform.” The goal is not to remove the admin foundation, but to change the product center of gravity. AI runtime, provider control, prompt operations, knowledge, observability, and runtime settings become the main product story.

### Business Goal

Make the project understandable as an enterprise AI platform for architects, open-source users, and interview reviewers. The product should no longer look like a generic admin template with an AI demo attached.

### Technical Goal

Stabilize the current AI Runtime foundation and align documentation, navigation, naming, and product story with the platform direction.

### Architecture Changes

- Define Enterprise AI Platform positioning.
- Document information architecture.
- Document domain model.
- Document frontend architecture.
- Clarify runtime-driven architecture.
- Clarify provider, prompt, knowledge, observability, and settings boundaries.

### UI Changes

- Update branding language from admin kit to AI platform.
- Reframe dashboard as AI platform overview direction.
- Keep existing AI Control Plane modules visible.
- Highlight Provider, Knowledge, Prompt, Runtime, and Observability modules.

### Domain Changes

- Introduce language for Workspace, Application, Conversation, Runtime, Trace, KnowledgeBase, Prompt, Provider, Configuration, and Governance.
- Define Workspace as upcoming root domain.

### Folder Changes

- Add `docs/architecture`.
- Add `docs/product`.
- Prepare target architecture language for future `core`, `domain`, `runtime`, `modules`, `shared`, and `shell` structure.

### Store Changes

- Keep existing stores stable.
- Identify future stores: WorkspaceStore, ApplicationStore, ConversationStore, ProviderStore, KnowledgeStore, PromptStore, RuntimeStore, TraceStore, ConfigStore, AuthStore.

### Runtime Changes

- No major runtime rewrite.
- Preserve ChatRuntime as runtime source of truth.
- Preserve EventBus lifecycle.
- Preserve provider abstraction.
- Preserve configuration validation and runtime guardrails.

### New Modules

- Documentation modules only.
- No new product runtime module required in v2.0.

### Acceptance Criteria

- README positions the project as Enterprise AI Platform.
- Architecture documents exist for information architecture, domain model, and frontend architecture.
- AI Control Plane product story is clear.
- Runtime remains stable.
- Existing tests and build pass.

### Demo Scenario

A reviewer opens the project, reads the README and architecture documents, logs in, opens AI Control Plane, switches provider, tests chat, uploads knowledge, previews prompt, observes runtime trace, and understands the platform direction.

### Interview Talking Points

- Why the project evolved beyond a Vue admin template.
- Why AI Runtime must be decoupled from UI.
- Why Workspace should become the root context.
- Why prompt, knowledge, provider, and observability are platform modules.
- Why documentation is part of architecture maturity.

### Risks

- Product story may still be diluted by legacy admin pages.
- Dashboard may still look admin-first.
- Workspace not yet implemented as a real domain.
- AI modules may still use shared mock state.

### Deliverables

- Updated README.
- Architecture handbook documents.
- Product roadmap document.
- Clear release note for v2.0 repositioning.

### Epics, Stories, Tasks

#### Epic 1: Product Repositioning

Story 1: Rename product positioning.

Tasks:

- Update README title and description.
- Replace admin-first language with AI platform language.
- Add business scenarios.
- Add architecture evolution section.

Acceptance Criteria:

- New users understand the project as an AI platform within five minutes.
- README does not describe AI as a side feature.

Story 2: Define platform architecture documents.

Tasks:

- Write information architecture document.
- Write domain model document.
- Write frontend architecture document.

Acceptance Criteria:

- Each document has professional architecture style.
- Documents avoid implementation noise where inappropriate.

#### Epic 2: AI Control Plane Narrative

Story 1: Clarify AI module responsibilities.

Tasks:

- Document Provider Center.
- Document Knowledge Center.
- Document Prompt Studio.
- Document Runtime Observability.
- Document Runtime Settings.

Acceptance Criteria:

- Each AI module has clear product responsibility.
- Modules are described as control plane surfaces.

## v2.1 Workspace

### Vision

v2.1 introduces Workspace as the root domain of the platform. Workspace becomes the operating boundary for AI applications, provider configuration, prompt templates, knowledge bases, conversations, observability, and settings.

### Business Goal

Enable teams, departments, tenants, or environments to operate independently inside the same platform.

### Technical Goal

Create workspace domain modeling, workspace state, workspace switching, persistence, and workspace-aware navigation without yet rewriting all runtime internals.

### Architecture Changes

- Workspace becomes root context.
- Workspace owns application, prompt, knowledge, provider config, conversations, and observability scope.
- Global AI state begins migration toward workspace-scoped state.

### UI Changes

- Add workspace switcher in shell.
- Add Workspace Overview page.
- Add workspace list and create/rename/delete flows.
- Show current workspace in header.
- Add empty states for no workspace.

### Domain Changes

- Add Workspace entity.
- Add Workspace lifecycle.
- Add workspace ownership to future entities.
- Define workspace permissions.

### Folder Changes

- Add workspace module.
- Prepare module folder convention.
- Add workspace domain types.

### Store Changes

- Add WorkspaceStore.
- Persist current workspace.
- Store workspace list.
- Expose workspace switch action.

### Runtime Changes

- Runtime not yet deeply modified.
- Runtime should be prepared to receive workspace context in future.
- Runtime events should plan for workspace ID.

### New Modules

- Workspace module.
- Workspace switcher.
- Workspace overview.

### Acceptance Criteria

- Workspace can be created.
- Workspace can be renamed.
- Workspace can be deleted or archived according to chosen behavior.
- Workspace can be switched.
- Current workspace is persisted.
- AI pages can read current workspace.
- Runtime behavior remains unchanged.

### Demo Scenario

A user logs in, creates “Legal AI Workspace,” switches to it, sees workspace overview, then opens AI Control Plane under that workspace context.

### Interview Talking Points

- Why Workspace is the root domain.
- Why global AI config is unsafe in enterprise platforms.
- How workspace scoping prevents data leakage.
- Why runtime should depend on workspace, but workspace should not depend on runtime.

### Risks

- Workspace may be implemented as a UI filter instead of domain boundary.
- Existing global stores may remain ambiguous.
- Runtime may accidentally import workspace store directly.

### Deliverables

- Workspace domain model.
- WorkspaceStore.
- Workspace service.
- Workspace switcher.
- Workspace overview page.
- Workspace documentation update.

### Epics, Stories, Tasks

#### Epic 1: Workspace Domain Foundation

Story 1: Define Workspace entity.

Tasks:

- Define workspace fields.
- Define lifecycle states.
- Define ownership rules.
- Define workspace constraints.

Acceptance Criteria:

- Workspace has stable domain contract.
- Workspace does not depend on runtime.

Story 2: Build WorkspaceStore.

Tasks:

- Add currentWorkspace.
- Add workspaceList.
- Add createWorkspace.
- Add renameWorkspace.
- Add deleteWorkspace.
- Add switchWorkspace.
- Add persistence.

Acceptance Criteria:

- Workspace can be switched.
- Refresh preserves selected workspace.

#### Epic 2: Workspace UI Context

Story 1: Add workspace switcher.

Tasks:

- Add switcher to shell.
- Show current workspace name.
- Show empty workspace state.

Acceptance Criteria:

- Current workspace is visible globally.
- Switching workspace updates workspace context.

Story 2: Add Workspace Overview.

Tasks:

- Show workspace metadata.
- Show workspace summary.
- Show placeholder for applications, prompts, knowledge, traces.

Acceptance Criteria:

- Workspace has a dedicated landing surface.

## v2.2 Knowledge Center

### Vision

v2.2 turns knowledge from a mock retrieval utility into a first-class RAG operations center. Knowledge Center should help teams manage documents, chunks, retrieval quality, citation preview, and future indexing readiness.

### Business Goal

Enable enterprise teams to ground AI applications in workspace-owned knowledge sources with transparent citations.

### Technical Goal

Strengthen knowledge domain boundaries, workspace scoping, document lifecycle, chunk management, retrieval testing, and citation inspection.

### Architecture Changes

- KnowledgeBase becomes workspace-owned.
- Document and Chunk lifecycle become visible.
- Retriever becomes a formal domain/runtime service.
- Citation becomes traceable to document and chunk.

### UI Changes

- Improve Knowledge Center as RAG console.
- Add document lifecycle status.
- Add chunk viewer.
- Add citation drawer.
- Add retrieval test history.
- Add empty states and validation messages.

### Domain Changes

- Document lifecycle states.
- Chunk metadata.
- RetrievalResult domain object.
- Citation source identity.
- Workspace boundary enforcement.

### Folder Changes

- Move knowledge code toward `modules/knowledge` and `domain/knowledge`.
- Keep runtime retrieval separate from management UI.

### Store Changes

- Add or strengthen KnowledgeStore.
- Store active knowledge base by workspace.
- Store documents, chunks, retrieval results, citations.

### Runtime Changes

- Runtime uses KnowledgeRetriever instead of direct knowledge base calls.
- Runtime citations include source metadata.
- Runtime events include retrieval summary.

### New Modules

- Knowledge Center module.
- Chunk inspector.
- Citation preview.
- Retrieval test panel.

### Acceptance Criteria

- Knowledge bases are workspace-scoped.
- Documents have lifecycle status.
- Documents can be uploaded, listed, inspected, and removed.
- Chunks can be inspected.
- Retrieval topK can be tested.
- Citations can be previewed.
- Runtime uses knowledge only when enabled and scoped.

### Demo Scenario

A Knowledge Manager creates a “Policy Knowledge Base,” uploads HR policy text, inspects generated chunks, tests “vacation policy,” sees top chunks and citations, then enables the knowledge base for an application.

### Interview Talking Points

- Why RAG is a knowledge operations problem, not just file upload.
- Why citations need source identity.
- Why retrieval must be workspace-scoped.
- How Knowledge Center can evolve to vector databases.

### Risks

- Mock retrieval may look too simple.
- Document upload without lifecycle may seem unfinished.
- Knowledge UI may mix management and runtime logic.
- Large documents may create performance issues.

### Deliverables

- Knowledge domain model update.
- KnowledgeStore.
- Improved Knowledge Center UI.
- Chunk viewer.
- Citation preview.
- Retrieval tests.
- Documentation update.

### Epics, Stories, Tasks

#### Epic 1: Knowledge Domain Hardening

Story 1: Add document lifecycle.

Tasks:

- Define document states.
- Show status in document list.
- Validate document size.
- Handle failed document state.

Acceptance Criteria:

- Users can understand whether a document is ready for retrieval.

Story 2: Add chunk inspection.

Tasks:

- List chunks by document.
- Show chunk content.
- Show keywords or metadata.
- Show source document link.

Acceptance Criteria:

- Users can inspect why retrieval returns a result.

#### Epic 2: Retrieval Operations

Story 1: Improve retrieval test panel.

Tasks:

- Add query input.
- Add topK control.
- Show score.
- Show source.
- Show empty results.

Acceptance Criteria:

- Retrieval quality can be manually tested.

Story 2: Add citation preview.

Tasks:

- Convert retrieved chunks to citations.
- Show citation source.
- Show citation content.
- Add citation detail drawer.

Acceptance Criteria:

- Users can verify answer sources before runtime use.

## v2.3 Provider Gateway

### Vision

v2.3 upgrades provider management into an enterprise model gateway. The platform should support provider switching, model selection, credential references, provider capabilities, health checks, normalized errors, and future cost/quota visibility.

### Business Goal

Reduce vendor lock-in and provide a secure, governed model routing layer for enterprise AI applications.

### Technical Goal

Strengthen ProviderFactory, ProviderStore, credential reference model, provider capabilities, and provider health/testing flows.

### Architecture Changes

- Provider becomes a gateway domain.
- Provider capabilities become visible.
- CredentialReference replaces raw key concepts everywhere.
- Provider errors normalize into platform-level codes.

### UI Changes

- Provider Center shows provider cards.
- Show provider health status.
- Show model list and capabilities.
- Show credential reference status.
- Add provider probe results.
- Add provider error explanation.

### Domain Changes

- ProviderCapabilities.
- ProviderHealth.
- ProviderError.
- CredentialReference lifecycle.
- Provider policy.

### Folder Changes

- Add provider module.
- Add domain provider types.
- Keep provider implementations in runtime/provider layer.

### Store Changes

- Add ProviderStore.
- Store provider list, capabilities, selected provider, credential references, health.
- ConfigStore continues to own validated runtime config.

### Runtime Changes

- Runtime consumes provider through ProviderFactory.
- Runtime enforces provider token/context limits.
- Runtime records provider error codes in traces.

### New Modules

- Provider Gateway module.
- Provider health detail.
- Credential reference management.

### Acceptance Criteria

- Provider list is visible.
- Provider can be selected.
- Model can be selected.
- Capabilities are visible.
- Credential reference can be saved and cleared.
- Provider probe returns status.
- Provider errors are normalized.

### Demo Scenario

A Developer switches from mock provider to OpenAI stub, sees available models, configures credential reference `vault://ai/openai-prod`, runs provider probe, and observes unsupported provider error normalized in runtime trace.

### Interview Talking Points

- Why provider abstraction is not just a service wrapper.
- Why credentials must be references.
- Why provider capabilities protect runtime.
- Why normalized errors improve observability.

### Risks

- Without real provider adapters, demo may feel incomplete.
- Credential references may need backend story.
- Provider health may be mocked too heavily.

### Deliverables

- ProviderStore.
- Provider Gateway UI update.
- Provider capability display.
- Credential reference lifecycle.
- Provider error documentation.

### Epics, Stories, Tasks

#### Epic 1: Provider Capability Model

Story 1: Display provider capabilities.

Tasks:

- Define capability fields.
- Show streaming support.
- Show max tokens.
- Show context limit.
- Show cost tier.

Acceptance Criteria:

- Users can compare provider constraints.

Story 2: Add provider health probe.

Tasks:

- Add test action.
- Show success/error status.
- Show normalized error code.

Acceptance Criteria:

- Provider status is understandable without inspecting logs.

#### Epic 2: Credential References

Story 1: Manage credential references.

Tasks:

- Show credential name.
- Show encryptedRef.
- Save reference.
- Clear reference.
- Prevent raw key language.

Acceptance Criteria:

- UI never asks for raw API key as persistent frontend config.

## v2.4 Runtime Observability

### Vision

v2.4 makes AI execution fully inspectable. Observability becomes a dedicated runtime debugging and operations module rather than a simple trace list.

### Business Goal

Help developers, operators, and auditors understand AI runtime behavior, debug failures, measure latency, inspect token usage, and review execution events.

### Technical Goal

Strengthen TraceStore, RuntimeInspector, event timeline, pipeline step visibility, token usage, latency metrics, error grouping, and trace detail views.

### Architecture Changes

- Trace becomes a first-class domain object.
- Observability is bounded and queryable.
- Runtime events include pipeline steps.
- Traces link to conversation, application, provider, prompt, and knowledge metadata.

### UI Changes

- Dedicated trace list.
- Trace detail page or drawer.
- Pipeline visualization.
- Token usage chart.
- Latency breakdown.
- Error grouping.
- Streaming chunk inspector.

### Domain Changes

- Trace lifecycle.
- RuntimeEvent model.
- LatencyMetric.
- ErrorGroup.
- TokenUsage aggregation.

### Folder Changes

- Add observability module.
- Add trace domain types.
- Add runtime observability contracts.

### Store Changes

- Add TraceStore.
- Store selected trace, events, metrics, errors.
- Enforce bounded cache.

### Runtime Changes

- Runtime emits richer pipeline events.
- Runtime includes trace ID in snapshots/messages.
- Runtime records context, retrieval, prompt, provider stages.

### New Modules

- Runtime Observability module.
- Trace detail.
- Pipeline timeline.
- Error groups.

### Acceptance Criteria

- Every runtime request produces a trace.
- Trace shows lifecycle events.
- Trace shows pipeline steps.
- Trace shows token usage.
- Trace shows latency metrics.
- Trace shows provider error code when failed.
- Observability memory remains bounded.

### Demo Scenario

A Developer sends a chat request, opens Observability, selects the trace, sees context build, retrieval, prompt build, provider call, streaming chunks, token usage, TTFT, and total latency.

### Interview Talking Points

- Why AI runtime needs OpenTelemetry-like thinking.
- Why trace is a domain object.
- Why observability must be passive.
- Why bounded observability is production hardening.

### Risks

- Trace payloads may become too large.
- Observability UI may become noisy.
- Runtime events may expose sensitive content.

### Deliverables

- TraceStore.
- Trace detail UI.
- Pipeline visualization.
- Runtime event enrichment.
- Observability docs.

### Epics, Stories, Tasks

#### Epic 1: Trace Detail

Story 1: Build trace detail view.

Tasks:

- Show trace identity.
- Show provider/model.
- Show status.
- Show start/end/duration.
- Show linked conversation/message.

Acceptance Criteria:

- A trace can be understood independently.

Story 2: Build event timeline.

Tasks:

- Show event type.
- Show timestamp.
- Show payload summary.
- Group by pipeline stage.

Acceptance Criteria:

- Runtime lifecycle is visible step by step.

#### Epic 2: Metrics and Errors

Story 1: Show token and latency metrics.

Tasks:

- Show prompt tokens.
- Show completion tokens.
- Show TTFT.
- Show total request time.
- Show chunk rate.

Acceptance Criteria:

- Performance can be diagnosed from UI.

Story 2: Add error grouping.

Tasks:

- Group provider errors.
- Show retryable flag.
- Show timeout count.
- Show abort count.

Acceptance Criteria:

- Failures are actionable.

## v2.5 Conversation Center

### Vision

v2.5 turns chat history into a managed conversation operations center. Conversations become searchable, inspectable, linked to traces, citations, token usage, and application context.

### Business Goal

Allow teams to review AI interactions, understand user behavior, inspect outputs, and debug conversations across applications.

### Technical Goal

Introduce ConversationStore, durable conversation model, message trace links, citation display, and conversation filtering.

### Architecture Changes

- Conversation becomes application-owned.
- Message lifecycle becomes visible.
- Conversation links to traces.
- Citations become visible in messages.

### UI Changes

- Conversation list.
- Conversation detail.
- Message timeline.
- Citation panel.
- Trace link from assistant message.
- Filters by status/user/date/application.

### Domain Changes

- Conversation lifecycle.
- Message lifecycle.
- MessageTraceLink.
- Conversation retention metadata.

### Folder Changes

- Add conversation module.
- Add conversation domain types.
- Move chat playground toward application/conversation module.

### Store Changes

- Add ConversationStore.
- RuntimeStore remains snapshot cache.
- ConversationStore owns conversation list and selected conversation.

### Runtime Changes

- Runtime execution associates with selected conversation.
- Runtime snapshot includes conversation identity.
- Runtime finish links assistant message to trace.

### New Modules

- Conversation Center.
- Conversation detail.
- Citation viewer.

### Acceptance Criteria

- Conversations belong to applications.
- Conversation list can be browsed.
- Messages show status.
- Assistant messages show citations.
- Assistant messages link to traces.
- Conversations can be archived or cleared according to policy.

### Demo Scenario

An Auditor opens Conversation Center, selects a failed support conversation, sees the assistant message error, opens linked trace, reviews provider timeout, returns to conversation, and checks citations from a successful retry.

### Interview Talking Points

- Why conversation is a business record.
- Why message lifecycle matters.
- Why traces should link to messages.
- Why chat UI should not own runtime state.

### Risks

- Persisting messages may raise privacy concerns.
- Conversation list may become large.
- Runtime and conversation state may drift if ownership is unclear.

### Deliverables

- ConversationStore.
- Conversation Center UI.
- Message detail/citation UI.
- Trace link integration.
- Retention policy notes.

### Epics, Stories, Tasks

#### Epic 1: Conversation Model

Story 1: Add application-scoped conversations.

Tasks:

- Define conversation entity.
- Define message entity.
- Link conversation to application.
- Add selected conversation state.

Acceptance Criteria:

- Conversations cannot exist without application context.

Story 2: Add message trace links.

Tasks:

- Store trace ID on assistant message metadata.
- Show trace link.
- Navigate to trace detail.

Acceptance Criteria:

- Users can debug a message through its trace.

#### Epic 2: Conversation Operations

Story 1: Add conversation list and filters.

Tasks:

- Show conversation list.
- Filter by status.
- Filter by date.
- Filter by application.

Acceptance Criteria:

- Users can find relevant conversations.

Story 2: Add citation display.

Tasks:

- Show citations under assistant message.
- Open citation detail.
- Show source content.

Acceptance Criteria:

- Users can verify answer sources.

## v2.6 Agent Runtime

### Vision

v2.6 introduces Agent Runtime as a controlled execution model for autonomous or semi-autonomous AI behavior. Agents can use prompts, tools, memory, knowledge, and providers under governance.

### Business Goal

Allow enterprises to create more capable AI applications that perform multi-step reasoning and tool-assisted tasks while remaining observable and governed.

### Technical Goal

Introduce Agent entity, AgentRun, agent instructions, tool permissions, memory scope placeholder, and agent trace integration.

### Architecture Changes

- Agent becomes a new runtime domain.
- AgentRun extends runtime execution model.
- Agent actions produce trace events.
- Tool and memory become future extension points.

### UI Changes

- Agent list.
- Agent detail.
- Agent instructions editor.
- Agent run console.
- Agent trace view.
- Tool permission placeholder.

### Domain Changes

- Agent.
- AgentRun.
- AgentInstruction.
- AgentAction.
- AgentMemoryRef placeholder.

### Folder Changes

- Add agent module.
- Add domain agent types.
- Add runtime agent area.

### Store Changes

- Add AgentStore.
- Extend TraceStore for agent runs.
- ApplicationStore may bind application to agent.

### Runtime Changes

- Add AgentRuntime.
- AgentRuntime uses provider, prompt, knowledge, trace, and future tools.
- Agent actions emit events.

### New Modules

- Agent Runtime module.
- Agent Console.
- Agent Runs.

### Acceptance Criteria

- Agent can be created.
- Agent has instructions.
- Agent can run a controlled mock task.
- Agent run produces trace.
- Agent actions are visible.
- Agent is workspace/application scoped.

### Demo Scenario

A Developer creates an “Incident Analyst Agent,” gives it instructions, runs a mock incident analysis, watches agent steps, and reviews the agent run trace.

### Interview Talking Points

- Why agents need stronger governance than chat.
- Why agent runs must be traceable.
- How AgentRuntime extends ChatRuntime without replacing it.
- Why tool permissions are essential.

### Risks

- Agent scope may become too broad.
- Mock agent may look superficial.
- Tool and memory design may be premature.

### Deliverables

- Agent domain model.
- AgentStore.
- Agent Runtime mock.
- Agent run trace integration.
- Agent documentation.

### Epics, Stories, Tasks

#### Epic 1: Agent Domain

Story 1: Define Agent entity.

Tasks:

- Define fields.
- Define workspace/application ownership.
- Define instructions.
- Define lifecycle.

Acceptance Criteria:

- Agent is a first-class scoped entity.

Story 2: Define AgentRun.

Tasks:

- Define run states.
- Define action records.
- Link run to trace.

Acceptance Criteria:

- Every agent run is observable.

#### Epic 2: Agent Runtime

Story 1: Add mock agent execution.

Tasks:

- Run instructions.
- Produce steps.
- Emit trace events.
- Finish with result.

Acceptance Criteria:

- Agent execution is visible and bounded.

## v2.7 Workflow Builder

### Vision

v2.7 introduces Workflow Builder for visual AI orchestration. Workflows allow teams to compose prompts, provider calls, retrieval steps, tools, conditions, and approvals into repeatable processes.

### Business Goal

Enable teams to model repeatable AI operations beyond single chat or single agent execution.

### Technical Goal

Introduce Workflow, WorkflowVersion, WorkflowNode, WorkflowRun, and visual builder foundations.

### Architecture Changes

- Workflow becomes application/workspace-owned.
- WorkflowRun produces traces.
- Workflow nodes call runtime capabilities.
- Workflow versions become immutable when published.

### UI Changes

- Workflow list.
- Visual builder canvas.
- Node configuration panel.
- Workflow run console.
- Run trace view.

### Domain Changes

- Workflow.
- WorkflowVersion.
- WorkflowNode.
- WorkflowEdge.
- WorkflowRun.
- NodeType.

### Folder Changes

- Add workflow module.
- Add domain workflow types.
- Add runtime workflow area.

### Store Changes

- Add WorkflowStore.
- Add WorkflowRunStore or extend TraceStore.

### Runtime Changes

- Add WorkflowRuntime.
- Add node execution pipeline.
- Add workflow trace spans.

### New Modules

- Workflow Builder.
- Workflow Runs.
- Node Library.

### Acceptance Criteria

- Workflow can be created.
- Nodes can be added and connected.
- Workflow can run in mock mode.
- Workflow run produces trace.
- Published workflow version is immutable.

### Demo Scenario

A Prompt Engineer creates a workflow: retrieve policy docs, build prompt, call provider, summarize result, and output answer. The workflow runs and produces a trace with node-level events.

### Interview Talking Points

- Why workflow is a separate domain from agent.
- Why workflow versions must be immutable.
- How node execution maps to runtime events.
- How workflow supports enterprise repeatability.

### Risks

- Visual builder complexity may be high.
- Workflow may overlap with agent design.
- Node schema design may need tool/plugin foundation.

### Deliverables

- Workflow domain model.
- WorkflowStore.
- Workflow Builder UI.
- Mock workflow runtime.
- Node-level traces.

### Epics, Stories, Tasks

#### Epic 1: Workflow Domain

Story 1: Define workflow graph.

Tasks:

- Define Workflow.
- Define Node.
- Define Edge.
- Define version.

Acceptance Criteria:

- Workflow graph can be represented and validated.

Story 2: Define workflow run.

Tasks:

- Define run states.
- Define node execution records.
- Link run to trace.

Acceptance Criteria:

- Workflow execution is observable.

#### Epic 2: Builder Experience

Story 1: Add visual builder shell.

Tasks:

- Add canvas.
- Add node list.
- Add node config panel.
- Add save draft.

Acceptance Criteria:

- Users can create a simple workflow graph.

Story 2: Add mock run.

Tasks:

- Execute nodes in order.
- Emit node events.
- Show result.

Acceptance Criteria:

- Users can run and inspect workflow.

## v2.8 Plugin Marketplace

### Vision

v2.8 opens the platform to extensions. Plugin Marketplace allows providers, tools, prompt packs, knowledge connectors, workflow nodes, and observability exporters to be installed, enabled, and governed.

### Business Goal

Turn the platform into an extensible ecosystem rather than a closed application.

### Technical Goal

Introduce plugin registry, plugin manifest, plugin permissions, installation lifecycle, and extension points.

### Architecture Changes

- Plugin becomes a platform domain.
- Extension points become explicit.
- Provider, Tool, Knowledge Connector, Workflow Node, Prompt Pack become plugin categories.
- Plugin installation is auditable.

### UI Changes

- Plugin Marketplace.
- Installed plugins list.
- Plugin detail.
- Enable/disable plugin.
- Permission review.
- Plugin category filters.

### Domain Changes

- Plugin.
- PluginManifest.
- PluginInstallation.
- PluginPermission.
- ExtensionPoint.

### Folder Changes

- Add plugin module.
- Add plugin registry area.
- Add plugin extension contracts.

### Store Changes

- Add PluginStore.
- Store installed plugins, available plugins, enabled plugins, plugin permissions.

### Runtime Changes

- Runtime can discover provider/tool/workflow extensions through registry.
- Runtime must not trust plugins without declared contract.

### New Modules

- Plugin Marketplace.
- Plugin Registry.
- Extension Settings.

### Acceptance Criteria

- Plugins can be listed.
- Plugin detail can be inspected.
- Plugin can be installed/enabled/disabled in mock mode.
- Plugin permissions are visible.
- Plugin installation is auditable.
- Provider plugin can appear in Provider Gateway mock registry.

### Demo Scenario

A Workspace Admin opens Plugin Marketplace, installs a mock “Search Tool Plugin,” reviews required permissions, enables it for a workspace, and sees it become available as a workflow node or future tool.

### Interview Talking Points

- Why plugin architecture requires permission boundaries.
- Why plugin manifest is a contract.
- How marketplace supports open-source ecosystem.
- Why extension points must be explicit.

### Risks

- Plugin system can overcomplicate the platform.
- Security model must be clear.
- Runtime extension contracts must remain stable.

### Deliverables

- Plugin domain model.
- PluginStore.
- Marketplace UI.
- Plugin manifest documentation.
- Mock plugin registry.

### Epics, Stories, Tasks

#### Epic 1: Plugin Domain

Story 1: Define plugin manifest.

Tasks:

- Define plugin identity.
- Define category.
- Define permissions.
- Define extension points.

Acceptance Criteria:

- Plugin can describe what it contributes and what it needs.

Story 2: Define plugin installation.

Tasks:

- Define install state.
- Define enable/disable state.
- Define workspace scope.

Acceptance Criteria:

- Plugin lifecycle is clear and auditable.

#### Epic 2: Marketplace UI

Story 1: Add plugin list and detail.

Tasks:

- Show plugin catalog.
- Filter by category.
- Show detail.
- Show permissions.

Acceptance Criteria:

- Users can evaluate a plugin before enabling it.

Story 2: Add mock enable flow.

Tasks:

- Enable plugin.
- Disable plugin.
- Show installed plugins.

Acceptance Criteria:

- Plugin lifecycle can be demonstrated.

## v3.0 Enterprise AI Operating System

### Vision

v3.0 consolidates the platform into an Enterprise AI Operating System. At this stage, Workspace, Application, Provider, Prompt, Knowledge, Conversation, Runtime, Observability, Agent, Workflow, Plugin, Governance, and Admin form one coherent operating surface.

### Business Goal

Provide an open-source enterprise AI platform that can serve as the foundation for internal AI applications, governed AI operations, and extensible AI workflows.

### Technical Goal

Stabilize architecture contracts, module boundaries, runtime extension points, plugin contracts, backend integration patterns, and production deployment story.

### Architecture Changes

- Workspace and Application fully scope AI behavior.
- Runtime supports chat, agent, and workflow execution models.
- Plugin registry supports extension points.
- Governance covers policy, audit, credentials, retention, and approvals.
- Observability spans chat, agent, workflow, tool, and provider calls.

### UI Changes

- Home becomes AI OS overview.
- Workspace and Application are first-class navigation contexts.
- AI Studio consolidates Prompt, Knowledge, Provider, Agent, Workflow, Plugin.
- Runtime area consolidates Observability, Traces, Errors, Token Usage.
- Governance area becomes production-grade.

### Domain Changes

- Stable domain model v3.
- Versioned domain contracts.
- Release model for applications, prompts, workflows, agents.
- Governance policy domain strengthened.

### Folder Changes

- Complete migration toward target architecture:
  - core
  - domain
  - runtime
  - modules
  - shared
  - shell
  - plugins

### Store Changes

- Stores align with domain ownership.
- Stores become backend-ready.
- Snapshot stores remain bounded.
- Config and credential rules are enforced consistently.

### Runtime Changes

- ChatRuntime stable.
- AgentRuntime stable.
- WorkflowRuntime stable.
- RuntimeFactory supports execution type.
- Trace model supports multi-step spans.
- Provider/tool/plugin extension points stable.

### New Modules

- Governance Center.
- Release Center.
- Evaluation Center.
- API Hub.
- Cost Center.

### Acceptance Criteria

- Workspace-scoped AI applications can be created and operated.
- Provider gateway supports pluggable providers.
- Knowledge Center supports governed RAG operations.
- Prompt Studio supports prompt versions.
- Conversation Center links messages to traces.
- Observability supports chat, agent, workflow traces.
- Agent and Workflow runtime can run mock or real integrations.
- Plugin Marketplace can enable extension modules.
- Governance provides audit and policy controls.
- Documentation supports production adoption.

### Demo Scenario

A company creates a “Customer Support Workspace,” creates a “Refund Policy Assistant,” binds provider, prompt, and knowledge base, runs conversations, traces runtime, adjusts prompt, evaluates output, creates an agent for escalation analysis, builds a workflow for refund review, installs a plugin connector, and exports audit evidence.

### Interview Talking Points

- How the platform evolved from admin kit to AI OS.
- Why workspace/application are the core product model.
- How runtime abstractions support chat, agent, and workflow.
- How observability and governance make AI production-ready.
- How plugin architecture enables open-source ecosystem.

### Risks

- Scope may become too large.
- Plugin and workflow complexity may overwhelm core platform.
- Backend requirements may exceed frontend-only demo capabilities.
- Governance may require deeper enterprise integration.

### Deliverables

- Stable v3 architecture handbook.
- Full product documentation.
- Module maturity matrix.
- Release notes.
- Demo script.
- Deployment guidance.
- Contribution guide.

### Epics, Stories, Tasks

#### Epic 1: Platform Consolidation

Story 1: Align navigation to AI OS model.

Tasks:

- Update sidebar.
- Add Home overview.
- Add Workspace context.
- Add Application context.
- Group AI Studio, Runtime, Governance, Admin.

Acceptance Criteria:

- Product navigation communicates AI OS positioning.

Story 2: Align folder architecture.

Tasks:

- Move domain types.
- Move runtime layer.
- Move modules.
- Stabilize shared and shell.

Acceptance Criteria:

- Folder structure matches frontend architecture document.

#### Epic 2: Runtime Expansion

Story 1: Support execution types.

Tasks:

- Define chat execution.
- Define agent execution.
- Define workflow execution.
- Unify trace model.

Acceptance Criteria:

- Observability can inspect all execution types.

Story 2: Stabilize plugin extension points.

Tasks:

- Define provider extension point.
- Define tool extension point.
- Define workflow node extension point.
- Define knowledge connector extension point.

Acceptance Criteria:

- Plugins can extend platform without changing core modules.

#### Epic 3: Governance Maturity

Story 1: Add policy center.

Tasks:

- Define provider policy.
- Define runtime policy.
- Define knowledge policy.
- Define retention policy.

Acceptance Criteria:

- Governance rules are visible and editable by authorized users.

Story 2: Add release governance.

Tasks:

- Define application release.
- Define prompt release.
- Define workflow release.
- Add approval placeholder.

Acceptance Criteria:

- Production changes can be reviewed before apply.

## Milestones

### Milestone A: Platform Repositioning

Includes:

- v2.0 documentation and branding.
- AI platform README.
- Architecture handbook.
- Product roadmap.

Success signal:

- Project is clearly understood as Enterprise AI Platform.

### Milestone B: Workspace Foundation

Includes:

- v2.1 workspace domain.
- WorkspaceStore.
- Workspace switcher.
- Workspace overview.

Success signal:

- Users operate inside a selected workspace.

### Milestone C: AI Control Plane Maturity

Includes:

- v2.2 Knowledge Center.
- v2.3 Provider Gateway.
- v2.4 Runtime Observability.
- v2.5 Conversation Center.

Success signal:

- Teams can configure, run, inspect, and improve AI applications.

### Milestone D: Advanced Runtime

Includes:

- v2.6 Agent Runtime.
- v2.7 Workflow Builder.

Success signal:

- Platform supports multi-step and agentic AI behaviors.

### Milestone E: Ecosystem Platform

Includes:

- v2.8 Plugin Marketplace.
- v3.0 Enterprise AI Operating System.

Success signal:

- Platform becomes extensible and production-oriented.

## Roadmap Dependency Map

The roadmap is intentionally sequenced. Later versions depend on earlier product and architecture foundations. The platform should not jump directly to agents, workflows, or plugins before workspace, application, runtime, provider, knowledge, conversation, and observability domains are stable.

```text
v2.0 Enterprise AI Platform
  -> establishes product positioning and architecture language

v2.1 Workspace
  -> required by Knowledge, Provider, Conversation, Observability, Governance

v2.2 Knowledge Center
  -> required by RAG, Agent, Workflow, Evaluation

v2.3 Provider Gateway
  -> required by ChatRuntime, AgentRuntime, WorkflowRuntime, Plugin providers

v2.4 Runtime Observability
  -> required by Conversation Center, Agent Runtime, Workflow Builder, Governance

v2.5 Conversation Center
  -> required by Evaluation, Audit, Conversation analytics

v2.6 Agent Runtime
  -> requires Provider, Prompt, Knowledge, Observability, Governance

v2.7 Workflow Builder
  -> requires Runtime, Trace, Provider, Knowledge, future Tool domain

v2.8 Plugin Marketplace
  -> requires stable extension points from Provider, Tool, Workflow, Knowledge

v3.0 Enterprise AI Operating System
  -> consolidates all previous domains into a coherent platform
```

### Dependency Rules

Workspace must land before serious AI platform expansion. Without workspace, every module risks becoming global state.

Application should become visible before Conversation Center matures. Conversations are not generic chats; they are records for a specific AI application.

Observability must land before Agent Runtime and Workflow Builder. Multi-step AI behavior is difficult to trust if it cannot be traced.

Provider Gateway must land before real provider integrations. Otherwise provider-specific behavior leaks into runtime and UI.

Plugin Marketplace should land after extension points are stable. If marketplace lands too early, plugin contracts will churn and contributors will lose trust.

## Version Maturity Matrix

Each version should be evaluated across product, architecture, runtime, UX, governance, and documentation maturity.

| Version | Product Maturity | Architecture Maturity | Runtime Maturity | Governance Maturity | Open-Source Maturity |
| ------- | ---------------- | --------------------- | ---------------- | ------------------- | -------------------- |
| v2.0    | Platform story   | Documented direction  | Existing runtime | Basic safety        | README and handbook  |
| v2.1    | Workspace scope  | Root context          | Runtime prepared | Workspace access    | Contributor clarity  |
| v2.2    | RAG operations   | Knowledge boundaries  | Retrieval path   | Document limits     | Knowledge guide      |
| v2.3    | Model gateway    | Provider contracts    | Provider guards  | Credential refs     | Provider guide       |
| v2.4    | Debug console    | Trace domain          | Event-rich       | Retention bounds    | Observability guide  |
| v2.5    | Conversation ops | Message ownership     | Trace-linked     | Retention visible   | Conversation guide   |
| v2.6    | Agent capability | Agent domain          | Agent runs       | Tool guardrails     | Agent guide          |
| v2.7    | Workflow product | Workflow graph        | Node execution   | Release controls    | Workflow guide       |
| v2.8    | Ecosystem layer  | Extension contracts   | Plugin discovery | Plugin permissions  | Plugin guide         |
| v3.0    | AI OS            | Stable platform       | Multi-runtime    | Policy center       | Full docs portal     |

Maturity should be reviewed before release. A version is not complete simply because screens exist. It is complete when the product story, domain model, runtime behavior, user journey, documentation, and demo scenario are coherent.

## Open-Source Governance Strategy

The project is open-source, so roadmap execution must consider contributors, issue management, release expectations, and public trust.

### Contribution Model

Recommended contributor tracks:

- Documentation contributors
- UI contributors
- Runtime contributors
- Provider adapter contributors
- Knowledge/RAG contributors
- Observability contributors
- Governance/security contributors
- Plugin contributors

Each track should have clear ownership boundaries. For example, provider adapter contributors should not need to understand Prompt Studio internals. Documentation contributors should be able to improve architecture guides without changing runtime code. Runtime contributors should follow strict dependency rules.

### Issue Labels

Recommended GitHub labels:

- `area:workspace`
- `area:application`
- `area:runtime`
- `area:provider`
- `area:prompt`
- `area:knowledge`
- `area:observability`
- `area:conversation`
- `area:agent`
- `area:workflow`
- `area:plugin`
- `area:governance`
- `type:bug`
- `type:feature`
- `type:docs`
- `type:architecture`
- `type:refactor`
- `good first issue`
- `help wanted`
- `needs design`
- `breaking change`

### Pull Request Expectations

Every feature pull request should explain:

- Which roadmap version it belongs to.
- Which domain it changes.
- Which store or runtime boundary it touches.
- Whether it affects workspace/application scope.
- Whether it changes public types.
- Whether documentation was updated.
- Whether demo scenario still works.

Runtime and provider pull requests should also explain:

- Error behavior.
- Abort behavior.
- Retry behavior.
- Trace behavior.
- Token/context behavior.
- Security implications.

### Architecture Decision Records

Large changes should have Architecture Decision Records.

ADR candidates:

- Workspace as root domain.
- Application as AI product boundary.
- Runtime source of truth.
- Provider gateway contract.
- Credential reference model.
- Observability retention model.
- Plugin manifest format.
- Workflow graph format.
- Agent runtime model.

ADRs prevent the roadmap from becoming tribal knowledge.

## Release Readiness Checklist

Every version should pass a release readiness checklist.

### Product Readiness

- Product story is clear.
- Demo scenario works.
- Empty states exist.
- Navigation labels match the domain.
- User roles are considered.
- Upgrade path from previous version is understandable.

### Architecture Readiness

- Domain ownership is clear.
- Folder boundaries are respected.
- Stores have single ownership.
- Runtime remains independent from UI.
- Provider remains independent from UI.
- Documentation reflects changes.

### Engineering Readiness

- Type checking passes.
- Tests pass.
- Build passes.
- Lint passes.
- No known critical runtime regression.
- No unsafe credential persistence.
- No unbounded observability growth.

### Open-Source Readiness

- README updated.
- Release notes prepared.
- Migration notes prepared if needed.
- Known limitations listed.
- Screenshots or demo guide updated when relevant.
- Issues labeled for follow-up work.

## Cross-Version Backlog

Some initiatives span multiple releases and should not be forced into a single version.

### Backend Integration

Backend integration is required for production maturity but should be introduced gradually.

Roadmap alignment:

- v2.1: workspace persistence API candidate
- v2.2: document and knowledge API candidate
- v2.3: provider credential resolver candidate
- v2.4: trace persistence API candidate
- v2.5: conversation persistence API candidate
- v3.0: full backend integration reference architecture

### Security Hardening

Security should evolve continuously.

Roadmap alignment:

- v2.0: raw credential removal
- v2.1: workspace access boundaries
- v2.3: credential references
- v2.4: observability redaction
- v2.5: conversation retention
- v2.8: plugin permission model
- v3.0: governance center

### Performance and Scalability

Performance work should focus on real platform risks.

Roadmap alignment:

- v2.2: large document handling
- v2.4: bounded trace/event storage
- v2.5: conversation list scalability
- v2.7: workflow canvas performance
- v2.8: plugin loading boundaries
- v3.0: module-level code splitting and production optimization

### Design System Evolution

The UI should progressively move away from generic admin styling.

Roadmap alignment:

- v2.0: product positioning and IA
- v2.1: workspace shell context
- v2.2: RAG console patterns
- v2.3: provider gateway patterns
- v2.4: observability/debugging patterns
- v2.5: conversation operations patterns
- v3.0: unified AI OS design system

## Demo Strategy

Each release should have a scripted demo. The demo should prove the version's business value, not just show screens.

### v2.0 Demo

Theme:

- From admin kit to AI platform.

Flow:

- Open README.
- Open architecture docs.
- Open AI Control Plane.
- Run provider probe.
- Inspect prompt, knowledge, observability, settings.

### v2.1 Demo

Theme:

- Workspace as root context.

Flow:

- Create workspace.
- Switch workspace.
- Show workspace overview.
- Open AI module under workspace context.

### v2.2 Demo

Theme:

- Knowledge-grounded AI.

Flow:

- Create knowledge base.
- Upload document.
- Inspect chunks.
- Run retrieval.
- Preview citations.

### v2.3 Demo

Theme:

- Model gateway control.

Flow:

- Switch provider.
- Select model.
- View capabilities.
- Save credential reference.
- Run provider probe.

### v2.4 Demo

Theme:

- Runtime debugging.

Flow:

- Run chat request.
- Open trace.
- Inspect pipeline.
- Inspect tokens and latency.
- Inspect error or streaming chunks.

### v2.5 Demo

Theme:

- Conversation operations.

Flow:

- Open conversation list.
- Select conversation.
- Inspect messages.
- Open citation.
- Jump to trace.

### v2.6 Demo

Theme:

- Agent run observability.

Flow:

- Create agent.
- Configure instructions.
- Run mock task.
- Inspect agent steps and trace.

### v2.7 Demo

Theme:

- Workflow orchestration.

Flow:

- Create workflow.
- Add retrieval node.
- Add prompt node.
- Add provider node.
- Run workflow.
- Inspect node-level trace.

### v2.8 Demo

Theme:

- Open ecosystem.

Flow:

- Open marketplace.
- Inspect plugin permissions.
- Install mock plugin.
- Enable plugin in workspace.
- See plugin capability appear in platform.

### v3.0 Demo

Theme:

- Enterprise AI Operating System.

Flow:

- Create workspace.
- Create application.
- Bind provider, prompt, knowledge.
- Run conversation.
- Inspect trace.
- Run agent.
- Run workflow.
- Install plugin.
- Review governance/audit.

## Release Strategy

### Release Types

Use semantic versioning:

- Minor releases for roadmap versions: v2.1, v2.2, v2.3.
- Patch releases for fixes: v2.1.1, v2.1.2.
- Major release for platform-level shift: v3.0.

### Release Branching

Recommended:

- `main` for stable development.
- `release/v2.x` for release stabilization if needed.
- feature branches by module or epic.

### Release Quality Bar

Every release should pass:

- Type checking.
- Unit tests.
- Build verification.
- Linting.
- Documentation review.
- Demo scenario validation.
- Architecture boundary review for major features.

### Release Candidate Process

For larger releases:

- Create release candidate tag.
- Run demo scenario.
- Review breaking changes.
- Update docs.
- Update screenshots if applicable.
- Publish final release notes.

## GitHub Release Notes Strategy

Each GitHub release should include:

- Release title.
- Product theme.
- Highlights.
- New modules.
- Architecture changes.
- Runtime changes.
- UI changes.
- Breaking changes.
- Migration notes.
- Known issues.
- Demo scenario.
- Contributors.

Recommended format:

```text
# v2.x Release Name

## Highlights

## New Modules

## Product Changes

## Architecture Changes

## Runtime Changes

## UI Changes

## Documentation

## Breaking Changes

## Migration Notes

## Known Issues

## Demo Script
```

Release notes should be written for both engineers and product evaluators. They should explain why the release matters, not only list commits.

## Documentation Strategy

### Documentation Types

Maintain these documentation categories:

- README for project overview.
- Architecture handbook.
- Product roadmap.
- Module guides.
- Runtime guide.
- Provider guide.
- Prompt guide.
- Knowledge guide.
- Observability guide.
- Governance guide.
- Contribution guide.
- Demo script.

### Versioned Documentation

As the platform grows, docs should track major versions:

```text
docs
├── architecture
├── product
├── guides
├── modules
├── runtime
├── governance
└── releases
```

### Documentation Acceptance Criteria

For each release:

- README reflects current positioning.
- Roadmap status is updated.
- Architecture changes are documented.
- New module has a guide.
- Demo scenario is updated.
- Known limitations are clear.

### Open-Source Documentation Tone

Documentation should be:

- Direct.
- Architecture-aware.
- Honest about mock vs production capabilities.
- Useful for interview review.
- Useful for contributors.
- Clear about extension points.

Avoid:

- Marketing-only claims.
- Hiding limitations.
- Overstating production readiness.
- Mixing implementation snippets into product strategy documents.

## Final Roadmap Summary

The roadmap moves the project through five strategic stages:

```text
1. Reposition
   v2.0 Enterprise AI Platform

2. Scope
   v2.1 Workspace

3. Control Plane
   v2.2 Knowledge Center
   v2.3 Provider Gateway
   v2.4 Runtime Observability
   v2.5 Conversation Center

4. Advanced Runtime
   v2.6 Agent Runtime
   v2.7 Workflow Builder

5. Ecosystem and OS
   v2.8 Plugin Marketplace
   v3.0 Enterprise AI Operating System
```

The most important product decision is that the platform must not become a collection of disconnected AI demos. Workspace and Application provide the product hierarchy. Runtime provides execution discipline. Provider, Prompt, Knowledge, Conversation, and Observability provide operational control. Governance and Plugin Marketplace provide enterprise trust and ecosystem growth.

If executed well, Enterprise AI Platform can become a serious open-source blueprint for building internal AI platforms, AI control planes, and enterprise AI operating systems.
