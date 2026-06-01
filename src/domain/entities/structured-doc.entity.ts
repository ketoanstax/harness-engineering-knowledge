export interface KeywordDefinition {
  name: string;
  definition: string;
}

export class StructuredDoc {
  public readonly slug: string;
  public title: string;
  public readonly sourceSlug: string;
  public keyTakeaways: string[];
  public keywords: KeywordDefinition[];
  public summary: string;

  constructor(
    slug: string,
    title: string,
    sourceSlug: string,
    keyTakeaways: string[] = [],
    keywords: KeywordDefinition[] = [],
    summary: string = '',
  ) {
    this.slug = slug;
    this.title = title;
    this.sourceSlug = sourceSlug;
    this.keyTakeaways = keyTakeaways;
    this.keywords = keywords;
    this.summary = summary;
  }

  get relativePath(): string {
    return `01_structured_docs/${this.slug}.md`;
  }
}
