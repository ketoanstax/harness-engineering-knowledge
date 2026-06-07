import * as path from 'node:path';
import matter from 'gray-matter';
import type { INodeRepository, AtomicNodeMeta } from '../../domain/interfaces/node-repository.interface.ts';
import type { IConfigProvider } from '../../domain/interfaces/config-provider.interface.ts';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { DraftNode } from '../../domain/entities/learning.entity.ts';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese accents
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export class FileSystemNodeRepository implements INodeRepository {
  private fs: IFileSystem;
  private config: IConfigProvider;

  constructor(fs: IFileSystem, config: IConfigProvider) {
    this.fs = fs;
    this.config = config;
  }

  findAll(): AtomicNodeMeta[] {
    const dir = this.config.dirAtomic;
    if (!this.fs.fileExists(dir)) return [];

    const prefix = this.config.atomicPrefix;
    const files = this.fs.readdir(dir);
    const nodes: AtomicNodeMeta[] = [];

    for (const file of files) {
      if (!file.endsWith('.md') || !file.startsWith(prefix)) continue;

      const filepath = path.join(dir, file);
      try {
        const content = this.fs.readFile(filepath);
        const parsed = matter(content);
        const data = parsed.data || {};

        const slug = file.replace(prefix, '').replace('.md', '');
        const title = String(data.title || slug);
        const category = String(data.category || '');
        const tags: string[] = Array.isArray(data.tags) ? data.tags : [];
        const parent = data.parent || undefined;
        const children: string[] = Array.isArray(data.children) ? data.children : [];

        // Parse definition
        let definition = '';
        const defMatch = content.match(/## 💡 Định nghĩa & Nội dung Cốt lõi\n([\s\S]+?)(?=\n##|\Z)/);
        if (defMatch) definition = defMatch[1].trim();

        nodes.push({ slug, title, category, tags, parent, children, definition, filename: file });
      } catch {
        // skip unparseable files
      }
    }

    return nodes;
  }

  async add(node: DraftNode): Promise<void> {
    const slug = slugify(node.title);
    const prefix = this.config.atomicPrefix;
    const filename = `${prefix}${slug}.md`;
    const filepath = path.join(this.config.dirAtomic, filename);

    const dateStr = new Date().toISOString().slice(0, 10);
    const tagsStr = node.tags.map(t => `  - ${t}`).join('\n');
    const parentFm = node.parent ? `\nparent: ${node.parent}` : '';
    let childrenFm = '';
    if (node.children && node.children.length > 0) {
      childrenFm = '\nchildren:\n' + node.children.map(c => `  - ${c}`).join('\n');
    }

    const markdown = `---
id: ${prefix}${slug}
title: "${node.title}"
category: "Concept"
tags:
${tagsStr}
date: ${dateStr}${parentFm}${childrenFm}
---

# ${node.title}

## 💡 Định nghĩa & Nội dung Cốt lõi
${node.definition}

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- Không có

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)
- **Nhân gốc (Causal Core)**: Không có — Khái niệm nền tảng sinh ra khái niệm này.
- **Hội tụ Duyên (Supporting Conditions)**: Không có — Các khái niệm hỗ trợ trực tiếp.
- **Quả chuyển hóa (Derivative Effects)**: Không có — Các giải pháp và hiệu quả kế thừa.

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Dẫn chứng & Nguồn gốc (Ngược dòng - Evidence & Context)**:
- **Đúc kết vĩ mô (Xuôi dòng - Distilled Thoughts)**:
  - [Đúc kết Kinh điển Nikaya](04_distilled/nikaya-distilled.md)
`;

    this.fs.writeFile(filepath, markdown);
  }
}

