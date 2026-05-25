# Bản đồ Chỉ mục Tri thức Harness Engineering (Knowledge Index)

Chào mừng bạn đến với Bản đồ mạng lưới thần kinh tri thức về Harness Engineering. Dưới đây là phân loại chi tiết các nốt nguyên tử theo chủ đề, danh mục và từ khóa (tags).

---

## 🗂️ Phân loại theo Danh mục (Categories)

### 1. Khung gá cốt lõi (Harness Core Concepts)
Các nguyên lý định hình nền tảng cấu trúc của một Harness dành cho AI Agent:
- [Định nghĩa Harness thực sự trong AI Agent Systems](02_atomic_nodes/HAE-concept-harness-definition.md) — Định nghĩa cơ bản về Harness và blast radius.
- [Repository là Nguồn Sự Thật Duy Nhất (System of Record)](02_atomic_nodes/HAE-concept-system-of-record.md) — Tại sao Git repository là nguồn sự thật thay vì chat.

### 2. Quản lý Nhận thức (Cognitive & Context Management)
Cách thiết kế môi trường giúp giảm tải áp lực ngữ cảnh, tránh Agent bị quá tải thông tin:
- [Tránh bẫy File Hướng Dẫn Khổng Lồ](02_atomic_nodes/HAE-concept-instruction-file-pitfall.md) — Bẫy dồn mọi quy tắc vào CLAUDE.md và giải pháp phân rã.
- [Bảo Toàn Tính Liên Tục Trong Tác Vụ Dài Hạn](02_atomic_nodes/HAE-concept-session-continuity.md) — Cơ chế checkpoints để bảo toàn bối cảnh dài lâu.

### 3. Kiến trúc Quy trình làm việc (Workflow Architecture)
Quy trình và phương pháp luận vận hành Agent một cách tuần tự, nghiêm ngặt:
- [Sự Cần Thiết Của Giai Đoạn Khởi Tạo (Plan Mode)](02_atomic_nodes/HAE-concept-initialization-phase.md) — Phân tách pha Plan Mode độc lập trước khi sửa code.
- [Danh Mục Tính Năng (Feature List)](02_atomic_nodes/HAE-concept-feature-list-primitive.md) — Dẫn dắt sự tập trung bằng Task List nguyên thủy.

### 4. Rào chắn An toàn (Guardrails & Safety)
Cơ chế bảo vệ mã nguồn, giới hạn tác động và dọn dẹp hệ thống:
- [Kiểm Sát Phạm Vi Ảnh Hưởng & Lỗi Tự Ý Sửa Code (Agent Overreach)](02_atomic_nodes/HAE-concept-agent-overreach.md) — Giới hạn phạm vi blast radius, cấm code dang dở.
- [Tính Quan Sát Thuộc Về Bên Trong Harness (Telemetry & Logs)](02_atomic_nodes/HAE-concept-internal-observability.md) — Khả năng tự theo dõi hành vi Agent.
- [Nguyên Lý Trạng Thế Sạch Sau Mỗi Phiên Làm Việc](02_atomic_nodes/HAE-concept-clean-state.md) — Dọn dẹp tài nguyên rác sau turn làm việc.

### 5. Xác thực & Đo lường chất lượng (Verification)
Cách chứng minh và bảo đảm code do Agent viết ra thực sự hoạt động chính xác:
- [Khắc Phục Hiện Tượng Tuyên Bố Thành Công Quá Sớm](02_atomic_nodes/HAE-concept-early-victory.md) — Ngăn ngừa tự mãn và cơ chế xác thực kép.
- [Kiểm Thử End-to-End (E2E) - Thước Đo Tối Hậu](02_atomic_nodes/HAE-concept-e2e-testing.md) — Sự lừa dối của Mocking và live testing.

