import * as process from 'node:process';
import Anthropic from '@anthropic-ai/sdk';

export class LLMClient {
  private apiProvider: 'anthropic' | 'openai' | 'gemini' | 'mock';
  private apiKey?: string;
  private model: string;
  private baseUrl: string;
  private anthropicClient?: Anthropic;

  constructor() {
    const anthropicKey = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY;

    if (anthropicKey) {
      this.apiProvider = 'anthropic';
      this.apiKey = anthropicKey;
      this.model = process.env.ANTHROPIC_MODEL || 'KhaBoDo_1.0';
      this.baseUrl = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1').replace(/\/+$/, '');

      this.anthropicClient = new Anthropic({
        apiKey: this.apiKey,
        baseURL: this.baseUrl,
      });

      console.log('🤖 Đã phát hiện cấu hình Anthropic/9router Gateway:');
      console.log(`   Model: ${this.model}`);
      console.log(`   Base URL: ${this.baseUrl}`);
    } else if (process.env.OPENAI_API_KEY) {
      this.apiProvider = 'openai';
      this.apiKey = process.env.OPENAI_API_KEY;
      this.model = process.env.OPENAI_MODEL || 'gpt-4o';
      this.baseUrl = 'https://api.openai.com/v1';
      console.log(`🤖 Đã phát hiện cấu hình OpenAI: Model: ${this.model}`);
    } else if (process.env.GEMINI_API_KEY) {
      this.apiProvider = 'gemini';
      this.apiKey = process.env.GEMINI_API_KEY;
      this.model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
      this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
      console.log(`🤖 Đã phát hiện cấu hình Gemini: Model: ${this.model}`);
    } else {
      this.apiProvider = 'mock';
      this.model = 'mock-model';
      this.baseUrl = 'mock-url';
      console.log('⚠️ Cảnh báo: Không phát hiện API key (Anthropic/OpenAI/Gemini).');
      console.log('   Hệ thống chạy ở chế độ giả lập thông minh (MOCK MODE).');
    }
  }

  async generate(prompt: string, systemPrompt = '', responseJson = false): Promise<string> {
    if (this.apiProvider === 'mock') {
      return this.mockGenerate(prompt, responseJson);
    }

    if (this.apiProvider === 'anthropic') {
      return this.callAnthropic(prompt, systemPrompt, responseJson);
    } else if (this.apiProvider === 'openai') {
      return this.callOpenai(prompt, systemPrompt, responseJson);
    } else if (this.apiProvider === 'gemini') {
      return this.callGemini(prompt, systemPrompt, responseJson);
    }

    return '';
  }

  private async callAnthropic(prompt: string, systemPrompt: string, responseJson: boolean): Promise<string> {
    if (!this.anthropicClient) {
      throw new Error('Anthropic client is not initialized');
    }

    let promptContent = prompt;
    if (responseJson) {
      promptContent += '\n\nIMPORTANT: Return ONLY a valid JSON object. Do not include markdown code block syntax (like ```json) in your final response.';
    }

    try {
      const response = await this.anthropicClient.messages.create({
        model: this.model,
        max_tokens: 4000,
        stream: false,
        system: systemPrompt || undefined,
        messages: [{ role: 'user', content: promptContent }],
      });

      // Anthropic trả về nội dung text
      if (response.content && response.content[0] && response.content[0].type === 'text') {
        return response.content[0].text.trim();
      }

      throw new Error('Unsupported response type from Anthropic');
    } catch (error) {
      console.error(`❌ Lỗi gọi API Anthropic Gateway:`, error);
      throw error;
    }
  }

  private async callOpenai(prompt: string, systemPrompt: string, responseJson: boolean): Promise<string> {
    const url = `${this.baseUrl}/chat/completions`;
    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const payload: any = {
      model: this.model,
      messages,
      max_tokens: 3000,
    };

    if (responseJson) {
      payload.response_format = { type: 'json_object' };
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result: any = await res.json();
      return result.choices[0].message.content.trim();
    } catch (error) {
      console.error('❌ Lỗi gọi API OpenAI:', error);
      throw error;
    }
  }

