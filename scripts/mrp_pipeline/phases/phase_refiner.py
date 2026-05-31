import os
from typing import List, Dict, Any

from scripts.mrp_pipeline.core.config import DIR_ATOMIC
from scripts.mrp_pipeline.models.atomic_node import AtomicNode, CausalWeb

##############################
#                            #
#  PHASE REFINER             #
#  Thực thi tạo/trộn các nốt #
#                            #
##############################

class PhaseRefiner:
    """
    Phase R (Refine): Tạo/sửa nốt nguyên tử dựa trên Plan đã được duyệt.
    Đảm bảo mọi frontmatter, backlink và Causal Web được tạo chính xác.
    """
    def __init__(self, orchestrator):
        self.o = orchestrator

    def execute(self) -> bool:
        print(f"\n{'='*50}")
        print(f"🛠️  Phase R - REFINER: Thực thi kế hoạch (Tạo mới & Trộn)")
        print(f"{'='*50}")

        plan_data = self.o.state.get("plan_item_data")
        if not plan_data:
            print("❌ Lỗi: Không tìm thấy dữ liệu Planning.")
            return False

        new_nodes = plan_data.get("new_nodes", [])
        merge_nodes = plan_data.get("merge_nodes", [])

        # 1. Tạo các nốt mới
        for nn in new_nodes:
            slug = nn["slug"]
            # Tạo nốt AtomicNode mới
            node = AtomicNode(
                slug=slug,
                title=nn.get("title", slug),
                category=nn.get("category", "Harness Core Concept"),
                tags=nn.get("tags", []),
                definition=nn.get("definition", ""),
                principles=nn.get("principles", [slug]),
                parent=nn.get("parent"),
                children=nn.get("children", []),
                causal_web=CausalWeb(
                    causal_core=nn.get("causal_core"),
                    supporting_conditions=nn.get("causal_supporting", []),
                    derivative_effects=nn.get("causal_derivative", [])
                ),
                # Dẫn chứng lấy từ source của pipeline
                evidence_structured=[f"{self.o.source_slug}-processed"],
                evidence_raw=[self.o.source_slug]
            )

            # Ghi file atomic node
            filepath = f"{DIR_ATOMIC}/{node.full_slug}.md"
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(node.to_markdown())
            print(f"  ✅ Tạo nốt mới: [{node.full_slug}.md]")

        # 2. Cập nhật các nốt hiện có (Merge)
        for mn in merge_nodes:
            slug = mn["slug"]
            filepath = f"{DIR_ATOMIC}/HAE-concept-{slug}.md"
            if not os.path.exists(filepath):
                print(f"  ⚠️ Nốt [{slug}.md] không tồn tại (skipped).")
                continue

            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            # Cập nhật định nghĩa
            if mn.get("updated_definition"):
                import re
                old_def_match = re.search(r"## 💡 Định nghĩa & Nội dung Cốt lõi\n(.+)", content, re.DOTALL)
                if old_def_match:
                    old_def = old_def_match.group(1).strip()
                    content = content.replace(f"## 💡 Định nghĩa & Nội dung Cốt lõi\n{old_def}",
                                              f"## 💡 Định nghĩa & Nội dung Cốt lõi\n{mn['updated_definition']}")

            # Thêm nguyên lý mới
            for ap in mn.get("added_principles", []):
                principles_str = f"- **{ap.split(':')[0]}:** {ap.split(':')[1]}" if ":" in ap else f"- {ap}"
                content += f"\n{principles_str}"

            # Thêm children mới vào list (nếu có)
            for ac in mn.get("added_children", []):
                # Xử lý format trong YAML nếu có section children
                children_ref = f"  - {ac}"
                if children_ref not in content:
                    # Thêm vào cuối phần children nếu có
                    children_match = re.search(r"(children:\s*\n(?:  - .*\n?)*)(?:\n|$)", content)
                    if children_match:
                        children_section = children_match.group(1)
                        new_section = children_section.rstrip("\n") + f"\n  - {ac}\n"
                        content = content.replace(children_section, new_section)
                    else:
                        print(f"  ⚠️ Không tìm thấy section children trong [{slug}.md], thêm thủ công vào cuối frontmatter chưa được thực hiện.")

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"  ✅ Cập nhật nốt hiện có: [{slug}.md]")

        print(f"  ✅ Hoàn tất tạo/cập nhật {len(new_nodes)} nốt mới + {len(merge_nodes)} nốt merge.")
        self.o.state["refined"] = True
        return True
