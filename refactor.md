## muốn làm ra một giao diện CLI "xịn xò", mượt mà và đẹp mắt như **Claude Code**
Hoàn toàn có thể! Thực tế, để làm ra một giao diện CLI "xịn xò", mượt mà và đẹp mắt như **Claude Code**, **Vercel CLI** hay **Stripe CLI**, bạn không cần phải tự viết code can thiệp vào TTY (luồng nhập xuất thô) như hàm `interactiveSelect` hiện tại đâu.

Hệ sinh thái Node.js hiện nay có những thư viện UI cho Terminal cực kỳ mạnh mẽ. 

Dưới đây là **"Tech Stack" (Bộ công cụ) để nâng cấp UI** cho dự án MRP của bạn và cách áp dụng ngay lập tức:

### 1. Bộ công cụ tạo CLI "Premium" (Khuyên dùng)

Thay vì dùng `console.log` thuần, bạn hãy kết hợp các thư viện sau (cài đặt qua `pnpm`):

```bash
pnpm add @clack/prompts chalk boxen ora marked marked-terminal
pnpm add -D @types/marked-terminal
```

*   **`@clack/prompts`**: Thư viện làm Prompt đẹp nhất hiện nay (giống hệt giao diện lúc bạn khởi tạo Next.js hay Svelte mới). Nó có sẵn danh sách chọn, input, spinner mượt mà.
*   **`chalk`**: Tô màu chữ (đỏ, xanh, gradient...).
*   **`boxen`**: Vẽ khung (box) xung quanh text, có bo góc, đổ bóng.
*   **`ora`**: Hiển thị vòng xoay (spinner) siêu mượt khi đang gọi LLM.
*   **`marked` + `marked-terminal`**: Render file Markdown thẳng ra Terminal (có in đậm, màu sắc, code block) thay vì in text thô.

---

### 2. Áp dụng vào dự án của bạn (Ví dụ thực tế)

#### A. Nâng cấp hàm chọn File (`interactiveSelect`)
Thay vì tự viết hàm bắt sự kiện phím mũi tên dài hơn 100 dòng, bạn dùng `@clack/prompts`. Giao diện sẽ tự động có màu sắc, highlight, và hiệu ứng mượt.

Sửa lại trong `index.ts`:

```typescript
import { intro, outro, select, spinner, isCancel } from '@clack/prompts';
import chalk from 'chalk';

async function pickFileForPipeline(): Promise<void> {
  // Bắt đầu giao diện xịn xò
  intro(chalk.bgCyan.black(' 🚀 MRP KNOWLEDGE INGESTION PIPELINE '));

  // ... (Code đọc file như cũ của bạn)
  const files = [...]; // Danh sách file

  if (files.length === 0) {
    console.log(chalk.yellow('📭 Không có file nào ở trạng thái "to-process"'));
    return;
  }

  // Thay thế toàn bộ hàm interactiveSelect cũ bằng đoạn này:
  const chosenFilepath = await select({
    message: '📋 Chọn tài liệu thô để nạp vào hệ thống:',
    options: files.map(f => ({
      value: f.filepath,
      label: f.title,
      hint: chalk.gray(f.filename) // Chữ mờ phụ họa
    })),
    maxItems: 10,
  });

  // Nếu người dùng bấm ESC hoặc Ctrl+C
  if (isCancel(chosenFilepath)) {
    outro(chalk.gray('Đã hủy thao tác.'));
    return;
  }

  // Chạy pipeline
  const orchestrator = new MRPOrchestrator(chosenFilepath as string);
  await orchestrator.run();
  
  outro(chalk.green('✅ Hoàn tất luồng công việc!'));
}
```

#### B. Nâng cấp hiệu ứng chạy Pipeline (`orchestrator.ts`)
Thay vì in ra một loạt `console.log` trôi tuột trên màn hình, bạn có thể dùng **Spinner** để hiển thị trạng thái đang xử lý (đặc biệt khi chờ LLM phản hồi).

Sửa trong các hàm của Orchestrator hoặc các Phase (ví dụ `run()`):

