import type { IFrontmatterParser } from '../interfaces/frontmatter-parser.interface.ts';

export interface Frontmatter {
  id: string;
  title: string;
  category: string;
  tags: string[];
  date: string;
  status: string;
}

export class SourceDoc {
  public readonly slug: string;
  public readonly title: string;
  public readonly filepath: string;
  public readonly content: string;
  public readonly frontmatter: Frontmatter;
  public readonly sourceUrl?: string;
  public readonly sourceType: string;

  constructor(
    slug: string,
    title: string,
    filepath: string,
    content: string,
    frontmatter: Frontmatter,
    sourceUrl?: string,
    sourceType: string = 'website',
  ) {
    this.slug = slug;
    this.title = title;
    this.filepath = filepath;
    this.content = content;
    this.frontmatter = frontmatter;
    this.sourceUrl = sourceUrl;
    this.sourceType = sourceType;
  }

  get relativePath(): string {
    return `00_raw_docs/${this.slug}.md`;
  }

  /**
   * Parse frontmatter YAML từ nội dung file markdown.
   * Nhận parser từ tầng Infrastructure (DI) — Domain không biết gray-matter.
   */
  static parseFrontmatter(content: string, parser: IFrontmatterParser, filepath?: string): Frontmatter {
    // Pseudo-frontmatter cho file không phải .md (PDF, DOCX, ...)
    if (filepath && !filepath.toLowerCase().endsWith('.md')) {
      const ext = filepath.split('.').pop()?.toLowerCase() || 'raw';
      const filename = filepath.split(/[/\\]/).pop() || 'unknown';
      const title = filename.replace(`.${ext}`, '').replace(/[-_]/g, ' ');
      return {
        id: '',
        title: title.charAt(0).toUpperCase() + title.slice(1),
        category: 'Raw Knowledge Source',
        tags: [ext, 'raw-document'],
        date: '',
        status: 'to-process',
      };
    }

    try {
      const parsed = parser.parse(content);
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
