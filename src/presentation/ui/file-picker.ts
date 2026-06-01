import { intro, outro, select, isCancel } from '@clack/prompts';
import chalk from 'chalk';
import matter from 'gray-matter';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import { DIR_RAW } from '../../core/config.ts';
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
    options: files.map(f => ({
      value: f.filepath,
      label: f.title,
      hint: chalk.gray(f.filename),
    })),
    maxItems: 10,
  });

  if (isCancel(chosenFilepath)) {
    outro(chalk.gray('Đã hủy thao tác.'));
    return null;
  }

  return chosenFilepath as string;
}
