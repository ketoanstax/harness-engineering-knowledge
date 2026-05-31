Please build a production-ready, highly interactive 2D Knowledge Graph Web Application with a premium Sci-Fi/Cyberpunk dark aesthetic. The application is inspired by Obsidian's Graph View and the concepts of "Harness Engineering" (AI system safety and guardrails).

The app must be extremely polished, fully responsive, and feature smooth animations.

---

### 1. TECH STACK & LIBRARIES TO INSTALL
Please set up a React (Vite) application with Tailwind CSS and install:
- `react-force-graph-2d` (highly optimized HTML5 Canvas for graph rendering)
- `react-markdown` (to render beautiful formatted note contents in the sidebar)
- `lucide-react` (for modern tech-style UI icons)
- `canvas-confetti` (for a small Easter egg when a user explores all nodes)

---

### 2. UI LAYOUT & DESIGN SPECIFICATION (DARK CYBERPUNK THEME)
- **Global Theme**: Pure dark mode background (`#080B11` to `#0F131E`), text colors in slate-100/300, and glowing neon accents.
- **Glassmorphism Panels**: UI cards and panels must use backdrop-blur, border-slate-800/50, and subtle neon glows.
- **Responsive Layout**:
  - **Left Area (70% width)**: The main interactive 2D canvas showing the network.
    - Include a floating **Control Overlay**: Zoom In (+), Zoom Out (-), Fit to Screen, Toggle Physics, and Show/Hide Labels.
  - **Right Sidebar (30% width)**: Sliding drawer panel (with smooth CSS transitions). If no node is selected, show a beautiful dashboard detailing "Harness Engineering Statistics" (e.g., Total Nodes, Total Connections, Centralized Hubs). When a node is clicked, show its rich-text details.

---

### 3. INTERACTIVE KNOWLEDGE GRAPH BEHAVIOR
- **Visuals**:
  - **Nodes**: Draw nodes as beautiful glowing spheres.
    - **Color Coded by Category**:
      - *Harness Core Concepts*: Neon Cyan (`#00E5FF`)
      - *Cognitive Management*: Neon Purple (`#A020F0`)
      - *Workflow Architecture*: Neon Yellow (`#FFD700`)
      - *Guardrails & Safety*: Neon Orange (`#FF6B35`)
      - *Verification*: Neon Emerald Green (`#00F5D4`)
    - **Size**: Proportional to the number of incoming/outgoing connections (node degree).
  - **Edges**: Drawn as curved semi-transparent arrows. Glowing dashed lines for active relationships.
  - **Hover State**: Hovering on a node highlights that node and its immediate neighbors (1-hop connections) while fading all other nodes into a dark grey opacity (0.1). Display a neat, futuristic holographic tooltip with the node's title, category, and tags.
- **Physics Engine Tuning**:
  - Apply `d3-force` parameters inside the component:
    - Distance force: `120px` (to prevent overlapping).
    - Charge strength: `-180` (to give natural spacing).
    - Center force: active to keep the graph centered on canvas resize.
- **Active Navigation (Pan & Zoom)**:
  - When a user clicks a node on the graph, or clicks an interactive wiki-link inside the sidebar, invoke `fgRef.current.centerAt(node.x, node.y, 800)` and `fgRef.current.zoom(2.5, 800)` for a smooth, high-fidelity camera transition.

---

### 4. RICH RIGHT SIDEBAR CONTENT REQUIREMENTS
When a node is selected, parse and render its content using `react-markdown`. The layout inside the sidebar must be structured as follows:
1. **Header**: Glowing title, Category badge (color-coded), and tag pills.
2. **Definition**: Under `## 💡 Core Definition` rendered in a distinct glowing callout box.
3. **Principles**: Render interactive bullet points under `## ⚙️ Technical Principles`.
4. **Causal Web (Interactive Wiki-Links)**: 
   - Instead of static text, map relationships (`parent`, `children`, `causalCore`, `supportingConditions`, `derivativeEffects`) to **clickable futuristic action buttons**.
   - Clicking any button must smoothly pan the graph to that related node, select it, and update the sidebar content without reloading.

---

### 5. RICH MOCK DATABASE (15 LOAD-BEARING NODES)
Initialize the application state with this precise JSON dataset mapping "Harness Engineering" rules:

