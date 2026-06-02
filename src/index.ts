#!/usr/bin/env node
import * as process from 'node:process';
import { ensureDirectories } from './core/config.ts';
import { program, runShell } from './presentation/composition-root.ts';

// Đảm bảo thư mục Vault tồn tại trước khi chạy (thay thế side-effect top-level)
ensureDirectories();

// Nếu không có tham số → interactive shell
// Nếu có tham số → parse command
if (process.argv.length <= 2) {
  runShell().catch((e) => {
    console.error(`❌ Shell error: ${e.message}`);
    process.exit(1);
  });
} else {
  program.parse(process.argv);
}
