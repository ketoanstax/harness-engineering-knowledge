#!/usr/bin/env python3
import os
import re
import requests
from bs4 import BeautifulSoup

VAULT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(VAULT_ROOT, "00_raw_docs")
STRUCTURED_DIR = os.path.join(VAULT_ROOT, "01_structured_docs")

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(STRUCTURED_DIR, exist_ok=True)

def write_file(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

LESSONS = [
    {
        "index": 0,
        "slug": "chao-mung",
        "title": "Chào mừng đến với Learn Harness Engineering",
        "url": "https://walkinglabs.github.io/learn-harness-engineering/vi/"
    },
    {
        "index": 1,
        "slug": "lecture-01-why-capable-agents-still-fail",
        "title": "Lecture 01 - Tại sao các Agent mạnh vẫn thất bại",
        "url": "https://walkinglabs.github.io/learn-harness-engineering/vi/lectures/lecture-01-why-capable-agents-still-fail/"
    },
    {
        "index": 2,
        "slug": "lecture-02-what-a-harness-actually-is",
        "title": "Lecture 02 - Harness thực sự là gì",
        "url": "https://walkinglabs.github.io/learn-harness-engineering/vi/lectures/lecture-02-what-a-harness-actually-is/"
    },
    {
        "index": 3,
        "slug": "lecture-03-why-the-repository-must-become-the-system-of-record",
        "title": "Lecture 03 - Tại sao Repository phải trở thành Nguồn sự thật",
        "url": "https://walkinglabs.github.io/learn-harness-engineering/vi/lectures/lecture-03-why-the-repository-must-become-the-system-of-record/"
    },
    {
        "index": 4,
        "slug": "lecture-04-why-one-giant-instruction-file-fails",
        "title": "Lecture 04 - Tại sao một file hướng dẫn khổng lồ lại thất bại",
        "url": "https://walkinglabs.github.io/learn-harness-engineering/vi/lectures/lecture-04-why-one-giant-instruction-file-fails/"
    },
    {
        "index": 5,
        "slug": "lecture-05-why-long-running-tasks-lose-continuity",
        "title": "Lecture 05 - Tại sao các tác vụ dài hạn lại mất tính liên tục",
        "url": "https://walkinglabs.github.io/learn-harness-engineering/vi/lectures/lecture-05-why-long-running-tasks-lose-continuity/"
    },
    {
        "index": 6,
        "slug": "lecture-06-why-initialization-needs-its-own-phase",
        "title": "Lecture 06 - Tại sao quá trình khởi tạo cần một giai đoạn riêng",
        "url": "https://walkinglabs.github.io/learn-harness-engineering/vi/lectures/lecture-06-why-initialization-needs-its-own-phase/"
    },
    {
        "index": 7,
        "slug": "lecture-07-why-agents-overreach-and-under-finish",
        "title": "Lecture 07 - Tại sao Agent làm quá giới hạn và chưa hoàn thành",
        "url": "https://walkinglabs.github.io/learn-harness-engineering/vi/lectures/lecture-07-why-agents-overreach-and-under-finish/"
    },
    {
        "index": 8,
        "slug": "lecture-08-why-feature-lists-are-harness-primitives",
        "title": "Lecture 08 - Tại sao Feature List là nguyên lý cốt lõi của Harness",
        "url": "https://walkinglabs.github.io/learn-harness-engineering/vi/lectures/lecture-08-why-feature-lists-are-harness-primitives/"
    },
    {
        "index": 9,
        "slug": "lecture-09-why-agents-declare-victory-too-early",
        "title": "Lecture 09 - Tại sao Agent tuyên bố thành công quá sớm",
        "url": "https://walkinglabs.github.io/learn-harness-engineering/vi/lectures/lecture-09-why-agents-declare-victory-too-early/"
    },
    {
        "index": 10,
        "slug": "lecture-10-why-end-to-end-testing-changes-results",
        "title": "Lecture 10 - Tại sao kiểm thử End-to-End thay đổi kết quả",
        "url": "https://walkinglabs.github.io/learn-harness-engineering/vi/lectures/lecture-10-why-end-to-end-testing-changes-results/"
    },
    {
        "index": 11,
        "slug": "lecture-11-why-observability-belongs-inside-the-harness",
        "title": "Lecture 11 - Tại sao tính quan sát thuộc về bên trong Harness",
        "url": "https://walkinglabs.github.io/learn-harness-engineering/vi/lectures/lecture-11-why-observability-belongs-inside-the-harness/"
    },
    {
        "index": 12,
        "slug": "lecture-12-why-every-session-must-leave-a-clean-state",
        "title": "Lecture 12 - Tại sao mỗi phiên làm việc phải để lại trạng thái sạch",
        "url": "https://walkinglabs.github.io/learn-harness-engineering/vi/lectures/lecture-12-why-every-session-must-leave-a-clean-state/"
    }
]

def clean_html_to_markdown(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')

    # Tìm vùng chứa bài viết chính
    # Thường là <article>, <main>, hoặc div chứa nội dung
    main_content = soup.find('article') or soup.find('main') or soup.find('div', class_='content') or soup.find('div', class_='post')
    if not main_content:
        # Fallback lấy body
        main_content = soup.body if soup.body else soup

    # Loại bỏ các thành phần không mong muốn (header, footer, nav, script, style)
    for tag in main_content.find_all(['nav', 'header', 'footer', 'script', 'style', 'noscript', 'iframe']):
        tag.decompose()

    # Chuyển đổi một số thẻ HTML sang Markdown cơ bản
    markdown_lines = []

    for element in main_content.find_all(recursive=True):
        # Chỉ xử lý các con trực tiếp của main_content để tránh trùng lặp
        if element.parent != main_content and element.name not in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'pre', 'code', 'blockquote', 'strong', 'em', 'a']:
            continue

        name = element.name
        text = element.get_text().strip()
        if not text and name not in ['hr', 'br']:
            continue

        if name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            level = int(name[1])
            markdown_lines.append(f"\n{'#' * level} {text}\n")
        elif name == 'p':
            # Giữ lại các in-line tags như strong/em trong thẻ p
            # Đơn giản hóa bằng cách dùng text thô nhưng xử lý các thẻ inline nếu có
            p_text = ""
            for node in element.contents:
                if node.name == 'strong':
                    p_text += f"**{node.get_text()}**"
                elif node.name == 'em':
                    p_text += f"*{node.get_text()}*"
                elif node.name == 'code':
                    p_text += f"`{node.get_text()}`"
                elif node.name == 'a':
                    href = node.get('href', '')
                    p_text += f"[{node.get_text()}]({href})"
                else:
                    p_text += str(node.string or node.get_text() or '')
            p_text = re.sub(r'\s+', ' ', p_text).strip()
            markdown_lines.append(f"\n{p_text}\n")
        elif name == 'blockquote':
            markdown_lines.append(f"\n> {text.replace(chr(10), chr(10) + '> ')}\n")
        elif name in ['ul', 'ol']:
            # Li con sẽ tự xử lý
            pass
        elif name == 'li':
            # Xác định list con
            bullet = "-"
            if element.parent.name == 'ol':
                # Đánh số
                siblings = element.parent.find_all('li', recursive=False)
                if element in siblings:
                    bullet = f"{siblings.index(element) + 1}."
            markdown_lines.append(f"{bullet} {text}")
        elif name in ['pre', 'code']:
            if name == 'pre':
                code_text = element.code.get_text() if element.code else element.get_text()
                markdown_lines.append(f"\n```\n{code_text.strip()}\n```\n")
            elif name == 'code' and element.parent.name != 'pre':
                # Chỉ xử lý inline code nếu nó đứng một mình
                markdown_lines.append(f"`{text}`")
        elif name == 'hr':
            markdown_lines.append("\n---\n")

    return "\n".join(markdown_lines)

# Một số tóm tắt thủ công chất lượng cao cho từng bài học bằng tiếng Việt để tạo ghi chú cấu trúc chất lượng
SUMMARIES = {
    "chao-mung": {
        "short": "Giới thiệu về Kỹ nghệ Thiết kế Môi trường (Harness Engineering) cho AI Agent.",
        "keywords": ["harness-engineering", "ai-agent", "introduction", "manifesto"],
        "takeaways": [
            "Harness Engineering là việc thiết kế các môi trường, công cụ và quy chuẩn (như git, test suite, logging) bao quanh Agent giúp Agent code hiệu quả hơn gấp nhiều lần.",
            "Tập trung dịch chuyển từ Prompt Engineering (tinh chỉnh câu lệnh thô) sang Harness Engineering (thiết kế hệ thống xung quanh Agent).",
            "Mục tiêu là biến Repository thành nguồn thông tin sự thật duy nhất của Agent."
        ]
    },
    "lecture-01-why-capable-agents-still-fail": {
        "short": "Phân tích nguyên nhân tại sao các AI Agent cực kỳ mạnh mẽ (như Claude 3.5 Sonnet) vẫn thất bại trong các tác vụ thực tế.",
        "keywords": ["agent-failures", "cognitive-load", "harness-concept"],
        "takeaways": [
            "Agent thất bại không phải vì mô hình LLM yếu, mà vì bối cảnh xung quanh quá lớn hoặc quá mơ hồ, dẫn đến quá tải nhận thức (cognitive overload).",
            "Thiếu các neo phản hồi (feedback loops) và điểm neo trực quan để Agent biết mình đang ở đâu và đã làm gì.",
            "Vai trò của Harness là giải tỏa áp lực nhận thức cho Agent bằng cách cấu trúc hóa môi trường làm việc."
        ]
    },
    "lecture-02-what-a-harness-actually-is": {
        "short": "Định nghĩa chính xác về Harness và cách nó tạo ra ranh giới hoạt động an toàn cho Agent.",
        "keywords": ["harness-definition", "sandbox", "boundaries", "safety"],
        "takeaways": [
            "Harness không phải là Prompt dài, mà là một hệ sinh thái gồm: Tệp chỉ dẫn (CLAUDE.md), Script chạy thử, Bộ kiểm thử E2E, Logs, và Trạng thái phiên làm việc.",
            "Harness định nghĩa ranh giới an toàn (blast radius) giúp Agent hoạt động độc lập mà không phá hỏng hệ thống.",
            "Harness đóng vai trò như một bộ khung giá đỡ và dẫn dắt Agent giải quyết bài toán theo quy trình nghiêm ngặt."
        ]
    },
    "lecture-03-why-the-repository-must-become-the-system-of-record": {
        "short": "Lý giải tại sao toàn bộ lịch sử, cấu trúc và tri thức dự án phải nằm trực tiếp trong Git Repository của dự án.",
        "keywords": ["system-of-record", "git-truth", "ephemeral-chats", "documentation"],
        "takeaways": [
            "Chat history là tạm thời và sẽ bị nén hoặc mất đi. Repository (Git) mới là nguồn lưu trữ tri thức vĩnh viễn (System of Record).",
            "Mọi quyết định thiết kế, quy tắc code và ngữ cảnh bắt buộc phải được commit trực tiếp vào mã nguồn dưới dạng CLAUDE.md hoặc các file tài liệu.",
            "Agent hoạt động dựa trên trạng thái repository hiện tại. Nếu repository không tự giải thích chính nó, Agent sẽ đoán mò và gây lỗi."
        ]
    },
    "lecture-04-why-one-giant-instruction-file-fails": {
        "short": "Phân tích bẫy thiết kế khi dồn tất cả các luật vào một file chỉ dẫn khổng lồ (như CLAUDE.md quá tải) và cách giải quyết bằng phân mảnh tri thức.",
        "keywords": ["instruction-overload", "claudemd-pitfall", "knowledge-splitting"],
        "takeaways": [
            "Dồn hàng nghìn dòng quy tắc vào một file chỉ dẫn duy nhất làm loãng context của Agent, khiến nó bỏ qua các quy tắc quan trọng nhất.",
            "Phải chia nhỏ quy tắc thành các phần độc lập (Atomic Nodes, Thư mục .agent/, hoặc file tài liệu chuyên đề).",
            "CLAUDE.md chỉ đóng vai trò là 'Hiến pháp' chứa các định hướng vĩ mô và bảng định tuyến (routing table) trỏ tới các nốt quy tắc chi tiết."
        ]
    },
    "lecture-05-why-long-running-tasks-lose-continuity": {
        "short": "Giải pháp bảo toàn tính liên tục và bối cảnh hoạt động cho AI Agent khi đối mặt với các tác vụ chạy trong thời gian dài (long-running tasks).",
        "keywords": ["task-continuity", "state-loss", "session-history", "checkpoints"],
        "takeaways": [
            "Các tác vụ dài hạn dễ bị đứt gãy do Agent bị mất bối cảnh (context reset) hoặc trôi bộ nhớ qua nhiều lượt hội thoại.",
            "Cần thiết lập cơ chế lưu trạng thái phiên làm việc (session checkpoints) trực tiếp vào file trên đĩa cứng.",
            "Thiết lập checklist động để khi Agent khởi động lại, nó có thể tiếp tục công việc ngay lập tức tại vị trí dừng trước đó."
        ]
    },
    "lecture-06-why-initialization-needs-its-own-phase": {
        "short": "Tầm quan trọng của việc phân tách giai đoạn khởi tạo/lập kế hoạch (Plan Mode) thành một bước độc lập trước khi viết code.",
        "keywords": ["initialization-phase", "plan-mode", "exploration-first"],
        "takeaways": [
            "Bắt Agent code ngay lập tức khi chưa hiểu rõ dự án là nguyên nhân hàng đầu gây ra code rác và phá vỡ cấu trúc có sẵn.",
            "Bắt buộc phải có một pha khởi tạo (Initialization/Plan Mode) để Agent khám phá mã nguồn, định hình thiết kế và được Con người phê duyệt.",
            "Giai đoạn này là hoàn toàn đọc (Read-only) và viết kế hoạch, tuyệt đối không được sửa đổi mã nguồn sản phẩm."
        ]
    },
    "lecture-07-why-agents-overreach-and-under-finish": {
        "short": "Cách khống chế hành vi tự ý sửa đổi tràn lan ngoài phạm vi (overreach) và tình trạng để lại code dang dở (under-finish) của Agent.",
        "keywords": ["agent-overreach", "blast-radius", "incomplete-tasks"],
        "takeaways": [
            "Agent có xu hướng tự ý refactor các file không liên quan hoặc sửa đổi vượt quá blast radius cho phép.",
            "Ngược lại, Agent hay để lại các bình luận dạng '// TODO: implement later' khiến tính năng chưa thực sự hoàn thành.",
            "Harness phải áp đặt giới hạn nghiêm ngặt (chỉ sửa các file được phép) và cấm tuyệt đối việc để lại code rỗng hoặc code dang dở."
        ]
    },
    "lecture-08-why-feature-lists-are-harness-primitives": {
        "short": "Định nghĩa Feature List như một thực thể nguyên thủy tối quan trọng trong Harness để dẫn dắt hành vi của Agent.",
        "keywords": ["feature-list", "task-tracking", "primitives", "alignment"],
        "takeaways": [
            "Feature List (danh mục tính năng) là bản đồ dẫn đường cho Agent. Nó định nghĩa rõ trạng thái: Chưa làm, Đang làm, Đã xong.",
            "Mỗi turn làm việc, Agent chỉ được phép tập trung vào đúng 1 task duy nhất trong Feature List ở trạng thái `in_progress`.",
            "Việc duy trì Feature List trực quan giúp cả Con người và Agent có sự đồng thuận tuyệt đối về tiến độ dự án."
        ]
    },
    "lecture-09-why-agents-declare-victory-too-early": {
        "short": "Phân tích hiện tượng Agent tự mãn tuyên bố thành công quá sớm khi code vừa chạy xong và cơ chế xác thực kép.",
        "keywords": ["early-victory", "false-positives", "verification-gate"],
        "takeaways": [
            "Agent thường nghĩ rằng code viết xong, không lỗi cú pháp là đã hoàn thành tính năng (tuyên bố chiến thắng sớm).",
            "Thực tế code có thể chạy nhưng logic sai hoặc phá vỡ các chức năng cũ.",
            "Harness phải bắt buộc Agent chạy quy trình xác thực độc lập (chạy thử app, chạy test suites, E2E) trước khi chấp nhận hoàn thành."
        ]
    },
    "lecture-10-why-end-to-end-testing-changes-results": {
        "short": "Tầm quan trọng sống còn của kiểm thử End-to-End (E2E) trong việc bảo đảm chất lượng code do Agent tạo ra.",
        "keywords": ["e2e-testing", "code-correctness", "regression-prevention"],
        "takeaways": [
            "Unit test chỉ kiểm tra tính đúng đắn của hàm đơn lẻ, dễ dàng bị Agent đánh lừa bằng cách mock dữ liệu ảo.",
            "Kiểm thử E2E (chạy thực tế hệ thống) là thước đo tối hậu phản ánh chính xác tính năng hoạt động thật.",
            "Harness bắt buộc phải tích hợp và tự động chạy kiểm thử E2E sau mỗi thay đổi lớn của Agent."
        ]
    },
    "lecture-11-why-observability-belongs-inside-the-harness": {
        "short": "Thiết lập khả năng tự quan sát (observability) từ bên trong để theo dõi sát sao hoạt động của Agent.",
        "keywords": ["internal-observability", "logging", "telemetry", "agent-behavior"],
        "takeaways": [
            "Phải có cơ chế lưu trữ logs, ghi nhận các lệnh shell đã chạy và các thay đổi file của Agent.",
            "Điều này giúp con người giám sát, phát hiện bất thường và debug hành vi của Agent dễ dàng.",
            "Khả năng tự quan sát giúp biến quá trình làm việc của Agent từ một chiếc 'hộp đen' thành một chiếc 'hộp kính' trong suốt."
        ]
    },
    "lecture-12-why-every-session-must-leave-a-clean-state": {
        "short": "Nguyên lý dọn dẹp môi trường sạch sẽ sau mỗi phiên làm việc để tránh rác tích tụ gây ảnh hưởng phiên tiếp theo.",
        "keywords": ["clean-state", "session-cleanup", "git-clean", "reproducibility"],
        "takeaways": [
            "Để lại các file tạm, tiến trình chạy ngầm hoặc file rác trong workspace sẽ làm nhiễu nhận thức của Agent ở phiên tiếp theo.",
            "Bắt buộc phải dọn dẹp môi trường (giết các tiến trình thừa, xóa file tạm, khôi phục các file không liên quan).",
            "Mỗi phiên làm việc của Agent phải kết thúc ở một trạng thái Git sạch sẽ và ổn định."
        ]
    }
}

def download_and_build():
    print("=== BẮT ĐẦU CÀO VÀ XỬ LÝ 13 BÀI HỌC ===")

    for lesson in LESSONS:
        slug = lesson["slug"]
        title = lesson["title"]
        url = lesson["url"]
        print(f"\nProcessing [{slug}] -> {url}...")

        # 1. Fetch dữ liệu từ web
        try:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            response = requests.get(url, headers=headers, timeout=15)
            response.encoding = 'utf-8'
            if response.status_code != 200:
                print(f"Lỗi: Không thể tải {url} (HTTP {response.status_code})")
                continue

            html = response.text
        except Exception as e:
            print(f"Lỗi kết nối khi tải {url}: {e}")
            continue

        # 2. Parse HTML sang Markdown
        markdown_body = clean_html_to_markdown(html)
        if not markdown_body.strip():
            # Fallback nếu parse lỗi
            soup = BeautifulSoup(html, 'html.parser')
            markdown_body = f"\n# {title}\n\n" + soup.get_text()[:3000] + "\n\n...(Nội dung được rút gọn)..."

        # 3. Tạo nốt Layer 1 (00_raw_docs)
        raw_filename = f"{slug}.md"
        raw_filepath = os.path.join(RAW_DIR, raw_filename)

        raw_yaml = f"""---
id: 202605241200-{slug}
aliases:
  - "{title}"
date: 2026-05-24
type: inbox-note
summary: "{SUMMARIES[slug]['short']}"
keywords: {SUMMARIES[slug]['keywords']}
status: "processed"
---

# {title}

## Nguồn tài liệu
- **URL**: [{url}]({url})
- **Ngày thu thập**: 2026-05-24

---

{markdown_body}
"""
        write_file(raw_filepath, raw_yaml)
        print(f"Saved Raw Note (Layer 1) -> {raw_filename}")

        # 4. Tạo nốt Layer 2 (01_structured_docs)
        structured_filename = f"{slug}-processed.md"
        structured_filepath = os.path.join(STRUCTURED_DIR, structured_filename)

        takeaways_str = "\n".join([f"- {t}" for t in SUMMARIES[slug]["takeaways"]])
        keywords_str = "\n".join([f"- {k}" for k in SUMMARIES[slug]["keywords"]])

        # Map slug bài học sang slug nốt nguyên tử chuẩn xác
        slug_atomic_map = {
            "chao-mung": "harness-definition",
            "lecture-01-why-capable-agents-still-fail": "harness-definition",
            "lecture-02-what-a-harness-actually-is": "harness-definition",
            "lecture-03-why-the-repository-must-become-the-system-of-record": "system-of-record",
            "lecture-04-why-one-giant-instruction-file-fails": "instruction-file-pitfall",
            "lecture-05-why-long-running-tasks-lose-continuity": "session-continuity",
            "lecture-06-why-initialization-needs-its-own-phase": "initialization-phase",
            "lecture-07-why-agents-overreach-and-under-finish": "agent-overreach",
            "lecture-08-why-feature-lists-are-harness-primitives": "feature-list-primitive",
            "lecture-09-why-agents-declare-victory-too-early": "early-victory",
            "lecture-10-why-end-to-end-testing-changes-results": "e2e-testing",
            "lecture-11-why-observability-belongs-inside-the-harness": "internal-observability",
            "lecture-12-why-every-session-must-leave-a-clean-state": "clean-state"
        }
        atomic_target = slug_atomic_map.get(slug, "harness-definition")

        structured_yaml = f"""---
id: 202605241200-{slug}-processed
aliases:
  - "Processed: {title}"
date: 2026-05-24
type: processed-note
source_note: "[{title}](00_raw_docs/{slug}.md)"
tags:
  - processed
  - harness-engineering
short_summary: "{SUMMARIES[slug]['short']}"
keywords: {SUMMARIES[slug]['keywords']}
---

# Processed: {title}

## 🤖 AI Summary
> {SUMMARIES[slug]['short']}

### Key Takeaways
{takeaways_str}

### 🔑 Keywords
{keywords_str}

### 📝 Core Content Summary
*Dưới đây là tóm tắt nội dung cốt lõi của bài học phục vụ việc truy vấn nhanh:*
- **Vấn đề đặt ra**: Agent thường bị quá tải nhận thức do môi trường thiếu cấu trúc và bối cảnh mơ hồ.
- **Giải pháp đề xuất**: Thiết lập một khung làm việc (Harness) bao gồm các quy tắc nghiêm ngặt, cơ chế lưu trạng thái, bộ test E2E để dẫn dắt và kiểm soát hành vi của Agent.
- **Đóng góp kiến thức**: Định hình tư duy thiết kế hệ thống bao quanh Agent, thay thế cho tư duy viết prompt đơn thuần.

---

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Tài liệu gốc (Raw)**: [{title}](00_raw_docs/{slug}.md)
- **Nốt nguyên tử (Atomic Nodes)**:
  - [Atomic Node tương ứng](02_atomic_nodes/HAE-concept-{atomic_target}.md)
- **Đúc kết (Distilled)**:
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
"""
        write_file(structured_filepath, structured_yaml)
        print(f"Saved Structured Note (Layer 2) -> {structured_filename}")

    print("\n>>> ĐÃ HOÀN THÀNH CÀO VÀ XÂY DỰNG LAYER 1 & 2!")

if __name__ == "__main__":
    download_and_build()
