import { NodeFileSystem } from '../infrastructure/fs/node-file-system.ts';
import { LLMClient } from '../infrastructure/llm/llm-client.ts';
import { MarkdownGenerator } from '../infrastructure/formatters/markdown.generator.ts';
import { IngestDocumentUseCase } from '../application/use-cases/ingest-document.use-case.ts';
import { buildProgram } from './cli/commands.ts';
import { runShell } from './ui/interactive-shell.ts';

// === DI Container (Composition Root) ===

const fileSystem = new NodeFileSystem();
const llmClient = LLMClient.createFromEnv();
const markdownGenerator = new MarkdownGenerator();
const useCase = new IngestDocumentUseCase(fileSystem, llmClient, markdownGenerator);

const program = buildProgram(useCase, fileSystem);

// Bound version of runShell for index.ts entry point
const boundRunShell = () => runShell(useCase, fileSystem);

export { program, boundRunShell as runShell };
