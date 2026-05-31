import os
import json
from typing import List, Dict, Any

from scripts.mrp_pipeline.core.config import DIR_ATOMIC
from scripts.mrp_pipeline.core.context_filter import filter_relevant_nodes

##############################
#                            #
#  PHASE REDUCER             #
#  Deduplication & Merge     #
#  Phát hiện trùng lặp       #
#                            #
##############################

class PhaseReducer:
    """
    Phase R (Reduce): So sánh keywords từ Mapper với các nốt nguyên tử liên quan nhất.
    Sử dụng Active Context Filtering để tối ưu hóa context window.
    Tìm kiếm xung đột, trùng lặp và đề xuất: nốt nào tạo mới, nốt nào trộn (merge).
    """
    def __init__(self, orchestrator):
        self.o = orchestrator

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

        # 🔥 ÁP DỤNG ACTIVE CONTEXT FILTERING:
        # Thay vì nạp toàn bộ nốt, chỉ nạp các nốt liên quan nhất để tiết kiệm token
        relevant_nodes = filter_relevant_nodes(keywords, max_results=12)
        print(f"  🧠 Active Context: Chỉ chọn {len(relevant_nodes)} nốt liên quan nhất để so khớp LLM.")

        llm_prompt = f"""Bạn là một Lead Architect chuyên gia về hệ thống tri thức.
Chúng tôi chuẩn bị nạp thêm các khái niệm mới vào kho tri thức, nhưng cần đảm bảo cấu trúc lưu trữ phẳng và không có trùng lặp (deduplication).

Các khái niệm liên quan hiện tại trong hệ thống:
{json.dumps(relevant_nodes, ensure_ascii=False, indent=2)}

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
