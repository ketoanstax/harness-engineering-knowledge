import { intro, outro, select, isCancel, confirm } from '@clack/prompts';
import chalk from 'chalk';
import matter from 'gray-matter';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import { DIR_RAW, VAULT_ROOT } from '../../core/config.ts';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Hiển thị danh sách file "to-process" để người dùng chọn,
 * kết hợp duyệt thư mục và tìm kiếm nhanh bằng fzf.
 */
export async function pickFileForPipeline(fs: IFileSystem): Promise<string | null> {
  console.clear();
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

  const options: Array<{ value: string, label: string, hint?: string }> = files.map(f => ({
    value: f.filepath,
    label: f.title,
    hint: chalk.gray(f.filename),
  }));

  if (files.length === 0) {
    console.log(chalk.yellow('  📭 Không có file nào ở trạng thái "to-process" trong 00_raw_docs/'));
  }

  // --- THÊM TÙY CHỌN TÌM KIẾM & DUYỆT THƯ MỤC ---
  options.push({ 
    value: '__fzf_search__', 
    label: '🔍 Tìm kiếm nhanh bằng fzf...', 
    hint: chalk.magenta('Quét toàn bộ Vault') 
  });
  
  options.push({ 
    value: '__custom_path__', 
    label: '📁 Trình duyệt thư mục thủ công...', 
    hint: 'Chọn file từng bước' 
  });

  let chosenFilepath = await select({
    message: '📋 Chọn tài liệu thô để nạp vào hệ thống:',
    options: options,
    maxItems: 14,
  });

  if (isCancel(chosenFilepath)) {
    outro(chalk.gray('Đã hủy thao tác.'));
    return null;
  }

  // =========================================================
  // === CHẾ ĐỘ FZF SEARCH (TÌM KIẾM SIÊU TỐC)             ===
  // =========================================================
  if (chosenFilepath === '__fzf_search__') {
    try {
      console.clear();
      // Sử dụng lệnh `find` kết hợp `fzf` để lọc riêng file .md
      // stdio setup: 
      // - stdin: inherit (nhận phím gõ từ user)
      // - stdout: pipe (trả kết quả về cho Nodejs capture)
      // - stderr: inherit (để fzf render UI ra màn hình)
      const fzfCommand = `find "${VAULT_ROOT}" -type f -name "*.md" ! -path "*/node_modules/*" ! -path "*/.git/*" | fzf --prompt="🔍 TÌM FILE: " --height=80% --layout=reverse --border --info=inline`;
      
      const result = execSync(fzfCommand, { 
        stdio: ['inherit', 'pipe', 'inherit'], 
        encoding: 'utf-8' 
      });

      const selPath = result.trim();
      if (!selPath) {
        outro(chalk.gray('Đã hủy tìm kiếm.'));
        return null;
      }
      
      // Gán lại file người dùng vừa pick từ fzf để chuyển sang bước Xác Nhận bên dưới
      chosenFilepath = selPath;

    } catch (err: any) {
      // Khi user bấm ESC trong fzf, nó sẽ trả về exit code 1 -> throw Error
      console.clear();
      outro(chalk.gray('Đã hủy tìm kiếm fzf.'));
      return null;
    }
  }

  // =========================================================
  // === CHẾ ĐỘ FILE BROWSER (VÒNG LẶP ITERATIVE CŨ)       ===
  // =========================================================
  if (chosenFilepath === '__custom_path__') {
    let currentDir = VAULT_ROOT;

    while (true) {
      console.clear();
      intro(chalk.bgMagenta.black(' 📂 BROWSE VAULT DIRECTORY '));

      try {
        const entries = fs.readdir(currentDir).filter(e => e !== 'node_modules' && e !== '.git' && !e.startsWith('.'));
        const items: Array<{ label: string; value: string; hint: string }> = [];

        if (currentDir !== VAULT_ROOT) {
          items.push({
            label: chalk.yellow(' ⬅  .. (Quay lại)'),
            value: path.dirname(currentDir),
            hint: chalk.yellow('📁 Thư mục cha')
          });
        }

        const dirs = entries.filter(e => {
          try { return fs.stat(path.join(currentDir, e)).isDirectory(); } catch { return false; }
        }).sort();

        for (const d of dirs) {
          items.push({ label: chalk.cyan(` 📁 ${d}/`), value: path.join(currentDir, d), hint: chalk.dim('thư mục') });
        }

        const mdFiles = entries.filter(e => e.endsWith('.md')).sort();
        for (const f of mdFiles) {
          const fp = path.join(currentDir, f);
          let title = f;
          try {
            const content = fs.readFile(fp);
            const frontmatter = matter(content);
            if (frontmatter.data?.title) title = frontmatter.data.title;
          } catch { /* skip */ }

          items.push({ label: chalk.green(` 📄 ${title}`), value: fp, hint: chalk.gray(`📝 ${f}`) });
        }

        if (items.length === 0) {
          console.log(chalk.yellow('  📭 Thư mục rỗng.'));
          if (currentDir !== VAULT_ROOT) {
            currentDir = path.dirname(currentDir);
            continue;
          } else {
            outro(chalk.gray('Không có dữ liệu.'));
            return null;
          }
        }

        const relativePath = path.relative(VAULT_ROOT, currentDir) || '.';
        const breadcrumbs = relativePath.split(path.sep).map(p => chalk.bold.cyan(p)).join(chalk.gray(' ❯ '));

        const selected = await select({
          message: `Path: ${chalk.bold.yellow('ROOT')} ${chalk.gray('❯')} ${breadcrumbs}`,
          options: items,
          maxItems: 14,
        });

        if (isCancel(selected)) {
          console.clear();
          outro(chalk.gray('Đã hủy duyệt file.'));
          return null;
        }

        const selPath = selected as string;
        let isDir = false;
        try { isDir = fs.stat(selPath).isDirectory(); } catch { }

        if (isDir) {
          currentDir = selPath;
          continue;
        }

        // Chọn được file -> Thoát vòng lặp, gán vào chosenFilepath để xuống dưới Confirm
        chosenFilepath = selPath;
        break;

      } catch (err) {
        outro(chalk.red('❌ Lỗi hệ thống khi duyệt file.'));
        return null;
      }
    }
  }

  // =========================================================
  // === BƯỚC XÁC NHẬN CHUNG CUỐI CÙNG                     ===
  // =========================================================
  console.clear();
  intro(chalk.bgCyan.black(' 📄 XÁC NHẬN NẠP FILE '));
  const proceed = await confirm({
    message: `Bạn muốn nạp file này vào Pipeline?\n  ${chalk.cyan(chosenFilepath as string)}`,
    active: '✅ Khởi chạy',
    inactive: '❌ Hủy',
  });

  if (isCancel(proceed) || !proceed) {
    console.clear();
    outro(chalk.gray('Đã hủy thao tác.'));
    return null;
  }

  return chosenFilepath as string;
}