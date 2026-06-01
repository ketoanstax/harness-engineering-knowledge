export interface KeywordDefinition {
  name: string;
  definition: string;
}

export class StructuredDoc {
  constructor(
    public readonly slug: string,
    public title: string,
    public readonly sourceSlug: string,
    public keyTakeaways: string[] = [],
    public keywords: KeywordDefinition[] = [],
    public summary: string = '',
  ) {}

  get relativePath(): string {
    return `01_structured_docs/${this.slug}.md`;
  }
}
