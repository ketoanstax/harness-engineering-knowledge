import * as path from 'node:path';
import matter from 'gray-matter';
import type { INodeRepository, AtomicNodeMeta } from '../../domain/interfaces/node-repository.interface.ts';
import type { IConfigProvider } from '../../domain/interfaces/config-provider.interface.ts';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';

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
}
