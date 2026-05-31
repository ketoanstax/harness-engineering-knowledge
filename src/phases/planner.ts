import * as fs from 'node:fs';
import * as path from 'node:path';
import { PlanFile } from '../models/plan.ts';

export class PhasePlanner {
  private o: any;

  constructor(orchestrator: any) {
    this.o = orchestrator;
  }

  async execute(): Promise<boolean> {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📋  Phase P - PLANNER: Thiết kế và xuất bản kế hoạch`);
    console.log(`${'='.repeat(50)}`);

    const reducedData = this.o.state.reduced_data;
    const mappedData = this.o.state.mapped_data;
    if (!reducedData || !mappedData) {
      console.log('❌ Lỗi: Không tìm thấy dữ liệu Reducer/Mapper.');
      return false;
    }

    const conflicts = reducedData.conflicts || [];
    const newConcepts = reducedData.new_concepts || [];

    console.log('  🔄 Đang thiết kế chi tiết các nốt và cấu trúc đồ thị nhân quả...');

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
      "category": "Harness Core Concept / Cognitive Management / Workflow Architecture / Guardrails & Safety / Verification",
      "tags": ["tag1", "tag2"],
      "definition": "Định nghĩa sâu sắc nhất (2-3 câu)",
      "principles": [
        "Nguyên lý thực tế 1",
        "Nguyên lý thực tế 2",
        "Nguyên lý thực tế 3"
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
}
`;

    const newNodesList: any[] = [];
    const mergeNodesList: any[] = [];
    let reasoning = '';

    try {
      const response = await this.o.llm.generate(llmPrompt, '', true);
      const parsed = JSON.parse(response);

      reasoning = parsed.reasoning || '';
      // Parse New Nodes
      for (const nn of (parsed.new_nodes || [])) {
        newNodesList.push({
          slug: nn.slug || '',
          title: nn.title || '',
          category: nn.category || 'Harness Core Concept',
          tags: nn.tags || [],
          definition: nn.definition || '',
          principles: nn.principles || [],
          parent: nn.parent || undefined,
          children: nn.children || [],
          causal_core: nn.causal_core || undefined,
          causal_supporting: nn.causal_supporting || [],
          causal_derivative: nn.causal_derivative || [],
        });
      }

      // Parse Merge Nodes
      for (const mn of (parsed.merge_nodes || [])) {
        mergeNodesList.push({
          slug: mn.slug || '',
          updated_definition: mn.updated_definition || undefined,
          added_principles: mn.added_principles || [],
          added_children: mn.added_children || [],
          updated_causal_derivative: mn.updated_causal_derivative || [],
        });
      }

      console.log('  ✅ Đã thiết kế xong cấu trúc chi tiết bằng LLM.');
    } catch (e: any) {
      console.log(`  ⚠️ Lỗi thiết kế LLM: ${e.message}. Tạo plan cơ bản...`);
      reasoning = 'Hệ thống tự tạo plan cơ bản do không kết nối được LLM.';
      // Fallback Plan
      for (const nc of newConcepts) {
        newNodesList.push({
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
        });
      }
    }

    // Tạo Plan File
    const planItem = {
      source_slug: this.o.sourceSlug,
      new_nodes: newNodesList,
      merge_nodes: mergeNodesList,
      depends_on: [],
      reasoning,
    };

    const planFile = new PlanFile({
      items: [planItem],
      planTimestamp: this.o.timestamp,
    });

    // Lưu Plan file xuống 05_journal
    const planMd = planFile.toMarkdownPreview();
    const filepath = planFile.filepath;
    fs.writeFileSync(filepath, planMd, 'utf-8');

    // Lưu trạng thái để phục vụ pha REFINE sau này
    this.o.state.plan_timestamp = this.o.timestamp;
    this.o.state.plan_item_data = {
      new_nodes: newNodesList,
      merge_nodes: mergeNodesList,
      reasoning,
    };

    console.log(`  ✅ Đã xuất bản kế hoạch tại: [${path.relative(this.o.vaultRoot || process.cwd(), filepath)}]`);
    return true;
  }
}
