# 多电脑环境配置指南 (Multi-Computer Setup Guide)

## 🎯 目标 (Goal)

在多台电脑上同步开发，同时保持：
- ✅ 代码同步 (通过 GitHub)
- ✅ 本地环境变量同步 (安全方式)
- ✅ 云端环境变量独立 (Vercel/Render)
- ✅ API keys 安全 (不提交到 Git)

---

## ❌ 绝对不要做的事 (NEVER DO THIS)

### 不要把 .env 文件 push 到 GitHub

```bash
# ❌ 危险操作 - 会泄露 API keys
git add backend/.env
git add frontend/.env.local
git commit -m "add env files"
git push

# 后果:
# 1. 你的 OpenAI API key 公开了
# 2. 任何人都可以用你的 key
# 3. 可能产生数千美元账单
# 4. 需要立即轮换所有 API keys
```

**为什么 .env 不能提交？**
- 包含敏感的 API keys (OpenAI, Gemini)
- 包含数据库密码
- 包含 secret keys
- 一旦泄露，无法撤回 (Git 历史永久保存)

---

## ✅ 正确的多电脑同步方案 (Correct Solution)

### 方案架构

```
┌─────────────────┐     GitHub (代码)      ┌─────────────────┐
│   Computer A    │◄───────────────────────►│   Computer B    │
│   (本地开发)     │                         │   (本地开发)     │
└─────────────────┘                         └─────────────────┘
        │                                            │
        │ .env (本地文件)                            │ .env (本地文件)
        │ - 不在 Git 中                              │ - 不在 Git 中
        │ - 手动同步                                 │ - 手动同步
        │                                            │
        ▼                                            ▼
 API Keys 通过安全渠道传输                    API Keys 通过安全渠道传输
 (Signal/1Password/USB)                    (Signal/1Password/USB)

┌─────────────────────────────────────────────────────────┐
│                 云端部署 (独立配置)                       │
│                                                         │
│  Vercel (前端)              Render (后端)                │
│  - 在 Dashboard 配置       - 在 Dashboard 配置           │
│  - 不使用本地 .env         - 不使用本地 .env             │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 完整工作流程

### 第一次设置 (Computer A - 已配置好)

你的 Computer A 已经有正确的配置：

```bash
# Computer A 的文件结构
geo-attribution-dashboard/
├── backend/.env                    # ✅ 已配置 (gitignored)
│   └── OPENAI_MODEL=gpt-4o
│   └── OPENAI_API_KEY=sk-proj-...
│   └── GOOGLE_API_KEY=AIza...
├── frontend/.env.local             # ✅ 已配置 (gitignored)
│   └── NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=00a2dcdb-...
└── .gitignore                      # ✅ 包含 .env 和 .env.local
```

### 在 Computer B 上首次设置

#### 步骤 1: Clone 代码

```bash
# 1. Clone GitHub repo
git clone https://github.com/guixiang123124/geo-dashboard.git
cd geo-dashboard

# 2. 检查 .env 文件不存在 (正常现象)
ls backend/.env          # 应该不存在
ls frontend/.env.local   # 应该不存在
```

#### 步骤 2: 使用自动化脚本设置 (推荐)

**Windows:**
```bash
# 运行 setup 脚本
setup-env.bat

# 脚本会询问:
# - OpenAI API Key
# - Gemini API Key
# - Workspace ID
#
# 然后自动创建 backend/.env 和 frontend/.env.local
```

**Mac/Linux:**
```bash
# 给脚本执行权限
chmod +x setup-env.sh

# 运行脚本
./setup-env.sh
```

#### 步骤 3: 手动设置 (如果不用脚本)

```bash
# 方法 1: 从 Computer A 复制配置
# (通过安全渠道获取 Computer A 的 .env 内容)

# 创建 backend/.env
cd backend
cat > .env << 'EOF'
[粘贴 Computer A 的 backend/.env 内容]
EOF

