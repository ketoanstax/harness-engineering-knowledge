import type { ILLMProvider, LLMResponse } from '../../domain/interfaces/llm-provider.interface.ts';
import { AnthropicSDKProvider } from './anthropic-sdk.provider.ts';
import { AnthropicRESTProvider } from './anthropic-rest.provider.ts';
import { OpenAIProvider } from './openai.provider.ts';
import { GeminiProvider } from './gemini.provider.ts';
import { DeepSeekProvider } from './deepseek.provider.ts';
import { MockProvider } from './mock.provider.ts';
import { repairJsonString } from './repair-json.ts';

export class LLMClient implements ILLMProvider {
  private provider: ILLMProvider;

  constructor(provider: ILLMProvider) {
    this.provider = provider;
  }

  async generate(prompt: string, systemPrompt = '', responseJson = false): Promise<LLMResponse> {
    const result = await this.provider.generate(prompt, systemPrompt, responseJson);
    if (responseJson && result.content) {
      return {
        content: repairJsonString(result.content),
        usage: result.usage,
      };
    }
    return result;
  }

  /** Factory method — tự động chọn provider dựa trên biến môi trường */
  static createFromEnv(): LLMClient {
    const anthropicKey = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY;

    if (anthropicKey) {
      const model = process.env.ANTHROPIC_MODEL || 'KhaBoDo_1.0';
      const baseUrl = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1').replace(/\/+$/, '');
      const mode = process.env.ANTHROPIC_CONNECTION_MODE || 'sdk';

      if (mode === 'rest') {
        console.log(`🤖 [Anthropic] Khởi tạo REST Provider - Model: ${model}`);
        return new LLMClient(new AnthropicRESTProvider(anthropicKey, baseUrl, model));
      }
      console.log(`🤖 [Anthropic] Khởi tạo SDK Provider - Model: ${model}`);
      return new LLMClient(new AnthropicSDKProvider(anthropicKey, baseUrl, model));
    }

    if (process.env.DEEPSEEK_API_KEY) {
      const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
      const baseUrl = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '');
      console.log(`🤖 Khởi tạo DeepSeek Provider - Model: ${model}`);
      return new LLMClient(new DeepSeekProvider(process.env.DEEPSEEK_API_KEY, baseUrl, model));
    }

    if (process.env.OPENAI_API_KEY) {
      const model = process.env.OPENAI_MODEL || 'gpt-4o';
      // Cho phép cấu hình Base URL tùy biến (mặc định https://api.openai.com/v1)
      const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
      console.log(`🤖 Khởi tạo OpenAI Provider - Model: ${model} - Base URL: ${baseUrl}`);
      return new LLMClient(new OpenAIProvider(process.env.OPENAI_API_KEY, baseUrl, model));
    }

    if (process.env.GEMINI_API_KEY) {
      const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
      console.log(`🤖 Khởi tạo Gemini Provider - Model: ${model}`);
      return new LLMClient(
        new GeminiProvider(process.env.GEMINI_API_KEY, 'https://generativelanguage.googleapis.com/v1beta', model),
      );
    }

    const model = 'mock-model';
    console.log('⚠️ Không phát hiện API key. Chạy chế độ giả lập (MOCK MODE).');
    return new LLMClient(new MockProvider(model));
  }
}
