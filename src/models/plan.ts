import { DIR_JOURNAL } from '../core/config.ts';

export interface NewNodeAction {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  definition: string;
  principles: string[];
  parent?: string;
  children: string[];
  causal_core?: string;
  causal_supporting: string[];
  causal_derivative: string[];
}

export interface MergeNodeAction {
  slug: string;
  updated_definition?: string;
  added_principles: string[];
  added_children: string[];
  updated_causal_derivative: string[];
}

export interface PlanItem {
  source_slug: string;
  new_nodes: NewNodeAction[];
  merge_nodes: MergeNodeAction[];
  depends_on: string[];
  reasoning: string;
}

export class PlanFile {
  items: PlanItem[];
  createdAt: string;
  status: string;
  planTimestamp: string;

  constructor(data: {
    items: PlanItem[];
    createdAt?: string;
    status?: string;
    planTimestamp: string;
  }) {
    this.items = data.items;
    this.createdAt = data.createdAt || new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    this.status = data.status || 'pending';
    this.planTimestamp = data.planTimestamp;
  }

  get filename(): string {
    return `mrp_plan_${this.planTimestamp}.md`;
  }

  get filepath(): string {
    return `${DIR_JOURNAL}/${this.filename}`;
  }

  toMarkdownPreview(): string {
    let newNodesStr = '';
    const item = this.items[0];
    if (item && item.new_nodes) {
      for (const nn of item.new_nodes) {
        newNodesStr += `  - **Tạo mới**: \`${nn.slug}.md\`
    - Tiêu đề: *${nn.title}*
    - Danh mục: ${nn.category}
    - Thẻ: ${nn.tags.join(', ')}
    - Parent: ${nn.parent || 'Không có'}
    - Children: ${nn.children && nn.children.length > 0 ? nn.children.join(', ') : 'Không có'}
    - Nhân gốc: ${nn.causal_core || 'Không có'}
`;
      }
    }

    let mergeNodesStr = '';
    if (item && item.merge_nodes) {
      for (const mn of item.merge_nodes) {
        let mergeStr = `  - **Cập nhật/sửa**: \`${mn.slug}.md\`\n`;
        if (mn.updated_definition) {
          mergeStr += `    - Định nghĩa cập nhật: ${mn.updated_definition}\n`;
        }
        for (const ap of mn.added_principles) {
          mergeStr += `    - Thêm nguyên lý: ${ap}\n`;
        }
        for (const ac of mn.added_children) {
          mergeStr += `    - Thêm child: ${ac}\n`;
        }
        mergeNodesStr += mergeStr;
      }
    }

    return `# 📋 Kế hoạch MRP Ingestion Plan

**Trạng thái**: \`${this.status}\`
**Thời điểm**: ${this.planTimestamp}
**Nguồn**: ${item ? item.source_slug : 'Không rõ'}
**Số lượng items**: ${this.items.length}

---

## 🧠 Luận giải (Reasoning)
${item ? item.reasoning : 'Không có luận giải.'}

---

## 🚀 Hành động Tạo mới (New Nodes)
${newNodesStr ? newNodesStr : '  Không có nốt mới.'}

## 🔄 Hành động Cập nhật/Trộn (Merge Nodes)
${mergeNodesStr ? mergeNodesStr : '  Không có nốt cần trộn.'}

---

## 📌 Hướng dẫn duyệt
- Nếu kế hoạch **OK**, user nhập lệnh: \`mrp approve plan\`
- Nếu kế hoạch **cần chỉnh sửa**, user sửa trực tiếp file này hoặc yêu cầu thay đổi.
- Nếu kế hoạch **không phù hợp**, user nhập lệnh: \`mrp reject plan\`
`;
  }

  static parseFromMarkdown(content: string): string | null {
    const statusMatch = content.match(/\*\*Trạng thái\*\*:\s*`(\w+)`/);
    if (statusMatch) {
      return statusMatch[1];
    }
    return null;
  }

  static parseSourceSlug(content: string): string | null {
    const srcMatch = content.match(/\*\*Nguồn\*\*:\s*(\S+)/);
    if (srcMatch) {
      return srcMatch[1].trim();
    }
    return null;
  }
}
