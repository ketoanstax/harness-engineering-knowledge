---
id: 202605241200-harness-engineering-manifesto
aliases:
  - "Distilled: Tuyên ngôn Harness Engineering"
tags:
  - distilled
  - insight
  - harness-engineering
  - system-design
date: 2026-05-24
---

# Tuyên Ngôn Kỹ Nghệ Thiết Kế Harness Cho AI Agents (The Harness Engineering Manifesto)

## 💡 Đúc kết & Suy ngẫm Cá nhân (My Thoughts & Synthesis)

Sự trỗi dậy của các Mô hình Ngôn ngữ Lớn (LLMs) thế hệ mới đã mở ra kỷ nguyên của các AI Coding Agents cực kỳ mạnh mẽ. Tuy nhiên, một nghịch lý lớn đã xảy ra: **Tại sao các Agent có năng lực tư duy vượt trội vẫn liên tục thất bại khi đối mặt với các dự án phần mềm thực tế?**

Câu trả lời của chúng tôi không nằm ở việc cố gắng tinh chỉnh các câu lệnh thô (Prompt Engineering), mà nằm ở việc thiết kế **Hệ Thống Môi Trường Bao Quanh Agent (Harness Engineering)**.

### 1. Sự dịch chuyển từ Prompt Engineering sang Harness Engineering
- **Prompt Engineering** coi Agent như một thực thể đơn lẻ hoạt động trong chân không, cố gắng nhồi nhét mọi thứ vào một câu lệnh. Đây là một cách tiếp cận thất bại vì nó dẫn tới quá tải nhận thức của Agent.
- **Harness Engineering** coi Agent như một động cơ mạnh mẽ cần được đặt vào một bộ khung giá đỡ vững chắc (Harness). Harness định hình ranh giới hoạt động an toàn (Blast Radius), cung cấp các neo phản hồi trực quan (Feedback Loops) và thiết lập nguồn sự thật duy nhất (System of Record) để Agent tự do hoạt động mà không gây hư hại hệ thống.

### 2. Ba Trụ Cột Tối Thượng của một Harness Đích Thực

Để một AI Agent có thể pair-programming thành công như một đồng nghiệp chuyên gia cấp cao, Harness bao quanh nó phải được thiết kế dựa trên ba trụ cột:

#### Trụ cột 1: Quy tắc Nghiêm Ngặt (RULE)
Agent hoạt động dựa trên các quy định được văn bản hóa trực tiếp trong repository.
- Bắt buộc phân tách quy trình: Pha Khởi tạo/Lập kế hoạch (**Plan Mode**) phải diễn ra trước pha Viết code (**Write/Edit**). Điều này giúp Agent thấu hiểu kiến trúc hiện tại, tránh viết code rác.
- Giới hạn blast radius chặt chẽ để bảo toàn tính toàn vẹn hệ thống.

#### Trụ cột 2: Kỹ năng Workflow Chuyên Sâu (SKILL)
Phân rã các nhiệm vụ phức tạp thành các workflow chuyên môn hóa (Analyzer, Writer, Auditor).
- Sử dụng Feature List nguyên thủy như một neo giữ bối cảnh hoạt động. Tại một thời điểm, Agent chỉ được phép làm đúng một task `in_progress` duy nhất.
- Ngăn ngừa hiện tượng tuyên bố thành công sớm bằng quy trình xác thực kép và kiểm thử **E2E / Live Testing**.

#### Trụ cột 3: Bộ Nhớ Bền Vững & Tự Đồng Bộ (MEMORY & Closed Feedback Loop)
Agent không được phép bị mất bối cảnh hoặc lặp lại sai lầm cũ.
- Thiết lập hệ thống lưu checkpoint khi tác vụ chạy dài để tự động khôi phục bối cảnh.
- Tạo cơ chế tự động đồng bộ hóa quy tắc: Khi người dùng đưa ra phản hồi, Agent tự ghi nhận và cập nhật lại hiến pháp `CLAUDE.md` của hệ thống để tiến hóa không ngừng.

---

## 🔗 Bản đồ Liên kết Tri thức (Knowledge Connections Map)

Dưới đây là sơ đồ mạng lưới liên kết tới 11 nốt nguyên tử Harness Engineering giúp bạn dễ dàng duyệt qua toàn Vault trên Obsidian Graph View:

### Nền tảng cấu trúc:
- [HAE Harness Definition](02_atomic_nodes/HAE-concept-harness-definition.md) — Bản chất và vai trò thực sự của một Harness.
- [HAE System of Record](02_atomic_nodes/HAE-concept-system-of-record.md) — Repository là nguồn sự thật thay vì chat.

### Kiểm soát nhận thức & Tiến trình:
- [HAE Instruction File Pitfall](02_atomic_nodes/HAE-concept-instruction-file-pitfall.md) — Tránh bẫy file CLAUDE.md khổng lồ làm loãng context.
- [HAE Session Continuity](02_atomic_nodes/HAE-concept-session-continuity.md) — Lưu giữ bối cảnh khi chạy tác vụ dài.
- [HAE Feature List Primitive](02_atomic_nodes/HAE-concept-feature-list-primitive.md) — Neo giữ sự tập trung của Agent.

### Quy trình & An toàn:
- [HAE Initialization Phase](02_atomic_nodes/HAE-concept-initialization-phase.md) — Sự cần thiết của pha tìm hiểu và lập kế hoạch (Plan Mode).
- [HAE Agent Overreach](02_atomic_nodes/HAE-concept-agent-overreach.md) — Hạn chế blast radius và loại bỏ code dang dở.
- [HAE Internal Observability](02_atomic_nodes/HAE-concept-internal-observability.md) — Khả năng tự quan sát hoạt động Agent.
- [HAE Clean State](02_atomic_nodes/HAE-concept-clean-state.md) — Giữ vệ sinh môi trường sạch sẽ sau mỗi phiên làm việc.

