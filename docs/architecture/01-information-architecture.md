# Enterprise AI Platform Information Architecture

## Vision

Enterprise AI Platform is an enterprise-grade control plane for building, operating, governing, and observing AI-powered applications. It is evolving from a traditional Vue Admin Kit into a platform product where administration is no longer the center of the experience. The center of the product is the AI application lifecycle.

The platform is designed for organizations that need more than a chat demo. It provides a structured environment where teams can create workspaces, configure model providers, manage prompts, attach knowledge sources, run conversations, inspect runtime traces, and enforce governance rules across enterprise AI systems.

The product positioning is:

```text
Enterprise AI Platform
  = Workspace-based AI application operating system
  + Runtime control plane
  + Prompt and knowledge operations
  + Governance and observability layer
  + Enterprise admin foundation
```

The platform is not a single assistant, a simple admin dashboard, or a provider-specific model console. It is a vendor-agnostic AI platform that gives enterprise teams a common operating surface for multiple AI applications.

### Target Users

The platform serves multiple enterprise users who participate in the AI application lifecycle:

- Business leaders who need visibility into AI adoption, usage, risk, and cost.
- Workspace administrators who manage team-level AI environments.
- Application developers who integrate AI runtime capability into business systems.
- Prompt engineers who design, test, version, and optimize prompt templates.
- Knowledge managers who maintain enterprise documents, retrieval quality, and citation accuracy.
- Platform engineers who configure providers, runtime settings, and operational guardrails.
- Security and compliance auditors who inspect traces, configurations, and change history.
- Observers and viewers who need read-only access to results, metrics, and system health.

### Enterprise Scenarios

The platform is intended to solve real enterprise scenarios where AI capability must be managed as infrastructure rather than embedded as isolated UI features.

#### Internal AI Assistant Platform

Organizations can create workspace-scoped assistants for departments such as HR, finance, legal, customer support, operations, and engineering. Each assistant can have its own provider configuration, prompt templates, knowledge base, runtime settings, and observability data.

#### Knowledge-Augmented Business Operations

Teams can upload or connect enterprise documents and use retrieval-augmented generation to answer questions with citations. The platform provides a path from simple keyword mock retrieval to future vector indexes, document pipelines, and governed knowledge workspaces.

#### Multi-Provider AI Gateway

Enterprises rarely rely on a single AI vendor forever. The platform abstracts providers behind a common contract so teams can switch between mock, OpenAI, Claude, Qwen, DeepSeek, or future providers without rewriting the runtime or UI layer.

#### Prompt Operations and Governance

Prompts become managed assets rather than hardcoded strings. Prompt engineers can edit templates, inspect variables, preview rendered prompts, and eventually version, evaluate, approve, and publish prompt changes.

#### Runtime Debugging and Incident Analysis

AI failures are often invisible in traditional frontend systems. This platform introduces traces, event timelines, token metrics, latency metrics, streaming chunks, error codes, and runtime status so teams can understand what happened during each AI request.

#### Enterprise Control and Compliance

AI systems must be auditable. The platform defines boundaries for credentials, configuration, workspace scope, observability retention, knowledge retrieval, provider limits, and runtime safety. It establishes a foundation for compliance workflows, approval chains, and access control.

## Design Principles

The information architecture is guided by product and system principles. These principles should remain stable as the product grows from mock runtime to production AI platform.

### Workspace First

Workspace is the root domain. Every AI capability belongs to exactly one workspace.

A workspace owns:

- Runtime configuration
- Provider configuration
- Prompt templates
- Knowledge base
- Conversations
- Observability data
- Settings
- Access control
- Audit scope

This prevents global state from leaking across teams, applications, or tenants. It also makes the platform understandable: users always know which workspace they are operating in.

```text
Workspace
  -> Applications
  -> Runtime configuration
  -> Provider configuration
  -> Prompts
  -> Knowledge
  -> Conversations
  -> Traces
  -> Governance
```

### Application First

Workspace is the organizational boundary, but Application is the product boundary.

An application represents a concrete AI capability that a business user or system interacts with. Examples include:

- HR policy assistant
- Customer support copilot
- Contract review assistant
- Operations incident analyst
- Sales enablement assistant
- Engineering documentation helper

Application-level information architecture prevents the platform from becoming a pile of global tools. Provider settings, prompts, knowledge, and runtime traces become meaningful when connected to an application goal.

### Runtime Driven

The runtime is the source of AI behavior. UI pages do not own AI execution logic.

Pages should expose runtime state, trigger runtime actions, and inspect runtime outputs. They should not duplicate execution rules, streaming logic, provider logic, context compression, or knowledge retrieval.

The runtime-driven model is:

```text
User action
  -> UI trigger
  -> Runtime orchestration
  -> Event stream
  -> Snapshot state
  -> UI rendering
```

### Configuration Over Hardcode

Enterprise AI behavior must be configurable at runtime.

The following should be configuration assets, not hardcoded implementation details:

- Provider
- Model
- Temperature
- Top P
- Max tokens
- Context window
- Compression strategy
- Knowledge retrieval toggle
- Knowledge topK
- System prompt
- Prompt template
- Request timeout
- Retry policy
- Observability sampling mode

This allows business teams, platform teams, and governance teams to evolve behavior without rewriting code.

### Loose Coupling

Core modules must be independently understandable and replaceable.

The platform should preserve clear dependency direction:

```text
UI layer
  depends on -> Composables and stores
Runtime layer
  depends on -> Provider, Context, Prompt, Knowledge, Config
Provider layer
  depends on -> Provider interface only
Knowledge layer
  does not depend on -> ChatRuntime
Prompt layer
  does not depend on -> ChatRuntime
Observability layer
  listens to -> EventBus only
Workspace layer
  owns domain context
```

Loose coupling enables future replacement of mock modules with production modules.

### Event Driven

AI runtime behavior is event-based, not component-call-based.

Important runtime states are expressed as lifecycle events:

- `chat:start`
- `chat:chunk`
- `chat:finish`
- `chat:error`
- `chat:abort`
- `chat:pipeline`
- `chat:snapshot`
- `provider:change`
- `config:update`

Events make streaming, tracing, debugging, observability, and UI synchronization possible without binding all modules directly together.

### Extensible

The platform must be designed for future modules:

- Agents
- Workflows
- Plugin marketplace
- API Hub
- MCP integration
- Tool calling
- Evaluation
- Cost management
- Approval workflows
- Dataset management

Extensibility does not mean every feature must exist today. It means current information architecture should not block these future capabilities.

