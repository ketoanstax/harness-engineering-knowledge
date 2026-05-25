---
id: 20260525-harness-engineering-ai-report
aliases:
  - "Tổng hợp kiến trúc Harness Engineering từ harness-engineering.ai"
tags:
  - distilled
  - insight
  - harness-engineering
  - report
  - harness-engineering-ai
date: 2026-05-25
---

# Bao cao Tong hop: Kien truc Harness Engineering cho AI Agent tu harness-engineering.ai (Kai Renner)

## Loi mo dau

Tai lieu nay tong hop, giai thich va ket noi toan bo kien thuc tu trang web `https://harness-engineering.ai/` cua tac gia **Kai Renner** vao Vault Harness Engineering. Khac voi cac bai giang co ban (13 bai) va video transcript (9 thanh phan), tai lieu nay cung cap **goc nhin production-thuc te** ve Harness Engineering -- no khong chi la ly thuyet, ma la nhung gi da duoc kiem chung bang du lieu tu OpenAI, Vercel, Stripe, LangChain, Manus, va Anthropic.

Muc tieu: giai thich ro rang, de hieu tung khai niem bang tieng Viet, co hinh anh so sanh va vi du cu the.

---

## I. Harness Engineering la gi? Tai sao goi la "80% Factor"?

### Van de

Ban co mot LLM rat thong minh (GPT-4, Claude 4). Ban giao cho no mot task. No bat dau lam. Mot luc sau, no bi lac. No lam sai nhung tuong la dung. No ton $500 chi cho mot task le ra chi ton $5.

Tai sao? Vi ban moi co **model tot**, nhung chua co **Harness tot**.

### Dinh nghia don gian

Harness Engineering la **nganh ky thuat xay dung tang ha tang chay ben ngoai model**, nam giua yeu cau cua ban va output cuoi cung cua Agent. Model la AI. Harvest la **moi thu con lai**:

- Model: sinh ra van ban.
- Harness: quyet dinh model thay gi, co the lam gi, khi nao dung lai, va xu ly loi the nao.

### Hinh anh so sanh

**CPU vs Operating System:** Model la CPU -- mot cuc silicon tinh toan thong minh. Harness la Windows/Linux/macOS -- he dieu hanh giam sat CPU, cap phat bo nho, quan ly tien trinh, xu ly loi, va giao tiep voi ngoai vi.

**Ngua va Yen Cuong (Horse Tack):** Model la con ngua to khoe. Harness la bo yen cuong (day cuong, yen, ban dap). Con ngua co chay nhanh may cung vo ich neu khong co yen cuong de dieu khien, chuyen huong no keo xe dung huong. Yen cuong la thu lam con ngua HUU ICH.

### 80% Factor

Thay doi model (vi du tu GPT-4 sang Claude 4.7) chi cai thien duoc 10-15% do tin cay. Thay doi Harness co the cai thien **40-80%**. Ly do: 

Khai niem "40-point difference": Hai team cung mot model, cung mot task, nhung Harness khac nhau -- completion rate chenh lech 40%. Mot team dat 83%, team kia dat 96%, chi nho them structured verification. **Model khong doi. Prompt khong doi. Chi co Harness thay doi.**

Do do: **Harness la loi the canh tranh (moat)**, khong phai model.

---

## II. Phan biet Framework va Harness -- nham lan lon nhat

Day la mot trong nhung dieu kho hieu nhat. Nhieu nguoi nghi LangChain, CrewAI la Harness. Khong phai.

| Tieu chi | Framework | Harness |
|----------|-----------|---------|
| Ai dung? | Lap trinh vien | AI Agent |
| Ai lai ai? | Ban lai framework (ban goi no) | No lai ban (no ra lenh) |
| So cach lap rap | Hang ngan cach | Mot con duong mang dinh huong cao |
| Permission? | Khong co | Phan tang theo rui ro |
| Doc gi? | Code | Context |
| Vi du | LangChain, CrewAI, AutoGen | Claude Code, Cursor, Devin |

**Noi de hieu:** Ban xay ung dung bang Framework (build-time). Ban CHAY ung dung trong Harness (runtime).

---

## III. Agent Harness gom 6 lop (The Six Core Layers)

