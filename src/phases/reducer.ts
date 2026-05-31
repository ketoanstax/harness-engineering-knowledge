import { filterRelevantNodes } from '../core/context-filter.ts';

export class PhaseReducer {
  private o: any;

  constructor(orchestrator: any) {
    this.o = orchestrator;
  }

  async execute(): Promise<boolean> {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🗜️  Phase R - REDUCER: Phân tích trùng lặp và xung đột`);
    console.log(`${'='.repeat(50)}`);

    const mappedData = this.o.state.mapped_data;
    if (!mappedData) {
      console.log('❌ Lỗi: Không tìm thấy dữ liệu Mapper.');
      return false;
    }

    const keywords = mappedData.keywords || [];
    if (keywords.length === 0) {
      console.log('  ⚠️ Không có keywords nào được trích xuất. Chuyển tiếp.');
      this.o.state.reduced_data = { conflicts: [], new_concepts: [] };
      return true;
    }

    // 🔥 ÁP DỤNG ACTIVE CONTEXT FILTERING:
    const relevantNodes = filterRelevantNodes(keywords, 12);
    console.log(`  🧠 Active Context: Chỉ chọn ${relevantNodes.length} nốt liên quan nhất để so khớp LLM.`);

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
}
`;

    try {
      const response = await this.o.llm.generate(llmPrompt, '', true);
      const parsed = JSON.parse(response);
      this.o.state.reduced_data = parsed;
      console.log(`  ✅ Đã phát hiện ${(parsed.conflicts || []).length} xung đột/cập nhật và ${(parsed.new_concepts || []).length} nốt mới!`);
    } catch (e: any) {
      console.log(`  ⚠️ Lỗi phân tích trùng lặp LLM: ${e.message}`);
      console.log('  ⏭️ Chuyển sang chế độ gộp mặc định (Tất cả tạo mới)...');

      // Fallback mặc định: Tạo mới toàn bộ
      const newConcepts = keywords.map((kw: any) => {
        const name = kw.name || '';
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        return {
          name,
          suggested_slug: slug,
          definition: kw.definition || '',
        };
      });

      this.o.state.reduced_data = {
        conflicts: [],
        new_concepts: newConcepts,
      };
    }

    return true;
  }
}
