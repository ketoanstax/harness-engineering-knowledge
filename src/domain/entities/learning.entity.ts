export enum LearningResult {
  Draft = 'Draft',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface DraftNode {
  title: string;
  definition: string;
  tags: string[];
  parent?: string;
  children?: string[];
}
