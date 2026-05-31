# Bảng Định Tuyến Tri Thức Dành Cho AI Agent (AI Routing Table)

Tài liệu này cung cấp bảng tra cứu nhanh (routing table) giúp AI Agent xác định chính xác nốt nguyên tử nào cần đọc để tuân thủ quy tắc khi gặp các tình huống cụ thể trong quá trình làm việc.

---

## 🧭 Bảng định tuyến nhanh (Quick Routing Matrix)

| Tình huống thực tế của Agent | Vấn đề / Lỗi tiềm ẩn | Nốt nguyên tử cần đọc lập tức | Hướng xử lý chính |
| :--- | :--- | :--- | :--- |
| **Bắt đầu nhận một Task mới phức tạp** | Code bừa bãi, không hiểu cấu trúc dự án | [Plan Mode](02_atomic_nodes/HAE-concept-initialization-phase.md) | Bắt buộc chuyển sang **Plan Mode**, tạo file kế hoạch trước khi code. |
| **Task yêu cầu thực hiện nhiều bước** | Mất bám đuổi tiến độ, xao nhãng sang task khác | [Feature List](02_atomic_nodes/HAE-concept-feature-list-primitive.md) | Sử dụng **TodoWrite** để quản lý checklist, giữ đúng 1 task `in_progress`. |
| **Quy tắc dự án quá nhiều và rối rắm** | Quá tải context, bỏ sót quy tắc quan trọng | [Instruction File Pitfall](02_atomic_nodes/HAE-concept-instruction-file-pitfall.md) | Phân tách tri thức quy tắc thành các chuyên đề nhỏ, giữ CLAUDE.md gọn nhẹ. |
| **Chuẩn bị gọi công cụ Edit/Write sửa file** | Sửa tràn lan ngoài phạm vi yêu cầu (Overreach) | [Agent Overreach](02_atomic_nodes/HAE-concept-agent-overreach.md) | Giới hạn **Blast Radius** nghiêm ngặt. Cấm tự ý refactor linh tinh. |
| **Viết code có thân hàm trống hoặc TODO** | Để lại code dang dở (Under-finish) | [Agent Overreach](02_atomic_nodes/HAE-concept-agent-overreach.md) | Hoàn thiện code 100%. Tuyệt đối không commit code rỗng hoặc comment TODO. |
| **Tác vụ kéo dài qua nhiều lượt hội thoại** | Bị reset context, trôi bộ nhớ và mất tiến độ | [Session Continuity](02_atomic_nodes/HAE-concept-session-continuity.md) | Lưu checkpoint tiến độ lên file trên đĩa cứng để tự động khôi phục sau đó. |
| **Code vừa viết xong không báo lỗi biên dịch** | Tự mãn tuyên bố hoàn thành sớm (Early Victory) | [Early Victory](02_atomic_nodes/HAE-concept-early-victory.md) | Không tự xác nhận lý thuyết. Chuyển sang pha xác thực độc lập. |
| **Cần chứng minh code hoạt động thực tế** | Chỉ chạy unit test với dữ liệu mock ảo | [E2E Testing](02_atomic_nodes/HAE-concept-e2e-testing.md) | Khởi chạy dev server và chạy kiểm thử **E2E / Live Testing** trên trình duyệt/API. |
| **Có file rác, tiến trình chạy ngầm phát sinh** | Gây nhiễu nhận thức phiên sau | [Clean State](02_atomic_nodes/HAE-concept-clean-state.md) | Dọn dẹp sạch workspace, xóa file tạm, tắt dev server ngầm trước khi thoát. |
| **Cần ghi nhớ thói quen của người dùng** | Quên bài học cũ, lặp lại lỗi giao tiếp | [User Profile](memory/user_profile.md), [Feedback Log](memory/feedback_log.md) | Ghi nhận phản hồi vào `feedback_log.md` và chạy script tự động đồng bộ. |
| **Agent chạy quá lâu, context đầy** | Quên đầu quên đuôi, output kém chất lượng | [Context Manager](02_atomic_nodes/HAE-concept-context-manager.md), [Compaction Strategy](02_atomic_nodes/HAE-concept-compaction-strategy.md) | Kích hoạt compaction: giữ 4 tin mới nhất, tóm tắt phần còn lại. |
| **Cần ủy quyền sub-task cho agent con** | Truyền quá nhiều context → sub-agent quá tải | [Sub-Agent](02_atomic_nodes/HAE-concept-sub-agent.md), [Context Isolation](02_atomic_nodes/HAE-concept-context-isolation.md) | Chỉ truyền: task rõ ràng + file liên quan + permission tối thiểu. |
| **Gọi lệnh bash nguy hiểm (rm, sudo)** | Phá hệ thống, xóa nhầm file | [Permission Layers](02_atomic_nodes/HAE-concept-permission-layers.md), [Dynamic Classification](02_atomic_nodes/HAE-concept-dynamic-permission-classification.md) | Kiểm tra mức permission. Full access → cần xác nhận tường minh từ người dùng. |
| **Cần debug khi tool lỗi** | Không có log để truy vết | [Lifecycle Hooks](02_atomic_nodes/HAE-concept-lifecycle-hooks.md), [4 Hook Types](02_atomic_nodes/HAE-concept-four-hook-types.md) | Dùng PreToolCall để log, OnError để retry hoặc escalate. |
| **Machine crash giữa session dài** | Mất toàn bộ tiến trình | [Session Persistence](02_atomic_nodes/HAE-concept-session-persistence.md) | JSONL append-only → đọc lại file → phục hồi từ đúng điểm dừng. |
| **Cần Agent tự hiểu project rules** | Phải giải thích lại từ đầu mỗi session | [Dynamic System Prompt](02_atomic_nodes/HAE-concept-dynamic-system-prompt.md) | System prompt pipeline tự gom CLAUDE.md + .agent/ files. |
| **Cần giải thích Harness Engineering là gì** | Người mới khó hiểu khái niệm | [Harness Moat & 80% Factor](02_atomic_nodes/HAE-concept-harness-moat-factor80.md) | Định nghĩa Harness, phân biệt Model vs Harness, CPU-OS analogy, 80% Factor. |
| **Đang design Agent Harness từ đầu** | Không biết cần xây component nào | [6 Layers](02_atomic_nodes/HAE-concept-six-harness-layers.md), [5 Principles](02_atomic_nodes/HAE-concept-five-harness-principles.md) | Xây 6 layer: Context Engineering -> Tool -> State -> Verification -> HITL -> Lifecycle. |
| **Cần chọn kiến trúc Agent phù hợp** | Chọn sai pattern dẫn tới phức tạp hóa | [3 Patterns](02_atomic_nodes/HAE-concept-three-harness-patterns.md) | Default Single Agent + Verification. Split khi thực sự cần. |
| **Cần deploy Agent ra production an toàn** | Không có quy trình kiểm soát | [5 Stage Deployment](02_atomic_nodes/HAE-concept-five-stage-deployment.md) | Eval -> Shadow -> Canary 5% -> Graduated -> Post-Deployment Validation. |
| **Cần thiết lập Governance cho Agent** | Agent làm việc không kiểm soát | [4 Governance Layers](02_atomic_nodes/HAE-concept-four-governance-layers.md) | Identity isolation -> PEP intercept -> Audit trail -> HITL escalation. |
| **Multi-agent chain bị sai lệch output** | Context bị suy giảm qua các hop | [Context-Switch Fatigue](02_atomic_nodes/HAE-concept-context-switch-fatigue-handoff.md) | Structured Handoff Schema + Goal-echo + Fidelity Checkpoint tại hop 3. |
| **Cần thiết kế memory cho Agent system** | Không biết lưu context ở đâu, bao lâu | [3 Tier Memory](02_atomic_nodes/HAE-concept-three-tier-memory-architecture.md) | Ephemeral (in-context) -> Working (cache) -> Archival (vector DB). |
| **Cần thuyết phục team đầu tư Harness** | Thiếu dữ liệu định lượng | [Quantified Metrics](02_atomic_nodes/HAE-concept-harness-quantified-metrics.md) | 83%->96%, 40-point diff, 30-50% token savings. |

---

## 🛠️ Hướng dẫn dành cho AI Agent
Khi gặp một vấn đề kỹ thuật hoặc nghi ngờ về hành vi của mình, bạn bắt buộc phải:
1. Xác định tình huống của bạn trong cột 1.
2. Click vào liên kết ở cột 3 để đọc nốt nguyên tử tương ứng.
3. Áp dụng triệt để nguyên lý kỹ thuật mô tả trong nốt nguyên tử đó.
