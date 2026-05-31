---
id: harness-engineering-ai-processed
title: "Harness Engineering Website (Kai Renner) - Bản Chắt Lọc Cấu Trúc"
category: "Structured Knowledge"
tags:
  - structured
  - processed
  - harness-engineering
  - agent-harness
  - governance
date: 2026-05-25
source: "00_raw_docs/harness-engineering-ai.md"
---

## Key Takeaways

1. **Harness Engineering là "80% Factor"**: Thành công của AI Agent trong production phụ thuộc 80% vào hạ tầng Harness bao quanh, chỉ 20% vào model. Thay đổi Harness mang lại cải thiện độ tin cậy lớn hơn nhiều so với nâng cấp model.
2. **Verification Loops có ROI cao nhất**: Một team tăng từ 83% lên 96% task completion chỉ bằng verification loops — model không đổi. Đây là bước đầu tiên cần làm.
3. **Context-Switch Fatigue là kẻ giết người thầm lặng**: Multi-agent chain bị suy giảm thông tin không thể thấy ở mỗi hop. 8 bước handoff có 4 điểm entropy; chuỗi 5 hop có 20 điểm mất mát.
4. **Governance phải nằm NGOÀI prompt**: Policy rules phải sống bên ngoài context của agent (Policy Enforcement Point), không phải là prompt instructions mà agent có thể override.
5. **Cost Envelope là governance failure, không chỉ reliability problem**: Budget overruns phải được enforced ở harness layer, không phải API settings. Mỗi agent cần max per task / per hour / per day.

## Keywords & Core Concepts

- **Harness Engineering**: Ngành kỹ thuật xây dựng tầng hạ tầng giữa user request và agent output, không phải bản thân LLM.
- **80% Factor**: Harness quyết định 80% độ tin cậy của hệ thống, model chỉ quyết định 20%.
- **Verification Loop**: Vòng kiểm tra đầu ra trước khi thực thi bước tiếp theo.
- **Cost Envelope**: Ngân sách token/tài chính cứng cho mỗi task ngăn runaway loop.
- **Policy Enforcement Point (PEP)**: Interceptor nằm ngoài agent context, chặn mọi tool call và quyết định allow/deny/escalate.
- **Context-Switch Fatigue**: Sự suy giảm thông tin thầm lặng khi execution di chuyển qua nhiều agent trong multi-agent pipeline.
- **Structured Handoff Schema**: Data object dataclass thay thế prose summaries để truyền context giữa các agent.
- **Memory Tier Architecture**: 3 tầng bộ nhớ — Ephemeral (in-context), Working (cache/Redis), Archival (vector/relational DB).
- **Shadow Mode**: Chạy agent với traffic thật nhưng không deliver output — chỉ capture behavioral data.
- **Agent Harness**: Tầng infrastructure layer wrap quanh AI model, quản lý lifecycle, context, tool access, verification.

## AI-Ready Summary

Trang web harness-engineering.ai của Kai Renner định nghĩa và mở rộng Harness Engineering thành 6 bài viết:
(1) Định nghĩa nền tảng + 5 Core Principles; (2) Guide toàn diện về Agent Harness với 6 Component + 4-Phase Implementation; (3) Context-Switch Fatigue trong multi-agent với Structured Handoff Schema + Memory Tier Architecture; (4) Governance Stack 4 tầng (Identity → PEP → Audit → HITL); (5) 5-Gate Deployment Process + Operational Stack; (6) 5 Infrastructure Layers cho Agentic Systems + Stage Maturity Model.

Nội dung bổ sung và chi tiết hóa vault hiện tại với: Cost Envelope Management (nguyên lý mới), Governance Stack (cấu trúc mới), Context-Switch Fatigue (pattern mới), Memory Tier Architecture (kiến trúc mới), Quantified Metrics (dữ liệu định lượng cho nhiều tuyên bố), và Deployment/Operations framework (khung mới chưa có trong vault).
