export interface CausalWeb {
  causalCore?: string;
  supportingConditions: string[];
  derivativeEffects: string[];
}

export class AtomicNode {
  public readonly slug: string;
  public readonly title: string;
  public readonly category: string;
  public readonly tags: string[];
  public readonly definition: string;
  public readonly principles: string[];
  public readonly parent?: string;
  public readonly children: string[];
  public readonly causalWeb: CausalWeb;
  public readonly evidenceStructured: string[];
  public readonly evidenceRaw: string[];

  constructor(
    slug: string,
    title: string,
    category: string,
    tags: string[],
    definition: string,
    principles: string[],
    parent?: string,
    children: string[] = [],
    causalWeb: CausalWeb = { supportingConditions: [], derivativeEffects: [] },
    evidenceStructured: string[] = [],
    evidenceRaw: string[] = [],
  ) {
    this.slug = slug;
    this.title = title;
    this.category = category;
    this.tags = tags;
    this.definition = definition;
    this.principles = principles;
    this.parent = parent;
    this.children = children;
    this.causalWeb = causalWeb;
    this.evidenceStructured = evidenceStructured;
    this.evidenceRaw = evidenceRaw;
  }

  get fullSlug(): string {
    return `HAE-concept-${this.slug}`;
  }

  get relativePath(): string {
    return `02_atomic_nodes/${this.fullSlug}.md`;
  }
}
