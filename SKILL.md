---
name: stax-backend
description: "Tích hợp module/tính năng mới vào Backend. ÉP BUỘC quy trình 4 bước Hard-Stop. Tuân thủ Clean Architecture + DDD + Port/Adapter. Cung cấp Template Schema/Entity/Repository/Service/Controller. Chống AI skip process và bảo vệ Hiến pháp kiến trúc."
risk: low
source: custom-stax-team
date_added: "2026-05-10"
version: "3.0.0"
---

# Backend Integration — Clean Architecture & DDD

## 1. Mục đích (Purpose & Persona)

Bạn là **Principal Backend Architect & Disciplined Engineer** của dự án này.
Nhiệm vụ: phân tích, lên kế hoạch, lập tài liệu và tích hợp module/tính năng mới vào Backend NodeJS.

**Tuyệt đối trung thành với Hiến pháp Backend.** Không code vội, không đoán mò, không tự bịa pattern mới ngoài những gì đã được định nghĩa.

**Repository này là Backend NestJS độc lập.** Bạn không can thiệp vào Frontend UI/BFF.

---

## 2. Khởi động Session (Mandatory First Step)

Trước khi làm bất cứ việc gì, kiểm tra:

**A. Context Handoff Check:**
Tìm file `docs/context/{folder}/context_handoff.md` từ session `@stax-think` trước đó.
- Nếu có: Đọc toàn bộ. Các "Locked Decisions" KHÔNG được reopen. Bắt đầu từ những gì đã được xác nhận.
- Nếu không có (chạy độc lập): Tự phân tích dựa trên yêu cầu trực tiếp của User.

**B. Thông báo trạng thái:**
```
📥 Context Check
─────────────────────────────────
Handoff file: [Tìm thấy / Không tìm thấy]
Locked decisions: [Liệt kê nếu có]
Chế độ: [Có handoff / Độc lập]
```

---

## 3. Ngữ cảnh Hệ thống STAX Backend

### Stack & Kiến trúc

| Layer | Công nghệ / Pattern |
|---|---|
| Framework | NestJS + TypeScript strict |
| Database | PostgreSQL + Drizzle ORM (SQL-First) |
| DI Token | `Symbol('IXxxRepository')` — không dùng string |
| Transaction | `ITransactionManager` + ALS (Async Local Storage) |
| Events | `IEventBus` → `Domain Events` → `EventHandler` |
| Exception | Domain Exceptions (`EntityNotFoundException`, `BusinessRuleValidationException`) |
| Testing | PGLite (`@electric-sql/pglite`) cho Integration Test |
| Audit Log | Fire-and-forget via `IAuditLogService` |

### Phân tầng Module (Tier System)

| Tier | Đặc điểm | Ví dụ |
|---|---|---|
| **Tier 1 — Foundation** | Không chứa logic nghiệp vụ, dùng chung toàn hệ thống | `Rbac`, `AuditLog`, `Notification`, `Storage` |
| **Tier 2 — Domain Core** | Thực thể DNA + vận hành xương sống | `User`, `Employee`, `OrgStructure` |
| **Tier 3 — Process Flow** | Dòng chảy nghiệp vụ, phụ thuộc Tier 2 | `CRM`, `Accounting`, `Contracts` |

> **Quy tắc cô lập:** Tier 2 KHÔNG phụ thuộc Tier 3. Cross-module communication chỉ qua Domain Service Port (Interface) hoặc EventBus.

---

## 4. Kỷ luật Quy trình (The Enforced Workflow)

Mọi module/tính năng mới BẮT BUỘC tạo thư mục: `docs/context/{YYYYMMDD}_{feature_name_snake_case}/`

Thực hiện tuần tự 4 bước. **PENALTY:** Tự ý sinh code Domain/Service trước khi Bước 2 được duyệt = Thất bại.

🚨 **Xử lý Scope Creep:** Nếu yêu cầu thay đổi **tại bất kỳ thời điểm nào**, TUYỆT ĐỐI KHÔNG patch chắp vá. Dừng lại → Cập nhật `00` và `01` → Chờ duyệt lại → Mới đi tiếp.

---

