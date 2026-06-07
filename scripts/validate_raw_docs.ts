import * as fs from 'node:fs';
import * as path from 'node:path';
import matter from 'gray-matter';

const VAULT_ROOT = path.resolve(import.meta.dirname, '..');
const RAW_DOCS_DIR = path.join(VAULT_ROOT, 'vault', '00_raw_docs');
const LEGACY_FILES = new Set(['RULE.md']);

function domainFromDirname(dirname: string): string {
  return dirname.replace(/_/g, '-');
}

function validateSubdir(subdirPath: string, dirname: string): string[] {
  const domainSlug = domainFromDirname(dirname);
  const reports: string[] = [];
  const rulePath = path.join(subdirPath, 'RULE.md');

  if (!fs.existsSync(rulePath)) {
    reports.push(`❌ '${dirname}/' thiếu RULE.md riêng!`);
  }

  const files = fs.readdirSync(subdirPath).sort();
  for (const file of files) {
    if (file === 'RULE.md' || !file.endsWith('.md')) continue;

    const filePath = path.join(subdirPath, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(content);
      const data = parsed.data || {};

      if (!data.domain) {
        reports.push(`⚠️ '${dirname}/${file}' thiếu trường 'domain: ' trong frontmatter.`);
      } else if (data.domain !== domainSlug) {
        reports.push(`❌ '${dirname}/${file}' có domain='${data.domain}' — phải là '${domainSlug}'.`);
      }

      if (!data.status) {
        reports.push(`⚠️ '${dirname}/${file}' thiếu trường 'status: ' trong frontmatter.`);
      }
    } catch (e: any) {
      reports.push(`❌ Lỗi đọc file '${dirname}/${file}': ${e.message}`);
    }
  }

  return reports;
}

function validateRoot(): string[] {
  const reports: string[] = [];
  if (!fs.existsSync(RAW_DOCS_DIR)) return reports;

  const entries = fs.readdirSync(RAW_DOCS_DIR).sort();
  for (const entry of entries) {
    const fullPath = path.join(RAW_DOCS_DIR, entry);
    if (fs.statSync(fullPath).isFile() && entry.endsWith('.md')) {
      if (LEGACY_FILES.has(entry)) continue;
      reports.push(`ℹ️  '${entry}' là file legacy ở root 00_raw_docs/. Domain mới PHẢI đặt trong subdir.`);
    }
  }
  return reports;
}

function main() {
  console.log('='.repeat(60));
  console.log('🔍 00_raw_docs/ Validation Report (TypeScript)');
  console.log('='.repeat(60));
  console.log();

  const allReports: string[] = [];
  allReports.push(...validateRoot());

  if (fs.existsSync(RAW_DOCS_DIR)) {
    const entries = fs.readdirSync(RAW_DOCS_DIR).sort();
    for (const entry of entries) {
      const fullPath = path.join(RAW_DOCS_DIR, entry);
      if (fs.statSync(fullPath).isDirectory()) {
        allReports.push(...validateSubdir(fullPath, entry));
      }
    }
  }

  const errors = allReports.filter(r => r.startsWith('❌'));
  const warnings = allReports.filter(r => r.startsWith('⚠️') || r.startsWith('ℹ️'));

  if (errors.length > 0) {
    console.log('## ❌ Lỗi cần sửa');
    errors.forEach(e => console.log(`  ${e}`));
    console.log();
  }

  if (warnings.length > 0) {
    console.log('## ⚠️ Cảnh báo');
    warnings.forEach(w => console.log(`  ${w}`));
    console.log();
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Không phát hiện vấn đề gì.');
  } else {
    console.log(`📊 Tổng kết: ${errors.length} lỗi, ${warnings.length} cảnh báo.`);
  }

  if (errors.length > 0) {
    process.exit(1);
  }
}

main();
