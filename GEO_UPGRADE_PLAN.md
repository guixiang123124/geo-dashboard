# GEO Dashboard 升级计划 v2.0

> 基于头部 GEO 工具 (Goodie AI, Profound, Otterly, Semrush, Gauge, GetMint) 的竞品分析  
> 结合 Princeton GEO 论文 (GEO-bench) 和行业最佳实践  
> 日期: 2026-02-05

---

## 一、竞品核心功能对标

### 头部工具功能矩阵

| 功能维度 | Otterly AI | GetMint | Semrush AIO | Goodie AI | Profound | 我们(当前) | 我们(目标) |
|---------|-----------|---------|-------------|-----------|----------|-----------|-----------|
| AI可见性监测 | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️基础 | ✅ |
| 多模型覆盖 | 4模型 | 3模型 | 5模型 | 10+模型 | 8模型 | 1(Gemini) | 3+(Gemini/GPT/Claude) |
| 品牌提及追踪 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅增强 |
| 情感分析 | ✅ | ❌ | ✅ | ✅ | ✅ | ⚠️基础 | ✅NLP |
| 竞品对标 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Citation来源追踪 | ✅ | ✅核心 | ✅ | ✅ | ✅ | ⚠️基础 | ✅ |
| 内容优化建议 | ❌ | ✅核心 | ✅ | ✅ | ✅ | ❌ | ✅ |
| Prompt研究 | ❌ | ❌ | ✅核心 | ✅ | ✅ | ❌ | ✅ |
| Share of Voice | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| 趋势/时序追踪 | ✅周报 | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| 结构化数据审计 | ❌ | ❌ | ✅核心 | ❌ | ✅ | ❌ | ✅ |
| GEO教育内容 | ❌ | ❌ | ❌ | ❌ | ✅博客 | ❌ | ✅专栏 |
| 公开数据集集成 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅差异化 |

### 竞品核心亮点提炼

**Otterly AI (监测型)**
- 输入品牌名+关键词 → 自动获取 GPT/Gemini 回答中的品牌出现次数
- 推荐类型分析（正向/负面/中性）
- 生成可视化报表，判断品牌是否被 AI 识别

**GetMint (截流型)**
- 模拟用户提问，分析 AI 回答的引用来源
- 若 AI 引用竞品内容 → 解析其内容结构
- 帮用户优化自身内容，"夺回"推荐位

**Semrush AIO (审计型)**
- AI 搜索审计：核心是 **提示词研究**
- 揭示用户在 GPT 中的实际提问内容
- 为网站打分，指出结构化数据缺失
- 帮助优化产品信息，提升 AI 理解能力

---

## 二、升级路线图

### Phase 1: 数据基础强化 (本周)
> 优先级：🔴 高 | 难度：中

**1.1 多模型评估**
- [x] Gemini 2.0 Flash 评估 (进行中)
- [ ] 添加 OpenAI GPT-4o-mini 评估 (免费额度有限，用廉价模型)
- [ ] 添加 Claude Haiku 评估 (如有 API key)
- [ ] 跨模型对比视图：同一 prompt 在不同 AI 的品牌推荐差异

**1.2 GEO-bench 公开数据集集成** ⭐ 差异化功能
- [ ] 从 HuggingFace 下载 GEO-bench (10K queries)
  - 来源: `GEO-Optim/geo-bench` 
  - 包含: MS Marco, ORCAS, Natural Questions, ELI-5 等
- [ ] 筛选出童装/时尚/电商相关 queries
- [ ] 用这些 queries 补充我们的 prompt pool
- [ ] 展示"行业标准 prompt 覆盖率"指标

**1.3 LMSYS 对话数据集分析** ⭐ 差异化功能
- [ ] 下载 LMSYS Chat-1M 数据集 (100万真实对话)
- [ ] 提取时尚/童装/购物相关对话
- [ ] 分析真实用户如何向 AI 询问购物建议
- [ ] 生成 "热门 AI 购物 Prompt" 趋势报告

---

### Phase 2: 核心功能升级 (下周)
> 优先级：🔴 高 | 难度：高

