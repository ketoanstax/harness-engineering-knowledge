export interface EngineCategory {
  id: string;
  name: string;
  marker: string;
  keywords: string[];
}

export interface IConfigProvider {
  dirRaw: string;
  dirStructured: string;
  dirAtomic: string;
  dirNeuralMap: string;
  dirDistilled: string;
  dirJournal: string;
  dirVault: string;
  pathIndex: string;
  pathRouting: string;
  pathFeedback: string;
  atomicPrefix: string;
  structuredSuffix: string;
  planPrefix: string;
  loadCategories(): EngineCategory[];
}
