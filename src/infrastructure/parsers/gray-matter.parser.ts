import matter from 'gray-matter';
import type { IFrontmatterParser, ParsedDocument } from '../../domain/interfaces/frontmatter-parser.interface.ts';

export class GrayMatterParser implements IFrontmatterParser {
  parse(content: string): ParsedDocument {
    const parsed = matter(content);
    return { content: parsed.content, data: parsed.data || {} };
  }
}
