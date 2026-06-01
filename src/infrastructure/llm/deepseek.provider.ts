import { OpenAIProvider } from './openai.provider.ts';

/**
 * DeepSeek Provider — API hoàn toàn tương thích OpenAI.
 *
 * Chỉ ghi đè giá trị mặc định của baseUrl và model.
 * Mọi logic đều được kế thừa từ OpenAIProvider (token usage tracking,
 * `response_format: json_object`, error handling, v.v.)
 */
export class DeepSeekProvider extends OpenAIProvider {
  constructor(apiKey: string, baseUrl = 'https://api.deepseek.com', model = 'deepseek-chat') {
    super(apiKey, baseUrl, model);
  }
}