```typescript
import { spinner } from '@clack/prompts';
import chalk from 'chalk';

async run(): Promise<boolean> {
  const s = spinner();
  
  try {
    // PHASE MAP
    s.start('Phase M: Đang phân tích tài liệu thô bằng LLM (Mapper)...');
    const successMap = await this.runMap();
    if (!successMap) throw new Error('Mapper failed');
    s.stop(chalk.green('✔ Phase M: Đã phân tích xong (Structured Doc created)'));

    // PHASE REDUCE
    s.start('Phase R: Đang tìm xung đột và trộn ngữ cảnh (Reducer)...');
    const successReduce = await this.runReduce();
    if (!successReduce) throw new Error('Reducer failed');
    s.stop(chalk.green('✔ Phase R: Đã lọc xong nốt trùng lặp'));

    // PHASE PLAN
    s.start('Phase P: Đang lập kế hoạch Graph (Planner)...');
    const successPlan = await this.runPlan();
    s.stop(chalk.cyan('⏸️ Phase P: Kế hoạch đã sẵn sàng để duyệt.'));
    
    // ...
  } catch(e) {
    s.stop(chalk.red(`✖ Lỗi: ${e.message}`));
  }
}
```

#### C. In kế hoạch Markdown cực đẹp khi chờ duyệt (Phase Planner)
Lúc dừng lại chờ duyệt Plan, thay vì chỉ báo đường dẫn file, bạn có thể in luôn nội dung Plan ra màn hình giống như đọc trên Obsidian.

```typescript
import boxen from 'boxen';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

// Cấu hình marked để render ra terminal
marked.setOptions({
  renderer: new TerminalRenderer()
});

// Trong Orchestrator, khi dừng lại chờ duyệt:
const planContent = fs.readFileSync(planFilepath, 'utf-8');
const renderedMarkdown = marked(planContent);

console.log(boxen(renderedMarkdown, {
  padding: 1,
  margin: 1,
  borderStyle: 'round',
  borderColor: 'cyan',
  title: `📜 Kế hoạch: mrp_plan_${this.timestamp}.md`,
  titleAlignment: 'center'
}));
```

---

