Rất tuyệt vời! Quyết định làm **ReadTool trước** và thiết kế ưu tiên **Khả năng mở rộng (Extensibility)** là một tư duy System Design rất chính xác. 

Để giải quyết bài toán: *"Hôm nay đọc PDF text, ngày mai có thể đổi sang PDF OCR mà không làm hỏng code cũ"*, chúng ta sẽ áp dụng **Strategy Pattern (Mẫu Chiến lược)**. 

Bằng cách này, `DocumentReaderTool` sẽ không tự đọc file, mà nó là một "Người quản lý". Nó sẽ nhận các `Extractor` (chiến lược đọc) từ bên ngoài truyền vào. Sau này muốn đổi cách đọc PDF, bạn chỉ việc viết một `PdfOcrExtractor` mới và tráo đổi ở file cấu hình gốc (Composition Root), các layer khác không hề hay biết.

Dưới đây là triển khai chi tiết theo chuẩn **Clean Architecture**:

---

### Bước 1: Cài đặt thư viện
Bạn mở terminal và cài đặt các thư viện cần thiết cho việc bóc tách văn bản:
```bash
pnpm add pdf-parse mammoth
pnpm add -D @types/pdf-parse
```

---

### Bước 2: Chuẩn bị Domain (Interfaces)

**1. Cập nhật `IFileSystem`**
File PDF và DOCX là dạng nhị phân (binary). Hiện tại `IFileSystem` chỉ đọc được string (UTF-8). Ta cần bổ sung khả năng đọc Buffer.
*Mở file `src/domain/interfaces/file-system.interface.ts` và thêm:*
```typescript
export interface IFileSystem {
  readFile(filepath: string): string;
  readFileBuffer(filepath: string): Buffer; // <-- THÊM DÒNG NÀY
  // ... (giữ nguyên các hàm cũ)
}
```

*Cập nhật file `src/infrastructure/fs/node-file-system.ts`:*
```typescript
  // Thêm hàm này vào class
  readFileBuffer(filepath: string): Buffer {
    return fs.readFileSync(filepath);
  }
```

**2. Tạo Interface cho Document Reader**
*Tạo file `src/domain/interfaces/document-reader.interface.ts`:*
```typescript
export interface IDocumentReader {
  readAsText(filepath: string): Promise<string>;
  isSupported(filepath: string): boolean;
}
```

---

### Bước 3: Triển khai Infrastructure với Strategy Pattern

Chúng ta tạo một interface nội bộ cho Infrastructure là `IFileExtractor`. Mỗi định dạng file sẽ có một Extractor riêng.

*Tạo file `src/infrastructure/tools/document-reader/extractors.ts`:*
```typescript
import path from 'node:path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import type { IFileSystem } from '../../../domain/interfaces/file-system.interface.ts';

// 1. Interface cốt lõi cho các chiến lược đọc (Strategy)
export interface IFileExtractor {
  supports(ext: string): boolean;
  extract(filepath: string): Promise<string>;
}

// 2. Chiến lược đọc Text thuần (.md, .txt, .csv)
export class TextExtractor implements IFileExtractor {
  constructor(private fs: IFileSystem) {}

  supports(ext: string): boolean {
    return ['.md', '.txt', '.csv'].includes(ext);
  }

  async extract(filepath: string): Promise<string> {
    return this.fs.readFile(filepath); // Đọc chuỗi UTF-8
  }
}

// 3. Chiến lược đọc PDF Text (Dễ dàng thay thế bằng PDF OCR sau này)
export class PdfTextExtractor implements IFileExtractor {
  constructor(private fs: IFileSystem) {}

  supports(ext: string): boolean {
    return ext === '.pdf';
  }

  async extract(filepath: string): Promise<string> {
    const buffer = this.fs.readFileBuffer(filepath);
    const data = await pdfParse(buffer);
    
    // Logic mở rộng tương lai: 
    // Nếu data.text quá ngắn (< 50 ký tự), có thể throw ra OCRRequiredError
    // để hệ thống chuyển sang hàng đợi OCR.
    
    return data.text;
  }
}

// 4. Chiến lược đọc DOCX
export class DocxExtractor implements IFileExtractor {
  constructor(private fs: IFileSystem) {}

  supports(ext: string): boolean {
    return ext === '.docx';
  }

  async extract(filepath: string): Promise<string> {
    const buffer = this.fs.readFileBuffer(filepath);
    // Mammoth cung cấp API đọc trực tiếp từ Buffer rất an toàn
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
}
```

