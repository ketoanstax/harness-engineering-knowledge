import * as path from 'node:path';
import chalk from 'chalk';
import boxen from 'boxen';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { IConfigProvider } from '../../domain/interfaces/config-provider.interface.ts';

export interface DomainInfo {
  domain: string;
  dirPath: string;
  hasRuleMd: boolean;
  totalFiles: number;
  toProcess: number;
  processed: number;
  withoutDomainField: number;
}

export interface DomainScanResult {
  domains: DomainInfo[];
  legacyFiles: number;
  totalToProcess: number;
  totalAll: number;
}

/**
 * Quét 00_raw_docs/ đệ quy, phân tích frontmatter của từng file .md
 * (không đọc RULE.md). Trả về thống kê cho mỗi domain subdirectory
 * và các file legacy ở root.
 */
export function scanDomains(fs: IFileSystem, config: IConfigProvider): DomainScanResult {
  const domains: DomainInfo[] = [];
  let legacyFiles = 0;
  let totalToProcess = 0;
  let totalAll = 0;

  const rawDir = config.dirRaw;
  if (!fs.fileExists(rawDir)) {
    return { domains: [], legacyFiles: 0, totalToProcess: 0, totalAll: 0 };
  }

  const entries = fs.readdir(rawDir);

  for (const entry of entries) {
    const fullPath = path.join(rawDir, entry);

    if (entry === 'RULE.md' || entry.startsWith('.')) continue;

    try {
      const stat = fs.stat(fullPath);
      if (stat.isDirectory()) {
        // === Scan subdirectory (1 domain) ===
        const domain = entry;
        const hasRuleMd = fs.fileExists(path.join(fullPath, 'RULE.md'));
        const subFiles = fs.readdir(fullPath).filter(f => f.endsWith('.md') && f !== 'RULE.md');
        const info: DomainInfo = {
          domain,
          dirPath: fullPath,
          hasRuleMd,
          totalFiles: 0,
          toProcess: 0,
          processed: 0,
          withoutDomainField: 0,
        };

        for (const f of subFiles) {
          info.totalFiles++;
          totalAll++;
          const fp = path.join(fullPath, f);
          try {
            const content = fs.readFile(fp);
            // Simple frontmatter detection (no gray-matter needed for tools)
            const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
            const frontmatter: Record<string, any> = {};
            if (fmMatch) {
              for (const line of fmMatch[1].split('\n')) {
                const sep = line.indexOf(':');
                if (sep > 0) {
                  const key = line.slice(0, sep).trim();
                  const val = line.slice(sep + 1).trim().replace(/^['"]|['"]$/g, '');
                  frontmatter[key] = val;
                }
              }
            }

            if (String(frontmatter.status || '').trim() === 'to-process') {
              info.toProcess++;
              totalToProcess++;
            } else if (String(frontmatter.status || '').trim() === 'processed') {
              info.processed++;
            }

            if (!frontmatter.domain) {
              info.withoutDomainField++;
            }
          } catch {
            // skip unparseable files
          }
        }

        domains.push(info);
      } else if (entry.endsWith('.md')) {
        // === Legacy file in root ===
        legacyFiles++;
        totalAll++;
        const content = fs.readFile(fullPath);
        const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
        const frontmatter: Record<string, any> = {};
        if (fmMatch) {
          for (const line of fmMatch[1].split('\n')) {
            const sep = line.indexOf(':');
            if (sep > 0) {
              const key = line.slice(0, sep).trim();
              const val = line.slice(sep + 1).trim().replace(/^['"]|['"]$/g, '');
              frontmatter[key] = val;
            }
          }
        }
        if (String(frontmatter.status || '').trim() === 'to-process') {
          totalToProcess++;
        }
      }
    } catch {
      // skip unreadable entries
    }
  }

  // Sắp xếp domain theo tên
  domains.sort((a, b) => a.domain.localeCompare(b.domain));

  return { domains, legacyFiles, totalToProcess, totalAll };
}

/**
 * Hiển thị bảng domain stats đẹp ra console
 */
export function displayDomainStats(fs: IFileSystem, config: IConfigProvider): void {
  const result = scanDomains(fs, config);
  const { domains, legacyFiles, totalToProcess, totalAll } = result;

  const lines: string[] = [];

  if (domains.length === 0 && legacyFiles === 0) {
    console.log(chalk.yellow('  📭 00_raw_docs/ trống hoặc không tồn tại.'));
    return;
  }

  lines.push(chalk.bold.cyan('\n  📂 Domain Subdirectories:\n'));

  for (const d of domains) {
    const ruleBadge = d.hasRuleMd
      ? chalk.green('✅ RULE.md')
      : chalk.red('❌ Thiếu RULE.md');
    const total = chalk.white(String(d.totalFiles));
    const toProc = d.toProcess > 0
      ? chalk.yellow(`${d.toProcess} to-process`)
      : chalk.gray('0 to-process');
    const proc = d.processed > 0
      ? chalk.green(`${d.processed} processed`)
      : chalk.gray('0 processed');
    const missingDomain = d.withoutDomainField > 0
      ? chalk.red(` ⚠️ ${d.withoutDomainField} file thiếu domain:`)
      : '';

    lines.push(`    ${chalk.cyan(d.domain + '/')}  ${ruleBadge}`);
    lines.push(`       ${total} files · ${toProc} · ${proc}${missingDomain}`);
  }

  if (legacyFiles > 0) {
    lines.push(chalk.bold.cyan('\n  📄 Legacy Files (root):'));
    lines.push(`    ${chalk.white(String(legacyFiles))} files (sutta-mn-*, lecture-*)`);
  }

  lines.push('');
  lines.push(chalk.dim(`  Tổng cộng: ${totalAll} files · ${totalToProcess > 0 ? chalk.yellow(String(totalToProcess) + ' chờ xử lý') : chalk.green('0 chờ xử lý')}`));

  const output = boxen(lines.join('\n'), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
    title: '🔍 Domain Scan Report',
    titleAlignment: 'left',
  });

  console.log(output);
}
