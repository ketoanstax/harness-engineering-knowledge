#!/usr/bin/env python3
import os

VAULT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ATOMIC_DIR = os.path.join(VAULT_ROOT, "02_atomic_nodes")
os.makedirs(ATOMIC_DIR, exist_ok=True)

ATOMIC_NODES_DATA = [
    {
        "slug": "harness-definition",
        "title": "Định nghĩa Harness thực sự trong AI Agent Systems",
        "category": "Harness Core Concept",
        "tags": ["harness-definition", "system-design", "agent-safety"],
        "definition": "Harness (Khung gá lắp) không đơn thuần là một file prompt dài. Nó là một hệ sinh thái các công cụ, quy tắc, bộ kiểm thử và kiểm soát trạng thái bao quanh AI Agent, định hình ranh giới hoạt động an toàn và hiệu quả cho Agent.",
        "principles": [
            "Harness là giá đỡ nhận thức: LLM cực kỳ thông minh nhưng bị giới hạn bởi bộ nhớ ngữ cảnh và dễ bị lạc lối. Harness cung cấp cấu trúc ổn định xung quanh Agent.",
            "Ranh giới an toàn (Blast Radius): Thiết lập các file, thư mục và quyền shell hạn chế để Agent tự do khám phá và sửa đổi mà không đe dọa đến tính toàn vẹn của hệ thống.",
            "Vòng phản hồi (Feedback Loops): Harness tự động trả về phản hồi từ kết quả chạy test, biên dịch, kiểm tra cú pháp để Agent tự điều chỉnh hành vi liên tục."
        ],
        "peers": ["system-of-record", "agent-overreach"],
        "source_slug": "lecture-02-what-a-harness-actually-is",
        "source_title": "Lecture 02 - Harness thực sự là gì"
    },
    {
        "slug": "system-of-record",
        "title": "Repository là Nguồn Sự Thật Duy Nhất (System of Record)",
        "category": "Harness Core Concept",
        "tags": ["system-of-record", "git-truth", "context-preservation"],
        "definition": "Lịch sử trò chuyện (Chat history) là tạm thời và sẽ bị nén hoặc mất đi. Git Repository của dự án phải là nguồn lưu trữ tri thức và bối cảnh vĩnh viễn (System of Record) cho cả Con người và AI Agent.",
        "principles": [
            "Quy tắc và tri thức tự giải thích: Bất kỳ quy định đặc thù, quyết định thiết kế hay bài học xương máu nào cũng phải được commit trực tiếp vào repository (dưới dạng CLAUDE.md hoặc tài liệu khác).",
            "Môi trường là bối cảnh: Trạng thái hiện tại của thư mục làm việc (mã nguồn, file config) phản ánh chính xác nhất thực tế mà Agent nhìn thấy. Không dùng chat làm nơi chứa tài liệu tham khảo dài lâu.",
            "Tự động nạp bối cảnh: Khi bắt đầu một phiên làm việc mới, Agent chỉ cần quét thư mục hiện hành là có thể hiểu ngay cấu trúc dự án và quy tắc làm việc mà không cần nhắc lại."
        ],
        "peers": ["harness-definition", "instruction-file-pitfall"],
        "source_slug": "lecture-03-why-the-repository-must-become-the-system-of-record",
        "source_title": "Lecture 03 - Tại sao Repository phải trở thành Nguồn sự thật"
    },
    {
        "slug": "instruction-file-pitfall",
        "title": "Tránh bẫy File Hướng Dẫn Khổng Lồ",
        "category": "Cognitive Management",
        "tags": ["claudemd-pitfall", "cognitive-load", "knowledge-splitting"],
        "definition": "Dồn tất cả các quy tắc và hướng dẫn vào một file chỉ dẫn duy nhất (như CLAUDE.md quá lớn) sẽ gây ra tình trạng quá tải nhận thức cho Agent, làm loãng ngữ cảnh và khiến Agent bỏ qua các quy tắc quan trọng.",
        "principles": [
            "Giới hạn nhận thức: Agent chỉ có khả năng xử lý hiệu quả một lượng từ khóa giới hạn trong mỗi turn. File quá to khiến mô hình bị phân tâm.",
            "Phân tách tri thức nguyên tử: Chia nhỏ các quy tắc thành các tệp tin chuyên đề độc lập (ví dụ: trong thư mục .agent/ hoặc 02_atomic_nodes/).",
            "Thiết lập bảng định tuyến: Giữ CLAUDE.md ở quy mô nhỏ gọn, chỉ đóng vai trò 'hiến pháp' cốt lõi và chứa liên kết điều hướng tới các nốt kiến thức chi tiết."
        ],
        "peers": ["system-of-record", "session-continuity"],
        "source_slug": "lecture-04-why-one-giant-instruction-file-fails",
        "source_title": "Lecture 04 - Tại sao một file hướng dẫn khổng lồ lại thất bại"
    },
    {
        "slug": "session-continuity",
        "title": "Bảo Toàn Tính Liên Tục Trong Tác Vụ Dài Hạn",
        "category": "Task Management",
        "tags": ["task-continuity", "state-loss", "checkpoints"],
        "definition": "Các tác vụ phần mềm lớn chạy trong nhiều giờ rất dễ bị đứt gãy do Agent bị mất bối cảnh (context resets) hoặc trôi bộ nhớ. Cần cơ chế lưu trạng thái phiên làm việc (Session Checkpoints) bền vững để duy trì tính liên tục.",
        "principles": [
            "Lưu trạng thái lên đĩa cứng: Ghi nhận tiến độ làm việc, các file đã thay đổi, các lỗi đang xử lý trực tiếp vào file log/checkpoint trên workspace.",
            "Khởi tạo tự phục hồi: Khi phiên làm việc bị ngắt quãng hoặc Agent khởi động lại, bước đầu tiên của nó là đọc checkpoint và tiếp tục công việc tại điểm dừng trước đó.",
            "Checklist động: Cập nhật danh sách công việc thời gian thực (Todo list) giúp Agent luôn biết rõ mình đã làm gì, đang làm gì và cần làm gì tiếp theo."
        ],
        "peers": ["instruction-file-pitfall", "initialization-phase"],
        "source_slug": "lecture-05-why-long-running-tasks-lose-continuity",
        "source_title": "Lecture 05 - Tại sao các tác vụ dài hạn lại mất tính liên tục"
    },
    {
        "slug": "initialization-phase",
        "title": "Sự Cần Thiết Của Giai Đoạn Khởi Tạo (Plan Mode)",
        "category": "Workflow Architecture",
        "tags": ["initialization-phase", "plan-mode", "exploration-first"],
        "definition": "Bắt Agent viết code hoặc sửa đổi dự án ngay lập tức khi chưa hiểu rõ bối cảnh là nguyên nhân hàng đầu gây ra lỗi hệ thống. Quy trình làm việc bắt buộc phải phân tách riêng pha Khởi tạo / Lập kế hoạch (Plan Mode) độc lập.",
        "principles": [
            "Pha Đọc & Tìm hiểu (Read-only Phase): Dành 1-3 turn đầu tiên chỉ để khám phá cấu trúc mã nguồn, định vị các tệp tin load-bearing và tìm kiếm các mẫu thiết kế sẵn có.",
            "Tạo Kế hoạch trước khi Viết code: Yêu cầu Agent phác thảo kế hoạch sửa đổi cụ thể vào một file kế hoạch chuyên biệt và trình Con người phê duyệt trước khi gọi bất kỳ công cụ Edit/Write nào.",
            "Ngăn chặn phản xạ vội vã: Kìm hãm thói quen tự ý sinh code tự động của LLM để đảm bảo tính nhất quán của hệ thống."
        ],
        "peers": ["session-continuity", "agent-overreach"],
        "source_slug": "lecture-06-why-initialization-needs-its-own-phase",
        "source_title": "Lecture 06 - Tại sao quá trình khởi tạo cần một giai đoạn riêng"
    },
    {
        "slug": "agent-overreach",
        "title": "Kiểm Soát Phạm Vi Ảnh Hưởng & Lỗi Tự Ý Sửa Code (Agent Overreach)",
        "category": "Guardrails & Safety",
        "tags": ["agent-overreach", "blast-radius", "code-integrity"],
        "definition": "Agent thường có xu hướng tự ý refactor các file không liên quan, sửa đổi tràn lan ngoài phạm vi yêu cầu (overreach) hoặc ngược lại, để lại code rỗng hoặc bình luận dang dở (under-finish).",
        "principles": [
            "Hạn chế Blast Radius: Thiết lập các luật chỉ định rõ ràng Agent chỉ được phép sửa đúng các tệp tin nằm trong phạm vi kế hoạch đã duyệt.",
            "Cấm code dang dở (No under-finish): Tuyệt đối cấm Agent sử dụng các comment dạng '// TODO: viết tiếp' hoặc để lại các thân hàm trống rỗng. Mọi thay đổi phải hoàn chỉnh 100%.",
            "Tập trung tối đa (Targeted Edits): Chỉ sửa đúng chỗ được yêu cầu, không thực hiện các chỉnh sửa định dạng, styling unsolicited ở các file xung quanh làm nhiễu git diff."
        ],
        "peers": ["initialization-phase", "feature-list-primitive"],
        "source_slug": "lecture-07-why-agents-overreach-and-under-finish",
        "source_title": "Lecture 07 - Tại sao Agent làm quá giới hạn và chưa hoàn thành"
    },
    {
        "slug": "feature-list-primitive",
        "title": "Danh Mục Tính Năng (Feature List) - Thực Thể Nguyên Thủy Của Harness",
        "category": "Workflow Architecture",
        "tags": ["feature-list", "alignment", "task-tracking"],
        "definition": "Feature List không đơn thuần là một danh sách TODO. Nó là thực thể neo giữ và đồng bộ bối cảnh làm việc giữa Agent và Con người, đảm bảo tính tập trung tuyệt đối vào một nhiệm vụ duy nhất tại một thời điểm.",
        "principles": [
            "Nguyên tắc Một Task Duy Nhất (Single Task Rule): Tại một thời điểm, chính xác chỉ có duy nhất 1 task trong Feature List được chuyển sang trạng thái `in_progress`.",
            "Định nghĩa rõ ràng (Imperative & Active Forms): Mọi task phải được mô tả chi tiết cả ở dạng mệnh lệnh (để hiểu yêu cầu) và dạng tiếp diễn (để hiển thị tiến trình đang thực thi).",
            "Đồng thuận tuyệt đối: Giữ cho danh sách này cập nhật liên tục để người dùng luôn biết Agent đang làm gì và Agent tự kiểm soát được việc không bị xao nhãng."
        ],
        "peers": ["agent-overreach", "early-victory"],
        "source_slug": "lecture-08-why-feature-lists-are-harness-primitives",
        "source_title": "Lecture 08 - Tại sao Feature List là nguyên lý cốt lõi của Harness"
    },
    {
        "slug": "early-victory",
        "title": "Khắc Phục Hiện Tượng Tuyên Bố Thành Công Quá Sớm của Agent",
        "category": "Verification",
        "tags": ["early-victory", "false-positives", "verification-gate"],
        "definition": "Agent thường có xu hướng 'tự mãn' tuyên bố tính năng đã hoàn thành ngay khi viết xong code mà chưa qua bất kỳ bước chạy thực tế hay kiểm thử logic nào. Harness cần thiết lập các chốt chặn xác thực bắt buộc.",
        "principles": [
            "Phân tách Viết code và Xác thực: Viết code xong mới chỉ là 50% chặng đường. 50% còn lại thuộc về việc chứng minh code đó hoạt động chính xác.",
            "Cấm tự xác nhận lý thuyết: Agent không được phép tự tuyên bố thành công dựa trên lập luận lý thuyết. Phải có dẫn chứng thực tế bằng log chạy app hoặc kết quả test.",
            "Quy trình xác thực kép: Bắt buộc chạy các bộ test suites hiện có và thực hiện chạy thử app thực tế để kiểm tra regressions trước khi kết thúc turn."
        ],
        "peers": ["feature-list-primitive", "e2e-testing"],
        "source_slug": "lecture-09-why-agents-declare-victory-too-early",
        "source_title": "Lecture 09 - Tại sao Agent tuyên bố thành công quá sớm"
    },
    {
        "slug": "e2e-testing",
        "title": "Kiểm Thử End-to-End (E2E) - Thước Đo Tối Hậu Của Sự Thành Công",
        "category": "Verification",
        "tags": ["e2e-testing", "code-correctness", "automated-tests"],
        "definition": "Chỉ chạy Unit Test là chưa đủ để khẳng định tính năng hoạt động thực sự. AI Agent rất giỏi trong việc mock dữ liệu để làm xanh các Unit Test trong khi tích hợp hệ thống thực tế bị hỏng. Kiểm thử E2E là thước đo tối hậu.",
        "principles": [
            "Sự lừa dối của Mocking: Agent có xu hướng sửa code test mock để test pass thay vì sửa code logic bị lỗi. E2E test ngăn chặn hoàn toàn bẫy này.",
            "Chạy thử trên môi trường thực (Live Testing): Bắt buộc Agent phải khởi động dev server và thực hiện các luồng đi chính (golden paths) của tính năng để trực tiếp quan sát hành vi.",
            "Regression Prevention: Bộ test E2E hoạt động như lưới an toàn đảm bảo các tính năng cũ không bị hỏng hóc sau khi Agent đưa code mới vào."
        ],
        "peers": ["early-victory", "internal-observability"],
        "source_slug": "lecture-10-why-end-to-end-testing-changes-results",
        "source_title": "Lecture 10 - Tại sao kiểm thử End-to-End thay đổi kết quả"
    },
    {
        "slug": "internal-observability",
        "title": "Tính Quan Sát Thuộc Về Bên Trong Harness (Telemetry & Logs)",
        "category": "Guardrails & Safety",
        "tags": ["internal-observability", "logging", "telemetry", "debugging"],
        "definition": "Quá trình làm việc của Agent không được phép là một 'hộp đen'. Khả năng tự quan sát (Observability) phải được tích hợp sẵn bên trong Harness để con người và hệ thống có thể theo dõi, đánh giá và debug mọi hành vi của Agent.",
        "principles": [
            "Ghi nhật ký lệnh shell (Shell Logging): Tự động ghi chép toàn bộ các lệnh CLI mà Agent đã chạy cùng kết quả đầu ra của chúng.",
            "Telemetry & Metrics: Đo lường số lượng file thay đổi, thời gian chạy công cụ và số lượng token tiêu thụ để phát hiện các vòng lặp vô tận (infinite loops).",
            "Tạo hộp kính (Glass Box): Biến hoạt động của Agent trở nên minh bạch để con người có thể can thiệp ngay lập tức khi phát hiện Agent đi sai hướng hoặc có hành vi phá hoại vô tình."
        ],
        "peers": ["e2e-testing", "clean-state"],
        "source_slug": "lecture-11-why-observability-belongs-inside-the-harness",
        "source_title": "Lecture 11 - Tại sao tính quan sát thuộc về bên trong Harness"
    },
    {
        "slug": "clean-state",
        "title": "Nguyên Lý Trạng Thái Sạch Sau Mỗi Phiên Làm Việc",
        "category": "Guardrails & Safety",
        "tags": ["clean-state", "workspace-hygiene", "reproducibility"],
        "definition": "Mỗi phiên làm việc của Agent bắt buộc phải để lại một trạng thái Git và môi trường sạch sẽ, không có rác tích tụ để tránh gây nhiễu nhận thức của Agent tiếp theo hoặc làm hỏng môi trường phát triển.",
        "principles": [
            "Dọn dẹp tài nguyên (Resource Cleanup): Xóa bỏ toàn bộ các file tạm, file log debug phát sinh, và giết các tiến trình chạy ngầm trước khi bàn giao.",
            "Git Hygiene (Vệ sinh Git): Trả workspace về trạng thái Git sạch. Nếu có thay đổi, chỉ commit những tệp thực sự cần thiết và loại bỏ các thay đổi không chủ ý.",
            "Tính tái lập (Reproducibility): Đảm bảo phiên làm việc tiếp theo có thể khởi chạy trên một nền tảng sạch sẽ, ổn định và có thể tái lập kết quả một cách đáng tin cậy."
        ],
        "peers": ["internal-observability", "harness-definition"],
        "source_slug": "lecture-12-why-every-session-must-leave-a-clean-state",
        "source_title": "Lecture 12 - Tại sao mỗi phiên làm việc phải để lại trạng thái sạch"
    }
]