*Tạo file `src/infrastructure/tools/document-reader/document-reader.tool.ts`:*
```typescript
import path from 'node:path';
import type { IDocumentReader } from '../../../domain/interfaces/document-reader.interface.ts';
import type { IFileExtractor } from './extractors.ts';

export class DocumentReaderTool implements IDocumentReader {
  // Nhận danh sách các chiến lược (Extractors) từ bên ngoài truyền vào
  constructor(private extractors: IFileExtractor[]) {}

  isSupported(filepath: string): boolean {
    const ext = path.extname(filepath).toLowerCase();
    return this.extractors.some(extractor => extractor.supports(ext));
  }

  async readAsText(filepath: string): Promise<string> {
    const ext = path.extname(filepath).toLowerCase();
    
    // Tìm chiến lược phù hợp với đuôi file
    const extractor = this.extractors.find(e => e.supports(ext));
    
    if (!extractor) {
      throw new Error(`Định dạng không được hỗ trợ: ${ext}`);
    }

    // Giao việc trích xuất cho Strategy đó
    return await extractor.extract(filepath);
  }
}
```
*(Bạn thấy đấy, sau này có code thêm OCR, class `DocumentReaderTool` này **hoàn toàn không bị sửa đổi gì**. Đây chính là nguyên lý Open/Closed (O trong SOLID)).*

---

### Bước 4: Điều chỉnh Tầng Application và Domain

**1. Sửa `SourceDoc.parseFrontmatter`**
Để hệ thống không bị crash khi cố đọc YAML từ file PDF.
*Sửa file `src/domain/entities/source-doc.entity.ts`:*
```typescript
  // Thêm tham số filepath vào hàm
  static parseFrontmatter(content: string, parser: IFrontmatterParser, filepath: string): Frontmatter {
    const ext = filepath.split('.').pop()?.toLowerCase();
    
    // PSEUDO-FRONTMATTER cho file PDF/DOCX
    if (ext && ext !== 'md') {
      const filename = filepath.split(/[/\\]/).pop() || 'unknown';
      const title = filename.replace(`.${ext}`, '').replace(/[-_]/g, ' ');
      return {
        id: '',
        title: title, // Lấy tên file làm tiêu đề tạm
        category: 'Raw Knowledge Source',
        tags: [ext, 'raw-document'],
        date: new Date().toISOString().slice(0, 10),
        status: 'to-process',
      };
    }

    // ... (Giữ nguyên logic Try/Catch cũ của file .md)
```

**2. Nâng cấp `MapperPhase`**
*Sửa file `src/application/phases/mapper.phase.ts`:*
```typescript
import type { IDocumentReader } from '../../domain/interfaces/document-reader.interface.ts';
// ... các import cũ

export class MapperPhase {
  // Thêm docReader vào Constructor
  constructor(
    private llm: ILLMProvider,
    private fs: IFileSystem,
    private mdGenerator: IMarkdownGenerator,
    private config: IConfigProvider,
    private parser: IFrontmatterParser,
    private logger: ILogger,
    private docReader: IDocumentReader // <-- INJECT
  ) {}

  async execute(sourcePath: string, onTokenUsed?: (usage: LLMUsage) => void): Promise<MappedData | null> {
    const slug = this.extractSlug(sourcePath);

    if (!this.fs.fileExists(sourcePath)) {
      this.logger.error(`❌ Lỗi: Không tìm thấy file [${sourcePath}]`);
      return null;
    }

    // 1. ĐỌC FILE QUA READ TOOL MỚI (Hỗ trợ PDF/DOCX)
    let rawContent = '';
    try {
      rawContent = await this.docReader.readAsText(sourcePath);
    } catch (err: any) {
      this.logger.error(`❌ Lỗi đọc file: ${err.message}`);
      return null;
    }

    if (!rawContent.trim()) {
      this.logger.error(`❌ Lỗi: File rỗng hoặc không trích xuất được text [${sourcePath}]`);
      return null;
    }

    // 2. PARSE FRONTMATTER
    const frontmatter = SourceDoc.parseFrontmatter(rawContent, this.parser, sourcePath);
    
    this.logger.info(`📄 Slug: ${slug}`);
    this.logger.info(`  Tiêu đề: ${frontmatter.title}`);
    
    if (frontmatter.status === 'processed') {
      this.logger.info('  ⏭️ File đã được xử lý trước đó. Bỏ qua.');
      return null;
    }

    // 3. LỌC BỎ YAML CỦA FILE MD (File PDF/DOCX thì giữ nguyên toàn bộ Text)
    const cleanContentToLLM = sourcePath.toLowerCase().endsWith('.md')
      ? rawContent.replace(/^---\n[\s\S]*?\n---\n?/, '').trim()
      : rawContent;

    // 4. GỌI LLM (Truyền cleanContentToLLM vào thay vì rawContent cũ)
    this.logger.info('  🔄 Đang chắt lọc...');
    // ... Giữ nguyên toàn bộ logic tạo StructuredDoc và gọi this.callLLM(cleanContentToLLM)
```

