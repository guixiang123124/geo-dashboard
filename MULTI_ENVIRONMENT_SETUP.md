# 多环境配置指南 (Multi-Environment Setup)

## 📋 问题说明

当你同时在以下环境工作时会出现配置冲突：

1. **本地开发环境** (Local Development)
   - 前端: http://localhost:3001
   - 后端: http://localhost:8000
   - 数据库: SQLite (`geo_dashboard.db`)
   - Workspace ID: `00a2dcdb-30e4-4a0e-80cd-56de2eaf0577`

2. **Vercel部署** (Production Frontend)
   - 前端: https://your-app.vercel.app
   - 连接到Render后端
   - 使用Render的Workspace ID

3. **Render部署** (Production Backend)
   - 后端: https://your-api.onrender.com
   - 数据库: PostgreSQL (云端)
   - Workspace ID: 可能不同于本地

---

## ✅ 解决方案：环境变量分离

### 1. 前端环境变量配置

**文件结构：**
```
frontend/
├── .env.example           # 模板文件（提交到Git）
├── .env.local            # 本地开发（不提交）
├── .env.production       # 生产环境（不提交）
└── .gitignore            # 确保忽略 .env.local
```

**`.env.example`** (已存在，用作模板):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=your-workspace-id-here
```

**`.env.local`** (本地开发，已创建):
```env
# 本地开发环境
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=00a2dcdb-30e4-4a0e-80cd-56de2eaf0577
```

**Vercel环境变量** (在Vercel Dashboard设置):
- `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com`
- `NEXT_PUBLIC_DEFAULT_WORKSPACE_ID` = `<Render数据库的workspace ID>`

---

### 2. 后端环境变量配置

**文件结构：**
```
backend/
├── .env.example          # 模板文件（提交到Git）
├── .env                  # 本地开发（不提交）
└── .gitignore            # 确保忽略 .env
```

**`.env`** (本地开发，已存在):
```env
DATABASE_URL=sqlite+aiosqlite:///./geo_dashboard.db
OPENAI_API_KEY=sk-proj-...
GOOGLE_API_KEY=AIza...
```

**Render环境变量** (在Render Dashboard设置):
- `DATABASE_URL` = Render自动提供的PostgreSQL连接字符串
- `OPENAI_API_KEY` = 你的OpenAI API密钥
- `GOOGLE_API_KEY` = 你的Google API密钥

---

## 🔍 当前问题诊断

### 问题1: 只有3个品牌有scores

**原因：** 数据库中只运行了部分品牌的evaluation

**解决方案：**

```bash
# 检查哪些品牌有scores
cd backend
python -c "
import sqlite3
conn = sqlite3.connect('geo_dashboard.db')
cursor = conn.cursor()
cursor.execute('SELECT COUNT(DISTINCT brand_id) FROM score_cards')
print(f'Brands with scores: {cursor.fetchone()[0]}')
cursor.execute('SELECT COUNT(*) FROM brands')
print(f'Total brands: {cursor.fetchone()[0]}')
conn.close()
"
```

**当前状态：**
- 数据库中有30个品牌
- 只有3个品牌有evaluation结果和scores
- 需要运行完整的evaluation来生成所有品牌的scores

---

## 🚀 运行完整Evaluation

### 方法1: 通过API运行Evaluation

```bash
# 触发一次完整的evaluation run
curl -X POST "http://localhost:8000/api/v1/evaluations/" \
  -H "Content-Type: application/json" \
  -d '{
    "workspace_id": "00a2dcdb-30e4-4a0e-80cd-56de2eaf0577",
    "brand_ids": [],
    "models": ["chatgpt", "gemini"],
    "description": "Full evaluation of all 30 brands"
  }'
```

### 方法2: 使用后端脚本

创建一个脚本来运行所有品牌的evaluation：

```python
# backend/scripts/run_full_evaluation.py
import asyncio
from sqlalchemy import select
from src.core.database import get_db_session
from src.models.brand import Brand
from src.services.evaluation_service import EvaluationService

async def run_evaluation():
    async with get_db_session() as db:
        # 获取所有品牌
        result = await db.execute(
            select(Brand).where(
                Brand.workspace_id == "00a2dcdb-30e4-4a0e-80cd-56de2eaf0577"
            )
        )
        brands = result.scalars().all()

        print(f"Found {len(brands)} brands")

        # 运行evaluation
        eval_service = EvaluationService(db)
        for i, brand in enumerate(brands, 1):
            print(f"[{i}/{len(brands)}] Evaluating {brand.name}...")
            try:
                # 这里调用你的evaluation逻辑
                # await eval_service.run_evaluation(brand.id, models=["chatgpt", "gemini"])
                pass
            except Exception as e:
                print(f"  Error: {e}")

if __name__ == "__main__":
    asyncio.run(run_evaluation())
```

---

## 📊 验证数据同步

### 检查本地数据库状态

```bash
cd backend
python -c "
import sqlite3
conn = sqlite3.connect('geo_dashboard.db')
cursor = conn.cursor()

# 品牌统计
cursor.execute('SELECT COUNT(*) FROM brands')
print(f'Total brands: {cursor.fetchone()[0]}')

# Scores统计
cursor.execute('SELECT COUNT(*) FROM score_cards')
print(f'Total score cards: {cursor.fetchone()[0]}')

# Evaluation runs统计
cursor.execute('SELECT COUNT(*) FROM evaluation_runs')
print(f'Total evaluation runs: {cursor.fetchone()[0]}')

