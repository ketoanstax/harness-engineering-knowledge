import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

// Tìm thư mục gốc VAULT_ROOT (thư mục chứa package.json)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const VAULT_ROOT = path.resolve(__dirname, '..', '..');

// Đọc file .env ở root
const envPath = path.join(VAULT_ROOT, '.env');
if (fs.existsSync(envPath)) {
  config({ path: envPath });
  console.log('🌱  System Config: Đã nạp thành công cấu hình môi trường từ [.env] cục bộ.');
}

// Thư mục Vault trung tâm (Obsidian Vault Root)
export const DIR_VAULT = path.join(VAULT_ROOT, 'vault');

// Các thư mục phân lớp trong Vault
export const DIR_RAW = path.join(DIR_VAULT, '00_raw_docs');
export const DIR_STRUCTURED = path.join(DIR_VAULT, '01_structured_docs');
export const DIR_ATOMIC = path.join(DIR_VAULT, '02_atomic_nodes');
export const DIR_NEURAL_MAP = path.join(DIR_VAULT, '03_neural_map');
export const DIR_DISTILLED = path.join(DIR_VAULT, '04_distilled');
export const DIR_JOURNAL = path.join(DIR_VAULT, '05_journal');

// File định tuyến & Index
export const PATH_INDEX = path.join(DIR_NEURAL_MAP, 'INDEX.md');
export const PATH_ROUTING = path.join(DIR_NEURAL_MAP, 'AI_ROUTING_TABLE.md');
export const PATH_FEEDBACK = path.join(DIR_VAULT, 'memory', 'feedback_log.md');
export const PATH_CATEGORIES = path.join(DIR_NEURAL_MAP, 'categories.json');

export interface EngineCategory {
  id: string;
  name: string;
  marker: string;
  keywords: string[];
}

export function loadCategories(): EngineCategory[] {
  if (fs.existsSync(PATH_CATEGORIES)) {
    try {
      const data = fs.readFileSync(PATH_CATEGORIES, 'utf-8');
      return JSON.parse(data) as EngineCategory[];
    } catch (e: any) {
      console.log(`⚠️ Lỗi đọc tệp categories.json: ${e.message}`);
    }
  }

  // Cấu hình mặc định của Harness (tương thích ngược)
  return [
    {
      id: 'core',
      name: 'Harness Core Concept',
      marker: '### 1. Khung gá cốt lõi (Harness Core Concepts)',
      keywords: ['Core']
    },
    {
      id: 'cognitive',
      name: 'Cognitive Management',
      marker: '### 2. Quản lý Nhận thức (Cognitive & Context Management)',
      keywords: ['Cognitive']
    },
    {
      id: 'workflow',
      name: 'Workflow Architecture',
      marker: '### 3. Kiến trúc Quy trình làm việc (Workflow Architecture)',
      keywords: ['Workflow']
    },
    {
      id: 'guardrails',
      name: 'Guardrails & Safety',
      marker: '### 4. Rào chắn An toàn (Guardrails & Safety)',
      keywords: ['Guardrails']
    },
    {
      id: 'verification',
      name: 'Verification',
      marker: '### 5. Xác thực & Đo lường chất lượng (Verification)',
      keywords: ['Verification']
    }
  ];
}

// Các định dạng chuẩn
export const ATOMIC_PREFIX = 'HAE-concept-';
export const STRUCTURED_SUFFIX = '-processed';
export const PLAN_PREFIX = 'mrp_plan_';

/**
 * Đảm bảo các thư mục Vault tồn tại.
 * Gọi function này ở entry point (src/index.ts) thay vì chạy side-effect khi import.
 */
export function ensureDirectories(): void {
  const dirs = [DIR_VAULT, DIR_RAW, DIR_STRUCTURED, DIR_ATOMIC, DIR_NEURAL_MAP, DIR_DISTILLED, DIR_JOURNAL];
  for (const d of dirs) {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  }
}
