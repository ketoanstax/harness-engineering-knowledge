import * as fs from 'node:fs';
import * as path from 'node:path';
import { Stats } from 'node:fs';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';

export class NodeFileSystem implements IFileSystem {
  readFile(filepath: string): string {
    return fs.readFileSync(filepath, 'utf-8');
  }

  readFileBuffer(filepath: string): Buffer {
    return fs.readFileSync(filepath);
  }

  writeFile(filepath: string, content: string): void {
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, content, 'utf-8');
  }

  fileExists(filepath: string): boolean {
    return fs.existsSync(filepath);
  }

  readdir(dirPath: string): string[] {
    return fs.readdirSync(dirPath);
  }

  unlink(filepath: string): void {
    fs.unlinkSync(filepath);
  }

  stat(filepath: string): Stats {
    return fs.statSync(filepath);
  }

  mkdir(dirPath: string, options?: { recursive?: boolean }): void {
    fs.mkdirSync(dirPath, options);
  }
}