Mot Harness hien dai co 6 lop, chia lam 2 nhom:

### Nhom 1: Foundation (Ha tang nen tang)

**1. Context Engineering (Ky thuat Ngu canh)**
- Quan ly thong tin model thay duoc o moi buoc: system prompt, retrieval, lich su, trang thai moi truong.
- Chu dong prune (cat bot) va tom tat (summarize) de tranh tran context window.
- Do chinh xac quan trong hon do lon. Vi du that: Vercel giam so luong tool tu 15 xuong 2, accuracy tang tu 80% len 100%, so token giam 37%, toc do nhanh hon 3.5 lan.

**2. Tool Orchestration (Dieu phoi Cong cu)**
- Quyet dinh tool nao duoc dung o phase nao.
- Kiem tra argument truoc khi goi (input validation).
- Sandboxing, timeout, error handling sau khi goi.
- Nguyen tac: "Constraining the tool set per step reduces errors and token waste."

**3. State & Memory Management (Quan ly Trang thai & Bo nho)**
- Durable checkpoint-resume: ghi lai trang thai Agent sau moi buoc thanh cong, neu crash thi phuc hoi tu do.
- Giam 30-50% chi phi token khi phuc hoi.
- Cross-session memory: nho nhung gi da hoc qua cac phien.

### Nhom 2: Safety (An toan)

**4. Verification & Safety (Xac minh & An toan)**
- Kiem tra output truoc khi thuc hien hanh dong that.
- Kiem tra schema: output co dung dinh dang khong? Co thieu truong bat buoc khong?
- "Single highest-ROI component": mot team tang tu 83% len 96% chi bang cai nay.

**How verification works:**
- Simple: kiem tra khuon mau output, mat 50-150ms.
- Complex: dung LLM thu hai de danh gia chat luong, mat 1-5 giay.

**5. Human-in-the-Loop (Con nguoi trong Vong lap)**
- Approval gates cho cac hanh dong: huy diet (destroy DB), tai chinh (gui tien), thay doi ha tang (deploy), tac dong ra ngoai (gui email).
- Hai che do: 
  - Pre-authorization: BAT BUOC cho duyet truoc khi chay.
  - Post-execution review: chay truoc, review sau, neu sai thi rollback.

**6. Lifecycle Management (Quan ly Vong doi)**
- Health checks: kiem tra Agent con song khong.
- Resource limits: gioi han CPU, memory, token.
- Graceful shutdown: tat tu tu, khong gay mat du lieu.
- Crash recovery: phat hien crash va khoi dong lai.

---

## IV. 5 Nguyen ly cot loi (The Five Core Principles)

Nam nguyen ly nay la **kim chi nam** de thiet ke bat ky Harness nao:

1. **Context Engineering (Kiem soat DAU VAO):** Agent biet gi? Nhung gi no biet o moi buoc. Thu thap dong tu nhieu nguon. Cat bot neu khong can.

2. **Tool Orchestration (Kiem soat HANH DONG):** Agent co the LAM gi? Tool it hon nhung tot hon. Can than trong voi moi tich hop API.

3. **Verification Loops (Kiem soat CHAT LUONG DAU RA):** Kiem tra output truoc khi tiep tuc. Day la buoc co ROI cao nhat. Bat dau tu day.

4. **Cost Envelope Management (Kiem soat TAI NGUYEN):** Dat han muc token/chi phi cho moi task. Khong de chay khong kiem soat.

5. **Observability & Evaluation (Kiem soat QUAN SAT):** Ghi lai tung buoc, tung tool call, tung token. Do lien tuc. Khong the cai thien thu khong the thay.

---

## V. 3 Mo hinh kien truc Agent (Architecture Patterns)

### Pattern 1: Single Agent + Verification Loop

`User >> Agent >> Verification >> Output`

- Mot Agent duy nhat.
- Verification kiem tra tung tool action.
- Co cost ceiling: gioi han tien/token.
- Context update o moi buoc.
- **Dung cho 80% use cases.**

### Pattern 2: Two-Agent Supervisor (Anthropic)

`User >> Executor Agent >> Supervisor Agent >> Output`