### Provider Agnostic

The platform should not be shaped around one AI vendor.

Provider abstraction must hide vendor differences from ChatRuntime and UI pages. Provider-specific details should live behind provider adapters, capability contracts, normalized errors, and configuration profiles.

Users should think in terms of application behavior and runtime quality, not in terms of provider implementation details.

### Governed by Default

Enterprise AI systems require safety constraints by default.

The platform should assume that AI usage needs:

- Scoped access
- Configuration validation
- Credential isolation
- Token limits
- Context limits
- Request timeout
- Retry limits
- Observability retention
- Auditability
- Workspace boundaries

Governance is not an optional feature added later. It is part of the platform foundation.

## User Roles

The platform supports a role model that maps to real responsibilities in enterprise AI operations.

### Super Admin

Super Admin is responsible for the entire platform.

Responsibilities:

- Manage global platform settings
- Manage all workspaces
- Configure organization-level policies
- Assign workspace administrators
- Manage global RBAC rules
- View all audit logs
- Configure provider availability
- Control platform-level security settings
- Manage system-wide feature flags

Typical actions:

- Create or archive workspaces
- Define organization-wide provider policies
- Review cross-workspace usage
- Resolve platform incidents
- Approve high-risk configuration changes

Access level:

- Full access across all workspaces and applications
- Full read/write access to governance settings
- Full audit visibility

### Workspace Admin

Workspace Admin owns one or more workspaces.

Responsibilities:

- Manage workspace settings
- Manage workspace members and roles
- Create and configure AI applications
- Assign prompt engineers, developers, knowledge managers, and viewers
- Configure workspace-level provider and runtime defaults
- Monitor workspace-level usage and health

Typical actions:

- Switch active provider for a workspace
- Create a new AI application
- Enable knowledge retrieval for an application
- Review workspace traces
- Manage access for department users

Access level:

- Full access within assigned workspaces
- No access to unrelated workspaces unless explicitly granted

### Developer

Developer integrates AI applications with product workflows and business systems.

Responsibilities:

- Configure application runtime behavior
- Test model responses
- Connect application-level APIs
- Debug runtime pipeline behavior
- Inspect traces and provider errors
- Work with prompt engineers and knowledge managers

Typical actions:

- Run a conversation through the Runtime Playground
- Inspect pipeline events
- Adjust runtime settings in development environments
- Validate provider behavior
- Prepare integration specifications

Access level:

- Read/write access to assigned applications
- Read access to runtime traces
- Limited access to provider configuration depending on policy

### Prompt Engineer

Prompt Engineer manages prompt behavior and prompt quality.

Responsibilities:

- Create and edit prompt templates
- Manage prompt variables
- Preview rendered prompts
- Coordinate prompt changes with developers
- Validate prompt behavior against use cases
- Maintain prompt style and safety instructions

Typical actions:

- Edit system prompt
- Edit RAG prompt template
- Preview variable injection
- Prepare future prompt versions
- Compare prompt behavior before release

Access level:

- Write access to prompt assets
- Read access to traces and conversation outputs
- No direct access to raw provider credentials

### Knowledge Manager

Knowledge Manager maintains the knowledge layer used by AI applications.

Responsibilities:

- Upload and manage documents
- Organize knowledge bases
- Validate chunking quality
- Test retrieval queries
- Review citations
- Maintain document freshness
- Ensure knowledge scope matches workspace/application boundaries

Typical actions:

- Upload policy documents
- Test topK retrieval results
- Review citation preview
- Remove outdated documents
- Coordinate future vector index updates

Access level:

- Write access to knowledge assets
- Read access to retrieval traces
- No access to unrelated workspace knowledge bases

### Auditor

Auditor inspects platform behavior for compliance, risk, and accountability.

Responsibilities:

- Review runtime traces
- Review configuration changes
- Review prompt changes
- Review knowledge source usage
- Inspect provider error patterns
- Verify workspace boundaries
- Export evidence for compliance reviews

Typical actions:

- Inspect trace timeline
- Review error and abort events
- Verify whether citations were used
- Check who changed runtime settings
- Validate that raw credentials are not exposed

Access level:

- Read-only access to audit-relevant data
- No write access to runtime behavior
- May have cross-workspace visibility depending on organization policy

### Observer

Observer monitors system health without changing configuration.

Responsibilities:

- Watch runtime status
- Watch provider health
- Watch latency and token metrics
- Watch event timelines
- Report anomalies

Typical actions:

- Open Observability Dashboard
- Filter recent traces
- Check token usage
- Check streaming behavior
- Report suspicious runtime errors

Access level:

- Read-only operational visibility
- No prompt, provider, knowledge, or runtime configuration writes

### Viewer

Viewer consumes AI platform outputs with minimal access.

Responsibilities:

- Use permitted AI applications
- View allowed conversations
- Read published knowledge-supported answers
- Avoid administrative changes

Typical actions:

- Start a conversation
- Read assistant responses
- View citations
- View basic application information

Access level:

- Minimal read/use access
- No configuration, governance, or observability access unless granted

## Navigation Architecture

The navigation architecture should reflect the platform's domain model rather than technical modules. The user should not feel like they are browsing a Vue admin template. The sidebar should communicate that this is an enterprise AI platform.

### Sidebar Root

```text
Enterprise AI Platform
├── Home
├── Workspace
├── Application
├── AI Studio
├── Runtime
├── Governance
└── Admin
```

### Home

Home is the platform overview.

Submenus:

```text
Home
├── Overview
├── Activity
└── Health
```

#### Overview

Purpose:

- Show the current workspace summary
- Show active applications
- Show provider status
- Show token usage
- Show recent traces
- Show knowledge and prompt asset counts

Description:

Overview should become the default landing page after login. It should communicate AI platform status instead of generic admin metrics.

#### Activity

Purpose:

- Show recent platform events
- Show configuration changes
- Show prompt updates
- Show knowledge document uploads
- Show runtime incidents

Description:

Activity gives teams a chronological understanding of what changed in the platform.

#### Health

Purpose:

- Show provider availability
- Show runtime error rate
- Show timeout rate
- Show trace volume
- Show system-level alerts

Description:

Health is the operational summary for platform owners and observers.

### Workspace

Workspace is the root context for all AI capabilities.

Submenus:

```text
Workspace
├── Workspace Overview
├── Members
├── Access Control
├── Workspace Settings
└── Audit Scope
```

#### Workspace Overview

Purpose:

- Show current workspace identity
- Show workspace applications
- Show workspace-level AI assets
- Show workspace usage

