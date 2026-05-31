from typing import List, Optional, Dict
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class NewNodeAction:
    """Tạo một nốt nguyên tử mới."""
    slug: str
    title: str
    category: str
    tags: List[str]
    definition: str
    principles: List[str]
    parent: Optional[str]
    children: List[str]
    causal_core: Optional[str] = None
    causal_supporting: List[str] = field(default_factory=list)
    causal_derivative: List[str] = field(default_factory=list)


@dataclass
class MergeNodeAction:
    """Trộn/Ghép kiến thức mới vào một nốt nguyên tử đã tồn tại."""
    slug: str                             # Slug của nốt đích
    updated_definition: Optional[str] = None
    added_principles: List[str] = field(default_factory=list)
    added_children: List[str] = field(default_factory=list)          # Nối thêm children mới
    updated_causal_derivative: List[str] = field(default_factory=list) # Cập nhật Quả chuyển hóa


@dataclass
class PlanItem:
    """
    Một mục trong Kế hoạch MRP.
    Định nghĩa hành động sẽ được thực thi sau khi người dùng phê duyệt.
    """
    source_slug: str                      # Tài liệu nguồn tạo ra plan này
    new_nodes: List[NewNodeAction] = field(default_factory=list)
    merge_nodes: List[MergeNodeAction] = field(default_factory=list)
    depends_on: List[str] = field(default_factory=list)  # Các plan trước đó cần thực thi xong
    reasoning: str = ""                   # Giải thích lý do quyết định plan này


@dataclass
class PlanFile:
    """
    File kế hoạch MRP:
    05_journal/mrp_plan_YYYYMMDD_HHMMSS.md
    Chứa PlanItems và được trực tiếp trình cho người dùng duyệt.
    """
    items: List[PlanItem]
    created_at: str = field(default_factory=lambda: datetime.now().strftime("%Y%m%d_%H%M%S"))
    status: str = "pending"               # pending, approved, rejected, executed
    plan_timestamp: str = ""

    @property
    def filename(self) -> str:
        return f"mrp_plan_{self.plan_timestamp}.md"

    @property
    def filepath(self) -> str:
        """Đường dẫn workspace-relative để tạo file trong 05_journal/."""
        from scripts.mrp_pipeline.core.config import DIR_JOURNAL
        return f"{DIR_JOURNAL}/{self.filename}" if DIR_JOURNAL else f"05_journal/{self.filename}"

    def to_markdown_preview(self) -> str:
        """Sinh file markdown trực quan để người dùng đọc và phê duyệt."""
        new_nodes_str = ""
        for nn in self.items[0].new_nodes:
            new_nodes_str += f"""  - **Tạo mới**: `{nn.slug}.md`
    - Tiêu đề: *{nn.title}*
    - Danh mục: {nn.category}
    - Thẻ: {', '.join(nn.tags)}
    - Parent: {nn.parent}
    - Children: {', '.join(nn.children) if nn.children else 'Không có'}
    - Nhân gốc: {nn.causal_core or 'Không có'}
"""
        merge_nodes_str = ""
        for mn in self.items[0].merge_nodes:
            merge_str = f"  - **Cập nhật/sửa**: `{mn.slug}.md`\n"
            if mn.updated_definition:
                merge_str += f"    - Định nghĩa cập nhật: {mn.updated_definition}\n"
            for ap in mn.added_principles:
                merge_str += f"    - Thêm nguyên lý: {ap}\n"
            for ac in mn.added_children:
                merge_str += f"    - Thêm child: {ac}\n"
            merge_nodes_str += merge_str

        content = f"""# 📋 Kế hoạch MRP Ingestion Plan

**Trạng thái**: `{self.status}`
**Thời điểm**: {self.plan_timestamp}
**Nguồn**: {self.items[0].source_slug}
**Số lượng items**: {len(self.items)}

---

## 🧠 Luận giải (Reasoning)
{self.items[0].reasoning if self.items else 'Không có luận giải.'}

---

## 🚀 Hành động Tạo mới (New Nodes)
{new_nodes_str if new_nodes_str else '  Không có nốt mới.'}

## 🔄 Hành động Cập nhật/Trộn (Merge Nodes)
{merge_nodes_str if merge_nodes_str else '  Không có nốt cần trộn.'}

---

## 📌 Hướng dẫn duyệt
- Nếu kế hoạch **OK**, user nhập lệnh: `mrp approve plan`
- Nếu kế hoạch **cần chỉnh sửa**, user sửa trực tiếp file này hoặc yêu cầu thay đổi.
- Nếu kế hoạch **không phù hợp**, user nhập lệnh: `mrp reject plan`
"""
        return content

    @staticmethod
    def parse_from_markdown(content: str) -> Optional[str]:
        """
        Phân tích trạng thái duyệt từ nội dung file plan đã chỉnh sửa.
        Trả về 'approved', 'rejected', hoặc None nếu chưa xác định.
        """
        import re
        status_match = re.search(r"\*\*Trạng thái\*\*:\s*`(\w+)`", content)
        if status_match:
            return status_match.group(1)
        return None

    @staticmethod
    def parse_source_slug(content: str) -> Optional[str]:
        """Trích xuất source slug từ file plan."""
        import re
        src_match = re.search(r"\*\*Nguồn\*\*:\s*(\S+)", content)
        if src_match:
            return src_match.group(1).strip()
        return None
