# Git工作流最佳实践 (Git Workflow Best Practices)

## 🎯 核心原则

当你在**多个环境**（本地、Claude Code云端、Vercel、Render）同时工作时，**必须**遵循这些原则来避免冲突：

1. **永远先Pull，再Commit** - 总是先获取最新代码
2. **环境变量不提交** - `.env.local`和`.env`永远不要提交
3. **具体文件Add** - 不要使用`git add -A`或`git add .`
4. **一次只做一件事** - 每个commit只改一个功能

---

## 📋 标准工作流程

### 每次开始工作前

```bash
# 1. 切换到项目目录
cd geo-attribution-dashboard

# 2. 检查当前状态
git status

# 3. 从GitHub拉取最新代码 (⚠️ 必须做!)
git fetch origin
git pull --rebase origin master

# 4. 如果有冲突，解决冲突后继续
# git rebase --continue
```

### 做完修改后

```bash
# 1. 检查修改了什么文件
git status

# 2. 查看具体改动
git diff

# 3. ⚠️ 重要: 只添加你修改的文件，不要添加环境变量!
git add frontend/src/app/brands/page.tsx
git add backend/src/api/routes/brands.py
# 不要用: git add -A  ❌
# 不要用: git add .   ❌

# 4. 检查将要提交的文件
git diff --cached

# 5. 确认没有.env.local或.env文件
git status | grep -E "\.env"
# 应该没有输出

# 6. Commit
git commit -m "feat: your meaningful commit message

- Bullet point 1
- Bullet point 2

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 7. 再次Pull (确保没有新的冲突)
git pull --rebase origin master

# 8. Push
git push origin master
```

---

## ⚠️ 危险操作（避免使用）

### ❌ 不要使用的命令

```bash
# ❌ 不要添加所有文件
git add -A
git add .

# ❌ 不要强制推送
git push --force
git push -f

# ❌ 不要提交环境变量
git add .env
git add .env.local
git add backend/.env

# ❌ 不要跳过hooks
git commit --no-verify
```

### ✅ 应该使用的命令

```bash
# ✅ 具体文件添加
git add frontend/src/app/brands/page.tsx

# ✅ 多个文件
git add frontend/src/app/brands/page.tsx \
        frontend/src/components/filters/AdvancedFilters.tsx \
        MULTI_ENVIRONMENT_SETUP.md

# ✅ 某个目录的所有.tsx文件
git add frontend/src/components/*.tsx

# ✅ 正常推送
git push origin master
```

---

## 🔍 检查清单（每次Commit前）

### 1. 确认环境变量没有被添加

```bash
# 运行这个检查
git status | grep -E "\.env"

# ✅ 好 - 没有输出
# ❌ 坏 - 显示 .env.local 或 .env
```

如果看到`.env`相关文件，说明它们被添加了，需要移除：

```bash
# 从暂存区移除
git reset HEAD frontend/.env.local
git reset HEAD backend/.env
```

### 2. 确认只提交代码文件

```bash
# 查看将要提交的文件
git diff --cached --name-only

# 应该只看到:
# ✅ .ts, .tsx, .py 文件
# ✅ .md 文档
# ✅ package.json, requirements.txt
# ✅ 配置文件 (.gitignore, tsconfig.json)

# 不应该看到:
# ❌ .env.local
# ❌ .env
# ❌ node_modules/
# ❌ __pycache__/
# ❌ .next/
# ❌ geo_dashboard.db
```

### 3. 确认.gitignore正确

```bash
# 检查.gitignore包含环境变量
cat .gitignore | grep -E "\.env"

# 应该看到:
# .env
# .env.local
# .env.*.local
```

---

## 🌐 多环境工作场景

### 场景1: 在本地Claude Code工作

```bash
# 1. 开始前先Pull
git pull --rebase origin master

# 2. 使用本地环境变量
cat frontend/.env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=00a2dcdb-30e4-4a0e-80cd-56de2eaf0577

# 3. 做修改...

# 4. 只添加代码文件
git add <specific-files>

# 5. Commit并Push
git commit -m "feat: your changes"
git push origin master
```

### 场景2: 在云端Claude Code工作

```bash
# 1. 云端同样先Pull
git pull --rebase origin master

# 2. 检查环境变量（可能需要重新创建.env.local）
ls frontend/.env.local

# 如果不存在，从.env.example复制
cp frontend/.env.example frontend/.env.local

# 编辑为正确的值
vim frontend/.env.local

# 3. 做修改...

# 4. ⚠️ 确保.env.local不被添加
git add <specific-files>  # 不包括.env.local

# 5. Commit并Push
git commit -m "feat: your changes"
git push origin master
```

### 场景3: 在Vercel部署后

Vercel的环境变量在Dashboard设置，**不需要**提交任何`.env`文件：

1. 进入Vercel Dashboard
2. 选择你的项目
3. Settings → Environment Variables
4. 添加：
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=<your-production-workspace-id>
   ```

### 场景4: 在Render部署后

Render的环境变量在Dashboard设置：

1. 进入Render Dashboard
2. 选择你的Backend service
3. Environment → Environment Variables
4. 添加API keys等

---

## 🔄 冲突解决流程

### 当Pull时出现冲突

```bash
# 1. 尝试Pull
git pull --rebase origin master

# 如果有冲突，会显示:
# Auto-merging frontend/src/app/brands/page.tsx
# CONFLICT (content): Merge conflict in frontend/src/app/brands/page.tsx

# 2. 查看冲突文件
git status

# 3. 打开冲突文件，找到这样的标记:
# <<<<<<< HEAD
# 你的修改
# =======
# 远程的修改
# >>>>>>> origin/master

# 4. 手动解决冲突（删除标记，保留正确代码）

