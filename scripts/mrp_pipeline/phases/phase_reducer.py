import os
import json
from typing import List, Dict, Any

from scripts.mrp_pipeline.core.config import DIR_ATOMIC

##############################
#                            #
#  PHASE REDUCER             #
#  Deduplication & Merge     #
#  Phát hiện trùng lặp       #
#                            #
##############################

class PhaseReducer:
    """
    Phase R (Reduce): So sánh keywords từ Mapper với các nốt nguyên tử hiện có.
    Tìm kiếm xung đột, trùng lặp và đề xuất: nốt nào tạo mới, nốt nào trộn (merge).
    """
    def __init__(self, orchestrator):
        self.o = orchestrator

    def _get_existing_atomic_nodes(self) -> List[Dict[str, Any]]:
        """Đọc toàn bộ các nốt nguyên tử hiện có trong 02_atomic_nodes/."""
        existing_nodes = []
        if not os.path.exists(DIR_ATOMIC):
            return []

        for file in os.listdir(DIR_ATOMIC):
            if file.endswith(".md") and file.startswith("HAE-concept-"):
                filepath = os.path.join(DIR_ATOMIC, file)
                slug = file.replace("HAE-concept-", "").replace(".md", "")
                title = ""
                definition = ""

                # Phân tích nội dung thô đơn giản
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        lines = f.readlines()
                    for line in lines:
                        if line.startswith("title:"):
                            title = line.split(":", 1)[1].strip().strip('"').strip("'")
                        elif line.startswith("# "):
                            if not title:
                                title = line.replace("# ", "").strip()
                except Exception:
                    pass

                existing_nodes.append({
                    "slug": slug,
                    "title": title or slug,
                    "filename": file
                })
        return existing_nodes

    def execute(self) -> bool:
        print(f"\n{'='*50}")
        print(f"🗜️  Phase R - REDUCER: Phân tích trùng lặp và xung đột")
        print(f"{'='*50}")

        mapped_data = self.o.state.get("mapped_data")
        if not mapped_data:
            print("❌ Lỗi: Không tìm thấy dữ liệu Mapper.")
            return False

        keywords = mapped_data.get("keywords", [])
        if not keywords:
            print("  ⚠️ Không có keywords nào được trích xuất. Chuyển tiếp.")
            self.o.state["reduced_data"] = {"conflicts": [], "new_concepts": []}
            return True

        existing_nodes = self._get_existing_atomic_nodes()
        print(f"  🔍 Phát hiện {len(existing_nodes)} nốt nguyên tử hiện có trong hệ thống.")

        llm_prompt = f"""Bạn là một Lead Architect chuyên gia về hệ thống tri thức.
Chúng tôi chuẩn bị nạp thêm các khái niệm mới vào kho tri thức, nhưng cần đảm bảo cấu trúc lưu trữ phẳng và không có trùng lặp (deduplication).

Các khái niệm hiện tại trong hệ thống:
{json.dumps(existing_nodes, ensure_ascii=False, indent=2)}

Các khái niệm mới muốn nạp thêm:
{json.dumps(keywords, ensure_ascii=False, indent=2)}

Nhiệm vụ:
So sánh đối đầu giữa các khái niệm MỚI và CŨ.
1. Nếu khái niệm mới trùng lặp hoặc thuộc phạm trù đã giải thích ở nốt cũ, xếp nó vào diện 'merge' (trộn/cập nhật nốt cũ).
2. Nếu khái niệm mới hoàn toàn mới, đề xuất tạo mới (new_concepts) và gợi ý slug phù hợp (viết thường, gạch ngang, vd: 'token-budget').

Đầu ra bắt buộc (JSON):
{{
  "conflicts": [
    {{
      "keyword": "Tên khái niệm mới",
      "existing_slug": "slug-nốt-cũ-bị-trùng",
      "action": "merge",
      "reason": "Giải thích chi tiết tại sao nên trộn"
    }}
  ],
  "new_concepts": [
    {{
      "name": "Tên khái niệm mới",
      "suggested_slug": "slug-mới-phù-hợp",
      "definition": "Định nghĩa tóm tắt"
    }}
  ]
}}
"""

        try:
            response = self.o.llm.generate(prompt=llm_prompt, response_json=True)
            parsed = json.loads(response)
            self.o.state["reduced_data"] = parsed
            print(f"  ✅ Đã phát hiện {len(parsed.get('conflicts', []))} xung đột/cập nhật và {len(parsed.get('new_concepts', []))} nốt mới!")
        except Exception as e:
            print(f"  ⚠️ Lỗi phân tích trùng lặp LLM: {e}")
            print("  ⏭️ Chuyển sang chế độ gộp mặc định (Tất cả tạo mới)...")

            # Fallback mặc định: Tạo mới toàn bộ
            new_concepts = []
            for kw in keywords:
                name = kw.get("name", "")
                try:
                    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
                except NameError:
                    import re
                    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

                new_concepts.append({
                    "name": name,
                    "suggested_slug": slug,
                    "definition": kw.get("definition", "")
                })
            self.o.state["reduced_data"] = {
                "conflicts": [],
                "new_concepts": new_concepts
            }

        return True
