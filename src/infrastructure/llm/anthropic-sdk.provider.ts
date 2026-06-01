import Anthropic from '@anthropic-ai/sdk';
import type { ILLMProvider, LLMResponse } from '../../domain/interfaces/llm-provider.interface.ts';

export class AnthropicSDKProvider implements ILLMProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, baseUrl: string, model: string) {
    this.client = new Anthropic({ apiKey, baseURL: baseUrl });
    this.model = model;
  }

  async generate(prompt: string, systemPrompt = '', responseJson = false): Promise<LLMResponse> {
    let promptContent = prompt;
    if (responseJson) {
      promptContent +=
        '\n\nIMPORTANT: Return ONLY a valid JSON object. Do not include markdown code block syntax (like ```json) in your final response.';
    }

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4000,
        system: systemPrompt || undefined,
        messages: [{ role: 'user', content: promptContent }],
        stream: false, // Tắt stream để dễ lấy usage trực tiếp từ response
      });

      const text = response.content
        .filter((c): c is Anthropic.TextBlock => c.type === 'text')
        .map(c => c.text)
        .join('')
        .trim();

      const usage = response.usage ? {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      } : undefined;

      return { content: text, usage };
    } catch (error: any) {
      console.error(`❌ Lỗi gọi API Anthropic SDK:`, error.message);
      throw error;
    }
  }
}
