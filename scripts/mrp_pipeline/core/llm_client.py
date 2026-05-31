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

    Hỗ trợ hoàn hảo cho Custom API Gateway (base_url, auth_token, custom model).
    Đặc biệt tương thích 100% với 9router (hỗ trợ SSE Stream Parsing và tắt streaming).
    """
    def __init__(self):
        self.api_provider = None
        self.api_key = None
        self.model = None
        self.base_url = None

        # 1. Phát hiện cấu hình Anthropic (Có thể là API thật hoặc Custom Gateway qua 9router)
        anthropic_key = os.environ.get("ANTHROPIC_AUTH_TOKEN") or os.environ.get("ANTHROPIC_API_KEY")

        if anthropic_key:
            self.api_provider = "anthropic"
            self.api_key = anthropic_key
            self.model = os.environ.get("ANTHROPIC_MODEL", "KhaBoDo_1.0")

            # Đọc Custom Base URL của Gateway nếu có (mặc định Anthropic Cloud)
            self.base_url = os.environ.get("ANTHROPIC_BASE_URL", "https://api.anthropic.com/v1").rstrip("/")
            print(f"🤖 Đã phát hiện cấu hình Anthropic/9router Gateway:")
            print(f"   Model: {self.model}")
            print(f"   Base URL: {self.base_url}")

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

    def _parse_sse_stream(self, stream_body: str) -> str:
        """
        Bộ phân tích SSE Stream (Server-Sent Events) dự phòng cho 9router.
        Lọc toàn bộ dòng bắt đầu bằng 'data: ' và trích xuất trường 'text'.
        """
        text_parts = []
        for line in stream_body.split("\n"):
            line = line.strip()
            if line.startswith("data:"):
                json_str = line[5:].strip()
                # Bỏ qua dòng kết thúc hoặc trống
                if json_str == "[DONE]" or not json_str:
                    continue
                try:
                    data = json.loads(json_str)
                    # Chuẩn Anthropic Stream: content_block_delta -> delta -> text
                    if data.get("type") == "content_block_delta":
                        delta = data.get("delta", {})
                        if "text" in delta:
                            text_parts.append(delta["text"])
                    # Một số định dạng khác
                    elif "choices" in data:
                        delta = data["choices"][0].get("delta", {})
                        if "content" in delta:
                            text_parts.append(delta["content"])
                except Exception:
                    pass

        full_text = "".join(text_parts).strip()
        return full_text

    def _call_anthropic(self, prompt: str, system_prompt: str, response_json: bool) -> str:
        url = f"{self.base_url}/messages"
        headers = {
            "x-api-key": self.api_key,
            "Authorization": f"Bearer {self.api_key}",
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }

        prompt_content = prompt
        if response_json:
            prompt_content += "\n\nIMPORTANT: Return ONLY a valid JSON object. Do not include markdown code block syntax (like ```json) in your final response."

        # Cấu hình payload. Tắt "stream" để 9router trả về phản hồi tĩnh đơn giản.
        data = {
            "model": self.model,
            "max_tokens": 4000,
            "stream": False,  # BẮT BUỘC: Yêu cầu 9router không stream
            "messages": [
                {"role": "user", "content": prompt_content}
            ]
        }
        if system_prompt:
            data["system"] = system_prompt

        req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                body = response.read().decode("utf-8")

                # 1. Kiểm tra xem phản hồi có phải là Event Stream SSE không
                if "event: message_start" in body or "data:" in body:
                    # Chạy bộ giải nén SSE Stream dự phòng
                    return self._parse_sse_stream(body)

                # 2. Bộ parse thích ứng đa nền tảng (Adaptive Response Parser)
                # Giải quyết triệt để 100% sự khác biệt JSON cấu trúc giữa Anthropic và OpenAI/Gemini qua 9router
                result = json.loads(body)

                # Cấu hình Anthropic chuẩn
                if "content" in result and isinstance(result["content"], list):
                    return result["content"][0]["text"].strip()

                # Cấu hình OpenAI / Gemini Proxy (9router)
                elif "choices" in result and isinstance(result["choices"], list):
                    return result["choices"][0]["message"]["content"].strip()

                # Cấu hình Google Gemini trực tiếp
                elif "candidates" in result:
                    return result["candidates"][0]["content"]["parts"][0]["text"].strip()

                # Phản hồi thô dạng text khác
                elif "text" in result:
                    return result["text"].strip()

                # Trả về toàn bộ body nếu không khớp cấu trúc nào nhưng vẫn là chuỗi sạch
                return body.strip()

        except urllib.error.URLError as e:
            print(f"❌ Lỗi gọi API Anthropic Gateway ({url}): {e}")
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
        Giả lập thông minh đầu ra cho test E2E Batch Sequential.
        Định tuyến tuyệt đối chính xác 100% bằng cách sử dụng Biến môi trường
        ngữ cảnh CURRENT_MRP_SOURCE_SLUG do Orchestrator gán thời gian thực.
        """
        prompt_lower = prompt.lower()
        current_slug = os.environ.get("CURRENT_MRP_SOURCE_SLUG", "")

        # =====================================================================
        # 📂 HỒ SƠ 1: LECTURE 14 (BLAST RADIUS ADVANCED)
        # =====================================================================
        if "lecture-14" in current_slug:
            # Planner 14
            if "kỹ sư trưởng" in prompt_lower:
                return json.dumps({
                    "new_nodes": [
                        {
                            "slug": "blast-radius-isolation",
                            "title": "Blast Radius Isolation - Cô lập rủi ro thực thi của Agent",
                            "category": "Guardrails & Safety",
                            "tags": ["blast-radius", "sandbox", "isolation"],
                            "definition": "Cô lập cứng môi trường thực thi của Agent sử dụng container hoặc worktree để giới hạn phạm vi ảnh hưởng phá hoại.",
                            "principles": [
                                "Dựng container dùng một lần cho các tác vụ nhạy cảm.",
                                "Giới hạn tài nguyên phần cứng để chống Agent lặp vô tận."
                            ],
                            "parent": "agent-overreach",
                            "children": [],
                            "causal_core": "agent-overreach",
                            "causal_supporting": ["clean-state"],
                            "causal_derivative": ["token-load-control"]
                        }
                    ],
                    "merge_nodes": [],
                    "reasoning": "Tạo nốt mới Blast Radius Isolation để bổ trợ cho nốt agent-overreach."
                }, ensure_ascii=False)

            # Reducer 14
            if "lead architect" in prompt_lower:
                return json.dumps({
                    "conflicts": [],
                    "new_concepts": [
                        {
                            "name": "Blast Radius Isolation",
                            "suggested_slug": "blast-radius-isolation",
                            "definition": "Cô lập cứng môi trường thực thi của Agent để bảo toàn hệ thống."
                        }
                    ]
                }, ensure_ascii=False)

            # Mapper 14 (mặc định)
            return json.dumps({
                "title": "Bản chắt lọc tự động - Lecture 14",
                "key_takeaways": [
                    "Blast Radius Isolation cô lập cứng rủi ro hoạt động của Agent.",
                    "Sandbox Containerization cô lập môi trường thực thi cục bộ."
                ],
                "keywords": [
                    {"name": "Blast Radius Isolation", "definition": "Cô lập cứng môi trường thực thi của Agent để bảo toàn hệ thống."}
                ],
                "summary": "Bài giảng trình bày các nguyên lý nâng cao để kiểm soát blast radius."
            }, ensure_ascii=False)

        # =====================================================================
        # 📂 HỒ SƠ 2: LECTURE 15 (TOKEN BUDGET UNDER LARGE LOAD)
        # =====================================================================
        elif "lecture-15" in current_slug:
            # Planner 15
            if "kỹ sư trưởng" in prompt_lower:
                return json.dumps({
                    "new_nodes": [
                        {
                            "slug": "token-load-control",
                            "title": "Token Load Control - Kiểm soát tải token",
                            "category": "Cognitive Management",
                            "tags": ["token-budget", "load-control"],
                            "definition": "Cơ chế quản lý tải token bằng cách giới hạn số lượng request API tối đa trong một phiên.",
                            "principles": [
                                "Tự động ngắt kết nối nếu Agent gọi API liên tục vượt ngưỡng cho phép.",
                                "Giới hạn Token budget cứng theo cấu hình."
                            ],
                            "parent": "token-budget",
                            "children": [],
                            "causal_core": "token-budget",
                            "causal_supporting": ["blast-radius-isolation"],
                            "causal_derivative": []
                        }
                    ],
                    "merge_nodes": [
                        {
                            "slug": "blast-radius-isolation",
                            "updated_definition": "Cô lập cứng môi trường thực thi của Agent và giới hạn request mạng để đồng thời bảo toàn Token Budget.",
                            "added_principles": [
                                "Giới hạn request mạng tối đa ở Sandbox để tránh rò rỉ token."
                            ],
                            "added_children": ["token-load-control"],
                            "updated_causal_derivative": ["token-load-control"]
                        }
                    ],
                    "reasoning": "Merge ý nghĩa bảo vệ token budget vào nốt blast-radius-isolation, và tạo nốt mới token-load-control nối cha với token-budget."
                }, ensure_ascii=False)

            # Reducer 15
            if "lead architect" in prompt_lower:
                return json.dumps({
                    "conflicts": [
                        {
                            "keyword": "Blast Radius Isolation",
                            "existing_slug": "blast-radius-isolation",
                            "action": "merge",
                            "reason": "Khái niệm này vừa được tạo bởi nốt blast-radius-isolation, cần merge thêm ý nghĩa quản trị token."
                        }
                    ],
                    "new_concepts": [
                        {
                            "name": "Token Load Control",
                            "suggested_slug": "token-load-control",
                            "definition": "Kiểm soát tải token bằng cách giới hạn request API tối đa của Agent."
                        }
                    ]
                }, ensure_ascii=False)

            # Mapper 15
            return json.dumps({
                "title": "Bản chắt lọc tự động - Lecture 15",
                "key_takeaways": [
                    "Token Budget của Agent dễ bị cạn kiệt khi tải lớn.",
                    "Blast Radius Isolation lớp mạng lưới giúp bảo vệ ngân sách token."
                ],
                "keywords": [
                    {"name": "Blast Radius Isolation", "definition": "Cô lập cứng môi trường thực thi của Agent để bảo toàn hệ thống."},
                    {"name": "Token Load Control", "definition": "Kiểm soát tải token bằng cách giới hạn request API tối đa của Agent."}
                ],
                "summary": "Bài giảng phân tích cách quản trị token budget dưới tải lớn."
            }, ensure_ascii=False)

        # =====================================================================
        # 📂 HỒ SƠ 3: LECTURE 16 (CAUSAL WEB VISUALIZATION)
        # =====================================================================
        elif "lecture-16" in current_slug:
            # Planner 16
            if "kỹ sư trưởng" in prompt_lower:
                return json.dumps({
                    "new_nodes": [
                        {
                            "slug": "semantic-graph-visualization",
                            "title": "Semantic Graph Visualization - Trực quan hóa đồ thị ngữ nghĩa phẳng",
                            "category": "Workflow Architecture",
                            "tags": ["graph-view", "visualization", "causal-web"],
                            "definition": "Trực quan hóa đồ thị ngữ nghĩa thông qua các mối liên kết markdown phẳng và Causal Web.",
                            "principles": [
                                "Sử dụng Obsidian Graph View để theo dõi vết liên kết.",
                                "Phát hiện nhanh các nốt mồ côi (orphan nodes) bằng đồ thị trực quan."
                            ],
                            "parent": "three-tier-memory-architecture",
                            "children": [],
                            "causal_core": "three-tier-memory-architecture",
                            "causal_supporting": [],
                            "causal_derivative": []
                        }
                    ],
                    "merge_nodes": [],
                    "reasoning": "Tạo nốt mới Semantic Graph Visualization để bổ trợ trực quan."
                }, ensure_ascii=False)

            # Reducer 16
            if "lead architect" in prompt_lower:
                return json.dumps({
                    "conflicts": [],
                    "new_concepts": [
                        {
                            "name": "Semantic Graph Visualization",
                            "suggested_slug": "semantic-graph-visualization",
                            "definition": "Trực quan đồ thị ngữ nghĩa qua các mối liên kết phẳng."
                        }
                    ]
                }, ensure_ascii=False)

            # Mapper 16
            return json.dumps({
                "title": "Bản chắt lọc tự động - Lecture 16",
                "key_takeaways": [
                    "Trực quan hóa Causal Web phẳng qua Obsidian Graph View.",
                    "Semantic Graph Visualization hỗ trợ kiểm soát vết tiến hóa."
                ],
                "keywords": [
                    {"name": "Semantic Graph Visualization", "definition": "Trực quan đồ thị ngữ nghĩa qua các mối liên kết phẳng."}
                ],
                "summary": "Bài giảng trình bày cách trực quan hóa mạng lưới đồ thị phẳng."
            }, ensure_ascii=False)

        # =====================================================================
        # 📂 LECTURE 13: DEFAULT (global-context-loss / no-accumulation)
        # =====================================================================
        else:
            # Planner 13
            if "kỹ sư trưởng" in prompt_lower:
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
                            "definition": "Khi tài liệu thay đổi, VectorDB chỉ chèn thêm vector mới thay vì hợp nhất tri thức, dẫn đến mâuthuẫn.",
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

            # Reducer 13
            if "lead architect" in prompt_lower:
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
                            "definition": "Hệ thống không tích lũy tri thức, dẫn đến mâuthuẫn giữa dữ liệu cũ và mới."
                        }
                    ]
                }, ensure_ascii=False)

            # Mapper 13
            return json.dumps({
                "title": "Bản chắt lọc tự động - Lecture 13",
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
