import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VAULT_ROOT = path.resolve(__dirname, '..');
const DIR_RAW = path.join(VAULT_ROOT, 'vault', '00_raw_docs');

// Hàm quét đệ quy tìm tất cả file
function getAllFilesRecursive(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFilesRecursive(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
}

function checkAndNormalizeFiles() {
  console.log('=== BẮT ĐẦU KIỂM TRA VÀ CHUẨN HÓA FRONTMATTER NIKAYA RAW (ĐỆ QUY) ===');

  if (!fs.existsSync(DIR_RAW)) {
    console.error(`❌ Thư mục Raw không tồn tại: ${DIR_RAW}`);
    return;
  }

  const allFiles = getAllFilesRecursive(DIR_RAW);
  let totalProcessed = 0;
  let normalizedCount = 0;
  let fullyValidCount = 0;

  for (const filePath of allFiles) {
    const file = path.basename(filePath);
    if (!file.endsWith('.md') || file === 'RULE.md') {
      continue;
    }

    totalProcessed++;
    const content = fs.readFileSync(filePath, 'utf-8');

    // 1. Phân tích Frontmatter bằng regex
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?/);
    const fileNameWithoutExt = path.basename(file, '.md');

    if (!fmMatch) {
      // CHƯA CÓ FRONTMATTER: Tạo mới hoàn toàn
      console.log(`⚠️ File [${file}] chưa có frontmatter! Đang tạo mới...`);
      const newFm = `---\ntitle: "${fileNameWithoutExt}"\nstatus: to-process\n---\n\n`;
      fs.writeFileSync(filePath, newFm + content, 'utf-8');
      normalizedCount++;
      continue;
    }

    // ĐÃ CÓ FRONTMATTER: Kiểm tra chi tiết từng trường
    const fmText = fmMatch[1];
    const bodyText = content.slice(fmMatch[0].length);

    // Parse các dòng trong frontmatter
    const lines = fmText.split('\n');
    const fmData: { [key: string]: string } = {};
    const otherFmLines: string[] = [];

    for (const line of lines) {
      const match = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        // Bỏ dấu ngoặc kép nếu có
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.slice(1, -1);
        }
        fmData[key] = val;
      } else if (line.trim()) {
        otherFmLines.push(line);
      }
    }

    let modified = false;

    // Kiểm tra title
    if (!fmData['title'] || !fmData['title'].trim()) {
      console.log(`⚠️ File [${file}] thiếu title! Dùng tạm tên file làm title...`);
      fmData['title'] = fileNameWithoutExt;
      modified = true;
    }

    // Kiểm tra status
    if (!fmData['status'] || fmData['status'].trim() !== 'to-process') {
      console.log(`⚠️ File [${file}] thiếu hoặc sai trạng thái status [${fmData['status'] || 'trống'}]. Cập nhật sang "to-process"...`);
      fmData['status'] = 'to-process';
      modified = true;
    }

    if (modified) {
      // Dựng lại Frontmatter mới
      let newFmText = '---\n';
      // Ghi các trường chính
      for (const [k, v] of Object.entries(fmData)) {
        // Bao chuỗi title trong ngoặc kép
        if (k === 'title') {
          newFmText += `${k}: "${v}"\n`;
        } else {
          newFmText += `${k}: ${v}\n`;
        }
      }
      // Ghi lại các dòng khác (tags, category, v.v...) nếu có
      for (const line of otherFmLines) {
        newFmText += `${line}\n`;
      }
      // Loại bỏ dòng trống thừa ở cuối fm
      newFmText = newFmText.replace(/\n+$/, '\n') + '---\n';

      fs.writeFileSync(filePath, newFmText + bodyText, 'utf-8');
      normalizedCount++;
    } else {
      fullyValidCount++;
    }
  }

  console.log('=======================================================');
  console.log(`🎉 HOÀN TẤT KIỂM TRA & CHUẨN HÓA (ĐỆ QUY):`);
  console.log(`  - Tổng số file kinh đã quét: ${totalProcessed}`);
  console.log(`  - Số file hợp lệ 100%: ${fullyValidCount}`);
  console.log(`  - Số file đã được bổ sung/chuẩn hóa: ${normalizedCount}`);
  console.log('=======================================================');
}

checkAndNormalizeFiles();