**2.1 Share of Voice (SOV) 面板** — 学习 Goodie/Profound
- [ ] 计算每个品牌在所有 prompt 回答中的提及占比
- [ ] 按 intent_category 细分 SOV
- [ ] 竞品 SOV 对比图 (饼图 + 趋势线)
- [ ] 品牌在 AI 回答中的"排名位置"分布

**2.2 Citation 来源追踪** — 学习 GetMint
- [ ] 记录 AI 回答中引用的所有 URL
- [ ] 分析哪些第三方网站被 AI 高频引用
- [ ] "Citation Gap Analysis": 竞品被引用但你没有的来源
- [ ] 建议：应该在哪些平台建立存在感

**2.3 情感分析增强** — 学习 Otterly
- [ ] 用 Gemini 做二次分析: 对每条回答做情感打分
- [ ] 品牌被描述的关键词云 (正面/负面)
- [ ] 情感趋势变化追踪
- [ ] 品牌"叙事一致性"评分

**2.4 Prompt 研究工具** — 学习 Semrush
- [ ] Prompt Discovery: 根据行业自动生成 prompt 候选
- [ ] Prompt 分类: 认知 → 考虑 → 决策 (漏斗分析)
- [ ] 热门 Prompt 排行: 哪些问题最能触发品牌推荐
- [ ] 自定义 Prompt 测试: 用户输入任意 prompt，实时看 AI 怎么回答

---

### Phase 3: 内容优化引擎 (第3周)
> 优先级：🟡 中 | 难度：高

**3.1 AI 内容审计** — 学习 Semrush AIO
- [ ] 输入品牌网站 URL → 分析内容结构
- [ ] 检查: Schema markup, meta tags, FAQ 结构
- [ ] 评估: 内容是否 AI 友好 (extractability score)
- [ ] 对标: 与 AI 推荐的竞品内容对比

**3.2 优化建议引擎** — 学习 GetMint + Goodie
- [ ] 基于评估结果自动生成优化建议
- [ ] 按优先级排序 (高影响 → 低影响)
- [ ] 建议类型:
  - 内容结构优化 (H2/H3/bullets)
  - Schema markup 添加 (FAQPage, Product)
  - E-E-A-T 信号增强
  - 第三方引用建设
- [ ] 一键生成优化版内容草稿

**3.3 竞品内容解析** — GetMint 核心功能
- [ ] 当 AI 推荐竞品时，分析竞品的内容结构
- [ ] 对比"被推荐品牌 vs 未被推荐品牌"的内容差异
- [ ] 生成"内容差距报告"

---

### Phase 4: GEO 教育中心 (第3-4周) ⭐ 新 Tab
> 优先级：🟡 中 | 难度：中

**4.1 GEO 知识库 Tab** — `/insights` 或 `/learn`
- [ ] **GEO 101**: 什么是 GEO? 为什么重要?
  - 引用 Princeton GEO 论文核心发现
  - AI 搜索 vs 传统搜索对比
  - GEO 关键指标解释
- [ ] **最新博客聚合**: 自动抓取 GEO 相关博客
  - 来源: Search Engine Land, Backlinko, Profound blog, Peec blog
  - 每周自动更新
  - 按话题分类 (策略/技术/案例)
- [ ] **行业报告**: 
  - AI 搜索市场份额趋势
  - ChatGPT 查询量增长数据
  - 各 AI 平台引用偏好分析
- [ ] **最佳实践指南**:
  - 10步 GEO 优化框架 (Profound)
  - 内容结构化 Checklist (Directive)
  - E-E-A-T 信号建设指南
  - Schema Markup 实施指南

**4.2 Trend Insights** — 从公开数据集提取
- [ ] AI 购物 Prompt 趋势: 用户最常问什么
- [ ] 品类热度变化: 哪些童装品类在 AI 中被讨论最多
- [ ] 季节性趋势: 节假日/开学季的 AI 推荐变化
- [ ] 新兴品牌发现: 哪些品牌在 AI 中的存在感增长最快

---

### Phase 5: 高级功能 (第4-6周)
> 优先级：🟢 低 | 难度：高

