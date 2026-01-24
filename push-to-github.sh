#!/bin/bash
# Script to push GEO Attribution Dashboard to GitHub
# 将GEO归因仪表板推送到GitHub的脚本

set -e  # Exit on error

echo ""
echo "========================================"
echo "  GEO Dashboard - GitHub Push Script"
echo "  GEO仪表板 - GitHub推送脚本"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: README.md not found. Are you in the project root directory?"
    echo "❌ 错误：未找到README.md。你是否在项目根目录中？"
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Error: Git is not installed"
    echo "❌ 错误：Git未安装"
    echo ""
    echo "Please install Git:"
    echo "  macOS: brew install git"
    echo "  Linux: sudo apt-get install git"
    echo ""
    echo "请安装Git："
    echo "  macOS: brew install git"
    echo "  Linux: sudo apt-get install git"
    exit 1
fi

# Check if remote already exists
if git remote get-url origin &> /dev/null; then
    echo ""
    echo "ℹ️  Remote 'origin' already exists:"
    echo "ℹ️  远程仓库'origin'已存在："
    git remote -v
    echo ""
    read -p "Do you want to replace it? (y/n) 是否替换？(y/n): " REPLACE
    if [ "$REPLACE" != "y" ] && [ "$REPLACE" != "Y" ]; then
        echo ""
        echo "Keeping existing remote. Pushing to existing origin..."
        echo "保持现有远程仓库。推送到现有origin..."
        SKIP_ADD_REMOTE=true
    else
        git remote remove origin
        echo "Remote 'origin' removed."
        echo "远程仓库'origin'已移除。"
        SKIP_ADD_REMOTE=false
    fi
else
    SKIP_ADD_REMOTE=false
fi

# Prompt for GitHub username if we need to add remote
if [ "$SKIP_ADD_REMOTE" = false ]; then
    echo ""
    read -p "Enter your GitHub username 输入你的GitHub用户名: " GITHUB_USER

    if [ -z "$GITHUB_USER" ]; then
        echo "❌ Error: GitHub username cannot be empty"
        echo "❌ 错误：GitHub用户名不能为空"
        exit 1
    fi

    # Add remote
    echo ""
    echo "📦 Adding GitHub remote..."
    echo "📦 添加GitHub远程仓库..."
    git remote add origin "https://github.com/${GITHUB_USER}/geo-attribution-dashboard.git"

    # Verify remote
    echo ""
    echo "✅ Remote repository added:"
    echo "✅ 远程仓库已添加："
    git remote -v
    echo ""
else
    # Extract username from existing remote
    REMOTE_URL=$(git remote get-url origin)
    GITHUB_USER=$(echo "$REMOTE_URL" | sed -n 's/.*github.com[:/]\([^/]*\)\/.*/\1/p')
fi

# Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Current branch: $CURRENT_BRANCH"
echo "当前分支：$CURRENT_BRANCH"
echo ""

# Ask for confirmation
read -p "Ready to push to GitHub? (y/n) 准备推送到GitHub？(y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo ""
    echo "Push cancelled. 推送已取消。"
    exit 0
fi

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
echo "🚀 推送到GitHub..."

if git push -u origin "$CURRENT_BRANCH"; then
    # Success
    echo ""
    echo "========================================"
    echo "  ✅ Success! Push completed!"
    echo "  ✅ 成功！推送完成！"
    echo "========================================"
    echo ""
    echo "📊 Your repository is now available at:"
    echo "📊 你的仓库现在可以在以下地址访问："
    echo "   https://github.com/${GITHUB_USER}/geo-attribution-dashboard"
    echo ""
    echo "🌐 Next steps:"
    echo "🌐 后续步骤："
    echo "   1. Visit your repository on GitHub"
    echo "      访问GitHub上的仓库"
    echo "   2. Verify all files are uploaded"
    echo "      验证所有文件已上传"
    echo "   3. Add repository description and topics"
    echo "      添加仓库描述和主题"
    echo ""
    echo "🔄 To sync on another computer with Claude Code:"
    echo "🔄 在另一台电脑上使用Claude Code同步："
    echo "   1. Open Claude for Desktop"
    echo "      打开Claude桌面应用"
    echo "   2. Clone: https://github.com/${GITHUB_USER}/geo-attribution-dashboard"
    echo "      克隆：https://github.com/${GITHUB_USER}/geo-attribution-dashboard"
    echo ""
else
    # Error
    echo ""
    echo "⚠️  Push failed. Common issues:"
    echo "⚠️  推送失败。常见问题："
    echo ""
    echo "1. Repository doesn't exist on GitHub"
    echo "   仓库在GitHub上不存在"
    echo "   → Create it at: https://github.com/new"
    echo "   → 在此创建：https://github.com/new"
    echo ""
    echo "2. Authentication failed"
    echo "   身份验证失败"
    echo "   → Use Personal Access Token (PAT) as password"
    echo "   → 使用个人访问令牌(PAT)作为密码"
    echo "   → Get it from: https://github.com/settings/tokens"
    echo "   → 从此获取：https://github.com/settings/tokens"
    echo ""
    echo "3. Branch name mismatch"
    echo "   分支名称不匹配"
    echo "   → Try: git branch -M main && git push -u origin main"
    echo "   → 尝试：git branch -M main && git push -u origin main"
    echo ""
    exit 1
fi
