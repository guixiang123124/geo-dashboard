# 快速参考 (Quick Reference Card)

## 🚀 每日工作流程

```bash
# === 开始工作 ===
cd geo-attribution-dashboard
git pull --rebase origin master    # ⚠️ 必须先pull!

# === 做修改 ===
# 编辑代码...

# === 提交代码 ===
git add <specific-files>           # 不要用 git add -A
git status | grep -E "\.env"       # 确认没有.env文件
git commit -m "feat: your message"
git push origin master

# === 启动服务器 ===
# 后端 (Terminal 1)
cd backend
python -m uvicorn src.api.main:app --reload

# 前端 (Terminal 2)
cd frontend
npm run dev
```

---

## 💰 Evaluation成本

| 场景 | 调用次数 | OpenAI | Gemini | 总计 |
|------|---------|--------|--------|------|
| **完整evaluation** (30品牌) | 1,200次 | $12.00 | $0.24 | **$12.24** |
| **测试evaluation** (3品牌) | 60次 | $0.60 | $0.01 | **$0.61** |

**省钱技巧:** 使用Gemini免费额度(1500次/天) → 总成本只需**$12**

---

## 🔧 常用命令

### Git相关
```bash
# 检查状态
git status

# 查看修改
git diff

# 撤销修改（还没add）
git checkout -- <file>

# 撤销add
git reset HEAD <file>

# 撤销commit（还没push）
git reset --soft HEAD~1

# 查看远程是否有更新
git fetch origin
git status
```

### 环境变量
```bash
# 前端 - 检查环境变量
cat frontend/.env.local

# 后端 - 检查环境变量
cat backend/.env

# 查看workspace ID
cd backend
python -c "
import sqlite3
conn = sqlite3.connect('geo_dashboard.db')
cursor = conn.cursor()
cursor.execute('SELECT DISTINCT workspace_id FROM brands')
print(cursor.fetchall())
conn.close()
"
```

### 数据库检查
```bash
cd backend
python -c "
import sqlite3
conn = sqlite3.connect('geo_dashboard.db')
cursor = conn.cursor()

cursor.execute('SELECT COUNT(*) FROM brands')
print(f'Brands: {cursor.fetchone()[0]}')

cursor.execute('SELECT COUNT(*) FROM score_cards')
print(f'Scores: {cursor.fetchone()[0]}')

cursor.execute('SELECT COUNT(DISTINCT brand_id) FROM score_cards')
print(f'Brands with scores: {cursor.fetchone()[0]}')

conn.close()
"
```

---

## ⚠️ 常见错误及解决

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| `Push rejected` | 远程有更新 | `git pull --rebase origin master` |
| `API返回空数据` | Workspace ID不匹配 | 检查`.env.local`中的ID |
| `只有3个品牌有scores` | 没运行完整evaluation | 运行`evaluate_all_brands.py` |
| `.env被添加` | 用了`git add -A` | `git reset HEAD .env.local` |

---

## 📋 提交前检查清单

- [ ] 运行了 `git pull --rebase origin master`
- [ ] 使用了 `git add <specific-files>`（不是`-A`或`.`）
- [ ] 检查了 `git status | grep -E "\.env"`（应该无输出）
- [ ] 查看了 `git diff --cached`确认修改正确
- [ ] Commit message清晰描述了改动
- [ ] 没有包含敏感信息（API keys, passwords）

---

## 🌐 环境变量配置

### 本地开发 (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=00a2dcdb-30e4-4a0e-80cd-56de2eaf0577
```

### Vercel生产环境
在Vercel Dashboard → Settings → Environment Variables设置：
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=<production-workspace-id>
```

### Render后端
在Render Dashboard → Environment设置：
```
DATABASE_URL=<provided-by-render>
OPENAI_API_KEY=sk-proj-...
GOOGLE_API_KEY=AIza...
```

---

## 📊 运行Evaluation

### 完整Evaluation (所有30品牌)
```bash
cd backend
python scripts/evaluate_all_brands.py
# 成本: ~$12, 时间: 15-20分钟
```

### 测试Evaluation (3品牌)
```bash
cd backend
python scripts/test_multimodel_evaluation.py
# 成本: ~$0.60, 时间: 2-3分钟
```

---

## 🔗 访问链接

- **本地前端**: http://localhost:3001
- **本地后端**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **GitHub**: https://github.com/guixiang123124/geo-dashboard

---

## 📚 完整文档

- [Git工作流最佳实践](./GIT_WORKFLOW_BEST_PRACTICES.md) - 详细Git流程
- [多环境配置指南](./MULTI_ENVIRONMENT_SETUP.md) - 环境变量管理
- [功能实现总结](./FEATURE_IMPLEMENTATION_SUMMARY.md) - 已完成功能
- [项目计划](./PROJECT_PLAN.md) - 开发路线图

---

**快速搜索关键词:**
- 成本 → 💰 Evaluation成本
- 冲突 → ⚠️ 常见错误及解决
- 环境变量 → 🌐 环境变量配置
- 提交 → 📋 提交前检查清单
- 数据库 → 数据库检查命令

**记住:**
1. 永远先`git pull`再commit
2. 永远不提交`.env`文件
3. 使用具体文件`git add`，不用`-A`

---

**最后更新:** 2026-01-25
