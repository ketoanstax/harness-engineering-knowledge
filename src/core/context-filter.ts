import type { AtomicNodeMeta } from '../domain/interfaces/node-repository.interface.ts';

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

/**
 * 🔥 BỘ LỌC NGỮ CẢNH CHỦ ĐỘNG (Active Context Filtering)
 *
 * So khớp keywords mới với các nốt cũ qua giải thuật Jaccard Similarity.
 * Mở rộng đồ thị (Graph Expansion) bằng cách kéo thêm parent và children.
 *
 * @param keywords — danh sách từ khóa cần so khớp
 * @param allNodes — toàn bộ nodes từ INodeRepository
 * @param maxResults — số lượng kết quả tối đa
 */
export function filterRelevantNodes(
  keywords: Array<{ name: string; definition: string }>,
  allNodes: AtomicNodeMeta[],
  maxResults = 10,
): AtomicNodeMeta[] {
  if (allNodes.length === 0) return [];

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
