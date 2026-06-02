import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { IMarkdownGenerator } from '../../domain/interfaces/markdown-generator.interface.ts';
import type { IConfigProvider } from '../../domain/interfaces/config-provider.interface.ts';
import type { IFrontmatterParser } from '../../domain/interfaces/frontmatter-parser.interface.ts';
import type { ILogger } from '../../domain/interfaces/logger.interface.ts';
import { AtomicNode } from '../../domain/entities/atomic-node.entity.ts';
import type { AtomicNodeFactory } from '../../infrastructure/parsers/atomic-node-factory.ts';
import type { PlanResult } from './_types.ts';
import * as path from 'node:path';

export class RefinerPhase {
  private fs: IFileSystem;
  private mdGenerator: IMarkdownGenerator;
  private config: IConfigProvider;
  private parser: IFrontmatterParser;
  private logger: ILogger;
  private nodeFactory: AtomicNodeFactory;

  constructor(
    fs: IFileSystem,
    mdGenerator: IMarkdownGenerator,
    config: IConfigProvider,
    parser: IFrontmatterParser,
    logger: ILogger,
    nodeFactory: AtomicNodeFactory
  ) {
    this.fs = fs;
    this.mdGenerator = mdGenerator;
    this.config = config;
    this.parser = parser;
    this.logger = logger;
    this.nodeFactory = nodeFactory;
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
      this.logger.success(`  ✅ Tạo nốt mới: [${node.fullSlug}.md]`);

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
        this.logger.warn(`  ⚠️ Nốt [${mn.slug}.md] không tồn tại (skipped).`);
        continue;
      }

      const content = this.fs.readFile(filepath);
      const node = this.nodeFactory.fromFile(content, this.config.atomicPrefix);

      // Cập nhật định nghĩa
      if (mn.updated_definition) {
        node.definition = mn.updated_definition;
      }

      // Thêm nguyên lý mới
      for (const ap of (mn.added_principles || [])) {
        if (!node.principles.includes(ap)) {
          node.principles.push(ap);
        }
      }

      // Thêm children mới
      for (const ac of (mn.added_children || [])) {
        if (!node.children.includes(ac)) {
          node.children.push(ac);
        }
      }

      // TỰ ĐỘNG THÊM DẪN CHỨNG NGUỒN (Tránh magic strings)
      const evidenceStructuredRef = `${sourceSlug}${this.config.structuredSuffix}`;
      if (!node.evidenceStructured.includes(evidenceStructuredRef)) {
        node.evidenceStructured.push(evidenceStructuredRef);
      }
      if (!node.evidenceRaw.includes(sourceSlug)) {
        node.evidenceRaw.push(sourceSlug);
      }

      this.fs.writeFile(filepath, this.mdGenerator.generateAtomicNode(node));
      this.logger.success(`  ✅ Cập nhật nốt hiện có và nối dẫn chứng nguồn mới: [${mn.slug}.md]`);
    }

    this.logger.success(`  ✅ Hoàn tất tạo/cập nhật ${newNodes.length} nốt mới + ${mergeNodes.length} nốt merge.`);
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
    this.logger.info(`  🔗 Tự động phục hồi đồ thị: Đã tạo nốt nháp [${node.fullSlug}.md]`);
  }

  private updateParentChildren(parentSlug: string, childSlug: string): void {
    const parentFilepath = path.join(this.config.dirAtomic, `${this.config.atomicPrefix}${parentSlug}.md`);
    if (!this.fs.fileExists(parentFilepath)) return;

    const pContent = this.fs.readFile(parentFilepath);
    const parentNode = this.nodeFactory.fromFile(pContent, this.config.atomicPrefix);

    if (!parentNode.children.includes(childSlug)) {
      parentNode.children.push(childSlug);
      this.fs.writeFile(parentFilepath, this.mdGenerator.generateAtomicNode(parentNode));
      this.logger.info(`  🔗 Đã tự động nối nốt con [${childSlug}] vào nốt cha [${parentSlug}]`);
    }
  }
}
