import { intro, outro, select, isCancel, confirm } from '@clack/prompts';
import chalk from 'chalk';
import matter from 'gray-matter';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import { DIR_RAW, VAULT_ROOT } from '../../core/config.ts';
import * as path from 'node:path';

/**
 * Hiển thị danh sách file "to-process" để người dùng chọn.
 * Trả về filepath được chọn, hoặc null nếu hủy.
 */
export async function pickFileForPipeline(fs: IFileSystem): Promise<string | null> {
  intro(chalk.bgCyan.black(' 🚀 MRP KNOWLEDGE INGESTION PIPELINE '));

  const files = fs.readdir(DIR_RAW)
    .filter(f => f.endsWith('.md') && f !== 'RULE.md' && f !== 'index.md')
    .map(f => {
      const filepath = path.join(DIR_RAW, f);
      try {
        const content = fs.readFile(filepath);
        const frontmatter = matter(content);
        return {
          filename: f,
          filepath,
          title: frontmatter.data?.title || f,
          status: frontmatter.data?.status || 'unknown',
        };
      } catch {
        return null;
      }
    })
    .filter((f): f is NonNullable<typeof f> => f !== null && f.status === 'to-process');

  if (files.length === 0) {
    outro(chalk.yellow('📭 Không có file nào ở trạng thái "to-process" trong 00_raw_docs/'));
    return null;
  }

  const chosenFilepath = await select({
    message: '📋 Chọn tài liệu thô để nạp vào hệ thống:',
    options: [
      ...files.map(f => ({
        value: f.filepath,
        label: f.title,
        hint: chalk.gray(f.filename),
      })),
      { value: '__custom_path__' as const, label: '📁 Nhập đường dẫn file tùy chỉnh...', hint: 'Chọn file từ bất kỳ đâu' },
    ],
    maxItems: 10,
  });

  if (isCancel(chosenFilepath)) {
    outro(chalk.gray('Đã hủy thao tác.'));
    return null;
  }

  if (chosenFilepath === '__custom_path__') {
    // Directory browser đệ quy — chọn thư mục = Enter để vô trong
    const browseDir = async (dir: string): Promise<string | null> => {
      try {
        const entries = fs.readdir(dir).filter(e => e !== 'node_modules' && e !== '.git' && !e.startsWith('.'));
        const items: Array<{ label: string; value: string; hint: string }> = [];

        // Option quay lại thư mục cha
        if (dir !== VAULT_ROOT) {
          const parent = path.dirname(dir);
          items.push({ label: '📁 ..', value: parent, hint: 'Thư mục cha' });
        }

        // Thư mục
        const dirs = entries.filter(e => {
          try { return fs.stat(path.join(dir, e)).isDirectory(); } catch { return false; }
        }).sort();
        for (const d of dirs) {
          items.push({ label: `📁 ${d}/`, value: path.join(dir, d), hint: '' });
        }

        // File .md
        const mdFiles = entries.filter(e => e.endsWith('.md')).sort();
        for (const f of mdFiles) {
          const fp = path.join(dir, f);
          let title = f;
          try {
            const content = fs.readFile(fp);
            const frontmatter = matter(content);
            if (frontmatter.data?.title) title = frontmatter.data.title;
          } catch { /* skip */ }
          items.push({ label: `📄 ${title}`, value: fp, hint: chalk.gray(f) });
        }

        if (items.length === 0) {
          outro(chalk.yellow('📭 Thư mục rỗng.'));
          return null;
        }

        const selected = await select({
          message: `📂 Đang ở: ${chalk.cyan(path.relative(VAULT_ROOT, dir) || '.')}`,
          options: items,
          maxItems: 12,
        });

        if (isCancel(selected)) {
          outro(chalk.gray('Đã hủy thao tác.'));
          return null;
        }

        const selPath = selected as string;

        // Nếu là thư mục → đệ quy vào trong
        try {
          if (fs.stat(selPath).isDirectory()) {
            return await browseDir(selPath);
          }
        } catch { /* fallthrough */ }

        // Là file → confirm
        const proceed = await confirm({
          message: `Xác nhận nạp file:\n${chalk.cyan(selPath)}`,
          active: '✅ Nạp vào pipeline',
          inactive: '❌ Quay lại',
        });

        if (isCancel(proceed) || !proceed) {
          return await browseDir(dir); // Quay lại thư mục hiện tại
        }

        return selPath;
      } catch {
        outro(chalk.red('❌ Lỗi đọc thư mục.'));
        return null;
      }
    };

    return await browseDir(VAULT_ROOT);
  }

  // Xác nhận lần cuối cho file trong vault
  const proceed = await confirm({
    message: `Xác nhận nạp file:\n${chalk.cyan(chosenFilepath as string)}`,
    active: '✅ Nạp vào pipeline',
    inactive: '❌ Quay lại',
  });

  if (isCancel(proceed) || !proceed) {
    outro(chalk.gray('Đã hủy.'));
    return null;
  }

  return chosenFilepath as string;
}
