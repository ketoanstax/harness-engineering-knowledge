import os
import re
from datetime import datetime

from scripts.mrp_pipeline.core.config import DIR_RAW, DIR_JOURNAL, PATH_INDEX

##############################
#                            #
#  PHASE COMMITTER           #
#  Hoàn tất và đóng dấu      #
#  ghi nhận tri thức         #
#                            #
##############################

class PhaseCommitter:
    """
    Phase C (Commit): Lưu trữ plan đã thực thi,
    cập nhật INDEX, cập nhật trạng thái file thô sang `processed`.
    """
    def __init__(self, orchestrator):
        self.o = orchestrator

    def _update_raw_file_status(self):
        """Cập nhật status của file thô ở 00_raw_docs sang processed."""
        raw_path = self.o.source_path
        if not os.path.exists(raw_path):
            return

        with open(raw_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Regex tìm status: to-process hoặc tương tự
        if "status: to-process" in content:
            content = content.replace("status: to-process", "status: processed")
        else:
            # Thêm thủ công vào frontmatter nếu chưa có
            content = re.sub(r"^status:.*$", "status: processed", content, flags=re.M)

        with open(raw_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("  ✅ Cập nhật trạng thái file nguồn gốc sang [processed].")

    def _archive_plan_file(self):
        """Cập nhật trạng thái trong file kế hoạch sang executed."""
        plan_timestamp = self.o.state.get("plan_timestamp")
        if not plan_timestamp:
            return

        plan_filepath = os.path.join(DIR_JOURNAL, f"mrp_plan_{plan_timestamp}.md")
        if not os.path.exists(plan_filepath):
            return

        with open(plan_filepath, "r", encoding="utf-8") as f:
            content = f.read()

        content = content.replace("Trạng thái: `pending`", "Trạng thái: `executed`")
        content = content.replace("Trạng thái: `approved`", "Trạng thái: `executed`")

        with open(plan_filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print("  ✅ Đánh dấu tệp kế hoạch sang [executed].")

    def _update_index_file(self):
        """Cập nhật nốt mới vào neural_map/INDEX.md."""
        if not os.path.exists(PATH_INDEX):
            return

        plan_data = self.o.state.get("plan_item_data")
        if not plan_data:
            return

        new_nodes = plan_data.get("new_nodes", [])
        if not new_nodes:
            return

        with open(PATH_INDEX, "r", encoding="utf-8") as f:
            content = f.read()

        # Thêm các nốt vào mục lục phù hợp (ví dụ Harness Core Concepts)
        for nn in new_nodes:
            slug = nn["slug"]
            title = nn.get("title", slug)
            link_str = f"- [{title}](02_atomic_nodes/HAE-concept-{slug}.md)"

            if link_str in content:
                continue

            # Tìm danh mục phù hợp
            category = nn.get("category", "")
            marker = ""
            if "Core" in category:
                marker = "### 1. Khung gá cốt lõi (Harness Core Concepts)"
            elif "Cognitive" in category:
                marker = "### 2. Quản lý Nhận thức (Cognitive & Context Management)"
            elif "Workflow" in category:
                marker = "### 3. Kiến trúc Quy trình làm việc (Workflow Architecture)"
            elif "Guardrails" in category:
                marker = "### 4. Rào chắn An toàn (Guardrails & Safety)"
            elif "Verification" in category:
                marker = "### 5. Xác thực & Đo lường chất lượng (Verification)"
            else:
                marker = "### 1. Khung gá cốt lõi (Harness Core Concepts)"

            if marker in content:
                content = content.replace(marker, f"{marker}\n- [{title}](02_atomic_nodes/HAE-concept-{slug}.md) — Bổ sung tự động bởi MRP Ingestion Pipeline.")

        with open(PATH_INDEX, "w", encoding="utf-8") as f:
            f.write(content)
        print("  ✅ Đã tự động cập nhật và lập chỉ mục trong [03_neural_map/INDEX.md].")

    def execute(self) -> bool:
        print(f"\n{'='*50}")
        print(f"📦  Phase C - COMMITTER: Đóng dấu và lưu trữ tri thức")
        print(f"{'='*50}")

        try:
            self._update_raw_file_status()
            self._archive_plan_file()
            self._update_index_file()

            self.o.state["committed"] = True
            print("  ✅ Commit thành công.")
            return True
        except Exception as e:
            print(f"  ❌ Lỗi commit: {e}")
            return False
