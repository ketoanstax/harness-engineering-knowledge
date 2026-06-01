import * as fs from 'node:fs';
import * as path from 'node:path';
import { AtomicNode } from '../models/atomic-node.ts';
import { DIR_ATOMIC, ATOMIC_PREFIX } from '../core/config.ts';

export class PhaseRefiner {
  private o: any;

  constructor(orchestrator: any) {
    this.o = orchestrator;
  }

  private ensurePlaceholderNode(slug: string, categoryDefault = 'Giáo lý Khác (Other Dharma)'): void {
    if (!slug) return;
    const filepath = path.join(DIR_ATOMIC, `${ATOMIC_PREFIX}${slug}.md`);
    if (fs.existsSync(filepath)) {
      return;
    }

    // Tự sinh tiêu đề đẹp từ slug (vd: vo-minh -> Vô Minh)
    const title = slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    const placeholderNode = new AtomicNode({
      slug,
      title,
      category: categoryDefault,
      tags: ['placeholder', 'draft'],
      definition: 'Nốt nháp tự động. Nội dung chi tiết của khái niệm này sẽ được tự động cập nhật khi hệ thống quét qua các bài kinh liên quan.',
      principles: ['Khái niệm này đang ở trạng thái chờ nạp dữ liệu chi tiết.'],
      parent: undefined,
      children: [],
      causalWeb: {
        causalCore: undefined,
        supportingConditions: [],
        derivativeEffects: [],
      },
      evidenceStructured: [],
      evidenceRaw: [],
    });

    fs.writeFileSync(filepath, placeholderNode.toMarkdown(), 'utf-8');
    console.log(`  🔗 Tự động phục hồi đồ thị: Đã tạo nốt nháp [${placeholderNode.fullSlug}.md]`);
  }

