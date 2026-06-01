import * as fs from 'node:fs';
import * as path from 'node:path';
import { SourceDoc } from '../models/source-doc.ts';
import { StructuredDoc } from '../models/structured-doc.ts';
import { DIR_STRUCTURED } from '../core/config.ts';

export class PhaseMapper {
  private o: any;

  constructor(orchestrator: any) {
    this.o = orchestrator;
  }

  async execute(): Promise<boolean> {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📡  Phase M - MAPPER: Phân tích tài liệu thô`);
    console.log(`${'='.repeat(50)}`);
    const srcPath = this.o.sourcePath;

    // Đọc file thô
    if (!fs.existsSync(srcPath)) {
      console.log(`❌ Lỗi: Không tìm thấy file [${srcPath}]`);
      return false;
    }

    const content = fs.readFileSync(srcPath, 'utf-8');
    if (!content.trim()) {
      console.log(`❌ Lỗi: File rỗng [${srcPath}]`);
      return false;
    }

    // Phân tích frontmatter
    const frontmatter = SourceDoc.parseFrontmatter(content);
    const slug = this.o.sourceSlug;
    console.log(`📄 Slug: ${slug}`);
    console.log(`  Tiêu đề: ${frontmatter.title}`);
    console.log(`  Trạng thái: ${frontmatter.status}`);

    if (frontmatter.status === 'processed') {
      console.log(`  ⏭️ File đã được xử lý trước đó (status: processed). Bỏ qua.`);
      return false;
    }

    // Chuẩn bị dữ liệu structured doc thô
    const structuredDoc = new StructuredDoc({
      slug: `${slug}-processed`,
      title: `${frontmatter.title} - Bản Chắt Lọc Cấu Trúc`,
      sourceSlug: slug,
    });

    console.log('  🔄 Đang chắt lọc...');
    const rawContent = content.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();

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
}
`;

    let parsed: any = null;
    try {
      const response = await this.o.llm.generate(llmPrompt, '', true);
      parsed = JSON.parse(response);
      structuredDoc.title = parsed.title || structuredDoc.title;
      structuredDoc.keyTakeaways = parsed.key_takeaways || [];
      const keywordsRaw = parsed.keywords || [];
      structuredDoc.keywords = keywordsRaw.map(
        (k: any) => ({ name: k.name || '', definition: k.definition || '' })
      );
      structuredDoc.summary = parsed.summary || '';
      console.log('  ✅ Chắt lọc thành công!');
    } catch (e: any) {
      console.log(`  ⚠️ Không thể gọi LLM: ${e.message}`);
      console.log('  ⏭️ Chuyển sang chế độ suy luận cơ bản (DUMP)...');

      // Fallback nếu không gọi được LLM
      const lines = rawContent.split('\n');
      let heading = '';
      for (const line of lines) {
        if (line.startsWith('# ')) {
          heading = line.replace('# ', '').trim();
          break;
        }
      }
      structuredDoc.title = `${heading || slug} - Bản Chắt Lọc Cấu Trúc`;
      structuredDoc.keyTakeaways = ['TODO: Chắt lọc thủ công sau khi có API key.'];
      structuredDoc.keywords = [
        { name: heading || slug, definition: 'Xem nội dung chi tiết khi có LLM.' },
      ];
      structuredDoc.summary = 'Nội dung tài liệu thô chưa được phân tích. Vui lòng cấu hình API key hoặc chạy lại pipeline khi có LLM.';
    }

    // Ghi file structured doc
    const outputFileName = `${slug}-processed.md`;
    const outputPath = path.join(DIR_STRUCTURED, outputFileName);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const outputContent = structuredDoc.toMarkdown();
    fs.writeFileSync(outputPath, outputContent, 'utf-8');
    console.log(`  ✅ Đã tạo structured doc: [${path.relative(this.o.vaultRoot || process.cwd(), outputPath)}]`);

    // Cập nhật state cho pha tiếp theo
    this.o.state.mapped_data = {
      slug,
      structured_slug: `${slug}-processed`,
      title: structuredDoc.title,
      key_takeaways: structuredDoc.keyTakeaways,
      keywords: parsed ? parsed.keywords || [] : [{ name: structuredDoc.keywords[0].name, definition: structuredDoc.keywords[0].definition }],
    };

    return true;
  }
}
