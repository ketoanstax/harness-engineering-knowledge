# Kỹ năng Chuyên gia: Hỏi đáp & Tự động Tiến hóa Tri thức (HAE QA & Evolution Oracle)

Kỹ năng này chịu trách nhiệm hỏi đáp với Người dùng dựa trên kho tri thức hiện có của dự án và điều phối **Vòng Lặp Tự Tiến Hóa Tri Thức (Knowledge Self-Evolution Loop)** để cập nhật tri thức mới chất lượng cao một cách an toàn và sạch sẽ.

---

## 🧭 Quy trình Hỏi đáp Tận dụng Kho Tri thức (Internal QA Protocol)

Khi Người dùng đặt câu hỏi về Harness Engineering hoặc bối cảnh dự án, Agent **BẮT BUỘC** phải thực hiện các bước sau:

1.  **Tra cứu Nội bộ Trước tiên (Search First)**:
    *   Sử dụng công cụ tìm kiếm hoặc trực tiếp đọc bảng định tuyến [AI_ROUTING_TABLE.md](03_neural_map/AI_ROUTING_TABLE.md) và chỉ mục [INDEX.md](03_neural_map/INDEX.md) để khoanh vùng các nốt liên quan.
    *   Đọc các nốt nguyên tử tại `02_atomic_nodes/` và tài liệu chắt lọc tại `01_structured_docs/`.
2.  **Đầu ra Dựa trên Bằng chứng Nội bộ (Evidence-based Response)**:
    *   Câu trả lời phải trích dẫn trực tiếp từ các tài liệu trong vault.
    *   Sử dụng cú pháp liên kết markdown workspace-relative để trỏ tới nguồn dẫn chứng, ví dụ: `[Tên node](02_atomic_nodes/HAE-concept-....md)`.
    *   Nếu kiến thức trong vault đã đủ giải thích, tuyệt đối không được tự ý bịa đặt hoặc suy diễn thêm các khái niệm ngoài không có căn cứ.

---

## 🔄 Quy trình Tự Tiến Hóa Tri Thức khi gặp Khoảng Trống (Self-Evolution Workflow)

Trong trường hợp câu hỏi của Người dùng nằm ngoài phạm vi tri thức hiện tại của vault hoặc tài liệu hiện có không đủ để trả lời một cách thỏa đáng, Agent phải kích hoạt **Quy trình Tự Tiến Hóa Tri Thức**:

```text
 [Nhận câu hỏi] ──> Tra cứu Vault ──> [Có kiến thức?] ──> Có ──> Trả lời kèm dẫn chứng trỏ tới Vault
                                           │
                                         Không
                                           │
                                           ▼
                                 [KÍCH HOẠT TIẾN HÓA]
                                           │
                                           ▼
                              Nghiên cứu Kiến thức Ngoài Sạch
                        (Logical explanation + Concrete evidence)
                                           │
                                           ▼
                             Thiết kế Cây & Causal Web đề xuất
                                           │
                                           ▼
                            [CỔNG PHÊ DUYỆT CỦA NGƯỜI DÙNG]
                                           │
                                  ┌────────┴────────┐
                                Từ chối          Đồng ý
                                  │                 │
                                  ▼                 ▼
                             Dừng / Hủy       Viết note mới (hae-writer)
                                              Ghi feedback log & Chạy script
                                              sync/audit để verify 100%
```

### Pha 1: Nhận diện Khoảng trống Tri thức (Knowledge Gap Detection)
*   Thừa nhận trung thực với Người dùng rằng kho tri thức hiện tại chưa có thông tin về vấn đề này.
*   Thông báo rõ ràng việc kích hoạt **Quy trình Tự Tiến Hóa Tri Thức** để bổ sung mảnh ghép thiếu này.

