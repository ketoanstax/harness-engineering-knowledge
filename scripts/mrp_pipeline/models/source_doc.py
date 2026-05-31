import os
import re
from typing import List, Optional, Dict, Any
from dataclasses import dataclass, field


@dataclass
class Frontmatter:
    """Dữ liệu frontmatter YAML chuẩn cho tài liệu thô."""
    id: str
    title: str
    category: str = "Raw Knowledge Source"
    tags: List[str] = field(default_factory=list)
    date: str = ""
    status: str = "to-process"


@dataclass
class SourceDoc:
    """
    Đại diện cho một tài liệu thô (Layer 1) ở 00_raw_docs/.
    Chứa frontmatter và nội dung gốc, TUYỆT ĐỐI không sửa đổi nội dung.
    """
    slug: str                      # Tên file không đuôi (vd: "lecture-01-why-capable-agents-still-fail")
    title: str                     # Tiêu đề từ frontmatter
    filepath: str                  # Đường dẫn đầy đủ file
    content: str                   # Nội dung gốc (dạng text)
    frontmatter: Frontmatter       # Thông tin YAML frontmatter
    source_url: str = ""           # URL gốc (nếu có)
    source_type: str = "website"   # website, video, paper, etc.

    @property
    def relative_path(self) -> str:
        """Đường dẫn workspace-relative (dùng cho link Markdown)."""
        return f"00_raw_docs/{self.slug}.md"

    @staticmethod
    def parse_frontmatter(content: str) -> Frontmatter:
        """Phân tích YAML frontmatter từ nội dung file thô."""
        fm_match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
        if not fm_match:
            return Frontmatter(id="", title="unknown")

        fm_lines = fm_match.group(1).strip()
        fm_dict: Dict[str, Any] = {}

        # Parse YAML thủ công không cần thư viện
        current_key = None
        for line in fm_lines.split("\n"):
            # Key: value
            kv_match = re.match(r"^(\w+):\s*(.*)", line)
            if kv_match:
                current_key = kv_match.group(1)
                value = kv_match.group(2).strip().strip('"').strip("'")
                if value.lower() == "true":
                    value = True
                elif value.lower() == "false":
                    value = False
                fm_dict[current_key] = value
            elif line.strip().startswith("- ") and current_key in ("tags",):
                tag_value = line.strip()[2:].strip()
                if current_key not in fm_dict or not isinstance(fm_dict.get(current_key), list):
                    fm_dict[current_key] = []
                fm_dict[current_key].append(tag_value)

        if "status" not in fm_dict:
            fm_dict["status"] = "to-process"

        return Frontmatter(
            id=str(fm_dict.get("id", "")),
            title=str(fm_dict.get("title", "untitled")),
            category=str(fm_dict.get("category", "Raw Knowledge Source")),
            tags=fm_dict.get("tags", []),
            date=str(fm_dict.get("date", "")),
            status=str(fm_dict.get("status", "to-process"))
        )
