export interface ILLMProvider {
  generate(prompt: string, systemPrompt?: string, responseJson?: boolean): Promise<string>;
}
