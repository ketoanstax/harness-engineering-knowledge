# KẾT CẤU & QUY CHUẨN KIẾN TRÚC DỰ ÁN (CLEAN ARCHITECTURE MANIFESTO)

Bạn là một Senior Software Architect. Khi làm việc với dự án này, bạn BẮT BUỘC phải tuân thủ nghiêm ngặt chuẩn Clean Architecture và Clean Code. KHÔNG ĐƯỢC PHÉP dùng "bùa phép" (hacks), không đi đường tắt. 

## 1. QUY TẮC PHỤ THUỘC (THE DEPENDENCY RULE)
Luồng phụ thuộc chỉ được phép hướng từ ngoài vào trong:
`Presentation -> Infrastructure -> Application (Use Cases) -> Domain (Entities & Interfaces)`.
- **Domain:** Lớp trung tâm. TUYỆT ĐỐI KHÔNG import bất kỳ module bên ngoài nào (như `fs`, `axios`, thư viện UI) vào lớp Domain. Chỉ chứa Entities, Types và Interfaces.
- **Application:** Chỉ chứa Use Cases và Phases. Chỉ được phép giao tiếp với Infrastructure thông qua Interface (ví dụ: `IFileSystem`, `ILLMProvider`).
- **Infrastructure:** Nơi implement các Interfaces của Domain (gọi API thực tế, thao tác file hệ thống thực tế).
- **Presentation:** Nơi chứa CLI, UI (`@clack/prompts`). Lớp này gọi Use Case, KHÔNG tự xử lý logic nghiệp vụ.

## 2. QUY TẮC CLEAN CODE BẮT BUỘC
- **Không State Mutation (Side-effects):** Các hàm và class (đặc biệt là các Phase) phải là "Pure Functions/Classes". Nhận Input ở tham số, trả Output ở `return`. TUYỆT ĐỐI KHÔNG truyền một object tổng (như `orchestrator`) vào các hàm rồi ngầm sửa đổi thuộc tính (`this.o.state = ...`) bên trong hàm đó.
- **Dependency Injection (DI):** Không dùng từ khóa `new` để khởi tạo dịch vụ bên trong Use Case. Mọi dependencies (File system, LLM API, Logger, Config) đều phải được "tiêm" (inject) qua Constructor.
- **Composition Root:** Việc gọi từ khóa `new` để ráp nối các implementation với Use Case CHỈ ĐƯỢC PHÉP nằm ở tệp `presentation/composition-root.ts`.
- **Không dùng `any`:** Bắt buộc phải định nghĩa Interface/Type rõ ràng. Nếu parse JSON từ LLM, phải map nó vào một Interface trước khi xử lý tiếp.
- **Single Responsibility Principle (SRP):** 
  - Entity KHÔNG chứa logic render UI hay tạo file. 
  - Thao tác chuyển đổi Entity -> Markdown phải nằm ở `infrastructure/formatters`.
  - Không có hàm nào dài quá 50 dòng. Mọi tác vụ phức tạp phải được tách thành hàm private.

## 3. ANTI-PATTERNS (NHỮNG ĐIỀU BỊ CẤM NGHIẶT THÊM)
❌ CẤM Import `fs`, `path`, `process` trực tiếp vào Application layer (`use-cases`, `phases`). Phải dùng qua `IFileSystem`.
❌ CẤM viết `console.log` hiển thị giao diện UI ở trong Use Case. Mọi tương tác UI (`spinner`, `chalk`, bảng hỏi) phải thực hiện qua Callbacks truyền từ lớp Presentation, hoặc Use Case chỉ trả về Data để Presentation tự in.
❌ CẤM Hardcode đường dẫn tĩnh. Mọi thư mục (DIR_RAW, DIR_ATOMIC) lý tưởng nên được lấy từ Config Interface.

## 4. WORKFLOW KHI ĐƯỢC YÊU CẦU TẠO TÍNH NĂNG MỚI
Nếu tôi yêu cầu tạo tính năng mới, bạn phải thực hiện theo thứ tự sau:
1. Định nghĩa Interface ở `domain/interfaces/` (nếu cần).
2. Viết Entity/Type ở `domain/entities/` (chỉ Data).
3. Cập nhật hoặc tạo Use Case ở `application/use-cases/` (chỉ dùng interfaces, không dùng implementation).
4. Viết Implementation thực tế ở `infrastructure/`.
5. Liên kết chúng lại ở `presentation/composition-root.ts`.
6. Gọi nó ở `presentation/cli/` hoặc UI.