### 6. Kiến trúc mở rộng: Harness Engineering Definition & Architecture (từ harness-engineering.ai)
Các nguyên lý và kiến trúc từ website của Kai Renner về Harness Engineering cho production AI Agents:
- [Harness Moat & 80% Factor](02_atomic_nodes/HAE-concept-harness-moat-factor80.md) — Định nghĩa Harness Engineering, phân biệt Model vs Harness, 80% Factor.
- [6 Lớp Kiến Trúc Harness](02_atomic_nodes/HAE-concept-six-harness-layers.md) — 6 layers: Context Engineering, Tool Orchestration, State & Memory, Verification, HITL, Lifecycle.
- [5 Nguyên Lý Cốt Lõi](02_atomic_nodes/HAE-concept-five-harness-principles.md) — Context Engineering, Tool Orchestration, Verification Loops, Cost Envelope, Observability.
- [3 Mô Hình Kiến Trúc Agent](02_atomic_nodes/HAE-concept-three-harness-patterns.md) — Single Agent + Verification, Two-Agent Supervisor, Multi-Agent Shared Harness.
- [Triển Khai Sản Xuất 5 Cổng](02_atomic_nodes/HAE-concept-five-stage-deployment.md) — Evaluation -> Shadow Mode -> Canary -> Rollout -> Validation.
- [Hệ Thống Quản Trị 4 Tầng](02_atomic_nodes/HAE-concept-four-governance-layers.md) — Identity, PEP, Audit Trail, HITL + Cost Governance.
- [Context-Switch Fatigue & Handoff Schema](02_atomic_nodes/HAE-concept-context-switch-fatigue-handoff.md) — Silent degradation trong multi-agent, Structured Handoff Schema.
- [Kiến Trúc Bộ Nhớ 3 Tầng](02_atomic_nodes/HAE-concept-three-tier-memory-architecture.md) — Ephemeral, Working, Archival và quy tắc routing.
- [Chỉ Số Đo Lường Hiệu Quả](02_atomic_nodes/HAE-concept-harness-quantified-metrics.md) — 83%->96%, 40-point diff, compounding failures, cost metrics.

### 7. Kiến trúc 9 Thành Phần Harness (Harness Architecture - 9 Components)
Bóc tách chi tiết 9 thành phần cốt lõi cấu thành một Harness hiện đại:

#### Nhóm Bắt Buộc (thiếu thì không còn là Harness)
- [Outer Loop - Trái Tim Của Mọi Harness](02_atomic_nodes/HAE-concept-outer-loop.md) — Nơi DUY NHẤT được phép gọi model.
- [Context Manager - Bộ Quản Lý Ngữ Cảnh](02_atomic_nodes/HAE-concept-context-manager.md) — Quản lý cửa sổ context 200K token.
  - [Compaction Strategy](02_atomic_nodes/HAE-concept-compaction-strategy.md) — Chiến lược nén: ngưỡng 18/4, tóm tắt bởi model.
  - [Token Budget](02_atomic_nodes/HAE-concept-token-budget.md) — Ngân sách token: 4000/file, 12000 tổng context động.

#### Nhóm Cấp Độ Trưởng Thành (càng đầy đủ Harness càng hoàn thiện)
- [Tool, Skill & Registry](02_atomic_nodes/HAE-concept-tool-skill-registry.md) — Bộ ba năng lực: primitive + workflow + điều phối.
  - [Tool vs Skill](02_atomic_nodes/HAE-concept-tool-vs-skill.md) — Sự khác biệt triết lý: phổ quát vs riêng project.
- [Sub-Agent](02_atomic_nodes/HAE-concept-sub-agent.md) — Ủy quyền tác vụ cô lập: Explore, General, Verify.
  - [Context Isolation](02_atomic_nodes/HAE-concept-context-isolation.md) — Nguyên tắc truyền context tối thiểu cho sub-agent.
- [Built-in Skills](02_atomic_nodes/HAE-concept-built-in-skills.md) — Kỹ năng tích hợp sẵn, tự kích hoạt khi cần.
- [Session Persistence](02_atomic_nodes/HAE-concept-session-persistence.md) — JSONL append-only, crash-safe, phục hồi từ điểm dừng.
- [Dynamic System Prompt](02_atomic_nodes/HAE-concept-dynamic-system-prompt.md) — Pipeline lắp ráp prompt từ static core + context động.
- [Lifecycle Hooks](02_atomic_nodes/HAE-concept-lifecycle-hooks.md) — 4 điểm can thiệp: PreTool, PostTool, OnError, OnCompaction.
  - [4 Loại Hook Chi Tiết](02_atomic_nodes/HAE-concept-four-hook-types.md) — Phân tích sâu từng hook và anti-pattern.
- [Permission & Safety](02_atomic_nodes/HAE-concept-permission-layers.md) — 3 mức: ReadOnly, UserSpace, Full.
  - [Dynamic Permission Classification](02_atomic_nodes/HAE-concept-dynamic-permission-classification.md) — Phân loại quyền động theo nội dung lệnh.