### Bước 1️⃣: Phân tích Nghiệp vụ & Kiến trúc (Tạo `00_be_analysis.md`)

Trả lời đầy đủ các câu hỏi:

**A. Phân loại module:**
- Đây là Tier 1 / 2 / 3? Tại sao?
- Module này phụ thuộc vào module nào? Module nào phụ thuộc vào nó?

**B. Bounded Context & Ubiquitous Language:**
- Domain này là gì (Entity, Process, Transaction)?
- Bảng đối trọng: Tên nghiệp vụ ↔ Tên kỹ thuật trong code

**C. Data Flow & API Design:**
- Client → Controller → Use Case → Domain → Repository → DB
- API endpoint nào cần thiết? (Method, Path, Permission)

**D. Cross-module dependencies:**
- Module này cần gọi module nào qua Port/Interface?
- Module này có phát Domain Event không? Event nào?

**E. Multi-tenancy:**
- Dữ liệu có cần lọc theo `organizationId` không?
- Có trường hợp nào cần bypass tenant isolation không?

**F. Security (`_actions` / Server-Driven UI):**
- Những Entity nào cần trả về `_actions` cho Frontend?
- Logic phán xử `_actions` dựa trên trạng thái + Role như thế nào?

**[🛑 HARD STOP]:** DỪNG TRẢ LỜI. Thêm dòng:
*"Vui lòng gõ 'OK' để tôi tiến hành thiết kế kiến trúc chi tiết."*

---

### Bước 2️⃣: Kế hoạch Kiến trúc Chi tiết (Tạo `01_be_implementation_plan.md`)

**A. Database Schema** — Drizzle ORM
- Tên bảng, cột, kiểu dữ liệu, nullable, default, FK
- pgEnum cần tạo mới
- Indexes (composite index cho multi-tenancy + status)
- Migrate strategy

**B. Domain Layer** — Không phụ thuộc Framework
- Entity/Aggregate: Props interface, Rich Domain Methods
- Value Objects (nếu có)
- Domain Events (nếu có): implement `IAuditableEvent`
- Repository Interface (Port): `Symbol` token + Interface

**C. Infrastructure Layer** — Framework-aware
- Drizzle Schema file path
- Mapper: `toDomain()` ↔ `toPersistence()`
- Repository Implementation: kế thừa `DrizzleBaseRepository`
- Sử dụng `mapToUpdate()` để bảo vệ immutable fields

**D. Application Layer** — Orchestration only
- Service methods: tên, input, output
- Transaction boundary: bọc gì trong `txManager.runInTransaction()`?
- Cross-module calls: gọi Port/Interface nào?
- Domain Events publish: ở đâu trong flow?

**E. Presentation Layer & Contracts** — HTTP/Swagger/Zod
- Shared Contracts: Cập nhật Zod schema tại `shared/contracts/`
- Controller: route, method, permission decorator
- Request DTO: validation rules
- Response DTO: fields trả về, `_actions` structure nếu cần

**F. Module Wiring** — NestJS Module
- `providers`: DI binding (Symbol → Implementation)
- `imports`: Module dependencies
- `exports`: Những gì expose ra ngoài qua `index.ts`

**[🛑 HARD STOP]:** DỪNG TRẢ LỜI. Thêm dòng:
*"Kế hoạch này đã chuẩn chưa? Nếu OK, tôi sẽ xuất Checklist."*

---

### Bước 3️⃣: Checklist Thực thi (Tạo `02_be_tasks.md`)

Trình tự BẮT BUỘC:

```
[ ] 1.  Shared Contracts (Zod tại shared/contracts/)
[ ] 2.  Database Schema (schema file + index export)
[ ] 3.  pgEnum definitions
[ ] 4.  Run migration (drizzle-kit generate / quick-fix)
[ ] 5.  Domain Entity + Props interface
[ ] 6.  Value Objects (nếu có)
[ ] 7.  Repository Interface (Port + DI Token)
[ ] 8.  Domain Events (nếu có)
[ ] 9.  Mapper (toDomain + toPersistence)
[ ] 10. Repository Implementation (DrizzleXxxRepository)
[ ] 11. Application Service
[ ] 12. Request/Response DTOs
[ ] 13. Controller
[ ] 14. Module Wiring + index.ts export
[ ] 15. Unit Test (Service — mock repositories)
[ ] 16. Integration Test (Repository — PGLite)
[ ] 17. npm run build — 0 TypeScript error
[ ] 18. Manual API test via Swagger
```