Description:

This page answers: where am I, what applications belong here, and what is happening in this workspace?

#### Members

Purpose:

- Manage workspace users
- Assign roles
- Review membership status

Description:

This is the workspace-level version of user management.

#### Access Control

Purpose:

- Manage workspace roles
- Manage permissions for prompt, knowledge, provider, runtime, observability, and settings

Description:

This page adapts RBAC to the AI platform domain.

#### Workspace Settings

Purpose:

- Configure workspace name and description
- Configure workspace defaults
- Configure feature availability

Description:

Workspace Settings should not contain application-specific runtime behavior. It manages workspace identity and defaults.

#### Audit Scope

Purpose:

- Define what audit data is visible within the workspace
- Show retention policy
- Show audit boundaries

Description:

Audit Scope makes governance explicit and workspace-bound.

### Application

Application is the product-level AI experience.

Submenus:

```text
Application
├── Applications
├── Conversations
├── Playground
├── Releases
└── Integration
```

#### Applications

Purpose:

- List AI applications inside the current workspace
- Create or archive applications
- Show application owner, status, provider, and runtime health

Description:

This becomes the operational home for business-facing AI capabilities.

#### Conversations

Purpose:

- List conversation sessions
- Inspect messages
- View citations
- Link messages to traces

Description:

Conversations are user-facing runtime records.

#### Playground

Purpose:

- Test the selected application
- Send messages
- Stop streaming
- Retry requests
- Inspect output status

Description:

Playground is a runtime testing surface. It should not own AI logic.

#### Releases

Purpose:

- Show published versions of application configuration
- Compare active and draft runtime settings
- Prepare future approval workflows

Description:

Releases introduce change management for AI applications.

#### Integration

Purpose:

- Show application endpoint information
- Show SDK/API usage information
- Show integration keys or references

Description:

Integration connects platform-managed AI applications to external systems.

### AI Studio

AI Studio is where AI behavior is authored.

Submenus:

```text
AI Studio
├── Provider Center
├── Prompt Studio
├── Knowledge Center
├── Evaluation
└── Assets
```

#### Provider Center

Purpose:

- Manage provider routing
- Select provider and model
- Tune generation parameters
- Manage credential references
- Test provider routing

Description:

Provider Center is the model gateway control panel.

#### Prompt Studio

Purpose:

- Manage prompt templates
- Edit variables
- Preview rendered prompts
- Manage system prompt
- Prepare future prompt versioning

Description:

Prompt Studio treats prompts as first-class assets.

#### Knowledge Center

Purpose:

- Manage documents
- Manage knowledge bases
- Test retrieval
- Preview citations
- Inspect chunks

Description:

Knowledge Center is the RAG operations surface.

#### Evaluation

Purpose:

- Run prompt/application evaluations
- Compare output quality
- Track regression

Description:

Evaluation is a future module but should be included in navigation planning.

#### Assets

Purpose:

- Central asset inventory for prompts, documents, tools, datasets, and templates

Description:

Assets provides a structured inventory as the platform grows.

### Runtime

Runtime is where execution is configured, observed, and debugged.

Submenus:

```text
Runtime
├── Runtime Settings
├── Observability
├── Traces
├── Events
├── Token Usage
└── Errors
```

#### Runtime Settings

Purpose:

- Configure context window
- Configure compression strategy
- Toggle streaming, knowledge, and cache
- Import/export config
- Reset config

Description:

Runtime Settings manages execution behavior.

#### Observability

Purpose:

- Show trace list
- Show token metrics
- Show latency metrics
- Show event timeline
- Show streaming chunks

Description:

Observability is the AI runtime debugging console.

#### Traces

Purpose:

- Provide trace search and detail inspection
- Link traces to conversations and applications

Description:

Traces should become the durable execution record.

#### Events

Purpose:

- Show runtime lifecycle events
- Filter by event type
- Inspect event payload summary

Description:

Events help engineers debug the runtime pipeline.

#### Token Usage

Purpose:

- Show prompt, completion, and total token usage
- Show usage by workspace, application, provider, and time

Description:

Token Usage supports cost and capacity management.

#### Errors

Purpose:

- Group provider errors
- Show retryable and non-retryable failures
- Show timeout and abort events

Description:

Errors turns raw runtime failure into actionable operational data.

### Governance

Governance ensures the platform is safe and compliant.

Submenus:

```text
Governance
├── Policies
├── Audit Logs
├── Approvals
├── Credential References
├── Retention
└── Risk Center
```

#### Policies

Purpose:

- Configure provider policy
- Configure runtime limits
- Configure prompt safety rules
- Configure knowledge boundaries

Description:

Policies define what is allowed.

#### Audit Logs

Purpose:

- Show changes to config, prompts, knowledge, workspace, and provider references

Description:

Audit Logs support compliance and accountability.

#### Approvals

Purpose:

- Approve prompt changes
- Approve provider changes
- Approve production releases

Description:

Approvals are future workflow controls for high-risk changes.

#### Credential References

Purpose:

- Manage secret references
- Verify credential resolver status
- Show which workspace/application uses which credential reference

Description:

Credential References keep secrets out of frontend runtime.

#### Retention

Purpose:

- Configure trace retention
- Configure event retention
- Configure conversation retention

Description:

Retention controls storage, privacy, and observability cost.

#### Risk Center

Purpose:

- Show risky configurations
- Show unsafe provider usage
- Show missing citations
- Show repeated runtime errors

Description:

Risk Center gives governance users a prioritized view of issues.

### Admin

Admin contains platform foundation capabilities.

Submenus:

```text
Admin
├── Users
├── Roles
├── Schema Engine
├── System Settings
├── Monitor
└── Profile
```

#### Users

Purpose:

- Manage platform users
- Map users to workspace membership

Description:

Users should evolve from generic user CRUD to platform identity management.

#### Roles

Purpose:

- Manage role definitions and permissions

Description:

Roles should include AI-specific permissions.

#### Schema Engine

Purpose:

- Manage schema-driven UI definitions
- Future: manage tool schemas and structured output schemas

Description:

Schema Engine is the configuration foundation for dynamic platform surfaces.

#### System Settings

Purpose:

- Manage appearance
- Manage language
- Manage global system settings

Description:

System Settings is not the same as Runtime Settings.

#### Monitor

Purpose:

- Monitor platform-level events and alerts

Description:

Monitor is the general platform monitor, while Runtime Observability is AI-specific.

#### Profile

Purpose:

- Show current user, role, and permissions

