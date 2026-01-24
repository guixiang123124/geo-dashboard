# 下一步操作指南

## 🎯 当前状态

✅ **项目已完全准备好！**

- ✅ 所有代码已提交到本地Git仓库
- ✅ 中英文README文档已创建
- ✅ 系统参考指南（SYSTEM_READY.md）已创建
- ✅ GitHub推送脚本已准备好
- ✅ 服务器启动脚本已准备好

## 📤 推送到GitHub

### 方法1：使用自动化脚本（推荐）

**Windows用户：**
```batch
cd geo-attribution-dashboard
push-to-github.bat
```

**Mac/Linux用户：**
```bash
cd geo-attribution-dashboard
./push-to-github.sh
```

脚本会：
1. 提示你输入GitHub用户名
2. 自动配置远程仓库
3. 推送所有代码到GitHub
4. 提供下一步指导

### 方法2：手动推送

1. **在GitHub上创建新仓库**
   - 访问：https://github.com/new
   - 仓库名：`geo-attribution-dashboard`
   - 选择公开或私有
   - **不要**勾选任何初始化选项（README、.gitignore等）
   - 点击"创建仓库"

2. **添加远程仓库并推送**
   ```bash
   cd geo-attribution-dashboard

   # 替换YOUR_USERNAME为你的GitHub用户名
   git remote add origin https://github.com/YOUR_USERNAME/geo-attribution-dashboard.git

   # 推送代码
   git push -u origin master
   # 或者如果你的默认分支是main：
   # git branch -M main
   # git push -u origin main
   ```

3. **输入GitHub凭据**
   - 用户名：你的GitHub用户名
   - 密码：**使用个人访问令牌（PAT）**
   - 获取PAT：https://github.com/settings/tokens
   - 选择"Generate new token (classic)"
   - 勾选`repo`权限
   - 复制生成的令牌作为密码使用

## 🔄 在另一台电脑上使用Claude Code同步

### 重要概念
Claude Code通过Git/GitHub进行项目同步，而不是单独的云存储。只要你的项目推送到GitHub，就可以在任何电脑上访问。

### 同步步骤

1. **在当前电脑上确认推送成功**
   ```bash
   cd geo-attribution-dashboard
   git log origin/master
   # 应该看到你的最新提交
   ```

2. **在另一台电脑上**

   **选项A：使用Claude for Desktop**
   - 打开Claude桌面应用
   - 点击"Open Folder"或"Clone Repository"
   - 输入仓库URL：`https://github.com/YOUR_USERNAME/geo-attribution-dashboard`
   - Claude Code会自动克隆项目

   **选项B：手动克隆**
   ```bash
   git clone https://github.com/YOUR_USERNAME/geo-attribution-dashboard.git
   cd geo-attribution-dashboard
   ```

3. **设置环境**

   **后端：**
   ```bash
   cd backend

   # 创建虚拟环境
   python -m venv venv
   source venv/bin/activate  # Mac/Linux
   # venv\Scripts\activate   # Windows

   # 安装依赖
   pip install -r requirements.txt

   # 复制并配置环境变量
   cp ../.env.example .env
   # 编辑.env文件，添加你的API密钥

   # 初始化数据库
   alembic upgrade head
   python scripts/seed_database.py
   ```

   **前端：**
   ```bash
   cd frontend
   npm install
   ```

4. **启动服务器**
   ```bash
   # 返回项目根目录
   cd ..

   # Windows
   start-servers.bat

   # Mac/Linux
   ./start-servers.sh
   ```

## 📊 验证系统

### 检查服务器状态
```bash
# 检查后端
curl http://localhost:8000/health

# 检查前端（在浏览器中打开）
# http://localhost:3000
```

### 访问仪表板
- 主页：http://localhost:3000
- 分析：http://localhost:3000/analytics
- 品牌：http://localhost:3000/brands
- 评估：http://localhost:3000/evaluations
- API文档：http://localhost:8000/docs

## 🔐 重要安全提示

