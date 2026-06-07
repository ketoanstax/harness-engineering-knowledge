import { describe, test, expect, mock } from 'bun:test';
import { LearningService } from '../../../src/application/services/learning.service.ts';
import { LearningResult } from '../../../src/domain/entities/learning.entity.ts';
import type { INodeRepository } from '../../../src/domain/interfaces/node-repository.interface.ts';
import type { ILLMProvider } from '../../../src/domain/interfaces/llm-provider.interface.ts';

describe('LearningService', () => {
  const mockRepo: INodeRepository = {
    findAll: () => [],
    add: async () => {},
  };

  test('generateDraft resolves concept data from LLM response JSON', async () => {
    const mockLlm: ILLMProvider = {
      generate: async () => ({
        content: JSON.stringify({
          title: 'Khổ Đế',
          definition: 'Sự thật về đau khổ.',
          tags: ['de', 'kho'],
        }),
      }),
    };

    const service = new LearningService(mockRepo, mockLlm);
    const draft = await service.generateDraft('khổ là gì', []);

    expect(draft.title).toBe('Khổ Đế');
    expect(draft.definition).toBe('Sự thật về đau khổ.');
    expect(draft.tags).toEqual(['de', 'kho']);
  });

  test('generateDraft fallback on invalid JSON', async () => {
    const mockLlm: ILLMProvider = {
      generate: async () => ({
        content: 'Not a JSON',
      }),
    };

    const service = new LearningService(mockRepo, mockLlm);
    const draft = await service.generateDraft('khổ là gì', []);

    expect(draft.title).toBe('khổ là gì');
    expect(draft.definition).toContain('khổ là gì');
    expect(draft.tags).toEqual(['learning-draft']);
  });

  test('awaitUserConfirmation and resolveConfirmation flow', async () => {
    const mockLlm: ILLMProvider = {
      generate: async () => ({ content: '' }),
    };

    const service = new LearningService(mockRepo, mockLlm);
    const draft = { title: 'Test', definition: 'Desc', tags: [] };

    const promise = service.awaitUserConfirmation(draft);
    service.resolveConfirmation(LearningResult.Approved);

    const result = await promise;
    expect(result).toBe(LearningResult.Approved);
  });
});
