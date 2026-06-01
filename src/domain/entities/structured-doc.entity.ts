export interface KeywordDefinition {
  name: string;
  definition: string;
}

export class StructuredDoc {
  constructor(
    public readonly slug: string,
    public readonly title: string,
    public readonly sourceSlug: string,
    public readonly keyTakeaways: string[] = [],
    public readonly keywords: KeywordDefinition[] = [],
    public readonly summary: string = '',
  ) {}

  get relativePath(): string {
    return `01_structured_docs/${this.slug}.md`;
  }
}
