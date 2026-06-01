#!/usr/bin/env python3
"""
validate_raw_docs.py — Cơ chế tự động phát hiện file sai domain trong 00_raw_docs/.

Quét tất cả file .md trong thư mục 00_raw_docs/ và các subdir, kiểm tra:
1. File trong subdir có frontmatter domain: khớp với tên thư mục cha không.
2. File ở root (trừ RULE.md) có được khai báo trong legacy exceptions không.
3. Thư mục con có RULE.md riêng không.

Usage:
    python3 scripts/validate_raw_docs.py           # Check + báo cáo
    python3 scripts/validate_raw_docs.py --fix     # Tự động sửa (nếu an toàn)
"""

import os
import sys
import re
import yaml
from pathlib import Path

VAULT_ROOT = Path(__file__).resolve().parent.parent
RAW_DOCS_DIR = VAULT_ROOT / "vault" / "00_raw_docs"

# Legacy exceptions: các file ở root 00_raw_docs/ được phép tồn tại
LEGACY_FILES = {"RULE.md"}

# Mapping domain slug → tên thư mục con
def domain_from_dirname(dirname: str) -> str:
    """Chuyển tên thư mục thành domain slug canonical."""
    return dirname.replace("_", "-")


def extract_frontmatter(filepath: Path) -> tuple[dict | None, list[str]]:
    """Đọc YAML frontmatter từ file .md. Trả về (data, lines)."""
    try:
        content = filepath.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as e:
        return None, [f"LỖI: Không thể đọc file: {e}"]

    errors = []

    # Kiểm tra có frontmatter không
    if not content.startswith("---"):
        errors.append(f"CẢNH BÁO: File '{filepath.name}' không có YAML frontmatter.")
        return None, errors

    parts = content.split("---")
    if len(parts) < 3:
        errors.append(f"CẢNH BÁO: File '{filepath.name}' có frontmatter không đúng định dạng.")
        return None, errors

    yaml_block = parts[1]
    try:
        data = yaml.safe_load(yaml_block)
    except yaml.YAMLError as e:
        errors.append(f"LỖI: File '{filepath.name}' có YAML lỗi: {e}")
        return None, errors

    if not isinstance(data, dict):
        errors.append(f"CẢNH BÁO: File '{filepath.name}' có frontmatter rỗng hoặc không phải dict.")
        return None, errors

    return data, errors


def validate_subdir(subdir: Path, dirname: str, fix: bool = False) -> list[str]:
    """Kiểm tra tất cả file .md trong một subdir."""
    domain_slug = domain_from_dirname(dirname)
    reports = []
    ruletxt_path = subdir / "RULE.md"

    # Kiểm tra RULE.md
    if not ruletxt_path.exists():
        reports.append(f"❌ '{dirname}/' thiếu RULE.md riêng!")

    for fpath in sorted(subdir.iterdir()):
        if fpath.name == "RULE.md":
            continue
        if not fpath.suffix == ".md":
            continue

        data, errs = extract_frontmatter(fpath)
        reports.extend(errs)

        # Kiểm tra field 'domain'
        if data and "domain" not in data:
            reports.append(f"⚠️ '{dirname}/{fpath.name}' thiếu trường 'domain: ' trong frontmatter.")
        elif data and data.get("domain") != domain_slug:
            old_domain = data.get("domain", "(không có)")
            reports.append(
                f"❌ '{dirname}/{fpath.name}' có domain='{old_domain}' "
                f"— phải là '{domain_slug}'."
            )

        # Kiểm tra field 'status'
        if data and "status" not in data:
            reports.append(f"⚠️ '{dirname}/{fpath.name}' thiếu trường 'status: ' trong frontmatter.")

    return reports


def validate_root(fix: bool = False) -> list[str]:
    """Kiểm tra các file ở root 00_raw_docs/."""
    reports = []

    for fpath in sorted(RAW_DOCS_DIR.iterdir()):
        if not fpath.is_file() or not fpath.suffix == ".md":
            continue
        if fpath.name in LEGACY_FILES:
            continue

        # File legacy (sutta-mn-*, lecture-*, v.v.) — chỉ cảnh báo nhẹ
        reports.append(
            f"ℹ️  '{fpath.name}' là file legacy ở root 00_raw_docs/. "
            "Domain mới PHẢI đặt trong subdir."
        )

    return reports


def main():
    fix = "--fix" in sys.argv

    print("=" * 60)
    print("🔍 00_raw_docs/ Validation Report")
    print("=" * 60)
    print()

    all_reports = []
    all_errors = []
    all_warnings = []

    # Kiểm tra root
    root_reports = validate_root(fix=fix)
    all_reports.extend(root_reports)

    # Kiểm tra từng subdir
    for entry in sorted(RAW_DOCS_DIR.iterdir()):
        if not entry.is_dir():
            continue
        dirname = entry.name
        reports = validate_subdir(entry, dirname, fix=fix)
        all_reports.extend(reports)

    # Phân loại báo cáo
    for r in all_reports:
        if r.startswith("❌"):
            all_errors.append(r)
        elif r.startswith("⚠️") or r.startswith("ℹ️"):
            all_warnings.append(r)

    # In kết quả
    if all_errors:
        print("## ❌ Lỗi cần sửa")
        for e in all_errors:
            print(f"  {e}")
        print()

    if all_warnings:
        print("## ⚠️ Cảnh báo")
        for w in all_warnings:
            print(f"  {w}")
        print()

    if not all_errors and not all_warnings:
        print("✅ Không phát hiện vấn đề gì.")
    else:
        print(f"📊 Tổng kết: {len(all_errors)} lỗi, {len(all_warnings)} cảnh báo.")

    return 0 if not all_errors else 1


if __name__ == "__main__":
    sys.exit(main())
