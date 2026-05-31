"""
MRP Pipeline (Map → Reduce → Plan → Refine → Verify → Commit)
=============================================================

Hệ thống biên dịch và phân rã tri thức tự động cho Harness Engineering Vault.
Biến tài liệu thô (`00_raw_docs`) thành một hệ thống nốt nguyên tử đồ thị
(`02_atomic_nodes`) với khả năng kiểm toán liên kết ba chiều.

Kiến trúc: Pipeline với 6 pha xử lý độc lập (Single Responsibility).
Triết lý: "Luôn xịn sò hơn Arkon về mọi khía cạnh."
"""

__version__ = "0.1.0"
