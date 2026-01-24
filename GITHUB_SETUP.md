# GitHub Setup Guide | GitHub设置指南

## English Instructions

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `geo-attribution-dashboard`
3. Description: `GEO Attribution Dashboard - Track brand performance across AI platforms`
4. Visibility: Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Step 2: Add Remote and Push

After creating the repository, run these commands in your terminal:

```bash
cd geo-attribution-dashboard

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/geo-attribution-dashboard.git

# Verify remote
git remote -v

# Push to GitHub
git push -u origin master

# Or if your default branch is 'main':
# git branch -M main
# git push -u origin main
```

### Step 3: Verify Upload

1. Go to your GitHub repository page
2. Verify all files are uploaded
3. Check that README.md displays correctly

---

## 中文说明

### 步骤1：创建GitHub仓库

1. 访问 https://github.com/new
2. 仓库名称：`geo-attribution-dashboard`
3. 描述：`GEO归因仪表板 - 追踪品牌在AI平台的表现`
4. 可见性：选择公开（Public）或私有（Private）
5. **不要**勾选初始化README、.gitignore或license（我们已经有了）
6. 点击"Create repository"（创建仓库）

### 步骤2：添加远程仓库并推送

创建仓库后，在终端中运行以下命令：

```bash
cd geo-attribution-dashboard

# 添加GitHub远程仓库（替换YOUR_USERNAME为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/geo-attribution-dashboard.git

# 验证远程仓库
git remote -v

# 推送到GitHub
git push -u origin master

# 如果你的默认分支是'main'：
# git branch -M main
# git push -u origin main
```

### 步骤3：验证上传

1. 访问你的GitHub仓库页面
2. 验证所有文件已上传
3. 检查README.md是否正确显示

---

## Automated Script | 自动化脚本

### For Unix/Mac/Linux

Save this as `push-to-github.sh`:

```bash
#!/bin/bash

echo "📦 Preparing to push to GitHub..."
echo ""

# Prompt for GitHub username
read -p "Enter your GitHub username: " GITHUB_USER

# Add remote
git remote add origin https://github.com/${GITHUB_USER}/geo-attribution-dashboard.git

# Verify
echo ""
echo "Remote repository added:"
git remote -v

# Push
echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin master

echo ""
echo "✅ Done! Check your repository at:"
echo "   https://github.com/${GITHUB_USER}/geo-attribution-dashboard"
```

Make it executable:
```bash
chmod +x push-to-github.sh
./push-to-github.sh
```

### For Windows

Save this as `push-to-github.bat`:

```batch
@echo off
echo 📦 Preparing to push to GitHub...
echo.

set /p GITHUB_USER="Enter your GitHub username: "

git remote add origin https://github.com/%GITHUB_USER%/geo-attribution-dashboard.git

echo.
echo Remote repository added:
git remote -v

echo.
echo 🚀 Pushing to GitHub...
git push -u origin master

echo.
echo ✅ Done! Check your repository at:
echo    https://github.com/%GITHUB_USER%/geo-attribution-dashboard
pause
```

Run it:
```batch
push-to-github.bat
```

---

## Troubleshooting | 故障排除

### Issue: "remote origin already exists"
**Solution:**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/geo-attribution-dashboard.git
```

### Issue: Authentication failed
**Solution:**
- Use a Personal Access Token (PAT) instead of password
- Go to: https://github.com/settings/tokens
- Generate new token with `repo` scope
- Use token as password when pushing

### Issue: "src refspec master does not match any"
**Solution:**
```bash
# Your default branch might be 'main' instead of 'master'
git branch -M main
git push -u origin main
```

---

## Next Steps | 后续步骤

After pushing to GitHub:

1. ✅ **Add GitHub Repository Description**
   - Go to repository settings
   - Add topics: `geo`, `ai`, `dashboard`, `fastapi`, `nextjs`, `openai`, `gemini`

2. ✅ **Enable GitHub Pages** (optional)
   - For hosting documentation

3. ✅ **Set up GitHub Actions** (optional)
   - For CI/CD automation

4. ✅ **Add Collaborators** (if team project)
   - Settings → Manage access → Invite collaborators

---

## Claude Code Cloud Sync | Claude Code云端同步

To ensure your project is accessible from another computer via Claude Code:

1. **Verify GitHub Push**
   - Ensure all commits are pushed to GitHub
   - Check: `git log origin/master`

2. **On Another Computer**
   - Open Claude for Desktop
   - Click "Open Folder" or "Clone Repository"
   - Enter: `https://github.com/YOUR_USERNAME/geo-attribution-dashboard`
   - Claude Code will automatically sync from GitHub

3. **Verify Sync**
   - Check that all files are present
   - Run: `git status`
   - Should show: "Your branch is up to date with 'origin/master'"

---

**Note:** Claude Code uses Git/GitHub for synchronization, not a separate cloud storage. As long as your project is on GitHub, you can access it from any computer with Claude Code.

**注意：** Claude Code使用Git/GitHub进行同步，而不是单独的云存储。只要你的项目在GitHub上，你就可以在任何安装了Claude Code的电脑上访问它。
