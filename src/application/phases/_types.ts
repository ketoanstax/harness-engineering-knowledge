export interface KeywordItem {
  name: string;
  definition: string;
}

export interface MappedData {
  slug: string;
  structured_slug: string;
  title: string;
  key_takeaways: string[];
  keywords: KeywordItem[];
}

export interface ConflictItem {
  keyword: string;
  existing_slug: string;
  action: string;
  reason: string;
}

export interface NewConceptItem {
  name: string;
  suggested_slug: string;
  definition: string;
}

export interface ReducedData {
  conflicts: ConflictItem[];
  new_concepts: NewConceptItem[];
}

export interface NewNodeOutput {
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

export interface MergeNodeOutput {
  slug: string;
  updated_definition?: string;
  added_principles: string[];
  added_children: string[];
  updated_causal_derivative: string[];
}

export interface PlanResult {
  new_nodes: NewNodeOutput[];
  merge_nodes: MergeNodeOutput[];
  reasoning: string;
}

export interface VerificationResult {
  brokenLinks: number;
  portabilityViolations: number;
  inconsistencies: number;
}