# Evaluation results统计
cursor.execute('SELECT COUNT(*) FROM evaluation_results')
print(f'Total evaluation results: {cursor.fetchone()[0]}')

conn.close()
"
```

**预期输出（完整数据）：**
```
Total brands: 30
Total score cards: 60+  (每个品牌至少2个)
Total evaluation runs: 5+
Total evaluation results: 1000+  (30 brands × ~10 prompts × 2-3 models)
```

---

## 🔄 Git工作流（避免环境变量冲突）

### 每次commit前的检查清单

```bash
# 1. 确保.env.local不会被提交
git status | grep -E "\.env\.local"
# 应该没有输出

# 2. 从GitHub拉取最新代码
cd geo-attribution-dashboard
git fetch origin
git status

# 3. 如果有冲突，先rebase
git pull --rebase origin master

# 4. 检查哪些文件会被提交
git diff --cached

# 5. 确认只提交代码文件，不提交环境配置
git add <specific-files>  # 不要用 git add -A

# 6. Commit
git commit -m "your message"

# 7. Push
git push origin master
```

### 不应该被提交的文件

```
❌ frontend/.env.local
❌ frontend/.env.production
❌ backend/.env
❌ backend/geo_dashboard.db  (本地数据库)
❌ backend/__pycache__/
❌ frontend/.next/
❌ frontend/node_modules/
```

### 应该被提交的文件

```
✅ frontend/.env.example
✅ backend/.env.example
✅ 所有 .ts/.tsx/.py 源代码文件
✅ README.md 和其他文档
✅ package.json / requirements.txt
✅ .gitignore
```

---

## 🌐 不同环境的Workspace ID管理

### 本地开发环境

```env
# frontend/.env.local
NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=00a2dcdb-30e4-4a0e-80cd-56de2eaf0577
```

### Vercel生产环境

1. 进入Vercel Dashboard
2. 选择你的项目
3. 进入 Settings → Environment Variables
4. 添加：
   ```
   NEXT_PUBLIC_API_URL = https://your-backend.onrender.com
   NEXT_PUBLIC_DEFAULT_WORKSPACE_ID = <从Render数据库获取的workspace ID>
   ```

### 如何获取Render的Workspace ID

```bash
# 方法1: 连接到Render的PostgreSQL
psql <RENDER_DATABASE_URL>
SELECT DISTINCT workspace_id FROM brands;

# 方法2: 通过API查询
curl https://your-backend.onrender.com/api/v1/brands/ | grep workspace_id | head -1
```

---

## 🔧 修复当前本地环境

### 步骤1: 确认.env.local已创建

```bash
cd geo-attribution-dashboard/frontend
cat .env.local
```

应该显示：
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=00a2dcdb-30e4-4a0e-80cd-56de2eaf0577
```

### 步骤2: 重启前端服务器

```bash
# 如果前端正在运行，Ctrl+C 停止
# 然后重新启动
cd frontend
npm run dev
```

### 步骤3: 验证API连接

打开浏览器控制台 (F12)，访问 http://localhost:3001/brands

检查Network标签，应该看到：
```
Request URL: http://localhost:8000/api/v1/brands/?workspace_id=00a2dcdb-30e4-4a0e-80cd-56de2eaf0577...
Status: 200
Response: { brands: [...30 brands...], total: 30 }
```

### 步骤4: 检查为什么只有3个品牌有scores

```bash
cd backend

# 检查evaluation_results表
python -c "
import sqlite3
conn = sqlite3.connect('geo_dashboard.db')
cursor = conn.cursor()

cursor.execute('''
    SELECT b.name, COUNT(DISTINCT s.id) as score_count
    FROM brands b
    LEFT JOIN score_cards s ON b.id = s.brand_id
    GROUP BY b.id, b.name
    ORDER BY score_count DESC
    LIMIT 10
''')

print('Brands with scores:')
for name, count in cursor.fetchall():
    print(f'  {name}: {count} scores')

conn.close()
"
```

---

## 🎯 下一步行动

### 1. 运行完整的Evaluation（推荐）

你需要运行evaluation来为所有30个品牌生成scores。有两个选择：

**选项A: 使用现有的test脚本**
```bash
cd backend
python scripts/test_multimodel_evaluation.py
```

**选项B: 通过API手动触发**
- 访问 http://localhost:8000/docs
- 找到 POST /api/v1/evaluations/
- 填写参数并执行

### 2. 确保.gitignore正确

```bash
cd geo-attribution-dashboard

# 检查.gitignore包含:
cat .gitignore | grep -E "\.env"
# 应该看到:
# .env
# .env.local
# .env.*.local
```

### 3. 添加到文档

将这个文件添加到Git:
```bash
git add MULTI_ENVIRONMENT_SETUP.md
git commit -m "docs: Add multi-environment configuration guide"
git push origin master
```

---

## 💡 最佳实践总结

1. ✅ **永远不要提交** `.env.local` 和 `.env` 文件
2. ✅ **总是提供** `.env.example` 作为模板
3. ✅ **每个环境使用不同的** Workspace ID
4. ✅ **在云端平台设置环境变量**（Vercel/Render Dashboard）
5. ✅ **Commit前先pull** 最新代码
6. ✅ **只add具体文件**，不要用 `git add -A`
7. ✅ **定期检查** `.gitignore` 是否正确

---

**生成时间:** 2026-01-25
**作者:** Claude Sonnet 4.5
