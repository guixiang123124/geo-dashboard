@echo off
REM Script to push GEO Attribution Dashboard to GitHub
REM 将GEO归因仪表板推送到GitHub的脚本

echo.
echo ========================================
echo   GEO Dashboard - GitHub Push Script
echo   GEO仪表板 - GitHub推送脚本
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "README.md" (
    echo ❌ Error: README.md not found. Are you in the project root directory?
    echo ❌ 错误：未找到README.md。你是否在项目根目录中？
    pause
    exit /b 1
)

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Git is not installed or not in PATH
    echo ❌ 错误：Git未安装或不在PATH中
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo 请从以下地址安装Git：https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Check if remote already exists
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo ℹ️  Remote 'origin' already exists:
    echo ℹ️  远程仓库'origin'已存在：
    git remote -v
    echo.
    set /p REPLACE="Do you want to replace it? (y/n) 是否替换？(y/n): "
    if /i not "%REPLACE%"=="y" (
        echo.
        echo Keeping existing remote. Pushing to existing origin...
        echo 保持现有远程仓库。推送到现有origin...
        goto PUSH
    )
    git remote remove origin
    echo Remote 'origin' removed.
    echo 远程仓库'origin'已移除。
)

REM Prompt for GitHub username
echo.
set /p GITHUB_USER="Enter your GitHub username 输入你的GitHub用户名: "

if "%GITHUB_USER%"=="" (
    echo ❌ Error: GitHub username cannot be empty
    echo ❌ 错误：GitHub用户名不能为空
    pause
    exit /b 1
)

REM Add remote
echo.
echo 📦 Adding GitHub remote...
echo 📦 添加GitHub远程仓库...
git remote add origin https://github.com/%GITHUB_USER%/geo-attribution-dashboard.git

if %errorlevel% neq 0 (
    echo ❌ Error: Failed to add remote
    echo ❌ 错误：添加远程仓库失败
    pause
    exit /b 1
)

REM Verify remote
echo.
echo ✅ Remote repository added:
echo ✅ 远程仓库已添加：
git remote -v
echo.

:PUSH
REM Check current branch
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%i

echo Current branch: %CURRENT_BRANCH%
echo 当前分支：%CURRENT_BRANCH%
echo.

REM Ask for confirmation
set /p CONFIRM="Ready to push to GitHub? (y/n) 准备推送到GitHub？(y/n): "
if /i not "%CONFIRM%"=="y" (
    echo.
    echo Push cancelled. 推送已取消。
    pause
    exit /b 0
)

REM Push to GitHub
echo.
echo 🚀 Pushing to GitHub...
echo 🚀 推送到GitHub...
git push -u origin %CURRENT_BRANCH%

if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Push failed. Common issues:
    echo ⚠️  推送失败。常见问题：
    echo.
    echo 1. Repository doesn't exist on GitHub
    echo    仓库在GitHub上不存在
    echo    → Create it at: https://github.com/new
    echo    → 在此创建：https://github.com/new
    echo.
    echo 2. Authentication failed
    echo    身份验证失败
    echo    → Use Personal Access Token (PAT) as password
    echo    → 使用个人访问令牌(PAT)作为密码
    echo    → Get it from: https://github.com/settings/tokens
    echo    → 从此获取：https://github.com/settings/tokens
    echo.
    echo 3. Branch name mismatch
    echo    分支名称不匹配
    echo    → Try: git branch -M main ^&^& git push -u origin main
    echo    → 尝试：git branch -M main ^&^& git push -u origin main
    echo.
    pause
    exit /b 1
)

REM Success
echo.
echo ========================================
echo   ✅ Success! Push completed!
echo   ✅ 成功！推送完成！
echo ========================================
echo.
echo 📊 Your repository is now available at:
echo 📊 你的仓库现在可以在以下地址访问：
echo    https://github.com/%GITHUB_USER%/geo-attribution-dashboard
echo.
echo 🌐 Next steps:
echo 🌐 后续步骤：
echo    1. Visit your repository on GitHub
echo       访问GitHub上的仓库
echo    2. Verify all files are uploaded
echo       验证所有文件已上传
echo    3. Add repository description and topics
echo       添加仓库描述和主题
echo.
echo 🔄 To sync on another computer with Claude Code:
echo 🔄 在另一台电脑上使用Claude Code同步：
echo    1. Open Claude for Desktop
echo       打开Claude桌面应用
echo    2. Clone: https://github.com/%GITHUB_USER%/geo-attribution-dashboard
echo       克隆：https://github.com/%GITHUB_USER%/geo-attribution-dashboard
echo.
pause
