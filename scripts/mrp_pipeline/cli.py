import os
import argparse
from scripts.mrp_pipeline.orchestrator import MRPOrchestrator, MRPBatchOrchestrator
from scripts.mrp_pipeline.core.config import DIR_JOURNAL, DIR_RAW
from scripts.mrp_pipeline.models.plan_item import PlanFile

def cmd_run(args):
    """Lệnh chạy pipeline từ đầu đến pha tạo Plan."""
    source_path = args.source
    if not os.path.isabs(source_path):
        source_path = os.path.abspath(source_path)

    if not os.path.exists(source_path):
        # Thử tìm trong 00_raw_docs
        test_path = os.path.join(DIR_RAW, args.source)
        if os.path.exists(test_path):
            source_path = test_path
        else:
            print(f"❌ Lỗi: Không tìm thấy file [{args.source}]")
            return 1

    orchestrator = MRPOrchestrator(source_path)
    success = orchestrator.run()
    return 0 if success else 1

def cmd_batch(args):
    """Lệnh chạy batch hàng loạt file to-process theo thứ tự chronological."""
    directory = args.dir
    if not os.path.isabs(directory):
        directory = os.path.abspath(directory)

    if not os.path.exists(directory):
        print(f"❌ Lỗi: Thư mục không tồn tại [{directory}]")
        return 1

    orchestrator = MRPBatchOrchestrator(directory, auto_approve=args.auto_approve)
    success = orchestrator.run()
    return 0 if success else 1

def cmd_approve(args):
    """Lệnh phê duyệt kế hoạch và chạy nốt Refine, Verify, Commit."""
    timestamp = args.timestamp
    plan_filename = f"mrp_plan_{timestamp}.md"
    plan_filepath = os.path.join(DIR_JOURNAL, plan_filename)

    if not os.path.exists(plan_filepath):
        print(f"❌ Lỗi: Không tìm thấy kế hoạch [{plan_filename}]")
        return 1

    # Đọc nội dung plan để trích xuất source_slug
    with open(plan_filepath, "r", encoding="utf-8") as f:
        content = f.read()

    source_slug = PlanFile.parse_source_slug(content)
    if not source_slug:
        print("❌ Lỗi: Không thể phân tích tên tài liệu nguồn từ file kế hoạch.")
        return 1

    source_path = os.path.join(DIR_RAW, f"{source_slug}.md")
    if not os.path.exists(source_path):
        print(f"❌ Lỗi: Không tìm thấy tài liệu nguồn gốc [{source_slug}.md]")
        return 1

    # Khởi tạo Orchestrator từ checkpoint hoặc tạo mới để chạy tiếp
    orchestrator = MRPOrchestrator(source_path)

    # Cập nhật trạng thái duyệt trong file kế hoạch
    with open(plan_filepath, "r", encoding="utf-8") as f:
        plan_content = f.read()
    plan_content = plan_content.replace("Trạng thái: `pending`", "Trạng thái: `approved`")
    with open(plan_filepath, "w", encoding="utf-8") as f:
        f.write(plan_content)

    # Chuyển trạng thái State Machine sang REFINE
    orchestrator.state["current_phase"] = "REFINE"
    orchestrator.save_checkpoint()

    # Chạy nốt các pha còn lại
    success = orchestrator.run()
    return 0 if success else 1

def cmd_reject(args):
    """Lệnh từ chối kế hoạch."""
    timestamp = args.timestamp
    plan_filename = f"mrp_plan_{timestamp}.md"
    plan_filepath = os.path.join(DIR_JOURNAL, plan_filename)

    if not os.path.exists(plan_filepath):
        print(f"❌ Lỗi: Không tìm thấy kế hoạch [{plan_filename}]")
        return 1

    # Đọc nội dung
    with open(plan_filepath, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace("Trạng thái: `pending`", "Trạng thái: `rejected`")
    content = content.replace("Trạng thái: `approved`", "Trạng thái: `rejected`")

    with open(plan_filepath, "w", encoding="utf-8") as f:
        f.write(content)

    # Trích xuất source_slug để dọn checkpoint
    source_slug = PlanFile.parse_source_slug(content)
    if source_slug:
        checkpoint_path = os.path.join(DIR_JOURNAL, f"mrp_checkpoint_{source_slug}.json")
        if os.path.exists(checkpoint_path):
            os.remove(checkpoint_path)

    print(f"❌ Đã từ chối kế hoạch [{plan_filename}]. Đã dọn dẹp checkpoint.")
    return 0

def main():
    parser = argparse.ArgumentParser(
        description="🚀 MRP Ingestion Pipeline CLI — Hệ thống phân rã tri thức tối tân"
    )
    subparsers = parser.add_subparsers(dest="command", help="Lệnh thực thi")

    # Command: run
    parser_run = subparsers.add_parser("run", help="Chạy Ingestion Pipeline cho file thô")
    parser_run.add_argument(
        "--source", "-s", required=True,
        help="Đường dẫn file thô ở 00_raw_docs (hoặc tên file)"
    )

    # Command: batch
    parser_batch = subparsers.add_parser("batch", help="Chạy Batch Ingestion Pipeline tuần tự chronological")
    parser_batch.add_argument(
        "--dir", "-d", default=DIR_RAW,
        help="Thư mục chứa file thô (mặc định: 00_raw_docs)"
    )
    parser_batch.add_argument(
        "--auto-approve", "-a", action="store_true",
        help="Cờ chạy tự động từ đầu đến cuối không dừng (Auto-Approve)"
    )

    # Command: approve
    parser_app = subparsers.add_parser("approve", help="Phê duyệt kế hoạch và thực thi gộp nốt")
    parser_app.add_argument(
        "--timestamp", "-t", required=True,
        help="Mã thời gian của kế hoạch (vd: 20260531_220000)"
    )

    # Command: reject
    parser_rej = subparsers.add_parser("reject", help="Từ chối và dọn dẹp kế hoạch")
    parser_rej.add_argument(
        "--timestamp", "-t", required=True,
        help="Mã thời gian của kế hoạch"
    )

    args = parser.parse_args()

    if args.command == "run":
        return cmd_run(args)
    elif args.command == "batch":
        return cmd_batch(args)
    elif args.command == "approve":
        return cmd_approve(args)
    elif args.command == "reject":
        return cmd_reject(args)
    else:
        parser.print_help()
        return 1

if __name__ == "__main__":
    exit(main())