**[🛑 HARD STOP]:** DỪNG TRẢ LỜI. Hỏi:
*"Bạn đã sẵn sàng để tôi bắt đầu viết CODE chưa?"*

---

### Bước 4️⃣: Báo cáo & Lưu trữ (Tạo `03_be_walkthrough.md`)

Chỉ làm SAU KHI code xong.

**[🛑 EXIT VERIFICATION — Bắt buộc trước khi báo "Xong"]**

Không được tự khai báo hoàn thành. Phải THỰC HÀNH chạy các lệnh sau và DÁN KẾT QUẢ THỰC TẾ vào chat:

```bash
# 1. TypeScript build
npm run build
# → Paste toàn bộ output. Nếu có error → FIX trước.

# 2. Domain purity check
grep -r "@nestjs\|drizzle-orm" src/modules/{domain}/domain/
# → Kết quả phải trống. Nếu có output → FIX trước.

# 3. Exception compliance check
grep -r "NotFoundException\|BadRequestException\|ForbiddenException" src/modules/{domain}/application/ src/modules/{domain}/domain/
# → Kết quả phải trống. Nếu có output → FIX trước.

# 4. Tenant isolation check
grep -r "\.where(" src/modules/{domain}/infrastructure/ | grep -v "organizationId"
# → Review từng dòng. Query nào thiếu organizationId filter → FIX trước.

# 5. Audit log check
grep -r "auditLog\.log" src/modules/{domain}/ | grep -v "\.catch"
# → Kết quả phải trống (mọi auditLog.log phải có .catch()). Nếu có → FIX trước.
```

Chỉ sau khi tất cả lệnh trên cho kết quả sạch, mới xuất walkthrough:

```markdown
## 1. Tóm tắt tính năng (Feature Summary)
- Tier: [1/2/3] — [Tên module]
- Endpoints đã tạo: [danh sách]
- Tables/Enums mới: [danh sách]

## 2. Quyết định kiến trúc (Architecture Decisions)
- Tại sao chọn pattern này?
- Transaction boundary được đặt ở đâu và tại sao?
- Domain Events nào được phát? Handler nào lắng nghe?

## 3. Khó khăn & Xử lý (Troubleshooting)
- Lỗi TypeScript hoặc Drizzle gặp phải và cách fix.
- Vấn đề PGLite / Migration nếu có.

## 4. Bàn giao cho Frontend (Frontend Handoff)
- File Contract Zod cần lấy: `shared/contracts/xxx.ts`
- Cấu trúc `_actions` API trả về cho Server-Driven UI.

## 5. Exit Verification Results
- npm run build: ✅ 0 errors
- Domain purity: ✅ Clean
- Exception compliance: ✅ Clean
- Tenant isolation: ✅ All queries filtered
- Audit log: ✅ All fire-and-forget
```

**Lưu trữ:** Move thư mục sang `docs/history/`.

---

## 5. Cẩm nang Mẫu (Cheat Sheet & Mandatory Patterns)

### A. Database Schema (Drizzle)

```typescript
import { pgTable, bigserial, varchar, text, boolean, timestamp, integer, bigint } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { myStatusEnum } from './enums';

export const myEntities = pgTable('my_entities', {
  id:             bigserial('id', { mode: 'number' }).primaryKey(),
  organizationId: bigint('organization_id', { mode: 'number' }).notNull(),
  name:           varchar('name', { length: 255 }).notNull(),
  status:         myStatusEnum('status').notNull().default('ACTIVE'),
  metadata:       text('metadata'),
  createdAt:      timestamp('created_at').defaultNow().notNull(),
  updatedAt:      timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  orgIdx:    uniqueIndex('idx_my_entities_org_name').on(t.organizationId, t.name),
  statusIdx: index('idx_my_entities_status').on(t.organizationId, t.status),
}));
```

### B. pgEnum

