import type { DraftNode } from '../entities/learning.entity.ts';

export interface AtomicNodeMeta {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  parent?: string;
  children: string[];
  definition: string;
  filename: string;
}

export interface INodeRepository {
  findAll(): AtomicNodeMeta[];
  add(node: DraftNode): Promise<void>;
}

