# Kho Tri Thức & Hệ Thống Cộng Tác Harness Engineering (HAE Wiki Vault)

Chào mừng bạn đến với Kho Tri Thức và Hệ Thống Cộng Tác **Harness Engineering** (Kỹ nghệ Thiết kế Môi trường cho AI Agent). Đây là một Obsidian Vault được cấu trúc phân cấp khoa học bằng **tiền tố 2 chữ số**, tối ưu hóa tuyệt đối cho việc hiển thị trực quan mạng lưới tri thức trên **Obsidian Graph View** và tích hợp cơ chế tự động tiến hóa quy tắc làm việc cho AI Agent.

---

## 🌟 Tính Năng Nổi Bật của Hệ Thống

1.  **Cấu trúc Phân cấp Tiền tố 2 Chữ số**: Luồng tri thức chảy rõ ràng từ thô (Layer 1) -> cấu trúc (Layer 2) -> nốt nguyên tử cô đọng -> mạng liên kết thần kinh -> đúc kết sâu (Layer 3).
2.  **Đồ thị Liên kết Ngược dòng Dẫn chứng (Evidence Graph)**: Mọi nốt nguyên tử tri thức siêu nhỏ đều liên kết trực tiếp ngược dòng về tài liệu cấu trúc và tài liệu thô ban đầu, giúp người dùng dễ dàng truy vết dẫn chứng thực tế của khái niệm từ Graph View.
3.  **Hệ thống 3 Trụ Cột (RULE - SKILL - MEMORY)**: Biến vault này thành một Harness thực tế giúp AI Agent và con người cộng tác chuyên nghiệp như hai đồng nghiệp chuyên gia.
4.  **Vòng Lặp Phản Hồi Tự Tiến Hóa (Closed Feedback Loop)**: Tích hợp script Python tự động hóa cập nhật các phản hồi và quy tắc mới của bạn trực tiếp vào hiến pháp `CLAUDE.md`.

---

## 📂 Cấu trúc Thư Mục Chi Tiết

```text
harness-engineering/
├── 00_raw_docs/                 # Layer 1: Nội dung thô của 13 bài học cào về
├── 01_structured_docs/          # Layer 2: Bài học đã phân tích chắt lọc cấu trúc
├── 02_atomic_nodes/             # Nốt nguyên tử độc lập, không trùng lặp, đầy đủ liên kết chéo
├── 03_neural_map/               # Chỉ mục INDEX.md và bảng định tuyến AI_ROUTING_TABLE.md
├── 04_distilled/                # Layer 3: Tuyên ngôn Harness Engineering và đúc kết sâu sắc
├── 05_journal/                  # Nhật ký làm việc hàng ngày
├── .agent/                      # SKILLS: Workflow chuyên nghiệp (Analyzer, Writer, Auditor)
├── memory/                      # MEMORY: Bộ nhớ bối cảnh (user_profile, feedback_log)
├── scripts/                     # SCRIPTS: Công cụ cào dữ liệu và tự đồng bộ hóa quy tắc
└── Templates/                   # Các tệp mẫu Obsidian chuẩn hóa
```

---

## 🚀 Hướng Dẫn Sử Dụng & Vận Hành

### 1. Dành cho Con Người (Mở bằng Obsidian)
- Tải thư mục này về máy.
- Mở Obsidian, chọn **Open folder as vault** và trỏ tới thư mục `harness-engineering`.
- Bật **Graph View** để chiêm ngưỡng mạng lưới liên kết tri thức tuyệt đẹp và khoa học giữa các nốt nguyên tử và dẫn chứng nguồn của chúng.

### 2. Chạy Script Tự động Kiểm toán & Đồng bộ hóa Quy tắc
Mỗi khi bạn đưa ra quy định mới trong chat, Agent sẽ ghi nhận vào `memory/feedback_log.md` dưới dạng `status: pending-sync`. Để tự động cập nhật quy tắc này vào hiến pháp `CLAUDE.md` và kiểm toán toàn bộ liên kết của Vault, hãy chạy lệnh:
```bash
python3 scripts/sync_rules_and_memory.py
```

### 3. Quy trình thêm một Ghi chú mới đúng chuẩn
- Ghi nhận thông tin thô vào `00_raw_docs/`.
- Chắt lọc tóm tắt và ghi nhận vào `01_structured_docs/`.
- Phân rã tri thức độc nhất thành nốt nguyên tử tại `02_atomic_nodes/` dựa trên `Templates/Atomic-Node-Template.md`.
- Cập nhật chỉ mục định tuyến tại `03_neural_map/` và chạy script đồng bộ hóa để kiểm tra.
