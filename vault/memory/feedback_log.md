# Nhật ký Phản hồi & Đồng bộ Quy tắc (Feedback & Rules Log)

Tài liệu này ghi chép lại các phản hồi, sửa lỗi và quy tắc mới phát sinh trong quá trình cộng tác. Đây là nguồn dữ liệu để script tự động hóa quét và cập nhật vào `CLAUDE.md`.

## 🔄 Danh sách Quy tắc & Phản hồi

- **ID**: FB-001
  **Ngày**: 2026-05-24
  **Phản hồi/Quy tắc**: Áp dụng cấu trúc thư mục phân cấp rõ ràng bằng tiền tố 2 chữ số (`00_raw_docs`, `01_structured_docs`, `02_atomic_nodes`, `03_neural_map`, `04_distilled`, `05_journal`).
  **Lý do**: Giúp hiển thị trực quan luồng tri thức chảy từ thô tới cô đọng và mạng lưới.
  **Trạng thái**: `synced`

- **ID**: FB-002
  **Ngày**: 2026-05-24
  **Phản hồi/Quy tắc**: Các nốt nguyên tử (`02_atomic_nodes`) bắt buộc phải chứa các liên kết ngược dòng dẫn chứng (Evidence & Context) trỏ trực tiếp về tài liệu cấu trúc (`01_structured_docs`) và tài liệu thô (`00_raw_docs`).
  **Lý do**: Đảm bảo trên Obsidian Graph View, người dùng có thể dễ dàng truy vết từ nốt nguyên tử cô đọng về nguồn gốc dẫn chứng và bức tranh tổng thể ban đầu.
  **Trạng thái**: `synced`

- **ID**: FB-003
  **Ngày**: 2026-05-24
  **Phản hồi/Quy tắc**: Thiết lập cơ chế tự động đồng bộ hóa tri thức và quy tắc (RULE và MEMORY) thông qua các công cụ tự động hóa để tránh bị lãng quên và giữ cho Agent luôn tuân thủ nguyên tắc.
  **Lý do**: Đảm bảo hệ thống tự tiến hóa (Closed Feedback Loop), giảm thiểu sai sót do thủ công.
  **Trạng thái**: `synced`

- **ID**: FB-004
  **Ngày**: 2026-05-24
  **Phản hồi/Quy tắc**: AI Agent bắt buộc phải chạy script kiểm toán liên kết `scripts/sync_rules_and_memory.py` trước khi bàn giao công việc cho con người.
  **Lý do**: Đảm bảo không để lại bất kỳ liên kết gãy nào trong vault.
  **Trạng thái**: `synced`

- **ID**: FB-005
  **Ngày**: 2026-05-24
  **Phản hồi/Quy tắc**: Áp dụng Mô hình Cây Mở Rộng (Tree Expansion Model) khi xử lý dữ liệu thô — tri thức phải PHÁT TRIỂN thành cây (gốc → nhánh → lá) chứ không NÉN lại. Mỗi nguồn dữ liệu thô tạo ra một cây tri thức riêng biệt.
  **Lý do**: User tư duy tri thức như cây mở rộng liên kết: mỗi nhóm dữ liệu thô → một cây → gom nhiều vault → đan xen tìm điểm kết nối → tạo quy luật tri thức.
  **Trạng thái**: `synced`

- **ID**: FB-006
  **Ngày**: 2026-05-24
  **Phản hồi/Quy tắc**: Tất cả node (gốc và con) được lưu trữ PHẲNG trong `02_atomic_nodes/` — quan hệ cha-con chỉ được thể hiện qua liên kết Markdown và metadata frontmatter (parent/children), KHÔNG dùng thư mục con.
  **Lý do**: Mục đích dàn trải dữ liệu ra, không che dấu node sâu trong lớp thư mục. Node cần linh hoạt nhảy sang cấp cao hoặc thấp hơn.
  **Trạng thái**: `synced`

