from typing import List, Optional, Dict
from dataclasses import dataclass, field


@dataclass
class CausalWeb:
    """Các mối quan hệ nhân quả trong nốt nguyên tử."""
    causal_core: Optional[str] = None          # Nhân gốc (slug của parent/ancestor concept)
    supporting_conditions: List[str] = field(default_factory=list) # Hội tụ Duyên (other concepts)
    derivative_effects: List[str] = field(default_factory=list)    # Quả chuyển hóa (concepts created because of this)


@dataclass
class AtomicNode:
    """
    Đại diện cho một nốt tri thức nguyên tử (Layer 3) ở 02_atomic_nodes/.
    Đảm bảo tính đơn nhất (Singularity) và cấu trúc liên kết đồ thị phẳng.
    """
    slug: str                     # Tên file không prefix/suffix (vd: "context-manager")
    title: str                    # Tên khái niệm rõ ràng, sắc bén
    category: str                 # Danh mục phân loại
    tags: List[str]               # Thẻ phân loại
    definition: str               # Định nghĩa & Nội dung Cốt lõi
    principles: List[str]         # Nguyên lý Kỹ thuật & Thực tiễn
    parent: Optional[str] = None  # Slug của Node cha
    children: List[str] = field(default_factory=list) # Danh sách slug của Node con
    causal_web: CausalWeb = field(default_factory=CausalWeb) # Mối liên hệ nhân quả
    evidence_structured: List[str] = field(default_factory=list)  # Các file processed làm dẫn chứng
    evidence_raw: List[str] = field(default_factory=list)         # Các file thô làm dẫn chứng

    @property
    def full_slug(self) -> str:
        """Slug đầy đủ có prefix (vd: HAE-concept-context-manager)."""
        return f"HAE-concept-{self.slug}"

    @property
    def relative_path(self) -> str:
        """Đường dẫn workspace-relative."""
        return f"02_atomic_nodes/{self.full_slug}.md"

    def to_markdown(self) -> str:
        """Biên dịch nốt sang file Markdown theo đúng hiến pháp Layer 3 (Causal Web & backlinks)."""
        tags_str = "\n".join([f"  - {t}" for t in self.tags])
        principles_str = "\n".join([f"- **{p.split(':')[0]}:** {p.split(':')[1]}" if ":" in p else f"- {p}" for p in self.principles])

        # Phục vụ Causal Web
        core_link = f"[{self.causal_web.causal_core.replace('-', ' ').title()}](02_atomic_nodes/HAE-concept-{self.causal_web.causal_core}.md)" if self.causal_web.causal_core else "Không có"

        duyen_links = []
        for d in self.causal_web.supporting_conditions:
            duyen_links.append(f"[{d.replace('-', ' ').title()}](02_atomic_nodes/HAE-concept-{d}.md)")
        duyen_str = ", ".join(duyen_links) if duyen_links else "Không có"

        qua_links = []
        for q in self.causal_web.derivative_effects:
            qua_links.append(f"[{q.replace('-', ' ').title()}](02_atomic_nodes/HAE-concept-{q}.md)")
        qua_str = ", ".join(qua_links) if qua_links else "Không có"

        # Phục vụ parent/children
        parent_fm = f"\nparent: {self.parent}" if self.parent else ""
        children_fm = ""
        if self.children:
            children_fm = "\nchildren:\n" + "\n".join([f"  - {c}" for c in self.children])

        # Dẫn chứng ngược dòng
        evidence_str = ""
        for s in self.evidence_structured:
            evidence_str += f"  - [Ghi chú cấu trúc: {s.replace('-processed', '').replace('-', ' ').title()}](01_structured_docs/{s}.md)\n"
        for r in self.evidence_raw:
            evidence_str += f"  - [Ghi chú thô: {r.replace('-', ' ').title()}](00_raw_docs/{r}.md)\n"

        # Con nếu có
        subnodes_section = ""
        if self.children:
            subnodes_links = "\n".join([f"- [{c.replace('-', ' ').title()}](02_atomic_nodes/HAE-concept-{c}.md)" for c in self.children])
            subnodes_section = f"""
## 🌳 Nốt con (Sub-Nodes)
{subnodes_links}
"""

        content = f"""---
id: {self.full_slug}
title: "{self.title}"
category: "{self.category}"
tags:
{tags_str}
date: 2026-05-31{parent_fm}{children_fm}
---

# {self.title}

## 💡 Định nghĩa & Nội dung Cốt lõi
{self.definition}

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
{principles_str}
{subnodes_section}
## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)
- **Nhân gốc (Causal Core)**: {core_link} — Khái niệm nền tảng sinh ra khái niệm này.
- **Hội tụ Duyên (Supporting Conditions)**: {duyen_str} — Các khái niệm hỗ trợ trực tiếp.
- **Quả chuyển hóa (Derivative Effects)**: {qua_str} — Các giải pháp và hiệu quả kế thừa.

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Dẫn chứng & Nguồn gốc (Ngược dòng - Evidence & Context)**:
{evidence_str.rstrip()}
- **Đúc kết vĩ mô (Xuôi dòng - Distilled Thoughts)**:
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
"""
        return content
