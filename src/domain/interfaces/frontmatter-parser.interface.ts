export interface ParsedDocument {
  content: string;
  data: Record<string, any>;
}

export interface IFrontmatterParser {
  parse(content: string): ParsedDocument;
}