Description:

Profile helps users understand their access scope.

## Information Hierarchy

The information hierarchy defines how users mentally navigate the platform.

```text
Organization
  -> Workspace
    -> Application
      -> Conversation
        -> Runtime Execution
          -> Trace
            -> Event Timeline
              -> Observability Metrics
```

### Workspace

Workspace is the highest interactive context after organization login. It represents a team, department, business unit, tenant, or environment.

Workspace answers:

- Which team am I operating in?
- Which applications are available here?
- Which prompts and knowledge bases are scoped here?
- Which users and roles apply here?
- Which governance rules apply here?

Workspace owns boundaries. A user should never accidentally configure provider settings, prompts, knowledge, or traces outside the selected workspace.

### Application

Application is the business-facing AI product inside a workspace.

Application answers:

- What AI capability is being built or operated?
- Which provider and model does it use?
- Which prompt template does it use?
- Which knowledge base does it use?
- Which conversations and traces belong to it?

Applications make runtime assets purposeful.

### Conversation

Conversation is the user interaction record.

Conversation answers:

- What did the user ask?
- What did the assistant answer?
- What citations were attached?
- What was the message state?
- Which runtime execution produced the answer?

Conversation is where business users experience AI behavior.

### Runtime

Runtime is the execution system behind a conversation.

Runtime answers:

- Which context was selected?
- Was knowledge retrieval enabled?
- Which prompt was constructed?
- Which provider was called?
- Was streaming used?
- Were limits enforced?

Runtime is not a page. It is the execution layer surfaced through multiple pages.

### Trace

Trace is the durable execution record of a runtime request.

Trace answers:

- When did the request start and end?
- Which provider and model were used?
- Which pipeline steps occurred?
- How many tokens were used?
- What was the latency?
- Did the request finish, error, or abort?

Trace connects conversation output to system behavior.

### Observability

Observability is the interpretation layer over traces, events, tokens, latency, and errors.

Observability answers:

- Is the runtime healthy?
- Where is latency coming from?
- Are token limits being approached?
- Are errors provider-related or configuration-related?
- Are streaming chunks behaving as expected?

Observability makes AI execution operable.

## Page Responsibilities

This section defines page-level responsibility boundaries. Each page should have a clear purpose and should not absorb responsibilities from other layers.

### Login

Purpose:

- Authenticate a user and initialize access scope.

Inputs:

- Username
- Password
- Optional redirect target

Outputs:

- Authenticated session
- User profile
- Role
- Route permissions
- Button permissions
- Field permissions
- Dynamic route availability

Dependencies:

- Auth store
- Login API or mock auth service
- Router guard
- Permission model

Business Value:

- Provides secure entry into the platform.
- Establishes identity and authorization boundaries.

UI Responsibilities:

- Render login form.
- Validate required fields.
- Show login error state.
- Redirect after success.

Runtime Responsibilities:

- None. Login must not trigger AI runtime behavior.

### Home Overview

Purpose:

- Provide platform-level and workspace-level summary.

Inputs:

- Current workspace
- Current applications
- Runtime health summary
- Provider summary
- Token usage summary
- Recent traces
- Recent activity

Outputs:

- Operational overview
- Navigation entry points to workspaces, applications, traces, and settings

Dependencies:

- Workspace store
- Application service
- Runtime observability data
- Provider status data
- Dashboard API

Business Value:

- Helps users understand platform status immediately after login.
- Reduces time to diagnose operational issues.

UI Responsibilities:

- Show summary cards.
- Show key charts.
- Show recent activity.
- Link to relevant control plane pages.

Runtime Responsibilities:

- Provide read-only metrics through observability and snapshot data.
- Must not execute chat requests automatically.

### Workspace Overview

Purpose:

- Show and manage the current workspace context.

Inputs:

- Workspace list
- Current workspace
- Workspace applications
- Workspace members
- Workspace configuration summary

Outputs:

- Selected workspace
- Workspace metadata updates
- Navigation to workspace-scoped resources

Dependencies:

- Workspace store
- Workspace service
- RBAC permissions

Business Value:

- Makes workspace the root domain of the platform.
- Prevents global AI configuration ambiguity.

UI Responsibilities:

- Show workspace switcher.
- Show workspace metadata.
- Show workspace assets and health summary.
- Trigger workspace switch action.

Runtime Responsibilities:

- Runtime should later consume workspace context.
- This page must not directly call ChatRuntime.

### Members

Purpose:

- Manage users assigned to the current workspace.

Inputs:

- Current workspace
- User list
- Role list
- Invitation status

Outputs:

- Workspace membership changes
- Role assignments

Dependencies:

- Workspace service
- User service
- Role service
- RBAC

Business Value:

- Enables team-level access management.
- Supports separation of responsibilities.

UI Responsibilities:

- Show member table.
- Support add, remove, and role assignment flows.
- Show permission hints.

Runtime Responsibilities:

- None.

### Access Control

Purpose:

- Manage permissions for workspace and AI assets.

Inputs:

- Roles
- Permissions
- Workspace scope
- Application scope

Outputs:

- Updated permission matrix

Dependencies:

- RBAC store
- Role service
- Workspace service

Business Value:

- Makes AI platform actions governable.
- Prevents unauthorized prompt, provider, and knowledge changes.

UI Responsibilities:

- Show permission matrix.
- Explain permission categories.
- Support safe updates.

Runtime Responsibilities:

- Runtime should respect authorization decisions through service boundaries.
- Page must not embed runtime permission logic.

### Applications

Purpose:

- Manage AI applications inside the selected workspace.

Inputs:

- Workspace context
- Application list
- Application status
- Provider and runtime summaries

Outputs:

- Created application
- Archived application
- Selected application

Dependencies:

- Workspace store
- Application service
- Provider config summary
- Runtime settings summary

Business Value:

- Turns platform capabilities into business-facing AI products.

UI Responsibilities:

- Show application cards or table.
- Support create and select flows.
- Show health and ownership metadata.

Runtime Responsibilities:

- Runtime should later execute under selected application.
- Applications page should not perform AI execution.

### Conversations

Purpose:

- Browse and inspect application conversations.

Inputs:

- Current workspace
- Current application
- Conversation list
- Messages
- Citations
- Trace links

Outputs:

- Selected conversation
- Conversation inspection state

Dependencies:

- Conversation store/service
- Chat snapshot cache
- Observability trace links

Business Value:

- Provides business-level visibility into AI interactions.

UI Responsibilities:

- Render conversation list.
- Render messages.
- Render citations.
- Link to trace details.

