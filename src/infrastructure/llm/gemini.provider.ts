import type { ILLMProvider } from '../../domain/interfaces/llm-provider.interface.ts';

export class GeminiProvider implements ILLMProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl: string, model: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generate(prompt: string, systemPrompt = '', responseJson = false): Promise<string> {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const result: any = await res.json();
      return result.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      console.error('❌ Lỗi gọi API Gemini:', error);
      throw error;
    }
  }
}