- Agent chinh thuc thi task.
- Agent supervisor review tung buoc cua Agent chinh.
- Supervisor co the override, yeu cau sua, hoac approve.
- Then 1 LLM call/buoc, ~2x token cost so voi Pattern 1.
- **Dung khi sai lam dat gia:** bao cao tai chinh, customer-facing agent, coding tren production system.

### Pattern 3: Multi-Agent + Shared Harness

`User >> Shared Harness >> Agent A + Agent B + Agent C >> Output`

- Nhieu Agent chuyen biet (nghien cuu, code, review).
- Phoi hop qua mot Shared Harness layer.
- **Chi phi: ~15x single agent.**
- **Khi nao dung:** Khi Single Agent khong du, hoac when can co lap trust boundaries that su.
- **Monolithic-Agent-First Rule:** LUON bat dau voi single agent. Chi split khi that su can.

---

## VI. Quy trinh trien khai 5 cong (5-Gate Deployment)

Deploy Agent thay doi khong giong deploy app thong thuong. Vi Agent co hanh vi ngau nhien (stochastic), can mot quy trinh dac biet:

**Cong 1: Evaluation** -- Chay trong staging. Kiem tra baseline accuracy voi 3 loai cau hoi: thuong, bien (edge case), doc hai.

**Cong 2: Shadow Mode** -- Chay Agent song song tren production traffic that, nhung **KHONG tra output cho nguoi dung**. Chi capture du lieu de so sanh: Agent moi co lam tot hon Agent cu khong?

**Cong 3: Canary** -- Chuyen 5% production traffic sang Agent moi trong 48 gio. Theo doi metric: task completion rate, latency, cost, tool call success rate.

**Cong 4: Graduated Rollout** -- Tang dan 25% -> 50% -> 100%. Moi muc giu toi thieu 24 gio de quan sat.

**Cong 5: Post-Deployment Validation** -- Giam sat chat che trong 1 tuan de phat hien behavioral drift (thay doi hanh vi tu tu).

---

## VII. He thong quan tri 4 tang (Governance Stack)

Governance cua AI Agent kho hon governance phan mem thuong vi ban khong the doan truoc hanh vi cua Agent. No "noi len" (emerge) tu instructions + tools + context + cai cach LLM sampling.

### Tang 1: Identity & Permissions

- **Moi Agent co identity rieng** (IAM role rieng trong AWS, API key rieng cho tool).
- Shared service accounts bi CAM.
- Database: read-only mac dinh, chi mo write khi that su can.
- Kiem toan hang thang: thu hoi permission khong dung sau 30 ngay.

### Tang 2: Policy Enforcement Point (PEP)

Day la **Interceptor** nam giua Agent va tool. Moi tool call bi chan truoc khi thuc thi:

```
Agent -> [YEU CAU] -> PEP -> KIEM TRA Policy Rules -> Allow/Deny/Escalate -> Tool
```

**QUAN TRONG:** Policy rules song BEN NGOAI context cua Agent. Day KHONG PHAI la prompt instructions. Agent khong the override.

Vi du rule cu the:
- "Khong duoc sua tai khoan co so du > $50,000"
- "Khong duoc xoa > 100 records mot luc"
- "Khong duoc gui email khuyen mai giam > 20%

### Tang 3: Audit Trails (Kiem toan)

Moi hanh dong cua Agent phai duoc ghi vao **append-only log** (chi ghi them, khong duoc xoa). Agent KHONG duoc tu sua audit records cua chinh no.

**5 cau hoi ma bat ky he thong Governance nao cung phai tra loi duoc:**
1. Agent X da lam gi tu 9h-10h hom qua?
2. Ai uy quyen nhung hanh dong do?
3. Du lieu nao bi truy cap hoac sua?
4. Chi phi la bao nhieu?
5. Policy nao bi trigger? Giai quyet the nao?

### Tang 4: Human Oversight (Giam sat & Leo thang)

Hai che do:
- **Pre-authorization:** Cho nguoi duyet truoc khi thuc thi (dung cho hanh dong khong the undo).
- **Post-execution review:** Thuc thi ngay, danh de review sau, co ROLLBACK neu can.

