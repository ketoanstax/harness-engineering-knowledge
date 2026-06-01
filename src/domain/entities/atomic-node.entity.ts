export interface CausalWeb {
  causalCore?: string;
  supportingConditions: string[];
  derivativeEffects: string[];
}

export class AtomicNode {
  constructor(
    public readonly slug: string,
    public readonly title: string,
    public readonly category: string,
    public readonly tags: string[],
    public readonly definition: string,
    public readonly principles: string[],
    public readonly parent?: string,
    public readonly children: string[] = [],
    public readonly causalWeb: CausalWeb = { supportingConditions: [], derivativeEffects: [] },
    public readonly evidenceStructured: string[] = [],
    public readonly evidenceRaw: string[] = [],
  ) {}

  get fullSlug(): string {
    return `HAE-concept-${this.slug}`;
  }

  get relativePath(): string {
    return `02_atomic_nodes/${this.fullSlug}.md`;
  }
}
