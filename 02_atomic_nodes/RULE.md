# 02_atomic_nodes/RULE.md - Quy tắc Vận hành Nốt Nguyên tử (Lớp Lõi Tri Thức)

Quy tắc này quản lý việc phân rã, lưu trữ phẳng, xây dựng mối quan hệ cha-con và liên kết chéo cho các nốt tri thức nguyên tử siêu nhỏ.

## 📋 Quy tắc Cốt lõi

### 1. Nguyên lý Thiết kế & Phân rã
- **Tính đơn nhất (Singularity):** Một nốt chỉ được giải thích duy nhất một khái niệm độc lập. Nếu phát hiện khái niệm thứ hai xen vào → bắt buộc phải tách ra nốt mới.
- **Mở rộng, không Nén (Tree Expansion Model):** Tri thức phải PHÁT TRIỂN thành cây (gốc → nhánh → lá). Không gom chung nhiều khái niệm khác nhau vào một node để tiết kiệm file. Mỗi nguồn dữ liệu thô tạo ra một cây tri thức riêng biệt.
- **Lưu trữ PHẲNG (Flat Storage):** Tất cả các node (root node và sub-node) đều được đặt phẳng trong thư mục `02_atomic_nodes/`. KHÔNG tạo thư mục con để phân cấp. Quan hệ cha-con thể hiện hoàn toàn bằng link markdown và metadata frontmatter.

### 2. YAML Frontmatter & Truy vết Cây
Mỗi nốt nguyên tử bắt buộc phải khai báo quan hệ cha-con trong frontmatter để hỗ trợ máy truy vết tự động:
```yaml
---
id: HAE-concept-{{slug}}
title: "{{tên-khái-niệm-rõ-ràng}}"
category: "{{danh-mục-phân-loại}}"
tags:
  - {{slug-thẻ}}
date: 2026-05-24
parent: {{slug-node-cha-hoặc-null}}
children:
  - {{slug-node-con-1}}
  - {{slug-node-con-2}} # Để trống hoặc omit nếu không có con
---
```

### 3. Cấu trúc Nội dung Node
Mỗi node phải tuân theo cấu trúc phẳng, cực kỳ súc tích:
- `# {Title}`
- `## 💡 Định nghĩa & Nội dung Cốt lõi` — Tối đa 2-3 câu định nghĩa ngắn gọn, sắc bén.
- `## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn` — Các bullet point giải thích chi tiết cơ chế hoạt động kỹ thuật.
- `## 🌳 Nốt con (Sub-Nodes)` — (Chỉ có ở Node gốc) Danh sách liên kết đến các node con kèm mô tả ngắn 1 câu.
- `## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)` — Chứa 3 loại liên kết nhân quả bắt buộc kèm mô tả động sau dấu gạch ngang (`—`):
  1. **Nhân gốc (Causal Core)**: Trỏ tới khái niệm gốc trực tiếp sinh ra nốt hiện tại.
  2. **Hội tụ Duyên (Supporting Conditions)**: Trỏ tới các nốt bổ trợ, môi trường hoặc công cụ kỹ thuật cần thiết.
  3. **Quả chuyển hóa (Derivative Effects)**: Trỏ tới các nốt giải pháp hoặc nốt nâng cao được nốt hiện tại mở đường phát sinh.
- **Liên kết ngược dòng & xuôi dòng bắt buộc:**
  - **Dẫn chứng & Nguồn gốc (Evidence & Context)**: Trỏ trực tiếp về `01_structured_docs/` và `00_raw_docs/`.
  - **Đúc kết vĩ mô (Distilled Thoughts)**: Trỏ tới Manifesto ở `04_distilled/`.

### 4. Định dạng Đường Dẫn
- **Tuyệt đối chỉ dùng Workspace-Relative:** Chỉ dùng đường dẫn tương đối từ gốc vault.
  - Định dạng ĐÚNG: `[Outer Loop](02_atomic_nodes/HAE-concept-outer-loop.md)`
  - Định dạng SAI: Không được chứa dấu gạch chéo đầu (như `/02_atomic_nodes/`) hoặc chứa đường dẫn tương đối leo ngược (như `../02_atomic_nodes/`).

*   **Định nghĩa Harness trực quan: "Harness là môi trường được dựng lên để AI Agent nhảy lên đó hoạt động tự động, an toàn mà ít hoặc không cần con người phải can thiệp hay canh chừng".** (Được phát hiện vào 2026-05-24 từ FB-012).

---
*Quy tắc này định hình tính toàn vẹn của đồ thị Obsidian Graph View và đảm bảo tính portable cho toàn bộ hệ thống tri thức.*
