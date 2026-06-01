import matter from 'gray-matter';

export interface Frontmatter {
  id: string;
  title: string;
  category: string;
  tags: string[];
  date: string;
  status: string;
}

export class SourceDoc {
  constructor(
    public readonly slug: string,
    public readonly title: string,
    public readonly filepath: string,
    public readonly content: string,
    public readonly frontmatter: Frontmatter,
    public readonly sourceUrl?: string,
    public readonly sourceType: string = 'website',
  ) {}

  get relativePath(): string {
    return `00_raw_docs/${this.slug}.md`;
  }

  static parseFrontmatter(content: string): Frontmatter {
    try {
      const parsed = matter(content);
      const data = parsed.data || {};
      return {
        id: String(data.id || ''),
        title: String(data.title || 'untitled'),
        category: String(data.category || 'Raw Knowledge Source'),
        tags: Array.isArray(data.tags) ? data.tags : [],
        date: String(data.date || ''),
        status: String(data.status || 'to-process'),
      };
    } catch {
      return {
        id: '',
        title: 'unknown',
        category: 'Raw Knowledge Source',
        tags: [],
        date: '',
        status: 'to-process',
      };
    }
  }
}
