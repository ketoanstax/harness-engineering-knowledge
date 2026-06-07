import type { INodeRepository } from '../../domain/interfaces/node-repository.interface.ts';
import type { ILLMProvider } from '../../domain/interfaces/llm-provider.interface.ts';
import type { DraftNode } from '../../domain/entities/learning.entity.ts';
import { LearningResult } from '../../domain/entities/learning.entity.ts';

export class LearningService {
  private confirmResolver: ((res: LearningResult) => void) | null = null;

  constructor(
    private repo: INodeRepository,
    private llm: ILLMProvider,
  ) {}

  async generateDraft(question: string, context: string[]): Promise<DraftNode> {
    const prompt = `Bạn là một trợ lý tri thức chuyên nghiệp. Hãy phân tích câu hỏi/truy vấn của người dùng: "${question}".
Hãy tạo lập một khái niệm mới (draft node) dưới dạng JSON có cấu trúc sau:
{
  "title": "Tên khái niệm ngắn gọn, súc tích (tiếng Việt có dấu)",
  "definition": "Định nghĩa ngắn gọn, chính xác và đầy đủ về khái niệm này (khoảng 2-3 câu)",
  "tags": ["danh-sach", "cac-the", "lien-quan"]
}
Chỉ trả về duy nhất chuỗi JSON hợp lệ, không thêm bất kỳ văn bản giải thích nào khác.`;

    const response = await this.llm.generate(prompt, 'Bạn là trợ lý tri thức chuyên nghiệp.', true);
    try {
      let content = response.content.trim();
      // Loại bỏ markdown block if present
      if (content.startsWith('```json')) {
        content = content.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (content.startsWith('```')) {
        content = content.replace(/^```/, '').replace(/```$/, '').trim();
      }
      const data = JSON.parse(content);
      return {
        title: data.title || question,
        definition: data.definition || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
      };
    } catch {
      // Fallback
      return {
        title: question,
        definition: `Khái niệm được tạo tự động cho câu hỏi: "${question}"`,
        tags: ['learning-draft'],
      };
    }
  }

  async awaitUserConfirmation(draft: DraftNode): Promise<LearningResult> {
    return new Promise((resolve) => {
      this.confirmResolver = resolve;
    });
  }

  resolveConfirmation(result: LearningResult): void {
    if (this.confirmResolver) {
      this.confirmResolver(result);
      this.confirmResolver = null;
    }
  }

  async saveDraft(draft: DraftNode): Promise<void> {
    await this.repo.add(draft);
  }
}