  async execute(): Promise<boolean> {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🛠️  Phase R - REFINER: Thực thi kế hoạch (Tạo mới & Trộn)`);
    console.log(`${'='.repeat(50)}`);

    const planData = this.o.state.plan_item_data;
    if (!planData) {
      console.log('❌ Lỗi: Không tìm thấy dữ liệu Planning.');
      return false;
    }

    const newNodes = planData.new_nodes || [];
    const mergeNodes = planData.merge_nodes || [];

    // 1. Tạo các nốt mới
    for (const nn of newNodes) {
      const slug = nn.slug;

      // Bảo đảm các nốt liên quan trong parent và causal web tồn tại
      if (nn.parent) this.ensurePlaceholderNode(nn.parent);
      if (nn.causal_core) this.ensurePlaceholderNode(nn.causal_core);
      for (const sc of (nn.causal_supporting || [])) this.ensurePlaceholderNode(sc);
      for (const de of (nn.causal_derivative || [])) this.ensurePlaceholderNode(de);
      for (const ch of (nn.children || [])) this.ensurePlaceholderNode(ch);

      const node = new AtomicNode({
        slug,
        title: nn.title || slug,
        category: nn.category || 'Harness Core Concept',
        tags: nn.tags || [],
        definition: nn.definition || '',
        principles: nn.principles || [slug],
        parent: nn.parent,
        children: nn.children || [],
        causalWeb: {
          causalCore: nn.causal_core,
          supportingConditions: nn.causal_supporting || [],
          derivativeEffects: nn.causal_derivative || [],
        },
        evidenceStructured: [`${this.o.sourceSlug}-processed`],
        evidenceRaw: [this.o.sourceSlug],
      });

      // Ghi file atomic node
      const filepath = path.join(DIR_ATOMIC, `${node.fullSlug}.md`);
      fs.writeFileSync(filepath, node.toMarkdown(), 'utf-8');
      console.log(`  ✅ Tạo nốt mới: [${node.fullSlug}.md]`);

      // TỰ ĐỘNG CẬP NHẬT TRƯỜNG CHILDREN CỦA NODE CHA
      if (node.parent) {
        const parentFilepath = path.join(DIR_ATOMIC, `${ATOMIC_PREFIX}${node.parent}.md`);
        if (fs.existsSync(parentFilepath)) {
          let pContent = fs.readFileSync(parentFilepath, 'utf-8');
          const childSlug = node.slug;

          if (!pContent.includes(`- ${childSlug}`) && !pContent.includes(`- '${childSlug}'`)) {
            const childrenMatch = pContent.match(/(children:\s*\n(?:  - .*\n?)*)(?:\n|$)/);
            if (childrenMatch) {
              const childrenSection = childrenMatch[1];
              const newSection = childrenSection.replace(/\n$/, '') + `\n  - ${childSlug}\n`;
              pContent = pContent.replace(childrenSection, newSection);
            } else {
              if (pContent.includes('date:')) {
                pContent = pContent.replace('date:', `children:\n  - ${childSlug}\ndate:`);
              } else {
                pContent = pContent.replace('---', `children:\n  - ${childSlug}\n---`);
              }
            }

            fs.writeFileSync(parentFilepath, pContent, 'utf-8');
            console.log(`  🔗 Đã tự động nối nốt con [${childSlug}] vào nốt cha [${node.parent}]`);
          }
        }
      }
    }

    // 2. Cập nhật các nốt hiện có (Merge)
    for (const mn of mergeNodes) {
      const slug = mn.slug;

      // Bảo đảm nốt cần merge và các liên kết mới tồn tại
      this.ensurePlaceholderNode(slug);
      for (const ac of (mn.added_children || [])) this.ensurePlaceholderNode(ac);
      for (const ucd of (mn.updated_causal_derivative || [])) this.ensurePlaceholderNode(ucd);

      const filepath = path.join(DIR_ATOMIC, `${ATOMIC_PREFIX}${slug}.md`);
      if (!fs.existsSync(filepath)) {
        console.log(`  ⚠️ Nốt [${slug}.md] không tồn tại (skipped).`);
        continue;
      }

      let content = fs.readFileSync(filepath, 'utf-8');

      // Cập nhật định nghĩa
      if (mn.updated_definition) {
        const oldDefMatch = content.match(/(## 💡 Định nghĩa & Nội dung Cốt lõi\n)([\s\S]+?)(?=\n##|\Z)/);
        if (oldDefMatch) {
          const oldDef = oldDefMatch[2].trim();
          content = content.replace(
            `## 💡 Định nghĩa & Nội dung Cốt lõi\n${oldDef}`,
            `## 💡 Định nghĩa & Nội dung Cốt lõi\n${mn.updated_definition}`
          );
        }
      }

      // Thêm nguyên lý mới
      for (const ap of (mn.added_principles || [])) {
        const principlesStr = ap.includes(':')
          ? `- **${ap.split(':')[0].trim()}:** ${ap.split(':').slice(1).join(':').trim()}`
          : `- ${ap}`;
        content += `\n${principlesStr}`;
      }

      // Thêm children mới
      for (const ac of (mn.added_children || [])) {
        const childrenRef = `- ${ac}`;
        if (!content.includes(childrenRef) && !content.includes(`- '${ac}'`)) {
          const childrenMatch = content.match(/(children:\s*\n(?:  - .*\n?)*)(?:\n|$)/);
          if (childrenMatch) {
            const childrenSection = childrenMatch[1];
            const newSection = childrenSection.replace(/\n$/, '') + `\n  - ${ac}\n`;
            content = content.replace(childrenSection, newSection);
          } else {
            console.log(`  ⚠️ Không tìm thấy section children trong [${slug}.md]`);
          }
        }
      }

      // TỰ ĐỘNG CẬP NHẬT DANH SÁCH DẪN CHỨNG NGUỒN (EVIDENCE & CONTEXT) KHI MERGE
      const evidenceStructuredRef = `01_structured_docs/${this.o.sourceSlug}-processed.md`;
      if (!content.includes(evidenceStructuredRef)) {
        const evidenceSectionMarker = '- **Dẫn chứng & Nguồn gốc (Ngược dòng - Evidence & Context)**:';
        if (content.includes(evidenceSectionMarker)) {
          const title = this.o.sourceSlug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
          const newEvidenceLinks = `${evidenceSectionMarker}
  - [Ghi chú cấu trúc: ${title}](01_structured_docs/${this.o.sourceSlug}-processed.md)
  - [Ghi chú thô: ${title}](00_raw_docs/${this.o.sourceSlug}.md)`;
          content = content.replace(evidenceSectionMarker, newEvidenceLinks);
        }
      }

      fs.writeFileSync(filepath, content, 'utf-8');
      console.log(`  ✅ Cập nhật nốt hiện có và nối dẫn chứng nguồn mới: [${slug}.md]`);
    }

    console.log(`  ✅ Hoàn tất tạo/cập nhật ${newNodes.length} nốt mới + ${mergeNodes.length} nốt merge.`);
    this.o.state.refined = true;
    return true;
  }
}
