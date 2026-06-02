import type { ILLMProvider, LLMResponse } from '../../domain/interfaces/llm-provider.interface.ts';

export class OpenAIProvider implements ILLMProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl: string, model: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generate(prompt: string, systemPrompt = '', responseJson = false): Promise<LLMResponse> {
    const url = `${this.baseUrl}/chat/completions`;
    const messages = systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }, { role: 'user' as const, content: prompt }]
      : [{ role: 'user' as const, content: prompt }];

    const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '3000', 10);
    const payload: any = { model: this.model, messages, max_tokens: maxTokens };
    if (responseJson) {
      payload.response_format = { type: 'json_object' };
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const result: any = await res.json();
      const content = result.choices[0].message.content.trim();
      const usage = result.usage ? {
        inputTokens: result.usage.prompt_tokens || 0,
        outputTokens: result.usage.completion_tokens || 0,
        totalTokens: result.usage.total_tokens || 0,
      } : undefined;

      return { content, usage };
    } catch (error) {
      console.error('❌ Lỗi gọi API OpenAI:', error);
      throw error;
    }
  }
}