Leo thang (escalation) phai:
- Gui den dung nguoi truc (khong phai Slack chung).
- Kem full context: task la gi, action la gi, policy nao bi chan.
- Co deadline: het han ma khong tra loi -> auto-deny.

### Cost Governance (Quan ly Chi phi)

Budget overruns KHONG PHAI la reliability problem -- la **governance failure**. Moi Agent can:
- Max spend PER TASK
- Max spend PER HOUR
- Max spend PER DAY

Enforced o **Harness layer**, khong phai API settings.
- Baseline: $0.08/record
- Per-task limit: 2.5x baseline = $0.20
- Anomaly alert: 1.5x baseline
- Hard limit: bao gio cung cat tai day, khong de chay qua.

---

## VIII. Context-Switch Fatigue -- sa tham lang trong Multi-Agent

### Van de

Ban co 3 Agent: Agent A (nghien cuu) -> Agent B (code) -> Agent C (review). A gui thong tin cho B, B gui tiep cho C.

Ket qua C thay giong nhung ket qua A. Tai sao? Vi o moi buoc banh gui, **thong tin bi mat mot phan**. No giong tro choi dien thoai -- sau 3 nguoi, cau chuyen ban dau da khong con nguyen ven nua.

### Tai sao

Co **8 buoc** trong mot lan handoff (chuyen giao) Agent, va co **4 diem bi mat thong tin**:
1. A tao task -> 2. **SERIALIZATION** (mat thong tin lan 1) -> 3. Message queue -> 4. B khoi dong -> 5. **CONTEXT RECONSTRUCTION** (mat thong tin lan 2) -> 6. B thuc thi -> 7. **RESULT MARSHALING** (mat thong tin lan 3) -> 8. **A NHAN KET QUA** (mat thong tin lan 4)

Trong chuoi 5 hop: 20 diem mat thong tin. Nghien trong: **"Moi hop chi co the mat thong tin, khong bao gio thu hoi."**

### Giai phap (Harness-Level, khong phai Prompt)

**1. Context Re-Injection:** Truoc moi khi goi Agent, Harness tu dong chen original goal + rang buoc chinh vao system prompt.

**2. Structured Handoff Schema:** Dung data object (kieu nhu JSON voi schema) thay vi van xuoi. Gom:
- `original_goal` (GIU NGUYEN VAN, khong tom tat)
- `decisions_made` (quyet dinh + ly do)
- `open_assumptions` (gia dinh can biet)
- `tool_state_snapshot` (tool dang khoa, resource dang dung)
- `schema_version` (version de dam bao tuong thich)

**3. Goal-Echo:** Moi Agent doc original_goal NGUYEN VAN truoc khi lam viec.

**4. Fidelity Checkpoint:** Mot Agent nhe o hop 3 kiem tra: "Muc tieu hien tai con giong muc tieu goc khong?" Neu diem tuong dong < 0.85 -> alert, dung lai, cho con nguoi kiem tra.

**5. Circuit Breaker:** Dung chain khi vuot qua so hop cho phep ma khong co human checkpoint.

---

## IX. Kien truc bo nho 3 tang (Memory Tier Architecture)

Agent can nho nhieu thu, nhung khong phai thu nao cung can nho giong nhau. Giai phap: 3 tang.

| Tang | O dau? | Song bao lau? | Dung de lam gi? |
|------|--------|---------------|-----------------|
| **Ephemeral** | Trong context cua LLM | Mot lan goi | Nho tam: buoc hien tai dang lam gi |
| **Working** | Redis/cache | Mot chain execution | Nho de chia se giua cac Agent trong 1 task |
| **Archival** | Vector DB / SQL | Xuyen session, xuyen user | Nho lau: so thich nguoi dung, kien thuc mien |

**Quy tac quan trong:** Khong day moi thu len Archival. Chi day len Working khi can song qua ranh gioi Agent. Chi day len Archival when can song xuyen session.

**Khong** dung ca stateful va stateless handoff trong cung chain -- tao ca 2 loai loi cung luc.

---

## X. Cac con so biet noi (Quantified Metrics)

Dong nay danh cho nhung ai can thuyet phuc team hoac quan ly.

