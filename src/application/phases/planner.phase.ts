import type { ILLMProvider } from '../../domain/interfaces/llm-provider.interface.ts';
import type { IConfigProvider } from '../../domain/interfaces/config-provider.interface.ts';
import { type MappedData, type ReducedData, type PlanResult, type NewNodeOutput, type MergeNodeOutput, PlanResultSchema } from './_types.ts';
import { extractJson } from './_utils.ts';

export class PlannerPhase {
  private llm: ILLMProvider;
  private config: IConfigProvider;

  constructor(llm: ILLMProvider, config: IConfigProvider) {
    this.llm = llm;
    this.config = config;
  }

  async execute(reducedData: ReducedData, mappedData: MappedData): Promise<PlanResult> {
    const conflicts = reducedData.conflicts || [];
    const newConcepts = reducedData.new_concepts || [];
    const categories = this.config.loadCategories();
    const categoriesStr = categories.map(c => c.name).join(' / ');

    console.log('  🔄 Đang thiết kế chi tiết các nốt và cấu trúc đồ thị nhân quả...');

    try {
      const llmPrompt = `Bạn là Kỹ sư trưởng thiết kế hệ thống Harness.
Chúng tôi cần thiết kế chi tiết nội dung markdown cho các hành động sau:
- Khái niệm tạo mới: ${JSON.stringify(newConcepts)}
- Khái niệm cần cập nhật/trộn vào nốt cũ: ${JSON.stringify(conflicts)}

Yêu cầu thiết kế:
1. Nốt mới phải định rõ parent (slug), children (danh sách slug), và cấu trúc causal_web (causal_core: slug, supporting_conditions: [slugs], derivative_effects: [slugs]).
2. Mọi nốt đều được đặt phẳng trong 02_atomic_nodes/ và chỉ chứa Workspace-relative links.
3. Nội dung phải sắc bén, ngắn gọn, tuân thủ đúng định dạng Markdown nguyên tử.

Đầu ra bắt buộc (JSON):
{
  "new_nodes": [
    {
      "slug": "slug-nốt-mới (không chứa HAE-concept-)",
      "title": "Tiêu đề nốt",
      "category": "${categoriesStr}",
      "tags": ["tag1", "tag2"],
      "definition": "Định nghĩa sâu sắc nhất (2-3 câu)",
      "principles": [
        "Nguyên lý thực tế 1",
        "Nguyên lý thực tế 2"
      ],
      "parent": "slug-nốt-cha-hoặc-null",
      "children": ["slugs-nốt-con-nếu-có"],
      "causal_core": "slug-nhân-gốc",
      "causal_supporting": ["slug-duyên-hỗ-trợ"],
      "causal_derivative": ["slug-quả-kế-thừa"]
    }
  ],
  "merge_nodes": [
    {
      "slug": "slug-nốt-cũ",
      "updated_definition": "Định nghĩa mới sau khi gộp kiến thức mới (hoặc null)",
      "added_principles": ["Nguyên lý kỹ thuật mới bổ sung"],
      "added_children": ["slug-nốt-con-mới-bổ-sung-nếu-có"],
      "updated_causal_derivative": ["slugs-nốt-quả-mới-phát-sinh"]
    }
  ],
  "reasoning": "Luận giải chi tiết lý do tổ chức cây tri thức như thế này."
}`;

      const response = await this.llm.generate(llmPrompt, '', true);
      const rawJson = extractJson(response);
      const parsed = PlanResultSchema.parse(rawJson);

      const newNodes: NewNodeOutput[] = parsed.new_nodes.map((nn) => ({
        slug: nn.slug,
        title: nn.title,
        category: nn.category,
        tags: nn.tags,
        definition: nn.definition,
        principles: nn.principles,
        parent: nn.parent,
        children: nn.children,
        causal_core: nn.causal_core,
        causal_supporting: nn.causal_supporting,
        causal_derivative: nn.causal_derivative,
      }));

      const mergeNodes: MergeNodeOutput[] = parsed.merge_nodes.map((mn) => ({
        slug: mn.slug,
        updated_definition: mn.updated_definition,
        added_principles: mn.added_principles,
        added_children: mn.added_children,
        updated_causal_derivative: mn.updated_causal_derivative,
      }));

      console.log('  ✅ Đã thiết kế xong cấu trúc chi tiết bằng LLM.');
      return { new_nodes: newNodes, merge_nodes: mergeNodes, reasoning: parsed.reasoning };
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      console.log(`  ⚠️ Lỗi thiết kế LLM: ${err}. Tạo plan cơ bản...`);
      return this.fallbackPlan(newConcepts);
    }
  }

  private fallbackPlan(newConcepts: ReducedData['new_concepts']): PlanResult {
    const newNodes: NewNodeOutput[] = newConcepts.map(nc => ({
      slug: nc.suggested_slug,
      title: nc.name,
      category: 'Harness Core Concept',
      tags: ['concept'],
      definition: nc.definition || `Định nghĩa cho ${nc.name}`,
      principles: ['Nguyên lý 1 của khái niệm này.', 'Nguyên lý 2 của khái niệm này.'],
      parent: undefined,
      children: [],
      causal_supporting: [],
      causal_derivative: [],
    }));

    return {
      new_nodes: newNodes,
      merge_nodes: [],
      reasoning: 'Hệ thống tự tạo plan cơ bản do không kết nối được LLM.',
    };
  }
}
