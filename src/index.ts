#!/usr/bin/env node
import * as process from 'node:process';
import { program, runShell } from './presentation/composition-root.ts';

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
