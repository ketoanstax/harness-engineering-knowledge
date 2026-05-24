# CLAUDE.md (Hiến hiến tối cao & Bản đồ Định tuyến Quy tắc)

Tài liệu này là Hiến pháp tối cao của AI Agent khi làm việc trong vault này. Để tối ưu hóa cửa sổ nhận thức và tránh làm loãng prompt, hệ thống áp dụng cơ chế **Lazy Loading Rules (Tải lười quy tắc)**.

---

## 🎯 Triết lý & Tầm nhìn Cốt lõi
> **"Framework viết cho lập trình viên dùng. Harness viết cho AI dùng."**

Vault được xây dựng bằng **tiền tố 2 chữ số**, cấu trúc phẳng (`02_atomic_nodes/`) theo mô hình **Cây Mở Rộng (Tree Expansion)** để AI dễ dàng nạp bối cảnh và tự động đan xen các domain tri thức.

---

## 🚏 Bảng Định Tuyến Quy Tắc (Lazy Loading Rules)
Trước khi bắt đầu bất kỳ tác vụ nào đụng chạm đến phân khu (Scope) dưới đây, Agent **BẮT BUỘC** phải gọi công cụ `Read` để load file `RULE.md` cục bộ của phân khu đó trước:

| Phân khu Tác vụ (Scope) | File Quy tắc Cục bộ | Nội dung & Vai trò |
| :--- | :--- | :--- |
| **Layer 1: Tài liệu thô** | [00_raw_docs/RULE.md](00_raw_docs/RULE.md) | Cách thu thập, định dạng YAML frontmatter và bảo toàn dữ liệu gốc. |
| **Layer 2: Bản chắt lọc** | [01_structured_docs/RULE.md](01_structured_docs/RULE.md) | Cấu trúc 3 phần (Key Takeaways, Keywords, AI-Ready Summary). |
| **Lớp Lõi Tri Thức** | [02_atomic_nodes/RULE.md](02_atomic_nodes/RULE.md) | Phân rã tri thức phẳng theo Cây Mở Rộng và Mạng lưới Nhân Duyên Quả động (Causal Web). |
| **Bản đồ Thần kinh** | [03_neural_map/RULE.md](03_neural_map/RULE.md) | Chỉ mục phân loại INDEX.md và bảng định tuyến AI_ROUTING_TABLE.md. |
| **Layer 3: Đúc kết vĩ mô** | [04_distilled/RULE.md](04_distilled/RULE.md) | Viết phân tích tổng hợp sâu và Tuyên ngôn Harness Engineering. |
| **Bộ Nhớ & Vòng lặp** | [memory/RULE.md](memory/RULE.md) | Hồ sơ user, project context, nhật ký feedback và Closed Feedback Loop. |

---

*   **Bắt buộc phải trình bày Kế hoạch (Plan Mode) và nhận được sự phê duyệt rõ ràng từ Người dùng trước khi tiến hành chỉnh sửa hoặc tạo mới tệp tin. Cấm tự ý sửa đổi chủ động.** (Được phát hiện vào 2026-05-24 từ FB-013).

## 🛠️ Specialized Agent Skills Orchestration (SKILLS)
Agent có thể kích hoạt các kỹ năng chuyên gia trong thư mục `.agent/` tùy theo yêu cầu:
1.  **Phân tích Tri thức Sâu**: Sử dụng [.agent/hae-analyzer.md](.agent/hae-analyzer.md) để mổ xẻ chủ đề khó (Socratic + Tree Expansion Pipeline).
2.  **Viết & Cấu trúc hóa**: Sử dụng [.agent/hae-writer.md](.agent/hae-writer.md) để tạo note đúng chuẩn phẳng và workspace-relative path.
3.  **Kiểm toán Vault**: Sử dụng [.agent/hae-auditor.md](.agent/hae-auditor.md) để kiểm toán liên kết gãy, parent/children và auto-sync rules.
4.  **Hỏi đáp & Tiến hóa Tri thức**: Sử dụng [.agent/hae-qa-oracle.md](.agent/hae-qa-oracle.md) để trả lời câu hỏi và tự động đồng bộ hóa kiến thức mới khi phát hiện khoảng trống tri thức.

---

## 🤖 Bản ghi Ghi nhớ Lần khởi tạo (MEMORY Gate)
Trước khi bắt đầu bất kỳ Turn nào, Agent PHẢI:
1.  Đọc tệp [memory/MEMORY.md](memory/MEMORY.md) và [memory/RULE.md](memory/RULE.md) để nạp bộ nhớ cục bộ.
2.  Chạy script kiểm toán và tự động đồng bộ hóa `scripts/sync_rules_and_memory.py` trước khi bàn giao công việc cho con người để đảm bảo không có liên kết gãy nào trong vault. (FB-004)
