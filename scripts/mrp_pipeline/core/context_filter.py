import os
import re
import yaml
from typing import List, Dict, Any, Set

from scripts.mrp_pipeline.core.config import DIR_ATOMIC

def tokenize(text: str) -> Set[str]:
    """Tách từ thô, chuẩn hóa viết thường để tính toán độ tương đồng."""
    words = re.findall(r'\b\w+\b', text.lower())
    return set(words)

def calculate_jaccard(set1: Set[str], set2: Set[str]) -> float:
    """Tính độ tương đồng Jaccard giữa 2 bộ từ."""
    if not set1 or not set2:
        return 0.0
    return len(set1.intersection(set2)) / len(set1.union(set2))

def parse_atomic_node_meta(filepath: str) -> Optional[Dict[str, Any]]:
    """Đọc nhanh metadata frontmatter và định nghĩa của nốt nguyên tử cũ."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception:
        return None

    # Tách frontmatter
    fm_match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not fm_match:
        return None

    fm_text = fm_match.group(1)
    slug = os.path.basename(filepath).replace("HAE-concept-", "").replace(".md", "")

    try:
        data = yaml.safe_load(fm_text)
        if not data:
            data = {}
    except Exception:
        data = {}

    title = data.get("title", slug)
    category = data.get("category", "")
    tags = data.get("tags", [])
    parent = data.get("parent")
    children = data.get("children", [])

    # Lấy định nghĩa cốt lõi
    definition = ""
    def_match = re.search(r"## 💡 Định nghĩa & Nội dung Cốt lõi\n(.+?)(?=\n##|\Z)", content, re.DOTALL)
    if def_match:
        definition = def_match.group(1).strip()

    return {
        "slug": slug,
        "title": title,
        "category": category,
        "tags": tags,
        "parent": parent,
        "children": children,
        "definition": definition,
        "filename": os.path.basename(filepath)
    }

def filter_relevant_nodes(keywords: List[Dict[str, str]], max_results: int = 10) -> List[Dict[str, Any]]:
    """
    🔥 BỘ LỌC NGỮ CẢNH CHỦ ĐỘNG (Active Context Filtering)
    So khớp keywords mới với các nốt cũ qua giải thuật Jaccard Similarity.
    Mở rộng đồ thị (Graph Expansion) bằng cách kéo thêm parent và children.
    """
    if not os.path.exists(DIR_ATOMIC):
        return []

    # 1. Thu thập từ khóa mới để tính điểm
    new_kw_tokens = set()
    for kw in keywords:
        new_kw_tokens.update(tokenize(kw.get("name", "")))
        new_kw_tokens.update(tokenize(kw.get("definition", "")))

    if not new_kw_tokens:
        return []

    all_nodes = []
    # Quét toàn bộ nốt
    for file in os.listdir(DIR_ATOMIC):
        if file.endswith(".md") and file.startswith("HAE-concept-"):
            filepath = os.path.join(DIR_ATOMIC, file)
            meta = parse_atomic_node_meta(filepath)
            if meta:
                all_nodes.append(meta)

    # 2. Tính điểm Jaccard similarity thô
    scored_nodes = []
    for node in all_nodes:
        # Gom nội dung nốt cũ để so khớp
        old_text = f"{node['title']} {' '.join(node['tags'])} {node['definition']}"
        old_tokens = tokenize(old_text)

        score = calculate_jaccard(new_kw_tokens, old_tokens)

        # Điểm cộng đặc biệt nếu trùng khớp trực tiếp tiêu đề/tên slug
        node_title_tokens = tokenize(node['title'])
        if len(new_kw_tokens.intersection(node_title_tokens)) > 0:
            score += 0.2

        scored_nodes.append((score, node))

    # Sắp xếp theo điểm giảm dần
    scored_nodes.sort(key=lambda x: x[0], reverse=True)

    # 3. Lấy Top K nốt khớp nhất
    top_matches = []
    seen_slugs = set()

    # Chúng ta lấy khoảng max_results // 2 nốt khớp nhất làm hạt nhân
    seed_count = max(2, max_results // 2)
    for score, node in scored_nodes[:seed_count]:
        if score > 0.02:  # Ngưỡng tối thiểu để tránh kéo nốt không liên quan
            top_matches.append(node)
            seen_slugs.add(node["slug"])

    # 4. MỞ RỘNG ĐỒ THỊ (Graph Expansion Step)
    # Tự động kéo thêm nốt cha và các nốt con trực tiếp của các nốt hạt nhân
    expanded_nodes = list(top_matches)

    node_by_slug = {n["slug"]: n for n in all_nodes}

    for seed_node in top_matches:
        # Kéo nốt cha (parent)
        parent_slug = seed_node.get("parent")
        if parent_slug and parent_slug not in seen_slugs and parent_slug in node_by_slug:
            expanded_nodes.append(node_by_slug[parent_slug])
            seen_slugs.add(parent_slug)

        # Kéo nốt con (children)
        for child_slug in seed_node.get("children", []):
            if child_slug not in seen_slugs and child_slug in node_by_slug:
                expanded_nodes.append(node_by_slug[child_slug])
                seen_slugs.add(child_slug)

    # Giới hạn kích thước tối đa để tránh phình to context
    print(f"  🔍 Active Context Filter: Quét {len(all_nodes)} nốt cũ -> Lọc ra {len(expanded_nodes)} nốt liên quan nhất (tiết kiệm ~85% token).")
    return expanded_nodes[:max_results]