# 创建 frontend/.env.local
cd ../frontend
cat > .env.local << 'EOF'
[粘贴 Computer A 的 frontend/.env.local 内容]
EOF
```

#### 步骤 4: 验证配置

```bash
# 检查文件已创建
ls -la backend/.env
ls -la frontend/.env.local

# 确认不在 Git 中
git status | grep -E "\.env"
# 应该没有输出 (说明 .gitignore 正常工作)

# 检查 workspace ID
grep "WORKSPACE_ID" frontend/.env.local
# 应该显示: NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=00a2dcdb-30e4-4a0e-80cd-56de2eaf0577

# 检查 OpenAI 模型
grep "OPENAI_MODEL" backend/.env
# 应该显示: OPENAI_MODEL=gpt-4o
```

#### 步骤 5: 安装依赖并启动

```bash
# 后端
cd backend
pip install -r requirements.txt
python -m uvicorn src.api.main:app --reload

# 前端 (新终端)
cd frontend
npm install
npm run dev
```

---

## 🔄 日常开发工作流程

### 在 Computer A 工作

```bash
# 1. 拉取最新代码
git pull --rebase origin master

# 2. 做修改...
# 编辑代码文件

# 3. 提交 (只提交代码，不提交 .env)
git add frontend/src/app/brands/page.tsx
git add backend/src/api/routes/brands.py
# 不要用: git add -A  ❌

# 4. 检查没有 .env 文件
git status | grep -E "\.env"
# 应该没有输出

# 5. Commit 并 push
git commit -m "feat: add new feature"
git push origin master
```

### 切换到 Computer B

```bash
# 1. 拉取最新代码
git pull --rebase origin master

# 2. .env 文件不会被覆盖 (因为不在 Git 中)
# backend/.env 仍然是你之前配置的
# frontend/.env.local 仍然是你之前配置的

# 3. 继续开发...
```

### 如果需要更新 .env 配置

**场景**: Computer A 更新了 API key 或 workspace ID

```bash
# Computer A: 通过安全渠道发送新的 .env 内容
# (Signal, 1Password, WhatsApp, USB drive)

# Computer B: 手动更新
cd backend
vim .env
# 更新相关配置

cd ../frontend
vim .env.local
# 更新相关配置
```

---

## 🔐 安全的 .env 传输方式

### ✅ 推荐方法

1. **加密消息应用**
   - Signal (端到端加密)
   - WhatsApp (端到端加密)
   - Telegram Secret Chat

2. **密码管理器**
   - 1Password (Secure Notes)
   - BitWarden (Secure Notes)
   - LastPass (Secure Notes)

3. **物理传输**
   - USB drive (加密)
   - 手动输入 (如果 key 不长)

### ❌ 不推荐方法

- ❌ Email (明文传输)
- ❌ Slack (公司可能记录)
- ❌ Discord (不够安全)
- ❌ GitHub Issues/Comments (公开)
- ❌ 微信/QQ (可能被监控)

---

## 🌐 云端部署配置 (独立管理)

### Vercel (前端)

**在 Vercel Dashboard 配置:**

1. 进入项目设置
2. Settings → Environment Variables
3. 添加变量:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=<production-workspace-id>
NEXT_PUBLIC_ENABLE_AUTH=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_EXPORT=true
```

**重要**:
- Vercel 从来不读取本地的 `.env.local`
- 只使用 Dashboard 中配置的变量
- 每次 push 到 GitHub 后自动部署

### Render (后端)

**在 Render Dashboard 配置:**

1. 进入 Web Service 设置
2. Environment → Environment Variables
3. 添加变量:

```env
DATABASE_URL=<render-provided-postgres-url>
OPENAI_API_KEY=sk-proj-...
GOOGLE_API_KEY=AIza...
OPENAI_MODEL=gpt-4o
GOOGLE_MODEL=gemini-pro
SECRET_KEY=<production-secret-key>
```

**重要**:
- Render 从来不读取本地的 `backend/.env`
- 只使用 Dashboard 中配置的变量
- 每次 push 到 GitHub 后自动部署

