import * as path from 'node:path';
import chalk from 'chalk';
import boxen from 'boxen';
import matter from 'gray-matter';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { IConfigProvider } from '../../domain/interfaces/config-provider.interface.ts';

interface NodeInfo {
  slug: string;
  title: string;
  parent?: string;
  children: string[];
}

/**
 * Đọc toàn bộ atomic nodes, parse parent/children từ frontmatter.
 */
function loadNodes(fs: IFileSystem, config: IConfigProvider): NodeInfo[] {
  const atomicDir = config.dirAtomic;
  const prefix = config.atomicPrefix;

  if (!fs.fileExists(atomicDir)) return [];

  const files = fs.readdir(atomicDir);
  const nodes: NodeInfo[] = [];

  for (const f of files) {
    if (!f.endsWith('.md') || !f.startsWith(prefix)) continue;

    const fp = path.join(atomicDir, f);
    try {
      const content = fs.readFile(fp);
      const parsed = matter(content);
      const data = parsed.data || {};

      const slug = f.replace(prefix, '').replace('.md', '');
      nodes.push({
        slug,
        title: String(data.title || slug),
        parent: data.parent || undefined,
        children: Array.isArray(data.children) ? data.children : [],
      });
    } catch {
      // skip unparseable
    }
  }

  return nodes;
}

/**
 * Xây ASCII tree từ atomic nodes.
 * - Tìm root nodes (không parent hoặc parent bị thiếu)
 * - Đệ quy in cây
 */
function buildAsciiTree(nodes: NodeInfo[]): string {
  const nodeMap = new Map<string, NodeInfo>();
  for (const n of nodes) nodeMap.set(n.slug, n);

  const existingSlugs = new Set(nodes.map(n => n.slug));

  // Tìm root: không có parent, hoặc parent không tồn tại
  const roots = nodes.filter(n => {
    if (!n.parent) return true;
    return !existingSlugs.has(n.parent);
  });

  // Sort roots alphabetically
  roots.sort((a, b) => a.slug.localeCompare(b.slug));

  const lines: string[] = [];
  lines.push(`  ${chalk.bold('Cây tri thức (Atomic Nodes)')}`);
  lines.push(`  ${chalk.dim(`Tổng số: ${nodes.length} nodes · Gốc: ${roots.length}`)}`);
  lines.push('');

  const orphans: string[] = [];

  for (const root of roots) {
    lines.push(`  ${chalk.green('🌳 ' + root.title)}`);
    lines.push(`     ${chalk.dim('(' + root.slug + ')')}`);

    const childLines: string[] = [];
    printChildren(root.slug, nodeMap, existingSlugs, childLines, 2);
    for (const cl of childLines) {
      lines.push(cl);
    }

    // Ghi nhận orphan nodes (nốt có parent nhưng parent không phải root && không có children)
    if (roots.length === 1 || roots.indexOf(root) === roots.length - 1) {
      for (const n of nodes) {
        if (n.parent && !existingSlugs.has(n.parent) && !roots.some(r => r.slug === n.slug)) {
          if (!orphans.includes(n.slug)) orphans.push(n.slug);
        }
      }
    }
  }

  // Nếu không có root nào → tất cả đều orphan
  if (roots.length === 0 && nodes.length > 0) {
    lines.push(`  ${chalk.red('⚠️ Không tìm thấy root node nào!')}`);
    for (const n of nodes) {
      orphans.push(n.slug);
    }
  }

  // In orphan nodes
  if (orphans.length > 0) {
    lines.push('');
    lines.push(`  ${chalk.red('⚠️ Nốt mồ côi (không parent):')}`);
    const uniqueOrphans = [...new Set(orphans)];
    // Loại bỏ orphans đã in trong cây
    const printed = getAllPrintedSlugs(roots, nodeMap, existingSlugs);
    const realOrphans = uniqueOrphans.filter(o => !printed.has(o));

    if (realOrphans.length > 0) {
      for (const slug of realOrphans) {
        const node = nodeMap.get(slug);
        if (node) {
          lines.push(`    ${chalk.yellow('▪ ' + node.title)} ${chalk.dim('(' + slug + ')')}`);
        }
      }
    } else {
      lines.push(`    ${chalk.gray('(không có — tất cả đã được gắn trong cây)')}`);
    }
  }

  return lines.join('\n');
}

function printChildren(
  parentSlug: string,
  nodeMap: Map<string, NodeInfo>,
  existingSlugs: Set<string>,
  lines: string[],
  depth: number,
): void {
  const parent = nodeMap.get(parentSlug);
  if (!parent || !parent.children || parent.children.length === 0) return;

  // Filter children that exist
  const validChildren = parent.children.filter(c => existingSlugs.has(c));

  for (let i = 0; i < validChildren.length; i++) {
    const childSlug = validChildren[i];
    const child = nodeMap.get(childSlug);
    if (!child) continue;

    const indent = '  '.repeat(depth);
    const isLast = i === validChildren.length - 1;
    const prefix = isLast ? '└─' : '├─';

    // Đệ quy tìm con của con
    const grandChildren = child.children.filter(c => existingSlugs.has(c));

    lines.push(`${indent}${chalk.cyan(prefix + ' ' + child.title)}`);

    if (grandChildren.length > 0) {
      printChildren(childSlug, nodeMap, existingSlugs, lines, depth + 1);
    }
  }
}

function getAllPrintedSlugs(
  roots: NodeInfo[],
  nodeMap: Map<string, NodeInfo>,
  existingSlugs: Set<string>,
): Set<string> {
  const printed = new Set<string>();

  function walk(slug: string) {
    if (printed.has(slug)) return;
    printed.add(slug);
    const node = nodeMap.get(slug);
    if (node && node.children) {
      for (const c of node.children) {
        if (existingSlugs.has(c)) walk(c);
      }
    }
  }

  for (const r of roots) walk(r.slug);
  return printed;
}

/**
 * Hiển thị ASCII tree ra console
 */
export function displayGraphViz(fs: IFileSystem, config: IConfigProvider): void {
  const nodes = loadNodes(fs, config);

  if (nodes.length === 0) {
    console.log(chalk.yellow('  📭 Không có atomic nodes nào.'));
    return;
  }

  const tree = buildAsciiTree(nodes);

  const output = boxen(tree, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'magenta',
    title: '🕸️  Graph View',
    titleAlignment: 'left',
  });

  console.log(output);
}
