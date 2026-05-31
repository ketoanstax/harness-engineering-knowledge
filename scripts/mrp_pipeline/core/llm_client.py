import os
import json
import urllib.request
import urllib.error
from typing import Optional

class LLMClient:
    """
    Client giao tiếp LLM độc lập và portable.
    Tự động phát hiện biến môi trường để gọi API của Anthropic (Claude), OpenAI (GPT),
    hoặc Google (Gemini). Có cơ chế giả lập thông minh (mock/stub) khi không có API key
    để chạy thử nghiệm nhanh (local sandbox).
    """
    def __init__(self):
        self.api_provider = None
        self.api_key = None
        self.model = None

        # Phát hiện cấu hình tự động
        if os.environ.get("ANTHROPIC_API_KEY"):
            self.api_provider = "anthropic"
            self.api_key = os.environ.get("ANTHROPIC_API_KEY")
            self.model = os.environ.get("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
        elif os.environ.get("OPENAI_API_KEY"):
            self.api_provider = "openai"
            self.api_key = os.environ.get("OPENAI_API_KEY")
            self.model = os.environ.get("OPENAI_MODEL", "gpt-4o")
        elif os.environ.get("GEMINI_API_KEY"):
            self.api_provider = "gemini"
            self.api_key = os.environ.get("GEMINI_API_KEY")
            self.model = os.environ.get("GEMINI_MODEL", "gemini-1.5-pro")
        else:
            self.api_provider = "mock"
            print("⚠️ Cảnh báo: Không phát hiện API key (Anthropic/OpenAI/Gemini).")
            print("   Hệ thống chạy ở chế độ giả lập thông minh (MOCK MODE).")

    def generate(self, prompt: str, system_prompt: str = "", response_json: bool = False) -> str:
        """
        Gọi LLM để sinh văn bản. Hỗ trợ đầu ra định dạng JSON nếu LLM hỗ trợ.
        """
        if self.api_provider == "mock":
            return self._mock_generate(prompt, response_json)

        if self.api_provider == "anthropic":
            return self._call_anthropic(prompt, system_prompt, response_json)
        elif self.api_provider == "openai":
            return self._call_openai(prompt, system_prompt, response_json)
        elif self.api_provider == "gemini":
            return self._call_gemini(prompt, system_prompt, response_json)

        return ""

    def _call_anthropic(self, prompt: str, system_prompt: str, response_json: bool) -> str:
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }

        prompt_content = prompt
        if response_json:
            prompt_content += "\n\nIMPORTANT: Return ONLY a valid JSON object. Do not include markdown code block syntax (like ```json) in your final response."

        data = {
            "model": self.model,
            "max_tokens": 4000,
            "messages": [
                {"role": "user", "content": prompt_content}
            ]
        }
        if system_prompt:
            data["system"] = system_prompt

        req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                result = json.loads(response.read().decode("utf-8"))
                return result["content"][0]["text"].strip()
        except urllib.error.URLError as e:
            print(f"❌ Lỗi gọi API Anthropic: {e}")
            raise e

    def _call_openai(self, prompt: str, system_prompt: str, response_json: bool) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        data = {
            "model": self.model,
            "messages": messages,
            "max_tokens": 3000
        }
        if response_json:
            data["response_format"] = {"type": "json_object"}

        req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                result = json.loads(response.read().decode("utf-8"))
                return result["choices"][0]["message"]["content"].strip()
        except urllib.error.URLError as e:
            print(f"❌ Lỗi gọi API OpenAI: {e}")
            raise e

    def _call_gemini(self, prompt: str, system_prompt: str, response_json: bool) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        headers = {
            "Content-Type": "application/json"
        }

        contents = {"parts": [{"text": prompt}]}
        system_instruction = {"parts": [{"text": system_prompt}]} if system_prompt else None

        data = {
            "contents": [contents],
        }
        if system_instruction:
            data["systemInstruction"] = system_instruction

        if response_json:
            data["generationConfig"] = {"responseMimeType": "application/json"}

        req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                result = json.loads(response.read().decode("utf-8"))
                return result["candidates"][0]["content"]["parts"][0]["text"].strip()
        except urllib.error.URLError as e:
            print(f"❌ Lỗi gọi API Gemini: {e}")
            raise e

    def _mock_generate(self, prompt: str, response_json: bool) -> str:
        """
        Giả lập thông minh đầu ra để phục vụ test cục bộ mà không tốn tiền API key.
        Sử dụng các khoá JSON duy nhất theo PHASE để tránh chồng lấn (overlap).
        - Mapper 1: key là key_takeaways (duy nhất ở Mapper)
        - Reducer 2: key là existing_slug (duy nhất ở Reducer)
        - Planner 3: key là merge_nodes (duy nhất ở Planner)
        """
        prompt_lower = prompt.lower()

        # --- PHASE 1: MAPPER ---
        # JSON yêu cầu chứa key_takeaways (snake_case, duy nhất)
        if '"key_takeaways"' in prompt or "'key_takeaways'" in prompt or "key_takeaways" in prompt_lower:
            if response_json:
                return json.dumps({
                    "title": "Bản chắt lọc tự động - MRP Pipeline",
                    "key_takeaways": [
                        "MRP Pipeline chuyển hóa tài liệu thô thành cây tri thức đồ thị phẳng.",
                        "Vector Database bị 3 điểm mù: global context loss, no accumulation, hallucinations.",
                        "Mỗi nốt nguyên tử có parent/children và Causal Web để truy vết nguồn gốc."
                    ],
                    "keywords": [
                        {"name": "Global Context Loss", "definition": "Mất bối cảnh tổng thể do AI chỉ nhận các đoạn vụn rời rạc."},
                        {"name": "No Accumulation", "definition": "Không tích lũy được tri thức, dữ liệu cũ và mới dễ mâu thuẫn."},
                        {"name": "Uncontrolled Hallucinations", "definition": "AI không thể truy vết ngược dòng dẫn chứng."}
                    ],
                    "summary": "Bài giảng phân tích lý do MRP Pipeline chiến thắng Vector Database và đề xuất quy trình gồm 6 pha xử lý song song."
                }, ensure_ascii=False)

        # --- PHASE 2: REDUCER ---
        # JSON yêu cầu chứa existing_slug (duy nhất ở Reducer)
        if '"existing_slug"' in prompt or "existing_slug" in prompt_lower:
            if response_json:
                return json.dumps({
                    "conflicts": [
                        {
                            "keyword": "Hallucinations",
                            "existing_slug": "early-victory",
                            "action": "merge",
                            "reason": "Khái niệm ảo tưởng (hallucinations) liên quan đến lỗi tự mãn tuyên bố thành công sớm (early victory)."
                        }
                    ],
                    "new_concepts": [
                        {
                            "name": "Global Context Loss",
                            "suggested_slug": "global-context-loss",
                            "definition": "Mất bối cảnh tổng thể khi AI chỉ nhận các đoạn vụn rời rạc từ Vector DB."
                        },
                        {
                            "name": "No Accumulation",
                            "suggested_slug": "no-accumulation",
                            "definition": "Hệ thống không tích lũy tri thức, dẫn đến mâu thuẫn giữa dữ liệu cũ và mới."
                        }
                    ]
                }, ensure_ascii=False)

        # --- PHASE 3: PLANNER ---
        # JSON yêu cầu chứa merge_nodes (duy nhất ở Planner)
        if '"merge_nodes"' in prompt or "merge_nodes" in prompt_lower:
            if response_json:
                return json.dumps({
                    "new_nodes": [
                        {
                            "slug": "global-context-loss",
                            "title": "Global Context Loss - Mất bối cảnh tổng thể trong Vector DB",
                            "category": "Harness Core Concept",
                            "tags": ["global-context-loss", "vector-db", "context-fragmentation"],
                            "definition": "Vector Database cắt tài liệu thành các chunk nhỏ khiến AI Agent không thể nhìn thấy cấu trúc tổng thể của tài liệu.",
                            "principles": [
                                "MRP Pipeline khắc phục bằng cách biên dịch tài liệu thành cây tri thức phẳng thay vì chunk rời rạc.",
                                "Backlinks trực tiếp trỏ về dòng, trang cụ thể đảm bảo khả năng truy vết."
                            ],
                            "parent": "harness-definition",
                            "children": [],
                            "causal_core": "system-of-record",
                            "causal_supporting": ["feature-list-primitive"],
                            "causal_derivative": ["five-harness-principles"]
                        },
                        {
                            "slug": "no-accumulation",
                            "title": "No Accumulation - Hệ quả không tích lũy tri thức",
                            "category": "Harness Core Concept",
                            "tags": ["no-accumulation", "knowledge-merge", "consistency"],
                            "definition": "Khi tài liệu thay đổi, VectorDB chỉ chèn thêm vector mới thay vì hợp nhất tri thức, dẫn đến mâu thuẫn.",
                            "principles": [
                                "Cơ chế MRP Merge thay thế ghi đè, luôn trộn (merge) kiến thức mới vào nốt cũ.",
                                "Phát hiện xung đột ngữ nghĩa tự động bằng Reducer."
                            ],
                            "parent": "global-context-loss",
                            "children": [],
                            "causal_core": "clean-state",
                            "causal_supporting": ["compaction-strategy"],
                            "causal_derivative": ["session-continuity"]
                        }
                    ],
                    "merge_nodes": [
                        {
                            "slug": "early-victory",
                            "updated_definition": "Ngăn chặn Agent tự mãn tuyên bố thành công sớm và mở rộng thêm khả năng phát hiện ảo tưởng ngữ nghĩa (hallucinations) từ các nguồn dữ liệu phân mảnh.",
                            "added_principles": [
                                "Mở rộng phát hiện: Không chỉ tuyên bố thành công sớm, Agent còn ảo tưởng khi đọc các chunk dữ liệu rời rạc."
                            ],
                            "added_children": ["global-context-loss"],
                            "updated_causal_derivative": ["global-context-loss", "no-accumulation"]
                        }
                    ],
                    "reasoning": "Tài liệu mới nhấn mạnh 3 điểm mù của VectorDB: 1) Global Context Loss, 2) No Accumulation, 3) Uncontrolled Hallucination. Điểm 3 (Hallucination) đã được mô tả một phần trong nốt early-victory nên chúng tôi MERGE vào đó. Hai khái niệm còn lại hoàn toàn mới nên tạo nốt mới, nối parent với harness-definition và clean-state."
                }, ensure_ascii=False)

        # Fallback mặc định nếu không khớp phase nào
        if response_json:
            return "{}"
        return "Giả lập phản hồi văn bản thông thường từ LLM."