Runtime Responsibilities:

- Runtime owns message state and execution.
- UI only reads conversation snapshots and triggers actions through approved composables.

### Runtime Playground

Purpose:

- Test an AI application through the runtime.

Inputs:

- User message
- Current workspace
- Current application
- Runtime config
- Prompt template
- Knowledge settings

Outputs:

- Assistant response
- Message status
- Citations
- Trace ID
- Runtime snapshot

Dependencies:

- ChatRuntime
- useChatRuntime bridge
- Provider layer
- ContextManager
- KnowledgeBase
- PromptEngine
- EventBus
- Chat store snapshot

Business Value:

- Allows teams to validate AI behavior before release.

UI Responsibilities:

- Render message list.
- Bind input.
- Trigger send, stop, retry, clear.
- Render loading, streaming, done, error, and cancelled states.
- Render markdown safely.

Runtime Responsibilities:

- Own message state.
- Build context.
- Retrieve knowledge.
- Build prompt.
- Call provider.
- Emit lifecycle events.
- Emit snapshots.
- Apply runtime guards.

### Provider Center

Purpose:

- Configure AI provider routing and provider-level generation parameters.

Inputs:

- Provider list
- Model list
- Current provider
- Current model
- Temperature
- Top P
- Max tokens
- Credential reference

Outputs:

- Updated provider configuration
- Updated model selection
- Updated generation parameters
- Provider probe result
- Credential reference state

Dependencies:

- AI Config store
- Provider factory
- Provider capabilities
- Provider credential reference model
- useChatRuntime for probe

Business Value:

- Enables vendor-agnostic model operation.
- Reduces provider lock-in.
- Centralizes provider behavior.

UI Responsibilities:

- Show provider selector.
- Show model selector.
- Show generation controls.
- Show credential reference form.
- Trigger provider probe.
- Show provider status and current config.

Runtime Responsibilities:

- Consume provider configuration indirectly.
- Execute provider call through provider interface only.
- Normalize provider errors.

### Prompt Studio

Purpose:

- Manage prompt templates and system prompts.

Inputs:

- Prompt template list
- Selected template
- Template body
- Variable JSON
- System prompt
- Retrieved documents for preview
- Citations for preview

Outputs:

- Updated prompt template draft
- Rendered prompt preview
- System prompt update
- Variable validation errors

Dependencies:

- PromptEngine
- PromptRegistry
- AI Config store
- Knowledge preview data

Business Value:

- Makes prompts manageable assets.
- Enables prompt iteration outside code changes.

UI Responsibilities:

- Show template list.
- Edit template text.
- Show variable tags.
- Edit preview variables.
- Render prompt preview.
- Show validation errors.

Runtime Responsibilities:

- Use PromptEngine during execution.
- Never hardcode prompts inside ChatRuntime.

### Knowledge Center

Purpose:

- Manage knowledge assets and retrieval behavior.

Inputs:

- Knowledge base list
- Active knowledge base
- Document title
- Document content
- Retrieval query
- TopK value

Outputs:

- Created knowledge base
- Uploaded document
- Chunks
- Retrieval results
- Citations

Dependencies:

- KnowledgeWorkspace
- KnowledgeBase
- Chunker
- Retriever
- Citation generator

Business Value:

- Enables knowledge-grounded AI answers.
- Provides visibility into why citations appear.

UI Responsibilities:

- Show knowledge base selector.
- Create knowledge base.
- Upload text document.
- Show document list.
- Run retrieval test.
- Show chunks and citations.

Runtime Responsibilities:

- Retrieve knowledge during chat execution when enabled.
- Attach citations to assistant messages.
- Respect workspace and retrieval limits.

### Runtime Settings

Purpose:

- Configure AI runtime behavior.

Inputs:

- Context window
- Compression strategy
- Streaming toggle
- Knowledge toggle
- Cache toggle
- Config JSON
- Future timeout and retry settings

Outputs:

- Updated runtime config
- Exported config JSON
- Imported config JSON
- Validation error state
- Reset config

Dependencies:

- AI Config store
- Config validator
- Runtime event bus

Business Value:

- Enables runtime behavior changes without code modification.
- Supports controlled experimentation.

UI Responsibilities:

- Render config controls.
- Import and export JSON.
- Show validation errors.
- Trigger reset.

Runtime Responsibilities:

- Consume validated config through config reader.
- Refresh runtime guards after config changes.

### Observability

Purpose:

- Inspect AI runtime execution lifecycle.

Inputs:

- Trace list
- Event timeline
- Token usage
- Latency metrics
- Streaming chunk events
- Selected trace

Outputs:

- Trace detail view
- Runtime diagnosis
- Cleared local observability state

Dependencies:

- RuntimeInspector
- TraceCollector
- EventTimeline
- TokenMonitor
- LatencyTracker
- EventBus

Business Value:

- Makes AI runtime behavior debuggable.
- Supports incident investigation and quality improvement.

UI Responsibilities:

- Show traces.
- Show selected trace metrics.
- Show event timeline.
- Show chunk visualization.
- Open trace detail drawer.
- Clear observability data.

Runtime Responsibilities:

- Emit lifecycle events.
- Observability listens passively and must not modify runtime behavior.

### Governance Policies

Purpose:

- Define allowed AI platform behavior.

Inputs:

- Workspace policy
- Provider policy
- Runtime limits
- Knowledge limits
- Prompt safety settings

Outputs:

- Updated policy configuration
- Policy validation results

Dependencies:

- Governance service
- RBAC
- Config validator
- Workspace context

Business Value:

- Reduces operational risk.
- Creates enterprise trust in AI usage.

UI Responsibilities:

- Show policy categories.
- Explain policy impact.
- Support safe updates and review.

Runtime Responsibilities:

- Enforce relevant policy through config and runtime guards.

### Audit Logs

Purpose:

- Show who changed what and when.

Inputs:

- Workspace
- Application
- User
- Time range
- Event type

Outputs:

- Audit event list
- Audit event detail
- Exportable evidence

Dependencies:

- Audit service
- Workspace context
- RBAC

Business Value:

- Supports compliance and accountability.

UI Responsibilities:

- Show audit table.
- Support filters.
- Show event detail.

Runtime Responsibilities:

- Emit or expose auditable events through service layer.

### Users

Purpose:

- Manage platform identities.

Inputs:

- User records
- Role assignments
- Workspace memberships

Outputs:

- Created, updated, or disabled users

Dependencies:

- User service
- RBAC
- Table Engine
- Schema Engine