# 5. 标记为已解决
git add frontend/src/app/brands/page.tsx

# 6. 继续rebase
git rebase --continue

# 7. Push
git push origin master
```

### 如果搞乱了，想重新开始

```bash
# ⚠️ 警告: 这会丢弃所有本地修改!

# 方案1: 放弃rebase，回到原始状态
git rebase --abort

# 方案2: 完全重置到远程版本
git fetch origin
git reset --hard origin/master

# 方案3: 创建备份分支后重置
git branch backup-$(date +%Y%m%d)
git reset --hard origin/master
```

---

## 📝 Commit Message规范

### 格式

```
<type>: <subject>

<body>

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Types

- `feat`: 新功能 (New feature)
- `fix`: Bug修复 (Bug fix)
- `docs`: 文档 (Documentation)
- `style`: 格式 (Formatting, no code change)
- `refactor`: 重构 (Refactoring)
- `test`: 测试 (Tests)
- `chore`: 构建/工具 (Build/tooling)

### 示例

```bash
# ✅ 好的commit message
git commit -m "feat: Add advanced filtering to brands page

- Integrate AdvancedFilters component
- Implement search, category, score range filters
- Add CSV export functionality
- Create empty state for no results

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# ❌ 不好的commit message
git commit -m "update"
git commit -m "fix bugs"
git commit -m "wip"
```

---

## 🛡️ 防止环境变量泄露

### .gitignore配置（已设置）

```gitignore
# Environment variables (NEVER commit)
.env
.env.local
.env.*.local
.env.production
.env.development

# Database
*.db
*.sqlite
*.sqlite3

# Dependencies
node_modules/
__pycache__/
*.pyc

# Build outputs
.next/
dist/
build/
```

### 检查是否泄露

```bash
# 检查历史记录中是否有.env文件
git log --all --full-history -- "*.env*"

# 如果有输出，说明历史中有.env文件
# 需要清理历史（慎用，会改变commit hash）
```

### 已经提交了.env怎么办？

```bash
# ⚠️ 如果还没Push，可以撤销
git reset HEAD~1

# ⚠️ 如果已经Push，需要:
# 1. 立即轮换所有API keys
# 2. 从历史中删除（使用git filter-branch或BFG）
# 3. Force push（团队协调）
```

---

## 🔄 Claude Code云端同步工作流

### 场景: 在两台电脑+云端工作

**电脑A (家里):**
```bash
# 1. 早上开始工作
git pull --rebase origin master

# 2. 做修改...

# 3. 下班前提交
git add <files>
git commit -m "feat: add feature X"
git push origin master
```

**电脑B (公司) / Claude Code云端:**
```bash
# 1. 到公司/打开云端，先Pull
git pull --rebase origin master

# 2. 继续工作...

# 3. 提交
git add <files>
git commit -m "feat: continue feature X"
git push origin master
```

**关键点:**
- ✅ 每次开始前都`git pull`
- ✅ 每次结束后都`git push`
- ✅ 每个环境有自己的`.env.local`（不提交）
- ✅ 频繁commit和push，避免大量修改冲突

---

## 📊 常见问题排查

### 问题1: Push被拒绝

```bash
# 错误信息:
# ! [rejected] master -> master (fetch first)

# 解决:
git pull --rebase origin master
git push origin master
```

### 问题2: 前端连接不到后端API

```bash
# 检查.env.local
cat frontend/.env.local

# 应该看到:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=00a2dcdb-...

# 如果不存在或错误，创建/修改它
# 然后重启前端服务器
```

### 问题3: 数据库Workspace ID不匹配

```bash
# 检查数据库中的workspace_id
cd backend
python -c "
import sqlite3
conn = sqlite3.connect('geo_dashboard.db')
cursor = conn.cursor()
cursor.execute('SELECT DISTINCT workspace_id FROM brands')
print('Workspace IDs:', cursor.fetchall())
conn.close()
"

# 确保.env.local使用相同的ID
```

### 问题4: 意外提交了.env文件

```bash
# 从暂存区移除（还没commit）
git reset HEAD .env.local

# 已经commit但还没push
git reset --soft HEAD~1

# 已经push（⚠️ 需要轮换API keys）
# 1. 立即在OpenAI/Gemini dashboard轮换API keys
# 2. 联系团队成员
# 3. 考虑使用git filter-branch清理历史
```

---

## ✅ 快速检查命令

每次commit前运行这些命令：

```bash
# 一键检查
cd geo-attribution-dashboard

# 检查1: 没有环境变量被添加
echo "=== Checking for .env files ==="
git status | grep -E "\.env" || echo "✅ No .env files staged"

# 检查2: 查看将要提交的文件
echo "=== Files to be committed ==="
git diff --cached --name-only

# 检查3: 确认远程同步
echo "=== Checking remote sync ==="
git fetch origin
git status | grep "Your branch is up to date" && echo "✅ In sync" || echo "⚠️ Need to pull"

# 检查4: .gitignore正确
echo "=== Checking .gitignore ==="
grep -E "\.env" .gitignore && echo "✅ .gitignore correct" || echo "❌ .gitignore missing .env"
```

---

## 🎯 总结：每次Commit必做的5件事

1. ✅ **Pull first**: `git pull --rebase origin master`
2. ✅ **Specific add**: `git add <specific-files>` (不用`-A`或`.`)
3. ✅ **Check env**: 确认没有`.env*`文件被添加
4. ✅ **Meaningful message**: 写清楚的commit message
5. ✅ **Push**: `git push origin master`

**记住**: 环境变量只在本地/Vercel Dashboard/Render Dashboard设置，**永远不提交到Git！**

---

**生成时间:** 2026-01-25
**适用环境:** 本地开发、Claude Code云端、Vercel、Render
