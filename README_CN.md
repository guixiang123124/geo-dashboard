# GEO归因与测量仪表板

> 🇨🇳 中文 | [🇺🇸 English](./README.md)

一个用于测量**生成式引擎优化（GEO）**的SaaS平台 — 追踪AI聊天机器人（ChatGPT、Gemini、Claude、Perplexity）如何提及、引用和描述品牌。

[![许可证: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg)](https://fastapi.tiangolo.com)

## 🎯 什么是GEO？

GEO（生成式引擎优化）衡量品牌在AI生成回复中的可见度和呈现方式。与传统SEO专注于搜索引擎排名不同，GEO追踪：

- **AI是否记得你的品牌？**（可见度）
- **AI为什么信任你的品牌？**（引用与权威性）
- **AI如何描述你的品牌？**（呈现与定位）
- **AI在哪些场景推荐你的品牌？**（意图覆盖）

## 📊 GEO归因漏斗

```
用户意图 → AI提示词
    ↓
A. 可见度与召回 (35%权重)
    ↓
B. 来源选择/引用 (25%权重)
    ↓
C. 品牌定位/呈现 (25%权重)
    ↓
D. 意图匹配与覆盖 (15%权重)
    ↓
用户感知 → 转化
```

## 🚀 快速开始

### 前置要求

- **Python 3.10+**
- **Node.js 18+**
- **OpenAI API密钥**（用于ChatGPT集成）
- **Google API密钥**（可选，用于Gemini集成）

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/YOUR_USERNAME/geo-attribution-dashboard.git
cd geo-attribution-dashboard
```

2. **后端设置**
```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate   # Windows

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑.env文件，添加你的API密钥

# 初始化数据库
alembic upgrade head

# 填充示例数据（30个童装品牌）
python scripts/seed_database.py

# 启动后端服务器
uvicorn src.api.main:app --reload
```

后端将运行在: http://localhost:8000

3. **前端设置**
```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将运行在: http://localhost:3000

## 📁 项目结构

```
geo-attribution-dashboard/
├── frontend/                    # Next.js 16 + React 19 仪表板
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── page.tsx        # 首页
│   │   │   ├── analytics/      # 分析页面
│   │   │   ├── brands/         # 品牌管理
│   │   │   └── evaluations/    # 评估运行
│   │   ├── components/
│   │   │   ├── charts/         # 5种图表组件
│   │   │   ├── layout/         # 侧边栏、头部
│   │   │   └── geo/            # GEO评分卡
│   │   ├── hooks/              # React Hooks
│   │   └── lib/
│   │       ├── api.ts          # API客户端
│   │       ├── types.ts        # TypeScript类型
│   │       └── data.ts         # 模拟数据
│   └── package.json
│
├── backend/                     # Python FastAPI + 评分引擎
│   ├── src/
│   │   ├── api/
│   │   │   ├── main.py         # FastAPI应用
│   │   │   └── routes/         # API路由（品牌、评估、分数）
│   │   ├── core/
│   │   │   ├── config.py       # 配置管理
│   │   │   └── database.py     # 数据库连接
│   │   ├── models/             # SQLAlchemy模型（6个模型）
│   │   ├── schemas/            # Pydantic模式
│   │   └── services/
│   │       ├── ai_clients/     # OpenAI、Gemini客户端
│   │       └── evaluation_service.py  # 评估编排
│   ├── scripts/
│   │   ├── seed_database.py    # 数据库填充
│   │   └── test_evaluation.py  # 测试脚本
│   ├── alembic/                # 数据库迁移
│   └── requirements.txt
│
├── data/
│   ├── intent_pool.json        # 100个评估提示词
│   └── brands_database.json    # 30个童装品牌
│
├── docs/                       # 文档
│   ├── METRICS.md              # GEO方法论
│   ├── PLAYBOOK.md             # 优化策略
│   └── DASHBOARD_GUIDE.md      # 用户指南
│
├── README.md                   # 英文README
├── README_CN.md                # 中文README（本文件）
├── DEPLOYMENT.md               # 部署指南
└── SYSTEM_READY.md             # 系统就绪指南
```

## ✨ 核心功能

### 后端功能
- ✅ **FastAPI REST API** - 11个端点，完整OpenAPI文档
- ✅ **多租户架构** - 基于工作区的隔离
- ✅ **真实AI集成** - OpenAI ChatGPT + Google Gemini
- ✅ **GEO评分引擎** - 4维度加权算法（35/25/25/15）
- ✅ **评估编排** - 批量异步执行与进度跟踪
- ✅ **数据库** - SQLite（开发）/PostgreSQL（生产）

### 前端功能
- ✅ **4个主要页面** - 首页、分析、品牌、评估
- ✅ **5种图表类型**:
  - 时间序列图（历史趋势）
  - 雷达图（多维对比）
  -漏斗图（归因流）
  - 模型对比图（AI平台分解）
  - 热力图（品牌×模型矩阵）
- ✅ **专业UI** - 侧边栏导航、响应式设计
- ✅ **实时API集成** - 与后端实时通信
- ✅ **加载状态** - 骨架屏、错误处理

### 数据与内容
- ✅ **30个童装品牌** - 包含完整元数据
- ✅ **100个评估提示词** - 12个意图类别
- ✅ **6个月历史数据** - 用于趋势分析
- ✅ **完整类型系统** - TypeScript类型定义

## 🎨 可视化组件

### 1. 时间序列图
追踪6个月的分数历史，可切换维度显示。

### 2. 雷达图
4维度蜘蛛图，支持多品牌叠加对比。

### 3. 漏斗图
显示从召回到转化的4阶段归因流程。

### 4. 模型对比图
对比ChatGPT、Gemini、Claude、Perplexity的表现。

### 5. 热力图
品牌×AI模型性能矩阵。

## 🔌 API端点

### 品牌管理
```bash
GET  /api/v1/brands/?workspace_id={id}&page=1&page_size=10
GET  /api/v1/brands/{brand_id}?workspace_id={id}
POST /api/v1/brands/?workspace_id={id}
PUT  /api/v1/brands/{brand_id}?workspace_id={id}
DEL  /api/v1/brands/{brand_id}?workspace_id={id}
```

### 评分查询
```bash
GET /api/v1/scores/brand/{brand_id}/latest?workspace_id={id}
GET /api/v1/scores/brand/{brand_id}/history?workspace_id={id}
GET /api/v1/scores/?workspace_id={id}
```

### 评估运行
```bash
POST /api/v1/evaluations/run?workspace_id={id}
GET  /api/v1/evaluations/{run_id}?workspace_id={id}
GET  /api/v1/evaluations/?workspace_id={id}
```

### 默认工作区ID
```
00a2dcdb-30e4-4a0e-80cd-56de2eaf0577
```

## 🧪 测试系统

### 测试后端健康检查
```bash
curl http://localhost:8000/health
```

### 测试品牌API
```bash
curl "http://localhost:8000/api/v1/brands/?workspace_id=00a2dcdb-30e4-4a0e-80cd-56de2eaf0577&page=1&page_size=5"
```

### 运行快速评估
```bash
cd backend
python scripts/test_evaluation.py
```

### 运行多模型评估
```bash
cd backend
python scripts/test_multimodel_evaluation.py
```

## 📊 数据说明

### 童装品牌数据库（30个品牌）

**高端品牌:**
- Janie and Jack, Mini Boden, Tea Collection, Hanna Andersson

**中端品牌:**
- Carter's, OshKosh B'gosh, Children's Place, Gap Kids

**平价品牌:**
- Old Navy Kids, Target Cat & Jack, H&M Kids

**可持续品牌:**
- Pact, Primary, Monica + Andy, Kate Quinn Organics

**直接面向消费者:**
- PatPat, Freshly Picked, Little Sleepies

### 意图类别（100个提示词）
1. general_discovery（通用发现）- 10个
2. price_value（价格价值）- 10个
3. sustainability（可持续性）- 12个
4. occasion_specific（特定场合）- 10个
5. age_specific（特定年龄）- 10个
6. safety_quality（安全质量）- 12个
7. material_quality（材料质量）- 10个
8. style_trend（风格趋势）- 10个
9. use_case_activity（使用场景）- 10个
10. specialty_needs（特殊需求）- 10个
11. sizing_fit（尺寸适配）- 8个
12. brand_comparison（品牌对比）- 8个

## 🚀 部署指南

### 后端部署（Railway / Render）

1. 在 [railway.app](https://railway.app) 或 [render.com](https://render.com) 创建账号
2. 连接GitHub仓库
3. 添加环境变量：
   ```
   OPENAI_API_KEY=your-key
   GOOGLE_API_KEY=your-key
   DATABASE_URL=postgresql://...
   ```
4. 部署！

### 前端部署（Vercel）

1. 在 [vercel.com](https://vercel.com) 创建账号
2. 导入GitHub仓库
3. 添加环境变量：
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
4. 部署！

详细部署说明请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📚 文档

- **[SYSTEM_READY.md](./SYSTEM_READY.md)** - 完整系统参考指南
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 部署指南
- **[METRICS.md](./docs/METRICS.md)** - GEO方法论详解
- **[PLAYBOOK.md](./docs/PLAYBOOK.md)** - 优化策略手册
- **[DASHBOARD_GUIDE.md](./docs/DASHBOARD_GUIDE.md)** - 用户操作指南

## 🛠️ 技术栈

### 后端
- **FastAPI** - 现代Python Web框架
- **SQLAlchemy** - ORM（支持异步）
- **Alembic** - 数据库迁移
- **OpenAI SDK** - ChatGPT集成
- **Google Generative AI** - Gemini集成
- **Pydantic** - 数据验证

### 前端
- **Next.js 16** - React框架（App Router）
- **React 19** - UI库
- **TypeScript** - 类型安全
- **Tailwind CSS 4** - 样式框架
- **Radix UI** - 无样式组件
- **Recharts** - 数据可视化
- **Lucide React** - 图标库

### 数据库
- **SQLite** - 开发环境
- **PostgreSQL** - 生产环境

## 🔒 环境变量

### 后端 (.env)
```bash
# 应用配置
APP_NAME=GEO Attribution Dashboard API
APP_VERSION=1.0.0
DEBUG=True

# API配置
API_V1_PREFIX=/api/v1
CORS_ORIGINS=["http://localhost:3000"]

# 数据库
DATABASE_URL=sqlite+aiosqlite:///./geo_dashboard.db

# AI API密钥
OPENAI_API_KEY=sk-proj-...
GOOGLE_API_KEY=AIza...

# AI模型配置
OPENAI_MODEL=gpt-4-turbo-preview
GOOGLE_MODEL=gemini-pro
```

### 前端 (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🤝 贡献指南

欢迎贡献！请查看我们的贡献指南。

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- OpenAI - ChatGPT API
- Google - Gemini API
- Anthropic - Claude（计划中）
- Perplexity - Perplexity AI（计划中）

## 📞 联系方式

如有问题或建议，请：
1. 查看文档
2. 开启GitHub Issue
3. 查看API文档：http://localhost:8000/docs

---

**状态:** ✅ 生产就绪

系统完全可运行，随时可用或部署！

*Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>*
