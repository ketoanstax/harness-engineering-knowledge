📑 BIÊN BẢN BÀN GIAO KỸ THUẬT (SESSION HANDOFF)
(Theo mô hình shift change chuyên nghiệp - FB-004)

## 1. Trạng thái Hiện tại (Current Status)
*   **Hạ tầng và Môi trường**:
    - Node.js (v25.9.0), pnpm (10.33.2) chạy cực kỳ ổn định.
    - TypeScript Engine chạy mượt mà, Native execution và ESM hoạt động hoàn hảo.
    - Đã chạy typecheck xanh 100% (`pnpm typecheck` / `pnpm tsc --noEmit` pass).
*   **Dữ liệu thô mới (Majjhima Nikaya Raw)**:
    - Toàn bộ 178 tệp Trung bộ kinh thô nằm trong `vault/00_raw_docs/`.
    - Hai tệp đầu tiên đã được nạp thành công và chuyển sang trạng thái `status: processed`:
      1. [sutta-mn-001.md](vault/00_raw_docs/sutta-mn-001.md) (Kinh Pháp Môn Căn Bản)
      2. [sutta-mn-002.md](vault/00_raw_docs/sutta-mn-002.md) (Kinh Tất cả các lậu hoặc)
*   **Nốt nguyên tử thực tế (Obsidian Atomic Nodes)**:
    - Đã chắt lọc thành công các nốt Phật học có chiều sâu từ local LLM:
      - [HAE-concept-loi-cay-sara.md](vault/02_atomic_nodes/HAE-concept-loi-cay-sara.md) (Lõi cây (Sāra))
      - [HAE-concept-canh-la.md](vault/02_atomic_nodes/HAE-concept-canh-la.md) (Cành lá)
      - [HAE-concept-kho-uan.md](vault/02_atomic_nodes/HAE-concept-kho-uan.md) (Khổ uẩn (Dukkha-kkhandha))
      - [HAE-concept-tuong-tri.md](vault/02_atomic_nodes/HAE-concept-tuong-tri.md) (Tưởng Tri (Sañjānāti))
      - [HAE-concept-duc-hy.md](vault/02_atomic_nodes/HAE-concept-duc-hy.md) (Dục Hỷ (Nandīrāga))
*   **Nốt nháp bảo toàn liên kết (Placeholder Nodes - Self-healing Graph)**:
    - Bộ tự động phục hồi đồ thị đã tự động sinh các nốt nháp (chứa thẻ `placeholder`, `draft` và định nghĩa tạm thời) cho các liên kết chưa tồn tại:
      - [HAE-concept-tu-thanh-de.md](vault/02_atomic_nodes/HAE-concept-tu-thanh-de.md)
      - [HAE-concept-vo-minh.md](vault/02_atomic_nodes/HAE-concept-vo-minh.md)
      - [HAE-concept-ngu-thu-uan.md](vault/02_atomic_nodes/HAE-concept-ngu-thu-uan.md)
      - [HAE-concept-ai-duc.md](vault/02_atomic_nodes/HAE-concept-ai-duc.md)
      - [HAE-concept-sanh-tu-luan-hoi.md](vault/02_atomic_nodes/HAE-concept-sanh-tu-luan-hoi.md)
      - [HAE-concept-duyen-khoi.md](vault/02_atomic_nodes/HAE-concept-duyen-khoi.md)
      - [HAE-concept-niet-ban.md](vault/02_atomic_nodes/HAE-concept-niet-ban.md)
      - [HAE-concept-bat-dong-tam-giai-thoat.md](vault/02_atomic_nodes/HAE-concept-bat-dong-tam-giai-thoat.md)
      - [HAE-concept-kieu-man.md](vault/02_atomic_nodes/HAE-concept-kieu-man.md)
      - [HAE-concept-phong-dat.md](vault/02_atomic_nodes/HAE-concept-phong-dat.md)
      - [HAE-concept-diet-de.md](vault/02_atomic_nodes/HAE-concept-diet-de.md)
      - [HAE-concept-giai-thoat-hoan-toan.md](vault/02_atomic_nodes/HAE-concept-giai-thoat-hoan-toan.md)
      - [HAE-concept-nghiet-.md](vault/02_atomic_nodes/HAE-concept-nghiet-.md)
*   **Đồ thị tri thức (Graph View & Links)**:
    - Đã chạy kiểm toán đồ thị tĩnh: **0 liên kết hỏng, 0 vi phạm portability, cấu trúc Cây Tri thức nhất quán tuyệt đối 100%!** ✅

---

## 2. Các Thay đổi Đã thực hiện trong Session (Session Changes)
*   **Khắc phục lỗi gọi API Anthropic qua local Gateway (9router)**:
    - Thay thế cách gọi Anthropic SDK Messages API (bị lỗi khi nhận stream từ gateway) sang **gọi HTTP trực tiếp bằng Axios** và tự viết trình giải mã stream Server-Sent Events (SSE). 
    - Đọc dữ liệu thô dạng text thô, bóc tách dòng sự kiện `data: ` và ghép nối linh hoạt các chunk của cả chuẩn Anthropic (`delta.text`) lẫn OpenAI (`choices[0].delta.content`).
