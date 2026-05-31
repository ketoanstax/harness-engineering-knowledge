import * as fs from 'node:fs';
import * as path from 'node:path';
import matter from 'gray-matter';
import { DIR_ATOMIC, VAULT_ROOT } from '../core/config.ts';

/**
 * Thu thập đệ quy tất cả các file markdown trong một thư mục
 */
function getAllMarkdownFiles(dir: string): string[] {
  const results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    // Bỏ qua các thư mục ẩn trừ .agent và bỏ qua node_modules
    if ((file.startsWith('.') && file !== '.agent') || file === 'node_modules') {
      continue;
    }
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat && stat.isDirectory()) {
      results.push(...getAllMarkdownFiles(filepath));
    } else if (file.endsWith('.md')) {
      results.push(filepath);
    }
  }
  return results;
}

/**
 * Kiểm toán tính toàn vẹn liên kết (Link Audit)
 */
export function auditLinks(): { brokenLinks: number; checkedFiles: number; portabilityViolations: number } {
  console.log('\n=== BẮT ĐẦU KIỂM TOÁN LIÊN KẾT (LINK AUDIT) ===');
  const allFiles = getAllMarkdownFiles(VAULT_ROOT);

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
    const relPath = path.relative(VAULT_ROOT, filePath);

    // Bỏ qua kiểm tra liên kết cho Templates và tài liệu thiết kế/context handoff
    if (relPath.startsWith('Templates/') || relPath.startsWith('docs/')) {
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    checkedFiles++;

    // Tìm các liên kết dạng [Label](link) trong Markdown
    const links: string[] = [];
    const linkRegex = /\[[^\]]+\]\(([^)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      links.push(match[1].trim());
    }

    for (const link of links) {
      // Bỏ qua liên kết web ngoài, anchor hoặc mailto
      if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('#') || link.startsWith('mailto:')) {
        continue;
      }

      // Bỏ qua các placeholders của Obsidian Templates hoặc ký tự đại diện ví dụ
      if (link.includes('{') || link.includes('}') || link.includes('...')) {
        continue;
      }

      // 1. Kiểm tra Portability (Không tuyệt đối, không ../) - Bỏ qua 00_raw_docs
      if ((link.startsWith('/') || link.includes('../')) && !relPath.startsWith('00_raw_docs')) {
        console.log(`⚠️ Vi phạm Portability tại [${relPath}]: dùng đường dẫn [${link}] (Yêu cầu workspace-relative)`);
        portabilityViolations++;
      }

      const validDirs = ['00_raw_docs', '01_structured_docs', '02_atomic_nodes', '03_neural_map', '04_distilled', '05_journal', 'memory', '.agent', 'Templates'];
      const isInternal = validDirs.some(d => link.includes(d)) || !link.includes('/');

      if (!isInternal) {
        continue;
      }

      // Xử lý liên kết
      const linkName = path.basename(link);
      if (!fileMap.has(linkName) && !fileMap.has(link)) {
        const checkLink = link.endsWith('.md') ? link : `${link}.md`;
        const checkName = linkName.endsWith('.md') ? linkName : `${linkName}.md`;
        if (!fileMap.has(checkName) && !fileMap.has(checkLink)) {
          console.log(`⚠️ Liên kết hỏng phát hiện tại [${relPath}]: trỏ tới [${link}]`);
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

  return { brokenLinks, checkedFiles, portabilityViolations };
}

/**
 * Kiểm toán tính nhất quán của cây tri thức (Tree Integrity Audit)
 */
export function auditTreeIntegrity(): number {
  console.log('\n=== BẮT ĐẦU KIỂM TOÁN CÂY TRI THỨC (TREE INTEGRITY AUDIT) ===');
  if (!fs.existsSync(DIR_ATOMIC)) {
    console.log('Không tìm thấy thư mục 02_atomic_nodes');
    return 0;
  }

  const nodes = new Map<string, { file: string; parent?: string; children: string[] }>();
  const files = fs.readdirSync(DIR_ATOMIC);

  for (const file of files) {
    if (file.endsWith('.md') && file.startsWith('HAE-concept-')) {
      const filepath = path.join(DIR_ATOMIC, file);
      const content = fs.readFileSync(filepath, 'utf-8');
      const slug = file.replace('HAE-concept-', '').replace('.md', '');

      let parent: string | undefined = undefined;
      let children: string[] = [];

      try {
        const parsed = matter(content);
        const data = parsed.data || {};
        parent = data.parent || undefined;
        children = Array.isArray(data.children) ? data.children : [];
      } catch (e: any) {
        console.log(`⚠️ Lỗi cú pháp YAML tại [02_atomic_nodes/${file}]: ${e.message}`);
      }

      nodes.set(slug, {
        file,
        parent,
        children
      });
    }
  }

  // Kiểm toán tính nhất quán parent-children
  let inconsistencies = 0;
  for (const [slug, info] of nodes.entries()) {
    const parent = info.parent;
    const children = info.children;

    // 1. Nếu có parent, parent PHẢI tồn tại và PHẢI khai báo slug này là children
    if (parent) {
      if (!nodes.has(parent)) {
        console.log(`⚠️ Lỗi Cây: Node [02_atomic_nodes/${info.file}] trỏ tới parent không tồn tại [${parent}]`);
        inconsistencies++;
      } else {
        const parentChildren = nodes.get(parent)!.children;
        if (!parentChildren.includes(slug)) {
          console.log(`⚠️ Lỗi Cây: Node [02_atomic_nodes/${info.file}] khai báo parent là [${parent}], nhưng [${parent}] KHÔNG khai báo nó làm children`);
          inconsistencies++;
        }
      }
    }

    // 2. Nếu có children, từng con PHẢI tồn tại và PHẢI khai báo slug này làm parent
    for (const child of children) {
      if (!nodes.has(child)) {
        console.log(`⚠️ Lỗi Cây: Node [02_atomic_nodes/${info.file}] khai báo con không tồn tại [${child}]`);
        inconsistencies++;
      } else {
        const childParent = nodes.get(child)!.parent;
        if (childParent !== slug) {
          console.log(`⚠️ Lỗi Cây: Node [02_atomic_nodes/${info.file}] khai báo con là [${child}], nhưng [${child}] khai báo parent là [${childParent}] (kỳ vọng: [${slug}])`);
          inconsistencies++;
        }
      }
    }
  }

  if (inconsistencies === 0) {
    console.log('✅ Toàn bộ cấu trúc Cây Tri thức (Parent/Children) đều nhất quán tuyệt đối!');
  } else {
    console.log(`❌ Phát hiện ${inconsistencies} lỗi không nhất quán trong cấu trúc Cây.`);
  }

  return inconsistencies;
}

export class PhaseVerifier {
  private o: any;

  constructor(orchestrator: any) {
    this.o = orchestrator;
  }

  async execute(): Promise<boolean> {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🕵️‍♂️  Phase V - VERIFIER: Kiểm toán đồ thị tri thức`);
    console.log(`${'='.repeat(50)}`);

    console.log('  🔄 Đang kiểm tra tính toàn vẹn liên kết và quan hệ cha-con...');

    try {
      const { brokenLinks, portabilityViolations } = auditLinks();
      const inconsistencies = auditTreeIntegrity();

      if (brokenLinks === 0 && portabilityViolations === 0 && inconsistencies === 0) {
        console.log('  ✅ Kiểm toán hoàn tất. Không phát hiện lỗi nghiêm trọng.');
        this.o.state.verified = true;
        return true;
      } else {
        console.log(`  ❌ Phát hiện lỗi kiểm toán: brokenLinks=${brokenLinks}, portabilityViolations=${portabilityViolations}, inconsistencies=${inconsistencies}`);
        return false;
      }
    } catch (e: any) {
      console.log(`  ❌ Phát hiện lỗi trong pha kiểm toán: ${e.message}`);
      return false;
    }
  }
}