### ⚠️ 保护你的API密钥

1. **从不提交.env文件到Git**
   - ✅ `.env`已经在`.gitignore`中
   - ✅ 只提交`.env.example`模板

2. **在新电脑上设置**
   - 复制`.env.example`到`backend/.env`
   - 填入你的真实API密钥
   - **不要**复制旧的`.env`文件到GitHub

3. **如果意外泄露密钥**
   - 立即在提供商网站上撤销旧密钥
   - 生成新密钥
   - 更新本地`.env`文件

## 📝 GitHub仓库优化

推送成功后，建议在GitHub上进行以下设置：

1. **添加仓库描述**
   - 在仓库页面点击⚙️设置
   - 描述：`GEO Attribution Dashboard - Track brand performance across AI platforms (ChatGPT, Gemini, Claude, Perplexity)`

2. **添加主题标签**
   - 点击⚙️设置旁的"Add topics"
   - 添加：`geo`, `ai`, `dashboard`, `fastapi`, `nextjs`, `typescript`, `openai`, `gemini`, `react`, `tailwindcss`

3. **设置About部分**
   - Website：部署后的前端URL（如果有）
   - Topics：如上所述

4. **启用Issues**（如果需要）
   - Settings → Features → Issues

## 🚀 可选：部署到生产环境

如果你想将项目部署到公网：

1. **查看部署指南**
   ```bash
   cat DEPLOYMENT.md
   ```

2. **推荐的部署平台**
   - 后端：[Railway](https://railway.app) 或 [Render](https://render.com)
   - 前端：[Vercel](https://vercel.com)
   - 数据库：Railway/Render自带PostgreSQL

3. **部署步骤**
   - 详见`DEPLOYMENT.md`文件

## 📚 有用的文档

- `README.md` - 英文项目说明
- `README_CN.md` - 中文项目说明
- `SYSTEM_READY.md` - 完整系统参考
- `DEPLOYMENT.md` - 部署指南
- `GITHUB_SETUP.md` - GitHub设置详细指南
- `docs/METRICS.md` - GEO方法论
- `docs/PLAYBOOK.md` - 优化策略
- `docs/DASHBOARD_GUIDE.md` - 用户操作指南

## 🆘 常见问题

### 1. 推送时提示认证失败
**解决方案：** 使用个人访问令牌（PAT）而不是密码
- 获取：https://github.com/settings/tokens
- 权限：勾选`repo`
- 使用令牌作为密码

### 2. 提示"仓库不存在"
**解决方案：** 确保已在GitHub上创建仓库
- 访问：https://github.com/new
- 创建名为`geo-attribution-dashboard`的仓库

### 3. 分支名称不匹配
**解决方案：** 检查你的默认分支名称
```bash
# 查看当前分支
git branch

# 如果是master但GitHub期望main：
git branch -M main
git push -u origin main
```

### 4. Claude Code找不到项目
**解决方案：** 确保已推送到GitHub
```bash
# 验证推送成功
git log origin/master
git remote -v
```

## ✅ 完成检查清单

推送到GitHub后，检查以下项目：

- [ ] 在GitHub上能看到所有文件
- [ ] README.md正确显示（包括徽章和格式）
- [ ] README_CN.md正确显示中文
- [ ] .env文件**没有**被推送（检查仓库中是否存在）
- [ ] .gitignore正常工作
- [ ] 可以从另一台电脑克隆项目
- [ ] 克隆后可以正常运行（安装依赖后）

## 🎉 成功！

如果以上步骤都完成了，恭喜！你的GEO Attribution Dashboard现在：

✅ 存储在GitHub上
✅ 可以从任何电脑访问
✅ 可以与团队成员共享
✅ 版本控制完整
✅ 准备好部署到生产环境

---

**需要帮助？**
- 查看`GITHUB_SETUP.md`获取详细说明
- 查看`SYSTEM_READY.md`了解系统功能
- 在GitHub仓库上开启Issue

**祝使用愉快！** 🚀