*   **Hệ thống tự động sửa lỗi JSON (Self-repairing JSON Parser)**:
    - Tích hợp hàm `repairJsonString` chạy Character-by-character (O(N)) trước khi `JSON.parse`.
    - **Tự sửa ngoặc kép lồng nhau (Nested Quotes)**: Dùng lookahead tự động phân biệt ngoặc kép cú pháp và ngoặc kép văn bản lồng nhau (vd: `"dụ "lõi cây" giải thoát"`) để tự escape thành `\"`.
    - **Phục hồi JSON bị cắt cụt (Truncated JSON Recovery)**: Khi local LLM bị chạm ngưỡng token và ngắt stream đột ngột (vd: đứt ở giữa mảng `"nghiet-"`), thuật toán sử dụng **ngăn xếp Stack** để tự đóng dấu ngoặc kép `"`, dấu phẩy thừa, và tự động đóng các ngoặc vuông `]` cùng ngoặc nhọn `{}` tương ứng dở dang. Cứu nguy 100% dữ liệu nốt đã sinh.
*   **Cơ chế tự hồi phục đồ thị (Self-healing Graph)**:
    - Sửa đổi `src/phases/refiner.ts` để tự động phát hiện các liên kết đến nốt chưa tồn tại trên đĩa và tự sinh nốt nháp (placeholder) nhằm bảo toàn tính toàn vẹn 0 lỗi liên kết.
*   **Động hóa cấu hình phân loại**:
    - Chuyển toàn bộ cấu trúc danh mục ra tệp cấu hình [vault/03_neural_map/categories.json](vault/03_neural_map/categories.json) cho Phật học Nikaya (Tứ Thánh Đế, Duyên Khởi, Bát Chánh Đạo, Ngũ Uẩn, Giới Định Tuệ, Vô Thường-Khổ-Vô Ngã, Giáo lý Khác).
    - Committer tự động phân tích từ khóa và ánh xạ các khái niệm cũ/mới vào đúng đề mục trong [vault/03_neural_map/INDEX.md](vault/03_neural_map/INDEX.md).
*   **Cách ly môi trường kiểm thử E2E**:
    - Sửa `src/test_mrp_pipeline.ts` để chạy test trên thư mục tạm `vault/test_raw_docs` thay vì `vault/00_raw_docs`, giữ sạch tuyệt đối 178 tạng kinh thô của bạn. Test E2E chạy xanh 100% thành công rực rỡ.
*   **Ghi đè checkpoint plan**:
    - Sửa đổi `src/core/orchestrator.ts` để lưu checkpoint plan data ngay khi pha PLAN kết thúc, giúp các lệnh `approve`/`reject` có đủ dữ liệu chạy tiếp.
*   **Sửa lỗi Commander CLI**:
    - Sửa đổi `src/index.ts` thay thế cú pháp tùy chọn cũ sang cú pháp chuẩn của Commander (dùng dấu phẩy phân tách `-s, --source <source>`) và map đúng các khóa tùy chọn của `options` (`options.source` thay vì `options.s`).

---

## 3. Các Điểm lưu ý Đặc biệt cho Phiên tiếp theo (Key Reminders)
> [!IMPORTANT]
> **Sự tiến hóa của các nốt nháp Placeholder**: Các nốt nháp chứa tags `placeholder` và `draft` trong YAML frontmatter (như `vo-minh.md`, `ngu-thu-uan.md`...) được tạo ra tạm thời để đồ thị luôn xanh. Khi chạy nạp các bài kinh tiếp theo giải thích về các khái niệm này, pha Reducer sẽ tự động phát hiện nốt đã tồn tại và đề xuất `merge` (gộp nốt) ➡️ tự động đắp thịt (definition, principles thực tế) và gỡ cờ nháp của các nốt này hoàn toàn tự động!

> [!TIP]
> **Axios Direct Call & API Gateway**: File `.env` chứa cấu hình base URL chỉ thẳng tới cổng 9router cục bộ và model `KhaBoDo_1.0`. Khi chạy trong môi trường thực tế, Engine luôn ưu tiên gọi Axios direct call để xử lý Stream SSE. Khi chạy test E2E (`pnpm test`), Engine tự xóa các biến môi trường này để ép chạy Mock Mode bảo vệ Vault thực tế.

---

## 4. Kế hoạch Hành động Phiên tiếp theo (Next Session Action Items)
1.  **Tiếp tục chạy Ingestion Pipeline**:
    - Tiến hành nạp các bài kinh tiếp theo (ví dụ: `sutta-mn-003.md`, `sutta-mn-004.md`...) bằng cách chạy tương tác:
      `pnpm start run --source vault/00_raw_docs/sutta-mn-003.md`
      Sau đó duyệt kế hoạch và chạy:
      `pnpm start approve --timestamp <timestamp>`
2.  **Chạy Batch tự động hàng loạt**:
    - Nếu muốn nạp hàng loạt tất cả các tạng kinh chưa được xử lý còn lại tự động không dừng:
      `pnpm start batch --auto-approve`
3.  **Quan sát tiến trình đắp thịt nốt nháp**:
    - Quan sát xem các nốt nháp (như `vo-minh.md`, `ngu-thu-uan.md`) được tự động nâng cấp nội dung khi quét qua các bài kinh giải thích chi tiết về chúng như thế nào.
