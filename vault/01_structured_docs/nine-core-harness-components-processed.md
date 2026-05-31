---
id: nine-core-harness-components-processed
title: "9 Thành Phần Lõi Của Một Harness Hiện Đại - Bản Chắt Lọc"
source: nine-core-harness-components
date: 2026-05-24
status: processed
tags:
  - harness-architecture
  - nine-components
  - harness-vs-framework
---

# 9 Thành Phần Lõi Của Một Harness Hiện Đại - Bản Chắt Lọc

## Tóm tắt Tổng quan
Video transcript giải thích Harness Engineer là một nghề mới nổi trong kỷ nguyên AI Agent (2026). Nội dung bóc tách 9 thành phần cốt lõi cấu thành một Harness hiện đại, phân biệt rõ ràng Harness vs Framework, và trình bày cách tự xây dựng Harness thuần Python không phụ thuộc framework bên ngoài.

## Luận điểm Trung tâm
**"Framework được viết cho lập trình viên dùng. Harness được viết cho AI dùng."**

Harness không phải là một thư viện hay framework mà là một sản phẩm hoàn chỉnh bao quanh AI Agent, cho phép Agent tự cấu hình, tự chạy, tự duy trì phiên làm việc dài mà không cần người ngồi canh.

## 4 Nhiệm vụ Cốt Lõi Của Harness
1. Giữ Agent chạy được lâu, không sụp đổ sau 20 turn
2. Giữ Agent nhớ mọi thứ nó đã làm dù chạy 4 giờ liền
3. Giữ Agent không phá hệ thống (không xóa nhầm file, không push lên main)
4. Giữ Agent biết khi nào nên dừng lại hỏi người, khi nào tự quyết

## Bản Đồ 9 Thành Phần

### Nhóm Bắt Buộc (2 thành phần - thiếu thì không còn là Harness)
| # | Thành phần | Mô tả cốt lõi | Nốt nguyên tử |
|---|-----------|---------------|---------------|
| 1 | **Outer Loop** | Vòng lặp trung tâm duy nhất được phép gọi model. Mọi thành phần khác phục vụ vòng lặp này. | [Outer Loop](02_atomic_nodes/HAE-concept-outer-loop.md) |
| 2 | **Context Manager** | Quản lý cửa sổ context có hạn (200K token) bằng 3 chiến lược: giữ, tóm tắt, loại bỏ. | [Context Manager](02_atomic_nodes/HAE-concept-context-manager.md) |

### Nhóm Cấp Độ Trưởng Thành (7 thành phần - càng đầy đủ Harness càng hoàn thiện)
| # | Thành phần | Mô tả cốt lõi | Nốt nguyên tử |
|---|-----------|---------------|---------------|
| 3 | **Tool, Skill & Registry** | Tool là primitive phổ quát, Skill là hướng dẫn riêng project, Registry điều phối ở giữa. | [Tool Skill Registry](02_atomic_nodes/HAE-concept-tool-skill-registry.md) |
| 4 | **Sub-Agent** | Agent con nhận task cô lập, context tối thiểu, permission riêng. 3 kiểu: Explore, General, Verify. | [Sub-Agent](02_atomic_nodes/HAE-concept-sub-agent.md) |
| 5 | **Built-in Skills** | Kỹ năng đóng gói sẵn, Agent tự kích hoạt khi cần (PDF, Excel, Web, Image). | [Built-in Skills](02_atomic_nodes/HAE-concept-built-in-skills.md) |
| 6 | **Session Persistence** | Lưu mọi sự kiện ra file JSONL theo kiểu append-only. Crash-safe, phục hồi đúng điểm dừng. | [Session Persistence](02_atomic_nodes/HAE-concept-session-persistence.md) |
| 7 | **Dynamic System Prompt** | System prompt là pipeline lắp ráp từ static core + context động (CLAUDE.md, .agent/ files). | [Dynamic System Prompt](02_atomic_nodes/HAE-concept-dynamic-system-prompt.md) |
| 8 | **Lifecycle Hooks** | 4 hook: PreToolCall, PostToolCall, OnError, OnCompaction. Cài vào khoảng giữa các bước. | [Lifecycle Hooks](02_atomic_nodes/HAE-concept-lifecycle-hooks.md) |
| 9 | **Permission & Safety** | 3 mức phân quyền: ReadOnly, UserSpace, Full. Phân loại động theo nội dung lệnh, không theo tên tool. | [Permission Layers](02_atomic_nodes/HAE-concept-permission-layers.md) |

## Key Takeaways
1. **Harness vs Framework**: Harness là sản phẩm hoàn chỉnh cho AI tự hành. Framework là thư viện cho lập trình viên lắp ráp. Vai trò đảo ngược hoàn toàn.
2. **Outer Loop là trái tim**: Là nơi DUY NHẤT được phép gọi model. Mọi thành phần khác tồn tại để phục vụ vòng lặp này.
3. **Context Manager phân biệt Junior vs Senior**: Quyết định sai → context đầy đúng lúc Agent đang debug lỗi quan trọng. Quyết đúng → Agent chạy 8 tiếng vẫn tỉnh táo.
4. **Tool vs Skill vs Registry**: Tool là viên gạch phổ quát. Skill là bản vẽ riêng project. Registry điều phối.
5. **Sub-Agent phải nhận context tối thiểu**: Truyền toàn bộ context → sub-agent quá tải ngay từ đầu.
6. **Session persistence dùng JSONL append-only**: Crash-safe, phục hồi từ đúng điểm dừng.
7. **System prompt không phải chuỗi cố định**: Là pipeline lắp ráp động từ nhiều nguồn.
8. **Permission phân loại theo nội dung lệnh**: `ls` → ReadOnly, `rm` → Full. Cùng tool Bash nhưng mức khác nhau.

## Keywords
`outer-loop`, `context-manager`, `compaction`, `token-budget`, `tool-registry`, `skill`, `sub-agent`, `built-in-skills`, `session-persistence`, `jsonl-append-only`, `dynamic-system-prompt`, `cache-friendly`, `lifecycle-hooks`, `pre-tool-call`, `post-tool-call`, `on-error`, `on-compaction`, `permission-layers`, `read-only`, `user-space`, `full-access`, `harness-vs-framework`

---

## Dẫn chứng Nguồn gốc (Evidence & Source)
- [Ghi chú thô: 9 Thành Phần Lõi Harness](00_raw_docs/nine-core-harness-components.md)

## Liên kết Tri thức
- [Định nghĩa Harness](02_atomic_nodes/HAE-concept-harness-definition.md) — Bổ sung bối cảnh từ khóa học gốc
- [Session Continuity](02_atomic_nodes/HAE-concept-session-continuity.md) — Liên quan trực tiếp đến Session Persistence
- [Internal Observability](02_atomic_nodes/HAE-concept-internal-observability.md) — Liên quan đến Lifecycle Hooks
- [Agent Overreach](02_atomic_nodes/HAE-concept-agent-overreach.md) — Liên quan đến Permission Layers