### 3. Giải pháp "Ultimate": Dùng React cho CLI (Ink)
Nếu bạn thực sự muốn giao diện CLI của mình có bố cục phức tạp (chia đôi màn hình, thanh tiến trình chạy real-time ở dưới đáy, log cuộn ở trên - giống hệt Docker CLI hay Claude Code), bạn có thể tìm hiểu thư viện **[Ink](https://github.com/vadimdemedes/ink)**.

Ink cho phép bạn viết CLI bằng... **React components**:
```tsx
const PipelineDashboard = ({ status, file }) => (
  <Box flexDirection="column" borderStyle="round" borderColor="green">
    <Text color="cyan">🚀 Đang xử lý: {file}</Text>
    <Box marginTop={1}>
      <Text>MAP: {status.map ? <Text color="green">✔</Text> : <Spinner/>}</Text>
    </Box>
    {/* ... */}
  </Box>
);
```
*(Tuy nhiên với dự án MRP hiện tại của bạn, chỉ cần dùng bộ **`@clack/prompts` + `boxen` + `ora`** là đã khiến giao diện "lột xác" 90% thành một công cụ xịn như của các tập đoàn công nghệ rồi, không cần đập đi xây lại bằng Ink).*

**Tóm lại:** Bạn hãy thay thế `interactiveSelect` bằng `@clack/prompts`, thay `console.log` thông thường thành `spinner()` khi gọi LLM, dự án của bạn sẽ chuyên nghiệp lên một tầm cao mới ngay lập tức!


## Tối ưu lại dự án để đạt tiêu chuẩn Clean Architecture và Clean Code. Lưu ý không tự ý bùa phép code mà phải code theo tiêu chuẩn (clean)

Để tái cấu trúc (refactor) dự án theo đúng chuẩn **Clean Architecture** và **Clean Code** (nguyên tắc SOLID, không dùng "bùa phép" / hacks, không sửa state ẩn), chúng ta cần nhìn thẳng vào những "mùi code" (code smells) hiện tại trong dự án của bạn và giải quyết chúng tận gốc.

Dưới đây là bản thiết kế kiến trúc chuẩn mực và cách refactor từng phần.

---

### 1. Phân tích các vi phạm Clean Code hiện tại

1. **State Mutation (Đột biến trạng thái ẩn):** Các Phase (Mapper, Reducer...) nhận nguyên cục `orchestrator` (chứa state chung) và tự ý sửa đổi bên trong (`this.o.state.mapped_data = ...`). Đây là tối kỵ trong Clean Code vì nó tạo ra **side-effects**, khiến code không thể test độc lập và cực kỳ khó debug.
2. **Tight Coupling (Ghép nối chặt):** `Orchestrator` tự khởi tạo `new LLMClient()`, tự gọi `node:fs`. Nó bị trói buộc với cơ sở hạ tầng (Infrastructure).
3. **Domain trộn lẫn Infrastructure:** Các model (`AtomicNode`, `StructuredDoc`) chứa logic sinh Markdown. Theo Clean Architecture, Entity chỉ chứa dữ liệu và rule nghiệp vụ, việc format ra Markdown hay JSON là việc của Infrastructure/Presentation.
4. **God Object:** File `index.ts` vừa làm CLI Routing, vừa chứa logic UI (Interactive Shell), vừa đọc file hệ thống.

---

### 2. Sơ đồ thư mục chuẩn Clean Architecture

Bạn nên cấu trúc lại thư mục như sau để tách biệt rõ 4 lớp (Layers):

```text
src/
├── domain/                  # Lớp cốt lõi: Không phụ thuộc vào thư viện ngoài
│   ├── entities/            # AtomicNode, Plan, StructuredDoc (Chỉ chứa data & core rules)
│   └── interfaces/          # IFileSystem, ILLMProvider, IRepository
├── application/             # Lớp nghiệp vụ (Use Cases)
│   ├── use-cases/           # IngestDocumentUseCase, ApprovePlanUseCase
│   └── phases/              # Mapper, Reducer (Là pure functions/classes, nhận Input -> trả Output)
├── infrastructure/          # Lớp hạ tầng (Implementations)
│   ├── fs/                  # NodeFileSystem (implement IFileSystem)
│   ├── llm/                 # AnthropicProvider (implement ILLMProvider)
│   └── formatters/          # MarkdownGenerator (chuyển Entity -> Text)
└── presentation/            # Lớp giao diện (CLI)
    ├── cli/                 # Các lệnh Commander
    └── ui/                  # @clack/prompts, shell logic
```

---

### 3. Hướng dẫn Refactor chi tiết (Nguyên tắc: Không bùa phép)

#### Bước 1: Loại bỏ "God Object Orchestrator" và "State Mutation" ở các Phase
*Nguyên tắc:* Dữ liệu phải chảy theo một luồng rõ ràng (Pipeline). Các Phase là các hàm thuần túy (Pure classes): Nhận Input, trả Output, KHÔNG chạm vào biến toàn cục.

**TRƯỚC KHI REFACTOR (Bad):**
```typescript
class PhaseMapper {
  constructor(private o: any) {}
  async execute() {
    const raw = fs.readFileSync(this.o.sourcePath); // Phụ thuộc cứng vào fs
    this.o.state.mapped_data = parsedData; // Đột biến state ẩn (Side-effect)
  }
}
```

**SAU KHI REFACTOR (Clean Code):**
```typescript
// application/phases/mapper.ts
import { ILLMProvider } from '../../domain/interfaces/llm.interface';
import { RawDocument, StructuredData } from '../../domain/entities';

export class MapperPhase {
  // Dependency Injection (Tiêm phụ thuộc)
  constructor(private llm: ILLMProvider) {}

  // Nhận Input chuẩn, Trả Output chuẩn. Không tác động bên ngoài.
  async execute(rawDoc: RawDocument): Promise<StructuredData> {
    const prompt = this.buildPrompt(rawDoc.content);
    const response = await this.llm.generate(prompt, '', true);
    
    // Validate và trả về DTO/Entity
    return this.parseResponse(response); 
  }
}
```

#### Bước 2: Đảo ngược phụ thuộc (Dependency Inversion) cho Use Case
*Nguyên tắc:* `Orchestrator` (bây giờ gọi là Use Case) không được tự `new LLMClient()` hay dùng `node:fs`. Nó chỉ nhận các Interfaces do bạn định nghĩa.

**application/use-cases/ingest-document.use-case.ts**
```typescript
import { ILLMProvider, IFileSystem, IMarkdownGenerator } from '../../domain/interfaces';
import { MapperPhase, ReducerPhase, PlannerPhase } from '../phases';

export class IngestDocumentUseCase {
  // DI: Nhận vào các giao diện trừu tượng, không phải implementation cụ thể
  constructor(
    private fs: IFileSystem,
    private llm: ILLMProvider,
    private markdownFormatter: IMarkdownGenerator
  ) {}

  async execute(sourceFilePath: string): Promise<void> {
    // 1. Đọc file thông qua Interface
    const rawContent = await this.fs.readFile(sourceFilePath);
    const rawDoc = { path: sourceFilePath, content: rawContent };

    // 2. Chạy Phase 1 (Mapper)
    const mapper = new MapperPhase(this.llm);
    const mappedData = await mapper.execute(rawDoc); // Trả về dữ liệu sạch

    // 3. Chạy Phase 2 (Reducer)
    const reducer = new ReducerPhase(this.llm, this.fs); // Tương tự
    const reducedData = await reducer.execute(mappedData);

    // 4. Lưu trạng thái / Checkpoint thông qua Interface
    await this.fs.saveCheckpoint(sourceFilePath, { mappedData, reducedData });

    // ... tiếp tục các pha
  }
}
```

#### Bước 3: Tách Logic UI ra khỏi Domain
Các model như `AtomicNode` hiện đang chứa logic render Markdown. Hãy gỡ nó ra.

**domain/entities/atomic-node.entity.ts (Chỉ chứa Data)**
```typescript
export class AtomicNode {
  constructor(
    public readonly slug: string,
    public readonly title: string,
    public readonly tags: string[],
    public readonly definition: string,
    // ...
  ) {
    // Validation rule đặt ở đây
    if (!slug) throw new Error('Slug is required');
  }
}
```

**infrastructure/formatters/markdown.generator.ts (Chịu trách nhiệm format)**
```typescript
import { AtomicNode } from '../../domain/entities/atomic-node.entity';
import { IMarkdownGenerator } from '../../domain/interfaces';

export class MarkdownGenerator implements IMarkdownGenerator {
  generateAtomicNode(node: AtomicNode): string {
    return `---
id: ${node.slug}
title: "${node.title}"
tags:
${node.tags.map(t => `  - ${t}`).join('\n')}
---
# ${node.title}

## 💡 Định nghĩa
${node.definition}
`;
  }
}
```

#### Bước 4: Lắp ráp mọi thứ ở lớp vỏ ngoài cùng (Composition Root / CLI)
Chỉ tại điểm bắt đầu của ứng dụng (`index.ts` hoặc tệp cấu hình DI), chúng ta mới gọi chữ `new` để tạo các Implementation và "bơm" (inject) chúng vào Use Case.

**presentation/cli/index.ts**
```typescript
import { Command } from 'commander';
import { NodeFileSystem } from '../../infrastructure/fs/node-fs';
import { AnthropicProvider } from '../../infrastructure/llm/anthropic-provider';
import { MarkdownGenerator } from '../../infrastructure/formatters/markdown.generator';
import { IngestDocumentUseCase } from '../../application/use-cases/ingest-document.use-case';

const program = new Command();

program
  .command('run <file>')
  .action(async (file) => {
    // 1. Khởi tạo Hạ tầng (Infrastructure)
    const fsService = new NodeFileSystem();
    const llmService = new AnthropicProvider(process.env.ANTHROPIC_KEY);
    const mdGenerator = new MarkdownGenerator();

    // 2. Tiêm (Inject) hạ tầng vào Lớp Nghiệp vụ (Use Case)
    const useCase = new IngestDocumentUseCase(fsService, llmService, mdGenerator);

    // 3. Thực thi
    try {
      await useCase.execute(file);
      console.log('✅ Hoàn tất!');
    } catch (error) {
      console.error('❌ Lỗi:', error.message);
    }
  });

program.parse();
```

---

### Tóm tắt lợi ích của cách làm này (Tại sao nó "Clean")

1. **Khả năng Test (Testability):** Bạn muốn test `MapperPhase`? Bạn không cần phải chuẩn bị thư mục hay file thật. Bạn chỉ cần truyền một đối tượng Mock (giả) của `ILLMProvider` vào constructor là test được ngay lập tức (không cần "bùa" file `core/llm.ts`).
2. **Khả năng thay thế (Replaceability):** Ngày mai bạn muốn đổi từ Markdown sang lưu vào database PostgreSQL? Bạn không cần đụng vào Core Logic (các Use Cases hay Entities). Bạn chỉ cần viết một `PostgresRepository` mới implement Interface `IFileSystem` và gắn nó vào `index.ts`.
3. **Luồng dữ liệu tường minh:** Không còn `this.o.state...` nhảy múa toán loạn. Mỗi Phase nhận một Input rõ ràng và trả về một Output rõ ràng. Nếu lỗi, bạn nhìn Stack Trace là biết ngay nó đứt ở Phase nào.