**5.1 时序追踪** — 学习 Otterly/Profound
- [ ] 定期 (每周) 重跑评估
- [ ] 时序对比: 本周 vs 上周 vs 上月
- [ ] 趋势线图: 品牌可见性变化
- [ ] 变化预警: 可见性大幅下降时通知

**5.2 导出与报告**
- [ ] PDF 品牌报告生成
- [ ] CSV 数据导出
- [ ] 定期邮件/消息推送报告
- [ ] 自定义报告模板

**5.3 多语言支持**
- [ ] 中文 prompt 评估 (中国市场品牌)
- [ ] 跨语言对比

---

## 三、技术实现优先级

### 本周必须完成 (Week 1)
| 任务 | 耗时 | 价值 |
|------|------|------|
| Gemini 评估跑完 30品牌 | 1h | 🔴 基础数据 |
| SOV 计算 + 前端展示 | 3h | 🔴 核心指标 |
| Citation 来源记录 | 2h | 🔴 竞品差异 |
| 情感分析增强 (用Gemini二次分析) | 3h | 🟡 |
| GEO-bench 数据集下载+筛选 | 2h | 🟡 差异化 |

### 下周 (Week 2)
| 任务 | 耗时 | 价值 |
|------|------|------|
| Prompt 研究工具 (漏斗分析) | 4h | 🔴 |
| 竞品对标面板 | 4h | 🔴 |
| GEO Education Tab 基础框架 | 3h | 🟡 |
| 博客聚合 (RSS) | 2h | 🟡 |

### 第3-4周 (Week 3-4)
| 任务 | 耗时 | 价值 |
|------|------|------|
| 内容审计功能 | 6h | 🟡 |
| 优化建议引擎 | 6h | 🟡 |
| LMSYS 数据集分析 | 4h | 🟡 差异化 |
| 时序追踪 | 4h | 🟢 |

---

## 四、我们的差异化优势

### 竞品没有、我们有的
1. **公开数据集集成** — GEO-bench + LMSYS + 学术研究
2. **童装垂直领域** — 专注 kids fashion, 不做通用
3. **教育 + 工具一体化** — 不只监测，还教你怎么做
4. **免费/低成本** — Gemini Flash 免费，无 $300+/月订阅
5. **中国品牌视角** — 支持中英文双语评估

### 核心价值主张
> **"专为童装品牌打造的 AI 可见性分析平台 — 了解你的品牌在 ChatGPT/Gemini/Claude 中的表现，获得数据驱动的优化建议，免费起步"**

---

## 五、数据源规划

| 数据源 | 用途 | 获取方式 | 状态 |
|--------|------|----------|------|
| Gemini 2.0 Flash | AI 评估 | API (免费) | ✅ 配置完成 |
| GEO-bench (HuggingFace) | 标准化 prompt | 下载 | 📋 待做 |
| LMSYS Chat-1M | 真实用户对话分析 | 下载 | 📋 待做 |
| Search Engine Land | GEO 博客聚合 | RSS | 📋 待做 |
| Backlinko GEO Guide | 教育内容 | web_fetch | 📋 待做 |
| Profound Blog | GEO 最佳实践 | RSS | 📋 待做 |
| Princeton GEO 论文 | 学术框架 | arxiv | 📋 待做 |
| Google Trends | 搜索趋势 | API | 📋 待做 |

---

## 六、前端页面规划

### 现有页面
- `/` — Dashboard (总览)
- `/analytics` — 分析
- `/brands` — 品牌列表
- `/evaluations` — 评估记录

### 新增页面
- `/insights` — **GEO 教育中心** (新 Tab) ⭐
  - `/insights/guide` — GEO 优化指南
  - `/insights/blog` — 最新博客聚合
  - `/insights/trends` — AI 搜索趋势
  - `/insights/research` — 学术研究摘要
- `/brands/[id]/compare` — **竞品对标** 
- `/brands/[id]/optimize` — **优化建议**
- `/prompts` — **Prompt 研究工具**
- `/reports` — **报告生成**

---

*此计划将随着开发进展持续更新。*
