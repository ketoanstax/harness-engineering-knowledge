import * as path from 'node:path';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';

export interface DynamicRules {
  globalRules: string;
  domainRules: string;
}

/**
 * Quét tìm và đọc các file luật (RULE.md / AGENTS.md)
 * @param sourcePath Đường dẫn đến tài liệu đang xử lý
 * @param dirVault Đường dẫn gốc của Vault
 * @param fs Đối tượng quản lý file system
 */
export function resolveRules(sourcePath: string, dirVault: string, fs: IFileSystem): DynamicRules {
  let globalRules = '';
  let domainRules = '';

  // 1. Tìm luật toàn cục (Global Rules) ở root của Vault
  const globalRulePaths = [
    path.join(dirVault, 'RULE.md'),
    path.join(dirVault, 'AGENTS.md')
  ];

  for (const gp of globalRulePaths) {
    if (fs.fileExists(gp)) {
      try {
        globalRules = fs.readFile(gp);
        break; // Ưu tiên RULE.md trước, nếu không có mới tìm AGENTS.md
      } catch {
        // Bỏ qua nếu không đọc được
      }
    }
  }

  // 2. Tìm luật cục bộ (Domain Rules) trong thư mục chứa file
  const sourceDir = path.dirname(path.resolve(sourcePath));
  const resolvedVaultDir = path.resolve(dirVault);

  // Chỉ quét nếu thư mục con nằm sâu hơn thư mục gốc của Vault
  if (sourceDir.startsWith(resolvedVaultDir) && sourceDir !== resolvedVaultDir) {
    const domainRulePaths = [
      path.join(sourceDir, 'RULE.md'),
      path.join(sourceDir, 'AGENTS.md')
    ];

    for (const dp of domainRulePaths) {
      if (fs.fileExists(dp)) {
        try {
          domainRules = fs.readFile(dp);
          break; // Ưu tiên RULE.md của domain
        } catch {
          // Bỏ qua nếu không đọc được
        }
      }
    }
  }

  return {
    globalRules: globalRules.trim(),
    domainRules: domainRules.trim()
  };
}
