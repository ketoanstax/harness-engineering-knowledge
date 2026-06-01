import type { IConfigProvider, EngineCategory } from '../../domain/interfaces/config-provider.interface.ts';
import * as config from '../../core/config.ts';

export class ConfigProvider implements IConfigProvider {
  get dirRaw(): string {
    return config.DIR_RAW;
  }

  get dirStructured(): string {
    return config.DIR_STRUCTURED;
  }

  get dirAtomic(): string {
    return config.DIR_ATOMIC;
  }

  get dirNeuralMap(): string {
    return config.DIR_NEURAL_MAP;
  }

  get dirDistilled(): string {
    return config.DIR_DISTILLED;
  }

  get dirJournal(): string {
    return config.DIR_JOURNAL;
  }

  get dirVault(): string {
    return config.DIR_VAULT;
  }

  get pathIndex(): string {
    return config.PATH_INDEX;
  }

  get pathRouting(): string {
    return config.PATH_ROUTING;
  }

  get pathFeedback(): string {
    return config.PATH_FEEDBACK;
  }

  get atomicPrefix(): string {
    return config.ATOMIC_PREFIX;
  }

  get structuredSuffix(): string {
    return config.STRUCTURED_SUFFIX;
  }

  get planPrefix(): string {
    return config.PLAN_PREFIX;
  }

  loadCategories(): EngineCategory[] {
    return config.loadCategories();
  }
}