  private async callGemini(prompt: string, systemPrompt: string, responseJson: boolean): Promise<string> {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
    const payload: any = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    if (systemPrompt) {
      payload.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    if (responseJson) {
      payload.generationConfig = { responseMimeType: 'application/json' };
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result: any = await res.json();
      return result.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      console.error('❌ Lỗi gọi API Gemini:', error);
      throw error;
    }
  }

  private mockGenerate(prompt: string, responseJson: boolean): string {
    const promptLower = prompt.toLowerCase();
    const currentSlug = process.env.CURRENT_MRP_SOURCE_SLUG || '';

    // =====================================================================
    // 📂 HỒ SƠ 1: LECTURE 14 (BLAST RADIUS ADVANCED)
    // =====================================================================
    if (currentSlug.includes('lecture-14')) {
      // Planner 14
      if (promptLower.includes('kỹ sư trưởng')) {
        return JSON.stringify({
          new_nodes: [
            {
              slug: 'blast-radius-isolation',
              title: 'Blast Radius Isolation - Cô lập rủi ro thực thi của Agent',
              category: 'Guardrails & Safety',
              tags: ['blast-radius', 'sandbox', 'isolation'],
              definition: 'Cô lập cứng môi trường thực thi của Agent sử dụng container hoặc worktree để giới hạn phạm vi ảnh hưởng phá hoại.',
              principles: [
                'Dựng container dùng một lần cho các tác vụ nhạy cảm.',
                'Giới hạn tài nguyên phần cứng để chống Agent lặp vô tận.'
              ],
              parent: 'agent-overreach',
              children: [],
              causal_core: 'agent-overreach',
              causal_supporting: ['clean-state'],
              causal_derivative: ['token-load-control']
            }
          ],
          merge_nodes: [],
          reasoning: 'Tạo nốt mới Blast Radius Isolation để bổ trợ cho nốt agent-overreach.'
        });
      }

      // Reducer 14
      if (promptLower.includes('lead architect')) {
        return JSON.stringify({
          conflicts: [],
          new_concepts: [
            {
              name: 'Blast Radius Isolation',
              suggested_slug: 'blast-radius-isolation',
              definition: 'Cô lập cứng môi trường thực thi của Agent để bảo toàn hệ thống.'
            }
          ]
        });
      }

      // Mapper 14 (mặc định)
      return JSON.stringify({
        title: 'Bản chắt lọc tự động - Lecture 14',
        key_takeaways: [
          'Blast Radius Isolation cô lập cứng rủi ro hoạt động của Agent.',
          'Sandbox Containerization cô lập môi trường thực thi cục bộ.'
        ],
        keywords: [
          { name: 'Blast Radius Isolation', definition: 'Cô lập cứng môi trường thực thi của Agent để bảo toàn hệ thống.' }
        ],
        summary: 'Bài giảng trình bày các nguyên lý nâng cao để kiểm soát blast radius.'
      });
    }

    // =====================================================================
    // 📂 HỒ SƠ 2: LECTURE 15 (TOKEN BUDGET UNDER LARGE LOAD)
    // =====================================================================
    else if (currentSlug.includes('lecture-15')) {
      // Planner 15
      if (promptLower.includes('kỹ sư trưởng')) {
        return JSON.stringify({
          new_nodes: [
            {
              slug: 'token-load-control',
              title: 'Token Load Control - Kiểm soát tải token',
              category: 'Cognitive Management',
              tags: ['token-budget', 'load-control'],
              definition: 'Cơ chế quản lý tải token bằng cách giới hạn số lượng request API tối đa trong một phiên.',
              principles: [
                'Tự động ngắt kết nối nếu Agent gọi API liên tục vượt ngưỡng cho phép.',
                'Giới hạn Token budget cứng theo cấu hình.'
              ],
              parent: 'token-budget',
              children: [],
              causal_core: 'token-budget',
              causal_supporting: ['blast-radius-isolation'],
              causal_derivative: []
            }
          ],
          merge_nodes: [
            {
              slug: 'blast-radius-isolation',
              updated_definition: 'Cô lập cứng môi trường thực thi của Agent và giới hạn request mạng để đồng thời bảo toàn Token Budget.',
              added_principles: [
                'Giới hạn request mạng tối đa ở Sandbox để tránh rò rỉ token.'
              ],
              added_children: ['token-load-control'],
              updated_causal_derivative: ['token-load-control']
            }
          ],
          reasoning: 'Merge ý nghĩa bảo vệ token budget vào nốt blast-radius-isolation, và tạo nốt mới token-load-control nối cha với token-budget.'
        });
      }

      // Reducer 15
      if (promptLower.includes('lead architect')) {
        return JSON.stringify({
          conflicts: [
            {
              keyword: 'Blast Radius Isolation',
              existing_slug: 'blast-radius-isolation',
              action: 'merge',
              reason: 'Khái niệm này vừa được tạo bởi nốt blast-radius-isolation, cần merge thêm ý nghĩa quản trị token.'
            }
          ],
          new_concepts: [
            {
              name: 'Token Load Control',
              suggested_slug: 'token-load-control',
              definition: 'Kiểm soát tải token bằng cách giới hạn request API tối đa của Agent.'
            }
          ]
        });
      }

      // Mapper 15
      return JSON.stringify({
        title: 'Bản chắt lọc tự động - Lecture 15',
        key_takeaways: [
          'Token Budget của Agent dễ bị cạn kiệt khi tải lớn.',
          'Blast Radius Isolation lớp mạng lưới giúp bảo vệ ngân sách token.'
        ],
        keywords: [
          { name: 'Blast Radius Isolation', definition: 'Cô lập cứng môi trường thực thi của Agent để bảo toàn hệ thống.' },
          { name: 'Token Load Control', definition: 'Kiểm soát tải token bằng cách giới hạn request API tối đa của Agent.' }
        ],
        summary: 'Bài giảng phân tích cách quản trị token budget dưới tải lớn.'
      });
    }

    // =====================================================================
    // 📂 HỒ SƠ 3: LECTURE 16 (CAUSAL WEB VISUALIZATION)
    // =====================================================================
    else if (currentSlug.includes('lecture-16')) {
      // Planner 16
      if (promptLower.includes('kỹ sư trưởng')) {
        return JSON.stringify({
          new_nodes: [
            {
              slug: 'semantic-graph-visualization',
              title: 'Semantic Graph Visualization - Trực quan hóa đồ thị ngữ nghĩa phẳng',
              category: 'Workflow Architecture',
              tags: ['graph-view', 'visualization', 'causal-web'],
              definition: 'Trực quan hóa đồ thị ngữ nghĩa thông qua các mối liên kết markdown phẳng và Causal Web.',
              principles: [
                'Sử dụng Obsidian Graph View để theo dõi vết liên kết.',
                'Phát hiện nhanh các nốt mồ côi (orphan nodes) bằng đồ thị trực quan.'
              ],
              parent: 'three-tier-memory-architecture',
              children: [],
              causal_core: 'three-tier-memory-architecture',
              causal_supporting: [],
              causal_derivative: []
            }
          ],
          merge_nodes: [],
          reasoning: 'Tạo nốt mới Semantic Graph Visualization để bổ trợ trực quan.'
        });
      }

      // Reducer 16
      if (promptLower.includes('lead architect')) {
        return JSON.stringify({
          conflicts: [],
          new_concepts: [
            {
              name: 'Semantic Graph Visualization',
              suggested_slug: 'semantic-graph-visualization',
              definition: 'Trực quan đồ thị ngữ nghĩa qua các mối liên kết phẳng.'
            }
          ]
        });
      }

      // Mapper 16
      return JSON.stringify({
        title: 'Bản chắt lọc tự động - Lecture 16',
        key_takeaways: [
          'Trực quan hóa Causal Web phẳng qua Obsidian Graph View.',
          'Semantic Graph Visualization hỗ trợ kiểm soát vết tiến hóa.'
        ],
        keywords: [
          { name: 'Semantic Graph Visualization', definition: 'Trực quan đồ thị ngữ nghĩa qua các mối liên kết phẳng.' }
        ],
        summary: 'Bài giảng trình bày cách trực quan hóa mạng lưới đồ thị phẳng.'
      });
    }

    // =====================================================================
    // 📂 LECTURE 13: DEFAULT (global-context-loss / no-accumulation)
    // =====================================================================
    else {
      // Planner 13
      if (promptLower.includes('kỹ sư trưởng')) {
        return JSON.stringify({
          new_nodes: [
            {
              slug: 'global-context-loss',
              title: 'Global Context Loss - Mất bối cảnh tổng thể trong Vector DB',
              category: 'Harness Core Concept',
              tags: ['global-context-loss', 'vector-db', 'context-fragmentation'],
              definition: 'Vector Database cắt tài liệu thành các chunk nhỏ khiến AI Agent không thể nhìn thấy cấu trúc tổng thể của tài liệu.',
              principles: [
                'MRP Pipeline khắc phục bằng cách biên dịch tài liệu thành cây tri thức phẳng thay vì chunk rời rạc.',
                'Backlinks trực tiếp trỏ về dòng, trang cụ thể đảm bảo khả năng truy vết.'
              ],
              parent: 'harness-definition',
              children: [],
              causal_core: 'system-of-record',
              causal_supporting: ['feature-list-primitive'],
              causal_derivative: ['five-harness-principles']
            },
            {
              slug: 'no-accumulation',
              title: 'No Accumulation - Hệ quả không tích lũy tri thức',
              category: 'Harness Core Concept',
              tags: ['no-accumulation', 'knowledge-merge', 'consistency'],
              definition: 'Khi tài liệu thay đổi, VectorDB chỉ chèn thêm vector mới thay vị hợp nhất tri thức, dẫn đến mâu thuẫn.',
              principles: [
                'Cơ chế MRP Merge thay thế ghi đè, luôn trộn (merge) kiến thức mới vào nốt cũ.',
                'Phát hiện xung đột ngữ nghĩa tự động bằng Reducer.'
              ],
              parent: 'global-context-loss',
              children: [],
              causal_core: 'clean-state',
              causal_supporting: ['compaction-strategy'],
              causal_derivative: ['session-continuity']
            }
          ],
          merge_nodes: [
            {
              slug: 'early-victory',
              updated_definition: 'Ngăn chặn Agent tự mãn tuyên bố thành công sớm và mở rộng thêm khả năng phát hiện ảo tưởng ngữ nghĩa (hallucinations) từ các nguồn dữ liệu phân mảnh.',
              added_principles: [
                'Mở rộng phát hiện: Không chỉ tuyên bố thành công sớm, Agent còn ảo tưởng khi đọc các chunk dữ liệu rời rạc.'
              ],
              added_children: ['global-context-loss'],
              updated_causal_derivative: ['global-context-loss', 'no-accumulation']
            }
          ],
          reasoning: 'Tài liệu mới nhấn mạnh 3 điểm mù của VectorDB: 1) Global Context Loss, 2) No Accumulation, 3) Uncontrolled Hallucination. Điểm 3 (Hallucination) đã được mô tả một phần trong nốt early-victory nên chúng tôi MERGE vào đó. Hai khái niệm còn lại hoàn toàn mới nên tạo nốt mới, nối parent với harness-definition và clean-state.'
        });
      }

      // Reducer 13
      if (promptLower.includes('lead architect')) {
        return JSON.stringify({
          conflicts: [
            {
              keyword: 'Hallucinations',
              existing_slug: 'early-victory',
              action: 'merge',
              reason: 'Khái niệm ảo tưởng (hallucinations) liên quan đến lỗi tự mãn tuyên bố thành công sớm (early victory).'
            }
          ],
          new_concepts: [
            {
              name: 'Global Context Loss',
              suggested_slug: 'global-context-loss',
              definition: 'Mất bối cảnh tổng thể khi AI chỉ nhận các đoạn vụn rời rạc từ Vector DB.'
            },
            {
              name: 'No Accumulation',
              suggested_slug: 'no-accumulation',
              definition: 'Hệ thống không tích lũy tri thức, dẫn đến mâu thuẫn giữa dữ liệu cũ và mới.'
            }
          ]
        });
      }

      // Mapper 13
      return JSON.stringify({
        title: 'Bản chắt lọc tự động - Lecture 13',
        key_takeaways: [
          'MRP Pipeline chuyển hóa tài liệu thô thành cây tri thức đồ thị phẳng.',
          'Vector Database bị 3 điểm mù: global context loss, no accumulation, hallucinations.',
          'Mỗi nốt nguyên tử có parent/children và Causal Web để truy vết nguồn gốc.'
        ],
        keywords: [
          { name: 'Global Context Loss', definition: 'Mất bối cảnh tổng thể do AI chỉ nhận các đoạn vụn rời rạc.' },
          { name: 'No Accumulation', definition: 'Không tích lũy được tri thức, dữ liệu cũ và mới dễ mâu thuẫn.' },
          { name: 'Uncontrolled Hallucinations', definition: 'AI không thể truy vết ngược dòng dẫn chứng.' }
        ],
        summary: 'Bài giảng phân tích lý do MRP Pipeline chiến thắng Vector Database và đề xuất quy trình gồm 6 pha xử lý song song.'
      });
    }
  }
}
