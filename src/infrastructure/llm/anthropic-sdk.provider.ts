import Anthropic from '@anthropic-ai/sdk';
import type { ILLMProvider } from '../../domain/interfaces/llm-provider.interface.ts';

export class AnthropicSDKProvider implements ILLMProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, baseUrl: string, model: string) {
    this.client = new Anthropic({ apiKey, baseURL: baseUrl });
    this.model = model;
  }

  async generate(prompt: string, systemPrompt = '', responseJson = false): Promise<string> {
    let promptContent = prompt;
    if (responseJson) {
      promptContent +=
        '\n\nIMPORTANT: Return ONLY a valid JSON object. Do not include markdown code block syntax (like ```json) in your final response.';
    }

    try {
      const stream = await this.client.messages.create({
        model: this.model,
        max_tokens: 4000,
        system: systemPrompt || undefined,
        messages: [{ role: 'user', content: promptContent }],
        stream: true,
      });

      let text = '';
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          text += chunk.delta.text;
        }
      }
      return text.trim();
    } catch (error: any) {
      console.error(`❌ Lỗi gọi API Anthropic SDK:`, error.message);
      throw error;
    }
  }
}
