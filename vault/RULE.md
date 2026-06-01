# vault/RULE.md — Hiến pháp Tối cao của Kho Tri thức

Tài liệu này là **Hiến pháp Tối cao** của toàn bộ Vault Tri thức (Knowledge Vault). Bất kỳ LLM Engine nào (Claude, ChatGPT, Gemini, DeepSeek, hoặc bot tự xây) khi truy cập vào Vault này **bắt buộc phải tuân thủ các quy tắc dưới đây**.

---

## 🧭 1. Triết lý Kiến trúc: Đồ thị phẳng (Flat Graph View)

- Tri thức được tổ chức dưới dạng **Đồ thị phẳng** — tất cả các nốt nguyên tử (atomic nodes) đều nằm trong một thư mục duy nhất: `02_atomic_nodes/`. Không có thư mục con để phân cấp.
- Quan hệ **Cha - Con** được thể hiện qua hai trường `parent` và `children` trong YAML frontmatter của mỗi nốt.
- Quan hệ **Nhân - Duyên - Quả** được thể hiện qua phần `Causal Web` ở cuối mỗi nốt.

---

## 💡 2. Quy tắc Vàng: "Đọc nốt trước, truy ngược dòng sau"

Khi AI cần tìm hiểu một khái niệm trong Vault:

1. **Bước 1 (Luôn luôn):** Tra cứu `03_neural_map/INDEX.md` và `AI_ROUTING_TABLE.md` để xác định khái niệm liên quan. Chỉ lấy các nốt nguyên tử tương ứng.
2. **Bước 2 (Nốt nguyên tử trước):** Đọc nốt nguyên tử tại `02_atomic_nodes/`. Mỗi nốt có 3 phần thông tin chính:
   - **💡 Định nghĩa & Nội dung Cốt lõi:** 2-3 câu định nghĩa súc tích, sắc bén — đây là phần quan trọng nhất mà AI phải hiểu.
   - **🌳 Mạng lưới Nhân Duyên Quả (Causal Web):** Liên kết ngang tới các khái niệm nguồn gốc (Causal Core), khái niệm bổ trợ (Supporting Conditions), và khái niệm phái sinh (Derivative Effects). **Dùng Causal Web để "nhảy" giữa các nốt thay vì quét toàn bộ kho tài liệu.**
   - 🔗 **Liên kết ngược dòng:** Trỏ về `01_structured_docs/` và `00_raw_docs/`.

3. **Bước 3 (Chỉ khi cần):** Nếu định nghĩa trong nốt nguyên tử KHÔNG đủ chi tiết, truy ngược dòng về `01_structured_docs/` đọc bản chắt lọc cấu trúc của nguồn dữ liệu gốc.

4. **Bước 4 (Rất hiếm):** Nếu cần nguyên văn tài liệu gốc, truy tiếp về `00_raw_docs/`.

> **⚠️ Công thức tối ưu Token:**
> Đọc `02_atomic_nodes/` = ~200-500 tokens.
> Đọc `01_structured_docs/` = ~1,000-2,000 tokens.
> Đọc `00_raw_docs/` = ~3,000-15,000 tokens.
> **Luôn bắt đầu từ nốt nguyên tử trước khi tăng dần mức chi tiết!**

---

## 🗂️ 3. Cấu trúc Thư mục Vault

| Thư mục | Vai trò | Độ ưu tiên đọc | Kích thước trung bình |
|---|---|---|---|
| `02_atomic_nodes/` | Nốt nguyên tử (Khái niệm tối giản nhất) | ✅ Luôn đọc trước | ~0.5-1.5 kB |
| `01_structured_docs/` | Tài liệu chắt lọc cấu trúc theo YAML | ✅ Chỉ khi cần thêm | ~3-5 kB |
| `00_raw_docs/` | Tài liệu thô gốc | ❌ Chỉ khi cần nguyên văn | ~5-20 kB |
| `03_neural_map/` | Bản đồ chỉ mục & Định tuyến AI | ✅ Đọc 1 lần | ~5 kB |
| `04_distilled/` | Đúc kết vĩ mô & Tuyên ngôn Harness | ✅ Đọc khi cần tổng quan | ~8 kB |
| `memory/` | Bộ nhớ cộng tác & Hồ sơ người dùng | ✅ Nếu có | ~3 kB |

---

## 🔗 4. Cách đọc Liên kết Causal Web

**Cấu trúc Causal Web chuẩn:**
```markdown
## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core)**: [Tên khái niệm gốc](02_atomic_nodes/HAE-concept-{slug}.md) — Giải thích tại sao nốt này là nhân.
- **Hội tụ Duyên (Supporting Conditions)**: [Tên khái niệm bổ trợ](02_atomic_nodes/HAE-concept-{slug}.md) — Mô tả duyên hỗ trợ.
- **Quả chuyển hóa (Derivative Effects)**: [Tên khái niệm phái sinh](02_atomic_nodes/HAE-concept-{slug}.md) — Mô tả hậu quả hoặc sự kế thừa.
```

**Cách dùng Causal Web để điều hướng:**
- Khi AI đọc 1 nốt, hãy đọc luôn Causal Web của nó. Ví dụ: Nốt A có Causal Core trỏ tới nốt B, hãy nhảy sang nốt B để hiểu gốc rễ sâu hơn.
- Đây gọi là **"Horizontal Graph Traversal"** — tiết kiệm token hơn so với việc gửi toàn bộ kho dữ liệu vào context.
- Chỉ khi AI đã đọc tất cả nốt liên quan qua Causal Web mà vẫn chưa đủ chi tiết thì mới truy ngược dòng.

---

## 📋 5. Các RULE.md cục bộ

- [Quy tắc Nốt Nguyên tử](02_atomic_nodes/RULE.md) — Cấu trúc chi tiết của mỗi nốt.
- [Quy tắc Định tuyến AI](03_neural_map/RULE.md) — Cách định tuyến và tra cứu bản đồ.
- [Quy tắc Tài liệu Cấu trúc](01_structured_docs/RULE.md) — Cách chắt lọc tài liệu thô.
- [Quy tắc Tài liệu Thô](00_raw_docs/RULE.md) — Cách quản lý và đánh dấu dữ liệu.
- [Quy tắc Bộ nhớ & Feedback](memory/RULE.md) — Cách ghi nhận phản hồi và quản lý bối cảnh con người.

---

*Hiến pháp Vault này đảm bảo bất kỳ AI Engine nào cũng có thể làm việc hiệu quả và tối ưu token với kho tri thức Harness MRP, mà không cần biết trước về CLAUDE.md hay bất kỳ cấu hình hệ thống nào.*
