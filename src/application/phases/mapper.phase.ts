import type { ILLMProvider } from '../../domain/interfaces/llm-provider.interface.ts';
import type { LLMUsage } from '../../domain/interfaces/llm-provider.interface.ts';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { IFrontmatterParser } from '../../domain/interfaces/frontmatter-parser.interface.ts';
import type { IDocumentReader } from '../../domain/interfaces/document-reader.interface.ts';
import { SourceDoc } from '../../domain/entities/source-doc.entity.ts';
import { StructuredDoc } from '../../domain/entities/structured-doc.entity.ts';
import type { IMarkdownGenerator } from '../../domain/interfaces/markdown-generator.interface.ts';
import type { IConfigProvider } from '../../domain/interfaces/config-provider.interface.ts';
import type { ILogger } from '../../domain/interfaces/logger.interface.ts';
import { type MappedData, LLMStructuredResponseSchema, type KeywordItem } from './_types.ts';
import { extractJson } from './_utils.ts';
import { resolveRules } from './_rule-resolver.ts';

export class MapperPhase {
  private llm: ILLMProvider;
  private fs: IFileSystem;
  private mdGenerator: IMarkdownGenerator;
  private config: IConfigProvider;
  private parser: IFrontmatterParser;
  private logger: ILogger;
  private docReader: IDocumentReader;

  constructor(
    llm: ILLMProvider,
    fs: IFileSystem,
    mdGenerator: IMarkdownGenerator,
    config: IConfigProvider,
    parser: IFrontmatterParser,
    logger: ILogger,
    docReader: IDocumentReader
  ) {
    this.llm = llm;
    this.fs = fs;
    this.mdGenerator = mdGenerator;
    this.config = config;
    this.parser = parser;
    this.logger = logger;
    this.docReader = docReader;
  }

  async execute(sourcePath: string, onTokenUsed?: (usage: LLMUsage) => void): Promise<MappedData | null> {
    const slug = this.extractSlug(sourcePath);

    // Đọc file thô qua DocumentReader (hỗ trợ .md, .pdf, .docx, ...)
    if (!this.fs.fileExists(sourcePath)) {
      this.logger.error(`❌ Lỗi: Không tìm thấy file [${sourcePath}]`);
      return null;
    }

    let content: string;
    try {
      content = await this.docReader.readAsText(sourcePath);
    } catch (err: any) {
      this.logger.error(`❌ Lỗi đọc file: ${err.message}`);
      return null;
    }

    if (!content.trim()) {
      this.logger.error(`❌ Lỗi: File rỗng [${sourcePath}]`);
      return null;
    }

    const frontmatter = SourceDoc.parseFrontmatter(content, this.parser, sourcePath);
    this.logger.info(`📄 Slug: ${slug}`);
    this.logger.info(`  Tiêu đề: ${frontmatter.title}`);
    this.logger.info(`  Trạng thái: ${frontmatter.status}`);

    if (frontmatter.status === 'processed') {
      this.logger.info('  ⏭️ File đã được xử lý trước đó (status: processed). Bỏ qua.');
      return null;
    }

    const rawContent = sourcePath.toLowerCase().endsWith('.md')
      ? content.replace(/^---\n[\s\S]*?\n---\n?/, '').trim()
      : content;

    // Gọi LLM
    this.logger.info('  🔄 Đang chắt lọc...');
    const rules = resolveRules(sourcePath, this.config.dirVault, this.fs);
    if (rules.globalRules) {
      this.logger.info('  ⚙️ Đã nạp luật toàn cục (Global Rules)');
    }
    if (rules.domainRules) {
      this.logger.info('  ⚙️ Đã nạp luật domain (Domain Rules)');
    }

    const structuredDoc = new StructuredDoc(
      `${slug}-processed`,
      `${frontmatter.title} - Bản Chắt Lọc Cấu Trúc`,
      slug,
    );

    let keywords: KeywordItem[] = [];
    try {
      const parsed = await this.callLLM(rawContent, rules, onTokenUsed);
      structuredDoc.title = parsed.title || structuredDoc.title;
      structuredDoc.keyTakeaways = parsed.key_takeaways || [];

      const parsedKeywords = parsed.keywords || [];
      structuredDoc.keywords = parsedKeywords.map(
        (k) => ({ name: k.name || '', definition: k.definition || '' }),
      );
      keywords = parsedKeywords.map(
        (k) => ({ name: k.name || '', definition: k.definition || '' }),
      );

      structuredDoc.summary = parsed.summary || '';
      this.logger.success('  ✅ Chắt lọc thành công!');
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      this.logger.warn(`  ⚠️ Không thể gọi LLM: ${err}`);
      this.logger.info('  ⏭️ Fallback suy luận cơ bản...');
      this.fallbackStructuredDoc(structuredDoc, rawContent, frontmatter.title);
      keywords = structuredDoc.keywords.map(k => ({ name: k.name, definition: k.definition }));
    }

    // Ghi file structured doc
    const outputPath = `${this.config.dirStructured}/${slug}-processed.md`;
    this.fs.writeFile(outputPath, this.mdGenerator.generateStructuredDoc(structuredDoc));

    this.logger.success(`  ✅ Đã tạo structured doc: [${outputPath}]`);

    // Return mapped data
    return {
      slug,
      structured_slug: `${slug}-processed`,
      title: structuredDoc.title,
      key_takeaways: structuredDoc.keyTakeaways,
      keywords,
      rules,
    };
  }