### Pha 2: Giao thức Nghiên cứu Kiến thức Ngoài Sạch (Clean External Research Protocol)
Để đảm bảo tri thức nạp vào hệ thống là **"SẠCH VÀ CHẤT LƯỢNG CAO"**, Agent phải tuân thủ nghiêm ngặt các quy tắc nghiên cứu sau:
1.  **Ưu tiên Nguồn Uy tín Tối thượng**: Tra cứu từ tài liệu chính thức (Official Docs), các bài báo khoa học (Papers), sách kỹ thuật đầu ngành, hoặc phân tích kỹ thuật sâu từ các chuyên gia uy tín.
2.  **Lập luận Logic & Chứng cứ Cụ thể**:
    *   Mọi câu trả lời và thông tin mới phải dựa trên sự giải thích logic sâu sắc, mô tả rõ cơ chế kỹ thuật bên dưới (How & Why) chứ không chỉ nêu kết luận hời hợt.
    *   Phải có trích dẫn nguồn cụ thể hoặc gắn kèm link tài liệu gốc chất lượng cao từ internet (nếu có).
3.  **Cấm Tuyệt đối Thông tin Rác & Hallucination**:
    *   Không sử dụng các thông tin suy đoán thiếu căn cứ, các bài viết blog kém chất lượng hoặc các câu trả lời do mô hình tự bịa ra.
    *   Tuyệt đối không tự bịa đặt (hallucinate) URL. Chỉ trích dẫn các URL có thật đã được xác thực thông qua công cụ tìm kiếm web.

### Pha 3: Thiết kế Đề xuất Tích hợp (Integration Design & Mapping)
Phác thảo cấu trúc cây tri thức mở rộng (Tree Expansion Model) phẳng và cấu trúc Nhân Duyên Quả để chuẩn bị tích hợp vào vault:
*   **00_raw_docs/**: Đề xuất tên tệp thô để lưu trữ dữ liệu mới cào về hoặc nội dung ghi chép thô.
*   **01_structured_docs/**: Đề xuất tóm tắt cấu trúc.
*   **02_atomic_nodes/**: Phác thảo danh sách các nốt nguyên tử mới cần tạo, xác định rõ:
    *   *Nốt cha (parent)* và *Nốt con (children)* trong hệ thống.
    *   *Mạng lưới Nhân Duyên Quả (Causal Web)*: Liên kết ngược dòng dẫn chứng và đề xuất "Duyên ẩn" liên kết với các nốt hiện có trong vault.

### Pha 4: Cổng Phê duyệt của Người dùng (User Confirmation Gate - BẮT BUỘC)
*   **KHÔNG ĐƯỢC TỰ Ý TẠO FILE HAY SỬA CODE** khi chưa được Người dùng cho phép.
*   Trình bày câu trả lời nghiên cứu sạch kèm theo **Đề xuất tích hợp chi tiết** cho Người dùng.
*   Yêu cầu Người dùng xác nhận rõ ràng: *"Bạn có đồng ý tiến hành tích hợp kiến thức mới này vào kho tri thức của dự án không?"*
*   Chỉ khi Người dùng phê duyệt (bằng tin nhắn dạng `Đồng ý`, `Yes`, `Tiến hành`, v.v.), Agent mới chuyển sang Pha 5.

### Pha 5: Triển khai Tri thức mới & Kiểm toán Tự động (Deployment & Auto-Audit)
1.  Sử dụng kỹ năng [.agent/hae-writer.md](.agent/hae-writer.md) để tạo các note thô, note cấu trúc và nốt nguyên tử theo đúng mẫu và quy chuẩn.
2.  Cập nhật chỉ mục [INDEX.md](03_neural_map/INDEX.md) và bảng định tuyến [AI_ROUTING_TABLE.md](03_neural_map/AI_ROUTING_TABLE.md).
3.  Ghi nhận phản hồi và bài học rút ra vào [memory/feedback_log.md](memory/feedback_log.md) với trạng thái `status: pending-sync`.
4.  **BẮT BUỘC** chạy script kiểm toán và tự động đồng bộ hóa:
    ```bash
    python3 scripts/sync_rules_and_memory.py
    ```
    Đảm bảo báo cáo trả về đạt `✅ Toàn bộ cấu trúc Cây Tri thức và Liên kết đều nhất quán và portable tuyệt đối!` trước khi báo cáo hoàn thành nhiệm vụ với Người dùng.
