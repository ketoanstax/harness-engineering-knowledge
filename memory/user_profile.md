# Hồ sơ Người dùng (User Profile)

## 👤 Thông tin & Vai trò
- **Vai trò**: Chuyên gia Tổ chức & Quản lý dữ liệu tri thức, Kỹ sư trưởng (Lead Architect).
- **Trách nhiệm**: Định hướng cấu trúc dữ liệu, thiết kế hệ thống Harness cho AI Agent, xây dựng các quy trình tự động hóa thông minh và quản trị chất lượng tri thức.

## ⚙️ Sở thích & Phong cách Cộng tác
- **Sự chặt chẽ tối đa (Strictness & Discipline)**: Yêu cầu AI Agent tuân thủ tuyệt đối các quy định thiết kế, phân cấp thư mục rõ ràng và không được tự ý giản lược.
- **Yêu cầu Plan Mode & Phê duyệt Trước khi Sửa đổi (Plan Mode & Approval Gate)**: Bắt buộc AI Agent phải trình bày kế hoạch trước (hoặc sử dụng Plan Mode) và nhận được sự xác nhận rõ ràng của Người dùng trước khi tạo mới hoặc sửa đổi bất kỳ tệp tin nào trong workspace. Tuyệt đối cấm tự ý sửa đổi chủ động (proactive editing) mà chưa có sự đồng ý.
- **Tiền tố 2 chữ số**: Sử dụng tiền tố 2 chữ số (`00_raw_docs`, `01_structured_docs`, `02_atomic_nodes`,...) cho toàn bộ cấu trúc thư mục của kho tri thức để thể hiện rõ ràng luồng tri thức phân rã.
- **Graph View Connectivity (Liên kết Graph)**: Bắt buộc các nốt nguyên tử phải liên kết ngược dòng dẫn chứng (về tận dữ liệu thô ban đầu) để khi mở một nốt độc lập, vẫn nhìn thấy bức tranh tổng thể và dẫn chứng của nó trên đồ thị mạng lưới.
- **Tự động hóa thông minh (Intelligent Automation)**: Ưa thích các cơ chế tự động hóa (Closed Feedback Loop) như tự động cập nhật RULE và MEMORY từ feedback của người dùng để giảm thiểu thao tác thủ công và duy trì độ tin cậy của hệ thống.

## 🌳 Triết lý Tri thức (Knowledge Philosophy)
- **Mô hình Cây Mở Rộng (Tree Expansion)**: Tri thức phải PHÁT TRIỂN (expand) thành cây, không NÉN (compress) lại. Mỗi nguồn dữ liệu thô tạo ra một cây tri thức riêng biệt với gốc, nhánh, lá.
- **Lưu trữ Phẳng (Flat Storage)**: Tất cả node nằm phẳng trong `02_atomic_nodes/` — quan hệ cha-con thể hiện bằng link và metadata, KHÔNG bằng thư mục con. Mục đích: dàn trải dữ liệu ra, không che dấu.
- **Chia Node Có Chủ Đích**: Chỉ tách sub-node khi nội dung đủ phức tạp. Nếu đơn giản thì giải thích ngay trong node gốc. Node linh hoạt nhảy sang cấp cao/thấp hơn — miễn sao user hiểu thông suốt.
- **Tầm nhìn Gộp Vault (Multi-Vault Vision)**: Đích cuối cùng là gom nhiều vault lại → đan xen tri thức → tìm điểm kết nối liên domain → tạo quy luật giúp con người nhẹ nhàng hơn trong ghi nhớ và vận dụng.
- **Workspace-Relative Only**: Tuyệt đối không dùng đường dẫn tuyệt đối hay `../` — repo phải portable, pull về bất kỳ đâu đều chạy được.
