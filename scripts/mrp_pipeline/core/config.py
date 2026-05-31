import os

# Đường dẫn gốc của Vault (tự động tính từ thư mục chứa module, lùi 4 cấp để lên root)
VAULT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Các thư mục phân lớp trong Vault
DIR_RAW = os.path.join(VAULT_ROOT, "00_raw_docs")
DIR_STRUCTURED = os.path.join(VAULT_ROOT, "01_structured_docs")
DIR_ATOMIC = os.path.join(VAULT_ROOT, "02_atomic_nodes")
DIR_NEURAL_MAP = os.path.join(VAULT_ROOT, "03_neural_map")
DIR_DISTILLED = os.path.join(VAULT_ROOT, "04_distilled")
DIR_JOURNAL = os.path.join(VAULT_ROOT, "05_journal")

# File định tuyến & Index
PATH_INDEX = os.path.join(DIR_NEURAL_MAP, "INDEX.md")
PATH_ROUTING = os.path.join(DIR_NEURAL_MAP, "AI_ROUTING_TABLE.md")
PATH_FEEDBACK = os.path.join(VAULT_ROOT, "memory", "feedback_log.md")

# Các định dạng chuẩn
ATOMIC_PREFIX = "HAE-concept-"
STRUCTURED_SUFFIX = "-processed"
PLAN_PREFIX = "mrp_plan_"

# Đảm bảo các thư mục tồn tại
for d in [DIR_RAW, DIR_STRUCTURED, DIR_ATOMIC, DIR_NEURAL_MAP, DIR_DISTILLED, DIR_JOURNAL]:
    os.makedirs(d, exist_ok=True)
