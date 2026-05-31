import os
import sys

# Đảm bảo scripts/ nằm trong sys.path để import
from scripts.mrp_pipeline.core.config import VAULT_ROOT
sys.path.append(os.path.join(VAULT_ROOT, "scripts"))

from sync_rules_and_memory import audit_links, audit_tree_integrity

##############################
#                            #
#  PHASE VERIFIER            #
#  Kiểm toán liên kết và     #
#  đồ thị nhân quả tự động   #
#                            #
##############################

class PhaseVerifier:
    """
    Phase V (Verify): Chạy bộ kiểm toán liên kết (Link Audit)
    và Tree Integrity để đảm bảo không có liên kết gãy hoặc lỗi cây.
    Đây là chốt chặn 'vô địch' thay thế Unit Test mock ảo.
    """
    def __init__(self, orchestrator):
        self.o = orchestrator

    def execute(self) -> bool:
        print(f"\n{'='*50}")
        print(f"🕵️‍♂️  Phase V - VERIFIER: Kiểm toán đồ thị tri thức")
        print(f"{'='*50}")

        print("  🔄 Đang kiểm tra tính toàn vẹn liên kết và quan hệ cha-con...")

        try:
            # Chạy audit_links từ sync_rules_and_memory.py
            # Nó tự in kết quả chi tiết
            audit_links()
            # Chạy tree integrity
            audit_tree_integrity()

            print("  ✅ Kiểm toán hoàn tất. Không phát hiện lỗi nghiêm trọng.")
            self.o.state["verified"] = True
            return True
        except Exception as e:
            print(f"  ❌ Phát hiện lỗi trong pha kiểm toán: {e}")
            return False