### Xác thực & Chất lượng:
- [HAE Early Victory](02_atomic_nodes/HAE-concept-early-victory.md) — Chốt chặn chống tuyên bố thành công sớm của Agent.
- [HAE E2E Testing](02_atomic_nodes/HAE-concept-e2e-testing.md) — Thước đo thực tế tối hậu thay thế dữ liệu Mocking ảo.

### 9 Thành Phần Kiến Trúc Harness Hiện Đại (Từ nguồn Video Transcript):

#### Bắt buộc — Thiếu thì không còn là Harness:
- [Outer Loop](02_atomic_nodes/HAE-concept-outer-loop.md) — Trái tim: nơi DUY NHẤT gọi model.
- [Context Manager](02_atomic_nodes/HAE-concept-context-manager.md) — Quản lý cửa sổ context 200K token.
  - [Compaction Strategy](02_atomic_nodes/HAE-concept-compaction-strategy.md) — Ngưỡng 18/4, tóm tắt bởi model.
  - [Token Budget](02_atomic_nodes/HAE-concept-token-budget.md) — 4000 token/file, 12000 tổng.

#### Cấp độ trưởng thành — Càng đầy đủ Harness càng hoàn thiện:
- [Tool, Skill & Registry](02_atomic_nodes/HAE-concept-tool-skill-registry.md) — Bộ ba: primitive + workflow + điều phối.
  - [Tool vs Skill](02_atomic_nodes/HAE-concept-tool-vs-skill.md) — Phổ quát vs riêng project.
- [Sub-Agent](02_atomic_nodes/HAE-concept-sub-agent.md) — Ủy quyền cô lập: Explore, General, Verify.
  - [Context Isolation](02_atomic_nodes/HAE-concept-context-isolation.md) — Truyền context tối thiểu.
- [Built-in Skills](02_atomic_nodes/HAE-concept-built-in-skills.md) — Tự kích hoạt khi cần (PDF, Excel, Web).
- [Session Persistence](02_atomic_nodes/HAE-concept-session-persistence.md) — JSONL append-only, crash-safe.
- [Dynamic System Prompt](02_atomic_nodes/HAE-concept-dynamic-system-prompt.md) — Pipeline lắp ráp prompt động.
- [Lifecycle Hooks](02_atomic_nodes/HAE-concept-lifecycle-hooks.md) — 4 hook: PreTool, PostTool, OnError, OnCompaction.
  - [4 Loại Hook Chi Tiết](02_atomic_nodes/HAE-concept-four-hook-types.md)
- [Permission & Safety](02_atomic_nodes/HAE-concept-permission-layers.md) — 3 mức: ReadOnly, UserSpace, Full.
  - [Dynamic Permission Classification](02_atomic_nodes/HAE-concept-dynamic-permission-classification.md) — Phân loại theo nội dung lệnh.

### Tri thức Mở Rộng từ harness-engineering.ai (Kai Renner):
- [Harness Moat & 80% Factor](02_atomic_nodes/HAE-concept-harness-moat-factor80.md) — Harness quyết định 80% độ tin cậy trong production.
- [6 Lớp Kiến Trúc Harness](02_atomic_nodes/HAE-concept-six-harness-layers.md) — Cấu trúc 6 layer của một Harness sản xuất.
- [5 Nguyên Lý Cốt Lõi](02_atomic_nodes/HAE-concept-five-harness-principles.md) — 5 nguyên lý vận hành kỹ thuật Harness.
- [3 Mô Hình Kiến Trúc Agent](02_atomic_nodes/HAE-concept-three-harness-patterns.md) — Single Agent, Two-Agent Supervisor, Multi-Agent.
- [Triển Khai Sản Xuất 5 Cổng](02_atomic_nodes/HAE-concept-five-stage-deployment.md) — Quy trình 5-Gate deployment an toàn.
- [Hệ Thống Quản Trị 4 Tầng](02_atomic_nodes/HAE-concept-four-governance-layers.md) — Stack quản trị Identity -> PEP -> Audit -> HITL.
- [Context-Switch Fatigue & Handoff Schema](02_atomic_nodes/HAE-concept-context-switch-fatigue-handoff.md) — Silent degradation trong multi-agent.
- [Kiến Trúc Bộ Nhớ 3 Tầng](02_atomic_nodes/HAE-concept-three-tier-memory-architecture.md) — Phân tầng Ephemeral, Working, Archival.
- [Chỉ Số Đo Lường Hiệu Quả](02_atomic_nodes/HAE-concept-harness-quantified-metrics.md) — Tổng hợp metrics định lượng.
- [Báo cáo Tổng hợp harness-engineering.ai](04_distilled/harness-engineering-ai-report.md) — Report chi tiết bằng tiếng Việt.

---

## 🧠 Luận Điểm Tối Thượng: Harness vs Framework

> **"Framework được viết cho lập trình viên dùng. Harness được viết cho AI dùng."**

| Tiêu chí | Framework | Harness |
|----------|-----------|---------|
| Đối tượng sử dụng | Lập trình viên | AI Agent |
| Vai trò | Bạn lái | Nó lái bạn |
| Cách lắp ráp | Hàng nghìn cách | Một con đường định hướng cao |
| Permission | Không có | Phân tầng theo rủi ro |
| Đọc gì | Code | Context |
| Ví dụ | LangChain, LangGraph, AutoGen, CrewAI | Claude Code, Cursor, Devin, Aider |
