# Kế Hoạch Triển Khai: Tích Hợp Luật Động Vào Pipeline

Chúng ta tích hợp cơ chế nạp luật động từ các file hướng dẫn vào prompt gọi LLM.

## Các Thay Đổi Đã Lên Kế Hoạch

### 1. Thêm mới Helper
- **`src/application/phases/_rule-resolver.ts`**:
  Triển khai hàm `resolveRules(sourcePath, dirVault, fs)` hỗ trợ quét tìm `RULE.md`/`AGENTS.md` tại cấp Vault root và cấp Domain con.

### 2. Cập nhật Phases
- **`src/application/phases/_types.ts`**:
  Mở rộng `MappedDataSchema` để hỗ trợ lưu trữ thông tin luật có cấu trúc.
- **`src/application/phases/mapper.phase.ts`**:
  Nạp luật động và đưa vào prompt Mapper, đồng thời đính kèm luật vào kết quả trả về.
- **`src/application/phases/reducer.phase.ts`**:
  Kế thừa luật từ mapped data để chèn vào prompt phân tích trùng lặp.
- **`src/application/phases/planner.phase.ts`**:
  Kế thừa luật để chèn vào prompt sinh cấu trúc chi tiết nốt tri thức.

## Kế Hoạch Xác Thực
- Viết unit test cho resolver tại `tests/unit/application/rule-resolver.test.ts`.
- Đảm bảo compile TS và toàn bộ test suite chạy thành công.
