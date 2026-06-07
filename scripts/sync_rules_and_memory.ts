import * as fs from 'node:fs';
import * as path from 'node:path';
import matter from 'gray-matter';

const VAULT_ROOT = path.resolve(import.meta.dirname, '..');
const DIR_VAULT = path.join(VAULT_ROOT, 'vault');
const FEEDBACK_LOG_PATH = path.join(DIR_VAULT, 'memory', 'feedback_log.md');
const CLAUDE_MD_PATH = path.join(VAULT_ROOT, 'CLAUDE.md');

function readFileSync(filePath: string): string {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

function writeFileSync(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf-8');
}

function routeRule(ruleText: string): string {
  const lower = ruleText.toLowerCase();
  if (/(cây|expansion|phẳng|flat|parent|children|cha|con|atomic|nốt nguyên tử)/.test(lower)) {
    return path.join(DIR_VAULT, '02_atomic_nodes', 'RULE.md');
  }
  if (/(thô|raw|scrape|cào)/.test(lower)) {
    return path.join(DIR_VAULT, '00_raw_docs', 'RULE.md');
  }
  if (/(chắt lọc|cấu trúc|processed|takeaways|structured)/.test(lower)) {
    return path.join(DIR_VAULT, '01_structured_docs', 'RULE.md');
  }
  if (/(bản đồ|routing|index|chỉ mục|neural|định tuyến)/.test(lower)) {
    return path.join(DIR_VAULT, '03_neural_map', 'RULE.md');
  }
  if (/(đúc kết|distilled|tuyên ngôn|manifesto|synthesis)/.test(lower)) {
    return path.join(DIR_VAULT, '04_distilled', 'RULE.md');
  }
  if (/(bộ nhớ|memory|feedback|đồng bộ|sync|user|roadmap|hồ sơ)/.test(lower)) {
    return path.join(DIR_VAULT, 'memory', 'RULE.md');
  }
  return CLAUDE_MD_PATH;
}

function syncRules(): void {
  let feedbackContent = readFileSync(FEEDBACK_LOG_PATH);
  if (!feedbackContent) {
    console.log('Lỗi: Không tìm thấy feedback_log.md');
    return;
  }

  const blocks: Array<{ id: string; date: string; rule: string; reason: string; full: string }> = [];
  const regex = /- \*\*ID\*\*:\s*(FB-\d+)\s*\n\s*\*\*Ngày\*\*:\s*([^\n]+)\s*\n\s*\*\*Phản hồi\/Quy tắc\*\*:\s*([^\n]+)\s*\n\s*\*\*Lý do\*\*:\s*([^\n]+)\s*\n\s*\*\*Trạng thái\*\*:\s*`pending-sync`/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(feedbackContent)) !== null) {
    blocks.push({ id: match[1], date: match[2], rule: match[3], reason: match[4], full: match[0] });
  }

  if (blocks.length === 0) {
    console.log('Không có quy tắc mới cần đồng bộ (Trạng thái: pending-sync).');
    return;
  }

  console.log(`Phát hiện ${blocks.length} quy tắc mới cần đồng bộ!`);

  for (const block of blocks) {
    const targetPath = routeRule(block.rule);
    const relTarget = path.relative(VAULT_ROOT, targetPath);
    console.log(`Đang đồng bộ quy tắc ${block.id} vào [${relTarget}]...`);

    let targetContent = readFileSync(targetPath);
    const ruleToAdd = `*   **${block.rule}** (Được phát hiện vào ${block.date} từ ${block.id}).\n`;

    if (targetPath === CLAUDE_MD_PATH) {
      const marker = '## 🛠️ Specialized Agent Skills Orchestration (SKILLS)';
      if (targetContent.includes(marker)) {
        const parts = targetContent.split(marker);
        parts[0] = parts[0] + ruleToAdd + '\n';
        targetContent = parts.join(marker);
      } else {
        targetContent += `\n\n${ruleToAdd}`;
      }
    } else {
      const marker = '---';
      if (targetContent.includes(marker)) {
        const lastIndex = targetContent.lastIndexOf(marker);
        targetContent = targetContent.substring(0, lastIndex) + ruleToAdd + '\n' + targetContent.substring(lastIndex);
      } else {
        targetContent += `\n\n${ruleToAdd}`;
      }
    }

    writeFileSync(targetPath, targetContent);

    // Cập nhật trạng thái feedback_log sang synced
    const replacement = `- **ID**: ${block.id}\n  **Ngày**: ${block.date}\n  **Phản hồi/Quy tắc**: ${block.rule}\n  **Lý do**: ${block.reason}\n  **Trạng thái**: \`synced\``;
    const escaped = block.full.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patternStr = feedbackContent.includes(block.full) ? block.full : null;
    if (patternStr) {
      feedbackContent = feedbackContent.replace(patternStr, replacement);
    }
  }

  writeFileSync(FEEDBACK_LOG_PATH, feedbackContent);
  console.log('>>> Đồng bộ hóa RULE và MEMORY thành công!');
}

function getAllFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const parts = fullPath.split(path.sep);
      if (!parts.some(p => p.startsWith('.') && p !== '.agent')) {
        results = results.concat(getAllFiles(fullPath));
      }
    } else if (file.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function auditLinks(): void {
  console.log('\n=== BẮT ĐẦU KIỂM TOÁN LIÊN KẾT (LINK AUDIT) ===');
  const allFiles = getAllFiles(DIR_VAULT);
  const fileMap = new Map<string, string>();

  for (const f of allFiles) {
    const name = path.basename(f);
    fileMap.set(name, f);
    fileMap.set(name.slice(0, -3), f);
  }

  let brokenLinks = 0;
  let portabilityViolations = 0;
  let checkedFiles = 0;

  for (const file of allFiles) {
    const relPath = path.relative(DIR_VAULT, file);
    if (relPath.startsWith('Templates/') || relPath.startsWith('docs/')) continue;

    const content = readFileSync(file);
    checkedFiles++;

    const linkRegex = /\[[^\]]+\]\(([^)]+)\)/g;
    let match: RegExpExecArray | null;
    while ((match = linkRegex.exec(content)) !== null) {
      const link = match[1].trim();
      if (/^(http:\/\/|https:\/\/|#|mailto:)/.test(link)) continue;
      if (link.includes('{') || link.includes('}') || link.includes('...')) continue;

      if ((link.startsWith('/') || link.includes('../')) && !relPath.startsWith('00_raw_docs')) {
        console.log(`⚠️ Vi phạm Portability tại [${relPath}]: dùng đường dẫn [${link}] (Yêu cầu workspace-relative)`);
        portabilityViolations++;
      }

      const validDirs = ['00_raw_docs', '01_structured_docs', '02_atomic_nodes', '03_neural_map', '04_distilled', '05_journal', 'memory', '.agent', 'Templates'];
      const isInternal = validDirs.some(d => link.includes(d)) || !link.includes('/');
      if (!isInternal) continue;

      const linkName = path.basename(link);
      const hasDirect = fileMap.has(linkName) || fileMap.has(link);
      const checkLink = link.endsWith('.md') ? link : `${link}.md`;
      const checkName = linkName.endsWith('.md') ? linkName : `${linkName}.md`;
      const hasAlt = fileMap.has(checkName) || fileMap.has(checkLink);

      if (!hasDirect && !hasAlt) {
        console.log(`⚠️ Liên kết hỏng phát hiện tại [${relPath}]: trỏ tới [${link}]`);
        brokenLinks++;
      }
    }
  }

  console.log(`Đã kiểm tra ${checkedFiles} tệp markdown.`);
  if (brokenLinks === 0 && portabilityViolations === 0) {
    console.log('✅ Tất cả các liên kết trong Vault đều hợp lệ và portable!');
  } else {
    console.log(`❌ Phát hiện ${brokenLinks} liên kết hỏng và ${portabilityViolations} vi phạm portability.`);
    process.exitCode = 1;
  }
}

function auditTreeIntegrity(): void {
  console.log('\n=== BẮT ĐẦU KIỂM TOÁN CÂY TRI THỨC (TREE INTEGRITY AUDIT) ===');
  const atomicDir = path.join(DIR_VAULT, '02_atomic_nodes');
  if (!fs.existsSync(atomicDir)) {
    console.log('Không tìm thấy thư mục 02_atomic_nodes');
    return;
  }

  const nodes = new Map<string, { file: string; parent: string | null; children: string[] }>();
  const files = fs.readdirSync(atomicDir);

  for (const file of files) {
    if (!file.endsWith('.md') || !file.startsWith('HAE-concept-')) continue;

    const filePath = path.join(atomicDir, file);
    const content = readFileSync(filePath);
    const slug = file.replace('HAE-concept-', '').replace('.md', '');

    try {
      const parsed = matter(content);
      const data = parsed.data || {};
      nodes.set(slug, {
        file,
        parent: data.parent || null,
        children: data.children || [],
      });
    } catch {
      console.log(`⚠️ Lỗi cú pháp frontmatter tại [02_atomic_nodes/${file}]`);
    }
  }

  let inconsistencies = 0;
  for (const [slug, info] of nodes.entries()) {
    if (info.parent) {
      const pNode = nodes.get(info.parent);
      if (!pNode) {
        console.log(`⚠️ Lỗi Cây: Node [02_atomic_nodes/${info.file}] trỏ tới parent không tồn tại [${info.parent}]`);
        inconsistencies++;
      } else if (!pNode.children.includes(slug)) {
        console.log(`⚠️ Lỗi Cây: Node [02_atomic_nodes/${info.file}] khai báo parent là [${info.parent}], nhưng [${info.parent}] KHÔNG khai báo nó làm children`);
        inconsistencies++;
      }
    }
    for (const child of info.children) {
      const cNode = nodes.get(child);
      if (!cNode) {
        console.log(`⚠️ Lỗi Cây: Node [02_atomic_nodes/${info.file}] khai báo con không tồn tại [${child}]`);
        inconsistencies++;
      } else if (cNode.parent !== slug) {
        console.log(`⚠️ Lỗi Cây: Node [02_atomic_nodes/${info.file}] khai báo con là [${child}], nhưng [${child}] khai báo parent là [${cNode.parent}] (kỳ vọng: [${slug}])`);
        inconsistencies++;
      }
    }
  }

  if (inconsistencies === 0) {
    console.log('✅ Toàn bộ cấu trúc Cây Tri thức (Parent/Children) đều nhất quán tuyệt đối!');
  } else {
    console.log(`❌ Phát hiện ${inconsistencies} lỗi không nhất quán trong cấu trúc Cây.`);
    process.exitCode = 1;
  }
}

console.log('=== BẮT ĐẦU ĐỒNG BỘ QUY TẮC THÔNG MINH (ROUTED RULE SYNC) ===');
syncRules();
auditLinks();
auditTreeIntegrity();
