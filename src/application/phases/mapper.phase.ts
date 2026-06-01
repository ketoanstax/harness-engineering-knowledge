import type { ILLMProvider } from '../../domain/interfaces/llm-provider.interface.ts';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import { SourceDoc } from '../../domain/entities/source-doc.entity.ts';
import { StructuredDoc } from '../../domain/entities/structured-doc.entity.ts';
import type { IMarkdownGenerator } from '../../domain/interfaces/markdown-generator.interface.ts';
import { DIR_STRUCTURED } from '../../core/config.ts';
import type { MappedData } from './_types.ts';

export class MapperPhase {
  constructor(
    private llm: ILLMProvider,
    private fs: IFileSystem,
    private mdGenerator: IMarkdownGenerator,
  ) {}

  async execute(sourcePath: string): Promise<MappedData | null> {
    const slug = this.extractSlug(sourcePath);

    // Đọc file thô
    if (!this.fs.fileExists(sourcePath)) {
      console.log(`❌ Lỗi: Không tìm thấy file [${sourcePath}]`);
      return null;
    }

    const content = this.fs.readFile(sourcePath);
    if (!content.trim()) {
      console.log(`❌ Lỗi: File rỗng [${sourcePath}]`);
      return null;
    }

    const frontmatter = SourceDoc.parseFrontmatter(content);
    console.log(`📄 Slug: ${slug}`);
    console.log(`  Tiêu đề: ${frontmatter.title}`);
    console.log(`  Trạng thái: ${frontmatter.status}`);

    if (frontmatter.status === 'processed') {
      console.log('  ⏭️ File đã được xử lý trước đó (status: processed). Bỏ qua.');
      return null;
    }

    const rawContent = content.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();

    // Gọi LLM
    console.log('  🔄 Đang chắt lọc...');
    const structuredDoc = new StructuredDoc(
      `${slug}-processed`,
      `${frontmatter.title} - Bản Chắt Lọc Cấu Trúc`,
      slug,
    );

    let parsed: any = null;
    try {
      parsed = await this.callLLM(rawContent, frontmatter.title);
      structuredDoc.title = parsed.title || structuredDoc.title;
      structuredDoc.keyTakeaways = parsed.key_takeaways || [];
      structuredDoc.keywords = (parsed.keywords || []).map(
        (k: any) => ({ name: k.name || '', definition: k.definition || '' }),
      );
      structuredDoc.summary = parsed.summary || '';
      console.log('  ✅ Chắt lọc thành công!');
    } catch (e: any) {
      console.log(`  ⚠️ Không thể gọi LLM: ${e.message}`);
      console.log('  ⏭️ Fallback suy luận cơ bản...');
      this.fallbackStructuredDoc(structuredDoc, rawContent, frontmatter.title);
    }

    // Ghi file structured doc
    const outputPath = `${DIR_STRUCTURED}/${slug}-processed.md`;
    this.fs.writeFile(outputPath, this.mdGenerator.generateStructuredDoc(structuredDoc));

    console.log(`  ✅ Đã tạo structured doc: [${outputPath}]`);

    // Return mapped data
    return {
      slug,
      structured_slug: `${slug}-processed`,
      title: structuredDoc.title,
      key_takeaways: structuredDoc.keyTakeaways,
      keywords: parsed
        ? (parsed.keywords || []).map((k: any) => ({ name: k.name || '', definition: k.definition || '' }))
        : structuredDoc.keywords.map(k => ({ name: k.name, definition: k.definition })),
    };
  }

  private async callLLM(rawContent: string, _title: string): Promise<any> {
    const llmPrompt = `Hãy phân tích bài kinh Phật giáo Nikaya hoặc tài liệu nghiên cứu dưới đây và trả về kết quả dưới dạng JSON.

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
    return JSON.parse(response);
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
    return filepath.replace(/\.md$/, '').split('/').pop() || 'unknown';
  }
}