---

### Bước 5: Đưa vào DI Container & UI (Lắp ráp hệ thống)

**1. Sửa `composition-root.ts`**
*Mở file `src/presentation/composition-root.ts`:*
```typescript
import { DocumentReaderTool } from '../infrastructure/tools/document-reader/document-reader.tool.ts';
import { TextExtractor, PdfTextExtractor, DocxExtractor } from '../infrastructure/tools/document-reader/extractors.ts';

// ...
const fileSystem = new NodeFileSystem();

// THIẾT LẬP READ TOOL (Lắp ráp các chiến lược)
const textExtractor = new TextExtractor(fileSystem);
const pdfExtractor = new PdfTextExtractor(fileSystem);
const docxExtractor = new DocxExtractor(fileSystem);

const docReader = new DocumentReaderTool([
  textExtractor,
  pdfExtractor,
  docxExtractor
]);

// ... 
const mapper = new MapperPhase(
  llmClient, 
  fileSystem, 
  markdownGenerator, 
  configProvider, 
  frontmatterParser, 
  logger,
  docReader // <-- TRUYỀN READ TOOL VÀO MAPPER
);
```

**2. Sửa UI Chọn File (`file-picker.ts`)**
*Mở file `src/presentation/ui/file-picker.ts` và sửa bộ lọc tìm kiếm:*
```typescript
  // Cập nhật bộ lọc ở khoảng dòng 17
  const supportedExts = ['.md', '.txt', '.pdf', '.docx', '.csv'];

  const files = fs.readdir(config.dirRaw)
    .filter(f => supportedExts.some(ext => f.toLowerCase().endsWith(ext)) && f !== 'RULE.md' && f !== 'index.md')
    .map(f => {
      const filepath = path.join(config.dirRaw, f);
      const ext = path.extname(f).toLowerCase();
      
      let title = f;
      let status = 'to-process';
      
      if (ext === '.md') {
        try {
          const content = fs.readFile(filepath);
          const parsed = matter(content);
          title = parsed.data?.title || f;
          status = parsed.data?.status || 'unknown';
        } catch { return null; }
      }

      // Gán Icon
      let icon = '📄';
      if (ext === '.pdf') icon = '📕';
      if (ext === '.docx') icon = '📘';

      return {
        filename: f,
        filepath,
        title: `${icon} ${title}`,
        status,
      };
    })
    .filter((f): f is NonNullable<typeof f> => f !== null && f.status === 'to-process');
```

*(Lưu ý: Tương tự, nếu bạn dùng hack `fzf` ở dòng 78, bạn nhớ đổi lệnh bash từ `*.md` thành `\*.md -o -name \*.pdf -o -name \*.docx` để quét được toàn bộ).*

---

### 🎉 Hoàn tất!
Lúc này, hệ thống của bạn đã có thể nuốt bất kỳ file PDF hay DOCX nào đưa vào thư mục `00_raw_docs`.

**Tương lai:** Khi bạn muốn thêm OCR cho PDF (ví dụ dùng `tesseract.js`), bạn chỉ cần:
1. Viết 1 class `PdfOcrExtractor implements IFileExtractor`.
2. Vào `composition-root.ts` đổi `new PdfTextExtractor()` thành `new PdfOcrExtractor()`.
3. Toàn bộ logic hệ thống, Application, Domain **đều không thay đổi dù chỉ 1 dòng code**.

Đây chính là sức mạnh tối thượng của Clean Architecture kết hợp Strategy Pattern! Chúc bạn tích hợp thành công! Nếu gặp vướng mắc chỗ nào cứ báo lại tôi.