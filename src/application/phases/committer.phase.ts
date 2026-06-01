import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { IMarkdownGenerator } from '../../domain/interfaces/markdown-generator.interface.ts';
import type { IConfigProvider } from '../../domain/interfaces/config-provider.interface.ts';
import type { PlanResult } from './_types.ts';
import * as path from 'node:path';

export class CommitterPhase {
  private fs: IFileSystem;
  private mdGenerator: IMarkdownGenerator;
  private config: IConfigProvider;

  constructor(fs: IFileSystem, mdGenerator: IMarkdownGenerator, config: IConfigProvider) {
    this.fs = fs;
    this.mdGenerator = mdGenerator;
    this.config = config;
  }

  execute(planResult: PlanResult, sourcePath: string, planTimestamp: string): void {
    this.updateRawFileStatus(sourcePath);
    this.archivePlanFile(planTimestamp);
    this.updateIndexFile(planResult);
  }

  private updateRawFileStatus(sourcePath: string): void {
    if (!this.fs.fileExists(sourcePath)) return;

    let content = this.fs.readFile(sourcePath);
    const oldStatus = content.includes('status: to-process');
    if (oldStatus) {
      content = content.replace('status: to-process', 'status: processed');
    } else {
      content = content.replace(/^status:.*$/m, 'status: processed');
    }

    this.fs.writeFile(sourcePath, content);
    console.log('  ✅ Cập nhật trạng thái file nguồn gốc sang [processed].');
  }

  private archivePlanFile(planTimestamp: string): void {
    if (!planTimestamp) return;

    const planFilepath = path.join(this.config.dirJournal, `mrp_plan_${planTimestamp}.md`);
    if (!this.fs.fileExists(planFilepath)) return;

    let content = this.fs.readFile(planFilepath);

    content = content.replace('Trạng thái: `pending`', 'Trạng thái: `executed`');
    content = content.replace('Trạng thái: `approved`', 'Trạng thái: `executed`');

    this.fs.writeFile(planFilepath, content);
    console.log('  ✅ Đánh dấu tệp kế hoạch sang [executed].');
  }

  private updateIndexFile(planResult: PlanResult): void {
    if (!this.fs.fileExists(this.config.pathIndex)) return;

    const newNodes = planResult.new_nodes || [];
    if (newNodes.length === 0) return;

    let content = this.fs.readFile(this.config.pathIndex);
    const categories = this.config.loadCategories();
    const prefix = this.config.atomicPrefix;

    for (const nn of newNodes) {
      const slug = nn.slug;
      const title = nn.title || slug;
      const linkStr = `- [${title}](02_atomic_nodes/${prefix}${slug}.md)`;

      if (content.includes(linkStr)) continue;

      const category = nn.category || '';
      const matchedCategory = categories.find(c =>
        category.toLowerCase().includes(c.id.toLowerCase()) ||
        category.toLowerCase().includes(c.name.toLowerCase()) ||
        c.keywords.some(k => category.toLowerCase().includes(k.toLowerCase())),
      );
      const marker = matchedCategory ? matchedCategory.marker : categories[0].marker;

      if (content.includes(marker)) {
        content = content.replace(
          marker,
          `${marker}\n- [${title}](02_atomic_nodes/${prefix}${slug}.md) — Bổ sung tự động bởi MRP Ingestion Pipeline.`,
        );
      }
    }

    this.fs.writeFile(this.config.pathIndex, content);
    console.log('  ✅ Đã tự động cập nhật INDEX.md.');
  }
}