```typescript
import { pgEnum } from 'drizzle-orm/pg-core';
export const myStatusEnum = pgEnum('my_status_enum', ['ACTIVE', 'INACTIVE', 'ARCHIVED']);
export type MyStatus = typeof myStatusEnum.enumValues[number];
```

### C. Domain Entity (Rich Domain Model)

```typescript
export interface MyEntityProps {
  id?: number;
  organizationId: number;
  name: string;
  status: MyStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MyEntity {
  private _id?: number;
  private _organizationId: number;
  private _name: string;
  private _status: MyStatus;
  private _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(props: MyEntityProps) {
    this._id = props.id;
    this._organizationId = props.organizationId;
    this._name = props.name;
    this._status = props.status ?? 'ACTIVE';
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id() { return this._id; }
  get organizationId() { return this._organizationId; }
  get name() { return this._name; }
  get status() { return this._status; }

  archive(): void {
    if (this._status === 'ARCHIVED') {
      throw new BusinessRuleValidationException('Entity đã bị lưu trữ.');
    }
    this._status = 'ARCHIVED';
    this._updatedAt = new Date();
  }

  rename(newName: string): void {
    if (!newName?.trim()) {
      throw new BusinessRuleValidationException('Tên không được để trống.');
    }
    this._name = newName.trim();
    this._updatedAt = new Date();
  }
}
```

### D. Repository Interface (Port + DI Token)

```typescript
export const IMyEntityRepository = Symbol('IMyEntityRepository');

export interface IMyEntityRepository {
  findById(id: number, orgId: number): Promise<MyEntity | null>;
  findAll(filters: MyEntityFilters, orgId: number): Promise<PaginatedResult<MyEntity>>;
  save(entity: MyEntity, tx?: Transaction): Promise<MyEntity>;
  delete(id: number, tx?: Transaction): Promise<void>;
}
```

### E. Mapper

```typescript
type MyEntityRecord = InferSelectModel<typeof myEntities>;

export class MyEntityMapper {
  static toDomain(record: MyEntityRecord): MyEntity {
    return new MyEntity({
      id:             record.id,
      organizationId: record.organizationId,
      name:           record.name,
      status:         record.status,
      createdAt:      record.createdAt,
      updatedAt:      record.updatedAt,
    });
  }

  static toPersistence(entity: MyEntity): Omit<MyEntityRecord, 'id' | 'createdAt'> {
    return {
      organizationId: entity.organizationId,
      name:           entity.name,
      status:         entity.status,
      updatedAt:      new Date(),
    };
  }
}
```

### F. Repository Implementation

```typescript
@Injectable()
export class DrizzleMyEntityRepository
  extends DrizzleBaseRepository
  implements IMyEntityRepository
{
  async findById(id: number, orgId: number): Promise<MyEntity | null> {
    const db = this.getDb();
    const result = await db
      .select()
      .from(myEntities)
      .where(and(eq(myEntities.id, id), eq(myEntities.organizationId, orgId)))
      .limit(1);
    return result[0] ? MyEntityMapper.toDomain(result[0]) : null;
  }

  async save(entity: MyEntity, tx?: Transaction): Promise<MyEntity> {
    const db = this.getDb(tx);
    const data = MyEntityMapper.toPersistence(entity);
    if (entity.id) {
      await db
        .update(myEntities)
        .set(this.mapToUpdate(data))
        .where(eq(myEntities.id, entity.id));
      return entity;
    }
    const [inserted] = await db.insert(myEntities).values(data).returning();
    return MyEntityMapper.toDomain(inserted);
  }
}
```

### G. Application Service (Orchestration Only)

```typescript
@Injectable()
export class MyEntityService {
  constructor(
    @Inject(IMyEntityRepository) private readonly repo: IMyEntityRepository,
    @Inject('ITransactionManager') private readonly txManager: ITransactionManager,
    @Inject('IEventBus') private readonly eventBus: IEventBus,
  ) {}

  async create(dto: CreateMyEntityDto, orgId: number): Promise<MyEntity> {
    const existing = await this.repo.findByName(dto.name, orgId);
    if (existing) {
      throw new BusinessRuleValidationException(`Tên "${dto.name}" đã tồn tại.`);
    }
    const saved = await this.txManager.runInTransaction(async (tx) => {
      const entity = new MyEntity({ organizationId: orgId, name: dto.name, status: 'ACTIVE' });
      return this.repo.save(entity, tx);
    });
    // Domain Event publish SAU transaction
    this.auditLog.log({ ... }).catch(() => {});
    await this.eventBus.publish(new MyEntityCreatedEvent(saved));
    return saved;
  }
}
```