```json
{
  "nodes": [
    {
      "id": "harness-definition",
      "title": "Harness Definition in AI",
      "category": "Harness Core Concepts",
      "tags": ["harness-definition", "system-design", "agent-safety"],
      "content": "# Harness Definition in AI Systems\n\n## 💡 Core Definition\nA Harness (Khung gá lắp) is not a static prompt. **It is the dynamic physical and computational arena built around the AI Agent, allowing it to run fully autonomously and safely without constant human surveillance.**\n\n## ⚙️ Technical Principles\n- **Cognitive Scaffold:** Surrounds LLMs with dynamic tools to guard context boundaries.\n- **Blast Radius Control:** Restricts file modifications to strict user-approved sandboxes.\n- **Feedback Loops:** Feeds back compile, test, and console errors to the Agent automatically."
    },
    {
      "id": "system-of-record",
      "title": "Repository as System of Record",
      "category": "Harness Core Concepts",
      "tags": ["system-of-record", "git-truth", "context"],
      "content": "# Repository as Nuyên Nguồn Sự Thật Duy Nhất\n\n## 💡 Core Definition\nChat history is ephemeral and easily lost. The project's Git Repository must serve as the permanent, single source of truth (System of Record) for both humans and AI Agents.\n\n## ⚙️ Technical Principles\n- **Self-explaining structure:** Place codebase rules directly into files (like CLAUDE.md).\n- **Workspace as Context:** The filesystem state is the ground truth.\n- **Auto-initialization:** The Agent scans the repo on boot to instantly inherit the context."
    },
    {
      "id": "instruction-file-pitfall",
      "title": "Instruction File Pitfall",
      "category": "Cognitive Management",
      "tags": ["claudemd-pitfall", "cognitive-load"],
      "content": "# Tránh bẫy File Hướng Dẫn Khổng Lồ\n\n## 💡 Core Definition\nDumping all instructions into a single file (like a bloated CLAUDE.md) causes severe cognitive overload, making the Agent drop vital rules.\n\n## ⚙️ Technical Principles\n- **Cognitive Budget:** Agent performance degrades when context is cluttered.\n- **Atomic Splitting:** Split rules into smaller `.agent/` guides.\n- **Routing Tables:** Keep the main hiến pháp light; route details dynamically."
    },
    {
      "id": "session-continuity",
      "title": "Long-running Session Continuity",
      "category": "Cognitive Management",
      "tags": ["task-continuity", "state-loss", "checkpoints"],
      "content": "# Session Continuity in Long Tasks\n\n## 💡 Core Definition\nMulti-hour tasks fail because the Agent suffers memory drift or crashes. Persistent disk checkpoints preserve state.\n\n## ⚙️ Technical Principles\n- **Disk Checkpoints:** Save current code diffs, logs, and sub-goals to local files.\n- **Self-Recovery:** Upon startup, the Agent immediately reads the checkpoint file.\n- **Dynamic Checklist:** Auto-maintain a real-time progress checklist to prevent distraction."
    },
    {
      "id": "initialization-phase",
      "title": "Plan Mode (Initialization Phase)",
      "category": "Workflow Architecture",
      "tags": ["plan-mode", "initialization", "safety"],
      "content": "# Giai Đoạn Khởi Tạo (Plan Mode)\n\n## 💡 Core Definition\nForcing an Agent to write code before planning guarantees regression. Plan Mode is a strictly enforced read-only design phase.\n\n## ⚙️ Technical Principles\n- **Read-Only Investigation:** First 1-3 turns are locked to code exploration.\n- **Plan Documentation:** Agent must write a step-by-step implementation plan.\n- **Human Gatekeeper:** Edit tools are locked until the human approves the plan."
    },
    {
      "id": "feature-list-primitive",
      "title": "Feature List Primitive",
      "category": "Workflow Architecture",
      "tags": ["feature-list", "task-tracking", "alignment"],
      "content": "# Feature List Primitive\n\n## 💡 Core Definition\nThe Feature List acts as the grounding anchor between Human and Agent, enforcing absolute focus on one unit of work at a time.\n\n## ⚙️ Technical Principles\n- **Single Task Constraint:** Exactly one task can be `in_progress` at any time.\n- **Actionable Forms:** Tasks must have two states: command (imperative) and continuous execution.\n- **Real-Time Synchrony:** Prevents the Agent from straying off-scope."
    },
    {
      "id": "agent-overreach",
      "title": "Agent Overreach Safeguard",
      "category": "Guardrails & Safety",
      "tags": ["agent-overreach", "blast-radius", "code-integrity"],
      "content": "# Agent Overreach & Under-finish Safeguard\n\n## 💡 Core Definition\nPrevents the Agent from performing unsolicited code refactoring or committing half-finished code with empty TODO comments.\n\n## ⚙️ Technical Principles\n- **Strict Scope Boundaries:** Locks editing permissions to specific directories.\n- **Zero-Tolerance for TODOs:** Denies commits if the Agent leaves empty functions or incomplete comment lines.\n- **Targeted Modifications:** Edits must be pinpointed, keeping git diffs exceptionally clean."
    },
    {
      "id": "internal-observability",
      "title": "Telemetry & Observability",
      "category": "Guardrails & Safety",
      "tags": ["telemetry", "observability", "debugging"],
      "content": "# Telemetry & Observability\n\n## 💡 Core Definition\nThe Agent's process cannot be a black box. Deep logging and telemetry must reside inside the Harness.\n\n## ⚙️ Technical Principles\n- **Shell Logging:** Automatically records all shell activity.\n- **Token & Cost Metrics:** Tracks tokens and tool costs per turn to detect infinite loops.\n- **Glass Box design:** Allows the human to view and halt operations instantly."
    },
    {
      "id": "clean-state",
      "title": "Post-session Clean State",
      "category": "Guardrails & Safety",
      "tags": ["clean-state", "hygiene", "reproducibility"],
      "content": "# Post-session Clean State\n\n## 💡 Core Definition\nEvery completed session must leave the workspace clean. Residual temp files and hanging backend processes must be terminated.\n\n## ⚙️ Technical Principles\n- **Hanging Process Cleanup:** Kills background servers and test runners automatically.\n- **Git Hygiene:** Cleans up debug files and log artifacts before final commit.\n- **Reproducibility:** Ensures the next session boots on an untainted, predictable state."
    },
    {
      "id": "early-victory",
      "title": "Early Victory Prevention",
      "category": "Verification",
      "tags": ["early-victory", "false-positives", "verification-gate"],
      "content": "# Khắc Phục Hiện Tượng Tuyên Bố Thành Công Quá Sớm\n\n## 💡 Core Definition\nAgents often declare a feature complete the moment they finish coding, without verification. Enforce strict gates.\n\n## ⚙️ Technical Principles\n- **Separate Phases:** Coding and Verification are separate steps.\n- **Evidence Requirement:** Theoretical claims of success are rejected without logs.\n- **Verification Loops:** Enforce testing suites and browser check before delivery."
    },
    {
      "id": "e2e-testing",
      "title": "End-to-End Testing Loop",
      "category": "Verification",
      "tags": ["e2e-testing", "code-correctness", "automated-tests"],
      "content": "# E2E Testing - Thước Đo Tối Hậu\n\n## 💡 Core Definition\nUnit tests with mock data are easily fooled by Agents. Live E2E testing on actual environments is the ultimate measure of success.\n\n## ⚙️ Technical Principles\n- **The Mocking Trap:** Agents will modify mocks to pass tests rather than fixing the real bug.\n- **Live App Validation:** Agent must launch the server and interact with the UI to observe real behavior.\n- **Regression Shield:** E2E test suite acts as an automated gatekeeper."
    },
    {
      "id": "outer-loop",
      "title": "The Outer Loop",
      "category": "Harness Core Concepts",
      "tags": ["outer-loop", "architecture", "execution"],
      "content": "# Outer Loop - Trái Tim Của Mọi Harness\n\n## 💡 Core Definition\nThe Outer Loop is the orchestrator. It is the only place allowed to call the LLM, managing tool calls, errors, and agent termination.\n\n## ⚙️ Technical Principles\n- **Orchestration Lock:** Standardizes how queries are sent and received.\n- **Graceful Failures:** Intercepts crashes and converts them into prompts for self-repair.\n- **Compaction Trigger:** Triggers prompt compression when approaching token thresholds."
    },
    {
      "id": "context-manager",
      "title": "Context Manager",
      "category": "Cognitive Management",
      "tags": ["context-manager", "memory", "tokens"],
      "content": "# Context Manager - Bộ Quản Lý Ngữ Cảnh\n\n## 💡 Core Definition\nActively prunes, organizes, and structures the agent's context window (e.g. 200k tokens) to retain important facts while shedding noise.\n\n## ⚙️ Technical Principles\n- **Dynamic Compression:** Prunes long logs and keeps essential structural metadata.\n- **Token Budgets:** Restricts maximum tokens allowed per file read.\n- **Recall Prompts:** Periodically summarizes active sub-goals."
    },
    {
      "id": "lifecycle-hooks",
      "title": "Lifecycle Hooks",
      "category": "Workflow Architecture",
      "tags": ["lifecycle-hooks", "interception", "events"],
      "content": "# Lifecycle Hooks in Harness\n\n## 💡 Core Definition\nProvides 4 critical hook injection points: Pre-Tool-Call, Post-Tool-Call, On-Error, and On-Compaction to control agent activity.\n\n## ⚙️ Technical Principles\n- **Pre-Tool Interception:** Intercepts commands to perform security screening.\n- **Error Handlers:** Catch terminal API errors and try dynamic retries.\n- **Compaction Hook:** Safely serializes conversational state before pruning."
    },
    {
      "id": "permission-layers",
      "title": "Multi-tier Permission Layers",
      "category": "Guardrails & Safety",
      "tags": ["permission-layers", "security", "authorization"],
      "content": "# Multi-tier Permission Layers\n\n## 💡 Core Definition\nImplements rigid privilege tiers (Read-Only, User-Space, Full-Access) to isolate agents from critical infrastructure.\n\n## ⚙️ Technical Principles\n- **Privilege Escalation Gate:** Full system execution triggers a Human-in-the-Loop prompt.\n- **Read Isolation:** Denies access to system environment secrets.\n- **Dynamic Shell Parsing:** Parses and blocks risky shell operations (`rm -rf`, `sudo`)."
    }
  ],
  "links": [
    { "source": "harness-definition", "target": "system-of-record", "type": "supporting" },
    { "source": "harness-definition", "target": "agent-overreach", "type": "supporting" },
    { "source": "harness-definition", "target": "outer-loop", "type": "supporting" },
    { "source": "system-of-record", "target": "instruction-file-pitfall", "type": "supporting" },
    { "source": "instruction-file-pitfall", "target": "context-manager", "type": "derivative" },
    { "source": "initialization-phase", "target": "agent-overreach", "type": "causal" },
    { "source": "initialization-phase", "target": "feature-list-primitive", "type": "supporting" },
    { "source": "feature-list-primitive", "target": "session-continuity", "type": "supporting" },
    { "source": "session-continuity", "target": "context-manager", "type": "supporting" },
    { "source": "agent-overreach", "target": "clean-state", "type": "supporting" },
    { "source": "agent-overreach", "target": "permission-layers", "type": "causal" },
    { "source": "internal-observability", "target": "clean-state", "type": "supporting" },
    { "source": "early-victory", "target": "e2e-testing", "type": "causal" },
    { "source": "e2e-testing", "target": "harness-definition", "type": "derivative" },
    { "source": "lifecycle-hooks", "target": "outer-loop", "type": "supporting" },
    { "source": "permission-layers", "target": "lifecycle-hooks", "type": "supporting" }
  ]
}
```
---

