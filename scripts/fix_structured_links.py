#!/usr/bin/env python3
import os
import re

VAULT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STRUCTURED_DIR = os.path.join(VAULT_ROOT, "01_structured_docs")

SLUG_MAPPING = {
    "chao-mung": "HAE-concept-harness-definition",
    "lecture-01-why-capable-agents-still-fail": "HAE-concept-harness-definition",
    "lecture-02-what-a-harness-actually-is": "HAE-concept-harness-definition",
    "lecture-03-why-the-repository-must-become-the-system-of-record": "HAE-concept-system-of-record",
    "lecture-04-why-one-giant-instruction-file-fails": "HAE-concept-instruction-file-pitfall",
    "lecture-05-why-long-running-tasks-lose-continuity": "HAE-concept-session-continuity",
    "lecture-06-why-initialization-needs-its-own-phase": "HAE-concept-initialization-phase",
    "lecture-07-why-agents-overreach-and-under-finish": "HAE-concept-agent-overreach",
    "lecture-08-why-feature-lists-are-harness-primitives": "HAE-concept-feature-list-primitive",
    "lecture-09-why-agents-declare-victory-too-early": "HAE-concept-early-victory",
    "lecture-10-why-end-to-end-testing-changes-results": "HAE-concept-e2e-testing",
    "lecture-11-why-observability-belongs-inside-the-harness": "HAE-concept-internal-observability",
    "lecture-12-why-every-session-must-leave-a-clean-state": "HAE-concept-clean-state"
}

def fix_links():
    print("=== BẮT ĐẦU SỬA LIÊN KẾT TRONG LAYER 2 (CÓ TIỀN TỐ) ===")
    if not os.path.exists(STRUCTURED_DIR):
        print(f"Lỗi: Thư mục không tồn tại: {STRUCTURED_DIR}")
        return

    files = [f for f in os.listdir(STRUCTURED_DIR) if f.endswith(".md")]
    print(f"Tìm thấy {len(files)} tệp trong 01_structured_docs")

    for filename in files:
        filepath = os.path.join(STRUCTURED_DIR, filename)

        # Trích xuất slug từ tên file (bỏ tiền tố YYYYMMDDHHMM- và đuôi -processed.md)
        # Tên file mẫu: 202605241200-chao-mung-processed.md
        match = re.match(r"^\d{12}-(.+)-processed\.md$", filename)
        if not match:
            print(f"Bỏ qua tệp không đúng định dạng tên: {filename}")
            continue

        slug = match.group(1)
        if slug not in SLUG_MAPPING:
            print(f"Không có mapping cho slug: {slug} (tệp: {filename})")
            continue

        correct_target = SLUG_MAPPING[slug]

        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Regex tìm dòng liên kết nguyên tử cũ:
        # Cấu trúc cũ:   - [[02_atomic_nodes/HAE-concept-chao-mung|Atomic Node tương ứng]]
        # Hoặc:   - [[02_atomic_nodes/HAE-concept-chao-mung|Atomic Node tương ứng]]
        pattern = r"-\s+\[\[02_atomic_nodes/HAE-concept-[^\]|]+(?:\|[^\]]+)?\]\]"
        replacement = f"- [[02_atomic_nodes/{correct_target}|Atomic Node tương ứng]]"

        new_content = re.sub(pattern, replacement, content)

        if new_content != content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Đã sửa thành công liên kết trong -> {filename} -> trỏ tới {correct_target}")
        else:
            print(f"Không cần sửa đổi trong -> {filename}")

if __name__ == "__main__":
    fix_links()
