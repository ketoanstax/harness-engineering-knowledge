export interface IDocumentReader {
  readAsText(filepath: string): Promise<string>;
  isSupported(filepath: string): boolean;
}