  private async callLLM(rawContent: string, rules: { globalRules: string; domainRules: string }, onTokenUsed?: (usage: LLMUsage) => void) {
    let rulesPrompt = '';
    if (rules.globalRules) {
      rulesPrompt += `\n\n=== RÀNG BUỘC TOÀN CỤC (GLOBAL RULES) ===\n${rules.globalRules}`;
    }
    if (rules.domainRules) {
      rulesPrompt += `\n\n=== CHỈ DẪN NGHIỆP VỤ DOMAIN (DOMAIN RULES) ===\n${rules.domainRules}`;
    }

    const llmPrompt = `Hãy phân tích bài kinh Phật giáo Nikaya hoặc tài liệu nghiên cứu dưới đây và trả về kết quả dưới dạng JSON.${rulesPrompt}


Tài liệu:
${rawContent.slice(0, 6000)}

Yêu cầu đầu ra (JSON):
{
  "title": "Tên tài liệu (súc tích, giữ nguyên tiếng Việt)",
  "key_takeaways": [
    "Đúc kết 1",
    "Đúc kết 2",
    "Đúc kết 3"
  ],
  "keywords": [
    {"name": "Tên Khái niệm 1", "definition": "Định nghĩa ngắn gọn"},
    {"name": "Tên Khái niệm 2", "definition": "Định nghĩa ngắn gọn"}
  ],
  "summary": "Tóm tắt AI-Ready súc tích (3-5 câu)"
}`;

    const response = await this.llm.generate(llmPrompt, '', true);
    if (response.usage && onTokenUsed) {
      onTokenUsed(response.usage);
    }
    const rawJson = extractJson(response.content);
    return LLMStructuredResponseSchema.parse(rawJson);
  }

  private fallbackStructuredDoc(doc: StructuredDoc, rawContent: string, title: string): void {
    const lines = rawContent.split('\n');
    let heading = '';
    for (const line of lines) {
      if (line.startsWith('# ')) {
        heading = line.replace('# ', '').trim();
        break;
      }
    }
    doc.title = `${heading || title} - Bản Chắt Lọc Cấu Trúc`;
    doc.keyTakeaways = ['TODO: Chắt lọc thủ công sau khi có API key.'];
    doc.keywords = [{ name: heading || title, definition: 'Xem nội dung chi tiết khi có LLM.' }];
    doc.summary = 'Nội dung tài liệu thô chưa được phân tích. Vui lòng cấu hình API key hoặc chạy lại pipeline khi có LLM.';
  }

  private extractSlug(filepath: string): string {
    return filepath.replace(/\.[^.]+$/, '').split('/').pop() || 'unknown';
  }
}
