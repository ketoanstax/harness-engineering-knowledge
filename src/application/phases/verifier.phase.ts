import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import { DIR_ATOMIC, DIR_VAULT, VAULT_ROOT } from '../../core/config.ts';
import type { VerificationResult } from './_types.ts';
import matter from 'gray-matter';
import * as path from 'node:path';

export class VerifierPhase {
  constructor(private fs: IFileSystem) {}

  execute(): VerificationResult {
    console.log('\n=== BẮT ĐẦU KIỂM TOÁN LIÊN KẾT (LINK AUDIT) ===');

    const allFiles = this.getAllMarkdownFiles(DIR_VAULT);

    // Bản đồ tên file -> đường dẫn
    const fileMap = new Map<string, string>();
    for (const f of allFiles) {
      const name = path.basename(f);
      fileMap.set(name, f);
      fileMap.set(name.replace(/\.md$/, ''), f);
    }

    let brokenLinks = 0;
    let checkedFiles = 0;
    let portabilityViolations = 0;

    for (const filePath of allFiles) {
      const relPath = path.relative(DIR_VAULT, filePath);

      if (relPath.startsWith('Templates/') || relPath.startsWith('docs/')) continue;

      const content = this.fs.readFile(filePath);
      checkedFiles++;

      const links: string[] = [];
      const linkRegex = /\[[^\]]+\]\(([^)]+)\)/g;
      let match: RegExpExecArray | null;
      while ((match = linkRegex.exec(content)) !== null) {
        links.push(match[1].trim());
      }

      for (const link of links) {
        if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('#') || link.startsWith('mailto:')) continue;
        if (link.includes('{') || link.includes('}') || link.includes('...')) continue;

        // Kiểm tra Portability
        if ((link.startsWith('/') || link.includes('../')) && !relPath.startsWith('00_raw_docs')) {
          console.log(`⚠️ Vi phạm Portability tại [${relPath}]: dùng đường dẫn [${link}]`);
          portabilityViolations++;
        }

        const validDirs = ['00_raw_docs', '01_structured_docs', '02_atomic_nodes', '03_neural_map', '04_distilled', '05_journal', 'memory', '.agent', 'Templates'];
        const isInternal = validDirs.some(d => link.includes(d)) || !link.includes('/');
        if (!isInternal) continue;

        const linkName = path.basename(link);
        if (!fileMap.has(linkName) && !fileMap.has(link)) {
          const checkLink = link.endsWith('.md') ? link : `${link}.md`;
          const checkName = linkName.endsWith('.md') ? linkName : `${linkName}.md`;
          if (!fileMap.has(checkName) && !fileMap.has(checkLink)) {
            console.log(`⚠️ Liên kết hỏng tại [${relPath}]: trỏ tới [${link}]`);
            brokenLinks++;
          }
        }
      }
    }

    console.log(`Đã kiểm tra ${checkedFiles} tệp markdown.`);
    if (brokenLinks === 0 && portabilityViolations === 0) {
      console.log('✅ Tất cả các liên kết trong Vault đều hợp lệ và portable!');
    } else {
      console.log(`❌ Phát hiện ${brokenLinks} liên kết hỏng và ${portabilityViolations} vi phạm portability.`);
    }

    const inconsistencies = this.auditTreeIntegrity();

    return { brokenLinks, portabilityViolations, inconsistencies };
  }

  private auditTreeIntegrity(): number {
    console.log('\n=== BẮT ĐẦU KIỂM TOÁN CÂY TRI THỨC (TREE INTEGRITY AUDIT) ===');
    if (!this.fs.fileExists(DIR_ATOMIC)) {
      console.log('Không tìm thấy thư mục 02_atomic_nodes');
      return 0;
    }

    const nodes = new Map<string, { file: string; parent?: string; children: string[] }>();
    const files = this.fs.readdir(DIR_ATOMIC);

    for (const file of files) {
      if (!file.endsWith('.md') || !file.startsWith('HAE-concept-')) continue;

      const filepath = path.join(DIR_ATOMIC, file);
      const content = this.fs.readFile(filepath);
      const slug = file.replace('HAE-concept-', '').replace('.md', '');

      let parent: string | undefined;
      let children: string[] = [];

      try {
        const parsed = matter(content);
        const data = parsed.data || {};
        parent = data.parent || undefined;
        children = Array.isArray(data.children) ? data.children : [];
      } catch (e: any) {
        console.log(`⚠️ Lỗi cú pháp YAML tại [02_atomic_nodes/${file}]: ${e.message}`);
      }

      nodes.set(slug, { file, parent, children });
    }

    let inconsistencies = 0;
    for (const [slug, info] of nodes.entries()) {
      if (info.parent) {
        if (!nodes.has(info.parent)) {
          console.log(`⚠️ Lỗi Cây: Node [02_atomic_nodes/${info.file}] trỏ tới parent không tồn tại [${info.parent}]`);
          inconsistencies++;
        } else {
          const parentChildren = nodes.get(info.parent)!.children;
          if (!parentChildren.includes(slug)) {
            console.log(`⚠️ Lỗi Cây: Node [${info.file}] khai báo parent [${info.parent}], nhưng parent KHÔNG khai báo nó làm children`);
            inconsistencies++;
          }
        }
      }

      for (const child of info.children) {
        if (!nodes.has(child)) {
          console.log(`⚠️ Lỗi Cây: Node [${info.file}] khai báo con không tồn tại [${child}]`);
          inconsistencies++;
        } else {
          const childParent = nodes.get(child)!.parent;
          if (childParent !== slug) {
            console.log(`⚠️ Lỗi Cây: Node [${info.file}] khai báo con [${child}], nhưng con khai báo parent [${childParent}]`);
            inconsistencies++;
          }
        }
      }
    }

    if (inconsistencies === 0) {
      console.log('✅ Toàn bộ cấu trúc Cây Tri thức đều nhất quán!');
    } else {
      console.log(`❌ Phát hiện ${inconsistencies} lỗi không nhất quán.`);
    }

    return inconsistencies;
  }

  private getAllMarkdownFiles(dir: string): string[] {
    const results: string[] = [];
    if (!this.fs.fileExists(dir)) return results;

    const list = this.fs.readdir(dir);
    for (const file of list) {
      if ((file.startsWith('.') && file !== '.agent') || file === 'node_modules') continue;
      const filepath = path.join(dir, file);
      let stat;
      try { stat = this.fs.stat(filepath); } catch { continue; }
      if (stat.isDirectory()) {
        results.push(...this.getAllMarkdownFiles(filepath));
      } else if (file.endsWith('.md')) {
        results.push(filepath);
      }
    }
    return results;
  }
}
