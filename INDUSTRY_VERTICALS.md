# Luminos Industry Verticals Plan

## 调研来源
- Conductor 2026 AEO/GEO Benchmarks Report（分析了 10 个行业）
- AI referral traffic, AIO visibility, brand citation data

## 选定的 8 个垂直行业

### Tier 1 — 高 AI 影响力，品牌竞争激烈（优先）

#### 1. 🏥 Health & Wellness（健康与养生）
- **AIO 触发率最高**: 48.75%（所有行业中第一）
- **典型品牌**: WebMD, Mayo Clinic, Healthline, CVS, Walgreens
- **Prompt 示例**: "best supplements for sleep", "top telehealth services"
- **为什么重要**: YMYL (Your Money Your Life) 领域，AI 回答直接影响消费决策
- **目标客户**: 保健品牌、远程医疗、健身品牌、营养补剂 DTC

#### 2. 💰 Fintech & Financial Services（金融科技）
- **AIO 触发率**: 25.79%（第二）
- **典型品牌**: NerdWallet, Bankrate, Credit Karma, Robinhood, SoFi
- **Prompt 示例**: "best savings accounts 2026", "top investing apps for beginners"
- **为什么重要**: NerdWallet 拿到 6.73% AI citations，超过传统银行！
- **目标客户**: 数字银行、投资平台、保险科技、个人理财工具

#### 3. 💻 SaaS & Technology（软件与科技）
- **AI referral traffic 最高**: 2.8%（所有行业第一）
- **典型品牌**: Salesforce, HubSpot, Shopify, Notion, Slack
- **Prompt 示例**: "best project management tools", "top CRM software for small business"
- **为什么重要**: 科技公司最早受 AI 搜索影响，付费意愿最强
- **目标客户**: B2B SaaS、开发者工具、生产力工具

#### 4. 🛒 E-commerce & Consumer Brands（电商与消费品牌）
- **Consumer Staples AI referral**: 1.9%（第二）
- **典型品牌**: Amazon, Target, Walmart, Nike, Allbirds
- **Prompt 示例**: "best running shoes 2026", "top sustainable fashion brands"
- **为什么重要**: Amazon 拿到 17.99% AI citations，DTC 品牌急需可见度
- **目标客户**: DTC 品牌、Shopify 商家、时尚品牌、消费电子
- **注意**: Kids Fashion 是我们的子垂直，已有 3600 条数据

### Tier 2 — 中等 AI 影响力，增长潜力大

#### 5. 🏠 Real Estate & Home（房地产与家居）
- **AIO 触发率低但品牌集中**: Zillow 独占 7.36% AI market share
- **典型品牌**: Zillow, Redfin, Realtor.com, Wayfair, IKEA
- **Prompt 示例**: "best real estate apps", "top furniture brands for small spaces"
- **为什么重要**: 高客单价决策，AI 推荐直接影响购买
- **目标客户**: 房地产科技、家居品牌、装修服务

#### 6. ✈️ Travel & Hospitality（旅游与酒店）
- **AI 搜索增长快速**: 旅行计划是 AI 最常见用例之一
- **典型品牌**: Booking.com, Airbnb, Expedia, Marriott, Tripadvisor
- **Prompt 示例**: "best hotels in Tokyo", "top budget airlines in Europe"
- **为什么重要**: 旅行决策高度依赖 AI 推荐和比较
- **目标客户**: 酒店集团、航空公司、旅游平台、目的地营销

#### 7. 🎓 Education & EdTech（教育与教育科技）
- **AI 对教育领域影响深远**: Clemson.edu 通过 AEO 拿到 91% AIO market share
- **典型品牌**: Coursera, Udemy, Khan Academy, Duolingo, Chegg
- **Prompt 示例**: "best online courses for data science", "top coding bootcamps"
- **为什么重要**: 学生和职业转换者高度依赖 AI 推荐
- **目标客户**: 在线教育平台、大学、职业培训

#### 8. 🍔 Food & Beverage（食品与餐饮）
- **Consumer Staples 的子分类**: 日常消费决策
- **典型品牌**: HelloFresh, Blue Apron, Impossible Foods, Oatly
- **Prompt 示例**: "best meal delivery services", "top plant-based protein brands"
- **为什么重要**: 订阅制品牌多，AI 推荐直接影响用户选择
- **目标客户**: 食品 DTC、餐饮连锁、健康食品品牌

## 实施计划

### Phase 1: 数据采集（每个垂直）
- 筛选 25-30 个代表性品牌
- 设计 120 个消费者视角的评估 prompt（覆盖 12 个 intent 分类）
- 用 Gemini（免费）跑评估，后续加 OpenAI + Grok

### Phase 2: 评估执行
- 本地批量跑 evaluate 脚本
- 结果推送到 Railway DB
- 每个垂直 ~3600 条结果（30 brands × 120 prompts）

### Phase 3: 前端展示
- Industry Intelligence 页面添加垂直切换器
- 每个垂直有独立的排行榜、热力图、原始数据

### 优先级排序
1. **SaaS & Technology** — 付费意愿最高，最可能成为付费用户
2. **E-commerce & Consumer** — 我们已有 Kids Fashion 数据，扩展容易
3. **Health & Wellness** — AIO 触发率最高，数据价值最大
4. **Fintech** — 高价值客户，对 AI 可见度敏感
5. **Travel** → **Real Estate** → **Education** → **Food**

## 关键数据点（from Conductor 2026 Report）
- AI referral traffic 占总流量 1.08%，每月增长 ~1%
- ChatGPT 占 AI referral 的 87.4%
- 25.11% 的 Google 搜索触发 AIO 结果
- IT 行业 AI referral 最高 (2.8%)，Health Care AIO 最高 (48.75%)
