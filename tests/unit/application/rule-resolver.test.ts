import { describe, test, expect } from 'bun:test';
import * as path from 'node:path';
import { resolveRules } from '../../../src/application/phases/_rule-resolver.ts';
import type { IFileSystem } from '../../../src/domain/interfaces/file-system.interface.ts';
import type { Stats } from 'node:fs';

describe('RuleResolver', () => {
  const dirVault = '/vault';

  test('resolves both global and domain rules correctly', () => {
    const files: Record<string, string> = {
      [path.join(dirVault, 'RULE.md')]: 'Global Rule Content',
      [path.join(dirVault, '00_raw_docs', 'Tai_chinh', 'RULE.md')]: 'Domain Rule Content',
    };

    const mockFs: IFileSystem = {
      fileExists: (filepath: string) => !!files[filepath],
      readFile: (filepath: string) => files[filepath] || '',
      readFileBuffer: () => Buffer.from(''),
      writeFile: () => {},
      readdir: () => [],
      unlink: () => {},
      stat: () => ({} as Stats),
      mkdir: () => {},
    };

    const result = resolveRules(
      path.join(dirVault, '00_raw_docs', 'Tai_chinh', 'document.md'),
      dirVault,
      mockFs
    );

    expect(result.globalRules).toBe('Global Rule Content');
    expect(result.domainRules).toBe('Domain Rule Content');
  });

  test('fallback to AGENTS.md if RULE.md is missing', () => {
    const files: Record<string, string> = {
      [path.join(dirVault, 'AGENTS.md')]: 'Global Agent Content',
      [path.join(dirVault, '00_raw_docs', 'Tai_chinh', 'AGENTS.md')]: 'Domain Agent Content',
    };

    const mockFs: IFileSystem = {
      fileExists: (filepath: string) => !!files[filepath],
      readFile: (filepath: string) => files[filepath] || '',
      readFileBuffer: () => Buffer.from(''),
      writeFile: () => {},
      readdir: () => [],
      unlink: () => {},
      stat: () => ({} as Stats),
      mkdir: () => {},
    };

    const result = resolveRules(
      path.join(dirVault, '00_raw_docs', 'Tai_chinh', 'document.md'),
      dirVault,
      mockFs
    );

    expect(result.globalRules).toBe('Global Agent Content');
    expect(result.domainRules).toBe('Domain Agent Content');
  });

  test('returns empty string if files do not exist', () => {
    const mockFs: IFileSystem = {
      fileExists: () => false,
      readFile: () => '',
      readFileBuffer: () => Buffer.from(''),
      writeFile: () => {},
      readdir: () => [],
      unlink: () => {},
      stat: () => ({} as Stats),
      mkdir: () => {},
    };

    const result = resolveRules(
      path.join(dirVault, '00_raw_docs', 'Tai_chinh', 'document.md'),
      dirVault,
      mockFs
    );

    expect(result.globalRules).toBe('');
    expect(result.domainRules).toBe('');
  });
});
