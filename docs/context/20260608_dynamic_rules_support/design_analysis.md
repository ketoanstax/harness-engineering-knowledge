# Phân Tích Thiết Kế: Tích Hợp Luật Động (RULE.md/AGENTS.md) Từ Vault Vào Pipeline

## 1. Yêu Cầu & Bối Cảnh
Hiện tại, các luật ràng buộc hành vi của AI Engine (Harness Pipeline) đang được lập trình cứng (hardcode) trong source code của các phase: `MapperPhase`, `ReducerPhase`, `PlannerPhase`.
Người dùng muốn có khả năng cấu hình luật linh hoạt thông qua các file `.md` (`RULE.md` hoặc `AGENTS.md`) trong Obsidian Vault:
- **Luật Toàn Cục (Global Rules):** Nằm tại root của Vault (`vault/RULE.md` hoặc `vault/AGENTS.md`).
- **Luật Cục Bộ (Domain Rules):** Nằm tại thư mục domain tương ứng của tài liệu (ví dụ: `vault/00_raw_docs/Tai_chinh/RULE.md`).

## 2. Giải Pháp Kiến Trúc
Thiết lập cơ chế nạp luật động trước khi gọi LLM:
1. **Rule Resolver:** Một tiện ích động quét tìm file luật ở cấp toàn cục và cấp cục bộ.
2. **Phase Injection:**
   - Trong `MapperPhase`: Đọc luật dựa trên đường dẫn tệp đang xử lý và đưa vào prompt chắt lọc tài liệu thô.
   - Truyền đối tượng luật qua các phase tiếp theo (`ReducerPhase`, `PlannerPhase`) để tiếp tục hướng dẫn LLM phân tích đối đầu (deduplication) và lập kế hoạch cấu trúc nốt tri thức.
