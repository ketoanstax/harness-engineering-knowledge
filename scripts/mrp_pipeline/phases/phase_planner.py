import os
import json
import re
from typing import List, Dict, Any

from scripts.mrp_pipeline.models.plan_item import PlanFile, PlanItem, NewNodeAction, MergeNodeAction

##############################
#                            #
#  PHASE PLANNER             #
#  Thiết kế chi tiết nốt     #
#  và xuất bản kế hoạch      #
#                            #
##############################

class PhasePlanner:
    """
    Phase P (Plan): Thiết kế chi tiết cấu trúc nốt mới,
    nốt merge (parent/children, Causal Web) và xuất bản
    file kế hoạch Markdown ra thư mục 05_journal/.
    """
    def __init__(self, orchestrator):
        self.o = orchestrator

    def execute(self) -> bool:
        print(f"\n{'='*50}")
        print(f"📋  Phase P - PLANNER: Thiết kế và xuất bản kế hoạch")
        print(f"{'='*50}")

        reduced_data = self.o.state.get("reduced_data")
        mapped_data = self.o.state.get("mapped_data")
        if not reduced_data or not mapped_data:
            print("❌ Lỗi: Không tìm thấy dữ liệu Reducer/Mapper.")
            return False

        conflicts = reduced_data.get("conflicts", [])
        new_concepts = reduced_data.get("new_concepts", [])

        print("  🔄 Đang thiết kế chi tiết các nốt và cấu trúc đồ thị nhân quả...")

        llm_prompt = f"""Bạn là Kỹ sư trưởng thiết kế hệ thống Harness.
Chúng tôi cần thiết kế chi tiết nội dung markdown cho các hành động sau:
- Khái niệm tạo mới: {json.dumps(new_concepts, ensure_ascii=False)}
- Khái niệm cần cập nhật/trộn vào nốt cũ: {json.dumps(conflicts, ensure_ascii=False)}

Yêu cầu thiết kế:
1. Nốt mới phải định rõ parent (slug), children (danh sách slug), và cấu trúc causal_web (causal_core: slug, supporting_conditions: [slugs], derivative_effects: [slugs]).
2. Mọi nốt đều được đặt phẳng trong 02_atomic_nodes/ và chỉ chứa Workspace-relative links.
3. Nội dung phải sắc bén, ngắn gọn, tuân thủ đúng định dạng Markdown nguyên tử.

Đầu ra bắt buộc (JSON):
{{
  "new_nodes": [
    {{
      "slug": "slug-nốt-mới (không chứa HAE-concept-)",
      "title": "Tiêu đề nốt",
      "category": "Harness Core Concept / Cognitive Management / Workflow Architecture / Guardrails & Safety / Verification",
      "tags": ["tag1", "tag2"],
      "definition": "Định nghĩa sâu sắc nhất (2-3 câu)",
      "principles": [
        "Nguyên lý thực tế 1",
        "Nguyên lý thực tế 2",
        "Nguyên lý thực tế 3"
      ],
      "parent": "slug-nốt-cha-hoặc-null",
      "children": ["slugs-nốt-con-nếu-có"],
      "causal_core": "slug-nhân-gốc",
      "causal_supporting": ["slug-duyên-hỗ-trợ"],
      "causal_derivative": ["slug-quả-kế-thừa"]
    }}
  ],
  "merge_nodes": [
    {{
      "slug": "slug-nốt-cũ",
      "updated_definition": "Định nghĩa mới sau khi gộp kiến thức mới (hoặc null)",
      "added_principles": ["Nguyên lý kỹ thuật mới bổ sung"],
      "added_children": ["slug-nốt-con-mới-bổ-sung-nếu-có"],
      "updated_causal_derivative": ["slugs-nốt-quả-mới-phát-sinh"]
    }}
  ],
  "reasoning": "Luận giải chi tiết lý do tổ chức cây tri thức như thế này."
}}
"""

        new_nodes_list = []
        merge_nodes_list = []
        reasoning = ""

        try:
            response = self.o.llm.generate(prompt=llm_prompt, response_json=True)
            parsed = json.loads(response)

            reasoning = parsed.get("reasoning", "")
            # Parse New Nodes
            for nn in parsed.get("new_nodes", []):
                new_nodes_list.append(NewNodeAction(
                    slug=nn.get("slug", ""),
                    title=nn.get("title", ""),
                    category=nn.get("category", "Harness Core Concept"),
                    tags=nn.get("tags", []),
                    definition=nn.get("definition", ""),
                    principles=nn.get("principles", []),
                    parent=nn.get("parent"),
                    children=nn.get("children", []),
                    causal_core=nn.get("causal_core"),
                    causal_supporting=nn.get("causal_supporting", []),
                    causal_derivative=nn.get("causal_derivative", [])
                ))

            # Parse Merge Nodes
            for mn in parsed.get("merge_nodes", []):
                merge_nodes_list.append(MergeNodeAction(
                    slug=mn.get("slug", ""),
                    updated_definition=mn.get("updated_definition"),
                    added_principles=mn.get("added_principles", []),
                    added_children=mn.get("added_children", []),
                    updated_causal_derivative=mn.get("updated_causal_derivative", [])
                ))

            print("  ✅ Đã thiết kế xong cấu trúc chi tiết bằng LLM.")
        except Exception as e:
            print(f"  ⚠️ Lỗi thiết kế LLM: {e}. Tạo plan cơ bản...")
            reasoning = "Hệ thống tự tạo plan cơ bản do không kết nối được LLM."
            # Fallback Plan
            for nc in new_concepts:
                new_nodes_list.append(NewNodeAction(
                    slug=nc["suggested_slug"],
                    title=nc["name"],
                    category="Harness Core Concept",
                    tags=["concept"],
                    definition=nc["definition"] or f"Định nghĩa cho {nc['name']}",
                    principles=["Nguyên lý 1 của khái niệm này.", "Nguyên lý 2 của khái niệm này."],
                    parent=None,
                    children=[]
                ))

        # Tạo Plan File
        plan_item = PlanItem(
            source_slug=self.o.source_slug,
            new_nodes=new_nodes_list,
            merge_nodes=merge_nodes_list,
            reasoning=reasoning
        )

        plan_file = PlanFile(
            items=[plan_item],
            plan_timestamp=self.o.timestamp
        )

        # Lưu Plan file xuống 05_journal
        plan_md = plan_file.to_markdown_preview()
        filepath = plan_file.filepath
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(plan_md)

        # Lưu trạng thái để phục vụ pha REFINE sau này
        # Chuyển đổi object sang dict để lưu JSON
        self.o.state["plan_timestamp"] = self.o.timestamp
        self.o.state["plan_item_data"] = {
            "new_nodes": [nn.__dict__ for nn in new_nodes_list],
            "merge_nodes": [mn.__dict__ for mn in merge_nodes_list],
            "reasoning": reasoning
        }

        print(f"  ✅ Đã xuất bản kế hoạch tại: [{os.path.relpath(filepath, self.o.state['source_path'].split('00_raw_docs')[0])}]")
        return True
