# GEO Insights - AI时代品牌优化平台

> 🇺🇸 [English](./README.md) | 🇨🇳 中文文档

一个现代化的SaaS平台，用于**生成式引擎优化（GEO）**——追踪AI聊天机器人（ChatGPT、Gemini、Claude、Perplexity）如何在回答中提及、引用和描述你的品牌。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg)](https://fastapi.tiangolo.com)

## 什么是GEO？

**GEO（生成式引擎优化）** 衡量品牌在AI生成回答中的可见性和呈现方式。与关注搜索引擎排名的传统SEO不同，GEO追踪：

| 问题 | 维度 |
|------|------|
| AI是否记得你的品牌？ | **可见性 Visibility**（35%） |
| AI是否引用你的来源？ | **引用 Citation**（25%） |
| AI如何描述你的品牌？ | **呈现 Representation**（25%） |
| AI在哪些场景推荐你？ | **意图覆盖 Intent Coverage**（15%） |

## 功能特性

### 核心功能
- **多模型AI评估** - 支持ChatGPT、Gemini、Claude、Perplexity测试
- **四维GEO评分** - 可见性、引用、呈现、意图覆盖
- **实时分析仪表盘** - 交互式图表和可视化
- **品牌管理** - 追踪多个品牌的详细档案
- **数据导出** - CSV、PDF和PNG导出功能

### 技术特性
- **JWT认证** - 安全的用户登录和注册
- **多租户架构** - 组织工作区隔离
- **REST API** - 完整的FastAPI后端，带OpenAPI文档
- **现代UI** - 渐变设计配合毛玻璃效果

## 项目结构

```
geo-dashboard/
├── frontend/                 # Next.js 16 + React 19 仪表盘
│   ├── src/
│   │   ├── app/             # 页面（首页、分析、品牌、评估）
│   │   ├── components/      # UI组件（图表、过滤器、布局）
│   │   ├── hooks/           # React hooks
│   │   └── lib/             # API客户端、类型、工具
│   ├── vercel.json          # Vercel部署配置
│   └── package.json
│
├── backend/                  # FastAPI + SQLAlchemy
│   ├── src/
│   │   ├── api/             # 路由（认证、品牌、评估、评分）
│   │   ├── core/            # 配置、数据库
│   │   ├── models/          # SQLAlchemy模型
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # 业务逻辑、AI客户端
│   ├── Dockerfile           # 生产环境Docker构建
│   ├── railway.json         # Railway部署配置
│   └── requirements.txt
│
├── data/                     # 示例数据
│   ├── intent_pool.json     # 100个评估提示
│   └── brands_database.json # 30个童装品牌
│
├── render.yaml              # Render.com蓝图
└── docker-compose.yml       # 本地开发环境
```

## 快速开始

### 前置要求
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+（开发环境可用SQLite）

### 本地开发

1. **克隆仓库：**
   ```bash
   git clone https://github.com/guixiang123124/geo-dashboard.git
   cd geo-dashboard
   ```

2. **设置后端：**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt

   # 配置环境变量
   cp ../.env.example .env
   # 编辑.env填入你的API密钥
   ```

3. **设置前端：**
   ```bash
   cd frontend
   npm install

   # 配置环境变量
   cp .env.example .env.local
   ```

4. **启动开发服务器：**
   ```bash
   # 方式1：使用启动脚本
   ./start-servers.sh

   # 方式2：手动启动
   # 终端1 - 后端
   cd backend && uvicorn src.api.main:app --reload

   # 终端2 - 前端
   cd frontend && npm run dev
   ```

5. **访问应用：**
   - 前端：http://localhost:3000
   - 后端API：http://localhost:8000
   - API文档：http://localhost:8000/docs

## API端点

### 认证
| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/v1/auth/register` | 注册新用户 |
| POST | `/api/v1/auth/login` | 登录获取JWT令牌 |
| GET | `/api/v1/auth/me` | 获取当前用户信息 |
| POST | `/api/v1/auth/change-password` | 修改密码 |

### 品牌管理
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/v1/brands` | 获取品牌列表 |
| POST | `/api/v1/brands` | 创建新品牌 |
| GET | `/api/v1/brands/{id}` | 获取品牌详情 |
| PATCH | `/api/v1/brands/{id}` | 更新品牌 |
| DELETE | `/api/v1/brands/{id}` | 删除品牌 |

### 评估
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/v1/evaluations` | 获取评估列表 |
| POST | `/api/v1/evaluations` | 开始新评估 |
| GET | `/api/v1/evaluations/{id}` | 获取评估详情 |
| GET | `/api/v1/evaluations/{id}/results` | 获取评估结果 |

### 评分
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/v1/scores/brand/{id}` | 获取品牌评分历史 |
| GET | `/api/v1/scores/brand/{id}/latest` | 获取品牌最新评分 |
| GET | `/api/v1/scores/workspace` | 获取工作区所有评分 |

## 部署指南

### 后端（Railway）
1. 将GitHub仓库连接到Railway
2. 在Railway控制台设置环境变量
3. 从`/backend`目录部署

```bash
# 必需的环境变量
DATABASE_URL=postgresql://...
SECRET_KEY=your-secure-secret
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
```

### 后端（Render）
1. 在Render创建新的Web服务
2. 连接你的GitHub仓库
3. 使用`render.yaml`蓝图或手动配置

### 前端（Vercel）
1. 将项目导入Vercel
2. 设置根目录为`/frontend`
3. 添加环境变量：
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

## GEO评分计算

### 四个维度

| 维度 | 权重 | 计算方式 |
|------|------|----------|
| **可见性** | 35% | `提及率 × 0.7 + 排名分 × 0.3` |
| **引用** | 25% | `引用率 × 100` |
| **呈现** | 25% | `(准确度分 / 3) × 100` |
| **意图覆盖** | 15% | `覆盖意图数 / 总意图数 × 100` |

### 综合评分
```
GEO评分 = (可见性 × 0.35) + (引用 × 0.25) +
          (呈现 × 0.25) + (意图覆盖 × 0.15)
```

## 技术栈

### 前端
- **框架：** Next.js 16（App Router）
- **UI：** React 19 + Tailwind CSS 4 + Radix UI
- **图表：** Recharts
- **状态管理：** Zustand
- **语言：** TypeScript

### 后端
- **框架：** FastAPI
- **数据库：** PostgreSQL + SQLAlchemy 2.0
- **迁移：** Alembic
- **认证：** JWT（python-jose + passlib）
- **AI：** OpenAI SDK、Google Generative AI、Anthropic SDK
- **验证：** Pydantic 2.0

## 环境变量

### 后端（.env）
```env
# 数据库
DATABASE_URL=sqlite+aiosqlite:///./geo_dashboard.db

# 安全
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI API密钥
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
ANTHROPIC_API_KEY=...
```

### 前端（.env.local）
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 文档

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 系统架构详情
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 部署指南
- **[docs/METRICS.md](./docs/METRICS.md)** - GEO指标定义
- **[docs/PLAYBOOK.md](./docs/PLAYBOOK.md)** - 优化策略

## 贡献

1. Fork本仓库
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交更改（`git commit -m 'Add amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 创建Pull Request

## 许可证

MIT许可证 - 详见[LICENSE](./LICENSE)文件。

---

**技术栈：** Next.js、FastAPI、PostgreSQL、OpenAI
**聚焦行业：** 童装行业GEO测量
**版本：** 2.0.0（GEO Insights）
