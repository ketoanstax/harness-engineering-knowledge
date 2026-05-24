#!/usr/bin/env python3
import os
import re
import yaml

VAULT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ATOMIC_DIR = os.path.join(VAULT_ROOT, "02_atomic_nodes")

def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def write_file(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def migrate_node(file_name):
    file_path = os.path.join(ATOMIC_DIR, file_name)
    content = read_file(file_path)
    slug = file_name.replace("HAE-concept-", "").replace(".md", "")

    # Tách frontmatter
    fm_match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not fm_match:
        return False

    fm_text = fm_match.group(1)
    try:
        data = yaml.safe_load(fm_text)
    except Exception as e:
        print(f"Lỗi cú pháp YAML tại {file_name}: {e}")
        return False

    if not data:
        return False

    parent = data.get("parent")
    children = data.get("children", [])
    if children is None:
        children = []

    # Định đoạt tag thông minh
    tags = data.get("tags", [])

    # Định nghĩa các primitive slugs
    primitive_slugs = [
        "session-persistence", "telemetry", "logging", "permission-layers",
        "dynamic-permission-classification", "four-hook-types", "lifecycle-hooks",
        "tool-vs-skill", "tool-skill-registry", "compaction-strategy", "token-budget"
    ]

    is_primitive = slug in primitive_slugs or any(p in slug for p in ["tool", "hook", "persist", "log", "metric", "permission"])

    # Cập nhật tags
    new_tags = []
    for t in tags:
        if t not in ["harness-concept", "harness-primitive"]:
            new_tags.append(t)

    if is_primitive:
        if "harness-primitive" not in new_tags:
            new_tags.append("harness-primitive")
    else:
        if "harness-concept" not in new_tags:
            new_tags.append("harness-concept")

    data["tags"] = new_tags

    # Tạo lại frontmatter YAML đúng chuẩn
    new_fm_text = "---\n"
    # Giữ lại các trường cơ bản
    new_fm_text += f"id: {data.get('id', 'HAE-concept-' + slug)}\n"
    new_fm_text += f"title: \"{data.get('title')}\"\n"
    new_fm_text += f"category: \"{data.get('category')}\"\n"
    new_fm_text += "tags:\n"
    for t in new_tags:
        new_fm_text += f"  - {t}\n"
    new_fm_text += f"date: 2026-05-24\n"
    new_fm_text += f"parent: {parent if parent else 'null'}\n"
    if children:
        new_fm_text += "children:\n"
        for c in children:
            new_fm_text += f"  - {c}\n"
    new_fm_text += "---"

    # Thay thế frontmatter cũ bằng frontmatter mới
    content_without_fm = content[fm_match.end():].strip()

    # Tìm phần Liên kết cũ để thay thế
    # Regex tìm từ "## 🔗 Liên kết Tri thức" hoặc "## 🔗 Mạng lưới" đến hết hoặc đến "---"
    sections = re.split(r"## 🔗 (?:Liên kết Tri thức|Mạng lưới Nhân Duyên Quả|Mạng lưới Nhân Duyên Quả Động)", content_without_fm)

    body = sections[0].strip()

    # Phân tích các liên kết cũ để tái định tuyến sang Nhân - Duyên - Quả
    # Tìm các link markdown dạng [Label](path.md)
    all_links = re.findall(r"-\s+\*\*([^*]+)\*\*:\s*\n?((?:\s*-\s*\[[^\]]+\]\([^)]+\)[^\n]*\n?)*)", content_without_fm)

    evidence_links = []
    distilled_links = []
    peer_links_raw = []

    # Thu thập các link cũ
    for label, link_block in all_links:
        label_lower = label.lower()
        links = re.findall(r"\[([^\]]+)\]\(([^)]+)\)([^\n]*)", link_block)

        if "dẫn chứng" in label_lower or "nguồn gốc" in label_lower or "evidence" in label_lower:
            evidence_links.extend(links)
        elif "đúc kết" in label_lower or "distilled" in label_lower:
            distilled_links.extend(links)
        else:
            peer_links_raw.extend(links)

    # 1. NHÂN GỐC (Causal Core)
    causal_cores = []
    if parent:
        parent_title = parent.replace("-", " ").title()
        causal_cores.append(f"  - [{parent_title}](02_atomic_nodes/HAE-concept-{parent}.md) — Là nền tảng trực tiếp sinh ra khái niệm hiện tại.")

    # 2. QUẢ CHUYỂN HÓA (Derivative Effects)
    derivative_effects = []
    for c in children:
        child_title = c.replace("-", " ").title()
        derivative_effects.append(f"  - [{child_title}](02_atomic_nodes/HAE-concept-{c}.md) — Được nốt hiện tại mở đường hoặc trực tiếp thúc đẩy phát sinh.")

    # 3. HỘI TỤ DUYÊN (Supporting Conditions)
    supporting_conditions = []

    # Lấy các peer links cũ không phải là parent hay children để làm Duyên
    for l_label, l_path, l_desc in peer_links_raw:
        l_name = os.path.basename(l_path).replace("HAE-concept-", "").replace(".md", "")
        if l_name != parent and l_name not in children and "HAE-concept-" in l_path:
            desc = l_desc.strip(" —").strip()
            if not desc:
                desc = "Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh."
            supporting_conditions.append(f"  - [{l_label}]({l_path}) — {desc}")

    # Fallbacks nếu trống để giữ cấu trúc đẹp
    if not causal_cores:
        causal_cores.append("  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*")
    if not supporting_conditions:
        supporting_conditions.append("  - *Không có Duyên kỹ thuật bổ trợ đặc thù (Vận hành độc lập).*")
    if not derivative_effects:
        derivative_effects.append("  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*")

    # Dựng lại section Liên kết mới
    causal_section = "\n## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)\n\n"
    causal_section += "- **Nhân gốc (Causal Core):**\n"
    causal_section += "\n".join(causal_cores) + "\n\n"
    causal_section += "- **Hội tụ Duyên (Supporting Conditions):**\n"
    causal_section += "\n".join(supporting_conditions) + "\n\n"
    causal_section += "- **Quả chuyển hóa (Derivative Effects):**\n"
    causal_section += "\n".join(derivative_effects) + "\n\n"

    # Dẫn chứng và Đúc kết
    causal_section += "- **Dẫn chứng & Nguồn gốc (Evidence & Context):**\n"
    if evidence_links:
        for e_label, e_path, e_desc in evidence_links:
            causal_section += f"  - [{e_label}]({e_path})\n"
    else:
        causal_section += "  - *Không có dẫn chứng ngược dòng.*\n"

    causal_section += "\n- **Đúc kết vĩ mô (Distilled Thoughts):**\n"
    if distilled_links:
        for d_label, d_path, d_desc in distilled_links:
            causal_section += f"  - [{d_label}]({d_path})\n"
    else:
        causal_section += "  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)\n"

    # Kết hợp lại file
    # Xóa phần liên kết cũ ở cuối body nếu re.split không sạch
    body_clean = re.sub(r"## 🔗.*$", "", body, flags=re.DOTALL).strip()

    new_content = f"{new_fm_text}\n\n{body_clean}\n{causal_section}"
    write_file(file_path, new_content)
    return True

def migrate_all():
    print("=== BẮT ĐẦU DI CƯ TOÀN BỘ ATOMIC NODES SANG CAUSAL WEB ===")
    count = 0
    for file in os.listdir(ATOMIC_DIR):
        if file.endswith(".md") and file.startswith("HAE-concept-"):
            success = migrate_node(file)
            if success:
                print(f"✅ Di cư thành công -> {file}")
                count += 1
            else:
                print(f"❌ Thất bại -> {file}")

    print(f"\n>>> HOÀN TẤT DI CƯ: Đã cập nhật thành công {count} nốt nguyên tử!")

if __name__ == "__main__":
    migrate_all()
