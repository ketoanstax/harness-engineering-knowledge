export interface NewNodeAction {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  definition: string;
  principles: string[];
  parent?: string;
  children: string[];
  causal_core?: string;
  causal_supporting: string[];
  causal_derivative: string[];
}

export interface MergeNodeAction {
  slug: string;
  updated_definition?: string;
  added_principles: string[];
  added_children: string[];
  updated_causal_derivative: string[];
}

export interface PlanItem {
  source_slug: string;
  new_nodes: NewNodeAction[];
  merge_nodes: MergeNodeAction[];
  depends_on: string[];
  reasoning: string;
}

export class PlanFile {
  public readonly items: PlanItem[];
  public readonly planTimestamp: string;
  public readonly createdAt: string;
  public readonly status: string;

  constructor(
    items: PlanItem[],
    planTimestamp: string,
    createdAt?: string,
    status: string = 'pending',
  ) {
    this.items = items;
    this.planTimestamp = planTimestamp;
    this.createdAt = createdAt ?? new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    this.status = status;
  }

  get filename(): string {
    return `mrp_plan_${this.planTimestamp}.md`;
  }

  get filepath(): string {
    return `05_journal/${this.filename}`;
  }

  static parseStatus(content: string): string | null {
    const statusMatch = content.match(/\*\*Trạng thái\*\*:\s*`(\w+)`/);
    return statusMatch ? statusMatch[1] : null;
  }

  static parseSourceSlug(content: string): string | null {
    const srcMatch = content.match(/\*\*Nguồn\*\*:\s*(\S+)/);
    return srcMatch ? srcMatch[1].trim() : null;
  }
}
