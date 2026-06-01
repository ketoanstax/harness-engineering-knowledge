import * as path from 'node:path';
import chalk from 'chalk';
import boxen from 'boxen';
import matter from 'gray-matter';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { IConfigProvider } from '../../domain/interfaces/config-provider.interface.ts';

interface LayerStats {
  name: string;
  path: string;
  files: number;
  subdirs: number;
}

interface AtomicStats {
  total: number;
  withParent: number;
  withoutParent: number;
}

interface VaultOverview {
  layers: LayerStats[];
  atomic: AtomicStats;
  toProcessInRaw: number;
}

/**
 * Đếm số file .md mỗi thư mục con trong VAULT (layer)
 */
function scanLayer(dir: string, fs: IFileSystem): LayerStats {
  let files = 0;
  let subdirs = 0;

  if (!fs.fileExists(dir)) return { name: path.basename(dir), path: dir, files: 0, subdirs: 0 };

  const entries = fs.readdir(dir);
  for (const e of entries) {
    if (e === 'RULE.md' || e.startsWith('.')) continue;
    const fp = path.join(dir, e);
    try {
      const stat = fs.stat(fp);
      if (stat.isDirectory()) {
        subdirs++;
      } else if (e.endsWith('.md')) {
        files++;
      }
    } catch {
      // skip
    }
  }

  return { name: path.basename(dir), path: dir, files, subdirs };
}

/**
 * Phân tích atomic nodes: parent stats
 */
function scanAtomic(fs: IFileSystem, config: IConfigProvider): AtomicStats {
  const atomicDir = path.join(config.dirVault, '02_atomic_nodes');
  if (!fs.fileExists(atomicDir)) return { total: 0, withParent: 0, withoutParent: 0 };

  const files = fs.readdir(atomicDir);
  let total = 0;
  let withParent = 0;
  let withoutParent = 0;

  for (const f of files) {
    if (!f.endsWith('.md') || !f.startsWith(config.atomicPrefix)) continue;
    total++;

    try {
      const content = fs.readFile(path.join(atomicDir, f));
      const parsed = matter(content);
      const data = parsed.data || {};

      if (data.parent) {
        withParent++;
      } else {
        withoutParent++;
      }
    } catch {
      withoutParent++;
    }
  }

  return { total, withParent, withoutParent };
}

/**
 * Đếm tổng số file to-process trong 00_raw_docs/ (đệ quy)
 */
function countToProcess(fs: IFileSystem, config: IConfigProvider): number {
  const rawDir = config.dirRaw;
  if (!fs.fileExists(rawDir)) return 0;

  let count = 0;

  function walk(dir: string): void {
    for (const e of fs.readdir(dir)) {
      if (e === 'RULE.md' || e.startsWith('.') || e === 'node_modules') continue;
      const fp = path.join(dir, e);
      try {
        const stat = fs.stat(fp);
        if (stat.isDirectory()) {
          walk(fp);
        } else if (e.endsWith('.md')) {
          const content = fs.readFile(fp);
          const parsed = matter(content);
          if (String(parsed.data?.status || '').trim() === 'to-process') {
            count++;
          }
        }
      } catch {
        // skip
      }
    }
  }

  walk(rawDir);
  return count;
}

/**
 * Lấy tổng quan vault
 */
export function getVaultOverview(fs: IFileSystem, config: IConfigProvider): VaultOverview {
  const layerNames = [
    '00_raw_docs',
    '01_structured_docs',
    '02_atomic_nodes',
    '03_neural_map',
    '04_distilled',
    '05_journal',
    'memory',
  ];

  const layers = layerNames.map(n => scanLayer(path.join(config.dirVault, n), fs));
  const atomic = scanAtomic(fs, config);
  const toProcessInRaw = countToProcess(fs, config);

  return { layers, atomic, toProcessInRaw };
}

/**
 * Hiển thị tổng quan vault ra console
 */
export function displayVaultStats(fs: IFileSystem, config: IConfigProvider): void {
  const overview = getVaultOverview(fs, config);

  const lines: string[] = [];
  lines.push(`  ${chalk.bold('📊 Vault Overview')}`);
  lines.push('');

  lines.push(`  ${chalk.dim('Layer')}        ${chalk.dim('Files')}  ${chalk.dim('Subdirs')}`);
  for (const layer of overview.layers) {
    const icon = layer.files > 0 ? chalk.green(layer.name) : chalk.gray(layer.name);
    const fileStr = layer.files > 0 ? chalk.white(String(layer.files)) : chalk.gray('0');
    const subdirStr = layer.subdirs > 0 ? chalk.cyan(String(layer.subdirs)) : chalk.gray('0');
    lines.push(`  ${icon.padEnd(20)} ${fileStr.padStart(3)}   ${subdirStr}`);
  }

  // Atomic stats
  lines.push('');
  lines.push(`  ${chalk.bold('🧬 Atomic Nodes:')}`);
  lines.push(`    Tổng:          ${chalk.white(String(overview.atomic.total))}`);
  lines.push(`    Có parent:     ${chalk.green(String(overview.atomic.withParent))}`);
  lines.push(`    Không parent:  ${overview.atomic.withoutParent > 0 ? chalk.yellow(String(overview.atomic.withoutParent)) : chalk.green('0')}`);

  lines.push('');
  if (overview.toProcessInRaw > 0) {
    lines.push(`  ${chalk.yellow(`📥 ${overview.toProcessInRaw} file chờ xử lý (to-process)`)}`);
  } else {
    lines.push(`  ${chalk.green('✅ Không có file nào chờ xử lý')}`);
  }

  const output = boxen(lines.join('\n'), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'blue',
    title: '📈 Vault Stats',
    titleAlignment: 'left',
  });

  console.log(output);
}