def build_nodes():
    print("=== BẮT ĐẦU TẠO 11+ NỐT NGUYÊN TỬ TRI THỨC ===")

    for node in ATOMIC_NODES_DATA:
        slug = node["slug"]
        title = node["title"]
        category = node["category"]
        tags = node["tags"]
        definition = node["definition"]
        principles = node["principles"]
        peers = node["peers"]
        source_slug = node["source_slug"]
        source_title = node["source_title"]

        filename = f"HAE-concept-{slug}.md"
        filepath = os.path.join(ATOMIC_DIR, filename)

        # Tạo chuỗi tags
        tags_str = "\n".join([f"  - {t}" for t in tags])

        # Tạo chuỗi nguyên lý kỹ thuật
        principles_str = "\n".join([f"- **{p.split(':')[0]}:** {p.split(':')[1]}" if ":" in p else f"- {p}" for p in principles])

        # Tạo chuỗi peer links bằng liên kết Markdown workspace-relative
        peers_str = "\n".join([f"  - [{p.replace('-', ' ').title()}](02_atomic_nodes/HAE-concept-{p}.md)" for p in peers])

        content = f"""---
id: HAE-concept-{slug}
title: "{title}"
category: "{category}"
tags:
{tags_str}
date: 2026-05-24
---

# {title}

## 💡 Định nghĩa & Nội dung Cốt lõi
{definition}

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
{principles_str}

---

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Khái niệm liên quan (Ngang)**:
{peers_str}
- **Dẫn chứng & Nguồn gốc (Ngược dòng - Evidence & Context)**:
  - [Ghi chú cấu trúc: {source_title}](01_structured_docs/{source_slug}-processed.md)
  - [Ghi chú thô: {source_title}](00_raw_docs/{source_slug}.md)
- **Đúc kết vĩ mô (Xuôi dòng - Distilled Thoughts)**:
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
"""
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"Saved Atomic Node -> {filename}")

    print(">>> ĐÃ XÂY DỰNG XONG LỚP ATOMIC NODES!")

if __name__ == "__main__":
    build_nodes()
