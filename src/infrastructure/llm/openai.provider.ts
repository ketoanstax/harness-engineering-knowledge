import type { ILLMProvider } from '../../domain/interfaces/llm-provider.interface.ts';

export class OpenAIProvider implements ILLMProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl: string, model: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generate(prompt: string, systemPrompt = '', responseJson = false): Promise<string> {
    const url = `${this.baseUrl}/chat/completions`;
    const messages = systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }, { role: 'user' as const, content: prompt }]
      : [{ role: 'user' as const, content: prompt }];

    const payload: any = { model: this.model, messages, max_tokens: 3000 };
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
      return result.choices[0].message.content.trim();
    } catch (error) {
      console.error('❌ Lỗi gọi API OpenAI:', error);
      throw error;
    }
  }
}
