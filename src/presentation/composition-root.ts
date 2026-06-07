import { NodeFileSystem } from '../infrastructure/fs/node-file-system.ts';
import { LLMClient } from '../infrastructure/llm/llm-client.ts';
import { MarkdownGenerator } from '../infrastructure/formatters/markdown.generator.ts';
import { ConfigProvider } from '../infrastructure/config/config-provider.ts';
import { GrayMatterParser } from '../infrastructure/parsers/gray-matter.parser.ts';
import { AtomicNodeFactory } from '../infrastructure/parsers/atomic-node-factory.ts';
import { FileSystemNodeRepository } from '../infrastructure/repositories/file-system-node-repository.ts';
import { ConsoleLogger } from '../infrastructure/logging/console-logger.ts';
import { DocumentReaderTool } from '../infrastructure/tools/document-reader/document-reader.tool.ts';
import { TextExtractor, PdfTextExtractor, DocxExtractor, EpubExtractor } from '../infrastructure/tools/document-reader/extractors.ts';
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
import { LearningService } from '../application/services/learning.service.ts';

// === DI Container (Composition Root) ===

const fileSystem = new NodeFileSystem();
const llmClient = LLMClient.createFromEnv();
const markdownGenerator = new MarkdownGenerator();
const configProvider = new ConfigProvider();
const frontmatterParser = new GrayMatterParser();
const tokenTracker = new TokenTracker();
const pipelineDashboard = new PipelineDashboard(tokenTracker);
const nodeRepository = new FileSystemNodeRepository(fileSystem, configProvider);
const learningService = new LearningService(nodeRepository, llmClient);

// Document Reader Tool (Strategy Pattern)
const textExtractor = new TextExtractor(fileSystem);
const pdfExtractor = new PdfTextExtractor(fileSystem);
const docxExtractor = new DocxExtractor(fileSystem);
const epubExtractor = new EpubExtractor();
const docReader = new DocumentReaderTool([textExtractor, pdfExtractor, docxExtractor, epubExtractor]);

// Khởi tạo base logger và logger tích hợp với Dashboard
const baseLogger = new ConsoleLogger();
const logger = pipelineDashboard.createLogger(baseLogger);

const mapper = new MapperPhase(llmClient, fileSystem, markdownGenerator, configProvider, frontmatterParser, logger, docReader);
const reducer = new ReducerPhase(llmClient, nodeRepository, logger);
const planner = new PlannerPhase(llmClient, configProvider, logger);
const atomicNodeFactory = new AtomicNodeFactory(frontmatterParser);
const refiner = new RefinerPhase(fileSystem, markdownGenerator, configProvider, frontmatterParser, logger, atomicNodeFactory);
const verifier = new VerifierPhase(fileSystem, markdownGenerator, configProvider, frontmatterParser, logger, atomicNodeFactory);
const committer = new CommitterPhase(fileSystem, markdownGenerator, configProvider, frontmatterParser, logger);

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
  logger,
  learningService,
);

const program = buildProgram(useCase, fileSystem, configProvider);

// Bound version of runShell for index.ts entry point
const boundRunShell = () => runShell(useCase, fileSystem, configProvider);

export { program, boundRunShell as runShell };
