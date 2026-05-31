import os
import sys
import json
from datetime import datetime
from typing import Optional, Dict, Any, List

# Core configuration and models
from scripts.mrp_pipeline.core.config import DIR_JOURNAL, DIR_RAW, DIR_STRUCTURED, DIR_ATOMIC, PATH_FEEDBACK
from scripts.mrp_pipeline.core.llm_client import LLMClient
from scripts.mrp_pipeline.models.source_doc import SourceDoc
from scripts.mrp_pipeline.models.structured_doc import StructuredDoc, KeywordDefinition
from scripts.mrp_pipeline.models.atomic_node import AtomicNode, CausalWeb
from scripts.mrp_pipeline.models.plan_item import PlanFile, PlanItem, NewNodeAction, MergeNodeAction

class MRPOrchestrator:
    """
    🔥 Trái tim điều phối: Pipeline State Machine
    Điều phối luồng dữ liệu 6 pha: MAP -> REDUCE -> PLAN -> REFINE -> VERIFY -> COMMIT
    Lưu checkpoint bền vững dưới dạng file để chống crash.
    """
    def __init__(self, source_path: str):
        self.source_path = source_path
        self.source_slug = os.path.basename(source_path).replace(".md", "")
        self.llm = LLMClient()
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.checkpoint_path = os.path.join(DIR_JOURNAL, f"mrp_checkpoint_{self.source_slug}.json")
        self.state = {
            "source_slug": self.source_slug,
            "source_path": self.source_path,
            "current_phase": "MAP",
            "timestamp": self.timestamp,
            "mapped_data": None,
            "reduced_data": None,
            "plan_timestamp": None,
            "refined": False,
            "verified": False,
            "committed": False
        }
        self.load_checkpoint()

    def load_checkpoint(self):
        """Khôi phục bối cảnh nếu phát hiện crash hoặc dở dang."""
        if os.path.exists(self.checkpoint_path):
            try:
                with open(self.checkpoint_path, "r", encoding="utf-8") as f:
                    saved_state = json.load(f)
                    self.state.update(saved_state)
                    self.timestamp = self.state["timestamp"]
                    print(f"🔄 Khôi phục checkpoint! Pha hiện tại: {self.state['current_phase']}")
            except Exception as e:
                print(f"⚠️ Không thể đọc checkpoint: {e}. Tạo mới.")

    def save_checkpoint(self):
        """Ghi nhận tiến độ làm việc trực tiếp vào file log để chống crash."""
        try:
            with open(self.checkpoint_path, "w", encoding="utf-8") as f:
                json.dump(self.state, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"⚠️ Lỗi lưu checkpoint: {e}")

    def clear_checkpoint(self):
        """Xóa checkpoint sau khi hoàn thành toàn bộ pipeline."""
        if os.path.exists(self.checkpoint_path):
            try:
                os.remove(self.checkpoint_path)
            except Exception as e:
                print(f"⚠️ Lỗi xóa checkpoint: {e}")

    def run(self) -> bool:
        """
        Kích hoạt State Machine chạy tuần tự.
        """
        print(f"\n=======================================================")
        print(f"🚀 KHỞI CHẠY MRP PIPELINE CHO: [{self.source_slug}]")
        print(f"=======================================================")

        try:
            # Phase MAP
            if self.state["current_phase"] == "MAP":
                if not self.run_map():
                    return False
                self.state["current_phase"] = "REDUCE"
                self.save_checkpoint()

            # Phase REDUCE
            if self.state["current_phase"] == "REDUCE":
                if not self.run_reduce():
                    return False
                self.state["current_phase"] = "PLAN"
                self.save_checkpoint()

            # Phase PLAN
            if self.state["current_phase"] == "PLAN":
                if not self.run_plan():
                    return False
                # DỪNG LẠI tại đây, chuyển trạng thái và chờ duyệt
                print(f"\n⏸️ PIPELINE ĐÃ DỪNG ĐỂ CHỜ DUYỆT.")
                print(f"👉 Vui lòng kiểm tra file kế hoạch tại:")
                print(f"   05_journal/mrp_plan_{self.timestamp}.md")
                print(f"👉 Hãy cập nhật trạng thái hoặc gõ lệnh để tiếp tục.")
                return True

            # Phase REFINE
            if self.state["current_phase"] == "REFINE":
                if not self.run_refine():
                    return False
                self.state["current_phase"] = "VERIFY"
                self.save_checkpoint()

            # Phase VERIFY
            if self.state["current_phase"] == "VERIFY":
                if not self.run_verify():
                    return False
                self.state["current_phase"] = "COMMIT"
                self.save_checkpoint()

            # Phase COMMIT
            if self.state["current_phase"] == "COMMIT":
                if not self.run_commit():
                    return False
                self.clear_checkpoint()
                print(f"\n🎉 HOÀN THÀNH MRP PIPELINE THÀNH CÔNG CHO [{self.source_slug}]!")
                return True

        except Exception as e:
            print(f"❌ Lỗi thực thi Pipeline: {e}")
            self.save_checkpoint()
            raise e

        return False

    def run_map(self) -> bool:
        """Pha MAP: Chắt lọc nội dung tài liệu thô thành StructuredDoc mẫu."""
        from scripts.mrp_pipeline.phases.phase_mapper import PhaseMapper
        mapper = PhaseMapper(self)
        return mapper.execute()

    def run_reduce(self) -> bool:
        """Pha REDUCE: So sánh keywords với atomic nodes hiện tại để tránh trùng lặp."""
        from scripts.mrp_pipeline.phases.phase_reducer import PhaseReducer
        reducer = PhaseReducer(self)
        return reducer.execute()

    def run_plan(self) -> bool:
        """Pha PLAN: Tạo file kế hoạch cho con người duyệt."""
        from scripts.mrp_pipeline.phases.phase_planner import PhasePlanner
        planner = PhasePlanner(self)
        return planner.execute()

    def run_refine(self) -> bool:
        """Pha REFINE: Thực thi tạo/trộn các atomic nodes sau khi được duyệt."""
        from scripts.mrp_pipeline.phases.phase_refiner import PhaseRefiner
        refiner = PhaseRefiner(self)
        return refiner.execute()

    def run_verify(self) -> bool:
        """Pha VERIFY: Kiểm toán liên kết và tính toàn vẹn cây tri thức sau thay đổi."""
        from scripts.mrp_pipeline.phases.phase_verifier import PhaseVerifier
        verifier = PhaseVerifier(self)
        return verifier.execute()

    def run_commit(self) -> bool:
        """Pha COMMIT: Cập nhật INDEX, lưu trữ plan, hoàn tất và báo cáo."""
        from scripts.mrp_pipeline.phases.phase_committer import PhaseCommitter
        committer = PhaseCommitter(self)
        return committer.execute()
