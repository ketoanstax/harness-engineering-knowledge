import os

# Đường dẫn gốc của Vault (tự động tính từ thư mục chứa module, lùi 4 cấp để lên root)
VAULT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

def load_dotenv():
    """Tự động đọc file .env ở root của Vault và nạp vào os.environ (Zero-dependencies)."""
    env_path = os.path.join(VAULT_ROOT, ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" in line:
                        key, val = line.split("=", 1)
                        key = key.strip()
                        val = val.strip().strip('"').strip("'")
                        os.environ[key] = val
            print("🌱  System Config: Đã nạp thành công cấu hình môi trường từ [.env] cục bộ.")
        except Exception as e:
            print(f"⚠️ Cảnh báo: Lỗi khi đọc file .env: {e}")

# Kích hoạt nạp biến môi trường tự động
load_dotenv()

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
