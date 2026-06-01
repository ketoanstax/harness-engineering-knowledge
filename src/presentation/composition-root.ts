import { NodeFileSystem } from '../infrastructure/fs/node-file-system.ts';
import { LLMClient } from '../infrastructure/llm/llm-client.ts';
import { MarkdownGenerator } from '../infrastructure/formatters/markdown.generator.ts';
import { ConfigProvider } from '../infrastructure/config/config-provider.ts';
import { GrayMatterParser } from '../infrastructure/parsers/gray-matter.parser.ts';
import { FileSystemNodeRepository } from '../infrastructure/repositories/file-system-node-repository.ts';
import { TokenTracker } from '../application/services/token-tracker.ts';
import { PipelineDashboard } from './ui/pipeline-dashboard.ts';
import { IngestDocumentUseCase } from '../application/use-cases/ingest-document.use-case.ts';
import { MapperPhase } from '../application/phases/mapper.phase.ts';
import { ReducerPhase } from '../application/phases/reducer.phase.ts';
import { PlannerPhase } from '../application/phases/planner.phase.ts';
import { RefinerPhase } from '../application/phases/refiner.phase.ts';
import { VerifierPhase } from '../application/phases/verifier.phase.ts';
import { CommitterPhase } from '../application/phases/committer.phase.ts';
import { buildProgram } from './cli/commands.ts';
import { runShell } from './ui/interactive-shell.ts';

// === DI Container (Composition Root) ===

const fileSystem = new NodeFileSystem();
const llmClient = LLMClient.createFromEnv();
const markdownGenerator = new MarkdownGenerator();
const configProvider = new ConfigProvider();
const frontmatterParser = new GrayMatterParser();
const tokenTracker = new TokenTracker();
const pipelineDashboard = new PipelineDashboard(tokenTracker);
const nodeRepository = new FileSystemNodeRepository(fileSystem, configProvider);

const mapper = new MapperPhase(llmClient, fileSystem, markdownGenerator, configProvider, frontmatterParser);
const reducer = new ReducerPhase(llmClient, nodeRepository);
const planner = new PlannerPhase(llmClient, configProvider);
const refiner = new RefinerPhase(fileSystem, markdownGenerator, configProvider);
const verifier = new VerifierPhase(fileSystem, markdownGenerator, configProvider, frontmatterParser);
const committer = new CommitterPhase(fileSystem, markdownGenerator, configProvider);

const useCase = new IngestDocumentUseCase(
  mapper,
  reducer,
  planner,
  refiner,
  verifier,
  committer,
  fileSystem,
  markdownGenerator,
  configProvider,
  tokenTracker,
  pipelineDashboard as import('../domain/interfaces/pipeline-observer.interface.ts').IPipelineObserver,
  llmClient,
  nodeRepository,
);

const program = buildProgram(useCase, fileSystem, configProvider);

// Bound version of runShell for index.ts entry point
const boundRunShell = () => runShell(useCase, fileSystem, configProvider);

export { program, boundRunShell as runShell };
