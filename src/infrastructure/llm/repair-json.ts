/**
 * Sửa chữa JSON bị lỗi (truncated, unescaped quotes, trailing commas, missing brackets)
 * Copy từ src/core/llm.ts nguyên bản.
 */
export function repairJsonString(raw: string): string {
  let cleaned = raw.trim();

  // 1. Loại bỏ markdown code blocks
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  }

  // 2. Thay thế ký tự xuống dòng thực tế, tự động escape ngoặc kép lồng nhau & theo dõi ngoặc cú pháp
  let inString = false;
  let result = '';
  const stack: string[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const prevChar = i > 0 ? cleaned[i - 1] : '';

    // Theo dõi cấu trúc ngoặc mở/đóng ngoài chuỗi văn bản
    if (!inString) {
      if (char === '{' || char === '[') {
        stack.push(char);
      } else if (char === '}') {
        if (stack[stack.length - 1] === '{') stack.pop();
      } else if (char === ']') {
        if (stack[stack.length - 1] === '[') stack.pop();
      }
    }

    if (char === '"') {
      if (prevChar === '\\') {
        result += char;
      } else {
        if (!inString) {
          inString = true;
          result += char;
        } else {
          // Kiểm tra xem đây có phải dấu đóng cú pháp JSON không
          let isSyntaxClose = false;
          let tempIndex = i + 1;
          while (tempIndex < cleaned.length) {
            const nextNonSpace = cleaned[tempIndex];
            if (nextNonSpace === ' ' || nextNonSpace === '\t' || nextNonSpace === '\n' || nextNonSpace === '\r') {
              tempIndex++;
              continue;
            }
            if (nextNonSpace === ',' || nextNonSpace === '}' || nextNonSpace === ']' || nextNonSpace === ':') {
              isSyntaxClose = true;
            }
            break;
          }
          if (tempIndex === cleaned.length) {
            isSyntaxClose = true;
          }

          if (isSyntaxClose) {
            inString = false;
            result += char;
          } else {
            result += '\\"';
          }
        }
      }
    } else if (char === '\n' && inString) {
      result += '\\n';
    } else if (char === '\r' && inString) {
      // Bỏ qua \r
    } else {
      result += char;
    }
  }

  // 3. XỬ LÝ PHỤC HỒI KHI BỊ CẮT BỚT (TRUNCATED JSON RECOVERY)
  let repaired = result.trim();
  if (inString) {
    repaired += '"';
  }

  // Loại bỏ các dấu phẩy thừa hoặc cú pháp dở dang ở cuối
  repaired = repaired.replace(/,\s*$/, '');

  // Lần lượt đóng các ngoặc chưa đóng trong stack
  while (stack.length > 0) {
    const openChar = stack.pop();
    if (openChar === '{') {
      repaired += '}';
    } else if (openChar === '[') {
      repaired += ']';
    }
  }

  // 4. Xử lý trailing commas chung
  repaired = repaired.replace(/,\s*([\]}])/g, '$1');

  return repaired;
}