Business Value:

- Provides enterprise identity administration.

UI Responsibilities:

- Render table.
- Provide CRUD interactions.
- Respect permissions.

Runtime Responsibilities:

- None.

### Roles

Purpose:

- Manage platform roles and permission models.

Inputs:

- Role records
- Permission definitions

Outputs:

- Updated role definitions

Dependencies:

- Role service
- RBAC
- Table Engine

Business Value:

- Enables controlled access to AI platform functions.

UI Responsibilities:

- Render role table.
- Support CRUD interactions.
- Display permission categories.

Runtime Responsibilities:

- None.

### Schema Engine

Purpose:

- Edit and preview schema-driven UI definitions.

Inputs:

- Schema JSON
- Form schema
- Table schema

Outputs:

- Validation result
- Form preview
- Table preview
- Formatted schema

Dependencies:

- Monaco editor
- Schema parser
- SchemaForm
- Table schema utilities

Business Value:

- Demonstrates configurable enterprise UI capability.
- Future foundation for tool schemas and structured outputs.

UI Responsibilities:

- Render editor.
- Render validation state.
- Render previews.
- Support reset and format.

Runtime Responsibilities:

- None today.
- Future tool calling may consume schema definitions.

### System Settings

Purpose:

- Manage global non-runtime settings.

Inputs:

- System name
- Audit switch
- Theme
- Language
- Layout density

Outputs:

- Updated UI/system preferences

Dependencies:

- Theme composable
- Locale composable
- Permission directive

Business Value:

- Provides platform customization and operational preferences.

UI Responsibilities:

- Render settings controls.
- Persist preferences.
- Respect permissions.

Runtime Responsibilities:

- None.

### Monitor

Purpose:

- Monitor general platform events and alerts.

Inputs:

- Realtime events
- Notification list
- System logs
- Alert status

Outputs:

- Event stream view
- Marked-read notification state
- Simulated realtime event

Dependencies:

- Realtime service
- Notification store

Business Value:

- Provides general operational awareness beyond AI-specific traces.

UI Responsibilities:

- Show metrics.
- Show event timeline.
- Show logs.
- Show alerts.

Runtime Responsibilities:

- None directly.

### Profile

Purpose:

- Show current user identity and permissions.

Inputs:

- User profile
- Role
- Route permissions
- Button permissions
- Field permissions

Outputs:

- User understanding of access scope

Dependencies:

- Auth store
- RBAC state

Business Value:

- Improves transparency of enterprise permission model.

UI Responsibilities:

- Render profile card.
- Render permission tags.

Runtime Responsibilities:

- None.

## User Journey

The primary journey should demonstrate how an enterprise user moves from access to AI operation.

```text
Login
  -> Select Workspace
    -> Select Application
      -> Start Conversation
        -> Trace Runtime
          -> Adjust Prompt
            -> Observe Pipeline
              -> Improve Runtime Configuration
```

### Step 1: Login

The user authenticates through the platform login page. After authentication, the system loads user profile, role, permissions, and available routes.

User questions:

- Who am I in this platform?
- What can I access?
- Which workspaces are available?

System outcome:

- Auth session is established.
- Navigation is generated based on permissions.
- User is redirected to Home or the requested route.

### Step 2: Select Workspace

The user selects a workspace from a global workspace switcher.

User questions:

- Which team or tenant am I working in?
- What AI applications belong to this workspace?
- What permissions do I have here?

System outcome:

- Workspace context becomes active.
- Application list, provider settings, prompts, knowledge, conversations, and traces are scoped.

### Step 3: Select Application

The user selects an AI application inside the workspace.

User questions:

- Which AI assistant or capability am I testing?
- What provider and prompt does it use?
- Is knowledge retrieval enabled?

System outcome:

- Application context becomes active.
- Runtime settings and assets resolve from workspace/application scope.

### Step 4: Start Conversation

The user opens Playground or Conversations and sends a message.

User questions:

- Does the assistant answer correctly?
- Is streaming working?
- Are citations returned?
- Did the runtime finish successfully?

System outcome:

- ChatRuntime creates runtime execution.
- ContextManager builds context.
- KnowledgeBase retrieves relevant chunks if enabled.
- PromptEngine builds final prompt.
- Provider streams response.
- EventBus emits lifecycle events.
- Snapshot updates UI.

### Step 5: Trace Runtime

The user opens Observability to inspect the execution.

User questions:

- Which provider was used?
- How many tokens were consumed?
- What was time to first token?
- Did any pipeline step fail?
- Which chunks streamed?

System outcome:

- Trace list shows execution record.
- Timeline shows lifecycle events.
- Token and latency panels show performance.
- Errors and aborts are visible.

### Step 6: Adjust Prompt

The user opens Prompt Studio to refine prompt behavior.

User questions:

- Is the system prompt correct?
- Are variables injected correctly?
- Does the RAG prompt include citations?
- Can the prompt be previewed before runtime execution?

System outcome:

- Prompt template is edited.
- Variables are previewed.
- Prompt output is rendered.
- Future runtime executions use updated prompt configuration.

### Step 7: Observe Pipeline

The user runs another test and compares runtime behavior.

User questions:

- Did the prompt change improve output?
- Did retrieval change?
- Did token usage increase?
- Did latency change?

System outcome:

- New traces are recorded.
- Prompt, runtime, and provider behavior can be compared manually today and systematically in future evaluation modules.

## Navigation Rules

Navigation rules define how users move through the platform and how context is preserved.

### Global Navigation

Global navigation is persistent across authenticated pages.

Rules:

- Sidebar should expose top-level platform domains.
- Header should expose current workspace and current application when available.
- Provider/model tags may appear in AI-specific contexts.
- Navigation items should be permission-aware.
- Unauthorized routes should not appear in the menu.
- Direct navigation to unauthorized pages should redirect safely.

### Workspace Scope

Workspace scope is mandatory for AI platform pages.

Rules:

- AI Studio pages must operate under a workspace.
- Runtime pages must operate under a workspace.
- Governance pages must operate under a workspace or clearly indicate organization-level mode.
- Switching workspace should update available applications, prompts, knowledge bases, conversations, and traces.
- Workspace switch should not silently carry application-specific state into another workspace.

Recommended behavior:

```text
Switch Workspace
  -> Clear selected application if it does not belong to new workspace
  -> Reload workspace assets
  -> Preserve global UI preferences
  -> Keep user on equivalent page if valid
  -> Redirect to Workspace Overview if current context becomes invalid
```

