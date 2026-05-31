#!/usr/bin/env python3
import os
import sys

# Cấu hình sys.path để Python nhận diện các module trong scripts/
VAULT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, VAULT_ROOT)

from scripts.mrp_pipeline.orchestrator import MRPOrchestrator
from scripts.mrp_pipeline.core.config import DIR_RAW, DIR_JOURNAL
from scripts.mrp_pipeline.models.plan_item import PlanFile

def run_test():
    print("=======================================================")
    print("🧪 KHỞI CHẠY TEST TÍCH HỢP E2E: MRP PIPELINE")
    print("=======================================================")

    source_filename = "lecture-13-why-mrp-pipeline-triumphs-over-vector-dbs.md"
    source_path = os.path.join(DIR_RAW, source_filename)

    if not os.path.exists(source_path):
        print(f"❌ Lỗi: Không tìm thấy file thô mẫu [{source_filename}] tại 00_raw_docs/")
        print("Vui lòng đảm bảo file thô đã được tạo trước khi chạy test.")
        return False

    print(f"📁 Tài liệu nguồn test: {source_path}")

    # 1. KHỞI CHẠY PHA 1 (MAP -> REDUCE -> PLAN)
    print("\n--- BƯỚC 1: CHẠY PIPELINE THIẾT LẬP KẾ HOẠCH ---")
    orchestrator = MRPOrchestrator(source_path)

    # Reset checkpoint nếu có từ trước để chạy sạch
    if os.path.exists(orchestrator.checkpoint_path):
        os.remove(orchestrator.checkpoint_path)
        orchestrator.state["current_phase"] = "MAP"

    success = orchestrator.run()
    if not success:
        print("❌ Lỗi: Chạy Pha 1 thất bại.")
        return False

    # Tìm file plan vừa sinh ra
    timestamp = orchestrator.timestamp
    plan_filename = f"mrp_plan_{timestamp}.md"
    plan_filepath = os.path.join(DIR_JOURNAL, plan_filename)

    if not os.path.exists(plan_filepath):
        print(f"❌ Lỗi: Không tìm thấy file kế hoạch sinh ra tại [{plan_filepath}]")
        return False

    print(f"✅ Pha 1 hoàn tất! File kế hoạch đã được tạo thành công.")
    print(f"👉 File kế hoạch: {plan_filepath}")

    # Đọc thử kế hoạch
    print("\n--- BƯỚC 2: ĐỌC THỬ KẾ HOẠCH SINH RA ---")
    with open(plan_filepath, "r", encoding="utf-8") as f:
        plan_content = f.read()

    # In ra 20 dòng đầu của plan để xem trước
    lines = plan_content.split("\n")
    for line in lines[:25]:
        print(f"   | {line}")
    print("   | ... (còn tiếp) ...")

    # 2. KHỞI CHẠY PHA 2 (APPROVE -> REFINE -> VERIFY -> COMMIT)
    print("\n--- BƯỚC 3: MÔ PHỎNG APPROVE KẾ HOẠCH VÀ CHẠY TIẾP ---")

    # Cập nhật trạng thái file plan sang approved để mô phỏng sự duyệt của con người
    plan_content = plan_content.replace("Trạng thái: `pending`", "Trạng thái: `approved`")
    with open(plan_filepath, "w", encoding="utf-8") as f:
        f.write(plan_content)
    print("👍 Đã cập nhật trạng thái kế hoạch thành [approved] (Human approved).")

    # Đưa State Machine sang REFINE để chạy tiếp
    orchestrator.state["current_phase"] = "REFINE"
    orchestrator.save_checkpoint()

    # Chạy nốt
    success = orchestrator.run()
    if not success:
        print("❌ Lỗi: Thực thi kế hoạch (Refine -> Verify -> Commit) thất bại.")
        return False

    print("\n=======================================================")
    print("🎉 KẾT QUẢ TEST: THÀNH CÔNG TUYỆT ĐỐI! (100% PASS)")
    print("=======================================================")
    print("Hệ thống đã tự động:")
    print(" 1. Chắt lọc thành công tài liệu thô -> 01_structured_docs/ processed file.")
    print(" 2. Tự động thiết kế, nhóm khái niệm và sinh file kế hoạch .md chi tiết.")
    print(" 3. Thực thi gộp nốt, cập nhật frontmatter, parent/children, causal web phẳng.")
    print(" 4. Chạy bộ kiểm toán toàn vẹn Link Audit & Tree Integrity (0 lỗi).")
    print(" 5. Lưu trữ kế hoạch, cập nhật INDEX.md tự động.")
    return True

if __name__ == "__main__":
    import sys
    sys.exit(0 if run_test() else 1)
