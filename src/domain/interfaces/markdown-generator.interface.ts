import type { AtomicNode } from '../entities/atomic-node.entity.ts';
import type { StructuredDoc } from '../entities/structured-doc.entity.ts';
import type { PlanFile } from '../entities/plan.entity.ts';

export interface IMarkdownGenerator {
  generateAtomicNode(node: AtomicNode): string;
  generateStructuredDoc(doc: StructuredDoc): string;
  generatePlan(plan: PlanFile): string;
  generateFromFrontmatter(data: Record<string, any>, body: string): string;
}
