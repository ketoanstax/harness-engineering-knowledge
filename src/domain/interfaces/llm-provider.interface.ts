export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface LLMResponse {
  content: string;
  usage?: LLMUsage;
}

export interface ILLMProvider {
  generate(prompt: string, systemPrompt?: string, responseJson?: boolean): Promise<LLMResponse>;
}