### 6. EXTENDED FEATURES TO IMPLEMENT (FOR MAXIMUM POLISH)
1. **Real-time Autocomplete Search Bar**: Located in the top bar. Users can type to search for nodes. Selecting a search result must pan and zoom the graph directly to the node and load the sidebar details.
2. **Category Filter Badges**: Clicking on a Category Badge (e.g. Guardrails & Safety) toggles the visibility or dims the nodes of other categories on the graph view.
3. **Harness Stats Dashboard (Default Sidebar State)**: When no node is clicked (or upon clicking the "Reset View" button), the Sidebar should show a gorgeously rendered HUD (Heads-Up Display) detailing:
    -   **Total Concepts**: 15 Nodes
    -   **Active Connections**: 16 Edges
    -   **Most Connected Hub**: "Harness Definition in AI" & "Agent Overreach Safeguard"
    -   **Instructions to navigate**: "Drag to pan, Scroll to zoom, Hover to highlight connections, Click to open details".
4. **Smooth Transitions & Clean CSS**: Use Tailwind animations for glowing neon effects.

Please write clean, modular React components, separate the database JSON into a data.json file, and implement elegant styling. Make it look like a high-end SaaS product page for AI security!



---

### End-of-turn Summary
- Tôi đã tối ưu hóa và cung cấp bản Prompt tuyệt đỉnh dành cho **Replit Agent** (có chứa thông số vật lý Graph, logic camera panning, giao diện Cyberpunk và bộ dữ liệu lớn gồm 15 nốt thực tế).
- Bạn chỉ cần copy bản Prompt ở **Phần 2** dán trực tiếp vào Replit Agent để nhận về trang web Knowledge Graph 2D hoàn hảo.
- Chúc bạn có trải nghiệm tuyệt vời với Replit Web App! Mọi thứ đã sẵn sàng để triển khai!