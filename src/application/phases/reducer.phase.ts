import type { ILLMProvider } from '../../domain/interfaces/llm-provider.interface.ts';
import { filterRelevantNodes } from '../../core/context-filter.ts';
import type { MappedData, ReducedData } from './_types.ts';

export class ReducerPhase {
  constructor(private llm: ILLMProvider) {}

  async execute(mappedData: MappedData): Promise<ReducedData> {
    const keywords = mappedData.keywords || [];

    if (keywords.length === 0) {
      console.log('  ⚠️ Không có keywords nào được trích xuất. Chuyển tiếp.');
      return { conflicts: [], new_concepts: [] };
    }

    // Active Context Filtering
    const relevantNodes = filterRelevantNodes(keywords, 12);
    console.log(`  🧠 Active Context: Chỉ chọn ${relevantNodes.length} nốt liên quan nhất để so khớp LLM.`);

    // Gọi LLM
    try {
      const llmPrompt = `Bạn là một Lead Architect chuyên gia về hệ thống tri thức.
Chúng tôi chuẩn bị nạp thêm các khái niệm mới vào kho tri thức, nhưng cần đảm bảo cấu trúc lưu trữ phẳng và không có trùng lặp (deduplication).

Các khái niệm liên quan hiện tại trong hệ thống:
${JSON.stringify(relevantNodes, null, 2)}

Các khái niệm mới muốn nạp thêm:
${JSON.stringify(keywords, null, 2)}

Nhiệm vụ:
So sánh đối đầu giữa các khái niệm MỚI và CŨ.
1. Nếu khái niệm mới trùng lặp hoặc thuộc phạm trù đã giải thích ở nốt cũ, xếp nó vào diện 'merge' (trộn/cập nhật nốt cũ).
2. Nếu khái niệm mới hoàn toàn mới, đề xuất tạo mới (new_concepts) và gợi ý slug phù hợp (viết thường, gạch ngang, vd: 'token-budget').

Đầu ra bắt buộc (JSON):
{
  "conflicts": [
    {
      "keyword": "Tên khái niệm mới",
      "existing_slug": "slug-nốt-cũ-bị-trùng",
      "action": "merge",
      "reason": "Giải thích chi tiết tại sao nên trộn"
    }
  ],
  "new_concepts": [
    {
      "name": "Tên khái niệm mới",
      "suggested_slug": "slug-mới-phù-hợp",
      "definition": "Định nghĩa tóm tắt"
    }
  ]
}`;

      const response = await this.llm.generate(llmPrompt, '', true);
      const parsed = JSON.parse(response);
      const result: ReducedData = {
        conflicts: parsed.conflicts || [],
        new_concepts: parsed.new_concepts || [],
      };

      console.log(`  ✅ Đã phát hiện ${result.conflicts.length} xung đột/cập nhật và ${result.new_concepts.length} nốt mới!`);
      return result;
    } catch (e: any) {
      console.log(`  ⚠️ Lỗi phân tích trùng lặp LLM: ${e.message}`);
      console.log('  ⏭️ Chuyển sang chế độ gộp mặc định (Tất cả tạo mới)...');

      const newConcepts = keywords.map(kw => {
        const name = kw.name || '';
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        return { name, suggested_slug: slug, definition: kw.definition || '' };
      });

      return { conflicts: [], new_concepts: newConcepts };
    }
  }
}