---

## 🏷️ Chỉ mục theo Thẻ (Tags Index)
- **#harness-definition**: [Harness Definition](02_atomic_nodes/HAE-concept-harness-definition.md)
- **#system-of-record**: [System of Record](02_atomic_nodes/HAE-concept-system-of-record.md)
- **#cognitive-load**: [Instruction File Pitfall](02_atomic_nodes/HAE-concept-instruction-file-pitfall.md)
- **#task-continuity**: [Session Continuity](02_atomic_nodes/HAE-concept-session-continuity.md)
- **#plan-mode**: [Initialization Phase](02_atomic_nodes/HAE-concept-initialization-phase.md)
- **#blast-radius**: [Agent Overreach](02_atomic_nodes/HAE-concept-agent-overreach.md), [Clean State](02_atomic_nodes/HAE-concept-clean-state.md)
- **#alignment**: [Feature List Primitive](02_atomic_nodes/HAE-concept-feature-list-primitive.md)
- **#verification-gate**: [Early Victory](02_atomic_nodes/HAE-concept-early-victory.md), [E2E Testing](02_atomic_nodes/HAE-concept-e2e-testing.md)
- **#telemetry**: [Internal Observability](02_atomic_nodes/HAE-concept-internal-observability.md)
- **#outer-loop**: [Outer Loop](02_atomic_nodes/HAE-concept-outer-loop.md)
- **#context-manager**: [Context Manager](02_atomic_nodes/HAE-concept-context-manager.md)
- **#compaction**: [Compaction Strategy](02_atomic_nodes/HAE-concept-compaction-strategy.md)
- **#token-budget**: [Token Budget](02_atomic_nodes/HAE-concept-token-budget.md)
- **#tool-registry**: [Tool Skill Registry](02_atomic_nodes/HAE-concept-tool-skill-registry.md), [Tool vs Skill](02_atomic_nodes/HAE-concept-tool-vs-skill.md)
- **#sub-agent**: [Sub-Agent](02_atomic_nodes/HAE-concept-sub-agent.md), [Context Isolation](02_atomic_nodes/HAE-concept-context-isolation.md)
- **#built-in-skills**: [Built-in Skills](02_atomic_nodes/HAE-concept-built-in-skills.md)
- **#session-persistence**: [Session Persistence](02_atomic_nodes/HAE-concept-session-persistence.md)
- **#dynamic-system-prompt**: [Dynamic System Prompt](02_atomic_nodes/HAE-concept-dynamic-system-prompt.md)
- **#lifecycle-hooks**: [Lifecycle Hooks](02_atomic_nodes/HAE-concept-lifecycle-hooks.md), [4 Hook Types](02_atomic_nodes/HAE-concept-four-hook-types.md)
- **#permission-layers**: [Permission Layers](02_atomic_nodes/HAE-concept-permission-layers.md), [Dynamic Classification](02_atomic_nodes/HAE-concept-dynamic-permission-classification.md)
- **#harness-moat**: [Harness Moat & 80% Factor](02_atomic_nodes/HAE-concept-harness-moat-factor80.md)
- **#harness-layers**: [6 Layers](02_atomic_nodes/HAE-concept-six-harness-layers.md)
- **#five-principles**: [5 Principles](02_atomic_nodes/HAE-concept-five-harness-principles.md)
- **#architecture-patterns**: [3 Patterns](02_atomic_nodes/HAE-concept-three-harness-patterns.md), [Sub-Agent](02_atomic_nodes/HAE-concept-sub-agent.md)
- **#deployment**: [5 Stage Deployment](02_atomic_nodes/HAE-concept-five-stage-deployment.md)
- **#governance**: [4 Governance Layers](02_atomic_nodes/HAE-concept-four-governance-layers.md)
- **#context-switch-fatigue**: [Context-Switch Fatigue & Handoff](02_atomic_nodes/HAE-concept-context-switch-fatigue-handoff.md)
- **#memory**: [3 Tier Memory](02_atomic_nodes/HAE-concept-three-tier-memory-architecture.md), [Session Persistence](02_atomic_nodes/HAE-concept-session-persistence.md)
- **#metrics**: [Quantified Metrics](02_atomic_nodes/HAE-concept-harness-quantified-metrics.md)