### Application Scope

Application scope applies below workspace.

Rules:

- Conversations belong to an application.
- Runtime Playground should require an active application.
- Prompt and knowledge pages may show workspace-level assets but should make application binding visible.
- Observability should be filterable by application.
- Provider settings may have workspace defaults and application overrides.

Recommended behavior:

```text
Select Application
  -> Resolve runtime config
  -> Resolve provider config
  -> Resolve prompt template
  -> Resolve knowledge base
  -> Load conversations and traces
```

### Runtime Scope

Runtime scope exists for a single execution.

Rules:

- Each runtime request should have a trace ID.
- Runtime state should flow through snapshots, not direct UI mutation.
- Trace detail should be accessible from conversation messages.
- Runtime execution should not continue after workspace/application context becomes invalid.
- Runtime events should include enough context to associate with workspace and application in future versions.

### Modal Rules

Modals should be used for short, focused tasks.

Use modals for:

- Create workspace
- Rename workspace
- Create application
- Confirm delete/archive
- Quick edit metadata
- Confirm dangerous config reset

Do not use modals for:

- Prompt editing
- Trace inspection
- Long JSON config editing
- Knowledge document review
- Complex permission management

Modal rules:

- A modal should have one primary action.
- A modal should not contain multi-step navigation.
- A destructive modal must explain impact.
- Closing a modal should not mutate state unless explicitly saved.

### Drawer Rules

Drawers should be used for contextual inspection without leaving the current list or dashboard.

Use drawers for:

- Trace detail
- Event detail
- Citation source preview
- Document chunk preview
- Provider capability detail
- Audit event detail

Drawer rules:

- Drawers are read-heavy.
- Drawers may contain secondary actions but should not become full editors.
- Drawers should preserve the user's current list selection.
- Deep inspection pages can replace drawers when data becomes complex.

### Page Transition Rules

Rules:

- Workspace and application context should remain visible during navigation.
- Navigation should avoid losing unsaved prompt or config drafts without warning.
- Runtime execution should show clear status when users leave the Playground.
- Observability should continue to collect passively if enabled.
- Config import should validate before applying.

## Future Expansion

The information architecture must support future platform capabilities without forcing a rewrite.

### Agent

Agent introduces autonomous or semi-autonomous AI behavior.

Future pages:

```text
AI Studio
└── Agents
    ├── Agent List
    ├── Agent Builder
    ├── Instructions
    ├── Tools
    ├── Memory
    └── Runs
```

IA impact:

- Agent belongs to workspace and application.
- Agent runs should produce traces.
- Agent tools should be governed.
- Agent memory should be scoped and auditable.

### Workflow

Workflow introduces multi-step orchestration.

Future pages:

```text
Runtime
└── Workflows
    ├── Workflow List
    ├── Workflow Designer
    ├── Runs
    ├── Nodes
    └── Schedules
```

IA impact:

- Workflow belongs to application.
- Workflow runs produce traces.
- Workflow nodes may call providers, tools, APIs, or knowledge retrieval.
- Workflow configuration should be versioned and approved.

### Plugin Marketplace

Plugin Marketplace allows extension through providers, tools, prompt packs, workflow nodes, and knowledge connectors.

Future pages:

```text
Admin
└── Plugin Marketplace
    ├── Installed Plugins
    ├── Provider Plugins
    ├── Tool Plugins
    ├── Knowledge Connectors
    └── Prompt Packs
```

IA impact:

- Plugins can be organization-level or workspace-level.
- Plugin permissions must be explicit.
- Plugin installation should be auditable.
- Runtime should depend on plugin interfaces, not plugin implementations.

### API Hub

API Hub exposes platform-managed AI capabilities to external systems.

Future pages:

```text
Application
└── API Hub
    ├── Endpoints
    ├── API Keys
    ├── Usage
    ├── Webhooks
    └── SDKs
```

IA impact:

- API endpoints belong to applications.
- External usage should produce traces.
- Credentials should be managed as references.
- Usage should be visible in observability and governance.

### MCP

MCP integration allows the platform to connect AI applications with external tools and resources through a standard protocol.

Future pages:

```text
AI Studio
└── MCP Servers
    ├── Server List
    ├── Capabilities
    ├── Resources
    ├── Tools
    └── Connection Health
```

IA impact:

- MCP servers may be workspace-scoped.
- MCP tools must be governed.
- Tool calls should be observable.
- Resource access must be auditable.

### Tool Calling

Tool Calling enables models and agents to invoke typed tools.

Future pages:

```text
AI Studio
└── Tools
    ├── Tool Registry
    ├── Tool Schema
    ├── Permissions
    ├── Test Console
    └── Call Logs
```

IA impact:

- Tools belong to workspace or organization.
- Applications choose allowed tools.
- Tool schemas may reuse Schema Engine capabilities.
- Tool calls become runtime events and trace spans.
- Tool permissions must be enforced by governance.

## Domain Ownership Model

As the platform evolves, one of the most important architecture risks is domain ambiguity. If a page or module cannot answer which workspace, application, runtime execution, or governance scope it belongs to, it will eventually create state leakage, permission confusion, and operational risk.

The platform should therefore use a clear ownership model.

```text
Organization
  owns -> Global policy, global users, global provider availability

Workspace
  owns -> Team boundary, members, workspace defaults, workspace assets

Application
  owns -> Product-facing AI behavior, conversations, releases, integrations

Runtime Execution
  owns -> One request lifecycle, trace, events, token usage, latency

Governance
  owns -> Policy, audit, approval, retention, risk signals
```

### Organization-Owned Information

Organization-owned information applies across the platform and should be changed only by Super Admins or equivalent platform owners.

Examples:

- Global feature flags
- Organization-wide provider availability
- Global RBAC definitions
- Global security policy
- Global retention defaults
- Global audit requirements
- Plugin installation policy

Organization-owned settings should be rare. If too many settings live at organization level, workspaces lose autonomy. If too few settings live at organization level, the platform becomes hard to govern. The architecture should prefer workspace-level ownership unless a rule truly applies to the entire organization.

### Workspace-Owned Information

Workspace-owned information is the default for enterprise AI operations.

Examples:

- Workspace members
- Workspace role assignments
- Workspace applications
- Workspace provider defaults
- Workspace prompt assets
- Workspace knowledge bases
- Workspace observability scope
- Workspace audit scope

Workspace-owned information should never be implicitly shared with other workspaces. Any cross-workspace sharing must be explicit, visible, permissioned, and auditable.

### Application-Owned Information

