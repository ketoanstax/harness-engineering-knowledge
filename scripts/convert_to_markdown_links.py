#!/usr/bin/env python3
import os
import re

VAULT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Các thư mục tri thức
DIRS_TO_PROCESS = [
    "00_raw_docs",
    "01_structured_docs",
    "02_atomic_nodes",
    "03_neural_map",
    "04_distilled",
    "05_journal",
    "Templates",
    "memory",
    ".agent"
]

def rename_files_to_clean():
    print("=== BẮT ĐẦU ĐỒNG BỘ ĐỔI TÊN FILE SẠCH SẼ (WORKSPACE-RELATIVE) ===")
    renamed_map = {} # map: tên_file_cũ -> tên_file_mới

    for dir_name in DIRS_TO_PROCESS:
        dir_path = os.path.join(VAULT_ROOT, dir_name)
        if not os.path.exists(dir_path):
            continue

        for filename in os.listdir(dir_path):
            if not filename.endswith(".md"):
                continue

            # Regex tìm tiền tố thời gian 12 chữ số
            match = re.match(r"^(\d{12})-(.+)$", filename)
            if match:
                prefix = match.group(1)
                clean_name = match.group(2)
                old_filepath = os.path.join(dir_path, filename)
                new_filepath = os.path.join(dir_path, clean_name)

                os.rename(old_filepath, new_filepath)
                print(f"Đổi tên vật lý: {dir_name}/{filename} -> {dir_name}/{clean_name}")

                # Lưu vào map để sửa đổi link sau này
                renamed_map[filename] = clean_name
                # Lưu cả dạng không đuôi
                renamed_map[filename[:-3]] = clean_name[:-3]

    return renamed_map

def convert_wiki_links_to_markdown(renamed_map):
    print("\n=== BẮT ĐẦU CHUYỂN ĐỔI LIÊN KẾT WIKI SANG MARKDOWN (WORKSPACE-RELATIVE) ===")

    # Thu thập tất cả các file markdown sau khi đã đổi tên
    all_md_files = []
    for dir_name in DIRS_TO_PROCESS:
        dir_path = os.path.join(VAULT_ROOT, dir_name)
        if not os.path.exists(dir_path):
            continue
        for filename in os.listdir(dir_path):
            if filename.endswith(".md"):
                all_md_files.append(os.path.join(dir_path, filename))

    # Thêm file ở thư mục gốc (CLAUDE.md, README.md)
    for f in ["CLAUDE.md", "README.md"]:
        path = os.path.join(VAULT_ROOT, f)
        if os.path.exists(path):
            all_md_files.append(path)

    # Đọc và convert từng file
    for filepath in all_md_files:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        new_content = content

        # Regex tìm kiếm liên kết wiki [[path/to/file|Label]] hoặc [[path/to/file]]
        # Hỗ trợ cả trường hợp có gạch chéo ngược thoát ký tự trong bảng markdown
        wiki_link_pattern = r"\[\[([^\]|]+)(?:\\\||\|)?([^\]]*)\]\]"

        def replace_link(match):
            target = match.group(1).strip()
            label = match.group(2).strip()

            # Loại bỏ ký tự escape gạch chéo ngược
            target = target.replace("\\", "")

            # Xử lý nếu target có tên file cũ (có tiền tố thời gian)
            # Ví dụ: 00_raw_docs/202605241200-chao-mung.md
            target_parts = target.split("/")
            clean_target_parts = []
            for part in target_parts:
                part_clean = part
                # Thử loại bỏ tiền tố thời gian khỏi part
                part_match = re.match(r"^\d{12}-(.+)$", part)
                if part_match:
                    part_clean = part_match.group(1)
                clean_target_parts.append(part_clean)

            clean_target = "/".join(clean_target_parts)

            # Thêm đuôi .md nếu chưa có (trừ khi là liên kết ngoài hoặc anchor)
            if not clean_target.endswith(".md") and not clean_target.startswith("#") and ":" not in clean_target:
                clean_target += ".md"

            # Xác định Label sạch hiển thị trên Graph View
            if not label:
                # Nếu không có label, lấy tên file không đuôi làm label
                filename_only = os.path.basename(clean_target)
                if filename_only.endswith(".md"):
                    filename_only = filename_only[:-3]

                # Định dạng label cho đẹp
                label = filename_only.replace("-", " ").replace("concept ", "").replace("processed", "Processed").title()
                if "Processed" in label:
                    label = f"Processed: {label.replace(' Processed', '')}"

            # SỬ DỤNG ĐƯỜNG DẪN TƯƠNG ĐỐI THUẦN TÚY TỪ WORKSPACE ROOT
            # Ví dụ: [Label](00_raw_docs/chao-mung.md)
            # Không sử dụng ../ ở đầu để đảm bảo tính khả chuyển tối đa trong repo
            if "/" not in clean_target:
                # Nếu target chỉ có tên file mà chưa chỉ rõ thư mục con, tra cứu vị trí của nó
                found_dir = None
                for d in DIRS_TO_PROCESS:
                    if os.path.exists(os.path.join(VAULT_ROOT, d, clean_target)):
                        found_dir = d
                        break
                if found_dir:
                    workspace_path = f"{found_dir}/{clean_target}"
                else:
                    workspace_path = clean_target
            else:
                workspace_path = clean_target

            return f"[{label}]({workspace_path})"

        new_content = re.sub(wiki_link_pattern, replace_link, new_content)

        if new_content != content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Đã chuyển đổi liên kết trong -> {os.path.relpath(filepath, VAULT_ROOT)}")

if __name__ == "__main__":
    renamed = rename_files_to_clean()
    convert_wiki_links_to_markdown(renamed)
    print("\n>>> CHUYỂN ĐỔI THÀNH CÔNG TOÀN BỘ VAULT SANG LINK MARKDOWN SẠCH SẼ (WORKSPACE-RELATIVE)!")
