# MRP Knowledge Engine — Công cụ Quản trị Tri thức & Hệ thống Cộng tác AI

> **Triết lý:** "Framework viết cho lập trình viên dùng. Harness viết cho AI dùng."

Hệ thống quản lý tri thức đa domain với pipeline xử lý tự động (MRP), skills chuyên gia AI, và vòng lặp phản hồi tự tiến hóa.

---

## 📑 Mục lục

1. [Kiến trúc Tổng quan](#-kiến-trúc-tổng-quan)
2. [Workflows — Làm gì trong tình huống nào?](#-workflows--làm-gì-trong-tình-huống-nào)
3. [CLI Commands — Lệnh gõ trong terminal](#-cli-commands--lệnh-gõ-trong-terminal)
4. [AI Skills (Slash Commands)](#-ai-skills-slash-commands)
5. [Memory & Feedback Loop](#-memory--feedback-loop)
6. [Ví dụ Luồng Làm Việc Thực Tế](#-ví-dụ-luồng-làm-việc-thực-tế)
7. [Cheatsheet Nhanh](#-cheatsheet-nhanh)

---

## 🏗 Kiến trúc Tổng quan

```
mrp-knowledge-engine/
├── vault/
│   ├── 00_raw_docs/         # Layer 1: Tài liệu thô, tổ chức theo domain subdir
│   │   ├── phat-hoc/        #   Mỗi thư mục con = 1 domain
│   │   │   └── RULE.md      #   Mỗi domain có RULE.md riêng
│   ├── 01_structured_docs/  # Layer 2: Tài liệu chắt lọc (Key Takeaways, Keywords, Summary)
│   ├── 02_atomic_nodes/     # Lõi tri thức: nốt nguyên tử phẳng + Causal Web
│   ├── 03_neural_map/       # INDEX.md + AI_ROUTING_TABLE.md (định tuyến AI)
│   ├── 04_distilled/        # Layer 3: Đúc kết vĩ mô, cross-domain synthesis
│   ├── 05_journal/          # Kế hoạch MRP Pipeline (mrp_plan_*.md)
│   ├── memory/              # Hồ sơ user, feedback, project context
│   └── Templates/           # Mẫu atomic node, structured doc
├── .agent/                  # AI Skills (analyzer, writer, auditor, qa-oracle)
├── scripts/                 # CLI tools (mrp_pipeline, validate, sync)
├── CLAUDE.md                # Hiến pháp AI (lazy-loading rules)
└── HARNESS_GUIDE.md         # Cẩm nang tra cứu thuật ngữ & MRP chi tiết
```

**Pipeline tri thức 4 lớp:**
```
00_raw_docs/ (thô) → 01_structured_docs/ (chắt lọc) → 02_atomic_nodes/ (nguyên tử) → 04_distilled/ (đúc kết)
```

---

## 🎯 Workflows — Làm gì trong tình huống nào?

### 🔵 Workflow 1: Nạp tri thức mới (Ingestion Pipeline)
**Khi nào:** Bạn có tài liệu thô mới (sách, bài giảng, ghi chép) muốn đưa vào hệ thống.

| Bước | Hành động | Tool/Skill | Kết quả |
|:---:|---|---|---|
| 1 | Đặt file `.md` vào `00_raw_docs/{domain}/` (hoặc root nếu legacy) | Thủ công | File thô có frontmatter YAML |
| 2 | Chạy pipeline: `python3 -m scripts.mrp_pipeline run --source <file>` | Terminal | Tạo structured doc + plan |
| 3 | Đọc plan tại `05_journal/mrp_plan_*.md` | Đọc file | Kế hoạch chi tiết |
| 4a | Nếu OK: `mrp approve -t <timestamp>` | Terminal | Tạo/sửa atomic nodes + verify |
| 4b | Nếu không: `mrp reject -t <timestamp>` | Terminal | Dọn dẹp, không thay đổi gì |
| 5 | Chạy audit: `python3 scripts/sync_rules_and_memory.py` | Terminal | Kiểm tra link gãy, cập nhật INDEX |

> **TIP:** Dùng `batch --dir . --auto-approve` để xử lý hàng loạt tự động.

---

### 🟢 Workflow 2: Tra cứu & Hỏi đáp Tri thức
**Khi nào:** Bạn muốn hỏi về 1 khái niệm, tìm mối liên hệ giữa các khái niệm.

| Bước | Hành động | Tool/Skill | Kết quả |
|:---:|---|---|---|
| 1 | Mở chat với AI | `/hae-qa-oracle` | AI vào chế độ QA |
| 2 | Đặt câu hỏi (vd: "Duyên khởi liên quan gì đến Tứ Thánh Đế?") | Chat | AI tra INDEX.md + atomic nodes |
| 3 | Nhận câu trả lời có dẫn chứng | Chat | Trả lời + link tới source |
| 4 | (Tự động) Phát hiện khoảng trống tri thức | QA Skill | Nếu thiếu → đề xuất tạo node mới |

> **TIP:** Luôn check `03_neural_map/INDEX.md` và `AI_ROUTING_TABLE.md` trước khi hỏi — thường có sẵn câu trả lời.

---

### 🟡 Workflow 3: Phân tích sâu một chủ đề
**Khi nào:** Chủ đề phức tạp, cần mổ xẻ nhiều khía cạnh, phản biện.

| Bước | Hành động | Tool/Skill | Kết quả |
|:---:|---|---|---|
| 1 | Gọi Analyzer | `/hae-analyzer` | AI vào chế độ Socratic |
| 2 | Thảo luận, AI đặt câu hỏi từng bước | Chat | Làm rõ vấn đề từng lớp |
| 3 | AI tổng hợp, so sánh phương án | Chat | Phân tích có chiều sâu |
| 4 | Nếu cần viết → chuyển Writer | `/hae-writer` | Tạo note chuẩn |

> **TIP:** Analyzer KHÔNG tự ý sửa file — chỉ phân tích và thảo luận.

---

### 🟠 Workflow 4: Viết & Cấu trúc hóa Note
**Khi nào:** Cần tạo atomic node mới, viết structured doc, cập nhật INDEX.

| Bước | Hành động | Tool/Skill | Kết quả |
|:---:|---|---|---|
| 1 | Chuẩn bị nội dung (thảo luận với Analyzer hoặc tự soạn) | `/hae-analyzer` hoặc tự soạn | Ý tưởng rõ ràng |
| 2 | Gọi Writer | `/hae-writer` | AI tạo node chuẩn (frontmatter + Causal Web) |
| 3 | Dùng template: `Templates/Atomic-Node-Template.md` | Tham khảo | Đảm bảo format |
| 4 | Update INDEX.md trong `03_neural_map/` | Thủ công hoặc nhờ AI | Node được index |

> **RULE:** Atomic node PHẢI có `parent`/`children` frontmatter + `## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)`.

---

### 🔴 Workflow 5: Kiểm toán & Bảo trì Vault
**Khi nào:** Trước khi commit git, hoặc định kỳ (1-2 tuần/lần).

| Bước | Hành động | Tool/Skill | Kết quả |
|:---:|---|---|---|
| 1 | Validate domain raw docs | `python3 scripts/validate_raw_docs.py` | Phát hiện file sai folder |
| 2 | Đồng bộ feedback + audit | `python3 scripts/sync_rules_and_memory.py` | Sửa link gãy, đồng bộ rules |
| 3 | Nếu có lỗi → gọi Auditor | `/hae-auditor` | AI sửa lỗi tự động |
| 4 | (Nếu có domain mới) Tạo thư mục + RULE.md | Thủ công | Cấu trúc sẵn sàng |

> **TIP:** Chạy cả 3 bước 1, 2 trước mỗi lần commit để vault luôn sạch.

---

### 🟣 Workflow 6: Thêm Domain mới vào Hệ thống
**Khi nào:** Bạn muốn đưa sách chuyên ngành mới vào (Khoa học máy tính, Tâm lý học, ...).

| Bước | Hành động | Tool/Skill | Kết quả |
|:---:|---|---|---|
| 1 | Tạo thư mục: `00_raw_docs/{domain-slug}/` | Thủ công | Thư mục domain mới |
| 2 | Tạo `00_raw_docs/{domain-slug}/RULE.md` | Làm theo mẫu `loi_phat_day/RULE.md` | Quy tắc riêng cho domain |
| 3 | Đặt file .md vào thư mục, có frontmatter `domain: {slug}` | Thủ công | File thô sẵn sàng |
| 4 | Kiểm tra: `python3 scripts/validate_raw_docs.py` | Terminal | Xác nhận đúng cấu trúc |
| 5 | Chạy Ingestion (Workflow 1) | `mrp run ...` | Nạp tri thức tự động |

> **Ví dụ:** Thêm domain "Khoa học máy tính" → `00_raw_docs/khoa-hoc-may-tinh/` + `RULE.md` riêng.

---

## 💻 CLI Commands — Lệnh gõ trong terminal

### MRP Pipeline (Nạp tri thức)

```bash
# Chạy pipeline cho 1 file thô
python3 -m scripts.mrp_pipeline run --source sutta-mn-001.md

# Chạy batch tất cả file thô chưa xử lý, CÓ approve thủ công
python3 -m scripts.mrp_pipeline batch

# Chạy batch TỰ ĐỘNG (không cần duyệt từng plan)
python3 -m scripts.mrp_pipeline batch --auto-approve

# Phê duyệt kế hoạch và thực thi
python3 -m scripts.mrp_pipeline approve --timestamp 20260601_194431

# Từ chối kế hoạch và dọn dẹp
python3 -m scripts.mrp_pipeline reject --timestamp 20260601_194431
```

### Kiểm toán & Đồng bộ

```bash
# Validate domain trong 00_raw_docs/ (phát hiện file sai thư mục)
python3 scripts/validate_raw_docs.py

# Đồng bộ feedback + kiểm tra link gãy + tree integrity
python3 scripts/sync_rules_and_memory.py
```

---

## 🤖 AI Skills (Slash Commands)

Các skill được định nghĩa trong `.agent/` và kích hoạt bằng lệnh `/` trong chat với Claude:

| Skill | Lệnh | Khi nào dùng | File |
|:---|:---:|---|---|
| **Phân tích Sâu** | `/hae-analyzer` | Chủ đề phức tạp, cần mổ xẻ Socratic, phản biện, so sánh phương án | [.agent/hae-analyzer.md](.agent/hae-analyzer.md) |
| **Viết Note** | `/hae-writer` | Cần tạo atomic node / structured doc chuẩn format (frontmatter + Causal Web) | [.agent/hae-writer.md](.agent/hae-writer.md) |
| **Kiểm toán** | `/hae-auditor` | Cần kiểm tra link gãy, parent/children, đồng bộ rules | [.agent/hae-auditor.md](.agent/hae-auditor.md) |
| **Hỏi đáp** | `/hae-qa-oracle` | Muốn hỏi về tri thức trong vault, cần dẫn chứng từ atomic nodes | [.agent/hae-qa-oracle.md](.agent/hae-qa-oracle.md) |

> **Cách dùng:** Gõ `/hae-analyzer` + mô tả vấn đề. AI sẽ chuyển sang chế độ của skill đó.

---

## 🧠 Memory & Feedback Loop

### Cấu trúc Memory (`vault/memory/`)

| File | Mục đích |
|:---|:---|
| `user_profile.md` | Hồ sơ người dùng (vai trò, expertise, sở thích) |
| `project_context.md` | Roadmap, trạng thái dự án, mục tiêu |
| `feedback_log.md` | Nhật ký phản hồi (status: pending-sync → synced) |
| `MEMORY.md` | Index các memory files |
| `RULE.md` | Quy tắc vận hành memory |

### Vòng Lặp Phản Hồi (Closed Feedback Loop)

```
Bạn feedback (chat) → AI ghi vào feedback_log.md (pending-sync)
→ python3 scripts/sync_rules_and_memory.py → Cập nhật CLAUDE.md
→ feedback_log.md chuyển sang (synced)
```

---

## 🎯 Ví dụ Luồng Làm Việc Thực Tế

### Scenario 1: "Tôi mới có 1 file sách gốc, muốn nạp vào hệ thống"

```bash
# 1. Copy file vào thư mục domain tương ứng
cp sach-moi.md vault/00_raw_docs/phat-hoc/

# 2. Thêm frontmatter (nếu chưa có)
# ---
# title: "Sách Mới"
# domain: phat-hoc
# status: to-process
# ---

# 3. Chạy pipeline
python3 -m scripts.mrp_pipeline run --source phat-hoc/sach-moi.md

# 4. Đọc plan ở 05_journal/mrp_plan_*.md
# 5. Nếu OK:
python3 -m scripts.mrp_pipeline approve -t <timestamp>

# 6. Kiểm tra
python3 scripts/validate_raw_docs.py
python3 scripts/sync_rules_and_memory.py
```

### Scenario 2: "Tôi muốn hiểu mối quan hệ giữa Duyên Khởi và Vô Ngã"

→ Dùng `/hae-qa-oracle`, đặt câu hỏi: "Phân tích mối quan hệ giữa Duyên Khởi và Vô Ngã trong Phật học"

AI sẽ: tra `03_neural_map/INDEX.md` → đọc `HAE-concept-duyen-khoi.md` và `HAE-concept-vo-nga.md` → phân tích Causal Web → trả lời có dẫn chứng.

### Scenario 3: "Tôi muốn thêm domain mới: Khoa học Máy tính"

```bash
# 1. Tạo thư mục
mkdir vault/00_raw_docs/khoa-hoc-may-tinh/

# 2. Copy RULE.md mẫu và sửa
cp vault/00_raw_docs/loi_phat_day/RULE.md vault/00_raw_docs/khoa-hoc-may-tinh/
# Sửa nội dung: tên domain, quy tắc đặt tên file, ...

# 3. Đặt file thô
echo "---\ntitle: \"Intro to CS\"\ndomain: khoa-hoc-may-tinh\nstatus: to-process\n---" > vault/00_raw_docs/khoa-hoc-may-tinh/intro.md

# 4. Validate
python3 scripts/validate_raw_docs.py
```

---

## 📋 Cheatsheet Nhanh

```text
📥 NẠP TRI THỨC MỚI:
  python3 -m scripts.mrp_pipeline run --source <file>
  python3 -m scripts.mrp_pipeline batch --auto-approve
  python3 -m scripts.mrp_pipeline approve -t <timestamp>
  python3 -m scripts.mrp_pipeline reject -t <timestamp>

🔍 KIỂM TOÁN:
  python3 scripts/validate_raw_docs.py
  python3 scripts/sync_rules_and_memory.py

🤖 AI SKILLS (trong chat):
  /hae-analyzer    — Phân tích sâu, Socratic
  /hae-writer      — Viết atomic node/structured doc
  /hae-auditor     — Kiểm toán vault
  /hae-qa-oracle   — Hỏi đáp tri thức

🛠 TS ENGINE TOOLS (trong shell pnpm start):
  /scan            — Quét domain subdirs 00_raw_docs/
  /domain          — Liệt kê domain & stats
  /graph           — Xem cây tri thức ASCII từ atomic nodes
  /status          — Tổng quan toàn Vault
  /doctor          — Chạy full diagnostics (domain + sync + node_modules + .env)
  /run             — Chọn & chạy pipeline
  /guide           — Hướng dẫn vận hành MRP

🗂 THÊM DOMAIN MỚI:
  1. mkdir vault/00_raw_docs/{domain}/
  2. Tạo RULE.md (copy từ domain có sẵn)
  3. python3 scripts/validate_raw_docs.py (xác nhận)
  4. Chạy pipeline để nạp file đầu tiên

🧠 MEMORY:
  vault/memory/feedback_log.md — Ghi nhận phản hồi mới
  python3 scripts/sync_rules_and_memory.py — Đồng bộ
```

---

## 📚 Tài liệu Tham khảo

| Tài liệu | Mô tả |
|:---|---:|
| [CLAUDE.md](CLAUDE.md) | Hiến pháp AI: Bảng định tuyến lazy-loading rules |
| [HARNESS_GUIDE.md](HARNESS_GUIDE.md) | Cẩm nang chi tiết: thuật ngữ, MRP 6-pha, template branch |
| [vault/RULE.md](vault/RULE.md) | Hiến pháp vault: cách đọc nốt, Causal Web traversal |
| [.agent/hae-analyzer.md](.agent/hae-analyzer.md) | Chi tiết skill Analyzer (Socratic mode) |
| [.agent/hae-writer.md](.agent/hae-writer.md) | Chi tiết skill Writer (atomic node guidelines) |
| [.agent/hae-auditor.md](.agent/hae-auditor.md) | Chi tiết skill Auditor (6 workflow kiểm toán) |
| [.agent/hae-qa-oracle.md](.agent/hae-qa-oracle.md) | Chi tiết skill QA Oracle (QA + self-evolution) |
| [scripts/mrp_pipeline/cli.py](scripts/mrp_pipeline/cli.py) | Mã nguồn CLI pipeline |
| [scripts/validate_raw_docs.py](scripts/validate_raw_docs.py) | Script validate domain raw docs |
| [scripts/sync_rules_and_memory.py](scripts/sync_rules_and_memory.py) | Script đồng bộ feedback + audit |