- **ID**: FB-007
  **Ngày**: 2026-05-24
  **Phản hồi/Quy tắc**: Chỉ tạo sub-node khi nội dung node gốc đủ phức tạp để chia nhỏ có ý nghĩa. Không chia nhỏ vô cớ gây rối. Đơn giản thì giải thích thêm trong node gốc là đủ.
  **Lý do**: Tránh tạo node rỗng hoặc quá mỏng nội dung. Mỗi node phải có giá trị tri thức thực sự.
  **Trạng thái**: `synced`

- **ID**: FB-008
  **Ngày**: 2026-05-24
  **Phản hồi/Quy tắc**: Node gốc phải khai báo `children: [slug-list]` trong frontmatter, node con phải khai báo `parent: slug` để máy có thể truy vết cây tri thức tự động.
  **Lý do**: Hỗ trợ tự động dựng cây tri thức, kiểm toán quan hệ cha-con, và chuẩn bị cho gộp nhiều vault.
  **Trạng thái**: `synced`

- **ID**: FB-009
  **Ngày**: 2026-05-24
  **Phản hồi/Quy tắc**: Ghi nhận triết lý cốt lõi phân biệt: "Framework viết cho lập trình viên dùng. Harness viết cho AI dùng." — Là kim chỉ nam cho mọi thiết kế trong vault.
  **Lý do**: Phát hiện từ phân tích video transcript 9 thành phần lõi Harness.
  **Trạng thái**: `synced`

- **ID**: FB-010
  **Ngày**: 2026-05-24
  **Phản hồi/Quy tắc**: Vault phải hỗ trợ nhận dữ liệu từ nhiều nguồn (website, video, paper...) — mỗi nguồn tạo cây tri thức riêng, đích cuối cùng là gom nhiều vault để phát hiện pattern liên domain.
  **Lý do**: Tầm nhìn dài hạn: mỗi vault = một domain → gộp → đan xen tri thức → tìm quy luật.
  **Trạng thái**: `synced`

- **ID**: FB-011
  **Ngày**: 2026-05-24
  **Phản hồi/Quy tắc**: Tuyệt đối chỉ dùng đường dẫn workspace-relative trong liên kết Markdown. KHÔNG đường dẫn tuyệt đối, KHÔNG `../` — vì repo có thể pull về bất kỳ đâu.
  **Lý do**: Đảm bảo tính di động (portability) của vault.
  **Trạng thái**: `synced`

- **ID**: FB-012
  **Ngày**: 2026-05-24
  **Phản hồi/Quy tắc**: Định nghĩa Harness trực quan: "Harness là môi trường được dựng lên để AI Agent nhảy lên đó hoạt động tự động, an toàn mà ít hoặc không cần con người phải can thiệp hay canh chừng".
  **Lý do**: Giúp định hình góc nhìn thực chất, hình tượng và dễ hiểu về vai trò tối thượng của Harness.
  **Trạng thái**: `synced`

- **ID**: FB-013
  **Ngày**: 2026-05-24
  **Phản hồi/Quy tắc**: Bắt buộc phải trình bày Kế hoạch (Plan Mode) và nhận được sự phê duyệt rõ ràng từ Người dùng trước khi tiến hành chỉnh sửa hoặc tạo mới tệp tin. Cấm tự ý sửa đổi chủ động.
  **Lý do**: Đảm bảo Người dùng kiểm soát hoàn toàn các thay đổi, tránh việc sửa đổi sai hướng gây tốn thời gian quay lui, tối ưu hóa sự an toàn hơn là tốc độ mù quáng.
  **Trạng thái**: `synced`

- **ID**: FB-014
  **Ngày**: 2026-05-31
  **Phản hồi/Quy tắc**: Chạy nạp dữ liệu (Ingestion Pipeline) tuần tự (Sequential) theo thứ tự thời gian sửa đổi (Chronological) và áp dụng cơ chế lọc ngữ cảnh động (Active Context Filtering) thay vì chạy song song (Parallel).
  **Lý do**: Tránh xung đột ghi (Race Conditions), chống chồng chéo tri thức chéo, giảm tải nhận thức và tối ưu hóa chi phí token bằng cách lọc nốt liên quan thông qua BM25/Fuzzy Match local trước khi gọi LLM.
  **Trạng thái**: `synced`
