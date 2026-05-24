#!/usr/bin/env python3
import os
import re
import yaml

VAULT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FEEDBACK_LOG_PATH = os.path.join(VAULT_ROOT, "memory", "feedback_log.md")
CLAUDE_MD_PATH = os.path.join(VAULT_ROOT, "CLAUDE.md")

def read_file(path):
    if not os.path.exists(path):
        return ""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def write_file(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def route_rule(rule_text):
    """
    Phân tích từ khóa để định tuyến quy tắc vào RULE.md cục bộ tương ứng
    """
    rule_lower = rule_text.lower()

    # 02_atomic_nodes/RULE.md
    if any(k in rule_lower for k in ["cây", "expansion", "phẳng", "flat", "parent", "children", "cha", "con", "atomic", "nốt nguyên tử"]):
        return os.path.join(VAULT_ROOT, "02_atomic_nodes", "RULE.md")

    # 00_raw_docs/RULE.md
    if any(k in rule_lower for k in ["thô", "raw", "scrape", "cào"]):
        return os.path.join(VAULT_ROOT, "00_raw_docs", "RULE.md")

    # 01_structured_docs/RULE.md
    if any(k in rule_lower for k in ["chắt lọc", "cấu trúc", "processed", "takeaways", "structured"]):
        return os.path.join(VAULT_ROOT, "01_structured_docs", "RULE.md")

    # 03_neural_map/RULE.md
    if any(k in rule_lower for k in ["bản đồ", "routing", "index", "chỉ mục", "neural", "định tuyến"]):
        return os.path.join(VAULT_ROOT, "03_neural_map", "RULE.md")

    # 04_distilled/RULE.md
    if any(k in rule_lower for k in ["đúc kết", "distilled", "tuyên ngôn", "manifesto", "synthesis"]):
        return os.path.join(VAULT_ROOT, "04_distilled", "RULE.md")

    # memory/RULE.md
    if any(k in rule_lower for k in ["bộ nhớ", "memory", "feedback", "đồng bộ", "sync", "user", "roadmap", "hồ sơ"]):
        return os.path.join(VAULT_ROOT, "memory", "RULE.md")

    # Mặc định đi vào CLAUDE.md gốc nếu là hiến pháp chung
    return CLAUDE_MD_PATH

def sync_rules():
    print("=== BẮT ĐẦU ĐỒNG BỘ QUY TẮC THÔNG MINH (ROUTED RULE SYNC) ===")
    feedback_content = read_file(FEEDBACK_LOG_PATH)

    if not feedback_content:
        print("Lỗi: Không tìm thấy feedback_log.md")
        return

    # Regex tìm các block feedback có status: pending-sync
    feedback_blocks = re.findall(
        r"-\s+\*\*ID\*\*:\s*(FB-\d+)\s*\n\s*\*\*Ngày\*\*:\s*([^\n]+)\s*\n\s*\*\*Phản hồi/Quy tắc\*\*:\s*([^\n]+)\s*\n\s*\*\*Lý do\*\*:\s*([^\n]+)\s*\n\s*\*\*Trạng thái\*\*:\s*`pending-sync`",
        feedback_content
    )

    if not feedback_blocks:
        print("Không có quy tắc mới cần đồng bộ (Trạng thái: pending-sync).")
        return

    print(f"Phát hiện {len(feedback_blocks)} quy tắc mới cần đồng bộ!")

    for fb_id, fb_date, fb_rule, fb_reason in feedback_blocks:
        target_path = route_rule(fb_rule)
        rel_target = os.path.relpath(target_path, VAULT_ROOT)
        print(f"Đang đồng bộ quy tắc {fb_id} vào [{rel_target}]...")

        target_content = read_file(target_path)
        if not target_content:
            print(f"Lỗi: Không đọc được tệp {rel_target}")
            continue

        # Tạo định dạng quy tắc bổ sung
        rule_to_add = f"*   **{fb_rule}** (Được phát hiện vào {fb_date} từ {fb_id}).\n"

        # Chèn vào file
        # Nếu là CLAUDE.md, chèn vào trước phần SKILLS
        if target_path == CLAUDE_MD_PATH:
            marker = "## 🛠️ Specialized Agent Skills Orchestration (SKILLS)"
            if marker in target_content:
                parts = target_content.split(marker)
                parts[0] = parts[0] + rule_to_add + "\n"
                target_content = marker.join(parts)
            else:
                target_content += f"\n\n{rule_to_add}"
        else:
            # Đối với các file RULE.md cục bộ, chèn vào cuối file
            # Hoặc trước dòng chú thích cuối cùng nếu có
            marker = "---"
            if marker in target_content:
                parts = target_content.rsplit(marker, 1) # Tách từ dưới lên
                parts[0] = parts[0] + rule_to_add + "\n"
                target_content = marker.join(parts)
            else:
                target_content += f"\n\n{rule_to_add}"

        write_file(target_path, target_content)

        # Cập nhật trạng thái trong feedback_log.md
        pattern = re.escape(f"- **ID**: {fb_id}") + r"\s*\n\s*" + re.escape(f"**Ngày**: {fb_date}") + r"\s*\n\s*" + re.escape(f"**Phản hồi/Quy tắc**: {fb_rule}") + r"\s*\n\s*" + re.escape(f"**Lý do**: {fb_reason}") + r"\s*\n\s*" + re.escape(f"**Trạng thái**: `pending-sync`")
        replacement = f"- **ID**: {fb_id}\n  **Ngày**: {fb_date}\n  **Phản hồi/Quy tắc**: {fb_rule}\n  **Lý do**: {fb_reason}\n  **Trạng thái**: `synced`"
        feedback_content = re.sub(pattern, replacement, feedback_content)

    write_file(FEEDBACK_LOG_PATH, feedback_content)
    print(">>> Đồng bộ hóa RULE và MEMORY thành công!")

def audit_links():
    print("\n=== BẮT ĐẦU KIỂM TOÁN LIÊN KẾT (LINK AUDIT) ===")
    all_files = []
    for root, dirs, files in os.walk(VAULT_ROOT):
        # Bỏ qua các thư mục ẩn trừ .agent
        parts = root.split(os.sep)
        if any(part.startswith('.') and part != '.agent' for part in parts):
            continue
        for file in files:
            if file.endswith(".md"):
                all_files.append(os.path.join(root, file))

    # Bản đồ tên file -> đường dẫn
    file_map = {}
    for f in all_files:
        name = os.path.basename(f)
        file_map[name] = f
        file_map[name[:-3]] = f

    broken_links = 0
    checked_files = 0
    portability_violations = 0

    for file_path in all_files:
        rel_path = os.path.relpath(file_path, VAULT_ROOT)

        # Bỏ qua kiểm tra liên kết cho Templates và tài liệu thiết kế/context handoff
        if rel_path.startswith(("Templates/", "docs/")):
            continue

        content = read_file(file_path)
        checked_files += 1

        # Tìm các liên kết dạng [Label](link) trong Markdown
        links = re.findall(r"\[[^\]]+\]\(([^)]+)\)", content)
        for link in links:
            link = link.strip()

            # Bỏ qua liên kết web ngoài, anchor hoặc mailto
            if link.startswith(("http://", "https://", "#", "mailto:")):
                continue

            # Bỏ qua các placeholders của Obsidian Templates hoặc ký tự đại diện ví dụ
            if "{" in link or "}" in link or "..." in link:
                continue

            # 1. Kiểm tra Portability (Không tuyệt đối, không ../) - Bỏ qua 00_raw_docs
            if (link.startswith("/") or "../" in link) and not rel_path.startswith("00_raw_docs"):
                print(f"⚠️ Vi phạm Portability tại [{rel_path}]: dùng đường dẫn [{link}] (Yêu cầu workspace-relative)")
                portability_violations += 1

            valid_dirs = ("00_raw_docs", "01_structured_docs", "02_atomic_nodes", "03_neural_map", "04_distilled", "05_journal", "memory", ".agent", "Templates")
            is_internal = any(d in link for d in valid_dirs) or not ("/" in link)

            if not is_internal:
                continue

            # Xử lý liên kết
            link_name = os.path.basename(link)
            if link_name not in file_map and link not in file_map:
                check_link = link if link.endswith(".md") else f"{link}.md"
                check_name = link_name if link_name.endswith(".md") else f"{link_name}.md"
                if check_name not in file_map and check_link not in file_map:
                    print(f"⚠️ Liên kết hỏng phát hiện tại [{rel_path}]: trỏ tới [{link}]")
                    broken_links += 1

    print(f"Đã kiểm tra {checked_files} tệp markdown.")
    if broken_links == 0 and portability_violations == 0:
        print("✅ Tất cả các liên kết trong Vault đều hợp lệ và portable!")
    else:
        print(f"❌ Phát hiện {broken_links} liên kết hỏng và {portability_violations} vi phạm portability.")

def audit_tree_integrity():
    print("\n=== BẮT ĐẦU KIỂM TOÁN CÂY TRI THỨC (TREE INTEGRITY AUDIT) ===")
    atomic_dir = os.path.join(VAULT_ROOT, "02_atomic_nodes")
    if not os.path.exists(atomic_dir):
        print("Không tìm thấy thư mục 02_atomic_nodes")
        return

    # Quét tất cả nốt nguyên tử
    nodes = {}
    for file in os.listdir(atomic_dir):
        if file.endswith(".md") and file.startswith("HAE-concept-"):
            filepath = os.path.join(atomic_dir, file)
            content = read_file(filepath)
            slug = file.replace("HAE-concept-", "").replace(".md", "")

            # Phân tích Frontmatter YAML thủ công bằng regex đơn giản phòng hờ lỗi parse
            parent = None
            children = []

            # Tách frontmatter
            fm_match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
            if fm_match:
                fm_text = fm_match.group(1)
                try:
                    data = yaml.safe_load(fm_text)
                    if data:
                        parent = data.get("parent")
                        children = data.get("children", [])
                        if children is None:
                            children = []
                except Exception as e:
                    print(f"⚠️ Lỗi cú pháp YAML tại [02_atomic_nodes/{file}]: {e}")

            nodes[slug] = {
                "file": file,
                "parent": parent,
                "children": children
            }

    # Kiểm toán tính nhất quán parent-children
    inconsistencies = 0
    for slug, info in nodes.items():
        parent = info["parent"]
        children = info["children"]

        # 1. Nếu có parent, parent PHẢI tồn tại và PHẢI khai báo slug này là children
        if parent:
            if parent not in nodes:
                print(f"⚠️ Lỗi Cây: Node [02_atomic_nodes/{info['file']}] trỏ tới parent không tồn tại [{parent}]")
                inconsistencies += 1
            else:
                parent_children = nodes[parent]["children"]
                if slug not in parent_children:
                    print(f"⚠️ Lỗi Cây: Node [02_atomic_nodes/{info['file']}] khai báo parent là [{parent}], nhưng [{parent}] KHÔNG khai báo nó làm children")
                    inconsistencies += 1

        # 2. Nếu có children, từng con PHẢI tồn tại và PHẢI khai báo slug này làm parent
        for child in children:
            if child not in nodes:
                print(f"⚠️ Lỗi Cây: Node [02_atomic_nodes/{info['file']}] khai báo con không tồn tại [{child}]")
                inconsistencies += 1
            else:
                child_parent = nodes[child]["parent"]
                if child_parent != slug:
                    print(f"⚠️ Lỗi Cây: Node [02_atomic_nodes/{info['file']}] khai báo con là [{child}], nhưng [{child}] khai báo parent là [{child_parent}] (kỳ vọng: [{slug}])")
                    inconsistencies += 1

    if inconsistencies == 0:
        print("✅ Toàn bộ cấu trúc Cây Tri thức (Parent/Children) đều nhất quán tuyệt đối!")
    else:
        print(f"❌ Phát hiện {inconsistencies} lỗi không nhất quán trong cấu trúc Cây.")

if __name__ == "__main__":
    sync_rules()
    audit_links()
    audit_tree_integrity()
