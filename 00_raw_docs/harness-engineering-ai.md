---
id: harness-engineering-ai-website
title: "Harness Engineering Website - Kai Renner"
category: "Raw Knowledge Source"
tags:
  - raw-source
  - website
  - harness-engineering
  - agent-harness
  - governance
date: 2026-05-25
status: to-process
---

# Harness Engineering – Website Content (Kai Renner)

Nguồn: [https://harness-engineering.ai/](https://harness-engineering.ai/)  
Tác giả: Kai Renner  
Ngày thu thập: 2026-05-25  
Số bài viết chính: 6

---

## I. What Is Harness Engineering? The Discipline That Makes AI Agents Reliable

**URL:** /blog/what-is-harness-engineering/

### Định nghĩa cốt lõi

Harness engineering is "the emerging discipline of building the infrastructure layer that makes AI agents reliable in production." Nó là "everything between the user's request and the agent's final output that is not the language model itself."

### Nguồn gốc thuật ngữ

The term is derived from "horse tack, the physical harness that directs a powerful animal's energy toward useful work." Anthropic popularized this metaphor.

### Codex Breakthrough

The concept was proven when OpenAI deployed Codex. The breakthrough was not the model itself, but rather the sandboxed harness that ran verification loops and structured tool access. No manual application code was written for five months; the team built the harness, and agents generated 1M+ lines through it.

### 5 Core Components

1. **Context Engineering** — Managing what information is delivered to the agent at each step, ensuring precision.
2. **Tool Orchestration** — Managing how agents interact with external APIs, including input validation and handling tool errors.
3. **Verification Loops** — Reviewing intermediate outputs, "the single highest-ROI component of any agent harness."
4. **Cost Envelope Management** — Imposing per-task budget ceilings to prevent runaway loop costs.
5. **Observability and Evaluation** — Implementing "structured execution traces" and automated evaluation testing.

### Architecture Patterns

- **Single Agent with Verification Loop:** One agent with basic schema verification checking every tool action.
- **Two-Agent Supervisor:** A primary executing agent paired with a supervisor agent that evaluates work quality.
- **Multi-Agent with Shared Harness:** Multiple specialized agents coordinated by a shared utility layer.

### Key Takeaways

- The surrounding infrastructure is "the 80% factor" in ensuring agent consistency.
- Harness improvements deliver larger reliability jumps than changing or upgrading the underlying model.
- Teams should "start with verification loops", set "cost envelopes from day one", and measure metrics before optimizing.

---

## II. Complete Guide to Agent Harness: What It Is and Why It Matters

**URL:** /blog/agent-harness-complete-guide/

### Định nghĩa Agent Harness

An agent harness is the infrastructure layer that wraps an AI model, managing its lifecycle, context, tool access, verification, and safety in production. The model generates text; the harness controls what the model sees, what tools it can use, when it stops, and how failures are handled.

### Analogies

- Horse tack (LLM is the horse, harness is the bridle/reins/saddle)
- CPU-OS comparison: "the model is the CPU, and the harness is the operating system."

### Phân biệt quan trọng: Framework vs Harness

"You build with a framework. You run inside a harness."

---

### Six Core Harness Components

#### Foundation Layer

1. **Context Engineering** — Managing what information the model sees at each step — system prompts, retrieval, history, environmental state — and actively pruning/summarizing to avoid context-window overflow.

2. **Tool Orchestration** — Governing which tools are available per task phase, argument validation, sandboxing, timeouts, and error handling. "Constraining the tool set per step reduces errors and token waste."

3. **State & Memory Management** — Durable checkpoint-resume so agents can recover from crashes mid-task, plus cross-session memory structures.

#### Safety Layer

4. **Verification & Safety** — Post-output checks before real-world action — schema validation, test execution, failure-triggered retry or escalation.

5. **Human-in-the-Loop** — Approval gates for destructive, financial, external, or infrastructure-modifying actions, calibrated to balance speed vs. safety.

6. **Lifecycle Management** — Health checks, resource limits, graceful shutdown, crash recovery — treating agents as long-running production processes.

### Architectural Patterns (Chi tiết)

**OpenAI's Codex Harness:** Machine-readable artifacts (architectural constraints, API contracts, design records) served as structured context. A closed-loop verification pipeline (pre-commit hooks, custom linters, structural tests) rejected bad outputs automatically, feeding failure reasons back for retry. No manual application code was written for five months; the team built the harness, and agents generated 1M+ lines through it.

**Anthropic's Two-Agent Pattern:** An initializer agent constructs fresh context each session by analyzing current codebase state and task requirements, then passes a clean brief to a coding agent. A structured claude-progress.txt file serves as a checkpoint-resume mechanism for context — recording steps, blockers, decisions, and next actions. "Treat agent handoffs like shift changes at a hospital."

### Dữ liệu định lượng

- Compounding failure rates: "Assume each step succeeds 95% of the time — chain 20 steps — drops to 36%." The harness adds verification loops, retry policies, and checkpoint-resume to push reliability back.
- Manus spent six months and five architectural rewrites; LangGraph's execution engine went through four architectures over a year.
- Vercel's paradox: Removing 80% of available tools produced "measurably better results."
- "The competitive advantage in AI products has shifted from 'which model are you using?' to 'how good is your harness?'"
- Two teams with the same model can see "a 40-point difference in task completion rates based entirely on harness design."
- One team went from 83% to 96% task completion "by adding structured verification. The model didn't change."

### Implementation Approach (4-Phase)

**Phase 1 — Verification loops first:** Add tests, schema checks, or a second model's evaluation before any irreversible action. Highest ROI per engineering hour.

**Phase 2 — State persistence:** Serialize agent state after each step to durable storage. On crash, restart from last checkpoint, cutting token costs during failures by 30-50%.

**Phase 3 — Observability:** Instrument traces for every tool call and model invocation. Track token usage, wall-clock time, and cost per task. "Without observability, you're operating a non-deterministic system blind."

**Phase 4 — Human-in-the-loop controls:** Start conservative with gates on destructive/expensive actions. Relax as confidence grows per category.

**Key warning:** "building a production-ready harness takes months, not days."

---

## III. Managing Context-Switch Fatigue with Multiple AI Agents

**URL:** /blog/managing-context-switch-fatigue-with-multiple-ai-agents/

### Định nghĩa Context-Switch Fatigue

Context-switch fatigue refers to the **silent degradation of information** as execution passes from one agent to another in a multi-agent pipeline. Unlike crashes or errors, this degradation is invisible — tasks complete successfully but produce wrong results because the original user intent has been gradually distorted.

### Hai loại mất mát

1. **Token context loss** — what the model forgets. When a child agent receives a summarized version of upstream work, omitted details vanish from the model's active reasoning.
2. **Operational context loss** — what the harness forgets. This includes orchestration state like locked tools, rejected branches, decision rationale, and data provenance. "Even if you preserved token context perfectly, operational context loss would still degrade downstream agents."

### Anatomy of a Context Switch

8 steps in a single agent handoff, with entropy entering at 4 specific points:
1. Parent emits task
2. SERIALIZATION (loss point #1)
3. Message queue
4. Child agent bootstrap
5. CONTEXT RECONSTRUCTION (loss point #2)
6. Execution
7. RESULT MARSHALING (loss point #3)
8. PARENT RE-INGESTION (loss point #4)

In a 5-hop chain: "up to 20" injection points for truncation, summarization distortion, and lost implicit assumptions.

### Giải pháp (Harness-Level, Not Prompt-Level)

**Core thesis:** "You cannot prompt your way to a reliable 5-hop agent chain." The orchestration layer must own the problem.

1. **Context Re-Injection Middleware** — Before each agent invocation, the harness prepends the original user goal, key constraints, and "must persist" facts into the system prompt (not the task payload), so context-window pressure doesn't evict them.

2. **Structured Handoff Schema** — Replace prose summaries with validated, versioned data objects. The article provides a dataclass-based handoff schema:
   - original_goal
   - decisions_made
   - open_assumptions
   - tool_state_snapshot
   - schema_version

3. **Circuit Breakers for Context Depth** — Halt execution when a chain exceeds a configurable hop threshold without a human checkpoint.

4. **Fidelity SLOs** — Four specific instrumentation metrics:
   - Instruction-following score drift across hops (alert above 15%)
   - Tool-call argument deviation rate
   - Re-clarification request frequency
   - Retry storm patterns

### Patterns to Reduce Switch Frequency

**Monolithic-Agent-First Rule** — Default to a single large-context agent. Split only for tool isolation, parallelism, or trust boundaries.

**Sticky Routing** — Route related follow-up tasks to the same agent instance while context is still warm.

**Context Budget Allocation** — Reserve fixed token space for structural priming (role, constraints).

**Hierarchical Summarization Contracts** — Schema-driven definitions of what must pass downstream vs. what can be compressed.

### Memory Tier Architecture

| Tier | Store | Lifespan | Use |
|------|-------|----------|-----|
| Ephemeral | In-context | Single invocation | Active working memory; lost at agent boundary unless persisted |
| Working | Redis / in-memory cache | Single chain execution | State multiple agents must read; does not outlive the chain |
| Archival | Vector/relational DB | Cross-session | User preferences, prior outcomes, domain facts |

### Stateful vs Stateless Handoff

- **Stateless message passing** (self-contained handoffs): Simpler to operate but large payloads incentivize compression. Best for chains under 4 hops.
- **Stateful session stores** (agents read shared external state): Thin payloads but introduce consistency challenges. Best for longer chains.
- **Rule:** "Never mix the two patterns in the same chain — hybrid approaches create the worst of both failure modes."

### Fidelity Checkpoints

- **Goal-echo at every agent entry point:** Each agent reads the verbatim original_goal from the handoff schema before its task description.
- **Fidelity checkpoint agent at hop 3:** A lightweight agent scoring semantic similarity between the current working goal and the original goal. Similarity below 0.85 triggers alert and human review halt.

### Production Checklist (8 Items)

1. Documented boundary justification for each agent split
2. Structured versioned handoff schema
3. Verbatim goal preservation as required field
4. Fidelity SLOs with alerts
5. Correlation IDs with full chain lineage
6. Context budget enforcement
7. Hop circuit breakers
8. Explicit memory-tier routing rules

---

## IV. AI Agent Governance: Best Practices for Production Environments

**URL:** /blog/ai-agent-governance-best-practices-for-production-environments/

### Vấn đề cốt lõi

Agent governance is fundamentally harder than traditional software governance because an agent's "behavior emerges from a combination of its instructions, its available tools, the context it receives, and the LLM's sampling process." Permission boundaries alone are insufficient — you also need intent modeling and behavioral constraints.

### Four Governance Layers

#### Layer 1: Identity and Permissions

- Each agent gets a dedicated principal with scoped permissions — never shared service accounts or shared API keys
- In AWS, assign dedicated IAM roles with resource-level policies
- For databases, use read-only schema users
- External API access requires per-agent API keys with scoped permissions

**Pattern:** Monthly automated audits that compare granted permissions against tool call logs. Remove any permission not exercised in 30 days.

**Capability delegation principle:** Orchestrator agents cannot grant permissions they don't hold themselves.

#### Layer 2: Policy Enforcement

A policy enforcement point (PEP) intercepts every tool call before execution. The PEP evaluates calls against a ruleset and allows, denies, or escalates to a human queue.

**Critical:** "the policy rules live outside the agent's context — they are not prompt instructions that the agent might override or misinterpret."

**Concrete rule examples:**
- Deny account status modifications for accounts over $50K (route to account manager)
- Deny bulk operations affecting 100+ records without human sign-off
- Deny outbound communication with pricing discounts above 20%
- Require re-authentication for refunds above $1,000

**Additional:** Per-agent-instance rate limiters (not per API key) to cap blast radius of runaway tasks.

#### Layer 3: Audit Trails and Explainability

**Audit log structure** — each task must capture:
- Task ID and parent context
- Full execution trace: all tool calls with timestamps, inputs, outputs, latency
- All policy enforcement decisions and results
- LLM completions: model version, temperature, token counts
- Identity chain: agent principal, authenticated user, delegated authorities

**Storage requirement:** "Store execution traces in an append-only log system. Agents should never be able to modify their own audit records."

**Five questions a governance-ready deployment must answer:**
1. What actions did agent X take between T1 and T2?
2. Who authorized those actions and under what policy?
3. What data did the agent access or modify?
4. What did the action cost, and was it within the approved envelope?
5. Were any policy boundaries triggered and how resolved?

#### Layer 4: Human Oversight and Escalation

**Two HITL modes:**
- **Pre-authorization:** Certain actions require explicit human approval before execution
- **Post-execution review:** Actions execute immediately but are flagged for human review within a defined window, with automated rollback capability

**Escalation design:**
- Route to specific named individuals or on-call rotations (not generic Slack messages)
- Include full decision context (task, action, policy that blocked it)
- Carry a response deadline; unanswered escalations auto-deny (safe default) or page a secondary contact

### Cost Governance

Budget overruns are a governance failure, not a reliability problem. Each agent needs: maximum spend per task, per hour, and per day — enforced in the harness layer, not in API settings.

**Baseline approach:** Test costs per record ($0.08/record), set per-task limit at 2.5x baseline ($0.20), trigger cost anomaly alerts at 1.5x baseline.

### Multi-Agent System Governance

**Accountability principle:** "Every agent is accountable for its own actions, regardless of who instructed it." Each agent applies its own policy, charges its own cost envelope, and records its own audit trail.

**Trust boundary requirement:** "Inter-agent communication should be authenticated, and instructions that exceed the receiving agent's authorized action scope should be rejected with an audit record."

### Behavioral Drift & Compliance

- Treat model version changes like application deployments with the same quality gates
- Shadow mode: Route a percentage of real tasks to a new model version, capture outputs without executing tool calls
- Review agent system prompts and tool descriptions quarterly

### Implementation Sequence

| Phase | Timing | Action |
|-------|--------|--------|
| Phase 1 | Before first production task | Identity isolation, permission scoping, per-task cost limits, append-only audit logging |
| Phase 2 | Weeks 2-4 | PEP with deny rules for highest-impact actions; escalation routing |
| Phase 3 | Month 2 | Behavioral eval pipeline with shadow mode; cost anomaly alerting |
| Phase 4 | Ongoing | Multi-agent trust boundaries; drift monitoring; automated permission audits |

---

## V. Production AI Agent Deployment: The Complete Operations Guide

**URL:** /blog/production-ai-agent-deployment-the-complete-operations-guide/

### Operational Concerns

**Deployment:** Traditional deterministic deployment workflows fail. Teams must transition to statistical evaluation patterns due to stochastic agent behaviors, which lead to "ghost debugging" issues.

**Monitoring:** Conventional infrastructure metrics are insufficient. Operations must monitor:
- Task Completion Rate
- Token Consumption Per Task
- Tool Call Success Rate
- Context Utilization Efficiency
- Reasoning Trace Quality
- Mean Time to Human Escalation

**Scaling:** Stateless architectures support simple horizontal scaling. Stateful systems require a checkpoint-resume mechanism. Asynchronous event-driven queues handle high-throughput batching.

**Infrastructure (CI/CD Stack):** Five-layer operational stack: Compute, State Management, Observability, Cost Controls, Security Boundaries.

### 5-Gate Deployment Process

1. **Evaluation** — Testing the agent's baseline accuracy against diverse inputs in a staging environment.
2. **Shadow Mode** — Running the agent with production traffic without delivering its output to live users.
3. **Canary Deployment** — Route 5% of production traffic to the new agent, observe over 48 hours.
4. **Graduated Rollout** — Incrementally scale: 25% to 50% to 100%, verifying latency and costs.
5. **Post-Deployment Validation** — Sustained monitoring for a week to check for long-term behavioral changes or drift.

### Key Recommendations

- Safety guardrails: Focus on "better boundaries, not better agents"
- Cost circuit breaker: Hard limit of 4,000 tokens per request
- Semantic caching to avoid repeating identical queries
- Model tiering: Route basic duties to cheaper models
- Start "with a single agent" and scale up only when justified
- Checkpoint-resume recovery pipeline

---

## VI. AI Agents Just Went From Chatbots to Coworkers: What Engineering Teams Must Build Now

**URL:** /blog/ai-agents-just-went-from-chatbots-to-coworkers-what-engineering-teams-must-build-now/

### The Core Shift

Earlier chatbots followed a simple "one turn, one output, no side effects" pattern. Current agentic AI systems: "An agent receives a goal, not a prompt." Agents autonomously plan steps, call tools against live systems, evaluate results mid-execution, and persist until completion or budget exhaustion.

### Five Architectural Differences

1. **Autonomous multi-step execution** — Agents orchestrate long chains of interdependent steps.
2. **Persistent state across execution** — Multi-session tasks require durable checkpointing.
3. **Real-world tool side effects** — Unlike chatbot answers, agent actions like sending emails or submitting Terraform changes create irreversible damage.
4. **Cost exposure that scales with task complexity** — Agentic workflows can consume 100K-1M+ tokens per task vs. chatbot's 1K-10K.
5. **Non-deterministic behavior under rerun** — The same task may produce entirely different execution paths.

### What Breaks First

**Timeout models fail:** Agents often run minutes or hours, but web frameworks expect milliseconds-to-seconds. One team had a 45-second task triggering 30-second client timeouts, causing duplicate execution.

**Observability stacks can't handle non-deterministic chains:** Traditional tracing assumes predictable code paths. Debugging requires execution traces capturing not just what happened, but why each decision was made.

**Error handling misses partial failure:** Agents encounter partial success (steps 1-11 succeed, step 12 fails). The more dangerous pattern is "silent partial failure."

### Five Infrastructure Layers Required

1. **Checkpoint-Resume State Management** — One team reported "a 40% reduction in per-task token costs" after implementing this.
2. **Verification Loops at Tool Call Boundaries** — Teams report "task completion rate improvements of 10-20 percentage points."
3. **Cost Envelope Enforcement** — Hard token and cost limits at the workflow level.
4. **Structured Execution Traces** — A tree, not a linear log, because agents branch on success vs. failure.
5. **Human-in-the-Loop Escalation Paths** — A structured review queue with the full execution trace attached.

### Four-Stage Maturity Model

| Stage | Description |
|-------|-------------|
| Stage 1 | Successful demo in controlled environment — happy path works |
| Stage 2 | Quiet production failures — 70-80% completion rates blamed on "hallucinations" |
| Stage 3 | Production incident — runaway $800 API bill over a weekend |
| Stage 4 | Harness investment — checkpoint-resume, verification loops, cost envelopes, traces, escalation paths built; completion rates jump to 92-97% |

### Build Priority

1. Structured execution traces ("You cannot debug what you cannot see.")
2. Cost envelope enforcement
3. Verification loops
4. Checkpoint-resume state management
5. Human-in-the-loop escalation

### Final Stance

"The infrastructure gap between chatbot-era systems and what agentic workloads require is described as the primary obstacle between the current generation of promising agent demos and the reliable production deployments."

## VII. Lessons Learned from Deploying AI Agents in Production

**URL:** /blog/lessons-learned-from-deploying-ai-agents-in-production/

### Key Lessons

- Most production failures stem from the wrapping infrastructure (the harness) rather than the model itself. "The problem is almost never the prompt."
- External APIs frequently fail without throwing clear errors, causing the agent to proceed on corrupted assumptions. Implement post-call verification.
- Long, complex workflows often exceed context windows. Monitor token usage and implement checkpoint-resume.
- Standard application monitoring is insufficient. Need detailed execution traces.
- Infinite loops or broken retry policies can quickly drain budgets. Hard limits that terminate execution gracefully.
- Pre-launch QA is not enough. Ongoing evaluation pipelines grading real-world production data continuously.

---

*Nguồn: https://harness-engineering.ai/ — Tác giả: Kai Renner*
