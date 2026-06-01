/**
 * Trích xuất JSON hợp lệ từ phản hồi LLM.
 *
 * LLM thường trả về JSON với các lỗi cú pháp phổ biến:
 * - Wrap trong ```json ... ``` markdown block
 * - Text dư thừa trước/sau JSON
 * - Trailing commas trước `}` / `]`
 * - Single quotes (`'...'`) thay vì double quotes (`"..."`)
 * - Nested braces `{...{...}...}` bị regex non-greedy cắt thiếu
 * - JSON bị truncate do giới hạn output token
 */
export function extractJson(response: string): unknown {
  // Bước 1: Lấy block code ```json ... ``` hoặc ``` ... ``` nếu có
  const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  let candidate = codeBlockMatch ? codeBlockMatch[1].trim() : response.trim();

  // Bước 2: Tìm vị trí bắt đầu của object/array đầu tiên
  const firstOpenBrace = candidate.indexOf('{');
  const firstOpenBracket = candidate.indexOf('[');
  const startIdx = firstOpenBrace === -1
    ? (firstOpenBracket === -1 ? 0 : firstOpenBracket)
    : (firstOpenBracket === -1 ? firstOpenBrace : Math.min(firstOpenBrace, firstOpenBracket));

  if (startIdx > 0) {
    candidate = candidate.slice(startIdx);
  }

  if (!candidate) {
    throw new Error('No JSON structure found in LLM response');
  }

  // Bước 3: Cân bằng braces — tìm closing cuối cùng
  let braceDepth = 0;
  let bracketDepth = 0;
  let lastValidEnd = -1;

  for (let i = 0; i < candidate.length; i++) {
    const ch = candidate[i];

    // Bỏ qua string content
    if (ch === '"') {
      i++;
      while (i < candidate.length) {
        if (candidate[i] === '\\') { i += 2; continue; }
        if (candidate[i] === '"') break;
        i++;
      }
      continue;
    }

    if (ch === '{') braceDepth++;
    if (ch === '}') braceDepth--;
    if (ch === '[') bracketDepth++;
    if (ch === ']') bracketDepth--;

    // Phát hiện depth âm (dư closing) → cắt bỏ
    if (braceDepth < 0 || bracketDepth < 0) {
      candidate = candidate.slice(0, i);
      break;
    }

    if (braceDepth === 0 && bracketDepth === 0) {
      lastValidEnd = i + 1;
    }
  }

  // Cắt tại vị trí depth 0 cuối cùng
  if (lastValidEnd > 0) {
    candidate = candidate.slice(0, lastValidEnd);
  } else if (braceDepth > 0 || bracketDepth > 0) {
    // JSON chưa kết thúc (truncated) — gắn closing braces
    while (braceDepth > 0) { candidate += '}'; braceDepth--; }
    while (bracketDepth > 0) { candidate += ']'; bracketDepth--; }
  }

  // Bước 4: Loại bỏ trailing commas trước } và ]
  candidate = candidate.replace(/,(\s*[}\]])/g, '$1');

  // Bước 5: Thử JSON.parse với double quotes
  try {
    return JSON.parse(candidate);
  } catch {
    // Fallback: thay thế single quote không escape thành double quote
    // Chỉ thay ' ở key và string value, không thay escaped \'
    const fixed = candidate
      // Key: { '...' :  → { "..." :
      .replace(/(\{|\,)\s*'([^']+?)'\s*:/g, '$1"$2":')
      // Value string: : '...'  → : "..."
      .replace(/:\s*'([^']*?)'\s*([,\}\]])/g, ':"$1"$2');
    return JSON.parse(fixed);
  }
}
