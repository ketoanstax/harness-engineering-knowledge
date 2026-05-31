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
  slug: string;
  title: string;
  filepath: string;
  content: string;
  frontmatter: Frontmatter;
  sourceUrl?: string;
  sourceType: string;

  constructor(data: {
    slug: string;
    title: string;
    filepath: string;
    content: string;
    frontmatter: Frontmatter;
    sourceUrl?: string;
    sourceType?: string;
  }) {
    this.slug = data.slug;
    this.title = data.title;
    this.filepath = data.filepath;
    this.content = data.content;
    this.frontmatter = data.frontmatter;
    this.sourceUrl = data.sourceUrl;
    this.sourceType = data.sourceType || 'website';
  }

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
    } catch (e) {
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
