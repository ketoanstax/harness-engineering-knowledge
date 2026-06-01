/**
 * Re-export from infrastructure layer for backward compatibility.
 * @deprecated Import directly from infrastructure/llm/ instead.
 */
export {
  AnthropicSDKProvider,
  AnthropicRESTProvider,
  OpenAIProvider,
  GeminiProvider,
  MockProvider,
  LLMClient,
} from '../infrastructure/llm/index.ts';
export type { ILLMProvider } from '../domain/interfaces/llm-provider.interface.ts';
