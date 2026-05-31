from typing import List, Dict
from dataclasses import dataclass, field


@dataclass
class KeywordDefinition:
    """Đại diện cho định nghĩa một khái niệm trong Layer 2."""
    name: str
    definition: str


@dataclass
class StructuredDoc:
    """
    Đại diện cho một bản chắt lọc cấu trúc (Layer 2) ở 01_structured_docs/.
    Bắt buộc phải chứa 3 phần: Key Takeaways, Keywords, AI-Ready Summary.
    """
    slug: str                               # Tên file (vd: "lecture-01-why-capable-agents-still-fail-processed")
    title: str                              # Tiêu đề xử lý
    source_slug: str                        # Slug trỏ ngược về file thô ở Layer 1
    key_takeaways: List[str] = field(default_factory=list)
    keywords: List[KeywordDefinition] = field(default_factory=list)
    summary: str = ""                       # AI-Ready Summary súc tích

    @property
    def relative_path(self) -> str:
        """Đường dẫn workspace-relative."""
        return f"01_structured_docs/{self.slug}.md"

    def to_markdown(self) -> str:
        """Xuất nội dung file Markdown theo đúng chuẩn quy tắc Layer 2."""
        takeaways_str = "\n".join([f"- {t}" for t in self.key_takeaways])

        keywords_str = ""
        for kw in self.keywords:
            keywords_str += f"- **{kw.name}**: {kw.definition}\n"

        content = f"""---
id: {self.slug}
title: "{self.title}"
category: "Structured Knowledge"
tags:
  - structured
  - processed
date: 2026-05-31
source: "00_raw_docs/{self.source_slug}.md"
---

# {self.title}

## 💡 Key Takeaways
{takeaways_str}

## 🗝️ Keywords & Core Concepts
{keywords_str.strip()}

## 📝 AI-Ready Summary
{self.summary.strip()}

---

## 🔗 Liên kết Nguồn
- [Tài liệu nguồn gốc thô](00_raw_docs/{self.source_slug}.md)
"""
        return content
