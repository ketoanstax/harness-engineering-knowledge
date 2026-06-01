import { AtomicNode } from '../../domain/entities/atomic-node.entity.ts';
import { StructuredDoc } from '../../domain/entities/structured-doc.entity.ts';
import type { PlanFile, PlanItem } from '../../domain/entities/plan.entity.ts';
import { ATOMIC_PREFIX } from '../../core/config.ts';
import type { IMarkdownGenerator } from '../../domain/interfaces/markdown-generator.interface.ts';

export class MarkdownGenerator implements IMarkdownGenerator {
  generateAtomicNode(node: AtomicNode): string {
    const tagsStr = node.tags.map(t => `  - ${t}`).join('\n');
    const principlesStr = node.principles
      .map(p => {
        if (p.includes(':')) {
          const idx = p.indexOf(':');
          return `- **${p.slice(0, idx).trim()}:** ${p.slice(idx + 1).trim()}`;
        }
        return `- ${p}`;
      })
      .join('\n');

    // Causal Web
    const coreLink = node.causalWeb.causalCore
      ? `[${this.toTitle(node.causalWeb.causalCore)}](02_atomic_nodes/${ATOMIC_PREFIX}${node.causalWeb.causalCore}.md)`
      : 'Không có';

    const duyenStr = this.makeLinkList(node.causalWeb.supportingConditions, 'Không có');
    const quaStr = this.makeLinkList(node.causalWeb.derivativeEffects, 'Không có');

    // Parent/Children frontmatter
    const parentFm = node.parent ? `\nparent: ${node.parent}` : '';
    let childrenFm = '';
    if (node.children.length > 0) {
      childrenFm = '\nchildren:\n' + node.children.map(c => `  - ${c}`).join('\n');
    }

    // Evidence
    let evidenceStr = '';
    for (const s of node.evidenceStructured) {
      const title = s.replace('-processed', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      evidenceStr += `  - [Ghi chú cấu trúc: ${title}](01_structured_docs/${s}.md)\n`;
    }
    for (const r of node.evidenceRaw) {
      const title = r.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      evidenceStr += `  - [Ghi chú thô: ${title}](00_raw_docs/${r}.md)\n`;
    }

    // Sub-nodes
    let subnodesSection = '';
    if (node.children.length > 0) {
      const subnodesLinks = node.children
        .map(c => `- [${this.toTitle(c)}](02_atomic_nodes/${ATOMIC_PREFIX}${c}.md)`)
        .join('\n');
      subnodesSection = `\n## 🌳 Nốt con (Sub-Nodes)\n${subnodesLinks}\n`;
    }

    return `---
id: ${node.fullSlug}
title: "${node.title}"
category: "${node.category}"
tags:
${tagsStr}
date: ${new Date().toISOString().slice(0, 10)}${parentFm}${childrenFm}
---

# ${node.title}

## 💡 Định nghĩa & Nội dung Cốt lõi
${node.definition}

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
${principlesStr}${subnodesSection}
## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)
- **Nhân gốc (Causal Core)**: ${coreLink} — Khái niệm nền tảng sinh ra khái niệm này.
- **Hội tụ Duyên (Supporting Conditions)**: ${duyenStr} — Các khái niệm hỗ trợ trực tiếp.
- **Quả chuyển hóa (Derivative Effects)**: ${quaStr} — Các giải pháp và hiệu quả kế thừa.

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Dẫn chứng & Nguồn gốc (Ngược dòng - Evidence & Context)**:
${evidenceStr.trimEnd()}
- **Đúc kết vĩ mô (Xuôi dòng - Distilled Thoughts)**:
  - [Đúc kết Kinh điển Nikaya](04_distilled/nikaya-distilled.md)
`;
  }

  generateStructuredDoc(doc: StructuredDoc): string {
    const takeawaysStr = doc.keyTakeaways.map(t => `- ${t}`).join('\n');
    const keywordsStr = doc.keywords.map(kw => `- **${kw.name}**: ${kw.definition}`).join('\n');

    return `---
id: ${doc.slug}
title: "${doc.title}"
category: "Structured Knowledge"
tags:
  - structured
  - processed
date: ${new Date().toISOString().slice(0, 10)}
source: "00_raw_docs/${doc.sourceSlug}.md"
---

# ${doc.title}

## 💡 Key Takeaways
${takeawaysStr}

## 🗝️ Keywords & Core Concepts
${keywordsStr}

## 📝 AI-Ready Summary
${doc.summary.trim()}

---

## 🔗 Liên kết Nguồn
- [Tài liệu nguồn gốc thô](00_raw_docs/${doc.sourceSlug}.md)
`;
  }

  generatePlan(plan: PlanFile): string {
    const item = plan.items[0];
    // --- 🟢 ĐÓNG GÓI CONTAINER CHO NỐT TẠO MỚI ---
    let newNodesStr = '';
    if (item?.new_nodes && item.new_nodes.length > 0) {
      for (const nn of item.new_nodes) {
        newNodesStr += `
### 🟢 Tạo mới: \`${nn.slug}.md\`
> **Tiêu đề**: *${nn.title}*
> **Danh mục**: ${nn.category}
> **Thẻ**: ${nn.tags.join(', ')}
> **Parent**: ${nn.parent || 'Không có'}
> **Children**: ${nn.children && nn.children.length > 0 ? nn.children.join(', ') : 'Không có'}
> **Nhân gốc**: ${nn.causal_core || 'Không có'}
`;
      }
    } else {
      newNodesStr = '> Không có nốt mới nào được đề xuất.\n';
    }

    // --- 🟡 ĐÓNG GÓI CONTAINER CHO NỐT CẬP NHẬT ---
    let mergeNodesStr = '';
    if (item?.merge_nodes && item.merge_nodes.length > 0) {
      for (const mn of item.merge_nodes) {
        mergeNodesStr += `
### 🟡 Cập nhật: \`${mn.slug}.md\`
`;
        if (mn.updated_definition) {
          mergeNodesStr += `> **Định nghĩa mới**: ${mn.updated_definition}\n`;
        }
        for (const ap of mn.added_principles) {
          mergeNodesStr += `> **Thêm nguyên lý**: ${ap}\n`;
        }
        for (const ac of mn.added_children) {
          mergeNodesStr += `> **Thêm nốt con**: ${ac}\n`;
        }
      }
    } else {
      mergeNodesStr = '> Không có nốt nào cần trộn/cập nhật.\n';
    }

    return `# 📋 Kế hoạch MRP Ingestion Plan

**Trạng thái**: \`${plan.status}\`
**Thời điểm**: ${plan.planTimestamp}
**Nguồn**: ${item?.source_slug || 'Không rõ'}
**Số lượng items**: ${plan.items.length}

---

## 🧠 Luận giải (Reasoning)
> ${item?.reasoning || 'Không có luận giải.'}

---

## 🚀 Hành động Tạo mới (New Nodes)
${newNodesStr}

## 🔄 Hành động Cập nhật/Trộn (Merge Nodes)
${mergeNodesStr}

---

## 📌 Hướng dẫn duyệt
- Nếu kế hoạch **OK**, user chọn \`✅ Duyệt & chạy tiếp\`
- Nếu kế hoạch **không phù hợp**, user chọn \`❌ Từ chối & dọn dẹp\`
`;
  } 

  // --- Helpers ---

  private toTitle(slug: string): string {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  private makeLinkList(slugs: string[], fallback: string): string {
    if (slugs.length === 0) return fallback;
    return slugs
      .map(d => `[${this.toTitle(d)}](02_atomic_nodes/${ATOMIC_PREFIX}${d}.md)`)
      .join(', ');
  }
}
