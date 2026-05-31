export interface KeywordDefinition {
  name: string;
  definition: string;
}

export class StructuredDoc {
  slug: string;
  title: string;
  sourceSlug: string;
  keyTakeaways: string[];
  keywords: KeywordDefinition[];
  summary: string;

  constructor(data: {
    slug: string;
    title: string;
    sourceSlug: string;
    keyTakeaways?: string[];
    keywords?: KeywordDefinition[];
    summary?: string;
  }) {
    this.slug = data.slug;
    this.title = data.title;
    this.sourceSlug = data.sourceSlug;
    this.keyTakeaways = data.keyTakeaways || [];
    this.keywords = data.keywords || [];
    this.summary = data.summary || '';
  }

  get relativePath(): string {
    return `01_structured_docs/${this.slug}.md`;
  }

  toMarkdown(): string {
    const takeawaysStr = this.keyTakeaways.map(t => `- ${t}`).join('\n');
    const keywordsStr = this.keywords.map(kw => `- **${kw.name}**: ${kw.definition}`).join('\n');

    return `---
id: ${this.slug}
title: "${this.title}"
category: "Structured Knowledge"
tags:
  - structured
  - processed
date: 2026-05-31
source: "00_raw_docs/${this.sourceSlug}.md"
---

# ${this.title}

## 💡 Key Takeaways
${takeawaysStr}

## 🗝️ Keywords & Core Concepts
${keywordsStr}

## 📝 AI-Ready Summary
${this.summary.trim()}

---

## 🔗 Liên kết Nguồn
- [Tài liệu nguồn gốc thô](00_raw_docs/${this.sourceSlug}.md)
`;
  }
}
