---
id: lecture-13-why-mrp-pipeline-triumphs-over-vector-dbs
title: "Lecture 13 - Tại sao quy trình MRP Pipeline chiến thắng Vector DBs truyền thống"
category: "Raw Knowledge Source"
tags:
  - raw-source
  - lecture
date: 2026-05-31
status: to-process
---

# Lecture 13 - Tại sao quy trình MRP Pipeline chiến thắng Vector DBs truyền thống

Trong thế giới của các ứng dụng AI doanh nghiệp, người ta thường có xu hướng giải quyết bài toán quản lý tri thức bằng cách ném tất cả tài liệu vào một Vector Database (như pgvector, Pinecone) rồi thực hiện tìm kiếm ngữ nghĩa đơn thuần (Vanilla RAG). Đây là một lối tư duy lười biếng và dẫn đến những thất bại ê chề khi AI Agent cần hoạt động trong production.

## 1. Điểm mù của Vector Database
Vector Database biến các đoạn văn bản thành các vector số học và tính khoảng cách cosine để tìm kiếm. Tuy nhiên, nó có 3 điểm mù chí mạng:
- **Mất bối cảnh tổng thể (Global Context Loss)**: AI chỉ nhận được các "đoạn vụn" (chunks) rời rạc thay vì hiểu cấu trúc cây của tài liệu.
- **Không có tính tích lũy (No Accumulation)**: Khi tài liệu cập nhật, Vector DB chỉ chèn thêm vector mới, dẫn đến tình trạng AI đọc được cả thông tin cũ mâu thuẫn lẫn thông tin mới.
- **Ảo tưởng phi kiểm soát (Uncontrolled Hallucinations)**: AI không thể truy vết ngược dòng xem tuyên bố đó nằm chính xác ở dòng nào, trang nào của tài liệu thô.

## 2. Bản chất của quy trình MRP Pipeline (Map -> Reduce -> Plan -> Refine -> Verify -> Commit)
MRP Pipeline biến tài liệu thô thành một **Cây tri thức đồ thị phẳng (Flat Knowledge Graph)** thay vì đống vector lộn xộn.
- **Pha Map (Chắt lọc)**: Đọc sâu tài liệu thô, trích xuất cấu trúc ngữ nghĩa và Keywords.
- **Pha Reduce (Khử trùng & Phát hiện Xung đột)**: So sánh khái niệm mới với đồ thị tri thức hiện tại để phát hiện mâu thuẫn hoặc trùng lặp.
- **Pha Plan (Lập kế hoạch)**: Sinh ra bản nháp mô tả nốt nào sẽ được tạo mới, nốt nào cần trộn (merge) kiến thức để con người phê duyệt trước khi commit.
- **Pha Refine (Thực thi)**: Tự động lắp ráp nốt mới, liên kết chéo backlinks và quan hệ cha-con (parent/children).
- **Pha Verify (Kiểm toán)**: Quét toàn bộ đồ thị để đảm bảo 0 liên kết gãy.
- **Pha Commit (Đóng dấu)**: Đánh dấu trạng thái, lập chỉ mục và hoàn tất.

---
Nguồn gốc: Giáo trình tối tân của Kỹ nghệ Harness Engineering.
URL: https://walkinglabs.github.io/learn-harness-engineering/vi/lecture-13/