| Metric | So lieu | Nguon |
|--------|---------|-------|
| Task completion tang nho verification | 83% -> 96% (model khong doi) | Multiple teams |
| Two teams cung model khac Harness | Chenh lech 40 diem phan tram | Industry data |
| Tool call fail trong production | 3-15% (so 1 reliability killer) | Aggregate |
| 20 buoc chain, 95% accuracy/buoc | Tong: 36% hoan thanh | Math |
| Checkpoint resume tiet kiem token | 30-50% | Multiple teams |
| Vercel giam tool | 15 -> 2 tool, accuracy 80% -> 100%, token -37%, speed 3.5x | Vercel |
| OpenAI Codex | 1M+ dong code, 3 engineer, 5 thang | OpenAI |
| Stripe Minions | 1,000+ merged PRs/tuan | Stripe |
| Manus cost reduction | 10x | Manus (KV-cache + context mgmt) |
| LangChain Terminal Bench | 52.8% -> 66.5% (khong doi model) | LangChain |
| Semantic caching | Cat 20-40% repeat queries, giam 60% prompt cost | Industry |
| Multi-agent token cost | ~15x single agent: $0.50-$5.00 vs $0.10-$0.50 | Estimate |
| Deployment cost thuc te | $3,200-$13,000/thang | Survey |
| Team co agent trong production | 57% (2025-2026) | Industry |
| Observability ROI | $5-10K upfront -> saves >$30K | Survey |

---

## XI. Ma tran lien ket -- Cac khai niem moi lien he voi nhau the nao

Khi ban doc cac khai niem tren, day la cach chung lien quan:

- **Harness Moat** la tong the -> **6 Layers** la kien truc cu the -> **5 Principles** la tu duy thiet ke -> **3 Patterns** la hinh thuc trien khai -> **5-Gate Deployment** la cach dua ra production -> **Governance** la cach kiem soat -> **Context-Switch** la van de phat sinh -> **Memory Tier** la giai phap cho van do -> **Metrics** la bang chung.

---

## 🔗 Knowledge Connections Map

### Node moi tu nguon nay:
- [Harness Moat & 80% Factor](02_atomic_nodes/HAE-concept-harness-moat-factor80.md)
- [6 Lop Kien Truc Harness](02_atomic_nodes/HAE-concept-six-harness-layers.md)
- [5 Nguyen Ly Cot Loi](02_atomic_nodes/HAE-concept-five-harness-principles.md)
- [3 Mo Hinh Kien Truc Agent](02_atomic_nodes/HAE-concept-three-harness-patterns.md)
- [5 Cong Trien Khai Production](02_atomic_nodes/HAE-concept-five-stage-deployment.md)
- [4 Tang Quan Tri (Governance)](02_atomic_nodes/HAE-concept-four-governance-layers.md)
- [Context-Switch Fatigue & Handoff Schema](02_atomic_nodes/HAE-concept-context-switch-fatigue-handoff.md)
- [Kien Truc Bo Nho 3 Tang](02_atomic_nodes/HAE-concept-three-tier-memory-architecture.md)
- [Chi So Do Luong Hieu Qua](02_atomic_nodes/HAE-concept-harness-quantified-metrics.md)

### Node hien co lien quan:
- [Dinh nghia Harness](02_atomic_nodes/HAE-concept-harness-definition.md)
- [System of Record](02_atomic_nodes/HAE-concept-system-of-record.md)
- [Outer Loop](02_atomic_nodes/HAE-concept-outer-loop.md)
- [Context Manager](02_atomic_nodes/HAE-concept-context-manager.md)
- [Sub-Agent](02_atomic_nodes/HAE-concept-sub-agent.md)
- [Permission Layers](02_atomic_nodes/HAE-concept-permission-layers.md)
- [Session Persistence](02_atomic_nodes/HAE-concept-session-persistence.md)
- [Lifecycle Hooks](02_atomic_nodes/HAE-concept-lifecycle-hooks.md)
- [Agent Overreach](02_atomic_nodes/HAE-concept-agent-overreach.md)
- [E2E Testing](02_atomic_nodes/HAE-concept-e2e-testing.md)
- [Tuyen ngon Harness Engineering](04_distilled/harness-engineering-manifesto.md)
