import { Stats } from 'node:fs';

export interface IFileSystem {
  readFile(filepath: string): string;
  writeFile(filepath: string, content: string): void;
  fileExists(filepath: string): boolean;
  readdir(dirPath: string): string[];
  unlink(filepath: string): void;
  stat(filepath: string): Stats;
  mkdir(dirPath: string, options?: { recursive?: boolean }): void;
}
