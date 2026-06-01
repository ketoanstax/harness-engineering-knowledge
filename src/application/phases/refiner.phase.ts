import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { IMarkdownGenerator } from '../../domain/interfaces/markdown-generator.interface.ts';
import type { IConfigProvider } from '../../domain/interfaces/config-provider.interface.ts';
import { AtomicNode } from '../../domain/entities/atomic-node.entity.ts';
import type { PlanResult } from './_types.ts';
import * as path from 'node:path';

export class RefinerPhase {
  private fs: IFileSystem;
  private mdGenerator: IMarkdownGenerator;
  private config: IConfigProvider;

  constructor(fs: IFileSystem, mdGenerator: IMarkdownGenerator, config: IConfigProvider) {
    this.fs = fs;
    this.mdGenerator = mdGenerator;
    this.config = config;
  }

  execute(planResult: PlanResult, sourceSlug: string): void {
    const newNodes = planResult.new_nodes || [];
    const mergeNodes = planResult.merge_nodes || [];

    // 1. Tạo các nốt mới
    for (const nn of newNodes) {
      this.ensurePlaceholderNode(nn.parent);
      if (nn.causal_core) this.ensurePlaceholderNode(nn.causal_core);
      for (const sc of (nn.causal_supporting || [])) this.ensurePlaceholderNode(sc);
      for (const de of (nn.causal_derivative || [])) this.ensurePlaceholderNode(de);
      for (const ch of (nn.children || [])) this.ensurePlaceholderNode(ch);

      const node = new AtomicNode(
        nn.slug,
        nn.title || nn.slug,
        nn.category || 'Harness Core Concept',
        nn.tags || [],
        nn.definition || '',
        nn.principles || [nn.slug],
        nn.parent,
        nn.children || [],
        {
          causalCore: nn.causal_core,
          supportingConditions: nn.causal_supporting || [],
          derivativeEffects: nn.causal_derivative || [],
        },
        [`${sourceSlug}-processed`],
        [sourceSlug],
      );

      const filepath = path.join(this.config.dirAtomic, `${node.fullSlug}.md`);
      this.fs.writeFile(filepath, this.mdGenerator.generateAtomicNode(node));
      console.log(`  ✅ Tạo nốt mới: [${node.fullSlug}.md]`);

      // TỰ ĐỘNG CẬP NHẬT CHILDREN CỦA NODE CHA
      if (node.parent) {
        this.updateParentChildren(node.parent, node.slug);
      }
    }

    // 2. Cập nhật các nốt hiện có (Merge)
    for (const mn of mergeNodes) {
      this.ensurePlaceholderNode(mn.slug);
      for (const ac of (mn.added_children || [])) this.ensurePlaceholderNode(ac);
      for (const ucd of (mn.updated_causal_derivative || [])) this.ensurePlaceholderNode(ucd);

      const filepath = path.join(this.config.dirAtomic, `${this.config.atomicPrefix}${mn.slug}.md`);
      if (!this.fs.fileExists(filepath)) {
        console.log(`  ⚠️ Nốt [${mn.slug}.md] không tồn tại (skipped).`);
        continue;
      }

      let content = this.fs.readFile(filepath);

      // Cập nhật định nghĩa
      if (mn.updated_definition) {
        const oldDefMatch = content.match(/(## 💡 Định nghĩa & Nội dung Cốt lõi\n)([\s\S]+?)(?=\n##|\Z)/);
        if (oldDefMatch) {
          content = content.replace(
            `## 💡 Định nghĩa & Nội dung Cốt lõi\n${oldDefMatch[2].trim()}`,
            `## 💡 Định nghĩa & Nội dung Cốt lõi\n${mn.updated_definition}`,
          );
        }
      }

      // Thêm nguyên lý mới
      for (const ap of (mn.added_principles || [])) {
        content += `\n${ap.includes(':') ? `- **${ap.split(':')[0].trim()}:** ${ap.split(':').slice(1).join(':').trim()}` : `- ${ap}`}`;
      }

      // Thêm children mới
      for (const ac of (mn.added_children || [])) {
        if (!content.includes(`- ${ac}`) && !content.includes(`- '${ac}'`)) {
          const childrenMatch = content.match(/(children:\s*\n(?:  - .*\n?)*)(?:\n|$)/);
          if (childrenMatch) {
            content = content.replace(childrenMatch[1], childrenMatch[1].replace(/\n$/, '') + `\n  - ${ac}\n`);
          }
        }
      }

      // TỰ ĐỘNG THÊM DẪN CHỨNG NGUỒN
      const evidenceStructuredRef = `01_structured_docs/${sourceSlug}-processed.md`;
      if (!content.includes(evidenceStructuredRef)) {
        const evidenceMarker = '- **Dẫn chứng & Nguồn gốc (Ngược dòng - Evidence & Context)**:';
        if (content.includes(evidenceMarker)) {
          const title = sourceSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          const newEvidence = `${evidenceMarker}\n  - [Ghi chú cấu trúc: ${title}](01_structured_docs/${sourceSlug}-processed.md)\n  - [Ghi chú thô: ${title}](00_raw_docs/${sourceSlug}.md)`;
          content = content.replace(evidenceMarker, newEvidence);
        }
      }

      this.fs.writeFile(filepath, content);
      console.log(`  ✅ Cập nhật nốt hiện có và nối dẫn chứng nguồn mới: [${mn.slug}.md]`);
    }

    console.log(`  ✅ Hoàn tất tạo/cập nhật ${newNodes.length} nốt mới + ${mergeNodes.length} nốt merge.`);
  }

  private ensurePlaceholderNode(slug?: string): void {
    if (!slug) return;
    const filepath = path.join(this.config.dirAtomic, `${this.config.atomicPrefix}${slug}.md`);
    if (this.fs.fileExists(filepath)) return;

    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const node = new AtomicNode(
      slug,
      title,
      'Giáo lý Khác (Other Dharma)',
      ['placeholder', 'draft'],
      'Nốt nháp tự động. Nội dung chi tiết của khái niệm này sẽ được tự động cập nhật khi hệ thống quét qua các bài kinh liên quan.',
      ['Khái niệm này đang ở trạng thái chờ nạp dữ liệu chi tiết.'],
      undefined,
      [],
      { supportingConditions: [], derivativeEffects: [] },
    );

    this.fs.writeFile(filepath, this.mdGenerator.generateAtomicNode(node));
    console.log(`  🔗 Tự động phục hồi đồ thị: Đã tạo nốt nháp [${node.fullSlug}.md]`);
  }

  private updateParentChildren(parentSlug: string, childSlug: string): void {
    const parentFilepath = path.join(this.config.dirAtomic, `${this.config.atomicPrefix}${parentSlug}.md`);
    if (!this.fs.fileExists(parentFilepath)) return;

    let pContent = this.fs.readFile(parentFilepath);

    if (!pContent.includes(`- ${childSlug}`) && !pContent.includes(`- '${childSlug}'`)) {
      const childrenMatch = pContent.match(/(children:\s*\n(?:  - .*\n?)*)(?:\n|$)/);
      if (childrenMatch) {
        const newSection = childrenMatch[1].replace(/\n$/, '') + `\n  - ${childSlug}\n`;
        pContent = pContent.replace(childrenMatch[1], newSection);
      } else if (pContent.includes('date:')) {
        pContent = pContent.replace('date:', `children:\n  - ${childSlug}\ndate:`);
      } else {
        pContent = pContent.replace('---', `children:\n  - ${childSlug}\n---`);
      }

      this.fs.writeFile(parentFilepath, pContent);
      console.log(`  🔗 Đã tự động nối nốt con [${childSlug}] vào nốt cha [${parentSlug}]`);
    }
  }
}