---

## 📊 配置对比表

| 环境 | 配置位置 | API URL | Workspace ID | 代码来源 |
|------|---------|---------|--------------|---------|
| **Computer A** | `backend/.env`<br>`frontend/.env.local` | `http://localhost:8000` | `00a2dcdb-...` | 本地文件 |
| **Computer B** | `backend/.env`<br>`frontend/.env.local` | `http://localhost:8000` | `00a2dcdb-...` | 本地文件 |
| **Vercel** | Vercel Dashboard | `https://*.onrender.com` | Production ID | GitHub main |
| **Render** | Render Dashboard | N/A | N/A | GitHub main |

---

## 🛡️ .gitignore 验证

确保 `.gitignore` 包含:

```gitignore
# Environment variables (NEVER commit)
.env
.env.local
.env*.local
.env.production
.env.development

# Database
*.db
*.sqlite
*.sqlite3

# Dependencies
node_modules/
__pycache__/

# Build outputs
.next/
dist/
```

### 验证命令

```bash
# 检查 .gitignore 是否包含 .env
cat .gitignore | grep -E "\.env"

# 应该看到:
# .env
# .env.local
# .env*.local
```

---

## 🚨 如果意外提交了 .env

### 还没 push (本地)

```bash
# 撤销最后一次 commit
git reset --soft HEAD~1

# 从暂存区移除 .env
git reset HEAD backend/.env
git reset HEAD frontend/.env.local

# 重新 commit (不包括 .env)
git add <other-files>
git commit -m "your message"
```

### 已经 push (远程)

```bash
# ⚠️ 紧急措施:

# 1. 立即轮换所有 API keys
# - 去 OpenAI Dashboard 删除旧 key，创建新 key
# - 去 Google Cloud Console 删除旧 key，创建新 key

# 2. 从 Git 历史中删除 .env (高级操作)
# 使用 BFG Repo-Cleaner 或 git filter-branch
# 详见: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

# 3. Force push (需要团队协调)
git push --force origin master
```

---

## ✅ 快速检查清单

### 每次 Commit 前

- [ ] 运行 `git pull --rebase origin master`
- [ ] 只添加代码文件 (`git add <specific-files>`)
- [ ] 检查没有 .env: `git status | grep -E "\.env"`
- [ ] 查看将提交的文件: `git diff --cached --name-only`
- [ ] Commit message 清晰
- [ ] Push: `git push origin master`

### 新电脑首次设置

- [ ] Clone GitHub repo
- [ ] 运行 `setup-env.bat` 或 `setup-env.sh`
- [ ] 或手动创建 `backend/.env` 和 `frontend/.env.local`
- [ ] 验证 workspace ID 正确
- [ ] 验证 OpenAI model 是 `gpt-4o`
- [ ] 确认 .env 不在 git status 中
- [ ] 安装依赖 (pip install, npm install)
- [ ] 启动服务器测试

---

## 🎯 总结

### 核心原则

1. **代码同步** → GitHub
2. **本地 .env 同步** → 安全渠道 (Signal/1Password/USB)
3. **云端 .env** → Vercel/Render Dashboard (独立配置)
4. **永远不提交 .env 到 Git**

### 工作流程

```
Computer A                    GitHub                    Computer B
   │                            │                          │
   ├──── git push (code) ──────►│                          │
   │                            │◄──── git pull ──────────┤
   │                            │                          │
   │                                                       │
   └──── .env (Signal/USB) ────────────────────────────────┤
         (安全渠道)                                         │
```

### 记住

- ✅ 每次开始工作前 `git pull`
- ✅ 只提交代码，不提交 .env
- ✅ 使用 `git add <specific-files>`
- ✅ .env 通过安全渠道同步
- ✅ 云端配置在 Dashboard 管理

---

**最后更新**: 2026-01-25
**适用环境**: 本地开发 (多台电脑)、Vercel、Render
