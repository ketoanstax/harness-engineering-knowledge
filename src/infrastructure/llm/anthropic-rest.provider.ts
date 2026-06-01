import type { ILLMProvider } from '../../domain/interfaces/llm-provider.interface.ts';

export class AnthropicRESTProvider implements ILLMProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl: string, model: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  private parseStreamBody(rawBody: string): string {
    let text = '';
    const lines = rawBody.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const dataStr = trimmed.slice(5).trim();
      if (dataStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(dataStr);
        if (parsed.delta?.text) {
          text += parsed.delta.text;
        } else if (parsed.choices?.[0]?.delta?.content) {
          text += parsed.choices[0].delta.content;
        } else if (parsed.completion) {
          text += parsed.completion;
        }
      } catch {
        // Bỏ qua dòng lỗi parse JSON
      }
    }
    return text.trim() || rawBody.trim();
  }

  async generate(prompt: string, systemPrompt = '', responseJson = false): Promise<string> {
    const url = `${this.baseUrl}/messages`;
    const promptContent = responseJson
      ? prompt +
        '\n\nIMPORTANT: Return ONLY a valid JSON object. Do not include markdown code block syntax (like ```json) in your final response.'
      : prompt;

    const payload = {
      model: this.model,
      max_tokens: 4000,
      system: systemPrompt || undefined,
      messages: [{ role: 'user', content: promptContent }],
      stream: true,
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const rawText = await res.text();
      return this.parseStreamBody(rawText);
    } catch (error: any) {
      console.error(`❌ Lỗi gọi API Anthropic Gateway Direct:`, error.message);
      throw error;
    }
  }
}
