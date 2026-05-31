import os
import json
from typing import Optional

from scripts.mrp_pipeline.models.source_doc import SourceDoc, Frontmatter
from scripts.mrp_pipeline.models.structured_doc import StructuredDoc, KeywordDefinition


##############################
#                            #
#  PHASE MAPPER              #
#  Quét, phân loại, chắt     #
#  lọc nội dung tài liệu thô #
#                            #
##############################

class PhaseMapper:
    """
    Phase M (Map): Đọc file thô, phân tích frontmatter,
    trích xuất keywords, và tạo nội dung structured doc sơ khởi.
    """
    def __init__(self, orchestrator):
        self.o = orchestrator

    def execute(self) -> bool:
        print(f"\n{'='*50}")
        print(f"📡  Phase M - MAPPER: Phân tích tài liệu thô")
        print(f"{'='*50}")
        src_path = self.o.source_path

        # Đọc file thô
        if not os.path.exists(src_path):
            print(f"❌ Lỗi: Không tìm thấy file [{src_path}]")
            return False

        with open(src_path, "r", encoding="utf-8") as f:
            content = f.read()

        if not content.strip():
            print(f"❌ Lỗi: File rỗng [{src_path}]")
            return False

        # Phân tích frontmatter
        frontmatter = SourceDoc.parse_frontmatter(content)
        slug = self.o.source_slug
        print(f"📄 Slug: {slug}")
        print(f"  Tiêu đề: {frontmatter.title}")
        print(f"  Trạng thái: {frontmatter.status}")

        if frontmatter.status == "processed":
            print(f"  ⏭️ File đã được xử lý trước đó (status: processed). Bỏ qua.")
            return False

        # Chuẩn bị dữ liệu structured doc thô
        structured_doc = StructuredDoc(
            slug=f"{slug}-processed",
            title=f"{frontmatter.title} - Bản Chắt Lọc Cấu Trúc",
            source_slug=slug
        )

        # Gọi LLM để phát hiện cấu trúc nếu có API key
        # Trường hợp không có key: Script tự suy luận nội dung thô
        # Gọi LLM để chắt lọc
        print("  🔄 Đang chắt lọc...")
        try:
            # Lọc bỏ phần frontmatter trước khi gửi cho LLM
            raw_content = re.sub(r"^---\n.*?\n---\n?", "", content, flags=re.DOTALL).strip()
        except NameError:
            import re
            raw_content = re.sub(r"^---\n.*?\n---\n?", "", content, flags=re.DOTALL).strip()

        # Nếu file thô có sẵn YAML, bỏ qua frontmatter.
        llm_prompt = f"""Hãy phân tích tài liệu kỹ thuật dưới đây và trả về kết quả dưới dạng JSON.

Tài liệu:
{raw_content[:6000]}

Yêu cầu đầu ra (JSON):
{{
  "title": "Tên tài liệu (súc tích, giữ nguyên tiếng Việt)",
  "key_takeaways": [
    "Đúc kết 1",
    "Đúc kết 2",
    "Đúc kết 3"
  ],
  "keywords": [
    {{"name": "Tên Khái niệm 1", "definition": "Định nghĩa ngắn gọn"}},
    {{"name": "Tên Khái niệm 2", "definition": "Định nghĩa ngắn gọn"}}
  ],
  "summary": "Tóm tắt AI-Ready súc tích (3-5 câu)"
}}
"""

        try:
            response = self.o.llm.generate(prompt=llm_prompt, response_json=True)
            parsed = json.loads(response)
            structured_doc.title = parsed.get("title", structured_doc.title)
            structured_doc.key_takeaways = parsed.get("key_takeaways", [])
            keywords_raw = parsed.get("keywords", [])
            structured_doc.keywords = [KeywordDefinition(name=k.get("name", ""), definition=k.get("definition", "")) for k in keywords_raw]
            structured_doc.summary = parsed.get("summary", "")
            print("  ✅ Chắt lọc thành công!")
        except Exception as e:
            print(f"  ⚠️ Không thể gọi LLM: {e}")
            print("  ⏭️ Chuyển sang chế độ suy luận cơ bản (DUMP)...")

            # Fallback nếu không gọi được LLM
            lines = raw_content.strip().split("\n")
            heading = ""
            for line in lines:
                if line.startswith("# "):
                    heading = line.replace("# ", "").strip()
                    break
            structured_doc.title = f"{heading or slug} - Bản Chắt Lọc Cấu Trúc"
            structured_doc.key_takeaways = ["TODO: Chắt lọc thủ công sau khi có API key."]
            structured_doc.keywords = [KeywordDefinition(name=heading, definition="Xem nội dung chi tiết khi có LLM.")]
            structured_doc.summary = f"Nội dung tài liệu thô chưa được phân tích. Vui lòng cấu hình API key hoặc chạy lại pipeline khi có LLM."

        # Ghi file structured doc
        output_path = os.path.join(self.o.source_path.replace("00_raw_docs", "01_structured_docs").replace(f"{slug}.md", f"{slug}-processed.md"))
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        output_content = structured_doc.to_markdown()
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(output_content)
        print(f"  ✅ Đã tạo structured doc: [{os.path.relpath(output_path, self.o.state['source_path'].split('00_raw_docs')[0])}]")

        # Cập nhật state cho pha tiếp theo
        self.o.state["mapped_data"] = {
            "slug": slug,
            "structured_slug": f"{slug}-processed",
            "title": structured_doc.title,
            "key_takeaways": structured_doc.key_takeaways,
            "keywords": parsed.get("keywords", []) if 'parsed' in dir() else []
        }

        return True
