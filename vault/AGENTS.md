# AGENTS.md — USE Mode (Vận hành Vault & Tri thức)

## 📂 Cấu trúc Vault

- **Tiền tố 2 số** (`00_raw_docs/`, `01_structured_docs/`, …)
- **Lưu trữ phẳng**: mọi nốt nguyên tử nằm trong `02_atomic_nodes/` — không dùng subfolder.
- **Workspace-Relative Only**: cấm đường dẫn tuyệt đối và `../`.

## 🚏 Bảng Định Tuyến Rules (Lazy Loading Rules)

Trước khi chạm vào phân khu nào, load `RULE.md` cục bộ của phân khu đó trước:

| Phân khu | File |
|:---|---:|
| Layer 1 — Tài liệu thô | [00_raw_docs/RULE.md](./00_raw_docs/RULE.md) |
| Layer 2 — Bản chắt lọc | [01_structured_docs/RULE.md](./01_structured_docs/RULE.md) |
| Lõi Tri thức | [02_atomic_nodes/RULE.md](./02_atomic_nodes/RULE.md) |
| Bản đồ Thần kinh | [03_neural_map/RULE.md](./03_neural_map/RULE.md) |
| Layer 3 — Đúc kết vĩ mô | [04_distilled/RULE.md](./04_distilled/RULE.md) |
| Bộ Nhớ & Vòng lặp | [memory/RULE.md](./memory/RULE.md) |

## 🔗 Quy tắc Metadata & Liên kết

- **Nốt gốc**: `children: [slug1, slug2]`
- **Nốt con**: `parent: parent-slug`
- **Backlinks**: mỗi nốt nguyên tử phải trỏ về structured doc và raw doc.

## 🔄 Vòng lặp Phản hồi Tự động (Closed Feedback Loop)

1. Ghi feedback/rule mới vào `memory/feedback_log.md` với `status: pending-sync`
2. **Trước khi bàn giao**: chạy `bun scripts/sync_rules_and_memory.ts`

## 🧠 MEMORY Gate

Trước mỗi turn, đọc:
- `memory/MEMORY.md`
- `memory/RULE.md`
- `memory/project_context.md`
- `memory/feedback_log.md`