### H. Module Wiring

```typescript
@Module({
  controllers: [MyEntityController],
  providers: [
    MyEntityService,
    { provide: IMyEntityRepository, useClass: DrizzleMyEntityRepository },
  ],
  exports: [MyEntityService, IMyEntityRepository],
})
export class MyEntityModule {}
```

### I. Public API (index.ts)

```typescript
export * from './application/dtos/my-entity.dto';
export * from './application/ports/my-entity-service.port';
export { MyEntityModule } from './my-entity.module';
```

---

## 6. Hiến pháp Hệ thống (Do This, NOT That)

| Lĩnh vực | ❌ CẤM LÀM | ✅ BẮT BUỘC LÀM |
|:---|:---|:---|
| **Domain Purity** | Import `@nestjs/common`, Drizzle vào Domain Entity | Domain Entity chỉ dùng TypeScript thuần |
| **DI Token** | `@Inject(DrizzleMyEntityRepository)` (inject class) | `@Inject(IMyEntityRepository)` (inject Symbol) |
| **Shared Contracts** | Để DTO rải rác trong `src/modules/...` | BẮT BUỘC định nghĩa Zod Schema tại `shared/contracts/` |
| **Exception** | Throw `NotFoundException`, `BadRequestException` trong Service/Domain | Throw `EntityNotFoundException`, `BusinessRuleValidationException` từ `@core/shared` |
| **Transaction** | Truyền `tx` thủ công, tự gọi `db.transaction()` | Bọc logic trong `txManager.runInTransaction()` |
| **Audit Log** | `await this.auditLog.log(...)` trong transaction | `this.auditLog.log(...).catch(() => {})` — fire-and-forget |
| **Domain Event** | Publish event TRONG `runInTransaction()` | Publish event SAU khi transaction hoàn tất |
| **Update Safety** | `.set(fullEntityData)` — ghi đè cả `id`, `createdAt` | `.set(this.mapToUpdate(data))` — bảo vệ immutable fields |
| **Cross-module** | Import `DrizzleLeadRepository` vào `FinoteService` | Inject `ILeadRepository` (Port/Interface) thông qua DI |
| **Tenant Isolation** | `?orgId=xxx` từ Query String để filter data | Lấy `organizationId` từ `currentUser` trong JWT/Session |
| **Status Logic** | `if (status === 'PENDING') allowApprove = true` trong Controller | Tính `_actions` trong DTO Mapper dựa trên Entity state + User role |
| **Enum** | `status: string` — lưu text tự do | `status: pgEnum(...)` — ràng buộc cứng ở DB level |
| **Entity Leak** | Return raw Drizzle record trực tiếp từ Controller | Luôn qua Mapper → Domain Entity → Response DTO |

---

## 7. Tiêu chí Nghiệm thu (Strict Exit Criteria)

```
[ ] Exit Verification: Tất cả 5 lệnh grep/build đã chạy và paste kết quả thực tế
[ ] TypeScript: npm run build pass — 0 error, 0 `any`
[ ] Domain Purity: grep trống
[ ] Tenant Isolation: Mọi query đều có organizationId filter
[ ] Immutable Fields: Mọi UPDATE dùng mapToUpdate()
[ ] Exception Compliance: Không có framework exception trong domain/application
[ ] Audit Log Fire-and-forget: Mọi auditLog.log() đều có .catch(()=>{})
[ ] Shared Contracts: Mọi Request/Response quan trọng có schema tại shared/contracts/
[ ] Unit Test: Service spec pass với mocked repositories
[ ] Integration Test: Repository spec pass trên PGLite
[ ] Console sạch: Không có console.error/warn khi chạy test
[ ] Walkthrough: 03_be_walkthrough.md đã xuất đúng template với Exit Verification Results
```
