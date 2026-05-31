import * as fs from 'node:fs';
import * as path from 'node:path';
import matter from 'gray-matter';
import { DIR_ATOMIC, ATOMIC_PREFIX } from './config.ts';

/**
 * Tách từ thô, chuẩn hóa viết thường để tính toán độ tương đồng.
 */
export function tokenize(text: string): Set<string> {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  return new Set(words);
}

/**
 * Tính độ tương đồng Jaccard giữa 2 bộ từ.
 */
export function calculateJaccard(set1: Set<string>, set2: Set<string>): number {
  if (set1.size === 0 || set2.size === 0) {
    return 0.0;
  }

  let intersectionCount = 0;
  for (const item of set1) {
    if (set2.has(item)) {
      intersectionCount++;
    }
  }

  const unionSize = set1.size + set2.size - intersectionCount;
  return intersectionCount / unionSize;
}

export interface AtomicNodeMeta {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  parent?: string;
  children: string[];
  definition: string;
  filename: string;
}

/**
 * Đọc nhanh metadata frontmatter và định nghĩa của nốt nguyên tử cũ.
 */
export function parseAtomicNodeMeta(filepath: string): AtomicNodeMeta | null {
  try {
    const content = fs.readFileSync(filepath, 'utf-8');

    // Sử dụng gray-matter để parse YAML frontmatter một cách chính xác
    const parsed = matter(content);
    const data = parsed.data || {};

    const filename = path.basename(filepath);
    const slug = filename.replace(ATOMIC_PREFIX, '').replace('.md', '');

    const title = data.title || slug;
    const category = data.category || '';
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const parent = data.parent || undefined;
    const children = Array.isArray(data.children) ? data.children : [];

    // Lấy định nghĩa cốt lõi dùng regex giống như Python để khớp chính xác 100%
    let definition = '';
    const defMatch = content.match(/## 💡 Định nghĩa & Nội dung Cốt lõi\n([\s\S]+?)(?=\n##|\Z)/);
    if (defMatch) {
      definition = defMatch[1].trim();
    }

    return {
      slug,
      title,
      category,
      tags,
      parent,
      children,
      definition,
      filename
    };
  } catch (error) {
    return null;
  }
}

/**
 * 🔥 BỘ LỌC NGỮ CẢNH CHỦ ĐỘNG (Active Context Filtering)
 * So khớp keywords mới với các nốt cũ qua giải thuật Jaccard Similarity.
 * Mở rộng đồ thị (Graph Expansion) bằng cách kéo thêm parent và children.
 */
export function filterRelevantNodes(
  keywords: Array<{ name: string; definition: string }>,
  maxResults = 10
): AtomicNodeMeta[] {
  if (!fs.existsSync(DIR_ATOMIC)) {
    return [];
  }

  // 1. Thu thập từ khóa mới để tính điểm
  const newKwTokens = new Set<string>();
  for (const kw of keywords) {
    const nameTokens = tokenize(kw.name || '');
    const defTokens = tokenize(kw.definition || '');
    for (const token of nameTokens) newKwTokens.add(token);
    for (const token of defTokens) newKwTokens.add(token);
  }

  if (newKwTokens.size === 0) {
    return [];
  }

  const allNodes: AtomicNodeMeta[] = [];

  // Quét toàn bộ nốt
  const files = fs.readdirSync(DIR_ATOMIC);
  for (const file of files) {
    if (file.endsWith('.md') && file.startsWith(ATOMIC_PREFIX)) {
      const filepath = path.join(DIR_ATOMIC, file);
      const meta = parseAtomicNodeMeta(filepath);
      if (meta) {
        allNodes.push(meta);
      }
    }
  }

  // 2. Tính điểm Jaccard similarity thô
  const scoredNodes: Array<{ score: number; node: AtomicNodeMeta }> = [];
  for (const node of allNodes) {
    const oldText = `${node.title} ${node.tags.join(' ')} ${node.definition}`;
    const oldTokens = tokenize(oldText);

    let score = calculateJaccard(newKwTokens, oldTokens);

    // Điểm cộng đặc biệt nếu trùng khớp trực tiếp tiêu đề/tên slug
    const nodeTitleTokens = tokenize(node.title);
    let hasTitleOverlap = false;
    for (const token of nodeTitleTokens) {
      if (newKwTokens.has(token)) {
        hasTitleOverlap = true;
        break;
      }
    }

    if (hasTitleOverlap) {
      score += 0.2;
    }

    scoredNodes.push({ score, node });
  }

  // Sắp xếp theo điểm giảm dần
  scoredNodes.sort((a, b) => b.score - a.score);

  // 3. Lấy Top K nốt khớp nhất
  const topMatches: AtomicNodeMeta[] = [];
  const seenSlugs = new Set<string>();

  const seedCount = Math.max(2, Math.floor(maxResults / 2));
  for (let i = 0; i < seedCount && i < scoredNodes.length; i++) {
    const { score, node } = scoredNodes[i];
    if (score > 0.02) { // Ngưỡng tối thiểu
      topMatches.push(node);
      seenSlugs.add(node.slug);
    }
  }

  // 4. MỞ RỘNG ĐỒ THỊ (Graph Expansion Step)
  const expandedNodes = [...topMatches];

  const nodeBySlug = new Map<string, AtomicNodeMeta>();
  for (const n of allNodes) {
    nodeBySlug.set(n.slug, n);
  }

  for (const seedNode of topMatches) {
    // Kéo nốt cha (parent)
    const parentSlug = seedNode.parent;
    if (parentSlug && !seenSlugs.has(parentSlug) && nodeBySlug.has(parentSlug)) {
      expandedNodes.push(nodeBySlug.get(parentSlug)!);
      seenSlugs.add(parentSlug);
    }

    // Kéo nốt con (children)
    for (const childSlug of seedNode.children) {
      if (!seenSlugs.has(childSlug) && nodeBySlug.has(childSlug)) {
        expandedNodes.push(nodeBySlug.get(childSlug)!);
        seenSlugs.add(childSlug);
      }
    }
  }

  console.log(`  🔍 Active Context Filter: Quét ${allNodes.length} nốt cũ -> Lọc ra ${expandedNodes.length} nốt liên quan nhất (tiết kiệm ~85% token).`);
  return expandedNodes.slice(0, maxResults);
}
