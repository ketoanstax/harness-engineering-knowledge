import OpenAI from 'openai';
import type { ILLMProvider, LLMResponse } from '../../domain/interfaces/llm-provider.interface.ts';

/**
 * OpenAIProvider – wrapper gọn gàng dựa trên SDK chính thức của OpenAI.
 *
 * Vì 9Router là một gateway tương thích với OpenAI, chúng ta chỉ cần truyền
 * `baseUrl` (địa chỉ của 9Router) và `apiKey` vào SDK. SDK sẽ tự xử lý
 * serialization, header và parsing response, giúp tránh lỗi định dạng
 * như trong phiên bản cũ dùng `fetch` thủ công.
 */
export class OpenAIProvider implements ILLMProvider {
  private client: OpenAI; // SDK client
  private model: string;

  constructor(apiKey: string, baseUrl: string, model: string) {
    // OpenAI SDK cho phép cấu hình baseURL – dùng để trỏ tới 9Router.
    this.client = new OpenAI({ apiKey, baseURL: baseUrl.replace(/\/+$/, '') });
    this.model = model;
    console.log(`🤖 OpenAIProvider khởi tạo – Model: ${model} – Base URL: ${baseUrl}`);
  }

  async generate(prompt: string, systemPrompt = '', responseJson = false): Promise<LLMResponse> {
    // Định dạng tin nhắn đúng yêu cầu của OpenAI SDK.
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = systemPrompt
      ? [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ]
      : [{ role: 'user', content: prompt }];

    const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '3000', 10);
    const request: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      model: this.model,
      messages,
      max_tokens: maxTokens,
    };

    if (responseJson) {
      // Yêu cầu trả về JSON object (không có markdown).
      request.response_format = { type: 'json_object' };
    }

    try {
      const response = await this.client.chat.completions.create(request);
      const content = response.choices[0]?.message?.content?.trim() ?? '';
      const usage = response.usage
        ? {
            inputTokens: response.usage.prompt_tokens,
            outputTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined;
      return { content, usage };
    } catch (error: any) {
      console.error('❌ Lỗi gọi API OpenAI SDK:', error.message);
      throw error;
    }
  }
}
