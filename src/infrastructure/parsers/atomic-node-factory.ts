import type { IFrontmatterParser } from '../../domain/interfaces/frontmatter-parser.interface.ts';
import { AtomicNode } from '../../domain/entities/atomic-node.entity.ts';

export class AtomicNodeFactory {
  private parser: IFrontmatterParser;

  constructor(parser: IFrontmatterParser) {
    this.parser = parser;
  }

  fromFile(content: string, prefix: string): AtomicNode {
    const parsed = this.parser.parse(content);
    const data = parsed.data;
    const body = parsed.content;

    const slug = (data.id || '').replace(prefix, '');
    const title = data.title || slug;
    const category = data.category || 'Giáo lý Khác (Other Dharma)';
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const parent = data.parent || undefined;
    const children = Array.isArray(data.children) ? data.children : [];

    // Parse Definition
    let definition = '';
    const defMatch = body.match(/## 💡 Định nghĩa & Nội dung Cốt lõi\n([\s\S]+?)(?=\n##|\Z)/);
    if (defMatch) {
      definition = defMatch[1].trim();
    }

    // Parse Principles
    const principles: string[] = [];
    const principlesMatch = body.match(/## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn\n([\s\S]+?)(?=\n##|\Z)/);
    if (principlesMatch) {
      const lines = principlesMatch[1].split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ')) {
          let clean = trimmed.slice(2).trim();
          if (clean.startsWith('**') && clean.includes('**:')) {
            const idx = clean.indexOf('**:');
            const key = clean.slice(2, idx).trim();
            const val = clean.slice(idx + 3).trim();
            clean = `${key}: ${val}`;
          }
          principles.push(clean);
        }
      }
    }

    // Parse Causal Web
    let causalCore: string | undefined;
    const supportingConditions: string[] = [];
    const derivativeEffects: string[] = [];

    const coreMatch = body.match(/- \*\*Nhân gốc \(Causal Core\)\*\*: \[.*?\]\(02_atomic_nodes\/(?:HAE-concept-)?(.*?)\.md\)/);
    if (coreMatch && coreMatch[1] !== 'Không có') {
      causalCore = coreMatch[1].replace(prefix, '');
    }

    const extractSlugs = (line: string): string[] => {
      const slugs: string[] = [];
      const linkRegex = /\[.*?\]\(02_atomic_nodes\/(?:HAE-concept-)?(.*?)\.md\)/g;
      let m;
      while ((m = linkRegex.exec(line)) !== null) {
        slugs.push(m[1].replace(prefix, ''));
      }
      return slugs;
    };

    const lines = body.split('\n');
    for (const line of lines) {
      if (line.includes('- **Hội tụ Duyên (Supporting Conditions)**:')) {
        supportingConditions.push(...extractSlugs(line));
      } else if (line.includes('- **Quả chuyển hóa (Derivative Effects)**:')) {
        derivativeEffects.push(...extractSlugs(line));
      }
    }

    // Parse Evidence Links
    const evidenceStructured: string[] = [];
    const evidenceRaw: string[] = [];

    const structuredRegex = /\[Ghi chú cấu trúc:.*?\]\(01_structured_docs\/(.*?)\.md\)/g;
    const rawRegex = /\[Ghi chú thô:.*?\]\(00_raw_docs\/(.*?)\.md\)/g;

    let sm;
    while ((sm = structuredRegex.exec(body)) !== null) {
      evidenceStructured.push(sm[1]);
    }
    let rm;
    while ((rm = rawRegex.exec(body)) !== null) {
      evidenceRaw.push(rm[1]);
    }

    return new AtomicNode(
      slug,
      title,
      category,
      tags,
      definition,
      principles,
      parent,
      children,
      {
        causalCore,
        supportingConditions,
        derivativeEffects,
      },
      evidenceStructured,
      evidenceRaw,
    );
  }
}
