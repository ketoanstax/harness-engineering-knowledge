📑 BIÊN BẢN BÀN GIAO KỸ THUẬT (SESSION HANDOFF)
(Theo mô hình shift change chuyên nghiệp - FB-004)

## 1. Trạng thái Hiện tại (Current Status)
*   **Hạ tầng và Môi trường**:
    *   Môi trường Node.js (v25.9.0) và pnpm (10.33.2) chạy cực kỳ ổn định.
    *   TypeScript Engine chạy mượt mà, ESM và Native execution không phát sinh lỗi.
    *   Đã chạy typecheck xanh 100% (`pnpm typecheck` pass).
*   **Nhánh làm việc (Branches)**:
    *   Hiện đang ở nhánh `feature/rewrite-engine-in-typescript`.
    *   Working tree có 2 file đã chỉnh sửa/tạo mới trong Git (`src/test_mrp_pipeline.ts` và `scripts/check_and_normalize_nikaya.ts`) nhưng không có lỗi cú pháp.
*   **Obsidian Vault (`vault/` - Obsidian Root)**:
    *   **Làm sạch hoàn toàn**: Đã dọn sạch 100% dữ liệu tri thức Harness Engineering cũ khỏi các thư mục `vault/00_`, `vault/01_`, `vault/02_`, `vault/04_` và `vault/05_`.
    *   **Giữ lại nguyên vẹn**: Các tệp hiến pháp `RULE.md` định hướng AI trong mọi thư mục.
    *   **Reset Neural Map**: Hai tệp `INDEX.md` và `AI_ROUTING_TABLE.md` trong `vault/03_neural_map/` đã được reset về trạng thái rỗng/tiêu đề mới cho Trung bộ kinh Nikaya nhưng giữ lại cấu trúc Marker danh mục để tương thích với Engine.
*   **Dữ liệu thô mới (Majjhima Nikaya Raw)**:
    *   Đã sao chép đệ quy thành công **178 tệp Trung bộ kinh thô** từ thư mục ngoài vào `vault/00_raw_docs/`.
    *   Đã chạy script chuẩn hóa frontmatter: **100% số file (178/178 tệp)** hiện đã chứa khối Frontmatter YAML hoàn chỉnh với `title` chuẩn và `status: to-process` chuẩn mực, sẵn sàng để nạp qua MRP Pipeline!
*   **Đồ thị tri thức (Graph View & Links)**:
    *   Đã chạy kiểm toán đồ thị tĩnh: **0 liên kết hỏng, 0 vi phạm portability, cấu trúc Cây Tri thức nhất quán tuyệt đối 100%!** ✅

---

## 2. Các Thay đổi Đã thực hiện trong Session (Session Changes)
*   **Làm sạch tri thức Harness cũ**:
    *   Xóa sạch các file bài giảng, file processed, nốt nguyên tử, báo cáo distilled và journal của Harness cũ.
    *   Sửa lỗi liên kết hỏng ví dụ trong `vault/02_atomic_nodes/RULE.md` (đổi `HAE-concept-outer-loop.md` thành `RULE.md`).
    *   Reset `INDEX.md` và `AI_ROUTING_TABLE.md` sang trạng thái rỗng cho Nikaya.
*   **Nạp và chuẩn hóa dữ liệu Phật giáo thô**:
    *   Sao chép đệ quy thành công toàn bộ thư mục `/home/ka/Repos/github.com/trongnghiango/buddhist-dharma/00_nikaya_raw` vào `vault/00_raw_docs/` (gồm 152 file kinh Majjhima Nikaya ở gốc và 26 file bài giảng nghĩa/bài giảng kinh nằm trong các thư mục con `loi_phat_day/` và `trung_bo_kinh/`).
    *   Viết và thực thi thành công script đệ quy `scripts/check_and_normalize_nikaya.ts`. Script đã quét 178 tệp, tự động chèn khối Frontmatter YAML chuẩn (với `title` và `status: to-process`) cho 26 tệp thiếu, đảm bảo tất cả 178 tệp thô đều sẵn sàng để xử lý.
*   **Tương thích hóa Bộ Test E2E**:
    *   Chỉnh sửa tệp test tích hợp `src/test_mrp_pipeline.ts`.
    *   *Tính năng mới*: Bộ test E2E giờ đây **tự động tạo lập các file mock thô và các nốt cha mock** (`agent-overreach`, `token-budget`,...) tạm thời ở đầu bài test để vượt qua khâu kiểm toán nghiêm ngặt, và **tự động xóa sạch bóng** chúng ở cuối bài test.
    *   *Kết quả*: `pnpm test` chạy thành công rực rỡ (Pass 100%), bảo toàn tuyệt đối trạng thái Vault trống trải cho Trung bộ kinh.

---

## 3. Các Điểm lưu ý Đặc biệt cho Phiên tiếp theo (Key Reminders)
> [!IMPORTANT]
> **Bộ kiểm toán đồ thị tĩnh (`sync_rules_and_memory.py`)**: Script kiểm toán tĩnh quét đệ quy toàn bộ thư mục `vault/`. Hiện tại tất cả 178 file thô mới nạp đều đã được Frontmatter hóa với `status: to-process` và không chứa liên kết hỏng nên kiểm toán cực kỳ xanh. Khi chạy kiểm toán ở cuối phiên, bắt buộc phải chạy script này.

> [!TIP]
> **E2E Test không làm bẩn Vault**: Bạn có thể chạy `pnpm test` bất kỳ lúc nào để xác minh tính ổn định của Pipeline TS. Bài test sẽ tự động tạo dữ liệu chạy tạm thời và dọn sạch 100% sau đó, trả lại trạng thái Vault nguyên vẹn.

---

## 4. Kế hoạch Hành động Phiên tiếp theo (Next Session Action Items)
1.  **Chạy thử nghiệm Ingestion Pipeline**:
    *   Kích hoạt MRP Pipeline trên tệp bài kinh đầu tiên của Trung bộ kinh để quan sát cách Mapper và Reducer của TS Engine chắt lọc thông tin:
        `pnpm start run --source vault/00_raw_docs/trung_bo_kinh/mn-001.md` (hoặc tệp kinh ở gốc).
2.  **Quan sát và Đánh giá Nốt Nguyên tử mới**:
    *   Kiểm tra tệp nốt nguyên tử được tạo ra trong `vault/02_atomic_nodes/` của bài kinh đầu tiên để xem nội dung định nghĩa cốt lõi, nguyên lý thực tiễn và đồ thị liên kết Causal Web có chuẩn Phật học chưa.
3.  **Tối ưu hóa các Mẫu và Tiêu chí Phân loại**:
    *   Hiện tại, Mapper và Committer trong Engine đang sử dụng các danh mục và phân loại của Harness cũ (như *Khung gá cốt lõi*, *Rào chắn An toàn*,...). 
    *   Để phù hợp hoàn toàn với nghiên cứu Kinh điển Phật giáo Nikaya, Agent phiên sau cần cập nhật cấu trúc phân loại danh mục trong `src/phases/committer.ts` và `src/phases/mapper.ts` (ví dụ chuyển phân loại danh mục sang các chủ đề Phật học như: *Tứ Thánh Đế*, *Duyên Khởi*, *Bát Chánh Đạo*, *Ngũ Uẩn*, *Giới Định Tuệ*...).
4.  **Tích hợp CLI toàn cục hoặc đóng gói PR**:
    *   Chuẩn bị merge nhánh `feature/rewrite-engine-in-typescript` vào `main` khi các nốt Trung bộ kinh đầu tiên được Ingest thành công.