Application-owned information represents the behavior of a concrete AI product.

Examples:

- Application conversations
- Application runtime configuration override
- Application prompt binding
- Application knowledge binding
- Application provider override
- Application release history
- Application integration endpoints

Application ownership is important because multiple applications may exist inside the same workspace but require different behavior. A legal assistant and a customer support assistant may share a workspace, but they should not accidentally share prompts, knowledge, runtime settings, or traces unless explicitly configured.

### Runtime-Owned Information

Runtime-owned information is created during execution and should be treated as an immutable or append-only operational record.

Examples:

- Trace ID
- Runtime status
- Pipeline steps
- Event timeline
- Token usage
- Latency metrics
- Provider error code
- Abort or timeout state
- Retrieval count
- Prompt length

Runtime-owned information should not be manually edited from the UI. Users may annotate, filter, export, or inspect runtime records, but the execution record itself should remain trustworthy.

### Governance-Owned Information

Governance-owned information defines constraints and accountability.

Examples:

- Provider usage policy
- Credential reference policy
- Prompt approval rules
- Knowledge retention rules
- Trace retention rules
- Risk detection rules
- Audit log events
- Release approval records

Governance information should be visible where users make decisions. For example, if a user changes provider settings, the UI should eventually show whether that change requires approval. If a user uploads a document, the UI should eventually show retention and classification rules.

## Scope Matrix

The scope matrix clarifies where each platform capability should live.

| Capability            | Organization | Workspace | Application | Runtime Execution |
| --------------------- | ------------ | --------- | ----------- | ----------------- |
| User identity         | Yes          | Member    | No          | No                |
| RBAC policy           | Yes          | Yes       | Optional    | No                |
| Provider availability | Yes          | Yes       | Optional    | Used              |
| Credential reference  | Yes          | Yes       | Optional    | Used              |
| Prompt template       | No           | Yes       | Bound       | Rendered          |
| Knowledge base        | No           | Yes       | Bound       | Retrieved         |
| Conversation          | No           | Yes       | Yes         | Produces messages |
| Runtime config        | Default      | Yes       | Override    | Applied           |
| Trace                 | No           | Yes       | Yes         | Yes               |
| Token metrics         | Aggregate    | Aggregate | Aggregate   | Yes               |
| Audit logs            | Yes          | Yes       | Yes         | Related           |
| Releases              | No           | Optional  | Yes         | No                |

This matrix should guide future page design. When a new feature is proposed, the first architecture question should be: which scope owns this information?

## State Ownership Rules

State ownership must follow the information hierarchy.

### Global State

Global state should be limited to:

- Auth session
- Current user
- Global route permissions
- UI preferences such as theme and language
- Current workspace selection
- Current application selection

Global state should not hold mutable runtime execution details. Runtime details belong to runtime snapshots, traces, and scoped stores.

### Workspace State

Workspace state should include:

- Current workspace
- Workspace list
- Workspace metadata
- Workspace member summary
- Workspace-scoped asset summaries

Workspace state should be persistent because users expect to return to their last working context.

### Application State

Application state should include:

- Current application
- Application list
- Application metadata
- Application runtime binding summary
- Application conversation selection

Application state should reset or re-resolve when workspace changes.

### Runtime State

Runtime state should be owned by ChatRuntime and emitted as snapshots.

Rules:

- UI does not mutate runtime messages directly.
- Pinia may cache runtime snapshots for rendering.
- Runtime events produce observability data.
- Retry, stop, clear, streaming, and message state transitions belong to runtime.
- Runtime state should be associated with workspace and application in future phases.

### Draft State

Draft state is temporary UI state for editing workflows.

Examples:

- Prompt template draft
- Config JSON draft
- Credential reference draft
- Document upload draft
- Workspace creation form

Draft state may live in page-level composables, but it should not become the source of truth. Once applied, it must pass through the relevant domain service or store.

## Information Architecture Governance

The information architecture should be reviewed whenever a new module is added.

A new page should answer:

- Which domain owns this page?
- Which scope is required before entering this page?
- Which role can access this page?
- Which data is read?
- Which data is written?
- Which runtime behavior is triggered?
- Which events or audit logs are produced?
- Which future module might depend on this page?

A new feature should not be accepted if it introduces unclear ownership.

### Naming Rules

Names should reinforce the product model.

Prefer:

- Workspace
- Application
- Provider Center
- Prompt Studio
- Knowledge Center
- Runtime Settings
- Observability
- Governance
- Audit Logs

Avoid:

- Generic “Management” for every page
- Technical implementation names in navigation
- Vendor-specific names in core product areas
- Admin-template language as the primary product vocabulary

For example, “Provider Center” is better than “Model Config” because it communicates gateway responsibility. “Knowledge Center” is better than “Document Upload” because it communicates a full RAG operations surface. “Runtime Settings” is better than “AI Config” because it communicates execution impact.

### Empty State Rules

Enterprise platforms often fail in first-run experience. Empty states should guide users through the correct hierarchy.

Examples:

- No workspace: prompt user to create or request access to a workspace.
- No application: prompt user to create an application inside the selected workspace.
- No provider configured: guide user to Provider Center.
- No prompt template: guide user to Prompt Studio.
- No knowledge base: allow chat without knowledge, but explain how to enable RAG.
- No traces: explain that traces appear after runtime execution.

Empty states are part of information architecture because they teach users the platform model.

### Cross-Linking Rules

Pages should cross-link based on runtime evidence, not arbitrary shortcuts.

Examples:

- A conversation message links to its trace.
- A trace links to its application and conversation.
- A trace with retrieval results links to Knowledge Center.
- A trace with prompt metadata links to Prompt Studio.
- A provider error links to Provider Center.
- A config validation error links to Runtime Settings.
- An audit event links to the changed asset.

Cross-linking makes the platform feel coherent and reduces debugging time.

## Closing Position

The platform is evolving from an enterprise admin starter into an enterprise AI operating surface. The information architecture must therefore move away from generic CRUD-first navigation and toward workspace-scoped AI application operations.

The target mental model is:

```text
I choose a workspace.
I choose an AI application.
I configure its provider, prompt, knowledge, and runtime behavior.
I run conversations.
I inspect traces.
I govern changes.
I improve the system safely.
```

This architecture keeps the existing strengths of the project, including RBAC, schema-driven UI, table engine, runtime orchestration, provider abstraction, prompt engine, knowledge retrieval, and observability. It reorganizes them into a product model that senior engineers, product designers, and enterprise stakeholders can understand as a real AI platform.
