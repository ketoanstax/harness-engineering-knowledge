import { ATOMIC_PREFIX } from '../core/config.ts';

export interface CausalWeb {
  causalCore?: string;             // Nhân gốc (slug của parent/ancestor concept)
  supportingConditions: string[]; // Hội tụ Duyên (other concepts)
  derivativeEffects: string[];    // Quả chuyển hóa (concepts created because of this)
}

export class AtomicNode {
  slug: string;                     // Tên file không prefix/suffix (vd: "context-manager")
  title: string;                    // Tên khái niệm rõ ràng, sắc bén
  category: string;                 // Danh mục phân loại
  tags: string[];                   // Thẻ phân loại
  definition: string;               // Định nghĩa & Nội dung Cốt lõi
  principles: string[];             // Nguyên lý Kỹ thuật & Thực tiễn
  parent?: string;                  // Slug của Node cha
  children: string[];               // Danh sách slug của Node con
  causalWeb: CausalWeb;             // Mối liên hệ nhân quả
  evidenceStructured: string[];     // Các file processed làm dẫn chứng
  evidenceRaw: string[];            // Các file thô làm dẫn chứng

  constructor(data: {
    slug: string;
    title: string;
    category: string;
    tags: string[];
    definition: string;
    principles: string[];
    parent?: string;
    children?: string[];
    causalWeb?: CausalWeb;
    evidenceStructured?: string[];
    evidenceRaw?: string[];
  }) {
    this.slug = data.slug;
    this.title = data.title;
    this.category = data.category;
    this.tags = data.tags;
    this.definition = data.definition;
    this.principles = data.principles;
    this.parent = data.parent;
    this.children = data.children || [];
    this.causalWeb = data.causalWeb || { supportingConditions: [], derivativeEffects: [] };
    this.evidenceStructured = data.evidenceStructured || [];
    this.evidenceRaw = data.evidenceRaw || [];
  }

  get fullSlug(): string {
    return `${ATOMIC_PREFIX}${this.slug}`;
  }

  get relativePath(): string {
    return `02_atomic_nodes/${this.fullSlug}.md`;
  }

  toMarkdown(): string {
    const tagsStr = this.tags.map(t => `  - ${t}`).join('\n');
    const principlesStr = this.principles
      .map(p => {
        if (p.includes(':')) {
          const parts = p.split(':');
          const prefix = parts[0];
          const suffix = parts.slice(1).join(':');
          return `- **${prefix.trim()}:** ${suffix.trim()}`;
        }
        return `- ${p}`;
      })
      .join('\n');

    // Phục vụ Causal Web
    const coreLink = this.causalWeb.causalCore
      ? `[${this.causalWeb.causalCore.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}](02_atomic_nodes/${ATOMIC_PREFIX}${this.causalWeb.causalCore}.md)`
      : 'Không có';

    const duyenLinks = this.causalWeb.supportingConditions.map(
      d => `[${d.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}](02_atomic_nodes/${ATOMIC_PREFIX}${d}.md)`
    );
    const duyenStr = duyenLinks.length > 0 ? duyenLinks.join(', ') : 'Không có';

    const quaLinks = this.causalWeb.derivativeEffects.map(
      q => `[${q.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}](02_atomic_nodes/${ATOMIC_PREFIX}${q}.md)`
    );
    const quaStr = quaLinks.length > 0 ? quaLinks.join(', ') : 'Không có';

    // Phục vụ parent/children
    const parentFm = this.parent ? `\nparent: ${this.parent}` : '';
    let childrenFm = '';
    if (this.children.length > 0) {
      childrenFm = '\nchildren:\n' + this.children.map(c => `  - ${c}`).join('\n');
    }

    // Dẫn chứng ngược dòng
    let evidenceStr = '';
    for (const s of this.evidenceStructured) {
      const title = s.replace('-processed', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      evidenceStr += `  - [Ghi chú cấu trúc: ${title}](01_structured_docs/${s}.md)\n`;
    }
    for (const r of this.evidenceRaw) {
      const title = r.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      evidenceStr += `  - [Ghi chú thô: ${title}](00_raw_docs/${r}.md)\n`;
    }

    // Con nếu có
    let subnodesSection = '';
    if (this.children.length > 0) {
      const subnodesLinks = this.children
        .map(c => `- [${c.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}](02_atomic_nodes/${ATOMIC_PREFIX}${c}.md)`)
        .join('\n');
      subnodesSection = `\n## 🌳 Nốt con (Sub-Nodes)\n${subnodesLinks}\n`;
    }

    return `---
id: ${this.fullSlug}
title: "${this.title}"
category: "${this.category}"
tags:
${tagsStr}
date: 2026-05-31${parentFm}${childrenFm}
---

# ${this.title}

## 💡 Định nghĩa & Nội dung Cốt lõi
${this.definition}

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
${principlesStr}
${subnodesSection}
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
}
